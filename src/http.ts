/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { log } from "./log.ts";
import { CACHE_MAX_SIZE, globalCache } from "./cache.ts";
import { json } from "./json.ts";
import { etag } from "./hash.ts";
import { is } from "./type.ts";

import {
  type ConnInfo,
  getContentType,
  path,
  renderToString,
  serve as std_serve,
  type ServeInit,
  Status,
  STATUS_TEXT as STATUS_TEXT_ENUM,
  type VNode,
} from "../deps.ts";

export const STATUS_TEXT = new Map<string, any>(
  Object.entries(STATUS_TEXT_ENUM),
);

export declare type PathParams = Record<string, string> | undefined;

/** Note: we should aim to keep it the same as std handler. */
export declare type Handler = (
  request: Request,
  connInfo: ConnInfo,
  params: PathParams,
) => Promise<Response> | Response;

export declare interface Routes {
  [path: string]: Handler;
}

export type { ConnInfo, ServeInit };

export { getContentType, Status };

let routes: Routes = { 404: defaultNotFoundPage };

/**
 * Given an extension, lookup the appropriate media type for that extension.
 * Likely you should be using `contentType()` instead.
 */
export function lookupMediaType(pathname: string): string | undefined {
  const extension = path.extname(`x.${pathname}`).toLowerCase().slice(1);

  // @ts-ignore workaround around denoland/dnt#148
  return types.get(extension);
}

/**
 * serve() registers "fetch" event listener and invokes the provided route
 * handler for the route with the request as first argument and processed path
 * params as the second.
 *
 * @example ```ts
 * serve({
 *  "/": (request: Request) => new Response("Hello World!"),
 *  404: (request: Request) => new Response("not found")
 * })
 * ```
 *
 * The route handler declared for `404` will be used to serve all
 * requests that do not have a route handler declared.
 */
export function serve(
  userRoutes: Routes,
  options: ServeInit = { port: 8000 },
): void {
  routes = { ...routes, ...userRoutes };

  std_serve((req, connInfo) => handleRequest(req, connInfo, routes), options);
  const isDeploy = Deno.env.get("DENO_REGION");
  if (!isDeploy) {
    log.debug(
      `Listening at http://${options.hostname ?? "localhost"}:${options.port}/`,
    );
  }
}

/**
 * @param request
 * @param connInfo
 * @param routes
 * @returns
 */
export async function handleRequest(
  request: Request,
  connInfo: ConnInfo,
  routes: Routes,
): Promise<Response> {
  const { search, pathname } = new URL(request.url);

  try {
    const startTime = Date.now();
    let response = await globalCache.match(request);

    if (is.undefined(response)) {
      for (const route of Object.keys(routes)) {
        // @ts-ignore URLPattern is still not available in dom lib.
        const pattern = new URLPattern({ pathname: route });

        if (pattern.test({ pathname })) {
          const params = pattern.exec({ pathname })?.pathname.groups;
          try {
            response = await routes[route](request, connInfo, params);
          } catch (error) {
            if (error.name == "NotFound") {
              break;
            }

            log.error("Error serving request:", error);
            response = json({ error: error.message }, { status: 500 });
          }
          if (!(response instanceof Response)) {
            response = jsx(response);
          }
          break;
        }
      }
    } else {
      response.headers.set("x-function-cache-hit", "true");
    }

    // return not found page if no handler is found.
    if (is.undefined(response)) {
      response = await routes["404"](request, connInfo, {});
    }

    // method path+params timeTaken status
    log.debug(
      `${request.method} ${pathname + search} ${
        response.headers.has("x-function-cache-hit")
          ? String.fromCodePoint(0x26a1)
          : ""
      }${Date.now() - startTime}ms ${response.status}`,
    );

    return response;
  } catch (error) {
    log.error("Problem serving request:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

export function defaultNotFoundPage() {
  return new Response("<h1 align=center>page not found</h1>", {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export interface ServeStaticOptions {
  /**
   * The base to be used for the construction of absolute URL.
   */
  baseUrl: string;
  /**
   * A function to modify the response before it's served to the request.
   * For example, set appropriate content-type header.
   * @default undefined
   */
  intervene?: (
    request: Request,
    response: Response,
  ) => Promise<Response> | Response;
  /**
   * Disable caching of the responses.
   * @default true
   */
  cache?: boolean;
}

/**
 * Serve static files hosted on the internet or relative to your source code.
 *
 * Be default, up to 20 static assets that are less than 10MB are cached. You
 * can disable caching by setting `cache: false` in the options object.
 *
 * @example ```ts
 * import { serve, serveStatic } from "https://deno.land/x/911@0.1.2/mod.ts"
 *
 * serve({
 *   // It is required that the path ends with `:filename+`
 *   "/:filename+": serveStatic("public", { baseUrl: import.meta.url }),
 * })
 * ```
 */
export function serveStatic(
  relativePath: string,
  { baseUrl, intervene, cache = true }: ServeStaticOptions,
): Handler {
  return async (
    request: Request,
    connInfo: ConnInfo,
    params: PathParams,
  ): Promise<Response> => {
    // Construct URL for the request resource.
    const filename = params?.filename;
    let filePath = relativePath;
    if (filename) {
      filePath = relativePath.endsWith("/")
        ? relativePath + filename
        : relativePath + "/" + filename;
    }
    const fileUrl = new URL(filePath, baseUrl);

    let response: Response | undefined;
    if (cache) {
      response = await globalCache.match(request);
    }

    if (is.undefined(response)) {
      const body = await Deno.readFile(fileUrl);
      response = new Response(body);
      const contentType = getContentType(String(lookupMediaType(filePath)));
      if (contentType) {
        response.headers.set("content-type", contentType);
      }
      if (is.function_(intervene)) {
        response = await intervene(request, response);
      }

      if (cache) {
        // We don't want to cache if the resource size if greater than 10MB.
        // The size is arbitrary choice.
        if (+(response.headers.get("content-length")) < CACHE_MAX_SIZE) {
          await globalCache.put(request, response);
        }
      }
    }

    if (response.status == 404) {
      return routes[404](request, connInfo, {});
    }
    return response;
  };
}

/** Converts an object literal to a JSON string and returns
 * a Response with `application/json` as the `content-type`.
 *
 * @example
 * ```js
 * import { serve, json } from "https://deno.land/x/911@0.1.2/mod.ts"
 *
 * serve({
 *  "/": () => json({ message: "hello world"}),
 * })
 * ```
 */

/**
 * Renders JSX components to HTML and returns a Response with `text/html`
 * as the `content-type.`
 *
 * @example
 * ```jsx
 * import { serve, jsx, h } from "https://deno.land/x/911@0.1.2/mod.ts"
 *
 * const Greet = ({name}) => <div>Hello, {name}</div>;
 *
 * serve({
 *  "/": () => jsx(<html><Greet name="Sift" /></html),
 * })
 * ```
 *
 * Make sure your file extension is either `.tsx` or `.jsx` and you've `h` imported
 * when using this function. */
export function jsx(jsx: VNode, init?: ResponseInit): Response {
  const headers = init?.headers instanceof Headers
    ? init.headers
    : new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    333333333;
    headers.set("Content-Type", "text/html; charset=utf-8");
  }

  return new Response(renderToString(jsx as any), {
    statusText: init?.statusText ??
      STATUS_TEXT.get((init?.status ?? Status.OK) as any),
    status: init?.status ?? Status.OK,
    headers,
  });
}

// This is very naive and accepts only the field names to validate if
// the specified field exists at the specified place.
// FIXME(@satyarohith): do better.
export interface RequestTerms {
  [key: string]: {
    headers?: string[];
    body?: string[];
    params?: string[];
  };
}

/**
 * Validate whether the incoming request meets the provided terms.
 */
export async function validateRequest(
  request: Request,
  terms: RequestTerms,
): Promise<{
  error?: { message: string; status: number };
  body?: { [key: string]: unknown };
}> {
  let body = {};

  // Validate the method.
  if (!terms[request.method]) {
    return {
      error: {
        message: `Method ${request.method} is not allowed for the URL`,
        status: Status.MethodNotAllowed,
      },
    };
  }

  // Validate the params if defined in the terms.
  if (
    terms[request.method]?.params &&
    terms[request.method].params!.length > 0
  ) {
    const { searchParams } = new URL(request.url);
    const requestParams = [];
    for (const param of searchParams.keys()) {
      requestParams.push(param);
    }

    for (const param of terms[request.method].params!) {
      if (!requestParams.includes(param)) {
        return {
          error: {
            message: `param '${param}' is required to process the request`,
            status: Status.BadRequest,
          },
        };
      }
    }
  }

  // Validate the headers if defined in the terms.
  if (
    terms[request.method].headers &&
    terms[request.method].headers!.length > 0
  ) {
    // Collect the headers into an array.
    const requestHeaderKeys = [];
    for (const header of request.headers.keys()) {
      requestHeaderKeys.push(header);
    }

    // Loop through the headers defined in the terms and check if they
    // are present in the request.
    for (const header of terms[request.method].headers!) {
      if (!requestHeaderKeys.includes(header.toLowerCase())) {
        return {
          error: {
            message: `header '${header}' not available`,
            status: Status.BadRequest,
          },
        };
      }
    }
  }

  // Validate the body of the request if defined in the terms.
  if (terms[request.method].body && terms[request.method].body!.length > 0) {
    const requestBody = await request.json();
    const bodyKeys = Object.keys(requestBody);
    for (const key of terms[request.method].body!) {
      if (!bodyKeys.includes(key)) {
        return {
          error: {
            message: `field '${key}' is not available in the body`,
            status: Status.BadRequest,
          },
        };
      }
    }

    // We store and return the body as once the request.json() is called
    // the user cannot call request.json() again.
    body = requestBody;
  }

  return { body };
}

export declare type ResponseProps = Record<string, any>;

export async function toResponse(
  data: string | ArrayBuffer,
  {
    contentType = "text/html; charset=utf-8",
    status = 200,
    headers = {},
    ...init
  }: ResponseInit & ResponseProps = {},
): Promise<Response> {
  const _headers = new Headers(headers ?? {});
  if (_headers.get("Content-Type").includes("json")) {
    return json(data, { status, ...init });
  }
  return new Response(data, {
    status,
    headers: {
      "access-control-allow-origin": "*",
      "content-type": contentType,
      "content-length":
        `${(data instanceof ArrayBuffer ? data.byteLength : data.length)}`,
      "etag": await etag(data),
      ...headers,
    },
    ...(init ?? {}),
  });
}

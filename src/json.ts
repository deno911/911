import { Status, STATUS_TEXT } from "./http.ts";

export declare type JSONReplacerFn = (
  this: any,
  key: string,
  value: any,
) => any;

export declare type JSONValue<T extends any = string | number | boolean> =
  T extends T | T[] | Record<string, (T | T[] | Record<string, T>)> ? T : never;

export declare type JSONInitAlt = {
  replacer?: Maybe<OmitThisParameter<JSONReplacerFn>>;
  space?: string | number;
} & ResponseInit;

export declare type JSONInit = {
  replacer: (string | number)[];
  space: string | number;
} & ResponseInit;

/**
 * Create a new response in JSON format, with built-in error handling and
 * sensible defaults for the response headers. Accepts an optional second
 * parameter to configure the response output. It is typed as a union of
 * [`ResponseInit`](https://developer.mozilla.org/en-US/docs/Web/API/Response#properties) and [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters) params 2 & 3.
 *
 * @param data the response body to be stringified and sent
 * @param init optional configurations for `Response` and `JSON`
 * @returns
 */
export function json<T extends any>(data: T, {
  replacer,
  space,
  ...init
}?: Partial<JSONInit>): Response;

export function json<T extends any>(data: T, {
  replacer,
  space,
  ...init
}?: Partial<JSONInitAlt>): Response;

export function json<T extends any>(data: T, {
  replacer,
  space = 2,
  ...init
}: any = {}): Response {
  let body: string;
  try {
    body = JSON.stringify(data, replacer ?? undefined, space);
  } catch (e) {
    return json({
      error: ((e.message ?? e.toString?.()) || "Unknown error"),
    }, { status: 500, space, ...init });
  }

  const headers: HeadersInit = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": `${(body?.length ?? 0)}`,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    ...(Object.fromEntries(new Headers(init?.headers).entries()) ?? {}),
  });

  const {
    statusText = STATUS_TEXT.get(`${init?.status ?? Status.OK}`),
  } = init?.statusText;

  return new Response(body, {
    ...init,
    statusText,
    status: init?.status ?? Status.OK,
    headers,
  });
}

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="dom" />
/// <reference types="../types.d.ts" />
/// <reference types="./type.ts" />

// deno-lint-ignore-file no-explicit-any

import { Status, STATUS_TEXT } from "./http.ts";
import { log } from "./log.ts";

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
 * @example ```ts
 * import { json } from "https://deno.land/x/911@0.1.4/mod.ts";
 * import { STATUS_TEXT } from "https://deno.land/std/http/http_status.ts";
 *
 * const response = json({
 *  message: "Hello World",
 * });
 *
 * // Equivalent to:
 * // new Response("{\"message\":\"Hello World\"}", {
 * //   status: 200,
 * //   headers: {
 * //     "content-type": "application/json; charset=utf-8",
 * //     "content-length": "17",
 * //     "etag": "W/5c8qKJoE6P9Q",
 * //     "access-control-allow-origin": "*",
 * //   },
 * // });
 */
export function json<T extends any>(data: T, {
  replacer,
  space,
  ...init
}: Partial<JSONInit>): Response;

export function json<T extends any>(data: T, {
  replacer,
  space,
  ...init
}: Partial<JSONInitAlt>): Response;

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
    status = Status.OK,
    statusText = STATUS_TEXT.get(`${status}`),
  } = init;

  return new Response(body, { ...init, statusText, status, headers });
}

function safeJsonParse<T extends any>(data: string): T | undefined {
  try {
    return JSON.parse(data);
  } catch (e) {
    log.error("Unable to parse JSON!", e.toString());
    return undefined;
  }
}

export function jsonParse<T extends any>(data: string): T | undefined {
  return safeJsonParse<T>(data);
}

function safeJsonStringify<T extends any>(
  data: T,
  space: string | number = 0,
): string | undefined {
  try {
    return JSON.stringify(data, undefined, space);
  } catch (e) {
    log.error("Unable to stringify JSON!", e.toString());
    return "";
  }
}

export function jsonStringify<T extends any>(
  data: T,
  space: string | number = 0,
): string | undefined {
  return safeJsonStringify<T>(data, space);
}

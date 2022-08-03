import { decode, isObject, SerializeMap, toStringTag } from "./index.ts";

/**
 * Extracts and parses parameters from search query or from the path.
 * Allows delimiters of `&` (standard), `;`, or `::`.
 * Trims and runs `decodeURIComponent` on all values.
 * @note Used internally by the `formatParams` method below.
 * @returns an array of param entries in `[key, value]` format
 */
export function parseInitialParams(init: ParamsInit): string[][] {
  let str = `${init?.toString()}`;
  if (init instanceof URLSearchParams) {
    str = init.toString();
  } else if (
    (isObject(init as any) || (Array.isArray(init) &&
      (init[0] != null && typeof init[0][0] === "string")))
  ) {
    str = new URLSearchParams(init).toString();
  }

  return `${str ?? ""}`.split(/([:]{2}|[;&])/).map(
    (p: string) => [
      (p.split("=")[0] ?? "").trim(),
      decode((p.split("=")[1] ?? "").trim()),
    ],
    // janky way to filter out empty values... but it works
  ).filter(([k, v]) => (v != null && v != "" && k != "&"));
}

/**
 * Normalizes an arbitrary number of parameter sets, from various different
 * types, into a single `URLSearchParams` instance. Each argument provided is
 * treated as a separate set of parameters. Allowed types are `string`,
 * `string[][]`, `Record<string, string>`, and `URLSearchParams`. They are
 * first converted into `[key,value]` pairs (entries), then merged into a
 * literal object, and finally initialized as a `URLSearchParams` instance.
 * @param params parameter groups to parse, normalize, and merge
 * @returns a new, normalized URLSearchParams object
 */
export function formatParams<Params extends ParamsInit>(
  ...p: Array<Params & ParamsInit>
): URLSearchParams {
  const parameters = (p ?? []).reduce(
    (acc: ParamObject, cur: Params) => ({
      ...acc,
      ...Object.fromEntries(parseInitialParams(cur) ?? []),
    }),
    {} as ParamObject,
  );

  return new URLSearchParams(parameters as ParamObject);
}

/**
 * Creates a new `URLSearchParams` object from a string or an array of
 * key/value pairs.
 *
 * @param init the initializer value
 * @returns a new `URLSearchParams` object
 */
export function createURLSearchParams(
  init?: URLSearchParamsInit,
): URLSearchParams {
  const params = new URLSearchParams(init);

  /**
   * Extracts and parses parameters from search query or from the path.
   * Allows delimiters of `&` (standard), `;`, or `::`.
   * Trims and runs `decodeURIComponent` on all values.
   * @note Used internally by the `formatParams` method below.
   * @returns an array of param entries in `[key, value]` format
   */
  function parseParams(s: string): URLSearchParams {
    const entries: string[][] = `${s ?? ""}`.split(/([;&,])/)
      .map((p) => [...(p.split("=") ?? []).map((s) => s.trim())])
      .filter(([k, v]) => (v != null && v != "" && k != "&"));
    return createURLSearchParams(entries);
  }

  if (init == null) return params;
  if (typeof init === "string") {
    init = [...parseParams(init).entries()];
  } else if (Array.isArray(init) && Array.isArray(init[0])) {
    init = [...init];
  } else if (toStringTag(init, "Object")) {
    init = [...Object.entries(init)];
  } else if (
    init instanceof URLSearchParams ||
    (init instanceof Map || init instanceof SerializeMap)
  ) {
    init = [...init.entries()];
  } else {
    throw new TypeError(`Invalid initializer type: ${typeof init}`);
  }
  (init as [string, string][]).forEach(([k, v]) => params.append(k, v));
  return params;
}

export declare type Obj<T extends string = string> = Record<string, T>;
export declare type URLSearchParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

/**
 * Normalizes an arbitrary number of parameter sets, from various different
 * types, into a single `URLSearchParams` instance. Each argument provided is
 * treated as a separate set of parameters. Allowed types are `string`,
 * `string[][]`, `Record<string, string>`, and `URLSearchParams`. They are
 * first converted into `[key,value]` pairs (entries), then merged into a
 * literal object, and finally initialized as a `URLSearchParams` instance.
 * @param params parameter groups to parse, normalize, and merge
 * @returns a new, normalized URLSearchParams object
 */
export function normalizeParams(
  ...p: URLSearchParamsInit[]
): URLSearchParams {
  const parameters = (p ?? []).reduce(
    (acc, cur) =>
      new URLSearchParams([
        ...(acc as any).entries(),
        createURLSearchParams(cur),
      ]),
    new URLSearchParams(),
  ) as URLSearchParams;
  parameters.sort();
  return parameters;
}

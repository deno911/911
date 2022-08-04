import { decode, isObject, SerializeMap, toStringTag } from "./index.ts";
import { sha256 } from "./hash.ts";

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
  const keys = [...new Set(parameters.keys())].sort();
  return new URLSearchParams(
    keys.filter(Boolean).map((k) =>
      Boolean(parameters.get(k)) && [k, parameters.get(k)]
    ).filter(Boolean),
  );
}

export async function formatKey(params: string, prefix = "item::") {
  const searchParams = Params.parse(params);
  return (prefix + await sha256(searchParams.toString()));
}

declare namespace Params {
  type Init =
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | Params;
}

export class Params extends URLSearchParams implements Params {
  private static readonly paramsPattern = /(?:|[&;])([^&;#=]+)[=]([^&;#]*)/g;
  private static readonly groupsPattern = /(?<=[^&;#]*)[&;](?=[^&;#]*)/g;
  private static readonly valuesPattern = /(?<=[^&;#=]+)[=](?=[^&;#]*)/g;

  constructor(init?: Params.Init) {
    if (init) {
      init = (Params.validate(init) && Params.parse(init)) ||
        new URLSearchParams();
      return super(init), this;
    }
    return super(), this;
  }

  /**
   * Verify if an arbitrary value is fit for initializing a Params instance.
   * @param value
   * @returns
   */
  static validate(value: unknown): value is Params.Init {
    return (
      (typeof value === "string" && Params.pattern.params.test(value)) ||
      (Array.isArray(value) && Array.isArray(value[1])) ||
      (value instanceof Params || value instanceof URLSearchParams) ||
      (Object.prototype.toString.call(value) === "[object Object]" && (
        Object.keys(value as Record<string, unknown>).length === 0 ||
        Object.keys(value as Record<string, unknown>)
          .every((v) => typeof v === "string")
      ))
    );
  }

  static get pattern(): {
    [K in "params" | "groups" | "values"]: RegExp;
  } {
    return {
      params: Params.paramsPattern,
      groups: Params.groupsPattern,
      values: Params.valuesPattern,
    };
  }

  /**
   * Parse parameters from a string, array of entries, object literal, or
   * an existing Params / URLSearchParams instance. Allows parameters with
   * semicolon (`;`) delimiters, per the IETF RFC specification.
   * @param value raw value to be parsed
   * @returns
   */
  static parse<T extends Params.Init>(value: T) {
    const init = new URLSearchParams();
    if (Params.validate(value)) {
      if (
        (Array.isArray(value) && Array.isArray(value[0])) ||
        (typeof value === "object" &&
          !(value instanceof URLSearchParams || value instanceof Params))
      ) {
        value = new URLSearchParams(value) as T;
      }
      return `${value.toString()}`
        .split(Params.pattern.groups)
        .map((p) => p.split(Params.pattern.values))
        .reduce((params, [key, val]) => (
          (key = decode(key.trim())),
            params.append(key, decode(val?.trim?.() ?? "")),
            params.sort(),
            params
        ), init);
    }
    return init;
  }

  /**
   * Sorts all parameters, flattens any keys with multiple values (using
   * the last value encountered as each key's final value), and then sorts
   * them once again.
   *
   * @example const params = new Params("key=val1&key2=val2&key=val3");
   * params.distinct().toString();
   * // key=val3&key2=val2
   */
  distinct(): Params {
    for (const key of new Set(this.keys())) {
      const val = this.get(key);
      this.set(key, [...this.getAll(key)].pop()! ?? val);
    }
    return this;
  }

  static get [Symbol.toStringTag](): "Params" {
    return "Params" as const;
  }

  get [Symbol.species]() {
    return Params;
  }

  static get [Symbol.unscopables]() {
    return {
      toJSON: false,
    };
  }

  [Symbol.toPrimitive](hint: "number" | "string" | "default") {
    if (hint === "number") {
      return this.size;
    }
    if (hint === "string") {
      return this.toString();
    }
    return JSON.stringify(this);
  }

  get size(): number {
    try {
      return [...this.keys()].length;
    } catch {
      return 0;
    }
  }

  get length(): number {
    return this.size;
  }

  toJSON() {
    return Object.fromEntries([...this.entries()!]);
  }
}

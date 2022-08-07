import {
  decode,
  is,
  removeEmptyValues,
  SerializeMap,
  sha256,
} from "./index.ts";

// /**
//  * Creates a new `URLSearchParams` object from a string or an array of
//  * key/value pairs.
//  *
//  * @param init the initializer value
//  * @returns a new `URLSearchParams` object
//  */
// export function createURLSearchParams(
//   init?: URLSearchParamsInit,
// ): URLSearchParams {
//   const params = new URLSearchParams(init);

//   /**
//    * Extracts and parses parameters from search query or from the path.
//    * Allows delimiters of `&` (standard), `;`, or `::`.
//    * Trims and runs `decodeURIComponent` on all values.
//    * @note Used internally by the `formatParams` method below.
//    * @returns an array of param entries in `[key, value]` format
//    */
//   function parseParams(s: string): URLSearchParams {
//     const entries: string[][] = `${s ?? ""}`.split(/([;&,])/)
//       .map((p) => [...(p.split("=") ?? []).map((s) => s.trim())]);
//     return createURLSearchParams(
//       removeEmptyValues(
//         Object.fromEntries<string>(entries as Iterable<[string, string]>),
//       ) as Record<string, string>,
//     );
//   }

//   if (init == null) return params;
//   if (is.string(init)) {
//     init = [...parseParams(init).entries()];
//   } else if (is.array(init) && is.array(init[0])) {
//     init = [...init];
//   } else if (is.object(init)) {
//     init = [...Object.entries(init)];
//   } else if (
//     is.urlSearchParams(init) ||
//     (is.map(init) || is.directInstanceOf(init, SerializeMap))
//   ) {
//     init = [...(init as URLSearchParams).entries()];
//   } else {
//     throw new TypeError(`Invalid initializer type: ${typeof init}`);
//   }
//   (init as [string, string][]).forEach(([k, v]) => params.append(k, v));
//   return params;
// }

export declare type Obj<T extends string = string> = Record<string, T>;
export declare type ParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export async function formatKey(params: string, prefix = "item::") {
  const searchParams = Params.parse(params);
  return (prefix + await sha256(searchParams.toString()));
}

export class Params extends URLSearchParams {
  private static readonly paramsPattern = /(?:|[&;])([^&;#=]+)[=]([^&;#]*)/g;
  private static readonly groupsPattern = /(?<=[^&;#]*)[&;](?=[^&;#]*)/g;
  private static readonly valuesPattern = /(?<=[^&;#=]+)[=](?=[^&;#]*)/g;

  constructor(init?: ParamsInit) {
    if (init) {
      init = (Params.validate(init) && Params.parse(init)) ||
        new URLSearchParams();
      return super(init), this;
    }
    return super(), this;
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
   * Verify if an arbitrary value is fit for initializing a Params instance.
   * @param value
   * @returns
   */
  static validate(value: unknown): value is ParamsInit {
    return (
      (is.string(value) && Params.pattern.params.test(value)) ||
      (is.array(value) && value.length > 0 &&
        (is.array(value[0]) && is.all(is.string, ...value[0]))) ||
      (is.directInstanceOf(value, Params) ||
        is.directInstanceOf(value, URLSearchParams)) ||
      (is.plainObject<string>(value))
    );
  }

  /**
   * Parse parameters from a string, array of entries, object literal, or
   * an existing Params / URLSearchParams instance. Allows parameters with
   * semicolon (`;`) delimiters, per the IETF RFC specification.
   * @param values raw value to be parsed
   * @returns
   */
  static parse<T extends any = ParamsInit>(...values: T[]): Params {
    const init = new Params();
    for (let value of values) {
      if (Params.validate(value)) {
        value = new URLSearchParams(value) as T;
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

export default Params;

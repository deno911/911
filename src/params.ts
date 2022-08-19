// deno-lint-ignore-file no-explicit-any
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="esnext" />
/// <reference types="../types.d.ts" />
/// <reference types="./type.ts" />

import { decode } from "./fmt.ts";
import { is } from "./type.ts";
import { removeEmptyValues } from "./collection.ts";

export declare type Obj<T extends string = string> = Record<string, T>;
export declare type ParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export declare interface ParamsOptions {
  distinct?: boolean;
  sort?: boolean;
  defaultParams?: Record<string, string>;
}

export class Params extends URLSearchParams {
  readonly options: ParamsOptions;

  constructor(init?: ParamsInit, options: ParamsOptions = {}) {
    super((init && Params.validate(init)) ? init : undefined);
    this.options = Object.assign({}, Params.#options, options);
    return this;
  }

  toObject<T extends Obj>(): T {
    return Params.toObject<T>(this);
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

  get [Symbol.toStringTag](): "Params" {
    return "Params" as const;
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

  getAll(names: string | string[]) {
    if (is.array<string>(names)) {
      return names.flatMap((name) => super.getAll(name) ?? [], this);
    }
    return super.getAll(names as string);
  }

  get<T extends any = string>(names: string[]): T[];
  get<T extends any = string>(name: string): T;
  get(names: string | string[]) {
    if (is.array<string>(names)) {
      return names.flatMap((name) => this.get(name), this);
    }
    return this.getAll(names).pop();
  }

  toJSON() {
    return Object.fromEntries(
      [...this.entries()].map(([k]) => [k, this.get<string>(k)]),
    );
  }

  private static readonly RE = {
    params: /(?<=[?#&;,]?)([^&;,=]+)(?:[=]([^&;,]+)|)/g,
    groups: /(?<=[^&;#]*)[&;](?=[^&;#]*)/g,
    values: /(?<=[^&;#=]+)[=](?=[^&;#]*)/g,
  } as const;

  static readonly #options: ParamsOptions = {
    distinct: false,
    sort: true,
    defaultParams: {},
  };

  static set #defaultParams(val: ParamsInit) {
    Object.assign(Params.#options, {
      defaultParams: Params.parse(val).toJSON(),
    });
  }

  static get #defaultParams(): ParamsInit {
    return Params.#options.defaultParams;
  }

  /**
   * Verify if an arbitrary value is fit for initializing a Params instance.
   * @param value
   * @returns
   */
  static validate(value: unknown, named = false): value is ParamsInit {
    return (
      (is.string(value) && Params.RE.params.test(value)) ||
      (is.array(value) && is.array(value[0]) &&
        is.all(is.string, ...value[0])) ||
      is.directInstanceOf(value, Params) ||
      is.urlSearchParams(value) ||
      is.plainObject<string>(value)
    );
  }

  /**
   * Parse parameters from a string, array of entries, object literal, or
   * an existing Params / URLSearchParams instance. Allows parameters with
   * semicolon (`;`) delimiters, per the IETF RFC specification.
   * @param value raw value to be parsed
   * @returns
   */
  static parse<T extends ParamsInit>(value: T): Params;
  static parse<T extends ParamsInit, U extends ParamsInit>(
    value1: T,
    value2: U,
  ): Params;
  static parse<
    T extends ParamsInit,
    U extends ParamsInit,
    V extends ParamsInit,
  >(value1: T, value2: U, value3: V): Params;
  static parse<
    T extends ParamsInit,
    U extends ParamsInit,
    V extends ParamsInit,
    W extends ParamsInit,
    All extends ParamsInit = T & U & V & W,
  >(value1: T, value2: U, value3: V, value4: W): Params;
  static parse<T extends any>(...values: T[]): Params {
    const init = new Params(Params.#defaultParams);

    const stringToEntries = (value: string): string[][] =>
      `${value.toString()}`.split(Params.RE.groups).map((p) =>
        p.split(Params.RE.values)
      );
    const isEntries = (
      value: unknown,
    ): value is string[][] => (is.array(value) && is.array(value[0]) &&
      is.all(is.string, ...value[0]));

    for (const value of values) {
      if (Params.validate(value)) {
        const entries: string[][] = (
          isEntries(value)
            ? value
            : (is.string(value) && Params.RE.params.test(value))
            ? stringToEntries(value)
            : is.plainObject<string>(value)
            ? Array.from(Object.entries<string>(value) as string[][])
            : is.urlSearchParams(value)
            ? Array.from((value as URLSearchParams).entries())
            : is.directInstanceOf(value, Params)
            ? Array.from((value as Params).entries())
            : []
        );
        for (let [key, val] of [...entries]) {
          key = decode(key.trim());
          val = decode(val?.trim?.() ?? "");
          init.append(key, val);
        }
      }
    }
    init.sort();
    return init;
  }

  static toObject<T extends any = { [K: string]: string }>(params: Params): T {
    return removeEmptyValues(
      Object.fromEntries<string>(params as Iterable<[string, string]>),
    ) as T;
  }

  static get [Symbol.toStringTag](): "Params" {
    return "Params" as const;
  }

  static get [Symbol.species]() {
    return Params;
  }

  static get [Symbol.unscopables]() {
    return {
      toJSON: false,
    };
  }
}

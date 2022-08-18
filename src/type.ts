import { type Assert, assert as isAssert, is } from "../deps.ts";
export { is };

export type Maybe<T = any> = T | null | undefined;

/**
 * Parses an object's `toStringTag` value.
 * @example toStringTag({}) // "Object"
 * @param o target object
 * @returns the object's `toStringTag` value ("Object" from `[object Object]`)
 */
export function toStringTag<O extends unknown>(o: O): string;
export function toStringTag<O extends unknown>(o: O, t: string): boolean;
export function toStringTag(o: unknown, t?: string): string | boolean {
  if (t != null) {
    return (`${t}`.toLowerCase() === toStringTag(o).toLowerCase());
  }
  return {}.toString.call(o)?.replace(/^\[object (\w+)\]$/, "$1") ?? "";
}

/**
 * Check if a value is an object literal / plain object.
 */
export function isObject<T extends Record<any, any>>(
  value: T,
): value is Record<any, any> {
  return toStringTag(value, "Object");
}

/**
 * Check if a value is an Array.
 */
export const isArray = is.array;

/**
 * Check if a value is an ArrayLike object, meaning it has a numeric length
 * property and has a numeric index.
 *
 * @param value
 * @returns
 */
export const isArrayLike = is.arrayLike;

/**
 * Type guard to filter out null-ish values
 *
 * @category Types
 * @example array.filter(notNullish)
 */
export function notNullish<T>(v: T | null | undefined): v is NonNullable<T> {
  return !is.nullOrUndefined(v);
}
export { notNullish as notNil, notNullish as notNullable };

/**
 * Type guard to filter out null values
 *
 * @category Types
 * @example array.filter(noNull)
 */
export function notNull<T>(v: T | null): v is Exclude<T, null> {
  return v !== null;
}
export { notNull as isNotNull, notNull as noNull };

/**
 * Type guard to filter out null-ish values
 *
 * @category Types
 * @example array.filter(notUndefined)
 */
export function notUndefined<T>(v: T): v is Exclude<T, undefined> {
  return v !== undefined;
}

/**
 * Type guard to filter out falsy values
 *
 * @category Types
 * @example array.filter(isTruthy)
 */
export function isTruthy<T>(v: T): v is NonNullable<T> {
  return is.truthy<T>(v);
}
export { isTruthy as truthy };

export function isFalsey<T>(v: T): v is NonNullable<T> {
  return is.falsey<T>(v);
}
export { isFalsey as falsey, isFalsey as falsy };

/**
 * Asserts that a condition is true.
 * @param condition the condition to assert
 * @param message the message to throw if the condition is false
 * @category Types
 * @example ```ts
 * import { assertsThat } from "https://deno.land/x/911@0.1.2/src/type.ts";
 *
 * assertsThat(true, "true is true");
 * ```
 */
export const assertsThat = (
  condition: boolean,
  message: string,
): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

type StripUnderscores<T> = T extends `${infer P}_`
  ? P extends `${infer Q}_${infer R}`
    ? `${Capitalize<Lowercase<Q>>}${Capitalize<Lowercase<R>>}`
  : P
  : T;
type Asserts = Assert & {
  class: Assert["class_"];
  function: Assert["function_"];
  null: Assert["null_"];
  nil: Assert["nullOrUndefined"];
};

const isAsserts = Object.assign({}, { ...isAssert }, {
  class: isAssert["class_"],
  function: isAssert["function_"],
  null: isAssert["null_"],
  nil: isAssert["nullOrUndefined"],
});

export function assert<T extends any = unknown>(
  value: T,
  condition: keyof typeof isAsserts,
  message?: string,
): ReturnType<Asserts[keyof Asserts]> {
  if (!condition) {
    throw new Error(
      message ??
        `Assertion failed: ${value} (${typeof value}, condition: ${condition})`,
    );
  }
  return (isAsserts as any)[condition](value);
}

export const noop = () => {};

export type Awaitable<T> = T | PromiseLike<T>;

/**
 * Null or whatever
 */
export type Nullable<T> = T | null | undefined;

/**
 * Array, or not yet
 */
export type Arrayable<T> = T | Array<T>;

export type Arrayish<T> =
  | Arrayable<T>
  | ArrayLike<T>
  | Iterable<T>
  | AsyncIterable<T>;

/**
 * Constructor
 */
export type Constructor<T = void, A = void> = new (...args: A[]) => T;
export interface Constructable {
  new (...args: any[]): any;
}

export type Method<T = void> = () => T;

export type Fn<T = void, A extends any = undefined> = A extends undefined
  ? Method<T>
  : ((...args: A[]) => Maybe<T>);

export type AsyncFn<A extends any = undefined, R = any> = Fn<R | Promise<R>, A>;

export type AsyncCallback<R = any, A = any> = (
  ...args: (A | undefined)[]
) => Promise<R>;

/**
 * Defines an intersection type of all union items.
 *
 * @param U Union of any types that will be intersected.
 * @returns U items intersected
 * @see https://stackoverflow.com/a/50375286/9259330
 */
export type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I
    : never;

/**
 * Infers the arguments type of a function
 */
export type ArgumentsType<T extends (...args: any) => any> = T extends
  (...args: infer P) => any ? P : never;
export type ArgumentType<T extends (...args: any) => any> = T extends
  (...args: (infer A)[]) => any ? A : never;
export { type ArgumentsType as Args, type ArgumentType as Arg };

export type StringLiteralUnion<T extends U, U = string> = T | (U & {});

export type MockMap = Map<
  string,
  Record<string, string | null | (() => unknown)>
>;

export type MutableArray<T extends readonly any[]> = {
  -readonly [k in keyof T]: T[k];
};

/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never;

export type KeyOf<T> = T extends Record<any, any> ? KeyOfRecord<T>
  : T extends [any, any] ? KeyOfTuple<T>
  : T extends [any, any][] ? KeyOfEntries<T>
  : T extends Map<any, any> ? KeyOfMap<T>
  : T extends object ? KeyOfObject<T>
  : T extends any[] ? KeyOfArray<T>
  : never;

export type ValueOf<T> = T extends Record<any, any> ? ValueOfRecord<T>
  : T extends [any, any] ? ValueOfTuple<T>
  : T extends [any, any][] ? ValueOfEntries<T>
  : T extends Map<any, any> ? ValueOfMap<T>
  : T extends object ? ValueOfObject<T>
  : T extends any[] ? ValueOfArray<T>
  : never;

export type KeyOfMap<T> = T extends Map<infer K, any> ? K : never;
export type ValueOfMap<T> = T extends Map<any, infer V> ? V : never;

export type KeyOfRecord<T> = T extends Record<infer K, any> ? K : never;
export type ValueOfRecord<T> = T extends Record<any, infer V> ? V : never;

export type KeyOfArray<T> = T extends Array<any> ? keyof T : never;
export type ValueOfArray<T> = T extends Array<infer V> ? V : never;

export type KeyOfTuple<T> = T extends Arrayable<[infer K, any]> ? K : never;
export type ValueOfTuple<T> = T extends Arrayable<[any, infer V]> ? V : never;

export type KeyOfEntries<T> = T extends Arrayish<[(infer K), any]> ? K : never;
export type ValueOfEntries<T> = T extends Arrayish<[PropertyKey, (infer V)]> ? V
  : never;

export type KeyOfUnion<T> = T extends UnionToIntersection<infer U> ? U : never;
export type ValueOfUnion<T> = T extends UnionToIntersection<infer U> ? U
  : never;

export type KeyOfObject<T> = T extends object ? keyof T : never;
export type ValueOfObject<T> = T extends object ? T[keyof T] : never;

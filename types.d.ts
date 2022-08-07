// deno-lint-ignore-file ban-types

declare type Maybe<T extends any> = T | undefined;

declare type Obj<T extends string = string> = Record<string, T>;

declare type URLSearchParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

declare type ParamObject = Record<string, string>;

declare type ParamsInit = URLSearchParamsInit;

/**
 * Matches any primitive value.
 * @see https://mdn.io/Primitive
 */
declare type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

/**
 * Matches a `class` constructor.
 * @see https://mdn.io/Classes.
 */
declare type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T;

/**
 * Matches any [typed array](https://mdn.io/TypedArray).
 * @see https://mdn.io/TypedArray
 */
declare type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

declare type Falsey = false | 0 | 0n | "" | null | undefined;

/**
 * Promise, or maybe not
 */
declare type Awaitable<T> = T | PromiseLike<T>;

/**
 * Null or whatever
 */
declare type Nullable<T> = T | null | undefined;

/**
 * Array, or not yet
 */
declare type Arrayable<T> = T | Array<T>;

/**
 * Function
 */
declare type Method<T = void> = () => T;
declare type Fn<T = void, A = any> = (...args: A[]) => T;

/**
 * Constructor
 */
declare type Constructor<T = void, A = void> = new (...args: A[]) => T;

declare interface Constructable {
  new (...args: any[]): any;
}

/**
 * Defines an intersection type of all union items.
 *
 * @param U Union of any types that will be intersected.
 * @returns U items intersected
 * @see https://stackoverflow.com/a/50375286/9259330
 */
declare type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I
    : never;

/**
 * Infers the arguments type of a function
 */
declare type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

declare type MergeInsertions<T> = T extends object
  ? { [K in keyof T]: MergeInsertions<T[K]> }
  : T;

declare type DeepMerge<F, S> = MergeInsertions<
  {
    [K in keyof F | keyof S]: K extends keyof S & keyof F
      ? DeepMerge<F[K], S[K]>
      : K extends keyof S ? S[K]
      : K extends keyof F ? F[K]
      : never;
  }
>;

/**
 * Infers the element type of an array
 */
declare type ElementOf<T> = T extends (infer E)[] ? E : never;

declare type StringLiteralUnion<T extends U, U = string> = T | (U & {});

declare type MockMap = Map<
  string,
  Record<string, string | null | (() => unknown)>
>;

declare type MutableArray<T extends readonly any[]> = {
  -readonly [k in keyof T]: T[k];
};

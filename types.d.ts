// deno-lint-ignore-file

type Maybe<T extends any> = T | undefined;

type Obj<T extends string = string> = Record<string, T>;

/**
 * Matches any primitive value.
 * @see https://mdn.io/Primitive
 */
type Primitive =
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
type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T;

/**
 * Matches any [typed array](https://mdn.io/TypedArray).
 * @see https://mdn.io/TypedArray
 */
type TypedArray =
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

type Falsey = false | 0 | 0n | "" | null | undefined;

/**
 * Promise, or maybe not
 */
type Awaitable<T> = T | PromiseLike<T>;

/**
 * Null or whatever
 */
type Nullable<T> = T | null | undefined;

/**
 * Array, or not yet
 */
type Arrayable<T> = T | Array<T>;

/**
 * Function
 */
type Method<T = void> = import("./src/type.ts").Method<T>;

type Fn<T = void, A = any> = import("./src/type.ts").Fn<T, A>;

/**
 * Constructor
 */
type Constructor<T = void, A = void> = new (...args: A[]) => T;

interface Constructable {
  new (...args: any[]): any;
}

/**
 * Defines an intersection type of all union items.
 *
 * @param U Union of any types that will be intersected.
 * @returns U items intersected
 * @see https://stackoverflow.com/a/50375286/9259330
 */
type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I
    : never;

/**
 * Infers the arguments type of a function
 */
type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

type MergeInsertions<T> = T extends object
  ? { [K in keyof T]: MergeInsertions<T[K]> }
  : T;

type DeeperMerge<F, S> = MergeInsertions<
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
type ElementOf<T> = T extends (infer E)[] ? E : never;

type StringLiteralUnion<T extends U, U = string> = T | (U & {});

type MockMap = Map<
  string,
  Record<string, string | null | (() => unknown)>
>;

type MutableArray<T extends readonly any[]> = {
  -readonly [k in keyof T]: T[k];
};

/**
 * How does recursive typing works ?
 *
 * Deep merging process is handled through `DeepMerge<T, U, Options>` type.
 * If both T and U are Records, we recursively merge them,
 * else we treat them as primitives.
 *
 * Merging process is handled through `Merge<T, U>` type, in which
 * we remove all maps, sets, arrays and records so we can handle them
 * separately depending on merging strategy:
 *
 *    Merge<
 *      {foo: string},
 *      {bar: string, baz: Set<unknown>},
 *    > // "foo" and "bar" will be handled with `MergeRightOmitComplexes`
 *      // "baz" will be handled with `MergeAll*` type
 *
 * `MergeRightOmitComplexes<T, U>` will do the above: all T's
 * exclusive keys will be kept, though common ones with U will have their
 * typing overridden instead:
 *
 *    MergeRightOmitComplexes<
 *      {foo: string, baz: number},
 *      {foo: boolean, bar: string}
 *    > // {baz: number, foo: boolean, bar: string}
 *      // "baz" was kept from T
 *      // "foo" was overridden by U's typing
 *      // "bar" was added from U
 *
 * For Maps, Arrays, Sets and Records, we use `MergeAll*<T, U>` utility
 * types. They will extract relevant data structure from both T and U
 * (providing that both have same data data structure, except for typing).
 *
 * From these, `*ValueType<T>` will extract values (and keys) types to be
 * able to create a new data structure with an union typing from both
 * data structure of T and U:
 *
 *    MergeAllSets<
 *      {foo: Set<number>},
 *      {foo: Set<string>}
 *    > // `SetValueType` will extract "number" for T
 *      // `SetValueType` will extract "string" for U
 *      // `MergeAllSets` will infer type as Set<number|string>
 *      // Process is similar for Maps, Arrays, and Sets
 *
 * `DeepMerge<T, U, Options>` is taking a third argument to be handle to
 * infer final typing depending on merging strategy:
 *
 *    & (Options extends { sets: "replace" } ? PartialByType<U, Set<unknown>>
 *      : MergeAllSets<T, U>)
 *
 * In the above line, if "Options" have its merging strategy for Sets set to
 * "replace", instead of performing merging of Sets type, it will take the
 * typing from right operand (U) instead, effectively replacing the typing.
 *
 * An additional note, we use `ExpandRecursively<T>` utility type to expand
 * the resulting typing and hide all the typing logic of deep merging so it is
 * more user friendly.
 */

/** Force intellisense to expand the typing to hide merging typings */
type ExpandRecursively<T> = T extends Record<PropertyKey, unknown>
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

/** Filter of keys matching a given type */
type PartialByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/** Get set values type */
type SetValueType<T> = T extends Set<infer V> ? V : never;

/** Merge all sets types definitions from keys present in both objects */
type MergeAllSets<
  T,
  U,
  X = PartialByType<T, Set<unknown>>,
  Y = PartialByType<U, Set<unknown>>,
  Z = {
    [K in keyof X & keyof Y]: Set<SetValueType<X[K]> | SetValueType<Y[K]>>;
  },
> = Z;

/** Get array values type */
type ArrayValueType<T> = T extends Array<infer V> ? V : never;

/** Merge all sets types definitions from keys present in both objects */
type MergeAllArrays<
  T,
  U,
  X = PartialByType<T, Array<unknown>>,
  Y = PartialByType<U, Array<unknown>>,
  Z = {
    [K in keyof X & keyof Y]: Array<
      ArrayValueType<X[K]> | ArrayValueType<Y[K]>
    >;
  },
> = Z;

/** Get map values types */
type MapKeyType<T> = T extends Map<infer K, unknown> ? K : never;

/** Get map values types */
type MapValueType<T> = T extends Map<unknown, infer V> ? V : never;

/** Merge all sets types definitions from keys present in both objects */
type MergeAllMaps<
  T,
  U,
  X = PartialByType<T, Map<unknown, unknown>>,
  Y = PartialByType<U, Map<unknown, unknown>>,
  Z = {
    [K in keyof X & keyof Y]: Map<
      MapKeyType<X[K]> | MapKeyType<Y[K]>,
      MapValueType<X[K]> | MapValueType<Y[K]>
    >;
  },
> = Z;

/** Merge all records types definitions from keys present in both objects */
type MergeAllRecords<
  T,
  U,
  Options,
  X = PartialByType<T, Record<PropertyKey, unknown>>,
  Y = PartialByType<U, Record<PropertyKey, unknown>>,
  Z = {
    [K in keyof X & keyof Y]: DeepMerge<X[K], Y[K], Options>;
  },
> = Z;

/** Exclude map, sets and array from type */
type OmitComplexes<T> = Omit<
  T,
  keyof PartialByType<
    T,
    | Map<unknown, unknown>
    | Set<unknown>
    | Array<unknown>
    | Record<PropertyKey, unknown>
  >
>;

/** Object with keys in either T or U but not in both */
type ObjectXorKeys<
  T,
  U,
  X = Omit<T, keyof U> & Omit<U, keyof T>,
  Y = { [K in keyof X]: X[K] },
> = Y;

/** Merge two objects, with left precedence */
type MergeRightOmitComplexes<
  T,
  U,
  X = ObjectXorKeys<T, U> & OmitComplexes<{ [K in keyof U]: U[K] }>,
> = X;

/** Merge two objects */
type Merge<
  T,
  U,
  Options,
  X =
    & MergeRightOmitComplexes<T, U>
    & MergeAllRecords<T, U, Options>
    & (Options extends { sets: "replace" } ? PartialByType<U, Set<unknown>>
      : MergeAllSets<T, U>)
    & (Options extends { arrays: "replace" } ? PartialByType<U, Array<unknown>>
      : MergeAllArrays<T, U>)
    & (Options extends { maps: "replace" }
      ? PartialByType<U, Map<unknown, unknown>>
      : MergeAllMaps<T, U>),
> = ExpandRecursively<X>;

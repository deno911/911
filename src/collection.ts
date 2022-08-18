import {
  aggregateGroups,
  deepMerge as deeperMerge,
  distinct,
  distinctBy,
  is,
  mapNotNullish,
  maxBy,
  maxOf,
  maxWith,
  minBy,
  minOf,
  minWith,
  sample,
  unzip,
  zip,
} from "../deps.ts";
import type { Arrayable, Nullable } from "./type.ts";
import { clamp } from "./math.ts";

/**
 * Convert `Arrayable<T>` to `Array<T>`
 *
 * @category Collection
 */
export function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T> {
  array = array || [];
  if (Array.isArray(array)) {
    return array;
  }
  return [array];
}

/**
 * Convert `Arrayable<T>`, `Iterable<T>`, etc. to a normalized `Array<T>`.
 * @example ```ts
 * import { toArray } from "./collection.ts";
 *
 * toArray([1, 2, 3]); // [1, 2, 3]
 * toArray(new Set([1, 2, 3])); // [1, 2, 3]
 * toArray(new Map([[1, 2], [2, 3], [3, 4]]).keys()); // [1, 2, 3]
 * ```
 * @category Collection
 */
export function ensureArray<T>(
  array?: Arrayable<any>,
): Array<T> {
  array ??= [];
  if (is.array<T>(array)) {
    return (array as T[]);
  }
  // @ts-ignore - type is not arrayable
  array = [array as any].flat<T, 1>(1) as unknown as T[];
  return Array.from<T>(array as Iterable<T> | ArrayLike<T>);
}

/**
 * Convert `Arrayable<T>` to `Array<T>` and flatten it
 * @category Collection
 * @example ```ts
 * import { flatten } from "./collection.ts";
 *
 * flatten([1, 2, 3]); // [1, 2, 3]
 * flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 * ```
 */
export function flattenArrayable<T>(
  array?: Nullable<Arrayable<T | Array<T>>>,
): Array<T> {
  return toArray(array).flat(1) as Array<T>;
}

/**
 * Use rest arguments to merge arrays
 * @category Collection
 * @example ```ts
 * import { merge } from "./collection.ts";
 *
 * merge([1, 2, 3], [4, 5, 6]); // [1, 2, 3, 4, 5, 6]
 * ```
 * @param args Array of Arrayables to merge
 */
export function mergeArrayable<T>(...args: Nullable<Arrayable<T>>[]): Array<T> {
  return args.flatMap((i) => toArray(i));
}

/**
 * Partition Filter as used by the `partition` function.
 * @category Collection
 * @see {@link partition}
 */
export type PartitionFilter<T> = (i: T, idx: number, arr: readonly T[]) => any;

/**
 * Divide an array into two parts by a filter function
 * @category Collection
 * @example const [odd, even] = partition([1, 2, 3, 4], i => i % 2 != 0)
 * @example ```ts
 * import { partition } from "./collection.ts";
 *
 * partition([1, 2, 3, 4], i => i % 2 != 0); // [[1, 3], [2, 4]]
 * ```
 */
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
): [T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
): [T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
): [T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
): [T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>,
): [T[], T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>,
  f6: PartitionFilter<T>,
): [T[], T[], T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  ...filters: PartitionFilter<T>[]
): any {
  const result: T[][] = new Array(filters.length + 1).fill(null).map(() => []);

  array.forEach((e, idx, arr) => {
    let i = 0;
    for (const filter of filters) {
      if (filter(e, idx, arr)) {
        result[i].push(e);
        return;
      }
      i += 1;
    }
    result[i].push(e);
  });
  return result;
}

/**
 * Unique an Array
 *
 * @category Collection
 */
export function uniq<T>(array: readonly T[]): T[] {
  return Array.from<T>(new Set(array));
}

/**
 * Get last item
 *
 * @category Collection
 */
export function last(array: readonly []): undefined;
export function last<T>(array: readonly T[]): T;
export function last<T>(array: readonly T[]): T | undefined {
  return at(array, -1);
}

/**
 * Remove an item from Array
 *
 * @category Collection
 */
export function remove<T>(array: T[], value: T) {
  if (!array) {
    return false;
  }
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Get nth item of Array. Negative for backward
 *
 * @category Collection
 */
export function at(array: readonly [], index: number): undefined;
export function at<T>(array: readonly T[], index: number): T;
export function at<T>(array: readonly T[] | [], index: number): T | undefined {
  const len = array.length;
  if (!len) {
    return undefined;
  }

  if (index < 0) {
    index += len;
  }

  return array[index];
}

/**
 * Generate a range array of numbers. The `stop` is exclusive.
 * @category Collection
 * @example ```ts
 * import { range } from "./collection.ts";
 *
 * range(0, 5); // [0, 1, 2, 3, 4]
 * range(0, 5, 2); // [0, 2, 4]
 * ```
 */
export function range(stop: number): number[];
export function range(start: number, stop: number, step?: number): number[];
export function range(...args: any): number[] {
  let start: number, stop: number, step: number;

  if (args.length === 1) {
    start = 0;
    step = 1;
    [stop] = args;
  } else {
    [start, stop, step = 1] = args;
  }

  const arr: number[] = [];
  let current = start;
  while (current < stop) {
    arr.push(current);
    current += step || 1;
  }

  return arr;
}

/**
 * Move element in an Array
 *
 * @category Collection
 * @param arr Array to move
 * @param from Index to move from
 * @param to Index to move to
 * @example ```ts
 * import { move } from "./collection.ts";
 *
 * move([1, 2, 3, 4], 1, 3); // [1, 3, 2, 4]
 * ```
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  return arr;
}

/**
 * Clamp a number to the index ranage of an array
 * @category Collection
 * @param arr Array to clamp to
 * @param n Number to clamp
 * @example ```ts
 * import { clampArrayRange } from "./collection.ts";
 *
 * clampArrayRange([1, 2, 3, 4], 0); // 1
 * clampArrayRange([1, 2, 3, 4], 2); // 2
 * clampArrayRange([1, 2, 3, 4], 5); // 4
 * ```
 */
export function clampArrayRange<T extends any>(n: number, arr: readonly T[]) {
  return clamp(n, 0, arr.length - 1);
}

/**
 * Clamp a number to the index ranage of an array
 * @category Collection
 * @param arr Array to clamp
 * @param max Number to clamp the array length to
 * @example ```ts
 * import { clampArrayTo } from "./collection.ts";
 *
 * clampArrayTo([1, 2, 3, 4], 0); // []
 * clampArrayTo([1, 2, 3, 4], 2); // [1, 2]
 * clampArrayTo([1, 2, 3, 4], 3); // [1, 2, 3]
 * ```
 */
export function clampArrayTo<T extends any>(
  arr: Arrayable<T>,
  max: number,
) {
  arr = ensureArray<T>(arr) as T[];
  return arr?.slice?.(0, clampArrayRange<T>(max, arr));
}

/**
 * Force an array to be within a clamped range, from a minimum index to the end
 * of the array. Like `clampArray`, but with minimum instead of maximum index.
 * @category Collection
 * @param arr Array to clamp
 * @param min Number to clamp the array length to
 * @example ```ts
 * import { clampArrayFrom } from "./collection.ts";
 *
 * clampArrayFrom([1, 2, 3, 4], 0); // [1, 2, 3, 4]
 * clampArrayFrom([1, 2, 3, 4], 1); // [2, 3, 4]
 * clampArrayFrom([1, 2, 3, 4], 2); // [3, 4]
 * ```
 */
export function clampArrayFrom<T extends any>(
  arr: Arrayable<T>,
  min: number,
) {
  arr = ensureArray<T>(arr) as T[];
  return arr?.slice?.(0, clampArrayRange<T>(min, arr));
}

/**
 * Shuffle an array. This function mutates the array.
 *
 * @category Collection
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// deno-lint-ignore-file ban-types
export type DeepMerge<F, S> = MergeInsertions<
  {
    [K in keyof F | keyof S]: K extends keyof S & keyof F
      ? DeepMerge<F[K], S[K]>
      : K extends keyof S ? S[K]
      : K extends keyof F ? F[K]
      : never;
  }
>;

export type MergeInsertions<T> = T extends object
  ? { [K in keyof T]: MergeInsertions<T[K]> }
  : T;

/**
 * Map key/value pairs for an object, and construct a new one
 *
 * @category Object
 *
 * Transform:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [k.toString().toUpperCase(), v.toString()])
 * // { A: '1', B: '2' }
 * ```
 *
 * Swap key/value:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [v, k])
 * // { 1: 'a', 2: 'b' }
 * ```
 *
 * Filter keys:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => k === 'a' ? undefined : [k, v])
 * // { b: 2 }
 * ```
 */
export function objectMap<V, NV extends V, K extends string>(
  obj: Record<K, V>,
  fn:
    | ((value: V, key?: K) => Maybe<[K, V]>)
    | (([key, value]: [K, V]) => Maybe<[K, V]>),
): Record<K, V> {
  const notNullish = (v: unknown) => v != null;
  const entries = Object.entries<V>(obj).map(([k, v]) =>
    fn([k, v] as Exclude<K & [K, V], K>)
  )?.filter(notNullish);
  return Object.fromEntries<V>(entries as [K, V][]) as Record<K, NV>;
}
/**
 * Determines whether an object has a property with the specified name
 *
 * @see https://eslint.org/docs/rules/no-prototype-builtins
 * @category Object
 */
export function hasOwnProperty<T>(obj: T, v: PropertyKey): boolean {
  if (obj == null) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, v);
}

/**
 * Type guard for any key, `k`.
 * Marks `k` as a key of `T` if `k` is in `obj`.
 *
 * @category Object
 * @param obj object to query for key `k`
 * @param k key to check existence in `obj`
 */
export function isKeyOf<T extends object>(obj: T, k: keyof any): k is keyof T {
  return k in obj;
}

/**
 * Strict typed `Object.keys`
 *
 * @category Object
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Strict typed `Object.entries`
 *
 * @category Object
 */
export function objectEntries<T extends Record<string, any>>(
  obj: T,
): Array<[string, any]> {
  return Object.entries<T[keyof T]>(obj);
}

/**
 * Create a new subset object by giving keys
 *
 * @category Object
 */
export function objectPick<O, T extends keyof O>(
  obj: O,
  keys: T[],
  omitUndefined = false,
) {
  return keys.reduce((n, k) => {
    if (k in obj) {
      if (!omitUndefined || obj[k] !== undefined) {
        n[k] = obj[k];
      }
    }
    return n;
  }, {} as Pick<O, T>);
}

/**
 * Deep merge :P
 *
 * @category Object
 */
export function deepMerge<T extends Record<string, any>, S = keyof T>(
  target: T,
  ...sources: S[]
): DeepMerge<T, S> {
  if (!sources.length) {
    return target as any;
  }
  const source = sources.shift();
  if (source === undefined) {
    return target as any;
  }
  if (isMergableObject(target) && isMergableObject(source)) {
    // @ts-expect-error
    objectKeys(source).forEach((key) => {
      if (isMergableObject(source[key])) {
        if (!target[key]) {
          // @ts-expect-error
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        // @ts-expect-error
        target[key] = source[key];
      }
    });
  }

  return deepMerge(target, ...sources);
}

function isMergableObject(item: any): item is Object {
  return is.object(item) && !Array.isArray(item);
}

/**
 * Clear undefined fields from an object. Mutates the object.
 *
 * @category Object
 */
export function clearUndefined<T extends object>(obj: T): T {
  for (const key in obj) {
    obj[key] === undefined ? delete obj[key] : {};
  }
  return obj;
}

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source The first source object from which to copy properties.
 */
export function assign<T extends {}, U>(
  target: T,
  source: U,
): asserts target is T & U;

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source1 The first source object from which to copy properties.
 * @param source2 The second source object from which to copy properties.
 */
export function assign<T extends {}, U, V>(
  target: T,
  source1: U,
  source2: V,
): asserts target is T & U & V;
/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source1 The first source object from which to copy properties.
 * @param source2 The second source object from which to copy properties.
 * @param source3 The third source object from which to copy properties.
 */
export function assign<T extends {}, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W,
): asserts target is T & U & V & W;

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param sources One or more source objects from which to copy properties
 */
export function assign<T extends {}, U, V extends any[] = U[]>(
  target: T,
  ...sources: V[]
): asserts target is T & V[any] {
  if (sources != null) {
    Object.assign(target, sources);
  }
}

/**
 * Returns a new record with all entries of the given record except the ones
 * that have a key that does not match the given predicate
 *
 * @category Collection
 * @param record the object to filter
 * @param predicate the predicate to use to filter the keys
 * @returns a new object with only the keys that match the predicate
 * @example ```ts
 * import { filterKeys } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const menu = {
 *     'Salad': 11,
 *     'Soup': 8,
 *     'Pasta': 13,
 * }
 * const menuWithoutSalad = filterKeys(menu, it => it !== 'Salad')
 *
 * assertEquals(menuWithoutSalad, {
 *     'Soup': 8,
 *     'Pasta': 13,
 * })
 * ```
 */
export function filterKeys<T>(
  record: Readonly<Record<string, T>>,
  predicate: (key: string) => boolean,
): Record<string, T> {
  const ret: Record<string, T> = {};
  const keys = Object.keys(record);

  for (const key of keys) {
    if (predicate(key)) {
      ret[key] = record[key];
    }
  }
  return ret;
}

/**
 * Returns a new record with all entries of the given record except the ones
 * that have a value that does not match the given predicate
 * @category Collection
 * @example ```ts
 * import {
 *   filterValues
 * } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 *
 * import {
 *   assertEquals
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * type Person = { age: number };
 *
 * const people: Record<string, Person> = {
 *     'Arnold': { age: 37 },
 *     'Sarah': { age: 7 },
 *     'Kim': { age: 23 },
 * };
 * const adults = filterValues(people, it => it.age >= 18);
 * assertEquals(adults, {
 *     'Arnold': { age: 37 },
 *     'Kim': { age: 23 },
 * });
 * ```
 */
export function filterValues<T>(
  record: Readonly<Record<string, T>>,
  predicate: (value: T) => boolean,
): Record<string, T> {
  const ret: Record<string, T> = {};
  const entries = Object.entries(record);

  for (const [key, value] of entries) {
    if (predicate(value)) {
      ret[key] = value;
    }
  }

  return ret;
}

/**
 * Returns a new record with all entries of the given record except the ones that do not match the given predicate
 *
 * @category Collection
 * @example ```ts
 * import {
 *   filterEntries
 * } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 * import {
 *   assertEquals
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * const menu = {
 *     'Salad': 11,
 *     'Soup': 8,
 *     'Pasta': 13,
 * } as const;
 * const myOptions = filterEntries(menu,
 *     ([ item, price ]) => item !== 'Pasta' && price < 10,
 * )
 *
 * assertEquals(myOptions, {
 *     'Soup': 8,
 * })
 * ```
 */
export function filterEntries<T>(
  record: Readonly<Record<string, T>>,
  predicate: (entry: [string, T]) => boolean,
): Record<string, T> {
  const ret: Record<string, T> = {};
  const entries = Object.entries(record);

  for (const [key, value] of entries) {
    if (predicate([key, value])) {
      ret[key] = value;
    }
  }

  return ret;
}

/**
 * Applies the given transformer to all keys in the given record's entries and
 * returns a new record containing the transformed entries.
 *
 * If the transformed entries contain the same key multiple times, only the
 * last one will appear in the returned record.
 *
 * @category Collection
 * @example ```ts
 * import {
 *   mapKeys
 * } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 * import {
 *   assertEquals
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * const counts = { a: 5, b: 3, c: 8 };
 *
 * assertEquals(mapKeys(counts, it => it.toUpperCase()), {
 *     A: 5,
 *     B: 3,
 *     C: 8,
 * });
 * ```
 */
export function mapKeys<T>(
  record: Readonly<Record<string, T>>,
  transformer: (key: string) => string,
): Record<string, T> {
  const ret: Record<string, T> = {};
  const keys = Object.keys(record);
  for (const key of keys) {
    const mappedKey = transformer(key);
    ret[mappedKey] = record[key];
  }
  return ret;
}

/**
 * Applies the given transformer to all values in the given record and returns
 * a new record containing the resulting keys associated to the last value that
 * produced them.
 * @category Collection
 * @example ```ts
 * import {
 *   mapValues
 * } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 * import {
 *   assertEquals
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * const usersById = {
 *     'a5ec': { name: 'Mischa' },
 *     'de4f': { name: 'Kim' },
 * };
 * const namesById = mapValues(usersById, it => it.name)
 * assertEquals(namesById, {
 *     'a5ec': 'Mischa',
 *     'de4f': 'Kim',
 * });
 * ```
 */
export function mapValues<T, O>(
  record: Readonly<Record<string, T>>,
  transformer: (value: T) => O,
): Record<string, O> {
  const ret: Record<string, O> = {};
  const entries = Object.entries(record);

  for (const [key, value] of entries) {
    const mappedValue = transformer(value);
    ret[key] = mappedValue;
  }

  return ret;
}

/**
 * Applies the given transformer to all entries in the given record and returns
 * a new record containing the results.
 * @category Collection
 * @example ```ts
 * import { mapEntries } from "https://deno.land/x/911@0.1.0/src/collection.ts";
 * import {
 *   assertEquals
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * const usersById = {
 *     'a2e': { name: 'Kim', age: 22 },
 *     'dfe': { name: 'Anna', age: 31 },
 *     '34b': { name: 'Tim', age: 58 },
 * } as const;
 *
 * const agesByNames = mapEntries(usersById,
 *     ([ id, { name, age } ]) => [ name, age ],
 * );
 *
 * assertEquals(agesByNames, {
 *     'Kim': 22,
 *     'Anna': 31,
 *     'Tim': 58,
 * });
 * ```
 *
 * @copyright 2018-2022 the Deno authors. All rights reserved.
 * @license MIT
 */
export function mapEntries<
  TK extends string,
  TV extends any,
  OK extends string = TK,
  OV extends any = TV,
>(
  record: Record<TK, TV>,
  mapFn: (entry: [keyof TK, TV]) => [keyof OK, OV],
): Record<OK, OV> {
  const ret = {} as Record<OK, OV>;
  const entries = Object.entries<TV>(record as Record<TK, TV>) as unknown as [
    TK,
    TV,
  ][];

  for (const entry of entries) {
    const [mappedKey, mappedValue] = mapFn(entry as any) as [OK, OV];
    ret[mappedKey] = mappedValue as any;
  }

  return ret;
}

/**
 * Removes any nullish or empty values from a given record.
 * @param obj The record to filter.
 * @returns A new record containing only the non-nullish and non-empty values.
 * @category Collection
 * @example ```ts
 * import { removeEmptyValues } from "./collection.ts";
 *
 * const obj = { a: 1, b: '', c: null, d: undefined };
 * removeEmptyValues(obj); // { a: 1 }
 * ```
 */
export function removeEmptyValues(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === null) return false;
      if (value === undefined) return false;
      if (value === "") return false;
      return true;
    }),
  );
}

/**
 * Diff two arrays, returning a new array of only the elements that are not
 * shared between the two arrays.
 * @param arrA The first array to diff.
 * @param arrB The second array to diff, treated as the exclusion group.
 * @returns A new array containing only elements not shared between the two.
 * @category Collection
 * @example ```ts
 * import { diff } from "./collection.ts";
 *
 * diff([1, 2, 3, 4], [1, 2, 3]); // [4]
 * ```
 */
export function diff(arrA: string[], arrB: string[]): string[] {
  return arrA.filter((a) => arrB.indexOf(a) < 0);
}

/**
 * Splits the given array into chunks of the given size and returns them
 * @category Collection
 * @example ```ts
 * import { chunk } from "./collection.ts";
 * import { assertEquals } from "./asserts.ts";
 *
 * const words = [
 *   'lorem',
 *   'ipsum',
 *   'dolor',
 *   'sit',
 *   'amet',
 *   'consetetur',
 *   'sadipscing',
 * ];
 * const chunks = chunk(words, 3);
 * assertEquals(chunks, [
 *     [ 'lorem', 'ipsum', 'dolor' ],
 *     [ 'sit', 'amet', 'consetetur' ],
 *     [ 'sadipscing' ],
 * ]);
 * ```
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new RangeError(
      `Expected size to be an integer greater than 0 but found ${size}`,
    );
  }

  if (array.length === 0) {
    return [];
  }

  const length = Math.ceil(array.length / size);
  const ret = Array.from<T[]>({ length });

  let r = 0, w = 0;
  while (r < array.length) {
    ret[w] = array.slice(r, r + size);
    w += r += size, 1;
  }
  return ret;
}

/**
 * Transforms the given array into a Record, extracting the key of each element
 * using the given selector. If the selector produces the same key for multiple
 * elements, the latest one will be used (overriding the ones before it).
 * @category Collection
 * @example ```ts
 * import { associateBy } from "./collection.ts"
 *
 * const users = [
 *     { id: 'a2e', userName: 'Anna' },
 *     { id: '5f8', userName: 'Arnold' },
 *     { id: 'd2c', userName: 'Kim' },
 * ]
 *
 * const usersById = associateBy(users, it => it.id)
 * // {
 * //   'a2e': { id: 'a2e', userName: 'Anna' },
 * //   '5f8': { id: '5f8', userName: 'Arnold' },
 * //   'd2c': { id: 'd2c', userName: 'Kim' },
 * // }
 * ```
 */
export function associateBy<T>(
  array: readonly T[],
  selector: (el: T) => string,
): Record<string, T> {
  const ret: Record<string, T> = {};
  for (const element of array) {
    ret[selector(element)] = element;
  }
  return ret;
}

/**
 * Builds a new Record using the given array as keys, choosing a value for each
 * key using the given selector. If any of two pairs would have the same value
 * the latest on will be used (overriding the ones before it).
 * @category Collection
 * @example ```ts
 * import { associateWith } from "./collection.ts"
 *
 * const names = [ 'Kim', 'Lara', 'Jonathan' ]
 * const namesToLength = associateWith(names, it => it.length)
 *
 * // {
 * //   'Kim': 3,
 * //   'Lara': 4,
 * //   'Jonathan': 8,
 * // }
 * ```
 */
export function associateWith<T>(
  array: readonly string[],
  selector: (key: string) => T,
): Record<string, T> {
  const ret: Record<string, T> = {};
  for (const element of array) {
    ret[element] = selector(element);
  }
  return ret;
}

/**
 * Groups an array of objects into a new object, with properties
 * that are determined by the value returned by `callbackfn`.
 * @category Collection
 * @param array Array of objects to be organized into groups
 * @param callbackfn Function that is used to determine group names
 * @returns new object with groups for property names
 */
export function groupBy<U extends any, K extends keyof U>(
  array: U[],
  callbackfn: (element: U, index?: K, array?: U[]) => U[K],
  thisArg?: any,
): Record<K, U[]> {
  let key: string;
  return array.reduce((all, cur) => (
    (key = callbackfn.call(thisArg ?? array, cur) as any),
      ({ ...all, [key]: [...(all[key as K] ?? [] as U[]), cur] })
  ), {} as Record<K, U[]>);
}

export type SortKeyFn<T> = (keyof T) | ((el: T) => T[keyof T]);
export type SortCompareFn<T> = (...args: [T, T]) => number;

/**
 * Factory for creating comparator functions. The sort collections of objects
 */
export function sortFactory<T extends Record<string, any>>(
  key: SortKeyFn<T>,
): SortCompareFn<T> {
  return function (a, b) {
    const fn: SortKeyFn<T> = (el) => (
      typeof key === "function" ? key(el) : el[key]
    );
    return (fn.call(fn, a)).localeCompare(fn.call(fn, b));
  };
}

/**
 * Sort an array of objects by a shared property key. Mutates the array.
 *
 * @param array collection of objects to sort
 * @param key property
 * @returns reference to the same array
 */
export function sortInPlace<T extends Record<string, any>>(
  array: T[],
  key: SortKeyFn<T>,
): T[] {
  return array.sort(sortFactory(key));
}

/**
 * Sort an array of objects by a shared property key.
 * @param array collection of objects to sort
 * @param key property
 * @returns a copy of the source array, with sorted values
 * @category Collection
 * @example ```ts
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  key: SortKeyFn<T>,
): T[] {
  return [...array].sort(sortFactory(key));
}

/**
 * Returns all distinct elements that appear in any of the given arrays
 *
 * @category Collection
 * @example ```ts
 * import { union } from "./collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const soupIngredients = [ 'Pepper', 'Carrots', 'Leek' ]
 * const saladIngredients = [ 'Carrots', 'Radicchio', 'Pepper' ]
 * const shoppingList = union(soupIngredients, saladIngredients)
 *
 * assertEquals(shoppingList, [ 'Pepper', 'Carrots', 'Leek', 'Radicchio' ])
 * ```
 */
export function union<T>(...arrays: (readonly T[])[]): T[] {
  const set = new Set<T>();
  for (const array of arrays) {
    for (const element of array) {
      set.add(element);
    }
  }
  return Array.from(set);
}

/**
 * Returns all distinct elements that appear at least once in each of the given arrays
 *
 * @category Collection
 * @example ```ts
 * import { intersect } from "https://deno.land/std@$STD_VERSION/collections/intersect.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const lisaInterests = [ 'Cooking', 'Music', 'Hiking' ]
 * const kimInterests = [ 'Music', 'Tennis', 'Cooking' ]
 * const commonInterests = intersect(lisaInterests, kimInterests)
 *
 * assertEquals(commonInterests, [ 'Cooking', 'Music' ])
 * ```
 */
export function intersect<T>(...arrays: (readonly T[])[]): T[] {
  const [originalHead, ...tail] = arrays;
  const head = [...new Set(originalHead)];
  const tailSets = tail.map((it) => new Set(it));

  for (const set of tailSets) {
    filterInPlace(head, (it) => set.has(it));
    if (head.length === 0) return head;
  }

  return head;
}

/**
 * Filters the given array, removing all elements that do not match the given
 * predicate _in place_. **This means `array` will be modified!**.
 * @param array Array to be filtered
 * @param predicate Predicate to be applied to each element
 * @returns reference to the same array
 * @category Collection
 * @example ```ts
 * import { filterInPlace } from "./collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 * const numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
 * filterInPlace(numbers, it => it % 2 === 0)
 * assertEquals(numbers, [ 2, 4, 6, 8, 10 ])
 * ```
 */
export function filterInPlace<T>(
  array: T[],
  predicate: (el: T) => boolean,
): T[] {
  let outputIndex = 0;

  for (const cur of array) {
    if (!predicate(cur)) {
      continue;
    }
    array[outputIndex] = cur;
    outputIndex += 1;
  }
  array.splice(outputIndex);
  return array;
}

/**
 * Construct a new object containing only the given keys of another object.
 * @param o the original object to inherit from
 * @param keys the list of properties to copy to the new object
 * @returns a new object
 * @category Collection
 * @example ```ts
 * import { pick } from "./collection.ts";
 *
 * const obj1 = { a: 1, b: 4, c: 8 };
 * const obj2 = pick(obj1, ["a", "c"]);
 * // { a: 1, c: 8 }
 * ```
 */
export function pick<
  T extends any,
  K extends (keyof T & string),
>(o: T, keys: K[]): Record<K, T[K]> {
  keys = keys.map((key) => (key as string).toLowerCase().trim() as K);
  return filterEntries<any>(
    Object.assign<T, T>({} as T, is.object(o) ? o : {} as T),
    ([k, _v]: [string, T[K]]) => (keys as string[]).includes(k),
  ) as Record<K, T[K]>;
}

export {
  aggregateGroups,
  deeperMerge,
  distinct,
  distinctBy,
  mapNotNullish,
  maxBy,
  maxOf,
  maxWith,
  minBy,
  minOf,
  minWith,
  partitionBy,
  sample,
  unzip,
  zip,
};

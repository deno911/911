// deno-lint-ignore-file ban-types no-explicit-any

import { type Arrayable, is, type Nullable } from "./type.ts";
import { clamp, randomInteger } from "./math.ts";

const { hasOwn } = Object;

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
 * import { toArray } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { flatten } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 *
 * flatten([1, 2, 3]); // [1, 2, 3]
 * flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 * ```
 */
export function flatten<T>(
  array?: Nullable<Arrayable<T | Array<T>>>,
): Array<T> {
  return toArray(array).flat(1) as Array<T>;
}
export { flatten as flattenArrayable };

/**
 * Use rest arguments to merge arrays
 * @category Collection
 * @example ```ts
 * import { merge } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 *
 * merge([1, 2, 3], [4, 5, 6]); // [1, 2, 3, 4, 5, 6]
 * ```
 * @param args Array of Arrayables to merge
 */
export function merge<T>(...args: Nullable<Arrayable<T>>[]): Array<T> {
  return args.flatMap((i) => toArray(i));
}
export { merge as mergeArrayable };

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns a random element from the given array.
 *
 * Example:
 *
 * ```ts
 * import { sample } from "https://deno.land/std@$STD_VERSION/collections/sample.ts"
 * import { assert } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const numbers = [1, 2, 3, 4];
 * const random = sample(numbers);
 *
 * assert(numbers.includes(random as number));
 * ```
 */
export function sample<T>(array: readonly T[]): T | undefined {
  const length = array.length;
  return length ? array[randomInteger(0, length - 1)] : undefined;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns a new array, containing all elements in the given array transformed using the given transformer, except the ones
 * that were transformed to `null` or `undefined`
 *
 * Example:
 *
 * ```ts
 * import { mapNotNullish } from "https://deno.land/std@$STD_VERSION/collections/map_not_nullish.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const people = [
 *     { middleName: null },
 *     { middleName: 'William' },
 *     { middleName: undefined },
 *     { middleName: 'Martha' },
 * ]
 * const foundMiddleNames = mapNotNullish(people, it => it.middleName)
 *
 * assertEquals(foundMiddleNames, [ 'William', 'Martha' ])
 * ```
 */
export function mapNotNullish<T, O>(
  array: readonly T[],
  transformer: (el: T) => O,
): NonNullable<O>[] {
  const ret: NonNullable<O>[] = [];

  for (const element of array) {
    const transformedElement = transformer(element);

    if (transformedElement !== undefined && transformedElement !== null) {
      ret.push(transformedElement as NonNullable<O>);
    }
  }

  return ret;
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
 * @example ```ts
 * import { partition } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns a tuple of two arrays with the first one containing all elements in the given array that match the given predicate
 * and the second one containing all that do not
 *
 * Example:
 *
 * ```ts
 * import { partitionBy } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const numbers = [ 5, 6, 7, 8, 9 ]
 * const [ even, odd ] = partitionBy(numbers, it => it % 2 == 0)
 *
 * assertEquals(even, [ 6, 8 ])
 * assertEquals(odd, [ 5, 7, 9 ])
 * ```
 */
export function partitionBy<T>(
  array: readonly T[],
  predicate: (el: T) => boolean,
): [T[], T[]] {
  const matches: Array<T> = [];
  const rest: Array<T> = [];

  for (const element of array) {
    if (predicate(element)) {
      matches.push(element);
    } else {
      rest.push(element);
    }
  }

  return [matches, rest];
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
 * Get last item of the array.
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
 * import { range } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { move } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { clampArrayRange } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { clampArrayTo } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { clampArrayFrom } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
export type DeeperMerge<F, S> = MergeInsertions<
  {
    [K in keyof F | keyof S]: K extends keyof S & keyof F
      ? DeeperMerge<F[K], S[K]>
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
 * @example ```ts
 * objectMap({ a: 1, b: 2 }, (k, v) => [k.toString().toUpperCase(), v.toString()])
 * // { A: '1', B: '2' }
 * ```
 *
 * Swap key/value:
 * @example ```ts
 * objectMap({ a: 1, b: 2 }, (k, v) => [v, k])
 * // { 1: 'a', 2: 'b' }
 * ```
 *
 * Filter keys:
 * @example ```ts
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
 * @category Collection
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
 * @category Collection
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Strict typed `Object.entries`
 *
 * @category Collection
 */
export function objectEntries<T extends Record<string, any>>(
  obj: T,
): Array<[string, any]> {
  return Object.entries<T[keyof T]>(obj);
}

/**
 * Create a new subset object by giving keys
 *
 * @category Collection
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
export function deeperMerge<T extends Record<string, any>, S = keyof T>(
  target: T,
  ...sources: S[]
): DeeperMerge<T, S> {
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
        deeperMerge(target[key], source[key]);
      } else {
        // @ts-expect-error
        target[key] = source[key];
      }
    });
  }

  return deeperMerge(target, ...sources);
}

function isMergableObject(item: any): item is Object {
  return is.object(item) && !is.array(item);
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
 * Copy the values of all of the enumerable own properties from one or more
 * source objects to a target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source The first source object from which to copy properties.
 */
export function assign<T extends {}, U>(
  target: T,
  source: U,
): asserts target is T & U;

/**
 * Copy the values of all of the enumerable own properties from one or more
 * source objects to a target object. Returns the target object.
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
 * Copy the values of all of the enumerable own properties from one or more
 * source objects to a target object. Returns the target object.
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
 * Copy the values of all of the enumerable own properties from one or more
 * source objects to a target object. Returns the target object.
 * @param target The target object to copy to.
 * @param sources One or more source objects from which to copy properties
 */
export function assign<T extends {}, V>(target: T, ...sources: V[]): any {
  return Object.assign(target, ...(sources ?? []));
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
 * import { filterKeys } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { filterValues } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
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
 * Returns a new record with all entries of the given record except the ones
 * that do not match the given predicate.
 * @category Collection
 * @example ```ts
 * import { filterEntries } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { mapKeys } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
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
 * } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { mapEntries } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
export function mapEntries<T, O>(
  record: Readonly<Record<string, T>>,
  transformer: (entry: [string, T]) => [string, O],
): Record<string, O> {
  const ret: Record<string, O> = {};
  const entries = Object.entries(record);

  for (const entry of entries) {
    const [mappedKey, mappedValue] = transformer(entry);

    ret[mappedKey] = mappedValue;
  }

  return ret;
}

/**
 * Removes any nullish or empty values from a given record.
 * @param obj The record to filter.
 * @returns A new record containing only the non-nullish and non-empty values.
 * @category Collection
 * @example ```ts
 * import { removeEmptyValues } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { diff } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { chunk } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/x/911@0.1.4/src/asserts.ts";
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
 * import { associateBy } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { associateWith } from "https://deno.land/x/911@0.1.4/src/collection.ts";
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
 * import { union } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
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
 * import { intersect } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
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
 * import { filterInPlace } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
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
 * import { pick } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 *
 * const obj1 = { a: 1, b: 4, c: 8 };
 * const obj2 = pick(obj1, ["a", "c"]);
 * // { a: 1, c: 8 }
 * ```
 */
export function pick<
  T extends object,
  K extends (keyof T & string),
>(o: T, keys: K[]): Record<K, T[K]> {
  keys = keys.map((key) => (key as string).toLowerCase().trim() as K);
  return filterEntries<any>(
    Object.assign({} as T, is.object(o) ? o : {} as T),
    ([k, _v]: [string, T[K]]) => (keys as string[]).includes(k),
  ) as Record<K, T[K]>;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns the first element having the smallest value according to the provided comparator or undefined if there are no elements
 *
 * @example ```ts
 * import { minWith } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
 *
 * const people = ["Kim", "Anna", "John"];
 * const smallestName = minWith(people, (a, b) => a.length - b.length);
 *
 * assertEquals(smallestName, "Kim");
 * ```
 */
export function minWith<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T | undefined {
  let min: T | undefined = undefined;
  let isFirst = true;

  for (const current of array) {
    if (isFirst || comparator(current, <T> min) < 0) {
      min = current;
      isFirst = false;
    }
  }

  return min;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the first element that is the smallest value of the given function or undefined if there are no elements.
 *
 * @example ```ts
 * import { minBy } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts"
 *
 * const people = [
 *     { name: 'Anna', age: 34 },
 *     { name: 'Kim', age: 42 },
 *     { name: 'John', age: 23 },
 * ];
 *
 * const personWithMinAge = minBy(people, i => i.age);
 *
 * assertEquals(personWithMinAge, { name: 'John', age: 23 });
 * ```
 */
export function minBy<T>(
  array: readonly T[],
  selector: (el: T) => number,
): T | undefined;
export function minBy<T>(
  array: readonly T[],
  selector: (el: T) => string,
): T | undefined;
export function minBy<T>(
  array: readonly T[],
  selector: (el: T) => bigint,
): T | undefined;
export function minBy<T>(
  array: readonly T[],
  selector: (el: T) => Date,
): T | undefined;
export function minBy<T>(
  array: readonly T[],
  selector:
    | ((el: T) => number)
    | ((el: T) => string)
    | ((el: T) => bigint)
    | ((el: T) => Date),
): T | undefined {
  let min: T | undefined = undefined;
  let minValue: ReturnType<typeof selector> | undefined = undefined;

  for (const current of array) {
    const currentValue = selector(current);

    if (minValue === undefined || currentValue < minValue) {
      min = current;
      minValue = currentValue;
    }
  }

  return min;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Applies the given selector to all elements of the given collection and
 * returns the min value of all elements. If an empty array is provided the
 * function will return undefined
 *
 * @example ```ts
 * import { minOf } from "https://deno.land/std@0.152.0/collections/min_of.ts"
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts"
 *
 * const inventory = [
 *      { name: "mustard", count: 2 },
 *      { name: "soy", count: 4 },
 *      { name: "tomato", count: 32 },
 * ];
 * const minCount = minOf(inventory, (i) => i.count);
 *
 * assertEquals(minCount, 2);
 * ```
 */
export function minOf<T>(
  array: readonly T[],
  selector: (el: T) => number,
): number | undefined;

export function minOf<T>(
  array: readonly T[],
  selector: (el: T) => bigint,
): bigint | undefined;

export function minOf<T, S extends ((el: T) => number) | ((el: T) => bigint)>(
  array: readonly T[],
  selector: S,
): ReturnType<S> | undefined {
  let minimumValue: ReturnType<S> | undefined = undefined;

  for (const i of array) {
    const currentValue = selector(i) as ReturnType<S>;

    if (minimumValue === undefined || currentValue < minimumValue) {
      minimumValue = currentValue;
      continue;
    }

    if (Number.isNaN(currentValue)) {
      return currentValue;
    }
  }

  return minimumValue;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Returns the first element having the largest value according to the provided
 * comparator or undefined if there are no elements.
 *
 * The comparator is expected to work exactly like one passed to `Array.sort`, which means
 * that `comparator(a, b)` should return a negative number if `a < b`, a positive number if `a > b`
 * and `0` if `a == b`.
 *
 * @example ```ts
 * import { maxWith } from "https://deno.land/std@0.152.0/collections/max_with.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
 *
 * const people = ["Kim", "Anna", "John", "Arthur"];
 * const largestName = maxWith(people, (a, b) => a.length - b.length);
 *
 * assertEquals(largestName, "Arthur");
 * ```
 */
export function maxWith<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T | undefined {
  let max: T | undefined = undefined;
  let isFirst = true;

  for (const current of array) {
    if (isFirst || comparator(current, <T> max) > 0) {
      max = current;
      isFirst = false;
    }
  }

  return max;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Applies the given selector to all elements of the given collection and
 * returns the max value of all elements. If an empty array is provided the
 * function will return undefined
 *
 * @example ```ts
 * import { maxOf } from "https://deno.land/std@0.152.0/collections/max_of.ts"
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts"
 *
 * const inventory = [
 *      { name: "mustard", count: 2 },
 *      { name: "soy", count: 4 },
 *      { name: "tomato", count: 32 },
 * ];
 * const maxCount = maxOf(inventory, (i) => i.count);
 *
 * assertEquals(maxCount, 32);
 * ```
 */
export function maxOf<T>(
  array: readonly T[],
  selector: (el: T) => number,
): number | undefined;

export function maxOf<T>(
  array: readonly T[],
  selector: (el: T) => bigint,
): bigint | undefined;

export function maxOf<T, S extends ((el: T) => number) | ((el: T) => bigint)>(
  array: readonly T[],
  selector: S,
): ReturnType<S> | undefined {
  let maximumValue: ReturnType<S> | undefined = undefined;

  for (const i of array) {
    const currentValue = selector(i) as ReturnType<S>;
    if (maximumValue === undefined || currentValue > maximumValue) {
      maximumValue = currentValue;
      continue;
    }
    if (Number.isNaN(currentValue)) {
      return currentValue;
    }
  }

  return maximumValue;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns the first element that is the largest value of the given function or
 * undefined if there are no elements.
 *
 * @example ```ts
 * import { maxBy } from "https://deno.land/std@0.152.0/collections/max_by.ts";
 * import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
 *
 * const people = [
 *     { name: 'Anna', age: 34 },
 *     { name: 'Kim', age: 42 },
 *     { name: 'John', age: 23 },
 * ];
 *
 * const personWithMaxAge = maxBy(people, i => i.age);
 *
 * assertEquals(personWithMaxAge, { name: 'Kim', age: 42 });
 * ```
 */
export function maxBy<T>(
  array: readonly T[],
  selector: (el: T) => number,
): T | undefined;
export function maxBy<T>(
  array: readonly T[],
  selector: (el: T) => string,
): T | undefined;
export function maxBy<T>(
  array: readonly T[],
  selector: (el: T) => bigint,
): T | undefined;
export function maxBy<T>(
  array: readonly T[],
  selector: (el: T) => Date,
): T | undefined;
export function maxBy<T>(
  array: readonly T[],
  selector:
    | ((el: T) => number)
    | ((el: T) => string)
    | ((el: T) => bigint)
    | ((el: T) => Date),
): T | undefined {
  let max: T | undefined = undefined;
  let maxValue: ReturnType<typeof selector> | undefined = undefined;

  for (const current of array) {
    const currentValue = selector(current);
    if (maxValue === undefined || currentValue > maxValue) {
      max = current;
      maxValue = currentValue;
    }
  }
  return max;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns all distinct elements in the given array, preserving order by first occurrence
 *
 * Example:
 *
 * ```ts
 * import { distinct } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const numbers = [ 3, 2, 5, 2, 5 ]
 * const distinctNumbers = distinct(numbers)
 *
 * assertEquals(distinctNumbers, [ 3, 2, 5 ])
 * ```
 */
export function distinct<T>(array: readonly T[]): T[] {
  const set = new Set(array);

  return Array.from(set);
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Returns all elements in the given array that produce a distinct value using the given selector, preserving order by first occurrence
 *
 * Example:
 *
 * ```ts
 * import { distinctBy } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const names = [ 'Anna', 'Kim', 'Arnold', 'Kate' ]
 * const exampleNamesByFirstLetter = distinctBy(names, it => it.charAt(0))
 *
 * assertEquals(exampleNamesByFirstLetter, [ 'Anna', 'Kim' ])
 * ```
 */
export function distinctBy<T, D>(
  array: readonly T[],
  selector: (el: T) => D,
): T[] {
  const selectedValues = new Set<D>();
  const ret: T[] = [];

  for (const element of array) {
    const currentSelectedValue = selector(element);

    if (!selectedValues.has(currentSelectedValue)) {
      selectedValues.add(currentSelectedValue);
      ret.push(element);
    }
  }

  return ret;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Applies the given aggregator to each group in the given Grouping, returning the results together with the respective group keys
 *
 * ```ts
 * import { aggregateGroups } from "https://deno.land/x/911@0.1.4/src/collection.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const foodProperties = {
 *     'Curry': [ 'spicy', 'vegan' ],
 *     'Omelette': [ 'creamy', 'vegetarian' ],
 * }
 * const descriptions = aggregateGroups(foodProperties,
 *     (current, key, first, acc) => {
 *         if (first)
 *             return `${key} is ${current}`
 *
 *         return `${acc} and ${current}`
 *     },
 * )
 *
 * assertEquals(descriptions, {
 *     'Curry': 'Curry is spicy and vegan',
 *     'Omelette': 'Omelette is creamy and vegetarian',
 * })
 * ```
 */
export function aggregateGroups<T, A>(
  record: Readonly<Record<string, Array<T>>>,
  aggregator: (current: T, key: string, first: boolean, accumulator?: A) => A,
): Record<string, A> {
  return mapEntries(
    record,
    ([key, values]: [string, T[]]) => [
      key,
      // Need the type assertions here because the reduce type does not support the type transition we need
      values.reduce(
        (accumulator, current, currentIndex) =>
          aggregator(current, key, currentIndex === 0, accumulator),
        undefined as A | undefined,
      ) as A,
    ],
  );
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * How does recursive typing work?
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
 *    MergeAllSets<{foo: Set<number>}, {foo: Set<string>}>
 *      // `SetValueType` will extract "number" for T
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

/**
 * Merges the two given Records, recursively merging any nested Records with
 * the second collection overriding the first in case of conflict
 *
 * For arrays, maps and sets, a merging strategy can be specified to either
 * "replace" values, or "merge" them instead.
 * Use "includeNonEnumerable" option to include non enumerable properties too.
 *
 * Example:
 *
 * ```ts
 * import { deepMerge } from "https://deno.land/std@$STD_VERSION/collections/deep_merge.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const a = {foo: true}
 * const b = {foo: {bar: true}}
 *
 * assertEquals(deepMerge(a, b), {foo: {bar: true}});
 * ```
 */
export function deepMerge<
  T extends Record<PropertyKey, unknown>,
>(
  record: Partial<Readonly<T>>,
  other: Partial<Readonly<T>>,
  options?: Readonly<DeepMergeOptions>,
): T;

export function deepMerge<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  Options extends DeepMergeOptions,
>(
  record: Readonly<T>,
  other: Readonly<U>,
  options?: Readonly<Options>,
): DeepMerge<T, U, Options>;

export function deepMerge<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  Options extends DeepMergeOptions = {
    arrays: "merge";
    sets: "merge";
    maps: "merge";
  },
>(
  record: Readonly<T>,
  other: Readonly<U>,
  options?: Readonly<Options>,
): DeepMerge<T, U, Options> {
  return deepMergeInternal(record, other, new Set(), options);
}

function deepMergeInternal<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>,
  Options extends DeepMergeOptions = {
    arrays: "merge";
    sets: "merge";
    maps: "merge";
  },
>(
  record: Readonly<T>,
  other: Readonly<U>,
  seen: Set<NonNullable<object>>,
  options?: Readonly<Options>,
) {
  // Extract options
  // Clone left operand to avoid performing mutations in-place
  type Result = DeepMerge<T, U, Options>;
  const result: Partial<Result> = {};

  const keys = new Set([
    ...getKeys(record),
    ...getKeys(other),
  ]) as Set<keyof Result>;

  // Iterate through each key of other object and use correct merging strategy
  for (const key of keys) {
    // Skip to prevent Object.prototype.__proto__ accessor property calls on non-Deno platforms
    if (key === "__proto__") {
      continue;
    }

    type ResultMember = Result[typeof key];

    const a = record[key] as ResultMember;

    if (!hasOwn(other, key)) {
      result[key] = a;

      continue;
    }

    const b = other[key] as ResultMember;

    if (
      isNonNullObject(a) && isNonNullObject(b) && !seen.has(a) && !seen.has(b)
    ) {
      seen.add(a);
      seen.add(b);
      result[key] = mergeObjects(a, b, seen, options) as ResultMember;

      continue;
    }

    // Override value
    result[key] = b;
  }

  return result as Result;
}

function mergeObjects(
  left: Readonly<NonNullable<object>>,
  right: Readonly<NonNullable<object>>,
  seen: Set<NonNullable<object>>,
  options: Readonly<DeepMergeOptions> = {
    arrays: "merge",
    sets: "merge",
    maps: "merge",
  },
): Readonly<NonNullable<object>> {
  // Recursively merge mergeable objects
  if (isMergeable(left) && isMergeable(right)) {
    return deepMergeInternal(left, right, seen);
  }

  if (isIterable(left) && isIterable(right)) {
    // Handle arrays
    if ((Array.isArray(left)) && (Array.isArray(right))) {
      if (options.arrays === "merge") {
        return left.concat(right);
      }

      return right;
    }

    // Handle maps
    if ((left instanceof Map) && (right instanceof Map)) {
      if (options.maps === "merge") {
        return new Map([
          ...left,
          ...right,
        ]);
      }

      return right;
    }

    // Handle sets
    if ((left instanceof Set) && (right instanceof Set)) {
      if (options.sets === "merge") {
        return new Set([
          ...left,
          ...right,
        ]);
      }

      return right;
    }
  }

  return right;
}

/**
 * Test whether a value is mergeable or not
 * Builtins that look like objects, null and user defined classes
 * are not considered mergeable (it means that reference will be copied)
 */
function isMergeable(
  value: NonNullable<object>,
): value is Record<PropertyKey, unknown> {
  return Object.getPrototypeOf(value) === Object.prototype;
}

function isIterable(
  value: NonNullable<object>,
): value is Iterable<unknown> {
  return typeof (value as Iterable<unknown>)[Symbol.iterator] === "function";
}

function isNonNullObject(value: unknown): value is NonNullable<object> {
  return value !== null && typeof value === "object";
}

function getKeys<T extends object>(record: T): Array<keyof T> {
  const ret = Object.getOwnPropertySymbols(record) as Array<keyof T>;
  filterInPlace(
    ret,
    (key) => Object.prototype.propertyIsEnumerable.call(record, key),
  );
  ret.push(...(Object.keys(record) as Array<keyof T>));

  return ret;
}

/** Merging strategy */
export type MergingStrategy = "replace" | "merge";

/** Deep merge options */
export type DeepMergeOptions = {
  /** Merging strategy for arrays */
  arrays?: MergingStrategy;
  /** Merging strategy for Maps */
  maps?: MergingStrategy;
  /** Merging strategy for Sets */
  sets?: MergingStrategy;
};

/** Merge deeply two objects */
export type DeepMerge<
  T,
  U,
  Options = Record<string, MergingStrategy>,
> =
  // Handle objects
  [T, U] extends [Record<PropertyKey, unknown>, Record<PropertyKey, unknown>]
    ? Merge<T, U, Options>
    : // Handle primitives
    T | U;

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Builds two separate arrays from the given array of 2-tuples, with the first returned array holding all first
 * tuple elements and the second one holding all the second elements
 *
 * Example:
 *
 * ```ts
 * import { unzip } from "https://deno.land/std@$STD_VERSION/collections/unzip.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const parents = [
 *     [ 'Maria', 'Jeff' ],
 *     [ 'Anna', 'Kim' ],
 *     [ 'John', 'Leroy' ],
 * ] as [string, string][];
 *
 * const [ moms, dads ] = unzip(parents);
 *
 * assertEquals(moms, [ 'Maria', 'Anna', 'John' ]);
 * assertEquals(dads, [ 'Jeff', 'Kim', 'Leroy' ]);
 * ```
 */
export function unzip<T, U>(pairs: readonly [T, U][]): [T[], U[]] {
  const { length } = pairs;
  const ret: [T[], U[]] = [
    Array.from({ length }),
    Array.from({ length }),
  ];

  pairs.forEach(([first, second], index) => {
    ret[0][index] = first;
    ret[1][index] = second;
  });

  return ret;
}

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Builds N-tuples of elements from the given N arrays with matching indices, stopping when the smallest array's end is reached
 * Example:
 *
 * ```ts
 * import { zip } from "https://deno.land/std@$STD_VERSION/collections/zip.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const numbers = [ 1, 2, 3, 4 ];
 * const letters = [ 'a', 'b', 'c', 'd' ];
 * const pairs = zip(numbers, letters);
 *
 * assertEquals(pairs, [
 *     [ 1, 'a' ],
 *     [ 2, 'b' ],
 *     [ 3, 'c' ],
 *     [ 4, 'd' ],
 * ]);
 * ```
 */

export function zip<T extends unknown[]>(
  ...arrays: { [K in keyof T]: T[K][] }
): T[] {
  let minLength = minOf(arrays, (it) => it.length);
  if (minLength === undefined) minLength = 0;

  const ret: T[] = new Array(minLength);

  for (let i = 0; i < minLength; i += 1) {
    const arr = arrays.map((it) => it[i]);
    ret[i] = arr as T;
  }

  return ret;
}

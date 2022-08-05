export * from "./serialize_map.ts";
export * from "./serialize_set.ts";

// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
export * from "std/collections/aggregate_groups.ts";
export * from "std/collections/deep_merge.ts";
export * from "std/collections/distinct.ts";
export * from "std/collections/distinct_by.ts";
export * from "std/collections/filter_entries.ts";
export * from "std/collections/filter_values.ts";
export * from "std/collections/filter_keys.ts";
export * from "std/collections/map_entries.ts";
export * from "std/collections/map_keys.ts";
export * from "std/collections/map_not_nullish.ts";
export * from "std/collections/map_values.ts";
export * from "std/collections/max_by.ts";
export * from "std/collections/max_of.ts";
export * from "std/collections/max_with.ts";
export * from "std/collections/min_by.ts";
export * from "std/collections/min_of.ts";
export * from "std/collections/min_with.ts";
export * from "std/collections/partition.ts";
export * from "std/collections/sample.ts";
export * from "std/collections/unzip.ts";
export * from "std/collections/zip.ts";

/**
 * Splits the given array into chunks of the given size and returns them
 *
 * Example:
 *
 * ```ts
 * import { chunk } from "https://deno.land/x/911/collection.ts";
 * import { assertEquals } from "https://deno.land/x/911/asserts.ts";
 *
 * const words = [ 'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consetetur', 'sadipscing' ];
 * const chunks = chunk(words, 3);
 *
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
 * Transforms the given array into a Record, extracting the key of each element using the given selector.
 * If the selector produces the same key for multiple elements, the latest one will be used (overriding the
 * ones before it).
 *
 * Example:
 *
 * ```ts
 * import { associateBy } from "https://deno.land/x/911/objects.ts"
 * import { assertEquals } from "https://deno.land/x/911/testing.ts";
 *
 * const users = [
 *     { id: 'a2e', userName: 'Anna' },
 *     { id: '5f8', userName: 'Arnold' },
 *     { id: 'd2c', userName: 'Kim' },
 * ]
 *
 * const usersById = associateBy(users, it => it.id)
 * assertEquals(usersById, {
 *     'a2e': { id: 'a2e', userName: 'Anna' },
 *     '5f8': { id: '5f8', userName: 'Arnold' },
 *     'd2c': { id: 'd2c', userName: 'Kim' },
 * })
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
 * Builds a new Record using the given array as keys and choosing a value for each
 * key using the given selector. If any of two pairs would have the same value
 * the latest on will be used (overriding the ones before it).
 *
 * Example:
 *
 * ```ts
 * import { associateWith } from "https://deno.land/std@$STD_VERSION/collections/associate_with.ts"
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * const names = [ 'Kim', 'Lara', 'Jonathan' ]
 * const namesToLength = associateWith(names, it => it.length)
 *
 * assertEquals(namesToLength, {
 *   'Kim': 3,
 *   'Lara': 4,
 *   'Jonathan': 8,
 * })
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
 *
 * @param array collection of objects to sort
 * @param key property
 * @returns a copy of the source array, with sorted values
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
 * Example:
 *
 * ```ts
 * import { union } from "https://deno.land/std@$STD_VERSION/collections/union.ts";
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
 * Example:
 *
 * ```ts
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
 * Filters the given array, removing all elements that do not match the given predicate
 * **in place. This means `array` will be modified!**.
 */
export function filterInPlace<T>(
  array: Array<T>,
  predicate: (el: T) => boolean,
): Array<T> {
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
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source The first source object from which to copy properties.
 */
export function assign<T extends {}, U>(target: T, source: U): asserts target is T & U

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param source1 The first source object from which to copy properties.
 * @param source2 The second source object from which to copy properties.
 */
export function assign<T extends {}, U, V>(target: T, source1: U, source2: V): asserts target is T & U & V
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
): asserts target is T & U & V & W

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 * @param target The target object to copy to.
 * @param sources One or more source objects from which to copy properties
 */
export function assign<T extends {}, U>(
  target: T,
  ...sources: U[]
): asserts target is T & keyof typeof sources

export function assign(target: object, ...sources: any[]) {
  if (sources != null)
    Object.assign(target, ...sources)
}

/**
 * Construct a new object containing only the given keys of another object.
 * @param o the original object to inherit from
 * @param keys the list of properties to copy to the new object
 * @returns a new object
 *
 * @example ```ts
 * const obj1 = { a: 1, b: 4, c: 8 };
 * const obj2 = pick(obj1, ["a", "c"]);
 * // { a: 1, c: 8 }
 * ```
 */
export function pick<
  T extends any,
  K extends (keyof T & string)
>(o: T, keys: K[]): Record<K, T[K]> {
  keys = keys.map(key => lowerCase((k as string)).trim() as K);
  return filterEntries<any>(
    Object.assign<T>({} as T, (isObject(o) ? o : {} as T)),
    ([k, v]: [K, T[K]]) => (keys as string[]).includes(k),
  ) as Record<K, T[K]>
}

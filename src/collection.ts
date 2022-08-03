/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference no-default-lib="true" />

import {
  chunk,
  deepMerge,
  mapEntries,
  mapKeys,
  mapNotNullish,
  mapValues,
} from "../deps.ts";

/**
 * Groups an array of objects into a new object, with properties
 * that are determined by the value returned by `callbackfn`.
 * @param array Array of objects to be organized into groups
 * @param callbackfn Function that is used to determine group names
 * @returns new object with groups for property names
 */
function groupBy<U extends any, K extends keyof U>(
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

/**
 * Sort an array by a given property key.
 */
function sortBy<T extends Array<Record<string, any>>, U = T[number]>(
  key: keyof U,
): (...args: [U, U]) => number {
  return (a, b) => (a[key] as any).localeCompare(b[key]);
}

export {
  chunk,
  deepMerge,
  groupBy,
  mapEntries,
  mapKeys,
  mapNotNullish,
  mapValues,
  sortBy,
};

export default {
  groupBy,
  sortBy,
  chunk,
  deepMerge,
  mapEntries,
  mapKeys,
  mapNotNullish,
  mapValues,
};

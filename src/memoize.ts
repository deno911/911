export interface MemoizeOptions<A extends unknown[], R> {
  /**
   * Provides a single value to use as the Key for the memoization.
   * Defaults to `JSON.stringify` (ish).
   */
  hash?: (...args: A) => unknown;

  /**
   * The Cache implementation to provide. Must be a Map or Map-alike.
   * Defaults to a Map. Useful for replacing the cache with an LRU cache or similar.
   */
  cache?: Map<unknown, R>;
}

export type MemoizableFn<
  A extends unknown[],
  R extends any,
  T extends unknown,
> = (this: T, ...args: A) => R;

export const defaultOptions = {
  cache: new Map(),
  hash(...args: any[]) {
    /**
     * JSON.stringify excludes `undefined` and function values by default.
     * We do not want that.
     */
    return JSON.stringify(
      args,
      (_: unknown, v: unknown) => (typeof v === "object" ? v : String(v)),
    );
  },
};

/**
 * Memoizes a potentially expensive function, caching the results of previous calls.
 *
 * @param fn The function to memoize.
 * @param opts The options to use for memoization.
 * @returns A memoized version of the function.
 * @example ```ts
 * import { memoize } from "https://deno.land/x/911@0.1.0/src/memoize.ts";
 *
 * const fn = (a: number, b: number) => a + b;
 * const memoized = memoize(fn);
 *
 * memoized(1, 2); // => 3
 * memoized(1, 2); // => 3
 * ```
 * @example ```ts
 * import { memoize } from "https://deno.land/x/911@0.1.0/src/memoize.ts";
 *
 * const fn = memoize(function doExpensiveStuff() {
 *   // Here's where you do expensive stuff!
 * });
 *
 * const other = memoize(function doExpensiveStuff() {}, {
 *   cache: new Map(), // pass your own cache implementation
 *   hash: JSON.stringify // pass your own hashing implementation
 * });
 *
 * fn(); // => expensive stuff
 * other(); // => expensive stuff
 * ```
 */
export function memoize<
  A extends unknown[],
  R extends unknown,
  T extends unknown,
>(
  fn: MemoizableFn<A, R, T>,
  opts: MemoizeOptions<A, R> = defaultOptions,
): MemoizableFn<A, R, T> {
  opts = Object.assign({}, defaultOptions, opts);
  const { hash, cache } = opts;

  return function (this: T, ...args: A) {
    const id = hash.apply(this, args);
    if (cache.has(id)) {
      return cache.get(id);
    }
    let result = fn.apply(this, args);
    if (result instanceof Promise) {
      result = result.catch((error: any) => {
        cache.delete(id);
        throw error;
      }) as R;
    }
    cache.set(id, result);
    return result;
  };
}

type MemoizeDecoratorFactory<A extends unknown[], R, T> = (
  target: T,
  key: PropertyKey,
  descriptor: Omit<PropertyDescriptor, "value"> & {
    value: MemoizableFn<A, R, T>;
  },
) => void;

/**
 * TypeScript Decorator to memoize a function. Accepts same options as memoize.
 * @param options Define your own cache or hash function (both optional).
 * @returns
 * @example ```ts
 * import { memoized } from "https://deno.land/x/911@0.1.0/src/memoize.ts";
 *
 * const cache = new Map();
 * class MyClass {
 *   // The quotes are to stop JSDoc from breaking on the "@".
 *   // You should not use quotes in your actual code.
 *   "@memoized"({ cache })
 *   public myMethod() {
 *     return Promise.resolve(1);
 *   }
 * }
 * ```
 */
export function memoized<A extends unknown[], R, T>(
  options: MemoizeOptions<A, R> = {},
): MemoizeDecoratorFactory<A, R, T> {
  return (
    target: T,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
  ): void => {
    descriptor.value = memoize(
      descriptor.value as MemoizableFn<A, R, T>,
      options,
    );
    Object.defineProperty(target, key, descriptor);
  };
}

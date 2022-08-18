import { type Cache, inMemoryCache } from "../deps.ts";

const cache: { [k: PropertyKey]: Cache } = {};

const CACHE_CAPACITY_DEFAULT = 20;

const globalCacheKey = Symbol.for("deno911");

/**
 * Create a new cache instance with an optional `id` and `capacity`.
 *
 * @param capacity The maximum number of items to store in the cache.
 * @param id The id of the cache instance.
 * @returns
 */
export function createCache(
  capacity = CACHE_CAPACITY_DEFAULT,
  id: PropertyKey = globalCacheKey,
): Cache {
  cache[id] ??= inMemoryCache(capacity);
  return cache[id];
}

/**
 * Set the maximum size of each cache entry in bytes. Defaults to 10MB.
 */
export const CACHE_MAX_SIZE = (1024 * 1024) * 10;

/**
 * Global cache storage, used by the http handlers in the `http.ts` submodule.
 */
export const globalCache = createCache(CACHE_CAPACITY_DEFAULT, globalCacheKey);

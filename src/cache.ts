import { inMemoryCache } from "http-cache";

const cache = {};

export * from "http-cache";

const CACHE_CAPACITY = 20;

const globalCacheKey = Symbol.for("deno911");

export function createCache(capacity = CACHE_CAPACITY, id = globalCacheKey) {
  cache[id] ??= inMemoryCache(capacity);
  return cache[id];
}

export const globalCache = createCache();

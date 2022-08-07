import { type Cache, inMemoryCache } from "http-cache";
export * from "http-cache";

const cache: { [k: symbol]: Cache } = {};
const CACHE_CAPACITY = 20;
const globalCacheKey = Symbol.for("deno911");

export function createCache(capacity = CACHE_CAPACITY, id = globalCacheKey) {
  cache[id] ??= inMemoryCache(capacity);
  return cache[id];
}

export const globalCache = createCache();

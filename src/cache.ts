import { inMemoryCache } from "http-cache";

import { CACHE_CAPACITY } from "./constants.ts";

export { globalCache, inMemoryCache };

const globalCache = inMemoryCache(CACHE_CAPACITY);

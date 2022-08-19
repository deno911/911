# deno911

Opinionated collection of utilities and helpers, assembled with Deno in mind.

```ts
import * as _ from "https://deno.land/x/911@0.1.3/mod.ts";
```

```tree
├── deps.ts
├── mod.ts
├── src/
|  ├── cache.ts
|  ├── collection.ts
|  ├── date.ts
|  ├── fmt.ts
|  ├── hash.ts
|  ├── http.ts
|  ├── json.ts
|  ├── log.ts
|  ├── math.ts
|  ├── memoize.ts
|  ├── params.ts
|  ├── promises.ts
|  ├── serialize_map.ts
|  ├── serialize_set.ts
|  ├── state.ts
|  ├── throttle.ts
|  └── type.ts
├── tests/
|  ├── date_test.ts
|  ├── memoize_test.ts
|  ├── params_test.ts
|  ├── promises_test.ts
|  ├── serialize_map_test.ts
|  ├── serialize_set_test.ts
|  └── throttle_test.ts
└── types.d.ts
```

## Submodules

---

### cache.ts

> See the [Deno Documentation][docs-cache] for this file.

#### Constants

```ts
const globalCache: Cache;
```

#### Methods

```ts
function createCache(capacity: number, cacheKey: string): Cache;
```

---

### collection.ts

> See the [Deno Documentation][docs-collection] for this file.

#### Types

```ts
type SortKeyFn<T> = (keyof T) | ((el: T) => T[keyof T]);
```

```ts
type SortCompareFn<T> = (...args: [T, T]) => number;
```

#### Methods: Arrays

```ts
function toArray(array?: Nullable<Arrayable<T>>): Array<T>;
```

```ts
function flattenArrayable(array?: Nullable<Arrayable<T | Array<T>>>): T[];
```

```ts
function mergeArrayable(...args: Nullable<Arrayable<T>>[]): Array<T>;
```

```ts
function partition(array: readonly T[], ...filters: PartitionFilter<T>[]);
```

```ts
function uniq(array: readonly T[]): T[];
```

```ts
function last(array: readonly T[]): T;
```

```ts
function at(array: readonly T[], index: number): T;
```

```ts
function remove(array: T[], value: T): T[];
```

```ts
function range(start: number, stop: number, step?: number): number[];
```

```ts
function move(arr: T[], from: number, to: number): T[];
```

```ts
function clampArrayRange(n: number, arr: readonly unknown[]);
```

```ts
function shuffle(array: T[]): T[];
```

#### Methods: Objects and Records

```ts
function hasOwnProperty(obj: T, v: PropertyKey): boolean;
```

```ts
function assign<T extends {}, U, V extends any[] = U[]>(
  target: T,
  ...sources: V[]
): asserts target is T & V[any];
```

```ts
function isKeyOf<T extends object>(obj: T, k: keyof any): k is keyof T;
```

```ts
function objectKeys<T extends object>(obj: T): (keyof T)[];
```

```ts
function objectValues<T extends any>(obj: Record<string, T>): T[];
```

```ts
function objectEntries<T extends object>(obj: T): [string, any][];
```

```ts
function pick<
  T extends any,
  K extends (keyof T & string),
>(o: T, keys: K[]): Record<K, T[K]>;
```

#### Methods: Filters

```ts
function filterKeys(
  record: Readonly<Record<string, T>>,
  predicate: (key: string) => boolean,
): Record<string, T>;
```

```ts
function filterValues(
  record: Readonly<Record<string, T>>,
  predicate: (value: T) => boolean,
): Record<string, T>;
```

```ts
function filterEntries(
  record: Readonly<Record<string, T>>,
  predicate: (entry: [string, T]) => boolean,
): Record<string, T>;
```

```ts
function removeEmptyValues<T extends object>(obj: T): T;
```

#### Methods: Mappers

```ts
function mapKeys(
  record: Readonly<Record<string, T>>,
  transformer: (key: string) => string,
): Record<string, T>;
```

```ts
function mapValues(
  record: Readonly<Record<string, T>>,
  transformer: (value: T) => O,
): Record<string, O>;
```

```ts
function mapEntries<
  TK extends string,
  TV extends any,
  OK extends string = TK,
  OV extends any = TV,
>(
  record: Record<TK, TV>,
  mapFn: (entry: [keyof TK, TV]) => [keyof OK, OV],
): Record<OK, OV>;
```

```ts
function objectMap<V, NV extends V, K extends string>(
  obj: Record<K, V>,
  fn:
    | ((value: V, key?: K) => Maybe<[K, V]>)
    | (([key, value]: [K, V]) => Maybe<[K, V]>),
): Record<K, V>;
```

#### Methods: Sorting

```ts
function sortBy<T extends Record<string, any>>(
  array: T[],
  key: SortKeyFn<T>,
): T[];
```

```ts
function sortInPlace<T extends Record<string, any>>(
  array: T[],
  key: SortKeyFn<T>,
): T[];
```

```ts
function sortFactory<T extends Record<string, any>>(
  key: SortKeyFn<T>,
): SortCompareFn<T> {
  return function (a, b) {
    const fn: SortKeyFn<T> = (el) => (
      typeof key === "function" ? key(el) : el[key]
    );
    return (fn.call(fn, a)).localeCompare(fn.call(fn, b));
  };
}
```

---

### date.ts

> See the [Deno Documentation][docs-date] for this file.

#### Types

```ts
interface RelativeTimeOptions extends Intl.RelativeTimeFormatOptions {
  locales?: string | string[];
  absolute?: boolean;
  timeZone?: string;
}
```

#### Enums

```ts
enum Times {
  /**
   * set to 1 to scale everything down to seconds.
   * leave as 1e3 to scale everything as milliseconds.
   */
  second = 1e3,
  millisecond = 1e-3 * second,
  microsecond = 1e-6 * second,
  nanosecond = 1e-9 * second,
  minute = 60 * second,
  hour = 3.6e3 * second,
  day = 8.64e4 * second,
  week = 6.048e5 * second,
  month = 2.628e6 * second,
  year = 3.1536e7 * second,
}
```

```ts
enum TimesAbbr {
  millis = Times.millisecond,
  nanos = Times.nanosecond,
  micros = Times.microsecond,
  sec = Times.second,
  min = Times.minute,
  hr = Times.hour,
  wk = Times.week,
  mo = Times.month,
  yr = Times.year,
  ms = Times.millisecond,
  ns = Times.nanosecond,
  us = Times.microsecond,
  s = Times.second,
  m = Times.minute,
  h = Times.hour,
  d = Times.day,
  w = Times.week,
  M = Times.month,
  Y = Times.year,
}
```

#### Constants

```ts
const CENTURY = Times.year * 100;
const DECADE = Times.year * 10;
const YEAR = Times.year;
const QUARTER = Times.year / 4;
const MONTH = Times.month;
const WEEK = Times.week;
const DAY = Times.day;
const HOUR = Times.hour;
const MINUTE = Times.minute;
const SECOND = Times.second;
const MILLISECOND = Times.millisecond;
const NANOSECOND = Times.nanosecond;
const MICROSECOND = Times.microsecond;
```

#### Methods

```ts
function parse(
  date: string | number,
  formatString = defaultFormatString,
): Date;
```

```ts
function format(
  date: Date | string | number,
  formatString = defaultFormatString,
): string;
```

```ts
function difference(
  from: number | string | Date,
  to: number | string | Date,
  options?: DifferenceOptions,
): Partial<DifferenceFormat>;
```

```ts
function relative(
  value: number,
  unit: RelativeUnit,
  {
    style = "long",
    numeric = "auto",
    locales = "en",
    localeMatcher = "best fit",
  }: RelativeTimeOptions = {},
): string;
```

---

### fmt.ts

> See the [Deno Documentation][docs-fmt] for this file.

---

### hash.ts

> See the [Deno Documentation][docs-hash] for this file.

#### Constants

```ts
const utf8TextEncoder: TextEncoder;
```

```ts
const utf8TextDecoder: TextDecoder;
```

#### Methods

```ts
function toHex(buffer: Uint8Array | ArrayBuffer): string;
```

```ts
async function computeHash(
  data: string | Uint8Array,
  algorithm: AlgorithmIdentifier = "SHA-1",
): Promise<string>;
```

```ts
async function sha1(data: string | Uint8Array): Promise<string>;
```

```ts
async function sha256(data: string | Uint8Array): Promise<string>;
```

```ts
async function sha512(data: string | Uint8Array): Promise<string>;
```

```ts
async function eTag(data: any, weak = true): Promise<string>;
```

```ts
function uuid(): string;
```

---

### http.ts

> See the [Deno Documentation][docs-http] for this file.

#### Types

```ts
/** Information about the connection a request arrived on. */
interface ConnInfo {
  /** The local address of the connection. */
  readonly localAddr: Deno.Addr;
  /** The remote address of the connection. */
  readonly remoteAddr: Deno.Addr;
}
```

```ts
declare type Handler = (
  request: Request,
  connInfo: ConnInfo,
  params: PathParams,
) => Promise<Response> | Response;
```

```ts
interface Routes {
  [path: string]: Handler;
}
```

```ts
interface ServeInit extends Partial<Deno.ListenOptions> {
  /** An AbortSignal to close the server and all connections. */
  signal?: AbortSignal;

  /** The handler to invoke when route handlers throw an error. */
  onError?: (error: unknown) => Response | Promise<Response>;

  /** The callback which is called when the server started listening */
  onListen?: (params: { hostname: string; port: number }) => void;
}
```

```ts
declare type PathParams = Record<string, string> | undefined;
```

```ts
export interface ServeStaticOptions {
  /** The base to be used for the construction of absolute URL. */
  baseUrl: string;
  /** A function to modify the response before it's served to the request.
   * For example, set appropriate content-type header.
   *
   * @default undefined */
  intervene?: (
    request: Request,
    response: Response,
  ) => Promise<Response> | Response;
  /** Disable caching of the responses.
   *
   * @default true */
  cache?: boolean;
}
```

```ts
interface RequestTerms {
  [key: string]: {
    headers?: string[];
    body?: string[];
    params?: string[];
  };
}
```

```ts
export declare type ResponseProps = Record<string, any>;
```

#### Methods

```ts
/**
 * Given an extension, lookup the appropriate media type for that extension.
 * Likely you should be using `contentType()` though instead.
 */
function lookupMediaType(pathname: string): string | undefined;
```

````ts
/** serve() registers "fetch" event listener and invokes the provided route
 * handler for the route with the request as first argument and processed path
 * params as the second.
 *
 * @example
 * ```ts
 * serve({
 *  "/": (request: Request) => new Response("Hello World!"),
 *  404: (request: Request) => new Response("not found")
 * })
 * ```
 *
 * The route handler declared for `404` will be used to serve all
 * requests that do not have a route handler declared.
 * @see {@link https://deno.land/x/sift@0.5.0/mod.ts}
 */
function serve(userRoutes: Routes, options?: ServeInit): void;
````

```ts
function handleRequest(
  request: Request,
  connInfo: ConnInfo,
  routes: Routes,
): Promise<Response>;
```

```ts
function defaultNotFoundPage(): Response;
```

````ts
/**
 * Serve static files hosted on the internet or relative to your source code.
 *
 * Be default, up to 20 static assets that are less than 10MB are cached. You
 * can disable caching by setting `cache: false` in the options object.
 *
 * @example ```ts
 * import { serve, serveStatic } from "https://deno.land/x/911@0.1.3/src/http.ts"
 *
 * serve({
 *  // It is required that the path ends with `:filename+`
 *  "/:filename+": serveStatic("public", { baseUrl: import.meta.url }),
 * })
 * ```
 */
function serveStatic(
  relativePath: string,
  { baseUrl, intervene, cache }: ServeStaticOptions,
): Handler;
````

````ts
/**
 * Renders JSX components to HTML and returns a Response with `text/html`
 * as the `content-type.`
 *
 * @example
 * ```jsx
 * import { serve, jsx, h } from "https://deno.land/x/sift/mod.ts"
 *
 * const Greet = ({name}) => <div>Hello, {name}</div>;
 *
 * serve({
 *  "/": () => jsx(<html><Greet name="Sift" /></html),
 * })
 * ```
 *
 * Make sure your file extension is either `.tsx` or `.jsx` and you've `h` imported
 * when using this function. */
function jsx(jsx: VNode, init?: ResponseInit): Response;
````

```ts
/**
 * Validate whether the incoming request meets the provided terms.
 */
function validateRequest(
  request: Request,
  terms: RequestTerms,
): Promise<{
  error?: {
    message: string;
    status: number;
  };
  body?: {
    [key: string]: unknown;
  };
}>;
```

```ts
function toResponse(
  data: string | ArrayBuffer,
  { contentType, status, headers, ...init }?: ResponseInit & ResponseProps,
): Promise<Response>;
```

---

### json.ts

> See the [Deno Documentation][docs-json] for this file.

#### Types

```ts
declare type JsonReplacerFn = (
  this: any,
  key: string,
  value: any,
) => any;
```

```ts
declare type JsonValue<T extends any = string | number | boolean> = T extends (
  T | T[] | Record<string, (T | T[] | Record<string, T>)>
) ? T
  : never;
```

```ts
declare type JsonInit = {
  replacer?: Maybe<OmitThisParameter<JsonReplacerFn>>;
  space?: string | number;
} & ResponseInit;
```

```ts
declare type JsonInitAlt = {
  replacer: (string | number)[];
  space: string | number;
} & ResponseInit;
```

#### Methods

```ts
/**
 * Serializes the given JavaScript value to a JSON string, returning it as a
 * new Response with appropriate `content-type` and CORS headers applied.
 * Accepts the same init parameters as `JSON.stringify()` and ResponseInit.
 */
function json<T extends unknown>(
  data: T, init?: Partial<JsonInit>
): Response (+1 overload)
```

---

### log.ts

> See the [Deno Documentation][docs-log] for this file.

#### Types

```ts
type LogLevelName = "debug" | "info" | "warn" | "error" | "fatal";
```

#### Enums

```ts
enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}
```

#### Classes

```ts
class Timing {
  #t = performance.now();

  reset() {
    this.#t = performance.now();
  }

  stop(message: string) {
    const now = performance.now();
    const d = Math.round(now - this.#t);
    let cf = ansi.green;
    if (d > 10000) {
      cf = ansi.red;
    } else if (d > 1000) {
      cf = ansi.yellow;
    }
    console.debug(ansi.dim("TIMING"), message, "in", cf(d + "ms"));
    this.#t = now;
  }
}
```

```ts
class Logger {
  get level(): LogLevel;
  set level(level: LogLevel | LogLevelName);

  setLevel(level: LogLevelName): void;

  debug(...args: unknown[]): void;

  log(...args: unknown[]): void;

  info(...args: unknown[]): void;

  warn(...args: unknown[]): void;

  error(...args: unknown[]): void;

  fatal(...args: unknown[]): void;

  timing(): {
    reset(): void;
    stop(message?: string): void;
  } | Timing;
}
```

#### Constants

```ts
const log: Logger;
```

---

### math.ts

> See the [Deno Documentation][docs-math] for this file.

#### Methods

```ts
function clamp(n: number, min: number, max: number): number;
```

```ts
function randomInteger(lower: number, upper: number): number;
```

```ts
function sum(...values: number[] | number[][]): number;
```

---

### memoize.ts

> See the [Deno Documentation][docs-memoize] for this file.

#### Types

```ts
interface MemoizeOptions<A extends unknown[], R> {
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
dsss;
```

```ts
type MemoizableFn<
  A extends unknown[],
  R extends any,
  T extends unknown,
> = (this: T, ...args: A) => R;
```

#### Constants

```ts
const defaultOptions: {
  cache: Map<any, any>;
  hash(...args: any[]): string;
};
```

#### Methods

```ts
function memoize<
  A extends unknown[],
  R extends unknown,
  T extends unknown,
>(
  fn: MemoizableFn<A, R, T>,
  opts: MemoizeOptions<A, R> = defaultOptions,
): MemoizableFn<A, R, T>;
```

#### Decorators

```ts
function memoized<A extends unknown[], R, T>(
  options: MemoizeOptions<A, R> = {},
): MemoizeDecoratorFactory<A, R, T>;
```

---

### params.ts

> See the [Deno Documentation][docs-params] for this file.

#### Types

```ts
type Obj<T extends string = string> = Record<string, T>;
```

```ts
type ParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;
```

```ts
interface ParamsOptions {
  distinct?: boolean;
  sort?: boolean;
  defaultParams?: Record<string, string>;
}
```

#### Classes

````ts
class Params extends URLSearchParams {
    readonly options: ParamsOptions;
    constructor(init?: ParamsInit, options?: ParamsOptions);
    /**
     * Sorts all parameters, flattens any keys with multiple values (using
     * the last value encountered as each key's final value), and then sorts
     * them once again.
     * @category Params
     * @returns reference to the original Params object with any duplicates removed
     * @example ```ts
     * import { Params } from "./params.ts";
     * 
     * const params = new Params("key=val1&key2=val2&key=val3");
     * params.distinct().toString();
     * // key=val3&key2=val2
     * ```
     */
    distinct(): Params;
    get size(): number;
    get length(): number;
    get<T extends any = string>(name: string | string[]): T | T[];
    getAll(names: string | string[]): any;

    /**
     * Parse parameters from a string, array of entries, object literal, or
     * an existing Params / URLSearchParams instance. Allows parameters with
     * semicolon (`;`) delimiters, per the IETF RFC specification.
     * @param value raw value to be parsed
     * @returns
     */
    parse<T extends ParamsInit>(value: T): Params (+3 overloads)
    toJSON(): {
        [k: string]: string;
    };
    toString(): string;
    toObject(): Obj;
    static toObject<T extends any = {
        [K: string]: string;
    }>(params: Params): T;
    /**
     * Verify if an arbitrary value is fit for initializing a Params instance.
     * @param value
     * @returns
     */
    static validate(value: unknown, named?: boolean): value is ParamsInit;
}
````

---

### promises.ts

> See the [Deno Documentation][docs-promises] for this file.

#### Methods

```ts
function sleep(ms: number, callback?: Fn<void>): Promise<void>;
```

```ts
function throttle(
  callback: Fn<void, any> | ((...args: any[]) => any),
  delay?: number,
  debounceMode?: boolean,
  noTrailing?: boolean,
): {
  (this: any, ...args: any[]): void;
  cancel: () => void;
};
```

```ts
function debounce(
  callback: Fn<any>,
  delay: number,
  atBegin?: boolean,
): {
  (this: any, ...args: any[]): void;
  cancel: () => void;
};
```

---

### serialize_map.ts

> See the [Deno Documentation][docs-serialize-map] for this file.

---

### serialize_set.ts

> See the [Deno Documentation][docs-serialize-set] for this file.

---

### state.ts

> See the [Deno Documentation][docs-state] for this file.

---

### type.ts

> See the [Deno Documentation][docs-type] for this file.

---

## License and Copyright Info

MIT © 2022 [**Nicholas Berlette**](https://github.com/nberlette) • MIT ©
2018-2022 [**the Deno Authors**](https://github.com/denoland) • MIT © 2019-2022
[**Anthony Fu**](https://github.com/antfu)

All rights reserved.

> _Apologies to any contributors not included here - email me to have these
> credits amended with your license/copyright info. Thank you!_

[docs-cache]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/cache.ts
[docs-http]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/http.ts
[docs-hash]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/hash.ts
[docs-collection]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/collection.ts
[docs-fmt]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/fmt.ts
[docs-json]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/json.ts
[docs-log]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/log.ts
[docs-math]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/math.ts
[docs-date]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/date.ts
[docs-memoize]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/memoize.ts
[docs-serialize-map]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/serialize_map.ts
[docs-serialize-set]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/serialize_set.ts
[docs-params]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/params.ts
[docs-promises]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/promises.ts
[docs-state]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/state.ts
[docs-throttle]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/throttle.ts
[docs-type]: https://doc.deno.land/https://deno.land/x/911@0.1.3/src/type.ts

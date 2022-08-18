import { ensureArray, remove, toArray } from "./collection.ts";
import { type AsyncFn, type Fn, is, type Maybe } from "./type.ts";
import { pLimit } from "../deps.ts";

export type MaybeAsyncFn<T> = Fn<Promise<T>> | Fn<T>;

/**
 * Promised `setTimeout`
 * @category Promises
 */
export function sleep(
  ms: number,
  callback?: MaybeAsyncFn<void>,
): Promise<void> {
  return new Promise<void>((resolve) =>
    setTimeout(async () => {
      await callback?.();
      resolve();
    }, ms)
  );
}

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 * @category Promises
 * @param callback - A function to be executed after delay milliseconds. The
 * `this` context and all arguments are passed through, as-is, to `callback`
 * when the function is executed.
 * @param delay - A zero-or-greater delay in milliseconds.
 * For event callbacks, values around 100 or 250 (or even higher) most useful.
 * @param debounceMode - If `debounceMode` is true (at begin), schedule `clear`
 * to execute after `delay` ms. If `debounceMode` is false, schedule `callback`
 * to execute after `delay` ms.
 * @param noTrailing - Optional, defaults to false. If noTrailing is true,
 * callback will only execute every `delay` milliseconds while the
 * throttled-function is being called. If noTrailing is false or unspecified,
 * callback will be executed one final time after the last throttled-function
 * call. (After the throttled-function has not been called for `delay`
 * milliseconds, the internal counter is reset).
 * @returns A new, throttled, function.
 * @see {@link debounce}
 */
export function throttle<T>(
  callback: Fn<T>,
  delay = 250,
  debounceMode = false,
  noTrailing = false,
) {
  /**
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */
  let timeoutID: any | undefined;
  let cancelled = false;
  // Keep track of the last time `callback` was executed.
  let lastExec = 0;

  // Function to cancel next exec
  function cancel() {
    clearTimeout(timeoutID);
    cancelled = true;
  }

  /**
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */
  function wrapper(this: any, ...args: any[]) {
    const self = this as ThisParameterType<Fn>;
    const elapsed = Date.now() - lastExec;
    if (cancelled) {
      return;
    }

    /**
     * Execute `callback` and update the `lastExec` timestamp.
     */
    function exec() {
      lastExec = Date.now();
      return callback.apply<any, any[], T>(self as any, args as any[]);
    }
    /**
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */
    function clear() {
      timeoutID = undefined;
    }
    /**
     * Since `wrapper` is being called for the first time and
     * `debounceMode` is true (at begin), execute `callback`.
     */
    (debounceMode && !timeoutID) && exec();
    clearTimeout(timeoutID);
    if (debounceMode === undefined && elapsed > delay!) {
      /**
       * In throttle mode, if `delay` time has been exceeded, execute
       * `callback`.
       */
      return exec();
    } else if (noTrailing !== true) {
      /**
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute
       * after `delay` ms.
       *
       * If `debounceMode` is false (at end), schedule `callback` to
       * execute after `delay` ms.
       */
      timeoutID = setTimeout(
        debounceMode ? clear : exec,
        debounceMode === undefined ? delay! - elapsed : delay,
      );
    }
  }
  wrapper.cancel = cancel;
  // Return the wrapper function.
  return wrapper;
}

/**
 * Debounce execution of a function. Debouncing, unlike throttling,
 * guarantees that a function is only executed a single time, either at the
 * very beginning of a series of calls, or at the very end.
 * @category Promises
 * @param delay - Zero-or-greater delay in milliseconds. For event callbacks,
 * values around 100 or 250 (or even higher) are most useful.
 * @param atBegin - Optional, defaults to false. If atBegin is false or
 * unspecified, callback will only be executed `delay` milliseconds after
 * the last debounced-function call. If atBegin is true, callback will
 * be executed only at the first debounced-function call.
 * (After the throttled-function has not been called for `delay` milliseconds,
 * the internal counter is reset).
 * @param  callback - A function to be executed after delay milliseconds.
 * The `this` context and all arguments are passed through, as-is,
 * to `callback` when the debounced-function is executed.
 * @returns A new, debounced function.
 * @see {@link throttle}
 */
export function debounce(
  callback: Fn<any>,
  delay: number,
  atBegin = false,
) {
  return callback === undefined
    ? throttle(callback, delay, atBegin, false)
    : throttle(callback, delay, !!atBegin);
}

/**
 * Internal marker for filtered items
 */
const VOID = Symbol("p-void");

export interface SingletonPromiseReturn<T> {
  (): Promise<T>;
  /**
   * Reset current staled promise.
   * Await it to have proper shutdown.
   */
  reset: () => Promise<void>;
}

/**
 * Create singleton promise function
 * @category Promises
 * @param fn the Promise function to be wrapped
 * @returns the singleton promise function
 * @see {@link SingletonPromiseReturn}
 * @example ```ts
 * import { createSingletonPromise } from "https://deno.land/x/911@0.1.2/src/promises.ts";
 * const singleton = createSingletonPromise(async () => {
 *   const result = await someAsyncOperation();
 *   return result;
 * });
 * await singleton(); // await the singleton promise
 * await singleton.reset(); // reset the singleton promise
 * ```
 */
export function createSingletonPromise<T>(
  fn: () => Promise<T>,
): SingletonPromiseReturn<T> {
  let _promise: Promise<T> | undefined;

  function wrapper() {
    if (!_promise) {
      _promise = fn();
    }
    return _promise;
  }
  wrapper.reset = async () => {
    const _prev = _promise;
    _promise = undefined;
    if (_prev) {
      await _prev;
    }
  };

  return wrapper;
}

/**
 * Promise with `resolve` and `reject` methods of itself
 */
export interface ControlledPromise<T = void> extends Promise<T> {
  resolve(value: T | PromiseLike<T>): void;
  reject(reason?: any): void;
}

/**
 * Return a Promise with `resolve` and `reject` methods
 * @category Promises
 * @example ```ts
 * import { controlledPromise } from "https://deno.land/x/911@0.1.2/src/promises.ts";
 * const promise = createControlledPromise()
 *
 * await promise
 *
 * // in another context:
 * promise.resolve(data)
 * ```
 */
export function createControlledPromise<T>(): ControlledPromise<T> {
  let resolve: any, reject: any;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as ControlledPromise<T>;
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

/**
 * Create a promise lock
 *
 * @category Promises
 * @example ```ts
 * const lock = createPromiseLock()
 *
 * lock.run(async () => {
 *   await doSomething()
 * })
 *
 * // in anther context:
 * await lock.wait() // it will wait all tasking finished
 * ```
 */
export function createPromiseLock() {
  const locks: Promise<any>[] = [];

  return {
    async run<T = void>(fn: () => Promise<T>): Promise<T> {
      const p = fn();
      locks.push(p);
      try {
        return await p;
      } finally {
        remove(locks, p);
      }
    },
    async wait(): Promise<void> {
      await Promise.allSettled(locks);
    },
    isWaiting() {
      return Boolean(locks.length);
    },
    clear() {
      locks.length = 0;
    },
  };
}

export interface POptions {
  /**
   * How many promises are resolved at the same time.
   */
  concurrency?: number | undefined;
}

export type Possible<T extends any = any> = Promise<Awaited<T>>;

export type Possibles<T extends any = any> = Promise<Awaited<T>[]>;

const noop = () => {};

/**
 * Create a promise pool for controlled execution of promises.
 * @category Promises
 * @example ```ts
 * import { Promises } from "https://deno.land/x/911@0.1.2/src/promises.ts";
 *
 * const pool = Promises.from([
 *   async () => {
 *     await delay(1000);
 *     return "hello";
 *   },
 *   async () => {
 *     await delay(1000);
 *     return "world";
 *   },
 * ], { concurrency: 1 });
 *
 * pool.add(async () => {
 *  await delay(1000);
 *  return "deno rocks";
 * });
 *
 * pool.map(console.log);
 */
export class Promises<T extends any = any> extends Promise<Awaited<T>[]> {
  private readonly promises = new Set<Possible<T>>();
  readonly #options: POptions = {
    concurrency: undefined,
  };
  private readonly limit: ReturnType<typeof pLimit>;

  constructor(items: Iterable<T>, options: POptions);
  constructor(items: Iterable<T>, concurrency: number | string);
  constructor(public items: Iterable<T> = [], options: any = {}) {
    super(noop);
    if (is.number(options) || is.string(options)) {
      options = { concurrency: +options };
    }
    Object.assign(this.#options, options);
    this.limit = pLimit(options.concurrency);
    return this;
  }

  static from<P extends any = any>(
    items: Iterable<P>,
    options: POptions = {},
  ): Promises<P> {
    return new Promises<P>(items, options);
  }

  get promise(): Possibles<T> {
    let batch;
    const items = [...ensureArray(this.items), ...ensureArray(this.promises)];

    if (this.#options.concurrency) {
      batch = Promise.all(items.map((p) => this.limit(() => p)));
    } else {
      batch = Promise.all(items);
    }

    return (batch as Possibles<T>).then((l) =>
      l.filter((i: any) => i !== VOID)
    );
  }

  set promise(value: Possibles<T>) {
    for (const p of toArray(value)) {
      this.promises.add(p as Possible<T>);
    }
  }

  add(...args: Possible<T>[]) {
    args.forEach((i) => {
      this.promises.add(i);
    });
  }

  map<U>(fn: (value: Awaited<T>, index: number) => U): Promises<Promise<U>> {
    return new Promises(
      Array.from(this.items, async (i, idx) => {
        const v = await i;
        if ((v as any) === VOID) {
          return VOID as unknown as U;
        }
        return fn(v, idx);
      }),
      this.#options,
    );
  }

  filter(
    fn: (value: Awaited<T>, index: number) => boolean | Promise<boolean>,
  ): Promises<Promise<T>> {
    return new Promises(
      Array.from(this.items, async (i, idx) => {
        const v = await i;
        const r = await fn(v, idx);
        if (!r) {
          return VOID as unknown as T;
        }
        return v;
      }),
      this.#options,
    );
  }

  async forEach(
    fn: (value: Awaited<T>, index: number) => void,
    after: AsyncFn<unknown> = (() => {}),
  ): Promise<void> {
    return await this.map(fn).then(after || undefined);
  }

  async reduce<U>(
    fn: (
      previousValue: U,
      currentValue: Awaited<T>,
      currentIndex: number,
      array: Awaited<T>[],
    ) => U,
    initialValue: U,
  ): Promise<U> {
    return await this.promise.then((array) =>
      array.reduce<U>(fn, initialValue)
    );
  }

  clear() {
    this.promises.clear();
    return this;
  }
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TFulfilled extends any = T, TRejected = never>(
    onfulfilled?: Maybe<
      ((value: Awaited<T>[]) => TFulfilled | PromiseLike<TFulfilled>)
    >,
    onrejected?: Maybe<((reason: any) => TRejected | PromiseLike<TRejected>)>,
  ): Promise<TFulfilled | TRejected> {
    const p = this.promise;
    if (onfulfilled) {
      return p?.then?.(onfulfilled) as unknown as Promise<TFulfilled>;
    }
    if (onrejected) {
      return p?.then?.(undefined, onrejected) as unknown as Promise<TRejected>;
    }
    return p as any;
  }

  catch(onrejected?: (err: unknown) => PromiseLike<any>) {
    return this.promise?.catch?.(onrejected);
  }

  finally(onfinally?: () => void) {
    return this.promise?.finally?.(onfinally);
  }
}

/**
 * Utility for managing multiple promises.
 *
 * @see https://github.com/antfu/utils/tree/main/docs/p.md
 * @category Promises
 * @example ```ts
 * import { p } from "https://deno.land/x/911@0.1.2/src/promises.ts";
 *
 * const items = [1, 2, 3, 4, 5]
 *
 * await p(items)
 *   .map(async i => await multiply(i, 3))
 *   .filter(async i => await isEven(i))
 * // [6, 12]
 * ```
 */
export function p<T = any>(
  items?: Iterable<T>,
  options?: POptions,
): Promises<T> {
  return new Promises(items, options);
}

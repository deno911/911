/* eslint-disable no-undefined,no-param-reassign,no-shadow */

import { type Fn } from "./type.ts";

/**
 * Promised `setTimeout`
 * @category Promise
 */
export function sleep(ms: number, callback?: Fn<void>) {
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
 *
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
export function throttle(
  callback: Fn | ((...args: any[]) => any),
  delay = 250,
  debounceMode = false,
  noTrailing = false,
): any {
  /*
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

  /*
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

    // Execute `callback` and update the `lastExec` timestamp.
    function exec() {
      lastExec = Date.now();
      callback.apply(self, args as any[]);
    }
    /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */
    function clear() {
      timeoutID = undefined;
    }
    if (debounceMode && !timeoutID) {
      /*
       * Since `wrapper` is being called for the first time and
       * `debounceMode` is true (at begin), execute `callback`.
       */
      exec();
    }
    clearTimeout(timeoutID);
    if (debounceMode === undefined && elapsed > delay!) {
      /*
       * In throttle mode, if `delay` time has been exceeded, execute
       * `callback`.
       */
      exec();
    } else if (noTrailing !== true) {
      /*
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
 *
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
): any | void {
  return callback === undefined
    ? throttle(callback, delay, atBegin, false)
    : throttle(callback, delay, !!atBegin);
}

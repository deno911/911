/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { debounce, sleep, throttle } from "./deps.ts";

Deno.test({
  name: "throttle",
  ignore: true,
  fn(test) {
    const func = (...args: any[]): any[] => {
      return args;
    };
    const throttled = throttle(func, 100);
    const result = throttled(1, 2, 3);
    assertEquals(result, [1, 2, 3]);
  },
});

Deno.test({
  name: "debounce",
  ignore: true,
  fn(test) {
    const func = (...args: any[]) => {
      return args;
    };
    const debounced = debounce(func, 100);
    const result = debounced(1, 2, 3);
    assertEquals(result, [1, 2, 3]);
  },
});

Deno.test({
  name: "throttle.clear",
  ignore: true,
  fn(test) {
    const func = (...args: any[]) => {
      return args;
    };
    const throttled = throttle(func, 100);
    throttled.cancel();
    const result = throttled(1, 2, 3);
    assertEquals(result, [1, 2, 3]);
  },
});

Deno.test({
  name: "debounce.clear",
  ignore: true,
  fn(test) {
    const func = (...args: any[]) => {
      return args;
    };
    const debounced = debounce(func, 100);
    debounced.cancel();
    const result = debounced(1, 2, 3);
    assertEquals(result, [1, 2, 3]);
  },
});

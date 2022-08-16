/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { assertEquals } from "../deps_test.ts";
import { debounce, sleep, throttle } from "../src/throttle.ts";

Deno.test({
  name: "throttle",
  ignore: true,
  fn(test) {
    const func = (...args: any[]) => {
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
    throttled.clear();
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
    debounced.clear();
    const result = debounced(1, 2, 3);
    assertEquals(result, [1, 2, 3]);
  },
});

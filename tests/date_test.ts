/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { assertEquals } from "../deps_test.ts";
import * as date from "../src/date.ts";

Deno.test({
  name: "date.relative()",
  fn(test) {
    const result = date.relative(
      -1,
      "minutes",
      {
        style: "long",
        locales: ["en-US"],
        numeric: "always",
      },
    );
    assertEquals(result, "1 minute ago");
  },
});

Deno.test({
  name: "date.difference()",
  fn(test) {
    const then = +Date.now() - (1e3 * 3600);
    const now = +Date.now();
    const result = date.difference(then, now, {
      units: ["minutes", "seconds", "milliseconds"],
    });
    assertEquals(result.milliseconds, 3.6e6);
    assertEquals(result.seconds, 3600);
    assertEquals(result.minutes, 60);
  },
});

Deno.test({
  name: "date.parse()",
  fn(test) {
    const result = date.parse("2020-01-01", "yyyy-MM-dd");
    assertEquals(result.getFullYear(), 2020);
    assertEquals(result.getMonth(), 0);
    assertEquals(result.getDate(), 1);
  },
});

Deno.test({
  name: "date.format()",
  fn(test) {
    const result = date.format(new Date("1/01/2020"), "yyyy-MM-dd");
    assertEquals(result, "2020-01-01");
  },
});

Deno.test({
  name: "date.toIMF()",
  fn(test) {
    const result = date.toIMF(new Date("2021-01-01 00:00:00 UTC"));
    assertEquals(result, "Fri, 01 Jan 2021 00:00:00 GMT");
  },
});

Deno.test({
  name: "date.isLeap()",
  fn(test) {
    assertEquals(date.isLeap(2020), true);
    assertEquals(date.isLeap(2019), false);
  },
});

Deno.test({
  name: "date.dayOfYear()",
  fn(test) {
    assertEquals(date.dayOfYear(new Date("2020-01-01")), 1);
    assertEquals(date.dayOfYear(new Date("2020-01-10")), 10);
    assertEquals(date.dayOfYear(new Date("2020-01-15")), 15);
  },
});

Deno.test({
  name: "date.weekOfYear()",
  fn(test) {
    assertEquals(date.weekOfYear(new Date("2020-01-01")), 1);
    assertEquals(date.weekOfYear(new Date("2020-01-16")), 3);
    assertEquals(date.weekOfYear(new Date("2020-02-01")), 5);
    assertEquals(date.weekOfYear(new Date("2020-02-15")), 7);
  },
});

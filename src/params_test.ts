/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
} from "../deps_test.ts";

import { Params } from "./params.ts";

Deno.test({
  name: "Params.parse(string)",
  async fn(test) {
    const params = Params.parse("p=v&p2=v2&p3=v3");
    await test.step("Returns new Params instance", () => {
      assertInstanceOf(params, Params);
    });
    await test.step("Parses values correctly", () => {
      assertEquals(params.get("p"), "v");
      assertEquals(params.get("p2"), "v2");
      assertEquals(params.get("p3"), "v3");
    });
  },
});

Deno.test({
  name: "Params.parse(object)",
  // ignore: true,
  async fn(test) {
    const params = Params.parse(
      { p1: "v0", p2: "v0", p3: "v0" },
      { p2: "v1", p3: "v1" },
      { p3: "v2" },
    );
    await test.step("Returns new Params instance", () => {
      assertInstanceOf(params, Params);
    });
    await test.step("Merges values from left to right", () => {
      assertEquals(params.get("p3"), "v2");
      assertEquals(params.get("p2"), "v1");
      assertEquals(params.get("p1"), "v0");
    });
    await test.step("Allows multiple values for one parameter", () => {
      assertArrayIncludes(params.getAll("p3"), ["v0", "v1", "v2"]);
    });
  },
});

Deno.test({
  name: "Params.parse(mixed)",
  async fn(test) {
    const params = Params.parse(
      { p1: "v1", p2: "v1", p3: "v1" },
      "p2=v2&p3=v2&p4=v2",
    );
    await test.step("Returns new Params instance", () => {
      assertInstanceOf(params, Params);
    });
    await test.step("Merges values from left to right", () => {
      assertEquals(params.get("p3"), "v2");
      assertEquals(params.get("p2"), "v2");
      assertEquals(params.get("p1"), "v1");
    });
    await test.step("Allows multiple values for one parameter", () => {
      assertArrayIncludes(params.getAll("p3"), ["v1", "v2"]);
      assertArrayIncludes(params.getAll("p2"), ["v1", "v2"]);
    });
  },
});

Deno.test({
  name: "Params.distinct()",
  fn() {
    const params = Params.parse("p1=v1&p3=v1", "p2=v2&p3=v2", {
      p2: "v1",
      p3: "v3",
    });
    assertArrayIncludes(params.getAll("p2"), ["v2"]);
    params.distinct();
    assertEquals(params.getAll("p2"), ["v1"]);
  },
});

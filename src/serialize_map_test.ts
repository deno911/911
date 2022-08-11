/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { assertEquals, assertInstanceOf } from "../deps_test.ts";
import { SerializeMap } from "./serialize_map.ts";

const init = () =>
  new SerializeMap([
    ["1", "one"],
    ["2", "two"],
    ["3", "three"],
  ]);

const tests = (<Deno.TestDefinition[]> [
  {
    name: "#1: SerializeMap (Private)",
    async fn(ctx) {
      const steps = (<Deno.TestStepDefinition[]> [
        {
          name: "instanceof SerializeMap",
          fn() {
            const map = init();
            assertInstanceOf(map, SerializeMap<string>);
          },
        },
        {
          name: "Symbol.toStringTag()",
          fn() {
            const map = init();
            assertEquals({}.toString.call(map), "[object SerializeMap]");
          },
        },
        {
          name: "Symbol.iterator()",
          fn() {
            const map = init();
            const iterator = map[Symbol.iterator]();
            assertEquals(iterator.next().value, ["1", "one"]);
            assertEquals(iterator.next().value, ["2", "two"]);
            assertEquals(iterator.next().value, ["3", "three"]);
          },
        },
        {
          name: "Symbol.iterator(empty)",
          fn() {
            const map = new SerializeMap([]);
            const iterator = map[Symbol.iterator]();
            assertEquals(iterator.next().done, true);
          },
        },
        {
          name: "Symbol.toPrimitive(number)",
          fn() {
            const map = init();
            assertEquals(+map, map.size);
          },
        },
        {
          name: "Symbol.toPrimitive(string)",
          fn() {
            const map = init();
            assertEquals(`${map}`, '{"1":"one","2":"two","3":"three"}');
          },
        },
      ]);
      for await (const step of steps) await ctx.step(step);
    },
  },
  {
    name: "#2: SerializeMap (Public)",
    async fn(ctx) {
      const steps = (<Deno.TestStepDefinition[]> [
        {
          name: ".set().sort().toJSON()",
          fn() {
            const map = new SerializeMap([])
              .set("4", "four")
              .sort()
              .toJSON();
            assertEquals(map, { "4": "four" });
          },
        },
        {
          name: ".set()",
          fn() {
            const map = new SerializeMap([]);
            map.set("1", "one");
            assertEquals(map.size, 1);
            map.set("2", "two");
            assertEquals(map.size, 2);
          },
        },
        {
          name: ".get()",
          fn() {
            const map = init();
            assertEquals(map.get("1"), "one");
          },
        },
        {
          name: ".delete()",
          fn() {
            const map = init();
            assertEquals(map.size, 3);
            map.delete("1");
            assertEquals(map.size, 2);
          },
        },
        {
          name: ".has()",
          fn() {
            const map = init();
            assertEquals(map.has("1"), true);
            assertEquals(map.has("4"), false);
          },
        },
        {
          name: ".clear()",
          fn() {
            const map = init();
            assertEquals(map.size, 3);
            map.clear();
            assertEquals(map.size, 0);
          },
        },
        {
          name: ".keys()",
          fn() {
            const map = init();
            const keys = map.keys();
            assertEquals(keys.next().value, "1");
            assertEquals(keys.next().value, "2");
            assertEquals(keys.next().value, "3");
            assertEquals(keys.next().done, true);
          },
        },
        {
          name: ".values()",
          fn() {
            const map = init();
            const values = map.values();
            assertEquals(values.next().value, "one");
            assertEquals(values.next().value, "two");
            assertEquals(values.next().value, "three");
            assertEquals(values.next().done, true);
          },
        },
        {
          name: ".entries()",
          fn() {
            const map = init();
            const entries = map.entries();
            assertEquals(entries.next().value, ["1", "one"]);
            assertEquals(entries.next().value, ["2", "two"]);
            assertEquals(entries.next().value, ["3", "three"]);
            assertEquals(entries.next().done, true);
          },
        },
        {
          name: ".sort()",
          async fn(ctx) {
            await ctx.step({
              name: "ascending",
              fn(t) {
                const map = init();
                map.sort();
                assertEquals(map.toJSON(), {
                  "1": "one",
                  "2": "two",
                  "3": "three",
                });
              },
            });
            await ctx.step({
              name: "descending",
              fn() {
                const map = init();
                map.sort(true);
                assertEquals(map.toJSON(), {
                  "3": "three",
                  "2": "two",
                  "1": "one",
                });
              },
            });
          },
        },
        {
          name: ".toJSON()",
          fn() {
            const map = init();
            assertEquals(map.toJSON(), {
              "1": "one",
              "2": "two",
              "3": "three",
            });
            assertEquals(
              JSON.stringify(map),
              '{"1":"one","2":"two","3":"three"}',
            );
          },
        },
        {
          name: ".size",
          async fn(ctx) {
            await ctx.step("getter", () => {
              const map = init();
              assertEquals(map.size, 3);
            });
            await ctx.step("setter", () => {
              const map = init();
              assertEquals(map.size, 3);
              map.size = 2;
              assertEquals(map.size, 2);
            });
          },
        },
      ]);

      for await (const step of steps) await ctx.step(step);
    },
  },
]);

for await (const t of tests) Deno.test(t);

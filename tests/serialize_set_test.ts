/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { assertEquals, assertInstanceOf } from "../deps_test.ts";
import { SerializeSet } from "../src/serialize_set.ts";

const init = () => new SerializeSet([1, 1, 2, 3]);

const tests = (<Deno.TestDefinition[]> [
  {
    name: "#1: SerializeSet (Private)",
    async fn(ctx) {
      const steps = (<Deno.TestStepDefinition[]> [
        {
          name: "instanceof SerializeSet",
          fn() {
            const set = init();
            assertInstanceOf(set, SerializeSet<number>);
          },
        },
        {
          name: "Symbol.toStringTag()",
          fn() {
            const set = init();
            assertEquals({}.toString.call(set), "[object SerializeSet]");
          },
        },
        {
          name: "Symbol.iterator()",
          fn() {
            const set = init();
            const iterator = set[Symbol.iterator]();
            assertEquals(iterator.next().value, 1);
            assertEquals(iterator.next().value, 2);
            assertEquals(iterator.next().value, 3);
          },
        },
        {
          name: "Symbol.iterator(empty)",
          fn() {
            const set = new SerializeSet([]);
            const iterator = set[Symbol.iterator]();
            assertEquals(iterator.next().done, true);
          },
        },
        {
          name: "Symbol.toPrimitive(number)",
          fn() {
            const set = init();
            assertEquals(+set, set.size);
          },
        },
        {
          name: "Symbol.toPrimitive(string)",
          fn() {
            const set = init();
            assertEquals(`${set}`, "[1,2,3]");
          },
        },
        {
          name: "Symbol.toPrimitive(default)",
          fn() {
            const set = init();
            assertEquals(set + "", "1,2,3");
          },
        },
      ]);
      for await (const step of steps) await ctx.step(step);
    },
  },
  {
    name: "#2: SerializeSet (Public)",
    async fn(ctx) {
      const steps = (<Deno.TestStepDefinition[]> [
        {
          name: ".add().sort().toJSON()",
          fn() {
            const set = init().add(4).sort(true)
              .toJSON();
            assertEquals(set, [4, 3, 2, 1]);
          },
        },
        {
          name: ".add()",
          fn() {
            const set = new SerializeSet([1]);
            set.add(1);
            assertEquals(set.size, 1);
            set.add(2);
            assertEquals(set.size, 2);
          },
        },
        {
          name: ".delete()",
          fn() {
            const set = init();
            assertEquals(set.size, 3);
            set.delete(1);
            assertEquals(set.size, 2);
          },
        },
        {
          name: ".has()",
          fn() {
            const set = init();
            assertEquals(set.has(1), true);
            assertEquals(set.has(4), false);
          },
        },
        {
          name: ".clear()",
          fn() {
            const set = init();
            assertEquals(set.size, 3);
            set.clear();
            assertEquals(set.size, 0);
          },
        },
        {
          name: ".keys()",
          fn() {
            const set = init();
            const keys = set.keys();
            assertEquals(keys.next().value, 1);
            assertEquals(keys.next().value, 2);
            assertEquals(keys.next().value, 3);
            assertEquals(keys.next().done, true);
          },
        },
        {
          name: ".values()",
          fn() {
            const set = init();
            const values = set.values();
            assertEquals(values.next().value, 1);
            assertEquals(values.next().value, 2);
            assertEquals(values.next().value, 3);
            assertEquals(values.next().done, true);
          },
        },
        {
          name: ".entries()",
          fn() {
            const set = init();
            const entries = set.entries();
            assertEquals(entries.next().value, [1, 1]);
            assertEquals(entries.next().value, [2, 2]);
            assertEquals(entries.next().value, [3, 3]);
            assertEquals(entries.next().done, true);
          },
        },
        {
          name: ".sort()",
          async fn(ctx) {
            await ctx.step({
              name: "ascending",
              fn() {
                const set = new SerializeSet([5, 2, 6, 8, 4, 1, 3, 2, 7, 6, 3]);
                set.sort();
                assertEquals(set.toJSON(), [1, 2, 3, 4, 5, 6, 7, 8]);
              },
            });
            await ctx.step({
              name: "descending",
              fn() {
                const set = new SerializeSet([5, 2, 6, 8, 4, 1, 3, 2, 7, 6, 3]);
                set.sort(true);
                assertEquals(set.toJSON(), [8, 7, 6, 5, 4, 3, 2, 1]);
              },
            });
          },
        },
        {
          name: ".toJSON()",
          fn() {
            const set = init();
            assertEquals(set.toJSON(), [1, 2, 3]);
            assertEquals(JSON.stringify(set), "[1,2,3]");
          },
        },
        {
          name: ".size",
          async fn(ctx) {
            await ctx.step("getter", () => {
              const set = init();
              assertEquals(set.size, 3);
            });
            await ctx.step("setter", () => {
              const set = init();
              assertEquals(set.size, 3);
              set.size = 2;
              assertEquals(set.size, 2);
            });
          },
        },
      ]);

      for await (const step of steps) await ctx.step(step);
    },
  },
]);

for await (const t of tests) Deno.test(t);

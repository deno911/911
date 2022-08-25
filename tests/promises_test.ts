/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import {
  type ControlledPromise,
  createControlledPromise,
  createPromiseLock,
  createSingletonPromise,
  p,
} from "./deps.ts";

const tests = <Deno.TestDefinition[]> [
  {
    name: "createControlledPromise",
    async fn(test) {
      const steps = <Deno.TestStepDefinition[]> [
        {
          name: ".resolve()",
          fn(step) {
            const promise = createControlledPromise();
            assert(
              "reject" in promise,
              "ControlledPromise instance is missing 'reject' method!",
            );
            assert(
              "resolve" in promise,
              "ControlledPromise instance is missing a 'resolve' method!",
            );
          },
        },
      ];
      for await (const step of steps) await test.step(step);
    },
  },
];
for await (const test of tests) Deno.test(test);

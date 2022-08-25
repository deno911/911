/**
 * Injects testing methods into the `globalThis` object, making them available
 * without needing any explicit named imports. Items merged into Deno's global
 * scope include `std/testing/{asserts,bdd,snapshot}.ts`.
 */
import "https://deno.land/x/global@0.144.0/testing.ts";

// assert, assertEquals, assertInstanceOf, etc.
// export * from "https://deno.land/std@0.153.0/testing/asserts.ts";

// behavior-driven-development test syntax: `describe`, `it`, etc.
// export * from "https://deno.land/std@0.153.0/testing/bdd.ts";

// benchmarking test utilities
export * from "https://deno.land/std@0.153.0/testing/bench.ts";

// mock and spy test utilities
export * from "https://deno.land/std@0.153.0/testing/mock.ts";

// ChaiJS testing suite: includes `should`, `assert`, `expect`, etc.
export { default as chai } from "https://cdn.skypack.dev/chai@4.3.4?dts";

// Fast-Check: property-driven testing
export { default as fc } from "https://cdn.skypack.dev/fast-check@v3.1.1?dts";

// other dependencies as used by the main module
export * from "../src/params.ts";
export * as date from "../src/date.ts";
export * from "../src/memoize.ts";
export * from "../src/serialize_map.ts";
export * from "../src/serialize_set.ts";
export * from "../src/promises.ts";

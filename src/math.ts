/**
 * Produces a random number between the inclusive `lower` and `upper` bounds.
 *
 * @category Math
 * @param lower The lower bound.
 * @param upper The upper bound.
 * @returns A random number.
 * @example ```ts
 * import { randomInteger } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * for (let i = 0; i < 5; i++) randomInteger(1, 1e3);
 * // 347, 562, 901, 64, 4
 * ```
 * @example ```ts
 * import { randomInteger } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * for (let i = 0; i < 5; i++) randomInteger(1, 20);
 * // => 4, 18, 11, 19, 1
 * ```
 */
export function randomInteger(lower: number, upper: number): number {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}

/**
 * Clamp the value of number `n` to a range of `min` and `max`.
 *
 * @param n The number to clamp.
 * @param min The lower bound of the clamp range.
 * @param max The upper bound of the clamp range.
 * @returns New value with the range constraint applied.
 * @example ```ts
 * import { clamp } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * clamp(0, 1, 3) // => 1
 * clamp(1, 1, 3) // => 1
 * clamp(2, 1, 3) // => 2
 * clamp(3, 1, 3) // => 3
 * ```
 * @example ```ts
 * import { clamp } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * clamp(0, -1, 1) // => -1
 * clamp(1, -1, 1) // => 1
 * clamp(2, -1, 1) // => 1
 * clamp(3, -1, 1) // => 1
 * ```
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Reduces an array (or array of arrays) containing numeric values, returning
 * the sum of all previous values.
 * @param values The array of values to reduce.
 * @returns The sum of all values contained in the array(s).
 * @example ```ts
 * import { sum } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * sum([1, 2, 3, 4, 5]);
 * // 15
 * ```
 * @example ```ts
 * import { sum } from "https://deno.land/x/911@0.1.0/src/math.ts";
 *
 * sum([[1, 2, 3, 4, 5, 6], 2, 4, 6]);
 * // 21
 * ```
 */
export function sum(...values: number[] | number[][]): number {
  return [...(values as number[])].flat(Infinity).reduce(
    (a, b) => a + b,
    0,
  );
}

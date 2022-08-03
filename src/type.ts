import { is as _is, lowerCase } from "../deps.ts";

/**
 * Parses an object's `toStringTag` value.
 * @example toStringTag({}) // "Object"
 * @param o target object
 * @returns the object's `toStringTag` value ("Object" from `[object Object]`)
 */
export function toStringTag(o: unknown): string;
export function toStringTag(o: unknown, t: string): boolean;
export function toStringTag(o: unknown, t?: string): string | boolean {
  if (t != null) {
    return (lowerCase(t) === lowerCase(toStringTag(o)));
  }
  return {}.toString.call(o)?.replace(/^\[object (\w+)\]$/, "$1") ?? "";
}

/**
 * Check if a value is an object literal / plain object.
 */
function isObject<T extends Record<any, any>>(
  value: T,
): value is Record<any, any> {
  return toStringTag(value, "Object");
}

/**
 * Check if a value is an object literal / plain object.
 */
function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

const assert = _is.assert;
const is = _is.default;

export { assert, is, isArray, isObject };

export default {
  is,
  assert,
  isArray,
  isObject,
  toStringTag,
};

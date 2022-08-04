import { lowerCase } from "./case.ts";

export { assert, default as is } from "is";

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
export function isObject<T extends Record<any, any>>(
  value: T,
): value is Record<any, any> {
  return toStringTag(value, "Object");
}

/**
 * Check if a value is an object literal / plain object.
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

export function isArrayLike(value: unknown): value is ArrayLike<any> {
  return "length" in (value as any) && typeof value !== "function";
}

export default {
  isArray,
  isArrayLike,
  isObject,
  toStringTag,
};

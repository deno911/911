// @deno-types="https://raw.githubusercontent.com/sindresorhus/is/main/source/types.ts"
export * as is from "is";

import { lowerCase } from "./fmt.ts";

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
 * Check if a value is an Array.
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray<T>(value as Array<T>);
}

export function isArrayLike<T extends any>(value: unknown): value is ArrayLike<T> {
  return "length" in (value as ArrayLke<T>) && typeof value !== "function";
}

 * Promise, or maybe not
 */
export type Awaitable<T> = T | PromiseLike<T>

/**
 * Null or whatever
 */
export type Nullable<T> = T | null | undefined

/**
 * Array, or not yet
 */
export type Arrayable<T> = T | Array<T>

/**
 * Function
 */
export type Method<T = void> = () => T
export type Fn<T = void, A = any> = (...args: A[]) => T

/**
 * Constructor
 */
export type Constructor<T = void, A = void> = new (...args: A[]) => T

/**
 * Defines an intersection type of all union items.
 *
 * @param U Union of any types that will be intersected.
 * @returns U items intersected
 * @see https://stackoverflow.com/a/50375286/9259330
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

/**
 * Infers the arguments type of a function
 */
export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never

export type MergeInsertions<T> = T extends object ? { [K in keyof T]: MergeInsertions<T[K]> } : T

export type DeepMerge<F, S> = MergeInsertions<{
  [K in keyof F | keyof S]: K extends keyof S & keyof F
    ? DeepMerge<F[K], S[K]>
    : K extends keyof S
      ? S[K]
      : K extends keyof F
        ? F[K]
        : never;
}>

/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never

export type StringLiteralUnion<T extends U, U = string> = T | (U & {})

export type MockMap = Map<string, Record<string, string | null | (() => unknown)>>

export type MutableArray<T extends readonly any[]> = {
  -readonly [k in keyof T]: T[k];
}

export interface Constructable {
  new (...args: any[]): any
}


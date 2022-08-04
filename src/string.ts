import {
  camelCase,
  constantCase,
  constantCase as constCase,
  lowerCase,
  paramCase,
  paramCase as kebabCase,
  pascalCase,
  sentenceCase,
  snakeCase,
  titleCase,
  upperCase,
} from "case";

/**
 * Case manipulation utilities for strings.
 * @example import { case } from "https://deno.land/x/911/mod.ts";
 * case.title("hello wOrLd lol");
 * // Hello World Lol
 */
const _case = {
  /**
   * Convert a string to title case - capitalized words, separated by ` ` (space).
   * @example _.titleCase("hello_world")
   * // Hello World
   */
  title: titleCase,

  /**
   * Convert a string to "snake" case - all lowercase, separated by `_`.
   * @example _.snakeCase("Hello World")
   * // hello_world
   */
  snake: snakeCase,

  /**
   * Convert a string to "kebab" case - all lowercase, separated by `-`.
   * @example _.kebabCase("Testing KeBaB CaSe")
   * // testing-kebab-case
   */
  kebab: kebabCase,
  param: paramCase,

  /**
   * Convert a string to "camel" case - capitalized first letters of all
   * words except the first, the rest lowercase, no spaces.
   * @example _.camelCase("Testing camel case util")
   * // testingCamelCaseUtil
   */
  camel: camelCase,

  /**
   * Convert a string to "const" case - all uppercase, separated by `_`.
   * @example _.constCase("Const case test")
   * // CONST_CASE_TEST
   */
  const: constCase,
  constant: constantCase,

  /**
   * Convert a string to "pascal" case - all words capitalized, no spaces.
   * @example _.pascalCase("pascal case test")
   * // PascalCaseTest
   */
  pascal: pascalCase,

  /**
   * Convert a string to lowercase.
   * @example _.lowerCase("LOWERCASE")
   * // lowercase
   */
  lower: lowerCase,

  /**
   * Convert a string to uppercase.
   * @example _.upperCase("uppercase")
   * // UPPERCASE
   */
  upper: upperCase,

  /**
   * Convert a string to "sentence" case.
   * @example _.sentenceCase("SENTENCE CASE.")
   * // Sentence case.
   */
  sentence: sentenceCase,
};

export { _case as case };

/**
 * Safely encodes a string using `encodeURIComponent`.
 * @param v the string to encode
 * @returns
 */
export function encode(v: string) {
  return (/([%][a-f0-9]{2})/ig.test(v) ? v : encodeURIComponent(v));
}

/**
 * Safely decodes any URI components using `decodeURIComponent`.
 * @param v value to decode
 * @returns
 */
export function decode(v: string) {
  return decodeURIComponent(encode(v));
}

/**
 * Normalizes a string's case and whitespace to be used in URLs as a "slug".
 * @param str the string to "slugify"
 * @returns normalized, lowercase string, only non-alphanumeric chars
 */
export function slugify(str: string): string {
  return kebabCase(str)
    .replace(/[^a-z0-9-]+|[-]+/ig, "-")
    .replace(/^[-]+|[-]+$/g, "");
}

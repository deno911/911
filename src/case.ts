import {
  camelCase,
  constantCase as constCase,
  lowerCase,
  paramCase as kebabCase,
  pascalCase,
  sentenceCase,
  snakeCase,
  titleCase,
  upperCase,
} from "../deps.ts";

/**
 * Case manipulation utilities for strings.
 * @example import * as case from "./case.ts";
 * case.title("hello wOrLd lol");
 * // Hello World Lol
 */
export default {
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
  param: kebabCase,
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
  constant: constCase,
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

export {
  camelCase,
  constCase,
  kebabCase,
  lowerCase,
  pascalCase,
  sentenceCase,
  snakeCase,
  titleCase,
  upperCase,
};

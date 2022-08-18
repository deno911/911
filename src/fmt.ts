import {
  camelCase,
  constantCase,
  constCase,
  kebabCase,
  lowerCase,
  paramCase,
  pascalCase,
  sentenceCase,
  snakeCase,
  titleCase,
  upperCase,
} from "../deps.ts";

export {
  ansi,
  prettyBytes,
  type PrettyBytesOptions,
  printf,
  sprintf,
} from "../deps.ts";

export {
  camelCase,
  constantCase,
  constCase,
  kebabCase,
  lowerCase,
  paramCase,
  pascalCase,
  sentenceCase,
  snakeCase,
  titleCase,
  upperCase,
};

export const cases = {
  /**
   * Case manipulation utilities for strings.
   * ? by ` ` (space).
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

type Template = string;
type Values<
  K extends string = string,
  V = string | ((...args: string[]) => string),
> =
  | { [P in K]: V }
  | [K, V][]
  | V[];

export class Templette {
  #template = "";

  /**
   * Construct a new Templette instance from a template string.
   *
   * @param {Template} template - the raw template string we render with
   */
  constructor(template: Template) {
    this.template = template;
    return this;
  }

  /**
   * Render the template with provided values.
   *
   * @param {Values} values
   * @returns {string}
   */
  render(values: Values): string {
    return Templette.compile(this.template, values);
  }

  /**
   * Templette's main compile method, powered by JavaScript's powerful builtin RegExp engine.
   *
   * @example Templette.compile ('Hello {{name}}!', { name: 'Nick' })
   * // Hello Nick!
   * @param {Template} template - the raw template string we want to compile
   * @param {Values} values - substitutions to make, either as a generic list (for numbered keys), or as a map-style object to replace named keys or deep (dot-notation) paths.
   * @return {string}
   */
  compile(template: Template, values: Values): string {
    return Templette.compile(template, values);
  }

  /**
   * Templette's main compile method, powered by JavaScript's powerful builtin RegExp engine.
   *
   * @example Templette.compile ('Hello {{name}}!', { name: 'Nick' })
   * // Hello Nick!
   * @param {string} template - the raw template string we want to compile
   * @param {Values} values - substitutions to make, either as a generic list (for numbered keys), or as a map-style object to replace named keys or deep (dot-notation) paths.
   * @return {string}
   */
  static compile(template: string, values: Values): string {
    return template.replace(
      /[{]{1,3}\s*(.*?)\s*[}]{1,3}/g,
      (x: string | number, key: string | any, y: any) => {
        (x = 0), (y = values);
        key = key.trim().split(".");
        while (y && x < key.length) {
          y = y[key[x++]];
        }
        return y != null ? y : "";
      },
    );
  }

  /**
   * Cleanup a template string and remove some inconsistencies.
   * @param {string} template raw unformatted template string
   * @param {Record<string, unknown>} [substitutions] optional map of substitutions to make: each property name is the search pattern or string, and its value is the replacement string or function.
   * @returns {string} formatted and normalized template string
   */
  static cleanup(
    template: string,
    substitutions?: [string | RegExp, any][],
  ): string {
    substitutions = substitutions || [[
      /[{]{1}[\s ]?([\S]+)[\s ]?[}]{1}/g,
      (_m0: string, m1: string) => `{{${m1}}}`,
    ]];
    return substitutions.reduce(
      (t, [s, r]) => `${t}`.replace(s, r),
      String.prototype.toString.call(template),
    );
  }

  /**
   * Getter method for `.template` on instances of `Templette` that were constructed
   * using the `new Templette()` constructor method.
   * @example const t = new Templette();
   * console.log(t.template);
   * // null
   */
  get template() {
    return this.#template ?? null;
  }

  /**
   * Instance-level setter method for the `new Templette().template` property.
   * @param {string} str the template value to set
   */
  set template(str: string) {
    if (str) this.#template = Templette.cleanup(str);
  }
}

export { bytes, printf } from "../deps.ts";

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

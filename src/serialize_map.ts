/**
 * Custom extended version of the builtin `Map` interface. Serializes into a
 * valid `JSON` object (rather than `{}`, like its simple-minded cousin). Also
 * adds a `sort` method, getter/setters for `size`, a `toString` method, and
 * some internal Symbol properties.
 * @example ```ts
 * import { SerializeMap } from "./serialize_map.ts";
 *
 * const bad = new Map([
 *  ["1", "one"],
 *  ["2", "two"],
 *  ["3", "three"]
 * ]);
 *
 * JSON.stringify(bad);
 * // {}
 * // (standard Map does *not* serialize into JSON)
 *
 * // we can re-initialize a standard Map to a SerializeMap
 * const good = new SerializeMap(bad);
 *
 * JSON.stringify(good);
 * // { "1": "one", "2": "two", "3": "three" }
 * // (serialized into a valid JSON object)
 *
 * ```
 * @see {@link https://deno.land/x/911@0.1.2/src/serialize_map.ts}
 * @author Nicholas Berlette <https://github.com/nberlette>
 * @license MIT
 */
export class SerializeMap<T extends any> extends Map<string, T> {
  constructor(entries?: readonly (readonly [string, T])[]);
  constructor(initial?: Iterable<readonly [string, T]>);
  constructor(initial?: any) {
    return super(initial), this;
  }

  get [Symbol.species](): typeof SerializeMap {
    return SerializeMap<T>;
  }

  get [Symbol.toStringTag](): "SerializeMap" {
    return "SerializeMap" as const;
  }

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number {
    return hint === "number" ? this?.size! : this.toString?.();
  }

  toJSON() {
    return Object.fromEntries<T>(this.entries?.());
  }

  toString(): string {
    return JSON.stringify(this);
  }

  get size(): number {
    return super.size ?? 0;
  }

  set size(value: number) {
    let i = 0;
    for (const key of this.keys()) {
      i >= value && this.delete(key), i++;
    }
  }

  sort(desc = false): SerializeMap<T> {
    const entries = [...new SerializeMap(this).entries()] as Array<any>;
    entries.sort(([a], [b]) => a.localeCompare(b));
    this.clear();
    for (const [key, value] of (desc && entries.reverse(), entries)) {
      this.set(key, value);
    }
    return this;
  }

  override set(key: string, value: T): this {
    super.set(key, value);
    return this;
  }

  override delete(key: string): boolean {
    return super.delete(key);
  }

  override clear(): SerializeMap<T> {
    super.clear();
    return this;
  }
}

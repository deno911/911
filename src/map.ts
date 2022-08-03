/**
 * Simple extension of the JavaScript `Map` interface, with `JSON` support.
 * In contrast to the native `Map`, this will serialize into a valid `JSON`
 * object, rather than just an empty object (`{}`).
 * @example JSON.stringify(new SerializeMap([['1', 3], ['2', 4]]))
 * // { "1": 3, "2": 4 } - serialized to a valid JSON Object
 * @example JSON.stringify(new Map([['1', 3], ['2', 4]]))
 *  // {} - standard Map does *not* serialize to JSON!
 * @class SerializeMap
 * @extends Map
 * @see {@link https://github.com/deno911/x/blob/main/src/map.ts}
 * @author Nicholas Berlette <nick@berlette.com>
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

  [Symbol.toPrimitive](hint: "number"): number;

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number {
    return hint === "number" ? this?.size! : this.toString?.();
  }

  toJSON<R extends any = T>(): Record<string, R> {
    return Object.fromEntries<R>(
      [...this.entries?.()] as Iterable<[string, R]>,
    );
  }

  toString(): string {
    return JSON.stringify(this);
  }

  get size(): number {
    return super.size ?? 0;
  }

  set size(value: number) {
    let i = 0;
    const keys = [...this.keys()];
    for (const key of keys) {
      i >= value && this.delete(key), i++;
    }
  }

  sort(desc = false): SerializeMap<T> {
    const entries = [...new SerializeMap(this).entries()];
    entries.sort(([a], [b]) => a.localeCompare(b));
    this.clear();
    for (const [key, value] of (desc && entries.reverse(), entries)) {
      this.set(key, value);
    }
    return this;
  }
}

export default SerializeMap;

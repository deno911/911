/**
 * Simple extension of the JavaScript `Set` interface, with `JSON` support.
 * In contrast to the native `Set`, this will serialize into a valid `JSON`
 * array, rather than an empty object (`{}`).
 * @example JSON.stringify(new SerializeSet([1, 1, 2, 3]));
 * // [1, 2, 3] - serialized into a valid JSON array
 * @example JSON.stringify(new Set([1, 2, 2, 3]));
 * // {} - standard Set does *not* serialize into JSON
 * @class SerializeSet
 * @extends Set
 * @see {@link https://github.com/deno911/x/blob/main/src/set.ts}
 * @author Nicholas Berlette <nick@berlette.com>
 * @license MIT
 */
export class SerializeSet<T extends any> extends Set<T> {
  get [Symbol.species]() {
    return SerializeSet;
  }

  get [Symbol.toStringTag](): "SerializeSet" {
    return "SerializeSet" as const;
  }

  [Symbol.toPrimitive](hint: "number"): number;

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number {
    return hint === "number" ? this?.size! : this.toString();
  }

  toJSON(): T[] {
    return Array.from(this.values?.());
  }

  toString(): string {
    return JSON.stringify(this);
  }

  get size(): number {
    return super.size;
  }

  set size(value: number) {
    let i = 0;
    const values = [...this.values?.()];
    for (const val of values) {
      i >= value && this.delete(val), i++;
    }
  }

  sort(desc = false): SerializeSet<T> {
    const values = [...new SerializeSet(this).values()].sort();
    this.clear();
    for (const value of (desc && values.reverse(), values)) {
      this.add(value);
    }
    return this;
  }
}

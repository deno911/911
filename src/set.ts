/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/**
 * Extends the builtin `Set` interface, adding a `sort` method, getter/setters
 * for `size`, a `toString` method, and a `toJSON` method. Serializes into a
 * valid `JSON` array when passed to `JSON.stringify` (rather than `{}`, like
 * its simple-minded cousin, Set).
 * @example JSON.stringify(new SerializeSet([1, 1, 2, 3]));
 * // [1, 2, 3] - serialized into a valid JSON array
 * @example JSON.stringify(new Set([1, 2, 2, 3]));
 * // {} - standard Set does *not* serialize into JSON
 * @see {@link https://doc.deno.land/https://deno.land/x/911/src/set.ts}
 * @author Nicholas Berlette <https://github.com/nberlette>
 * @license MIT
 */
export class SerializeSet<T extends any> extends Set<T> {
  constructor(values?: readonly T[]);
  constructor(initial?: Iterable<T>);
  constructor(initial?: any) {
    return super(initial), this;
  }

  get [Symbol.toStringTag](): "SerializeSet" {
    return "SerializeSet" as const;
  }

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number {
    return hint === "number" ? this.size! : this.toString();
  }

  toJSON(): T[] {
    return Array.from(this.values());
  }

  toString(): string {
    return JSON.stringify(this);
  }

  get size(): number {
    return super.size;
  }

  set size(value: number){
    let i = 0;
    const values = [...this.values()];
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

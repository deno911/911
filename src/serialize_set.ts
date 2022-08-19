/**
 * Extends the builtin `Set` interface, adding a `sort` method, getter/setters
 * for `size`, a `toString` method, and a `toJSON` method. Serializes into a
 * valid `JSON` array when passed to `JSON.stringify` (rather than `{}`, like
 * its simple-minded cousin, Set).
 * @example ```ts
 * import { SerializeSet } from "https://deno.land/x/911@0.1.3/src/serialize_set.ts";
 *
 * const bad = new Set([1, 2, 3]);
 *
 * // The problem: Set does not play well with JSON
 * JSON.stringify(bad);
 * // {}
 *
 * // But if we re-initialize into a SerializeSet...
 * const good = new SerializeSet(bad);
 *
 * // ...we get a valid JSON array, and our headache is gone!
 * JSON.stringify(good);
 * // [1, 2, 3]
 * ```
 * @see {@link https://deno.land/x/911@0.1.3/src/serialize_set.ts}
 * @author Nicholas Berlette <https://github.com/nberlette>
 * @license MIT
 */
export class SerializeSet<T extends any> extends Set<T> {
  get [Symbol.toStringTag](): "SerializeSet" {
    return "SerializeSet" as const;
  }

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number {
    return hint === "number"
      ? this.size!
      : hint === "string"
      ? this.toString()
      : this.toJSON().toString();
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

  set size(value: number) {
    let i = 0;
    for (const v of this.values()) {
      i >= value && this.delete(v), i++;
    }
  }

  sort(desc = false): SerializeSet<T> {
    const values = [...this.values()].sort();
    desc && values.reverse();
    this.clear();
    for (const value of values) {
      this.add(value);
    }
    return this;
  }
}

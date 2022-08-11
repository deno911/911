/**
 * Create a new `TextEncoder` instance.
 */
export const utf8TextEncoder = new TextEncoder();

/**
 * Create a new `TextDecoder` instance.
 */
export const utf8TextDecoder = new TextDecoder();

/**
 * Convert a binary `ArrayBuffer` or `Uint8Array` to a hex string.
 * @param buffer
 * @returns
 */
export const toHex = (
  (buffer: Uint8Array | ArrayBuffer) =>
    Array.from(
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("")
);

/**
 * Generate a hash of a dataset using the specified crypto algorithm.
 * @param data the data to hash, either `string` or `Uint8Array`.
 * @param algorithm specify the algorithm, either as `string` or `object`.
 * @returns
 */
export async function computeHash(
  data: string | Uint8Array,
  algorithm: AlgorithmIdentifier = "SHA-1",
): Promise<string> {
  return await crypto.subtle.digest(
    algorithm,
    typeof data === "string" ? utf8TextEncoder.encode(data) : data,
  ).then(toHex);
}

/**
 * Shorthand for `computeHash(data, "SHA-1")`.
 * @param data
 * @returns
 */
export async function sha1(data: string | Uint8Array): Promise<string> {
  return await computeHash(data, "SHA-1");
}

/**
 * Shorthand for `computeHash(data, "SHA-256")`.
 * @param data
 * @returns
 */
export async function sha256(data: string | Uint8Array): Promise<string> {
  return await computeHash(data, "SHA-256");
}

/**
 * Shorthand for `computeHash(data, "SHA-512")`.
 * @param data
 * @returns
 */
export async function sha512(data: string | Uint8Array): Promise<string> {
  return await computeHash(data, "SHA-512");
}

/**
 * Generate a deterministic ETag for a given dataset.
 *
 * @param data the data to hash; any valid JavaScript value.
 * @param weak boolean to indicate whether to use a weak ETag.
 * @returns
 */
export async function eTag(data: any, weak = true): Promise<string> {
  const WEAK_LENGTH = 12;
  if ((typeof data !== "string") && !(data instanceof Uint8Array)) {
    try {
      data = JSON.stringify(data) as unknown as string;
    } catch {
      data = `${data}`;
    }
  }
  const hash = await sha1(data);
  return weak ? `W/${hash.slice(-1 * WEAK_LENGTH)}` : hash;
}

export { eTag as etag };

/**
 * Utilities and helpers
 */
export const uuid = () => crypto.randomUUID();

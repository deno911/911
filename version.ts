#!/usr/bin/env -S deno run --allow-read --allow-write

/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="esnext" />

import {
  bold as b,
  brightGreen as grn,
  brightRed as red,
  dim as d,
  italic as i,
  underline as u,
} from "https://deno.land/std@0.151.0/fmt/colors.ts";
import { prettyBytes as human } from "https://deno.land/std@0.151.0/fmt/bytes.ts";
import { ensureFile } from "https://deno.land/std@0.151.0/fs/ensure_file.ts";
import { expandGlob as glob } from "https://deno.land/std@0.151.0/fs/expand_glob.ts";
import { log } from "./src/log.ts";

/**
 * Unique module name, as it's published on the deno.land registry.
 */
export const MODULE = "911";

/**
 * `VERSION` managed by https://deno.land/x/publish
 */
export const VERSIONS = await readJson();
export const [VERSION = "0.0.0"] = VERSIONS;

/**
 * `prepublish` hook: invoked before publish.
 */
export async function prepublish(version: string) {
  await bump("./{README.md,LICENSE}", version);
  await bump("./{lib,src}/**/*.{js,jsx,ts,tsx}", version);
  await writeJson(version);
  // return false; // return a falsey value to prevent publishing.
}

/**
 * `postpublish` hook: invoked after publish.
 */
export function postpublish(version: string) {
  status("info", { label: "✓ PUBLISHED", filename: MODULE, version });
}

/**
 * Bump the version for a module across multiple files (via glob).
 * @param files
 * @param version
 */
async function bump(files: string, version: string) {
  for await (const file of glob(files)) {
    if (file.isFile) {
      const regex = new RegExp(
        `(?<=${MODULE}[@])([$]?VERSION|${VERSION}|[^/'"\s]+)`,
        "g",
      );
      const content = await Deno.readTextFile(file.path);
      const data = content.replace(regex, version);
      const size = data.length;
      const filename = file.name;

      await Deno.writeTextFile(
        file.path,
        data,
      ).then(() => {
        status("info", { label: "UPDATED", filename, version, size });
      }).catch((_) => {
        status("error", { label: "FAILED", filename, version, size });
      });
    }
  }
}

/**
 * Returns a parsed array of versions from the versions.json file, or creates
 * the file if it doesn't already exist. If starting from scratch, it will
 * attempt to populate versions.json with tags from the git repo.
 */
async function readJson(filename = "versions.json") {
  await ensureFile(filename);
  const tags = await readTags();
  try {
    const content = await Deno.readTextFile(filename).then(JSON.parse);
    return Array.isArray(content) ? content : (
      "versions" in content ? content.versions : (tags ?? [])
    );
  } catch {
    const data = JSON.stringify(tags ?? [], null, 2);
    await Deno.writeTextFile(filename, data)
      .then(() => status("warn", { label: "CREATED", filename }));
    return tags ?? [];
  }
}

/**
 * Updates the `VERSIONS` array and writes it to versions.json.
 */
async function writeJson(version: string, filename = "versions.json") {
  await ensureFile(filename);

  VERSIONS.unshift(version);
  const data = JSON.stringify([...new Set(VERSIONS)], null, 2);
  const size = data.length;

  await Deno.writeTextFile(filename, data)
    .then(() => status("info", { label: "UPDATED", version, filename, size }));
}

/**
 * Reads a list of tags from the active module's git repository (if any), and
 * returns a formatted array of versions. Used to populate the versions.json
 * file during initialization.
 */
async function readTags() {
  try {
    const p = Deno.run({
      cmd: ["git", "tag", "-l"],
      stdout: "piped",
    });
    const tags = await p.output()
      .then((o) => new TextDecoder().decode(o))
      .then((t) =>
        t.split(/\s*[\r\n]+\s*/g)
          .map((tag) => tag.trim())
          .filter((tag) => Boolean(tag) && tag != null && tag != "")
          .reverse()
      );
    return tags;
  } catch {
    return [];
  }
}

/**
 * Basic helper for logging status updates to the console.
 */
function status(level: "error" | "info" | "warn", {
  label,
  version,
  filename,
  size,
}: {
  label?: string;
  version?: string;
  filename?: string;
  size?: number;
} = {}) {
  log[level](
    [
      label && (level === "error" ? red : grn)(b(label.toUpperCase())),
      version && (u(version) + d(" →")),
      filename && i(u(filename)),
      size && d(human(size)),
    ].filter(Boolean).join(" "),
  );
}

#!/usr/bin/env deno run --allow-read --allow-write
/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="esnext" />

import {
  bold,
  brightGreen,
  brightRed,
  dim,
  italic,
  underline,
} from "https://deno.land/std@0.151.0/fmt/colors.ts";
import { prettyBytes } from "https://deno.land/std@0.151.0/fmt/bytes.ts";
import { ensureFile } from "https://deno.land/std@0.151.0/fs/ensure_file.ts";
import { expandGlob as glob } from "https://deno.land/std@0.151.0/fs/expand_glob.ts";
import log from "https://deno.land/x/911@0.0.5/src/log.ts";

/**
 * `VERSION` managed by https://deno.land/x/publish
 */
export const MODULE = "911";
export const VERSIONS = await readVersionJson();
export const [VERSION = "0.0.0"] = VERSIONS;

/**
 * `prepublish` hook: invoked before publish.
 */
export async function prepublish(version: string) {
  await bump("./{README.md,LICENSE}", version);
  await bump("./{lib,src}/**/*.{js,jsx,ts,tsx}", version);
  await writeVersionJson(version);
  // return false;
}

/**
 * `postpublish` hook: invoked after publish.
 */
export function postpublish(version: string) {
  log.info(
    `${bold(brightGreen("✓ PUBLISHED"))} ${underline(MODULE)} → ${version}`,
  );
}

/**
 * Bumps the version for a module across multiple files (specified via glob).
 * @param files
 * @param version
 */
async function bump(files: string, version: string) {
  for await (const file of glob(files)) {
    if (file.isFile) {
      const regex = new RegExp(
        `(?<=[/"'\s\b])(${MODULE})[@]([$]?VERSION|[{]{1,2}VERSION[}]{1,2}|[^\/\s"']+)(?=[/"'\s\b])`,
        "g",
      );
      const content = await Deno.readTextFile(file.path);
      const data = content.replace(regex, `$1@${version}`);

      await Deno.writeTextFile(
        file.path,
        data,
      ).then(() => {
        log.info(
          `UPDATED ${brightGreen(underline(version))} → ${
            italic(underline(file.name))
          } ${dim(`(${prettyBytes(data.length)})`)}`,
        );
      }).catch((e) => {
        log.error(
          `Failed to bump ${italic(underline(file.name))} → ${
            underline(version)
          }\n\n${dim(brightRed(e.toString()))}`,
        );
      });
    }
  }
}

/**
 * If called with no arguments, returns the parsed array of versions from the
 * versions.json file (or creates it if it doesn't exist). If called with a
 * version argument, it updates the `VERSIONS` array and writes it to the file.
 */
async function readVersionJson(filename = "versions.json") {
  await ensureFile(filename);
  try {
    const content = await Deno.readTextFile(filename).then(JSON.parse);
    return Array.isArray(content) ? content : (
      "versions" in content ? content.versions : []
    );
  } catch {
    const data = JSON.stringify([], null, 2);
    await Deno.writeTextFile(filename, data);
    log.warn(
      `CREATED ${italic(underline(filename))} ${
        dim(`(${prettyBytes(data.length)})`)
      }`,
    );
    return [];
  }
}

async function writeVersionJson(version: string, filename = "versions.json") {
  await ensureFile(filename);
  VERSIONS.unshift(version);
  const data = JSON.stringify([...new Set(VERSIONS)], null, 2);
  await Deno.writeTextFile(filename, data).then(() => {
    log.info(
      `UPDATED ${brightGreen(underline(version))} → ${
        italic(underline(filename))
      } ${dim(`(${prettyBytes(data.length)})`)}`,
    );
  });
}

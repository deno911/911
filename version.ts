/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="esnext" />

import { ansi, snakeCase } from "./src/fmt.ts";
import { expandGlob } from "https://deno.land/std@0.151.0/fs/expand_glob.ts";
import * as path from "https://deno.land/std@0.151.0/path/mod.ts";

/**
 * `VERSION` managed by https://deno.land/x/publish
 */
export const VERSION = "0.0.5";

export const MODULE = "911";

/** `prepublish` will be invoked before publish */
export async function prepublish(version: string) {
  // always bump the readme.md file to the new version
  await bump("./README.md", version);
  for await (const file of expandGlob("./src/**/*.{js,jsx,ts,tsx}")) {
    if (file.isFile) {
      console.log("Bump %s to %s", file.name, version);
      await bump(file.path, version);
    }
  }
  // uncomment this to prevent publishing (dry run)
  // return false;
}

/** `prepublish` will be invoked after publish */
export function postpublish(version: string) {
  console.log(
    ansi.bold(ansi.brightGreen(" ✓ PUBLISHED ")),
    ansi.underline(MODULE + "@" + version),
  );
}

async function bump(filename: string, version: string) {
  try {
    const module_regex = new RegExp(
      `(?<=[/"'\s])(${MODULE})[@]([{]{1,2}VERSION[}]{1,2}|\$VERSION|[^/"'\s]+)(?=[/"'\s])`,
      "ig",
    );
    const content = await Deno.readTextFile(filename);

    await Deno.writeTextFile(
      filename,
      content.replace(module_regex, `$1@${version}`),
    );
  } catch (e) {
    console.error(
      ansi.bold(ansi.brightRed(" ⚠︎ FAILED ")),
      `unable to bump ${
        ansi.underline(ansi.italic(path.basename(filename)))
      } to ${ansi.bold(version)}!\n\n${e}`,
    );
  }
}

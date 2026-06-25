import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Skill } from "../src/types.js";

const here = dirname(fileURLToPath(import.meta.url));

/** Absolute path to a file under `test/fixtures`. */
export function fixture(...parts: string[]): string {
  return join(here, "fixtures", ...parts);
}

/** Two small synthetic skills used by the golden-file adapter tests. */
export const alpha: Skill = {
  name: "alpha",
  description: "The alpha skill.",
  version: "0.0.0",
  frontmatter: {},
  body: "# Alpha\n\nDo alpha things.\n",
};

export const beta: Skill = {
  name: "beta",
  description: "The beta skill.",
  version: "0.0.0",
  frontmatter: {},
  body: "# Beta\n\nDo beta things.\n",
};

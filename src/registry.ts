import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import type { Skill } from "./types.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to the vendored source skills.
 *
 * This module lives at `src/registry.ts` in dev and `dist/registry.js` once
 * built; in both cases the vendored `skills/` directory sits one level up.
 */
export const skillsDir = resolve(moduleDir, "..", "skills");

/** Absolute path to a vendored skill's source `SKILL.md`. */
export function skillSourcePath(name: string): string {
  return join(skillsDir, name, "SKILL.md");
}

/** Read one vendored `SKILL.md` and normalize it into a `Skill`. */
export function loadSkill(name: string): Skill {
  const raw = readFileSync(skillSourcePath(name), "utf8");
  const parsed = matter(raw);
  const frontmatter = parsed.data as Record<string, unknown>;
  return {
    name: typeof frontmatter.name === "string" ? frontmatter.name : name,
    description:
      typeof frontmatter.description === "string" ? frontmatter.description : "",
    frontmatter,
    body: parsed.content.replace(/^\s+/, ""),
  };
}

/** Discover and load every vendored source skill. */
export function loadSkills(): Skill[] {
  return readdirSync(skillsDir)
    .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
    .map((dir) => loadSkill(dir))
    .sort((a, b) => a.name.localeCompare(b.name));
}

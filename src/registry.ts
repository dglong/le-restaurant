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

/**
 * Parse raw `SKILL.md` content into a normalized `Skill`.
 *
 * Exported so tests can call it directly with inline content without touching
 * the file system.  `loadSkill` delegates here.
 */
export function parseSkillContent(raw: string, name: string): Skill {
  const parsed = matter(raw);
  const frontmatter = parsed.data as Record<string, unknown>;

  let version: string;
  if (typeof frontmatter.version === "string" && frontmatter.version.length > 0) {
    version = frontmatter.version;
  } else {
    console.warn(
      `[le-restaurant] skill "${name}" has no version in its SKILL.md frontmatter — falling back to "0.0.0". Add a semver version: field.`,
    );
    version = "0.0.0";
  }

  return {
    name: typeof frontmatter.name === "string" ? frontmatter.name : name,
    description:
      typeof frontmatter.description === "string" ? frontmatter.description : "",
    version,
    frontmatter,
    body: parsed.content.replace(/^\s+/, ""),
  };
}

/** Read one vendored `SKILL.md` and normalize it into a `Skill`. */
export function loadSkill(name: string): Skill {
  const raw = readFileSync(skillSourcePath(name), "utf8");
  return parseSkillContent(raw, name);
}

/** Discover and load every vendored source skill. */
export function loadSkills(): Skill[] {
  return readdirSync(skillsDir)
    .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
    .map((dir) => loadSkill(dir))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Core domain types shared across the registry, adapters, and writer.
 * These are the foundational shared surfaces — every later ticket builds on them.
 */

/** A normalized source skill, parsed from a `SKILL.md` (frontmatter + body). */
export interface Skill {
  /** Skill identifier, e.g. "chef-de-rang" (from frontmatter, falls back to dir name). */
  name: string;
  /** One-line description from frontmatter. */
  description: string;
  /** Full parsed frontmatter as a key/value map. */
  frontmatter: Record<string, unknown>;
  /** The markdown body after the frontmatter, verbatim. */
  body: string;
  /** Optional relative paths to bundled assets that ship with the skill. */
  assets?: string[];
}

/** A coding agent we can translate skills for. */
export interface Agent {
  id: "claude" | "codex" | "gemini";
  label: string;
}

/** How a single emitted file should be written to the target tree. */
export type WriteMode = "create" | "overwrite" | "merge";

/** One file an adapter wants written to the target project. */
export interface FileOutput {
  /** Path relative to `InstallContext.targetDir`. */
  path: string;
  /** Full file contents to write. */
  contents: string;
  /** Write strategy the writer should apply. */
  mode: WriteMode;
}

/** How the writer resolves a collision with an existing file. */
export type ConflictPolicy = "skip" | "overwrite" | "merge";

/** Everything an adapter needs to know to translate a set of skills. */
export interface InstallContext {
  /** Absolute path to the target project root. */
  targetDir: string;
  /** The skills the user chose to install. */
  selectedSkills: Skill[];
  /** What to do when an output file already exists. */
  conflictPolicy: ConflictPolicy;
}

/**
 * Source-skill sync check.
 *
 * The four skills have a canonical home in `.claude/skills/` (the copy Claude
 * Code itself loads during development) and are *vendored* into `skills/` for
 * distribution in the published package. Those two copies must stay identical —
 * if they drift, users install something different from what we develop against.
 *
 * This module compares the two trees and reports any drift. The comparison core
 * (`compareSkillTrees`) is a pure function over two directories so it is unit
 * testable; `checkSkillsSync` points it at the real repo locations. Run directly
 * (`npm run check:sync`) it prints problems and exits non-zero — the CI gate.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { skillsDir } from "../src/registry.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/** Repo root — this module lives at `<root>/scripts/check-skills-sync.ts`. */
const packageRoot = resolve(moduleDir, "..");

/** Canonical source of truth: the skills Claude Code loads in development. */
export const canonicalSkillsDir = resolve(packageRoot, ".claude", "skills");

/** A single way the vendored copy has drifted from the canonical source. */
export interface SyncProblem {
  /** The skill directory name. */
  skill: string;
  /** What kind of drift. */
  kind: "missing-vendored" | "missing-canonical" | "content-drift";
  /** Human-readable detail for the CLI report. */
  detail: string;
}

/** List the immediate subdirectory names of `dir` (empty if `dir` is absent). */
function skillDirNames(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((entry) =>
    statSync(join(dir, entry)).isDirectory(),
  );
}

function readSkill(dir: string, name: string): string | null {
  const path = join(dir, name, "SKILL.md");
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

/**
 * Compare a canonical skills tree against a vendored one.
 *
 * For every skill present in either tree, report it if its `SKILL.md` is
 * missing on one side or differs byte-for-byte between the two. An empty result
 * means the vendored copy is a faithful mirror of the canonical source.
 */
export function compareSkillTrees(
  canonicalDir: string,
  vendoredDir: string,
): SyncProblem[] {
  const names = new Set([
    ...skillDirNames(canonicalDir),
    ...skillDirNames(vendoredDir),
  ]);
  const problems: SyncProblem[] = [];

  for (const skill of [...names].sort()) {
    const canonical = readSkill(canonicalDir, skill);
    const vendored = readSkill(vendoredDir, skill);

    if (canonical === null) {
      problems.push({
        skill,
        kind: "missing-canonical",
        detail: `"${skill}" is vendored but has no canonical .claude/skills/${skill}/SKILL.md`,
      });
    } else if (vendored === null) {
      problems.push({
        skill,
        kind: "missing-vendored",
        detail: `"${skill}" is canonical but missing from the vendored skills/${skill}/SKILL.md`,
      });
    } else if (canonical !== vendored) {
      problems.push({
        skill,
        kind: "content-drift",
        detail: `"${skill}" SKILL.md differs between .claude/skills/ and skills/`,
      });
    }
  }

  return problems;
}

/** Run the comparison against the real repo locations. */
export function checkSkillsSync(): SyncProblem[] {
  return compareSkillTrees(canonicalSkillsDir, skillsDir);
}

/** CLI entry: print any drift and exit non-zero so CI fails on it. */
function main(): void {
  const problems = checkSkillsSync();
  if (problems.length === 0) {
    console.log("✓ Vendored skills/ are in sync with canonical .claude/skills/");
    return;
  }
  console.error("✗ Source-skill sync check failed:");
  for (const p of problems) console.error(`  - ${p.detail}`);
  console.error(
    "\nRe-vendor the skills so skills/ mirrors .claude/skills/ exactly.",
  );
  process.exitCode = 1;
}

// Run only when executed directly, not when imported by tests.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}

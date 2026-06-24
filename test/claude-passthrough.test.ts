import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { claudeAdapter } from "../src/adapters/claude.js";
import { loadSkills, skillsDir } from "../src/registry.js";
import type { InstallContext } from "../src/types.js";
import { writeOutputs } from "../src/writer.js";

describe("claude passthrough adapter + writer", () => {
  let target: string;

  beforeEach(() => {
    target = mkdtempSync(join(tmpdir(), "le-restaurant-"));
  });

  afterEach(() => {
    rmSync(target, { recursive: true, force: true });
  });

  it("emits one .claude/skills/<name>/SKILL.md per skill", () => {
    const skills = loadSkills();
    const ctx: InstallContext = {
      targetDir: target,
      selectedSkills: skills,
      conflictPolicy: "overwrite",
    };
    const outputs = claudeAdapter.translate(skills, ctx);
    const paths = outputs.map((o) => o.path).sort();
    expect(paths).toEqual([
      ".claude/skills/chef-de-rang/SKILL.md",
      ".claude/skills/maitre-d/SKILL.md",
      ".claude/skills/mise-en-place/SKILL.md",
      ".claude/skills/sous-chef/SKILL.md",
    ]);
  });

  it("installs all four skills byte-identical to source", () => {
    const skills = loadSkills();
    const ctx: InstallContext = {
      targetDir: target,
      selectedSkills: skills,
      conflictPolicy: "overwrite",
    };
    const outputs = claudeAdapter.translate(skills, ctx);
    writeOutputs(outputs, ctx);

    for (const skill of skills) {
      const source = readFileSync(
        join(skillsDir, skill.name, "SKILL.md"),
      );
      const installed = readFileSync(
        join(target, ".claude", "skills", skill.name, "SKILL.md"),
      );
      expect(installed.equals(source)).toBe(true);
    }
  });
});

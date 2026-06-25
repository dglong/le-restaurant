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
      ".claude/agents/chef-de-rang.md",
      ".claude/skills/chef-de-rang/SKILL.md",
      ".claude/skills/maitre-d/SKILL.md",
      ".claude/skills/mise-en-place/SKILL.md",
      ".claude/skills/sous-chef/SKILL.md",
    ]);
  });

  it("emits a model-pinned chef-de-rang agent definition from the skill body", () => {
    const skills = loadSkills();
    const ctx: InstallContext = {
      targetDir: target,
      selectedSkills: skills,
      conflictPolicy: "overwrite",
    };
    const outputs = claudeAdapter.translate(skills, ctx);

    // The existing passthrough outputs still exist.
    const skillPaths = outputs.map((o) => o.path);
    for (const skill of skills) {
      expect(skillPaths).toContain(`.claude/skills/${skill.name}/SKILL.md`);
    }

    const agent = outputs.find((o) => o.path === ".claude/agents/chef-de-rang.md");
    expect(agent).toBeDefined();
    if (!agent) return;

    const chef = skills.find((s) => s.name === "chef-de-rang");
    expect(chef).toBeDefined();
    if (!chef) return;

    // Frontmatter: name, description, the Sonnet floor, and a tools line.
    expect(agent.contents).toMatch(/^---\n/);
    expect(agent.contents).toContain("name: chef-de-rang");
    expect(agent.contents).toContain(`description: ${chef.description}`);
    expect(agent.contents).toContain("model: sonnet");
    expect(agent.contents).toMatch(/^tools: .+/m);

    // Body is generated from the skill body.
    expect(agent.contents).toContain(chef.body);
  });

  it("omits the agent definition when chef-de-rang is not selected", () => {
    const skills = loadSkills().filter((s) => s.name !== "chef-de-rang");
    const ctx: InstallContext = {
      targetDir: target,
      selectedSkills: skills,
      conflictPolicy: "overwrite",
    };
    const outputs = claudeAdapter.translate(skills, ctx);
    expect(outputs.some((o) => o.path === ".claude/agents/chef-de-rang.md")).toBe(
      false,
    );
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

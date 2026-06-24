import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkSkillsSync, compareSkillTrees } from "../scripts/check-skills-sync.js";

function makeSkill(root: string, name: string, body: string): void {
  mkdirSync(join(root, name), { recursive: true });
  writeFileSync(join(root, name, "SKILL.md"), body);
}

describe("compareSkillTrees", () => {
  const dirs: string[] = [];
  function tmp(): string {
    const d = mkdtempSync(join(tmpdir(), "skills-sync-"));
    dirs.push(d);
    return d;
  }
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  it("reports no problems when canonical and vendored match byte-for-byte", () => {
    const canonical = tmp();
    const vendored = tmp();
    makeSkill(canonical, "alpha", "# Alpha\n");
    makeSkill(vendored, "alpha", "# Alpha\n");
    expect(compareSkillTrees(canonical, vendored)).toEqual([]);
  });

  it("flags content drift between the two copies", () => {
    const canonical = tmp();
    const vendored = tmp();
    makeSkill(canonical, "alpha", "# Alpha\n");
    makeSkill(vendored, "alpha", "# Alpha CHANGED\n");
    const problems = compareSkillTrees(canonical, vendored);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ skill: "alpha", kind: "content-drift" });
  });

  it("flags a skill present in canonical but missing from the vendored copy", () => {
    const canonical = tmp();
    const vendored = tmp();
    makeSkill(canonical, "alpha", "# Alpha\n");
    const problems = compareSkillTrees(canonical, vendored);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ skill: "alpha", kind: "missing-vendored" });
  });

  it("flags a skill present in vendored but missing from the canonical source", () => {
    const canonical = tmp();
    const vendored = tmp();
    makeSkill(vendored, "alpha", "# Alpha\n");
    const problems = compareSkillTrees(canonical, vendored);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ skill: "alpha", kind: "missing-canonical" });
  });
});

describe("checkSkillsSync (real repo)", () => {
  it("vendored skills/ are in sync with the canonical .claude/skills/ source", () => {
    expect(checkSkillsSync()).toEqual([]);
  });
});

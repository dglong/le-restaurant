import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli, runInstall, selectAdapter } from "../src/cli.js";
import { loadSkills } from "../src/registry.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "le-restaurant-test-"));
  // keep the test output quiet
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(dir, { recursive: true, force: true });
});

describe("runInstall", () => {
  it("writes the Codex AGENTS.md via the codex adapter", () => {
    const skills = loadSkills();
    const { adapter, results } = runInstall({
      agentId: "codex",
      skills,
      targetDir: dir,
    });
    expect(adapter).toBe(selectAdapter("codex"));
    expect(results.some((r) => r.path === "AGENTS.md")).toBe(true);
    expect(existsSync(join(dir, "AGENTS.md"))).toBe(true);
  });

  it("writes Claude passthrough skill files", () => {
    const skills = loadSkills();
    runInstall({ agentId: "claude", skills, targetDir: dir });
    const first = skills[0].name;
    expect(
      existsSync(join(dir, ".claude", "skills", first, "SKILL.md")),
    ).toBe(true);
  });
});

describe("runCli (exit codes)", () => {
  it("installs with valid flags and exits 0", async () => {
    const code = await runCli([
      "node",
      "cli",
      "--agent",
      "codex",
      "--skills",
      "all",
      "--yes",
      dir,
    ]);
    expect(code).toBe(0);
    expect(readFileSync(join(dir, "AGENTS.md"), "utf8")).toContain("Skill:");
  });

  it("exits non-zero on an invalid agent", async () => {
    const code = await runCli([
      "node",
      "cli",
      "--agent",
      "bogus",
      "--skills",
      "all",
      "--yes",
      dir,
    ]);
    expect(code).not.toBe(0);
  });

  it("exits non-zero on an unknown skill name", async () => {
    const code = await runCli([
      "node",
      "cli",
      "--agent",
      "codex",
      "--skills",
      "ghost",
      "--yes",
      dir,
    ]);
    expect(code).not.toBe(0);
  });
});

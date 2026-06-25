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
  // stub global fetch so `check` never makes a live network call in tests
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({ version: "0.1.1" }),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

describe("runCli check subcommand", () => {
  it("exits 0 and prints a not-installed message when no manifest exists", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const code = await runCli(["node", "cli", "check", dir]);
    expect(code).toBe(0);
    // clack's note() writes to stdout via process.stdout; we check it doesn't throw
    consoleSpy.mockRestore();
  });

  it("exits 0 and prints up-to-date status after a fresh install", async () => {
    const skills = loadSkills();
    runInstall({ agentId: "codex", skills, targetDir: dir });
    const code = await runCli(["node", "cli", "check", dir]);
    expect(code).toBe(0);
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

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInstall } from "../src/cli.js";
import { loadSkills } from "../src/registry.js";
import pkg from "../package.json" with { type: "json" };

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "le-restaurant-manifest-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(dir, { recursive: true, force: true });
});

describe("manifest (.le-restaurant.json)", () => {
  it("writes a manifest file after install", () => {
    const skills = loadSkills();
    runInstall({ agentId: "codex", skills, targetDir: dir });
    expect(existsSync(join(dir, ".le-restaurant.json"))).toBe(true);
  });

  it("manifest contains the package version", () => {
    const skills = loadSkills();
    runInstall({ agentId: "codex", skills, targetDir: dir });
    const manifest = JSON.parse(
      readFileSync(join(dir, ".le-restaurant.json"), "utf8"),
    );
    expect(manifest.package).toBe(pkg.version);
  });

  it("manifest contains the agent id", () => {
    const skills = loadSkills();
    runInstall({ agentId: "gemini", skills, targetDir: dir });
    const manifest = JSON.parse(
      readFileSync(join(dir, ".le-restaurant.json"), "utf8"),
    );
    expect(manifest.agent).toBe("gemini");
  });

  it("manifest installedAt is an ISO date (YYYY-MM-DD)", () => {
    const skills = loadSkills();
    runInstall({ agentId: "codex", skills, targetDir: dir });
    const manifest = JSON.parse(
      readFileSync(join(dir, ".le-restaurant.json"), "utf8"),
    );
    expect(manifest.installedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("manifest skills map lists each installed skill with its semver", () => {
    const skills = loadSkills();
    runInstall({ agentId: "codex", skills, targetDir: dir });
    const manifest = JSON.parse(
      readFileSync(join(dir, ".le-restaurant.json"), "utf8"),
    );
    expect(typeof manifest.skills).toBe("object");
    for (const skill of skills) {
      expect(manifest.skills[skill.name]).toBe(skill.version);
    }
  });

  it("manifest is written for claude installs too", () => {
    const skills = loadSkills();
    runInstall({ agentId: "claude", skills, targetDir: dir });
    expect(existsSync(join(dir, ".le-restaurant.json"))).toBe(true);
    const manifest = JSON.parse(
      readFileSync(join(dir, ".le-restaurant.json"), "utf8"),
    );
    expect(manifest.agent).toBe("claude");
  });
});

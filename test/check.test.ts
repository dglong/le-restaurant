import { describe, expect, it, vi } from "vitest";
import {
  compareVersions,
  checkSkills,
  fetchLatestNpmVersion,
  checkNpmFreshness,
  type SkillStatus,
} from "../src/check.js";
import type { InstallManifest } from "../src/types.js";

// ---------------------------------------------------------------------------
// compareVersions — pure semver comparison helper
// ---------------------------------------------------------------------------

describe("compareVersions", () => {
  it("returns 0 when versions are equal", () => {
    expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
  });

  it("returns negative when a < b (patch)", () => {
    expect(compareVersions("1.2.3", "1.2.4")).toBeLessThan(0);
  });

  it("returns positive when a > b (patch)", () => {
    expect(compareVersions("1.2.4", "1.2.3")).toBeGreaterThan(0);
  });

  it("returns negative when a < b (minor)", () => {
    expect(compareVersions("1.1.0", "1.2.0")).toBeLessThan(0);
  });

  it("returns positive when a > b (major)", () => {
    expect(compareVersions("2.0.0", "1.9.9")).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// checkSkills — pure comparison: manifest + bundled → per-skill status
// ---------------------------------------------------------------------------

const BUNDLED: Record<string, string> = {
  "chef-de-rang": "1.2.0",
  "mise-en-place": "2.0.0",
  "sous-chef": "0.5.0",
};

describe("checkSkills", () => {
  it("marks every skill up-to-date when versions match", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "claude",
      installedAt: "2026-06-01",
      skills: {
        "chef-de-rang": "1.2.0",
        "mise-en-place": "2.0.0",
        "sous-chef": "0.5.0",
      },
    };

    const result = checkSkills(manifest, BUNDLED);
    for (const status of result) {
      expect(status.status).toBe("up-to-date");
    }
    expect(result).toHaveLength(3);
  });

  it("marks a skill stale when installed version is behind bundled", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "claude",
      installedAt: "2026-06-01",
      skills: {
        "chef-de-rang": "1.1.0", // behind 1.2.0
        "mise-en-place": "2.0.0",
        "sous-chef": "0.5.0",
      },
    };

    const result = checkSkills(manifest, BUNDLED);
    const stale = result.filter((s) => s.status === "stale (local)");
    const fresh = result.filter((s) => s.status === "up-to-date");

    expect(stale).toHaveLength(1);
    expect(stale[0].name).toBe("chef-de-rang");
    expect(stale[0].installedVersion).toBe("1.1.0");
    expect(stale[0].bundledVersion).toBe("1.2.0");
    expect(fresh).toHaveLength(2);
  });

  it("marks multiple stale skills correctly", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "codex",
      installedAt: "2026-06-01",
      skills: {
        "chef-de-rang": "1.0.0", // behind 1.2.0
        "mise-en-place": "1.9.9", // behind 2.0.0
        "sous-chef": "0.5.0",    // equal
      },
    };

    const result = checkSkills(manifest, BUNDLED);
    const stale = result.filter((s) => s.status === "stale (local)");
    expect(stale).toHaveLength(2);
    expect(stale.map((s) => s.name).sort()).toEqual(
      ["chef-de-rang", "mise-en-place"].sort(),
    );
  });

  it("handles a skill in the manifest not present in bundled (reports unknown)", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "claude",
      installedAt: "2026-06-01",
      skills: {
        "ghost-skill": "1.0.0",
      },
    };

    const result = checkSkills(manifest, BUNDLED);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("unknown");
    expect(result[0].name).toBe("ghost-skill");
  });

  it("returns an empty array when manifest has no skills", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "claude",
      installedAt: "2026-06-01",
      skills: {},
    };
    expect(checkSkills(manifest, BUNDLED)).toEqual([]);
  });

  it("includes bundledVersion and installedVersion in every status entry", () => {
    const manifest: InstallManifest = {
      package: "0.1.0",
      agent: "claude",
      installedAt: "2026-06-01",
      skills: { "chef-de-rang": "1.2.0" },
    };
    const result = checkSkills(manifest, BUNDLED);
    expect(result[0].bundledVersion).toBe("1.2.0");
    expect(result[0].installedVersion).toBe("1.2.0");
  });
});

// ---------------------------------------------------------------------------
// fetchLatestNpmVersion — registry fetch, injectable for mocking (no live net)
// ---------------------------------------------------------------------------

describe("fetchLatestNpmVersion", () => {
  it("returns the latest version when registry responds 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ version: "0.2.0" }),
    });
    const result = await fetchLatestNpmVersion(
      "@long.dg/le-restaurant",
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toBe("0.2.0");
  });

  it("returns null when fetch throws (network offline)", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network error"));
    const result = await fetchLatestNpmVersion(
      "@long.dg/le-restaurant",
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toBeNull();
  });

  it("returns null when registry returns a non-200 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false });
    const result = await fetchLatestNpmVersion(
      "@long.dg/le-restaurant",
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toBeNull();
  });

  it("URL-encodes the '/' in a scoped package name", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ version: "0.1.1" }),
    });
    await fetchLatestNpmVersion(
      "@long.dg/le-restaurant",
      mockFetch as unknown as typeof fetch,
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://registry.npmjs.org/@long.dg%2Fle-restaurant/latest",
    );
  });

  it("returns null when the registry JSON lacks a version field", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ name: "@long.dg/le-restaurant" }), // no version
    });
    const result = await fetchLatestNpmVersion(
      "@long.dg/le-restaurant",
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkNpmFreshness — pure comparison of installed vs. registry latest
// ---------------------------------------------------------------------------

describe("checkNpmFreshness", () => {
  it("returns 'update available (npm)' when installed is behind latest", () => {
    expect(checkNpmFreshness("0.1.0", "0.2.0")).toBe("update available (npm)");
  });

  it("returns 'up-to-date (npm)' when versions are equal", () => {
    expect(checkNpmFreshness("0.1.1", "0.1.1")).toBe("up-to-date (npm)");
  });

  it("returns 'up-to-date (npm)' when installed is ahead of latest (pre-release scenario)", () => {
    expect(checkNpmFreshness("0.2.0", "0.1.0")).toBe("up-to-date (npm)");
  });
});

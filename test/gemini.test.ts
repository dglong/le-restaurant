import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { geminiAdapter } from "../src/adapters/gemini.js";
import type { InstallContext } from "../src/types.js";
import { writeOutputs } from "../src/writer.js";
import { alpha, beta, fixture } from "./helpers.js";

describe("gemini import adapter", () => {
  let target: string;

  beforeEach(() => {
    target = mkdtempSync(join(tmpdir(), "le-restaurant-gemini-"));
  });

  afterEach(() => {
    rmSync(target, { recursive: true, force: true });
  });

  function ctxFor(policy: InstallContext["conflictPolicy"]): InstallContext {
    return { targetDir: target, selectedSkills: [alpha, beta], conflictPolicy: policy };
  }

  it("emits one skill file per skill plus a GEMINI.md import file", () => {
    const outputs = geminiAdapter.translate([alpha, beta], ctxFor("merge"));
    const paths = outputs.map((o) => o.path).sort();
    expect(paths).toEqual([
      ".gemini/skills/alpha.md",
      ".gemini/skills/beta.md",
      "GEMINI.md",
    ]);
    const gemini = outputs.find((o) => o.path === "GEMINI.md");
    expect(gemini?.mode).toBe("merge");
  });

  it("matches golden skill files and GEMINI.md import block", () => {
    const outputs = geminiAdapter.translate([alpha, beta], ctxFor("merge"));
    const byPath = new Map(outputs.map((o) => [o.path, o.contents]));
    expect(byPath.get(".gemini/skills/alpha.md")).toBe(
      readFileSync(fixture("gemini", "alpha.golden.md"), "utf8"),
    );
    expect(byPath.get(".gemini/skills/beta.md")).toBe(
      readFileSync(fixture("gemini", "beta.golden.md"), "utf8"),
    );
    expect(byPath.get("GEMINI.md")).toBe(
      readFileSync(fixture("gemini", "GEMINI.golden.md"), "utf8"),
    );
  });

  it("re-run is idempotent — GEMINI.md import block does not duplicate", () => {
    const outputs = geminiAdapter.translate([alpha, beta], ctxFor("merge"));
    writeOutputs(outputs, ctxFor("merge"));
    const after1 = readFileSync(join(target, "GEMINI.md"), "utf8");
    // run again
    writeOutputs(geminiAdapter.translate([alpha, beta], ctxFor("merge")), ctxFor("merge"));
    const after2 = readFileSync(join(target, "GEMINI.md"), "utf8");
    expect(after2).toBe(after1);
    expect(after2.match(/@\.\/\.gemini\/skills\/alpha\.md/g)?.length).toBe(1);
  });
});

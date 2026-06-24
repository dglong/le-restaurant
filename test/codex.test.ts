import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { codexAdapter } from "../src/adapters/codex.js";
import { MARKER_END, MARKER_START } from "../src/markers.js";
import type { InstallContext } from "../src/types.js";
import { writeOutputs } from "../src/writer.js";
import { alpha, beta, fixture } from "./helpers.js";

describe("codex merge adapter", () => {
  let target: string;

  beforeEach(() => {
    target = mkdtempSync(join(tmpdir(), "le-restaurant-codex-"));
  });

  afterEach(() => {
    rmSync(target, { recursive: true, force: true });
  });

  function ctxFor(policy: InstallContext["conflictPolicy"]): InstallContext {
    return { targetDir: target, selectedSkills: [alpha, beta], conflictPolicy: policy };
  }

  it("emits a single AGENTS.md as a merge output", () => {
    const outputs = codexAdapter.translate([alpha, beta], ctxFor("merge"));
    expect(outputs).toHaveLength(1);
    expect(outputs[0].path).toBe("AGENTS.md");
    expect(outputs[0].mode).toBe("merge");
  });

  it("matches the golden AGENTS.md (one ## Skill section per skill, in markers)", () => {
    const outputs = codexAdapter.translate([alpha, beta], ctxFor("merge"));
    const golden = readFileSync(fixture("codex", "AGENTS.golden.md"), "utf8");
    expect(outputs[0].contents).toBe(golden);
  });

  it("re-run updates between markers without touching surrounding user content", () => {
    const agents = join(target, "AGENTS.md");
    const userTop = "# My project\n\nMy own AGENTS guidance.\n\n";
    const userBottom = "\n## My own trailing section\n\nKeep me.\n";

    // First install onto a file that already has user content above and below.
    const first = codexAdapter.translate([alpha], ctxFor("merge"));
    writeFileSync(agents, `${userTop}${first[0].contents}${userBottom}`);

    // Re-run with a different skill set; managed span should be replaced only.
    const second = codexAdapter.translate([alpha, beta], ctxFor("merge"));
    writeOutputs(second, ctxFor("merge"));

    const result = readFileSync(agents, "utf8");
    expect(result.startsWith(userTop)).toBe(true);
    expect(result.endsWith(userBottom)).toBe(true);
    expect(result).toContain("## Skill: beta");
    // exactly one managed region
    expect(result.match(new RegExp(MARKER_START, "g"))?.length).toBe(1);
    expect(result.match(new RegExp(MARKER_END, "g"))?.length).toBe(1);
  });
});

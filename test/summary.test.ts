import { describe, expect, it } from "vitest";
import { renderSummary } from "../src/summary.js";
import type { WriteResult } from "../src/writer.js";

const results: WriteResult[] = [
  { path: "AGENTS.md", action: "merged" },
  { path: ".gemini/skills/alpha.md", action: "created" },
];

describe("renderSummary", () => {
  it("lists the target agent and every file written", () => {
    const out = renderSummary({
      agentId: "codex",
      agentLabel: "Codex",
      results,
    });
    expect(out).toContain("Codex");
    expect(out).toContain("AGENTS.md");
    expect(out).toContain(".gemini/skills/alpha.md");
  });

  it("includes the always-on caveat for Codex", () => {
    const out = renderSummary({
      agentId: "codex",
      agentLabel: "Codex",
      results,
    });
    expect(out.toLowerCase()).toContain("always-on");
    expect(out.toLowerCase()).toContain("on-demand");
  });

  it("includes the always-on caveat for Gemini", () => {
    const out = renderSummary({
      agentId: "gemini",
      agentLabel: "Gemini",
      results,
    });
    expect(out.toLowerCase()).toContain("always-on");
  });

  it("does NOT show the always-on caveat for Claude (skills trigger on demand)", () => {
    const out = renderSummary({
      agentId: "claude",
      agentLabel: "Claude Code",
      results,
    });
    expect(out.toLowerCase()).not.toContain("always-on");
    expect(out.toLowerCase()).toContain("on demand");
  });
});

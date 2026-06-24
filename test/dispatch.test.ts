import { describe, expect, it } from "vitest";
import {
  defaultConflictPolicy,
  resolveSkillSelection,
  selectAdapter,
} from "../src/cli.js";
import { claudeAdapter } from "../src/adapters/claude.js";
import { codexAdapter } from "../src/adapters/codex.js";
import { geminiAdapter } from "../src/adapters/gemini.js";
import { alpha, beta } from "./helpers.js";

describe("selectAdapter", () => {
  it("maps each agent id to its adapter", () => {
    expect(selectAdapter("claude")).toBe(claudeAdapter);
    expect(selectAdapter("codex")).toBe(codexAdapter);
    expect(selectAdapter("gemini")).toBe(geminiAdapter);
  });

  it("throws clearly on an unknown agent", () => {
    expect(() => selectAdapter("borg")).toThrow(/borg/);
  });
});

describe("defaultConflictPolicy", () => {
  it("overwrites for the Claude passthrough adapter", () => {
    expect(defaultConflictPolicy("claude")).toBe("overwrite");
  });

  it("merges for the Codex/Gemini marker adapters", () => {
    expect(defaultConflictPolicy("codex")).toBe("merge");
    expect(defaultConflictPolicy("gemini")).toBe("merge");
  });
});

describe("resolveSkillSelection", () => {
  const available = [alpha, beta];

  it("resolves 'all' to every available skill", () => {
    expect(resolveSkillSelection("all", available)).toEqual(available);
  });

  it("resolves a comma list (order/spacing tolerant) to the named skills", () => {
    expect(resolveSkillSelection("beta, alpha", available)).toEqual([
      beta,
      alpha,
    ]);
  });

  it("throws clearly on an unknown skill name", () => {
    expect(() => resolveSkillSelection("alpha,ghost", available)).toThrow(
      /ghost/,
    );
  });

  it("throws on an empty selection", () => {
    expect(() => resolveSkillSelection("", available)).toThrow();
  });
});

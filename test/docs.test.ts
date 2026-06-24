import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(resolve(packageRoot, rel), "utf8");

describe("README front door", () => {
  const readme = read("README.md");

  it("tells the brigade story in workflow order", () => {
    const order = ["sous-chef", "mise-en-place", "maitre-d", "chef-de-rang"];
    let cursor = -1;
    for (const skill of order) {
      const at = readme.indexOf(skill, cursor + 1);
      expect(at, `"${skill}" should appear after the previous skill`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it("documents the install/usage command", () => {
    expect(readme).toContain("npx @long.dg/le-restaurant");
  });

  it("names all three target agents", () => {
    for (const agent of ["Claude Code", "Codex", "Gemini"]) {
      expect(readme).toContain(agent);
    }
  });

  it("states the always-on caveat for Codex/Gemini honestly", () => {
    expect(readme.toLowerCase()).toContain("always-on");
  });
});

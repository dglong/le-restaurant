import { describe, expect, it } from "vitest";
import { loadSkills, skillsDir } from "../src/registry.js";

describe("skill registry", () => {
  it("returns all four vendored skills", () => {
    const skills = loadSkills();
    const names = skills.map((s) => s.name).sort();
    expect(names).toEqual([
      "chef-de-rang",
      "maitre-d",
      "mise-en-place",
      "sous-chef",
    ]);
  });

  it("normalizes each skill with name, description, frontmatter, and body", () => {
    const skills = loadSkills();
    const chef = skills.find((s) => s.name === "chef-de-rang");
    expect(chef).toBeDefined();
    expect(chef!.description).toMatch(/single order ticket/i);
    expect(chef!.frontmatter.name).toBe("chef-de-rang");
    // body is the markdown after frontmatter, no leading `---` block
    expect(chef!.body.startsWith("---")).toBe(false);
    expect(chef!.body).toContain("# Chef de Rang");
    expect(chef!.body.length).toBeGreaterThan(0);
  });

  it("exposes the vendored skills directory", () => {
    expect(skillsDir).toMatch(/skills$/);
  });
});

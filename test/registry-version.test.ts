import { describe, expect, it, vi } from "vitest";
import { parseSkillContent } from "../src/registry.js";

describe("Skill.version — parsing from frontmatter", () => {
  it("reads version from frontmatter when present", () => {
    const raw = `---
name: test-skill
description: A test skill.
version: 1.2.3
---

# Test Skill

Body here.
`;
    const skill = parseSkillContent(raw, "test-skill");
    expect(skill.version).toBe("1.2.3");
  });

  it("falls back to 0.0.0 and emits a console.warn when version is absent", () => {
    const raw = `---
name: test-skill
description: A test skill.
---

# Test Skill

Body here.
`;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const skill = parseSkillContent(raw, "test-skill");
      expect(skill.version).toBe("0.0.0");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("test-skill"),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});

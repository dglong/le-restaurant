import { readFileSync } from "node:fs";
import { skillSourcePath } from "../registry.js";
import type { FileOutput, InstallContext, Skill } from "../types.js";
import type { Adapter } from "./types.js";

/**
 * Claude Code — passthrough strategy.
 *
 * Claude Code natively supports on-demand skills, so we copy each source
 * `SKILL.md` verbatim to `.claude/skills/<name>/SKILL.md`. To guarantee
 * byte-for-byte fidelity we read the original vendored file rather than
 * re-serialize the normalized `Skill` (which would lose exact formatting).
 */
export const claudeAdapter: Adapter = {
  id: "claude",
  label: "Claude Code",
  translate(skills: Skill[], _ctx: InstallContext): FileOutput[] {
    return skills.map((skill) => ({
      path: `.claude/skills/${skill.name}/SKILL.md`,
      contents: readFileSync(skillSourcePath(skill.name), "utf8"),
      mode: "overwrite",
    }));
  },
};

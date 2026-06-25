import { MANAGED_NOTICE, renderManagedBlock } from "../markers.js";
import type { FileOutput, InstallContext, Skill } from "../types.js";
import type { Adapter } from "./types.js";

/** Notice rendered at the top of each generated `.gemini/skills/<name>.md`. */
const SKILL_FILE_NOTICE =
  "<!-- Managed by le-restaurant; edit the source skill, not this file. -->";

/** Relative import path for a skill's modular file, as used in `GEMINI.md`. */
function importPath(skill: Skill): string {
  return `./.gemini/skills/${skill.name}.md`;
}

/** Render one skill into its own modular `.gemini/skills/<name>.md` file. */
function renderSkillFile(skill: Skill): string {
  return `${SKILL_FILE_NOTICE}\n<!-- Version: ${skill.version} -->\n\n${skill.description}\n\n${skill.body.trimEnd()}\n`;
}

/**
 * Notice rendered in GEMINI.md's managed block: honest about what Gemini cannot do.
 * Skills are always-on (no on-demand triggering). Model-aware dispatch is also a
 * no-op: Gemini has no subagent model-override, so chef-de-rang runs on the session
 * model; HITL and difficulty tagging still apply.
 */
const MODEL_DISPATCH_NOTICE =
  "> **Note:** Model-aware dispatch (Sonnet/Opus selection) is a no-op on Gemini — " +
  "chef-de-rang runs on the session model. The HITL gate and difficulty tagging still apply.";

/**
 * Gemini — import strategy.
 *
 * Gemini concatenates `GEMINI.md` hierarchically and supports `@file.md`
 * imports, so each skill is written to its own modular
 * `.gemini/skills/<name>.md` and referenced by an `@./.gemini/skills/<name>.md`
 * import line. The import lines live inside managed markers in `GEMINI.md`, so
 * re-runs update only that span; the modular skill files are fully tool-owned
 * (overwrite). Skills are always-on — no on-demand triggering. Model-aware
 * dispatch is likewise a no-op — documented in GEMINI.md via MODEL_DISPATCH_NOTICE.
 */
export const geminiAdapter: Adapter = {
  id: "gemini",
  label: "Gemini",
  translate(skills: Skill[], _ctx: InstallContext): FileOutput[] {
    const skillFiles: FileOutput[] = skills.map((skill) => ({
      path: `.gemini/skills/${skill.name}.md`,
      contents: renderSkillFile(skill),
      mode: "overwrite",
    }));

    const imports = skills.map((skill) => `@${importPath(skill)}`).join("\n");
    const inner = `${MANAGED_NOTICE}\n\n${MODEL_DISPATCH_NOTICE}\n\n${imports}`;
    const geminiMd: FileOutput = {
      path: "GEMINI.md",
      contents: renderManagedBlock(inner),
      mode: "merge",
    };

    return [...skillFiles, geminiMd];
  },
};

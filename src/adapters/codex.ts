import {
  MANAGED_NOTICE,
  renderManagedBlock,
} from "../markers.js";
import type { FileOutput, InstallContext, Skill } from "../types.js";
import type { Adapter } from "./types.js";

/**
 * Render one skill as a delimited `## Skill: <name>` section: heading, the
 * one-line description, then the skill body.
 */
function renderSection(skill: Skill): string {
  return `## Skill: ${skill.name}\n\n${skill.description}\n\n${skill.body.trimEnd()}`;
}

/**
 * Codex — merge strategy.
 *
 * Codex reads a single monolithic `AGENTS.md` per directory with no named or
 * on-demand skills, so every selected skill is folded into one `AGENTS.md` as
 * a delimited `## Skill: <name>` section. The whole set lives inside managed
 * markers, so the writer's merge mode updates only that span on re-runs and
 * never disturbs surrounding user content. Triggering degrades to always-on
 * guidance (flagged to the user elsewhere).
 */
export const codexAdapter: Adapter = {
  id: "codex",
  label: "Codex",
  translate(skills: Skill[], _ctx: InstallContext): FileOutput[] {
    const inner = [MANAGED_NOTICE, ...skills.map(renderSection)].join("\n\n");
    return [
      {
        path: "AGENTS.md",
        contents: renderManagedBlock(inner),
        mode: "merge",
      },
    ];
  },
};

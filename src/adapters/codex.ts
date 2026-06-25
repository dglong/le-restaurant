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
  return `## Skill: ${skill.name} (v${skill.version})\n\n${skill.description}\n\n${skill.body.trimEnd()}`;
}

/**
 * Notice rendered inside the managed block: honest about what Codex cannot do.
 * Triggering degrades to always-on guidance (flagged to the user elsewhere).
 * Model-aware dispatch is a no-op: Codex has no subagent model-override, so
 * chef-de-rang runs on the session model; HITL and difficulty tagging still apply.
 */
const MODEL_DISPATCH_NOTICE =
  "> **Note:** Model-aware dispatch (Sonnet/Opus selection) is a no-op on Codex — " +
  "chef-de-rang runs on the session model. The HITL gate and difficulty tagging still apply.";

/**
 * Codex — merge strategy.
 *
 * Codex reads a single monolithic `AGENTS.md` per directory with no named or
 * on-demand skills, so every selected skill is folded into one `AGENTS.md` as
 * a delimited `## Skill: <name>` section. The whole set lives inside managed
 * markers, so the writer's merge mode updates only that span on re-runs and
 * never disturbs surrounding user content. Triggering degrades to always-on
 * guidance (flagged to the user elsewhere). Model-aware dispatch is likewise a
 * no-op — documented in the generated output via MODEL_DISPATCH_NOTICE.
 */
export const codexAdapter: Adapter = {
  id: "codex",
  label: "Codex",
  translate(skills: Skill[], _ctx: InstallContext): FileOutput[] {
    const inner = [MANAGED_NOTICE, MODEL_DISPATCH_NOTICE, ...skills.map(renderSection)].join("\n\n");
    return [
      {
        path: "AGENTS.md",
        contents: renderManagedBlock(inner),
        mode: "merge",
      },
    ];
  },
};

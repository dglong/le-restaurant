import { readFileSync } from "node:fs";
import { skillSourcePath } from "../registry.js";
import type { FileOutput, InstallContext, Skill } from "../types.js";
import type { Adapter } from "./types.js";

/**
 * Default tool grant for the emitted chef-de-rang subagent — the common
 * build/edit/search set a chef-de-rang needs to take a ticket from plan to
 * working code. Kept conservative; the maître-d overrides the *model* per
 * dispatch, not the tools.
 */
const CHEF_AGENT_TOOLS = "Read, Write, Edit, Bash, Glob, Grep";

/**
 * Render the chef-de-rang **agent definition** that pins the cheap default
 * model. Claude Code reads `.claude/agents/<name>.md` frontmatter, so a
 * `model: sonnet` floor is enforced by config rather than prose. The maître-d
 * raises it to Opus per dispatch via the per-call model override (which takes
 * precedence over this frontmatter default).
 *
 * The body is generated from the skill body so the subagent carries the same
 * instructions as the on-demand skill.
 */
function renderChefAgentDefinition(chef: Skill): string {
  const frontmatter = [
    "---",
    "name: chef-de-rang",
    `description: ${chef.description}`,
    "model: sonnet",
    `tools: ${CHEF_AGENT_TOOLS}`,
    "---",
  ].join("\n");
  return `${frontmatter}\n\n${chef.body}`;
}

/**
 * Claude Code — passthrough PLUS an emitted agent definition.
 *
 * Claude Code natively supports on-demand skills, so we copy each source
 * `SKILL.md` verbatim to `.claude/skills/<name>/SKILL.md`. To guarantee
 * byte-for-byte fidelity we read the original vendored file rather than
 * re-serialize the normalized `Skill` (which would lose exact formatting).
 *
 * In addition, when the selected skills include `chef-de-rang`, we emit a
 * model-pinned subagent definition at `.claude/agents/chef-de-rang.md`. This is
 * the Claude-only cost win: the maître-d can dispatch a real Sonnet subagent
 * and override to Opus per ticket. Other adapters can't express this, so they
 * degrade to a documented no-op (handled in their own adapters).
 */
export const claudeAdapter: Adapter = {
  id: "claude",
  label: "Claude Code",
  translate(skills: Skill[], _ctx: InstallContext): FileOutput[] {
    const outputs: FileOutput[] = skills.map((skill) => ({
      path: `.claude/skills/${skill.name}/SKILL.md`,
      contents: readFileSync(skillSourcePath(skill.name), "utf8"),
      mode: "overwrite",
    }));

    const chef = skills.find((skill) => skill.name === "chef-de-rang");
    if (chef) {
      outputs.push({
        path: ".claude/agents/chef-de-rang.md",
        contents: renderChefAgentDefinition(chef),
        mode: "overwrite",
      });
    }

    return outputs;
  },
};

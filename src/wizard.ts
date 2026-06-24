import {
  cancel,
  intro,
  isCancel,
  multiselect,
  outro,
  select,
} from "@clack/prompts";
import type { Skill } from "./types.js";

/** Agents offered in the interactive picker. */
const AGENT_CHOICES = [
  { value: "claude", label: "Claude Code", hint: "native on-demand skills" },
  { value: "codex", label: "Codex", hint: "merged into AGENTS.md (always-on)" },
  { value: "gemini", label: "Gemini", hint: "@import into GEMINI.md (always-on)" },
] as const;

/** The user's choices from the wizard, or null if they cancelled. */
export interface WizardResult {
  agentId: "claude" | "codex" | "gemini";
  skills: Skill[];
}

/**
 * Walk the user through pick-agent → multiselect-skills.
 *
 * This is intentionally thin: all the testable logic (dispatch, validation,
 * summary) lives in pure functions elsewhere. The wizard only orchestrates the
 * interactive prompts and hands back the resolved selection.
 */
export async function runWizard(
  available: Skill[],
): Promise<WizardResult | null> {
  intro("le-restaurant — install the brigade of agent skills");

  const agentId = await select({
    message: "Which coding agent are you installing for?",
    options: AGENT_CHOICES.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
  });
  if (isCancel(agentId)) {
    cancel("Cancelled.");
    return null;
  }

  const picked = await multiselect({
    message: "Which skills do you want? (space to toggle, enter to confirm)",
    options: available.map((s) => ({
      value: s.name,
      label: s.name,
      hint: s.description,
    })),
    required: true,
  });
  if (isCancel(picked)) {
    cancel("Cancelled.");
    return null;
  }

  const names = picked as string[];
  const skills = available.filter((s) => names.includes(s.name));
  outro(`Installing ${skills.length} skill(s) for ${agentId}…`);

  return { agentId: agentId as WizardResult["agentId"], skills };
}

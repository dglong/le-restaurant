import type { WriteResult } from "./writer.js";

/** Everything the post-install summary needs to render. */
export interface SummaryInput {
  /** The agent the skills were installed for. */
  agentId: "claude" | "codex" | "gemini";
  /** Human-readable agent label (e.g. "Claude Code"). */
  agentLabel: string;
  /** What the writer did with each file. */
  results: WriteResult[];
}

/**
 * Per-agent "how to use the skills" guidance.
 *
 * Claude Code keeps native on-demand triggering, so its skills behave as
 * designed. Codex and Gemini have no skill system — the translation degrades to
 * always-on guidance, which we must state honestly (see Architecture: "Accept
 * fidelity loss on Codex/Gemini rather than fake a skill system").
 */
function usageNotes(agentId: SummaryInput["agentId"]): string[] {
  switch (agentId) {
    case "claude":
      return [
        "Skills install to .claude/skills/<name>/SKILL.md.",
        "Claude Code triggers each skill on demand — it picks the right one",
        "from its description when a matching task comes up. Nothing else to do.",
      ];
    case "codex":
      return [
        "Skills are folded into AGENTS.md as delimited sections, inside",
        "le-restaurant managed markers (edit outside the markers freely).",
        "Caveat: Codex has no skill system, so this guidance is ALWAYS-ON —",
        "there is no on-demand triggering. Every section is in context all the",
        "time, unlike Claude Code's on-demand skills.",
      ];
    case "gemini":
      return [
        "Each skill is written to .gemini/skills/<name>.md and imported from",
        "GEMINI.md via @import lines inside le-restaurant managed markers.",
        "Caveat: Gemini has no skill system, so this guidance is ALWAYS-ON —",
        "there is no on-demand triggering. Every imported skill is in context",
        "all the time, unlike Claude Code's on-demand skills.",
      ];
  }
}

/**
 * Render the post-install summary: the target agent, every file written (with
 * the action taken), and how to use the installed skills — including the
 * always-on caveat for Codex/Gemini.
 */
export function renderSummary(input: SummaryInput): string {
  const lines: string[] = [];
  lines.push(`Installed ${input.results.length} file(s) for ${input.agentLabel}:`);
  for (const r of input.results) {
    lines.push(`  ${r.action.padEnd(11)} ${r.path}`);
  }
  lines.push("");
  lines.push("How to use:");
  for (const note of usageNotes(input.agentId)) {
    lines.push(`  ${note}`);
  }
  return lines.join("\n");
}

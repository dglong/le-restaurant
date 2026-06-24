import type { FileOutput, InstallContext, Skill } from "../types.js";

/**
 * The single contract every agent adapter implements.
 *
 * An adapter is a pure transform: given the normalized skills and an install
 * context, it returns the list of files to write — it does no I/O itself.
 * The writer is responsible for putting `FileOutput`s on disk.
 *
 * Pulled forward into Order 01 (rather than Phase 1) so the Claude passthrough
 * adapter implements the same interface every later adapter (Codex, Gemini) will.
 */
export interface Adapter {
  /** The agent this adapter targets. */
  readonly id: "claude" | "codex" | "gemini";
  /** Human-readable label for summaries/prompts. */
  readonly label: string;
  /** Translate skills into the files this agent expects. */
  translate(skills: Skill[], ctx: InstallContext): FileOutput[];
}

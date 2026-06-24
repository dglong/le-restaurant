/**
 * Public API surface for le-restaurant.
 *
 * Re-exports the core types, the skill registry, the adapter contract, the
 * Claude passthrough adapter, and the writer — the shared surfaces every
 * later ticket builds on.
 */
export type {
  Adapter,
} from "./adapters/types.js";
export type {
  Agent,
  ConflictPolicy,
  FileOutput,
  InstallContext,
  Skill,
  WriteMode,
} from "./types.js";
export { claudeAdapter } from "./adapters/claude.js";
export { codexAdapter } from "./adapters/codex.js";
export { geminiAdapter } from "./adapters/gemini.js";
export {
  MARKER_START,
  MARKER_END,
  MANAGED_NOTICE,
  renderManagedBlock,
  mergeManagedBlock,
  hasManagedBlock,
} from "./markers.js";
export { loadSkill, loadSkills, skillSourcePath, skillsDir } from "./registry.js";
export { writeOutputs } from "./writer.js";
export type { WriteResult, WriteAction } from "./writer.js";
export { renderSummary } from "./summary.js";
export type { SummaryInput } from "./summary.js";
export {
  AGENT_IDS,
  buildProgram,
  defaultConflictPolicy,
  resolveFlags,
  resolveSkillSelection,
  run,
  runCli,
  runInstall,
  selectAdapter,
} from "./cli.js";
export type { AgentId, InstallRequest } from "./cli.js";

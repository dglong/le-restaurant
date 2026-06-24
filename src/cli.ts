import { Command, CommanderError } from "commander";
import { claudeAdapter } from "./adapters/claude.js";
import { codexAdapter } from "./adapters/codex.js";
import { geminiAdapter } from "./adapters/gemini.js";
import type { Adapter } from "./adapters/types.js";
import { loadSkills } from "./registry.js";
import { renderSummary } from "./summary.js";
import type { ConflictPolicy, InstallContext, Skill } from "./types.js";
import { writeOutputs, type WriteResult } from "./writer.js";

const VERSION = "0.1.0";

/** The agents we can install for. */
export type AgentId = "claude" | "codex" | "gemini";

/** Adapter registry, keyed by agent id. The single dispatch table. */
const ADAPTERS: Record<AgentId, Adapter> = {
  claude: claudeAdapter,
  codex: codexAdapter,
  gemini: geminiAdapter,
};

/** Valid agent ids, for validation + help text. */
export const AGENT_IDS = Object.keys(ADAPTERS) as AgentId[];

/**
 * Map a chosen agent id to its adapter.
 *
 * Throws a clear error on an unknown id so both the CLI (non-zero exit) and
 * library callers fail loudly rather than silently installing the wrong thing.
 */
export function selectAdapter(agentId: string): Adapter {
  const adapter = ADAPTERS[agentId as AgentId];
  if (!adapter) {
    throw new Error(
      `Unknown agent "${agentId}". Choose one of: ${AGENT_IDS.join(", ")}.`,
    );
  }
  return adapter;
}

/**
 * The conflict policy to use for an agent by default.
 *
 * Claude's passthrough files are fully tool-owned, so they overwrite. The
 * Codex/Gemini marker targets (`AGENTS.md`, `GEMINI.md`) merge so user content
 * outside the managed markers is preserved on re-runs.
 */
export function defaultConflictPolicy(agentId: string): ConflictPolicy {
  return agentId === "claude" ? "overwrite" : "merge";
}

/**
 * Resolve a `--skills` value into the concrete list of skills to install.
 *
 * Accepts the literal `all` (every available skill) or a comma-separated list
 * of skill names (order/whitespace tolerant). Throws clearly on an empty
 * selection or any unknown name.
 */
export function resolveSkillSelection(
  spec: string,
  available: Skill[],
): Skill[] {
  const trimmed = (spec ?? "").trim();
  if (trimmed.toLowerCase() === "all") return available;

  const names = trimmed
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
  if (names.length === 0) {
    throw new Error(
      `No skills selected. Use --skills all or a comma list (e.g. ${available
        .map((s) => s.name)
        .slice(0, 2)
        .join(",")}).`,
    );
  }

  const byName = new Map(available.map((s) => [s.name, s]));
  const unknown = names.filter((n) => !byName.has(n));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown skill(s): ${unknown.join(", ")}. Available: ${available
        .map((s) => s.name)
        .join(", ")}.`,
    );
  }
  return names.map((n) => byName.get(n)!);
}

/** A resolved, ready-to-run install request. */
export interface InstallRequest {
  agentId: AgentId;
  skills: Skill[];
  targetDir: string;
  conflictPolicy?: ConflictPolicy;
}

/**
 * Translate the selected skills with the chosen adapter and write them to the
 * target dir. The single install primitive shared by the flag and wizard paths.
 */
export function runInstall(req: InstallRequest): {
  adapter: Adapter;
  results: WriteResult[];
} {
  const adapter = selectAdapter(req.agentId);
  const ctx: InstallContext = {
    targetDir: req.targetDir,
    selectedSkills: req.skills,
    conflictPolicy: req.conflictPolicy ?? defaultConflictPolicy(req.agentId),
  };
  const outputs = adapter.translate(req.skills, ctx);
  const results = writeOutputs(outputs, ctx);
  return { adapter, results };
}

/** Options collected from the non-interactive flags. */
interface InstallFlags {
  agent?: string;
  skills?: string;
  yes?: boolean;
}

/**
 * Resolve raw `--agent`/`--skills` flags into a validated install request.
 * Throws clearly (non-zero exit upstream) on any invalid value.
 */
export function resolveFlags(
  flags: InstallFlags,
  targetDir: string,
  available: Skill[],
): InstallRequest {
  if (!flags.agent) {
    throw new Error("Missing --agent. Choose one of: " + AGENT_IDS.join(", "));
  }
  selectAdapter(flags.agent); // validates the agent id
  const skills = resolveSkillSelection(flags.skills ?? "all", available);
  return { agentId: flags.agent as AgentId, skills, targetDir };
}

/** Run an install request and print its post-install summary. */
function installAndReport(req: InstallRequest): void {
  const { adapter, results } = runInstall(req);
  console.log(
    renderSummary({
      agentId: adapter.id,
      agentLabel: adapter.label,
      results,
    }),
  );
}

/**
 * Build the commander program. Factored out so tests can introspect the
 * wired-up commands/options without spawning a process.
 */
export function buildProgram(): Command {
  const program = new Command();

  program
    .name("le-restaurant")
    .description(
      "Install the brigade of agent skills into your project, translated for your coding agent.",
    )
    .version(VERSION);

  // Root command: non-interactive flags, or the wizard when no agent is given.
  program
    .argument("[targetDir]", "target project directory", ".")
    .option(
      "--agent <agent>",
      `target coding agent (${AGENT_IDS.join("|")})`,
    )
    .option(
      "--skills <skills>",
      "skills to install: 'all' or a comma-separated list",
    )
    .option("--yes", "skip prompts; install with the given flags", false)
    .action(async (targetDir: string, opts: InstallFlags) => {
      const available = loadSkills();

      // No agent flag → interactive wizard.
      if (!opts.agent) {
        const { runWizard } = await import("./wizard.js");
        const choice = await runWizard(available);
        if (!choice) return; // cancelled
        installAndReport({
          agentId: choice.agentId,
          skills: choice.skills,
          targetDir,
        });
        return;
      }

      // Non-interactive: validate flags (throws → non-zero exit upstream).
      installAndReport(resolveFlags(opts, targetDir, available));
    });

  program
    .command("list")
    .description("List the skills available to install.")
    .action(() => {
      const skills = loadSkills();
      for (const skill of skills) {
        console.log(`- ${skill.name}: ${skill.description}`);
      }
    });

  return program;
}

/**
 * Parse argv, run the CLI, and resolve to the process exit code.
 *
 * commander is put in `exitOverride` mode so it throws instead of calling
 * `process.exit`, letting us (and tests) observe the exit code. Help/version
 * exit 0; parse/validation errors exit non-zero.
 */
export async function runCli(argv: string[] = process.argv): Promise<number> {
  const program = buildProgram();
  program.exitOverride();
  program.configureOutput({
    writeErr: (str) => process.stderr.write(str),
  });
  try {
    await program.parseAsync(argv);
    return Number(process.exitCode ?? 0);
  } catch (err) {
    if (err instanceof CommanderError) {
      // --help / --version resolve to exitCode 0; parse errors are non-zero.
      return err.exitCode;
    }
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

/** Convenience entry: run and let the process adopt the resolved exit code. */
export function run(argv: string[] = process.argv): Promise<number> {
  return runCli(argv).then((code) => {
    process.exitCode = code;
    return code;
  });
}

// Execute when invoked as the bin (not when imported by tests).
const invokedDirectly =
  typeof process !== "undefined" &&
  process.argv[1] !== undefined &&
  /cli\.(js|ts)$/.test(process.argv[1]);

if (invokedDirectly) {
  void run();
}

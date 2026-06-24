# Order 03 · Interactive UX · Status: Served
**Covers:** Plan Phase 2 — `@clack/prompts` wizard, `commander` non-interactive flags, post-install summary.
**Depends on:** 02

## Done when  (acceptance — checked at the pass)
- [ ] **Adapter dispatch wired:** the CLI selects the right adapter by chosen agent (`claude`→passthrough, `codex`→merge, `gemini`→import) and actually writes via `writeOutputs`. (Order 02 built the adapters but left them unwired — this ticket connects them; re-export them from `src/index.ts`.)
- [ ] **Wizard:** running with no args walks the user through pick-agent → multiselect-skills and installs the result.
- [ ] **Flags:** `--agent codex --skills all --yes` installs without prompts; invalid values error clearly with a non-zero exit.
- [ ] **Summary:** after install, output lists files written, the target agent, and how to use the skills — including the always-on caveat for Codex/Gemini (no on-demand triggering).
- [ ] `tsc --noEmit` clean; full `vitest run` green; existing tests still pass.

## Touches
- `src/wizard.ts`, `src/summary.ts` · shared surfaces: **extends** `src/cli.ts` (wire wizard + commander flags) — Maître D'-held
- tests for flag parsing and summary output

## Progress log  (append-only, newest last)
- Confirmed green start: `npx vitest run` → 22 passed (Orders 01+02).
- Added `@clack/prompts` dependency (npm). ESM, Node.
- RED: wrote `test/dispatch.test.ts`, `test/summary.test.ts`, `test/install.test.ts`, `test/index-exports.test.ts` → 14 failed for the right reason (functions/modules absent).
- GREEN: added `src/summary.ts` (per-agent usage notes + always-on caveat), `src/wizard.ts` (thin clack orchestration), and extended `src/cli.ts` with the dispatch table + flag validation + commander root command + `runCli` returning an exit code. Re-exported adapters/markers/summary/dispatch from `src/index.ts`.
- Full suite: `npx vitest run` → 41 passed (11 files). `tsc --noEmit` clean. `tsup` build success.
- Verified real runs against temp dirs: codex/gemini install + summary (with caveat), invalid agent → exit 1, invalid skill → exit 1.

## Current WIP / next action
- Feature complete; awaiting verification at the pass. (Wizard interactive path is intentionally untested via TUI; its pure helpers are tested.)

## Decisions
- Adapter dispatch lives in a single `ADAPTERS` table in `src/cli.ts`; `selectAdapter(id)` throws on unknown (covers both CLI non-zero exit and library callers).
- Conflict policy by agent: `claude`→`overwrite` (tool-owned files), `codex`/`gemini`→`merge` (preserve user content outside managed markers). Exposed as `defaultConflictPolicy`.
- `--skills` accepts `all` or a comma list (whitespace/order tolerant); unknown name or empty selection throws a clear error.
- Commander root command carries `--agent/--skills/--yes` + `[targetDir]`; no `--agent` → wizard. `runCli` uses `exitOverride()` so errors return an exit code (help/version=0, parse/validation errors non-zero) instead of killing the process — makes exit behavior unit-testable.
- Kept the old `install` subcommand's behavior folded into the root command; `list` subcommand retained unchanged. Existing cli.test assertions still hold.
- Wizard kept thin (orchestration only); all testable logic (dispatch, flag/skill resolution, summary text) is pure and unit-tested.

## Blockers / escalations
- none. No shared-surface changes beyond the Maître D'-held `src/cli.ts` extension and `src/index.ts` re-exports, both in scope.

## Pass verification (Maître D')
- 2026-06-24 — Verified independently: `npx vitest run` → 41 passed (Orders 01+02's 22 still green); `tsc --noEmit` → exit 0; `tsup` build ok. Real runs: `--agent codex --skills all --yes` → AGENTS.md with 4 skill sections + always-on caveat in summary, exit 0; `--agent gemini --skills sous-chef,maitre-d` → 2 imports + 2 skill files, exit 0; invalid agent → exit 1, invalid skill → exit 1 (confirmed with direct exit-code capture, not pipeline-masked). **Served.**

## Tests
- `test/dispatch.test.ts` (8): agent→adapter mapping, unknown agent throws, conflict policy per agent, skill resolution (all / comma list / unknown / empty).
- `test/summary.test.ts` (4): files + agent label listed; always-on caveat present for codex & gemini; absent for claude (on-demand wording instead).
- `test/install.test.ts` (5): `runInstall` writes codex AGENTS.md and claude passthrough files; `runCli` exits 0 on valid flags, non-zero on invalid agent and unknown skill.
- `test/index-exports.test.ts` (2): all three adapters + dispatch/summary helpers re-exported.
- Result: `npx vitest run` → 41 passed (Orders 01+02's 22 still green).

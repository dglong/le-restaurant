# Decisions & Glossary · Status: Draft

## Glossary — the project's words, used the same way by humans and agents
- **Difficulty tag** — `Difficulty: tidy|hard`, authored by mise-en-place per feature, copied to the ticket. Drives model choice on Claude.
- **HITL flag** — `HITL: yes|no`. `yes` means the Maître D' pauses for a human before firing. Portable across all agents.
- **Authored vs enforced** — difficulty is *authored* by mise-en-place (plan time) and *enforced* by the Maître D' (fire time). Two halves of one job.
- **Dispatch** — the Maître D' "sending a chef-de-rang." Prompt-level instruction, not a runtime call. On Claude it can be a model-pinned subagent.
- **Subagent** — an isolated agent context with its own model. Only Claude Code exposes one with a per-dispatch model override.
- **Pass-bounce / escalation** — a plate that fails verification at the pass; on retry the Maître D' escalates Sonnet→Opus.
- **Local drift** — the installed skill version is behind the version bundled in the le-restaurant package on disk.
- **Update available (npm)** — the installed le-restaurant package is itself behind the latest npm release.
- **Manifest** — `.le-restaurant.json` written into a target on install; records package + per-skill versions so `check` reads one uniform place.
- **Portable layer / Claude-only layer** — the HITL gate + tagging work on all agents; the model switch works only on Claude.

## Decision log (ADRs) — append-only, newest last

### 2026-06-25 · Bundle model-aware dispatch and skill versioning in one plan
- **Context:** two separate cravings (cost control, staleness visibility) that happen to touch the same surfaces — skill frontmatter, the installer adapters, the sync check.
- **Decision:** plan both together but as independent tracks (A: versioning, B: dispatch) sharing only Phase 0.
- **Consequences:** less single-purpose history; offset by tracks that ship independently.

### 2026-06-25 · Model selection is Claude-Code-only; HITL is portable
- **Context:** the brigade is prompt-orchestrated; Codex folds into one always-on `AGENTS.md` and Gemini into always-on modular imports — neither can express a model-pinned subagent. Only Claude Code can.
- **Decision:** ship the model switch on Claude only; document a no-op on Codex/Gemini. The HITL gate and difficulty tagging, being plain instructions, ship everywhere.
- **Consequences:** the cost win is Claude-only; other agents still get the human gate. Matches the existing on-demand-triggering degradation, so no new user-facing surprise.

### 2026-06-25 · Enforce the model floor via an emitted agent definition
- **Context:** a prose instruction to "use Sonnet" may be ignored by the host model.
- **Decision:** the Claude adapter emits `.claude/agents/chef-de-rang.md` with `model: sonnet` as a config default; the Maître D' overrides to Opus per ticket via the per-call model param (which takes precedence).
- **Consequences:** the cheap default is enforced by config, not prose; Opus is a deliberate override. Adds one generated file to the Claude install.

### 2026-06-25 · Track versions per skill, recorded in a uniform manifest
- **Context:** skills evolve independently; `check` must read installed versions the same way regardless of which adapter rendered them.
- **Decision:** per-skill semver in frontmatter; a single `.le-restaurant.json` manifest written on install.
- **Consequences:** precise staleness; one extra emitted file and one parser instead of three format-specific reads.

### 2026-06-25 · `check` compares both local and npm, and only reports
- **Context:** "latest" is ambiguous — vs the installed package, or vs npm. Chef chose both.
- **Decision:** compare manifest vs bundled package (local drift) **and** vs npm latest (update available); never auto-update. Offline → local-only + notice, exit 0.
- **Consequences:** catches both staleness kinds; pulls a network call into `check`, mitigated by mandatory offline fallback. Updating stays a deliberate re-install.

← [Home](./Home.md)

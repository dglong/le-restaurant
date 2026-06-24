# le-restaurant 🍽️

**A brigade of agent skills, installed into your project and translated for your coding agent.**

`le-restaurant` ships four kitchen-themed skills that take an idea from a napkin
sketch all the way to shipped code — and installs them for the agent you actually
use: **Claude Code**, **Codex**, or **Gemini**. One command, native format.

```bash
npx @long.dg/le-restaurant
```

---

## The brigade

Software, like a restaurant, runs on a brigade — each station owns one job and
hands off cleanly to the next. The four skills mirror that line, in order:

| Course | Skill | What it does |
|--------|-------|--------------|
| 1 | **sous-chef** | Your thinking partner for a raw idea. Asks short, focused questions, taste-tests the concept, and plates a structured recipe card (problem / solution / inspiration / risks) once the idea is "cooked." |
| 2 | **mise-en-place** | Turns a confirmed idea into a buildable plan — a small cross-linked wiki of scope, architecture, phases, and a development plan. Re-run it to harden the plan over time. |
| 3 | **maitre-d** | Front-of-house orchestrator. Reads the plan, cuts it into per-feature "order tickets," and runs the build one course at a time — firing each ticket, then checking the plate at the pass before the next goes out. |
| 4 | **chef-de-rang** | The station waiter who owns one ticket end-to-end. Builds a single feature test-first (red → green → refactor), writes progress back to the ticket, and hands the plate to the pass. Resumable by design. |

The natural flow is **sous-chef → mise-en-place → maître-d → chef-de-rang**:
cook the idea, plan the build, run service, cook each course. You can also reach
for any one of them on its own.

---

## Install

Run it in the root of the project you want the skills in:

```bash
# Interactive — pick your agent, tick the skills you want
npx @long.dg/le-restaurant

# Non-interactive — scriptable, no prompts
npx @long.dg/le-restaurant --agent codex --skills all --yes
npx @long.dg/le-restaurant --agent claude --skills sous-chef,mise-en-place
```

**Flags**

| Flag | Values | Meaning |
|------|--------|---------|
| `--agent` | `claude` \| `codex` \| `gemini` | Target coding agent. Omit it to launch the interactive wizard. |
| `--skills` | `all` or a comma list | Which skills to install (e.g. `sous-chef,maitre-d`). Defaults to a prompt. |
| `--yes` | — | Skip confirmations; install straight away. |
| `[targetDir]` | path | Where to install. Defaults to the current directory. |

After install, the CLI prints a summary of every file written, the target
agent, and how to use the skills.

---

## What lands, per agent

Each agent has a different idea of what a "skill" is, so each gets a native
translation:

- **Claude Code — passthrough.** Each skill is copied verbatim to
  `.claude/skills/<name>/SKILL.md`. Claude Code triggers them **on demand** —
  it picks the right skill from its description when a matching task comes up.
  Full fidelity.

- **Codex — merged into `AGENTS.md`.** Codex reads one monolithic `AGENTS.md`
  per directory, so each selected skill becomes a delimited section between
  `le-restaurant` managed markers. Re-runs update in place without touching the
  content you wrote outside the markers.

- **Gemini — imported into `GEMINI.md`.** Each skill is written to
  `.gemini/skills/<name>.md` and pulled in via an `@import` line in `GEMINI.md`,
  again inside managed markers.

### ⚠️ Always-on caveat for Codex & Gemini

Codex and Gemini have **no skill system** — there is no on-demand triggering.
The translation degrades to **always-on guidance**: every installed skill sits
in the agent's context all the time, rather than activating only when relevant
(as it does in Claude Code). We do this honestly rather than fake a skill system.
For the on-demand experience the skills were designed for, use Claude Code.

Re-running the installer is always safe: managed markers and atomic writes mean
your own content outside the markers is never clobbered.

---

## Development

```bash
npm install
npm run build       # bundle the CLI with tsup
npm test            # run the vitest suite
npm run typecheck   # tsc --noEmit
npm run check:sync  # verify vendored skills/ match canonical .claude/skills/
```

The four skills live canonically in `.claude/skills/` and are **vendored** into
`skills/` for distribution. `npm run check:sync` (also a CI gate) fails if the
two ever drift.

## License

MIT

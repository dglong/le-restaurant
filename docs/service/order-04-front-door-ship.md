# Order 04 · Front door & ship · Status: Served
**Covers:** Plan Phase 3 — README (brigade story + per-skill blurbs + install/usage), source-skill sync check, npm publish via CI.
**Depends on:** 03

## Done when  (acceptance — checked at the pass)
- [x] **README:** explains the four-skill brigade workflow, per-skill blurbs, and the install command; renders cleanly on GitHub.
- [x] **Sync check:** a script/test fails if the vendored `skills/` drift from canonical `.claude/skills/`; runs in CI.
- [x] **Publish CI:** GitHub Actions builds + tests on PR; a version tag builds and `npm publish`es (provenance on); `package.json` `files`/`bin` ship the CLI + vendored skills only. *(workflow authored; live publish not triggered — pending NPM_TOKEN + name.)*
- [x] Dry-run pack (`npm pack`) contains the CLI binary and vendored skills and nothing stray; `tsc --noEmit` + `vitest run` green.

## Touches
- `README.md`, `scripts/check-skills-sync.ts`, `.github/workflows/ci.yml`, `.github/workflows/publish.yml`, `package.json` · shared surfaces: `package.json` packaging config — Maître D'-held
- requires repo secret `NPM_TOKEN` (escalate to user when publishing)

## Progress log  (append-only, newest last)
- Confirmed green start: `npx vitest run` → 41 passed (Orders 01–03).
- Materialized canonical `.claude/skills/` inside the package as exact copies of the vendored `skills/` (see Decisions). Repo is now self-contained for the sync check.
- RED→GREEN sync check: wrote `test/check-skills-sync.test.ts` (5) against `scripts/check-skills-sync.ts` (absent → red), then authored the script. `compareSkillTrees(canonical, vendored)` is a pure diff (missing-canonical / missing-vendored / content-drift); `checkSkillsSync()` points it at the real dirs. Added `scripts` to `tsconfig` include + `check:sync` npm script. → 5 passed.
- Packaging: wrote `test/packaging.test.ts` (6) — asserts `files`/`bin`, and `npm pack --dry-run --json` ships CLI + skills + README + manifest and nothing stray. README assertion drove the next slice.
- README: wrote `test/docs.test.ts` (4) — brigade order, `npx le-restaurant` command, three agent names, always-on caveat — then authored `README.md` (brigade table in workflow order, per-agent translation section, honest always-on caveat, dev/commands). → docs + packaging green (10).
- CI: wrote `test/ci-workflows.test.ts` (6), then authored `.github/workflows/ci.yml` (push/PR → build, typecheck, check:sync, test) and `publish.yml` (tag `v*` → build, sync, test, `npm publish --provenance --access public` via `NPM_TOKEN`; `id-token: write`). → 6 passed.
- Full verification: `npm run typecheck` → clean (exit 0); `npx vitest run` → 62 passed (15 files); `npm pack --dry-run` → 17 files = README + dist/* + package.json + 4 skills, no src/test/docs/scripts/.claude leakage.

## Current WIP / next action
- Feature complete; awaiting verification at the pass. Live `npm publish` intentionally NOT triggered — workflow authored only (blocked on user).

## Decisions
- **Canonical skills live in-package at `.claude/skills/`.** The plan names `.claude/skills/` as canonical for the sync check, but the package had none of its own (canonical copies lived at the hub root, outside the package). Created `.claude/skills/` inside the package as exact copies so the repo is self-contained and CI can run the check on a clean checkout. The `files` allowlist (`["dist","skills"]`) keeps `.claude/` out of the published tarball.
- **Sync check enforced as a vitest test + standalone `check:sync` script.** The real-repo assertion runs inside the suite (so plain CI `npm test` catches drift) and as its own `npm run check:sync` CI step. `compareSkillTrees` takes two dirs so drift cases are unit-testable without mutating the repo.
- **Workflow content tested by string assertions, not a YAML parser** — no new dependency; asserts the triggers/steps/provenance/secret that the criteria name.
- Publish uses `--provenance --access public` with `id-token: write`; auth via `NODE_AUTH_TOKEN=secrets.NPM_TOKEN` + `registry-url` on setup-node (npm's standard provenance setup).

## Blockers / escalations
- **Live publish is gated on the user** (as planned): `NPM_TOKEN` repo secret must be added, and the npm package name (`le-restaurant`) confirmed available / chosen. The publish workflow is authored and tested but will only run on a pushed `v*` tag once the secret exists. No code blocker.

## Tests
- `test/check-skills-sync.test.ts` (5): `compareSkillTrees` in-sync / content-drift / missing-vendored / missing-canonical; `checkSkillsSync()` real repo in sync.
- `test/packaging.test.ts` (6): `files`/`bin` config; `npm pack` ships CLI binary, all 4 skills, README, manifest; no stray src/test/docs/scripts/node_modules/.claude.
- `test/docs.test.ts` (4): README brigade order, install command, three agents, always-on caveat.
- `test/ci-workflows.test.ts` (6): ci.yml push/PR + build/typecheck/check:sync/test; publish.yml tag trigger + build/test + `npm publish --provenance` + NPM_TOKEN + id-token:write.
- Result: `npx vitest run` → **62 passed (15 files)**; `tsc --noEmit` → clean; `npm pack --dry-run` → 17 files, nothing stray.

## Pass verification (Maître D')
- 2026-06-24 — Verified independently at the pass:
  - `npm run typecheck` → clean (exit 0).
  - `npx vitest run` → **62 passed (15 files)** — Orders 01–03's 41 still green, +21 new (sync 5, packaging 6, docs 4, ci-workflows 6).
  - `npm run build` → tsup ESM + DTS build success.
  - `npm run check:sync` (standalone CI gate) → 5 passed, **exit 0** in sync.
  - **Drift gate proven, not assumed:** injected real drift into `skills/chef-de-rang/SKILL.md` → `check:sync` failed with `"chef-de-rang" SKILL.md differs between .claude/skills/ and skills/`, **non-zero exit**; restored from canonical → exit 0.
  - `npm pack --dry-run` → 17 files = README + `dist/*` (incl. `dist/cli.js`) + `package.json` + 4 `skills/*/SKILL.md`; no `src/`/`test/`/`docs/`/`scripts/`/`node_modules/`/`.claude/` leakage.
  - Reviewed the in-package canonical `.claude/skills/` decision: sound — plan names `.claude/skills/` as canonical, `files` allowlist keeps it out of the tarball. **Served.**

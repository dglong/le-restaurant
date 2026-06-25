# Deployment & Ops · Status: Draft

This is a CLI distributed as an npm package — "deployment" means publishing, not running servers.

## Environments
- **Local:** `npx .` / `node dist/cli.js` against a throwaway target dir for manual testing.
- **CI:** GitHub Actions runs lint + `vitest` on push/PR.
- **Published:** the npm registry; users run `npx le-restaurant`.

## Hosting & infra
- None at runtime. The only "service" is the npm registry. No servers, no DB, no secrets at runtime.

## CI/CD
- **CI (every PR):** install, build (`tsup`), test (`vitest`), and the source-skill sync check.
- **Release:** on a version tag, build and `npm publish` (provenance enabled). Requires an `NPM_TOKEN` repo secret — the only secret in the project.
- Keep `package.json` `files`/`bin` correct so the published tarball ships the CLI + vendored skills only.

## Observability
- No telemetry. Signal is the post-install summary the CLI prints and npm download stats.

## Cost
- ~$0/month. Public npm publishing and GitHub Actions (public repo) are free at this scale.

← [Home](./Home.md)

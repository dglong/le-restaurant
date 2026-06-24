import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(resolve(packageRoot, rel), "utf8");

describe("CI workflow (.github/workflows/ci.yml)", () => {
  const ci = read(".github/workflows/ci.yml");

  it("runs on pull requests and pushes", () => {
    expect(ci).toMatch(/pull_request:/);
    expect(ci).toMatch(/push:/);
  });

  it("builds, typechecks, runs the sync check, and tests", () => {
    expect(ci).toContain("npm run build");
    expect(ci).toContain("npm run typecheck");
    expect(ci).toContain("npm run check:sync");
    expect(ci).toContain("npm test");
  });
});

describe("publish workflow (.github/workflows/publish.yml)", () => {
  const publish = read(".github/workflows/publish.yml");

  it("triggers on a version tag", () => {
    expect(publish).toMatch(/tags:/);
    expect(publish).toMatch(/['"]?v\*/);
  });

  it("builds and tests before publishing", () => {
    expect(publish).toContain("npm run build");
    expect(publish).toContain("npm test");
  });

  it("publishes to npm with provenance using the NPM_TOKEN secret", () => {
    expect(publish).toContain("npm publish");
    expect(publish).toContain("--provenance");
    expect(publish).toContain("NPM_TOKEN");
  });

  it("grants id-token write permission required for provenance", () => {
    expect(publish).toMatch(/id-token:\s*write/);
  });
});

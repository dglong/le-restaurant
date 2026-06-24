import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Paths npm would include in the published tarball (dry-run, no real pack). */
function packedPaths(): string[] {
  const out = execSync("npm pack --dry-run --json", {
    cwd: packageRoot,
    encoding: "utf8",
  });
  const report = JSON.parse(out) as Array<{ files: Array<{ path: string }> }>;
  return report[0].files.map((f) => f.path.replace(/\\/g, "/"));
}

describe("package.json packaging config", () => {
  const pkg = JSON.parse(
    readFileSync(resolve(packageRoot, "package.json"), "utf8"),
  );

  it("ships only the built CLI and vendored skills via files allowlist", () => {
    expect(pkg.files).toEqual(["dist", "skills"]);
  });

  it("exposes the CLI binary from the built output", () => {
    expect(pkg.bin).toEqual({ "le-restaurant": "./dist/cli.js" });
  });
});

describe("npm pack contents", () => {
  let files: string[];

  beforeAll(() => {
    // The tarball includes dist/* only if it has been built.
    if (!existsSync(resolve(packageRoot, "dist", "cli.js"))) {
      execSync("npm run build", { cwd: packageRoot, stdio: "ignore" });
    }
    files = packedPaths();
  }, 120_000);

  it("contains the CLI binary", () => {
    expect(files).toContain("dist/cli.js");
  });

  it("contains every vendored skill", () => {
    for (const name of ["sous-chef", "mise-en-place", "maitre-d", "chef-de-rang"]) {
      expect(files).toContain(`skills/${name}/SKILL.md`);
    }
  });

  it("contains the README and package manifest", () => {
    expect(files).toContain("README.md");
    expect(files).toContain("package.json");
  });

  it("ships nothing stray — no sources, tests, docs, scripts, or canonical .claude copy", () => {
    const stray = files.filter((f) =>
      /^(src|test|docs|scripts|node_modules)\//.test(f) || f.startsWith(".claude/"),
    );
    expect(stray).toEqual([]);
  });
});

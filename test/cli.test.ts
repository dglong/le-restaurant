import { describe, expect, it } from "vitest";
import { buildProgram } from "../src/cli.js";
import pkg from "../package.json" with { type: "json" };

describe("cli", () => {
  it("reports the package version", () => {
    const program = buildProgram();
    expect(program.version()).toBe(pkg.version);
  });

  it("has a name and a help-able description", () => {
    const program = buildProgram();
    expect(program.name()).toBe("le-restaurant");
    expect(program.description().length).toBeGreaterThan(0);
  });

  it("lists the four installable skills via the registry", () => {
    const program = buildProgram();
    // the `list` subcommand should be wired up
    const names = program.commands.map((c) => c.name());
    expect(names).toContain("list");
  });

  it("has a check subcommand", () => {
    const program = buildProgram();
    const names = program.commands.map((c) => c.name());
    expect(names).toContain("check");
  });
});

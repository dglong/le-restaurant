import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FileOutput, InstallContext } from "../src/types.js";
import { atomicWriteFile, writeOutputs } from "../src/writer.js";
import { MARKER_END, MARKER_START } from "../src/markers.js";

describe("writer conflict policy + atomic writes", () => {
  let target: string;

  beforeEach(() => {
    target = mkdtempSync(join(tmpdir(), "le-restaurant-writer-"));
  });

  afterEach(() => {
    rmSync(target, { recursive: true, force: true });
  });

  function ctx(policy: InstallContext["conflictPolicy"]): InstallContext {
    return { targetDir: target, selectedSkills: [], conflictPolicy: policy };
  }

  const file = (mode: FileOutput["mode"], contents: string): FileOutput[] => [
    { path: "NOTES.md", contents, mode },
  ];

  it("creates a new file and reports the action", () => {
    const results = writeOutputs(file("overwrite", "fresh"), ctx("overwrite"));
    expect(readFileSync(join(target, "NOTES.md"), "utf8")).toBe("fresh");
    expect(results[0].action).toBe("created");
  });

  it("skip policy leaves an existing file untouched", () => {
    writeFileSync(join(target, "NOTES.md"), "ORIGINAL");
    const results = writeOutputs(file("overwrite", "NEW"), ctx("skip"));
    expect(readFileSync(join(target, "NOTES.md"), "utf8")).toBe("ORIGINAL");
    expect(results[0].action).toBe("skipped");
  });

  it("overwrite policy replaces an existing file", () => {
    writeFileSync(join(target, "NOTES.md"), "ORIGINAL");
    const results = writeOutputs(file("overwrite", "NEW"), ctx("overwrite"));
    expect(readFileSync(join(target, "NOTES.md"), "utf8")).toBe("NEW");
    expect(results[0].action).toBe("overwritten");
  });

  it("merge policy folds a managed block into existing content, preserving the rest", () => {
    writeFileSync(join(target, "NOTES.md"), "USER ABOVE\n");
    const block = `${MARKER_START}\nmanaged\n${MARKER_END}\n`;
    const results = writeOutputs(file("merge", block), ctx("merge"));
    const out = readFileSync(join(target, "NOTES.md"), "utf8");
    expect(out.startsWith("USER ABOVE\n")).toBe(true);
    expect(out).toContain("managed");
    expect(results[0].action).toBe("merged");
  });

  it("atomicWriteFile: a failed rename leaves the existing target and no temp behind", () => {
    // Make the target path a non-empty directory so renameSync(temp, dir) fails.
    const blocked = join(target, "blocked");
    mkdirSync(blocked);
    writeFileSync(join(blocked, "sentinel.txt"), "KEEP ME");

    expect(() => atomicWriteFile(blocked, "should not land")).toThrow();

    // existing data survives untouched
    expect(existsSync(blocked)).toBe(true);
    expect(readFileSync(join(blocked, "sentinel.txt"), "utf8")).toBe("KEEP ME");
    // no half-written temp files left in the directory
    const leftovers = readdirSync(target).filter((f) => f.includes(".tmp"));
    expect(leftovers).toEqual([]);
  });
});

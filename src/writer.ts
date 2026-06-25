import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, isAbsolute, resolve } from "node:path";
import { mergeManagedBlock } from "./markers.js";
import type { FileOutput, InstallContext, InstallManifest } from "./types.js";

/** What the writer did with a single output file. */
export type WriteAction = "created" | "overwritten" | "merged" | "skipped";

/** A file the writer processed, for the post-install summary. */
export interface WriteResult {
  /** Path relative to the target dir (as the adapter emitted it). */
  path: string;
  /** The action the conflict policy resolved to. */
  action: WriteAction;
}

/**
 * Atomically write `contents` to `absolute`.
 *
 * The bytes are written to a sibling temp file first, then renamed over the
 * destination — `rename` is atomic on a single filesystem, so a reader never
 * sees a half-written file and a failure mid-write never clobbers the existing
 * target. On any error the temp file is removed and the error rethrown.
 */
export function atomicWriteFile(absolute: string, contents: string): void {
  mkdirSync(dirname(absolute), { recursive: true });
  const suffix = randomBytes(6).toString("hex");
  const tmp = `${absolute}.${suffix}.tmp`;
  try {
    writeFileSync(tmp, contents);
    renameSync(tmp, absolute);
  } catch (err) {
    try {
      rmSync(tmp, { force: true });
    } catch {
      // best-effort cleanup; surface the original failure below
    }
    throw err;
  }
}

/**
 * Write the `.le-restaurant.json` manifest to the target dir.
 *
 * Overwrites any existing manifest so the file always reflects the latest
 * install — the `check` command reads this as the single source of truth.
 */
export function writeManifest(
  manifest: InstallManifest,
  targetDir: string,
): void {
  const absolute = resolve(targetDir, ".le-restaurant.json");
  atomicWriteFile(absolute, JSON.stringify(manifest, null, 2) + "\n");
}

/**
 * Write a set of adapter outputs into the install target.
 *
 * Each `FileOutput.path` is resolved relative to `ctx.targetDir` and written
 * atomically. When a target file already exists, the `conflictPolicy` decides:
 * - `skip` — leave the existing file untouched;
 * - `overwrite` — replace it with the emitted contents;
 * - `merge` — for `mode: "merge"` outputs, fold the managed block into the
 *   existing file (preserving user content outside the markers); for other
 *   outputs, fall back to overwrite.
 *
 * A file that does not yet exist is always created regardless of policy.
 */
export function writeOutputs(
  outputs: FileOutput[],
  ctx: InstallContext,
): WriteResult[] {
  const results: WriteResult[] = [];
  for (const output of outputs) {
    const absolute = isAbsolute(output.path)
      ? output.path
      : resolve(ctx.targetDir, output.path);

    if (!existsSync(absolute)) {
      atomicWriteFile(absolute, output.contents);
      results.push({ path: output.path, action: "created" });
      continue;
    }

    switch (ctx.conflictPolicy) {
      case "skip":
        results.push({ path: output.path, action: "skipped" });
        break;
      case "merge":
        if (output.mode === "merge") {
          const existing = readFileSync(absolute, "utf8");
          atomicWriteFile(absolute, mergeManagedBlock(existing, output.contents));
          results.push({ path: output.path, action: "merged" });
        } else {
          atomicWriteFile(absolute, output.contents);
          results.push({ path: output.path, action: "overwritten" });
        }
        break;
      default:
        atomicWriteFile(absolute, output.contents);
        results.push({ path: output.path, action: "overwritten" });
        break;
    }
  }
  return results;
}

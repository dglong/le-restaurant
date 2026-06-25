import type { InstallManifest } from "./types.js";

/** The staleness verdict for a single skill. */
export type SkillStatusKind = "up-to-date" | "stale (local)" | "unknown";

/** The npm-freshness verdict for the installed package itself. */
export type NpmStatusKind = "update available (npm)" | "up-to-date (npm)";

/** Per-skill comparison result returned by `checkSkills`. */
export interface SkillStatus {
  /** The skill identifier. */
  name: string;
  /** Version recorded in the installed manifest. */
  installedVersion: string;
  /** Version shipped in the currently-running package (bundled). */
  bundledVersion: string | undefined;
  /** The staleness verdict. */
  status: SkillStatusKind;
}

/**
 * Compare two semver strings numerically (major.minor.patch).
 *
 * Returns:
 *  - negative when `a` is older than `b`
 *  - 0 when equal
 *  - positive when `a` is newer than `b`
 *
 * No external dependency: splits on `.` and compares each numeric segment.
 * Pre-release / build-metadata suffixes (if any) are ignored — good enough
 * for the local-drift use-case where only package-published versions appear.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string): number[] =>
    v
      .split(".")
      .slice(0, 3)
      .map((seg) => parseInt(seg, 10) || 0);

  const [aMajor = 0, aMinor = 0, aPatch = 0] = parse(a);
  const [bMajor = 0, bMinor = 0, bPatch = 0] = parse(b);

  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

/**
 * Compare every skill in `manifest` against the `bundled` version map.
 *
 * Pure function — no I/O. `bundled` is `{ [skillName]: semver }` derived
 * from the package's vendored `skills/` directory via `loadSkills()`.
 *
 * Rules:
 * - `installedVersion < bundledVersion` → `"stale (local)"`
 * - `installedVersion >= bundledVersion` → `"up-to-date"`
 * - skill not present in `bundled` → `"unknown"`
 */
export function checkSkills(
  manifest: InstallManifest,
  bundled: Record<string, string>,
): SkillStatus[] {
  return Object.entries(manifest.skills).map(([name, installedVersion]) => {
    const bundledVersion = bundled[name];

    if (bundledVersion === undefined) {
      return { name, installedVersion, bundledVersion: undefined, status: "unknown" };
    }

    const cmp = compareVersions(installedVersion, bundledVersion);
    const status: SkillStatusKind = cmp < 0 ? "stale (local)" : "up-to-date";

    return { name, installedVersion, bundledVersion, status };
  });
}

/**
 * Fetch the latest published version of a package from the npm registry.
 *
 * The `fetcher` parameter is injectable so tests can pass a mock without
 * touching the global `fetch`. Defaults to the Node 18+ global `fetch`.
 *
 * Scoped package names (e.g. `@scope/pkg`) must have the `/` between scope
 * and name percent-encoded (`%2F`) in the registry URL — the leading `@` is
 * kept as-is.
 *
 * Returns `null` when the network is unavailable (fetch throws) or the
 * registry returns a non-200 status. Callers must handle the offline case
 * gracefully and must not propagate the error.
 */
export async function fetchLatestNpmVersion(
  pkgName: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  try {
    // Encode the "/" between scope and name; keep the leading "@".
    const encoded = pkgName.replace("/", "%2F");
    const url = `https://registry.npmjs.org/${encoded}/latest`;
    const res = await fetcher(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}

/**
 * Compare the installed package version against the npm registry's latest.
 *
 * Pure function — no I/O.
 * - installed < latest  → `"update available (npm)"`
 * - installed >= latest → `"up-to-date (npm)"`
 */
export function checkNpmFreshness(
  installedVersion: string,
  latestVersion: string,
): NpmStatusKind {
  return compareVersions(installedVersion, latestVersion) < 0
    ? "update available (npm)"
    : "up-to-date (npm)";
}

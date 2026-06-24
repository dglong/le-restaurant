/**
 * Managed-marker helper, shared by the merge-style adapters (Codex, Gemini).
 *
 * Tool-owned content inside files a user may also edit (`AGENTS.md`,
 * `GEMINI.md`) is bounded by managed markers. Only the span between the
 * markers is ever rewritten on a re-run; everything outside is the user's and
 * is preserved verbatim.
 */

export const MARKER_START = "<!-- le-restaurant:start -->";
export const MARKER_END = "<!-- le-restaurant:end -->";

/** Notice rendered as the first line inside every managed block. */
export const MANAGED_NOTICE =
  "<!-- Managed by le-restaurant. Do not edit between these markers; re-run the installer to update. -->";

/** Wrap `inner` content in managed markers, returning a complete block. */
export function renderManagedBlock(inner: string): string {
  return `${MARKER_START}\n${inner}\n${MARKER_END}\n`;
}

/** Does `content` already contain a managed block? */
export function hasManagedBlock(content: string): boolean {
  return content.includes(MARKER_START) && content.includes(MARKER_END);
}

/**
 * Merge a freshly rendered managed `block` into `existing` file content.
 *
 * If `existing` already contains a managed span, that span (markers included)
 * is replaced in place. Otherwise the block is appended, separated from any
 * prior content by a blank line. User content outside the markers is never
 * touched, so repeated merges are idempotent for a stable block.
 */
export function mergeManagedBlock(existing: string, block: string): string {
  const start = existing.indexOf(MARKER_START);
  const end = existing.indexOf(MARKER_END);
  if (start !== -1 && end !== -1 && end > start) {
    // Replace the managed span, including the end marker and its trailing
    // newline if present, so the rendered block (which ends in "\n") slots in
    // without accumulating blank lines.
    let after = end + MARKER_END.length;
    if (existing[after] === "\n") after += 1;
    return existing.slice(0, start) + block + existing.slice(after);
  }
  if (existing.length === 0) return block;
  const separator = existing.endsWith("\n") ? "\n" : "\n\n";
  return existing + separator + block;
}

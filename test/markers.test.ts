import { describe, expect, it } from "vitest";
import {
  MARKER_END,
  MARKER_START,
  mergeManagedBlock,
  renderManagedBlock,
} from "../src/markers.js";

describe("managed markers", () => {
  it("wraps inner content between start/end markers", () => {
    const block = renderManagedBlock("hello");
    expect(block).toBe(`${MARKER_START}\nhello\n${MARKER_END}\n`);
  });

  it("appends a managed block to existing user content when no markers exist", () => {
    const existing = "# My notes\n\nUser owns this.\n";
    const block = renderManagedBlock("managed");
    const merged = mergeManagedBlock(existing, block);
    expect(merged.startsWith(existing)).toBe(true);
    expect(merged).toContain(block);
  });

  it("replaces only the managed span on re-merge, leaving user content intact", () => {
    const before = "BEFORE user content\n\n";
    const after = "\nAFTER user content\n";
    // existing file already has a managed block bounded by user content.
    const first = `${before}${renderManagedBlock("v1")}${after}`;
    expect(first.startsWith(before)).toBe(true);
    expect(first.endsWith(after)).toBe(true);

    const second = mergeManagedBlock(first, renderManagedBlock("v2"));
    expect(second).toContain("v2");
    expect(second).not.toContain("v1");
    // still bounded by the same surrounding user content, no duplication
    expect(second.startsWith(before)).toBe(true);
    expect(second.endsWith(after)).toBe(true);
    expect(second.match(new RegExp(MARKER_START, "g"))?.length).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import * as api from "../src/index.js";

describe("public API re-exports", () => {
  it("exposes all three adapters", () => {
    expect(api.claudeAdapter.id).toBe("claude");
    expect(api.codexAdapter.id).toBe("codex");
    expect(api.geminiAdapter.id).toBe("gemini");
  });

  it("exposes the install dispatch + summary helpers", () => {
    expect(typeof api.selectAdapter).toBe("function");
    expect(typeof api.runInstall).toBe("function");
    expect(typeof api.renderSummary).toBe("function");
  });
});

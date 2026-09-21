import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Critical milestone summary", () => {
  it("shows the confirmed MVP live summary and preserves UAT execution context", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain("MVP LIVE — The MVP launched on Sep. 21. The current focus is UAT execution, defect triage, regression validation, and TY26 pilot readiness.");
    expect(source).toContain("MVP launched Sep. 21. The current focus is UAT execution, defect triage, regression validation, and TY26 pilot readiness.");
    expect(source).toContain("MVP Live Date");
    expect(source).toContain('id="overall-milestone-status"');
    expect(source).toContain("Milestone Outlook");
    expect(source).toContain("MVP_LIVE_DATE_LABEL");
  });
});

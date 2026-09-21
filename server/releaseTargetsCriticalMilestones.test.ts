import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Release Targets critical milestones", () => {
  it("presents MVP as live and UAT execution as the current critical milestone", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain("uatExecutionMilestone");
    expect(source).toContain('label: "MVP Release"');
    expect(source).toContain('label: "Current Critical Milestone"');
    expect(source).toContain("Live · ${MVP_LIVE_DATE_LABEL}");
    expect(source).toContain("MVP launch achieved {MVP_LIVE_DATE_LABEL}; current delivery focus is UAT execution and TY26 pilot readiness");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Release Targets critical milestones", () => {
  it("presents the MVP target and UAT execution window as the next two critical milestones", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain('["mvp-target", "uat-execution"].includes(milestone.id)');
    expect(source).toContain('"Next Critical Milestone"');
    expect(source).toContain('"Following Critical Milestone"');
    expect(source).not.toContain("getNextCriticalMilestone");
  });
});

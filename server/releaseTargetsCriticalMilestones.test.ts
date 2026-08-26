import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Release Targets critical milestones", () => {
  it("presents the two requested Aug. 28 milestones rather than the prior single next-milestone value", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain('milestone.dateLabel === "Aug 28, 2026"');
    expect(source).toContain('"Next Critical Milestone"');
    expect(source).toContain('"Following Critical Milestone"');
    expect(source).not.toContain("getNextCriticalMilestone");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("MVP Critical Milestones header", () => {
  it("removes the standalone next-critical-milestone callout while retaining the executive release-target calculation", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).not.toContain('textTransform: "uppercase" }}>Next Critical Milestone</div>');
    expect(source).toContain('{ label: "Next Critical Milestone", value: `${nextCriticalMilestone.dateLabel} · ${nextCriticalMilestone.name}`');
    expect(source).toContain("criticalMilestones.map");
  });
});

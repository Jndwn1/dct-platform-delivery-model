import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("MVP Critical Milestones header", () => {
  it("removes the standalone next-critical-milestone callout while showing UAT execution as the current release milestone", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).not.toContain('textTransform: "uppercase" }}>Next Critical Milestone</div>');
    expect(source).toContain('label: "Current Critical Milestone"');
    expect(source).toContain("uatExecutionMilestone");
    expect(source).toContain("criticalMilestones.map");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Quick Navigation placement", () => {
  it("renders Quick Navigation directly after the Executive Health banner and before the executive summary", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const quickNavigation = source.indexOf("<QuickNavigationCard items={quickNavItems}");
    const executiveSummary = source.indexOf("EXECUTIVE STATUS SUMMARY");
    const milestoneSection = source.indexOf("MVP Critical Milestones");

    expect(quickNavigation).toBeGreaterThan(-1);
    expect(quickNavigation).toBeLessThan(executiveSummary);
    expect(quickNavigation).toBeLessThan(milestoneSection);
    expect(source).toContain("Experience the BA Operating System");
    expect(source).toContain("View QA Registry detail");
  });
});

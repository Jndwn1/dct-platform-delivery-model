import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger UAT Timeline Overview", () => {
  it("presents completed preparation, the PI4 UAT handoff, execution, and pilot-readiness milestones", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/UATTestingPage.tsx"), "utf8");

    expect(source).toContain("Roger UAT Timeline Overview");
    expect(source).toContain("Completed / Pre-UAT Preparation");
    expect(source).toContain("July 20");
    expect(source).toContain("Scope finalized");
    expect(source).toContain("August 10");
    expect(source).toContain("Test population identified");
    expect(source).toContain("August 28");
    expect(source).toContain("MVP feature development complete");
    expect(source).toContain("September 7");
    expect(source).toContain("Source data ready");

    expect(source).toContain("Current / Immediate Milestone");
    expect(source).toContain("September 18");
    expect(source).toContain("Final system readiness sign-off and UAT kickoff communications");
    expect(source).toContain("September 21");
    expect(source).toContain("UAT execution begins");
    expect(source).toContain("September 21 – October 9");
    expect(source).toContain("PI4 Focus:");
    expect(source).toContain("Complete readiness activities, support UAT execution, triage defects, and address issues required for TY26 pilot readiness.");

    expect(source).toContain("Post-UAT / Pilot Readiness");
    expect(source).toContain("UAT closeout; defect triage; scope prioritization; SME working sessions");
    expect(source).toContain("Pilot population defined; UAT Round 2 for TY26 pilot scope");
    expect(source).toContain("UAT Round 2 continues; final development and regression testing");
    expect(source).toContain("Pilot launch and training");
    expect(source).toContain("UAT outcomes will inform PI4 defect prioritization, remaining MVP work, regression testing, and TY26 pilot readiness.");

    expect(source).toContain("Completed</span>");
    expect(source).toContain("Current / Imminent</span>");
    expect(source).toContain("Upcoming</span>");
    expect(source).not.toContain("Dedicated defect resolution and regression testing window established (Sep 13–16).");
  });
});

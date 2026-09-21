import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger UAT Timeline", () => {
  it("presents the supplied six-week phase plan, involvement legend, and supporting sessions", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/UATTestingPage.tsx"), "utf8");

    expect(source).toContain("Roger UAT Timeline");
    expect(source).toContain("UAT Operating Plan");
    expect(source).toContain("Weekly tester and UAT team involvement from preparation through follow-up.");

    expect(source).toContain("Week 0");
    expect(source).toContain("9/14–9/18");
    expect(source).toContain("Week 1");
    expect(source).toContain("9/21–9/25");
    expect(source).toContain("Week 2");
    expect(source).toContain("9/28–10/2");
    expect(source).toContain("Week 3");
    expect(source).toContain("10/5–10/9");
    expect(source).toContain("Week 4");
    expect(source).toContain("10/12–10/16");
    expect(source).toContain("Week 5");
    expect(source).toContain("10/19–10/23");

    expect(source).toContain("UAT prep");
    expect(source).toContain("internal triage");
    expect(source).toContain("UAT kick-off*");
    expect(source).toContain("UAT testing round");
    expect(source).toContain("User touchpoints");
    expect(source).toContain("Teams chat");
    expect(source).toContain("Bug consolidation &amp; internal triage");
    expect(source).toContain("daily team meeting");
    expect(source).toContain("UAT sign-off**");
    expect(source).toContain("Clarification / follow-up on feedback");

    expect(source).toContain("UAT tester involvement");
    expect(source).toContain("UAT team involvement");
    expect(source).toContain("UAT Participation Expectation &amp; Access Readiness Session");
    expect(source).toContain("Sep 17, 11:00 a.m.–12:00 p.m. CT");
    expect(source).toContain("Kick-off meeting");
    expect(source).toContain("Sep 21, 9:30–11:00 a.m. CT");
    expect(source).toContain("Sign-off meeting");
    expect(source).toContain("Oct 9, to be scheduled");
    expect(source).toContain("Weeks 4–5 if additional clarification is required.");

    expect(source).not.toContain("Completed / Pre-UAT Preparation");
    expect(source).not.toContain("PI4 Focus:");
    expect(source).not.toContain("Post-UAT / Pilot Readiness");
  });
});

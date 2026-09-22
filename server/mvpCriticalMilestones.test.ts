import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, GOVERNED_PROGRAM_HEALTH } from "../client/src/contexts/BatchStatusContext";
import {
  deriveMvpCriticalMilestones,
  getNextCriticalMilestone,
  MVP_CRITICAL_MILESTONE_SCHEDULE,
  MVP_TARGET_DATE,
  resolveMilestoneStatus,
} from "../client/src/lib/mvpCriticalMilestones";

describe("MVP Critical Milestones", () => {
  it("keeps the communicated milestone schedule tied to the shared RC-3 target and UAT execution window", () => {
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE).toHaveLength(6);
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE.find(item => item.id === "mvp-target")?.date).toBe(MVP_TARGET_DATE);
    expect(MVP_TARGET_DATE).toBe(GOVERNED_PROGRAM_HEALTH.pilotTargetDate);
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE.find(item => item.id === "remaining-stories-py-ready")?.dateLabel).toBe("Aug 28, 2026");
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE.find(item => item.id === "uat-execution")).toMatchObject({
      date: "2026-09-21",
      endDate: "2026-10-09",
      dateLabel: "Sep 21–Oct 9, 2026",
      name: "UAT Execution",
      sourceScope: "uat",
    });
  });

  it("derives milestone status and source evidence from shared governed delivery inputs", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const criticalStories = milestones.find(item => item.id === "critical-story-completion");
    const environment = milestones.find(item => item.id === "environment-readiness");
    const priorYear = milestones.find(item => item.id === "remaining-stories-py-ready");
    const uatReady = milestones.find(item => item.id === "uat-ready");
    const mvpLive = milestones.find(item => item.id === "mvp-target");
    
    expect(criticalStories?.status).toBe("Complete");
    expect(criticalStories?.source).toBe("10 technical stories and 2 bugs — from the governed ADO lifecycle");
    expect(criticalStories?.shortDescription).toBe("Critical MVP story work is complete. TDC rule-result and adjustment items are complete, along with reporting page and sign-off development. Two unnecessary stories will be removed from the board.");
    expect(environment?.source).toContain("Environment Management ADO");
    expect(environment?.shortDescription).toBe("Reporting and sign-off changes are being pushed to Dev.");
    expect(environment?.status).toBe("Complete");
    expect(environment?.statusNotes).toEqual([
      "Roger UI handoff and backend/UI reconciliation are still in progress.",
      "Tax Adjustments Workspace QA testing is in progress.",
      "QA findings have been consolidated into one defect for resolution.",
    ]);
    expect(priorYear?.source).toBe("B31 PDC and B31 TDC closed ADO records");
    expect(priorYear?.owner).toBe("Abbas, Nasar / Luca, Gary");
    expect(priorYear?.status).toBe("Complete");
    expect(priorYear?.statusNotes).toEqual([
      "TDC PY table and API surface for CCH migration are in progress.",
      "Final mapping validation using a client with additional mapping rows is pending.",
      "Authorization allow-list PR approval is pending.",
    ]);
    expect(uatReady?.status).toBe("Complete");
    expect(uatReady?.confirmationRequired).toBe(false);
    expect(mvpLive).toMatchObject({
      name: "MVP Live",
      status: "Complete",
      shortDescription: "MVP is live. The Sep. 21 production launch and RC-3 delivery milestone have been achieved.",
    });
  });

  it("selects UAT execution as the active critical milestone after MVP launch", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const asOf = new Date("2026-09-21T12:00:00");
    const next = getNextCriticalMilestone(milestones, asOf);
    expect(next.id).toBe("uat-execution");
    expect(resolveMilestoneStatus(next, asOf)).toBe("In Progress");
    expect(resolveMilestoneStatus(next, new Date("2026-09-22T12:00:00"))).toBe("In Progress");
  });
});

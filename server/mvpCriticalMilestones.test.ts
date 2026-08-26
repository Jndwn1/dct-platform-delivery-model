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
  it("keeps the communicated five-milestone schedule tied to the shared RC-3 target", () => {
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE).toHaveLength(5);
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE.at(-1)?.date).toBe(MVP_TARGET_DATE);
    expect(MVP_TARGET_DATE).toBe(GOVERNED_PROGRAM_HEALTH.pilotTargetDate);
    expect(MVP_CRITICAL_MILESTONE_SCHEDULE.find(item => item.id === "remaining-stories-py-ready")?.dateLabel).toBe("Aug 28, 2026");
  });

  it("derives milestone status and source evidence from shared governed delivery inputs", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const criticalStories = milestones.find(item => item.id === "critical-story-completion");
    const environment = milestones.find(item => item.id === "environment-readiness");
    const priorYear = milestones.find(item => item.id === "remaining-stories-py-ready");
    
    expect(criticalStories?.status).toBe("Complete");
    expect(criticalStories?.source).toBe("10 technical stories and 2 bugs — from the governed ADO lifecycle");
    expect(environment?.source).toContain("Environment Management ADO");
    expect(priorYear?.source).toBe("B31 PDC and B31 TDC Active ADO records");
    expect(priorYear?.owner).toBe("Abbas, Nasar / Luca, Gary");
    expect(priorYear?.statusNotes).toEqual([
      "TWB PY Data is complete.",
      "CCH code will be retrieved from IMS through the Export API.",
    ]);
  });

  it("selects the Aug. 27 milestone after user-confirmed critical-story completion", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const asOf = new Date("2026-08-20T12:00:00");
    const next = getNextCriticalMilestone(milestones, asOf);
    expect(next.id).toBe("remaining-stories-py-ready");
    expect(resolveMilestoneStatus(next, new Date("2026-08-22T12:00:00"))).toBe("In Progress");
  });
});

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
  });

  it("derives milestone status and source evidence from shared governed delivery inputs", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const criticalStories = milestones.find(item => item.id === "critical-story-completion");
    const environment = milestones.find(item => item.id === "environment-readiness");
    const priorYear = milestones.find(item => item.id === "remaining-stories-py-ready");
    
    expect(criticalStories?.status).toBe("In Progress");
    expect(criticalStories?.source).toContain("active MVP features");
    expect(criticalStories?.source).toContain("8 technical stories and 3 bugs");
    expect(environment?.source).toContain("Environment Management ADO");
    expect(priorYear?.source).toContain("B31 PDC and B31 TDC");
  });

  it("selects the next incomplete milestone from derived inputs and flags overdue confirmation", () => {
    const milestones = deriveMvpCriticalMilestones(DEFAULT_STATUS);
    const asOf = new Date("2026-08-20T12:00:00");
    const next = getNextCriticalMilestone(milestones, asOf);
    expect(next.id).toBe("critical-story-completion");
    expect(resolveMilestoneStatus(next, new Date("2026-08-22T12:00:00"))).toBe("At Risk / Confirmation Required");
  });
});

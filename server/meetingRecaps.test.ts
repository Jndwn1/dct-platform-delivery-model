import { describe, expect, it } from "vitest";
import { LLMRequestTimeoutError } from "./_core/llm";
import { buildTdcStandupEmail, normalizeMeetingRecapAnalysis, retryTimedOutRecapAnalysis } from "./meetingRecaps";

describe("TDC Meeting Recaps", () => {
  it("keeps developer updates separate and applies evidence-safe fallback values", () => {
    const recap = normalizeMeetingRecapAnalysis({
      meetingDate: "2026-09-28",
      meetingTitle: "TDC Daily Standup",
      attendees: ["Jenniver Stafford", "Gary Luca"],
      sprint: "Not specified",
      summaryBullets: ["TDC priorities include MVP UAT bugs and assigned State or Provision stories."],
      keyFocus: ["MVP UAT bugs"],
      developerUpdates: [
        { teamMember: "Gary", completedProgress: "Reviewed intake", currentFocus: "State and Provision story review", nextStep: "Return reviewed stories", blockersSupportNeeded: "None reported" },
        { teamMember: "Reshma", completedProgress: "QA fixes deployed", currentFocus: "Summary adjustment description story", nextStep: "Investigate Gateway calls failure", blockersSupportNeeded: "Needs confirmation" },
      ],
      actionItems: [],
      blockersRisks: [],
      decisionsCallouts: [],
      notes: "Not specified",
    });

    expect(recap.developerUpdates).toHaveLength(3);
    expect(recap.developerUpdates.map((update) => update.teamMember)).toEqual(["Gary", "Reshma", "Morgan"]);
    expect(recap.developerUpdates[2]).toMatchObject({ currentFocus: "Needs confirmation", nextStep: "Not specified", blockersSupportNeeded: "None reported" });
  });

  it("formats a concise professional draft email without marking it sent", () => {
    const recap = normalizeMeetingRecapAnalysis({
      meetingDate: "2026-09-28",
      meetingTitle: "TDC Daily Standup",
      attendees: ["Jenniver Stafford", "Gary Luca", "Reshma Sajja", "Morgan Willis"],
      sprint: "Not specified",
      summaryBullets: ["The sprint priorities are MVP UAT bugs and assigned State or Provision stories."],
      keyFocus: ["MVP UAT bugs", "State and Provision stories"],
      developerUpdates: [
        { teamMember: "Gary", completedProgress: "No completed update reported", currentFocus: "State and Provision story review", nextStep: "Assign and return reviewed stories", blockersSupportNeeded: "None reported" },
        { teamMember: "Reshma", completedProgress: "Deployed return filing issue-count fixes to QA", currentFocus: "Summary adjustment description story", nextStep: "Investigate Perf environment Gateway calls failure", blockersSupportNeeded: "None reported" },
        { teamMember: "Morgan", completedProgress: "Identified one placeholder bug as removable", currentFocus: "Two listed bugs", nextStep: "Continue investigating both bugs", blockersSupportNeeded: "None reported" },
      ],
      actionItems: [{ actionItem: "Review new stories and determine assignment", owner: "Gary", statusNextStep: "Review today", dueDate: "Not specified" }],
      blockersRisks: ["QA-ready stories 11 and 12 are awaiting Arvind's status update."],
      decisionsCallouts: ["Post-MVP TDC and Gateway team will focus on Tax Year 26 readiness; PDC is operating separately."],
      notes: "No sprint number explicitly stated.",
    });

    const email = buildTdcStandupEmail(recap);
    expect(email).toContain("Subject: TDC Daily Standup Recap — September 28, 2026");
    expect(email).toContain("| Gary |");
    expect(email).toContain("| Reshma |");
    expect(email).toContain("| Morgan |");
    expect(email).toContain("ACTION ITEMS");
    expect(email).toContain("BLOCKERS / RISKS");
    expect(email).toContain("DECISIONS / KEY CALL-OUTS");
    expect(email).toContain("Thanks,\nJenniver");
    expect(email).not.toContain("Email Status: Sent");
  });

  it("retries one bounded recap analysis timeout before returning a result", async () => {
    let attempts = 0;

    const result = await retryTimedOutRecapAnalysis(async () => {
      attempts += 1;
      if (attempts === 1) throw new LLMRequestTimeoutError(75_000);
      return "recap-ready";
    });

    expect(result).toBe("recap-ready");
    expect(attempts).toBe(2);
  });

  it("stops after the configured recap-analysis timeout attempts", async () => {
    let attempts = 0;

    await expect(retryTimedOutRecapAnalysis(async () => {
      attempts += 1;
      throw new LLMRequestTimeoutError(75_000);
    })).rejects.toBeInstanceOf(LLMRequestTimeoutError);

    expect(attempts).toBe(2);
  });
});

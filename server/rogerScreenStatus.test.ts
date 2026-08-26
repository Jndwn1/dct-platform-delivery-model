import { describe, expect, it } from "vitest";
import { countBy, getRogerScreenDeliverySummary, getRogerScreenReadinessSummary, ROGER_MVP_MILESTONES, ROGER_MVP_SCREEN_RECORDS } from "../client/src/lib/rogerMvpScreenStatus";

describe("Roger MVP screen status model", () => {
  it("contains all authoritative current screen records", () => {
    expect(ROGER_MVP_SCREEN_RECORDS).toHaveLength(18);
    expect(ROGER_MVP_SCREEN_RECORDS.map(record => record.screen)).toEqual(expect.arrayContaining(["Login", "Trial Balance Upload", "Line Mapping", "Line Mapping Page", "Summary Page — Inside Consolidation", "Sign Off"]));
    expect(ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "book-return")).toBeUndefined();
    expect(ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "review-submit")).toBeUndefined();
  });

  it("keeps delivery status and QA readiness as separate dimensions", () => {
    const lineMappingPage = ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "line-mapping-page");
    const signOff = ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "sign-off");
    expect(lineMappingPage).toMatchObject({ deliveryStatus: "Completed", qaReady: "Available" });
    expect(signOff?.notes).toContain("#1450692");
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "deliveryStatus", "Completed")).toBe(9);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "deliveryStatus", "In Progress")).toBe(9);
  });

  it("derives the compact landing-page readiness metrics from the same 18-screen registry", () => {
    expect(getRogerScreenReadinessSummary()).toEqual({
      total: 18,
      ready: 0,
      partial: 0,
      notReady: 0,
      notStated: 18,
    });
  });

  it("derives the MVP Critical Milestones delivery rollup from the same 18-screen registry", () => {
    expect(getRogerScreenDeliverySummary()).toEqual({
      total: 18,
      completed: 9,
      done: 0,
      inQa: 0,
      inProgress: 9,
      notStarted: 0,
      outOfScope: 0,
      notFunctional: 0,
    });
  });

  it("preserves the supplied Aug 28, Sep 4, and TBD milestone dates", () => {
    expect(ROGER_MVP_MILESTONES.map(milestone => milestone.date)).toEqual(["Aug 28, 2026", "Aug 28, 2026", "Sep 4, 2026", "TBD"]);
  });
});

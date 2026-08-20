import { describe, expect, it } from "vitest";
import { countBy, getRogerScreenReadinessSummary, ROGER_MVP_MILESTONES, ROGER_MVP_SCREEN_RECORDS } from "../client/src/lib/rogerMvpScreenStatus";

describe("Roger MVP screen status model", () => {
  it("contains all authoritative current screen records", () => {
    expect(ROGER_MVP_SCREEN_RECORDS).toHaveLength(18);
    expect(ROGER_MVP_SCREEN_RECORDS.map(record => record.screen)).toEqual(expect.arrayContaining(["Login", "Trial Balance Upload", "Line Mapping", "Summary Page (inside Consolidation)", "Sign Off"]));
    expect(ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "line-mapping-page")).toBeUndefined();
  });

  it("keeps delivery status and QA readiness as separate dimensions", () => {
    const lineMapping = ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "line-mapping");
    expect(lineMapping).toMatchObject({ deliveryStatus: "In QA", qaReadinessStatus: "Ready to Test", qaReady: "Aug 28" });
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "deliveryStatus", "In Progress")).toBe(12);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "qaReadinessStatus", "Ready to Test")).toBe(4);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "qaReadinessStatus", "Partially Ready")).toBe(8);
  });

  it("derives the compact landing-page readiness metrics from the same 18-screen registry", () => {
    expect(getRogerScreenReadinessSummary()).toEqual({
      total: 18,
      ready: 4,
      partial: 8,
      notReady: 6,
    });
  });

  it("preserves the supplied Aug 28, Sep 4, and TBD milestone dates", () => {
    expect(ROGER_MVP_MILESTONES.map(milestone => milestone.date)).toEqual(["Aug 28, 2026", "Aug 28, 2026", "Sep 4, 2026", "TBD"]);
  });
});

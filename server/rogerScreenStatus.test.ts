import { describe, expect, it } from "vitest";
import { countBy, getRogerScreenDeliverySummary, getRogerScreenReadinessSummary, orderRogerScreensForRegistry, ROGER_MVP_MILESTONES, ROGER_MVP_SCREEN_RECORDS } from "../client/src/lib/rogerMvpScreenStatus";

describe("Roger MVP screen status model", () => {
  it("contains all authoritative current screen records", () => {
    expect(ROGER_MVP_SCREEN_RECORDS).toHaveLength(18);
    expect(ROGER_MVP_SCREEN_RECORDS.map(record => record.screen)).toEqual(expect.arrayContaining(["Login", "Trial Balance Upload", "Line Mapping", "Line Mapping Page", "Summary Page — Inside Consolidation", "Sign Off"]));
    expect(ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "book-return")).toBeUndefined();
    expect(ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "review-submit")).toBeUndefined();
  });

  it("marks all 18 Roger MVP screens completed for both delivery and QA", () => {
    const lineMappingPage = ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "line-mapping-page");
    const signOff = ROGER_MVP_SCREEN_RECORDS.find(record => record.id === "sign-off");

    expect(lineMappingPage).toMatchObject({ deliveryStatus: "Completed", qaReady: "Available" });
    expect(signOff?.notes).toContain("#1450692");
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "deliveryStatus", "Completed")).toBe(18);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "deliveryStatus", "In Progress")).toBe(0);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "qaReadinessStatus", "Completed")).toBe(18);
    expect(countBy(ROGER_MVP_SCREEN_RECORDS, "qaReadinessStatus", "Not stated")).toBe(0);
    expect(new Set(ROGER_MVP_SCREEN_RECORDS.map(record => record.lastUpdated))).toEqual(new Set(["Sep 22, 2026"]));
  });

  it("derives the completed QA metric from the same 18-screen registry", () => {
    expect(getRogerScreenReadinessSummary()).toEqual({
      total: 18,
      completed: 18,
      ready: 0,
      partial: 0,
      notReady: 0,
      notStated: 0,
    });
  });

  it("derives an all-complete delivery rollup from the same 18-screen registry", () => {
    expect(getRogerScreenDeliverySummary()).toEqual({
      total: 18,
      completed: 18,
      done: 0,
      inQa: 0,
      inProgress: 0,
      notStarted: 0,
      outOfScope: 0,
      notFunctional: 0,
    });
  });

  it("keeps all completed screen records in the authoritative registry", () => {
    const ordered = orderRogerScreensForRegistry(ROGER_MVP_SCREEN_RECORDS);

    expect(ordered).toHaveLength(18);
    expect(ordered.every(record => record.deliveryStatus === "Completed")).toBe(true);
  });

  it("preserves the supplied Roger MVP milestone dates, owners, and status notes", () => {
    expect(ROGER_MVP_MILESTONES).toEqual([
      { milestone: "All MVP code in QA environment", owners: "Santosh, Stephane", date: "28-Aug", notes: "" },
      { milestone: "Tax Portal code to send Trial Balance to Roger in QA environment", owners: "Amit", date: "28-Aug", notes: "Trial Balance Upload screen — Dev Ready Aug 15, QA Ready Aug 28 (validation issues in progress)" },
      { milestone: "QA team done testing", owners: "Sreedhar, Suvarna", date: "9-Sep", notes: "Provided QA has environment availability and it is stable, for both QA and Performance." },
      { milestone: "MVP code available in UAT environment", owners: "Santosh, Stephane", date: "15-Sep", notes: "Code deployed to UAT previously but may not reflect latest MVP changes. Date for complete, current MVP code deployment to UAT is still being determined." },
    ]);
  });
});

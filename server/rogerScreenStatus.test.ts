import { describe, expect, it } from "vitest";
import { countBy, getRogerScreenDeliverySummary, getRogerScreenReadinessSummary, orderRogerScreensForRegistry, ROGER_MVP_MILESTONES, ROGER_MVP_SCREEN_RECORDS } from "../client/src/lib/rogerMvpScreenStatus";

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

  it("orders In Progress records first and Completed records last for the Screen / Area registry", () => {
    const ordered = orderRogerScreensForRegistry(ROGER_MVP_SCREEN_RECORDS);

    expect(ordered.slice(0, 9).every(record => record.deliveryStatus === "In Progress")).toBe(true);
    expect(ordered.slice(-9).every(record => record.deliveryStatus === "Completed")).toBe(true);
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

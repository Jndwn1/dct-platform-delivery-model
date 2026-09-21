import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATUS,
  BATCH_DELIVERY_RECORDS,
  buildDeliveryReconciliationDataset,
  DASHBOARD_REPORTING_WEEK_END,
  DASHBOARD_REPORTING_WEEK_START,
  GOVERNED_PROGRAM_HEALTH,
  getPi3CumulativeCompleted,
  isInDashboardReportingWeek,
  LOCKED_MVP_BASELINE,
  matchesLockedMvpBaseline,
  PI4_PLANNED_FEATURES,
  PI3_HISTORICAL_COMPLETION_BASELINE,
  PI3_POST_BASELINE_CLOSURES,
  PI_MEMBERSHIP,
  contextToDctStatus,
  deriveBatchMetrics,
  deriveMvpMetrics,
  derivePICompletion,
} from "../client/src/contexts/BatchStatusContext";
import { BATCH_CALENDAR_PI23 } from "../client/src/components/ExecDashboard";
import { HISTORICAL_ADO_EXCLUDED_BATCH_IDS } from "../client/src/pages/BatchDetailPage";

describe("MVP portfolio closure status model", () => {
  it("keeps exactly five active workstreams and records the four current-day closures", () => {
    const activeWorkstreams = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.id)
      .sort();

    expect(activeWorkstreams).toEqual(["B28", "B45", "B9A", "DEFECT-TRACKING", "ENV-MANAGEMENT"]);
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B10")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B31-PDC")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "PERFORMANCE-TESTING")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "DCT-QA-WORKSTREAM")?.sourceStatusLabel).toBe("Closed");
  });

  it("maps closed workstreams to platform closed state", () => {
    expect(contextToDctStatus(DEFAULT_STATUS["10"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["31"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["performance-testing"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["dct-qa-workstream"])).toBe("CLOSED");
  });

  it("keeps PI4 planning visibility separate from the current MVP delivery portfolio", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 22,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 81,
    });
    expect(PI4_PLANNED_FEATURES).toHaveLength(5);
  });

  it("matches the confirmed post-closure MVP baseline", () => {
    const metrics = deriveMvpMetrics(DEFAULT_STATUS);
    expect(LOCKED_MVP_BASELINE).toMatchObject({
      totalFeatures: 27,
      batchFeatures: 27,
      nonBatchFeatures: 0,
      complete: 22,
      active: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 81,
    });
    expect(matchesLockedMvpBaseline(metrics)).toBe(true);
  });

  it("keeps Batch Delivery and MVP metrics reconciled", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 22,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 81,
      reconciles: true,
    });
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 22,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 81,
      reconciles: true,
    });
  });

  it("retains the B31 PDC and TDC work items as separately closed records", () => {
    const b31Records = BATCH_DELIVERY_RECORDS.filter(record => record.statusKey === "31");
    expect(b31Records.map(record => record.adoId)).toEqual(["1390014", "1390267"]);
    expect(b31Records.map(record => record.sourceStatusLabel)).toEqual(["Closed", "Closed"]);
  });

  it("derives current development from the five user-confirmed active workstreams only", () => {
    const activeStatusKeys = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.statusKey)
      .sort();

    expect(activeStatusKeys).toEqual(["28", "45", "9a", "defect-tracking", "environment-management"]);
    expect(deriveBatchMetrics(DEFAULT_STATUS).inDev).toBe(5);
    expect(deriveMvpMetrics(DEFAULT_STATUS).complete).toBe(22);
    expect(deriveMvpMetrics(DEFAULT_STATUS).inDev).toBe(5);
  });

  it("keeps the executive calendar aligned to confirmed closure and active classifications", () => {
    const statusFor = (batch: string, feat?: string) =>
      BATCH_CALENDAR_PI23.find(row => row.batch === batch && (!feat || row.feat === feat))?.status;

    expect(statusFor("B10")).toBe("Done");
    expect(statusFor("B28")).toBe("In Progress");
    expect(statusFor("B9a")).toBe("In Progress");
    expect(statusFor("B39")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B20")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B21")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B42")).toBe("Done");
    expect(statusFor("B31", "PDC")).toBe("Done");
    expect(statusFor("B31", "TDC")).toBe("Done");
  });

  it("keeps B20, B21, and B39 as historical planning references in batch detail views", () => {
    expect(HISTORICAL_ADO_EXCLUDED_BATCH_IDS).toEqual(["B20", "B21", "B39"]);
  });

  it("derives PI progress from the reconciled MVP delivery record population", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 10, complete: 10, pct: 100 },
      pi3: { total: 12, complete: 7, pct: 58 },
    });
    expect(PI_MEMBERSHIP.pi3).toEqual(expect.arrayContaining(["defect-tracking", "environment-management", "performance-testing", "dct-qa-workstream"]));
  });

  it("rolls the four confirmed current-day closures into the reporting week and cumulative rollup", () => {
    expect(PI3_HISTORICAL_COMPLETION_BASELINE).toMatchObject({ asOf: "2026-07-28", cumulativeComplete: 11, reportingWeekComplete: 8 });
    expect(DASHBOARD_REPORTING_WEEK_START).toBe("2026-09-21");
    expect(DASHBOARD_REPORTING_WEEK_END).toBe("2026-09-27");
    expect(PI3_POST_BASELINE_CLOSURES).toHaveLength(10);
    expect(PI3_POST_BASELINE_CLOSURES.map(item => item.id)).toEqual([
      "B16", "B17", "B29", "B7", "B42", "B31-TDC", "B10", "B31-PDC", "PERFORMANCE-TESTING", "DCT-QA-WORKSTREAM",
    ]);
    const closedThisWeek = PI3_POST_BASELINE_CLOSURES.filter(item => isInDashboardReportingWeek(item.completionDate));
    expect(closedThisWeek.map(item => item.id)).toEqual([
      "B7", "B42", "B31-TDC", "B10", "B31-PDC", "PERFORMANCE-TESTING", "DCT-QA-WORKSTREAM",
    ]);
    expect(getPi3CumulativeCompleted()).toBe(21);
    expect(GOVERNED_PROGRAM_HEALTH).toMatchObject({ programStatus: "On Track", releaseCandidate: "RC-3" });
    const dataset = buildDeliveryReconciliationDataset(DEFAULT_STATUS);
    expect(dataset.find(record => record.batch === "B10")?.includedInThisWeek).toBe(true);
    expect(dataset.filter(record => record.batch === "B31").map(record => record.includedInThisWeek)).toEqual([true, true]);
  });
});

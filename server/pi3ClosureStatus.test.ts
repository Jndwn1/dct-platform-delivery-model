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
  it("closes every current MVP workstream and records the five current-day closures", () => {
    const activeWorkstreams = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.id)
      .sort();

    expect(activeWorkstreams).toEqual([]);
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "DEFECT-TRACKING")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B45")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B28")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B9A")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "ENV-MANAGEMENT")?.sourceStatusLabel).toBe("Closed");
  });

  it("maps the final delivery closures to platform closed state", () => {
    expect(contextToDctStatus(DEFAULT_STATUS["defect-tracking"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["45"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["28"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["9a"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["environment-management"])).toBe("CLOSED");
  });

  it("keeps PI4 planning visibility separate from the completed MVP delivery portfolio", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 27,
      inDev: 0,
      inReview: 0,
      planned: 0,
      readinessPct: 100,
    });
    expect(PI4_PLANNED_FEATURES).toHaveLength(5);
  });

  it("matches the confirmed final MVP baseline", () => {
    const metrics = deriveMvpMetrics(DEFAULT_STATUS);
    expect(LOCKED_MVP_BASELINE).toMatchObject({
      totalFeatures: 27,
      batchFeatures: 27,
      nonBatchFeatures: 0,
      complete: 27,
      active: 0,
      inReview: 0,
      planned: 0,
      readinessPct: 100,
    });
    expect(matchesLockedMvpBaseline(metrics)).toBe(true);
  });

  it("keeps Batch Delivery and MVP metrics fully reconciled", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 27,
      inDev: 0,
      inReview: 0,
      planned: 0,
      readinessPct: 100,
      reconciles: true,
    });
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 27,
      inDev: 0,
      inReview: 0,
      planned: 0,
      readinessPct: 100,
      reconciles: true,
    });
  });

  it("retains the B31 PDC and TDC work items as separately closed records", () => {
    const b31Records = BATCH_DELIVERY_RECORDS.filter(record => record.statusKey === "31");
    expect(b31Records.map(record => record.adoId)).toEqual(["1390014", "1390267"]);
    expect(b31Records.map(record => record.sourceStatusLabel)).toEqual(["Closed", "Closed"]);
  });

  it("has no remaining active source records after Defect Tracking closes", () => {
    const activeStatusKeys = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.statusKey)
      .sort();

    expect(activeStatusKeys).toEqual([]);
    expect(deriveBatchMetrics(DEFAULT_STATUS).inDev).toBe(0);
    expect(deriveMvpMetrics(DEFAULT_STATUS).complete).toBe(27);
    expect(deriveMvpMetrics(DEFAULT_STATUS).inDev).toBe(0);
  });

  it("keeps the executive calendar aligned to confirmed closure and historical classifications", () => {
    const statusFor = (batch: string, feat?: string) =>
      BATCH_CALENDAR_PI23.find(row => row.batch === batch && (!feat || row.feat === feat))?.status;

    expect(statusFor("B10")).toBe("Done");
    expect(statusFor("B28")).toBe("Done");
    expect(statusFor("B9a")).toBe("Done");
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

  it("derives PI progress from the fully completed MVP delivery record population", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 10, complete: 10, pct: 100 },
      pi3: { total: 12, complete: 12, pct: 100 },
    });
    expect(PI_MEMBERSHIP.pi3).toEqual(expect.arrayContaining(["defect-tracking", "environment-management", "performance-testing", "dct-qa-workstream"]));
  });

  it("rolls the five current-day closures into the reporting week and cumulative rollup", () => {
    expect(PI3_HISTORICAL_COMPLETION_BASELINE).toMatchObject({ asOf: "2026-07-28", cumulativeComplete: 11, reportingWeekComplete: 8 });
    expect(DASHBOARD_REPORTING_WEEK_START).toBe("2026-09-21");
    expect(DASHBOARD_REPORTING_WEEK_END).toBe("2026-09-27");
    expect(PI3_POST_BASELINE_CLOSURES).toHaveLength(15);
    expect(PI3_POST_BASELINE_CLOSURES.map(item => item.id)).toEqual([
      "B16", "B17", "B29", "B7", "B42", "B31-TDC", "B10", "B31-PDC", "PERFORMANCE-TESTING", "DCT-QA-WORKSTREAM", "B28", "B9A", "ENV-MANAGEMENT", "B45", "DEFECT-TRACKING",
    ]);
    const closedThisWeek = PI3_POST_BASELINE_CLOSURES.filter(item => isInDashboardReportingWeek(item.completionDate));
    expect(closedThisWeek.map(item => item.id)).toEqual([
      "B7", "B42", "B31-TDC", "B10", "B31-PDC", "PERFORMANCE-TESTING", "DCT-QA-WORKSTREAM", "B28", "B9A", "ENV-MANAGEMENT", "B45", "DEFECT-TRACKING",
    ]);
    expect(getPi3CumulativeCompleted()).toBe(26);
    expect(GOVERNED_PROGRAM_HEALTH).toMatchObject({ programStatus: "On Track", releaseCandidate: "RC-3" });
    const dataset = buildDeliveryReconciliationDataset(DEFAULT_STATUS);
    expect(dataset.find(record => record.batch === "Defect")?.includedInThisWeek).toBe(true);
    expect(dataset.find(record => record.batch === "B28")?.includedInThisWeek).toBe(true);
    expect(dataset.find(record => record.batch === "B9A")?.includedInThisWeek).toBe(true);
    expect(dataset.find(record => record.batch === "Environment")?.includedInThisWeek).toBe(true);
    expect(dataset.find(record => record.batch === "MVP")?.includedInThisWeek).toBe(true);
  });
});

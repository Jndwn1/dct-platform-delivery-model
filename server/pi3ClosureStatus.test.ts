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

describe("PI3 closure status model", () => {
  it("records B7, B42, and B31 TDC as confirmed closures while retaining the active B31 PDC track", () => {
    expect(DEFAULT_STATUS["8"]).toBe("Complete");
    expect(DEFAULT_STATUS["16"]).toBe("Complete");
    expect(DEFAULT_STATUS["29"]).toBe("Complete");
    expect(DEFAULT_STATUS["7"]).toBe("Complete");
    expect(DEFAULT_STATUS["42"]).toBe("Complete");
    expect(DEFAULT_STATUS["31"]).toBe("In Progress");
    expect(PI_MEMBERSHIP.pi2).toEqual(expect.arrayContaining(["8"]));
    expect(PI_MEMBERSHIP.pi3).toEqual(expect.arrayContaining(["16", "29"]));
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B31-TDC")?.sourceStatusLabel).toBe("Closed");
  });

  it("maps completed status to the platform closed state", () => {
    expect(contextToDctStatus(DEFAULT_STATUS["8"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["29"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["7"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["42"])).toBe("CLOSED");
  });

  it("excludes PI4 planning visibility from the authoritative MVP delivery portfolio", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 23,
      complete: 18,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 78,
    });
  });

  it("matches the confirmed MVP closure baseline", () => {
    const metrics = deriveMvpMetrics(DEFAULT_STATUS);
    expect(LOCKED_MVP_BASELINE).toMatchObject({
      totalFeatures: 23,
      batchFeatures: 23,
      nonBatchFeatures: 0,
      complete: 18,
      active: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 78,
    });
    expect(matchesLockedMvpBaseline(metrics)).toBe(true);
  });

  it("keeps PI4 planning visibility separate from current MVP delivery metrics", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 23,
      complete: 18,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 78,
      reconciles: true,
    });
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 23,
      complete: 18,
      inDev: 5,
      inReview: 0,
      planned: 0,
      readinessPct: 78,
      reconciles: true,
    });
  });

  it("traces B31 PDC as active and B31 TDC as closed using their separate ADO work items", () => {
    const b31Records = BATCH_DELIVERY_RECORDS.filter(record => record.statusKey === "31");
    expect(b31Records.map(record => record.adoId)).toEqual(["1390014", "1390267"]);
    expect(b31Records.find(record => record.id === "B31-PDC")?.sourceStatusLabel).toBe("Active");
    expect(b31Records.find(record => record.id === "B31-TDC")?.sourceStatusLabel).toBe("Closed");
  });

  it("keeps confirmed closures out of the active and planned buckets", () => {
    expect(DEFAULT_STATUS["7"]).toBe("Complete");
    expect(DEFAULT_STATUS["10"]).toBe("In Progress");
    expect(DEFAULT_STATUS["42"]).toBe("Complete");
    expect(DEFAULT_STATUS["45"]).toBe("In Progress");
    expect(DEFAULT_STATUS["9a"]).toBe("In Progress");
    expect(deriveBatchMetrics(DEFAULT_STATUS).planned).toBe(0);
  });

  it("derives current development from the five remaining active batch ADO features only", () => {
    const activeBatchKeys = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.statusKey)
      .sort();

    expect(activeBatchKeys).toEqual(["10", "28", "31", "45", "9a"]);
    expect(PI4_PLANNED_FEATURES).toHaveLength(5);
    expect(deriveBatchMetrics(DEFAULT_STATUS).inDev).toBe(5);
    expect(deriveMvpMetrics(DEFAULT_STATUS).complete).toBe(18);
    expect(deriveMvpMetrics(DEFAULT_STATUS).inDev).toBe(5);
  });

  it("keeps the Executive calendar aligned to the confirmed closures and remaining active classifications", () => {
    const statusFor = (batch: string, feat?: string) =>
      BATCH_CALENDAR_PI23.find(row => row.batch === batch && (!feat || row.feat === feat))?.status;

    expect(statusFor("B7")).toBe("Done");
    expect(statusFor("B10")).toBe("In Progress");
    expect(statusFor("B28")).toBe("In Progress");
    expect(statusFor("B9a")).toBe("In Progress");
    expect(statusFor("B39")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B20")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B21")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B42")).toBe("Done");
    expect(statusFor("B31", "PDC")).toBe("In Progress");
    expect(statusFor("B31", "TDC")).toBe("Done");
  });

  it("marks B20, B21, and B39 as historical planning references in every batch detail view", () => {
    expect(HISTORICAL_ADO_EXCLUDED_BATCH_IDS).toEqual(["B20", "B21", "B39"]);
  });

  it("sets the current completed bucket to the 18 confirmed completed MVP features", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS).complete).toBe(18);
  });

  it("derives PI2 and PI3 completion from the authoritative membership lists", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 10, complete: 9, pct: 90 },
      pi3: { total: 8, complete: 4, pct: 50 },
    });
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B8")?.pi).toBe("PI2");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B16")?.pi).toBe("PI3");
  });

  it("rolls the three confirmed closures into the current PI3 reporting week and cumulative total", () => {
    expect(PI3_HISTORICAL_COMPLETION_BASELINE).toMatchObject({ asOf: "2026-07-28", cumulativeComplete: 11, reportingWeekComplete: 8 });
    expect(DASHBOARD_REPORTING_WEEK_START).toBe("2026-09-21");
    expect(DASHBOARD_REPORTING_WEEK_END).toBe("2026-09-27");
    expect(PI3_POST_BASELINE_CLOSURES).toHaveLength(6);
    expect(PI3_POST_BASELINE_CLOSURES.map(item => item.id)).toEqual(["B16", "B17", "B29", "B7", "B42", "B31-TDC"]);
    const closedThisWeek = PI3_POST_BASELINE_CLOSURES.filter(item => isInDashboardReportingWeek(item.completionDate));
    expect(closedThisWeek.map(item => item.id)).toEqual(["B7", "B42", "B31-TDC"]);
    expect(getPi3CumulativeCompleted()).toBe(17);
    expect(GOVERNED_PROGRAM_HEALTH).toMatchObject({ programStatus: "On Track", releaseCandidate: "RC-3" });
    const dataset = buildDeliveryReconciliationDataset(DEFAULT_STATUS);
    expect(dataset.find(record => record.batch === "B7")?.includedInThisWeek).toBe(true);
    expect(dataset.find(record => record.batch === "B42")?.includedInThisWeek).toBe(true);
    expect(dataset.filter(record => record.batch === "B31").map(record => record.includedInThisWeek)).toEqual([false, true]);
  });
});

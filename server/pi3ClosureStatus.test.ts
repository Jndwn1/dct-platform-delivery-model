import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATUS,
  BATCH_DELIVERY_RECORDS,
  buildDeliveryReconciliationDataset,
  GOVERNED_PROGRAM_HEALTH,
  LOCKED_MVP_BASELINE,
  matchesLockedMvpBaseline,
  NON_BATCH_MVP_RECORDS,
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
  it("records Batch 8 and Batch 29 as closed PI3 batches", () => {
    expect(DEFAULT_STATUS["8"]).toBe("Complete");
    expect(DEFAULT_STATUS["29"]).toBe("Complete");
    expect(PI_MEMBERSHIP.pi3).toEqual(expect.arrayContaining(["8", "29"]));
  });

  it("maps both closures to the platform closed status", () => {
    expect(contextToDctStatus(DEFAULT_STATUS["8"])).toBe("CLOSED");
    expect(contextToDctStatus(DEFAULT_STATUS["29"])).toBe("CLOSED");
  });

  it("reports the authoritative 28-feature MVP portfolio and 54 percent feature readiness", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 28,
      complete: 15,
      inDev: 11,
      inReview: 2,
      planned: 0,
      readinessPct: 54,
    });
  });

  it("matches the user-confirmed locked MVP baseline", () => {
    const metrics = deriveMvpMetrics(DEFAULT_STATUS);
    expect(LOCKED_MVP_BASELINE).toMatchObject({
      totalFeatures: 28,
      batchFeatures: 23,
      nonBatchFeatures: 5,
      complete: 15,
      active: 11,
      inReview: 2,
      planned: 0,
      readinessPct: 54,
    });
    expect(matchesLockedMvpBaseline(metrics)).toBe(true);
  });

  it("keeps Batch Delivery separate from the five non-batch MVP features", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 23,
      complete: 15,
      inDev: 6,
      inReview: 2,
      planned: 0,
      readinessPct: 65,
      reconciles: true,
    });
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 28,
      complete: 15,
      inDev: 11,
      inReview: 2,
      planned: 0,
      readinessPct: 54,
      reconciles: true,
    });
  });

  it("traces the two Review Ready records to the B31 ADO work items", () => {
    const reviewReady = BATCH_DELIVERY_RECORDS.filter(record => record.statusKey === "31");
    expect(reviewReady.map(record => record.adoId)).toEqual(["1390014", "1390267"]);
    expect(reviewReady).toHaveLength(2);
  });

  it("keeps the supplied ADO Active records out of the Planned bucket", () => {
    expect(DEFAULT_STATUS["7"]).toBe("In Progress");
    expect(DEFAULT_STATUS["10"]).toBe("In Progress");
    expect(DEFAULT_STATUS["42"]).toBe("In Progress");
    expect(DEFAULT_STATUS["45"]).toBe("In Progress");
    expect(DEFAULT_STATUS["9a"]).toBe("In Progress");
    expect(deriveBatchMetrics(DEFAULT_STATUS).planned).toBe(0);
  });

  it("derives current development directly from all qualifying ADO Active MVP features", () => {
    const activeBatchKeys = BATCH_DELIVERY_RECORDS
      .filter(record => record.sourceStatusLabel === "Active")
      .map(record => record.statusKey)
      .sort();

    expect(activeBatchKeys).toEqual(["10", "28", "42", "45", "7", "9a"]);
    expect(NON_BATCH_MVP_RECORDS).toHaveLength(5);
    expect(deriveBatchMetrics(DEFAULT_STATUS).inDev).toBe(6);
    expect(deriveMvpMetrics(DEFAULT_STATUS).inDev).toBe(11);
  });

  it("keeps the Executive calendar aligned to the supplied ADO Active and Review Ready classifications", () => {
    const statusFor = (batch: string, feat?: string) =>
      BATCH_CALENDAR_PI23.find(row => row.batch === batch && (!feat || row.feat === feat))?.status;

    expect(statusFor("B7")).toBe("In Progress");
    expect(statusFor("B10")).toBe("In Progress");
    expect(statusFor("B28")).toBe("In Progress");
    expect(statusFor("B9a")).toBe("In Progress");
    expect(statusFor("B39")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B20")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B21")).toBe("Out of Current ADO Pipeline");
    expect(statusFor("B31", "PDC")).toBe("Review Ready");
    expect(statusFor("B31", "TDC")).toBe("Review Ready");
  });

  it("marks B20, B21, and B39 as historical planning references in every batch detail view", () => {
    expect(HISTORICAL_ADO_EXCLUDED_BATCH_IDS).toEqual(["B20", "B21", "B39"]);
  });

  it("limits the current completed bucket to the 15 ADO-backed completed batch features", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS).complete).toBe(15);
  });

  it("derives PI2 and PI3 completion from the authoritative membership lists", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 10, complete: 7, pct: 70 },
      pi3: { total: 8, complete: 3, pct: 38 },
    });
  });

  it("preserves the July 28 PI3 historical baseline and post-baseline closure history", () => {
    expect(PI3_HISTORICAL_COMPLETION_BASELINE).toMatchObject({ asOf: "2026-07-28", cumulativeComplete: 11, reportingWeekComplete: 8 });
    expect(PI3_POST_BASELINE_CLOSURES).toMatchObject([
      { id: "B16", platform: "PDC", name: "Audit Trail & Lineage Governance", completionDate: "2026-08-04" },
      { id: "B17", platform: "TDC", name: "Decision Support, Overrides, Evidence & Workpapers", completionDate: "2026-08-04" },
      { id: "B29", platform: "TDC", name: "Prior-Year Migration", completionDate: "2026-08-11" },
    ]);
    expect(GOVERNED_PROGRAM_HEALTH).toMatchObject({ programStatus: "On Track", releaseCandidate: "RC-3" });
    const dataset = buildDeliveryReconciliationDataset(DEFAULT_STATUS);
    expect(dataset.every(record => !(record.includedInThisWeek && record.originalCompletionDate === "2026-08-11"))).toBe(true);
  });
});

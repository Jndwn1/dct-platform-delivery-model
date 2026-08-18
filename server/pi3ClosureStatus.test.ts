import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATUS,
  BATCH_DELIVERY_RECORDS,
  NON_BATCH_MVP_RECORDS,
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

  it("reports the supplied ADO pipeline population and 59 percent MVP readiness", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 32,
      complete: 19,
      inDev: 11,
      inReview: 2,
      planned: 0,
      readinessPct: 59,
    });
  });

  it("keeps Batch Delivery separate from the five non-batch MVP features", () => {
    expect(deriveBatchMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 27,
      complete: 19,
      inDev: 6,
      inReview: 2,
      planned: 0,
      readinessPct: 70,
      reconciles: true,
    });
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 32,
      complete: 19,
      inDev: 11,
      inReview: 2,
      planned: 0,
      readinessPct: 59,
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

  it("preserves the exact ADO Active population of six batch features plus five non-batch MVP features", () => {
    const activeBatchKeys = BATCH_DELIVERY_RECORDS
      .filter(record => DEFAULT_STATUS[record.statusKey] === "In Progress")
      .map(record => record.statusKey)
      .sort();

    expect(activeBatchKeys).toEqual(["10", "28", "42", "45", "7", "9a"]);
    expect(NON_BATCH_MVP_RECORDS).toHaveLength(5);
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

  it("keeps the 19 current completed records in the shared status map after B10 is reclassified Active", () => {
    const completed = Object.values(DEFAULT_STATUS).filter(
      status => status === "Complete" || status === "Delivered" || status === "Done",
    );
    expect(completed).toHaveLength(19);
  });

  it("derives PI2 and PI3 completion from the authoritative membership lists", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 14, complete: 11, pct: 79 },
      pi3: { total: 8, complete: 3, pct: 38 },
    });
  });
});

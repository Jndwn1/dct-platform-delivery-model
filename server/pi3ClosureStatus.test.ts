import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATUS,
  PI_MEMBERSHIP,
  contextToDctStatus,
  deriveMvpMetrics,
  derivePICompletion,
} from "../client/src/contexts/BatchStatusContext";

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

  it("reports 20 completed delivery items and 57 percent MVP readiness", () => {
    expect(deriveMvpMetrics(DEFAULT_STATUS)).toMatchObject({
      total: 35,
      complete: 20,
      readinessPct: 57,
    });
  });

  it("keeps all 20 ADO-verified historical closures complete in the shared status map", () => {
    const completed = Object.values(DEFAULT_STATUS).filter(
      status => status === "Complete" || status === "Delivered" || status === "Done",
    );
    expect(completed).toHaveLength(20);
  });

  it("derives PI2 and PI3 completion from the authoritative membership lists", () => {
    expect(derivePICompletion(DEFAULT_STATUS)).toMatchObject({
      pi2: { total: 13, complete: 12, pct: 92 },
      pi3: { total: 13, complete: 3, pct: 23 },
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATUS,
  PI_MEMBERSHIP,
  contextToDctStatus,
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
});


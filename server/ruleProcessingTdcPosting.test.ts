import { describe, expect, it } from "vitest";
import { RULE_POSTING_DEMO_OBSERVATIONS, RULE_POSTING_FOLLOW_UP } from "../client/src/lib/ruleProcessingTdcPosting";

describe("Rule Processing to TDC Posting meeting finding", () => {
  it("retains only the directly demonstrated meeting observations", () => {
    expect(RULE_POSTING_DEMO_OBSERVATIONS).toHaveLength(7);
    expect(RULE_POSTING_DEMO_OBSERVATIONS.join(" ")).toContain("2 rules × 4 entities = 8 rule-results");
    expect(RULE_POSTING_DEMO_OBSERVATIONS.join(" ")).toContain("DRAFT adjustments in TDC");
  });

  it("uses neutral DCT and PDC impact wording without creating a requirement", () => {
    expect(RULE_POSTING_FOLLOW_UP.dctImpact).toBe("Pending Confirmation");
    expect(RULE_POSTING_FOLLOW_UP.pdcImpact).toBe("None identified from this meeting / TBD pending source-data clarification");
    expect(RULE_POSTING_FOLLOW_UP.clarification).toContain("No TDC persistence structure, API payload, or new development requirement was approved");
  });
});

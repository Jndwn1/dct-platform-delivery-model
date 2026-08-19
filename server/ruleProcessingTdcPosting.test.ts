import { describe, expect, it } from "vitest";
import { RULE_POSTING_DISCOVERY_STATUS, RULE_POSTING_FLOW, RULE_POSTING_OPEN_QUESTIONS, RULE_POSTING_VALIDATION, RULE_RESULT_STATES } from "../client/src/lib/ruleProcessingTdcPosting";

describe("Rule Processing to TDC Posting discovery model", () => {
  it("preserves the confirmed six-stage rule posting flow", () => {
    expect(RULE_POSTING_FLOW).toEqual(["Rule + Entity", "Required Inputs", "Calculate", "Result Classification", "Post Eligible Result", "TDC DRAFT Adjustment"]);
  });

  it("keeps No Adjustment and Skipped outcomes distinct", () => {
    expect(RULE_RESULT_STATES.map(state => state.title)).toEqual(expect.arrayContaining(["Adjustment Generated", "No Adjustment", "Skipped — Missing Required Input", "Posted to TDC"]));
  });

  it("tracks all supplied discovery questions and validation boundaries", () => {
    expect(RULE_POSTING_OPEN_QUESTIONS).toHaveLength(14);
    expect(RULE_POSTING_VALIDATION.join(" ")).toContain("Duplicate posting");
    expect(RULE_POSTING_VALIDATION.join(" ")).toContain("traceable to the originating rule/entity combination");
  });

  it("separates confirmed behavior from persistence clarification", () => {
    expect(RULE_POSTING_DISCOVERY_STATUS.confirmed).toHaveLength(4);
    expect(RULE_POSTING_DISCOVERY_STATUS.requiresClarification.join(" ")).toContain("Exact TDC persistence");
  });
});

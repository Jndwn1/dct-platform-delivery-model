export const RULE_POSTING_DEMO_OBSERVATIONS = [
  "Roger demonstrated rule processing.",
  "Roger demonstrated rule evaluation across multiple entities.",
  "Example shown: 2 rules × 4 entities = 8 rule-results.",
  "The Roger Post Rule Results confirmation states that posted rules create DRAFT adjustments in TDC.",
  "The UI displayed outcomes including Adjustment, No Adjustment, and Skipped / Missing Required Input.",
  "The team planned to move the base functionality to DEV for additional testing.",
  "Krista was expected to perform additional business validation after initial team testing.",
] as const;

export const RULE_POSTING_FOLLOW_UP = {
  dctImpact: "Pending Confirmation",
  dctReason: "No explicit new DCT action item was assigned during the recorded meeting. DCT is following up to determine whether any TDC/PDC clarification, integration validation, or additional work is required.",
  pdcImpact: "None identified from this meeting / TBD pending source-data clarification",
  clarification: "Additional clarification is needed regarding exactly what data TDC currently saves for the scenario discussed. No TDC persistence structure, API payload, or new development requirement was approved in the meeting.",
} as const;

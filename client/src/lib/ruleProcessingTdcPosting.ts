export const RULE_POSTING_FLOW = [
  "Rule + Entity",
  "Required Inputs",
  "Calculate",
  "Result Classification",
  "Post Eligible Result",
  "TDC DRAFT Adjustment",
] as const;

export const RULE_RESULT_STATES = [
  { title: "Adjustment Generated", description: "Rule successfully evaluates and calculation produces an adjustment amount. The result is potentially eligible for posting to TDC.", tone: "confirmed" },
  { title: "No Adjustment", description: "Rule successfully evaluates and calculation does not produce an adjustment. Whether this creates a TDC record requires confirmation.", tone: "clarify" },
  { title: "Skipped — Missing Required Input", description: "The rule/entity combination cannot be evaluated because required input data is unavailable. This is distinct from No Adjustment; the source of the missing input must be established.", tone: "clarify" },
  { title: "Posted to TDC", description: "An eligible result is submitted to TDC. Roger currently indicates that posting creates a DRAFT adjustment in TDC.", tone: "confirmed" },
] as const;

export const RULE_POSTING_OPEN_QUESTIONS = [
  "When Roger posts multiple rule-results across multiple entities, does TDC receive separate adjustment requests, a collection/batch request, or another payload structure?",
  "Does each rule/entity combination that produces an adjustment create its own DRAFT adjustment in TDC?",
  "When a result displays No Adjustment, is anything persisted in TDC?",
  "Are Skipped — Missing Required Input rule/entity combinations sent to TDC at all?",
  "What specifically was meant during the meeting when it was stated that TDC now doesn't save such data?",
  "Which exact fields or data structures are not currently persisted by TDC?",
  "Is each resulting DRAFT adjustment associated with exactly one EntityId?",
  "What information is persisted with a rule-generated DRAFT adjustment: Entity ID, Rule ID, Rule version, adjustment amount, tax code, source/input values, adjustment status, created by, created timestamp, and calculation/posting reference or correlation ID?",
  "If a practitioner recalculates the same rule/entity combination and posts again, does TDC update, replace, create a new DRAFT, or reject the duplicate?",
  "What prevents duplicate DRAFT adjustments from repeated posting?",
  "If multiple adjustments are submitted and one fails, does TDC support partial success or does the entire posting operation fail?",
  "What does TDC return to Roger after a successful post?",
  "Which required rule inputs are practitioner-entered in Roger versus automatically sourced from TDC, PDC, or another system?",
  "For skipped rule/entity pairs, how can DCT identify the specific missing input and its expected source?",
] as const;

export const RULE_POSTING_VALIDATION = [
  "Multiple entities can be evaluated during rule processing; each applicable rule is evaluated independently for each entity.",
  "Adjustment Generated, No Adjustment, and Skipped outcomes are distinguishable, and missing inputs have an identifiable reason or source.",
  "Skipped combinations do not inadvertently create adjustments; eligible posted results create the expected TDC DRAFT adjustment.",
  "Entity association, rule identification, applicable tax code or mapping information, and adjustment amount are preserved.",
  "Duplicate posting, posting failures, and partial-success behavior are defined and controlled.",
  "TDC confirmation is available to Roger and the resulting adjustment is traceable to the originating rule/entity combination.",
] as const;

export const RULE_POSTING_DECISION = {
  title: "Multi-Entity Rule Evaluation vs. TDC Persistence",
  status: "Requires final TDC persistence clarification",
  summary: "Multi-entity rule evaluation is supported by Roger for MVP. This is separate from how each resulting adjustment is persisted in TDC; do not assume multi-entity processing means a single TDC adjustment contains multiple entities.",
  impact: "Confirm the entity-level adjustment structure, API behavior, and persisted fields before closing this discovery item.",
} as const;

export const RULE_POSTING_DISCOVERY_STATUS = {
  confirmed: [
    "Roger supports rule evaluation across multiple entities.",
    "Rule/entity combinations can produce different result states.",
    "Roger provides a posting action for rule results.",
    "Roger indicates posted results create DRAFT adjustments in TDC.",
  ],
  requiresClarification: [
    "Exact TDC persistence and data model.",
    "Behavior of No Adjustment and Skipped results.",
    "Multi-result API or payload structure and persisted adjustment fields.",
    "Duplicate or reposting and partial-failure behavior.",
    "Source of missing rule inputs and PDC dependency, if any.",
  ],
} as const;

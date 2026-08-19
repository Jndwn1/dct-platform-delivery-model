export const MULTI_ENTITY_TDC_PERSISTENCE_DECISION = {
  id: "ADR-07",
  title: "Multi-Entity Rule Evaluation vs. TDC Persistence",
  status: "Open" as const,
  statusDetail: "Requires Final TDC Persistence Clarification",
  impact: "High",
  blocking: "Rules & Adjustments; Consumer Integration readiness",
  description: "Multi-entity rule evaluation is supported by Roger for MVP. This capability is separate from how resulting individual adjustments are persisted in TDC. Do not assume that evaluating multiple entities means a single TDC adjustment record contains multiple entities; the entity-level persistence model requires final confirmation.",
  clarifications: [
    "When a rule evaluates multiple entities, does TDC create one adjustment per entity?",
    "Which entity identifier(s) are persisted on each adjustment?",
    "How does the TDC adjustment API behave when Roger submits multi-entity evaluation results?",
    "Is there a parent, group, rule execution, or run identifier linking adjustments from the same evaluation?",
    "Which adjustment fields are persisted in TDC and returned to Roger?",
  ],
  dctImpact: "The entity-level adjustment structure, API behavior, identifiers, and persisted fields must be confirmed before this discovery item can be considered complete or closed.",
  related: "Roger · TDC · Rules & Adjustments · Batch 45 — TDC Rule Logic Expression Framework & Adjustment Subtype Domain Expansion · Consumer Integration · MVP",
} as const;

export const MULTI_ENTITY_TDC_PERSISTENCE_NEXT_ACTION = {
  action: "Confirm entity-level TDC persistence, adjustment API behavior, identifiers, and persisted fields for multi-entity rule evaluation",
  owner: "TDC / Roger / Architecture (TBD)",
  status: "Open",
  impact: "High",
  adoRef: "Batch 45",
} as const;

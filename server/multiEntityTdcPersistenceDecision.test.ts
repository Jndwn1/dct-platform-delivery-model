import { describe, expect, it } from "vitest";
import { MULTI_ENTITY_TDC_PERSISTENCE_DECISION, MULTI_ENTITY_TDC_PERSISTENCE_NEXT_ACTION } from "../client/src/lib/multiEntityTdcPersistenceDecision";

describe("Consumer Integration multi-entity TDC persistence decision", () => {
  it("stays open and separates Roger evaluation from unresolved TDC persistence", () => {
    expect(MULTI_ENTITY_TDC_PERSISTENCE_DECISION.status).toBe("Open");
    expect(MULTI_ENTITY_TDC_PERSISTENCE_DECISION.statusDetail).toContain("Requires Final TDC Persistence Clarification");
    expect(MULTI_ENTITY_TDC_PERSISTENCE_DECISION.description).toContain("Do not assume");
  });

  it("preserves the five supplied clarification questions and related Batch 45 association", () => {
    expect(MULTI_ENTITY_TDC_PERSISTENCE_DECISION.clarifications).toHaveLength(5);
    expect(MULTI_ENTITY_TDC_PERSISTENCE_DECISION.related).toContain("Batch 45");
    expect(MULTI_ENTITY_TDC_PERSISTENCE_NEXT_ACTION.status).toBe("Open");
  });
});

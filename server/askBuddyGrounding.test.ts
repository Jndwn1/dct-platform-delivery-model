import { describe, expect, it } from "vitest";
import { appendBuddyProvenance, buildBuddyGrounding, buildInsufficientEvidenceResponse } from "./askBuddyGrounding";

const liveSnapshot = {
  asOf: "2026-08-19T12:00:00.000Z",
  statuses: { b45: "Complete" },
  gates: { g1: "Complete", g2: "Complete", g3: "In Progress", g4: "Not Started" },
  piCompletion: {
    pi1: { total: 1, complete: 1, pct: 100 }, pi2: { total: 1, complete: 1, pct: 100 },
    pi3: { total: 8, complete: 3, pct: 38 }, pi4: { total: 0, complete: 0, pct: 0 }, overall: { total: 10, complete: 5, pct: 50 },
  },
  completedBatches: [], activeBatches: ["b45"], blockedBatches: [], plannedBatches: [],
};

describe("Ask Buddy grounded platform knowledge", () => {
  it("uses current delivery evidence and flags a deterministic batch-status conflict", () => {
    const grounding = buildBuddyGrounding("What is the current status of Batch 45?", "/discovery/dct-overview", liveSnapshot);
    expect(grounding.sources.some((source) => source.id === "live-control-panel")).toBe(true);
    expect(grounding.status).toBe("Conflict");
    expect(grounding.conflicts[0]?.currentSource).toContain("Control Panel");
  });

  it("distinguishes registered API documentation from an unavailable Swagger artifact", () => {
    const grounding = buildBuddyGrounding("What does Swagger say about the Adjustments API?", "/discovery/roger-overview", liveSnapshot);
    expect(grounding.sources.some((source) => source.id === "api-catalog")).toBe(true);
    expect(grounding.sources.some((source) => source.id === "swagger-availability" && source.artifactStatus === "Unavailable")).toBe(true);
  });

  it("uses the required no-assumption response when evidence is insufficient", () => {
    const grounding = buildBuddyGrounding("Tell me a joke about penguins");
    expect(grounding.hasSufficientEvidence).toBe(false);
    expect(buildInsufficientEvidenceResponse(grounding)).toContain("I could not find enough confirmed information in the DCT Platform");
  });

  it("appends clickable-source metadata text and freshness to substantive answers", () => {
    const grounding = buildBuddyGrounding("What are the open decisions for multi-entity rule persistence?", "/consumer-integration-hub", liveSnapshot);
    const answer = appendBuddyProvenance("The evidence identifies an open clarification.", grounding);
    expect(answer).toContain("### Sources Used");
    expect(answer).toContain("Knowledge checked:");
  });

  it("uses the same authoritative source set regardless of the entry page", () => {
    const fromOverview = buildBuddyGrounding("What is the current status of Batch 45?", "/discovery/dct-overview", liveSnapshot);
    const fromRoger = buildBuddyGrounding("What is the current status of Batch 45?", "/discovery/roger-overview", liveSnapshot);
    expect(fromOverview.sources.map(source => source.id)).toEqual(fromRoger.sources.map(source => source.id));
  });
});

import { describe, expect, it } from "vitest";
import { buildFocusedCrossTeamGrounding } from "./askBuddyGrounding";
import { buildCrossTeamDependencyPrompt } from "./platformContext";

describe("Ask Buddy cross-team dependency framework", () => {
  it("requires the supplied eight evidence-bound delivery analysis sections", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What are the TDC dependencies and what does TDC need to own?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("Context-Aware Dependency and Ownership Analysis");
    expect(prompt).toContain("### 1. Executive Summary");
    expect(prompt).toContain("### 2. What [Team] Needs to Own");
    expect(prompt).toContain("Responsibility | Expected Deliverable | Existing ADO Reference | Status");
    expect(prompt).toContain("### 3. Cross-Team Dependencies");
    expect(prompt).toContain("ID | Dependency | Required Input / Decision | Responsible Team | Affected ADO Story | Impact if Unresolved | Status");
    expect(prompt).toContain("### 8. Bottom Line");
  });

  it("preserves no-assumption, open-confirmation, and proposed-sequence rules", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What must State, TDC, IMS, and Roger align before delivery?",
    });

    expect(prompt).toContain("Open – Requires Confirmation");
    expect(prompt).toContain("never invent ADO IDs, owners, dates, completion statuses, contracts, mappings, acceptance criteria, or predecessor/successor relationships.");
    expect(prompt).toContain("Label it Proposed unless the relationship is explicitly approved");
    expect(prompt).toContain("GoSystem performs calculation behavior only where the evidence says it does.");
  });

  it("uses State Apportionment working-session evidence without importing unrelated platform batches", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What are the TDC dependencies and what does TDC need to own for State Apportionment?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("1514276");
    expect(prompt).toContain("1514277");
    expect(prompt).toContain("1433863");
    expect(prompt).toContain("1501980");
    expect(prompt).toContain("requiring scope verification");
    expect(prompt).toContain("Mandatory quality check before responding");
    expect(prompt).toContain("Do not introduce Batch 28, Batch 3, AI Tax Mapping");
    expect(prompt).not.toContain("Full Batch Registry");
  });

  it("limits State Apportionment provenance to the directly related readiness source", () => {
    const grounding = buildFocusedCrossTeamGrounding(
      "What are the TDC dependencies and what does TDC need to own for State Apportionment?",
      "/post-pilot/state-taxonomy-readiness"
    );

    expect(grounding.sources.map((source) => source.label)).toEqual(["State Taxonomy Readiness"]);
    expect(grounding.evidenceBlock).toContain("Exclude unrelated sprint batches");
    expect(grounding.evidenceBlock).not.toContain("Batch Registry");
  });
});

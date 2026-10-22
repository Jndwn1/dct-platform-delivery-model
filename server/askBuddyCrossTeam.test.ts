import { describe, expect, it } from "vitest";
import { buildFocusedCrossTeamGrounding } from "./askBuddyGrounding";
import { buildCrossTeamDependencyPrompt } from "./platformContext";

describe("Ask Buddy cross-team dependency framework", () => {
  it("uses a direct, trackable ADO dependency recommendation format", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What are the TDC dependencies and what does TDC need to own?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("Context-Aware Dependency and Ownership Analysis");
    expect(prompt).toContain("Answer the question directly");
    expect(prompt).toContain("Dependency | Affected ADO work item | Team needing information | Proposed providing team | Required deliverable or decision | Development or test impact | Classification | Sequencing recommendation");
    expect(prompt).toContain("Classification must be exactly Confirmed blocker");
    expect(prompt).toContain("Proposed — validate");
    expect(prompt).not.toContain("### 1. Executive Assessment");
  });

  it("preserves no-assumption, open-confirmation, and proposed-sequence rules", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What must State, TDC, IMS, and Roger align before delivery?",
    });

    expect(prompt).toContain("never invent ADO IDs, owners, dates, completion statuses, contracts, mappings, acceptance criteria, or relationships.");
    expect(prompt).toContain("Use established boundaries only as a baseline, not proof of source-specific ownership");
    expect(prompt).toContain("State / Process owns State-specific business requirements");
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

  it("gives State questions the same direct dependency contract instead of a deterministic report", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "For Spikes 1514276 and 1514277, what dependencies need to be documented in ADO?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("1514276");
    expect(prompt).toContain("1514277");
    expect(prompt).toContain("Affected ADO work item");
    expect(prompt).toContain("discovery / validation inputs, not approved interface contracts");
  });
});

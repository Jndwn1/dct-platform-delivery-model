import { describe, expect, it } from "vitest";
import { buildFocusedCrossTeamGrounding } from "./askBuddyGrounding";
import { buildCrossTeamDependencyPrompt, buildStateApportionmentDependencyResponse } from "./platformContext";

describe("Ask Buddy cross-team dependency framework", () => {
  it("requires the supplied six-part evidence-bound BA assessment sections", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What are the TDC dependencies and what does TDC need to own?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("Context-Aware Dependency and Ownership Analysis");
    expect(prompt).toContain("### 1. Executive Assessment");
    expect(prompt).toContain("### 2. Requirements Analysis");
    expect(prompt).toContain("Requirement or potential requirement | Business / technical explanation | Supporting document evidence | Classification | Recommended validation or action");
    expect(prompt).toContain("### 3. Cross-Team Dependency Analysis");
    expect(prompt).toContain("Dependency | Requesting or affected team | Providing or decision-making team | Required input, decision, or deliverable | Delivery impact | Status");
    expect(prompt).toContain("### 4. Gaps and Open Questions");
    expect(prompt).toContain("### 5. Existing ADO Coverage");
    expect(prompt).toContain("### 6. Recommended Next Actions");
  });

  it("preserves no-assumption, open-confirmation, and proposed-sequence rules", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What must State, TDC, IMS, and Roger align before delivery?",
    });

    expect(prompt).toContain("Open – Requires Confirmation");
    expect(prompt).toContain("never invent ADO IDs, owners, dates, completion statuses, contracts, mappings, acceptance criteria, or predecessor/successor relationships.");
    expect(prompt).toContain("Do not automatically assign TDC responsibility for State business mapping, State calculations, or IMS transformation.");
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

  it("keeps the fast State dependency response on the required spike-readiness structure", () => {
    const response = buildStateApportionmentDependencyResponse();

    expect(response).toContain("### 1. Executive Assessment");
    expect(response).toContain("### 2. TDC Requirements");
    expect(response).toContain("### 3. Cross-Team Dependencies");
    expect(response).toContain("### 4. Spike 1514276 Readiness Assessment");
    expect(response).toContain("### 5. Spike 1514277 Readiness Assessment");
    expect(response).toContain("### 6. Prioritized Decisions and Actions");
    expect(response).toContain("1514276");
    expect(response).toContain("Not stated in source");
  });
});

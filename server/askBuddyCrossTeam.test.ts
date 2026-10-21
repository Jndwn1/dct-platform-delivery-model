import { describe, expect, it } from "vitest";
import { buildCrossTeamDependencyPrompt } from "./platformContext";

describe("Ask Buddy cross-team dependency framework", () => {
  it("requires the supplied eight evidence-bound delivery analysis sections", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What are the TDC dependencies and what does TDC need to own?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    expect(prompt).toContain("Cross-Team Dependencies, Ownership, and Delivery Impact Analysis");
    expect(prompt).toContain("### 1. Executive Summary");
    expect(prompt).toContain("### 2. What [Team] Needs to Own");
    expect(prompt).toContain("Team Responsibility | Expected Deliverable | Existing ADO Story / Reference | Status");
    expect(prompt).toContain("### 3. Cross-Team Dependencies");
    expect(prompt).toContain("Dependency ID | Dependency | Required Input or Decision | Responsible Team | Affected Story | Impact if Unresolved | Status");
    expect(prompt).toContain("### 8. Bottom Line");
  });

  it("preserves no-assumption, open-confirmation, and proposed-sequence rules", () => {
    const prompt = buildCrossTeamDependencyPrompt({
      question: "What must State, TDC, IMS, and Roger align before delivery?",
    });

    expect(prompt).toContain("Open – Requires Confirmation");
    expect(prompt).toContain("Do not invent ADO IDs, owners, dates, completion statuses, contracts, mappings, acceptance criteria, or predecessor/successor relationships.");
    expect(prompt).toContain("Clearly label it Proposed unless an approval is in the evidence");
    expect(prompt).toContain("AI Orchestrator Layer executes calculations according to approved architecture.");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildAskBuddyPrimaryInstruction,
  buildAttachmentAnalysisPrompt,
  buildAttachmentDirectQuestionPrompt,
  buildCompactAskBuddyPrompt,
  buildCrossTeamDependencyPrompt,
  buildDocumentAndDependencyAnalysisInstruction,
  buildGeneralAskBuddyPrompt,
} from "./platformContext";

describe("Ask Buddy primary Business Analysis intelligence policy", () => {
  it("defines one evidence-bound behavior policy before specialized task templates", () => {
    const policy = buildAskBuddyPrimaryInstruction();

    expect(policy).toContain("Primary Business Analysis Intelligence Policy");
    expect(policy).toContain("experienced Senior Business Analyst");
    expect(policy).toContain("Evidence hierarchy");
    expect(policy).toContain("a user-provided document, spreadsheet, meeting transcript, or attachment");
    expect(policy).toContain("Do not require the user to select a specialist prompt");
    expect(policy).toContain("Confirmed only when evidence establishes it");
    expect(policy).toContain("Apply AI reasoning to every request");
    expect(policy).toContain("Answer the specific question first");
    expect(policy).toContain("Resolve references such as ‘those’, ‘the three responsibilities’");
  });

  it("applies the primary policy to governed, general, and specialized dependency responses", () => {
    const compact = buildCompactAskBuddyPrompt({
      question: "What are the requirements for those three TDC responsibilities?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });
    const general = buildGeneralAskBuddyPrompt("/ask-buddy");
    const dependencies = buildCrossTeamDependencyPrompt({
      question: "What must TDC own before State apportionment delivery?",
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
    });

    for (const prompt of [compact, general, dependencies]) {
      expect(prompt).toContain("Primary Business Analysis Intelligence Policy");
      expect(prompt).toContain("Specialized task structures are reusable templates");
      expect(prompt).toContain("Resolve references such as ‘those’, ‘the three responsibilities’");
    }

    expect(compact).toContain("Current Control Panel/governed records establish current delivery state");
    expect(dependencies).toContain("Answer the question directly");
  });

  it("uses the six-part BA assessment contract only for a requested full document assessment", () => {
    const activeInstruction = buildDocumentAndDependencyAnalysisInstruction();
    const attachment = buildAttachmentAnalysisPrompt("Analyze this source for requirements and dependencies.");
    const targeted = buildAttachmentDirectQuestionPrompt("Which team must provide the field mapping?");
    const dependencies = buildCrossTeamDependencyPrompt({
      question: "What dependencies must TDC resolve before delivery?",
    });

    for (const prompt of [activeInstruction, attachment]) {
      expect(prompt).toContain("### 1. Executive Assessment");
      expect(prompt).toContain("### 2. Requirements Analysis");
      expect(prompt).toContain("### 3. Cross-Team Dependency Analysis");
      expect(prompt).toContain("### 4. Gaps and Open Questions");
      expect(prompt).toContain("### 5. Existing ADO Coverage");
      expect(prompt).toContain("### 6. Recommended Next Actions");
      expect(prompt).toContain("Not stated in source");
    }

    expect(attachment).toContain("document evidence primary");
    expect(attachment).toContain("\n### 1. Executive Assessment");
    expect(attachment).not.toContain("\\n### 1. Executive Assessment");
    expect(targeted).toContain("Targeted Document Analysis");
    expect(targeted).toContain("do not generate the six-part assessment");
    expect(targeted).toContain("Affected ADO work item | Team needing information | Proposed providing team");
    expect(dependencies).toContain("Answer the question directly");
    expect(dependencies).not.toContain("all six sections are present");
    expect(activeInstruction).toContain("return exactly these six complete headings");
    expect(activeInstruction).toContain("Do not stop after section 1");
    expect(activeInstruction).toContain("specific effect on retrieval, persistence, validation, or reconciliation");
  });
});

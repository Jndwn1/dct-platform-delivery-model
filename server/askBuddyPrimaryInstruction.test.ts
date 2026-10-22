import { describe, expect, it } from "vitest";
import {
  buildAskBuddyPrimaryInstruction,
  buildAttachmentAnalysisPrompt,
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
    expect(dependencies).toContain("Active document and dependency analysis instruction");
  });

  it("uses the supplied six-part BA assessment contract for attachment and dependency analysis", () => {
    const activeInstruction = buildDocumentAndDependencyAnalysisInstruction();
    const attachment = buildAttachmentAnalysisPrompt("Analyze this source for requirements and dependencies.");
    const dependencies = buildCrossTeamDependencyPrompt({
      question: "What dependencies must TDC resolve before delivery?",
    });

    for (const prompt of [activeInstruction, attachment, dependencies]) {
      expect(prompt).toContain("### 1. Executive Assessment");
      expect(prompt).toContain("### 2. Requirements Analysis");
      expect(prompt).toContain("### 3. Cross-Team Dependency Analysis");
      expect(prompt).toContain("### 4. Gaps and Open Questions");
      expect(prompt).toContain("### 5. Existing ADO Coverage");
      expect(prompt).toContain("### 6. Recommended Next Actions");
      expect(prompt).toContain("Not stated in source");
    }

    expect(attachment).toContain("document evidence primary");
    expect(dependencies).toContain("all six sections are present");
  });
});

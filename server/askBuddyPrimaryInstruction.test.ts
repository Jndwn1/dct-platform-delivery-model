import { describe, expect, it } from "vitest";
import {
  buildAskBuddyPrimaryInstruction,
  buildCompactAskBuddyPrompt,
  buildCrossTeamDependencyPrompt,
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
      expect(prompt).toContain("Preserve conversational continuity");
    }

    expect(compact).toContain("Current Control Panel/governed records establish current delivery state");
    expect(dependencies).toContain("Required response format");
  });
});

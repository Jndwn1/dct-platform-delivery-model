import { describe, expect, it } from "vitest";
import { buildCompactAskBuddyPrompt } from "./platformContext";

describe("Ask Buddy compact evidence packet", () => {
  it("keeps a page-grounded answer packet bounded while retaining source and no-assumption rules", () => {
    const prompt = buildCompactAskBuddyPrompt({
      question: "How does Roger save data and what does TDC own?",
      currentPagePath: "/discovery/ecosystem",
    });

    expect(prompt).toContain("For DCT-specific facts, answer only from the supplied evidence");
    expect(prompt).toContain("Current page context");
    expect(prompt).toContain("DCT Ecosystem Overview");
    expect(prompt).toContain('"system":"TDC"');
    expect(prompt).toContain("Control Panel batch evidence");
    expect(prompt).not.toContain("Full Batch Registry");
    expect(prompt.length).toBeLessThan(7_000);
  });

  it("keeps response instructions concise so the interactive model call can stay within its fast-response limit", () => {
    const prompt = buildCompactAskBuddyPrompt({
      question: "What does TDC own?",
      currentPagePath: "/discovery/ecosystem",
    });

    expect(prompt).toContain("Keep the response concise");
    expect(prompt.length).toBeLessThan(12_000);
  });
});

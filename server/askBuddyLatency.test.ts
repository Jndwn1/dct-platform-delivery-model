import { describe, expect, it } from "vitest";
import { buildCompactAskBuddyPrompt } from "./platformContext";

describe("Ask Buddy compact evidence packet", () => {
  it("keeps a page-grounded answer packet bounded while retaining source and no-assumption rules", () => {
    const prompt = buildCompactAskBuddyPrompt({
      question: "How does Roger save data and what does TDC own?",
      currentPagePath: "/discovery/ecosystem",
    });

    expect(prompt).toContain("Answer only from the supplied evidence");
    expect(prompt).toContain("Current page context");
    expect(prompt).toContain("DCT Ecosystem Overview");
    expect(prompt).toContain("All tax mapping decisions (immutable once committed)");
    expect(prompt).not.toContain("Full Batch Registry");
    expect(prompt.length).toBeLessThan(12_000);
  });
});

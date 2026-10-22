import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildAttachmentFollowUpPrompt } from "./platformContext";

const router = readFileSync("server/routers.ts", "utf8");
const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");

describe("Ask Buddy conversational document follow-ups", () => {
  it("answers a specific document question without reapplying the six-section assessment", () => {
    const prompt = buildAttachmentFollowUpPrompt("Which dependencies should be tracked in ADO?");

    expect(prompt).toContain("Document Follow-Up Analysis");
    expect(prompt).toContain("Answer the user's current question directly");
    expect(prompt).toContain("Do not regenerate the six-section assessment");
    expect(prompt).toContain("Dependency | Affected ADO work item | Team needing information | Proposed providing team | Required deliverable or decision | Development or test impact | Classification | Sequencing recommendation");
    expect(prompt).toContain("Confirmed blocker");
    expect(prompt).toContain("Proposed — validate");
    expect(prompt).not.toContain("### 1. Executive Assessment");
  });

  it("keeps the retained attachment and original ADO request available to a follow-up", () => {
    expect(router).toContain("documentContext: z.object({");
    expect(router).toContain("initialQuestion: z.string().max(5_000).optional()");
    expect(router).toContain("const documentFollowUpMode");
    expect(router).toContain("buildAttachmentFollowUpPrompt(question)");
    expect(router).toContain("ORIGINAL DOCUMENT ANALYSIS REQUEST");
    expect(router).toContain("DOCUMENT_FOLLOW_UP_TIMEOUT_MS = 12_000");
    expect(router).toContain("fullDocumentAssessmentMode && !hasCompleteDocumentAnalysis(responseText)");
  });

  it("shows users when a document context is active and lets them pause it", () => {
    expect(askBuddyPage).toContain('Document context {documentContextEnabled ? "active" : "paused"}');
    expect(askBuddyPage).toContain("will inform follow-up questions without repeating the full assessment");
    expect(askBuddyPage).toContain("Pause document context");
    expect(askBuddyPage).toContain("Use document context");
    expect(askBuddyPage).toContain("documentContextEnabled && activeDocumentContext");
  });
});

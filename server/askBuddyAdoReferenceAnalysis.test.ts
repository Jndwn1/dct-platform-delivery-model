import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildAskBuddyPrimaryInstruction,
  buildDocumentAndDependencyAnalysisInstruction,
} from "./platformContext";

const router = readFileSync("server/routers.ts", "utf8");
const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
const attachmentEngine = readFileSync("server/askBuddyAttachmentEngine.ts", "utf8");

describe("Ask Buddy analytical ADO-reference behavior", () => {
  it("requires evidence-bound analysis rather than an extraction-only report", () => {
    const policy = buildAskBuddyPrimaryInstruction();
    const analysisInstruction = buildDocumentAndDependencyAnalysisInstruction();

    expect(policy).toContain("For substantive requests, reason from evidence");
    expect(policy).toContain("Evidence-bound inferences must be labeled");
    expect(policy).toContain("Do not substitute extraction");
    expect(analysisInstruction).toContain("each finding must describe its distinct business, data, integration, validation, or technical implication");
    expect(analysisInstruction).toContain("Spike 1514276 Readiness Assessment");
    expect(analysisInstruction).toContain("Spike 1514277 Readiness Assessment");
  });

  it("recognizes user-supplied ADO URLs and IDs without claiming live retrieval", () => {
    expect(router).toContain("getSuppliedAdoReferences");
    expect(router).toContain("ADO REFERENCES SUPPLIED BY THE USER — ANALYZE ONLY PROVIDED DETAILS");
    expect(router).toContain("STANDALONE_ADO_ID_PATTERN");
    expect(router).toContain("No authorized Azure DevOps retrieval connection is available in this workspace");
    expect(router).toContain("Do not claim the links were opened");
    expect(router).toContain("Preserve the ADO ID and supplied URL in the relevant finding");
  });

  it("invites ADO details in the UI and avoids generic fallback row labels", () => {
    expect(askBuddyPage).toContain("paste ADO URLs or work-item IDs");
    expect(askBuddyPage).toContain("titles, descriptions, exports, screenshots, or acceptance criteria");
    expect(askBuddyPage).toContain("no live Azure DevOps retrieval connection");
    expect(attachmentEngine).not.toContain("Potential requirement from extracted source");
    expect(attachmentEngine).not.toContain("Potential dependency from extracted source");
  });

  it("provides a dedicated multi-link ADO input that can submit without a separate question", () => {
    expect(askBuddyPage).toContain("MAX_ADO_REFERENCE_CHARS = 5_000");
    expect(askBuddyPage).toContain("DEFAULT_ADO_ANALYSIS_REQUEST");
    expect(askBuddyPage).toContain("ADO references supplied by user:");
    expect(askBuddyPage).toContain('id="ask-buddy-ado-references"');
    expect(askBuddyPage).toContain("multiple links or IDs");
    expect(askBuddyPage).toContain("one or more ADO URLs or IDs");
    expect(askBuddyPage).toContain("canSubmitBuddyRequest");
    expect(askBuddyPage).toContain("Buddy analyzes supplied details only; it does not retrieve or open ADO links in this workspace.");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
const router = readFileSync("server/routers.ts", "utf8");
const transport = readFileSync("client/src/main.tsx", "utf8");

describe("Ask Buddy direct attachment workflow", () => {
  it("provides a general file attachment control beside the question composer", () => {
    expect(askBuddyPage).toContain('id="ask-buddy-attachment"');
    expect(askBuddyPage).toContain("Attach File");
    expect(askBuddyPage).toContain("Attach file for Ask Buddy analysis");
    expect(askBuddyPage).not.toContain('accept=".xlsx,.xls,.csv"');
    expect(askBuddyPage).toContain("Analyze & Ask");
    expect(askBuddyPage).toContain("Source version/date (optional)");
    expect(askBuddyPage).toContain("Ask Buddy a question or provide one or more ADO references before sending.");
    expect(askBuddyPage).toContain(
      "Word (.docx), Excel/CSV, and readable text formats"
    );
  });

  it("sends the preserved artifact ID to Buddy instead of trusting client-provided analysis text", () => {
    expect(askBuddyPage).toContain(
      "attachmentArtifactId: artifact.artifact.id"
    );
    expect(router).toContain(
      "attachmentArtifactId: z.number().int().positive().optional()"
    );
    expect(router).toContain("UPLOADED STRUCTURED SOURCE REVIEW — REVIEW ONLY");
    expect(router).toContain("The uploaded attachment could not be found");
  });

  it("uses an unbatched request for general file uploads", () => {
    expect(askBuddyPage).toContain(
      "trpc.askBuddy.uploadAttachment.useMutation()"
    );
    expect(router).toContain("uploadAttachment: publicProcedure");
    expect(transport).toContain('op.path === "askBuddy.uploadAttachment"');
    expect(transport).toContain("true: httpLink({");
  });

  it("routes interactive chat directly and sends only the bounded recent history window", () => {
    expect(transport).toContain('op.path === "askBuddy.chat"');
    expect(askBuddyPage).toContain('.filter((m) => m.id !== "welcome")\n      .slice(-2)');
    expect(askBuddyPage).toContain("content: m.text.slice(-2_000)");
    expect(askBuddyPage).toContain("currentPagePath: \"/ask-buddy\"");
  });

  it("keeps evidence and audit metadata internal instead of rendering source provenance", () => {
    expect(router).toContain("const text = responseText;");
    expect(router).not.toContain("appendBuddyProvenance(responseText, grounding)");
    expect(askBuddyPage).toContain("withoutVisibleSourceProvenance");
    expect(askBuddyPage).not.toContain("msg.sources && msg.sources.length > 0");
  });

  it("uses a quality-first analytical path and explicit timeout notice for extracted documents", () => {
    expect(router).toContain("const attachmentAnalysisMode = attachmentRecord?.analysisStatus === \"Extracted\"");
    expect(router).toContain("const structuredAttachmentAnalysisMode = Boolean(attachmentAnalysis && attachmentArtifact)");
    expect(router).toContain("const documentAndDependencyAnalysisMode = attachmentAnalysisMode || structuredAttachmentAnalysisMode || crossTeamDependenciesMode");
    expect(router).toContain("buildAttachmentAnalysisPrompt(question)");
    expect(router).toContain('DOCUMENT_ANALYSIS_MODEL = "gpt-6-luna"');
    expect(router).toContain("DEEP_DOCUMENT_ANALYSIS_TIMEOUT_MS = 30_000");
    expect(router).toContain("DEEP_DOCUMENT_ANALYSIS_MAX_TOKENS = 2_800");
    expect(router).toContain("CONCISE_DOCUMENT_ANALYSIS_TIMEOUT_MS = 18_000");
    expect(router).toContain("CONCISE_DOCUMENT_ANALYSIS_MAX_TOKENS = 1_600");
    expect(router).toContain("attachmentAnalysisMode ? DOCUMENT_ANALYSIS_MODEL");
    expect(router).toContain("attachmentAnalysisMode ? documentAnalysisTimeoutMs");
    expect(router).toContain("hasCompleteDocumentAnalysis(responseText)");
    expect(router).toContain("RELATED GOVERNED STATE READINESS CONTEXT");
    expect(router).toContain('reasoning: attachmentAnalysisMode ? { effort: "low" }');
    expect(router).toContain("Document evidence supplied to this analysis is truncated");
    expect(router).toContain("buildAttachmentEvidenceFallback({ question, textExcerpt: attachmentRecord.textExcerpt })");
    expect(router).toContain("buildStructuredAttachmentAnalysisFallback(question, attachmentAnalysis)");
  });

  it("offers concise or detailed document analysis, progress feedback, and a completion badge", () => {
    expect(askBuddyPage).toContain('aria-label="Document analysis depth"');
    expect(askBuddyPage).toContain("Concise · six-section summary");
    expect(askBuddyPage).toContain("Detailed · requirements & readiness");
    expect(askBuddyPage).toContain("Deep document analysis in progress");
    expect(askBuddyPage).toContain("Reading evidence, assessing requirements, and checking dependencies and ADO readiness.");
    expect(askBuddyPage).toContain("6/6 sections complete");
    expect(askBuddyPage).toContain("analysisDepth,");
    expect(router).toContain('analysisDepth: z.enum(["concise", "detailed"]).optional()');
    expect(router).toContain("DOCUMENT ANALYSIS DEPTH:");
    expect(router).toContain("documentAnalysis:");
  });

  it("does not duplicate an attached-file label when the combined question already names the selected file", () => {
    expect(askBuddyPage).toContain("adoDisplayText.includes(attachmentFile.name) || /attached file:/i.test(adoDisplayText)");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(async () => ({
      value:
        "State requirements\nRequired field: Entity ID\nOpen question: Confirm rounding precision.",
    })),
  },
}));

import {
  buildAttachmentEvidenceFallback,
  parseAskBuddyAttachmentRecord,
  prepareAskBuddyAttachment,
} from "./askBuddyAttachmentEngine";

describe("Ask Buddy general attachment analysis", () => {
  it("extracts readable Word document content for evidence-bound analysis", async () => {
    const prepared = await prepareAskBuddyAttachment(
      Buffer.from("placeholder"),
      "state-requirements.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "October 2026"
    );
    const record = parseAskBuddyAttachmentRecord(prepared.fieldsJson);

    expect(prepared.analysisStatus).toBe("Extracted");
    expect(record).toMatchObject({
      format: "Word document (.docx)",
      analysisStatus: "Extracted",
      textExcerpt: expect.stringContaining("Required field: Entity ID"),
    });
  });

  it("extracts readable text files without treating them as mapping workbooks", async () => {
    const prepared = await prepareAskBuddyAttachment(
      Buffer.from("Dependency: IMS needs routing metadata."),
      "dependency-notes.txt",
      "text/plain",
      "October 2026"
    );
    const record = parseAskBuddyAttachmentRecord(prepared.fieldsJson);

    expect(prepared.analysisStatus).toBe("Extracted");
    expect(record).toMatchObject({
      format: "Text document (.txt)",
      textExcerpt: expect.stringContaining("IMS needs routing metadata"),
    });
  });

  it("retains unsupported binary files as reference-only without inferring content", async () => {
    const prepared = await prepareAskBuddyAttachment(
      Buffer.from("pdf-binary"),
      "architecture.pdf",
      "application/pdf",
      "October 2026"
    );
    const record = parseAskBuddyAttachmentRecord(prepared.fieldsJson);

    expect(prepared.analysisStatus).toBe("Reference Only");
    expect(record).toMatchObject({
      format: ".pdf file",
      analysisStatus: "Reference Only",
      note: expect.stringContaining("will not infer content"),
    });
  });

  it("returns a useful evidence-only first pass when a document model response times out", () => {
    const fallback = buildAttachmentEvidenceFallback({
      question: "What does TDC need to own and what dependencies need to be resolved?",
      textExcerpt: "TDC must govern validation standards and taxonomy mappings. IMS needs approved routing metadata before outbound transmission. GoSystem result ingestion requires reconciliation ownership.",
    });

    expect(fallback).toContain("Document Analysis — Evidence-Bound First Pass");
    expect(fallback).toContain("TDC Ownership Signals");
    expect(fallback).toContain("Cross-Team Dependency Signals");
    expect(fallback).toContain("TDC must govern validation standards and taxonomy mappings.");
    expect(fallback).toContain("IMS needs approved routing metadata");
    expect(fallback).not.toContain("No answer has been inferred");
  });
});

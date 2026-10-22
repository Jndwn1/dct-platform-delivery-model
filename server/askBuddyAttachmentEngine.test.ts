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

  it("returns an explicit non-analytical timeout notice when document analysis does not complete", () => {
    const fallback = buildAttachmentEvidenceFallback({
      question: "What does TDC need to own and what dependencies need to be resolved?",
      textExcerpt: "TDC must govern validation standards and taxonomy mappings. IMS needs approved routing metadata before outbound transmission. GoSystem result ingestion requires reconciliation ownership.",
    });

    expect(fallback).toContain("### Document Analysis Did Not Complete");
    expect(fallback).toContain("### Direct Source Statements Available for Retry");
    expect(fallback).toContain("### Next Action");
    expect(fallback).toContain("no requirement, dependency, ownership, ADO, or readiness conclusion has been inferred");
    expect(fallback).toContain("TDC must govern validation standards and taxonomy mappings.");
    expect(fallback).not.toContain("evidence-bound first pass");
    expect(fallback).not.toContain("Potential requirement from extracted source");
  });

  it("retains only direct statements without manufacturing an ownership or dependency assessment", () => {
    const fallback = buildAttachmentEvidenceFallback({
      question: "Analyze the State integration note.",
      textExcerpt: [
        "TDC must retain the approved mapping decision and validation evidence for each entity, State, and period.",
        "IMS requires agreed routing metadata before it can transmit an approved package to GoSystem.",
        "ADO 1900001 — Define State Routing Metadata is a discovery work item, not an implementation commitment.",
        "Open question: the source does not identify the final accountable owner.",
      ].join("\n"),
    });

    expect(fallback).toContain("### Document Analysis Did Not Complete");
    expect(fallback).toContain("ADO 1900001 — Define State Routing Metadata is a discovery work item");
    expect(fallback).not.toContain("final accountable owner: TDC");
    expect(fallback).not.toContain("Cross-Team Dependency Analysis");
    expect(fallback).not.toContain("Requires confirmation before it is treated as a commitment");
  });
});

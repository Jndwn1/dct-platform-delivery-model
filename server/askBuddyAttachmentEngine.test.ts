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

    expect(fallback).toContain("### 1. Executive Assessment");
    expect(fallback).toContain("### 2. Requirements Analysis");
    expect(fallback).toContain("### 3. Cross-Team Dependency Analysis");
    expect(fallback).toContain("### 4. Gaps and Open Questions");
    expect(fallback).toContain("### 5. Existing ADO Coverage");
    expect(fallback).toContain("### 6. Recommended Next Actions");
    expect(fallback).toContain("TDC must govern validation standards and taxonomy mappings.");
    expect(fallback).toContain("IMS needs approved routing metadata");
    expect(fallback).not.toContain("No answer has been inferred");
  });

  it("retains direct ADO and dependency statements without manufacturing ownership", () => {
    const fallback = buildAttachmentEvidenceFallback({
      question: "Analyze the State integration note.",
      textExcerpt: [
        "TDC must retain the approved mapping decision and validation evidence for each entity, State, and period.",
        "IMS requires agreed routing metadata before it can transmit an approved package to GoSystem.",
        "ADO 1900001 — Define State Routing Metadata is a discovery work item, not an implementation commitment.",
        "Open question: the source does not identify the final accountable owner.",
      ].join("\n"),
    });

    expect(fallback).toContain("IMS requires agreed routing metadata before it can transmit an approved package to GoSystem.");
    expect(fallback).toContain("ADO 1900001 — Define State Routing Metadata is a discovery work item");
    expect(fallback).toContain("Not stated in source");
    expect(fallback).not.toContain("final accountable owner: TDC");
    const dependencySection = fallback.split("### 3. Cross-Team Dependency Analysis")[1]?.split("### 4. Gaps and Open Questions")[0] ?? "";
    expect(dependencySection).toContain("IMS requires agreed routing metadata");
    expect(dependencySection).not.toContain("TDC must retain the approved mapping decision");
  });
});

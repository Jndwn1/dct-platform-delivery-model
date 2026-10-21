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
});

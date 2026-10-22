import mammoth from "mammoth";
import { parseArtifactBuffer, type ArtifactField } from "./dataMappingEngine";

export const ASK_BUDDY_ATTACHMENT_KIND = "ask-buddy-attachment-v1";
const MAX_EXTRACTED_CHARS = 24_000;

export type AttachmentAnalysisStatus = "Extracted" | "Reference Only";

export type AskBuddyAttachmentRecord = {
  kind: typeof ASK_BUDDY_ATTACHMENT_KIND;
  format: string;
  analysisStatus: AttachmentAnalysisStatus;
  textExcerpt: string;
  note: string;
};

export type PreparedAskBuddyAttachment = {
  fieldsJson: string;
  analysisStatus: AttachmentAnalysisStatus;
  format: string;
  note: string;
};

function extension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/i);
  return match?.[1] ?? "";
}

function boundedText(value: string) {
  const normalized = value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
  return normalized.length > MAX_EXTRACTED_CHARS
    ? `${normalized.slice(0, MAX_EXTRACTED_CHARS).trimEnd()}\n\n[Excerpt truncated after ${MAX_EXTRACTED_CHARS.toLocaleString()} characters.]`
    : normalized;
}

function record(
  format: string,
  analysisStatus: AttachmentAnalysisStatus,
  textExcerpt: string,
  note: string
): AskBuddyAttachmentRecord {
  return {
    kind: ASK_BUDDY_ATTACHMENT_KIND,
    format,
    analysisStatus,
    textExcerpt,
    note,
  };
}

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "xml",
  "yaml",
  "yml",
  "html",
  "htm",
  "log",
  "rtf",
]);
const STRUCTURED_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);

export async function prepareAskBuddyAttachment(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  versionLabel: string
): Promise<PreparedAskBuddyAttachment> {
  const fileExtension = extension(fileName);

  if (STRUCTURED_EXTENSIONS.has(fileExtension)) {
    try {
      const parsed = parseArtifactBuffer(buffer, fileName, versionLabel);
      return {
        fieldsJson: JSON.stringify(parsed.fields),
        analysisStatus: "Extracted",
        format: "Structured workbook",
        note: `Captured ${parsed.fields.length} structured field record${parsed.fields.length === 1 ? "" : "s"} for review-only mapping analysis.`,
      };
    } catch {
      const fallback = record(
        "Structured workbook",
        "Reference Only",
        "",
        "The workbook is retained as a source reference, but no readable structured field rows were extracted. Buddy will not infer its contents."
      );
      return {
        fieldsJson: JSON.stringify(fallback),
        analysisStatus: fallback.analysisStatus,
        format: fallback.format,
        note: fallback.note,
      };
    }
  }

  if (fileExtension === "docx") {
    try {
      const extracted = await mammoth.extractRawText({ buffer });
      const textExcerpt = boundedText(extracted.value);
      if (textExcerpt) {
        const parsed = record(
          "Word document (.docx)",
          "Extracted",
          textExcerpt,
          "Word document text was extracted for evidence-bound analysis; formatting, tracked changes, comments, and embedded objects are not interpreted."
        );
        return {
          fieldsJson: JSON.stringify(parsed),
          analysisStatus: parsed.analysisStatus,
          format: parsed.format,
          note: parsed.note,
        };
      }
    } catch {
      // Preserve the original attachment as a reference even when its text cannot be extracted.
    }

    const fallback = record(
      "Word document (.docx)",
      "Reference Only",
      "",
      "No readable Word document text was extracted. The original file is retained as a source reference, but Buddy will not infer its contents."
    );
    return {
      fieldsJson: JSON.stringify(fallback),
      analysisStatus: fallback.analysisStatus,
      format: fallback.format,
      note: fallback.note,
    };
  }

  if (TEXT_EXTENSIONS.has(fileExtension) || mimeType.startsWith("text/")) {
    const textExcerpt = boundedText(buffer.toString("utf8"));
    const parsed = textExcerpt
      ? record(
          `Text document (.${fileExtension || "txt"})`,
          "Extracted",
          textExcerpt,
          "Plain-text content was extracted for evidence-bound analysis."
        )
      : record(
          `Text document (.${fileExtension || "txt"})`,
          "Reference Only",
          "",
          "No readable text was found. The original file is retained as a source reference, but Buddy will not infer its contents."
        );
    return {
      fieldsJson: JSON.stringify(parsed),
      analysisStatus: parsed.analysisStatus,
      format: parsed.format,
      note: parsed.note,
    };
  }

  const format = fileExtension ? `.${fileExtension} file` : "Unrecognized file";
  const fallback = record(
    format,
    "Reference Only",
    "",
    "This file type is retained as a source reference. Buddy can analyze Word (.docx), Excel/CSV, and readable text formats directly; it will not infer content from unsupported binary formats."
  );
  return {
    fieldsJson: JSON.stringify(fallback),
    analysisStatus: fallback.analysisStatus,
    format: fallback.format,
    note: fallback.note,
  };
}

export function parseAskBuddyAttachmentRecord(
  fieldsJson: string
): AskBuddyAttachmentRecord | null {
  try {
    const parsed = JSON.parse(fieldsJson) as Partial<AskBuddyAttachmentRecord>;
    if (
      parsed.kind === ASK_BUDDY_ATTACHMENT_KIND &&
      (parsed.analysisStatus === "Extracted" ||
        parsed.analysisStatus === "Reference Only") &&
      typeof parsed.format === "string" &&
      typeof parsed.textExcerpt === "string" &&
      typeof parsed.note === "string"
    ) {
      return parsed as AskBuddyAttachmentRecord;
    }
  } catch {
    // Existing structured mapping records are arrays, not attachment records.
  }
  return null;
}

export function parseStructuredAttachmentFields(
  fieldsJson: string
): ArtifactField[] | null {
  try {
    const parsed = JSON.parse(fieldsJson) as unknown;
    return Array.isArray(parsed) ? (parsed as ArtifactField[]) : null;
  } catch {
    return null;
  }
}

function matchingEvidenceLines(text: string, expression: RegExp, limit: number) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 18 && expression.test(line))
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .slice(0, limit);
}

/**
 * Provides a useful, evidence-only first pass when a model response exceeds
 * the bounded document-analysis window. It never attempts to synthesize facts
 * beyond the extracted document text.
 */
export function buildAttachmentEvidenceFallback({
  question,
  textExcerpt,
}: Pick<AskBuddyAttachmentRecord, "textExcerpt"> & { question: string }) {
  const ownershipLines = matchingEvidenceLines(
    textExcerpt,
    /\b(TDC|taxonomy|validation|data type|persist|govern|reference data)\b/i,
    5
  );
  const dependencyLines = matchingEvidenceLines(
    textExcerpt,
    /\b(IMS|Roger|GoSystem|State|Process|mapping|routing|outbound|inbound|dependency|integration)\b/i,
    7
  );
  const quotedRows = (lines: string[], emptyMessage: string) =>
    lines.length
      ? lines.map((line) => `| ${line.replace(/\|/g, "\\|")} | Requires confirmation before it is treated as a commitment. |`).join("\n")
      : `| ${emptyMessage} | Open — requires confirmation. |`;

  return [
    "### Document Analysis — Evidence-Bound First Pass",
    `**Question addressed:** ${question}`,
    "Ask Buddy prepared this evidence-bound first pass directly from matching extracted statements in the attached document. It does not infer missing ownership, dependencies, or delivery commitments.",
    "",
    "### TDC Ownership Signals",
    "| Extracted statement | Status |",
    "| --- | --- |",
    quotedRows(ownershipLines, "No explicit TDC ownership statement was located in the extracted text."),
    "",
    "### Cross-Team Dependency Signals",
    "| Extracted statement | Status |",
    "| --- | --- |",
    quotedRows(dependencyLines, "No explicit cross-team dependency statement was located in the extracted text."),
    "",
    "### Next Action",
    "Review the quoted statements with the accountable SMEs, then record confirmed ownership, required inputs, unresolved decisions, and any delivery-impacting dependencies in the governing backlog or working-session notes.",
  ].join("\n");
}

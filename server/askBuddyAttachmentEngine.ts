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
  ).filter((line) => !/^\s*TDC\s+must\b/i.test(line) && !/\bADO\s*\d{4,}\b/i.test(line));
  const adoLines = matchingEvidenceLines(
    textExcerpt,
    /\b(ado\s*\d{4,}|feature\s*\d{4,}|story\s*\d{4,}|bug\s*\d{4,}|spike\s*\d{4,}|\d{5,}\s*[—-])/i,
    5
  );

  return [
    "### 1. Executive Assessment",
    `**Question addressed:** ${question}`,
    "This is an evidence-bound first pass from matching extracted statements in the attached document. It identifies potential requirements and dependencies for validation; it does not infer missing ownership, approvals, ADO coverage, or delivery commitments.",
    "",
    "### 2. Requirements Analysis",
    "| Requirement or potential requirement | Business / technical explanation | Supporting document evidence | Classification | Recommended validation or action |",
    "| --- | --- | --- | --- | --- |",
    ownershipLines.length
      ? ownershipLines.map((line) => `| ${line.replace(/\|/g, "\\|")} | The statement indicates a potential governance, taxonomy, validation, persistence, or reference-data requirement that should be evaluated for implementation scope. | ${line.replace(/\|/g, "\\|")} | Inferred | Determine whether this statement is an approved requirement and capture the specific implementation boundary and accountable owner. |`).join("\n")
      : "| No explicit TDC requirement statement was located | The excerpt did not establish a TDC requirement. | Not stated in extracted text | Open | Provide the applicable requirement or decision section. |",
    "",
    "### 3. Cross-Team Dependency Analysis",
    "| Dependency | Requesting or affected team | Providing or decision-making team | Required input, decision, or deliverable | Delivery impact | Status |",
    "| --- | --- | --- | --- | --- | --- |",
    dependencyLines.length
      ? dependencyLines.map((line) => `| ${line.replace(/\|/g, "\\|")} | Teams named in the statement; final affected team is not stated. | Not stated in source | ${line.replace(/\|/g, "\\|")} | Requirements, integration, or testing may be delayed until the referenced input or decision is resolved. | Potential |`).join("\n")
      : "| No explicit cross-team dependency statement was located | Not stated in source | Not stated in source | Provide the related integration, mapping, or working-session section. | Delivery impact cannot be assessed from the excerpt. | Open |",
    "",
    "### 4. Gaps and Open Questions",
    "- **Ownership and approval status:** The extracted text does not establish final accountable ownership or approval. This matters because a mention of TDC, IMS, Roger, State, or GoSystem does not itself create a delivery commitment.",
    "- **Complete source scope:** This first pass uses matching extracted statements only. This matters because the full requirement, interface, mapping, or test context may be elsewhere in the document.",
    "",
    "### 5. Existing ADO Coverage",
    ...(adoLines.length
      ? adoLines.map((line) => `- **Directly mentioned ADO reference:** ${line} Treat as Existing ADO Work only; validate scope, status, and relationship before refinement or implementation planning.`)
      : ["No related ADO item was directly identified in the extracted text. Validate existing backlog coverage before creating, refining, or linking an ADO work item."]),
    "",
    "### 6. Recommended Next Actions",
    "1. Review the quoted statements with the accountable SMEs or decision-makers identified in the source. **Expected outcome:** confirmed requirement, dependency, and ownership status.",
    "2. Compare the confirmed findings with the governing backlog. **Expected outcome:** a decision on whether to refine existing ADO work, create a new review-only draft, or continue discovery.",
    "3. Capture unresolved decisions, evidence, and delivery impact in the working-session notes. **Expected outcome:** traceable inputs for backlog refinement and implementation planning.",
  ].join("\n");
}

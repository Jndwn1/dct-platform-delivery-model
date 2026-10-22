export interface AdoFollowUpDraft {
  id: string;
  draftTitle: string;
  confirmedEvidence: string;
  explicitOwnerOrTeam: string;
  requiredInputOrDecision: string;
  affectedAdoReference: string;
  impactIfUnresolved: string;
  nextAction: string;
  adoStatus: "Draft — Requires BA Review";
}

export const ADO_FOLLOW_UP_TYPES = ["Task", "User Story", "Bug"] as const;
export type AdoFollowUpType = (typeof ADO_FOLLOW_UP_TYPES)[number];

export interface AdoFollowUpReview {
  draftType: AdoFollowUpType;
  baReviewNote: string;
  ownerConfirmed: boolean;
  acceptanceCriteriaReviewed: boolean;
}

export type AdoFollowUpReviews = Record<string, AdoFollowUpReview>;

const NOT_STATED = "Not stated in source";

export function getAdoFollowUpReviewKey(draft: AdoFollowUpDraft, index: number) {
  return `${draft.id}-${index}`;
}

export function createDefaultAdoFollowUpReview(): AdoFollowUpReview {
  return {
    draftType: "Task",
    baReviewNote: "",
    ownerConfirmed: false,
    acceptanceCriteriaReviewed: false,
  };
}

export function getAdoFollowUpReview(draft: AdoFollowUpDraft, index: number, reviews: AdoFollowUpReviews) {
  return reviews[getAdoFollowUpReviewKey(draft, index)] ?? createDefaultAdoFollowUpReview();
}

function cleanCell(value: string | undefined) {
  const cleaned = (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || NOT_STATED;
}

function normalizeHeader(value: string) {
  return cleanCell(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readMarkdownTableRow(line: string) {
  if (!line.includes("|")) return [];
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanCell(cell));
}

function isDividerRow(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function headerIndex(headers: string[], ...names: string[]) {
  return headers.findIndex((header) => names.includes(header));
}

function readCell(cells: string[], index: number) {
  return index >= 0 ? cleanCell(cells[index]) : NOT_STATED;
}

/**
 * Extracts only rows that are explicitly labeled "Confirmed" in a dependency
 * table. It intentionally excludes Open, Proposed, Candidate, Reference Only,
 * and any qualified confirmation status such as "Confirmed — pending review".
 */
export function getConfirmedDependencyFollowUps(answer: string): AdoFollowUpDraft[] {
  const lines = answer.split(/\r?\n/);
  const drafts: AdoFollowUpDraft[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const headerCells = readMarkdownTableRow(lines[index] ?? "");
    if (!headerCells.length) continue;

    const headers = headerCells.map(normalizeHeader);
    const dependencyIndex = headerIndex(headers, "dependency", "dependencyfinding");
    const statusIndex = headerIndex(headers, "status", "findingstatus", "dependencystatus");
    if (dependencyIndex < 0 || statusIndex < 0) continue;

    let rowIndex = index + 1;
    while (!(lines[rowIndex] ?? "").trim() && rowIndex < lines.length) rowIndex += 1;
    if (isDividerRow(readMarkdownTableRow(lines[rowIndex] ?? ""))) rowIndex += 1;

    for (; rowIndex < lines.length; rowIndex += 1) {
      const line = lines[rowIndex] ?? "";
      if (!line.trim()) continue;
      if (!line.includes("|")) break;
      const row = readMarkdownTableRow(line);
      if (!row.length) continue;
      if (row.length < headerCells.length) continue;

      // Exact matching prevents any status qualifier from being promoted to confirmed.
      if (readCell(row, statusIndex).toLowerCase() !== "confirmed") continue;

      const dependency = readCell(row, dependencyIndex);
      if (dependency === NOT_STATED) continue;
      const key = dependency.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const idIndex = headerIndex(headers, "id", "dependencyid");
      const ownerIndex = headerIndex(headers, "responsibleteam", "owner", "responsibleowner", "team");
      const inputIndex = headerIndex(headers, "requiredinputdecision", "requiredinput", "decision", "requireddecision");
      const adoIndex = headerIndex(headers, "affectedadostory", "affectedado", "ado", "adostory", "existingadoreference");
      const impactIndex = headerIndex(headers, "impactifunresolved", "impact", "deliveryimpact");
      const nextActionIndex = headerIndex(headers, "nextaction", "recommendednextaction", "explicitnextaction");
      const sourceId = readCell(row, idIndex);

      drafts.push({
        id: sourceId === NOT_STATED ? `Confirmed dependency ${drafts.length + 1}` : sourceId,
        draftTitle: `Follow-up: ${dependency}`,
        confirmedEvidence: dependency,
        explicitOwnerOrTeam: readCell(row, ownerIndex),
        requiredInputOrDecision: readCell(row, inputIndex),
        affectedAdoReference: readCell(row, adoIndex),
        impactIfUnresolved: readCell(row, impactIndex),
        nextAction: readCell(row, nextActionIndex),
        adoStatus: "Draft — Requires BA Review",
      });
    }
  }

  return drafts;
}

export function buildAdoFollowUpMarkdown(drafts: AdoFollowUpDraft[], reviews: AdoFollowUpReviews = {}) {
  const lines = [
    "# ADO Follow-up Drafts",
    "",
    "> Draft only — these records were derived solely from dependency findings explicitly marked **Confirmed** in the selected Ask Buddy response. They have not been sent to Azure DevOps. BA and accountable-owner review is required before manual ADO entry. Draft type and BA review inputs are user-entered review metadata, not source evidence or approval.",
    "",
  ];

  drafts.forEach((draft, index) => {
    const review = getAdoFollowUpReview(draft, index, reviews);
    lines.push(
      `## ${index + 1}. ${draft.id}`,
      "",
      `**Draft type (BA selection):** ${review.draftType}`,
      `**Draft ${review.draftType} title:** ${draft.draftTitle}`,
      `**Confirmed evidence:** ${draft.confirmedEvidence}`,
      `**Explicit owner / team:** ${draft.explicitOwnerOrTeam}`,
      `**Required input / decision:** ${draft.requiredInputOrDecision}`,
      `**Affected ADO reference:** ${draft.affectedAdoReference}`,
      `**Impact if unresolved:** ${draft.impactIfUnresolved}`,
      `**Next action (if stated):** ${draft.nextAction}`,
      `**ADO status:** ${draft.adoStatus}`,
      `**BA review note:** ${review.baReviewNote.trim() || "None entered"}`,
      `**Optional BA review checklist:** Owner confirmation ${review.ownerConfirmed ? "checked" : "not checked"}; acceptance criteria review ${review.acceptanceCriteriaReviewed ? "checked" : "not checked"}. These checks are not source evidence or approval.`,
      ""
    );
  });

  return lines.join("\n").trim();
}

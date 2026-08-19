import { getAllBatches } from "../client/src/lib/batchModel";
import { DISCOVERY_KNOWLEDGE_BASE } from "./discoveryKnowledgeBase";
import { PAGE_CONTEXT_REGISTRY, resolvePageContext } from "../client/src/lib/pageContextRegistry";
import { MULTI_ENTITY_TDC_PERSISTENCE_DECISION } from "../client/src/lib/multiEntityTdcPersistenceDecision";
import type { LiveSnapshotInput } from "./platformContext";

export type BuddyAnswerStatus = "Confirmed" | "Open" | "Conflict" | "Missing";

export interface BuddySource {
  id: string;
  label: string;
  path: string;
  authority: string;
  lastUpdated: string;
  artifactStatus: "Current" | "Reference" | "Open" | "Unavailable";
}

export interface BuddyConflict {
  currentSource: string;
  conflictingSource: string;
  difference: string;
  recommendedAction: string;
}

export interface BuddyGrounding {
  sources: BuddySource[];
  conflicts: BuddyConflict[];
  status: BuddyAnswerStatus;
  checkedAt: string;
  latestSource: BuddySource | null;
  evidenceBlock: string;
  hasSufficientEvidence: boolean;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "does", "do", "for", "from", "how", "i", "in", "is", "it", "latest", "me", "of", "on", "or", "show", "that", "the", "this", "to", "what", "when", "where", "which", "who", "with",
]);

const DELIVERY_TERMS = /\b(batch|pi\s?\d|mvp|delivery|readiness|active|complete|completed|planned|review|ado|status|blocker)\b/i;
const API_TERMS = /\b(api|swagger|openapi|endpoint|request|response|payload|contract|http|field|identifier)\b/i;
const DECISION_TERMS = /\b(adr|decision|open|unresolved|clarification|conflict|rule|adjustment|persistence)\b/i;

function tokens(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((token) => !STOP_WORDS.has(token)) ?? [];
}

function toSource(id: string, label: string, path: string, authority: string, lastUpdated: string, artifactStatus: BuddySource["artifactStatus"]): BuddySource {
  return { id, label, path, authority, lastUpdated, artifactStatus };
}

function pageSource(path: string): BuddySource | null {
  const page = resolvePageContext(path) ?? PAGE_CONTEXT_REGISTRY[path];
  if (!page) return null;
  return toSource(`page:${path}`, page.pageTitle, path, "Platform page artifact", page.lastUpdated || "Not dated", "Current");
}

function sourceMatchesQuestion(source: BuddySource, questionTokens: string[]): boolean {
  const page = PAGE_CONTEXT_REGISTRY[source.path];
  const discovery = DISCOVERY_KNOWLEDGE_BASE[source.path];
  const searchText = [
    source.label,
    page?.description,
    page?.features.join(" "),
    page?.apis.join(" "),
    page?.batches.join(" "),
    discovery?.summary,
    discovery?.suggestedQuestions.join(" "),
  ].filter(Boolean).join(" ").toLowerCase();
  return questionTokens.some((token) => searchText.includes(token));
}

function normalizedBatchKey(batchId: string): string[] {
  return [batchId.toLowerCase(), `b${batchId.toLowerCase().replace(/^b/, "")}`];
}

function detectBatchConflicts(question: string, liveSnapshot?: LiveSnapshotInput): BuddyConflict[] {
  if (!liveSnapshot) return [];
  const batchReference = question.match(/\bbatch\s+(b?\d+[a-z]?)\b/i)?.[1] ?? question.match(/\bb\d+[a-z]?\b/i)?.[0];
  if (!batchReference) return [];
  const canonicalBatchId = batchReference.toLowerCase().replace(/^b/, "");
  const matchingBatch = getAllBatches().find((batch) => batch.id.toLowerCase().replace(/^b/, "") === canonicalBatchId);
  if (!matchingBatch) return [];
  const liveEntry = Object.entries(liveSnapshot.statuses).find(([key]) => key.toLowerCase().replace(/^b/, "") === canonicalBatchId);
  if (!liveEntry || liveEntry[1].toLowerCase() === matchingBatch.status.toLowerCase()) return [];
  return [{
    currentSource: "Control Panel / ADO-derived live status",
    conflictingSource: `Batch Registry — ${matchingBatch.id}`,
    difference: `Live status is ${liveEntry[1]}; the batch registry value is ${matchingBatch.status}.`,
    recommendedAction: "Use the live Control Panel status for delivery reporting and review the registry entry for refresh or supersession.",
  }];
}

export function buildBuddyGrounding(question: string, currentPagePath?: string, liveSnapshot?: LiveSnapshotInput): BuddyGrounding {
  const checkedAt = new Date().toISOString();
  const queryTokens = tokens(question);
  const selected = new Map<string, BuddySource>();
  const add = (source: BuddySource | null) => { if (source) selected.set(source.id, source); };

  if (currentPagePath) add(pageSource(currentPagePath));

  if (DELIVERY_TERMS.test(question) && liveSnapshot) {
    add(toSource("live-control-panel", "Control Panel / ADO-derived delivery status", "/control-panel", "Authoritative for current delivery and status", liveSnapshot.asOf, "Current"));
    add(toSource("batch-registry", "Batch Registry", "/batch-control", "Delivery reference and traceability", "2026-08-19", "Current"));
  }

  if (API_TERMS.test(question)) {
    add(toSource("api-catalog", "Registered API documentation", "/roger-api", "Platform API documentation", "2026-08-19", "Reference"));
    add(toSource("swagger-availability", "Swagger / OpenAPI availability", "/roger-api", "Technical contract authority when registered", "Not registered in this workspace", "Unavailable"));
  }

  if (DECISION_TERMS.test(question) || /\bb45\b|batch 45/i.test(question)) {
    add(toSource("consumer-adr-07", "Consumer Integration ADR-07", "/consumer-integration-hub#s15", "Open architecture decision", "2026-08-19", "Open"));
  }

  for (const [path] of Object.entries(PAGE_CONTEXT_REGISTRY)) {
    if (selected.size >= 6) break;
    const source = pageSource(path);
    if (source && sourceMatchesQuestion(source, queryTokens)) add(source);
  }

  if (selected.size === 0) add(pageSource("/"));

  const sources = Array.from(selected.values()).slice(0, 6);
  const conflicts = detectBatchConflicts(question, liveSnapshot);
  const hasDomainSignal = queryTokens.some((token) => /batch|tdc|pdc|dct|roger|ims|swagger|api|endpoint|governance|guardrail|gate|rule|adjustment|story|requirement|adr|decision|lineage|mapping|deployment|uat|qa|architecture|platform|agent|ownership/.test(token));
  const hasSufficientEvidence = hasDomainSignal && sources.some((source) => source.artifactStatus !== "Unavailable");
  const status: BuddyAnswerStatus = conflicts.length > 0 ? "Conflict" : !hasSufficientEvidence ? "Missing" : sources.some((source) => source.artifactStatus === "Open") ? "Open" : "Confirmed";
  const latestSource = sources.filter((source) => source.lastUpdated !== "Not dated" && source.lastUpdated !== "Not registered in this workspace").sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0] ?? null;

  const sourceLines = sources.map((source) => `- ${source.label} | Authority: ${source.authority} | Source updated: ${source.lastUpdated} | Status: ${source.artifactStatus}`).join("\n");
  const conflictLines = conflicts.length > 0
    ? conflicts.map((conflict) => `- Current authoritative source: ${conflict.currentSource}\n  Conflicting source: ${conflict.conflictingSource}\n  Difference: ${conflict.difference}\n  Recommended action: ${conflict.recommendedAction}`).join("\n")
    : "- No deterministic source conflict detected in the consulted platform records.";

  const evidenceBlock = `
## Grounded Evidence Packet
The current page provides context only; search the broader DCT platform evidence below before answering.

### Sources consulted
${sourceLines}

### Conflict check
${conflictLines}

### Mandatory response guardrail
Answer only from the supplied platform evidence. Do not infer, assume, fabricate, or fill gaps. If the evidence is insufficient, say exactly: "I could not find enough confirmed information in the DCT Platform to answer this without making an assumption." Then state what was found, what is missing, which artifact should contain it if known, and whether Discovery clarification is needed.

For substantive or Discovery questions, structure the response as: **Answer**, **Evidence**, **Status** (Confirmed / Open / Proposed / Conflict / Missing), **DCT Impact**, **TDC Impact**, **PDC Impact**, and **Next Action** only when evidence supports one. Do not declare a story ready unless the evidence supports an approved decision, applicable contract, owner, and acceptance criteria. Do not claim Swagger support when the Swagger/OpenAPI source is unavailable.
`;

  return { sources, conflicts, status, checkedAt, latestSource, evidenceBlock, hasSufficientEvidence };
}

export function buildInsufficientEvidenceResponse(grounding: BuddyGrounding): string {
  const checked = grounding.sources.map((source) => source.label).join("; ");
  return `I could not find enough confirmed information in the DCT Platform to answer this without making an assumption.\n\n### What I found\n${checked || "No matching platform artifact"}.\n\n### What is missing\nA current approved artifact that directly addresses this question.\n\n### Discovery clarification\nThis appears to require Discovery clarification before it can be treated as a confirmed DCT capability or requirement.`;
}

export function appendBuddyProvenance(answer: string, grounding: BuddyGrounding): string {
  const sources = grounding.sources.map((source) => `- ${source.label} (${source.authority}; updated ${source.lastUpdated})`).join("\n");
  const conflict = grounding.conflicts.length > 0
    ? `\n\n### ⚠ Source Conflict Detected\n${grounding.conflicts.map((item) => `**Current authoritative source:** ${item.currentSource}\n\n**Conflicting source:** ${item.conflictingSource}\n\n**Difference:** ${item.difference}\n\n**Recommended action:** ${item.recommendedAction}`).join("\n\n")}`
    : "";
  return `${answer.trim()}\n\n---\n### Sources Used\n${sources}\n\n**Knowledge checked:** ${grounding.checkedAt}\n**Latest source:** ${grounding.latestSource?.label ?? "No dated source available"}\n**Source updated:** ${grounding.latestSource?.lastUpdated ?? "Not available"}${conflict}`;
}

export const MULTI_ENTITY_DECISION_REFERENCE = MULTI_ENTITY_TDC_PERSISTENCE_DECISION.title;

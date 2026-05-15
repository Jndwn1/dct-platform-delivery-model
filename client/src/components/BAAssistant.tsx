// BAAssistant — Enterprise Governance Copilot
//
// Dual-mode ingestion:
//   TAB 1 — ADO Link Mode: paste URL or story ID → auto-fetch work item
//   TAB 2 — Paste Story Mode: paste raw story text, AC, Swagger, payloads, notes
//
// Capabilities:
//   • Smart governance detection (lineage, EntityId, tax_year, additive-only, etc.)
//   • 9 generated output actions (BA Summary, PO Summary, DEV Questions, QA Risks,
//     Integration Gaps, Dependency Matrix, Roger Impact, Swagger Gap, Missing AC)
//   • Multi-turn conversational Q&A grounded on live platform data + ingested content
//   • Save to ADO, Copy for email/Teams, Gap Report
//   • RSM color coding: Blue = structure, Green = aligned, Amber = warning, Red = blocking

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLLM, type LLMMessage } from "@/hooks/useLLM";
import {
  Bot, Send, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, Link2, RotateCcw, Copy, Check, ClipboardList,
  FileWarning, ExternalLink, BookOpen, RefreshCw, FileText,
  Zap, Shield, GitBranch, Search, AlertTriangle, CheckCircle2,
  Users, Code2, TestTube, BarChart3, Network,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RogerDataPointCtx {
  dataPoint: string;
  source: string;
  batch: string;
  availability: string;
  apiEndpoint: string;
  notes: string;
  owner: string;
  adoStories: { title: string; id: string }[];
}

export interface SwaggerEntryCtx {
  batch: string;
  endpoint: string;
  path: string;
  status: string;
  consumerGuide: string;
  notes: string;
}

interface BAAssistantProps {
  rogerDataPoints: RogerDataPointCtx[];
  swaggerEntries: SwaggerEntryCtx[];
}

interface AdoWorkItem {
  id: string;
  title: string;
  state: string;
  assignedTo: string;
  description: string;
  acceptanceCriteria: string;
  tags: string;
  storyPoints: string;
  iterationPath: string;
  url: string;
}

type AdoFetchStatus = "idle" | "loading" | "success" | "error" | "auth_required";
type InputTab = "ado" | "paste";
type CopyAction = "copy" | "ado" | "gap";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  question?: string;
  isGapReport?: boolean;
  actionType?: string;
}

// ── Action button definitions ─────────────────────────────────────────────────

const ACTION_BUTTONS = [
  { id: "ba_summary",       label: "BA Summary",              icon: <FileText className="w-3 h-3" />,     color: "blue" },
  { id: "po_summary",       label: "PO Summary",              icon: <Users className="w-3 h-3" />,        color: "blue" },
  { id: "dev_questions",    label: "DEV Questions",           icon: <Code2 className="w-3 h-3" />,        color: "indigo" },
  { id: "qa_risks",         label: "QA Risks",                icon: <TestTube className="w-3 h-3" />,     color: "amber" },
  { id: "integration_gaps", label: "Integration Gaps",        icon: <Network className="w-3 h-3" />,      color: "red" },
  { id: "dependency_matrix",label: "Dependency Matrix",       icon: <GitBranch className="w-3 h-3" />,   color: "purple" },
  { id: "roger_impact",     label: "Roger Impact",            icon: <BarChart3 className="w-3 h-3" />,   color: "emerald" },
  { id: "swagger_gaps",     label: "Swagger Gap Report",      icon: <Search className="w-3 h-3" />,       color: "orange" },
  { id: "missing_ac",       label: "Missing AC",              icon: <AlertTriangle className="w-3 h-3" />, color: "amber" },
] as const;

type ActionId = typeof ACTION_BUTTONS[number]["id"];

const ACTION_COLOR_MAP: Record<string, string> = {
  blue:    "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400",
  indigo:  "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400",
  amber:   "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400",
  red:     "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-400",
  purple:  "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-400",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400",
  orange:  "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-400",
};

// ── Suggested questions ───────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What APIs does Roger need from this story?",
  "Which batch owns this functionality?",
  "Is this Roger-facing or Orchestrator-facing?",
  "What governance gaps exist in this story?",
  "What blocking dependencies exist?",
  "What questions should the BA ask the DEV?",
  "Does this violate additive-only contract rules?",
  "What Roger UI screens depend on this?",
  "Is lineage addressed in this story?",
  "What Swagger gaps exist for this feature?",
];

// ── HTML stripper ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── ADO fetcher ───────────────────────────────────────────────────────────────

async function fetchAdoWorkItem(storyId: string): Promise<AdoWorkItem> {
  const url = `https://dev.azure.com/RSMEquiCo/DCT/_apis/wit/workitems/${storyId}?$expand=all&api-version=7.1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (res.status === 401 || res.status === 203) throw new Error("AUTH_REQUIRED");
  if (!res.ok) throw new Error(`ADO API returned ${res.status}`);
  const data = await res.json();
  const f = data.fields ?? {};
  return {
    id: storyId,
    title: f["System.Title"] ?? "",
    state: f["System.State"] ?? "",
    assignedTo: f["System.AssignedTo"]?.displayName ?? f["System.AssignedTo"] ?? "",
    description: stripHtml(f["System.Description"] ?? ""),
    acceptanceCriteria: stripHtml(f["Microsoft.VSTS.Common.AcceptanceCriteria"] ?? ""),
    tags: f["System.Tags"] ?? "",
    storyPoints: String(f["Microsoft.VSTS.Scheduling.StoryPoints"] ?? ""),
    iterationPath: f["System.IterationPath"] ?? "",
    url: `https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${storyId}`,
  };
}

// ── ADO link parser ───────────────────────────────────────────────────────────

function parseAdoLink(link: string): { id: string; url: string } | null {
  if (!link.trim()) return null;
  const m = link.match(/workitems\/edit\/(\d+)/i);
  if (m) return { id: m[1], url: link.trim() };
  if (/^\d{5,8}$/.test(link.trim()))
    return { id: link.trim(), url: `https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${link.trim()}` };
  return null;
}

// ── Smart paste parser ────────────────────────────────────────────────────────

function parsePastedContent(raw: string): {
  detectedTitle: string;
  detectedAC: string;
  detectedEndpoints: string[];
  detectedBatches: string[];
  detectedFields: string[];
  detectedDependencies: string[];
  governanceFlags: string[];
} {
  const lines = raw.split("\n");

  // Title: first non-empty line or line after "Title:" / "Story:"
  let detectedTitle = "";
  for (const line of lines) {
    const t = line.replace(/^(title|story|user story|feature)[:\s]*/i, "").trim();
    if (t.length > 5 && t.length < 200) { detectedTitle = t; break; }
  }

  // Acceptance criteria block
  const acMatch = raw.match(/acceptance criteria[:\s\n]+([\s\S]{20,800}?)(?:\n\n|\n(?=[A-Z])|$)/i);
  const detectedAC = acMatch ? acMatch[1].trim() : "";

  // HTTP endpoints
  const endpointMatches = raw.match(/(?:GET|POST|PUT|PATCH|DELETE)\s+\/[a-zA-Z0-9/_\-{}?=&.]+/g) ?? [];
  const detectedEndpoints = Array.from(new Set(endpointMatches));

  // Batch references
  const batchMatches = raw.match(/\b[Bb]atch\s*\d+\b|\bB\d{1,2}\b|\bFC\b|\bB2A\b/g) ?? [];
  const detectedBatches = Array.from(new Set(batchMatches));

  // Payload fields (camelCase or snake_case identifiers in lists or JSON-like context)
  const fieldMatches = raw.match(/\b(?:entityId|clientGroupId|taxYear|tax_year|firmTaxonomyId|periodStart|periodEnd|lineageRef|contractVersion|decisionId|proposalId|accountCode|confidenceBand|decisionStatus|immutableHash|recordId|taxLineId)\b/g) ?? [];
  const detectedFields = Array.from(new Set(fieldMatches));

  // Dependencies (ADO story IDs, "depends on", "blocked by")
  const depMatches = raw.match(/(?:depends on|blocked by|requires|linked to)[^\n.]{0,80}/gi) ?? [];
  const storyRefs = raw.match(/#\d{5,8}/g) ?? [];
  const detectedDependencies = Array.from(new Set([...depMatches, ...storyRefs]));

  // Governance flags
  const governanceFlags: string[] = [];
  if (!/lineage/i.test(raw)) governanceFlags.push("No lineage reference detected");
  if (!/entityId|entity_id/i.test(raw)) governanceFlags.push("EntityId handling not mentioned");
  if (!/periodStart|periodEnd|period_start|period_end/i.test(raw)) governanceFlags.push("PeriodStart/End not referenced");
  if (/tax.?year/i.test(raw) && !/tax_year/i.test(raw)) governanceFlags.push("tax_year field inconsistency (camelCase vs snake_case)");
  if (!/firmTaxonomyId|firm_taxonomy/i.test(raw)) governanceFlags.push("FirmTaxonomyId not referenced");
  if (!/read contract|write contract|contract/i.test(raw)) governanceFlags.push("Read/Write contract distinction missing");
  if (!/additive.?only/i.test(raw)) governanceFlags.push("Additive-only constraint not addressed");
  if (!/error handling|exception|retry/i.test(raw)) governanceFlags.push("Error handling not specified");
  if (!/owner|ownership/i.test(raw)) governanceFlags.push("Ownership boundary not defined");

  return { detectedTitle, detectedAC, detectedEndpoints, detectedBatches, detectedFields, detectedDependencies, governanceFlags };
}

// ── System prompt builder ─────────────────────────────────────────────────────

function buildSystemPrompt(
  rogerDataPoints: RogerDataPointCtx[],
  swaggerEntries: SwaggerEntryCtx[],
  adoWorkItem: AdoWorkItem | null,
  pastedContent: string,
  pastedParsed: ReturnType<typeof parsePastedContent> | null
): string {
  const dpSummary = rogerDataPoints
    .map((d, i) =>
      `[DP${i + 1}] "${d.dataPoint}" | Source: ${d.source} | Batch: ${d.batch} | Availability: ${d.availability} | API: ${d.apiEndpoint} | Owner: ${d.owner} | Notes: ${d.notes} | ADO: ${d.adoStories.map(s => s.id ? `#${s.id} "${s.title}"` : s.title).join("; ")}`
    ).join("\n");

  const swaggerSummary = swaggerEntries
    .map(s => `[API] ${s.batch} | ${s.endpoint} | ${s.path} | Status: ${s.status} | ConsumerGuide: ${s.consumerGuide} | Notes: ${s.notes}`)
    .join("\n");

  const adoSection = adoWorkItem ? `

LOADED ADO STORY (Story #${adoWorkItem.id}):
Title: ${adoWorkItem.title}
State: ${adoWorkItem.state}
Assigned To: ${adoWorkItem.assignedTo || "Unassigned"}
Story Points: ${adoWorkItem.storyPoints || "Not estimated"}
Iteration: ${adoWorkItem.iterationPath}
Tags: ${adoWorkItem.tags || "None"}

Description:
${adoWorkItem.description || "(No description)"}

Acceptance Criteria:
${adoWorkItem.acceptanceCriteria || "(No acceptance criteria defined)"}` : "";

  const pasteSection = (pastedContent && pastedParsed) ? `

PASTED STORY CONTENT (user-provided):
${pastedContent.slice(0, 3000)}${pastedContent.length > 3000 ? "\n[...truncated]" : ""}

AUTO-DETECTED FROM PASTE:
- Title: ${pastedParsed.detectedTitle || "(not detected)"}
- Acceptance Criteria: ${pastedParsed.detectedAC || "(not detected)"}
- API Endpoints: ${pastedParsed.detectedEndpoints.join(", ") || "none"}
- Batch References: ${pastedParsed.detectedBatches.join(", ") || "none"}
- Payload Fields: ${pastedParsed.detectedFields.join(", ") || "none"}
- Dependencies: ${pastedParsed.detectedDependencies.join("; ") || "none"}
- Governance Flags: ${pastedParsed.governanceFlags.join("; ") || "none"}` : "";

  return `You are the DCT Platform Enterprise Governance Copilot — an AI integration analyst and dependency discovery engine embedded in the DCT Gate Verification Dashboard.

Your role is to help BAs, POs, DEVs, and QA teams:
- Identify which DCT API endpoints are needed for a given Roger UI user story
- Identify which batch delivers those endpoints and their current status
- Detect governance gaps (lineage, EntityId, tax_year, additive-only, contract ownership)
- Identify Roger ↔ DCT integration risks and blocking dependencies
- Generate structured summaries for BA, PO, DEV, and QA audiences
- Answer follow-up questions conversationally

PLATFORM CONTEXT:
- PDC = Phoenix Data Consolidation (financial data, ingestion, entity registry)
- TDC = Tax Data Consolidation (tax decisions, mapping, eligibility, sign-off)
- Roger = practitioner-facing UI — READ-ONLY, consumes via published Read Contracts
- Orchestrator = AI execution engine, coordinates PDC/TDC workflows
- Batches are delivered sequentially within a PI. Each batch requires 4 gate conditions:
  G1 Schema Lock → G2 Invariant Lock → G3 Contract Publication → G4 Lineage Closure
- Additive-Only contracts: fields may never be removed or renamed once published
- Read Contract ≠ Write Contract — Roger only consumes Read Contracts

ROGER DATA POINTS (live platform data):
${dpSummary}

SWAGGER / API ENTRIES (live platform data):
${swaggerSummary}
${adoSection}
${pasteSection}

RESPONSE RULES:
1. Ground every answer in the data above. If a data point or endpoint is not in the data, say so clearly.
2. Always state: batch, API endpoint path, current availability/status, and any known gaps.
3. Format responses with bold markdown headers (e.g. **API Endpoints**, **Batch**, **Gaps**).
4. For governance issues, use severity labels: [BLOCKING], [WARNING], [INFO].
5. For generated outputs (BA Summary, PO Summary, etc.), use structured sections with clear headers.
6. Never fabricate endpoint paths, batch numbers, or ADO IDs.
7. If a story has been loaded or pasted, use its content to give story-specific answers.
8. Keep answers concise but complete. Target 250–500 words for summaries, 150–300 for Q&A.`;
}

// ── Action prompt builders ────────────────────────────────────────────────────

function buildActionPrompt(actionId: ActionId, storyContext: string): string {
  const prompts: Record<ActionId, string> = {
    ba_summary: `Generate a structured BA Summary for this story/content.

Include:
**Story Overview** — 2-3 sentence summary of what this story delivers
**Platform Dependencies** — which systems (PDC, TDC, Roger, Orchestrator) are involved
**API Requirements** — list each API endpoint needed, with batch and status
**Governance Requirements** — lineage, contract type, additive-only, ownership
**Open Questions** — top 3 questions the BA should resolve before sprint start
**Acceptance Criteria Gaps** — any missing or ambiguous AC items
**Recommended Actions** — immediate next steps for the BA

${storyContext}`,

    po_summary: `Generate a PO-ready executive summary for this story/content.

Include:
**Business Value** — what value this delivers to practitioners/Roger users
**Delivery Risk** — Red/Amber/Green with one-line rationale
**Batch Alignment** — which batch(es) own this, current status
**Blocking Dependencies** — what must be resolved before this can ship
**Roger Readiness Impact** — how this affects Roger going live
**Recommended Decision** — what the PO needs to decide or approve
**Timeline Risk** — any PI or sprint risk

Keep it executive-level: concise, no technical jargon, decision-ready.

${storyContext}`,

    dev_questions: `Generate a list of DEV Clarification Questions for this story.

Organize by category:
**API Contract Questions** — endpoint paths, HTTP verbs, request/response schema
**Data Model Questions** — field names, types, nullability, validation rules
**Governance Questions** — lineage, immutability, additive-only compliance
**Integration Questions** — which system owns what, dependency sequencing
**Error Handling Questions** — retry logic, exception flows, rollback behavior
**Performance Questions** — pagination, rate limits, timeout expectations

Format each question as: "Q: [question] — Reason: [why this matters for delivery]"

${storyContext}`,

    qa_risks: `Generate a QA Risk Assessment for this story.

Include:
**High Risk Items** — [BLOCKING] items that could prevent QA sign-off
**Medium Risk Items** — [WARNING] items that need test coverage
**Low Risk Items** — [INFO] items to verify but unlikely to block
**Missing Test Scenarios** — AC gaps that need test cases written
**Integration Test Requirements** — cross-system flows to validate
**Governance Verification** — lineage, contract, and ownership checks needed
**Recommended QA Actions** — what QA should do before sprint start

${storyContext}`,

    integration_gaps: `Generate an Integration Gap Analysis for this story.

Include:
**Roger ↔ TDC Gaps** — missing or incomplete TDC API contracts
**Roger ↔ PDC Gaps** — missing or incomplete PDC API contracts
**Orchestrator Gaps** — any Orchestrator workflow dependencies not addressed
**Swagger Gaps** — endpoints referenced but missing from Swagger
**Contract Gaps** — Read/Write contract distinctions not defined
**Lineage Gaps** — lineage references missing or incomplete
**Ownership Gaps** — unclear system ownership boundaries
**Severity** — label each gap as [BLOCKING], [WARNING], or [INFO]

${storyContext}`,

    dependency_matrix: `Generate a Dependency Matrix for this story.

Format as a structured list:
**Upstream Dependencies** (what this story needs from other batches/systems):
- [Dependency] | Owner: [system] | Batch: [batch] | Status: [status] | Risk: [High/Med/Low]

**Downstream Dependencies** (what depends on this story):
- [Dependent feature] | Consumer: [system] | Impact if delayed: [description]

**Cross-Team Dependencies**:
- [Team] | Dependency type | Resolution needed by | Contact

**Blocking Dependencies** (must be resolved before this story can start):
- List each with ADO story ID if known

${storyContext}`,

    roger_impact: `Generate a Roger Impact Analysis for this story.

Include:
**Roger Screens Impacted** — which Roger UI screens depend on this story's APIs
**Data Points Affected** — which Roger Data Points (from the platform data) are impacted
**Availability Impact** — will this change the availability status of any data points?
**Consumer Guide Impact** — does this require consumer guide updates?
**Contract Impact** — does this affect any published Read Contracts?
**Additive-Only Risk** — does this story add, remove, or rename any fields?
**Roger Readiness Change** — will this move any data points from Not Available → Available?
**Practitioner Impact** — what will practitioners see/gain in Roger when this ships?

${storyContext}`,

    swagger_gaps: `Generate a Swagger Gap Report for this story.

Include:
**Missing Endpoints** — APIs referenced in the story but not in Swagger
**Incomplete Endpoints** — endpoints in Swagger but missing request/response schema
**Consumer Guide Gaps** — endpoints with no consumer guide entry
**Field-Level Gaps** — payload fields referenced in AC but not in Swagger schema
**Contract Version Gaps** — endpoints without a published contract version
**Additive-Only Violations** — any field removals or renames detected
**Recommended Actions** — what the DEV/Architect needs to add to Swagger

Format each gap as: [ENDPOINT] | Gap Type | Severity | Action Required

${storyContext}`,

    missing_ac: `Generate Missing Acceptance Criteria Suggestions for this story.

Analyze the story content and identify:
**Missing Functional AC** — business behavior not covered by existing AC
**Missing API AC** — endpoint behavior, status codes, error responses not specified
**Missing Governance AC** — lineage, contract, ownership, additive-only not addressed
**Missing Data AC** — field validation, nullability, format rules not specified
**Missing Integration AC** — cross-system behavior not tested
**Missing Error AC** — exception flows, retry, rollback not specified
**Missing Performance AC** — pagination, timeout, rate limit not addressed

For each missing item, provide:
"MISSING: [what is missing] — Suggested AC: Given [context], when [action], then [expected outcome]"

${storyContext}`,
  };
  return prompts[actionId] ?? `Analyze this story for ${actionId}.`;
}

// ── ADO comment formatter ─────────────────────────────────────────────────────

function formatAsAdoComment(answer: string, question: string, adoWorkItem: AdoWorkItem | null, adoId: string | null, timestamp: string): string {
  const storyRef = adoWorkItem ? `Story #${adoWorkItem.id}: ${adoWorkItem.title}` : adoId ? `Story #${adoId}` : "DCT Platform";
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `=== DCT Platform Governance Copilot — ${date} ===

Reference: ${storyRef}
Analysis Type: ${question}

--- Platform Analysis ---
${answer}

--- Source ---
Generated by DCT Gate Verification Dashboard · BA Assistant (Governance Copilot)
Grounded on live ROGER_DATA_POINTS and SWAGGER_ENTRIES
Timestamp: ${timestamp}
`;
}

// ── Component ─────────────────────────────────────────────────────────────────

// Check if the Forge API key is available at runtime
const FORGE_KEY_AVAILABLE = !!(import.meta.env.VITE_FRONTEND_FORGE_API_KEY);

export function BAAssistant({ rogerDataPoints, swaggerEntries }: BAAssistantProps) {
  const { ask, loading, error } = useLLM();
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<InputTab>("ado");

  // ADO tab state
  const [adoLink, setAdoLink] = useState("");
  const [adoFetchStatus, setAdoFetchStatus] = useState<AdoFetchStatus>("idle");
  const [adoWorkItem, setAdoWorkItem] = useState<AdoWorkItem | null>(null);
  const [adoFetchError, setAdoFetchError] = useState("");
  const [lastFetchedId, setLastFetchedId] = useState("");

  // Paste tab state
  const [pastedContent, setPastedContent] = useState("");
  const [pastedParsed, setPastedParsed] = useState<ReturnType<typeof parsePastedContent> | null>(null);
  const [pasteAnalyzed, setPasteAnalyzed] = useState(false);

  // Chat state
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [copiedState, setCopiedState] = useState<{ idx: number; action: CopyAction } | null>(null);
  const [gapReportLoading, setGapReportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionId | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (history.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const parsedAdo = parseAdoLink(adoLink);

  // Auto-fetch ADO story on link input
  useEffect(() => {
    if (!parsedAdo) {
      if (adoWorkItem) { setAdoWorkItem(null); setAdoFetchStatus("idle"); setAdoFetchError(""); setLastFetchedId(""); }
      return;
    }
    if (parsedAdo.id === lastFetchedId) return;
    const timer = setTimeout(async () => {
      setAdoFetchStatus("loading");
      setAdoFetchError("");
      try {
        const item = await fetchAdoWorkItem(parsedAdo.id);
        setAdoWorkItem(item);
        setAdoFetchStatus("success");
        setLastFetchedId(parsedAdo.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "AUTH_REQUIRED") {
          setAdoFetchStatus("auth_required");
          setAdoFetchError("ADO returned 401 — the project requires authentication. The assistant will still cross-reference Story #" + parsedAdo.id + " in platform data. Tip: switch to Paste Story tab and paste the story content directly.");
        } else {
          setAdoFetchStatus("error");
          setAdoFetchError(`Could not fetch story: ${msg}. Story ID will still be used to cross-reference platform data.`);
        }
        setLastFetchedId(parsedAdo.id);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [parsedAdo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Analyze pasted content
  const analyzePaste = () => {
    if (!pastedContent.trim()) return;
    const parsed = parsePastedContent(pastedContent);
    setPastedParsed(parsed);
    setPasteAnalyzed(true);
  };

  const systemPrompt = buildSystemPrompt(
    rogerDataPoints, swaggerEntries, adoWorkItem,
    pasteAnalyzed ? pastedContent : "",
    pasteAnalyzed ? pastedParsed : null
  );

  const buildMessages = useCallback((q: string): LLMMessage[] => {
    const msgs: LLMMessage[] = [{ role: "system", content: systemPrompt }];
    const recent = history.slice(-6);
    for (const h of recent) msgs.push({ role: h.role, content: h.content });
    msgs.push({ role: "user", content: q });
    return msgs;
  }, [systemPrompt, history]);

  const addAssistantMessage = (content: string, question?: string, isGapReport?: boolean, actionType?: string) => {
    setHistory(h => [...h, {
      role: "assistant", content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      question, isGapReport, actionType,
    }]);
  };

  // ── Local Answer Engine — answers questions directly from platform data without LLM ──
  const localAnswerEngine = useCallback((q: string): string | null => {
    const ql = q.toLowerCase();

    // Helper: find matching data points by keyword
    const matchDPs = rogerDataPoints.filter(d =>
      ql.includes(d.dataPoint.toLowerCase().slice(0, 12)) ||
      d.dataPoint.toLowerCase().split(/\s+/).some(w => w.length > 4 && ql.includes(w)) ||
      (ql.includes(d.source.toLowerCase())) ||
      (ql.includes(d.batch.toLowerCase()))
    );

    // Helper: find matching swagger entries
    const matchAPIs = swaggerEntries.filter(s =>
      ql.includes(s.endpoint.toLowerCase().slice(0, 12)) ||
      s.endpoint.toLowerCase().split(/\s+/).some(w => w.length > 4 && ql.includes(w)) ||
      ql.includes(s.path.toLowerCase().slice(0, 20)) ||
      ql.includes(s.batch.toLowerCase())
    );

    // Q: What APIs does DCT need for [story/data point]?
    if ((ql.includes("api") || ql.includes("endpoint") || ql.includes("provide")) && matchDPs.length > 0) {
      const lines = matchDPs.map(d => {
        const apis = swaggerEntries.filter(s => s.batch === d.batch || s.endpoint.toLowerCase().includes(d.dataPoint.toLowerCase().slice(0, 8)));
        const apiList = apis.length > 0
          ? apis.map(a => `  • \`${a.path}\` — ${a.endpoint} (${a.status})`).join("\n")
          : `  • \`${d.apiEndpoint}\` (from Roger data point mapping)`;
        return `**${d.dataPoint}**\n**Batch:** ${d.batch} | **Source:** ${d.source} | **Availability:** ${d.availability}\n**API Endpoints:**\n${apiList}\n**Owner:** ${d.owner}\n**Notes:** ${d.notes}`;
      });
      return `**API Endpoints Required — pulled from Control Panel data**\n\n${lines.join("\n\n---\n\n")}`;
    }

    // Q: What batch delivers [data point]?
    if ((ql.includes("batch") || ql.includes("deliver") || ql.includes("which batch")) && matchDPs.length > 0) {
      const lines = matchDPs.map(d =>
        `**${d.dataPoint}** → **${d.batch}** (${d.source}) — Status: ${d.availability}\nAPI: \`${d.apiEndpoint}\`\nOwner: ${d.owner}`
      );
      return `**Batch Delivery Mapping — from Control Panel**\n\n${lines.join("\n\n")}`;
    }

    // Q: What is the availability / status of [data point]?
    if ((ql.includes("availab") || ql.includes("status") || ql.includes("ready") || ql.includes("live")) && matchDPs.length > 0) {
      const lines = matchDPs.map(d => {
        const adoIds = d.adoStories.filter(s => s.id).map(s => `#${s.id} "${s.title}"`).join(", ") || "None";
        return `**${d.dataPoint}**\nStatus: **${d.availability}** | Batch: ${d.batch} | Source: ${d.source}\nADO Stories: ${adoIds}\nNotes: ${d.notes}`;
      });
      return `**Availability Status — from Control Panel**\n\n${lines.join("\n\n")}`;
    }

    // Q: What are the gaps / what is blocking?
    if (ql.includes("gap") || ql.includes("block") || ql.includes("missing") || ql.includes("not available") || ql.includes("not yet")) {
      const gaps = rogerDataPoints.filter(d => d.availability !== "Available");
      if (gaps.length === 0) return "**No Gaps Found** — all Roger data points show Available status in the Control Panel.";
      const lines = gaps.map(d => {
        const adoIds = d.adoStories.filter(s => s.id).map(s => `#${s.id}`).join(", ") || "—";
        return `• **${d.dataPoint}** | ${d.batch} | ${d.availability} | Owner: ${d.owner} | ADO: ${adoIds}\n  _${d.notes}_`;
      });
      return `**Platform Gaps — ${gaps.length} data point(s) not yet Available**\n\n${lines.join("\n\n")}\n\n_Source: Roger UI Data Availability table, Control Panel_`;
    }

    // Q: Show all data points / list all APIs
    if (ql.includes("all data point") || ql.includes("list all") || ql.includes("show all") || ql.includes("full list")) {
      const lines = rogerDataPoints.map(d =>
        `• **${d.dataPoint}** | ${d.batch} | ${d.availability} | \`${d.apiEndpoint}\``
      );
      return `**All Roger UI Data Points (${rogerDataPoints.length} total)**\n\n${lines.join("\n")}\n\n_Source: Control Panel — Roger UI Data Availability_`;
    }

    // Q: What APIs are in [batch]?
    const batchMatch = ql.match(/batch\s*(\w+\d+|\d+|fc|b\d+)/i);
    if (batchMatch) {
      const bkey = batchMatch[1].toLowerCase();
      const batchAPIs = swaggerEntries.filter(s => s.batch.toLowerCase().includes(bkey));
      const batchDPs = rogerDataPoints.filter(d => d.batch.toLowerCase().includes(bkey));
      if (batchAPIs.length > 0 || batchDPs.length > 0) {
        const apiLines = batchAPIs.map(a => `  • \`${a.path}\` — ${a.endpoint} (${a.status})`).join("\n") || "  None found";
        const dpLines = batchDPs.map(d => `  • ${d.dataPoint} — ${d.availability}`).join("\n") || "  None found";
        return `**Batch ${batchMatch[1].toUpperCase()} — API & Data Point Summary**\n\n**API Endpoints (${batchAPIs.length}):**\n${apiLines}\n\n**Roger Data Points (${batchDPs.length}):**\n${dpLines}\n\n_Source: Control Panel_`;
      }
    }

    // Q: What fields does [endpoint/data point] return?
    if ((ql.includes("field") || ql.includes("payload") || ql.includes("return") || ql.includes("response")) && matchDPs.length > 0) {
      const lines = matchDPs.map(d => {
        const fields = (d as RogerDataPointCtx & { fieldsDelivered?: string[] }).fieldsDelivered;
        const fieldList = fields && fields.length > 0 ? fields.map(f => `  • \`${f}\``).join("\n") : `  (Field details not available — see Control Panel table)`;
        return `**${d.dataPoint}** (${d.batch})\n**API:** \`${d.apiEndpoint}\`\n**Fields:**\n${fieldList}`;
      });
      return `**Payload Fields — from Control Panel**\n\n${lines.join("\n\n")}`;
    }

    return null; // No local match — fall through to LLM
  }, [rogerDataPoints, swaggerEntries]);

  // Detect 401 / API key errors and return a user-friendly fallback message
  const is401 = (e: unknown): boolean => {
    const msg = e instanceof Error ? e.message : String(e);
    return msg.includes("401") || msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("auth");
  };

  const apiKeyFallback = (
    `🔑 **AI Assistant Unavailable — API Key Required**

The assistant cannot connect to the AI service right now. This is a browser-side API key limitation — the key used by this static app is not authorised in the current environment.

**What you can still do:**
• Switch to the **Paste Story** tab (top of this panel) and paste your story text, acceptance criteria, or API contract content directly — the smart parser will extract endpoints, fields, governance flags, and batch references automatically, and all 9 Generated Output buttons will work once content is loaded.
• Use the **Generated Outputs** buttons after pasting content — BA Summary, PO Summary, DEV Questions, QA Risks, Integration Gaps, Dependency Matrix, Roger Impact, Swagger Gap Report, and Missing AC are all available.
• The **Gap Report** button will also work once content is pasted.

**To restore full AI chat:** The project can be upgraded to a full-stack deployment where the API key is held securely on the backend. Ask your Manus administrator to enable the backend upgrade.`
  );

  const submit = async (q: string) => {
    if (!q.trim() || loading) return;
    setHistory(h => [...h, { role: "user", content: q.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setQuestion("");

    // Try local engine first — answers from Control Panel data, no API needed
    const localAnswer = localAnswerEngine(q.trim());
    if (localAnswer) {
      addAssistantMessage(localAnswer + "\n\n_📊 Answer sourced from Control Panel platform data — no AI API required._", q.trim());
      return;
    }

    // Fall back to LLM for complex / open-ended questions
    try {
      const answer = await ask(buildMessages(q.trim()));
      addAssistantMessage(answer, q.trim());
    } catch (e) {
      addAssistantMessage(is401(e) ? apiKeyFallback : "⚠️ The assistant encountered an error. Please try again.");
    }
  };

  const runAction = async (actionId: ActionId) => {
    if (actionLoading || loading) return;
    setActionLoading(actionId);
    const storyContext = adoWorkItem
      ? `Story context: #${adoWorkItem.id} "${adoWorkItem.title}"`
      : pasteAnalyzed && pastedParsed?.detectedTitle
        ? `Story context: "${pastedParsed.detectedTitle}" (pasted content)`
        : "No specific story loaded — analyze based on platform data.";
    const actionLabel = ACTION_BUTTONS.find(a => a.id === actionId)?.label ?? actionId;
    setHistory(h => [...h, { role: "user", content: `🔧 Generate ${actionLabel}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    try {
      const prompt = buildActionPrompt(actionId, storyContext);
      const msgs: LLMMessage[] = [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }];
      const answer = await ask(msgs);
      addAssistantMessage(answer, actionLabel, false, actionId);
    } catch (e) {
      addAssistantMessage(is401(e) ? apiKeyFallback : "⚠️ Generation failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const runGapReport = async () => {
    if (gapReportLoading || loading) return;
    setGapReportLoading(true);
    const gaps = rogerDataPoints.filter(d => d.availability !== "Available");
    const gapLines = gaps.map(d =>
      `- "${d.dataPoint}" | Batch: ${d.batch} | Status: ${d.availability} | Owner: ${d.owner} | ADO: ${d.adoStories.map(s => s.id ? `#${s.id}` : "—").join(", ")} | Notes: ${d.notes}`
    ).join("\n");
    setHistory(h => [...h, { role: "user", content: "📊 Generate Gap Report — all non-Available data points", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    try {
      const prompt = `Generate a copy-ready Gap Report for the PO (Stephane) summarizing all Roger UI data points that are NOT yet Available.\n\nNON-AVAILABLE DATA POINTS (${gaps.length} total):\n${gapLines}\n\nFORMAT: Executive summary paragraph → pipe-delimited table (Data Point | Batch | Status | Owner | Blocking ADO Stories | Action Required) → Priority Actions (top 3) → Next Steps line for Teams/email. No markdown code blocks. Professional and concise. Do NOT fabricate data.`;
      const msgs: LLMMessage[] = [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }];
      const answer = await ask(msgs);
      addAssistantMessage(answer, "Gap Report", true);
    } catch (e) {
      addAssistantMessage(is401(e) ? apiKeyFallback : "⚠️ Gap Report generation failed. Please try again.");
    } finally {
      setGapReportLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(question); }
  };

  const triggerCopy = (idx: number, action: CopyAction, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState({ idx, action });
      setTimeout(() => setCopiedState(null), 2500);
    });
  };

  const isCopied = (idx: number, action: CopyAction) => copiedState?.idx === idx && copiedState?.action === action;

  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const gapCount = rogerDataPoints.filter(d => d.availability !== "Available").length;
  const hasContext = !!(adoWorkItem || (pasteAnalyzed && pastedParsed));
  const isAnyLoading = loading || gapReportLoading || !!actionLoading;

  return (
    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#003865] to-[#1a5a8a] text-white hover:from-[#004a80] hover:to-[#1e6fa3] transition-all"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-200" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold flex items-center gap-2">
              BA Assistant
              <span className="text-xs font-normal bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Governance Copilot
              </span>
            </div>
            <div className="text-xs text-blue-300 font-normal">
              ADO Link · Paste Story · Governance Detection · 9 Generated Outputs · Roger ↔ DCT Alignment
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasContext && (
            <span className="text-xs text-emerald-300 bg-emerald-900/30 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" /> Story in context
            </span>
          )}
          {history.length > 0 && (
            <span className="text-xs text-blue-300 bg-blue-800/40 px-2 py-0.5 rounded-full">
              {Math.ceil(history.length / 2)} exchange{Math.ceil(history.length / 2) !== 1 ? "s" : ""}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-blue-300" /> : <ChevronDown className="w-4 h-4 text-blue-300" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">

          {/* ── API Key Warning Banner ── */}
          {!FORGE_KEY_AVAILABLE && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <div className="font-semibold">AI Chat Unavailable — API Key Not Found</div>
                <div>The AI assistant requires a backend API key that is not available in this static deployment. <span className="font-semibold">Use Paste Story Mode</span> below — paste your story text or acceptance criteria and use the 9 Generated Output buttons to get structured BA, PO, DEV, and QA outputs without needing the AI chat.</div>
              </div>
            </div>
          )}

          {/* ── Dual-Mode Tabs ── */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("ado")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === "ado" ? "bg-[#003865] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <Link2 className="w-3.5 h-3.5" />
              ADO Link Mode
              {adoWorkItem && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-l border-slate-200 ${activeTab === "paste" ? "bg-[#003865] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste Story Mode
              {pasteAnalyzed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>

          {/* ── TAB 1: ADO Link Mode ── */}
          {activeTab === "ado" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                  ADO Story Link or ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adoLink}
                    onChange={e => {
                      setAdoLink(e.target.value);
                      if (adoFetchStatus !== "idle") { setAdoFetchStatus("idle"); setAdoWorkItem(null); setAdoFetchError(""); setLastFetchedId(""); }
                    }}
                    placeholder="https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/1234567  or just the story ID"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 pr-28 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-mono bg-slate-50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {adoFetchStatus === "loading" && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                    {adoFetchStatus === "success" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    {(adoFetchStatus === "error" || adoFetchStatus === "auth_required") && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    {parsedAdo && (
                      <a href={parsedAdo.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                        onClick={e => e.stopPropagation()}>
                        #{parsedAdo.id} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {adoFetchStatus === "loading" && parsedAdo && (
                  <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                    Reading Story #{parsedAdo.id} from Azure DevOps…
                  </div>
                )}

                {adoFetchStatus === "success" && adoWorkItem && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-800">Story #{adoWorkItem.id} loaded</span>
                        <span className="text-xs text-emerald-600 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full">{adoWorkItem.state}</span>
                      </div>
                      <button onClick={() => { setAdoWorkItem(null); setAdoFetchStatus("idle"); setLastFetchedId(""); setAdoLink(""); }}
                        className="text-xs text-emerald-500 hover:text-emerald-700 transition-colors" title="Clear story">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">{adoWorkItem.title}</div>
                    {adoWorkItem.assignedTo && <div className="text-xs text-slate-500">Assigned to: {adoWorkItem.assignedTo}</div>}
                    {adoWorkItem.acceptanceCriteria && (
                      <div className="text-xs text-slate-600 bg-white border border-emerald-100 rounded px-2 py-1.5 leading-relaxed max-h-20 overflow-y-auto">
                        <span className="font-semibold text-slate-700">Acceptance Criteria: </span>
                        {adoWorkItem.acceptanceCriteria.slice(0, 300)}{adoWorkItem.acceptanceCriteria.length > 300 ? "…" : ""}
                      </div>
                    )}
                    <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Story content injected into AI context — all outputs will be grounded in this story
                    </div>
                  </div>
                )}

                {(adoFetchStatus === "auth_required" || adoFetchStatus === "error") && adoFetchError && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{adoFetchError}</span>
                    </div>
                    <button onClick={() => setActiveTab("paste")}
                      className="text-xs text-blue-700 font-semibold hover:underline pl-5">
                      → Switch to Paste Story tab to paste content manually
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: Paste Story Mode ── */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Paste Story Content
                  <span className="font-normal text-slate-400 normal-case tracking-normal">— story text, AC, Swagger snippets, API contracts, meeting notes</span>
                </label>
                <textarea
                  value={pastedContent}
                  onChange={e => { setPastedContent(e.target.value); if (pasteAnalyzed) { setPasteAnalyzed(false); setPastedParsed(null); } }}
                  rows={7}
                  placeholder={`Paste anything here:\n• ADO story text (title, description, acceptance criteria)\n• Swagger endpoint snippets\n• API payload examples\n• Dependency notes\n• Roger UI requirements\n• Meeting notes\n\nThe assistant will auto-detect endpoints, fields, batches, and governance gaps.`}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-mono bg-slate-50 leading-relaxed resize-y"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={analyzePaste}
                    disabled={!pastedContent.trim() || isAnyLoading}
                    className="flex items-center gap-1.5 text-xs font-bold bg-[#003865] text-white px-4 py-2 rounded-lg hover:bg-[#004a80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Search className="w-3.5 h-3.5" /> Analyze Content
                  </button>
                  {pastedContent.trim() && (
                    <button onClick={() => { setPastedContent(""); setPastedParsed(null); setPasteAnalyzed(false); }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">{pastedContent.length} chars</span>
                </div>
              </div>

              {/* Parsed results card */}
              {pasteAnalyzed && pastedParsed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-blue-800">Content analyzed — auto-detected findings</span>
                  </div>
                  {pastedParsed.detectedTitle && (
                    <div className="text-xs"><span className="font-semibold text-slate-700">Title: </span><span className="text-slate-600">{pastedParsed.detectedTitle}</span></div>
                  )}
                  {pastedParsed.detectedEndpoints.length > 0 && (
                    <div className="text-xs"><span className="font-semibold text-slate-700">API Endpoints: </span>
                      <span className="font-mono text-blue-700">{pastedParsed.detectedEndpoints.join(" · ")}</span>
                    </div>
                  )}
                  {pastedParsed.detectedBatches.length > 0 && (
                    <div className="text-xs"><span className="font-semibold text-slate-700">Batch References: </span>
                      {pastedParsed.detectedBatches.map(b => (
                        <span key={b} className="inline-block mr-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{b}</span>
                      ))}
                    </div>
                  )}
                  {pastedParsed.detectedFields.length > 0 && (
                    <div className="text-xs"><span className="font-semibold text-slate-700">Payload Fields: </span>
                      <span className="font-mono text-slate-600">{pastedParsed.detectedFields.join(", ")}</span>
                    </div>
                  )}
                  {pastedParsed.governanceFlags.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Governance Flags ({pastedParsed.governanceFlags.length})
                      </div>
                      {pastedParsed.governanceFlags.map((flag, i) => (
                        <div key={i} className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" /> {flag}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Content injected into AI context — all outputs will be grounded in this analysis
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Gap Report Banner ── */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 gap-4">
            <div className="flex items-start gap-2.5">
              <FileWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-800">Platform Gap Report</div>
                <div className="text-xs text-amber-700 mt-0.5">
                  {gapCount} data point{gapCount !== 1 ? "s" : ""} not yet Available for Roger.
                  Generate a copy-ready PO summary with blocking ADO stories.
                </div>
              </div>
            </div>
            <button onClick={runGapReport} disabled={isAnyLoading}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-amber-600 text-white px-3.5 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
              {gapReportLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><ClipboardList className="w-3.5 h-3.5" /> Generate Gap Report</>}
            </button>
          </div>

          {/* ── 9 Action Buttons ── */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Generated Outputs
              {!hasContext && <span className="font-normal text-slate-400 normal-case tracking-normal">— load a story for story-specific outputs</span>}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ACTION_BUTTONS.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => runAction(btn.id)}
                  disabled={isAnyLoading}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${ACTION_COLOR_MAP[btn.color]}`}
                >
                  {actionLoading === btn.id ? <Loader2 className="w-3 h-3 animate-spin shrink-0" /> : btn.icon}
                  <span className="truncate">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Suggested Questions ── */}
          {history.length === 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested Questions</div>
              {hasContext && (
                <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-1.5">
                  Story context loaded — questions will be answered relative to the loaded story.
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => submit(q)} disabled={isAnyLoading}
                    className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-400 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Chat History ── */}
          {history.length > 0 && (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {history.map((msg, idx) => {
                const actionBtn = msg.actionType ? ACTION_BUTTONS.find(a => a.id === msg.actionType) : null;
                return (
                  <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      msg.role === "user" ? "bg-[#003865] text-white"
                        : msg.isGapReport ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                        : actionBtn ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                    }`}>
                      {msg.role === "user" ? "BA" : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`flex-1 max-w-[87%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Action type label */}
                      {msg.role === "assistant" && (msg.isGapReport || actionBtn) && (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 self-start border ${
                          msg.isGapReport ? "text-amber-700 bg-amber-50 border-amber-200"
                            : "text-indigo-700 bg-indigo-50 border-indigo-200"
                        }`}>
                          {msg.isGapReport ? <FileWarning className="w-3 h-3" /> : actionBtn?.icon}
                          {msg.isGapReport ? "Gap Report" : actionBtn?.label}
                        </div>
                      )}

                      <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user" ? "bg-[#003865] text-white rounded-tr-sm"
                          : msg.isGapReport ? "bg-amber-50 border border-amber-200 text-slate-700 rounded-tl-sm"
                          : actionBtn ? "bg-indigo-50 border border-indigo-200 text-slate-700 rounded-tl-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm"
                      }`}>
                        {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                      </div>

                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">{msg.timestamp}</span>
                          <button onClick={() => triggerCopy(idx, "copy", msg.content)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors" title="Copy">
                            {isCopied(idx, "copy")
                              ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></>
                              : <><Copy className="w-3 h-3" /><span>Copy</span></>}
                          </button>
                          <button
                            onClick={() => triggerCopy(idx, "ado", formatAsAdoComment(msg.content, msg.question ?? (msg.isGapReport ? "Gap Report" : msg.actionType ?? "BA Assistant Query"), adoWorkItem, parsedAdo?.id ?? null, msg.timestamp))}
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${isCopied(idx, "ado") ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400"}`}
                            title="Format as ADO comment and copy">
                            {isCopied(idx, "ado") ? <><Check className="w-3 h-3" /> Saved to ADO</> : <><ClipboardList className="w-3 h-3" /> Save to ADO</>}
                          </button>
                          {(msg.isGapReport || actionBtn) && (
                            <button onClick={() => triggerCopy(idx, "gap", msg.content)}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${isCopied(idx, "gap") ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400"}`}
                              title="Copy for email / Teams">
                              {isCopied(idx, "gap") ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy for email</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAnyLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-500">
                      {gapReportLoading ? "Building gap report…" : actionLoading ? `Generating ${ACTION_BUTTONS.find(a => a.id === actionLoading)?.label}…` : "Analyzing platform data…"}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Chat Input ── */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder={
                  hasContext
                    ? "Ask about this story: APIs needed, batch alignment, governance gaps, Roger impact, missing AC… (Enter to send)"
                    : "Ask about API endpoints, batches, governance, Roger integration, ADO stories… (Enter to send, Shift+Enter for new line)"
                }
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none bg-slate-50 leading-relaxed"
                disabled={isAnyLoading}
              />
              <button onClick={() => submit(question)} disabled={isAnyLoading || !question.trim()}
                className="absolute right-3 bottom-3 w-7 h-7 rounded-lg bg-[#003865] text-white flex items-center justify-center hover:bg-[#004a80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {hasContext && <span className="text-emerald-600 font-medium">📖 Story in context · </span>}
                {rogerDataPoints.length} data points · {swaggerEntries.length} APIs · {gapCount} gaps
              </div>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Clear chat
                </button>
              )}
            </div>
          </div>

          {/* ── Follow-up chips ── */}
          {history.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up questions</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 5).map((q, i) => (
                  <button key={i} onClick={() => submit(q)} disabled={isAnyLoading}
                    className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-50">
                    {q.length > 55 ? q.slice(0, 52) + "…" : q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

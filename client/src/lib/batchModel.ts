/**
 * DCT Platform — Centralized Batch Model
 * Source of Truth: DCT Batch Roadmap v2.1 (April 28, 2026)
 *
 * ALL screens must read from this model.
 * NO hardcoded batch lists anywhere else in the codebase.
 *
 * Status values: "Complete" | "Dev" | "Review" | "Planned"
 * Area values:   "PDC" | "TDC" | "Platform" | "PDC+TDC"
 * PI values:     "PI1" | "PI2" | "PI3" | "PI4" | "Parallel"
 */

export type BatchStatus = "Complete" | "Dev" | "Review" | "Planned" | "Active";
export type BatchArea = "PDC" | "TDC" | "Platform" | "PDC+TDC";
export type BatchPI = "PI1" | "PI2" | "PI3" | "PI4" | "Parallel";

export interface BatchEntry {
  id: string;           // "FC", "B1", "B2", "B2A", "B3" … "B23", "MT"
  name: string;         // Short display name
  fullName: string;     // Full descriptive name from roadmap
  pi: BatchPI;
  piLabel: string;      // Human-readable PI label
  status: BatchStatus;
  area: BatchArea;
  storyCount: number;
  description: string;  // One-sentence summary
  dependencies: string[]; // Array of batch IDs this batch depends on
  keyOutcomes: string[];  // 2-3 key demo outcomes
  piCommitment?: "Committed" | "Stretch" | "Draft"; // PI 2+ commitment level
}

// ─── MASTER BATCH REGISTRY ────────────────────────────────────────────────────
// Single source of truth. All pages derive their data from this array.

const BATCH_REGISTRY: BatchEntry[] = [
  {
    id: "FC",
    name: "Foundation Core",
    fullName: "Foundation Core",
    pi: "PI1",
    piLabel: "PI 1 — Foundation & AI Mapping",
    status: "Complete",
    area: "Platform",
    storyCount: 0,
    description: "Platform scaffolding, schema lock, contract publication, and lineage anchor establishment.",
    dependencies: [],
    keyOutcomes: [
      "Schema Lock enforced across all systems",
      "Invariant Lock established",
      "Contract Publication complete",
    ],
  },
  {
    id: "B1",
    name: "File Ingestion & Storage",
    fullName: "File Ingestion & Initial Storage",
    pi: "PI1",
    piLabel: "PI 1 — Foundation & AI Mapping",
    status: "Complete",
    area: "PDC",
    storyCount: 2,
    description: "Ingest file events, persist to PDC, and expose ingestion status API.",
    dependencies: ["FC"],
    keyOutcomes: [
      "File ingestion status API live",
      "DocumentId and lineage anchor persisted",
      "JobId, State visible to Roger",
    ],
  },
  {
    id: "B2",
    name: "Normalization & Taxonomy",
    fullName: "Normalization & Cross-LOB Taxonomy",
    pi: "PI1",
    piLabel: "PI 1 — Foundation & AI Mapping",
    status: "Complete",
    area: "PDC",
    storyCount: 5,
    description: "File schemas, FirmTaxonomy, MDM, EDGAR corpus, normalized TB contract for Roger.",
    dependencies: ["B1"],
    keyOutcomes: [
      "Normalized Trial Balance contract live for Roger",
      "File Schemas and FirmFinancialTaxonomy reference data governed",
      "EDGAR corpus loaded and versioned",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B2A",
    name: "Orchestrator Contract Enforcement",
    fullName: "Orchestrator Contract Enforcement",
    pi: "PI1",
    piLabel: "PI 1 — Foundation & AI Mapping",
    status: "Complete",
    area: "Platform",
    storyCount: 2,
    description: "Enforce FirmTaxonomyId classification presence on all normalized records; bulk insert strategy.",
    dependencies: ["B2"],
    keyOutcomes: [
      "FirmTaxonomyId required on every FinancialFact",
      "READY signal blocked if any record is UNCLASSIFIED",
      "Bulk insert strategy enforced",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B3",
    name: "Tax Domain Authority",
    fullName: "Tax Domain Authority & Taxonomy",
    pi: "PI1",
    piLabel: "PI 1 — Foundation & AI Mapping",
    status: "Complete",
    area: "TDC",
    storyCount: 3,
    description: "Tax forms, templates, MDM tax forms, and Orchestrator read contract.",
    dependencies: ["B2"],
    keyOutcomes: [
      "Tax form templates and mapping rules live",
      "Orchestrator read contract published",
      "MDM tax forms governed",
    ],
  },
  {
    id: "B4",
    name: "AI Tax Mapping & Explainability",
    fullName: "AI Tax Mapping & Explainability",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Complete",
    area: "TDC",
    storyCount: 4,
    description: "AI mapping proposals, mapping decisions, decision audit records, and TDC Records API for Roger.",
    dependencies: ["B3"],
    keyOutcomes: [
      "Every account has a mapping proposal with confidence score",
      "Practitioners can accept / override / reject — decisions immutable",
      "Roger displays GREEN/YELLOW/RED distribution",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B5",
    name: "Entity Identity & Structure",
    fullName: "Entity Identity & Structure",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Complete",
    area: "PDC",
    storyCount: 5,
    description: "PDC as authoritative entity registry — client groups, legal entities, EntityId, CEM integration.",
    dependencies: ["B1"],
    keyOutcomes: [
      "Client group with multiple legal entities persisted in PDC",
      "EntityId consistently used across ingestion, processing, and consumption",
      "CEM client and legal entity data synced and versioned",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B6",
    name: "Practitioner Review & Lock",
    fullName: "Practitioner Review, Adjustments & Lock",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Complete",
    area: "PDC+TDC",
    storyCount: 4,
    description: "Review tasks, book-to-tax adjustments, tax-ready record derivation, sign-off and lock.",
    dependencies: ["B4"],
    keyOutcomes: [
      "Review tasks generated automatically from data state",
      "Tax-ready records derived deterministically from accepted decisions",
      "Sign-off includes SHA-256 hash over the signed dataset",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B7",
    name: "Client Tax Profile & Eligibility",
    fullName: "Client Tax Profile & Eligibility",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Complete",
    area: "TDC",
    storyCount: 6,
    description: "TDC as SOR for tax profile and eligibility — three-tier model, controlled group determination.",
    dependencies: ["B6"],
    keyOutcomes: [
      "Eligibility rules executed and visible (Must Have / Must Not Have / Flag & Review)",
      "Controlled group and affiliated group status derived",
      "Entities in FLAG_AND_REVIEW blocked from downstream workflow",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B8",
    name: "Exceptions & Remediation",
    fullName: "Exceptions & Remediation",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Active",
    area: "PDC+TDC",
    storyCount: 8,
    description: "Structured exception tracking across ingestion, normalization, mapping, and workflow.",
    dependencies: ["B7"],
    keyOutcomes: [
      "Exceptions visible with full context (entity, record, source)",
      "Practitioners can view, assign, and update exception status",
      "End-to-end traceability: Source → Exception → Resolution → Final outcome",
    ],
    piCommitment: "Committed",
  },
  {
    id: "B9",
    name: "Rollforward & Prior Year Intelligence",
    fullName: "Rollforward & Prior Year Intelligence",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Planned",
    area: "PDC+TDC",
    storyCount: 5,
    description: "IMS integration, prior year reference data, rollforward proposals with confidence scoring.",
    dependencies: ["B5", "B6"],
    keyOutcomes: [
      "IMS sync triggered for entity / year / return type",
      "Rollforward proposals with EXACT / APPROXIMATE / NO_MATCH confidence scoring",
      "Roger consuming rollforward proposals and prior year context",
    ],
    piCommitment: "Stretch",
  },
  {
    id: "B10",
    name: "Return Assembly & Lineage Closure",
    fullName: "Return Assembly, Filing & Lineage Closure",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Planned",
    area: "TDC",
    storyCount: 5,
    description: "Return assembly, cross-schedule validation, filing record, IMS outbound, end-to-end lineage.",
    dependencies: ["B6"],
    keyOutcomes: [
      "Return assembled from locked tax-ready records",
      "Filing record immutable — FILED status assigned at creation",
      "Lineage trace: click from return → tax record → source document",
    ],
    piCommitment: "Stretch",
  },
  {
    id: "B11",
    name: "Learning Governance & Model Evolution",
    fullName: "Learning Governance & Model Evolution",
    pi: "PI2",
    piLabel: "PI 2 — Entity, Workflow & Tax Ready",
    status: "Planned",
    area: "TDC",
    storyCount: 2,
    description: "AI feedback loop — learning signal capture, model promotion governance, rollback.",
    dependencies: ["B4", "B6"],
    keyOutcomes: [
      "Practitioner decisions captured as structured feedback signals",
      "Model version updates require explicit sign-off before activation",
      "Confidence trend report shows override rate by model version",
    ],
    piCommitment: "Stretch",
  },
  {
    id: "B12",
    name: "TIM Integration & Engagement Ops",
    fullName: "TIM Integration & Engagement Operations",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "PDC",
    storyCount: 5,
    description: "PDC syncs engagement data from TIM — project, phase, deliverable, task, identity reconciliation.",
    dependencies: ["B5"],
    keyOutcomes: [
      "Engagement Operations read contract live — Roger retrieves engagement status from PDC",
      "TIM IDs reconciled to PDC canonical EntityId and ClientGroupId",
      "Roger never calls TIM directly",
    ],
  },
  {
    id: "B13",
    name: "Platform Reference & Document Provenance",
    fullName: "Platform Reference & Document Provenance",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "PDC",
    storyCount: 4,
    description: "Industry codes, currency codes, regulatory calendar, document provenance and tamper-evidence.",
    dependencies: ["B12"],
    keyOutcomes: [
      "Regulatory filing deadlines and extension rules available for any jurisdiction",
      "Document provenance records show file identity, hash, and version history",
      "Roger displays deadline-aware workflow context",
    ],
  },
  {
    id: "B14",
    name: "Tax Computation Rules & Formula Gov.",
    fullName: "Tax Computation Rules & Formula Governance",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "TDC",
    storyCount: 6,
    description: "Versioned computation rules, limitation rules, rate tables, reconciliation formulas, audit records.",
    dependencies: ["B13"],
    keyOutcomes: [
      "All depreciation methods (MACRS, Straight-Line, Bonus) queryable by tax year",
      "Reconciliation formulas (M-1, M-3, Schedule L) governed in TDC",
      "Computation audit record traceable to rule version, entity, and tax year",
    ],
  },
  {
    id: "B15",
    name: "Tax Provision Reference & ASC 740",
    fullName: "Tax Provision Reference Data & ASC 740 Authority",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "TDC",
    storyCount: 8,
    description: "ASC 740 reference layer — current tax expense rules, deferred tax, ETR reconciliation, UTP.",
    dependencies: ["B14"],
    keyOutcomes: [
      "ASC 740 current tax expense rules queryable by jurisdiction and tax year",
      "Provision applicability reference data loaded — C-corp vs pass-through governed",
      "Tax Provision Reference Data read contract live for Orchestrator and Batch 18",
    ],
  },
  {
    id: "B16",
    name: "Audit Trail & Lineage Governance",
    fullName: "Audit Trail & Lineage Governance",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "PDC+TDC",
    storyCount: 6,
    description: "Complete event log — TDC and PDC lineage event schemas, retention rules, audit contracts.",
    dependencies: ["B13"],
    keyOutcomes: [
      "Complete event log for TDC defined and queryable",
      "PDC platform-wide lineage event schema covers ingestion, normalization, and entity sync",
      "Roger and compliance teams can retrieve full audit trail for any engagement",
    ],
  },
  {
    id: "B17",
    name: "Decision Support — Overrides & Workpapers",
    fullName: "Decision Support — Overrides, Evidence & Workpapers",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "TDC",
    storyCount: 6,
    description: "Override policies, evidence records, workpaper lock and snapshot pinning, schedule templates.",
    dependencies: ["B16"],
    keyOutcomes: [
      "Override policies queryable and versioned",
      "Workpapers locked and pinned to exact data snapshot at lock time",
      "Schedule templates for depreciation, amortization, and M-1/M-3 available in Roger",
    ],
  },
  {
    id: "B18",
    name: "Provision Computation, DTA/DTL & ETR",
    fullName: "Provision Computation, DTA/DTL & ETR Reconciliation",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "TDC",
    storyCount: 8,
    description: "Provision computation engine — current tax expense, deferred tax, DTA/DTL, ETR reconciliation.",
    dependencies: ["B14", "B15"],
    keyOutcomes: [
      "Current tax expense computed deterministically from locked book-basis data",
      "DTA/DTL balances tracked with valuation allowances",
      "Consolidated provision computed for affiliated groups",
    ],
  },
  {
    id: "B19",
    name: "Provision Workflow, Sign-Off & Cross-LOB",
    fullName: "Provision Workflow, Sign-Off & Cross-LOB Output",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "TDC",
    storyCount: 6,
    description: "Provision review, adjustments, sign-off, lock, prior year DTA/DTL rollforward, Audit LOB output.",
    dependencies: ["B17", "B18"],
    keyOutcomes: [
      "Provision sign-off independent of return sign-off — aligned to financial reporting period",
      "Audit LOB consumes locked book tax expense via governed outbound contract",
      "Roger surfaces complete provision workflow: proposals, ETR reconciliation, UTPs",
    ],
  },
  {
    id: "B20",
    name: "Firm Governance & Professional Standards",
    fullName: "Firm Governance & Professional Standards",
    pi: "PI4",
    piLabel: "PI 4 — Governance, QC & Analytics",
    status: "Planned",
    area: "PDC",
    storyCount: 5,
    description: "Engagement acceptance, AML/sanctions, independence rules, consent, CPA license, signing authority.",
    dependencies: ["B17"],
    keyOutcomes: [
      "Engagement acceptance criteria queryable — new engagements gated",
      "CPA license status and signing authority data available",
      "No sign-off proceeds without firm governance requirements being met",
    ],
  },
  {
    id: "B21",
    name: "Quality Control",
    fullName: "Quality Control",
    pi: "PI4",
    piLabel: "PI 4 — Governance, QC & Analytics",
    status: "Planned",
    area: "PDC+TDC",
    storyCount: 6,
    description: "QC review requirements, concurring partner standards, independence confirmation, QC contracts.",
    dependencies: ["B19", "B20"],
    keyOutcomes: [
      "QC review assignment and lifecycle tracked for return and provision engagements",
      "Independence confirmation standards applied to all engagements requiring concurring review",
      "No engagement closes without QC requirements being satisfied",
    ],
  },
  {
    id: "B22",
    name: "Client Communication & Outstanding Items",
    fullName: "Client Communication & Outstanding Items",
    pi: "PI4",
    piLabel: "PI 4 — Governance, QC & Analytics",
    status: "Planned",
    area: "PDC",
    storyCount: 3,
    description: "Client communication tracking, information request lifecycle, outstanding item aging.",
    dependencies: ["B21"],
    keyOutcomes: [
      "Outstanding item lifecycle tracked: REQUESTED → RECEIVED → CLOSED",
      "Aging of outstanding items visible — overdue items surfaced",
      "Client Communication read contract extends Engagement Operations from Batch 12",
    ],
  },
  {
    id: "B23",
    name: "Benchmark & Peer Analytics",
    fullName: "Benchmark & Peer Analytics",
    pi: "PI4",
    piLabel: "PI 4 — Governance, QC & Analytics",
    status: "Planned",
    area: "PDC",
    storyCount: 3,
    description: "Peer group definitions, industry benchmark data, comparable ratios, Roger analytics surface.",
    dependencies: ["B22"],
    keyOutcomes: [
      "Peer group definitions and industry benchmark data queryable and versioned",
      "Roger surfaces benchmark context alongside tax-ready and provision-ready records",
      "Outlier indicators visible — positions deviating from peer group surfaced",
    ],
  },
  {
    id: "B24",
    name: "Advisory Opportunity Reference Data",
    fullName: "Advisory Opportunity Reference Data",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "PDC",
    storyCount: 4,
    description: "Advisory opportunity reference data — PDC governance framework (PI 2 Stretch), cross-LOB scoring rules, ScoringFramework contracts. TDC tax-specific advisory logic and TaxDetectionRule (PI 3).",
    dependencies: ["B11"],
    keyOutcomes: [
      "Advisory governance framework established — ScoringFramework and SuppressionRule contracts published",
      "Cross-LOB scoring rules governed by PDC — no autonomous advisory generation",
      "TDC TaxDetectionRule authority established — tax-flavored advisory logic governed",
      "B24 PDC (PI 2 Stretch) feeds B24 TDC (PI 3) — two-phase delivery chain",
    ],
  },
  {
    id: "B25",
    name: "Advisory Opportunity Detection & Surfacing",
    fullName: "Advisory Opportunity Detection & Surfacing",
    pi: "PI3",
    piLabel: "PI 3 — Intelligence, Provision & Audit",
    status: "Planned",
    area: "PDC",
    storyCount: 4,
    description: "Advisory opportunity detection and surfacing — PDC consumer-initiated detection framework (PI 2 Stretch), OpportunityRecord, DecisionRecord, SurfacingRecord. TDC tax-flavored detection and suppression evaluation (PI 3).",
    dependencies: ["B24"],
    keyOutcomes: [
      "Consumer-initiated detection only — no autonomous background advisory jobs",
      "OpportunityRecord, DecisionRecord, SurfacingRecord governed by PDC",
      "Suppression evaluation engine enforced — SuppressionRule contracts respected",
      "Advisory Detection Read Contract published — Roger consumes through governed read contracts only",
    ],
  },
  {
    id: "MT",
    name: "Migration Track",
    fullName: "Migration Track (Parallel)",
    pi: "Parallel",
    piLabel: "Migration Track — Parallel",
    status: "Planned",
    area: "Platform",
    storyCount: 0,
    description: "TWB TB extraction, prior year decisions, migration validation, Partnersight extraction.",
    dependencies: [],
    keyOutcomes: [
      "TWB TB extraction complete",
      "Prior year decisions migrated",
      "Migration validation passed",
    ],
  },
];

// ─── PI GROUP DEFINITIONS ─────────────────────────────────────────────────────

export interface PIGroup {
  id: BatchPI;
  label: string;
  subtitle: string;
  batchIds: string[];
  color: string;        // Tailwind color token
  bgColor: string;      // Tailwind bg token
  borderColor: string;  // Tailwind border token
}

export const PI_GROUPS: PIGroup[] = [
  {
    id: "PI1",
    label: "PI 1",
    subtitle: "Foundation & AI Mapping",
    batchIds: ["FC", "B1", "B2", "B2A", "B3"],
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    id: "PI2",
    label: "PI 2",
    subtitle: "Entity, Workflow & Tax Ready",
    batchIds: ["B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11"],
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
  },
  {
    id: "PI3",
    label: "PI 3",
    subtitle: "Intelligence, Provision & Audit",
    batchIds: ["B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B24", "B25"],
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
  },
  {
    id: "PI4",
    label: "PI 4",
    subtitle: "Governance, QC & Analytics",
    batchIds: ["B20", "B21", "B22", "B23"],
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
  },
];

// ─── STATUS STYLING ───────────────────────────────────────────────────────────

export const STATUS_STYLES: Record<BatchStatus, { bg: string; text: string; border: string; dot: string }> = {
  Complete: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
  Dev: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    dot: "bg-blue-500",
  },
  Review: {
    bg: "bg-violet-100",
    text: "text-violet-800",
    border: "border-violet-300",
    dot: "bg-violet-500",
  },
  Planned: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    dot: "bg-slate-400",
  },
  Active: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    dot: "bg-orange-500",
  },
};

export const AREA_STYLES: Record<BatchArea, { bg: string; text: string }> = {
  PDC: { bg: "bg-blue-100", text: "text-blue-800" },
  TDC: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Platform: { bg: "bg-slate-100", text: "text-slate-700" },
  "PDC+TDC": { bg: "bg-indigo-100", text: "text-indigo-800" },
};

// ─── ACCESSOR UTILITIES ───────────────────────────────────────────────────────

/** Get all batches */
export function getAllBatches(): BatchEntry[] {
  return BATCH_REGISTRY;
}

/** Get a single batch by ID */
export function getBatchById(id: string): BatchEntry | undefined {
  return BATCH_REGISTRY.find((b) => b.id === id);
}

/** Get all batches for a given PI */
export function getBatchesByPI(pi: BatchPI): BatchEntry[] {
  return BATCH_REGISTRY.filter((b) => b.pi === pi);
}

/** Get batches by status */
export function getBatchesByStatus(status: BatchStatus): BatchEntry[] {
  return BATCH_REGISTRY.filter((b) => b.status === status);
}

/** Get PI group definition */
export function getPIGroup(pi: BatchPI): PIGroup | undefined {
  return PI_GROUPS.find((g) => g.id === pi);
}

/** Count batches per status within a PI */
export function getPIStatusCounts(pi: BatchPI): Record<BatchStatus, number> {
  const batches = getBatchesByPI(pi);
  return {
    Complete: batches.filter((b) => b.status === "Complete").length,
    Dev: batches.filter((b) => b.status === "Dev").length,
    Review: batches.filter((b) => b.status === "Review").length,
    Planned: batches.filter((b) => b.status === "Planned").length,
    Active: batches.filter((b) => b.status === "Active").length,
  };
}

/** Get overall platform summary */
export function getPlatformSummary() {
  const all = BATCH_REGISTRY.filter((b) => b.id !== "MT");
  return {
    total: all.length,
    complete: all.filter((b) => b.status === "Complete").length,
    dev: all.filter((b) => b.status === "Dev").length,
    review: all.filter((b) => b.status === "Review").length,
    planned: all.filter((b) => b.status === "Planned").length,
    totalStories: all.reduce((sum, b) => sum + b.storyCount, 0),
  };
}

/** Get dependent batches (batches that depend ON the given batch ID) */
export function getDependents(batchId: string): BatchEntry[] {
  return BATCH_REGISTRY.filter((b) => b.dependencies.includes(batchId));
}

/** Get the full dependency chain for a batch (all upstream batches) */
export function getDependencyChain(batchId: string): string[] {
  const visited = new Set<string>();
  const queue = [batchId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const batch = getBatchById(current);
    if (!batch) continue;
    for (const dep of batch.dependencies) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }
  return Array.from(visited);
}

// ─── MUTABLE STATE (in-memory, session only) ─────────────────────────────────
// Supports status updates that propagate across all screens within the session.

type StatusListener = (batches: BatchEntry[]) => void;

class BatchModelStore {
  private batches: BatchEntry[] = BATCH_REGISTRY.map((b) => ({ ...b }));
  private listeners: Set<StatusListener> = new Set();

  getAll(): BatchEntry[] {
    return this.batches;
  }

  getById(id: string): BatchEntry | undefined {
    return this.batches.find((b) => b.id === id);
  }

  updateStatus(id: string, status: BatchStatus): void {
    const batch = this.batches.find((b) => b.id === id);
    if (batch) {
      batch.status = status;
      this.notify();
    }
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = [...this.batches];
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const batchModelStore = new BatchModelStore();

// ─── REACT HOOK ───────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useBatchModel() {
  const [batches, setBatches] = useState<BatchEntry[]>(batchModelStore.getAll());

  useEffect(() => {
    const unsub = batchModelStore.subscribe((updated) => {
      setBatches([...updated]);
    });
    return unsub;
  }, []);

  const updateStatus = (id: string, status: BatchStatus) => {
    batchModelStore.updateStatus(id, status);
  };

  const getByPI = (pi: BatchPI) => batches.filter((b) => b.pi === pi);
  const getByStatus = (status: BatchStatus) => batches.filter((b) => b.status === status);
  const summary = getPlatformSummary();

  return { batches, updateStatus, getByPI, getByStatus, summary };
}

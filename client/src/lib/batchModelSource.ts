/**
 * batchModelSource.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GOVERNANCE RULE: This file is the single source of truth binding layer.
 *
 * All pages that display batch-related content (Data Model Gaps, Roger UI
 * Mapping, etc.) MUST derive their batch references from this module.
 *
 * DO NOT duplicate batch IDs, names, statuses, or touchpoint lists in
 * dependent pages. Import from here instead.
 *
 * Source: client/src/lib/dctData.ts (allBatches, touchpoints, activeBatch)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { allBatches, touchpoints, activeBatch, type ArchitecturalBatch, type BatchStatus } from "./dctData";

// ─── CANONICAL BATCH REGISTRY ────────────────────────────────────────────────

/** Lookup map: batchId → ArchitecturalBatch. Use for O(1) reference validation. */
export const batchById: Record<string, ArchitecturalBatch> = Object.fromEntries(
  allBatches.map((b) => [b.id, b])
);

/** Lookup map: touchpointId → touchpoint object. */
export const touchpointById = Object.fromEntries(
  touchpoints.map((t) => [t.id, t])
);

/** All valid batch IDs in the Batch Model (AB-01, AB-02, …). */
export const validBatchIds = new Set(allBatches.map((b) => b.id));

/** All valid touchpoint IDs (T1–T11). */
export const validTouchpointIds = new Set(touchpoints.map((t) => t.id));

// ─── GOVERNANCE HELPERS ──────────────────────────────────────────────────────

/**
 * Returns the canonical batch name for a given batchId.
 * Returns a "[ORPHANED]" warning string if the batch no longer exists.
 */
export function resolveBatchName(batchId: string): string {
  return batchById[batchId]?.name ?? `[ORPHANED — ${batchId} not in Batch Model]`;
}

/**
 * Returns the canonical batch status for a given batchId.
 * Returns "PLANNED" as a safe default if the batch is not found.
 */
export function resolveBatchStatus(batchId: string): BatchStatus {
  return batchById[batchId]?.status ?? "PLANNED";
}

/**
 * Returns the primary system for a given batchId.
 */
export function resolveBatchSystem(batchId: string): string {
  return batchById[batchId]?.primarySystem ?? "Unknown";
}

/**
 * Returns the target date for a given batchId.
 */
export function resolveBatchTargetDate(batchId: string): string {
  return batchById[batchId]?.targetDate ?? "TBD";
}

/**
 * Validates a list of batchIds against the Batch Model.
 * Returns { valid: string[], orphaned: string[] }.
 */
export function validateBatchRefs(batchIds: string[]): { valid: string[]; orphaned: string[] } {
  const valid: string[] = [];
  const orphaned: string[] = [];
  for (const id of batchIds) {
    if (validBatchIds.has(id)) valid.push(id);
    else orphaned.push(id);
  }
  return { valid, orphaned };
}

/**
 * Returns a badge color class for a batch status.
 * Consistent with BatchRoadmap and GateStatus color conventions.
 */
export function batchStatusBadge(status: BatchStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case "ACTIVE":       return { bg: "#d1fae5", text: "#059669", label: "Active" };
    case "CLOSED":       return { bg: "#dbeafe", text: "#2563eb", label: "Complete" };
    case "GATE_PENDING": return { bg: "#fef3c7", text: "#d97706", label: "Gate Pending" };
    case "ON_HOLD":      return { bg: "#fee2e2", text: "#dc2626", label: "On Hold" };
    case "PLANNED":
    default:             return { bg: "#f3f4f6", text: "#6b7280", label: "Planned" };
  }
}

// ─── DATA AVAILABILITY DERIVATION ────────────────────────────────────────────
// Derives the Data Availability table rows from the Batch Model.
// Each row maps a delivery stage to its canonical batch reference.

export interface DataAvailabilityRow {
  stage: string;
  batchId: string;           // canonical batch ID from Batch Model
  batchName: string;         // resolved from Batch Model — never hardcoded
  batchStatus: BatchStatus;  // live status from Batch Model
  system: string;            // resolved from Batch Model primarySystem
  dataAvailable: string;     // descriptive (static — schema description)
  rogerCanUse: boolean;
  usageType: string;
  notes: string;
  isOrphaned: boolean;       // true if batchId no longer exists in Batch Model
}

// Static schema descriptions — these describe the data shape, not the batch.
// Batch metadata (name, status, system) is derived from the Batch Model above.
// Coverage: Foundation Core (FC-00) through Return Assembly (AB-12).
const DATA_AVAILABILITY_STATIC: Array<Omit<DataAvailabilityRow, "batchName" | "batchStatus" | "system" | "isOrphaned">> = [
  // ── Foundation Core (FC-00) ──────────────────────────────────────────────
  {
    stage: "Infrastructure Setup",
    batchId: "FC-00",
    dataAvailable: "Dev environment, code repositories, Copilot Agent configuration, Blitzy templates, CI/CD pipelines",
    rogerCanUse: false,
    usageType: "None",
    notes: "Infrastructure only — no platform data produced",
  },
  // ── AB-01: Foundation & Source Onboarding ────────────────────────────────
  {
    stage: "Ingestion",
    batchId: "AB-01",
    dataAvailable: "IngestionJob (JobId GUID — PRIMARY KEY, ClientId GUID, EntityId GUID, PeriodStart, PeriodEnd, Status enum), SourceFile (SourceFileId GUID — record key, DocumentId GUID — immutable lineage anchor, JobId FK)",
    rogerCanUse: false,
    usageType: "None",
    notes: "TaxYear NOT stored — PeriodStart/PeriodEnd are the temporal model",
  },
  {
    stage: "Ready Event",
    batchId: "AB-01",
    dataAvailable: "PDC_READY_EVENT payload: DocumentId, RunId, EntityId, PeriodStart, PeriodEnd, TaxonomyVersion, SourceFileId, RecordCount",
    rogerCanUse: false,
    usageType: "None",
    notes: "Event triggers AI Orchestrator; not a Roger-facing endpoint",
  },
  // ── AB-02: Invariant Framework Establishment ─────────────────────────────
  {
    stage: "Normalized",
    batchId: "AB-02",
    dataAvailable: "vNormalizedTb view: RunId, EntityId, AccountCode, Amount, CurrencyCode, LOBCode, PeriodStart, PeriodEnd",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Roger reads normalized financial facts for display only",
  },
  {
    stage: "Mapped",
    batchId: "AB-02",
    dataAvailable: "MappingDecision: MappingId, RunId, TaxCode, Confidence, Evidence, Status, CreatedAt (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Append-only — no updates or deletes permitted",
  },
  // ── AB-03: Lineage Graph Construction ────────────────────────────────────
  {
    stage: "Adjusted",
    batchId: "AB-03",
    dataAvailable: "AdjustmentRecord: AdjustmentId, MappingId, OriginalAmount, AdjustedAmount, Reason, ApprovedBy, Timestamp (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Practitioner adjustments persisted in TDC; Roger reads result",
  },
  // ── AB-04: Initial Contract Publication ──────────────────────────────────
  {
    stage: "Tax-Ready",
    batchId: "AB-04",
    dataAvailable: "TaxReadyRecord: TaxReadyId, RunId, EntityId, TaxYear (derived), LockStatus, SignedBy, SignedAt",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TaxYear derived from PeriodStart/PeriodEnd — never stored in PDC",
  },
  // ── AB-05: Expanded Entity Coverage ──────────────────────────────────────
  {
    stage: "Filed",
    batchId: "AB-05",
    dataAvailable: "FilingRecord: FilingId, TaxReadyId, ReturnType, FiledAt, ConfirmationNumber (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "IMS receives outbound outputs from TDC only — no write access to platform",
  },
  // ── AB-06: AI Orchestrator Layer Integration ──────────────────────────────
  {
    stage: "Orchestration Manifest",
    batchId: "AB-06",
    dataAvailable: "OrchestrationManifest: ManifestId, Version, AgentRegistry, InvariantBindings, GovernanceCharterRef, ApprovedAt",
    rogerCanUse: false,
    usageType: "None",
    notes: "Internal governance artifact — not a Roger-facing data object",
  },
  // ── AB-07: Tax Domain Authority & Tax Taxonomy ────────────────────────────
  {
    stage: "Tax Taxonomy",
    batchId: "AB-07",
    dataAvailable: "TaxTaxonomyRecord: TaxonomyId, TaxCode, JurisdictionCode, Description, Version, EffectiveDate; TDC established as system of record",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Roger reads taxonomy codes for display; TDC owns all tax taxonomy definitions",
  },
  // ── AB-08: AI Tax Mapping & Explainability ────────────────────────────────
  {
    stage: "AI Mapping Proposals",
    batchId: "AB-08",
    dataAvailable: "MappingProposal: ProposalId, RunId, TaxCode, Confidence (0–1), Evidence (JSON array), ExplainabilityTrace, CreatedAt (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "AI proposals are append-only; confidence scores and evidence surfaced in Roger UI",
  },
  // ── AB-09: Mapping Decisions & Governance ────────────────────────────────
  {
    stage: "Tax Decision",
    batchId: "AB-09",
    dataAvailable: "TaxDecisionRecord: DecisionId, ProposalId, ReviewedBy, Decision (APPROVED/OVERRIDDEN/REJECTED), AuditTrailRef, DecidedAt (append-only, immutable)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Immutable audit trail — no updates or deletes; practitioner decisions persisted in TDC",
  },
  // ── AB-10: Practitioner Review & Adjustment Workflow ─────────────────────
  {
    stage: "Practitioner Review",
    batchId: "AB-10",
    dataAvailable: "ReviewWorkflowRecord: WorkflowId, EntityId, AssignedTo, Status (PENDING/IN_REVIEW/APPROVED/OVERRIDE), CompletedAt; AdjustmentRequest: RequestId, WorkflowId, FieldRef, ProposedValue, Justification",
    rogerCanUse: true,
    usageType: "Read + Submit via API",
    notes: "Roger UI surfaces review queue; practitioner submits adjustments via API; TDC persists all decisions",
  },
  // ── AB-11: Rollforward & Prior Year Intelligence ──────────────────────────
  {
    stage: "Prior Year Rollforward",
    batchId: "AB-11",
    dataAvailable: "RollforwardRecord: RollforwardId, EntityId, SourcePeriod, TargetPeriod, FieldMappings (JSON), AIComparisonRef, Status; PriorYearDelta: DeltaId, RollforwardId, FieldRef, PriorValue, CurrentValue, VarianceFlag",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "AI-assisted prior year comparison surfaced in Roger UI; PDC owns rollforward records",
  },
  // ── AB-12: Return Assembly, Filing & Lineage Closure ─────────────────────
  {
    stage: "Return Assembly & Filing",
    batchId: "AB-12",
    dataAvailable: "ReturnAssembly: AssemblyId, EntityId, TaxYear (derived), ReturnType, Sections (JSON), AssembledAt; FilingRecord: FilingId, AssemblyId, FiledAt, ConfirmationNumber, LineageClosureCertRef (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Full lineage closure certified at this stage; IMS receives outbound from TDC only",
  },
];

/**
 * Returns the Data Availability rows with all batch metadata resolved
 * live from the Batch Model. Any row referencing a non-existent batch
 * will have isOrphaned=true and a warning in batchName.
 */
export function getDataAvailabilityRows(): DataAvailabilityRow[] {
  return DATA_AVAILABILITY_STATIC.map((row) => {
    const batch = batchById[row.batchId];
    return {
      ...row,
      batchName: batch?.name ?? `[ORPHANED — ${row.batchId}]`,
      batchStatus: batch?.status ?? "PLANNED",
      system: batch?.primarySystem ?? "Unknown",
      isOrphaned: !batch,
    };
  });
}

// ─── ROGER MAPPING BATCH DELIVERY TAGS ───────────────────────────────────────
// Maps each Roger UI screen to the canonical batch that delivers it.

export interface RogerScreenBatchRef {
  screenId: string;
  batchId: string;
  batchName: string;   // resolved from Batch Model
  batchStatus: BatchStatus;
  isOrphaned: boolean;
}

const ROGER_SCREEN_BATCH_MAP: Record<string, string> = {
  "screen-1-my-clients":              "AB-01",
  "screen-2-filing-structure":        "AB-02",
  "screen-ownership-summary":         "AB-03",
};

/**
 * Returns Roger screen → batch delivery references, all resolved live
 * from the Batch Model. Orphaned entries are flagged.
 */
export function getRogerScreenBatchRefs(): RogerScreenBatchRef[] {
  return Object.entries(ROGER_SCREEN_BATCH_MAP).map(([screenId, batchId]) => {
    const batch = batchById[batchId];
    return {
      screenId,
      batchId,
      batchName: batch?.name ?? `[ORPHANED — ${batchId}]`,
      batchStatus: batch?.status ?? "PLANNED",
      isOrphaned: !batch,
    };
  });
}

// Re-export the canonical source arrays for convenience
export { allBatches, touchpoints, activeBatch };

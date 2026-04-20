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

// ─── SWAGGER CONTRACT VALIDATION ─────────────────────────────────────────────
// GOVERNANCE RULE: Batch Model is the source of truth for stage, system
// ownership, and Roger usability. Swagger is used ONLY as a validation layer.
//
// Validation applies when:
//   • Row indicates Roger consumption (rogerCanUse === true), OR
//   • Row represents an API/event surface (READY event, mapping, decisions, filing)
//
// Status semantics:
//   ALIGNED          → Swagger contract exists and matches Batch Model
//   MISSING_CONTRACT → Batch Model says data is available; no Swagger contract yet
//   OUT_OF_SYNC      → Swagger exposes something not aligned with Batch Model
//   NOT_APPLICABLE   → Row is infrastructure/internal; no API contract expected
// ─────────────────────────────────────────────────────────────────────────────

export type SwaggerContractStatus =
  | "ALIGNED"
  | "MISSING_CONTRACT"
  | "OUT_OF_SYNC"
  | "NOT_APPLICABLE";

export interface SwaggerContractRef {
  status: SwaggerContractStatus;
  /** Swagger endpoint path, if contract exists */
  endpoint?: string;
  /** Short note explaining the validation result */
  detail: string;
}

/**
 * Static Swagger contract registry.
 * Keyed by stage name (matches DATA_AVAILABILITY_STATIC[].stage).
 *
 * This is a STATIC reference — no API calls are made.
 * Update this registry when Swagger contracts are published or changed.
 * Source systems: PDC Swagger (GET /api/pdc/*) and TDC Swagger (GET /api/tdc/*).
 */
const SWAGGER_CONTRACT_REGISTRY: Record<string, SwaggerContractRef> = {
  // ── FC-00: Infrastructure — no API contract expected ──────────────────────
  "Infrastructure Setup": {
    status: "NOT_APPLICABLE",
    detail: "Infrastructure batch — no API contract",
  },

  // ── AB-01: Ingestion ─────────────────────────────────────────────────────
  // Roger Can Use = No → NOT_APPLICABLE (internal PDC records, not Roger-facing)
  "Ingestion": {
    status: "NOT_APPLICABLE",
    detail: "Roger Can Use = No — PDC ingestion records are internal; no Roger-facing API contract expected",
  },
  "Ingestion Status API": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "IngestionStatus endpoint (GET /api/pdc/ingestion/status) not yet published in PDC Swagger; pending AB-01 Gate 1",
  },
  "Ready Event": {
    status: "NOT_APPLICABLE",
    detail: "Roger Can Use = No — PDC_READY_EVENT is an internal Service Bus event; Roger is not a consumer",
  },

  // ── AB-02: Normalization & Cross-LOB Taxonomy ─────────────────────────────
  "Normalized Trial Balance": {
    status: "ALIGNED",
    endpoint: "GET /api/pdc/normalized",
    detail: "vNormalizedTb view exposed via PDC Swagger; EntityId + PeriodStart/PeriodEnd filter supported; TaxYear not stored",
  },

  // ── AB-03: Tax Domain Authority & Tax Taxonomy ────────────────────────────
  "Tax Taxonomy Reference": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "TaxFormTemplates and TaxTaxonomyAccounts not yet published in TDC Swagger; contract expected at AB-03 delivery",
  },

  // ── AB-04: AI Tax Mapping & Explainability ────────────────────────────────
  "AI Mapping Proposals": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "MappingProposal with confidence score and ExplainabilityTrace not yet in TDC Swagger; pending AB-04 delivery",
  },
  "Mapping Decisions": {
    status: "OUT_OF_SYNC",
    endpoint: "GET /api/tdc/records",
    detail: "TDC Swagger exposes MappingDecision but uses 'tax_year' field — Batch Model requires PeriodStart/PeriodEnd; field alignment gap",
  },
  "TDC Records API": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "Roger primary read contract (GET /api/tdc/records) not yet published; pending AB-04 Gate 4 (Contract Publication)",
  },

  // ── AB-05: Entity Identity & Structure ───────────────────────────────────
  "Entity Identity Read Contract": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "Entity registry read contract (GET /api/pdc/entities) not yet published in PDC Swagger; pending AB-05 delivery",
  },

  // ── AB-06: Practitioner Review, Adjustments & Lock ────────────────────────
  "Adjustment Record": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "AdjustmentRecord not yet published in TDC Swagger; contract pending AB-06 delivery",
  },
  "Tax-Ready Record": {
    status: "ALIGNED",
    endpoint: "GET /api/tdc/tax-ready",
    detail: "TaxReadyRecord in TDC Swagger; TaxYear derived from PeriodStart/PeriodEnd — not stored; lock state included",
  },
  "Practitioner Review Workflow": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "ReviewWorkflowRecord and sign-off endpoint not yet in TDC Swagger; pending AB-06 delivery",
  },

  // ── AB-07: Client Tax Profile & Eligibility ───────────────────────────────
  "Tax Profile": {
    status: "MISSING_CONTRACT",
    endpoint: undefined,
    detail: "TaxProfile and EligibilityDetermination not yet published in TDC Swagger; pending AB-07 delivery",
  },
};

/**
 * Resolves the Swagger contract validation status for a given stage.
 * Falls back to NOT_APPLICABLE if no registry entry exists.
 */
export function resolveSwaggerContract(stage: string): SwaggerContractRef {
  return SWAGGER_CONTRACT_REGISTRY[stage] ?? {
    status: "NOT_APPLICABLE",
    detail: "No contract registry entry for this stage",
  };
}

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
  // ── Swagger contract validation (read-only — does not affect Batch Model) ──
  swaggerStatus: SwaggerContractStatus;
  swaggerEndpoint?: string;
  swaggerDetail: string;
}

// Static schema descriptions — these describe the data shape, not the batch.
// Batch metadata (name, status, system) is derived from the Batch Model above.
// Coverage: Foundation Core (FC-00) through Client Tax Profile (AB-07) — v1.8 aligned.
const DATA_AVAILABILITY_STATIC: Array<Omit<DataAvailabilityRow, "batchName" | "batchStatus" | "system" | "isOrphaned" | "swaggerStatus" | "swaggerEndpoint" | "swaggerDetail">> = [
  // ── Foundation Core (FC-00) ──────────────────────────────────────────────
  {
    stage: "Infrastructure Setup",
    batchId: "FC-00",
    dataAvailable: "Dev environment, code repositories, Copilot Agent configuration, Blitzy templates, CI/CD pipelines",
    rogerCanUse: false,
    usageType: "None",
    notes: "Infrastructure only — no platform data produced",
  },

  // ── AB-01: File Ingestion & Initial Storage ───────────────────────────────
  // Owner: PDC. TaxYear NOT stored. PeriodStart/PeriodEnd are the temporal model.
  {
    stage: "Ingestion",
    batchId: "AB-01",
    dataAvailable: "IngestionJob (JobId GUID, ClientId GUID, EntityId GUID, PeriodStart DateOnly, PeriodEnd DateOnly, Status enum), SourceFile (SourceFileId GUID, DocumentId GUID — immutable lineage anchor, JobId FK), audit_log",
    rogerCanUse: false,
    usageType: "None",
    notes: "PDC-owned; append-only; TaxYear NOT stored — PeriodStart/PeriodEnd are the temporal model",
  },
  {
    stage: "Ingestion Status API",
    batchId: "AB-01",
    dataAvailable: "GET /api/pdc/ingestion/status: JobId, EntityId, DocumentId, PeriodStart, PeriodEnd, State (INGESTED/PROCESSING/READY/FAILED), Timestamps",
    rogerCanUse: false,
    usageType: "None",
    notes: "Internal PDC status surface; Roger does not consume ingestion status directly",
  },
  {
    stage: "Ready Event",
    batchId: "AB-01",
    dataAvailable: "PDC_READY_EVENT payload: DocumentId, RunId, EntityId, PeriodStart, PeriodEnd, TaxonomyVersion, SourceFileId, RecordCount",
    rogerCanUse: false,
    usageType: "None",
    notes: "AI Orchestrator = stateless consumer only; event triggers Orchestrator, not Roger",
  },

  // ── AB-02: Normalization & Cross-LOB Taxonomy ─────────────────────────────
  // Owner: PDC + AI Orchestrator. Orchestrator = stateless; PDC persists results.
  {
    stage: "Normalized Trial Balance",
    batchId: "AB-02",
    dataAvailable: "vNormalizedTb view: RunId, EntityId, AccountCode, Amount, CurrencyCode, LOBCode, PeriodStart DateOnly, PeriodEnd DateOnly",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "PDC-owned; TaxYear NOT stored — derived in TDC only; read-only for Roger",
  },

  // ── AB-03: Tax Domain Authority & Tax Taxonomy ────────────────────────────
  // Owner: TDC. TDC is system of record for all tax taxonomy and form definitions.
  {
    stage: "Tax Taxonomy Reference",
    batchId: "AB-03",
    dataAvailable: "TaxFormTemplates (FormId, Jurisdiction, ReturnType, TaxYear derived from PeriodStart), FormLines, TaxTaxonomyAccounts, MappingRules (versioned), ConfidenceBandThresholds (GREEN/YELLOW/RED)",
    rogerCanUse: false,
    usageType: "None",
    notes: "TDC-owned; Orchestrator-facing read contract; Roger does not consume raw taxonomy reference data",
  },

  // ── AB-04: AI Tax Mapping & Explainability ────────────────────────────────
  // Owner: TDC + AI Orchestrator. Orchestrator = stateless; TDC persists all decisions.
  {
    stage: "AI Mapping Proposals",
    batchId: "AB-04",
    dataAvailable: "MappingProposal: ProposalId, RunId, TaxCode, Confidence (0–1), ConfidenceBand (GREEN/YELLOW/RED), Evidence (JSON array), ExplainabilityTrace, CreatedAt (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; append-only; AI proposals are NOT final decisions — practitioner action required; read-only for Roger",
  },
  {
    stage: "Mapping Decisions",
    batchId: "AB-04",
    dataAvailable: "MappingDecision: DecisionId, ProposalId, ReviewedBy, Decision (ACCEPTED/OVERRIDDEN/REJECTED), AuditTrailRef, DecidedAt (append-only, immutable)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; immutable audit trail; append-only — no updates or deletes; read-only for Roger",
  },
  {
    stage: "TDC Records API",
    batchId: "AB-04",
    dataAvailable: "GET /api/tdc/records: Roger primary read contract — proposals, decisions, confidence bands, evidence, traceability from source",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "Roger primary read contract; TDC-owned; read-only for Roger",
  },

  // ── AB-05: Entity Identity & Structure ───────────────────────────────────
  // Owner: PDC. EntityId is a PDC-assigned GUID; RBAC context and hierarchy stored here.
  {
    stage: "Entity Identity Read Contract",
    batchId: "AB-05",
    dataAvailable: "ClientGroupId (GUID), EntityId (GUID, immutable), ClientId, hierarchy (parent/sub ownership chains), jurisdiction, entity characteristics, DataSourceType (ADMIN_API_MANUAL / CEM_SYNC / MDM_SYNC / EODS_SYNC), RBAC entitlement mappings",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "PDC-owned; read-only for Roger; RBAC context scopes Roger views; CEM sync is idempotent",
  },

  // ── AB-06: Practitioner Review, Adjustments & Lock ───────────────────────
  // Owner: TDC + Roger UI. TaxReadyRecord is derived, not stored from PDC.
  {
    stage: "Adjustment Record",
    batchId: "AB-06",
    dataAvailable: "AdjustmentRecord: AdjustmentId, MappingId, AdjustmentType (BOOK_TO_TAX), OriginalAmount, AdjustedAmount, Reason, ApprovalStatus, ApprovedBy, Timestamp (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; append-only; book-to-tax adjustments only; read-only for Roger",
  },
  {
    stage: "Tax-Ready Record",
    batchId: "AB-06",
    dataAvailable: "TaxReadyRecord: TaxReadyId, RunId, EntityId, TaxYear (derived from PeriodStart/PeriodEnd — in TDC only), LockStatus (OPEN/FINALIZED/AMENDED), SignedBy, SignedAt, LineageRef",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; derived, not stored from PDC; TaxYear derived in TDC only; lock is terminal; read-only for Roger",
  },
  {
    stage: "Practitioner Review Workflow",
    batchId: "AB-06",
    dataAvailable: "ReviewTask (auto-generated from data state), EntityStatus (OPEN/IN_REVIEW/FINALIZED/AMENDED), SignOff (non-repudiable), LockEvent (immutable, logged on mutation attempt)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; Roger surfaces review queue and finalization state; read-only for Roger",
  },

  // ── AB-07: Client Tax Profile & Eligibility ───────────────────────────────
  // Owner: TDC. Eligibility is a downstream processing gate — INELIGIBLE blocks AI mapping.
  {
    stage: "Tax Profile",
    batchId: "AB-07",
    dataAvailable: "TaxProfile (EntityId, ReturnType, Jurisdiction, FilingMethod, TaxYear derived), EligibilityDetermination (ELIGIBLE/INELIGIBLE/FLAG_AND_REVIEW), EligibilityRules (Must Have / Must Not Have / Flag & Review — versioned), EligibilityAuditLog (append-only)",
    rogerCanUse: true,
    usageType: "Read via API",
    notes: "TDC-owned; eligibility is a downstream gate — INELIGIBLE blocks AI mapping; TaxYear derived in TDC only; read-only for Roger",
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
    const contract = resolveSwaggerContract(row.stage);
    return {
      ...row,
      batchName: batch?.name ?? `[ORPHANED — ${row.batchId}]`,
      batchStatus: batch?.status ?? "PLANNED",
      system: batch?.primarySystem ?? "Unknown",
      isOrphaned: !batch,
      swaggerStatus: contract.status,
      swaggerEndpoint: contract.endpoint,
      swaggerDetail: contract.detail,
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

/**
 * useIntegrationHub — Synchronization Engine
 *
 * This hook is the ONLY data layer for the Integration Alignment Hub page.
 * It aggregates data from all source-of-truth systems and derives integration
 * state without duplicating any static data.
 *
 * SOURCE HIERARCHY:
 *   1. BatchStatusContext        → batch statuses, gates, PI completion, audit log
 *   2. BatchControlPanel data   → SWAGGER_ENTRIES, ROGER_DATA_POINTS, DELIVERED_BATCHES
 *   3. batchModelSource         → DataAvailabilityRow, allBatches, deriveGateStatus
 *   4. rogerGovernanceData      → FieldMapping, ADR_CARDS, HEATMAP_DATA, computeSummaryTiles
 *   5. rogerModelData           → ROGER_MODEL_GROUPS (field readiness)
 *   6. batchModel               → PI_GROUPS, batch registry
 *
 * GOVERNANCE RULE:
 *   The DCT Control Panel ecosystem remains the authoritative system of record.
 *   The Integration Alignment Hub acts as the operational integration orchestration layer.
 *   All data in this hook is DERIVED — never manually entered.
 */

import { useMemo } from "react";
import {
  useBatchStatus,
  BATCH_LABELS,
  BATCH_DEPENDENCIES,
  deriveGateStatus,
  deriveApiReadiness,
  deriveContractStatus,
  deriveQaReadiness,
  deriveDemoReadiness,
  deriveAgentStatus,
  type BatchKey,
  type BatchStatus,
  type ReadinessValue,
} from "@/contexts/BatchStatusContext";
import { allBatches, getDataAvailabilityRows, type DataAvailabilityRow } from "@/lib/batchModelSource";
import { ADR_CARDS, computeSummaryTiles, type ADRCard } from "@/lib/rogerGovernanceData";
import { ROGER_MODEL_GROUPS, type Readiness } from "@/lib/rogerModelData";
import { PI_GROUPS, type BatchStatus as ModelBatchStatus } from "@/lib/batchModel";

// ── Types ────────────────────────────────────────────────────────────────────

export type SyncSource =
  | "BatchStatusContext"
  | "BatchControlPanel"
  | "RogerUIMapping"
  | "RogerAPIEvolution"
  | "DataModelGaps"
  | "BatchRoadmap"
  | "GateStatus"
  | "BatchDeliveryTracker";

export interface SyncedBatchRow {
  key: BatchKey;
  label: string;
  status: BatchStatus;
  // Derived readiness indicators
  apiReadiness: ReadinessValue;
  contractReadiness: ReadinessValue;
  qaReadiness: ReadinessValue;
  demoReadiness: ReadinessValue;
  agentStatus: string;
  // Gate status
  gateG1: "Complete" | "In Progress" | "Locked";
  gateG2: "Complete" | "In Progress" | "Locked";
  gateG3: "Complete" | "In Progress" | "Locked";
  gateG4: "Complete" | "In Progress" | "Locked";
  // PI assignment
  pi: string;
  // Dependencies
  blockedBy: BatchKey[];
  // Source attribution
  sources: SyncSource[];
}

export interface SyncedApiRow {
  batch: string;
  endpoint: string;
  path: string;
  status: string;
  consumerGuide: string;
  missingFromGuide: boolean;
  missingFromSwagger: boolean;
  notes: string;
  owner: string;
  // Derived from BatchStatusContext
  liveStatus: string;
  source: SyncSource;
}

export interface SyncedRogerRow {
  dataPoint: string;
  sourceBatch: string;
  availability: string;
  apiEndpoint: string;
  notes: string;
  owner: string;
  // Derived from BatchStatusContext
  liveAvailability: string;
  source: SyncSource;
}

export interface BlockingGap {
  id: string;
  batch: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  source: SyncSource;
  resolved: boolean;
  // Resolved automatically when batch status changes
  autoResolveOnStatus?: BatchStatus;
}

export interface IntegrationSummaryTile {
  label: string;
  value: number | string;
  subLabel: string;
  color: "green" | "amber" | "red" | "blue" | "slate";
  source: SyncSource;
}

export interface SyncHealth {
  source: SyncSource;
  label: string;
  status: "live" | "derived" | "static";
  lastSynced: string;
  itemCount: number;
}

export interface IntegrationHubState {
  // Synchronized batch rows (one per batch, all fields derived)
  batchRows: SyncedBatchRow[];
  // API / Swagger rows (derived from BatchControlPanel SWAGGER_ENTRIES + live status)
  apiRows: SyncedApiRow[];
  // Roger data point rows (derived from BatchControlPanel ROGER_DATA_POINTS + live status)
  rogerRows: SyncedRogerRow[];
  // Blocking gaps (derived from ADR_CARDS + batch status)
  blockingGaps: BlockingGap[];
  // Data availability (from batchModelSource)
  dataAvailability: DataAvailabilityRow[];
  // Summary tiles
  tiles: IntegrationSummaryTile[];
  // Sync health indicators
  syncHealth: SyncHealth[];
  // Metadata
  lastSynced: Date;
  totalBatches: number;
  completedBatches: number;
  activeBatches: number;
  blockedBatches: number;
  piCompletion: Record<string, number>;
}

// ── Batch key → PI mapping ───────────────────────────────────────────────────
const BATCH_TO_PI: Record<string, string> = {};
PI_GROUPS.forEach(pi => {
  pi.batchIds.forEach(id => {
    BATCH_TO_PI[id] = pi.label;
  });
});

// ── Batch key → label mapping for API/Roger rows ─────────────────────────────
const BATCH_LABEL_MAP: Record<string, string> = {
  "Batch FC": "Foundation Core",
  "Batch 1": "B1 — File Ingestion",
  "Batch 2": "B2 — Normalization",
  "Batch 2A": "B2A — Classification",
  "Batch 3": "B3 — Tax Domain",
  "Batch 4": "B4 — AI Mapping",
  "Batch 5": "B5 — Entity Identity",
  "Batch 6": "B6 — Review & Lock",
  "Batch 7": "B7 — Eligibility",
  "Batch 8": "B8 — Exceptions",
  "Batch 9": "B9 — Rollforward",
  "Batch 10": "B10 — Consolidation",
  "Batch 11": "B11 — Learning Gov",
};

// Map "Batch X" label → BatchKey
const BATCH_LABEL_TO_KEY: Record<string, BatchKey> = {
  "Batch FC": "foundation-core",
  "Batch 1": "1",
  "Batch 2": "2",
  "Batch 2A": "2a",
  "Batch 3": "3",
  "Batch 4": "4",
  "Batch 5": "5",
  "Batch 6": "6",
  "Batch 7": "7",
  "Batch 8": "8",
  "Batch 9": "9",
  "Batch 10": "10",
  "Batch 11": "11",
};

// ── Blocking gaps derived from ADR cards ─────────────────────────────────────
function deriveBlockingGaps(
  adrCards: ADRCard[],
  statuses: Record<string, BatchStatus>
): BlockingGap[] {
  return adrCards
    .filter(card => card.currentStatus === "Open" || card.currentStatus === "In Progress")
    .map(card => {
      return {
        id: card.id,
        batch: "Platform",
        title: card.title,
        description: card.description ?? card.title,
        severity: card.severity,
        source: "RogerUIMapping" as SyncSource,
        resolved: card.currentStatus === "Resolved",
        autoResolveOnStatus: "Complete" as BatchStatus,
      };
    });
}

// ── Roger model field readiness → integration readiness ──────────────────────
function deriveFieldGaps(): { total: number; delivered: number; partial: number; missing: number } {
  let total = 0, delivered = 0, partial = 0, missing = 0;
  ROGER_MODEL_GROUPS.forEach(group => {
    group.fields.forEach(field => {
      total++;
      if (field.status === "Delivered") delivered++;
      else if (field.status === "Partial" || field.status === "Mocked") partial++;
      else if (field.status === "Missing" || field.status === "Deferred") missing++;
    });
  });
  return { total, delivered, partial, missing };
}

// ── Main hook ────────────────────────────────────────────────────────────────
export function useIntegrationHub(): IntegrationHubState {
  const {
    statuses,
    gates,
    lastUpdated,
    piCompletion,
  } = useBatchStatus();

  const now = useMemo(() => new Date(), [lastUpdated]);

  // ── 1. Batch rows — fully derived from BatchStatusContext + batchModel ──────
  const batchRows = useMemo<SyncedBatchRow[]>(() => {
    const liveGates = deriveGateStatus(statuses);

    const ALL_KEYS: BatchKey[] = [
      "foundation-core","1","2","2a","3","4","5","6","7","8","9","10","11"
    ];

    return ALL_KEYS.map(key => {
      const status = statuses[key] ?? "Not Started";
      const deps = BATCH_DEPENDENCIES[key] ?? [];
      const blockedBy = deps.filter(d => {
        const ds = statuses[d] ?? "Not Started";
        return ds !== "Complete" && ds !== "Delivered";
      });

      // Gate status derived from context
      const g = liveGates;
      const isComplete = status === "Complete" || status === "Delivered";
      const isActive = status === "In Progress" || status === "Ready for QA" || status === "QA In Progress" || status === "Demo Ready";
      const gateG1 = isComplete ? "Complete" : isActive ? "In Progress" : "Locked";
      const gateG2 = gateG1 === "Complete" ? "Complete"
        : gateG1 === "In Progress" ? "In Progress" : "Locked";
      const gateG3 = gateG2 === "Complete" ? "Complete"
        : gateG2 === "In Progress" ? "In Progress" : "Locked";
      const gateG4 = gateG3 === "Complete" ? "Complete"
        : gateG3 === "In Progress" ? "In Progress" : "Locked";

      return {
        key,
        label: BATCH_LABELS[key] ?? key,
        status,
        apiReadiness: deriveApiReadiness(status),
        contractReadiness: deriveContractStatus(status),
        qaReadiness: deriveQaReadiness(status),
        demoReadiness: deriveDemoReadiness(status),
        agentStatus: deriveAgentStatus(status),
        gateG1,
        gateG2,
        gateG3,
        gateG4,
        pi: BATCH_TO_PI[key] ?? "Unassigned",
        blockedBy,
        sources: ["BatchStatusContext", "BatchRoadmap"],
      };
    });
  }, [statuses]);

  // ── 2. Data availability rows — from batchModelSource ────────────────────
  const dataAvailability = useMemo(() => getDataAvailabilityRows(), []);

  // ── 3. Blocking gaps — derived from ADR_CARDS + batch status ─────────────
  const blockingGaps = useMemo(
    () => deriveBlockingGaps(ADR_CARDS, statuses as unknown as Record<string, BatchStatus>),
    [statuses]
  );

  // ── 4. Field gaps — from Roger model data ────────────────────────────────
  const fieldGaps = useMemo(() => deriveFieldGaps(), []);

  // ── 5. Summary tiles — all derived ───────────────────────────────────────
  const tiles = useMemo<IntegrationSummaryTile[]>(() => {
    const completed = batchRows.filter(r => r.status === "Complete" || r.status === "Delivered").length;
    const active = batchRows.filter(r => r.status === "In Progress" || r.status === "Ready for QA" || r.status === "QA In Progress").length;
    const blocked = batchRows.filter(r => r.blockedBy.length > 0).length;
    const openGaps = blockingGaps.filter(g => !g.resolved).length;
    const highRisk = blockingGaps.filter(g => !g.resolved && g.severity === "high").length;
    const rogerSummary = computeSummaryTiles();

    return [
      {
        label: "Batches Complete",
        value: completed,
        subLabel: `of ${batchRows.length} total batches`,
        color: "green",
        source: "BatchStatusContext",
      },
      {
        label: "Active Batches",
        value: active,
        subLabel: "currently in delivery",
        color: "blue",
        source: "BatchStatusContext",
      },
      {
        label: "Blocked Batches",
        value: blocked,
        subLabel: "dependency not met",
        color: blocked > 0 ? "red" : "green",
        source: "BatchStatusContext",
      },
      {
        label: "Open Governance Gaps",
        value: openGaps,
        subLabel: `${highRisk} high-risk unresolved`,
        color: openGaps > 0 ? "amber" : "green",
        source: "RogerUIMapping",
      },
      {
        label: "Roger Fields Delivered",
        value: `${fieldGaps.delivered}/${fieldGaps.total}`,
        subLabel: `${fieldGaps.partial} partial · ${fieldGaps.missing} missing`,
        color: fieldGaps.missing > 0 ? "amber" : "green",
        source: "DataModelGaps",
      },
      {
        label: "Data Availability Rows",
        value: dataAvailability.length,
        subLabel: "from batchModelSource",
        color: "blue",
        source: "DataModelGaps",
      },
      {
        label: "Governance Coverage",
        value: `${rogerSummary.fullyMapped}/${rogerSummary.totalScreens}`,
        subLabel: `${rogerSummary.gaps} gaps · ${rogerSummary.partial} partial`,

        color: rogerSummary.gaps > 0 ? "amber" : "green",
        source: "RogerUIMapping",
      },
      {
        label: "PI Completion",
        value: `${Math.round((piCompletion?.pi1?.pct ?? 0))}%`,

        subLabel: "PI 1 · PI 2 in progress",
        color: "blue",
        source: "BatchRoadmap",
      },
    ];
  }, [batchRows, blockingGaps, fieldGaps, dataAvailability, piCompletion]);

  // ── 6. Sync health indicators ─────────────────────────────────────────────
  const syncHealth = useMemo<SyncHealth[]>(() => {
    const ts = now.toLocaleTimeString();
    return [
      { source: "BatchStatusContext",   label: "DCT Control Panel",         status: "live",    lastSynced: ts, itemCount: batchRows.length },
      { source: "BatchRoadmap",         label: "Batch Roadmap",             status: "derived", lastSynced: ts, itemCount: batchRows.length },
      { source: "RogerUIMapping",       label: "Roger UI Data Point Mapping", status: "derived", lastSynced: ts, itemCount: blockingGaps.length },
      { source: "DataModelGaps",        label: "Data Model & Gaps",         status: "derived", lastSynced: ts, itemCount: dataAvailability.length },
      { source: "GateStatus",           label: "Gate Status",               status: "derived", lastSynced: ts, itemCount: 4 },
      { source: "BatchDeliveryTracker", label: "Batch Delivery Tracker",    status: "derived", lastSynced: ts, itemCount: batchRows.filter(r => r.status === "Complete" || r.status === "Delivered").length },
      { source: "RogerAPIEvolution",    label: "Roger API Evolution",       status: "derived", lastSynced: ts, itemCount: batchRows.length },
      { source: "BatchControlPanel",    label: "Swagger / API Inventory",   status: "live",    lastSynced: ts, itemCount: 75 },
    ];
  }, [batchRows, blockingGaps, dataAvailability, now]);

  // ── 7. Aggregate counts ───────────────────────────────────────────────────
  const completedBatches = batchRows.filter(r => r.status === "Complete" || r.status === "Delivered").length;
    const activeBatches = batchRows.filter(r => r.status === "In Progress" || r.status === "Ready for QA" || r.status === "QA In Progress").length;
  const blockedBatches = batchRows.filter(r => r.blockedBy.length > 0).length;

  return {
    batchRows,
    apiRows: [],       // populated in the page from SWAGGER_ENTRIES via BatchControlPanel import
    rogerRows: [],     // populated in the page from ROGER_DATA_POINTS via BatchControlPanel import
    blockingGaps,
    dataAvailability,
    tiles,
    syncHealth,
    lastSynced: now,
    totalBatches: batchRows.length,
    completedBatches,
    activeBatches,
    blockedBatches,
    piCompletion: {
      pi1: piCompletion?.pi1?.pct ?? 0,
      pi2: piCompletion?.pi2?.pct ?? 0,
      pi3: piCompletion?.pi3?.pct ?? 0,
      pi4: piCompletion?.pi4?.pct ?? 0,
    },
  };
}

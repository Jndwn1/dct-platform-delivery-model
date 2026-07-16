// ─────────────────────────────────────────────────────────────────────────────
// BatchStatusContext — Global Platform Status Source of Truth v4.0
//
// GOVERNANCE RULES (v4.0):
//   • Batch Status is the AUTHORITATIVE PARENT for all downstream delivery views.
//   • Control Panel is the ONLY writable source. No child component may write back.
//   • Status is LOCKED until a user explicitly selects a new value.
//   • Status persists across page refreshes, navigation, and platform reloads.
//   • Updates cascade in strict order: Delivered Work → Swagger/API → Roger UI → PO Summary.
//   • UI is locked during cascade propagation ("Updating Platform…" indicator).
//   • Rollback (status moving backward) triggers downstream re-flagging.
//   • Full audit log: batch, from, to, timestamp, user, components updated, success/failure.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext, useContext, useState, useCallback, useMemo, useEffect, useRef,
  type ReactNode,
} from "react";

// ── Core status type (10 governed values) ────────────────────────────────────

export type BatchStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Ready for QA"
  | "QA In Progress"
  | "Delivered"
  | "Demo Ready"
  | "MVP"
  | "Stretch"
  | "Complete"
  | "New"
  | "Committed"
  | "Done"
  | "On Hold"
  | "Post-MVP";

// Status ordering for rollback detection (higher index = more advanced)
const STATUS_ORDER: BatchStatus[] = [
  "Not Started",
  "New",
  "On Hold",
  "In Progress",
  "Blocked",
  "Ready for QA",
  "QA In Progress",
  "Demo Ready",
  "Committed",
  "MVP",
  "Stretch",
  "Post-MVP",
  "Delivered",
  "Done",
  "Complete",
];

export function isRollback(from: BatchStatus, to: BatchStatus): boolean {
  const fi = STATUS_ORDER.indexOf(from);
  const ti = STATUS_ORDER.indexOf(to);
  return fi > ti && fi !== -1 && ti !== -1;
}

// ── Batch key map ─────────────────────────────────────────────────────────────

export interface BatchStatusMap {
  "foundation-core": BatchStatus;
  "1": BatchStatus;
  "2": BatchStatus;
  "2a": BatchStatus;
  "3": BatchStatus;
  "4": BatchStatus;
  "5": BatchStatus;
  "6": BatchStatus;
  "7": BatchStatus;
  "8": BatchStatus;
  "8-pdc": BatchStatus;
  "8-tdc": BatchStatus;
  "9": BatchStatus;
  "9-pdc": BatchStatus;
  "9-tdc": BatchStatus;
  "10": BatchStatus;
  "11": BatchStatus;
  // PI 2 Committed
  "12": BatchStatus;
  // PI 2 Stretch
  "13": BatchStatus;
  "16": BatchStatus;
  // PI 3 MVP
  "17": BatchStatus;
  "20": BatchStatus;
  "21": BatchStatus;
  "22": BatchStatus;
  "23": BatchStatus;
  "26": BatchStatus;
  "28": BatchStatus;
  "29": BatchStatus;
  "31": BatchStatus;
  "33": BatchStatus;
  "39": BatchStatus;
  // New batches from updated calendar
  "42": BatchStatus;
  "43": BatchStatus;
  "9a": BatchStatus;
  // PI 4 batches (Roadmap v8)
  "19": BatchStatus;
  "40": BatchStatus;
  "35": BatchStatus;
  "26-tdc": BatchStatus;
}

export type BatchKey = keyof BatchStatusMap;

// ── Batch labels ─────────────────────────────────────────────────────────────

export const BATCH_LABELS: Record<BatchKey, string> = {
  "foundation-core": "Foundation Core",
  "1": "Batch 1 — File Ingestion & Initial Storage",
  "2": "Batch 2 — Normalization & Cross-LOB Taxonomy",
  "2a": "Batch 2A — Orchestrator Contract Enforcement & Classification",
  "3": "Batch 3 — Tax Domain Authority & Tax Taxonomy",
  "4": "Batch 4 — AI Tax Mapping & Explainability",
  "5": "Batch 5 — Entity Identity & Structure",
  "6": "Batch 6 — Practitioner Review, Adjustments & Lock",
  "7": "Batch 7 — Client Tax Profile & Eligibility",
  "8": "Batch 8 — Exceptions & Remediation",
  "8-pdc": "Batch 8 | PDC — Exception & Remediation",
  "8-tdc": "Batch 8 | TDC — Exceptions & Remediation",
  "9": "Batch 9 — Roger Gateway & Governed Consumer Access Layer (PDC) / TDC Rollforward ON HOLD",
  "9-pdc": "Batch 9 | PDC — Roger Gateway & Governed Consumer Access Layer",
  "9-tdc": "Batch 9 | TDC — Rollforward & Prior Year Intelligence (ON HOLD — absorbed by B31)",
  "10": "Batch 10 — Return Assembly, Filing & Lineage Closure",
  "11": "Batch 11 — Learning Governance & Model Evolution",
  "12": "Batch 12 — Engagement Identity, Reference Data & TIM Reconciliation",
  "13": "Batch 13 — Platform Reference & Document Provenance",
  "16": "Batch 16 — Audit Trail & Lineage Governance",
  "17": "Batch 17 — Decision Support — Overrides, Evidence & Workpapers",
  "20": "Batch 20 — Firm Governance & Professional Standards",
  "21": "Batch 21 — Quality Control",
  "22": "Batch 22 — Client Communication & Outstanding Items",
  "23": "Batch 23 — Benchmark & Peer Analytics",
  "26": "Batch 26 — Entity Constituents & Allocations (PDC — MVP)",
  "28": "Batch 28 — Tax Workpaper & Provision Schedules",
  "29": "Batch 29 — Consolidated Return Assembly",
  "31": "Batch 31 — Legacy Tool Prior Year Ingestion & Data Housing",
  "33": "Batch 33 — State Reference, Apportionment, Payments, NOL/Credit, Forms, TX Franchise",
  "39": "Batch 39 — Calculation Report",
  "42": "Batch 42 — Tax Rules Framework & Book-to-Tax Adjustment Rules",
  "43": "Batch 43 — Practitioner Book & Reclass Adjustments",
  "9a": "Batch 9A — Data Gateway (IMS, CDS, DUO)",
  // PI 4 batches (Roadmap v8)
  "19": "Batch 19 — Audit Tax-Expense Cross-LOB Outbound",
  "40": "Batch 40 — Client-Level Line Mapping Reuse",
  "35": "Batch 35 — S-Corp Specialization",
  "26-tdc": "Batch 26 | TDC — Entity Constituents & Allocations (TDC — PI 4)",
};

// ── Dependency map ────────────────────────────────────────────────────────────

export const BATCH_DEPENDENCIES: Record<BatchKey, BatchKey[]> = {
  "foundation-core": ["1"],
  "1": ["2", "2a"],
  "2": ["3"],
  "2a": ["3"],
  "3": ["4", "5"],
  "4": ["6"],
  "5": ["6"],
  "6": ["7"],
  "7": ["8", "8-pdc", "8-tdc"],
  "8": ["9", "9-pdc", "9-tdc"],
  "8-pdc": ["9-pdc"],
  "8-tdc": ["9-tdc"],
  "9": ["10"],
  "9-pdc": ["10"],
  "9-tdc": ["10"],
  "10": ["11", "12"],
  "11": [],
  "12": ["13"],
  "13": ["16"],
  "16": ["17", "20", "28", "31", "33"],
  "17": ["21"],
  "20": ["21"],
  "21": [],
  "22": [],
  "23": [],
  "26": ["29"],
  "28": ["17", "29"],
  "29": ["33"],
  "31": ["33"],
  "33": ["39"],
  "39": [],
  "42": ["17", "28"],
  "43": ["11"],
  "9a": ["31"],
  // PI 4 batches (Roadmap v8)
  "19": [],
  "40": [],
  "35": [],
  "26-tdc": [],
};

// ── Cascade step definitions ──────────────────────────────────────────────────

export type CascadeStep = 1 | 2 | 3 | 4;

export const CASCADE_STEPS: Record<CascadeStep, { label: string; description: string }> = {
  1: { label: "Delivered Work by Batch",    description: "Updating batch status pill, delivery summary, progress indicators, timeline markers, and completion metrics" },
  2: { label: "Swagger / API Coverage",     description: "Updating endpoint delivery statuses, coverage metrics, API readiness indicators, and batch API completion summaries" },
  3: { label: "Roger UI Data Availability", description: "Updating UI readiness indicators, data availability flags, Roger contract readiness, and entity-level readiness displays" },
  4: { label: "PO Status Summary",          description: "Updating executive delivery metrics, batch rollup summaries, PI readiness calculations, and leadership dashboards" },
};

// ── Derived status types ──────────────────────────────────────────────────────

export type GateStatusValue   = "Complete" | "In Progress" | "Locked";
export type ReadinessValue    = "ready" | "partial" | "blocked";
export type AgentStatusValue  = "Not Started" | "In Progress" | "Complete";

export interface DerivedGates {
  g1: GateStatusValue; // Schema Lock
  g2: GateStatusValue; // Invariant Lock
  g3: GateStatusValue; // Contract Publication
  g4: GateStatusValue; // Lineage Closure
}

export interface DerivedReadiness {
  demo:     Record<BatchKey, ReadinessValue>;
  qa:       Record<BatchKey, ReadinessValue>;
  api:      Record<BatchKey, ReadinessValue>;
  contract: Record<BatchKey, ReadinessValue>;
  agent:    Record<BatchKey, AgentStatusValue>;
}

export interface PICompletion {
  pi1: { total: number; complete: number; pct: number };
  pi2: { total: number; complete: number; pct: number };
  pi3: { total: number; complete: number; pct: number };
  pi4: { total: number; complete: number; pct: number };
  overall: { total: number; complete: number; pct: number };
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  timestamp: string;          // ISO string
  batch: BatchKey;
  from: BatchStatus;
  to: BatchStatus;
  user: string;               // "Platform User" or future auth user
  isRollback: boolean;        // true if status moved backward
  rollbackImpact: BatchKey[]; // downstream batches flagged by rollback
  cascadeSteps: CascadeStep[];
  derivedUpdates: string[];
  syncSuccess: boolean;
  failedComponents: string[]; // empty on success
}

// Legacy alias for backward compatibility
export type SyncLogEntry = AuditLogEntry;

// ── Default initial state ─────────────────────────────────────────────────────

// DEFAULT_STATUS reflects Roadmap v8 (updated July 2026)
// PI 1 — Complete | PI 2 — COMPLETE (July 2026) | PI 3 — ACTIVE (7/13–9/15) | PI 4 — Future
const DEFAULT_STATUS: BatchStatusMap = {
  // ── PI 1 — Complete ──────────────────────────────────────────────────────
  "foundation-core": "Complete",
  "1": "Complete",
  "2": "Complete",
  "2a": "Complete",
  "3": "Complete",
  // ── PI 2 — COMPLETE (as of July 2026) ─────────────────────────────────────────
  "4": "Complete",
  "5": "Complete",
  "6": "Complete",
  "7": "Complete",
  "8": "Complete",
  "8-pdc": "Complete",
  "8-tdc": "Complete",
  "9": "Complete",      // B9 PDC — Roger Gateway delivered
  "9-pdc": "Complete",
  "9-tdc": "On Hold",  // B9 TDC — Rollforward ON HOLD, absorbed by B31
  "10": "Complete",    // B10 — Return Assembly delivered 6/11
  "11": "Complete",    // B11 — Learning Governance, 6/12–6/22
  "43": "Complete",    // B43 — Practitioner Book & Reclass, currently in flight
  // ── PI 2 Stretch — Complete ──────────────────────────────────────────────────────────
  "13": "Complete",    // B13 — Platform Reference & Document Provenance (PI 2 Stretch)
  "16": "Complete",    // B16 PDC+TDC — Audit Trail & Lineage Governance (PI 2 Stretch)
  "12": "On Hold",     // B12 — Engagement Identity (ON HOLD per v7)
  // ── PI 3 — ACTIVE (7/13–9/15) ─────────────────────────────────────────
  "20": "In Progress", // B20 — Firm Governance & Professional Standards
  "42": "In Progress", // B42 — Tax Rules Framework & Book-to-Tax Adjustment Rules (6/17–6/25)
  "21": "In Progress", // B21 — Quality Control (PDC MVP)
  "28": "In Progress", // B28 — Tax Workpaper & Provision Schedules
  "9a": "In Progress", // B9A — Data Gateway (IMS, CDS, DUO)
  "31": "In Progress", // B31 — Legacy Tool Prior Year Ingestion (PDC + TDC)
  "17": "In Progress", // B17 — Decision Support — Overrides, Evidence & Workpapers
  "26": "In Progress", // B26 — Entity Constituents & Allocations (PDC MVP)
  "29": "Committed",   // B29 — Consolidated Return Assembly
  "39": "Committed",   // B39 — Calculation Report
  "33": "Stretch",     // B33 — State Reference, Apportionment, Payments, NOL/Credit (PI 3 Stretch)
  // ── PI 4 — Future (Post-Pilot) ───────────────────────────────────────────
  "19": "Not Started",  // B19 — Audit Tax-Expense Cross-LOB Outbound (9/21–9/28)
  "40": "Not Started",  // B40 — Client-Level Line Mapping Reuse
  "35": "Not Started",  // B35 — S-Corp Specialization
  "26-tdc": "Not Started", // B26 TDC — Entity Constituents & Allocations (TDC)
  // ── Post-MVP / Removed from MVP scope ────────────────────────────────────
  "22": "Not Started",  // B22 — Client Communication (Post-MVP, future PI)
  "23": "Not Started",  // B23 — Benchmark & Peer Analytics (Post-MVP, future PI)
};

const STORAGE_KEY     = "dct_batch_status_v7"; // v7: PI 2 Complete 100%, PI 3 Active — On Hold batches excluded from PI 2 membership
const AUDITLOG_KEY    = "dct_audit_log_v7";
const MAX_LOG_ENTRIES = 50;

// ── PI membership ─────────────────────────────────────────────────────────────

// PI_MEMBERSHIP reflects Roadmap v8 (updated July 2026) — 9-tdc & 12 excluded from PI 2 (On Hold)
const PI_MEMBERSHIP: Record<string, BatchKey[]> = {
  pi1:  ["foundation-core", "1", "2", "2a", "3"],
  pi2:  ["4", "5", "6", "7", "8", "8-pdc", "8-tdc", "9", "9-pdc", "10", "11", "43", "13", "16"], // 9-tdc & 12 excluded (On Hold)
  pi3:  ["20", "42", "21", "28", "9a", "31", "17", "26", "29", "39", "33"],
  pi4:  ["19", "40", "35", "26-tdc"],
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadFromStorage(): BatchStatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BatchStatusMap>;
      // Validate each value is a known status; fall back to default if not
      const valid: Partial<BatchStatusMap> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (STATUS_ORDER.includes(v as BatchStatus)) {
          valid[k as BatchKey] = v as BatchStatus;
        }
      }
      return { ...DEFAULT_STATUS, ...valid };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATUS };
}

function saveToStorage(map: BatchStatusMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function loadAuditLog(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDITLOG_KEY);
    if (raw) return JSON.parse(raw) as AuditLogEntry[];
  } catch { /* ignore */ }
  return [];
}

function saveAuditLog(log: AuditLogEntry[]) {
  try { localStorage.setItem(AUDITLOG_KEY, JSON.stringify(log.slice(-MAX_LOG_ENTRIES))); } catch { /* ignore */ }
}

// ── Derived helpers ───────────────────────────────────────────────────────────

// "Active" means the batch is being worked on (not yet delivered/complete)
function isActive(s: BatchStatus): boolean {
  return s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready"
    || s === "MVP" || s === "Stretch" || s === "Committed" || s === "New";
}

function isDelivered(s: BatchStatus): boolean {
  return s === "Delivered" || s === "Complete" || s === "Done";
}

export function deriveGateStatus(statuses: BatchStatusMap): DerivedGates {
  const b1 = statuses["1"];
  const b2 = statuses["2"];
  const b3 = statuses["3"];
  const b4 = statuses["4"];
  const b5 = statuses["5"];
  const b6 = statuses["6"];
  const b8 = statuses["8"];

  const g1: GateStatusValue = isDelivered(b1) ? "Complete" : isActive(b1) ? "In Progress" : "Locked";
  const g2: GateStatusValue = (isDelivered(b2) && isDelivered(b3)) ? "Complete"
    : (isActive(b2) || isActive(b3) || isDelivered(b2)) ? "In Progress" : "Locked";
  const g3: GateStatusValue = (isDelivered(b4) && isDelivered(b5)) ? "Complete"
    : (isActive(b4) || isActive(b5) || isDelivered(b4)) ? "In Progress" : "Locked";
  const g4: GateStatusValue = (isDelivered(b6) && isDelivered(b8)) ? "Complete"
    : (isActive(b6) || isActive(b8) || isDelivered(b6)) ? "In Progress" : "Locked";

  return { g1, g2, g3, g4 };
}

export function deriveAgentStatus(s: BatchStatus): AgentStatusValue {
  if (isDelivered(s)) return "Complete";
  if (isActive(s)) return "In Progress";
  return "Not Started";
}

export function deriveDemoReadiness(s: BatchStatus): ReadinessValue {
  if (s === "Complete" || s === "Demo Ready" || s === "Delivered") return "ready";
  if (isActive(s)) return "partial";
  return "blocked";
}

export function deriveQaReadiness(s: BatchStatus): ReadinessValue {
  if (isDelivered(s)) return "ready";
  if (s === "Ready for QA" || s === "QA In Progress") return "partial";
  return "blocked";
}

export function deriveApiReadiness(s: BatchStatus): ReadinessValue {
  if (isDelivered(s)) return "ready";
  if (isActive(s)) return "partial";
  return "blocked";
}

export function deriveContractStatus(s: BatchStatus): ReadinessValue {
  if (isDelivered(s)) return "ready";
  if (s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready") return "partial";
  return "blocked";
}

function deriveAllReadiness(statuses: BatchStatusMap): DerivedReadiness {
  const keys = Object.keys(statuses) as BatchKey[];
  const build = <T,>(fn: (s: BatchStatus) => T) =>
    Object.fromEntries(keys.map(k => [k, fn(statuses[k])])) as Record<BatchKey, T>;

  return {
    demo:     build(deriveDemoReadiness),
    qa:       build(deriveQaReadiness),
    api:      build(deriveApiReadiness),
    contract: build(deriveContractStatus),
    agent:    build(deriveAgentStatus),
  };
}

function derivePICompletion(statuses: BatchStatusMap): PICompletion {
  const calc = (keys: BatchKey[]) => {
    const total    = keys.length;
    const complete = keys.filter(k => isDelivered(statuses[k])).length;
    return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 };
  };
  const all = Object.keys(statuses) as BatchKey[];
  const allComplete = all.filter(k => isDelivered(statuses[k])).length;
  return {
    pi1: calc(PI_MEMBERSHIP.pi1),
    pi2: calc(PI_MEMBERSHIP.pi2),
    pi3: calc(PI_MEMBERSHIP.pi3),
    pi4: calc(PI_MEMBERSHIP.pi4),
    overall: { total: all.length, complete: allComplete, pct: Math.round((allComplete / all.length) * 100) },
  };
}

function deriveUnlocked(prev: BatchStatusMap, next: BatchStatusMap): BatchKey[] {
  const unlocked: BatchKey[] = [];
  const allKeys = Object.keys(next) as BatchKey[];
  for (const key of allKeys) {
    if (!isDelivered(prev[key]) && !isDelivered(next[key])) {
      const deps = Object.entries(BATCH_DEPENDENCIES)
        .filter(([, children]) => (children as BatchKey[]).includes(key))
        .map(([parent]) => parent as BatchKey);
      const wasBlocked = !deps.every(d => isDelivered(prev[d]));
      const nowUnlocked = deps.every(d => isDelivered(next[d]));
      if (wasBlocked && nowUnlocked && deps.length > 0) unlocked.push(key);
    }
  }
  return unlocked;
}

function deriveRollbackImpact(batch: BatchKey, next: BatchStatusMap): BatchKey[] {
  // Find all downstream batches that depended on this one being delivered
  const impacted: BatchKey[] = [];
  const queue = [...(BATCH_DEPENDENCIES[batch] ?? [])];
  const visited = new Set<BatchKey>();
  while (queue.length > 0) {
    const k = queue.shift()!;
    if (visited.has(k)) continue;
    visited.add(k);
    if (isActive(next[k]) || isDelivered(next[k])) {
      impacted.push(k);
      queue.push(...(BATCH_DEPENDENCIES[k] ?? []));
    }
  }
  return impacted;
}

// ── Cascade state ─────────────────────────────────────────────────────────────

export interface CascadeState {
  active: boolean;                  // true while cascade is running
  batch: BatchKey | null;           // which batch triggered it
  currentStep: CascadeStep | null;  // step currently executing
  completedSteps: CascadeStep[];    // steps already done
  isRollback: boolean;              // whether this is a backward change
  rollbackImpact: BatchKey[];       // impacted downstream batches
  error: string | null;             // error message if any step failed
}

const IDLE_CASCADE: CascadeState = {
  active: false, batch: null, currentStep: null,
  completedSteps: [], isRollback: false, rollbackImpact: [], error: null,
};

// ── Context value type ────────────────────────────────────────────────────────

export interface BatchStatusContextValue {
  // Core state (read-only for consumers)
  statuses: BatchStatusMap;
  lastUpdated: string | null;
  auditLog: SyncLogEntry[];          // alias: syncLog
  syncLog: SyncLogEntry[];           // backward compat

  // Cascade state (read-only for consumers)
  cascade: CascadeState;

  // Derived (auto-computed, always in sync)
  gates: DerivedGates;
  readiness: DerivedReadiness;
  piCompletion: PICompletion;
  unlockedBatches: BatchKey[];

  // Actions — Control Panel ONLY
  setStatus: (batch: BatchKey, status: BatchStatus) => void;
  resetAll: () => void;
  clearSyncLog: () => void;
}

const BatchStatusContext = createContext<BatchStatusContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function BatchStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<BatchStatusMap>(loadFromStorage);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(loadAuditLog);
  const [unlockedBatches, setUnlockedBatches] = useState<BatchKey[]>([]);
  const [cascade, setCascade] = useState<CascadeState>(IDLE_CASCADE);
  const cascadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived values — recomputed whenever statuses change
  const gates        = useMemo(() => deriveGateStatus(statuses), [statuses]);
  const readiness    = useMemo(() => deriveAllReadiness(statuses), [statuses]);
  const piCompletion = useMemo(() => derivePICompletion(statuses), [statuses]);

  // Clear unlocked highlight after 4 seconds
  useEffect(() => {
    if (unlockedBatches.length === 0) return;
    const t = setTimeout(() => setUnlockedBatches([]), 4000);
    return () => clearTimeout(t);
  }, [unlockedBatches]);

  // Cleanup cascade timers on unmount
  useEffect(() => {
    return () => { if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current); };
  }, []);

  const setStatus = useCallback((batch: BatchKey, status: BatchStatus) => {
    setStatuses(prev => {
      const from = prev[batch];
      if (from === status) return prev; // LOCK: no-op if same status

      const next = { ...prev, [batch]: status };

      // Persist immediately — status is locked from this point
      saveToStorage(next);

      const ts = new Date().toISOString();
      setLastUpdated(ts);

      const rollback = isRollback(from, status);
      const rollbackImpact = rollback ? deriveRollbackImpact(batch, next) : [];
      const unlocked = deriveUnlocked(prev, next);
      if (unlocked.length > 0) setUnlockedBatches(unlocked);

      // Build audit entry
      const derivedUpdates = [
        "Step 1: Delivered Work — batch status pill, delivery summary, progress indicators, timeline markers",
        "Step 2: Swagger/API Coverage — endpoint statuses, coverage metrics, API readiness, consumer guide alignment",
        "Step 3: Roger UI — UI readiness indicators, data availability flags, contract readiness, entity readiness",
        "Step 4: PO Status Summary — executive metrics, batch rollup, PI readiness, completion percentages",
        "Gate status recalculated",
        "PI completion recalculated",
        "Dependency unlock check run",
        "Sidebar badges refreshed",
        ...(rollback ? [`ROLLBACK DETECTED: ${rollbackImpact.map(k => k === "foundation-core" ? "FC" : `B${k}`).join(", ")} flagged`] : []),
      ];

      const entry: AuditLogEntry = {
        timestamp: ts,
        batch,
        from,
        to: status,
        user: "Platform User",
        isRollback: rollback,
        rollbackImpact,
        cascadeSteps: [1, 2, 3, 4],
        derivedUpdates,
        syncSuccess: true,
        failedComponents: [],
      };

      setAuditLog(prev2 => {
        const updated = [...prev2, entry].slice(-MAX_LOG_ENTRIES);
        saveAuditLog(updated);
        return updated;
      });

      // ── Cascade sequencer ──────────────────────────────────────────────────
      // Simulate the 4-step ordered cascade with UI lock.
      // Each step completes in ~400ms; total ~1.6s well within the 2s SLA.
      if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);

      setCascade({
        active: true, batch, currentStep: 1,
        completedSteps: [], isRollback: rollback, rollbackImpact, error: null,
      });

      const runStep = (step: CascadeStep, completed: CascadeStep[]) => {
        setCascade(c => ({ ...c, currentStep: step, completedSteps: completed }));
        const nextStep = (step + 1) as CascadeStep;
        const delay = 380;
        cascadeTimerRef.current = setTimeout(() => {
          if (step < 4) {
            runStep(nextStep, [...completed, step]);
          } else {
            // All steps done — release UI lock
            setCascade({
              active: false, batch, currentStep: null,
              completedSteps: [1, 2, 3, 4], isRollback: rollback, rollbackImpact, error: null,
            });
            // Auto-clear after 3 seconds
            cascadeTimerRef.current = setTimeout(() => setCascade(IDLE_CASCADE), 3000);
          }
        }, delay);
      };

      // Start cascade after a brief tick so React can flush the status update first
      cascadeTimerRef.current = setTimeout(() => runStep(1, []), 50);

      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    if (cascadeTimerRef.current) clearTimeout(cascadeTimerRef.current);
    saveToStorage(DEFAULT_STATUS);
    setStatuses({ ...DEFAULT_STATUS });
    const ts = new Date().toISOString();
    setLastUpdated(ts);
    const entry: AuditLogEntry = {
      timestamp: ts,
      batch: "foundation-core",
      from: "Complete",
      to: "Complete",
      user: "Platform User",
      isRollback: false,
      rollbackImpact: [],
      cascadeSteps: [1, 2, 3, 4],
      derivedUpdates: ["Full reset to default state — all downstream views refreshed"],
      syncSuccess: true,
      failedComponents: [],
    };
    setAuditLog(prev => {
      const updated = [...prev, entry].slice(-MAX_LOG_ENTRIES);
      saveAuditLog(updated);
      return updated;
    });
    setCascade(IDLE_CASCADE);
  }, []);

  const clearSyncLog = useCallback(() => {
    setAuditLog([]);
    saveAuditLog([]);
  }, []);

  return (
    <BatchStatusContext.Provider value={{
      statuses, lastUpdated, auditLog, syncLog: auditLog,
      cascade, gates, readiness, piCompletion, unlockedBatches,
      setStatus, resetAll, clearSyncLog,
    }}>
      {children}
    </BatchStatusContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBatchStatus() {
  const ctx = useContext(BatchStatusContext);
  if (!ctx) throw new Error("useBatchStatus must be used inside BatchStatusProvider");
  return ctx;
}

// ── Live snapshot serializer (for Ask Buddy / server injection) ──────────────

export interface LiveBatchSnapshot {
  asOf: string;                          // ISO timestamp of last update
  statuses: Record<string, string>;      // batchKey → status string
  gates: { g1: string; g2: string; g3: string; g4: string };
  piCompletion: {
    pi1: { total: number; complete: number; pct: number };
    pi2: { total: number; complete: number; pct: number };
    pi3: { total: number; complete: number; pct: number };
    pi4: { total: number; complete: number; pct: number };
    overall: { total: number; complete: number; pct: number };
  };
  completedBatches: string[];            // labels of delivered/complete batches
  activeBatches: string[];               // labels of in-progress batches
  blockedBatches: string[];              // labels of blocked batches
  plannedBatches: string[];              // labels of not-started batches
}

/** Build a serializable snapshot of the current live platform state for server-side injection */
export function buildLiveSnapshot(
  statuses: BatchStatusMap,
  gates: DerivedGates,
  piCompletion: PICompletion,
  lastUpdated: string | null,
): LiveBatchSnapshot {
  const keys = Object.keys(statuses) as BatchKey[];
  const completedBatches: string[] = [];
  const activeBatches: string[] = [];
  const blockedBatches: string[] = [];
  const plannedBatches: string[] = [];

  for (const k of keys) {
    const s = statuses[k];
    const label = BATCH_LABELS[k] ?? k;
    if (isDelivered(s)) completedBatches.push(label);
    else if (s === "Blocked") blockedBatches.push(label);
    else if (isActive(s)) activeBatches.push(label);
    else plannedBatches.push(label);
  }

  return {
    asOf: lastUpdated ?? new Date().toISOString(),
    statuses: statuses as unknown as Record<string, string>,
    gates,
    piCompletion,
    completedBatches,
    activeBatches,
    blockedBatches,
    plannedBatches,
  };
}

// ── Status conversion helpers ─────────────────────────────────────────────────

/** Map context BatchStatus → dctData BatchStatus (for BatchRoadmap) */
export function contextToDctStatus(s: BatchStatus): "ACTIVE" | "GATE_PENDING" | "PLANNED" | "CLOSED" {
  if (s === "Complete" || s === "Delivered") return "CLOSED";
  if (s === "Demo Ready" || s === "QA In Progress" || s === "Ready for QA") return "GATE_PENDING";
  if (s === "In Progress" || s === "Blocked" || s === "MVP" || s === "Stretch") return "ACTIVE";
  return "PLANNED";
}

/** Map context BatchStatus → completion percentage */
export function contextToCompletionPct(s: BatchStatus): number {
  if (s === "Complete") return 100;
  if (s === "Delivered") return 95;
  if (s === "Demo Ready") return 85;
  if (s === "QA In Progress") return 75;
  if (s === "Ready for QA") return 65;
  if (s === "In Progress" || s === "MVP" || s === "Stretch") return 50;
  if (s === "Blocked") return 30;
  return 0;
}

/** Map context BatchStatus → sidebar badge label and color */
export function contextToSidebarBadge(s: BatchStatus): { label: string; color: string; tooltip: string } | null {
  if (s === "Complete") return { label: "Done", color: "#059669", tooltip: "Complete — all gate criteria met and batch delivered" };
  if (s === "Delivered") return { label: "Delivered", color: "#0d9488", tooltip: "Delivered — batch accepted and in production" };
  if (s === "Demo Ready") return { label: "Demo", color: "#7c3aed", tooltip: "Demo Ready — validated and ready for stakeholder demo" };
  if (s === "QA In Progress") return { label: "QA", color: "#9333ea", tooltip: "QA In Progress — gate verification underway" };
  if (s === "Ready for QA") return { label: "QA Ready", color: "#8b5cf6", tooltip: "Ready for QA — development complete, awaiting gate review" };
  if (s === "In Progress") return { label: "Active", color: "#2563eb", tooltip: "In Progress — actively in development" };
  if (s === "Blocked") return { label: "Blocked", color: "#dc2626", tooltip: "Blocked — dependency or issue preventing progress" };
  if (s === "MVP") return { label: "MVP", color: "#ea580c", tooltip: "MVP — minimum viable scope committed for this PI" };
  if (s === "Stretch") return { label: "Stretch", color: "#d97706", tooltip: "Stretch — targeted but not committed; delivered if capacity allows" };
  if (s === "New") return { label: "New", color: "#0ea5e9", tooltip: "New — recently added to the batch model, not yet started" };
  if (s === "Committed") return { label: "Committed", color: "#2563eb", tooltip: "Committed — scope locked, delivery in progress" };
  if (s === "Done") return { label: "Done", color: "#16a34a", tooltip: "Done — batch work complete and accepted" };
  if (s === "On Hold") return { label: "On Hold", color: "#94a3b8", tooltip: "On Hold — paused pending dependency resolution or PI reprioritization" };
  if (s === "Post-MVP") return { label: "Post-MVP", color: "#a855f7", tooltip: "Post-MVP — deferred beyond current PI MVP scope" };
  return null;
}

/** Map context BatchStatus → Gantt calendar status */
export function contextToCalendarStatus(s: BatchStatus): "Done" | "MVP" | "Committed" | "Stretch" {
  if (s === "Complete" || s === "Delivered") return "Done";
  if (s === "Demo Ready" || s === "QA In Progress" || s === "Ready for QA") return "MVP";
  if (s === "In Progress") return "Committed";
  if (s === "Stretch") return "Stretch";
  return "Stretch";
}

// ── Status style helpers ──────────────────────────────────────────────────────

export const STATUS_STYLES: Record<BatchStatus, {
  bg: string; text: string; border: string; dot: string; label: string;
}> = {
  "Not Started":   { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8", label: "Not Started" },
  "In Progress":   { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", label: "In Progress" },
  "Blocked":       { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", dot: "#ef4444", label: "Blocked" },
  "Ready for QA":  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Ready for QA" },
  "QA In Progress":{ bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff", dot: "#a855f7", label: "QA In Progress" },
  "Delivered":     { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", dot: "#10b981", label: "Delivered" },
  "Demo Ready":    { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe", dot: "#6366f1", label: "Demo Ready" },
  "MVP":           { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", dot: "#f97316", label: "MVP" },
  "Stretch":       { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#f59e0b", label: "Stretch" },
  "Complete":      { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Complete" },
  "New":           { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", dot: "#0ea5e9", label: "New" },
  "Committed":     { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", dot: "#2563eb", label: "Committed" },
  "Done":          { bg: "#f0fdf4", text: "#14532d", border: "#86efac", dot: "#16a34a", label: "Done" },
  "On Hold":       { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", dot: "#94a3b8", label: "On Hold" },
  "Post-MVP":      { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff", dot: "#a855f7", label: "Post-MVP" },
};

// ── Readiness style helpers ───────────────────────────────────────────────────

export const READINESS_STYLES: Record<ReadinessValue, {
  bg: string; text: string; border: string; label: string; dot: string;
}> = {
  ready:   { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Ready",   dot: "#22c55e" },
  partial: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Partial", dot: "#3b82f6" },
  blocked: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Blocked", dot: "#ef4444" },
};

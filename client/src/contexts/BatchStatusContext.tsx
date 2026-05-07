// ─────────────────────────────────────────────────────────────────────────────
// BatchStatusContext — Global Platform Status Source of Truth v3.0
//
// PROTECTION RULE: This is the ONLY place batch/platform statuses are stored.
// All screens MUST read from this context. No hardcoding allowed.
// Persisted to localStorage so status survives page refresh and navigation.
//
// Extended in v3.0 to cover:
//   • Batch status (Planned → Dev → In Review → Complete)
//   • Feature status per batch
//   • Gate status (derived)
//   • Demo readiness (derived)
//   • QA readiness (derived)
//   • API readiness (derived)
//   • Contract validation status (derived)
//   • PI completion summary (derived)
//   • lastUpdated timestamp
//   • syncLog (audit trail of updates)
//   • Dependency unlock tracking
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext, useContext, useState, useCallback, useMemo, useEffect,
  type ReactNode,
} from "react";

// ── Core status types ────────────────────────────────────────────────────────

export type BatchStatus = "Planned" | "Dev" | "In Review" | "Complete";

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
  "9": BatchStatus;
  "10": BatchStatus;
  "11": BatchStatus;
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
  "9": "Batch 9 — PDC IMS Integration & Prior Year Retrieval / TDC Rollforward & Prior Year Intelligence",
  "10": "Batch 10 — Return Assembly, Filing & Lineage Closure",
  "11": "Batch 11 — Learning Governance & Model Evolution",
};

// ── Dependency map — which batches unlock when a predecessor completes ────────

export const BATCH_DEPENDENCIES: Record<BatchKey, BatchKey[]> = {
  "foundation-core": ["1"],
  "1": ["2", "2a"],
  "2": ["3"],
  "2a": ["3"],
  "3": ["4", "5"],
  "4": ["6"],
  "5": ["6"],
  "6": ["7"],
  "7": ["8"],
  "8": ["9"],
  "9": ["10"],
  "10": ["11"],
  "11": [],
};

// ── Derived status types ─────────────────────────────────────────────────────

export type GateStatusValue = "Complete" | "In Progress" | "Locked";
export type ReadinessValue  = "ready" | "partial" | "blocked";
export type AgentStatusValue = "Not Started" | "In Progress" | "Complete";

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

export interface UnlockedBatches {
  unlocked: BatchKey[];   // newly unblocked by latest change
  blocked:  BatchKey[];   // still waiting on predecessors
}

// ── Sync log entry ────────────────────────────────────────────────────────────

export interface SyncLogEntry {
  timestamp: string;       // ISO string
  batch: BatchKey;
  from: BatchStatus;
  to: BatchStatus;
  derivedUpdates: string[]; // human-readable list of what re-derived
}

// ── Default initial state ────────────────────────────────────────────────────

const DEFAULT_STATUS: BatchStatusMap = {
  "foundation-core": "Complete",
  "1": "Complete",
  "2": "Dev",
  "2a": "Dev",
  "3": "Planned",
  "4": "Planned",
  "5": "Planned",
  "6": "Planned",
  "7": "Planned",
  "8": "Planned",
  "9": "Planned",
  "10": "Planned",
  "11": "Planned",
};

const STORAGE_KEY    = "dct_batch_status_v3";
const SYNCLOG_KEY    = "dct_sync_log_v3";
const MAX_LOG_ENTRIES = 50;

// ── PI membership ─────────────────────────────────────────────────────────────

const PI_MEMBERSHIP: Record<string, BatchKey[]> = {
  pi1: ["foundation-core", "1", "2", "2a"],
  pi2: ["3", "4", "5", "6", "7"],
  pi3: ["8", "9", "10"],
  pi4: ["11"],
};

// ── Storage helpers ──────────────────────────────────────────────────────────

function loadFromStorage(): BatchStatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BatchStatusMap>;
      return { ...DEFAULT_STATUS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATUS };
}

function saveToStorage(map: BatchStatusMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function loadSyncLog(): SyncLogEntry[] {
  try {
    const raw = localStorage.getItem(SYNCLOG_KEY);
    if (raw) return JSON.parse(raw) as SyncLogEntry[];
  } catch { /* ignore */ }
  return [];
}

function saveSyncLog(log: SyncLogEntry[]) {
  try { localStorage.setItem(SYNCLOG_KEY, JSON.stringify(log.slice(-MAX_LOG_ENTRIES))); } catch { /* ignore */ }
}

// ── Derived helpers ──────────────────────────────────────────────────────────

export function deriveGateStatus(statuses: BatchStatusMap): DerivedGates {
  const b1 = statuses["1"];
  const b2 = statuses["2"];
  const b3 = statuses["3"];
  const b4 = statuses["4"];
  const b5 = statuses["5"];
  const b6 = statuses["6"];
  const b8 = statuses["8"];

  const inProg = (s: BatchStatus) => s === "Dev" || s === "In Review";

  const g1: GateStatusValue = b1 === "Complete" ? "Complete" : inProg(b1) ? "In Progress" : "Locked";
  const g2: GateStatusValue = (b2 === "Complete" && b3 === "Complete") ? "Complete"
    : (inProg(b2) || inProg(b3) || b2 === "Complete") ? "In Progress" : "Locked";
  const g3: GateStatusValue = (b4 === "Complete" && b5 === "Complete") ? "Complete"
    : (inProg(b4) || inProg(b5) || b4 === "Complete") ? "In Progress" : "Locked";
  const g4: GateStatusValue = (b6 === "Complete" && b8 === "Complete") ? "Complete"
    : (inProg(b6) || inProg(b8) || b6 === "Complete") ? "In Progress" : "Locked";

  return { g1, g2, g3, g4 };
}

export function deriveAgentStatus(s: BatchStatus): AgentStatusValue {
  if (s === "Complete") return "Complete";
  if (s === "Dev" || s === "In Review") return "In Progress";
  return "Not Started";
}

export function deriveDemoReadiness(s: BatchStatus): ReadinessValue {
  if (s === "Complete") return "ready";
  if (s === "Dev" || s === "In Review") return "partial";
  return "blocked";
}

export function deriveQaReadiness(s: BatchStatus): ReadinessValue {
  if (s === "Complete") return "ready";
  if (s === "In Review") return "partial";
  return "blocked";
}

export function deriveApiReadiness(s: BatchStatus): ReadinessValue {
  if (s === "Complete") return "ready";
  if (s === "Dev" || s === "In Review") return "partial";
  return "blocked";
}

export function deriveContractStatus(s: BatchStatus): ReadinessValue {
  if (s === "Complete") return "ready";
  if (s === "In Review") return "partial";
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
    const complete = keys.filter(k => statuses[k] === "Complete").length;
    return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 };
  };
  const all = Object.keys(statuses) as BatchKey[];
  const allComplete = all.filter(k => statuses[k] === "Complete").length;
  return {
    pi1: calc(PI_MEMBERSHIP.pi1),
    pi2: calc(PI_MEMBERSHIP.pi2),
    pi3: calc(PI_MEMBERSHIP.pi3),
    pi4: calc(PI_MEMBERSHIP.pi4),
    overall: { total: all.length, complete: allComplete, pct: Math.round((allComplete / all.length) * 100) },
  };
}

function deriveUnlocked(prev: BatchStatusMap, next: BatchStatusMap): UnlockedBatches {
  const unlocked: BatchKey[] = [];
  const blocked: BatchKey[] = [];
  const allKeys = Object.keys(next) as BatchKey[];

  for (const key of allKeys) {
    // A batch is "newly unlocked" if it was Planned before and its predecessor just completed
    if (prev[key] === "Planned" && next[key] === "Planned") {
      const deps = Object.entries(BATCH_DEPENDENCIES)
        .filter(([, children]) => (children as BatchKey[]).includes(key))
        .map(([parent]) => parent as BatchKey);
      const allDepsComplete = deps.every(d => next[d] === "Complete");
      if (allDepsComplete && deps.length > 0) unlocked.push(key);
      else if (deps.length > 0) blocked.push(key);
    }
  }
  return { unlocked, blocked };
}

// ── Context value type ────────────────────────────────────────────────────────

export interface BatchStatusContextValue {
  // Core state
  statuses: BatchStatusMap;
  lastUpdated: string | null;      // ISO timestamp of last change
  syncLog: SyncLogEntry[];         // audit trail (last 50 entries)

  // Derived (auto-computed, always in sync)
  gates: DerivedGates;
  readiness: DerivedReadiness;
  piCompletion: PICompletion;
  unlockedBatches: BatchKey[];     // batches newly unblocked

  // Actions
  setStatus: (batch: BatchKey, status: BatchStatus) => void;
  resetAll: () => void;
  clearSyncLog: () => void;
}

const BatchStatusContext = createContext<BatchStatusContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function BatchStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<BatchStatusMap>(loadFromStorage);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>(loadSyncLog);
  const [unlockedBatches, setUnlockedBatches] = useState<BatchKey[]>([]);

  // Derived values — recomputed whenever statuses change
  const gates       = useMemo(() => deriveGateStatus(statuses), [statuses]);
  const readiness   = useMemo(() => deriveAllReadiness(statuses), [statuses]);
  const piCompletion = useMemo(() => derivePICompletion(statuses), [statuses]);

  // Clear unlocked highlight after 4 seconds
  useEffect(() => {
    if (unlockedBatches.length === 0) return;
    const t = setTimeout(() => setUnlockedBatches([]), 4000);
    return () => clearTimeout(t);
  }, [unlockedBatches]);

  const setStatus = useCallback((batch: BatchKey, status: BatchStatus) => {
    setStatuses(prev => {
      const from = prev[batch];
      if (from === status) return prev; // no-op

      const next = { ...prev, [batch]: status };
      saveToStorage(next);

      const ts = new Date().toISOString();
      setLastUpdated(ts);

      // Build derived update summary for the log
      const derivedUpdates: string[] = [
        "Gate status recalculated",
        "Demo readiness updated",
        "QA readiness updated",
        "API readiness updated",
        "Contract status updated",
        "PI completion recalculated",
        "Dependency unlock check run",
        "Batch Roadmap cards refreshed",
        "Calendar timeline refreshed",
        "Executive summary metrics refreshed",
        "Progress bars refreshed",
        "Sidebar badges refreshed",
      ];

      const entry: SyncLogEntry = { timestamp: ts, batch, from, to: status, derivedUpdates };
      setSyncLog(prev2 => {
        const updated = [...prev2, entry].slice(-MAX_LOG_ENTRIES);
        saveSyncLog(updated);
        return updated;
      });

      // Dependency unlock detection
      const { unlocked } = deriveUnlocked(prev, next);
      if (unlocked.length > 0) setUnlockedBatches(unlocked);

      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    saveToStorage(DEFAULT_STATUS);
    setStatuses({ ...DEFAULT_STATUS });
    const ts = new Date().toISOString();
    setLastUpdated(ts);
    const entry: SyncLogEntry = {
      timestamp: ts,
      batch: "foundation-core",
      from: "Complete",
      to: "Complete",
      derivedUpdates: ["Full reset to default state"],
    };
    setSyncLog(prev => {
      const updated = [...prev, entry].slice(-MAX_LOG_ENTRIES);
      saveSyncLog(updated);
      return updated;
    });
  }, []);

  const clearSyncLog = useCallback(() => {
    setSyncLog([]);
    saveSyncLog([]);
  }, []);

  return (
    <BatchStatusContext.Provider value={{
      statuses, lastUpdated, syncLog,
      gates, readiness, piCompletion, unlockedBatches,
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

// ── Status conversion helpers ─────────────────────────────────────────────────

/** Map context BatchStatus → dctData BatchStatus (for BatchRoadmap) */
export function contextToDctStatus(s: BatchStatus): "ACTIVE" | "GATE_PENDING" | "PLANNED" | "CLOSED" {
  if (s === "Complete") return "CLOSED";
  if (s === "Dev") return "ACTIVE";
  if (s === "In Review") return "GATE_PENDING";
  return "PLANNED";
}

/** Map context BatchStatus → completion percentage */
export function contextToCompletionPct(s: BatchStatus): number {
  if (s === "Complete") return 100;
  if (s === "In Review") return 75;
  if (s === "Dev") return 50;
  return 0;
}

/** Map context BatchStatus → sidebar badge label and color */
export function contextToSidebarBadge(s: BatchStatus): { label: string; color: string } | null {
  if (s === "Complete") return { label: "Done", color: "#059669" };
  if (s === "In Review") return { label: "Review", color: "#7c3aed" };
  if (s === "Dev") return { label: "Active", color: "#2563eb" };
  return null;
}

/** Map context BatchStatus → Gantt calendar status */
export function contextToCalendarStatus(s: BatchStatus): "Done" | "MVP" | "Committed" | "Stretch" {
  if (s === "Complete") return "Done";
  if (s === "In Review") return "MVP";
  if (s === "Dev") return "Committed";
  return "Stretch";
}

// ── Status style helpers ──────────────────────────────────────────────────────

export const STATUS_STYLES: Record<BatchStatus, {
  bg: string; text: string; border: string; dot: string; label: string;
}> = {
  Planned:     { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8", label: "Planned" },
  Dev:         { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", label: "Dev" },
  "In Review": { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed", label: "In Review" },
  Complete:    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Complete" },
};

// ── Readiness style helpers ───────────────────────────────────────────────────

export const READINESS_STYLES: Record<ReadinessValue, {
  bg: string; text: string; border: string; label: string; dot: string;
}> = {
  ready:   { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Ready",   dot: "#22c55e" },
  partial: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Partial", dot: "#3b82f6" },
  blocked: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Blocked", dot: "#ef4444" },
};

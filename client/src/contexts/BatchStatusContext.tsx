// ─────────────────────────────────────────────────────────────────────────────
// BatchStatusContext — Global Batch Status Source of Truth
// PROTECTION RULE: This is the ONLY place batch statuses are stored.
// All screens must read from this context. No hardcoding allowed.
// Persisted to localStorage so status survives page refresh and navigation.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type BatchStatus = "Planned" | "Dev" | "In Review" | "Complete";

export interface BatchStatusMap {
  "foundation-core": BatchStatus;
  "1": BatchStatus;
  "2": BatchStatus;
  "3": BatchStatus;
  "4": BatchStatus;
  "5": BatchStatus;
  "6": BatchStatus;
  "7": BatchStatus;
  "8": BatchStatus;
  "9": BatchStatus;
  "10": BatchStatus;
  "11": BatchStatus;
  "12": BatchStatus;
}

export type BatchKey = keyof BatchStatusMap;

export const BATCH_LABELS: Record<BatchKey, string> = {
  "foundation-core": "Foundation Core",
  "1": "Batch 1 — File Ingestion & Initial Storage",
  "2": "Batch 2 — Normalization & Cross-LOB Taxonomy",
  "3": "Batch 3 — Tax Domain Authority & Tax Taxonomy",
  "4": "Batch 4 — AI Tax Mapping & Explainability",
  "5": "Batch 5 — Entity Identity & Structure",
  "6": "Batch 6 — Practitioner Review, Adjustments & Lock",
  "7": "Batch 7 — Client Tax Profile & Eligibility",
  "8": "Batch 8 — Exceptions & Remediation",
  "9": "Batch 9 — PDC IMS Integration & Prior Year Retrieval / TDC Rollforward & Prior Year Intelligence",
  "10": "Batch 10 — Return Assembly, Filing & Lineage Closure",
  "11": "Batch 11 — Learning Governance & Model Evolution",
  "12": "Batch 12 — Migration Track (Parallel)",
};

// ── Default initial state ────────────────────────────────────────────────────
const DEFAULT_STATUS: BatchStatusMap = {
  "foundation-core": "Complete",
  "1": "Complete",
  "2": "Dev",
  "3": "Planned",
  "4": "Planned",
  "5": "Planned",
  "6": "Planned",
  "7": "Planned",
  "8": "Planned",
  "9": "Planned",
  "10": "Planned",
  "11": "Planned",
  "12": "Planned",
};

const STORAGE_KEY = "dct_batch_status_v1";

function loadFromStorage(): BatchStatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BatchStatusMap>;
      return { ...DEFAULT_STATUS, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_STATUS };
}

function saveToStorage(map: BatchStatusMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Gate status derived from the highest-progressed batch */
export function deriveGateStatus(statuses: BatchStatusMap): {
  g1: "Complete" | "In Progress" | "Locked";
  g2: "Complete" | "In Progress" | "Locked";
  g3: "Complete" | "In Progress" | "Locked";
  g4: "Complete" | "In Progress" | "Locked";
} {
  // Gate 1 — Schema Lock: driven by Batch 1
  // Gate 2 — Invariant Lock: driven by Batch 2–3
  // Gate 3 — Contract Publication: driven by Batch 4–5
  // Gate 4 — Lineage Closure: driven by Batch 6–8
  const b1 = statuses["1"];
  const b2 = statuses["2"];
  const b3 = statuses["3"];
  const b4 = statuses["4"];
  const b5 = statuses["5"];
  const b6 = statuses["6"];
  const b8 = statuses["8"];

  const g1 = b1 === "Complete" ? "Complete" : (b1 === "Dev" || b1 === "In Review") ? "In Progress" : "Locked";
  const g2 = (b2 === "Complete" && b3 === "Complete") ? "Complete"
    : (b2 === "Dev" || b2 === "In Review" || b3 === "Dev" || b3 === "In Review" || b2 === "Complete") ? "In Progress"
    : "Locked";
  const g3 = (b4 === "Complete" && b5 === "Complete") ? "Complete"
    : (b4 === "Dev" || b4 === "In Review" || b5 === "Dev" || b5 === "In Review" || b4 === "Complete") ? "In Progress"
    : "Locked";
  const g4 = (b6 === "Complete" && b8 === "Complete") ? "Complete"
    : (b6 === "Dev" || b6 === "In Review" || b8 === "Dev" || b8 === "In Review" || b6 === "Complete") ? "In Progress"
    : "Locked";

  return { g1, g2, g3, g4 };
}

/** Agent status derived from batch status */
export function deriveAgentStatus(batchStatus: BatchStatus): "Not Started" | "In Progress" | "Complete" {
  if (batchStatus === "Complete") return "Complete";
  if (batchStatus === "Dev" || batchStatus === "In Review") return "In Progress";
  return "Not Started";
}

/** Demo readiness derived from batch status */
export function deriveDemoReadiness(batchStatus: BatchStatus): "ready" | "partial" | "blocked" {
  if (batchStatus === "Complete") return "ready";
  if (batchStatus === "Dev" || batchStatus === "In Review") return "partial";
  return "blocked";
}

// ── Context ──────────────────────────────────────────────────────────────────

interface BatchStatusContextValue {
  statuses: BatchStatusMap;
  setStatus: (batch: BatchKey, status: BatchStatus) => void;
  resetAll: () => void;
}

const BatchStatusContext = createContext<BatchStatusContextValue | null>(null);

export function BatchStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<BatchStatusMap>(loadFromStorage);

  const setStatus = useCallback((batch: BatchKey, status: BatchStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [batch]: status };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    saveToStorage(DEFAULT_STATUS);
    setStatuses({ ...DEFAULT_STATUS });
  }, []);

  return (
    <BatchStatusContext.Provider value={{ statuses, setStatus, resetAll }}>
      {children}
    </BatchStatusContext.Provider>
  );
}

export function useBatchStatus() {
  const ctx = useContext(BatchStatusContext);
  if (!ctx) throw new Error("useBatchStatus must be used inside BatchStatusProvider");
  return ctx;
}

// ── Status conversion helpers ───────────────────────────────────────────────

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
  return null; // Planned = no badge
}

// ── Status style helpers ─────────────────────────────────────────────────────

export const STATUS_STYLES: Record<BatchStatus, {
  bg: string; text: string; border: string; dot: string; label: string;
}> = {
  Planned:    { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8",  label: "Planned" },
  Dev:        { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6",  label: "Dev" },
  "In Review":{ bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed",  label: "In Review" },
  Complete:   { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e",  label: "Complete" },
};

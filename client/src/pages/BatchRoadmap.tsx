// Batch Delivery Roadmap — Execution View
// RSM | CATT | DCT Platform
// Design: Executive-friendly, scannable in <10 seconds
// Purpose: "Where are we in delivery?" — NOT system architecture (see DCT Delivery Model)
// NOT API coverage (see Control Panel) — NOT batch definitions (see Batch pages)

import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useBatchStatus, contextToDctStatus, contextToCompletionPct, type BatchKey } from "@/contexts/BatchStatusContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Circle, AlertTriangle, Play, ArrowRight } from "lucide-react";
import { allBatches } from "@/lib/dctData";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  badge: string; dot: string; bar: string; label: string; icon: React.ElementType;
}> = {
  CLOSED:       { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500", label: "Delivered",   icon: CheckCircle2 },
  ACTIVE:       { badge: "bg-blue-100 text-blue-800 border-blue-200",          dot: "bg-blue-500",    bar: "bg-blue-500",    label: "Active",      icon: Play },
  GATE_PENDING: { badge: "bg-purple-100 text-purple-800 border-purple-200",    dot: "bg-purple-500",  bar: "bg-purple-500",  label: "In Review",   icon: Clock },
  PLANNED:      { badge: "bg-slate-100 text-slate-500 border-slate-200",       dot: "bg-slate-300",   bar: "bg-slate-200",   label: "Not Started", icon: Circle },
  ON_HOLD:      { badge: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-400",     bar: "bg-red-400",     label: "On Hold",     icon: AlertTriangle },
};

// ─── PI MAPPING ───────────────────────────────────────────────────────────────

const PI_GROUPS = [
  {
    label: "PI 1 — Foundation + AI Mapping",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    ids: ["FC-00", "AB-01", "AB-02", "AB-02A"],
    summary: "Demo-ready ingestion, normalization, and AI tax mapping foundation.",
  },
  {
    label: "PI 2 Committed — Entity, Workflow, Tax-Ready",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    ids: ["AB-03", "AB-04", "AB-05", "AB-06", "AB-07"],
    summary: "Tax domain authority, AI decisions, entity identity, practitioner review, and tax-ready outputs.",
  },
  {
    label: "PI 2 — Exception Handling",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    ids: ["AB-08"],
    summary: "Exception records, remediation actions, and re-ingestion triggers.",
  },
];

// ─── DETAIL ROUTE MAP (dctData ID → /batch/:id param) ──────────────────────
// Maps AB-style IDs used in allBatches to the route param accepted by BatchDetailPage

const DETAIL_ROUTE_MAP: Record<string, string> = {
  "FC-00":  "fc",
  "AB-01":  "1",
  "AB-02":  "2",
  "AB-02A": "2a",
  "AB-03":  "3",
  "AB-04":  "4",
  "AB-05":  "5",
  "AB-06":  "6",
  "AB-07":  "7",
  "AB-08":  "8",
  "AB-09":  "9",
  "AB-10":  "10",
  "AB-11":  "11",
};

// ─── BATCH PARAM MAP ─────────────────────────────────────────────────────────

const BATCH_PARAM_MAP: Record<string, string> = {
  "foundation-core": "FC-00",
  "fc": "FC-00",
  "0": "FC-00",
  "1": "AB-01",
  "2": "AB-02",
  "2a": "AB-02A",
  "3": "AB-03",
  "4": "AB-04",
  "5": "AB-05",
  "6": "AB-06",
  "7": "AB-07",
  "8": "AB-08",
};

const AB_TO_CONTEXT_KEY: Record<string, BatchKey> = {
  "FC-00":  "foundation-core",
  "AB-01":  "1",
  "AB-02":  "2",
  "AB-02A": "2a",
  "AB-03":  "3",
  "AB-04":  "4",
  "AB-05":  "5",
  "AB-06":  "6",
  "AB-07":  "7",
  "AB-08":  "8",
};

// ─── TIMELINE STRIP ───────────────────────────────────────────────────────────

function TimelineStrip({ batches }: { batches: typeof allBatches }) {
  // Only show FC + Batches 1–8 (active scope)
  const activeBatches = batches.filter(b =>
    ["FC-00","AB-01","AB-02","AB-02A","AB-03","AB-04","AB-05","AB-06","AB-07","AB-08"].includes(b.id)
  );

  return (
    <div style={{
      backgroundColor: "white", border: "1px solid #e2e8f0",
      borderRadius: "10px", padding: "16px 20px",
    }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
        {[
          { color: "#059669", label: "Delivered" },
          { color: "#2563eb", label: "Active" },
          { color: "#7c3aed", label: "In Review" },
          { color: "#94a3b8", label: "Not Started" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: l.color }} />
            <span style={{ fontSize: "11px", color: "#64748b" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline nodes */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0", overflowX: "auto", paddingBottom: "4px" }}>
        {activeBatches.map((batch, i) => {
          const cfg = STATUS_CFG[batch.status] || STATUS_CFG.PLANNED;
          const shortId = batch.id === "FC-00" ? "FC" : batch.id.replace("AB-0", "").replace("AB-", "");
          const shortName = batch.name.split(" ").slice(0, 3).join(" ");
          return (
            <div key={batch.id} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "80px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: cfg.dot, color: "white",
                  fontSize: "10px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {shortId}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#0f1623", lineHeight: "1.3" }}>{shortName}</div>
                  <div style={{ fontSize: "9px", color: "#64748b", marginTop: "1px" }}>{cfg.label}</div>
                </div>
              </div>
              {i < activeBatches.length - 1 && (
                <div style={{ width: "20px", height: "2px", backgroundColor: "#e2e8f0", marginTop: "15px", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BATCH CARD (condensed) ───────────────────────────────────────────────────

function BatchCard({ batch, isExpanded, onToggle, detailPath }: {
  batch: typeof allBatches[0];
  isExpanded: boolean;
  onToggle: () => void;
  detailPath: string | null;
}) {
  const cfg = STATUS_CFG[batch.status] || STATUS_CFG.PLANNED;
  const StatusIcon = cfg.icon;

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderLeft: `4px solid ${cfg.dot.replace("bg-", "").includes("emerald") ? "#059669" :
        cfg.dot.includes("blue") ? "#2563eb" :
        cfg.dot.includes("purple") ? "#7c3aed" :
        cfg.dot.includes("red") ? "#ef4444" : "#94a3b8"}`,
      borderRadius: "8px",
      overflow: "hidden",
    }}>
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", textAlign: "left", background: "none", border: "none",
          cursor: "pointer",
        }}
      >
        {/* Status dot + ID */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          backgroundColor: cfg.dot.replace("bg-", "").includes("emerald") ? "#059669" :
            cfg.dot.includes("blue") ? "#2563eb" :
            cfg.dot.includes("purple") ? "#7c3aed" :
            cfg.dot.includes("red") ? "#ef4444" : "#94a3b8",
          color: "white", fontSize: "10px", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {batch.id === "FC-00" ? "FC" : batch.id.replace("AB-0", "").replace("AB-", "")}
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{batch.id}</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{batch.name}</span>
            <span style={{
              fontSize: "10px", fontWeight: 700, padding: "2px 8px",
              borderRadius: "12px", border: `1px solid`,
              marginLeft: "auto",
              backgroundColor: cfg.dot.includes("emerald") ? "#f0fdf4" :
                cfg.dot.includes("blue") ? "#eff6ff" :
                cfg.dot.includes("purple") ? "#f5f3ff" :
                cfg.dot.includes("red") ? "#fef2f2" : "#f8fafc",
              color: cfg.dot.includes("emerald") ? "#065f46" :
                cfg.dot.includes("blue") ? "#1e40af" :
                cfg.dot.includes("purple") ? "#5b21b6" :
                cfg.dot.includes("red") ? "#991b1b" : "#475569",
              borderColor: cfg.dot.includes("emerald") ? "#bbf7d0" :
                cfg.dot.includes("blue") ? "#bfdbfe" :
                cfg.dot.includes("purple") ? "#ddd6fe" :
                cfg.dot.includes("red") ? "#fecaca" : "#e2e8f0",
            }}>
              {cfg.label}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", height: "3px", backgroundColor: "#f1f5f9", borderRadius: "2px", marginTop: "6px" }}>
            <div style={{
              height: "3px", borderRadius: "2px",
              backgroundColor: cfg.dot.includes("emerald") ? "#059669" :
                cfg.dot.includes("blue") ? "#2563eb" :
                cfg.dot.includes("purple") ? "#7c3aed" :
                cfg.dot.includes("red") ? "#ef4444" : "#94a3b8",
              width: `${batch.completionPct}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        {/* Expand icon + detail link */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          {detailPath && (
            <Link href={detailPath}>
              <span
                onClick={e => e.stopPropagation()}
                style={{
                  fontSize: "10px", fontWeight: 700, color: "#2563eb",
                  backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                  borderRadius: "4px", padding: "2px 7px", cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Detail →
              </span>
            </Link>
          )}
          {isExpanded
            ? <ChevronDown style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
            : <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          }
        </div>
      </button>

      {/* Expanded detail — entry/exit only, no story-level detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "12px 16px 14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              {/* PI label */}
              {batch.piLabel && (
                <span style={{
                  fontSize: "10px", fontWeight: 700, color: "#2563eb",
                  backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                  borderRadius: "12px", padding: "2px 8px", alignSelf: "flex-start",
                }}>
                  {batch.piLabel}
                </span>
              )}

              {/* Entry / Exit side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "4px" }}>
                    Entry Condition
                  </div>
                  <div style={{
                    fontSize: "12px", color: "#334155", lineHeight: "1.5",
                    backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: "6px", padding: "8px 10px",
                  }}>
                    {batch.entryCondition}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "4px" }}>
                    Exit Condition
                  </div>
                  <div style={{
                    fontSize: "12px", color: "#334155", lineHeight: "1.5",
                    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: "6px", padding: "8px 10px",
                  }}>
                    {batch.exitCondition}
                  </div>
                </div>
              </div>

              {/* Key gate + system + lead — compact row */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "11px", color: "#64748b" }}>
                <span><strong style={{ color: "#0f1623" }}>Gate:</strong> {batch.keyGate}</span>
                <span><strong style={{ color: "#0f1623" }}>System:</strong> {batch.primarySystem}</span>
                <span><strong style={{ color: "#0f1623" }}>Lead:</strong> {batch.batchLead}</span>
                {batch.openIssues > 0 && (
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    ⚠ {batch.openIssues} open issue{batch.openIssues > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* View Full Detail link */}
              {detailPath && (
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                  <Link href={detailPath}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: "11px", fontWeight: 700, color: "#1e40af",
                      backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                      borderRadius: "6px", padding: "5px 12px", cursor: "pointer",
                      transition: "background 0.15s",
                    }}>
                      View Full PO Walkthrough
                      <ArrowRight style={{ width: "11px", height: "11px" }} />
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BatchRoadmap() {
  const [, params] = useRoute("/batch/:id");
  const { statuses } = useBatchStatus();
  const initialId = params?.id ? (BATCH_PARAM_MAP[params.id] ?? "AB-01") : "AB-01";
  const [expanded, setExpanded] = useState<string>(initialId);

  // Only show active delivery scope: FC + Batches 1–8
  const ACTIVE_IDS = ["FC-00","AB-01","AB-02","AB-02A","AB-03","AB-04","AB-05","AB-06","AB-07","AB-08"];

  const liveBatches = allBatches
    .filter(b => ACTIVE_IDS.includes(b.id))
    .map(batch => {
      const ctxKey = AB_TO_CONTEXT_KEY[batch.id];
      if (!ctxKey) return batch;
      return {
        ...batch,
        status: contextToDctStatus(statuses[ctxKey]),
        completionPct: contextToCompletionPct(statuses[ctxKey]),
      };
    });

  useEffect(() => {
    if (params?.id) {
      const mapped = BATCH_PARAM_MAP[params.id];
      if (mapped) setExpanded(mapped);
    }
  }, [params?.id]);

  const toggle = (id: string) => setExpanded(prev => prev === id ? "" : id);

  // Keyboard ↑/↓ navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const ids = liveBatches.map(b => b.id);
    const idx = ids.indexOf(expanded);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = ids[Math.min(idx + 1, ids.length - 1)];
      if (next) setExpanded(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = ids[Math.max(idx - 1, 0)];
      if (prev) setExpanded(prev);
    }
  }, [expanded, liveBatches]);

  const delivered = liveBatches.filter(b => b.status === "CLOSED").length;
  const active    = liveBatches.filter(b => b.status === "ACTIVE" || b.status === "GATE_PENDING").length;
  const planned   = liveBatches.filter(b => b.status === "PLANNED").length;

  return (
    <div style={{ padding: "24px 28px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f1623", margin: "0 0 4px" }}>
          Batch Delivery Roadmap
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", marginLeft: "8px" }}>Execution View</span>
        </h1>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 10px", lineHeight: "1.6", maxWidth: "700px" }}>
          This page provides a high-level execution view of the DCT Delivery Model, showing how batches are sequenced,
          their current status, and what has been delivered vs. what is in progress. It is designed for quick visibility
          into platform progress and delivery alignment.
        </p>
        {/* Status summary chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { label: `${delivered} Delivered`, color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
            { label: `${active} Active`,    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
            { label: `${planned} Planned`,  color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
          ].map(c => (
            <span key={c.label} style={{
              fontSize: "11px", fontWeight: 700, color: c.color,
              backgroundColor: c.bg, border: `1px solid ${c.border}`,
              borderRadius: "12px", padding: "3px 10px",
            }}>{c.label}</span>
          ))}
        </div>
      </div>

      {/* ── How This Maps to Delivery ── */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "14px 18px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "10px" }}>
          How This Maps to Delivery
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {PI_GROUPS.map(g => (
            <div key={g.label} style={{
              backgroundColor: g.bg, border: `1px solid ${g.border}`,
              borderRadius: "8px", padding: "10px 12px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: g.color, marginBottom: "4px" }}>{g.label}</div>
              <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>{g.summary}</div>
              <div style={{ marginTop: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {g.ids.map(id => (
                  <span key={id} style={{
                    fontSize: "9px", fontWeight: 700, color: g.color,
                    backgroundColor: "white", border: `1px solid ${g.border}`,
                    borderRadius: "4px", padding: "1px 5px",
                  }}>
                    {id === "FC-00" ? "FC" : id.replace("AB-0", "B").replace("AB-", "B")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ marginBottom: "16px" }}>
        <TimelineStrip batches={liveBatches} />
      </div>

      {/* ── Batch cards ── */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Batch list — use arrow keys to navigate"
      >
        {liveBatches.map(batch => (
          <BatchCard
            key={batch.id}
            batch={batch}
            isExpanded={expanded === batch.id}
            onToggle={() => toggle(batch.id)}
            detailPath={DETAIL_ROUTE_MAP[batch.id] ? `/batch/${DETAIL_ROUTE_MAP[batch.id]}` : null}
          />
        ))}
      </div>

      {/* ── Footer links ── */}
      <div style={{
        borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginTop: "20px",
        display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>See also:</span>
        {[
          { label: "DCT Delivery Model", path: "/" },
          { label: "Control Panel", path: "/control-panel" },
          { label: "Gate Status", path: "/gate-status" },
        ].map(l => (
          <Link key={l.path} href={l.path}>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#2563eb",
              border: "1px solid #bfdbfe", borderRadius: "6px",
              padding: "3px 8px", cursor: "pointer",
              backgroundColor: "#eff6ff", display: "inline-block",
            }}>
              {l.label} →
            </span>
          </Link>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>
          DCT Delivery Model · Batch Roadmap v2.1 · Batches 1–10 Active Scope
        </span>
      </div>
    </div>
  );
}

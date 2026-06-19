/**
 * Taxonomy Classification Validation — PDC & Orchestrator Alignment
 *
 * Design: RSM Platform Design System — inline styles matching DataModelPage reference.
 * Navy #003865 section headers, #f8fafc page canvas, white cards, platform badge treatments.
 * Completely separate from TaxonomyPage.tsx — do NOT import or modify that file.
 *
 * Spec: pasted_content_12.txt — 7-step enhanced walkthrough for leadership (Cass)
 * Steps:
 *   1 — Data Retrieval (API View)
 *   2 — Data Storage (PDC Database)
 *   2A — Data Movement & Operations
 *   3 — Taxonomy (Source of Classification)
 *   4 — Gap Identification (Critical)
 *   5 — Expected State (Flow Clarity)
 *   6 — Current Break Point
 *   7 — Decision Checkpoints
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

// ─── Design Tokens (matching DataModelPage platform standard) ─────────────────

const s = {
  page: { padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" } as React.CSSProperties,
  sectionCard: { border: "1px solid #dde3ea", borderRadius: "12px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,56,101,0.06)" } as React.CSSProperties,
  sectionHeader: { padding: "14px 20px", backgroundColor: "#003865", borderBottom: "1px solid #002a4d", display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties,
  sectionTitle: { fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#ffffff" } as React.CSSProperties,
  sectionBody: { padding: "20px" } as React.CSSProperties,
  fieldRow: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" } as React.CSSProperties,
  fieldRowAlt: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#ffffff", borderBottom: "1px solid #f1f5f9" } as React.CSSProperties,
  fieldName: { fontFamily: "monospace", fontSize: "12px", color: "#003865", fontWeight: 700, minWidth: "180px", flexShrink: 0 } as React.CSSProperties,
  fieldType: { fontSize: "11px", color: "#64748b", minWidth: "70px", flexShrink: 0 } as React.CSSProperties,
  fieldNote: { fontSize: "12px", color: "#374151" } as React.CSSProperties,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface DecisionCheckpoint {
  id: number;
  question: string;
  answered: boolean;
}

// ─── Decision Checkpoints (6 items) ──────────────────────────────────────────

const INITIAL_DECISIONS: DecisionCheckpoint[] = [
  { id: 1, question: "FirmTaxonomyId is REQUIRED on all PDC records (B2+B2A, PI 1 Complete).", answered: true },
  { id: 2, question: "PDC rejects records that do not include classification (B2+B2A, PI 1 Complete).", answered: true },
  { id: 3, question: "Classification overrides are allowed and must be fully auditable (governance rule confirmed).", answered: true },
  { id: 4, question: "PDC uses PeriodStart and PeriodEnd only — TaxYear is NOT stored (B2 confirmed).", answered: true },
  { id: 5, question: "Taxonomy service owns hierarchy, versioning, and classification rules (B3, PI 1 Complete).", answered: true },
  { id: 6, question: "Bulk import/export confirmed for environment promotion and replay (B2A, PI 1 Complete).", answered: true },
];

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS: {
  id: StepId;
  label: string;
  subtitle: string;
  stateLabel: string;
  stateType: "current" | "resolved" | "decision" | "delivered";
  shortLabel: string;
}[] = [
  { id: 1, label: "Data Retrieval",       subtitle: "API View",                 stateLabel: "Current State", stateType: "current",  shortLabel: "API View" },
  { id: 2, label: "Data Storage",         subtitle: "PDC Database",             stateLabel: "Expected State",stateType: "resolved", shortLabel: "PDC DB" },
  { id: 3, label: "Data Movement",        subtitle: "Operations",               stateLabel: "Decision",      stateType: "decision", shortLabel: "Ops" },
  { id: 4, label: "Taxonomy",             subtitle: "Source of Classification", stateLabel: "Expected State",stateType: "resolved", shortLabel: "Taxonomy" },
  { id: 5, label: "Gap Resolved",         subtitle: "B2+B2A PI 1 Complete",     stateLabel: "Resolved",      stateType: "resolved", shortLabel: "Resolved" },
  { id: 6, label: "Delivered State",      subtitle: "Full Flow Live",           stateLabel: "Delivered",     stateType: "delivered",shortLabel: "Delivered" },
  { id: 7, label: "Resolved Flow",        subtitle: "Classification Live",      stateLabel: "Resolved",      stateType: "resolved", shortLabel: "Resolved" },
  { id: 8, label: "Decision Checkpoints", subtitle: "Governance",               stateLabel: "In Review",     stateType: "decision", shortLabel: "Decisions" },
];

// ─── State badge style helper ─────────────────────────────────────────────────

function getStateBadgeStyle(type: "current" | "resolved" | "decision" | "delivered"): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    current:   { backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" },
    resolved:  { backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    decision:  { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    delivered: { backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  };
  return {
    ...map[type],
    fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", padding: "2px 7px", borderRadius: "4px",
  };
}

// ─── Callout Block ────────────────────────────────────────────────────────────

function Callout({ items, color = "blue", title = "Callouts" }: {
  items: string[];
  color?: "blue" | "emerald" | "red" | "amber" | "violet";
  title?: string;
}) {
  const styleMap: Record<string, React.CSSProperties> = {
    blue:    { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "4px solid #003865" },
    emerald: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderLeft: "4px solid #059669" },
    red:     { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderLeft: "4px solid #dc2626" },
    amber:   { backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706" },
    violet:  { backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderLeft: "4px solid #7c3aed" },
  };
  const titleColorMap: Record<string, string> = {
    blue: "#003865", emerald: "#065f46", red: "#991b1b", amber: "#92400e", violet: "#5b21b6",
  };
  const textColorMap: Record<string, string> = {
    blue: "#1e40af", emerald: "#166534", red: "#7f1d1d", amber: "#78350f", violet: "#4c1d95",
  };
  return (
    <div style={{ ...styleMap[color], borderRadius: "8px", padding: "14px 18px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: titleColorMap[color], marginBottom: "10px" }}>
        💬 {title}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: i < items.length - 1 ? "6px" : 0 }}>
          <span style={{ color: titleColorMap[color], fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>›</span>
          <span style={{ fontSize: "13px", color: textColorMap[color], lineHeight: "1.55" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Flow Diagram ─────────────────────────────────────────────────────────────

function FlowDiagram({ activeStep }: { activeStep: StepId }) {
  const nodes = [
    { id: 1, label: "Ingestion",      sub: "PDC",                activeColor: "#003865", breakAfter: false },
    { id: 2, label: "Orchestrator",   sub: "AI Agent",           activeColor: "#4f46e5", breakAfter: true  },
    { id: 3, label: "Classification", sub: "Taxonomy",           activeColor: "#059669", breakAfter: false, isGapNode: true },
    { id: 4, label: "PDC Storage",    sub: "NormalizedRecords",  activeColor: "#003865", breakAfter: false },
    { id: 5, label: "Retrieval",      sub: "DataRecords API",    activeColor: "#0369a1", breakAfter: false },
  ];

  const isGapActive    = activeStep === 5 || activeStep === 7;
  const isTargetActive = activeStep === 6;

  const highlightMap: Record<number, number[]> = {
    1: [5], 2: [4], 3: [2], 4: [3], 5: [2, 3], 6: [1, 2, 3, 4, 5], 7: [2, 3], 8: [],
  };
  const highlighted = highlightMap[activeStep] ?? [];

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
        Architecture Flow
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", paddingBottom: "8px" }}>
        {nodes.map((node, idx) => {
          const isActive = highlighted.includes(node.id);
          const isGap    = node.isGapNode && isGapActive;
          return (
            <div key={node.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                position: "relative",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "10px 16px", borderRadius: "8px", minWidth: "110px",
                backgroundColor: isGap ? "#fef2f2" : isTargetActive ? node.activeColor : isActive ? node.activeColor : "#f0f4f8",
                border: isGap ? "2px solid #ef4444" : isTargetActive ? `2px solid ${node.activeColor}` : isActive ? `2px solid ${node.activeColor}` : "1px solid #dde3ea",
                boxShadow: isActive || isGap || isTargetActive ? "0 2px 8px rgba(0,56,101,0.15)" : "none",
                transition: "all 0.2s ease",
              }}>
                {isGap && (
                  <span style={{
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                    backgroundColor: "#dc2626", color: "white", fontSize: "9px", fontWeight: 800,
                    padding: "1px 6px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                  }}>✕ Missing</span>
                )}
                {isTargetActive && (
                  <span style={{
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                    backgroundColor: "#059669", color: "white", fontSize: "9px", fontWeight: 800,
                    padding: "1px 6px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                  }}>✓ Live</span>
                )}
                <span style={{ fontSize: "12px", fontWeight: 700, color: isGap ? "#dc2626" : (isActive || isTargetActive) ? "#ffffff" : "#374151", lineHeight: "1.3" }}>
                  {node.label}
                </span>
                <span style={{ fontSize: "10px", marginTop: "2px", color: isGap ? "#ef4444" : (isActive || isTargetActive) ? "rgba(255,255,255,0.8)" : "#64748b" }}>
                  {node.sub}
                </span>
              </div>
              {idx < nodes.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", margin: "0 2px" }}>
                  {isGapActive && node.breakAfter ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <div style={{ width: "12px", height: "2px", backgroundColor: "#ef4444" }} />
                      <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>✕</span>
                      <div style={{ width: "12px", height: "2px", backgroundColor: "#ef4444" }} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ width: "20px", height: "2px", backgroundColor: isTargetActive ? "#059669" : "#cbd5e1" }} />
                      <span style={{ color: isTargetActive ? "#059669" : "#94a3b8", fontSize: "11px" }}>▶</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isGapActive && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", color: "#dc2626", fontSize: "12px", fontWeight: 500 }}>
          <span style={{ color: "#ef4444", fontWeight: 700 }}>⚠</span>
          Flow breaks at Orchestrator → Classification. Classification is not returned in the Orchestrator output contract.
        </div>
      )}
      {isTargetActive && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", color: "#065f46", fontSize: "12px", fontWeight: 500 }}>
          <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
          Full flow live — every record includes FirmTaxonomyId. Orchestrator → Classification → PDC Storage all active. B2+B2A+B3 delivered PI 1 Complete.
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Data Retrieval ───────────────────────────────────────────────────

function Step1Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>DataRecords API</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#93c5fd", fontFamily: "monospace" }}>GET /api/pdc/data-records</span>
        </div>
        <div style={s.sectionBody}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#003865", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Query Filters</div>
              <div>
                {[
                  { field: "entityId",            type: "GUID",     note: "Required — scopes to entity" },
                  { field: "periodStart",          type: "DateOnly", note: "Required — temporal model" },
                  { field: "periodEnd",            type: "DateOnly", note: "Required — temporal model" },
                  { field: "classificationStatus", type: "enum",     note: "CLASSIFIED / UNCLASSIFIED / PENDING" },
                ].map((f, i) => (
                  <div key={f.field} style={{ ...( i % 2 === 0 ? s.fieldRow : s.fieldRowAlt) }}>
                    <span style={s.fieldName}>{f.field}</span>
                    <span style={s.fieldType}>{f.type}</span>
                    <span style={s.fieldNote}>{f.note}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#003865", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Response Fields</div>
              <div>
                {[
                  { field: "documentId",           type: "GUID",  note: "Immutable lineage anchor",        gap: false },
                  { field: "runId",                type: "GUID",  note: "Processing run reference",         gap: false },
                  { field: "firmTaxonomyId",        type: "GUID",  note: "✓ Required — delivered B2+B2A",   gap: false },
                  { field: "classificationStatus",  type: "enum",  note: "✓ Required — CLASSIFIED enforced", gap: false },
                  { field: "dataJson",             type: "JSON",  note: "Normalized financial payload",     gap: false },
                  { field: "processingRunId",       type: "GUID",  note: "Orchestrator run reference",      gap: false },
                ].map((f, i) => (
                  <div key={f.field} style={{ ...(i % 2 === 0 ? s.fieldRow : s.fieldRowAlt), backgroundColor: f.gap ? "#fffbeb" : undefined, border: f.gap ? "1px solid #fde68a" : undefined }}>
                    <span style={{ ...s.fieldName, color: f.gap ? "#92400e" : "#003865" }}>{f.field}</span>
                    <span style={s.fieldType}>{f.type}</span>
                    <span style={{ ...s.fieldNote, color: f.gap ? "#78350f" : "#374151" }}>{f.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Callout color="blue" items={[
        "This is how data is retrieved from PDC — as a filtered dataset, not individual records.",
        "Data is scoped by EntityId and PeriodStart/PeriodEnd.",
        "Classification is enforced — PDC rejects records without FirmTaxonomyId (B2+B2A, PI 1 Complete).",
      ]} />
    </div>
  );
}

// ─── Step 2: Data Storage ─────────────────────────────────────────────────────

function Step2Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>NormalizedRecords</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#93c5fd", fontFamily: "monospace" }}>PDC — vNormalizedTb</span>
        </div>
        <div style={s.sectionBody}>
          {[
            { field: "documentId",          type: "GUID",     required: true,  note: "Immutable lineage anchor — set at ingestion",                      gap: false },
            { field: "runId",               type: "GUID",     required: true,  note: "Processing run reference",                                         gap: false },
            { field: "entityId",            type: "GUID",     required: true,  note: "PDC-assigned; immutable",                                          gap: false },
            { field: "periodStart",         type: "DateOnly", required: true,  note: "Temporal model — TaxYear is NOT stored",                           gap: false },
            { field: "periodEnd",           type: "DateOnly", required: true,  note: "Temporal model — TaxYear is NOT stored",                           gap: false },
            { field: "firmTaxonomyId",       type: "GUID",     required: true,  note: "Classification reference — REQUIRED; PDC rejects null (B2+B2A)", gap: false },
            { field: "classificationStatus", type: "enum",     required: true,  note: "CLASSIFIED / UNCLASSIFIED / PENDING — enforced at write (B2+B2A)",gap: false },
            { field: "dataJson",            type: "JSON",     required: true,  note: "Normalized financial payload",                                     gap: false },
            { field: "processingRunId",      type: "GUID",     required: true,  note: "Orchestrator run reference",                                       gap: false },
          ].map((f, i) => (
            <div key={f.field} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 12px", borderRadius: "6px", backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ ...s.fieldName, color: f.gap ? "#92400e" : "#003865" }}>{f.field}</span>
              <span style={s.fieldType}>{f.type}</span>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.04em",
                minWidth: "72px", textAlign: "center", flexShrink: 0,
                backgroundColor: f.required ? "#d1fae5" : "#fef3c7",
                color: f.required ? "#065f46" : "#92400e",
                border: f.required ? "1px solid #6ee7b7" : "1px solid #fcd34d",
              }}>
                {f.required ? "Required" : "Nullable ⚠"}
              </span>
              <span style={{ ...s.fieldNote, color: f.gap ? "#78350f" : "#374151" }}>{f.note}</span>
            </div>
          ))}
        </div>
      </div>
      <Callout color="emerald" items={[
        "This is where classification should live in PDC.",
        "FirmTaxonomyId represents the classification of the financial record.",
        "ClassificationStatus indicates whether the record is usable or incomplete.",
        "FirmTaxonomyId is now REQUIRED on all PDC records — PDC rejects unclassified records (B2+B2A, PI 1 Complete).",
      ]} />
    </div>
  );
}

// ─── Step 3: Data Movement & Operations (2A) ──────────────────────────────────

function Step3Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={{ ...s.sectionHeader, backgroundColor: "#78350f", borderBottom: "1px solid #92400e" }}>
          <span style={{ fontSize: "18px" }}>🔄</span>
          <div>
            <div style={{ ...s.sectionTitle, fontSize: "14px" }}>Data Movement Strategy — Delivered</div>
            <div style={{ fontSize: "11px", color: "#fde68a", marginTop: "2px" }}>B2A (PI 1 Complete) — Bulk import/export confirmed; environment promotion and replay are in scope</div>
          </div>
        </div>
        <div style={s.sectionBody}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ border: "1px solid #dde3ea", borderRadius: "8px", padding: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#003865", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Option A — Bulk Import / Export</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: "✓", text: "Supports environment promotion (Dev → QA → Prod)", ok: true },
                  { icon: "✓", text: "Enables replay of processing runs for audit or correction", ok: true },
                  { icon: "✓", text: "Supports initial data seeding and backfill scenarios", ok: true },
                  { icon: "⚠", text: "Requires bulk API contract and data export governance", ok: null },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: item.ok === true ? "#059669" : "#d97706", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: "1px solid #dde3ea", borderRadius: "8px", padding: "16px", backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Option B — Row-Level Persistence Only</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: "✓", text: "Simpler contract surface — one record at a time", ok: true },
                  { icon: "✓", text: "Lower risk of data leakage across environments", ok: true },
                  { icon: "✕", text: "Cannot support environment promotion without re-ingestion", ok: false },
                  { icon: "✕", text: "Replay requires full re-run from source — costly and slow", ok: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: item.ok === true ? "#059669" : "#dc2626", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706", borderRadius: "6px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Impact Statement</div>
            <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.5" }}>Bulk import/export was confirmed in B2A (PI 1 Complete). Environment promotion and replay are supported via the established bulk API contract.</div>
          </div>
        </div>
      </div>
      <Callout color="amber" title="Decision Prompt" items={[
        "Decision resolved in B2A (PI 1 Complete) — bulk import/export is confirmed for environment promotion and replay.",
        "Row-level persistence is the default write path; bulk export supports Dev → QA → Prod promotion.",
        "Environment consistency and replay are now governed by the established bulk API contract.",
      ]} />
    </div>
  );
}

// ─── Step 4: Taxonomy ─────────────────────────────────────────────────────────

function Step4Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Box 1 & 2: Classification + Override */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Classification */}
        <div style={{ ...s.sectionCard, marginBottom: 0 }}>
          <div style={{ ...s.sectionHeader, backgroundColor: "#1e3a5f" }}>
            <span style={{ fontSize: "16px" }}>📘</span>
            <span style={s.sectionTitle}>What is Classification?</span>
          </div>
          <div style={s.sectionBody}>
            <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "14px" }}>
              Classification is the process of assigning a financial record to a standardized category in the firm taxonomy.
            </p>
            <div style={{ border: "1px solid #dde3ea", borderRadius: "8px", padding: "12px", marginBottom: "10px", backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Input Record</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", minWidth: "120px" }}>Account Name</span>
                  <span style={{ fontSize: "12px", color: "#0f1623", fontWeight: 600 }}>Operating Bank Account</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", minWidth: "120px" }}>Amount</span>
                  <span style={{ fontSize: "12px", color: "#0f1623", fontWeight: 600 }}>$500,000</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "8px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#dde3ea" }} />
              <span style={{ fontSize: "11px", color: "#003865", fontWeight: 700 }}>▼ Classification Applied</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#dde3ea" }} />
            </div>
            <div style={{ border: "1px solid #6ee7b7", borderRadius: "8px", padding: "12px", backgroundColor: "#f0fdf4" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Classification Output</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  { label: "FirmTaxonomyId",    value: "CASH_001",                       color: "#059669" },
                  { label: "Canonical Account", value: "Cash",                           color: "#065f46" },
                  { label: "Hierarchy",         value: "Assets → Current Assets → Cash", color: "#065f46" },
                  { label: "Status",            value: "CLASSIFIED",                     color: "#059669" },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", minWidth: "128px", flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", marginTop: "10px" }}>
              This is what gives the data consistent meaning before it is used downstream.
            </p>
          </div>
        </div>

        {/* Override Decision */}
        <div style={{ ...s.sectionCard, marginBottom: 0 }}>
          <div style={{ ...s.sectionHeader, backgroundColor: "#78350f" }}>
            <span style={{ fontSize: "16px" }}>⚠</span>
            <span style={s.sectionTitle}>Override Decision — When Would This Be Needed?</span>
          </div>
          <div style={s.sectionBody}>
            <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "14px" }}>
              Overrides allow controlled exceptions when taxonomy rules do not fully resolve a valid classification.
            </p>
            <div style={{ border: "1px solid #dde3ea", borderRadius: "8px", padding: "12px", marginBottom: "10px", backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Example Scenario</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", minWidth: "144px", flexShrink: 0 }}>Source Account</span>
                  <span style={{ fontSize: "12px", color: "#0f1623", fontWeight: 600 }}>"Owner Distribution"</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", minWidth: "144px", flexShrink: 0 }}>System Classification</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626" }}>Expense (EXPENSE_XXX)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", minWidth: "144px", flexShrink: 0 }}>Expected Classification</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>Equity Distribution (EQUITY_DIST_XXX)</span>
                </div>
              </div>
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "3px" }}>Override Action</div>
                <div style={{ fontSize: "12px", color: "#78350f" }}>Override FirmTaxonomyId from <span style={{ fontFamily: "monospace", color: "#dc2626" }}>EXPENSE_XXX</span> → <span style={{ fontFamily: "monospace", color: "#059669" }}>EQUITY_DIST_XXX</span></div>
              </div>
            </div>
            <div style={{ border: "1px solid #dde3ea", borderRadius: "8px", padding: "12px", backgroundColor: "#ffffff" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>If Overrides Are Allowed, They Must:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {["Preserve original classification", "Capture updated classification", "Record reason for change", "Capture approver and timestamp"].map((req, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#d97706", fontWeight: 700, flexShrink: 0 }}>›</span>
                    <span style={{ fontSize: "12px", color: "#374151" }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#92400e", fontWeight: 600, fontStyle: "italic", marginTop: "10px" }}>
              Overrides are not the default — they are a governed exception path.
            </p>
          </div>
        </div>
      </div>

      {/* Existing taxonomy content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Canonical Accounts + Firm Taxonomy Bridge */}
        <div style={s.sectionCard}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Canonical Accounts → Firm Taxonomy Bridge</span>
          </div>
          <div style={s.sectionBody}>
            {[
              { canonical: "CA-1001", label: "Fixed Assets — Prop & Equip", firmId: "FT-4210", firmLabel: "Depreciable Property" },
              { canonical: "CA-1002", label: "Fixed Assets — Intangibles",  firmId: "FT-4211", firmLabel: "Amortizable Intangibles" },
              { canonical: "CA-2001", label: "Liquid Assets — Cash",        firmId: "FT-3100", firmLabel: "Cash & Equivalents" },
              { canonical: "CA-3001", label: "Revenue — Service",           firmId: "FT-5010", firmLabel: "Service Revenue" },
              { canonical: "CA-4001", label: "Expense — Compensation",      firmId: "FT-6100", firmLabel: "Compensation Expense" },
            ].map((r, i) => (
              <div key={r.canonical} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#003865", fontWeight: 700, minWidth: "60px", flexShrink: 0 }}>{r.canonical}</span>
                <span style={{ fontSize: "12px", color: "#64748b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8", flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#059669", fontWeight: 700, minWidth: "60px", flexShrink: 0 }}>{r.firmId}</span>
                <span style={{ fontSize: "12px", color: "#64748b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.firmLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hierarchy + Override + Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={s.sectionCard}>
            <div style={{ ...s.sectionHeader, backgroundColor: "#065f46" }}>
              <span style={s.sectionTitle}>Hierarchy Ownership</span>
            </div>
            <div style={s.sectionBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: "#059669", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>›</span>
                  <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>Taxonomy service defines parent-child relationships, hierarchy path, and inheritance rules.</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: "#059669", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>›</span>
                  <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>PDC should not duplicate hierarchy or classification logic.</span>
                </div>
              </div>
            </div>
          </div>
          <div style={s.sectionCard}>
            <div style={{ ...s.sectionHeader, backgroundColor: "#78350f" }}>
              <span style={s.sectionTitle}>Override Decision ⚖</span>
            </div>
            <div style={s.sectionBody}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                <span style={{ color: "#d97706", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>?</span>
                <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>Should classification overrides be allowed when taxonomy rules do not fully resolve a valid classification?</span>
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>If Allowed — Governance Requirements</div>
              {["Overrides must be fully auditable.", "Must capture original value, updated value, reason, approver, and timestamp.", "Overrides may be required when source data is incomplete, mappings are ambiguous, or business-approved exceptions are needed."].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: "#d97706", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>›</span>
                  <span style={{ fontSize: "12px", color: "#374151", lineHeight: "1.4" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={s.sectionCard}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>Metadata Attributes</span>
            </div>
            <div style={s.sectionBody}>
              {[
                { attr: "Jurisdiction",    val: "Federal / State / Local" },
                { attr: "EntityType",      val: "C-Corp / Partnership / S-Corp" },
                { attr: "BasisType",       val: "Tax / Book / GAAP" },
                { attr: "AdjustmentType",  val: "Permanent / Temporary" },
                { attr: "EffectiveFrom",   val: "PeriodStart-aligned" },
                { attr: "TaxonomyVersion", val: "Semantic versioning (TDC-owned)" },
              ].map((a, i) => (
                <div key={a.attr} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "4px", backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#059669", fontWeight: 700, minWidth: "112px", flexShrink: 0 }}>{a.attr}</span>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Callout color="emerald" items={[
        "This is the source of classification — a metadata-driven taxonomy model.",
        "Classification maps raw financial data to canonical accounts using FirmTaxonomyId.",
        "All classification logic is defined here — not in PDC.",
        "Classification is applied by the Orchestrator using taxonomy rules, and then stored in PDC as FirmTaxonomyId.",
      ]} />
    </div>
  );
}

// ─── Step 5: Gap Identification ───────────────────────────────────────────────

function Step5Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={{ ...s.sectionHeader, backgroundColor: "#065f46" }}>
          <span style={{ fontSize: "18px" }}>✅</span>
          <div>
            <div style={{ ...s.sectionTitle, fontSize: "14px" }}>Gap Resolved — Orchestrator Output (B2+B2A, PI 1 Complete)</div>
            <div style={{ fontSize: "11px", color: "#6ee7b7", marginTop: "2px" }}>FirmTaxonomyId and ClassificationStatus are now required fields in the Orchestrator output contract</div>
          </div>
        </div>
        <div style={s.sectionBody}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#003865", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Orchestrator Output — Delivered State</div>
          {[
            { field: "documentId",              present: true, note: "✓ Present" },
            { field: "runId",                   present: true, note: "✓ Present" },
            { field: "entityId",                present: true, note: "✓ Present" },
            { field: "periodStart",             present: true, note: "✓ Present" },
            { field: "periodEnd",               present: true, note: "✓ Present" },
            { field: "normalizedAmount",         present: true, note: "✓ Present" },
            { field: "firmTaxonomyId",           present: true, note: "✓ REQUIRED — delivered B2+B2A" },
            { field: "classificationStatus",     present: true, note: "✓ REQUIRED — CLASSIFIED enforced" },
            { field: "classificationConfidence", present: true, note: "✓ RETURNED — confidence score included" },
          ].map((f, i) => (
            <div key={f.field} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "6px", backgroundColor: !f.present ? "#fef2f2" : i % 2 === 0 ? "#f0fdf4" : "#ffffff", border: !f.present ? "1px solid #fecaca" : "1px solid transparent", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: !f.present ? "#dc2626" : "#003865", minWidth: "210px", flexShrink: 0 }}>{f.field}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: !f.present ? "#dc2626" : "#059669" }}>{f.note}</span>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "16px" }}>
            {[
              { label: "PDC Status",       desc: "FirmTaxonomyId and ClassificationStatus are REQUIRED on all NormalizedRecords — PDC rejects unclassified writes", color: "#065f46", bg: "#f0fdf4", border: "#6ee7b7" },
              { label: "Retrieval Status", desc: "classificationStatus filter is fully operational — CLASSIFIED records are returned correctly from DataRecords API", color: "#065f46", bg: "#f0fdf4", border: "#6ee7b7" },
              { label: "Batch 4 Status",   desc: "Tax mapping is unblocked — B4 AI mapping proceeded with classification confirmed (PI 2 Complete)",                  color: "#065f46", bg: "#f0fdf4", border: "#6ee7b7" },
            ].map((item) => (
              <div key={item.label} style={{ borderRadius: "8px", border: `1px solid ${item.border}`, padding: "12px 14px", backgroundColor: item.bg }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: item.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Callout color="emerald" title="Resolution Summary" items={[
        "Resolved in B2+B2A (PI 1 Complete) — Orchestrator now returns FirmTaxonomyId and ClassificationStatus.",
        "PDC enforces classification at write — records without FirmTaxonomyId are rejected.",
        "Tax mapping (B4) and downstream processing are unblocked.",
        "Hierarchy rules, overrides, and data contracts are fully enforced.",
        "READY signal to TDC is blocked when any record is unclassified (B2A + B3, PI 1 Complete).",
      ]} />
    </div>
  );
}

// ─── Step 6: Expected State ───────────────────────────────────────────────────

function Step6Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={{ ...s.sectionHeader, backgroundColor: "#065f46" }}>
          <span style={s.sectionTitle}>Expected Flow — All Records Include FirmTaxonomyId</span>
        </div>
        <div style={s.sectionBody}>
          {[
            { step: "1", label: "Ingestion",     desc: "Source file received; DocumentId assigned; PeriodStart/PeriodEnd set",                                  system: "PDC",            wasGap: false },
            { step: "2", label: "Orchestrator",  desc: "Normalizes financial data AND calls taxonomy service — returns FirmTaxonomyId + ClassificationStatus",  system: "AI Orchestrator", wasGap: true  },
            { step: "3", label: "Classification",desc: "Taxonomy service resolves canonical account → FirmTaxonomyId via metadata conditions",                  system: "TDC / Taxonomy",  wasGap: false },
            { step: "4", label: "PDC Storage",   desc: "NormalizedRecord stored with FirmTaxonomyId and ClassificationStatus = CLASSIFIED",                     system: "PDC",            wasGap: false },
            { step: "5", label: "Retrieval",     desc: "DataRecords API returns complete records — classificationStatus filter works as designed",               system: "PDC API",         wasGap: false },
          ].map((step) => (
            <div key={step.step} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 14px", borderRadius: "8px", marginBottom: "8px", backgroundColor: step.wasGap ? "#f0fdf4" : "#f8fafc", border: step.wasGap ? "1px solid #6ee7b7" : "1px solid #f1f5f9" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px", backgroundColor: step.wasGap ? "#059669" : "#003865", color: "#ffffff" }}>
                {step.step}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: step.wasGap ? "#065f46" : "#0f1623" }}>{step.label}</span>
                  {step.wasGap && <span style={{ fontSize: "10px", backgroundColor: "#059669", color: "#ffffff", padding: "1px 6px", borderRadius: "3px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fixed Here</span>}
                  <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>{step.system}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{step.desc}</div>
              </div>
              <span style={{ color: "#059669", fontWeight: 700, fontSize: "14px", flexShrink: 0, marginTop: "3px" }}>✓</span>
            </div>
          ))}
        </div>
      </div>
      <Callout color="emerald" items={[
        "Expected: Every record includes FirmTaxonomyId before being stored in PDC.",
        "Classification must exist before data is considered usable.",
      ]} />
    </div>
  );
}

// ─── Step 7: Resolved Flow ────────────────────────────────────────────────────

function Step7Content() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.sectionCard}>
        <div style={{ ...s.sectionHeader, backgroundColor: "#065f46" }}>
          <span style={s.sectionTitle}>Resolved State — Classification Gap Closed (B2+B2A, PI 1 Complete)</span>
        </div>
        <div style={s.sectionBody}>
          {[
            { step: "1", label: "Ingestion",      desc: "Source file received; DocumentId assigned",                                                                              system: "PDC",             ok: true  },
            { step: "2", label: "Orchestrator",   desc: "Normalizes financial data AND calls taxonomy service — returns FirmTaxonomyId + ClassificationStatus (B2+B2A)",          system: "AI Orchestrator",  ok: true  },
            { step: "3", label: "Classification", desc: "Taxonomy service resolves canonical account → FirmTaxonomyId via metadata conditions (B3, PI 1 Complete)",               system: "TDC / Taxonomy",   ok: true  },
            { step: "4", label: "PDC Storage",    desc: "NormalizedRecord stored with FirmTaxonomyId REQUIRED and ClassificationStatus = CLASSIFIED (B2+B2A)",                   system: "PDC",             ok: true  },
            { step: "5", label: "Retrieval",      desc: "classificationStatus filter fully operational — CLASSIFIED records returned correctly from DataRecords API",             system: "PDC API",          ok: true  },
          ].map((step) => (
            <div key={step.step} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 14px", borderRadius: "8px", marginBottom: "8px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px", backgroundColor: "#003865", color: "#ffffff" }}>
                {step.step}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{step.label}</span>
                  <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>{step.system}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{step.desc}</div>
              </div>
              <span style={{ color: "#059669", fontWeight: 700, fontSize: "14px", flexShrink: 0, marginTop: "3px" }}>✓</span>
            </div>
          ))}
        </div>
      </div>
      <Callout color="emerald" title="Resolved" items={[
        "Classification gap closed in B2+B2A (PI 1 Complete) — Orchestrator now returns FirmTaxonomyId.",
        "The Orchestrator contract includes FirmTaxonomyId and ClassificationStatus as required output fields.",
        "All downstream flows (PDC storage, retrieval, tax mapping) are unblocked.",
      ]} />
    </div>
  );
}

// ─── Step 8: Decision Checkpoints ────────────────────────────────────────────

function Step8Content({ decisions, onToggle }: { decisions: DecisionCheckpoint[]; onToggle: (id: number) => void }) {
  const answered = decisions.filter((d) => d.answered).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Governance Summary */}
      <div style={{ border: "2px solid #003865", borderRadius: "12px", padding: "20px 24px", backgroundColor: "#eff6ff", display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <span style={{ fontSize: "28px", marginTop: "2px" }}>⚖</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#003865", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Governance Summary</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f1623", lineHeight: "1.5" }}>
            Classification is enforced across the full platform stack.
          </div>
          <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5", marginTop: "4px" }}>
            All six governance decisions are confirmed — B2+B2A and B3 delivered PI 1 Complete.
          </div>
        </div>
      </div>

      {/* Decision Checkpoints */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>⚖</span>
          <span style={s.sectionTitle}>Decision Checkpoints</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#6ee7b7", fontWeight: 700 }}>{answered}/{decisions.length} confirmed</span>
          <div style={{ width: "80px", height: "6px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "3px", overflow: "hidden", marginLeft: "8px" }}>
            <div style={{ height: "100%", width: `${(answered / decisions.length) * 100}%`, backgroundColor: "#059669", borderRadius: "3px", transition: "width 0.4s ease" }} />
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>All confirmed — B2+B2A and B3 delivered PI 1 Complete</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {decisions.map((d) => (
              <button
                key={d.id}
                onClick={() => onToggle(d.id)}
                style={{
                  width: "100%", textAlign: "left", display: "flex", alignItems: "flex-start", gap: "12px",
                  padding: "12px 16px", borderRadius: "8px", cursor: "pointer",
                  backgroundColor: d.answered ? "#f0fdf4" : "#f8fafc",
                  border: d.answered ? "1px solid #6ee7b7" : "1px solid #dde3ea",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{
                  marginTop: "1px", width: "16px", height: "16px", borderRadius: "3px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: d.answered ? "#059669" : "#ffffff",
                  border: d.answered ? "2px solid #059669" : "2px solid #d1d5db",
                  transition: "all 0.15s ease",
                }}>
                  {d.answered && <span style={{ color: "white", fontSize: "10px", fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{ fontSize: "13px", lineHeight: "1.5", color: d.answered ? "#065f46" : "#374151", textDecoration: d.answered ? "line-through" : "none", opacity: d.answered ? 0.75 : 1 }}>
                  {d.question}
                </span>
              </button>
            ))}
          </div>
          {answered === decisions.length && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "8px", padding: "12px 16px" }}>
              <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: "13px", color: "#065f46", fontWeight: 600 }}>All governance decisions confirmed — Orchestrator contract published (B2+B2A, PI 1 Complete)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClassificationWalkthroughPage() {
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [decisions, setDecisions] = useState<DecisionCheckpoint[]>(INITIAL_DECISIONS);

  const toggleDecision = useCallback((id: number) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, answered: !d.answered } : d)));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setActiveStep((s) => (s < 8 ? ((s + 1) as StepId) : s));
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const currentStep = STEPS.find((s) => s.id === activeStep)!;
  const answeredCount = decisions.filter((d) => d.answered).length;

  return (
    <div style={{ background: "#f8fafc", color: "#0f1623", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* ── Platform Standard Header ── */}
      <div style={{ borderBottom: "2px solid #e2e8f0", background: "#ffffff", padding: "16px 32px", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 4px rgba(0,56,101,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ffffff", backgroundColor: "#003865", padding: "2px 8px", borderRadius: "4px" }}>Architecture Walkthrough</span>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#065f46", backgroundColor: "#d1fae5", padding: "2px 8px", borderRadius: "4px", border: "1px solid #6ee7b7" }}>PI 1 Complete</span>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>
                Taxonomy Classification — PDC &amp; Orchestrator Delivery Review
              </h1>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Classification enforced across PDC, Orchestrator, and Taxonomy Service · B2+B2A+B3 delivered PI 1 Complete
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af", fontStyle: "italic", marginTop: "3px" }}>
                Authoritative scope: Classification validation, PDC contract enforcement, taxonomy service integration ·{" "}
                <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>← Platform Home</a>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Delivered by</span>
                {["B2", "B2A", "B3"].map((b) => (
                  <span key={b} style={{ fontSize: "11px", fontWeight: 700, color: "#003865", backgroundColor: "#dbeafe", padding: "1px 7px", borderRadius: "4px", border: "1px solid #bfdbfe" }}>{b}</span>
                ))}
                <span style={{ color: "#d1d5db", fontSize: "12px" }}>·</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", backgroundColor: "#d1fae5", padding: "1px 7px", borderRadius: "4px", border: "1px solid #6ee7b7", textTransform: "uppercase", letterSpacing: "0.05em" }}>PI 1 Complete</span>
                <span style={{ color: "#d1d5db", fontSize: "12px" }}>·</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>May 21, 2026</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f0fdf4", border: "1px solid #6ee7b7", borderRadius: "8px", padding: "8px 14px" }}>
                <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: "12px", color: "#065f46", fontWeight: 600 }}>{answeredCount}/{decisions.length} confirmed</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>← → to navigate</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 32px" }}>

        {/* Flow Diagram */}
        <div style={{ ...s.sectionCard, padding: "16px 20px" }}>
          <FlowDiagram activeStep={activeStep} />
        </div>

        {/* Step Tabs — 2 rows of 4 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
          {STEPS.map((step) => {
            const isActive = activeStep === step.id;
            const badgeStyle = getStateBadgeStyle(step.stateType);
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                style={{
                  position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "10px 14px", borderRadius: "10px", textAlign: "left", cursor: "pointer",
                  backgroundColor: isActive ? "#003865" : "#ffffff",
                  border: isActive ? "2px solid #003865" : "1px solid #dde3ea",
                  boxShadow: isActive ? "0 2px 8px rgba(0,56,101,0.18)" : "0 1px 3px rgba(0,56,101,0.04)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 800, width: "20px", height: "20px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    backgroundColor: isActive ? "#ffffff" : "#003865",
                    color: isActive ? "#003865" : "#ffffff",
                  }}>
                    {step.id <= 2 ? step.id : step.id === 3 ? "2A" : step.id - 1}
                  </span>
                  <span style={{ ...badgeStyle, backgroundColor: isActive ? "rgba(255,255,255,0.15)" : badgeStyle.backgroundColor, color: isActive ? "#ffffff" : badgeStyle.color, border: isActive ? "1px solid rgba(255,255,255,0.3)" : badgeStyle.border }}>
                    {step.stateLabel}
                  </span>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: isActive ? "#ffffff" : "#0f1623", lineHeight: "1.3" }}>{step.label}</div>
                <div style={{ fontSize: "10px", color: isActive ? "rgba(255,255,255,0.7)" : "#64748b", marginTop: "1px" }}>{step.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Content Panel */}
        <div style={{ ...s.sectionCard, marginBottom: "20px" }}>
          <div style={s.sectionHeader}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0, backgroundColor: "#ffffff", color: "#003865" }}>
              {activeStep <= 2 ? activeStep : activeStep === 3 ? "2A" : activeStep - 1}
            </div>
            <span style={s.sectionTitle}>{currentStep.label}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{currentStep.subtitle}</span>
            <span style={{ marginLeft: "auto", ...getStateBadgeStyle(currentStep.stateType), backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}>
              {currentStep.stateLabel}
            </span>
          </div>
          <div style={s.sectionBody}>
            {activeStep === 1 && <Step1Content />}
            {activeStep === 2 && <Step2Content />}
            {activeStep === 3 && <Step3Content />}
            {activeStep === 4 && <Step4Content />}
            {activeStep === 5 && <Step5Content />}
            {activeStep === 6 && <Step6Content />}
            {activeStep === 7 && <Step7Content />}
            {activeStep === 8 && <Step8Content decisions={decisions} onToggle={toggleDecision} />}

            {/* Navigation Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
                disabled={activeStep === 1}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px",
                  backgroundColor: "#f8fafc", border: "1px solid #dde3ea", color: "#374151",
                  fontSize: "13px", fontWeight: 600, cursor: activeStep === 1 ? "not-allowed" : "pointer",
                  opacity: activeStep === 1 ? 0.35 : 1, transition: "all 0.15s ease",
                }}
              >
                ← {activeStep > 1 ? `Back: ${STEPS[activeStep - 2].label}` : "Previous"}
              </button>
              {activeStep < 8 ? (
                <button
                  onClick={() => setActiveStep((s) => ((s + 1) as StepId))}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px",
                    backgroundColor: "#003865", border: "1px solid #002a4d", color: "#ffffff",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  Next: {STEPS[activeStep].label} →
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(1)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px",
                    backgroundColor: "#003865", border: "1px solid #002a4d", color: "#ffffff",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  ↩ Restart Walkthrough
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div style={{ border: "1px solid #dde3ea", borderRadius: "12px", backgroundColor: "#ffffff", padding: "20px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,56,101,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", textAlign: "center" }}>
            {[
              { icon: "✓", label: "Architecture is Correct", desc: "Schema, API, taxonomy service, and hierarchy rules are all in place" },
              { icon: "✓", label: "Classification Gap Resolved", desc: "Orchestrator returns FirmTaxonomyId — B2+B2A, PI 1 Complete" },
              { icon: "✓", label: `${answeredCount}/${decisions.length} Governance Decisions Confirmed`, desc: "All classification governance decisions resolved — PI 1 Complete" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669" }}>{item.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", lineHeight: "1.5" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Return to Touchpoints back-link */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          padding: "14px 20px",
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
          borderLeft: "4px solid #003865", borderRadius: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#003865", fontWeight: 700 }}>🔗 Linked Touchpoints</span>
            <span style={{ fontSize: "12px", color: "#374151" }}>This walkthrough covers</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>T3 · Financial Data Extraction</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>T4 · Canonical Normalization (PDC)</span>
          </div>
          <Link
            href="/touchpoints"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: 700, color: "#003865",
              backgroundColor: "#ffffff", border: "1px solid #003865",
              padding: "7px 16px", borderRadius: "6px", textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            ← Return to Touchpoints
          </Link>
        </div>
      </div>
    </div>
  );
}

// DCT Delivery Model — Authoritative Platform Anchor Page
// RSM | CATT | DCT + Roger
// Design: RSM Deep Navy headers, RSM Green for success/insight, slate for neutral
// Governance realignment: Non-production workspace, architecture visualization only

import { Link } from "wouter";
import { useState, useMemo } from "react";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import GovernanceBanner from "@/components/GovernanceBanner";
import ExecDashboard from "@/components/ExecDashboard";

// ─── Batch Reference Data (from DCT Calendar v7) ─────────────────────────────
const BATCH_REFERENCE = [
  { pi: "PI 2", status: "Done",      batchNum: "4",   platform: "TDC",      name: "AI Mapping Proposals & Decisions",                                    whatItDoes: "Generates AI tax-mapping proposals with confidence and evidence per account.",                                                                  rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "5",   platform: "PDC",      name: "Entity Identity & Structure",                                        whatItDoes: "Gives every client and entity a permanent identity and access scope.",                                                                          rogerImpact: "Client / entity selection" },
  { pi: "PI 2", status: "Done",      batchNum: "6",   platform: "TDC",      name: "Practitioner Review & Lock",                                         whatItDoes: "Practitioners review, decide, and lock mappings; decisions are immutable.",                                                                     rogerImpact: "Review & lock" },
  { pi: "PI 2", status: "Done",      batchNum: "2A",  platform: "PDC",      name: "Orchestrator Classification Result & Contract Enforcement",           whatItDoes: "Enforces the orchestrator's classification result and contract at intake.",                                                                      rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "Done",      batchNum: "7",   platform: "TDC",      name: "Client Tax Profile & Eligibility",                                   whatItDoes: "Holds the client tax profile and determines which rules apply.",                                                                               rogerImpact: "Eligibility" },
  { pi: "PI 2", status: "Done",      batchNum: "8",   platform: "PDC",      name: "Exceptions & Remediation",                                           whatItDoes: "Surfaces cross-LOB ingestion and data exceptions for remediation.",                                                                             rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",      batchNum: "8",   platform: "TDC",      name: "Exceptions & Remediation",                                           whatItDoes: "Surfaces tax-side exceptions for remediation.",                                                                                               rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",      batchNum: "9",   platform: "Gateway",  name: "Roger Gateway & Governed Consumer Access Layer",                     whatItDoes: "Governed gateway exposing approved upstream data to consumers.",                                                                               rogerImpact: "None (Gateway)" },
  { pi: "PI 2", status: "Done",      batchNum: "1",   platform: "PDC",      name: "File Ingestion & Initial Storage",                                   whatItDoes: "Ingests files, assigns DocumentId, and anchors lineage.",                                                                                    rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "2",   platform: "PDC",      name: "Normalization & Cross-LOB Taxonomy",                                 whatItDoes: "Normalizes financial data and applies cross-LOB taxonomy.",                                                                                   rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "3",   platform: "TDC",      name: "Tax Domain Authority & Tax Taxonomy",                                whatItDoes: "Establishes TDC reference data, tax form templates, and mapping rules.",                                                                      rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "43",  platform: "PDC",      name: "Practitioner Book & Reclass Adjustments",                            whatItDoes: "Persists practitioner book and reclass adjustments using a multi-line model.",                                                                 rogerImpact: "Book Adjustment & Reclass Adjustment (Stages 4-5)" },
  { pi: "PI 2", status: "Done",      batchNum: "42",  platform: "TDC",      name: "Tax Rules Framework & Book-to-Tax Adjustment Rules",                 whatItDoes: "Computes book-to-tax adjustments using governed rules.",                                                                                      rogerImpact: "Tax Adjustment (Stage 7) + Rule Administration" },
  { pi: "PI 2", status: "Done",      batchNum: "10",  platform: "TDC",      name: "Return Assembly, Filing & Lineage",                                  whatItDoes: "Assembles return and filing records and anchors lineage.",                                                                                    rogerImpact: "Form 1120 / Filing (Stage 10)" },
  { pi: "PI 2", status: "Done",      batchNum: "16",  platform: "PDC",      name: "Known Mappings Lookup",                                              whatItDoes: "Provides a lookup layer for previously confirmed tax mappings.",                                                                               rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "16",  platform: "TDC",      name: "Known Mappings Lookup",                                              whatItDoes: "TDC-side lookup for confirmed mapping decisions.",                                                                                            rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "13",  platform: "TDC",      name: "API Route Standardization",                                          whatItDoes: "Standardizes TDC API routes for governed consumer access.",                                                                                   rogerImpact: "None (infrastructure)" },
  { pi: "PI 3", status: "In Progress", batchNum: "42", platform: "TDC",     name: "Tax Rules Framework (PI 3 continuation)",                            whatItDoes: "Extends book-to-tax adjustment rules for additional scenarios.",                                                                               rogerImpact: "Tax Adjustment (Stage 7)" },
  { pi: "PI 3", status: "In Progress", batchNum: "17", platform: "PDC",     name: "Many-to-Many Form Line Mapping & Jurisdiction-Aware Derivation",     whatItDoes: "Supports many-to-many form line mappings with jurisdiction-aware tax derivation.",                                                              rogerImpact: "Line Mappings (Stage 2) + Jurisdiction" },
  { pi: "PI 3", status: "Planned",   batchNum: "20",  platform: "TDC",      name: "Apportionment & State Allocation",                                   whatItDoes: "Handles state apportionment and income allocation across jurisdictions.",                                                                     rogerImpact: "State Apportionment" },
  { pi: "PI 3", status: "Planned",   batchNum: "21",  platform: "PDC",      name: "Multi-Entity Consolidation",                                         whatItDoes: "Consolidates financial data across multiple entities for group-level reporting.",                                                              rogerImpact: "Consolidation View" },
  { pi: "PI 3", status: "Planned",   batchNum: "26",  platform: "PDC",      name: "Known Mappings — Confirmed Classification Retrieval",                whatItDoes: "Retrieves and surfaces confirmed classification decisions for practitioner review.",                                                             rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 3", status: "Planned",   batchNum: "28",  platform: "TDC",      name: "Deferred Tax & Temporary Differences",                               whatItDoes: "Computes deferred tax assets/liabilities and temporary differences.",                                                                         rogerImpact: "Deferred Tax" },
  { pi: "PI 3", status: "Planned",   batchNum: "29",  platform: "TDC",      name: "Credits & Incentives",                                               whatItDoes: "Identifies and applies eligible tax credits and incentives.",                                                                                 rogerImpact: "Credits & Incentives" },
  { pi: "PI 3", status: "Planned",   batchNum: "31",  platform: "TDC",      name: "Partnership K-1 & Pass-Through Allocation",                          whatItDoes: "Handles K-1 income allocation and pass-through entity tax treatment.",                                                                         rogerImpact: "K-1 / Pass-Through" },
  { pi: "PI 3", status: "Planned",   batchNum: "9A",  platform: "Gateway",  name: "Roger Gateway — Extended Consumer Contracts",                        whatItDoes: "Extends the Roger Gateway with additional governed consumer contracts.",                                                                       rogerImpact: "Gateway Expansion" },
  { pi: "PI 3", status: "Planned",   batchNum: "39",  platform: "TDC",      name: "International Tax — GILTI, FDII, BEAT",                              whatItDoes: "Computes international tax provisions including GILTI, FDII, and BEAT.",                                                                      rogerImpact: "International Tax" },
  { pi: "PI 3", status: "Stretch",   batchNum: "33",  platform: "TDC",      name: "S-Corp & Flow-Through Specialization",                               whatItDoes: "S-Corp and flow-through entity tax specialization.",                                                                                         rogerImpact: "S-Corp / Flow-Through" },
  { pi: "PI 4", status: "Planned",   batchNum: "19",  platform: "TDC",      name: "Estimated Tax & Safe Harbor",                                        whatItDoes: "Manages estimated tax payments and safe harbor calculations.",                                                                                rogerImpact: "Estimated Tax" },
  { pi: "PI 4", status: "Planned",   batchNum: "21",  platform: "TDC",      name: "Multi-Entity Consolidation (TDC)",                                   whatItDoes: "TDC-side consolidation for group-level tax reporting.",                                                                                      rogerImpact: "Consolidation View" },
  { pi: "PI 4", status: "Planned",   batchNum: "26",  platform: "TDC",      name: "Known Mappings — TDC Contract Publication",                          whatItDoes: "Publishes confirmed TDC mapping contracts for downstream consumers.",                                                                          rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 4", status: "Planned",   batchNum: "35",  platform: "TDC",      name: "Corporate AMT & Book Income Adjustment",                             whatItDoes: "Computes corporate alternative minimum tax and book income adjustments.",                                                                     rogerImpact: "AMT / Book Income" },
  { pi: "PI 4", status: "Planned",   batchNum: "40",  platform: "TDC",      name: "Interest Expense Limitation (163j)",                                 whatItDoes: "Applies Section 163(j) interest expense limitation rules.",                                                                                  rogerImpact: "163(j) Limitation" },
  { pi: "PI 4", status: "Planned",   batchNum: "22",  platform: "PDC",      name: "Client Communication & Outstanding Items",                           whatItDoes: "Client communication and outstanding items management.",                                                                                     rogerImpact: "Post-MVP" },
  { pi: "PI 4", status: "Planned",   batchNum: "23",  platform: "PDC",      name: "Benchmark & Peer Analytics",                                         whatItDoes: "Benchmark and peer analytics for practitioner insight.",                                                                                     rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "11",  platform: "TDC",      name: "NOL & Capital Loss Carryforward",                                    whatItDoes: "Tracks and applies NOL and capital loss carryforward balances.",                                                                              rogerImpact: "NOL / Capital Loss" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "12",  platform: "TDC",      name: "Tax Attribute Preservation & Limitation (382)",                      whatItDoes: "Manages tax attribute preservation and Section 382 limitations.",                                                                             rogerImpact: "Tax Attributes" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "27",  platform: "TDC",      name: "Foreign Tax Credit & Sourcing",                                      whatItDoes: "Computes foreign tax credits and income sourcing.",                                                                                           rogerImpact: "Foreign Tax Credit" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "30",  platform: "TDC",      name: "Qualified Business Income (QBI) Deduction",                          whatItDoes: "Computes the Section 199A QBI deduction.",                                                                                                   rogerImpact: "QBI Deduction" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "32",  platform: "TDC",      name: "R&D Tax Credit",                                                     whatItDoes: "Identifies and computes R&D tax credits.",                                                                                                   rogerImpact: "R&D Credit" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "36",  platform: "TDC",      name: "Partnership Specialization",                                         whatItDoes: "Partnership specialization (1065).",                                                                                                         rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "14",  platform: "TDC",      name: "Tax Computation Rules (in-Roger engine)",                            whatItDoes: "In-Roger tax computation engine (limitation rules, rate/threshold tables).",                                                                  rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "15",  platform: "TDC",      name: "Tax Provision Reference & ASC 740 (in-Roger engine)",               whatItDoes: "Tax provision reference & ASC 740.",                                                                                                         rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "18",  platform: "TDC",      name: "Provision Computation, DTA/DTL & ETR",                               whatItDoes: "Provision computation, DTA/DTL & ETR.",                                                                                                      rogerImpact: "Post-MVP" },
  { pi: "",     status: "Future",    batchNum: "37",  platform: "TDC",      name: "Trust Specialization (1041)",                                        whatItDoes: "Trust specialization (1041).",                                                                                                               rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "38",  platform: "TDC",      name: "Individual Specialization (1040)",                                   whatItDoes: "Individual specialization (1040).",                                                                                                          rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "TBD", platform: "",         name: "Exempt Org Returns (990, 990-PF)",                                   whatItDoes: "Exempt org returns (990, 990-PF).",                                                                                                          rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "TBD", platform: "",         name: "International Beyond K-2/K-3 (5471, GILTI, FDI, FTC)",              whatItDoes: "International beyond K-2/K-3 (5471, GILTI, FDI, FTC).",                                                                                     rogerImpact: "Future" },
  { pi: "",     status: "Parked",    batchNum: "24",  platform: "PDC",      name: "Advisory Opportunity Reference (superseded by Blue J)",              whatItDoes: "Advisory opportunity reference (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "24",  platform: "TDC",      name: "Advisory Opportunity Reference (superseded by Blue J)",              whatItDoes: "Advisory opportunity reference (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "25",  platform: "PDC",      name: "Advisory Opportunity Detection (superseded by Blue J)",              whatItDoes: "Advisory opportunity detection (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "25",  platform: "TDC",      name: "Advisory Opportunity Detection (superseded by Blue J)",              whatItDoes: "Advisory opportunity detection (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children, accent }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "blue" | "green" | "red" | "amber" | "slate";
}) {
  const accentMap: Record<string, string> = {
    blue:  "#1e3a5f",
    green: "#065f46",
    red:   "#7f1d1d",
    amber: "#78350f",
    slate: "#1e293b",
  };
  const borderColor = accentMap[accent ?? "slate"];
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{
        borderLeft: `4px solid ${borderColor}`,
        paddingLeft: "14px",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "2px" }}>
          {subtitle}
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Flow node ────────────────────────────────────────────────────────────────
function FlowNode({ label, owner, color, isGap }: { label: string; owner: string; color: string; isGap?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "110px" }}>
      <div style={{
        backgroundColor: isGap ? "#fef2f2" : color,
        border: `2px solid ${isGap ? "#ef4444" : color}`,
        borderRadius: "8px",
        padding: "10px 14px",
        textAlign: "center",
        width: "100%",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: isGap ? "#dc2626" : "white", lineHeight: "1.3" }}>{label}</div>
      </div>
      <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>{owner}</div>
    </div>
  );
}

function FlowArrow({ broken }: { broken?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "2px" }}>
      <div style={{ fontSize: "18px", color: broken ? "#ef4444" : "#94a3b8", lineHeight: 1 }}>
        {broken ? "✕" : "→"}
      </div>
    </div>
  );
}

// ─── Invariant card ───────────────────────────────────────────────────────────
function InvariantCard({ index, text }: { index: number; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
      borderRadius: "8px", padding: "12px 14px",
    }}>
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        backgroundColor: "#059669", color: "white",
        fontSize: "11px", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {index}
      </div>
      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Failure mode card ────────────────────────────────────────────────────────
function FailureCard({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      backgroundColor: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: "8px", padding: "10px 14px",
    }}>
      <div style={{ color: "#dc2626", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>⚠</div>
      <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Batch row ────────────────────────────────────────────────────────────────
// Maps Home.tsx batch IDs ("FC", "1", "2A", etc.) to BatchStatusContext keys
function toBatchKey(id: string): string {
  if (id === "FC") return "foundation-core";
  return id.toLowerCase();
}

function BatchRow({ id, name, scope }: { id: string; name: string; scope: string }) {
  const { statuses } = useBatchStatus();
  const key = toBatchKey(id);
  const ctxStatus = statuses[key as keyof typeof statuses];

  // Derive badge appearance from live context status
  let badgeLabel: string;
  let badgeBg: string;
  let badgeText: string;
  let dotColor: string;

  if (ctxStatus === "Complete") {
    badgeLabel = "Done"; badgeBg = "#f0fdf4"; badgeText = "#166534"; dotColor = "#059669";
  } else if (ctxStatus === "In Progress" || ctxStatus === "MVP" || ctxStatus === "Stretch") {
    badgeLabel = "Active"; badgeBg = "#fff7ed"; badgeText = "#9a3412"; dotColor = "#ea580c";
  } else if (ctxStatus === "Ready for QA" || ctxStatus === "QA In Progress" || ctxStatus === "Demo Ready") {
    badgeLabel = "QA"; badgeBg = "#faf5ff"; badgeText = "#6b21a8"; dotColor = "#a855f7";
  } else if (ctxStatus === "Delivered") {
    badgeLabel = "Delivered"; badgeBg = "#ecfdf5"; badgeText = "#065f46"; dotColor = "#10b981";
  } else if (ctxStatus === "Blocked") {
    badgeLabel = "Blocked"; badgeBg = "#fef2f2"; badgeText = "#991b1b"; dotColor = "#ef4444";
  } else {
    // Not Started / unknown
    badgeLabel = "Planned"; badgeBg = "#f8fafc"; badgeText = "#475569"; dotColor = "#94a3b8";
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "60px 1fr 1fr auto",
      gap: "12px", alignItems: "start",
      padding: "10px 14px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "13px",
    }}>
      <div style={{
        fontWeight: 700, color: "#0f1623",
        backgroundColor: "#e2e8f0", borderRadius: "4px",
        padding: "2px 6px", textAlign: "center", fontSize: "11px",
      }}>{id}</div>
      <div style={{ color: "#1e293b", fontWeight: 600 }}>{name}</div>
      <div style={{ color: "#475569" }}>{scope}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
        backgroundColor: badgeBg, color: badgeText,
        border: `1px solid ${dotColor}30`,
        borderRadius: "4px", padding: "2px 7px", whiteSpace: "nowrap",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: dotColor, flexShrink: 0, display: "inline-block" }} />
        {badgeLabel}
      </div>
    </div>
  );
}

// ─── Batch Reference & Consumer Impact Guide ─────────────────────────────────
function BatchReferenceGuide() {
  const [search, setSearch] = useState("");
  const [piFilter, setPiFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const piOptions = ["All", "PI 2", "PI 3", "PI 4", "PI 5", "Future", "Parked"];
  const platformOptions = ["All", "PDC", "TDC", "Gateway"];

  const filtered = useMemo(() => {
    return BATCH_REFERENCE.filter(b => {
      const matchSearch = !search ||
        b.batchNum.toLowerCase().includes(search.toLowerCase()) ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.whatItDoes.toLowerCase().includes(search.toLowerCase()) ||
        b.rogerImpact.toLowerCase().includes(search.toLowerCase());
      const matchPi = piFilter === "All" ||
        (piFilter === "Future" && (b.status === "Future" || b.status === "Long-Term" || b.status === "Research")) ||
        (piFilter === "Parked" && b.status === "Parked") ||
        b.pi === piFilter;
      const matchPlatform = platformFilter === "All" || b.platform === platformFilter;
      return matchSearch && matchPi && matchPlatform;
    });
  }, [search, piFilter, platformFilter]);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Done:         { bg: "#f0fdf4", text: "#059669", border: "#bbf7d0" },
    "In Progress": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    Planned:      { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
    Stretch:      { bg: "#faf5ff", text: "#7c3aed", border: "#e9d5ff" },
    "Post-MVP":   { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
    Future:       { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
    Parked:       { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
    "Long-Term":  { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
    Research:     { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
  };
  const platformColors: Record<string, string> = {
    PDC: "#1e3a5f", TDC: "#065f46", Gateway: "#7c3aed",
  };

  return (
    <Section title="Batch Reference & Consumer Impact Guide" subtitle="Section 4 — Delivery Units & Roger Impact" accent="blue">
      <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "16px" }}>
        Understand what each batch delivers and how it affects the Roger practitioner experience.
        Source: DCT Calendar v7 · Columns J (What the Batch Does) and K (Roger UI Impact).
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search batch number, name, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: "1 1 260px", padding: "7px 12px", fontSize: "13px",
            border: "1px solid #cbd5e1", borderRadius: "6px",
            outline: "none", color: "#1e293b", backgroundColor: "#ffffff",
          }}
        />
        <select
          value={piFilter}
          onChange={e => setPiFilter(e.target.value)}
          style={{
            padding: "7px 10px", fontSize: "12px", border: "1px solid #cbd5e1",
            borderRadius: "6px", color: "#1e293b", backgroundColor: "#ffffff", cursor: "pointer",
          }}
        >
          {piOptions.map(p => <option key={p} value={p}>{p === "All" ? "All PIs" : p}</option>)}
        </select>
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          style={{
            padding: "7px 10px", fontSize: "12px", border: "1px solid #cbd5e1",
            borderRadius: "6px", color: "#1e293b", backgroundColor: "#ffffff", cursor: "pointer",
          }}
        >
          {platformOptions.map(p => <option key={p} value={p}>{p === "All" ? "All Platforms" : p}</option>)}
        </select>
        <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
          {filtered.length} of {BATCH_REFERENCE.length} batches
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "70px 90px 1fr 1fr 90px",
          gap: "10px",
          backgroundColor: "#0f1623",
          padding: "10px 14px",
        }}>
          {["Batch #", "Platform", "Batch Title", "What the Batch Does", "Roger UI Impact"].map(h => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>No batches match your filters.</div>
        )}
        {filtered.map((b, idx) => {
          const sc = statusColors[b.status] ?? statusColors["Planned"];
          const isExpanded = expandedIdx === idx;
          return (
            <div key={idx}
              style={{
                borderBottom: idx < filtered.length - 1 ? "1px solid #f1f5f9" : undefined,
                backgroundColor: isExpanded ? "#f8fafc" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                cursor: "pointer",
              }}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "70px 90px 1fr 1fr 90px",
                gap: "10px",
                padding: "10px 14px",
                alignItems: "start",
              }}>
                {/* Batch # */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{
                    fontWeight: 800, fontSize: "13px", color: "#0f1623",
                    backgroundColor: "#e2e8f0", borderRadius: "4px",
                    padding: "2px 6px", textAlign: "center", display: "inline-block",
                  }}>{b.batchNum}</div>
                  <div style={{
                    fontSize: "9px", fontWeight: 700,
                    backgroundColor: sc.bg, color: sc.text,
                    border: `1px solid ${sc.border}`,
                    borderRadius: "3px", padding: "1px 5px", textAlign: "center",
                  }}>{b.status}</div>
                </div>
                {/* Platform */}
                <div style={{
                  fontSize: "11px", fontWeight: 700,
                  color: platformColors[b.platform] ?? "#475569",
                  paddingTop: "2px",
                }}>{b.platform || "—"}</div>
                {/* Batch Title */}
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", lineHeight: "1.4", paddingTop: "1px" }}>
                  {b.name}
                  <span style={{ marginLeft: "6px", fontSize: "10px", color: "#94a3b8" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
                {/* What it Does */}
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", paddingTop: "1px" }}>{b.whatItDoes}</div>
                {/* Roger Impact */}
                <div style={{
                  fontSize: "11px", fontWeight: 600,
                  color: b.rogerImpact.startsWith("None") || b.rogerImpact === "Post-MVP" || b.rogerImpact === "Future" || b.rogerImpact === "Parked"
                    ? "#94a3b8" : "#059669",
                  lineHeight: "1.4",
                }}>{b.rogerImpact}</div>
              </div>
              {/* Expanded detail row */}
              {isExpanded && (
                <div style={{
                  padding: "0 14px 12px 14px",
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f0f9ff",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}>
                  <div style={{ paddingTop: "10px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Full Description</div>
                    <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>{b.whatItDoes}</div>
                  </div>
                  <div style={{ paddingTop: "10px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Roger UI Impact</div>
                    <div style={{ fontSize: "13px", color: "#059669", fontWeight: 600, lineHeight: "1.6" }}>{b.rogerImpact}</div>
                    {b.pi && (
                      <div style={{ marginTop: "6px", fontSize: "11px", color: "#64748b" }}>PI: {b.pi} &nbsp;·&nbsp; Platform: {b.platform || "—"} &nbsp;·&nbsp; Status: {b.status}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { statuses, piCompletion, gates, lastUpdated } = useBatchStatus();
  const totalBatches = Object.keys(statuses).length;
  const completedBatches = Object.values(statuses).filter(s => s === "Complete").length;
  const activeBatches = Object.values(statuses).filter(s => s === "Dev" || s === "In Review" || s === "In Progress").length;
  const overallPct = Math.round((completedBatches / totalBatches) * 100);
  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "32px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#059669", fontWeight: 900, fontSize: "16px",
          }}>D</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
              DCT Delivery Model
            </h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              RSM · CATT · Governance & Architecture Readiness Workspace · Non-Production
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {[
            { label: `Batches Active: ${activeBatches}`, color: "#059669" },
            { label: "Non-Production Workspace", color: "#d97706" },
            { label: "API-First Architecture", color: "#2563eb" },
            { label: "Governed AI Integration", color: "#7c3aed" },
            { label: "Roger Read-Only", color: "#0f1623" },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: "11px", fontWeight: 600, color: "white",
              backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px",
            }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* ── Live Platform Status Bar ── */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: "10px", padding: "14px 20px", marginBottom: "28px",
        display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            ● Readiness Status
          </div>
          <div style={{ flex: 1, height: "8px", backgroundColor: "#d1fae5", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${overallPct}%`, backgroundColor: "#059669", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>{overallPct}% Complete</div>
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Complete", value: completedBatches, color: "#059669" },
            { label: "Active", value: activeBatches, color: "#2563eb" },
            { label: "Planned", value: totalBatches - completedBatches - activeBatches, color: "#94a3b8" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "G1 Schema Lock", status: gates.g1 },
            { label: "G2 Invariant Lock", status: gates.g2 },
            { label: "G3 Contract Pub", status: gates.g3 },
            { label: "G4 Lineage Close", status: gates.g4 },
          ].map(g => (
            <div key={g.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: g.status === "Complete" ? "#059669" : g.status === "In Progress" ? "#2563eb" : "#94a3b8",
              }} />
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#374151" }}>{g.label}</span>
            </div>
          ))}
        </div>
        {lastUpdatedLabel && (
          <div style={{ fontSize: "10px", color: "#6b7280", whiteSpace: "nowrap" }}>
            ↻ Last updated: {lastUpdatedLabel}
          </div>
        )}
      </div>

      {/* ── 1. Purpose ── */}
      <Section title="Purpose" subtitle="Section 1" accent="blue">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            DCT is a <strong>governed, batch-driven architecture and readiness model</strong> that structures how financial data is ingested,
            normalized, classified, and made available for tax decision-making across RSM's enterprise platform.
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            It enforces a <strong>strict separation of concerns</strong> between financial data (PDC), tax decisions (TDC),
            AI orchestration (Orchestrator), and practitioner consumption (Roger) — ensuring no system owns
            responsibilities outside its defined boundary.
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            The result is <strong>deterministic, traceable, API-driven architecture patterns</strong> that can be audited, replayed,
            and validated at every layer of the platform.
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px", marginTop: 8 }}>
            <strong style={{ color: "#92400e" }}>Governance Note:</strong> This workspace visualizes architecture patterns, readiness status, and governance structures using mock and seed data. It is not a production system, system of record, or integrated operational platform. All outputs require formal enterprise implementation outside this workspace.
          </p>
        </div>
      </Section>

      {/* ── Executive Delivery Dashboard ── */}
      <ExecDashboard />

      {/* ── 2. Batch Reference & Consumer Impact Guide ── */}
      <BatchReferenceGuide />

      {/* ── 3. End-to-End Flow ── */}
      <Section title="End-to-End Delivery Model" subtitle="Section 3 — Critical Visual" accent="blue">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "20px 24px",
          overflowX: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "700px" }}>
            <FlowNode label="Tax Portal" owner="Ingestion" color="#334155" />
            <FlowArrow />
            <FlowNode label="Service Bus" owner="Event Trigger" color="#475569" />
            <FlowArrow />
            <FlowNode label="PDC" owner="Financial Data" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="Orchestrator" owner="Stateless AI" color="#7c3aed" />
            <FlowArrow />
            <FlowNode label="PDC (Classified)" owner="Normalized + FirmTaxonomyId" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="TDC" owner="Tax Decisions" color="#065f46" />
            <FlowArrow />
            <FlowNode label="Roger" owner="Read-Only UI" color="#0f1623" />
          </div>
          <div style={{ marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { color: "#1e3a5f", label: "PDC (Phoenix Data Consolidation) — Financial truth, lineage anchor" },
              { color: "#7c3aed", label: "Orchestrator — Stateless, no persistence" },
              { color: "#065f46", label: "TDC (Tax Data Consolidation) — Tax decisions, immutable" },
              { color: "#0f1623", label: "Roger — Read-only, no writes" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#475569" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 4. System Ownership ── */}
      <Section title="System Ownership Model" subtitle="Section 4 — No Overlapping Ownership" accent="blue">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
            backgroundColor: "#0f1623", padding: "10px 16px", gap: "12px",
          }}>
            {["Layer", "System", "Responsibility"].map(h => (
              <div key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {[
            { layer: "Ingestion",      system: "Tax Portal",      resp: "File intake, event trigger via Service Bus. Assigns DocumentId at boundary." },
            { layer: "Data Foundation",system: "PDC",             resp: "Financial data storage, lineage anchor (DocumentId), normalization, classification storage. System of record for financial truth." },
            { layer: "Orchestration",  system: "AI Orchestrator", resp: "Stateless processing only. Applies taxonomy rules and returns FirmTaxonomyId. No persistence, no ownership of data." },
            { layer: "Tax Decision",   system: "TDC",             resp: "Tax mapping, adjustments, tax-ready record derivation, eligibility. System of record for all tax decisions. Immutable audit trail." },
            { layer: "Consumption",    system: "Roger",           resp: "Read-only practitioner UI. Reads from TDC primary contract only. No writes, no transformations." },
          ].map((row, i) => (
            <div key={row.layer} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
              gap: "12px", padding: "12px 16px",
              backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              fontSize: "13px",
            }}>
              <div style={{ fontWeight: 700, color: "#0f1623" }}>{row.layer}</div>
              <div style={{ fontWeight: 600, color: "#2563eb" }}>{row.system}</div>
              <div style={{ color: "#475569", lineHeight: "1.5" }}>{row.resp}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. Foundation Invariants ── */}
      <Section title="What Must Be True — Foundation Invariants" subtitle="Section 5 — Non-Negotiable Rules" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            "All data must enter through a governed ingestion boundary — no direct system writes.",
            "Every file must be assigned a DocumentId at ingestion. DocumentId is immutable.",
            "DocumentId is the lineage anchor across all systems — PDC, TDC, and Roger.",
            "Data is scoped using EntityId + PeriodStart + PeriodEnd. TaxYear is derived in TDC only — not stored in PDC.",
            "PDC is the system of record for financial data and lineage. No other system may own financial truth.",
            "TDC is the system of record for all tax decisions. Decisions are immutable once locked.",
            "The Orchestrator is stateless. It must not persist data, own records, or hold state between calls.",
            "All system interactions must occur via APIs only. No direct system coupling is permitted.",
          ].map((text, i) => (
            <InvariantCard key={i} index={i + 1} text={text} />
          ))}
        </div>
      </Section>

      {/* ── 6. What This Enables ── */}
      <Section title="What This Enables" subtitle="Section 6 — Platform Capabilities" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { icon: "⟳", title: "Deterministic Processing", desc: "Same input always produces the same output. Results are reproducible and auditable." },
            { icon: "⌥", title: "Full Lineage & Traceability", desc: "Every record traces back to its DocumentId origin through all system layers." },
            { icon: "⟷", title: "Cross-System Interoperability", desc: "PDC ↔ TDC ↔ Roger communicate exclusively through governed API contracts." },
            { icon: "◈", title: "Governed AI Integration", desc: "Orchestrator operates within strict stateless boundaries — AI cannot own or persist data." },
            { icon: "⬡", title: "API-First Architecture", desc: "All data access is contract-driven. No system bypasses the API layer." },
            { icon: "▦", title: "Safe Parallel Development", desc: "Batches can run in parallel within a PI because ownership boundaries prevent conflicts." },
          ].map(c => (
            <div key={c.title} style={{
              backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{c.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>{c.title}</div>
              <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 7. What This Is NOT ── */}
      <Section title="What This Is NOT — Architecture Guardrails & Workspace Limitations" subtitle="Section 7 — Guardrails" accent="amber">
        <div style={{
          backgroundColor: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <div style={{ marginBottom: "10px", fontSize: "13px", color: "#78350f", fontWeight: 600 }}>
            The following are explicitly outside the scope of the DCT Delivery Model and this Manus workspace:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              "Not a UI layer — Roger is the UI layer, not DCT.",
              "Not a transformation engine — PDC normalizes; it does not transform for tax purposes.",
              "Not a taxonomy definition system — TDC owns taxonomy; PDC stores the result.",
              "Not a workflow engine — Review and approval workflows are Batch 6 scope, not platform scope.",
              "Not responsible for tax calculations — TDC derives tax-ready records; it does not calculate tax liability.",
              "Not a reporting layer — Roger reads and presents; it does not aggregate or compute.",
              "Not a production system — this Manus workspace is a governance visualization and readiness planning environment only.",
              "Not a system of record — no authoritative operational data is stored in this workspace.",
              "Not integrated with enterprise systems — no ADO connections, no live system synchronization.",
              "Not approved for client data, PII, PHI, or confidential tax data — seed and mock data only.",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#92400e", lineHeight: "1.5",
              }}>
                <span style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }}>✕</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 8. Roger Connection ── */}
      <Section title="How This Connects to Roger" subtitle="Section 8 — Consumption Layer" accent="slate">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>Roger's Contract Rules</div>
            {[
              "Roger reads exclusively from TDC — the primary contract. No direct PDC reads.",
              "Roger does not write, transform, or persist data. It is read-only at all times.",
              "Without TDC APIs, Roger cannot function. TDC is a hard dependency.",
              "Roger reflects mapping status in real time: GREEN (accepted), YELLOW (pending), RED (override or exception).",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#334155", lineHeight: "1.5",
                marginBottom: "8px",
              }}>
                <span style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }}>✓</span>
                {text}
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>What Roger Reflects</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Mapping Status",  value: "GREEN / YELLOW / RED per canonical account",   color: "#059669" },
                { label: "Decisions",       value: "Accepted / Overridden / Pending per TDC record", color: "#2563eb" },
                { label: "Entity Context",  value: "ClientGroupId + EntityId + PeriodStart/End",     color: "#7c3aed" },
                { label: "Tax-Ready State", value: "Locked TaxReadyRecord from Batch 6 TDC",         color: "#065f46" },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  gap: "8px", fontSize: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px",
                }}>
                  <span style={{ fontWeight: 700, color: row.color, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: "#475569", textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#fef2f2", borderRadius: "6px", fontSize: "12px", color: "#7f1d1d", fontWeight: 600 }}>
              ⚠ If TDC APIs are not published, Roger has no data to display.
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. Failure Modes ── */}
      <Section title="Failure Modes" subtitle="Section 9 — If This Model Is Not Enforced" accent="red">
        <div style={{ marginBottom: "10px", fontSize: "13px", color: "#7f1d1d", fontWeight: 600 }}>
          The following failures occur when DCT governance rules are bypassed or not enforced:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            "Data loses lineage and traceability — DocumentId is no longer a reliable anchor.",
            "Classification becomes inconsistent — FirmTaxonomyId is missing or unreliable across records.",
            "Systems duplicate logic — PDC and TDC both attempt tax derivation, creating conflicts.",
            "APIs become unreliable — contracts diverge from actual data, breaking Roger and downstream consumers.",
            "Roger cannot present trusted outputs — mapping status and decisions are stale or incorrect.",
            "AI becomes non-governed — Orchestrator persists state or owns decisions, violating stateless contract.",
          ].map((text, i) => (
            <FailureCard key={i} text={text} />
          ))}
        </div>
      </Section>

      {/* ── Platform Navigation Guide ── */}
      <div style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "18px 20px",
        marginTop: "8px",
        marginBottom: "20px",
      }}>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Platform Navigation Guide</div>
          <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>
            This platform is organized into three tiers. <strong>Authoritative sources</strong> own their topic and are the single source of truth.
            <strong> Derived summaries</strong> condense authoritative content for specific audiences.
            <strong> Supporting artifacts</strong> are leaf-level specifications and tools.
          </div>
        </div>
        {/* Tier 1 — Authoritative Sources */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1e3a5f", marginBottom: "6px", borderBottom: "1px solid #bfdbfe", paddingBottom: "3px" }}>Tier 1 — Authoritative Sources</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "BA Operating System", path: "/ask-buddy", desc: "Operating system vision & innovation catalog" },
              { label: "Batch Roadmap", path: "/batch-roadmap", desc: "Batch delivery scope & sequencing" },
              { label: "Gate Status", path: "/gate-status", desc: "Gate verification & readiness" },
              { label: "Architecture", path: "/architecture", desc: "Architecture layers & system model" },
              { label: "Data Governance", path: "/data-governance", desc: "Ownership boundaries & SoT" },
            ].map(l => (
              <Link key={l.path} href={l.path}>
                <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e3a5f" }}>{l.label} →</div>
                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "1px" }}>{l.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Tier 2 — Delivery Intelligence */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#065f46", marginBottom: "6px", borderBottom: "1px solid #bbf7d0", paddingBottom: "3px" }}>Tier 2 — Delivery Intelligence</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Control Panel", path: "/control-panel", desc: "Batch & gate admin" },
              { label: "Data Model & Gaps", path: "/data-model", desc: "Field governance workbench" },
              { label: "Gap Analysis Engine", path: "/gap-analysis", desc: "Delivery gap identification" },
              { label: "Batch Calendar", path: "/batch-calendar", desc: "Batch & PI planning view" },
              { label: "Governance Timeline", path: "/data-governance", desc: "Governance milestone tracking" },
            ].map(l => (
              <Link key={l.path} href={l.path}>
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>{l.label} →</div>
                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "1px" }}>{l.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Tier 3 — Specialized Tools */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b21a8", marginBottom: "6px", borderBottom: "1px solid #e9d5ff", paddingBottom: "3px" }}>Tier 3 — Specialized Tools & Roger UI</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Ask Buddy", path: "/ask-buddy", desc: "AI knowledge agent" },
              { label: "Consumer Integration Hub", path: "/consumer-integration-hub", desc: "Roger integration governance" },
              { label: "Integration Simulation", path: "/integration-simulation", desc: "Workflow simulator" },
              { label: "Roger Data Mapping", path: "/roger-mapping", desc: "Field mapping lifecycle" },
              { label: "Classification Walkthrough", path: "/classification-walkthrough", desc: "Decision walkthrough" },
              { label: "Taxonomy Explorer", path: "/taxonomy", desc: "Taxonomy reference" },
              { label: "Touchpoints (T1–T11)", path: "/touchpoints", desc: "Runtime touchpoint map" },
              { label: "Runtime Journey", path: "/runtime-journey", desc: "End-to-end flow visualization" },
              { label: "Enterprise Architecture", path: "/architecture/enterprise", desc: "Executive architecture view" },
              { label: "Developer Architecture", path: "/architecture/developer", desc: "Technical architecture view" },
            ].map(l => (
              <Link key={l.path} href={l.path}>
                <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b21a8" }}>{l.label} →</div>
                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "1px" }}>{l.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Governance Banner (bottom) ── */}
      <GovernanceBanner />
    </div>
  );
}

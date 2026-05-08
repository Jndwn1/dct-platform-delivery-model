// DCT Platform — Roger UI Data Point Mapping & Governance Alignment
// Source: Roger API Design v1.0 (05.07.2026) + TIM Governance Gap Analysis
// Design: Executive-ready RSM styling, Deep RSM Blue headers
// Green = validated | Yellow = partial | Orange/Red = governance/lineage gaps

import { useState, useMemo } from "react";
import {
  SCREEN1_MAPPING, SCREEN2_MAPPING, SCREEN3_MAPPING, SCREEN4_MAPPING,
  HEATMAP_DATA, ADR_CARDS, computeSummaryTiles,
  type FieldMapping, type GovStatus, type Owner, type HeatmapValue,
} from "../lib/rogerGovernanceData";

// ─── Style helpers ────────────────────────────────────────────────────────────
const RSM_BLUE = "#003087";
const RSM_BLUE_LIGHT = "#e8eef7";

const GOV_STYLE: Record<GovStatus, { bg: string; text: string; label: string; dot: string }> = {
  governed:       { bg: "#dcfce7", text: "#166534", label: "Governed",       dot: "#16a34a" },
  partial:        { bg: "#fef9c3", text: "#854d0e", label: "Partial",        dot: "#ca8a04" },
  gap:            { bg: "#ffedd5", text: "#9a3412", label: "Governance Gap", dot: "#ea580c" },
  missing:        { bg: "#fee2e2", text: "#991b1b", label: "Missing API",    dot: "#dc2626" },
  "adr-required": { bg: "#ede9fe", text: "#5b21b6", label: "ADR Required",   dot: "#7c3aed" },
};

const HEAT_STYLE: Record<HeatmapValue, { bg: string; text: string; label: string }> = {
  governed:  { bg: "#dcfce7", text: "#166534", label: "Governed"  },
  partial:   { bg: "#fef9c3", text: "#854d0e", label: "Partial"   },
  undefined: { bg: "#ffedd5", text: "#9a3412", label: "Undefined" },
  missing:   { bg: "#fee2e2", text: "#991b1b", label: "Missing"   },
};

const RISK_STYLE: Record<string, { bg: string; text: string }> = {
  high:   { bg: "#fee2e2", text: "#991b1b" },
  medium: { bg: "#ffedd5", text: "#9a3412" },
  low:    { bg: "#dcfce7", text: "#166534" },
  none:   { bg: "#f3f4f6", text: "#6b7280" },
};

const OWNER_COLOR: Record<string, string> = {
  TIM: "#0ea5e9", Roger: "#8b5cf6", CEM: "#f59e0b",
  PDC: "#003087", TDC: "#059669", Orchestrator: "#6366f1", Unknown: "#9ca3af",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div style={{ background: RSM_BLUE, borderRadius: "10px 10px 0 0", padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 800, fontSize: "11px", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.05em" }}>SECTION {num}</span>
        <span style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{title}</span>
      </div>
      {subtitle && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", marginTop: "4px" }}>{subtitle}</div>}
    </div>
  );
}

function GovBadge({ status }: { status: GovStatus }) {
  const s = GOV_STYLE[status];
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const s = RISK_STYLE[level] ?? RISK_STYLE.none;
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", whiteSpace: "nowrap" }}>
      {level.toUpperCase()}
    </span>
  );
}

function OwnerChip({ owner }: { owner: string }) {
  const color = OWNER_COLOR[owner] ?? "#9ca3af";
  return (
    <span style={{ background: color + "18", color, border: `1px solid ${color}40`, fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", whiteSpace: "nowrap" }}>
      {owner}
    </span>
  );
}

function FieldTable({ fields }: { fields: FieldMapping[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["UI Field", "Roger API Field", "TIM Support", "Source", "Gov Status", "Risk", "Notes / ADR"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap", fontSize: "11px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "8px 10px", fontWeight: 600, color: "#111827" }}>{f.uiField}</td>
              <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#374151", fontSize: "11px" }}>{f.rogerApiField}</td>
              <td style={{ padding: "8px 10px", color: "#6b7280", maxWidth: "160px" }}>{f.timSupport}</td>
              <td style={{ padding: "8px 10px" }}><OwnerChip owner={f.sourceSystem} /></td>
              <td style={{ padding: "8px 10px" }}><GovBadge status={f.govStatus} /></td>
              <td style={{ padding: "8px 10px" }}><RiskBadge level={f.riskLevel} /></td>
              <td style={{ padding: "8px 10px", color: "#6b7280", maxWidth: "200px", lineHeight: "1.4" }}>
                {f.notes}
                {f.adrRef && <span style={{ marginLeft: "6px", background: "#ede9fe", color: "#5b21b6", fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px" }}>{f.adrRef}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArchNotes({ notes, findings, risks, warningBanner }: { notes: string[]; findings: string[]; risks: string[]; warningBanner?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", padding: "16px", background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
      <div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "6px", letterSpacing: "0.08em" }}>ARCHITECTURE NOTES</div>
        {notes.map((n, i) => <div key={i} style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", paddingLeft: "10px", borderLeft: "2px solid #93c5fd" }}>• {n}</div>)}
      </div>
      <div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "6px", letterSpacing: "0.08em" }}>GOVERNANCE FINDINGS</div>
        {findings.map((f, i) => <div key={i} style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", paddingLeft: "10px", borderLeft: "2px solid #fbbf24" }}>• {f}</div>)}
      </div>
      <div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "6px", letterSpacing: "0.08em" }}>RISK INDICATORS</div>
        {risks.map((r, i) => <div key={i} style={{ fontSize: "11px", color: "#9a3412", marginBottom: "4px", paddingLeft: "10px", borderLeft: "2px solid #f97316" }}>⚠ {r}</div>)}
        {warningBanner && (
          <div style={{ marginTop: "8px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", padding: "8px 10px", color: "#991b1b", fontSize: "11px", fontWeight: 700 }}>
            🚨 {warningBanner}
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterState {
  screen: string;
  govStatus: GovStatus | "";
  owner: Owner | "";
  risk: string;
  batches: string[];   // multi-select
  adr: boolean;
  leadershipView: boolean;
}

const DEFAULT_FILTERS: FilterState = { screen: "", govStatus: "", owner: "", risk: "", batches: [], adr: false, leadershipView: false };

// ─── BATCH DISCOVERY HELPERS ─────────────────────────────────────────────────
function normalizeBatch(raw: string): string {
  if (!raw) return "Undefined";
  const s = raw.trim();
  // Already normalized
  if (/^(FC|B\d+|Cross-Batch|Future|ADR Dependent|Undefined)$/.test(s)) return s;
  // "Batch 5" / "Batch 05" → B5
  const m = s.match(/[Bb]atch\s*0*(\d+)/);
  if (m) return `B${m[1]}`;
  // "B-5" → B5
  const m2 = s.match(/^[Bb]-?(\d+)$/);
  if (m2) return `B${m2[1]}`;
  return s;
}

function discoverBatches(screens: typeof SCREEN1_MAPPING[]): string[] {
  const set = new Set<string>();
  screens.forEach(sc => {
    sc.fields.forEach(f => {
      const b = normalizeBatch(f.batch ?? "");
      if (b) set.add(b);
      // ADR-tagged fields → also add "ADR Dependent"
      if (f.adrRef) set.add("ADR Dependent");
      // Multiple batch refs in notes
      const noteMatches = (f.notes ?? "").match(/B\d+/g);
      if (noteMatches && noteMatches.length > 1) set.add("Cross-Batch");
    });
  });
  return Array.from(set);
}

const BATCH_GROUPS: { label: string; values: string[] }[] = [
  { label: "Active Delivery Batches", values: ["B1","B2","B3","B4","B5","B6","B7","B8","B9","B10"] },
  { label: "Governance / Future",     values: ["Cross-Batch","ADR Dependent","Future","Undefined"] },
  { label: "Foundational / Core",     values: ["FC"] },
];

const BATCH_HEATMAP: { batch: string; focus: string; maturity: "high" | "medium" | "low" | "none" }[] = [
  { batch: "FC",  focus: "Foundation / Lookups",         maturity: "high"   },
  { batch: "B4",  focus: "AI Tax Mapping",               maturity: "medium" },
  { batch: "B5",  focus: "Entity Identity",              maturity: "medium" },
  { batch: "B6",  focus: "Workflow / Practitioner",      maturity: "low"    },
  { batch: "B7",  focus: "Eligibility / Profile",        maturity: "low"    },
  { batch: "B8",  focus: "Exceptions / Remediation",     maturity: "none"   },
  { batch: "B9",  focus: "Prior Year / Rollforward",     maturity: "none"   },
  { batch: "B10", focus: "Filing / Assembly",            maturity: "none"   },
];

const MATURITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
  medium: { bg: "#fef9c3", text: "#854d0e", label: "Partial"   },
  low:    { bg: "#ffedd5", text: "#9a3412", label: "Planned"   },
  none:   { bg: "#f3f4f6", text: "#6b7280", label: "Future"    },
};

function ScreenSection({ section, filters }: { section: typeof SCREEN1_MAPPING; filters: FilterState }) {
  const [expanded, setExpanded] = useState(true);
  const filtered = useMemo(() => {
    return section.fields.filter(f => {
      if (filters.govStatus && f.govStatus !== filters.govStatus) return false;
      if (filters.owner && f.sourceSystem !== filters.owner) return false;
      if (filters.risk && f.riskLevel !== filters.risk) return false;
      if (filters.adr && !f.adrRef) return false;
      if (filters.batches.length > 0) {
        const nb = normalizeBatch(f.batch ?? "");
        const isAdrDep = filters.batches.includes("ADR Dependent") && !!f.adrRef;
        const isCross  = filters.batches.includes("Cross-Batch") && (f.notes ?? "").match(/B\d+/g)?.length! > 1;
        const isUndef  = filters.batches.includes("Undefined") && !f.batch;
        if (!filters.batches.includes(nb) && !isAdrDep && !isCross && !isUndef) return false;
      }
      return true;
    });
  }, [section.fields, filters]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
      <div
        style={{ background: RSM_BLUE, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>{section.screen}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontFamily: "monospace", marginTop: "2px" }}>{section.method} {section.endpoint}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px" }}>{filtered.length} fields</span>
          <span style={{ color: "white", fontSize: "16px" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <>
          <FieldTable fields={filtered} />
          <ArchNotes
            notes={section.archNotes}
            findings={section.govFindings}
            risks={section.riskIndicators}
            warningBanner={section.id === "return-detail" ? "Consolidated Filing Governance Risk — no filing authority or lock state defined" : undefined}
          />
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RogerMappingPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showBatchHeatmap, setShowBatchHeatmap] = useState(false);
  const tiles = useMemo(() => computeSummaryTiles(), []);

  const setFilter = (key: keyof FilterState, val: string | boolean) =>
    setFilters(f => ({ ...f, [key]: val }));

  const toggleBatch = (b: string) =>
    setFilters(f => ({
      ...f,
      batches: f.batches.includes(b) ? f.batches.filter(x => x !== b) : [...f.batches, b],
    }));

  const screens = [SCREEN1_MAPPING, SCREEN2_MAPPING, SCREEN3_MAPPING, SCREEN4_MAPPING];
  const visibleScreens = filters.screen ? screens.filter(s => s.id === filters.screen) : screens;

  // Dynamic batch discovery
  const discoveredBatches = useMemo(() => discoverBatches(screens), []);

  // Batch field counts
  const batchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    screens.forEach(sc => {
      sc.fields.forEach(f => {
        const nb = normalizeBatch(f.batch ?? "");
        if (nb) counts[nb] = (counts[nb] ?? 0) + 1;
        if (f.adrRef) counts["ADR Dependent"] = (counts["ADR Dependent"] ?? 0) + 1;
      });
    });
    return counts;
  }, []);

  // Build grouped options: only show batches that exist in data OR are canonical
  const groupedOptions = useMemo(() => {
    return BATCH_GROUPS.map(g => ({
      ...g,
      values: g.values.filter(v => discoveredBatches.includes(v) || g.label === "Active Delivery Batches"),
    }));
  }, [discoveredBatches]);

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ background: `linear-gradient(135deg, ${RSM_BLUE} 0%, #1a4a8a 100%)`, borderRadius: "12px", padding: "24px 28px", marginBottom: "24px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.7, marginBottom: "6px" }}>DCT PLATFORM · ARCHITECTURE GOVERNANCE</div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>Roger UI Data Point Mapping & Governance Alignment</h1>
            <div style={{ opacity: 0.75, fontSize: "12px", marginTop: "6px" }}>Source: Roger API Design v1.0 (05.07.2026) · TIM Governance Gap Analysis · DCT Architecture Review</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
            <button
              onClick={() => setFilter("leadershipView", !filters.leadershipView)}
              style={{ background: filters.leadershipView ? "#fbbf24" : "rgba(255,255,255,0.15)", color: filters.leadershipView ? "#78350f" : "white", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
            >
              {filters.leadershipView ? "👁 Leadership View ON" : "👁 Leadership Simplified View"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: "Total Screens",       value: tiles.totalScreens,      bg: RSM_BLUE_LIGHT, text: RSM_BLUE },
          { label: "Fully Governed APIs", value: tiles.fullyMapped,       bg: "#dcfce7",       text: "#166534" },
          { label: "Partial Mappings",    value: tiles.partial,           bg: "#fef9c3",       text: "#854d0e" },
          { label: "Governance Gaps",     value: tiles.gaps,              bg: "#ffedd5",       text: "#9a3412" },
          { label: "ADR Dependencies",    value: tiles.adrDeps,           bg: "#ede9fe",       text: "#5b21b6" },
          { label: "Consolidated Risks",  value: tiles.consolidatedRisks, bg: "#fee2e2",       text: "#991b1b" },
          { label: "Unmapped Points",     value: tiles.unmapped,          bg: "#f3f4f6",       text: "#374151" },
        ].map(t => (
          <div key={t.label} style={{ background: t.bg, borderRadius: "8px", padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: t.text }}>{t.value}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: t.text, opacity: 0.8, marginTop: "2px", lineHeight: "1.3" }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Global Filters */}
      {!filters.leadershipView && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "10px", letterSpacing: "0.08em" }}>GLOBAL FILTERS</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Screen */}
            <select value={filters.screen} onChange={e => setFilter("screen", e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px" }}>
              <option value="">All Screens</option>
              <option value="my-clients">My Clients</option>
              <option value="entities">Entities</option>
              <option value="return-detail">Return Detail</option>
              <option value="consolidation-detail">Consolidation Detail</option>
            </select>
            {/* Gov Status */}
            <select value={filters.govStatus} onChange={e => setFilter("govStatus", e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px" }}>
              <option value="">All Gov Status</option>
              <option value="governed">Governed</option>
              <option value="partial">Partial</option>
              <option value="gap">Governance Gap</option>
              <option value="missing">Missing API</option>
              <option value="adr-required">ADR Required</option>
            </select>
            {/* Owner */}
            <select value={filters.owner} onChange={e => setFilter("owner", e.target.value as Owner | "")} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px" }}>
              <option value="">All Owners</option>
              {["TIM", "Roger", "CEM", "PDC", "TDC", "Orchestrator"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {/* Risk */}
            <select value={filters.risk} onChange={e => setFilter("risk", e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px" }}>
              <option value="">All Risk Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {/* ADR */}
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", paddingTop: "7px" }}>
              <input type="checkbox" checked={filters.adr} onChange={e => setFilter("adr", e.target.checked)} />
              ADR Dependencies Only
            </label>
            {/* Clear */}
            <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "12px", cursor: "pointer", color: "#374151" }}>
              Clear Filters
            </button>
          </div>

          {/* ── BATCH FILTER ─────────────────────────────────────────────────── */}
          <div style={{ marginTop: "12px", padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#374151", letterSpacing: "0.08em" }}>BATCH FILTER</span>
                {filters.batches.length > 0 && (
                  <span style={{ fontSize: "10px", background: "#003087", color: "white", padding: "1px 7px", borderRadius: "9999px", fontWeight: 700 }}>{filters.batches.length} selected</span>
                )}
                <span
                  title="Batches represent DCT roadmap alignment, governance readiness, and architecture dependency sequencing."
                  style={{ fontSize: "11px", color: "#9ca3af", cursor: "help", fontWeight: 700 }}
                >ⓘ</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => setShowBatchHeatmap(v => !v)} style={{ fontSize: "10px", padding: "3px 8px", border: "1px solid #d1d5db", borderRadius: "4px", background: showBatchHeatmap ? "#003087" : "white", color: showBatchHeatmap ? "white" : "#374151", cursor: "pointer", fontWeight: 600 }}>
                  {showBatchHeatmap ? "▲ Hide Heatmap" : "▼ Batch Heatmap"}
                </button>
                {filters.batches.length > 0 && (
                  <button onClick={() => setFilters(f => ({ ...f, batches: [] }))} style={{ fontSize: "10px", padding: "3px 8px", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", color: "#374151", cursor: "pointer" }}>Clear Batches</button>
                )}
              </div>
            </div>

            {/* Grouped batch toggle buttons */}
            {groupedOptions.map(group => (
              <div key={group.label} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "5px", textTransform: "uppercase" }}>{group.label}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {group.values.map(b => {
                    const active = filters.batches.includes(b);
                    const count = batchCounts[b] ?? 0;
                    const inData = discoveredBatches.includes(b);
                    return (
                      <button
                        key={b}
                        onClick={() => toggleBatch(b)}
                        title={`${b}${inData ? ` · ${count} mapping${count !== 1 ? "s" : ""}` : " · No data yet"}`}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          border: active ? "2px solid #003087" : "1.5px solid #d1d5db",
                          background: active ? "#003087" : inData ? "white" : "#f9fafb",
                          color: active ? "white" : inData ? "#374151" : "#9ca3af",
                          fontSize: "11px",
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.12s",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {b}
                        {inData && count > 0 && (
                          <span style={{ fontSize: "9px", background: active ? "rgba(255,255,255,0.25)" : "#e5e7eb", color: active ? "white" : "#6b7280", padding: "0 4px", borderRadius: "9999px", fontWeight: 700 }}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Governance note */}
            <div style={{ marginTop: "8px", fontSize: "10px", color: "#6b7280", fontStyle: "italic", borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
              Batch alignment reflects roadmap sequencing and governance maturity — not all UI semantics are fully governed at the current batch state.
            </div>

            {/* Mini Batch Heatmap */}
            {showBatchHeatmap && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "8px", letterSpacing: "0.06em" }}>BATCH GOVERNANCE MATURITY HEATMAP</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "6px" }}>
                  {BATCH_HEATMAP.map(item => {
                    const ms = MATURITY_STYLE[item.maturity];
                    const isActive = filters.batches.includes(item.batch);
                    return (
                      <div
                        key={item.batch}
                        onClick={() => toggleBatch(item.batch)}
                        style={{ padding: "8px 10px", borderRadius: "6px", background: ms.bg, border: isActive ? "2px solid #003087" : "1px solid transparent", cursor: "pointer", transition: "border 0.1s" }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 800, color: ms.text }}>{item.batch}</div>
                        <div style={{ fontSize: "9px", color: ms.text, marginTop: "2px", lineHeight: 1.3 }}>{item.focus}</div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: ms.text, marginTop: "4px", background: "rgba(0,0,0,0.07)", borderRadius: "3px", padding: "1px 4px", display: "inline-block" }}>{ms.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {!filters.leadershipView && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "8px", letterSpacing: "0.08em" }}>LEGEND</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Operationally Supported", bg: "#fef9c3", text: "#854d0e" },
              { label: "Governance Gap",          bg: "#ffedd5", text: "#9a3412" },
              { label: "Requires ADR",            bg: "#ede9fe", text: "#5b21b6" },
              { label: "Missing API",             bg: "#fee2e2", text: "#991b1b" },
              { label: "Consolidated Filing Risk",bg: "#fee2e2", text: "#991b1b" },
              { label: "Roger Assumption",        bg: "#f0fdf4", text: "#166534" },
              { label: "TIM Limitation",          bg: "#e0f2fe", text: "#0369a1" },
            ].map(l => (
              <span key={l.label} style={{ background: l.bg, color: l.text, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>{l.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Ownership Boundaries */}
      {!filters.leadershipView && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Ownership Boundaries:</span>
          {(["TIM", "CEM", "Roger", "PDC", "TDC"] as Owner[]).map(o => (
            <span key={o} style={{ background: OWNER_COLOR[o] + "18", color: OWNER_COLOR[o], border: `1px solid ${OWNER_COLOR[o]}40`, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px" }}>{o}</span>
          ))}
        </div>
      )}

      {/* Sections 1–4: Screen Mapping Tables */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="1–4" title="Roger UI Screen Data Mapping" subtitle="API endpoint mappings, TIM operational support, governance status, and ownership boundaries" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "16px", background: "white" }}>
          {visibleScreens.map(s => <ScreenSection key={s.id} section={s} filters={filters} />)}
        </div>
      </div>

      {/* Section 5 — Returns Detail Governance */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="5" title="Returns Detail Governance Analysis" subtitle="GET /api/consolidations/{consolidationId}/returns — Operational vs Governed Semantics" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ background: "#fee2e2", border: "2px solid #fca5a5", borderRadius: "8px", padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "20px" }}>🚨</span>
            <div>
              <div style={{ fontWeight: 800, color: "#991b1b", fontSize: "13px" }}>HIGH SEVERITY — Governance Assumption Risk</div>
              <div style={{ color: "#b91c1c", fontSize: "12px", marginTop: "4px" }}>Roger UI assumptions may exceed TIM governance capabilities. Parent/Subsidiary roles are operationally modeled — no governed filing authority has been defined.</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Field", "API Field", "Role", "Governance Status", "Notes"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { f: "Return ID",    api: "returnId",    role: "Identifier",   gov: "partial" as GovStatus, note: "Per-entity return id. Links to entity detail." },
                { f: "Entity ID",    api: "entityId",    role: "Identifier",   gov: "partial" as GovStatus, note: "Entity id. No lineage ownership confirmed." },
                { f: "Entity Name",  api: "entityName",  role: "Display",      gov: "partial" as GovStatus, note: "Legal name from PDC entity master." },
                { f: "EIN",          api: "ein",         role: "Identifier",   gov: "partial" as GovStatus, note: "Federal EIN. No governed EIN lineage chain." },
                { f: "Role",         api: "role",        role: "Filing Role",  gov: "gap"     as GovStatus, note: "Parent | Subsidiary | Disregarded. Operationally modeled. No filing authority." },
                { f: "Status",       api: "status",      role: "Operational",  gov: "gap"     as GovStatus, note: "Not Started | In Progress | In Review | Completed. Operational only." },
                { f: "% Complete",   api: "pctComplete", role: "Metric",       gov: "gap"     as GovStatus, note: "Per-return completion. No lineage. No governed rollup." },
              ].map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.f}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: "11px" }}>{r.api}</td>
                  <td style={{ padding: "8px 10px", color: "#6b7280" }}>{r.role}</td>
                  <td style={{ padding: "8px 10px" }}><GovBadge status={r.gov} /></td>
                  <td style={{ padding: "8px 10px", color: "#6b7280" }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, color: "#9a3412", fontSize: "12px", marginBottom: "8px" }}>OPERATIONAL vs GOVERNED SEMANTICS</div>
            {[
              "Parent/Subsidiary roles are operationally modeled — governance ownership is unresolved",
              "Filing authority is unclear — no system has been designated as the filing authority owner",
              "No governed approval chain has been identified",
              "No audit lineage identified for return-level state changes",
              "Roger UI assumptions about role semantics may exceed TIM governance capabilities",
            ].map((item, i) => (
              <div key={i} style={{ fontSize: "11px", color: "#9a3412", marginBottom: "4px", paddingLeft: "10px", borderLeft: "2px solid #f97316" }}>• {item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6 — Issues & Documents Governance */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="6" title="Issues & Documents Governance" subtitle="GET /api/consolidations/{id}/issues · GET /api/consolidations/{id}/documents" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {[
              { title: "Issues Drawer", endpoint: "GET /api/consolidations/{consolidationId}/issues", fields: ["id", "title", "step", "priority", "status", "assignee", "createdDate"], findings: ["Operational issue tracking exists", "No immutable governance chain", "No governed evidence retention model", "No filing approval evidence model"] },
              { title: "Documents Drawer", endpoint: "GET /api/consolidations/{consolidationId}/documents", fields: ["id", "name", "type", "status", "dueDate", "receivedDate", "uploadedBy", "size"], findings: ["Document metadata exists operationally", "No immutable governance chain", "No governed evidence retention model", "No filing approval evidence model"] },
            ].map(drawer => (
              <div key={drawer.title} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>{drawer.title}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{drawer.endpoint}</div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>API FIELDS</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {drawer.fields.map(f => <span key={f} style={{ background: "#f3f4f6", color: "#374151", fontSize: "10px", fontFamily: "monospace", padding: "2px 6px", borderRadius: "3px" }}>{f}</span>)}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#9a3412", marginBottom: "6px" }}>GOVERNANCE FINDINGS</div>
                  {drawer.findings.map((f, i) => <div key={i} style={{ fontSize: "11px", color: "#9a3412", marginBottom: "3px", paddingLeft: "8px", borderLeft: "2px solid #f97316" }}>• {f}</div>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: "12px", marginBottom: "8px" }}>FUTURE GOVERNANCE REQUIREMENTS</div>
            {["Immutable issue audit chain — governed evidence retention model", "Filing approval evidence model — links issues to filing signoff", "Document governance chain — immutable receipt and retention records", "Governed document approval workflow — links documents to filing authority"].map((r, i) => (
              <div key={i} style={{ fontSize: "11px", color: "#1d4ed8", marginBottom: "4px", paddingLeft: "10px", borderLeft: "2px solid #93c5fd" }}>→ {r}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 7 — End-to-End Architecture Flow */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="7" title="End-to-End Architecture Flow" subtitle="System layer ownership and governance boundary analysis" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginBottom: "20px" }}>
            {[
              { layer: "TIM Operational Layer", desc: "Task management, deliverables, due dates, issue tracking", color: "#0ea5e9", callout: "Operational only — governance not explicitly defined" },
              { layer: "CEM Synchronization Layer", desc: "Client/entity master data synchronization from EODS", color: "#f59e0b", callout: "Undefined ownership boundaries with PDC" },
              { layer: "Roger UI Layer", desc: "Practitioner-facing UI — reads from TIM, PDC, TDC via Orchestrator", color: "#8b5cf6", callout: "Missing governance mediation — mixes operational and governed data" },
              { layer: "PDC Governance Layer", desc: "Phoenix Data Consolidation — entity master, financial records, normalization", color: "#003087", callout: "Potential duplication risk with TIM entity data" },
              { layer: "TDC Filing Authority Layer", desc: "Tax Data Consolidation — tax-ready records, AI mapping, practitioner decisions, governed sign-off", color: "#059669", callout: "Filing authority and lineage ownership unresolved for consolidated returns" },
            ].map((l, i, arr) => (
              <div key={i} style={{ width: "100%", maxWidth: "700px" }}>
                <div style={{ background: l.color, borderRadius: "8px", padding: "12px 16px", color: "white" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{l.layer}</div>
                  <div style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>{l.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "6px 0" }}>
                    <div style={{ width: "2px", height: "20px", background: "#d1d5db" }} />
                    <span style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color: "#9a3412", fontWeight: 600 }}>⚠ {l.callout}</span>
                    <div style={{ width: "2px", height: "20px", background: "#d1d5db" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 8 — Governance Gap Heatmap */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="8" title="Governance Gap Heatmap" subtitle="Capability ownership across all systems — Green = Governed · Yellow = Partial · Orange = Undefined · Red = Missing" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: RSM_BLUE }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, fontSize: "12px", minWidth: "180px" }}>Governance Capability</th>
                  {["TIM", "Roger", "CEM", "PDC", "TDC"].map(sys => (
                    <th key={sys} style={{ padding: "10px 14px", textAlign: "center", color: "white", fontWeight: 700, fontSize: "12px", minWidth: "100px" }}>{sys}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEATMAP_DATA.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827", borderBottom: "1px solid #f3f4f6" }}>{row.capability}</td>
                    {(["TIM", "Roger", "CEM", "PDC", "TDC"] as const).map(sys => {
                      const val = row[sys];
                      const s = HEAT_STYLE[val];
                      return (
                        <td key={sys} style={{ padding: "8px 14px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                          <span style={{ background: s.bg, color: s.text, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", display: "inline-block" }}>{s.label}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            {Object.entries(HEAT_STYLE).map(([k, v]) => (
              <span key={k} style={{ background: v.bg, color: v.text, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>{v.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 9 — ADR Dependency Tracker */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="9" title="ADR Dependency Tracker" subtitle="Architecture Decision Records required to resolve governance gaps" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "14px" }}>
            {ADR_CARDS.map(adr => (
              <div key={adr.id} style={{ border: `2px solid ${adr.severity === "high" ? "#fca5a5" : adr.severity === "medium" ? "#fed7aa" : "#d1fae5"}`, borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ background: adr.severity === "high" ? "#fee2e2" : adr.severity === "medium" ? "#fff7ed" : "#f0fdf4", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: RSM_BLUE, fontSize: "12px" }}>{adr.id}</span>
                    <span style={{ fontWeight: 700, color: "#111827", fontSize: "12px" }}>{adr.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <RiskBadge level={adr.severity} />
                    <span style={{ background: adr.currentStatus === "Open" ? "#fee2e2" : "#fef9c3", color: adr.currentStatus === "Open" ? "#991b1b" : "#854d0e", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px" }}>{adr.currentStatus}</span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", fontSize: "11px", color: "#374151" }}>
                  <div style={{ marginBottom: "8px" }}>{adr.description}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#374151", fontSize: "10px", marginBottom: "3px" }}>WHY NEEDED</div>
                      <div style={{ color: "#6b7280" }}>{adr.whyNeeded}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "10px", marginBottom: "3px" }}>RISK IF UNRESOLVED</div>
                      <div style={{ color: "#9a3412" }}>{adr.riskIfUnresolved}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {adr.impactedSystems.map(s => <OwnerChip key={s} owner={s} />)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>Proposed Owner: <strong>{adr.proposedOwner}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 10 — BA / PO Governance Summary */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeader num="10" title="BA / PO Governance Summary" subtitle="Auto-generated from current governance findings" />
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px", background: "white" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* BA Summary */}
            <div style={{ border: "1px solid #bfdbfe", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "#eff6ff", padding: "10px 14px", borderBottom: "1px solid #bfdbfe" }}>
                <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: "13px" }}>📋 BA Governance Summary</div>
                <div style={{ fontSize: "10px", color: "#3b82f6", marginTop: "2px" }}>Missing requirements · Open decisions · UI dependency risks · Data mapping gaps</div>
              </div>
              <div style={{ padding: "14px" }}>
                {[
                  { label: "Missing Requirements", items: ["No governed filing authority defined for consolidated returns", "No entity contribution lineage requirement identified", "No filing signoff requirement in any current contract", "No filing lock state requirement defined"] },
                  { label: "Open Business Decisions", items: ["Who owns filing authority for consolidated returns?", "Are TIM deliverables equivalent to governed filings?", "What constitutes a valid filing signoff?", "Which system owns the filing lock state?"] },
                  { label: "UI Dependency Risks", items: ["Roger UI displays TIM operational data alongside governed PDC/TDC data", "Completion % has no lineage backing — practitioners may misinterpret", "Parent role has no filing authority backing — governance risk in consolidated returns"] },
                  { label: "Data Mapping Gaps", items: [`${tiles.gaps} governance gaps across 4 Roger UI screens`, `${tiles.adrDeps} open ADRs blocking governed data contracts`, "FilingStatus is operational — no governed filing state contract exists", "Deliverables count is operational — no governed filing deliverable contract"] },
                ].map(section => (
                  <div key={section.label} style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#1d4ed8", marginBottom: "5px", letterSpacing: "0.06em" }}>{section.label.toUpperCase()}</div>
                    {section.items.map((item, i) => <div key={i} style={{ fontSize: "11px", color: "#374151", marginBottom: "3px", paddingLeft: "10px", borderLeft: "2px solid #93c5fd" }}>• {item}</div>)}
                  </div>
                ))}
              </div>
            </div>
            {/* PO Summary */}
            <div style={{ border: "1px solid #d1fae5", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "#f0fdf4", padding: "10px 14px", borderBottom: "1px solid #d1fae5" }}>
                <div style={{ fontWeight: 700, color: "#065f46", fontSize: "13px" }}>📊 PO Governance Summary</div>
                <div style={{ fontSize: "10px", color: "#059669", marginTop: "2px" }}>Architecture risks · Governance blockers · Delivery impacts · ADR escalation needs</div>
              </div>
              <div style={{ padding: "14px" }}>
                {[
                  { label: "Architecture Risks", items: ["Roger UI mixes operational TIM data with governed PDC/TDC data — no mediation layer", "Consolidated filing governance is undefined — ADR-1 open", "Filing authority ownership is unresolved — ADR-2 open", "No immutable audit chain for any filing-level state change"] },
                  { label: "Governance Blockers", items: [`${tiles.adrDeps} open ADRs blocking governed filing contracts`, "No TDC filing signoff contract exists", "No PDC entity contribution lineage contract exists", "No filing lock state contract in any system"] },
                  { label: "Delivery Impacts", items: ["Batches B6, B7, B8 cannot close Gate 4 (Lineage Closure) without ADR resolution", "Roger UI demo readiness is limited — most data is mocked or operational", "PI 3 and PI 4 delivery risk elevated by unresolved consolidated filing governance"] },
                  { label: "ADR Escalation Needs", items: ["ADR-1 (Consolidated Filing Governance) — escalate to Architecture Board", "ADR-2 (Filing Authority Ownership) — escalate to TDC PO + Architecture", "ADR-4 (Filing Signoff Governance) — escalate to Compliance + TDC", "ADR-7 (Filing Lock & Finalization) — escalate to TDC PO"] },
                ].map(section => (
                  <div key={section.label} style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#065f46", marginBottom: "5px", letterSpacing: "0.06em" }}>{section.label.toUpperCase()}</div>
                    {section.items.map((item, i) => <div key={i} style={{ fontSize: "11px", color: "#374151", marginBottom: "3px", paddingLeft: "10px", borderLeft: "2px solid #6ee7b7" }}>• {item}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 11 — Executive Footer */}
      <div style={{ background: RSM_BLUE, borderRadius: "10px", padding: "20px 24px", color: "white", textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "6px" }}>Roger UI Mapping & Governance Alignment</div>
        <div style={{ opacity: 0.8, fontSize: "12px", marginBottom: "4px" }}>Prepared by DCT · Source: Roger API Design v1.0 + TIM Swagger Analysis</div>
        <div style={{ opacity: 0.7, fontSize: "11px", marginBottom: "16px" }}>Architecture Governance Review Required</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "⬇ Export Executive PDF", action: () => window.print() },
            { label: "📋 Copy Architecture Summary", action: () => navigator.clipboard.writeText(`Roger UI Mapping & Governance Alignment\n\nGovernance Gaps: ${tiles.gaps}\nOpen ADRs: ${tiles.adrDeps}\nConsolidated Filing Risks: ${tiles.consolidatedRisks}\n\nPrepared by DCT — Architecture Governance Review Required`) },
            { label: "📊 Copy Governance Gap Report", action: () => navigator.clipboard.writeText(HEATMAP_DATA.map(r => `${r.capability}: TIM=${r.TIM} Roger=${r.Roger} CEM=${r.CEM} PDC=${r.PDC} TDC=${r.TDC}`).join("\n")) },
            { label: "🗂 Copy ADR Tracker", action: () => navigator.clipboard.writeText(ADR_CARDS.map(a => `${a.id}: ${a.title}\nStatus: ${a.currentStatus} | Owner: ${a.proposedOwner}\n${a.description}`).join("\n\n")) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px", padding: "8px 16px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

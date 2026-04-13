// Taxonomy Explorer — PDC XLOB & TDC Tax Taxonomy Visualization
// Matches reference: rsm-ai-team-niua6bzx.manus.space/#taxonomy-explorer
// 3-panel cross-highlight: PDC Canonical Accounts → Firm Taxonomy Bridge → TDC Tax Taxonomy
// Click any PDC row to highlight linked firm accounts and tax rules across all three panels.

import { useState, useMemo } from "react";
import { Search, Info, ChevronRight } from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PDC_ACCOUNTS = [
  { id: "CA-1001", name: "Cash and Cash Equivalents",         cls: "Asset",     balance: "Debit",  contra: false, gaap: "ASC 230",    ifrs: "IAS 7"   },
  { id: "CA-1002", name: "Accounts Receivable",               cls: "Asset",     balance: "Debit",  contra: false, gaap: "ASC 310",    ifrs: "IFRS 9"  },
  { id: "CA-1003", name: "Allowance for Doubtful Accounts",   cls: "Asset",     balance: "Credit", contra: true,  gaap: "ASC 310-10", ifrs: "IFRS 9"  },
  { id: "CA-2001", name: "Accounts Payable",                  cls: "Liability", balance: "Credit", contra: false, gaap: "ASC 405",    ifrs: "IAS 37"  },
  { id: "CA-3001", name: "Revenue — Professional Services",   cls: "Revenue",   balance: "Credit", contra: false, gaap: "ASC 606",    ifrs: "IFRS 15" },
  { id: "CA-4001", name: "Salaries and Wages Expense",        cls: "Expense",   balance: "Debit",  contra: false, gaap: "ASC 420",    ifrs: "IAS 19"  },
  { id: "CA-4002", name: "Depreciation Expense",              cls: "Expense",   balance: "Debit",  contra: false, gaap: "ASC 360",    ifrs: "IAS 16"  },
];

const FIRM_TAXONOMY = [
  { firmCode: "1000", firmLabel: "Operating Cash Account",       canonicalId: "CA-1001", taxCategory: "Liquid Assets",        entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "1001", firmLabel: "Client Trust Account",         canonicalId: "CA-1001", taxCategory: "Liquid Assets",        entityType: "S-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "1100", firmLabel: "Trade Receivables",            canonicalId: "CA-1002", taxCategory: "Receivables",          entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "1101", firmLabel: "Unbilled Revenue Receivable",  canonicalId: "CA-1002", taxCategory: "Receivables",          entityType: "C-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "1110", firmLabel: "Bad Debt Reserve",             canonicalId: "CA-1003", taxCategory: "Contra Receivables",   entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "2000", firmLabel: "Vendor Payables",              canonicalId: "CA-2001", taxCategory: "Trade Payables",       entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "4000", firmLabel: "Consulting Revenue",           canonicalId: "CA-3001", taxCategory: "Service Revenue",      entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "4001", firmLabel: "Advisory Fee Revenue",         canonicalId: "CA-3001", taxCategory: "Service Revenue",      entityType: "S-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "6000", firmLabel: "Staff Compensation",           canonicalId: "CA-4001", taxCategory: "Compensation Expense", entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "6100", firmLabel: "Fixed Asset Depreciation",     canonicalId: "CA-4002", taxCategory: "Depreciation",         entityType: "Partnership", effectiveFrom: "2024-01-01" },
];

const TDC_RULES = [
  { taxForm: "Form 1065",  year: 2024, lineNum: "L1",   lineLabel: "Cash",                          canonicalId: "CA-1001", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L2",   lineLabel: "Accounts Receivable",           canonicalId: "CA-1002", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L2a",  lineLabel: "Less: Allowance for Bad Debts", canonicalId: "CA-1003", ruleType: "Contra Offset",  weight: -1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L17",  lineLabel: "Accounts Payable",              canonicalId: "CA-2001", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L1a",  lineLabel: "Gross Receipts or Sales",       canonicalId: "CA-3001", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L9",   lineLabel: "Salaries and Wages",            canonicalId: "CA-4001", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1065",  year: 2024, lineNum: "L14a", lineLabel: "Depreciation",                  canonicalId: "CA-4002", ruleType: "Direct Mapping", weight:  1, entity: "Partnership", jurisdiction: "Federal" },
  { taxForm: "Form 1120S", year: 2024, lineNum: "L1a",  lineLabel: "Gross Receipts",                canonicalId: "CA-3001", ruleType: "Direct Mapping", weight:  1, entity: "S-Corp",      jurisdiction: "Federal" },
  { taxForm: "Form 1120S", year: 2024, lineNum: "L8",   lineLabel: "Salaries and Wages",            canonicalId: "CA-4001", ruleType: "Direct Mapping", weight:  1, entity: "S-Corp",      jurisdiction: "Federal" },
  { taxForm: "Form 1120S", year: 2024, lineNum: "L14",  lineLabel: "Depreciation",                  canonicalId: "CA-4002", ruleType: "Direct Mapping", weight:  1, entity: "S-Corp",      jurisdiction: "Federal" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CLASS_COLORS: Record<string, { bg: string; text: string }> = {
  Asset:     { bg: "#eff6ff", text: "#1d4ed8" },
  Liability: { bg: "#fef3c7", text: "#92400e" },
  Revenue:   { bg: "#f0fdf4", text: "#166534" },
  Expense:   { bg: "#fdf4ff", text: "#7e22ce" },
};

function ClassBadge({ cls }: { cls: string }) {
  const c = CLASS_COLORS[cls] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{
      display: "inline-block", fontSize: "11px", fontWeight: 600,
      padding: "2px 8px", borderRadius: "12px",
      backgroundColor: c.bg, color: c.text,
    }}>{cls}</span>
  );
}

// ─── LINEAGE CHAIN ────────────────────────────────────────────────────────────

const LINEAGE_STEPS = [
  { label: "Client Account",         sub: "Source financial data",         color: "#64748b" },
  { label: "Firm Taxonomy",          sub: "Firm account code → canonical", color: "#8b5cf6" },
  { label: "Canonical XLOB Account", sub: "PDC — financial truth",         color: "#0ea5e9" },
  { label: "Tax Taxonomy Rule",      sub: "TDC — tax mapping truth",       color: "#10b981" },
  { label: "Tax Form Line",          sub: "Form 1065 / 1120S output",      color: "#f59e0b" },
  { label: "Roger Display",          sub: "Read-only practitioner view",   color: "#ef4444" },
];

function LineageChain() {
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
      padding: "20px 24px", marginBottom: "16px",
    }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
        End-to-End Lineage Chain
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: "0", overflowX: "auto", paddingBottom: "4px" }}>
        {LINEAGE_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              border: `1.5px solid ${step.color}30`, borderRadius: "8px",
              padding: "10px 14px", background: `${step.color}08`,
              minWidth: "130px", textAlign: "center",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: step.color, marginBottom: "3px" }}>{step.label}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.3 }}>{step.sub}</div>
            </div>
            {i < LINEAGE_STEPS.length - 1 && (
              <ChevronRight style={{ width: "16px", height: "16px", color: "#cbd5e1", flexShrink: 0, margin: "0 2px" }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
        <strong style={{ color: "#0ea5e9" }}>PDC</strong> owns canonical financial truth.{" "}
        <strong style={{ color: "#10b981" }}>TDC</strong> owns tax mapping truth.{" "}
        <strong style={{ color: "#ef4444" }}>Roger</strong> reads results only — no writes to PDC or TDC.
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [formFilter, setFormFilter] = useState<"All" | "Form 1065" | "Form 1120S">("All");

  const filteredPdc = useMemo(
    () => PDC_ACCOUNTS.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
    ),
    [search],
  );

  const filteredTdc = useMemo(
    () => formFilter === "All" ? TDC_RULES : TDC_RULES.filter(r => r.taxForm === formFilter),
    [formFilter],
  );

  const highlightedFirm = selectedId
    ? new Set(FIRM_TAXONOMY.filter(f => f.canonicalId === selectedId).map(f => f.firmCode))
    : null;

  const highlightedTdc = selectedId
    ? new Set(filteredTdc.filter(r => r.canonicalId === selectedId).map(r => r.lineNum + r.taxForm))
    : null;

  const rowBg = (highlighted: boolean, selected: boolean) =>
    selected ? "#dbeafe" : highlighted ? "#eff6ff" : "transparent";

  const TH_STYLE: React.CSSProperties = {
    padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: 700,
    color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase",
    borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap",
    backgroundColor: "#f8fafc",
  };
  const TD: React.CSSProperties = { padding: "8px 10px" };

  return (
    <div style={{ padding: "24px 28px", backgroundColor: "#f8fafc", minHeight: "100%" }}>

      {/* Page header */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>
          DCT Platform · Prototype Visualization
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
          Taxonomy Explorer
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
          Visualize how canonical accounts, firm taxonomy, and tax form mappings connect end-to-end across PDC and TDC.
        </p>
      </div>

      <LineageChain />

      {/* Instruction hint */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        fontSize: "12px", color: "#0ea5e9",
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "8px", padding: "8px 14px", marginBottom: "16px",
      }}>
        <Info style={{ width: "14px", height: "14px", flexShrink: 0 }} />
        <span>
          <strong>Click any row</strong> in the PDC Canonical Accounts table to highlight linked firm accounts and tax rules across all three panels.
        </span>
      </div>

      {/* 3-panel grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", alignItems: "start" }}>

        {/* ── PANEL 1: PDC Canonical Accounts ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>PDC — Canonical Accounts</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                XLOB Taxonomy
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#0ea5e9", marginBottom: "10px" }}>
              Canonical financial truth. All firm accounts map to these.
            </div>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#94a3b8" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 10px 6px 30px",
                  fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px",
                  outline: "none", color: "#0f172a", backgroundColor: "#f8fafc",
                }}
              />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["ID", "Account Name", "Class", "Balance", "Contra", "GAAP", "IFRS"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPdc.map(a => {
                  const isSelected = selectedId === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedId(prev => prev === a.id ? null : a.id)}
                      style={{ backgroundColor: rowBg(false, isSelected), cursor: "pointer", transition: "background-color 0.15s" }}
                    >
                      <td style={{ ...TD, fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>{a.id}</td>
                      <td style={{ ...TD, color: "#0f172a", fontWeight: isSelected ? 600 : 400 }}>{a.name}</td>
                      <td style={TD}><ClassBadge cls={a.cls} /></td>
                      <td style={{ ...TD, color: "#475569" }}>{a.balance}</td>
                      <td style={TD}>
                        {a.contra && (
                          <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fef2f2", color: "#dc2626", padding: "1px 6px", borderRadius: "8px", border: "1px solid #fecaca" }}>Contra</span>
                        )}
                      </td>
                      <td style={{ ...TD, color: "#64748b", fontSize: "11px" }}>{a.gaap}</td>
                      <td style={{ ...TD, color: "#64748b", fontSize: "11px" }}>{a.ifrs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PANEL 2: Firm Taxonomy Bridge ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Firm Taxonomy Bridge</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fdf4ff", color: "#7e22ce", padding: "2px 8px", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                {FIRM_TAXONOMY.length} mappings
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#8b5cf6", marginBottom: "8px" }}>
              Firm account → Canonical XLOB account linkage.
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <ChevronRight style={{ width: "12px", height: "12px", color: "#8b5cf6" }} />
              Firm Account Code → canonical_account_id (FK to PDC)
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Firm Code", "Firm Label", "→ Canonical ID", "Tax Category", "Entity Type", "Effective From"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIRM_TAXONOMY.map(f => {
                  const isHighlighted = highlightedFirm ? highlightedFirm.has(f.firmCode) : false;
                  return (
                    <tr key={f.firmCode} style={{ backgroundColor: rowBg(isHighlighted, isHighlighted), transition: "background-color 0.15s" }}>
                      <td style={{ ...TD, fontWeight: 700, color: "#7e22ce" }}>{f.firmCode}</td>
                      <td style={{ ...TD, color: "#0f172a", fontWeight: isHighlighted ? 600 : 400 }}>{f.firmLabel}</td>
                      <td style={TD}><span style={{ fontWeight: 700, color: "#2563eb" }}>{f.canonicalId}</span></td>
                      <td style={{ ...TD, color: "#475569" }}>{f.taxCategory}</td>
                      <td style={{ ...TD, color: "#475569" }}>{f.entityType}</td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: "11px" }}>{f.effectiveFrom}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PANEL 3: TDC Tax Taxonomy ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>TDC — Tax Taxonomy</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                {TDC_RULES.length} rules
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#10b981", marginBottom: "8px" }}>
              Canonical account → Tax form line mapping rules. TDC owns tax truth.
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
              <ChevronRight style={{ width: "12px", height: "12px", color: "#10b981" }} />
              Canonical Account → Tax Form Line
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["All", "Form 1065", "Form 1120S"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormFilter(f)}
                  style={{
                    fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px",
                    border: "1px solid",
                    borderColor: formFilter === f ? "#10b981" : "#e2e8f0",
                    backgroundColor: formFilter === f ? "#10b981" : "white",
                    color: formFilter === f ? "white" : "#475569",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >{f}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Tax Form", "Year", "Line #", "Line Label", "→ Canonical ID", "Rule Type", "Weight", "Entity", "Jurisdiction"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTdc.map(r => {
                  const key = r.lineNum + r.taxForm;
                  const isHighlighted = highlightedTdc ? highlightedTdc.has(key) : false;
                  return (
                    <tr key={key} style={{ backgroundColor: rowBg(isHighlighted, isHighlighted), transition: "background-color 0.15s" }}>
                      <td style={{ ...TD, fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }}>{r.taxForm}</td>
                      <td style={{ ...TD, color: "#475569" }}>{r.year}</td>
                      <td style={{ ...TD, fontWeight: 700, color: "#0f172a" }}>{r.lineNum}</td>
                      <td style={{ ...TD, color: "#0f172a", fontWeight: isHighlighted ? 600 : 400 }}>{r.lineLabel}</td>
                      <td style={TD}><span style={{ fontWeight: 700, color: "#2563eb" }}>{r.canonicalId}</span></td>
                      <td style={TD}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700,
                          backgroundColor: r.ruleType === "Contra Offset" ? "#fef2f2" : "#eff6ff",
                          color: r.ruleType === "Contra Offset" ? "#dc2626" : "#1d4ed8",
                          padding: "1px 7px", borderRadius: "8px",
                          border: `1px solid ${r.ruleType === "Contra Offset" ? "#fecaca" : "#bfdbfe"}`,
                        }}>{r.ruleType}</span>
                      </td>
                      <td style={{ ...TD, color: r.weight < 0 ? "#dc2626" : "#166534", fontWeight: 700 }}>{r.weight}</td>
                      <td style={{ ...TD, color: "#475569" }}>{r.entity}</td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: "11px" }}>{r.jurisdiction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

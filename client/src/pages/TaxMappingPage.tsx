// DCT Platform — Tax Mapping Confidence
// Shows AI tax mapping proposals with confidence scores, evidence, and practitioner review status
import { useState } from "react";

const MAPPING_DATA = [
  { id: "TM-001", account: "4100 — Revenue", taxCode: "IRC §61 — Gross Income", confidence: 97, status: "Approved", batch: "Batch 4", evidence: "Historical match rate 98.2% across 12 prior periods", reasoning: "Account consistently maps to gross income recognition under IRC §61" },
  { id: "TM-002", account: "5200 — COGS", taxCode: "IRC §263A — UNICAP", confidence: 91, status: "Approved", batch: "Batch 4", evidence: "Inventory cost allocation pattern matches UNICAP methodology", reasoning: "Uniform capitalization rules apply to manufacturing cost pool" },
  { id: "TM-003", account: "6100 — R&D Expense", taxCode: "IRC §174 — R&D Amortization", confidence: 84, status: "Under Review", batch: "Batch 4", evidence: "Post-2022 mandatory amortization rule applies", reasoning: "Requires 5-year amortization under TCJA amendment; confidence reduced due to mixed classification" },
  { id: "TM-004", account: "6300 — Interest Expense", taxCode: "IRC §163(j) — Business Interest", confidence: 78, status: "Under Review", batch: "Batch 4", evidence: "ATI limitation calculation required", reasoning: "Business interest deduction limited to 30% of ATI; requires separate computation" },
  { id: "TM-005", account: "7100 — Depreciation", taxCode: "IRC §168 — MACRS", confidence: 95, status: "Approved", batch: "Batch 4", evidence: "Asset class codes match MACRS recovery period table", reasoning: "Modified Accelerated Cost Recovery System applies; bonus depreciation phase-down in effect" },
  { id: "TM-006", account: "8200 — Foreign Income", taxCode: "IRC §951A — GILTI", confidence: 62, status: "Flagged", batch: "Batch 4", evidence: "CFC ownership threshold requires verification", reasoning: "Global Intangible Low-Taxed Income inclusion uncertain; requires CFC analysis" },
  { id: "TM-007", account: "9100 — State Taxes", taxCode: "State Apportionment", confidence: 71, status: "Under Review", batch: "Batch 5", evidence: "Multi-state nexus determination required", reasoning: "Sales factor apportionment varies by state; throwback rules may apply" },
  { id: "TM-008", account: "4500 — Rental Income", taxCode: "IRC §469 — Passive Activity", confidence: 88, status: "Approved", batch: "Batch 4", evidence: "Passive activity classification confirmed by entity type", reasoning: "Rental activity classified as passive; losses subject to PAL limitation rules" },
];

const CONFIDENCE_BAND = (score: number) => {
  if (score >= 90) return { label: "High", color: "#059669", bg: "#dcfce7" };
  if (score >= 75) return { label: "Medium", color: "#d97706", bg: "#fef3c7" };
  return { label: "Low", color: "#dc2626", bg: "#fee2e2" };
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Approved":     { bg: "#dcfce7", text: "#166534" },
  "Under Review": { bg: "#fef9c3", text: "#854d0e" },
  "Flagged":      { bg: "#fee2e2", text: "#991b1b" },
};

export default function TaxMappingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filtered = MAPPING_DATA.filter(m => filterStatus === "All" || m.status === filterStatus);
  const selectedMapping = MAPPING_DATA.find(m => m.id === selected);

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", backgroundColor: "#ede9fe", padding: "2px 8px", borderRadius: "4px" }}>
            AI Mapping
          </span>
          <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
            Batch 4 — AI Tax Mapping & Explainability
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Tax Mapping Confidence
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          AI-generated tax mapping proposals with confidence scores, evidence, and practitioner review status.
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Proposals", value: MAPPING_DATA.length, color: "#374151" },
          { label: "Approved", value: MAPPING_DATA.filter(m => m.status === "Approved").length, color: "#059669" },
          { label: "Under Review", value: MAPPING_DATA.filter(m => m.status === "Under Review").length, color: "#d97706" },
          { label: "Flagged", value: MAPPING_DATA.filter(m => m.status === "Flagged").length, color: "#dc2626" },
        ].map(stat => (
          <div key={stat.label} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 16px", backgroundColor: "white" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["All", "Approved", "Under Review", "Flagged"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "5px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "6px",
              border: `1px solid ${filterStatus === s ? "#2563eb" : "#e5e7eb"}`,
              backgroundColor: filterStatus === s ? "#eff6ff" : "white",
              color: filterStatus === s ? "#2563eb" : "#374151",
              cursor: "pointer"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedMapping ? "1fr 340px" : "1fr", gap: "16px" }}>
        {/* Table */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Account", "Tax Code", "Confidence", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const band = CONFIDENCE_BAND(m.confidence);
                const ss = STATUS_STYLE[m.status];
                return (
                  <tr
                    key={m.id}
                    style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: selected === m.id ? "#eff6ff" : i % 2 === 0 ? "white" : "#fafafa", cursor: "pointer" }}
                    onClick={() => setSelected(selected === m.id ? null : m.id)}
                  >
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>{m.account}</td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#374151" }}>{m.taxCode}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "6px", borderRadius: "3px", backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                          <div style={{ width: `${m.confidence}%`, height: "100%", backgroundColor: band.color, borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: band.color }}>{m.confidence}%</span>
                        <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "3px", backgroundColor: band.bg, color: band.color }}>{band.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: ss.bg, color: ss.text }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#2563eb" }}>View →</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedMapping && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", backgroundColor: "white", alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{selectedMapping.id}</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>Account</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{selectedMapping.account}</div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>Tax Code</div>
              <div style={{ fontSize: "13px", color: "#374151" }}>{selectedMapping.taxCode}</div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Confidence</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, height: "8px", borderRadius: "4px", backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                  <div style={{ width: `${selectedMapping.confidence}%`, height: "100%", backgroundColor: CONFIDENCE_BAND(selectedMapping.confidence).color }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: CONFIDENCE_BAND(selectedMapping.confidence).color }}>{selectedMapping.confidence}%</span>
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>Evidence</div>
              <div style={{ fontSize: "12px", color: "#374151", backgroundColor: "#f9fafb", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>{selectedMapping.evidence}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>AI Reasoning</div>
              <div style={{ fontSize: "12px", color: "#374151", backgroundColor: "#f9fafb", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>{selectedMapping.reasoning}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

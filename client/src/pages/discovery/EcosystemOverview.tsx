import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";


type Platform = "erp" | "pdc" | "tdc" | "roger" | "gosystem";

interface PlatformDetail {
  id: Platform;
  name: string;
  shortName: string;
  purpose: string;
  owner: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  responsibilities: string[];
  input: string;
  output: string;
  consumers: string[];
  apis: string[];
  businessObjects: string[];
}

const PLATFORMS: PlatformDetail[] = [
  {
    id: "erp",
    name: "ERP / Financial Systems",
    shortName: "ERP",
    purpose: "Source of financial truth — trial balances, GL data, and entity structures from client systems.",
    owner: "Client / External",
    color: "#475569",
    bgColor: "#f8fafc",
    borderColor: "#cbd5e1",
    icon: "🏢",
    responsibilities: ["Trial balance upload", "GL data export", "Entity master data", "Chart of accounts", "Reporting period data"],
    input: "Client financial data, trial balances, GL exports",
    output: "Raw financial data files (CSV, Excel, API feeds)",
    consumers: ["PDC (Phoenix Data Consolidation)"],
    apis: ["File upload endpoints", "Data feed APIs", "Entity export APIs"],
    businessObjects: ["Trial Balance", "General Ledger Entry", "Chart of Accounts", "Entity", "Reporting Period"],
  },
  {
    id: "pdc",
    name: "PDC — Phoenix Data Consolidation (DCT)",
    shortName: "PDC",
    purpose: "Financial truth layer — ingests, normalizes, and canonicalizes all financial data for downstream tax processing.",
    owner: "RSM / CATT — PDC Team",
    color: "#1e3a5f",
    bgColor: "#eff6ff",
    borderColor: "#3b82f6",
    icon: "☁",
    responsibilities: ["Data ingestion", "Data normalization", "Entity management", "Canonical model enforcement", "Reporting period assignment", "Cross-LOB taxonomy", "Exception surfacing"],
    input: "Raw financial data from ERP / client systems",
    output: "Normalized financial data (canonical model)",
    consumers: ["TDC / DCT"],
    apis: ["Ingestion API", "Entity API", "Normalization API", "Reporting Period API", "Exception API"],
    businessObjects: ["Canonical Financial Record", "Entity", "Reporting Period", "Normalized Account", "Exception Record"],
  },
  {
    id: "tdc",
    name: "TDC — Tax Data Consolidation (DCT)",
    shortName: "TDC / DCT",
    purpose: "Tax transformation platform — applies tax rules, mappings, adjustments, and classifications to produce tax-ready data.",
    owner: "RSM / CATT — TDC Team",
    color: "#065f46",
    bgColor: "#f0fdf4",
    borderColor: "#059669",
    icon: "⚙",
    responsibilities: ["Tax rules engine", "Known mappings", "Book-to-tax classifications", "Tax adjustments", "Reclassifications", "State tax support", "Provision support", "Data lineage", "API publication", "Persistence layer"],
    input: "Normalized financial data from PDC",
    output: "Tax-ready data with full lineage",
    consumers: ["Roger", "IMS (Integration & Management System)", "Downstream reporting"],
    apis: ["Tax Mapping API", "Adjustment API", "Classification API", "Lineage API", "Known Mappings API", "State Rules API"],
    businessObjects: ["Tax Mapping", "Tax Adjustment", "Known Mapping", "Reclassification", "Lineage Record", "Tax-Ready Record"],
  },
  {
    id: "roger",
    name: "Roger",
    shortName: "Roger",
    purpose: "Tax professional workspace — the practitioner-facing UI that consumes TDC data for review, editing, and approval.",
    owner: "RSM / CATT — Roger Team",
    color: "#7c3aed",
    bgColor: "#faf5ff",
    borderColor: "#7c3aed",
    icon: "👤",
    responsibilities: ["Display tax data", "Edit accounts", "Review mappings", "Approve adjustments", "Resolve exceptions", "Account mapping", "Tax adjustments UI", "Memo and annotation"],
    input: "Tax-ready data from TDC via governed APIs",
    output: "Practitioner decisions sent back to TDC",
    consumers: ["TDC (updates flow back)", "Practitioner / Tax Professional"],
    apis: ["Roger Read API (TDC)", "Roger Update API (TDC)", "Roger Adjustment API", "Roger Approval API"],
    businessObjects: ["Account View", "Adjustment Record", "Approval Decision", "Exception Resolution", "Memo"],
  },
  {
    id: "gosystem",
    name: "IMS — Integration & Management System",
    shortName: "IMS",
    purpose: "Integration broker between DCT/TDC and all downstream return engines (GoSystem, CCH, OIT). IMS retrieves governed tax-ready data from TDC via the B9A Gateway, translates the flat IRS-form payload into engine-specific format, performs roll-up and grouping, and routes to the correct return engine. DCT does not connect directly to any return engine.",
    owner: "RSM / CATT — IMS Team",
    color: "#7c3aed",
    bgColor: "#faf5ff",
    borderColor: "#7c3aed",
    icon: "↔",
    responsibilities: ["IRS line translation (formLineCode → engine field)", "Roll-up: per-record lines → per-form-line totals", "Engine-specific grouping and worksheet structure", "Data-copy where engine requires same value in multiple fields", "Engine routing and return instance selection", "Write data into GoSystem, CCH, OIT", "Per-line feedback using returnLineId for correlation"],
    input: "Flat IRS-form-structured tax lines from TDC via B9A Gateway",
    output: "Engine-shaped, translated payload delivered to return engine",
    consumers: ["GoSystem Tax", "CCH", "OIT", "Future Return Engines"],
    apis: ["B9A Gateway API (consumer)", "IMS Engine Delivery API", "IMS Engine Lookup API", "IMS Inbound Feedback API"],
    businessObjects: ["Delivery Record", "Engine Mapping", "Roll-Up Result", "Per-Line Feedback", "Routing Decision"],
  },
];

export default function EcosystemOverview() {
  const [selected, setSelected] = useState<Platform | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedPlatform = PLATFORMS.find(p => p.id === selected);

  const openPanel = (id: Platform) => {
    setSelected(id);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>⬡</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Ecosystem Overview</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          The DCT platform connects five systems in a governed data pipeline. Click any platform card to explore its purpose, responsibilities, APIs, and business objects.
        </p>
      </div>

      {/* Architecture flow */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px",
        padding: "32px 24px", marginBottom: "28px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "24px" }}>
          Platform Architecture — Data Flow
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
          {PLATFORMS.map((platform, idx) => (
            <div key={platform.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              {/* Platform card */}
              <button
                onClick={() => openPanel(platform.id)}
                style={{
                  width: "min(480px, 100%)",
                  padding: "16px 20px",
                  backgroundColor: selected === platform.id ? platform.bgColor : "white",
                  border: `2px solid ${selected === platform.id ? platform.borderColor : "#e2e8f0"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  boxShadow: selected === platform.id ? `0 0 0 3px ${platform.borderColor}22` : "0 1px 3px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => {
                  if (selected !== platform.id) {
                    (e.currentTarget as HTMLElement).style.borderColor = platform.borderColor;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`;
                  }
                }}
                onMouseLeave={e => {
                  if (selected !== platform.id) {
                    (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    backgroundColor: platform.bgColor, border: `1px solid ${platform.borderColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", flexShrink: 0,
                  }}>
                    {platform.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "2px" }}>{platform.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{platform.purpose.substring(0, 80)}...</div>
                  </div>
                  <div style={{
                    fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                    backgroundColor: platform.bgColor, color: platform.color,
                    border: `1px solid ${platform.borderColor}`, fontWeight: 600, flexShrink: 0,
                  }}>
                    {platform.owner.split(" — ")[0]}
                  </div>
                </div>
              </button>

              {/* Animated arrow */}
              {idx < PLATFORMS.length - 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0" }}>
                  <div style={{
                    width: "2px", height: "16px",
                    background: "linear-gradient(to bottom, #3b82f6, #059669)",
                    borderRadius: "1px",
                  }} />
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "8px solid #059669",
                  }} />
                  <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginTop: "2px" }}>
                    DATA FLOW
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "#94a3b8" }}>
          Click any platform card to view full details →
        </div>
      </div>

      {/* Detail panel */}
      {panelOpen && selectedPlatform && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "420px",
          backgroundColor: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          zIndex: 1000, display: "flex", flexDirection: "column",
          animation: "slideIn 0.25s ease",
        }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

          {/* Panel header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: selectedPlatform.bgColor,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>{selectedPlatform.icon}</span>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f1623" }}>{selectedPlatform.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Owner: {selectedPlatform.owner}</div>
                </div>
              </div>
              <button
                onClick={closePanel}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b", padding: "4px" }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{selectedPlatform.purpose}</p>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {/* Responsibilities */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                Responsibilities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedPlatform.responsibilities.map(r => (
                  <span key={r} style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                    backgroundColor: selectedPlatform.bgColor, color: selectedPlatform.color,
                    border: `1px solid ${selectedPlatform.borderColor}`, fontWeight: 500,
                  }}>{r}</span>
                ))}
              </div>
            </div>

            {/* Input / Output */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Input</div>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{selectedPlatform.input}</div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Output</div>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{selectedPlatform.output}</div>
              </div>
            </div>

            {/* Downstream Consumers */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                Downstream Consumers
              </div>
              {selectedPlatform.consumers.map(c => (
                <div key={c} style={{
                  fontSize: "12px", padding: "6px 10px", marginBottom: "4px",
                  backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0",
                  color: "#334155", display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <span style={{ color: "#059669" }}>→</span> {c}
                </div>
              ))}
            </div>

            {/* Major APIs */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                Major APIs
              </div>
              {selectedPlatform.apis.map(a => (
                <div key={a} style={{
                  fontSize: "12px", padding: "6px 10px", marginBottom: "4px",
                  backgroundColor: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe",
                  color: "#1e40af", fontFamily: "monospace",
                }}>
                  {a}
                </div>
              ))}
            </div>

            {/* Business Objects */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                Business Objects
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedPlatform.businessObjects.map(o => (
                  <span key={o} style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                    backgroundColor: "#f1f5f9", color: "#475569",
                    border: "1px solid #e2e8f0", fontWeight: 500,
                  }}>{o}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {panelOpen && (
        <div
          onClick={closePanel}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)", zIndex: 999,
          }}
        />
      )}
      <RelatedObjectsPanel rootNodeId="sys-tdc" title="Platform Ecosystem — Connected Knowledge Graph" />
      <DiscoveryAskBuddy pagePath="/discovery/ecosystem" pageTitle="Ecosystem Overview" />
    </div>
  );
}

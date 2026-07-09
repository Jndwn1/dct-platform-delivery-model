import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface PlatformCard {
  id: string;
  name: string;
  shortName: string;
  purpose: string;
  purposeLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  responsibilities: string[];
  output: string;
  note?: string;
}

const CARDS: PlatformCard[] = [
  {
    id: "pdc",
    name: "PDC — Phoenix Data Consolidation (DCT)",
    shortName: "PDC",
    purpose: "Financial Truth",
    purposeLabel: "Source of financial truth for all downstream tax processing",
    color: "#1e3a5f",
    bgColor: "#eff6ff",
    borderColor: "#3b82f6",
    icon: "☁",
    responsibilities: [
      "Data ingestion",
      "Data normalization",
      "Entity management",
      "Canonical model",
      "Reporting periods",
    ],
    output: "Financial data",
  },
  {
    id: "tdc",
    name: "TDC — Tax Data Consolidation (DCT)",
    shortName: "TDC / DCT",
    purpose: "Tax Transformation Platform",
    purposeLabel: "Transforms financial data into tax-ready data with full lineage",
    color: "#065f46",
    bgColor: "#f0fdf4",
    borderColor: "#059669",
    icon: "⚙",
    responsibilities: [
      "Tax rules",
      "Known mappings",
      "Tax adjustments",
      "Reclassifications",
      "Book vs Tax",
      "State support",
      "Provision support",
      "APIs",
      "Data lineage",
      "Persistence",
    ],
    output: "Tax-ready data",
  },
  {
    id: "roger",
    name: "Roger",
    shortName: "Roger",
    purpose: "Tax Professional Workspace",
    purposeLabel: "Practitioner-facing UI for review, editing, and approval",
    color: "#7c3aed",
    bgColor: "#faf5ff",
    borderColor: "#7c3aed",
    icon: "👤",
    responsibilities: [
      "Display data",
      "Edit data",
      "Review",
      "Approve",
      "Exception resolution",
      "Account mapping",
      "Tax adjustments",
    ],
    output: "Practitioner decisions → TDC",
    note: "Roger is NOT the system of record. Roger consumes and updates TDC.",
  },
  {
    id: "gosystem",
    name: "IMS Integration",
    shortName: "GoSystem",
    purpose: "Enterprise Tax Return Preparation",
    purposeLabel: "Downstream consumer of TDC data for return preparation",
    color: "#92400e",
    bgColor: "#fffbeb",
    borderColor: "#d97706",
    icon: "📋",
    responsibilities: [
      "Federal returns",
      "State returns",
      "Forms",
      "Schedules",
      "Filing packages",
    ],
    output: "Tax returns & filing packages",
    note: "IMS is the integration broker. DCT does not connect directly to any return engine.",
  },
];

export default function PlatformResponsibilities() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>▦</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Platform Responsibilities</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Each platform in the DCT ecosystem owns a clearly defined set of responsibilities. Understanding these boundaries is essential for writing correct requirements.
        </p>
      </div>

      {/* Ownership principle banner */}
      <div style={{
        backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px",
        padding: "12px 16px", marginBottom: "28px",
        display: "flex", alignItems: "flex-start", gap: "10px",
      }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠</span>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "2px" }}>Ownership Principle</div>
          <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>
            Each system owns its domain exclusively. PDC owns financial data. TDC owns tax logic and persistence. Roger owns the user experience — not the data. GoSystem owns return preparation. No system crosses these boundaries.
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "20px" }}>
        {CARDS.map(card => {
          const isExpanded = expanded === card.id;
          return (
            <div
              key={card.id}
              style={{
                backgroundColor: "white",
                border: `2px solid ${isExpanded ? card.borderColor : "#e2e8f0"}`,
                borderRadius: "12px",
                overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: isExpanded ? `0 4px 20px ${card.borderColor}22` : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "20px 24px",
                  backgroundColor: card.bgColor,
                  borderBottom: `1px solid ${card.borderColor}44`,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "14px",
                }}
                onClick={() => setExpanded(isExpanded ? null : card.id)}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "10px",
                  backgroundColor: "white", border: `2px solid ${card.borderColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: card.color, marginBottom: "2px" }}>
                    {card.shortName}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f1623", marginBottom: "2px" }}>{card.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{card.purposeLabel}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                    backgroundColor: card.color, color: "white", fontWeight: 700, marginBottom: "6px",
                  }}>
                    {card.purpose}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{isExpanded ? "▲ Collapse" : "▼ Expand"}</div>
                </div>
              </div>

              {/* Responsibilities */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "12px" }}>
                  Responsibilities
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                  {card.responsibilities.map(r => (
                    <span key={r} style={{
                      fontSize: "12px", padding: "4px 10px", borderRadius: "6px",
                      backgroundColor: card.bgColor, color: card.color,
                      border: `1px solid ${card.borderColor}`, fontWeight: 500,
                    }}>{r}</span>
                  ))}
                </div>

                {/* Output */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", backgroundColor: "#f0fdf4",
                  borderRadius: "8px", border: "1px solid #bbf7d0",
                }}>
                  <span style={{ fontSize: "14px" }}>→</span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em" }}>Output</div>
                    <div style={{ fontSize: "13px", color: "#065f46", fontWeight: 600 }}>{card.output}</div>
                  </div>
                </div>

                {/* Governance note */}
                {card.note && (
                  <div style={{
                    marginTop: "12px", padding: "10px 14px",
                    backgroundColor: "#fef2f2", borderRadius: "8px",
                    border: "1px solid #fecaca",
                    display: "flex", alignItems: "flex-start", gap: "8px",
                  }}>
                    <span style={{ color: "#dc2626", fontSize: "14px", flexShrink: 0 }}>⚠</span>
                    <div style={{ fontSize: "12px", color: "#7f1d1d", fontWeight: 600, lineHeight: "1.5" }}>{card.note}</div>
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                      Boundary Rule
                    </div>
                    <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {card.id === "pdc" && "PDC is the source of financial truth. It does NOT apply tax logic, make tax decisions, or own tax-ready data. Any financial data transformation that is not tax-specific belongs in PDC."}
                      {card.id === "tdc" && "TDC owns all tax logic, tax decisions, and tax-ready data. It does NOT own the user experience. All Roger stories must trace back to a TDC API or business object. TDC is the system of record."}
                      {card.id === "roger" && "Roger is a consumer of TDC. It does NOT own business rules, tax logic, or data persistence. Roger stories describe what the practitioner sees and does — not what the data does. All data changes in Roger call TDC APIs."}
                      {card.id === "gosystem" && "IMS is the integration broker between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT). DCT does not connect directly to any return engine. IMS retrieves governed data via the B9A Gateway, translates the payload, and routes it to the correct return engine."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Flow summary */}
      <div style={{
        marginTop: "28px", padding: "20px 24px",
        backgroundColor: "#0f1623", borderRadius: "12px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        {["ERP", "→", "PDC", "→", "TDC / DCT", "→", "Roger", "→", "IMS", "→", "GoSystem"].map((item, idx) => (
          <span key={idx} style={{
            fontSize: item === "→" ? "16px" : "13px",
            fontWeight: item === "→" ? 400 : 700,
            color: item === "→" ? "#475569" : "white",
            padding: item === "→" ? "0" : "4px 10px",
            backgroundColor: item === "→" ? "transparent" : "rgba(255,255,255,0.08)",
            borderRadius: item === "→" ? 0 : "6px",
          }}>
            {item}
          </span>
        ))}
        <div style={{ flex: 1, textAlign: "right" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Governed data pipeline — IMS is the integration broker between TDC and all return engines</span>
        </div>
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/platform-responsibilities" pageTitle="Platform Responsibilities" />
    </div>
  );
}

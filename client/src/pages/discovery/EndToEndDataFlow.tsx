import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface FlowStep {
  id: string;
  system: string;
  systemColor: string;
  systemBg: string;
  title: string;
  description: string;
  steps: string[];
  output: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "erp",
    system: "ERP / Client Systems",
    systemColor: "#475569",
    systemBg: "#f8fafc",
    title: "Data Origin",
    description: "The journey begins when a client uploads their trial balance or financial data from their ERP or accounting system.",
    steps: ["Client uploads Trial Balance", "GL data exported from ERP", "Chart of accounts provided", "Entity structure submitted"],
    output: "Raw financial files → PDC",
  },
  {
    id: "pdc",
    system: "PDC — Phoenix Data Consolidation (DCT)",
    systemColor: "#1e3a5f",
    systemBg: "#eff6ff",
    title: "Financial Truth Creation",
    description: "PDC ingests the raw data, normalizes it against the canonical model, assigns entities and reporting periods, and creates the financial truth record.",
    steps: ["Ingest raw financial data", "Normalize against canonical model", "Assign Entity", "Assign Reporting Period", "Validate cross-LOB taxonomy", "Create Financial Truth record", "Surface exceptions if any", "Send normalized data to TDC"],
    output: "Normalized financial data → TDC",
  },
  {
    id: "tdc",
    system: "TDC — Tax Data Consolidation (DCT)",
    systemColor: "#065f46",
    systemBg: "#f0fdf4",
    title: "Tax Transformation",
    description: "TDC receives the financial data and applies the full tax transformation pipeline — rules, mappings, classifications, adjustments, and state logic.",
    steps: ["Receive financial data from PDC", "Apply tax rules engine", "Apply known mappings", "Apply book-to-tax classifications", "Apply tax adjustments", "Apply state rules", "Apply provision logic", "Store tax-ready data with lineage", "Publish events downstream"],
    output: "Tax-ready data with full lineage → Roger + GoSystem",
  },
  {
    id: "roger",
    system: "Roger — Tax Professional Workspace",
    systemColor: "#7c3aed",
    systemBg: "#faf5ff",
    title: "Practitioner Review & Approval",
    description: "Roger loads the tax-ready data via TDC APIs and presents it to the tax professional for review, editing, and approval.",
    steps: ["Load data via TDC Read APIs", "Display accounts and mappings", "Practitioner reviews data", "Practitioner edits account (if needed)", "Creates adjustment with memo", "Approves reviewed items", "Calls TDC Update API", "Changes persisted back to TDC"],
    output: "Practitioner decisions → TDC (persisted)",
  },
  {
    id: "tdc2",
    system: "TDC — Persistence & Lineage",
    systemColor: "#065f46",
    systemBg: "#f0fdf4",
    title: "Validation & Lineage Closure",
    description: "TDC validates the practitioner's changes, persists them, updates the lineage record, and publishes events to make data available downstream.",
    steps: ["Validate incoming changes", "Persist updates to data store", "Update lineage record", "Publish downstream events", "Make data available to GoSystem"],
    output: "Finalized tax-ready data → GoSystem Tax",
  },
  {
    id: "gosystem",
    system: "GoSystem Tax",
    systemColor: "#92400e",
    systemBg: "#fffbeb",
    title: "Return Preparation",
    description: "GoSystem Tax consumes the finalized, practitioner-approved data from TDC and produces the complete tax return package.",
    steps: ["Consume finalized data from TDC", "Prepare Federal Return", "Prepare State Returns", "Generate Schedules", "Produce Tax Forms", "Assemble Filing Package"],
    output: "Federal Return · State Returns · Schedules · Filing Package",
  },
];

export default function EndToEndDataFlow() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>→</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>End-to-End Data Flow</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Trace how financial data moves from a client's ERP system through PDC, TDC, Roger, and GoSystem Tax. Click any step to see the detailed sub-steps.
        </p>
      </div>

      {/* Flow timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: "28px", top: "20px", bottom: "20px",
          width: "2px",
          background: "linear-gradient(to bottom, #94a3b8, #3b82f6, #059669, #7c3aed, #059669, #d97706)",
          borderRadius: "1px",
        }} />

        {FLOW_STEPS.map((step, idx) => {
          const isActive = activeStep === step.id;
          return (
            <div key={step.id} style={{ display: "flex", gap: "20px", marginBottom: "16px", position: "relative" }}>
              {/* Step number circle */}
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                backgroundColor: isActive ? step.systemColor : "white",
                border: `3px solid ${step.systemColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, zIndex: 1,
                transition: "background-color 0.2s",
                cursor: "pointer",
              }}
                onClick={() => setActiveStep(isActive ? null : step.id)}
              >
                <span style={{ fontSize: "16px", fontWeight: 800, color: isActive ? "white" : step.systemColor }}>
                  {idx + 1}
                </span>
              </div>

              {/* Step content */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: isActive ? step.systemBg : "white",
                  border: `2px solid ${isActive ? step.systemColor : "#e2e8f0"}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  boxShadow: isActive ? `0 4px 16px ${step.systemColor}22` : "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onClick={() => setActiveStep(isActive ? null : step.id)}
              >
                {/* Header */}
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: step.systemColor, marginBottom: "2px" }}>
                      {step.system}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f1623" }}>{step.title}</div>
                  </div>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isActive ? "▲" : "▼"}</span>
                </div>

                {/* Description (always visible) */}
                <div style={{ padding: "0 18px 12px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                  {step.description}
                </div>

                {/* Expanded steps */}
                {isActive && (
                  <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${step.systemColor}22` }}>
                    <div style={{ paddingTop: "12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "10px" }}>
                        Detailed Steps
                      </div>
                      {step.steps.map((s, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "6px 10px", marginBottom: "4px",
                          backgroundColor: "white", borderRadius: "6px",
                          border: "1px solid #f1f5f9",
                        }}>
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "50%",
                            backgroundColor: step.systemBg, border: `1px solid ${step.systemColor}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "9px", fontWeight: 700, color: step.systemColor, flexShrink: 0,
                          }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: "12px", color: "#334155" }}>{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* Output */}
                    <div style={{
                      marginTop: "12px", padding: "10px 14px",
                      backgroundColor: "#f0fdf4", borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                      display: "flex", alignItems: "center", gap: "8px",
                    }}>
                      <span style={{ color: "#059669", fontSize: "14px" }}>→</span>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em" }}>Output</div>
                        <div style={{ fontSize: "12px", color: "#065f46", fontWeight: 600 }}>{step.output}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: "8px", padding: "16px 20px",
        backgroundColor: "#0f1623", borderRadius: "10px",
        fontSize: "12px", color: "#94a3b8", lineHeight: "1.6",
      }}>
        <strong style={{ color: "white" }}>Key Principle:</strong> Data flows in one direction — from ERP through PDC to TDC to Roger/GoSystem. Roger sends practitioner decisions back to TDC, which is the single system of record. GoSystem only reads from TDC and never writes back.
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/data-flow" pageTitle="End-to-End Data Flow" />
    </div>
  );
}

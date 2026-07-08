import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface IntegrationRow {
  system: string;
  systemColor: string;
  systemBg: string;
  apiLayer: string[];
  businessServices: string[];
  persistence: string;
  consumers: string[];
  dataDirection: "in" | "out" | "both";
}

const INTEGRATIONS: IntegrationRow[] = [
  {
    system: "ERP / Financial Systems",
    systemColor: "#475569",
    systemBg: "#f8fafc",
    apiLayer: ["File Upload API", "GL Export API", "Entity Export API"],
    businessServices: ["Trial Balance Parser", "GL Extractor", "Entity Resolver"],
    persistence: "Client ERP (external)",
    consumers: ["PDC Ingestion Service"],
    dataDirection: "out",
  },
  {
    system: "PDC — Phoenix Data Consolidation (DCT)",
    systemColor: "#1e3a5f",
    systemBg: "#eff6ff",
    apiLayer: ["Ingestion API", "Entity API", "Normalization API", "Reporting Period API", "Exception API"],
    businessServices: ["Normalization Engine", "Entity Manager", "Canonical Model Service", "Exception Surfacer", "Cross-LOB Taxonomy"],
    persistence: "PDC Data Store (canonical financial records)",
    consumers: ["TDC / DCT"],
    dataDirection: "both",
  },
  {
    system: "TDC — Tax Data Consolidation (DCT)",
    systemColor: "#065f46",
    systemBg: "#f0fdf4",
    apiLayer: ["Tax Mapping API", "Adjustment API", "Classification API", "Lineage API", "Known Mappings API", "State Rules API", "Roger Read API", "Roger Update API"],
    businessServices: ["Tax Rules Engine", "Known Mapping Service", "Book-to-Tax Classifier", "State Rules Processor", "Provision Engine", "Lineage Tracker", "Event Publisher"],
    persistence: "TDC Data Store (system of record — tax-ready data + lineage)",
    consumers: ["Roger", "IMS (Integration & Management System)", "Reporting / Analytics"],
    dataDirection: "both",
  },
  {
    system: "Roger — Tax Professional Workspace",
    systemColor: "#7c3aed",
    systemBg: "#faf5ff",
    apiLayer: ["Roger Read API (→ TDC)", "Roger Update API (→ TDC)", "Roger Adjustment API", "Roger Approval API"],
    businessServices: ["Account Display Service", "Edit & Adjustment UI", "Approval Workflow", "Exception Resolution UI", "Memo Service"],
    persistence: "None — Roger is stateless. All persistence is in TDC.",
    consumers: ["Tax Professional (end user)", "TDC (receives updates)"],
    dataDirection: "both",
  },
  {
    system: "IMS — Integration & Management System",
    systemColor: "#7c3aed",
    systemBg: "#faf5ff",
    apiLayer: ["IMS Payload Retrieval API (← B9A Gateway)", "IMS Engine Delivery API", "IMS Engine Lookup API", "IMS Inbound API"],
    businessServices: ["Engine Router", "Payload Translator", "Engine Lookup Service", "Delivery Tracker", "Inbound Handler"],
    persistence: "IMS Delivery Store (routing decisions, delivery status, acknowledgements)",
    consumers: ["GoSystem Tax", "CCH", "OIT", "Future Return Engines"],
    dataDirection: "both",
  },
];

interface ApiCallRow {
  caller: string;
  callerColor: string;
  api: string;
  target: string;
  targetColor: string;
  direction: string;
  purpose: string;
}

const API_CALLS: ApiCallRow[] = [
  { caller: "PDC",     callerColor: "#1e3a5f", api: "PDC → TDC Data Contract",   target: "TDC",     targetColor: "#065f46", direction: "→", purpose: "Send normalized financial data after ingestion" },
  { caller: "TDC",     callerColor: "#065f46", api: "Roger Read API",             target: "Roger",   targetColor: "#7c3aed", direction: "→", purpose: "Deliver tax-ready data to practitioner workspace" },
  { caller: "Roger",   callerColor: "#7c3aed", api: "Roger Update API",           target: "TDC",     targetColor: "#065f46", direction: "→", purpose: "Send practitioner edits and adjustments back to TDC" },
  { caller: "Roger",   callerColor: "#7c3aed", api: "Roger Approval API",         target: "TDC",     targetColor: "#065f46", direction: "→", purpose: "Submit practitioner approval decisions to TDC" },
  { caller: "B9A Gateway", callerColor: "#065f46", api: "B9A Consumer API", target: "IMS", targetColor: "#7c3aed", direction: "→", purpose: "IMS retrieves governed tax-ready payload via B9A Gateway (governed consumer)" },
  { caller: "IMS",     callerColor: "#7c3aed", api: "IMS Engine Delivery API",   target: "Return Engine", targetColor: "#92400e", direction: "→", purpose: "IMS routes translated payload to GoSystem, CCH, OIT, or future engine" },
  { caller: "TDC",     callerColor: "#065f46", api: "Lineage API",                target: "TDC",     targetColor: "#065f46", direction: "↺", purpose: "Update lineage records on every data change" },
  { caller: "TDC",     callerColor: "#065f46", api: "Event Publisher",            target: "All",     targetColor: "#475569", direction: "→", purpose: "Publish downstream events when data is ready" },
];

export default function IntegrationArchitecture() {
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [view, setView] = useState<"layers" | "api-calls">("layers");

  const filtered = activeSystem
    ? INTEGRATIONS.filter(i => i.system.includes(activeSystem))
    : INTEGRATIONS;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>↝</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Integration Architecture</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Detailed view of each system's API layer, business services, persistence, and consumer relationships. Shows which systems call which APIs and the direction of data flow.
        </p>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[["layers", "System Layers"], ["api-calls", "API Call Map"]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v as "layers" | "api-calls")}
            style={{
              padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              backgroundColor: view === v ? "#1e3a5f" : "#f1f5f9",
              color: view === v ? "white" : "#475569",
              fontWeight: 600, fontSize: "12px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "layers" && (
        <>
          {/* Layer legend */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { label: "API Layer", color: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
              { label: "Business Services", color: "#f0fdf4", border: "#059669", text: "#065f46" },
              { label: "Persistence", color: "#faf5ff", border: "#7c3aed", text: "#6b21a8" },
              { label: "Consumers", color: "#fffbeb", border: "#d97706", text: "#92400e" },
            ].map(l => (
              <div key={l.label} style={{
                padding: "4px 10px", borderRadius: "4px",
                backgroundColor: l.color, border: `1px solid ${l.border}`,
                fontSize: "11px", fontWeight: 600, color: l.text,
              }}>
                {l.label}
              </div>
            ))}
          </div>

          {/* Integration table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {INTEGRATIONS.map(row => (
              <div key={row.system} style={{
                backgroundColor: "white", border: `2px solid ${row.systemColor}22`,
                borderRadius: "10px", overflow: "hidden",
                borderLeft: `4px solid ${row.systemColor}`,
              }}>
                {/* System header */}
                <div style={{
                  padding: "12px 18px", backgroundColor: row.systemBg,
                  borderBottom: `1px solid ${row.systemColor}22`,
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f1623", flex: 1 }}>{row.system}</div>
                  <div style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                    backgroundColor: row.dataDirection === "both" ? "#f0fdf4" : row.dataDirection === "out" ? "#eff6ff" : "#faf5ff",
                    color: row.dataDirection === "both" ? "#065f46" : row.dataDirection === "out" ? "#1e3a5f" : "#7c3aed",
                    border: `1px solid ${row.dataDirection === "both" ? "#059669" : row.dataDirection === "out" ? "#3b82f6" : "#7c3aed"}`,
                    fontWeight: 700,
                  }}>
                    {row.dataDirection === "both" ? "↔ Bidirectional" : row.dataDirection === "out" ? "→ Outbound" : "← Inbound"}
                  </div>
                </div>

                {/* Layers grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0" }}>
                  {/* API Layer */}
                  <div style={{ padding: "14px 16px", borderRight: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1e40af", marginBottom: "8px" }}>API Layer</div>
                    {row.apiLayer.map(api => (
                      <div key={api} style={{ fontSize: "11px", color: "#1e40af", fontFamily: "monospace", padding: "2px 0", borderBottom: "1px solid #f1f5f9" }}>{api}</div>
                    ))}
                  </div>

                  {/* Business Services */}
                  <div style={{ padding: "14px 16px", borderRight: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#065f46", marginBottom: "8px" }}>Business Services</div>
                    {row.businessServices.map(svc => (
                      <div key={svc} style={{ fontSize: "11px", color: "#334155", padding: "2px 0", borderBottom: "1px solid #f1f5f9" }}>{svc}</div>
                    ))}
                  </div>

                  {/* Persistence */}
                  <div style={{ padding: "14px 16px", borderRight: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b21a8", marginBottom: "8px" }}>Persistence Layer</div>
                    <div style={{ fontSize: "11px", color: "#334155", lineHeight: "1.5" }}>{row.persistence}</div>
                  </div>

                  {/* Consumers */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#92400e", marginBottom: "8px" }}>Consumers</div>
                    {row.consumers.map(c => (
                      <div key={c} style={{
                        fontSize: "11px", color: "#92400e", padding: "2px 6px", marginBottom: "4px",
                        backgroundColor: "#fffbeb", borderRadius: "4px", border: "1px solid #fde68a",
                      }}>{c}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "api-calls" && (
        <div>
          <div style={{ marginBottom: "16px", fontSize: "13px", color: "#475569" }}>
            Shows which systems call which APIs, the direction of data flow, and the purpose of each integration.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {API_CALLS.map((call, idx) => (
              <div key={idx} style={{
                backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
                padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px",
              }}>
                {/* Caller */}
                <div style={{
                  padding: "4px 10px", borderRadius: "6px",
                  backgroundColor: call.callerColor, color: "white",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0, minWidth: "60px", textAlign: "center",
                }}>
                  {call.caller}
                </div>

                {/* Arrow + API */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <span style={{ fontSize: "16px", color: "#94a3b8" }}>{call.direction}</span>
                  <div style={{
                    padding: "4px 10px", borderRadius: "6px",
                    backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                    fontSize: "11px", fontFamily: "monospace", color: "#1e40af", fontWeight: 600,
                  }}>
                    {call.api}
                  </div>
                  <span style={{ fontSize: "16px", color: "#94a3b8" }}>→</span>
                </div>

                {/* Target */}
                <div style={{
                  padding: "4px 10px", borderRadius: "6px",
                  backgroundColor: call.targetColor, color: "white",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0, minWidth: "60px", textAlign: "center",
                }}>
                  {call.target}
                </div>

                {/* Purpose */}
                <div style={{ fontSize: "12px", color: "#475569", flex: 2, paddingLeft: "8px", borderLeft: "1px solid #f1f5f9" }}>
                  {call.purpose}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DiscoveryAskBuddy pagePath="/discovery/integration-architecture" pageTitle="Integration Architecture" />
    </div>
  );
}

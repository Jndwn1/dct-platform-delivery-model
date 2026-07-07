import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


const ROGER_CAPABILITIES = [
  { id: "display",    icon: "🖥", title: "Account Display",         desc: "Roger displays tax accounts, amounts, and classifications from TDC in a practitioner-friendly workspace. Data is read via TDC Read APIs.", color: "#7c3aed" },
  { id: "edit",       icon: "✏", title: "Account Editing",          desc: "Practitioners can edit account classifications, amounts, and mappings in Roger. All edits are sent to TDC via the Roger Update API.", color: "#7c3aed" },
  { id: "adjust",     icon: "+", title: "Adjustment Creation",      desc: "Practitioners can create manual tax adjustments with supporting memos. Adjustments are sent to TDC and persisted as part of the tax record.", color: "#7c3aed" },
  { id: "approve",    icon: "✓", title: "Approval Workflow",        desc: "Roger provides an approval workflow for practitioners to approve reviewed items. Approvals are sent to TDC via the Approval API.", color: "#7c3aed" },
  { id: "exception",  icon: "⚠", title: "Exception Resolution",    desc: "Roger surfaces exceptions flagged by TDC and provides a UI for practitioners to resolve them. Resolutions are sent back to TDC.", color: "#dc2626" },
  { id: "memo",       icon: "📝", title: "Memo & Documentation",    desc: "Practitioners can add memos and documentation to any adjustment, approval, or exception resolution for audit purposes.", color: "#7c3aed" },
];

const APIS = [
  { name: "Roger Read API",      direction: "TDC → Roger", purpose: "Delivers tax-ready data to Roger for display", methods: ["GET /accounts", "GET /mappings", "GET /adjustments", "GET /exceptions"], color: "#065f46" },
  { name: "Roger Update API",    direction: "Roger → TDC", purpose: "Sends practitioner edits and adjustments to TDC", methods: ["PUT /accounts/{id}", "POST /adjustments", "PUT /adjustments/{id}"], color: "#7c3aed" },
  { name: "Roger Approval API",  direction: "Roger → TDC", purpose: "Sends practitioner approval decisions to TDC", methods: ["POST /approvals", "PUT /approvals/{id}"], color: "#7c3aed" },
];

const BA_GUIDANCE = [
  { rule: "Start with TDC", detail: "Every Roger story begins with a TDC object. Identify the TDC object first, then design the Roger experience around it.", icon: "1" },
  { rule: "Roger does NOT persist", detail: "Roger never stores data. All persistence is in TDC. Roger stories must reference the TDC Update API that handles persistence.", icon: "2" },
  { rule: "Validate via TDC", detail: "All validation rules are enforced by TDC. Roger displays TDC validation messages — it does not define its own business rules.", icon: "3" },
  { rule: "Editable fields come from TDC", detail: "Which fields a practitioner can edit is determined by TDC, not Roger. Confirm editability with TDC before designing the Roger UI.", icon: "4" },
  { rule: "Roger owns UX only", detail: "Roger owns screen layout, button placement, workflow, and error message display. It does NOT own business logic.", icon: "5" },
  { rule: "Downstream impacts are TDC's", detail: "When a practitioner makes a change in Roger, TDC handles all downstream impacts — GoSystem, lineage, state, provision. Roger does not need to know about downstream systems.", icon: "6" },
];

export default function RogerOverview() {
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [activeApi, setActiveApi] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "16px",
          }}>R</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Roger Overview</h1>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Tax Professional Workspace — UI Layer Only</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          Roger is the practitioner-facing workspace where tax professionals review, edit, approve, and resolve exceptions on tax data. Roger is a UI — it does not own business rules, data, or persistence.
        </p>
      </div>

      {/* Critical rule */}
      <div style={{
        backgroundColor: "#7c3aed", borderRadius: "10px", padding: "16px 20px",
        marginBottom: "28px", color: "white",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd6fe", marginBottom: "8px" }}>
          Critical Rule for BAs
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { label: "Roger OWNS", items: ["User experience", "Screen layout & workflow", "Validation message display", "Practitioner actions & buttons"], color: "#a78bfa" },
            { label: "Roger DOES NOT OWN", items: ["Business rules", "Validation logic", "Data persistence", "Tax calculations", "Downstream impacts"], color: "#f87171" },
            { label: "Roger CALLS", items: ["TDC Read API (to load data)", "TDC Update API (to save changes)", "TDC Approval API (to submit approvals)"], color: "#6ee7b7" },
          ].map(col => (
            <div key={col.label} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{col.label}</div>
              {col.items.map(item => (
                <div key={item} style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Capabilities */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Roger Capabilities</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ROGER_CAPABILITIES.map(cap => {
              const isActive = activeCapability === cap.id;
              return (
                <div
                  key={cap.id}
                  onClick={() => setActiveCapability(isActive ? null : cap.id)}
                  style={{
                    backgroundColor: isActive ? "#faf5ff" : "white",
                    border: `1px solid ${isActive ? "#7c3aed" : "#e2e8f0"}`,
                    borderRadius: "8px", padding: "12px 14px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>{cap.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{cap.title}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isActive ? "▲" : "▼"}</span>
                  </div>
                  {isActive && (
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                      {cap.desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* APIs */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>API Contracts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {APIS.map(api => {
              const isActive = activeApi === api.name;
              return (
                <div
                  key={api.name}
                  onClick={() => setActiveApi(isActive ? null : api.name)}
                  style={{
                    backgroundColor: "white", border: `1px solid ${isActive ? api.color : "#e2e8f0"}`,
                    borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                    borderLeft: `3px solid ${api.color}`,
                  }}
                >
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{api.name}</div>
                        <div style={{ fontSize: "10px", color: api.color, fontWeight: 600, marginTop: "2px" }}>{api.direction}</div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isActive ? "▲" : "▼"}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "6px" }}>{api.purpose}</div>
                  </div>
                  {isActive && (
                    <div style={{ padding: "0 14px 12px", borderTop: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", marginTop: "8px" }}>
                        Endpoints
                      </div>
                      {api.methods.map(m => (
                        <div key={m} style={{
                          fontSize: "11px", fontFamily: "monospace", color: "#1e40af",
                          padding: "3px 8px", marginBottom: "4px",
                          backgroundColor: "#eff6ff", borderRadius: "4px",
                          display: "inline-block", marginRight: "6px",
                        }}>
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BA Guidance */}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>BA Guidance — Writing Roger Stories</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {BA_GUIDANCE.map(g => (
            <div key={g.rule} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  backgroundColor: "#7c3aed", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0,
                }}>
                  {g.icon}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>{g.rule}</div>
              </div>
              <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{g.detail}</div>
            </div>
          ))}
        </div>
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/roger-overview" pageTitle="Roger Overview" />
    </div>
  );
}

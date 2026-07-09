import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";

export default function GoSystemTax() {
  const RESPONSIBILITIES = [
    { title: "IRS Line Translation",  icon: "↔", desc: "Translates each IRS form line code (formLineCode) from the TDC flat payload into the GoSystem-specific field. IMS owns the IRS-to-engine mapping.", color: "#7c3aed" },
    { title: "Roll-Up & Grouping",    icon: "∑", desc: "Sums per-record tax lines into the single per-form-line figure the engine's input grid expects. Groups lines into engine worksheet structures. TDC emits one line per record; IMS aggregates.", color: "#0369a1" },
    { title: "Data-Copy",             icon: "📋", desc: "Where the target engine requires the same value in multiple fields, IMS performs the copy. TDC sends each governed value once.", color: "#065f46" },
    { title: "Engine Routing",        icon: "🔀", desc: "Routes data to the correct engine and return instance. Writes data into GoSystem. Determines which return instance receives the payload.", color: "#92400e" },
    { title: "Per-Line Feedback",     icon: "📨", desc: "Returns per-line processing results using returnLineId for correlation. IMS echoes the returnLineId from the TDC payload to identify which lines succeeded or failed.", color: "#1e3a5f" },
  ];

  const RULES = [
    { rule: "DCT does not integrate directly with any return engine",   detail: "GoSystem, CCH, OIT, and all future return engines are reached exclusively through IMS. There is no direct TDC → GoSystem connection.", icon: "✕" },
    { rule: "IMS is a governed consumer of TDC via B9A Gateway",        detail: "IMS retrieves data through the same governed B9A Gateway APIs as Roger and other consumers. It does not have direct database access to TDC.", icon: "✓" },
    { rule: "IMS owns all engine routing and translation logic",         detail: "The decision of which engine receives which payload — and in what format — belongs entirely to IMS. TDC and Roger have no knowledge of engine-specific requirements.", icon: "✓" },
    { rule: "IMS does not own or modify tax data",                       detail: "IMS is an integration broker only. It does not compute tax, apply business rules, or modify the governed payload it receives from TDC.", icon: "✕" },
    { rule: "GoSystem is one of several possible return engines",        detail: "GoSystem is a downstream return engine that IMS may route to. CCH, OIT, and future engines are also valid targets. IMS abstracts this from DCT.", icon: "→" },
  ];

  const APIS = [
    { method: "GET",  path: "/api/v1/ims/payload/{entityId}",            desc: "Retrieve governed tax-ready payload for an entity from TDC via B9A" },
    { method: "POST", path: "/api/v1/ims/deliver/{entityId}/{engine}",   desc: "Deliver translated payload to the specified return engine" },
    { method: "GET",  path: "/api/v1/ims/engine-lookup/{entityId}",      desc: "Determine which return engine is assigned to an entity" },
    { method: "GET",  path: "/api/v1/ims/delivery-status/{entityId}",    desc: "Check delivery status and acknowledgement for a payload" },
    { method: "POST", path: "/api/v1/ims/inbound/{engine}/{entityId}",   desc: "Receive inbound return data from a return engine back to IMS" },
  ];

  const methodColor = (m: string) => m === "GET" ? "#0369a1" : m === "POST" ? "#059669" : "#7c3aed";

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "14px",
          }}>IMS</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>IMS — Integration & Management System</h1>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Integration Broker — Routes governed DCT data to downstream return engines</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          IMS is the integration layer between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT, and future engines).
          DCT does not integrate directly with any return engine — IMS owns all engine routing, payload translation, and delivery.
          IMS retrieves governed data from TDC via the B9A Gateway and delivers it to the appropriate engine.
        </p>
      </div>

      {/* Role in DCT */}
      <div style={{
        backgroundColor: "#7c3aed", borderRadius: "10px", padding: "16px 20px",
        marginBottom: "28px", color: "white",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e9d5ff", marginBottom: "8px" }}>
          IMS's Role in the DCT Architecture
        </div>
        <div style={{ fontSize: "14px", lineHeight: "1.7" }}>
          IMS is the <strong>integration broker</strong> between DCT and all return engines. It retrieves governed, tax-ready data from TDC via the B9A Gateway, translates it into the format required by the target engine, and delivers it. IMS abstracts all engine-specific knowledge from DCT — TDC and Roger have no awareness of GoSystem, CCH, OIT, or any other return engine.
        </div>
      </div>

      {/* Architecture boundary callout */}
      <div style={{
        backgroundColor: "#fef2f2", border: "1px solid #fecaca",
        borderRadius: "10px", padding: "14px 18px", marginBottom: "28px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>Architecture Boundary — Important for BAs</div>
          <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.6" }}>
            When documenting requirements, do not write stories that assume a direct TDC → GoSystem connection.
            All return engine integration is owned by IMS. If a business need involves delivering data to GoSystem, CCH, or OIT,
            the requirement belongs to the IMS integration layer — not to DCT, TDC, or B28.
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>IMS Responsibilities</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {RESPONSIBILITIES.map(r => (
            <div key={r.title} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "14px",
              textAlign: "center", borderTop: `3px solid ${r.color}`,
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{r.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "6px" }}>{r.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance rules */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Governance Rules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {RULES.map(r => (
            <div key={r.rule} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "12px 16px",
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                backgroundColor: r.icon === "✕" ? "#fef2f2" : r.icon === "✓" ? "#f0fdf4" : "#eff6ff",
                border: `1px solid ${r.icon === "✕" ? "#fecaca" : r.icon === "✓" ? "#bbf7d0" : "#bfdbfe"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
                color: r.icon === "✕" ? "#dc2626" : r.icon === "✓" ? "#059669" : "#1e40af",
                flexShrink: 0,
              }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>{r.rule}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APIs */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>IMS APIs</div>
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          {APIS.map((api, i) => (
            <div key={api.path} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 16px",
              borderBottom: i < APIS.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: i % 2 === 0 ? "#f8fafc" : "white",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px",
                backgroundColor: `${methodColor(api.method)}15`, color: methodColor(api.method),
                minWidth: "40px", textAlign: "center", flexShrink: 0,
              }}>{api.method}</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#0f172a", flex: 1 }}>{api.path}</span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{api.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration summary */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "16px 20px", marginBottom: "28px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>Integration Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Data Source",        value: "TDC via B9A Gateway (governed consumer, scoped profile)" },
            { label: "Trigger",            value: "TDC publishes downstream event when data is finalized and Roger-approved" },
            { label: "Data Direction",     value: "TDC → B9A Gateway → IMS → Return Engine (one-way delivery)" },
            { label: "Return Engines",     value: "GoSystem, CCH, OIT, and future engines (IMS abstracts all engine specifics)" },
            { label: "Write-back to TDC",  value: "None — IMS never writes back to TDC" },
            { label: "Inbound from Engine", value: "IMS receives acknowledgements and inbound return data from engines" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", minWidth: "140px" }}>{item.label}:</div>
              <div style={{ fontSize: "12px", color: "#334155" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The Dividing Test */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>The Dividing Test — TDC vs. IMS</div>
        <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "16px 20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", color: "#0c4a6e", lineHeight: "1.7" }}>
            <strong>Does the operation depend on the target engine's input format?</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>If YES → IMS</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>The operation is engine-shaped. If the target engine changed, the work would have to be redone. IMS owns it.</div>
            </div>
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>If NO → TDC</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>The operation is the same for every engine because it is defined by the IRS form or tax law. TDC owns it.</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "8px" }}>Roll-Up Ownership — Explicit Assignment</div>
          <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
            TDC emits <strong>one line per tax-ready record</strong>, not a rolled-up total per form line. The same <code style={{fontSize:"11px",backgroundColor:"#f1f5f9",padding:"1px 4px",borderRadius:"3px"}}>formLineCode</code> can appear on several lines. This is deliberate: one line per record preserves line-level lineage back to the source. Rolling those up into a single per-form-line total is lossy and engine-shaped, so it sits downstream.
          </div>
          <div style={{ marginTop: "10px", padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>
              <strong>DCT's position:</strong> The roll-up from line-per-record to per-form-line totals is IMS's responsibility, as part of translating to the engine. It must be <strong>assigned explicitly</strong> so it does not fall through the gap between TDC and IMS.
            </div>
          </div>
        </div>
      </div>

      {/* IMS Does NOT Own */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>IMS Does NOT Own</div>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "14px 18px" }}>
          <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.7" }}>
            IMS <strong>does not perform tax-semantic calculations</strong>. Tax calculations and governed values remain the responsibility of TDC. IMS translates, shapes, and routes — it does not compute tax.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" }}>
            {["Tax-semantic calculations","Governed tax values","IRS-form structure","Lineage preservation","Stable outbound contract","Stable identifiers (filingId, assemblyId, deliveryId, returnLineId)"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "#dc2626", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✕</span>
                <div style={{ fontSize: "12px", color: "#7f1d1d" }}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "#92400e", marginTop: "10px", fontStyle: "italic" }}>These are owned by TDC / DCT.</div>
        </div>
      </div>

      {/* Open Decisions */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "6px" }}>Open Decisions</div>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>Items requiring future agreement or implementation — not yet in the build.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "OD-1", title: "Destination Return Locator (locatorId)", detail: "Not carried in the payload today. DCT's position: it is user intent, selected in Roger and carried explicitly, not inferred by IMS. Needs to be added to the contract.", status: "Open" },
            { id: "OD-2", title: "Confirm IMS Owns Roll-Up", detail: "Confirm IMS owns the roll-up from line-per-record to per-form-line totals. Must be assigned explicitly so it does not fall through the gap.", status: "Open" },
            { id: "OD-3", title: "Per-Line Error Response Contract", detail: "Structure for IMS to return per-line processing results (which returnLineId failed and why) back to TDC. Not yet defined.", status: "Open" },
            { id: "OD-4", title: "Activity / Sub-Entity Differentiation", detail: "Not represented in the outbound payload. Current data layer does not capture activity-level grouping within a legal entity. Out of MVP scope.", status: "Out of Scope (MVP)" },
          ].map(od => (
            <div key={od.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, backgroundColor: od.status === "Open" ? "#fef3c7" : "#f1f5f9", color: od.status === "Open" ? "#92400e" : "#64748b", padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap", alignSelf: "flex-start", marginTop: "1px" }}>{od.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>{od.title}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{od.detail}</div>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, backgroundColor: od.status === "Open" ? "#fef2f2" : "#f8fafc", color: od.status === "Open" ? "#dc2626" : "#64748b", padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", alignSelf: "flex-start" }}>{od.status}</div>
            </div>
          ))}
        </div>
      </div>

      <RelatedObjectsPanel rootNodeId="sys-ims" title="IMS — Connected Knowledge Graph" />
      <DiscoveryAskBuddy pagePath="/discovery/ims" pageTitle="IMS — Integration & Management System" />
    </div>
  );
}

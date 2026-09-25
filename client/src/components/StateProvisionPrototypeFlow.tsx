const ROGER_END_TO_END_FLOW_IMAGE = "/manus-storage/roger-post-pilot-end-to-end-executive-flow_f73fea32.png";

export default function StateProvisionPrototypeFlow() {
  return (
    <section aria-labelledby="roger-end-to-end-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Executive architecture view</div>
        <h2 id="roger-end-to-end-flow" style={{ color: "#0f172a", fontSize: "18px", margin: "3px 0 0" }}>Roger End-to-End Operating Flow</h2>
        <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, margin: "5px 0 0", maxWidth: "1100px" }}>
          This single executive process flow connects the Roger State and Provision prototypes to the PI4 workstreams, governed delivery path, tax-engine touchpoints, and practitioner outcome.
        </p>
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "12px", lineHeight: 1.55, marginBottom: "12px", padding: "12px 14px" }}>
        <strong>How to read it:</strong> The two Roger prototypes are practitioner entry points. State and Provision workstreams progress with the TDC / DCT and shared data workstreams, then pass through B9A Gateway and IMS to the appropriate tax-engine touchpoint. Agreed results return as governed practitioner outcomes for review and reconciliation.
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
          <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 900 }}>Executive process flow — PI4 planning and operating alignment</div>
          <a href={ROGER_END_TO_END_FLOW_IMAGE} target="_blank" rel="noopener noreferrer" style={{ background: "#0f172a", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 10px", textDecoration: "none" }}>Open full-size diagram ↗</a>
        </div>
        <div style={{ background: "#f8fafc", overflowX: "auto", padding: "14px" }}>
          <img
            src={ROGER_END_TO_END_FLOW_IMAGE}
            alt="Executive Visio-style Roger end-to-end operating flow showing the State and Provision prototypes, State, Provision, TDC and shared data workstreams, B9A Gateway, IMS, GoSystem, iTax, and governed practitioner outcome"
            style={{ display: "block", height: "auto", maxWidth: "none", minWidth: "1560px", width: "1900px" }}
          />
        </div>
        <div style={{ background: "#f0fdfa", borderTop: "1px solid #99f6e4", color: "#134e4a", fontSize: "11px", lineHeight: 1.5, padding: "11px 14px" }}>
          <strong>Authority boundary:</strong> Roger remains the practitioner experience; TDC owns tax judgment and governed records; IMS owns integration routing and translation; GoSystem and iTax remain downstream tax-engine touchpoints. The diagram is a PI4 planning view and does not establish endpoint, field-level contract, or implementation commitments.
        </div>
      </div>
    </section>
  );
}

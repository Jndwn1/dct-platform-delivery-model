const EXECUTIVE_PROCESS_FLOW_IMAGE = "/manus-storage/executive-client-file-to-roger-process-flow_0f8ee1d9.png";

export default function StateProvisionPrototypeFlow() {
  return (
    <section aria-labelledby="client-to-roger-process-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Executive process flow</div>
        <h2 id="client-to-roger-process-flow" style={{ color: "#0f172a", fontSize: "18px", margin: "3px 0 0" }}>Client File to Roger — Federal, State &amp; Provision Process Flow</h2>
        <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, margin: "5px 0 0", maxWidth: "980px" }}>
          One client-file journey: intake, governed preparation, Roger review, a single TDC decision, and controlled downstream delivery. Federal, State, and Provision are parallel practitioner workflows—not separate data pipelines.
        </p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
          <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 900 }}>Five-phase executive process</div>
          <a href={EXECUTIVE_PROCESS_FLOW_IMAGE} target="_blank" rel="noopener noreferrer" style={{ background: "#0f172a", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 10px", textDecoration: "none" }}>Open full-size diagram ↗</a>
        </div>
        <div style={{ background: "#f8fafc", overflowX: "auto", padding: "14px" }}>
          <img
            src={EXECUTIVE_PROCESS_FLOW_IMAGE}
            alt="Five-phase executive process flow: client submits a financial file, Tax Portal validates it, PDC and the AI Orchestrator prepare governed data, TDC governs the tax record, Roger branches Federal, State, and Provision review, TDC records one decision, and controlled downstream delivery follows"
            style={{ display: "block", height: "auto", maxWidth: "none", minWidth: "2200px", width: "2600px" }}
          />
        </div>
        <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", color: "#475569", fontSize: "10px", lineHeight: 1.45, padding: "9px 14px" }}>
          This executive process view illustrates the intended business and platform flow. Detailed technical contracts, APIs, field mappings, and integration rules remain governed by their respective technical artifacts.
        </div>
      </div>
    </section>
  );
}

const CLIENT_TO_ROGER_PROCESS_FLOW_IMAGE = "/manus-storage/client-file-to-roger-federal-state-provision-process-flow_94710632.png";

export default function StateProvisionPrototypeFlow() {
  return (
    <section aria-labelledby="client-to-roger-process-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Executive process flow</div>
        <h2 id="client-to-roger-process-flow" style={{ color: "#0f172a", fontSize: "18px", margin: "3px 0 0" }}>Client File to Roger — Federal, State &amp; Provision Process Flow</h2>
        <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, margin: "5px 0 0", maxWidth: "1100px" }}>
          The journey begins when a client submits a financial file. The platform prepares the governed client record once, then gives the Federal, State, and—as applicable—Provision users the right Roger workspace to review, decide, and track the same client and period.
        </p>
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "12px", lineHeight: 1.55, marginBottom: "12px", padding: "12px 14px" }}>
        <strong>Executive view:</strong> Client files enter the Tax Portal, PDC establishes the financial record, the AI Orchestrator prepares data through governed services, and TDC establishes the tax record and lineage. Roger then branches into the Federal and State practitioner journeys, with Provision included when applicable. Decisions return to TDC; Roger displays finalized status; eligible downstream delivery follows the controlled route.
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
          <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 900 }}>12-step executive process flow — client file through Roger review and delivery</div>
          <a href={CLIENT_TO_ROGER_PROCESS_FLOW_IMAGE} target="_blank" rel="noopener noreferrer" style={{ background: "#0f172a", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 10px", textDecoration: "none" }}>Open full-size diagram ↗</a>
        </div>
        <div style={{ background: "#f8fafc", overflowX: "auto", padding: "14px" }}>
          <img
            src={CLIENT_TO_ROGER_PROCESS_FLOW_IMAGE}
            alt="Executive client file to Roger process flow showing client file drop, Tax Portal, PDC, AI Orchestrator, TDC, Roger My Clients, Federal user review, State user workflow, Provision return-to-provision review, finalized status, and controlled downstream delivery"
            style={{ display: "block", height: "auto", maxWidth: "none", minWidth: "1740px", width: "2140px" }}
          />
        </div>
        <div style={{ background: "#f0fdfa", borderTop: "1px solid #99f6e4", color: "#134e4a", fontSize: "11px", lineHeight: 1.5, padding: "11px 14px" }}>
          <strong>Ownership boundary:</strong> PDC owns financial truth; the AI Orchestrator prepares data without direct persistence; TDC owns tax judgment, decisions, and lineage; Roger provides the practitioner experience; and IMS owns controlled downstream routing and translation. The State and Provision steps show the intended experience and remain subject to approved technical contracts.
        </div>
      </div>
    </section>
  );
}

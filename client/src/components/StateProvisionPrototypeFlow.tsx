const PROCESS_FLOW_IMAGE = "/manus-storage/roger-state-provision-end-to-end-process-flow_20c79e7c.png";

const C = {
  navy: "#0f172a",
  slate: "#475569",
  teal: "#0f766e",
  purple: "#7c3aed",
  blue: "#2563eb",
};

const SYSTEM_ROLES = [
  { system: "Roger", role: "Practitioner experience", detail: "Displays scoped State and Provision information and submits permitted practitioner actions. It does not calculate tax or persist governed tax records.", accent: C.teal, surface: "#f0fdfa" },
  { system: "TDC", role: "Tax judgment and governed record", detail: "Owns governed tax decisions, approval context, lineage, and tax records used by the downstream delivery path.", accent: C.blue, surface: "#eff6ff" },
  { system: "B9A Gateway", role: "Authorized consumer boundary", detail: "Controls governed downstream retrieval and contract access. Consumers do not bypass this access boundary.", accent: C.blue, surface: "#eff6ff" },
  { system: "IMS", role: "Integration broker", detail: "Retrieves the governed package, performs engine-specific translation and routing, and tracks delivery. It does not make tax decisions or calculate tax values.", accent: C.purple, surface: "#faf5ff" },
  { system: "GoSystem", role: "State calculation touchpoint", detail: "Consumes the IMS-delivered State package for the representative State calculation / compliance path and returns agreed outcomes through the governed flow.", accent: "#047857", surface: "#ecfdf5" },
  { system: "iTax", role: "Provision tax-engine touchpoint", detail: "Represents the planned Provision tax-engine touchpoint. Its exact scope, inbound / outbound contract, and ownership details remain to be defined.", accent: "#c2410c", surface: "#fff7ed" },
] as const;

function Insight({ title, detail, accent, surface }: { title: string; detail: string; accent: string; surface: string }) {
  return (
    <div style={{ background: surface, border: `1px solid ${accent}33`, borderRadius: "8px", padding: "11px 12px" }}>
      <div style={{ color: accent, fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</div>
      <p style={{ color: "#334155", fontSize: "11px", lineHeight: 1.5, margin: "5px 0 0" }}>{detail}</p>
    </div>
  );
}

function SystemRole({ system, role, detail, accent, surface }: typeof SYSTEM_ROLES[number]) {
  return (
    <div style={{ background: surface, border: `1px solid ${accent}33`, borderRadius: "8px", padding: "11px 12px" }}>
      <div style={{ color: accent, fontSize: "12px", fontWeight: 900 }}>{system}</div>
      <div style={{ color: C.navy, fontSize: "10px", fontWeight: 850, marginTop: "3px", textTransform: "uppercase" }}>{role}</div>
      <p style={{ color: "#334155", fontSize: "10.5px", lineHeight: 1.48, margin: "6px 0 0" }}>{detail}</p>
    </div>
  );
}

export default function StateProvisionPrototypeFlow() {
  return (
    <section aria-labelledby="roger-state-provision-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: `4px solid ${C.teal}`, marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: C.teal, fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Post Pilot experience flow</div>
        <h2 id="roger-state-provision-flow" style={{ color: C.navy, fontSize: "18px", margin: "3px 0 0" }}>Roger State &amp; Provision End-to-End Process Flow</h2>
        <p style={{ color: C.slate, fontSize: "12px", lineHeight: 1.55, margin: "5px 0 0", maxWidth: "1080px" }}>The State and Provision prototypes show the practitioner experience in Roger. This flow connects those experiences to the governed DCT path and the downstream system touchpoints: IMS routes and translates the governed package; GoSystem supports the representative State calculation path; and iTax is the planned Provision tax-engine touchpoint.</p>
      </div>

      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", color: "#7c2d12", fontSize: "11px", lineHeight: 1.5, marginBottom: "12px", padding: "10px 12px" }}>
        <strong>Governance boundary:</strong> Roger remains the practitioner experience and TDC remains the governed tax record. IMS—not Roger or DCT—owns return-engine routing and payload translation. This planning flow does not establish an approved endpoint, data contract, or implementation commitment.
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
          <div style={{ color: C.navy, fontSize: "12px", fontWeight: 850 }}>Practitioner → governed package → IMS → tax-engine touchpoint → returned outcomes</div>
          <a href={PROCESS_FLOW_IMAGE} target="_blank" rel="noopener noreferrer" style={{ background: C.navy, borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 9px", textDecoration: "none" }}>Open readable flow</a>
        </div>
        <div style={{ overflowX: "auto", padding: "14px" }}>
          <img
            src={PROCESS_FLOW_IMAGE}
            alt="Roger State and Provision end-to-end process flow showing State and Provision prototypes, practitioner review, TDC governance, B9A Gateway, IMS, GoSystem, iTax, and returned outcomes for Roger"
            style={{ border: "1px solid #cbd5e1", borderRadius: "8px", display: "block", maxWidth: "100%", minWidth: "980px", width: "100%" }}
          />
        </div>
        <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))", padding: "12px 14px" }}>
          <Insight title="Roger practitioner experience" accent={C.teal} surface="#f0fdfa" detail="State and Provision workflow references converge in Roger, where practitioners review scoped outcomes and submit only permitted actions." />
          <Insight title="Governed delivery path" accent={C.blue} surface="#eff6ff" detail="TDC governs tax decisions, approvals, lineage, and records. B9A Gateway remains the authorized consumer boundary for downstream access." />
          <Insight title="IMS and engine touchpoints" accent={C.purple} surface="#faf5ff" detail="IMS retrieves the governed package, translates and routes it. GoSystem is the representative State POC path; exact iTax Provision scope and contracts remain to be defined." />
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <div style={{ color: C.navy, fontSize: "13px", fontWeight: 850, marginBottom: "8px" }}>System Roles &amp; Ownership</div>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))" }}>
          {SYSTEM_ROLES.map((systemRole) => <SystemRole key={systemRole.system} {...systemRole} />)}
        </div>
      </div>
    </section>
  );
}

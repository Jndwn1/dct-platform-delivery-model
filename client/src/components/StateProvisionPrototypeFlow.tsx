import ExecutiveProcessFlow, { type ExecutiveFlowStep } from "@/components/ExecutiveProcessFlow";

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

const FLOW_STEPS: readonly ExecutiveFlowStep[] = [
  { label: "1 · Practitioner experience", title: "Roger State & Provision", detail: "Practitioners review scoped State or Provision information and submit only permitted actions.", accent: C.teal, surface: "#f0fdfa" },
  { label: "2 · Governing record", title: "TDC", detail: "Governs tax decisions, approvals, lineage, and the tax record needed for downstream delivery.", accent: C.blue, surface: "#eff6ff" },
  { label: "3 · Authorized access", title: "B9A Gateway", detail: "Provides the controlled downstream retrieval boundary; consumers do not bypass it.", accent: C.blue, surface: "#eff6ff" },
  { label: "4 · Integration broker", title: "IMS", detail: "Retrieves the governed package, translates engine-specific payloads, and routes delivery.", accent: C.purple, surface: "#faf5ff" },
  { label: "5 · Engine touchpoints", title: "GoSystem / iTax", detail: "GoSystem supports the representative State POC; iTax is the planned Provision touchpoint with contract scope TBD.", accent: "#c2410c", surface: "#fff7ed" },
  { label: "6 · Practitioner outcome", title: "Returned outcome", detail: "Status and agreed results return through the governed path for practitioner review and reconciliation.", accent: C.teal, surface: "#f0fdfa" },
];

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

      <ExecutiveProcessFlow
        ariaLabel="Roger State and Provision executive end-to-end process flow"
        steps={FLOW_STEPS}
        outcome="A single Roger practitioner experience is supported by governed tax decisions, controlled delivery, traceable engine routing, and visible returned outcomes."
      />

      <div style={{ marginTop: "14px" }}>
        <div style={{ color: C.navy, fontSize: "13px", fontWeight: 850, marginBottom: "8px" }}>System Roles &amp; Ownership</div>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))" }}>
          {SYSTEM_ROLES.map((systemRole) => <SystemRole key={systemRole.system} {...systemRole} />)}
        </div>
      </div>
    </section>
  );
}

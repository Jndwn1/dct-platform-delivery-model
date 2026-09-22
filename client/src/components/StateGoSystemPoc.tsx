import { useState } from "react";

const C = {
  navy: "#0f1623",
  blue: "#1e3a5f",
  teal: "#0369a1",
  green: "#047857",
  purple: "#7c3aed",
  rose: "#be185d",
  slate: "#475569",
};

const ARCHITECTURE_IMAGE = "/manus-storage/gosystem-state-calculation-poc_ddd0591b.png";

const RESPONSIBILITIES = [
  {
    title: "Practitioner / Process & State Team",
    accent: C.green,
    responsibility: "Business rules, calculation requirements, and review requirements.",
    items: [
      "Establish State filing context, review the filing footprint and return structure, and provide or review calculation inputs.",
      "Review State modifications and returned results, then reconcile and approve the outcome before it moves forward.",
      "Define the minimum calculation and review detail required for the POC.",
    ],
  },
  {
    title: "Roger State Experience",
    accent: "#0891b2",
    responsibility: "The practitioner-facing experience.",
    items: [
      "Supports filing footprint, filing-group, return-structure, entity/member/locator, and PBC input context.",
      "Presents State calculation configuration, modifications, returned workpaper-style results, reconciliation, and approval workflow.",
      "Does not own or persist State tax calculation records.",
    ],
  },
  {
    title: "DCT / Data Layer",
    accent: C.blue,
    responsibility: "Governed persistence, retrieval, and integration support.",
    items: [
      "Persists State context and applicable calculation configuration; prepares structured downstream packages.",
      "Maintains identifiers, relationships, source-to-target translation support, lineage, and returned-result availability for Roger.",
      "Does not own State tax calculation logic performed by GoSystem.",
    ],
  },
  {
    title: "Taxonomy",
    accent: C.purple,
    responsibility: "Business-to-system mapping structure.",
    items: [
      "Defines inbound and outbound source-to-target mapping, mapping identifiers, standardized definitions, and State-specific representation.",
      "Supports repeatable mapping patterns and governed field treatment rather than one-off mappings.",
    ],
  },
  {
    title: "IMS / Integration Layer",
    accent: C.rose,
    responsibility: "GoSystem integration and translation boundary.",
    items: [
      "Translates governed Roger/DCT structures into the applicable GoSystem integration package.",
      "Translates and correlates GoSystem outputs for governed return movement.",
    ],
  },
  {
    title: "GoSystem",
    accent: "#b91c1c",
    responsibility: "State tax calculation engine.",
    items: [
      "Receives the State calculation package and applies State-specific calculation logic.",
      "Calculates State taxable income, apportionment-related results, liability, and applicable modifications or attributes.",
      "Returns calculation results for downstream review; it is not the Roger user experience.",
    ],
  },
] as const;

const PACKAGE_COLUMNS = [
  {
    title: "Filing Footprint + Calculation Configuration",
    accent: C.teal,
    groups: [
      { label: "Context", items: ["Client / tax year", "Filer", "Filing group", "Jurisdiction", "Filing designation", "Tax type", "Entity / member / locator context"] },
      { label: "Configuration", items: ["Federal starting point", "Apportionment method", "Apportionment weights", "State-specific options", "Overrides", "Configuration source", "Approval status"] },
    ],
    ask: "Confirm required calculation settings, valid options, filing level, and missing context required by GoSystem.",
  },
  {
    title: "PBC Inputs",
    accent: C.blue,
    groups: [
      { label: "Apportionment", items: ["Property", "Payroll", "Sales", "State / entity assignment", "Within / everywhere treatment", "Approved mapping", "Supporting detail"] },
      { label: "Payments", items: ["Estimated payments", "Extension payments", "Prior-year overpayment", "Credits applied", "Period", "Date", "Amount", "Reference"] },
    ],
    ask: "Confirm TWB2.0 target coverage; identify missing fields, State-specific treatment, and required reconciliation totals.",
  },
  {
    title: "Calculated or Rolled Values",
    accent: C.purple,
    groups: [
      { label: "State Modifications", items: ["Additions", "Subtractions", "Supported calculated amount", "Rolled amount", "State applicability", "Entity applicability", "Source", "Authority", "Approval"] },
      { label: "State Attributes", items: ["NOL balances", "NOL activity", "Credits", "Carryforwards", "Utilization", "Expiration where required"] },
    ],
    ask: "Prioritize values for the POC / MVP, define business meaning, and provide representative GoSystem mappings.",
  },
] as const;

const INBOUND_REQUIREMENTS = [
  { label: "Filing Context", items: ["Client", "Tax year", "Filer", "Filing group", "Jurisdiction", "State activation", "Filing designation", "Tax type", "Locator", "Entity/member context"] },
  { label: "Calculation Configuration", items: ["Federal taxable income starting point", "Apportionment method", "Weighting", "State-specific calculation options", "Overrides", "Entity type", "Single / combined / consolidated designation"] },
  { label: "PBC Inputs", items: ["Property", "Payroll", "Sales", "State/entity assignment", "Within/everywhere treatment", "Payments", "Prior-year credits", "Supporting references"] },
  { label: "State Modifications / Attributes", items: ["Required State modifications", "NOL information where applicable", "Credits and carryforwards where applicable"] },
] as const;

const OUTBOUND_REQUIREMENTS = [
  { label: "Apportionment", items: ["Property, payroll, and sales factors", "Numerator and denominator", "Percentage and weighted percentage", "Relevant configuration"] },
  { label: "State Control / Taxable Income", items: ["Federal taxable income starting point", "State additions and subtractions", "State modifications", "State taxable income", "Related calculation components"] },
  { label: "State Liability + Accrual", items: ["Calculated State liability", "Reviewable component values", "Required State accrual outputs", "Supporting calculation components where required"] },
  { label: "State Attributes", items: ["NOL values", "Credits", "Carryforwards", "Utilization where needed"] },
] as const;

const BA_DELIVERABLES = [
  ["Inbound Mapping Matrix", "Define Roger/DCT → GoSystem source-to-target mapping, including business field/definition, source and target fields, type, requiredness, valid values, transformation, applicability, ownership, and open questions.", "BA / Taxonomy / DCT / IMS / Process-State", "Planned", "Which minimum fields must GoSystem receive; which can be inherited or read?"],
  ["Outbound Mapping Matrix", "Define GoSystem → DCT/Roger source-to-target mapping, including business meaning, review level, granularity, transformation, Taxonomy ID, owner, and open question.", "BA / Taxonomy / DCT / IMS / Process-State", "Planned", "Which calculation detail must return to support practitioner review?"],
  ["Review Requirements", "Define exactly what the practitioner must see in Roger to validate and trust GoSystem calculations, including values, components, summary/detail, reconciliation, and approval.", "BA / Process-State / Roger", "Planned", "What is the minimum transparent review package?"],
  ["Taxonomy Decision Log", "Track mapping structure, definitions, granularity, State variability, existing GoSystem values, calculation inputs/outputs, and ownership decisions.", "BA / Taxonomy / DCT / IMS / Process-State", "Planned", "Which decisions are common patterns versus State-specific exceptions?"],
  ["Representative POC Mapping Set", "Select representative State calculation scenarios and prove the mapping pattern before scaling.", "BA / Process-State / Taxonomy / IMS", "Planned", "Which States and scenarios best establish a scalable pattern?"],
  ["Data / Architecture Dependency Log", "Track Federal-to-State relationship, entity linkage, dataset segregation, source reuse, deliverable-specific adjustments, and correct Federal starting point.", "BA / DCT Architecture / Process-State", "Planned", "How are multiple Federal deliverables selected and persisted for State use?"],
  ["ADO Story / Acceptance Criteria Support", "Translate approved business and Taxonomy requirements into implementable stories, testable acceptance criteria, dependencies, and readiness evidence.", "BA / PO / DCT / QA", "Planned", "What evidence is required before a story is ready for sprint commitment?"],
] as const;

const OPEN_QUESTIONS = [
  "What exact fields must be sent to GoSystem, and what data already exists there?",
  "Which values should be read rather than pushed?",
  "What exact fields must come back from GoSystem, and at what review granularity?",
  "Can additions and subtractions be aggregated, or must individual State modifications return?",
  "Do practitioners need every apportionment component and how much accrual detail is necessary?",
  "Are NOL and credit details required during the initial POC?",
  "How should State modifications and State-specific variations be mapped?",
  "Which representative States / scenarios should be used for the POC?",
  "How will Federal and State deliverables be linked, and where will the relationship persist?",
  "What belongs in POC / MVP scope versus later implementation?",
  "Who owns each remaining business, Taxonomy, integration, and architecture decision?",
] as const;

const SUCCESS_CRITERIA = [
  "Roger can provide the required State calculation context.",
  "DCT can structure and persist the required data.",
  "Taxonomy can map required business fields into the GoSystem structure.",
  "IMS can successfully transmit the calculation package.",
  "GoSystem can consume the input and execute the expected calculation.",
  "GoSystem outputs can be retrieved.",
  "Returned outputs can be mapped into governed DCT/Roger structures.",
  "Roger can present sufficient detail for practitioner review and reconciliation.",
  "Lineage between source, input, calculation, and returned result can be understood.",
  "The pattern can reasonably scale beyond the initial POC scenarios.",
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return <button type="button" onClick={onCopy} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", color: C.navy, cursor: "pointer", fontSize: "10px", fontWeight: 800, padding: "6px 9px", whiteSpace: "nowrap" }}>{copied ? "Copied" : "Copy POC summary"}</button>;
}

function PanelHeading({ eyebrow, title, subtitle, accent = C.teal }: { eyebrow: string; title: string; subtitle?: string; accent?: string }) {
  return <div style={{ borderLeft: `4px solid ${accent}`, marginBottom: "14px", paddingLeft: "12px" }}>
    <div style={{ color: accent, fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "4px", textTransform: "uppercase" }}>{eyebrow}</div>
    <h3 style={{ color: C.navy, fontSize: "16px", margin: 0 }}>{title}</h3>
    {subtitle && <p style={{ color: C.slate, fontSize: "11px", lineHeight: "1.45", margin: "4px 0 0" }}>{subtitle}</p>}
  </div>;
}

function RequirementGroup({ label, items, accent }: { label: string; items: readonly string[]; accent: string }) {
  return <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTop: `3px solid ${accent}`, borderRadius: "8px", padding: "11px" }}>
    <div style={{ color: accent, fontSize: "11px", fontWeight: 800, marginBottom: "6px" }}>{label}</div>
    <ul style={{ margin: 0, paddingLeft: "16px" }}>{items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{item}</li>)}</ul>
  </div>;
}

export default function StateGoSystemPoc() {
  const copyText = [
    "Roger → GoSystem POC: State Calculation Integration",
    "Purpose: Prove governed State preparation data can move Roger → DCT → IMS → GoSystem and return as a structured, transparent review package in Roger.",
    "Inbound: Roger → DCT → Taxonomy Mapping → IMS → GoSystem | State Calculation Input Package",
    "Outbound: GoSystem → IMS → Taxonomy Mapping → DCT → Roger | State Calculation Review Package",
    "Ownership: Roger = practitioner experience; DCT = governed persistence/retrieval/integration support; Taxonomy = mapping structure; IMS = translation boundary; GoSystem = calculation engine; Process/State = business rules and review requirements.",
  ].join("\n");

  return <section id="roger-gosystem-state-poc" style={{ marginBottom: "48px" }}>
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "12px", boxShadow: "0 2px 9px rgba(15,23,42,0.06)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(120deg, #0f1623 0%, #1e3a5f 68%, #0369a1 100%)", padding: "20px 22px" }}>
        <div style={{ alignItems: "flex-start", display: "flex", gap: "14px", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#bae6fd", fontSize: "10px", fontWeight: 800, letterSpacing: "0.09em", marginBottom: "5px", textTransform: "uppercase" }}>State architecture extension · Proof of feasibility</div>
            <h2 style={{ color: "#ffffff", fontSize: "20px", margin: 0 }}>Roger → GoSystem POC: State Calculation Integration</h2>
            <p style={{ color: "#dbeafe", fontSize: "12px", lineHeight: "1.55", margin: "8px 0 0", maxWidth: "1000px" }}>The POC proves that Roger can collect and structure required State preparation data, DCT can govern movement through the data layer, IMS can communicate with GoSystem for calculation, and structured results can return to Roger for practitioner review, reconciliation, and approval.</p>
          </div>
          <CopyButton text={copyText} />
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderLeft: "5px solid #d97706", borderRadius: "9px", marginBottom: "20px", padding: "13px 15px" }}>
          <div style={{ color: "#92400e", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "5px", textTransform: "uppercase" }}>POC focus</div>
          <div style={{ color: "#78350f", fontSize: "13px", fontWeight: 700, lineHeight: "1.55" }}>Prove both inbound and outbound integration, with particular emphasis on retrieving structured GoSystem calculation outputs and making them transparent and reviewable within Roger.</div>
        </div>

        <PanelHeading eyebrow="State architecture / controlled flow" title="GoSystem as the downstream State calculation system" subtitle="The existing State file-drop architecture remains in place. This POC extends it with a governed calculation loop; GoSystem is added as a downstream calculation engine and does not replace TIM, PDC, TDC, Orchestrator, Gateway, IMS, or State services." />
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", marginBottom: "18px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", color: C.slate, fontSize: "10px", fontWeight: 700, padding: "9px 12px" }}>Full POC architecture, sized to fit the workspace and show the complete governed flow in one view.</div>
          <div style={{ overflowX: "hidden", padding: "12px" }}><img src={ARCHITECTURE_IMAGE} alt="Roger to GoSystem State calculation POC architecture showing practitioner, Roger, DCT, Taxonomy, IMS, GoSystem, result retrieval, and review flow" style={{ display: "block", height: "auto", margin: "0 auto", maxWidth: "1280px", width: "100%" }} /></div>
        </div>

        <div style={{ display: "grid", gap: "9px", gridTemplateColumns: "repeat(9, minmax(115px, 1fr))", marginBottom: "20px", minWidth: "0", overflowX: "auto" }}>
          {[
            ["Tax Practitioner", C.green], ["Roger State Experience", "#0891b2"], ["DCT / Data Layer", C.blue], ["IMS / Integration", C.rose], ["GoSystem", "#b91c1c"], ["IMS / Integration", C.rose], ["DCT / Data Layer", C.blue], ["Roger State Review", "#0891b2"], ["Review / Approval", C.green],
          ].map(([label, color], index) => <div key={`${label}-${index}`} style={{ alignItems: "center", display: "flex", gap: "7px", minWidth: "118px" }}><div style={{ backgroundColor: "#ffffff", border: `1px solid ${color}55`, borderTop: `4px solid ${color}`, borderRadius: "7px", color: C.navy, flex: 1, fontSize: "10px", fontWeight: 800, lineHeight: "1.25", minHeight: "49px", padding: "8px", textAlign: "center" }}>{label}</div>{index < 8 && <span style={{ color, fontSize: "17px", fontWeight: 800 }}>→</span>}</div>)}
        </div>

        <PanelHeading eyebrow="Responsibilities" title="Ownership boundaries in the State calculation POC" subtitle="The POC keeps business rules, practitioner experience, governed data support, mapping, integration, and calculation responsibilities visibly distinct." />
        <div style={{ display: "grid", gap: "11px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", marginBottom: "22px" }}>
          {RESPONSIBILITIES.map(card => <div key={card.title} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTop: `4px solid ${card.accent}`, borderRadius: "9px", padding: "13px" }}>
            <div style={{ color: card.accent, fontSize: "12px", fontWeight: 800, marginBottom: "5px" }}>{card.title}</div>
            <div style={{ color: C.navy, fontSize: "10px", fontWeight: 800, lineHeight: "1.4", marginBottom: "8px" }}>{card.responsibility}</div>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>{card.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.45", marginBottom: "5px" }}>{item}</li>)}</ul>
          </div>)}
        </div>

        <PanelHeading eyebrow="Calculation package" title="Roger → GoSystem: Proposed State Calculation Package" subtitle="Use these categories to confirm completeness, Taxonomy, mapping, system ownership, and Process ownership." />
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
          {PACKAGE_COLUMNS.map(column => <div key={column.title} style={{ backgroundColor: "#ffffff", border: `1px solid ${column.accent}44`, borderTop: `5px solid ${column.accent}`, borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ backgroundColor: `${column.accent}10`, borderBottom: `1px solid ${column.accent}33`, color: column.accent, fontSize: "12px", fontWeight: 800, padding: "11px 12px" }}>{column.title}</div>
            <div style={{ padding: "12px" }}>{column.groups.map(group => <div key={group.label} style={{ marginBottom: "10px" }}><div style={{ color: C.slate, fontSize: "10px", fontWeight: 800, marginBottom: "4px", textTransform: "uppercase" }}>{group.label}</div><ul style={{ margin: 0, paddingLeft: "15px" }}>{group.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.42", marginBottom: "3px" }}>{item}</li>)}</ul></div>)}</div>
            <div style={{ backgroundColor: "#fffbeb", borderTop: "1px solid #fde68a", color: "#78350f", fontSize: "10px", lineHeight: "1.45", padding: "10px 12px" }}><strong>Process Ask:</strong> {column.ask}</div>
          </div>)}
        </div>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: C.slate, fontSize: "11px", fontWeight: 750, margin: "12px 0 22px", padding: "10px 12px" }}><strong style={{ color: C.navy }}>Cross-Cutting Metadata:</strong> Taxonomy ID • Source • Lineage • Approval Status • Version • Transmission Correlation ID • Validation Messages</div>

        <PanelHeading eyebrow="Inbound / outbound distinction" title="POC Data Movement" subtitle="The POC must prove two governed packages: a State calculation input package and a State calculation review package." />
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", marginBottom: "22px" }}>
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "10px", padding: "14px" }}>
            <div style={{ color: "#1d4ed8", fontSize: "11px", fontWeight: 800, letterSpacing: "0.07em", marginBottom: "7px", textTransform: "uppercase" }}>Inbound · State Calculation Input Package</div>
            <div style={{ color: C.navy, fontSize: "12px", fontWeight: 800, lineHeight: "1.6" }}>Roger <span style={{ color: "#2563eb" }}>→</span> DCT <span style={{ color: "#2563eb" }}>→</span> Taxonomy Mapping <span style={{ color: "#2563eb" }}>→</span> IMS <span style={{ color: "#2563eb" }}>→</span> GoSystem</div>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderLeft: "5px solid #059669", borderRadius: "10px", padding: "14px" }}>
            <div style={{ color: "#047857", fontSize: "11px", fontWeight: 800, letterSpacing: "0.07em", marginBottom: "7px", textTransform: "uppercase" }}>Outbound · State Calculation Review Package</div>
            <div style={{ color: C.navy, fontSize: "12px", fontWeight: 800, lineHeight: "1.6" }}>GoSystem <span style={{ color: "#059669" }}>→</span> IMS <span style={{ color: "#059669" }}>→</span> Taxonomy Mapping <span style={{ color: "#059669" }}>→</span> DCT <span style={{ color: "#059669" }}>→</span> Roger</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", marginBottom: "22px" }}>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Minimum input package" title="Inbound — Roger/DCT → GoSystem" subtitle="Establish the minimum data package GoSystem requires to perform State calculations." accent="#2563eb" />
            <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{INBOUND_REQUIREMENTS.map(group => <RequirementGroup key={group.label} {...group} accent="#2563eb" />)}</div>
            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", color: "#78350f", fontSize: "10px", lineHeight: "1.48", marginTop: "12px", padding: "11px" }}><strong>Not every value should automatically be pushed into GoSystem.</strong><br />The POC determines whether data already exists in GoSystem, can be inherited or rolled forward, should be read from GoSystem, must be supplied by Roger, or must be derived by the data layer.</div>
          </div>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Transparent review package" title="Outbound — GoSystem → DCT/Roger" subtitle="The objective is not merely a final number; practitioners must be able to understand and review the calculation." accent={C.green} />
            <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{OUTBOUND_REQUIREMENTS.map(group => <RequirementGroup key={group.label} {...group} accent={C.green} />)}</div>
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#7f1d1d", fontSize: "10px", lineHeight: "1.48", marginTop: "12px", padding: "11px" }}><strong>Open design decision:</strong> Process and State teams determine the minimum review detail — including whether additions/subtractions can be aggregated, individual modifications are required, every apportionment component is needed, and which accrual / NOL / credit details belong in the POC.</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)", marginBottom: "22px" }}>
          <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Mapping expectations" title="Taxonomy Expectations" subtitle="Taxonomy supports both inbound and outbound mapping; it establishes a repeatable governed pattern before broad implementation." accent={C.purple} />
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #ddd6fe", borderRadius: "7px", padding: "10px" }}><div style={{ color: C.purple, fontSize: "10px", fontWeight: 800, marginBottom: "5px" }}>Inbound taxonomy</div><div style={{ color: C.navy, fontSize: "11px", fontWeight: 800 }}>Roger/DCT business concept → governed taxonomy → GoSystem target</div></div>
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #ddd6fe", borderRadius: "7px", padding: "10px" }}><div style={{ color: C.purple, fontSize: "10px", fontWeight: 800, marginBottom: "5px" }}>Outbound taxonomy</div><div style={{ color: C.navy, fontSize: "11px", fontWeight: 800 }}>GoSystem result → governed taxonomy → DCT/Roger business concept</div></div>
            </div>
            <div style={{ color: "#334155", fontSize: "10px", lineHeight: "1.5", marginTop: "11px" }}><strong>Taxonomy defines:</strong> Business definition • source • target • mapping identifier • data type • valid values • required / optional • State applicability • entity applicability • granularity • version • lineage • approval status • State-specific exceptions.</div>
            <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderLeft: "4px solid #ea580c", borderRadius: "7px", color: "#7c2d12", fontSize: "10px", lineHeight: "1.5", marginTop: "11px", padding: "10px" }}><strong>Scale warning:</strong> State mapping can expand quickly because calculation structures vary by jurisdiction. Establish repeatable patterns and representative mappings before broad implementation; do not design 50 independent mapping structures unless business requirements prove it necessary.</div>
          </div>
          <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Architecture dependency" title="Federal → State Deliverable Linkage" subtitle="A DCT / architecture / data-model dependency, not solely a Taxonomy issue." accent={C.teal} />
            <div style={{ display: "grid", gap: "5px", gridTemplateColumns: "1fr", marginBottom: "10px" }}>{["Shared Source Data", "Provision Deliverable", "Federal Deliverable", "State Deliverable"].map((step, index) => <div key={step} style={{ alignItems: "center", display: "flex", gap: "8px" }}><span style={{ backgroundColor: index === 3 ? C.teal : "#ffffff", border: `1px solid ${C.teal}66`, borderRadius: "6px", color: index === 3 ? "#ffffff" : C.navy, fontSize: "10px", fontWeight: 800, padding: "7px 9px", textAlign: "center", width: "100%" }}>{step}</span>{index < 3 && <span style={{ color: C.teal, fontWeight: 800 }}>↓</span>}</div>)}</div>
            <p style={{ color: "#164e63", fontSize: "10px", lineHeight: "1.5", margin: 0 }}>Original Trial Balance or source data may be reusable, but adjustments and calculated values become deliverable-specific. For TY26, the State workflow must reference the correct Federal deliverable when multiple deliverables exist for the same entity and tax year.</p>
          </div>
        </div>

        <PanelHeading eyebrow="BA delivery support" title="BA Deliverables for Taxonomy & POC" subtitle="Structured artifacts to turn the proof-of-feasibility into governed, testable delivery work." />
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "22px", overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "1100px", width: "100%" }}><thead><tr style={{ backgroundColor: C.navy }}>{["Deliverable", "Purpose", "Primary Participants", "Status", "Open Questions"].map(head => <th key={head} style={{ color: "#ffffff", fontSize: "10px", fontWeight: 800, padding: "10px 12px", textAlign: "left" }}>{head}</th>)}</tr></thead><tbody>{BA_DELIVERABLES.map((row, index) => <tr key={row[0]} style={{ backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ color: cellIndex === 0 ? C.navy : "#334155", fontSize: "10px", fontWeight: cellIndex === 0 ? 800 : 400, lineHeight: "1.45", padding: "10px 12px", verticalAlign: "top" }}>{cellIndex === 3 ? <span style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "999px", color: "#92400e", fontSize: "9px", fontWeight: 800, padding: "3px 6px" }}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table>
        </div>

        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))" }}>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #fed7aa", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Decisions required" title="POC Open Questions" subtitle="Keep unresolved business, Taxonomy, integration, and architecture decisions explicit rather than embedding assumptions in implementation." accent="#d97706" />
            <ol style={{ columns: 2, margin: 0, paddingLeft: "18px" }}>{OPEN_QUESTIONS.map(item => <li key={item} style={{ breakInside: "avoid", color: "#78350f", fontSize: "10px", lineHeight: "1.45", marginBottom: "7px", paddingRight: "10px" }}>{item}</li>)}</ol>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Proof of feasibility" title="POC Success Criteria" subtitle="The POC is successful only when the full governed input-to-review pattern can be demonstrated." accent={C.green} />
            <ol style={{ columns: 2, margin: 0, paddingLeft: "18px" }}>{SUCCESS_CRITERIA.map(item => <li key={item} style={{ breakInside: "avoid", color: "#166534", fontSize: "10px", lineHeight: "1.45", marginBottom: "7px", paddingRight: "10px" }}>{item}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

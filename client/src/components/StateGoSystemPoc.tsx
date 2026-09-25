import { Fragment, useState } from "react";
import ExecutiveProcessFlow, { type ExecutiveFlowStep } from "@/components/ExecutiveProcessFlow";

const C = {
  navy: "#0f1623",
  blue: "#1e3a5f",
  teal: "#0369a1",
  green: "#047857",
  purple: "#7c3aed",
  rose: "#be185d",
  slate: "#475569",
};

const FEDERAL_STATE_LINKAGE_STEPS: readonly ExecutiveFlowStep[] = [
  { label: "1 · Reusable input", title: "Shared source data", detail: "Original trial balance and source data may be reusable across deliverables.", accent: C.teal, surface: "#f0fdfa" },
  { label: "2 · Provision output", title: "Provision deliverable", detail: "Uses its own adjustments and calculated values for the Provision outcome.", accent: C.purple, surface: "#faf5ff" },
  { label: "3 · Federal output", title: "Federal deliverable", detail: "Provides the governed Federal result that may be required as the State starting context.", accent: "#2563eb", surface: "#eff6ff" },
  { label: "4 · State outcome", title: "State deliverable", detail: "References the correct Federal deliverable for the entity and tax year before State calculation and review.", accent: C.teal, surface: "#f0fdfa" },
];

const POC_TRANSCRIPT_SOURCE_URL = "/manus-storage/POC_6327d700.docx";

const MINIMUM_POC_INPUT_CARDS = [
  {
    title: "Filing Context",
    accent: "#2563eb",
    items: ["Client ID", "Tax Year", "Entity ID", "State / Jurisdiction", "Filing or Deliverable ID", "Filing Designation — Single, Combined, or Consolidated", "Tax Type"],
    purpose: "Identifies exactly which State calculation is being performed and the filing context associated with the request.",
  },
  {
    title: "Federal Starting Context",
    accent: "#1d4ed8",
    items: ["Federal Taxable Income starting point", "Or a reference to the Federal deliverable that provides the governed Federal starting value"],
    purpose: "Provides the Federal starting point required by the State calculation without unnecessarily duplicating data that may already exist in a governed Federal deliverable.",
    decision: "Determine whether the Federal starting value is transmitted directly or referenced through the associated Federal deliverable.",
  },
  {
    title: "Calculation Configuration",
    accent: "#0369a1",
    items: ["Apportionment method", "Required weighting", "Entity type", "Filing designation", "Minimum State-specific option or override for the representative scenario"],
    purpose: "Provides the minimum calculation configuration GoSystem needs to execute the selected State scenario correctly.",
  },
  {
    title: "Representative Calculation Inputs",
    accent: "#047857",
    items: ["Property, Payroll, and Sales", "State / Entity assignment", "Within / Everywhere values where required", "One representative State addition, subtraction, State tax addback, depreciation adjustment, or other State modification"],
    purpose: "Proves that DCT can transmit structured apportionment inputs and a representative State modification through mapping and the GoSystem integration.",
  },
  {
    title: "Governance & Correlation Metadata",
    accent: "#7c3aed",
    items: ["Taxonomy ID or Mapping ID", "Source System", "Source Record ID", "Version where applicable", "Transmission Correlation ID / Run ID", "Basic lineage reference"],
    purpose: "Allows the inbound request and outbound GoSystem response to be traced and associated with the correct source, filing, and calculation run.",
  },
] as const;

const BA_INBOUND_CONTRACT_FIELDS = ["Business Field", "Business Definition", "Source System", "Source Field", "Target GoSystem Field / Concept", "Required or Optional", "Valid Values", "Transformation Rule", "State Applicability", "Entity Applicability", "Taxonomy / Mapping ID", "Owner", "Open Question"] as const;

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

function PocInputCard({ card }: { card: typeof MINIMUM_POC_INPUT_CARDS[number] }) {
  return <div style={{ backgroundColor: "#ffffff", border: `1px solid ${card.accent}44`, borderTop: `5px solid ${card.accent}`, borderRadius: "10px", display: "flex", flexDirection: "column", padding: "14px" }}>
    <div style={{ color: card.accent, fontSize: "12px", fontWeight: 850, lineHeight: "1.3", marginBottom: "8px" }}>{card.title}</div>
    <ul style={{ margin: "0 0 10px", paddingLeft: "17px" }}>{card.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{item}</li>)}</ul>
    <div style={{ borderTop: "1px solid #e2e8f0", color: C.slate, fontSize: "10px", lineHeight: "1.48", marginTop: "auto", paddingTop: "9px" }}><strong style={{ color: C.navy }}>Purpose:</strong> {card.purpose}</div>
    {"decision" in card && <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "7px", color: "#78350f", fontSize: "10px", lineHeight: "1.45", marginTop: "10px", padding: "8px" }}><strong>POC Decision:</strong> {card.decision}</div>}
  </div>;
}

export default function StateGoSystemPoc() {
  const copyText = [
    "Roger → GoSystem POC: State Calculation Integration",
    "Purpose: Prove governed State preparation data can move Roger → DCT → IMS → GoSystem and return as a structured, transparent review package in Roger.",
    "Minimum POC Input Package: filing context, Federal starting context, calculation configuration, property/payroll/sales, one representative State modification, and mapping/correlation metadata for one representative State scenario.",
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
        <section aria-labelledby="poc-source-document" style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderLeft: `5px solid ${C.teal}`, borderRadius: "9px", marginBottom: "18px", padding: "13px 15px" }}>
          <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}>
            <div style={{ maxWidth: "850px" }}>
              <div style={{ color: C.teal, fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "5px", textTransform: "uppercase" }}>Source document</div>
              <div id="poc-source-document" style={{ color: C.navy, fontSize: "13px", fontWeight: 850 }}>POC Meeting Transcript (DOCX)</div>
              <p style={{ color: C.slate, fontSize: "11px", lineHeight: "1.5", margin: "5px 0 0" }}>Recorded POC working-session transcript documenting the proposed operating model, design questions, and feasibility considerations; it is not an approved implementation specification.</p>
              <p style={{ color: C.navy, fontSize: "11px", fontWeight: 700, lineHeight: "1.5", margin: "7px 0 0" }}><strong>Architecture summary:</strong> Roger captures and reviews the representative State scenario; DCT governs and correlates the package; Taxonomy and IMS map and transport it; GoSystem calculates; and structured results return to Roger for practitioner reconciliation.</p>
            </div>
            <a href={POC_TRANSCRIPT_SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#ffffff", border: `1px solid ${C.teal}66`, borderRadius: "6px", color: C.teal, fontSize: "10px", fontWeight: 800, padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>Open transcript (DOCX)</a>
          </div>
        </section>

        <section aria-labelledby="minimum-poc-input-package" style={{ marginBottom: "24px" }}>
          <PanelHeading eyebrow="Immediate proof-of-feasibility requirement" title="Minimum POC Input Package for DCT" subtitle="The POC should prove the minimum viable State calculation flow before expanding to the full State data model. DCT does not need every possible State input, modification, attribute, payment type, or jurisdiction-specific configuration in order to prove the integration pattern." accent="#2563eb" />
          <div id="minimum-poc-input-package" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "11px", lineHeight: "1.55", marginBottom: "14px", padding: "12px 14px" }}>
            The initial POC should use one representative State calculation scenario with enough governed context to <strong>identify the filing</strong>, <strong>supply the required calculation inputs</strong>, <strong>map the data into GoSystem</strong>, <strong>execute the calculation</strong>, and <strong>correlate the returned result back to the correct filing</strong>.
          </div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>{MINIMUM_POC_INPUT_CARDS.map(card => <PocInputCard key={card.title} card={card} />)}</div>
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderLeft: "5px solid #d97706", borderRadius: "9px", color: "#78350f", fontSize: "11px", lineHeight: "1.5", marginTop: "14px", padding: "11px 13px" }}><strong>POC scope boundary:</strong> Do <strong>not</strong> make NOLs, credits, every payment type, every State modification, or all 50-State variations mandatory for the initial POC.</div>
        </section>

        <section aria-labelledby="representative-poc-scenario" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", marginBottom: "24px", padding: "15px" }}>
          <PanelHeading eyebrow="POC boundary" title="Representative POC Scenario" subtitle="The initial POC should prove one representative State calculation scenario before expanding to additional States, attributes, modifications, and calculation scenarios." accent={C.green} />
          <div id="representative-poc-scenario" style={{ alignItems: "center", color: "#166534", display: "flex", flexWrap: "wrap", fontSize: "12px", fontWeight: 800, gap: "7px", lineHeight: "1.4" }}>
            {["One Client", "One Entity", "One Tax Year", "One State", "One Filing Designation", "One Federal Taxable Income Starting Point", "Property / Payroll / Sales Inputs", "One Representative State Modification", "Required Calculation Configuration"].map((item, index) => <Fragment key={item}><span style={{ backgroundColor: "#ffffff", border: "1px solid #86efac", borderRadius: "999px", padding: "5px 8px" }}>{item}</span>{index < 8 && <span style={{ color: C.green, fontSize: "16px" }}>+</span>}</Fragment>)}
          </div>
        </section>

        <section aria-labelledby="ba-requirement-for-poc" style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", marginBottom: "24px", padding: "15px" }}>
          <PanelHeading eyebrow="Business analysis deliverable" title="BA Requirement for the POC" subtitle="The BA must work with Process, State, Taxonomy, DCT, IMS, and GoSystem SMEs to define the thin inbound and outbound data contracts." accent={C.purple} />
          <div id="ba-requirement-for-poc" style={{ backgroundColor: "#ffffff", border: "1px solid #ddd6fe", borderLeft: `5px solid ${C.purple}`, borderRadius: "8px", color: "#312e81", fontSize: "12px", fontWeight: 800, lineHeight: "1.55", padding: "12px" }}>“What is the smallest set of business inputs GoSystem must receive to successfully calculate one representative State return scenario?” <span style={{ color: C.slate, fontWeight: 500 }}>That answer becomes the POC Inbound Data Contract.</span></div>
          <div style={{ display: "grid", gap: "7px", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", marginTop: "12px" }}>{BA_INBOUND_CONTRACT_FIELDS.map((field, index) => <div key={field} style={{ alignItems: "center", backgroundColor: "#ffffff", border: "1px solid #e9d5ff", borderRadius: "6px", color: C.slate, display: "flex", fontSize: "10px", gap: "7px", padding: "7px 8px" }}><span style={{ color: C.purple, fontWeight: 850 }}>{index + 1}.</span>{field}</div>)}</div>
          <div style={{ color: "#5b21b6", fontSize: "11px", fontWeight: 750, lineHeight: "1.5", marginTop: "12px" }}>Also create the corresponding outbound mapping for the minimum results required to prove the POC.</div>
        </section>
      </div>
    </div>
  </section>;
}

export function StateGoSystemPocClosingDetails() {
  return <section id="poc-closing-details" style={{ marginBottom: "48px" }}>
    <PanelHeading eyebrow="Broader implementation model" title="Full Target State Calculation Package" subtitle="This future-state package is intentionally distinct from the minimum POC package above and should not block proof of feasibility." />
    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
      {PACKAGE_COLUMNS.map(column => <div key={column.title} style={{ backgroundColor: "#ffffff", border: `1px solid ${column.accent}44`, borderTop: `5px solid ${column.accent}`, borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ backgroundColor: `${column.accent}10`, borderBottom: `1px solid ${column.accent}33`, color: column.accent, fontSize: "12px", fontWeight: 800, padding: "11px 12px" }}>{column.title}</div>
        <div style={{ padding: "12px" }}>{column.groups.map(group => <div key={group.label} style={{ marginBottom: "10px" }}><div style={{ color: C.slate, fontSize: "10px", fontWeight: 800, marginBottom: "4px", textTransform: "uppercase" }}>{group.label}</div><ul style={{ margin: 0, paddingLeft: "15px" }}>{group.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.42", marginBottom: "3px" }}>{item}</li>)}</ul></div>)}</div>
        <div style={{ backgroundColor: "#fffbeb", borderTop: "1px solid #fde68a", color: "#78350f", fontSize: "10px", lineHeight: "1.45", padding: "10px 12px" }}><strong>Process Ask:</strong> {column.ask}</div>
      </div>)}
    </div>
    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: C.slate, fontSize: "11px", fontWeight: 750, margin: "12px 0 22px", padding: "10px 12px" }}><strong style={{ color: C.navy }}>Cross-Cutting Metadata:</strong> Taxonomy ID • Source • Lineage • Approval Status • Version • Transmission Correlation ID • Validation Messages</div>
    <section aria-labelledby="federal-state-deliverable-linkage" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", marginBottom: "22px", padding: "16px" }}>
      <PanelHeading eyebrow="Architecture dependency" title="Federal → State Deliverable Linkage" subtitle="A DCT / architecture / data-model dependency that is separate from the minimum POC package." accent={C.teal} />
      <div id="federal-state-deliverable-linkage"><ExecutiveProcessFlow ariaLabel="Federal to State deliverable linkage executive process flow" steps={FEDERAL_STATE_LINKAGE_STEPS} outcome="For TY26, the State workflow uses the correct governed Federal deliverable when multiple deliverables exist for the same entity and tax year." /></div>
    </section>
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
  </section>;
}

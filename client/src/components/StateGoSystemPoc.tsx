import { Fragment, useState } from "react";

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
const MINIMUM_POC_FLOW_IMAGE = "/manus-storage/minimum-poc-state-calculation-flow_00034465.png";
const POC_TRANSCRIPT_SOURCE_URL = "/manus-storage/POC_6327d700.docx";

const TRANSCRIPT_ARCHITECTURE_OVERVIEW = [
  {
    title: "1. Establish and validate filing context",
    accent: C.green,
    detail: "Roger captures the State filing footprint, filer and filing-group context, jurisdiction, tax year, entity or locator context, and calculation configuration. The transcript emphasizes validating the existing GoSystem setup first so the POC does not push changes that can be inherited, rolled forward, or read from GoSystem.",
  },
  {
    title: "2. Govern the calculation package",
    accent: C.blue,
    detail: "DCT persists the approved context and supports lineage; Taxonomy defines repeatable business-to-system mappings; IMS translates and correlates the package. GoSystem remains the State calculation engine for taxable income, apportionment, liability, accrual, and applicable State variations.",
  },
  {
    title: "3. Return a reviewable result—not just a number",
    accent: C.teal,
    detail: "The return path must give Roger a workpaper-style review experience. The transcript calls for enough structured output to reconcile apportionment factors, State taxable income, liability or accrual components, modifications, and—where required—NOL, credit, and carryforward detail before practitioner approval.",
  },
  {
    title: "4. Prove a scalable pattern before broad delivery",
    accent: C.purple,
    detail: "The initial POC should use representative scenarios to prove both inbound and outbound mappings. State-specific configuration, combined or consolidated treatment, modifications, and output granularity remain design decisions; the most material feasibility risk is the outbound package across variable State calculations.",
  },
] as const;

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

const POC_PROOF_PATH = ["Roger", "DCT", "Taxonomy", "IMS", "GoSystem", "IMS", "Taxonomy", "DCT", "Roger"] as const;

const POC_REQUIRED_NOW = ["Core filing context", "Federal starting context", "Minimum calculation configuration", "Property / Payroll / Sales", "One representative State modification", "Taxonomy / mapping identifiers", "Correlation and lineage metadata", "One representative State scenario"] as const;

const FUTURE_STATE_EXPANSION = ["Additional States", "Additional State-specific options", "Multiple modification types", "Payments", "NOLs", "Credits", "Carryforwards", "Additional State attributes", "More granular review outputs", "Broader jurisdiction-specific mapping", "Full production-scale mapping patterns"] as const;

const BA_INBOUND_CONTRACT_FIELDS = ["Business Field", "Business Definition", "Source System", "Source Field", "Target GoSystem Field / Concept", "Required or Optional", "Valid Values", "Transformation Rule", "State Applicability", "Entity Applicability", "Taxonomy / Mapping ID", "Owner", "Open Question"] as const;

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

function PocInputCard({ card }: { card: typeof MINIMUM_POC_INPUT_CARDS[number] }) {
  return <div style={{ backgroundColor: "#ffffff", border: `1px solid ${card.accent}44`, borderTop: `5px solid ${card.accent}`, borderRadius: "10px", display: "flex", flexDirection: "column", padding: "14px" }}>
    <div style={{ color: card.accent, fontSize: "12px", fontWeight: 850, lineHeight: "1.3", marginBottom: "8px" }}>{card.title}</div>
    <ul style={{ margin: "0 0 10px", paddingLeft: "17px" }}>{card.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{item}</li>)}</ul>
    <div style={{ borderTop: "1px solid #e2e8f0", color: C.slate, fontSize: "10px", lineHeight: "1.48", marginTop: "auto", paddingTop: "9px" }}><strong style={{ color: C.navy }}>Purpose:</strong> {card.purpose}</div>
    {"decision" in card && <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "7px", color: "#78350f", fontSize: "10px", lineHeight: "1.45", marginTop: "10px", padding: "8px" }}><strong>POC Decision:</strong> {card.decision}</div>}
  </div>;
}

export default function StateGoSystemPoc() {
  const [isDiagramViewerOpen, setIsDiagramViewerOpen] = useState(false);
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [isMinimumFlowViewerOpen, setIsMinimumFlowViewerOpen] = useState(false);
  const [minimumFlowZoom, setMinimumFlowZoom] = useState(1);
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
              <p style={{ color: C.slate, fontSize: "11px", lineHeight: "1.5", margin: "5px 0 0" }}>Recorded POC working-session transcript used as the source for the architecture overview below. It documents the proposed operating model, design questions, and feasibility considerations; it is not an approved implementation specification.</p>
            </div>
            <a href={POC_TRANSCRIPT_SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#ffffff", border: `1px solid ${C.teal}66`, borderRadius: "6px", color: C.teal, fontSize: "10px", fontWeight: 800, padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>Open transcript (DOCX)</a>
          </div>
        </section>

        <section aria-labelledby="transcript-architecture-overview" style={{ backgroundColor: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "10px", marginBottom: "20px", padding: "15px" }}>
          <PanelHeading eyebrow="Transcript-derived architecture overview" title="Architecture Overview of the POC" subtitle="A concise synthesis of the POC working session, separating the intended operating model from the design questions that must be resolved during proof of feasibility." accent={C.blue} />
          <div id="transcript-architecture-overview" style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {TRANSCRIPT_ARCHITECTURE_OVERVIEW.map((item) => (
              <div key={item.title} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderTop: `4px solid ${item.accent}`, borderRadius: "8px", padding: "12px" }}>
                <div style={{ color: item.accent, fontSize: "11px", fontWeight: 850, lineHeight: "1.35", marginBottom: "6px" }}>{item.title}</div>
                <div style={{ color: "#334155", fontSize: "10px", lineHeight: "1.55" }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderLeft: "5px solid #d97706", borderRadius: "9px", marginBottom: "20px", padding: "13px 15px" }}>
          <div style={{ color: "#92400e", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "5px", textTransform: "uppercase" }}>POC focus</div>
          <div style={{ color: "#78350f", fontSize: "13px", fontWeight: 700, lineHeight: "1.55" }}>Prove both inbound and outbound integration, with particular emphasis on retrieving structured GoSystem calculation outputs and making them transparent and reviewable within Roger.</div>
        </div>

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

        <section aria-labelledby="minimum-poc-state-calculation-flow" style={{ marginBottom: "24px" }}>
          <PanelHeading eyebrow="Prominent POC flow" title="Minimum POC State Calculation Flow" subtitle="The detailed flow below makes the thin, representative input package and the returned review package visibly traceable across each system responsibility." accent="#2563eb" />
          <div id="minimum-poc-state-calculation-flow" style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ alignItems: "center", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "12px", justifyContent: "space-between", padding: "9px 12px" }}>
              <span style={{ color: C.slate, fontSize: "10px", fontWeight: 700 }}>System responsibilities are shown inside each flow box; open the full-size view to inspect each label.</span>
              <button type="button" onClick={() => setIsMinimumFlowViewerOpen(true)} style={{ backgroundColor: "#2563eb", border: "1px solid #1d4ed8", borderRadius: "6px", color: "#ffffff", cursor: "pointer", flexShrink: 0, fontSize: "10px", fontWeight: 800, padding: "6px 10px" }}>Open readable POC flow</button>
            </div>
            <div style={{ overflowX: "hidden", padding: "12px" }}><img src={MINIMUM_POC_FLOW_IMAGE} alt="Minimum POC State Calculation Flow: Tax Practitioner to Roger State Experience to DCT — Build Governed POC Input Package to Taxonomy Mapping to IMS to GoSystem, then IMS to Taxonomy Mapping to DCT — Correlate & Govern Returned Results to Roger State Review Experience to Practitioner Review and Reconciliation" style={{ display: "block", height: "auto", margin: "0 auto", maxWidth: "1600px", width: "100%" }} /></div>
          </div>
          {isMinimumFlowViewerOpen && (
            <div role="dialog" aria-modal="true" aria-label="Readable minimum POC State calculation flow" onClick={() => setIsMinimumFlowViewerOpen(false)} style={{ alignItems: "center", backgroundColor: "rgba(15, 22, 35, 0.78)", display: "flex", inset: 0, justifyContent: "center", padding: "24px", position: "fixed", zIndex: 80 }}>
              <div onClick={event => event.stopPropagation()} style={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.38)", maxHeight: "calc(100vh - 48px)", maxWidth: "calc(100vw - 48px)", overflow: "hidden", width: "100%" }}>
                <div style={{ alignItems: "center", backgroundColor: "#1e3a5f", display: "flex", gap: "12px", justifyContent: "space-between", padding: "12px 16px" }}>
                  <div><div style={{ color: "#bfdbfe", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Full-size POC flow viewer</div><div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>Minimum POC State Calculation Flow</div></div>
                  <div style={{ alignItems: "center", display: "flex", gap: "7px" }}>
                    <button type="button" onClick={() => setMinimumFlowZoom(value => Math.max(0.75, Number((value - 0.15).toFixed(2))))} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", color: C.navy, cursor: "pointer", fontSize: "12px", fontWeight: 800, padding: "5px 8px" }}>−</button>
                    <span style={{ color: "#dbeafe", fontSize: "11px", fontWeight: 700, minWidth: "38px", textAlign: "center" }}>{Math.round(minimumFlowZoom * 100)}%</span>
                    <button type="button" onClick={() => setMinimumFlowZoom(value => Math.min(1.5, Number((value + 0.15).toFixed(2))))} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", color: C.navy, cursor: "pointer", fontSize: "12px", fontWeight: 800, padding: "5px 8px" }}>+</button>
                    <button type="button" onClick={() => setIsMinimumFlowViewerOpen(false)} style={{ backgroundColor: "transparent", border: "1px solid #7dd3fc", borderRadius: "5px", color: "#ffffff", cursor: "pointer", fontSize: "10px", fontWeight: 800, marginLeft: "5px", padding: "6px 9px" }}>Close</button>
                  </div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", maxHeight: "calc(100vh - 125px)", overflow: "auto", padding: "16px" }}><img src={MINIMUM_POC_FLOW_IMAGE} alt="Full-size Minimum POC State Calculation Flow showing DCT — Build Governed POC Input Package and DCT — Correlate & Govern Returned Results" style={{ display: "block", height: "auto", maxWidth: "none", width: `${3982 * minimumFlowZoom}px` }} /></div>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="poc-proof-path" style={{ backgroundColor: "#ffffff", border: "1px solid #dbeafe", borderRadius: "10px", marginBottom: "24px", padding: "15px" }}>
          <PanelHeading eyebrow="Simple end-to-end view" title="POC Proof Path" subtitle="The POC proves two governed packages: an inbound State Calculation Input Package and an outbound State Calculation Review Package." accent={C.teal} />
          <div id="poc-proof-path" style={{ alignItems: "stretch", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>{POC_PROOF_PATH.map((step, index) => <Fragment key={`${step}-${index}`}><div style={{ backgroundColor: index < 5 ? "#eff6ff" : "#f0fdf4", border: `1px solid ${index < 5 ? "#93c5fd" : "#86efac"}`, borderRadius: "7px", color: index < 5 ? "#1d4ed8" : "#047857", fontSize: "10px", fontWeight: 850, padding: "8px 9px", textAlign: "center" }}>{step}</div>{index < POC_PROOF_PATH.length - 1 && <span style={{ alignSelf: "center", color: index < 4 ? "#2563eb" : "#047857", fontSize: "17px", fontWeight: 850 }}>→</span>}</Fragment>)}</div>
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginTop: "13px" }}><div style={{ backgroundColor: "#eff6ff", borderLeft: "4px solid #2563eb", borderRadius: "7px", color: "#1e3a5f", fontSize: "11px", padding: "10px" }}><strong>Inbound:</strong> State Calculation Input Package</div><div style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #047857", borderRadius: "7px", color: "#166534", fontSize: "11px", padding: "10px" }}><strong>Outbound:</strong> State Calculation Review Package</div></div>
        </section>

        <section aria-labelledby="poc-scope-comparison" style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderTop: "5px solid #2563eb", borderRadius: "10px", padding: "15px" }}><PanelHeading eyebrow="Immediate scope" title="POC — Required Now" subtitle="The thin, representative path needed to prove the integration pattern." accent="#2563eb" /><ul style={{ margin: 0, paddingLeft: "17px" }}>{POC_REQUIRED_NOW.map(item => <li key={item} style={{ color: "#1e3a5f", fontSize: "11px", lineHeight: "1.5", marginBottom: "5px" }}>{item}</li>)}</ul></div>
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderTop: "5px solid #64748b", borderRadius: "10px", padding: "15px" }}><PanelHeading eyebrow="Broader implementation" title="Future-State Expansion" subtitle="Requirements that should not block the initial proof of feasibility." accent="#64748b" /><ul style={{ margin: 0, paddingLeft: "17px" }}>{FUTURE_STATE_EXPANSION.map(item => <li key={item} style={{ color: C.slate, fontSize: "11px", lineHeight: "1.5", marginBottom: "5px" }}>{item}</li>)}</ul></div>
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "9px", color: "#78350f", fontSize: "11px", gridColumn: "1 / -1", lineHeight: "1.5", padding: "11px 13px" }}>The POC should <strong>not</strong> be blocked by requirements that belong to the future-state implementation.</div>
        </section>

        <section aria-labelledby="ba-requirement-for-poc" style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", marginBottom: "24px", padding: "15px" }}>
          <PanelHeading eyebrow="Business analysis deliverable" title="BA Requirement for the POC" subtitle="The BA must work with Process, State, Taxonomy, DCT, IMS, and GoSystem SMEs to define the thin inbound and outbound data contracts." accent={C.purple} />
          <div id="ba-requirement-for-poc" style={{ backgroundColor: "#ffffff", border: "1px solid #ddd6fe", borderLeft: `5px solid ${C.purple}`, borderRadius: "8px", color: "#312e81", fontSize: "12px", fontWeight: 800, lineHeight: "1.55", padding: "12px" }}>“What is the smallest set of business inputs GoSystem must receive to successfully calculate one representative State return scenario?” <span style={{ color: C.slate, fontWeight: 500 }}>That answer becomes the POC Inbound Data Contract.</span></div>
          <div style={{ display: "grid", gap: "7px", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", marginTop: "12px" }}>{BA_INBOUND_CONTRACT_FIELDS.map((field, index) => <div key={field} style={{ alignItems: "center", backgroundColor: "#ffffff", border: "1px solid #e9d5ff", borderRadius: "6px", color: C.slate, display: "flex", fontSize: "10px", gap: "7px", padding: "7px 8px" }}><span style={{ color: C.purple, fontWeight: 850 }}>{index + 1}.</span>{field}</div>)}</div>
          <div style={{ color: "#5b21b6", fontSize: "11px", fontWeight: 750, lineHeight: "1.5", marginTop: "12px" }}>Also create the corresponding outbound mapping for the minimum results required to prove the POC.</div>
        </section>

        <PanelHeading eyebrow="Full target-state architecture" title="GoSystem as the downstream State calculation system" subtitle="The broader State calculation package remains below as the implementation model. It is distinct from the immediate Minimum POC Input Package and does not replace TIM, PDC, TDC, Orchestrator, Gateway, IMS, or State services." />
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", marginBottom: "18px", overflow: "hidden" }}>
          <div style={{ alignItems: "center", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "12px", justifyContent: "space-between", padding: "9px 12px" }}>
            <span style={{ color: C.slate, fontSize: "10px", fontWeight: 700 }}>Architecture overview — open the full-size viewer to read every workflow label.</span>
            <button type="button" onClick={() => setIsDiagramViewerOpen(true)} style={{ backgroundColor: C.navy, border: "1px solid #0f1623", borderRadius: "6px", color: "#ffffff", cursor: "pointer", flexShrink: 0, fontSize: "10px", fontWeight: 800, padding: "6px 10px" }}>Open readable diagram</button>
          </div>
          <div style={{ overflowX: "hidden", padding: "12px" }}><img src={ARCHITECTURE_IMAGE} alt="Roger to GoSystem State calculation POC architecture showing practitioner, Roger, DCT, Taxonomy, IMS, GoSystem, result retrieval, and review flow" style={{ display: "block", height: "auto", margin: "0 auto", maxWidth: "1280px", width: "100%" }} /></div>
        </div>

        {isDiagramViewerOpen && (
          <div role="dialog" aria-modal="true" aria-label="Readable Roger to GoSystem State calculation workflow" onClick={() => setIsDiagramViewerOpen(false)} style={{ alignItems: "center", backgroundColor: "rgba(15, 22, 35, 0.78)", display: "flex", inset: 0, justifyContent: "center", padding: "24px", position: "fixed", zIndex: 80 }}>
            <div onClick={event => event.stopPropagation()} style={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.38)", maxHeight: "calc(100vh - 48px)", maxWidth: "calc(100vw - 48px)", overflow: "hidden", width: "100%" }}>
              <div style={{ alignItems: "center", backgroundColor: C.navy, display: "flex", gap: "12px", justifyContent: "space-between", padding: "12px 16px" }}>
                <div>
                  <div style={{ color: "#bae6fd", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Full-size workflow viewer</div>
                  <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>Roger → GoSystem POC: State Calculation Integration</div>
                </div>
                <div style={{ alignItems: "center", display: "flex", gap: "7px" }}>
                  <button type="button" onClick={() => setDiagramZoom(value => Math.max(0.75, Number((value - 0.15).toFixed(2))))} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", color: C.navy, cursor: "pointer", fontSize: "12px", fontWeight: 800, padding: "5px 8px" }}>−</button>
                  <span style={{ color: "#dbeafe", fontSize: "11px", fontWeight: 700, minWidth: "38px", textAlign: "center" }}>{Math.round(diagramZoom * 100)}%</span>
                  <button type="button" onClick={() => setDiagramZoom(value => Math.min(1.5, Number((value + 0.15).toFixed(2))))} style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", color: C.navy, cursor: "pointer", fontSize: "12px", fontWeight: 800, padding: "5px 8px" }}>+</button>
                  <button type="button" onClick={() => setIsDiagramViewerOpen(false)} style={{ backgroundColor: "transparent", border: "1px solid #7dd3fc", borderRadius: "5px", color: "#ffffff", cursor: "pointer", fontSize: "10px", fontWeight: 800, marginLeft: "5px", padding: "6px 9px" }}>Close</button>
                </div>
              </div>
              <div style={{ backgroundColor: "#f8fafc", maxHeight: "calc(100vh - 125px)", overflow: "auto", padding: "16px" }}><img src={ARCHITECTURE_IMAGE} alt="Full-size Roger to GoSystem State calculation POC architecture" style={{ display: "block", height: "auto", maxWidth: "none", width: `${2800 * diagramZoom}px` }} /></div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: "9px", gridTemplateColumns: "repeat(9, minmax(115px, 1fr))", marginBottom: "20px", minWidth: "0", overflowX: "auto" }}>
          {[
            ["Tax Practitioner", C.green], ["Roger State Experience", "#0891b2"], ["DCT / Data Layer", C.blue], ["IMS / Integration", C.rose], ["GoSystem", "#b91c1c"], ["IMS / Integration", C.rose], ["DCT / Data Layer", C.blue], ["Roger State Review", "#0891b2"], ["Review / Approval", C.green],
          ].map(([label, color], index) => <div key={`${label}-${index}`} style={{ alignItems: "center", display: "flex", gap: "7px", minWidth: "118px" }}><div style={{ backgroundColor: "#ffffff", border: `1px solid ${color}55`, borderTop: `4px solid ${color}`, borderRadius: "7px", color: C.navy, flex: 1, fontSize: "10px", fontWeight: 800, lineHeight: "1.25", minHeight: "49px", padding: "8px", textAlign: "center" }}>{label}</div>{index < 8 && <span style={{ color, fontSize: "17px", fontWeight: 800 }}>→</span>}</div>)}
        </div>

        <PanelHeading eyebrow="Responsibilities" title="Ownership boundaries in the State calculation POC" subtitle="The POC keeps business rules, practitioner experience, governed data support, mapping, integration, and calculation responsibilities visibly distinct." />
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginBottom: "22px" }}>
          {RESPONSIBILITIES.map(card => <div key={card.title} style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid #dbe5ee", borderTop: `4px solid ${card.accent}`, borderRadius: "10px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)", display: "flex", flexDirection: "column", minHeight: "230px", padding: "16px" }}>
            <div style={{ alignItems: "center", display: "flex", gap: "8px", marginBottom: "9px" }}><span style={{ backgroundColor: `${card.accent}14`, borderRadius: "999px", color: card.accent, fontSize: "9px", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 7px", textTransform: "uppercase" }}>Ownership</span><div style={{ color: card.accent, fontSize: "13px", fontWeight: 800 }}>{card.title}</div></div>
            <div style={{ color: C.navy, fontSize: "11px", fontWeight: 800, lineHeight: "1.45", marginBottom: "10px" }}>{card.responsibility}</div>
            <ul style={{ margin: 0, paddingLeft: "17px" }}>{card.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "11px", lineHeight: "1.5", marginBottom: "7px" }}>{item}</li>)}</ul>
          </div>)}
        </div>

        <PanelHeading eyebrow="Broader implementation model" title="Full Target State Calculation Package" subtitle="This is the broader future-state implementation model. It remains intentionally distinct from the immediate Minimum POC Input Package above." />
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
          {PACKAGE_COLUMNS.map(column => <div key={column.title} style={{ backgroundColor: "#ffffff", border: `1px solid ${column.accent}44`, borderTop: `5px solid ${column.accent}`, borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ backgroundColor: `${column.accent}10`, borderBottom: `1px solid ${column.accent}33`, color: column.accent, fontSize: "12px", fontWeight: 800, padding: "11px 12px" }}>{column.title}</div>
            <div style={{ padding: "12px" }}>{column.groups.map(group => <div key={group.label} style={{ marginBottom: "10px" }}><div style={{ color: C.slate, fontSize: "10px", fontWeight: 800, marginBottom: "4px", textTransform: "uppercase" }}>{group.label}</div><ul style={{ margin: 0, paddingLeft: "15px" }}>{group.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.42", marginBottom: "3px" }}>{item}</li>)}</ul></div>)}</div>
            <div style={{ backgroundColor: "#fffbeb", borderTop: "1px solid #fde68a", color: "#78350f", fontSize: "10px", lineHeight: "1.45", padding: "10px 12px" }}><strong>Process Ask:</strong> {column.ask}</div>
          </div>)}
        </div>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: C.slate, fontSize: "11px", fontWeight: 750, margin: "12px 0 22px", padding: "10px 12px" }}><strong style={{ color: C.navy }}>Cross-Cutting Metadata:</strong> Taxonomy ID • Source • Lineage • Approval Status • Version • Transmission Correlation ID • Validation Messages</div>

        <PanelHeading eyebrow="Future-state package distinction" title="Full Target Data Movement" subtitle="The POC proves the thin representative pattern first; this section shows the broader input and review package that may be expanded over time." />
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
            <PanelHeading eyebrow="Full target-state input model" title="Inbound — Roger/DCT → GoSystem" subtitle="Broader State input categories for future-state implementation beyond the representative POC scenario." accent="#2563eb" />
            <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{INBOUND_REQUIREMENTS.map(group => <RequirementGroup key={group.label} {...group} accent="#2563eb" />)}</div>
            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", color: "#78350f", fontSize: "10px", lineHeight: "1.48", marginTop: "12px", padding: "11px" }}><strong>Not every value should automatically be pushed into GoSystem.</strong><br />The POC determines whether data already exists in GoSystem, can be inherited or rolled forward, should be read from GoSystem, must be supplied by Roger, or must be derived by the data layer.</div>
          </div>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px" }}>
            <PanelHeading eyebrow="Full target-state review model" title="Outbound — GoSystem → DCT/Roger" subtitle="Broader practitioner review categories that can expand after the thin POC flow is proven." accent={C.green} />
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

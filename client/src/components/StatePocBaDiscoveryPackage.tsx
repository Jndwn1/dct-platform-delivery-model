import { Fragment, useState } from "react";

const C = {
  navy: "#0f1623",
  blue: "#1e3a5f",
  teal: "#0369a1",
  green: "#047857",
  yellow: "#a16207",
  orange: "#c2410c",
  red: "#b91c1c",
  gray: "#64748b",
  purple: "#7c3aed",
};

const BA_MAPPING_WORKBOOK_URL = "/manus-storage/Roger_GoSystem_POC_BA_Mapping_Template_45aa60ff.xlsx";

type Status = "Draft" | "In Progress" | "Not Started" | "Known / Confirmed" | "Known Concept — Detail TBD" | "Decision Required" | "Blocking Dependency" | "Future-State";

const STATUS: Record<Status, { bg: string; border: string; text: string }> = {
  "Draft": { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  "In Progress": { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  "Not Started": { bg: "#f8fafc", border: "#cbd5e1", text: "#475569" },
  "Known / Confirmed": { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
  "Known Concept — Detail TBD": { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  "Decision Required": { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  "Blocking Dependency": { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  "Future-State": { bg: "#f8fafc", border: "#cbd5e1", text: "#64748b" },
};

const DELIVERABLES: Array<{ deliverable: string; purpose: string; contents: string; source: string; action: string; status: Status; criteria: string }> = [
  { deliverable: "POC Scope Statement", purpose: "Define exactly what the POC is proving.", contents: "Selected State; entity / filing scenario; included calculation flow; exclusions; POC versus future-state boundary.", source: "PO, State, DCT, IMS", action: "Confirm the representative scenario and document in-scope / out-of-scope items.", status: "Draft", criteria: "Approved by participating teams." },
  { deliverable: "Minimum POC Input Package", purpose: "Define the smallest data set required to execute one representative State calculation.", contents: "Candidate inputs, required / optional decision, taxonomy and correlation requirements.", source: "State / Process, IMS / GoSystem, DCT", action: "Validate each candidate as Required, Optional, or Not Needed for the POC.", status: "Draft", criteria: "GoSystem / IMS and State SMEs confirm the minimum package." },
  { deliverable: "Inbound Data Contract", purpose: "Define Roger / DCT → GoSystem fields and business rules.", contents: "Source/target fields, data type, valid values, transformation, applicability, validation, owner, and open question.", source: "Roger, DCT, Taxonomy, IMS", action: "Complete exact source / target definitions and resolve critical TBDs.", status: "Draft", criteria: "No POC-critical fields remain undefined." },
  { deliverable: "Outbound Data Contract", purpose: "Define GoSystem → DCT / Roger returned results.", contents: "Minimum results, source, granularity, review purpose, and open questions.", source: "State / Process, IMS / GoSystem, DCT, Roger", action: "Confirm exact output fields, source, granularity, and review need.", status: "Draft", criteria: "Minimum returned review package is approved." },
  { deliverable: "Taxonomy Mapping Matrix", purpose: "Define governed mappings between business concepts and GoSystem.", contents: "Business concept, taxonomy ID, source/target field, mapping rule, valid values, variation, owner, status.", source: "Taxonomy Team / TDC master-data owners", action: "Identify reusable mappings and document new mapping gaps.", status: "Not Started", criteria: "POC mappings approved." },
  { deliverable: "Business Data Dictionary", purpose: "Define the business meaning of every POC data element.", contents: "Business term, definition, business rule, applicability level, and owner.", source: "State / Process SMEs, DCT, existing requirements", action: "Validate definitions and ownership.", status: "In Progress", criteria: "Every POC-required field has an agreed definition." },
  { deliverable: "Review Requirements", purpose: "Define what the practitioner must see in Roger to trust and validate the result.", contents: "Federal starting point, apportionment values, modifications, State taxable income, liability, and supporting detail.", source: "State / Process, Roger", action: "Confirm summary versus detailed display requirements and reconciliation needs.", status: "Not Started", criteria: "State / Process approves the review package." },
  { deliverable: "Decision / Open Question Log", purpose: "Track unresolved requirements and decisions.", contents: "Question, why it matters, owner, status, needed-by date, and final decision.", source: "All participating teams", action: "Maintain ownership and escalation for POC-blocking items.", status: "In Progress", criteria: "All POC-blocking decisions resolved." },
  { deliverable: "System Responsibility Matrix", purpose: "Clearly define ownership boundaries.", contents: "Roger, DCT, Taxonomy, IMS, GoSystem, State / Process, TDC / PDC, and QA responsibilities.", source: "Architecture, State, Roger, DCT, IMS", action: "Confirm each team accepts its responsibility boundary.", status: "Draft", criteria: "Ownership accepted by all teams." },
  { deliverable: "POC Acceptance Criteria", purpose: "Define objective proof of success.", contents: "Valid request; mapped inbound fields; successful transmission; expected GoSystem calculation; returned output; mapped return; correct correlation; Roger display; practitioner review and reconciliation.", source: "QA, PO, State, DCT, IMS", action: "Convert approved criteria into testable ADO acceptance criteria.", status: "Not Started", criteria: "Criteria are testable and accepted by QA / PO / State / DCT / IMS." },
];

const SOURCES = [
  { team: "State / Process SMEs", own: "Business rules, State calculation requirements, State-specific variations, and review expectations.", needs: "Minimum business inputs; calculation settings; required review outputs; exceptions; representative State scenario.", questions: "What does GoSystem need? What is required versus optional? What must the practitioner see? Which modification proves the POC?" },
  { team: "Taxonomy Team", own: "Governed business-to-system mappings.", needs: "Existing taxonomy IDs; mapping patterns; source-to-target structures; mapping gaps; State-specific rules.", questions: "Does this mapping exist? What taxonomy ID applies? What new mapping is needed?" },
  { team: "IMS / GoSystem SMEs", own: "Technical integration with GoSystem.", needs: "Mandatory inputs; existing GoSystem data; available outputs; APIs, reports, files; supported target fields and values.", questions: "Which fields are mandatory? What should not be resent? Which interface returns the required results?" },
  { team: "DCT Architecture / Engineering", own: "Governed persistence, identifiers, lineage, correlation, and deliverable relationships.", needs: "Existing source fields / structures; run model; Federal-to-State linkage; persistence requirements.", questions: "What already exists? Which ID is authoritative? How are request and response correlated?" },
  { team: "Roger Team", own: "Practitioner-facing workflow.", needs: "Existing captured fields; user-entered fields; display requirements; review / approval behavior.", questions: "Which State UI inputs exist? What needs to be added? What should return to the user?" },
  { team: "TDC / PDC Owners", own: "Existing governed and master data.", needs: "Reusable data; identifiers; master mappings; governed values.", questions: "Can this be reused? Which system is the source of truth?" },
  { team: "QA", own: "POC validation.", needs: "Representative test case; expected result; testable criteria; evidence requirements.", questions: "What scenario validates the full flow? Which expected values are needed?" },
] as const;

const INBOUND = [
  ["Client ID", "Client associated with State filing / calculation", "Roger / platform context", "GoSystem", "Yes", "Known Concept — Detail TBD", "Exact GoSystem client field?"],
  ["Tax Year", "Tax period for State calculation", "Roger / DCT", "GoSystem", "Yes", "Known Concept — Detail TBD", "Required GoSystem format?"],
  ["Entity ID", "Entity being calculated", "Roger / DCT", "GoSystem", "Yes", "Known Concept — Detail TBD", "Entity ID versus locator?"],
  ["State / Jurisdiction", "State jurisdiction for return", "Roger", "GoSystem", "Yes", "Known Concept — Detail TBD", "Which State is selected for the POC?"],
  ["Filing / Deliverable ID", "Specific filing / deliverable identifier", "Roger / DCT", "GoSystem or correlation layer", "Yes", "Known Concept — Detail TBD", "Does GoSystem store this or is it used only for correlation?"],
  ["Filing Designation", "Single, Combined, or Consolidated", "Roger / State", "GoSystem", "Yes", "Known Concept — Detail TBD", "Exact GoSystem target values?"],
  ["Tax Type", "Applicable State tax type", "Roger / State", "GoSystem", "Yes", "Known Concept — Detail TBD", "Which tax type is in the first POC?"],
  ["Federal Starting Point", "Federal taxable income basis for State calculation", "Federal / DCT or linked Federal deliverable", "GoSystem", "Yes", "Decision Required", "Before or after NOL? Pass value or reference deliverable?"],
  ["Apportionment Method", "Method used for State apportionment", "Roger / State", "GoSystem", "Yes", "Known Concept — Detail TBD", "Which method applies to the POC State?"],
  ["Apportionment Weighting", "Weighting applied where required", "Roger / State", "GoSystem", "If applicable", "Known Concept — Detail TBD", "Required for selected State?"],
  ["Property", "Property apportionment input", "Roger / PBC", "GoSystem", "Yes", "Known Concept — Detail TBD", "Numerator and denominator separate?"],
  ["Payroll", "Payroll apportionment input", "Roger / PBC", "GoSystem", "Yes", "Known Concept — Detail TBD", "Numerator and denominator separate?"],
  ["Sales", "Sales apportionment input", "Roger / PBC", "GoSystem", "Yes", "Known Concept — Detail TBD", "Numerator and denominator separate?"],
  ["Representative State Modification", "One addition or subtraction used to prove mapping", "Roger / DCT / State workflow", "GoSystem", "Yes — one example", "Decision Required", "State tax addback, depreciation, or another modification?"],
  ["Taxonomy / Mapping ID", "Governed mapping identifier", "Taxonomy / TDC", "Integration / GoSystem", "Where applicable", "Known Concept — Detail TBD", "Which mappings already exist?"],
  ["Correlation / Run ID", "Links inbound request to outbound result", "DCT / integration layer", "IMS / GoSystem / DCT", "Yes", "Known Concept — Detail TBD", "Which system generates the authoritative ID?"],
] as const;

const OUTBOUND = [
  ["Federal Starting Point Used", "Yes", "Filing / Entity", "Confirm correct Federal basis", "Known Concept — Detail TBD", "Can GoSystem return the actual starting value used?"],
  ["Apportionment Numerator", "Likely", "State / Entity / Factor", "Calculation transparency", "Known Concept — Detail TBD", "Which factor components are available?"],
  ["Apportionment Denominator", "Likely", "State / Entity / Factor", "Calculation transparency", "Known Concept — Detail TBD", "Which factor components are available?"],
  ["Apportionment %", "Yes", "State / Filing", "Core calculated output", "Known Concept — Detail TBD", "Is final percentage enough by itself?"],
  ["Weighted Apportionment %", "TBD", "State / Filing", "Review weighting", "Decision Required", "Needed for selected POC State?"],
  ["State Additions", "Yes", "State / Entity / Filing", "Reconcile Federal to State TI", "Known Concept — Detail TBD", "Individual modifications or aggregate amount?"],
  ["State Subtractions", "Yes", "State / Entity / Filing", "Reconcile Federal to State TI", "Known Concept — Detail TBD", "Individual modifications or aggregate amount?"],
  ["State Taxable Income", "Yes", "State / Filing", "Core POC output", "Known Concept — Detail TBD", "Which GoSystem field / report supplies it?"],
  ["State Liability", "Yes", "State / Filing", "Core State tax result", "Known Concept — Detail TBD", "What supporting components must return?"],
  ["State Accrual", "TBD", "State / Filing", "Potential review output", "Decision Required", "Is this initial POC scope?"],
  ["NOL Result", "No / TBD", "State / Entity / Filing", "Future-state candidate", "Future-State", "Needed for initial POC?"],
  ["Credit Result", "No / TBD", "State / Entity / Filing", "Future-state candidate", "Future-State", "Needed for initial POC?"],
] as const;

const DECISIONS = [
  ["Which State and filing scenario will be used for the first POC?", "PO / State"],
  ["Is the State Federal starting point Federal TI before or after NOL?", "State / Process"],
  ["Should the Federal starting value be passed directly or referenced through the associated Federal deliverable?", "DCT / State / Architecture"],
  ["How will the State deliverable identify the correct Federal deliverable when multiple deliverables exist?", "DCT Architecture"],
  ["Which filing / configuration values already exist or roll forward in GoSystem?", "IMS / GoSystem"],
  ["What exact fields are mandatory for GoSystem to execute the representative calculation?", "IMS / GoSystem + State"],
  ["Which GoSystem API, report, or file will provide outbound POC results?", "IMS / GoSystem"],
  ["Do additions and subtractions return individually or may they be aggregated?", "State / Process"],
  ["Is final apportionment percentage sufficient, or are factor details required?", "State / Process"],
  ["Which State modification proves the mapping?", "State / Process"],
  ["Are NOLs or credits required for the initial POC?", "PO / State"],
  ["Which taxonomy IDs and mapping patterns can be reused?", "Taxonomy"],
] as const;

function Chip({ status }: { status: Status }) {
  const s = STATUS[status];
  return <span style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "999px", color: s.text, display: "inline-block", fontSize: "9px", fontWeight: 800, lineHeight: "1.2", padding: "4px 7px", whiteSpace: "nowrap" }}>{status}</span>;
}

function Heading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return <div style={{ borderLeft: `4px solid ${C.teal}`, marginBottom: "14px", paddingLeft: "12px" }}><div style={{ color: C.teal, fontSize: "10px", fontWeight: 850, letterSpacing: ".08em", textTransform: "uppercase" }}>{eyebrow}</div><h2 style={{ color: C.navy, fontSize: "18px", margin: "3px 0" }}>{title}</h2>{subtitle && <p style={{ color: C.gray, fontSize: "11px", lineHeight: "1.5", margin: 0 }}>{subtitle}</p>}</div>;
}

function MatrixTable({ columns, rows }: { columns: string[]; rows: readonly (readonly string[])[] }) {
  return <div style={{ overflowX: "auto" }}><table style={{ borderCollapse: "collapse", fontSize: "10px", minWidth: "1020px", width: "100%" }}><thead><tr style={{ background: C.navy }}>{columns.map(column => <th key={column} style={{ color: "#ffffff", fontWeight: 800, padding: "10px", textAlign: "left" }}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row[0]} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>{row.map((cell, cellIndex) => <td key={`${row[0]}-${cellIndex}`} style={{ color: cellIndex === 0 ? C.navy : "#334155", fontWeight: cellIndex === 0 ? 750 : 400, lineHeight: "1.45", padding: "10px", verticalAlign: "top" }}>{cellIndex === columns.indexOf("Current Status") ? <Chip status={cell as Status} /> : cell}</td>)}</tr>)}</tbody></table></div>;
}

export default function StatePocBaDiscoveryPackage() {
  const [copied, setCopied] = useState(false);
  const copySummary = async () => { await navigator.clipboard?.writeText("POC BA Discovery & Mapping Package\nObjective: translate State requirements into a testable inbound and outbound contract for Taxonomy, DCT, IMS, Roger, and GoSystem.\nPrimary question: identify the smallest representative State calculation input set and minimum returned review package."); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <section id="poc-ba-discovery-package" style={{ margin: "26px 0 30px" }}>
    <div style={{ background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "12px", boxShadow: "0 2px 10px rgba(15,23,42,.06)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(110deg,#0f1623,#1e3a5f,#0369a1)", padding: "20px 22px" }}><div style={{ alignItems: "flex-start", display: "flex", gap: "16px", justifyContent: "space-between" }}><div><div style={{ color: "#bae6fd", fontSize: "10px", fontWeight: 850, letterSpacing: ".09em", textTransform: "uppercase" }}>State POC working requirements layer</div><h1 style={{ color: "#ffffff", fontSize: "21px", margin: "4px 0" }}>POC BA Discovery &amp; Mapping Package</h1><p style={{ color: "#dbeafe", fontSize: "12px", lineHeight: "1.55", margin: "7px 0 0", maxWidth: "980px" }}>Visual/reference layer for the Roger → GoSystem State POC. The Excel working template remains the field-level artifact for detailed mapping, decisions, ownership, and status.</p></div><button type="button" onClick={copySummary} style={{ background: "#ffffff", border: "1px solid #bae6fd", borderRadius: "6px", color: C.navy, cursor: "pointer", fontSize: "10px", fontWeight: 800, padding: "7px 9px", whiteSpace: "nowrap" }}>{copied ? "Copied" : "Copy BA package summary"}</button></div></div>
      <div style={{ padding: "20px" }}>
        <Heading eyebrow="1 · BA objective" title="Translate requirements into a testable contract" subtitle="The BA is the connector across source teams; each source team validates its own business rules, mappings, interfaces, and technical constraints." />
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "12px", lineHeight: "1.55", marginBottom: "12px", padding: "13px 15px" }}>The BA objective for the Roger → GoSystem POC is to translate State business requirements into a clear, testable inbound and outbound data contract that Taxonomy, DCT, IMS, Roger, and GoSystem teams can implement and validate.</div>
        <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "9px", color: "#312e81", fontSize: "12px", fontWeight: 800, lineHeight: "1.55", marginBottom: "14px", padding: "13px 15px" }}>“What is the smallest set of business inputs GoSystem must receive to successfully calculate one representative State return scenario, and what minimum results must come back for the practitioner to validate that calculation?”</div>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "9px", color: "#166534", fontSize: "11px", lineHeight: "1.55", marginBottom: "24px", padding: "12px 14px" }}><strong>The BA is not expected to know the technical mappings in advance.</strong> The BA structures discovery, identifies the correct source / owner, documents business meaning, captures decisions and gaps, and converts approved requirements into implementable stories and acceptance criteria.</div>
        <Heading eyebrow="2 · BA deliverables" title="BA Deliverables for the POC" subtitle="Each row is a discovery work product. Expand the table horizontally to review the primary source, action, and completion test." />
        <div style={{ marginBottom: "24px" }}><MatrixTable columns={["Deliverable", "Purpose", "What It Contains", "Primary Source", "BA Action", "Status", "Completion Criteria"]} rows={DELIVERABLES.map(row => [row.deliverable, row.purpose, row.contents, row.source, row.action, row.status, row.criteria])} /></div>
        <Heading eyebrow="3 · sources and responsibilities" title="Where the BA Gets the Requirements" subtitle="Use these ownership boundaries to route discovery questions without asking the BA to infer a team’s answer." />
        <div style={{ marginBottom: "24px" }}><MatrixTable columns={["Team / Role", "What They Own", "What the BA Needs", "Example Questions"]} rows={SOURCES.map(row => [row.team, row.own, row.needs, row.questions])} /></div>
        <Heading eyebrow="4 · prepopulated mapping" title="Inbound Mapping — Current Known Candidate Fields" subtitle="Known concepts are prepopulated for working sessions; exact GoSystem fields and transformations remain TBD until validated by source owners." />
        <details open style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "9px", marginBottom: "14px", overflow: "hidden" }}><summary style={{ color: C.navy, cursor: "pointer", fontSize: "11px", fontWeight: 800, padding: "11px 13px" }}>Open inbound candidate mapping ({INBOUND.length} fields)</summary><MatrixTable columns={["Business Concept", "Business Definition", "Source System", "Target System", "Required for POC?", "Current Status", "Open Question"]} rows={INBOUND} /></details>
        <Heading eyebrow="5 · prepopulated mapping" title="Outbound Mapping — Current Candidate Results" subtitle="The review package must be confirmed by State / Process, Roger, IMS / GoSystem, and DCT before it becomes the outbound POC contract." />
        <details open style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "9px", marginBottom: "24px", overflow: "hidden" }}><summary style={{ color: C.navy, cursor: "pointer", fontSize: "11px", fontWeight: 800, padding: "11px 13px" }}>Open outbound candidate mapping ({OUTBOUND.length} results)</summary><MatrixTable columns={["Returned Business Concept", "Required for POC?", "Granularity", "Review Purpose", "Current Status", "Open Question"]} rows={OUTBOUND} /></details>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", marginBottom: "24px" }}>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "15px" }}><Heading eyebrow="6 · decisions" title="Decision / Open Question Log" subtitle="All listed decisions are currently in progress; dates and final decisions are maintained in the working spreadsheet." /><ol style={{ margin: 0, paddingLeft: "18px" }}>{DECISIONS.map(([question, owner]) => <li key={question} style={{ color: "#7c2d12", fontSize: "10px", lineHeight: "1.45", marginBottom: "8px" }}><strong>{question}</strong><br /><span style={{ color: C.orange }}>Owner: {owner}</span> · <Chip status="Decision Required" /></li>)}</ol></div>
          <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "15px" }}><Heading eyebrow="7 · system responsibilities" title="System Responsibility Matrix" subtitle="Draft ownership boundaries to validate with all participating teams." /><div style={{ display: "grid", gap: "8px" }}>{[["Roger", "Practitioner experience"], ["DCT", "Governed data, persistence, retrieval, and correlation"], ["Taxonomy", "Business-to-system mapping"], ["IMS", "Technical GoSystem integration"], ["GoSystem", "State tax calculation engine"], ["State / Process", "Business rules and review requirements"], ["TDC / PDC", "Existing governed / master data where applicable"], ["QA", "POC validation"]].map(([team, responsibility]) => <div key={team} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${C.teal}`, borderRadius: "6px", padding: "8px 10px" }}><strong style={{ color: C.navy, fontSize: "10px" }}>{team}</strong><span style={{ color: C.gray, fontSize: "10px" }}> = {responsibility}</span></div>)}</div></div>
        </div>
        <Heading eyebrow="8 · BA discovery flow" title="BA Discovery → POC-Ready Requirements" subtitle="A simple collaboration flow that moves validated source information into implementable, testable POC requirements." />
        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", marginBottom: "14px", padding: "15px" }}><div style={{ display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center" }}>{["State / Process Requirements", "Roger Existing Inputs", "DCT Existing Data", "Taxonomy Existing Mappings", "IMS / GoSystem Interface Details", "BA Discovery & Requirements Analysis", "Minimum POC Input Package", "Inbound Mapping Contract", "GoSystem POC Execution", "Outbound Mapping Contract", "Roger Review Requirements", "ADO Stories + Acceptance Criteria + POC Readiness"].map((step, index) => <Fragment key={step}><div style={{ background: index < 5 ? "#ffffff" : index < 9 ? "#eff6ff" : "#ecfdf5", border: `1px solid ${index < 5 ? "#cbd5e1" : index < 9 ? "#93c5fd" : "#86efac"}`, borderRadius: "7px", color: C.navy, fontSize: "10px", fontWeight: 750, maxWidth: "180px", padding: "8px 9px", textAlign: "center" }}>{step}</div>{index === 4 || index === 5 || index === 6 || index === 7 || index === 8 || index === 9 || index === 10 ? <span style={{ alignSelf: "center", color: C.teal, fontWeight: 900 }}>→</span> : index < 4 ? <span style={{ alignSelf: "center", color: C.gray, fontWeight: 900 }}>+</span> : null}</Fragment>)}</div></div>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "11px", lineHeight: "1.5", marginBottom: "24px", padding: "11px 13px" }}>The BA serves as the connector across these teams, but the source teams remain responsible for validating their respective business rules, mappings, interfaces, and technical constraints.</div>
        <Heading eyebrow="9 · status legend" title="Visual Status Legend" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>{(["Known / Confirmed", "Known Concept — Detail TBD", "Decision Required", "Blocking Dependency", "Future-State"] as Status[]).map(status => <Chip key={status} status={status} />)}</div>
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "15px" }}><Heading eyebrow="Working Mapping Artifact" title="Roger_GoSystem_POC_BA_Mapping_Template.xlsx" subtitle="Source workbook supplied for the POC. It includes the POC overview, inbound and outbound mapping tabs, responsibilities, decision log, and BA deliverables; use it as the field-level working artifact for discovery and mapping sessions." /><div style={{ alignItems: "center", background: "#ffffff", border: "1px dashed #0284c7", borderRadius: "8px", color: C.teal, display: "flex", fontSize: "11px", fontWeight: 800, gap: "10px", justifyContent: "space-between", padding: "11px 12px" }}><div><div>Linked source workbook</div><div style={{ color: C.gray, fontSize: "10px", fontWeight: 600, marginTop: "3px" }}>Roger_GoSystem_POC_BA_Mapping_Template.xlsx</div></div><a href={BA_MAPPING_WORKBOOK_URL} target="_blank" rel="noopener noreferrer" style={{ background: C.teal, borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 9px", textDecoration: "none", whiteSpace: "nowrap" }}>Open workbook ↗</a></div></div>
      </div>
    </div>
  </section>;
}

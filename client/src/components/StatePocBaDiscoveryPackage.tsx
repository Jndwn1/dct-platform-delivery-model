import { useState } from "react";
import ExecutiveProcessFlow, { type ExecutiveFlowStep } from "@/components/ExecutiveProcessFlow";

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

const WORKING_SESSION_AGENDA = [
  [
    "1. Confirm target business process and initial apportionment scope",
    "Set the representative State business scenario and the initial apportionment proof point for the POC.",
    "State Business SMEs; Roger State team",
    "POC Scope Statement",
    "Selected State, entity / filing scenario, apportionment method, and in-scope outcome are not yet confirmed.",
    "Confirm scope, exclusions, and the one calculation / review scenario the POC must prove.",
  ],
  [
    "2. Review the three inbound / outbound data movements",
    "Walk each pattern separately so owners can identify mapping, routing, and data-shape differences.",
    "Roger State team; IMS input on complexities",
    "Inbound and Outbound Data Contracts",
    "The three movement-specific mapping materials and direction-specific contract views have not yet been confirmed.",
    "Agree the three movement boundaries, owner for each mapping, and the questions that require IMS or GoSystem confirmation.",
  ],
  [
    "3. Confirm required data elements and granularity",
    "Identify the minimum business data, metadata, and level of detail needed for each movement and the representative State calculation.",
    "State Process; TDC Taxonomy; Process Mapping; IMS key metadata for routing / calculations",
    "Minimum POC Input Package; Business Data Dictionary",
    "Exact GoSystem-required fields, formats, routing / calculation metadata, and granular prior-year data requirements remain unconfirmed.",
    "Confirm required versus optional data elements and granularity. Use Tech Story 1433863: Define Data Type & Validation Standards for TDC → IMS → GoSystem Translation to document the standards work; completion is not assumed.",
  ],
  [
    "4. Align TDC taxonomy and GoSystem mappings",
    "Compare existing taxonomy and Process mappings to the GoSystem target requirements and identify reuse versus new mapping work.",
    "State Process (Krista); TDC (Gary); Process Mapping (Bryce, Dhaval)",
    "Taxonomy Mapping Matrix",
    "Current taxonomy status, Process mapping status, reusable identifiers, and GoSystem target mapping are not yet reconciled.",
    "Confirm mapping source of truth, reusable mappings, new mapping gaps, and accountable owners.",
  ],
  [
    "5. Resolve totals, overrides, and transmission patterns",
    "Establish how totals, practitioner overrides, and approved data packages are handled across the three movements.",
    "State Business SMEs; IMS; Roger State team",
    "Decision / Open Question Log; Review Requirements",
    "Totals treatment, override authority, transmission patterns, correlation, validation, and error handling remain open.",
    "Record decisions, owners, dependencies, and POC-blocking escalation points.",
  ],
  [
    "6. Define next steps, owners, dependencies, and outcome timing",
    "Convert working-session decisions and gaps into sequenced follow-up work without asserting commitments not yet confirmed.",
    "Roger State team; participating teams",
    "POC Acceptance Criteria; System Responsibility Matrix",
    "Named owners, dependency sequence, dates, and validation evidence are not yet confirmed.",
    "Publish a confirmed action list, ownership model, dependencies, and working-session outcomes.",
  ],
] as const;

const DATA_MOVEMENT_ROWS = [
  [
    "1. Prior-year property-detail ingestion",
    "GoSystem-origin prior-year property detail into the receiving Roger / TDC workflow through the applicable integration path.",
    "Availability, granular detail, correct locator, rollover behavior, source format, and receiving-system ownership.",
    "Proposed discussion framing — direction and interface are Pending Confirmation.",
  ],
  [
    "2. State apportionment-detail export",
    "Roger / TDC State apportionment detail to IMS for the GoSystem-facing package.",
    "Minimum field set, entity / jurisdiction granularity, taxonomy mapping, data types, validation standards, and routing metadata.",
    "Proposed discussion framing — payload, format, and transmission pattern are Pending Confirmation.",
  ],
  [
    "3. GoSystem calculated-value ingestion / return",
    "GoSystem-calculated values through IMS and TDC for Roger practitioner review.",
    "Returned-result fields, correlation, totals, calculation transparency, errors, reconciliation, and display requirements.",
    "Proposed discussion framing — returned-result contract and end-to-end validation are Pending Confirmation.",
  ],
] as const;

const WORKING_SESSION_GAPS = [
  [
    "Exact GoSystem data movement inventory",
    "Confirm the exact data to be pulled from, imported into, and exported from GoSystem.",
    "No approved field-level inventory or interface specification is attached to the POC package.",
    "Roger State team with Krista / Spencer; GoSystem / IMS input",
  ],
  [
    "Three distinct mapping materials",
    "Separate working materials for each data movement so field, transformation, and ownership differences are visible.",
    "The current package has candidate inbound / outbound mappings but not three confirmed movement-specific mapping sets.",
    "Roger State team to share; IMS to explain the distinction",
  ],
  [
    "Taxonomy and Process mapping status",
    "Obtain the current State taxonomy status and Process-team mapping status.",
    "No confirmed source-of-truth status, reuse decision, or mapped target set is recorded here.",
    "Ranini with Krista",
  ],
  [
    "Initial IMS-usable data subset",
    "Identify the smallest State data-point subset IMS can route for the representative POC.",
    "The candidate field list is not yet reduced to an IMS-confirmed minimum set.",
    "Krista; Bryce / Dhaval; Rod / Cass",
  ],
  [
    "Prior-year data behavior",
    "Confirm prior-year data availability, granular detail, rollover behavior, and the correct locator.",
    "Availability, source location, grain, and roll-forward rules remain unconfirmed.",
    "IMS; State Process inputs",
  ],
] as const;
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

const BA_DISCOVERY_FLOW_STEPS: readonly ExecutiveFlowStep[] = [
  { label: "1 · Collect evidence", title: "Source-team inputs", detail: "State / Process, Roger, DCT, Taxonomy, and IMS / GoSystem provide their owned requirements and constraints.", accent: C.gray, surface: "#f8fafc" },
  { label: "2 · Structure the work", title: "BA discovery", detail: "Organize business meaning, questions, dependencies, and decisions without inferring technical answers.", accent: C.teal, surface: "#f0f9ff" },
  { label: "3 · Define the minimum", title: "POC contract", detail: "Confirm the smallest inbound package, outbound review results, mappings, and correlation needed to prove one scenario.", accent: "#2563eb", surface: "#eff6ff" },
  { label: "4 · Prove the path", title: "IMS / GoSystem POC", detail: "Test the governed transmission, representative calculation, returned results, and reconciliation evidence.", accent: C.purple, surface: "#faf5ff" },
  { label: "5 · Ready delivery", title: "ADO-ready requirements", detail: "Capture approved decisions in stories and acceptance criteria with POC readiness evidence and accountable owners.", accent: C.green, surface: "#ecfdf5" },
];

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
        <Heading eyebrow="2 · working-session agenda" title="State Data-Movement Working Session — Agenda & Readiness Gaps" subtitle="A two-part, five-function cross-functional session to align the State apportionment data that must move between Roger / TDC, IMS, and GoSystem. This table records discussion goals and gaps; it does not establish approved interfaces, schemas, or commitments." />
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "11px", lineHeight: "1.55", marginBottom: "14px", padding: "12px 14px" }}><strong>Standards work item:</strong> <strong>Tech Story 1433863 — Define Data Type &amp; Validation Standards for TDC → IMS → GoSystem Translation</strong> supports the required-data-elements discussion. The story is a planning and definition activity; completion or an approved interface contract is not assumed.</div>
        <div style={{ marginBottom: "24px" }}><MatrixTable columns={["Agenda Item", "Working-Session Objective", "Primary Participants", "Existing POC Work Product", "Gap to Resolve", "Required Outcome"]} rows={WORKING_SESSION_AGENDA} /></div>
        <Heading eyebrow="2A · data movement register" title="Three Data Movements to Separate for Review" subtitle="These are working-session discussion paths based on the supplied agenda. Each direction, interface, and handoff remains subject to confirmation by the accountable teams." />
        <div style={{ marginBottom: "24px" }}><MatrixTable columns={["Data Movement", "Proposed Discussion Path", "Topics to Confirm", "Current Boundary"]} rows={DATA_MOVEMENT_ROWS} /></div>
        <Heading eyebrow="2B · readiness gaps" title="Pre-Session Inputs and Gaps to Close" subtitle="Use this register to obtain the materials needed to make the two sessions decision-ready. Gaps are not defects; they are unconfirmed inputs that require accountable-team confirmation." />
        <div style={{ marginBottom: "24px" }}><MatrixTable columns={["Readiness Item", "What Is Needed", "Current Gap", "Proposed Source / Owner"]} rows={WORKING_SESSION_GAPS} /></div>
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
        <div style={{ marginBottom: "14px" }}><ExecutiveProcessFlow ariaLabel="BA discovery to POC-ready requirements executive process flow" steps={BA_DISCOVERY_FLOW_STEPS} supportNote="The BA connects the work across source teams, while each source team remains responsible for validating its business rules, mappings, interfaces, and technical constraints." outcome="A minimum POC package and validated inbound / outbound contracts can be converted into implementable, testable ADO requirements." /></div>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "5px solid #2563eb", borderRadius: "9px", color: "#1e3a5f", fontSize: "11px", lineHeight: "1.5", marginBottom: "24px", padding: "11px 13px" }}>The BA serves as the connector across these teams, but the source teams remain responsible for validating their respective business rules, mappings, interfaces, and technical constraints.</div>
        <Heading eyebrow="9 · status legend" title="Visual Status Legend" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>{(["Known / Confirmed", "Known Concept — Detail TBD", "Decision Required", "Blocking Dependency", "Future-State"] as Status[]).map(status => <Chip key={status} status={status} />)}</div>
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "15px" }}><Heading eyebrow="Working Mapping Artifact" title="Roger_GoSystem_POC_BA_Mapping_Template.xlsx" subtitle="Source workbook supplied for the POC. It includes the POC overview, inbound and outbound mapping tabs, responsibilities, decision log, and BA deliverables; use it as the field-level working artifact for discovery and mapping sessions." /><div style={{ alignItems: "center", background: "#ffffff", border: "1px dashed #0284c7", borderRadius: "8px", color: C.teal, display: "flex", fontSize: "11px", fontWeight: 800, gap: "10px", justifyContent: "space-between", padding: "11px 12px" }}><div><div>Linked source workbook</div><div style={{ color: C.gray, fontSize: "10px", fontWeight: 600, marginTop: "3px" }}>Roger_GoSystem_POC_BA_Mapping_Template.xlsx</div></div><a href={BA_MAPPING_WORKBOOK_URL} target="_blank" rel="noopener noreferrer" style={{ background: C.teal, borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 9px", textDecoration: "none", whiteSpace: "nowrap" }}>Open workbook ↗</a></div></div>
      </div>
    </div>
  </section>;
}

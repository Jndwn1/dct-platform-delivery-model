import { useState } from "react";
import ExecutiveProcessFlow, {
  type ExecutiveFlowStep,
} from "@/components/ExecutiveProcessFlow";

const C = {
  navy: "#0f1623",
  blue: "#1e3a5f",
  teal: "#0369a1",
  green: "#047857",
  purple: "#7c3aed",
  slate: "#475569",
};
const POC_TRANSCRIPT_SOURCE_URL = "/manus-storage/POC_6327d700.docx";

const TARGET_ARCHITECTURE_STEPS: readonly ExecutiveFlowStep[] = [
  {
    label: "1 · State data collection",
    title: "Roger UI",
    detail:
      "Tax Portal source files, mapped State inputs, and practitioner review are organized by entity, jurisdiction, and applicable factor category.",
    accent: "#0f766e",
    surface: "#f0fdfa",
  },
  {
    label: "2 · Govern and correlate",
    title: "DCT / TDC",
    detail:
      "Governed State data, relationships, approved information, calculation requests, and returned-result correlation are managed through the agreed data path.",
    accent: "#2563eb",
    surface: "#eff6ff",
  },
  {
    label: "3 · Translate and transmit",
    title: "IMS",
    detail:
      "The proposed integration boundary receives the agreed package, applies confirmed mappings and formats, transmits to GoSystem, and handles agreed responses or errors.",
    accent: C.purple,
    surface: "#faf5ff",
  },
  {
    label: "4 · Calculate",
    title: "GoSystem",
    detail:
      "The proposed calculation engine receives translated inputs, performs applicable State calculations, and returns structured results or processing errors to IMS.",
    accent: "#b45309",
    surface: "#fffbeb",
  },
  {
    label: "5 · Return and review",
    title: "IMS → DCT / TDC → Roger UI",
    detail:
      "IMS translates the response, DCT/TDC correlates it to the request, and Roger presents returned results for practitioner reconciliation, review, and approval.",
    accent: C.teal,
    surface: "#f0f9ff",
  },
];

const DEMONSTRATION_ROWS = [
  [
    "1",
    "Roger State Data Collection",
    "Demonstrated",
    "Tax Portal-to-Roger data ingestion, source mapping, factor inputs, practitioner confirmation, and reconciliation functionality were demonstrated.",
  ],
  [
    "2",
    "DCT/TDC State Data Governance",
    "Partially Demonstrated",
    "Structured State inputs and approved mappings were shown. Complete end-to-end data-package governance and integration handoff were not established by the demonstration evidence.",
  ],
  [
    "3",
    "IMS Translation and Transmission",
    "Not Demonstrated",
    "No confirmed demonstration of translating State data and transmitting it from IMS to GoSystem.",
  ],
  [
    "4",
    "GoSystem State Calculations",
    "Not Demonstrated",
    "No confirmed execution of State tax calculations within GoSystem was shown.",
  ],
  [
    "5",
    "Returned Calculation Results in Roger",
    "Not Demonstrated",
    "Roger reconciliation functionality was shown, but not the receipt and display of returned GoSystem calculation results.",
  ],
] as const;

const CAPABILITY_AREAS = [
  {
    title: "Tax Portal and Roger Integration",
    accent: "#0f766e",
    items: [
      "A connected Tax Portal-to-Roger workflow was demonstrated.",
      "Uploaded source data was associated with the applicable filing context.",
      "Source data could be extracted and mapped to Roger target fields.",
      "Practitioners could review and adjust proposed source mappings.",
      "Approved mappings supported organization of State inputs by jurisdiction and factor category.",
    ],
  },
  {
    title: "State Input Processing",
    accent: "#2563eb",
    items: [
      "State apportionment inputs for property, payroll, sales, and payments were demonstrated.",
      "Mapping across varied client file structures was supported.",
      "Practitioner confirmation of proposed mappings was demonstrated.",
      "Deterministic processing with AI assistance was illustrated where source structures or aggregations were more complex.",
    ],
  },
  {
    title: "Reconciliation",
    accent: C.purple,
    items: [
      "Calculated totals were reconciled against check figures.",
      "Comparisons could use Federal groupings, selected accounts, or user-provided values.",
      "Differences and percentage variances were displayed, including the existing greater-than-5% review threshold.",
      "Reconciliation identified differences for practitioner review without automatically changing working values.",
    ],
  },
  {
    title: "Complex Data Handling",
    accent: "#b45309",
    items: [
      "Complex property-data patterns were processed.",
      "Scenarios included multiple tabs, current-year and prior-year data, and aggregated values.",
      "Additional validation was identified as needed for certain extracted aggregation patterns.",
    ],
  },
] as const;

const RESPONSIBILITY_ROWS = [
  [
    "Data Intake",
    "Receive the structured State integration payload.",
    "Accept the translated State data.",
  ],
  [
    "Field Mapping",
    "Translate TDC input fields into the required GoSystem structure.",
    "Interpret the received fields according to its supported tax software contract.",
  ],
  [
    "Data Formatting",
    "Apply agreed date, boolean, numeric, text, and null transformations.",
    "Confirm supported field formats and constraints.",
  ],
  [
    "Data Validation",
    "Apply validation assigned to IMS under the integration contract.",
    "Apply applicable GoSystem tax software validation.",
  ],
  [
    "Calculations",
    "Transport data; does not own State tax calculations.",
    "Perform applicable State tax calculations.",
  ],
  [
    "Results",
    "Receive, translate, and return calculation outputs.",
    "Generate calculation results or error responses.",
  ],
  [
    "Error Handling",
    "Return integration and translation errors through the agreed interface.",
    "Return applicable processing and calculation errors.",
  ],
] as const;

const DEPENDENCY_ROWS = [
  [
    "Interface Contract",
    "Confirm the approved request/response interfaces, schemas, and payload structures.",
    "TDC needs the contract to construct and correlate integration data packages.",
  ],
  [
    "Field Mapping",
    "Identify which TDC State inputs map to which IMS/GoSystem fields.",
    "TDC must expose the required State attributes.",
  ],
  [
    "Date Format",
    "Confirm field-specific date formats such as MM/YYYY or MM/DD/YYYY.",
    "Determines required formatting and transformation behavior.",
  ],
  [
    "Boolean Format",
    "Confirm checkbox representations such as X, true/false, or 1/0.",
    "Supports accurate downstream translation.",
  ],
  [
    "Text Length",
    "Confirm maximum lengths and which system handles truncation.",
    "Determines validation and error-handling rules.",
  ],
  [
    "Text Formatting",
    "Confirm allowed characters, narrative formatting, and line-break support.",
    "Prevents transmission or translation failures.",
  ],
  [
    "Percentage Format",
    "Confirm percentage representation and supported decimal precision.",
    "Ensures percentage values retain their intended meaning.",
  ],
  [
    "Monetary Values",
    "Confirm rounding, precision, and whether cents are supported.",
    "Defines numeric conversion rules.",
  ],
  [
    "Null Handling",
    "Confirm how missing, blank, null, and zero values are interpreted.",
    "Prevents loss or misinterpretation of information.",
  ],
  [
    "Validation Ownership",
    "Confirm which checks are performed by TDC, IMS, and GoSystem.",
    "Prevents conflicting or duplicated validation logic.",
  ],
  [
    "Error Handling",
    "Confirm rejected-data responses, warnings, retry behavior, and failed transactions.",
    "Supports defined integration error handling and recovery.",
  ],
  [
    "Results Contract",
    "Confirm how GoSystem calculation outputs and errors are returned and identified.",
    "Enables correlation, persistence, and practitioner review.",
  ],
  [
    "POC Scope",
    "Confirm the representative State scenario, tax period, fields, and calculation outputs.",
    "Limits integration implementation to the approved proof-of-feasibility scope.",
  ],
] as const;

const VALIDATION_ROWS = [
  [
    "Confirm that TDC can provide the approved representative State data package to IMS.",
    "TDC / IMS",
    "No end-to-end confirmation supplied",
    "Approved representative package and interface",
    "Confirm package handoff approach",
  ],
  [
    "Demonstrate IMS mapping and translation of that package.",
    "IMS / TDC",
    "Not demonstrated in October 9 session",
    "Confirmed mapping and transformation rules",
    "Confirm translation design",
  ],
  [
    "Demonstrate successful transmission from IMS to GoSystem.",
    "IMS / GoSystem",
    "Not demonstrated in October 9 session",
    "Approved interface and connectivity",
    "Execute transmission test",
  ],
  [
    "Confirm that GoSystem can consume the data and execute the applicable State calculation.",
    "GoSystem / Tax SMEs",
    "Not demonstrated in October 9 session",
    "Supported calculation scenario and GoSystem contract",
    "Execute calculation test",
  ],
  [
    "Demonstrate GoSystem returning structured results to IMS.",
    "IMS / GoSystem",
    "Not demonstrated in October 9 session",
    "Results and error-response contract",
    "Validate result response",
  ],
  [
    "Demonstrate the results returning through the agreed DCT/TDC integration path.",
    "IMS / TDC",
    "No round-trip evidence supplied",
    "Correlation and return-path design",
    "Validate return handoff",
  ],
  [
    "Confirm Roger can display the results for practitioner reconciliation, review, and approval.",
    "Roger UI / TDC / IMS",
    "Returned GoSystem results not demonstrated",
    "Returned result structure and correlation",
    "Validate Roger result presentation",
  ],
  [
    "Validate the expected behavior for invalid values, failed transmissions, and calculation errors.",
    "TDC / IMS / GoSystem",
    "No end-to-end error validation supplied",
    "Validation and error ownership",
    "Define and execute negative scenarios",
  ],
] as const;

const RISK_ROWS = [
  [
    "Unconfirmed IMS / GoSystem field and integration contracts",
    "May prevent a reliable, governed payload and response design.",
    "Confirm request, response, mapping, and error responsibilities before integration testing.",
    "IMS / GoSystem / TDC",
  ],
  [
    "Incomplete State input-to-downstream field mapping",
    "Required inputs may be unavailable, misunderstood, or mapped inconsistently.",
    "Finalize representative-scenario mapping through the agreed contract.",
    "TDC / IMS / Tax SMEs",
  ],
  [
    "Unvalidated calculation round trip",
    "Roger-side capability may not yet produce a usable calculated State result.",
    "Run an evidence-captured, representative end-to-end test.",
    "IMS / GoSystem / TDC / Roger UI",
  ],
  [
    "Data format or precision mismatch",
    "Values may be rejected, rounded, or interpreted incorrectly.",
    "Confirm examples for dates, booleans, text, percentages, monetary values, and nulls.",
    "IMS / GoSystem / TDC",
  ],
  [
    "Unconfirmed validation and error-recovery ownership",
    "Failures may not be detected, routed, or recoverable consistently.",
    "Assign validation, warning, retry, and rejection handling in the integration design.",
    "TDC / IMS / GoSystem",
  ],
  [
    "Portal multi-file and broader process-selection dependencies",
    "The broader State intake scenario may not be available when needed.",
    "Confirm enhancement scope and sequencing separately from the representative POC.",
    "State / Tax Portal",
  ],
  [
    "Complex State property-data extraction patterns",
    "Aggregations or source patterns may need further validation before use.",
    "Continue focused validation of identified complex patterns.",
    "State / Roger",
  ],
] as const;

const NEXT_ACTION_ROWS = [
  [
    "Confirm the IMS integration contract.",
    "IMS / TDC",
    "Agreed interface and transformation standards.",
  ],
  [
    "Confirm GoSystem field constraints and calculation requirements.",
    "GoSystem / Tax SMEs",
    "Supported field and calculation contract.",
  ],
  [
    "Finalize representative POC State scenario and outputs.",
    "State / Product / Tax SMEs",
    "Approved end-to-end test scenario.",
  ],
  [
    "Validate outbound State data payload.",
    "TDC / IMS",
    "Successful handoff and data translation.",
  ],
  [
    "Execute GoSystem calculation test.",
    "IMS / GoSystem",
    "Confirmed calculation execution.",
  ],
  [
    "Validate returned results in Roger.",
    "IMS / TDC / Roger UI",
    "End-to-end results displayed for practitioner review.",
  ],
  [
    "Complete Portal upload and process-selection enhancements.",
    "State / Tax Portal",
    "Support for the required broader State ingestion scenarios.",
  ],
] as const;

const FUTURE_PACKAGE = [
  {
    title: "Filing Footprint + Configuration",
    accent: C.teal,
    items: [
      "Client / tax year",
      "Filer and filing group",
      "Jurisdiction and filing designation",
      "Federal starting point",
      "Apportionment method and weighting",
      "State-specific options and approval status",
    ],
  },
  {
    title: "PBC Inputs",
    accent: C.blue,
    items: [
      "Property, payroll, and sales",
      "State / entity assignment",
      "Within / everywhere treatment",
      "Approved mapping and supporting detail",
      "Payments and applicable references",
    ],
  },
  {
    title: "Calculated or Rolled Values",
    accent: C.purple,
    items: [
      "State additions and subtractions",
      "Supported calculated or rolled amounts",
      "State attributes and carryforwards",
      "Source, authority, and approval context",
    ],
  },
] as const;

const FEDERAL_STATE_LINKAGE_STEPS: readonly ExecutiveFlowStep[] = [
  {
    label: "1 · Reusable input",
    title: "Shared source data",
    detail:
      "Original trial balance and source data may be reusable across deliverables.",
    accent: C.teal,
    surface: "#f0fdfa",
  },
  {
    label: "2 · Provision output",
    title: "Provision deliverable",
    detail:
      "Uses its own adjustments and calculated values for the Provision outcome.",
    accent: C.purple,
    surface: "#faf5ff",
  },
  {
    label: "3 · Federal output",
    title: "Federal deliverable",
    detail:
      "Provides the governed Federal result that may be required as the State starting context.",
    accent: "#2563eb",
    surface: "#eff6ff",
  },
  {
    label: "4 · State outcome",
    title: "State deliverable",
    detail:
      "References the correct Federal deliverable for the entity and tax year before State calculation and review.",
    accent: C.teal,
    surface: "#f0fdfa",
  },
];

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
  "The approved representative State package can be handed to IMS.",
  "IMS can map and transmit the package to GoSystem using confirmed contracts.",
  "GoSystem can execute the representative State calculation and return a structured response.",
  "The response can return through the agreed IMS and DCT/TDC path with correlation to the request.",
  "Roger can present returned results for practitioner review and reconciliation.",
  "Negative scenarios have defined handling for invalid data, transmission failure, and calculation errors.",
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        color: C.navy,
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 800,
        padding: "6px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "Copied" : "Copy POC summary"}
    </button>
  );
}

function PanelHeading({
  eyebrow,
  title,
  subtitle,
  accent = C.teal,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${accent}`,
        marginBottom: "14px",
        paddingLeft: "12px",
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          marginBottom: "4px",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <h3 style={{ color: C.navy, fontSize: "16px", margin: 0 }}>{title}</h3>
      {subtitle && (
        <p
          style={{
            color: C.slate,
            fontSize: "11px",
            lineHeight: "1.45",
            margin: "4px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "Demonstrated"
      ? { background: "#dcfce7", border: "#86efac", color: "#166534" }
      : status === "Partially Demonstrated"
        ? { background: "#fef3c7", border: "#fcd34d", color: "#92400e" }
        : { background: "#f1f5f9", border: "#cbd5e1", color: C.slate };
  return (
    <span
      style={{
        background: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: "999px",
        color: styles.color,
        display: "inline-flex",
        fontSize: "10px",
        fontWeight: 850,
        lineHeight: 1.25,
        padding: "4px 7px",
      }}
    >
      {status}
    </span>
  );
}

function DataTable({
  columns,
  rows,
  minWidth = "900px",
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  minWidth?: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth, width: "100%" }}>
        <thead>
          <tr
            style={{
              background: "#1e293b",
              color: "#ffffff",
              textAlign: "left",
            }}
          >
            {columns.map(column => (
              <th
                key={column}
                style={{
                  fontSize: "9px",
                  fontWeight: 850,
                  letterSpacing: "0.055em",
                  padding: "10px 11px",
                  textTransform: "uppercase",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row[0]}
              style={{
                background: index % 2 ? "#ffffff" : "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                verticalAlign: "top",
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${row[0]}-${cellIndex}`}
                  style={{
                    color: cellIndex === 0 ? C.navy : C.slate,
                    fontSize: "10px",
                    fontWeight: cellIndex === 0 ? 800 : 500,
                    lineHeight: 1.45,
                    padding: "10px 11px",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StateGoSystemPoc() {
  const copyText = [
    "Roger → GoSystem POC: State Calculation Integration",
    "Last reviewed: October 9, 2026.",
    "Overall POC Status: Partially Demonstrated — End-to-End Integration Not Yet Validated.",
    "Demonstrated: Roger-side source-data ingestion, mapping, practitioner confirmation, and reconciliation of State apportionment inputs.",
    "Not demonstrated: IMS translation/transmission, GoSystem calculation execution, and returned GoSystem results in Roger.",
  ].join("\n");
  return (
    <section id="roger-gosystem-state-poc" style={{ marginBottom: "48px" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #bae6fd",
          borderRadius: "12px",
          boxShadow: "0 2px 9px rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(120deg, #0f1623 0%, #1e3a5f 68%, #0369a1 100%)",
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              alignItems: "flex-start",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ maxWidth: "1000px" }}>
              <div
                style={{
                  color: "#bae6fd",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.09em",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                }}
              >
                State architecture extension · Evidence-bound proof of concept
              </div>
              <h2 style={{ color: "#ffffff", fontSize: "20px", margin: 0 }}>
                Roger → GoSystem POC: State Calculation Integration
              </h2>
              <p
                style={{
                  color: "#dbeafe",
                  fontSize: "12px",
                  lineHeight: "1.55",
                  margin: "8px 0 0",
                }}
              >
                Demonstrate that Roger can collect, structure, and validate
                State tax preparation inputs; DCT/TDC can govern and correlate
                the State data package; IMS can translate and transmit the
                information to GoSystem; GoSystem can perform applicable State
                tax calculations; and calculated results can return to Roger for
                practitioner reconciliation, review, and approval.
              </p>
            </div>
            <CopyButton text={copyText} />
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <section
            aria-labelledby="poc-progress-summary"
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderLeft: `5px solid ${C.teal}`,
              borderRadius: "9px",
              marginBottom: "18px",
              padding: "14px 15px",
            }}
          >
            <div
              style={{
                alignItems: "flex-start",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ maxWidth: "930px" }}>
                <div
                  id="poc-progress-summary"
                  style={{
                    color: C.teal,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  October 9, 2026 POC Progress · Last reviewed October 9, 2026
                </div>
                <p
                  style={{
                    color: C.navy,
                    fontSize: "12px",
                    lineHeight: 1.55,
                    margin: "7px 0 0",
                  }}
                >
                  The State team demonstrated Roger-side source-data ingestion,
                  mapping, practitioner confirmation, and reconciliation of
                  State apportionment inputs. This is progress toward the
                  proposed end-to-end architecture, but the session did not
                  establish IMS translation and transmission to GoSystem, State
                  calculation execution in GoSystem, or the return of calculated
                  results to Roger.
                </p>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "11px",
                    lineHeight: 1.5,
                    margin: "7px 0 0",
                  }}
                >
                  <strong style={{ color: C.navy }}>
                    Expected business value:
                  </strong>{" "}
                  Establish the technical feasibility of integrating Roger with
                  GoSystem for State tax calculations while maintaining clear
                  responsibilities for governance, translation, calculation, and
                  practitioner review.
                </p>
              </div>
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  color: "#92400e",
                  fontSize: "10px",
                  fontWeight: 900,
                  lineHeight: 1.35,
                  maxWidth: "255px",
                  padding: "9px 10px",
                  textAlign: "center",
                }}
              >
                Overall POC Status
                <br />
                Partially Demonstrated — End-to-End Integration Not Yet
                Validated
              </div>
            </div>
          </section>
          <section
            aria-labelledby="poc-source-document"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderLeft: `5px solid ${C.teal}`,
              borderRadius: "9px",
              marginBottom: "22px",
              padding: "13px 15px",
            }}
          >
            <div
              style={{
                alignItems: "flex-start",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ maxWidth: "850px" }}>
                <div
                  style={{
                    color: C.teal,
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Source document
                </div>
                <div
                  id="poc-source-document"
                  style={{ color: C.navy, fontSize: "13px", fontWeight: 850 }}
                >
                  POC Meeting Transcript (DOCX)
                </div>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "11px",
                    lineHeight: "1.5",
                    margin: "5px 0 0",
                  }}
                >
                  The transcript documents the proposed operating model, design
                  questions, and feasibility considerations. It is not an
                  approved implementation specification. October 9 demonstration
                  findings below are limited to the supplied evidence; no
                  separate demonstration-notes link has been provided.
                </p>
              </div>
              <a
                href={POC_TRANSCRIPT_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${C.teal}66`,
                  borderRadius: "6px",
                  color: C.teal,
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "7px 10px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Open transcript (DOCX)
              </a>
            </div>
          </section>
          <section
            aria-labelledby="target-end-to-end-poc-architecture"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Proposed target architecture · Not completed implementation"
              title="Target End-to-End POC Architecture"
              subtitle="The visual describes the intended five-step integration pattern. It does not represent completed or approved implementation."
              accent="#2563eb"
            />
            <div id="target-end-to-end-poc-architecture">
              <ExecutiveProcessFlow
                ariaLabel="Target end-to-end Roger to GoSystem State calculation POC architecture"
                steps={TARGET_ARCHITECTURE_STEPS}
                supportNote="Forward direction: Roger UI → DCT/TDC → IMS → GoSystem. Return direction: GoSystem → IMS → DCT/TDC → Roger UI. Roger is the practitioner-facing workflow and review experience; DCT/TDC governs State data and result correlation; IMS owns proposed integration, transformation, and communication; GoSystem performs State tax calculation."
                outcome="A representative State calculation can be governed, translated, calculated, returned, correlated, and reviewed only after the outstanding contracts and round-trip validations are confirmed."
              />
            </div>
          </section>
          <section
            aria-labelledby="october-9-demonstration"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Evidence from supplied October 9 findings"
              title="October 9 Demonstration — Delivered Capabilities and Outstanding Integration"
              subtitle="Status describes what the session established. “Not Demonstrated” does not mean Not Developed or Not Implemented; implementation status requires separate confirmation."
              accent="#b45309"
            />
            <div
              id="october-9-demonstration"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    minWidth: "950px",
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#1e293b",
                        color: "#ffffff",
                        textAlign: "left",
                      }}
                    >
                      {[
                        "Step",
                        "POC Capability",
                        "Demonstration Status",
                        "October 9 Findings",
                      ].map(column => (
                        <th
                          key={column}
                          style={{
                            fontSize: "9px",
                            fontWeight: 850,
                            letterSpacing: "0.055em",
                            padding: "10px 11px",
                            textTransform: "uppercase",
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMONSTRATION_ROWS.map((row, index) => (
                      <tr
                        key={row[0]}
                        style={{
                          background: index % 2 ? "#ffffff" : "#f8fafc",
                          borderTop: "1px solid #e2e8f0",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            color: C.navy,
                            fontSize: "12px",
                            fontWeight: 900,
                            padding: "10px 11px",
                            textAlign: "center",
                          }}
                        >
                          {row[0]}
                        </td>
                        <td
                          style={{
                            color: C.navy,
                            fontSize: "10px",
                            fontWeight: 800,
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[1]}
                        </td>
                        <td style={{ padding: "10px 11px" }}>
                          <StatusPill status={row[2]} />
                        </td>
                        <td
                          style={{
                            color: C.slate,
                            fontSize: "10px",
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[3]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  background: "#fffbeb",
                  borderTop: "1px solid #fde68a",
                  color: "#78350f",
                  fontSize: "10px",
                  lineHeight: 1.5,
                  padding: "10px 12px",
                }}
              >
                <strong>Terminology:</strong> <strong>Demonstrated</strong>{" "}
                means the capability was shown during the session.{" "}
                <strong>Partially Demonstrated</strong> means supporting
                functionality was shown but the complete POC requirement was not
                demonstrated. <strong>Not Demonstrated</strong> means the
                meeting notes do not establish that the capability was shown.
              </div>
            </div>
          </section>
          <section
            aria-labelledby="demonstrated-roger-capabilities"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Demonstrated Roger / State workflow"
              title="Capabilities Demonstrated on October 9"
              subtitle="These capabilities demonstrate the Roger / State workflow. They do not prove that GoSystem calculations were executed."
              accent={C.green}
            />
            <div
              id="demonstrated-roger-capabilities"
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
              }}
            >
              {CAPABILITY_AREAS.map(area => (
                <article
                  key={area.title}
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${area.accent}33`,
                    borderTop: `4px solid ${area.accent}`,
                    borderRadius: "9px",
                    padding: "13px",
                  }}
                >
                  <div
                    style={{
                      color: area.accent,
                      fontSize: "12px",
                      fontWeight: 900,
                      lineHeight: 1.3,
                    }}
                  >
                    {area.title}
                  </div>
                  <ul
                    style={{
                      color: C.slate,
                      fontSize: "10px",
                      lineHeight: 1.45,
                      margin: "9px 0 0",
                      paddingLeft: "16px",
                    }}
                  >
                    {area.items.map(item => (
                      <li key={item} style={{ marginBottom: "5px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
          <section
            aria-labelledby="ims-gosystem-responsibilities"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Proposed responsibility model · Confirmation pending"
              title="IMS and GoSystem Responsibilities"
              subtitle="This model is a proposed integration responsibility view. It is subject to confirmation through IMS / GoSystem integration design and does not establish approved contracts."
              accent={C.purple}
            />
            <div
              id="ims-gosystem-responsibilities"
              style={{
                background: "#ffffff",
                border: "1px solid #e9d5ff",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={[
                  "Area",
                  "IMS Responsibility",
                  "GoSystem Responsibility",
                ]}
                rows={RESPONSIBILITY_ROWS}
              />
            </div>
          </section>
          <section
            aria-labelledby="integration-dependencies"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Proposed integration design · Open confirmation required"
              title="Integration Dependencies and Open Questions"
              subtitle="Examples make the unknowns understandable; they do not define approved IMS or GoSystem schemas, formats, or contracts."
              accent="#b45309"
            />
            <div
              id="integration-dependencies"
              style={{
                background: "#ffffff",
                border: "1px solid #fed7aa",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={[
                  "Dependency Area",
                  "What IMS / GoSystem Must Confirm",
                  "TDC Impact",
                ]}
                rows={DEPENDENCY_ROWS}
              />
            </div>
          </section>
          <section
            aria-labelledby="what-still-needs-to-be-proven"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Validation tracker"
              title="What Still Needs to Be Proven"
              subtitle="Every unverified checkpoint begins as Pending Confirmation. No completion date or completed status is inferred."
              accent="#2563eb"
            />
            <div
              id="what-still-needs-to-be-proven"
              style={{
                background: "#ffffff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    minWidth: "1250px",
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#1e293b",
                        color: "#ffffff",
                        textAlign: "left",
                      }}
                    >
                      {[
                        "Validation Item",
                        "Responsible Team",
                        "Status",
                        "Evidence",
                        "Dependency",
                        "Next Action",
                      ].map(column => (
                        <th
                          key={column}
                          style={{
                            fontSize: "9px",
                            fontWeight: 850,
                            letterSpacing: "0.055em",
                            padding: "10px 11px",
                            textTransform: "uppercase",
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {VALIDATION_ROWS.map((row, index) => (
                      <tr
                        key={row[0]}
                        style={{
                          background: index % 2 ? "#ffffff" : "#f8fafc",
                          borderTop: "1px solid #e2e8f0",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            color: C.navy,
                            fontSize: "10px",
                            fontWeight: 800,
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {index + 1}. {row[0]}
                        </td>
                        <td
                          style={{
                            color: C.slate,
                            fontSize: "10px",
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[1]}
                        </td>
                        <td style={{ padding: "10px 11px" }}>
                          <span
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              borderRadius: "999px",
                              color: C.slate,
                              display: "inline-flex",
                              fontSize: "9px",
                              fontWeight: 850,
                              padding: "4px 7px",
                            }}
                          >
                            Pending Confirmation
                          </span>
                        </td>
                        <td
                          style={{
                            color: C.slate,
                            fontSize: "10px",
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[2]}
                        </td>
                        <td
                          style={{
                            color: C.slate,
                            fontSize: "10px",
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[3]}
                        </td>
                        <td
                          style={{
                            color: C.slate,
                            fontSize: "10px",
                            lineHeight: 1.45,
                            padding: "10px 11px",
                          }}
                        >
                          {row[4]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section
            aria-labelledby="poc-risks-dependencies"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Risk and dependency register"
              title="Risks and Dependencies"
              subtitle="These are risks and dependencies to manage. They are not characterized as active defects."
              accent="#b45309"
            />
            <div
              id="poc-risks-dependencies"
              style={{
                background: "#ffffff",
                border: "1px solid #fed7aa",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={[
                  "Risk / Dependency",
                  "Potential Impact",
                  "Mitigation",
                  "Responsible Team",
                ]}
                rows={RISK_ROWS}
                minWidth="1080px"
              />
            </div>
          </section>
          <section aria-labelledby="poc-next-actions">
            <PanelHeading
              eyebrow="Proposed next steps · Pending confirmed commitment and ownership"
              title="Next Actions and Action Items"
              subtitle="The actions below are proposed until teams confirm commitment and ownership."
              accent={C.green}
            />
            <div
              id="poc-next-actions"
              style={{
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={["Action", "Responsible Team", "Expected Outcome"]}
                rows={NEXT_ACTION_ROWS}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export function StateGoSystemPocClosingDetails() {
  return (
    <section id="poc-closing-details" style={{ marginBottom: "48px" }}>
      <PanelHeading
        eyebrow="Broader implementation model · Proposed confirmation required"
        title="Illustrative Future-State State Calculation Package"
        subtitle="This future-state package is distinct from the October 9 demonstration status and should not be treated as an approved integration contract."
      />
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
        }}
      >
        {FUTURE_PACKAGE.map(column => (
          <div
            key={column.title}
            style={{
              background: "#ffffff",
              border: `1px solid ${column.accent}44`,
              borderTop: `5px solid ${column.accent}`,
              borderRadius: "10px",
              padding: "13px",
            }}
          >
            <div
              style={{
                color: column.accent,
                fontSize: "12px",
                fontWeight: 850,
              }}
            >
              {column.title}
            </div>
            <ul
              style={{
                color: C.slate,
                fontSize: "10px",
                lineHeight: 1.45,
                margin: "10px 0 0",
                paddingLeft: "16px",
              }}
            >
              {column.items.map(item => (
                <li key={item} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          color: C.slate,
          fontSize: "11px",
          fontWeight: 750,
          margin: "12px 0 22px",
          padding: "10px 12px",
        }}
      >
        <strong style={{ color: C.navy }}>
          Cross-Cutting Metadata — proposed examples:
        </strong>{" "}
        Taxonomy ID • Source • Lineage • Approval Status • Version •
        Transmission Correlation ID • Validation Messages
      </div>
      <section
        aria-labelledby="federal-state-deliverable-linkage"
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "10px",
          marginBottom: "22px",
          padding: "16px",
        }}
      >
        <PanelHeading
          eyebrow="Architecture dependency"
          title="Federal → State Deliverable Linkage"
          subtitle="A DCT / architecture / data-model dependency that is separate from the October 9 demonstration scope."
          accent={C.teal}
        />
        <div id="federal-state-deliverable-linkage">
          <ExecutiveProcessFlow
            ariaLabel="Federal to State deliverable linkage executive process flow"
            steps={FEDERAL_STATE_LINKAGE_STEPS}
            outcome="For TY26, the State workflow should use the correct governed Federal deliverable when multiple deliverables exist for the same entity and tax year; confirmation and implementation remain pending."
          />
        </div>
      </section>
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #fed7aa",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <PanelHeading
            eyebrow="Decisions required"
            title="POC Open Questions"
            subtitle="Keep unresolved business, Taxonomy, integration, and architecture decisions explicit rather than embedding assumptions in implementation."
            accent="#d97706"
          />
          <ol style={{ columns: 2, margin: 0, paddingLeft: "18px" }}>
            {OPEN_QUESTIONS.map(item => (
              <li
                key={item}
                style={{
                  breakInside: "avoid",
                  color: "#78350f",
                  fontSize: "10px",
                  lineHeight: "1.45",
                  marginBottom: "7px",
                  paddingRight: "10px",
                }}
              >
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <PanelHeading
            eyebrow="End-to-end proof criteria"
            title="POC Success Criteria"
            subtitle="These criteria remain pending until the full governed input-to-review pattern has evidence."
            accent={C.green}
          />
          <ol style={{ columns: 2, margin: 0, paddingLeft: "18px" }}>
            {SUCCESS_CRITERIA.map(item => (
              <li
                key={item}
                style={{
                  breakInside: "avoid",
                  color: "#166534",
                  fontSize: "10px",
                  lineHeight: "1.45",
                  marginBottom: "7px",
                  paddingRight: "10px",
                }}
              >
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

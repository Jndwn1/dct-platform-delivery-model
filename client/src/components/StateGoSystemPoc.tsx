import type { ReactNode } from "react";
import ExecutiveProcessFlow, {
  type ExecutiveFlowStep,
} from "@/components/ExecutiveProcessFlow";

const C = {
  navy: "#0f1623",
  slate: "#475569",
  blue: "#2563eb",
  teal: "#0f766e",
  purple: "#7c3aed",
  amber: "#b45309",
  green: "#047857",
};

const POC_TRANSCRIPT_SOURCE_URL = "/manus-storage/POC_6327d700.docx";
const STATE_MVP_PRODUCT_VISION_URL =
  "https://rsmnet.sharepoint.com/:p:/r/sites/CATTO365/Shared%20Documents/Roger%20-%20state%20and%20provision/State/Product%20focuses/Roger_State_MVP_Product_Vision_and_Scope_PI-4.pptx?d=w6829d1e3d87c4691bfd1e6809b3b3187&csf=1&web=1&e=kCScRg";

const COMPARISON_ROWS = [
  [
    "Workflow Foundation",
    "Tax Portal-to-Roger State workflow",
    "Demonstrated",
    "Reuse of first nine Federal Compliance steps",
    "Prototype Demonstrated",
  ],
  [
    "Data Collection",
    "State source-file extraction and mapping",
    "Demonstrated",
    "Duplicate return structure with dummy Provision data",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Review",
    "Practitioner review and approval of source mappings",
    "Demonstrated",
    "Return to Provision read-only comparison and filtering",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Entry / Maintenance",
    "State apportionment inputs by entity, jurisdiction, and factor",
    "Demonstrated",
    "Deferred Rollforward entity amount editing and custom adjustment columns",
    "Demonstrated with Dummy Data",
  ],
  [
    "Reconciliation",
    "Check figures, differences, variance percentages, and review threshold",
    "Demonstrated",
    "Prior-year Provision vs. tax-return comparison",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Governance",
    "Structured inputs and approved mappings shown; complete TDC integration handoff unverified",
    "Partially Demonstrated",
    "Initial Provision database tables created",
    "Initial Structure Created",
  ],
  [
    "Summary Output",
    "GoSystem calculation results not shown",
    "Not Demonstrated",
    "Federal Summary demonstrated; detailed validation scope remains to be confirmed",
    "Demonstrated",
  ],
  [
    "Downstream Integration",
    "IMS translation and transmission to GoSystem not shown",
    "Not Demonstrated",
    "BTP Excel Export demonstrated; transfer evidence remains to be confirmed",
    "Demonstrated",
  ],
  [
    "External Calculation",
    "GoSystem execution not shown",
    "Not Demonstrated",
    "Bloomberg Tax Provision calculation demonstrated; detailed result evidence remains to be confirmed",
    "Demonstrated",
  ],
  [
    "End-to-End Results",
    "No GoSystem-calculated results returned to Roger",
    "Not Demonstrated",
    "No validated end-to-end BTP processing flow",
    "Not Demonstrated",
  ],
] as const;

const STATE_ARCHITECTURE_STEPS: readonly ExecutiveFlowStep[] = [
  {
    label: "1 · State data collection",
    title: "Roger UI",
    detail:
      "Collect and review State tax inputs from Tax Portal source files, mappings, and practitioner review.",
    accent: C.teal,
    surface: "#f0fdfa",
  },
  {
    label: "2 · Govern and correlate",
    title: "TDC",
    detail:
      "Govern structured State data and calculation-request information through the agreed data path.",
    accent: C.blue,
    surface: "#eff6ff",
  },
  {
    label: "3 · Translate and transmit",
    title: "IMS",
    detail:
      "Translate the approved package and communicate with GoSystem using confirmed contracts and formats.",
    accent: C.purple,
    surface: "#faf5ff",
  },
  {
    label: "4 · Compare, roll up and file",
    title: "GoSystem",
    detail:
      "Support apportionment comparison plus return-level roll-up and filing behavior after the governed State package is received.",
    accent: C.amber,
    surface: "#fffbeb",
  },
  {
    label: "5 · Return and review",
    title: "IMS → TDC → Roger",
    detail:
      "Return processing and roll-up results for correlation, practitioner reconciliation, review, and approval.",
    accent: "#0369a1",
    surface: "#f0f9ff",
  },
];

const PROVISION_ARCHITECTURE_STEPS: readonly ExecutiveFlowStep[] = [
  {
    label: "1 · Prototype demonstrated",
    title: "Roger Core",
    detail:
      "Reuse the first nine Federal Compliance workflow steps as the Provision foundation.",
    accent: C.purple,
    surface: "#faf5ff",
  },
  {
    label: "2 · Demonstrated with dummy data",
    title: "Return to Provision",
    detail:
      "Compare prior-year Provision amounts against the prior-year tax return in a read-only review experience.",
    accent: C.teal,
    surface: "#f0fdfa",
  },
  {
    label: "3 · Demonstrated with dummy data",
    title: "Deferred Rollforward",
    detail:
      "Maintain temporary-difference information through entity-specific amounts and custom adjustment columns.",
    accent: C.blue,
    surface: "#eff6ff",
  },
  {
    label: "4 · Demonstrated",
    title: "Federal Summary",
    detail:
      "Demonstrated October 9; confirm validation scope and retain supporting evidence.",
    accent: C.green,
    surface: "#ecfdf5",
  },
  {
    label: "5 · Demonstrated",
    title: "BTP Export",
    detail:
      "Demonstrated October 9; confirm BTP transfer approach and validation detail.",
    accent: C.green,
    surface: "#ecfdf5",
  },
  {
    label: "6 · Demonstrated",
    title: "Bloomberg Tax Provision",
    detail:
      "Calculation demonstrated October 9; confirm end-to-end output and validation detail.",
    accent: C.green,
    surface: "#ecfdf5",
  },
];

const PILOT_MILESTONES = [
  ["Development completion", "Mid-December 2026"],
  [
    "Internal testing / QA / UAT readiness",
    "Targeted before the holiday break",
  ],
  ["Significant defect remediation", "Early January 2027"],
  ["Pilot launch", "Mid-January 2027"],
] as const;

function PanelHeading({
  eyebrow,
  title,
  subtitle,
  accent = C.blue,
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
          fontWeight: 850,
          letterSpacing: "0.08em",
          marginBottom: "4px",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ color: C.navy, fontSize: "18px", margin: 0 }}>{title}</h2>
      {subtitle && (
        <p
          style={{
            color: C.slate,
            fontSize: "11px",
            lineHeight: 1.5,
            margin: "5px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status.includes("Demonstrated") && !status.includes("Not Demonstrated")
      ? { background: "#dcfce7", border: "#86efac", color: "#166534" }
      : status.includes("Partially") || status.includes("Initial Structure")
        ? { background: "#dbeafe", border: "#93c5fd", color: "#1d4ed8" }
        : status.includes("Placeholder") ||
            status.includes("Pending") ||
            status.includes("Proposed")
          ? { background: "#fef3c7", border: "#fcd34d", color: "#92400e" }
          : status.includes("Not Demonstrated") || status === "Open"
            ? { background: "#f1f5f9", border: "#cbd5e1", color: C.slate }
            : { background: "#f8fafc", border: "#cbd5e1", color: C.slate };

  return (
    <span
      style={{
        background: tone.background,
        border: `1px solid ${tone.border}`,
        borderRadius: "999px",
        color: tone.color,
        display: "inline-flex",
        fontSize: "9px",
        fontWeight: 850,
        lineHeight: 1.25,
        padding: "4px 7px",
        whiteSpace: "normal",
      }}
    >
      {status}
    </span>
  );
}

function DataTable({
  columns,
  rows,
  statusColumns = [],
  minWidth = "900px",
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  statusColumns?: readonly number[];
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
              key={`${row[0]}-${index}`}
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
                  {statusColumns.includes(cellIndex) ? (
                    <StatusPill status={cell} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Notice({
  children,
  accent = C.blue,
}: {
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: `1px solid ${accent}33`,
        borderLeft: `5px solid ${accent}`,
        borderRadius: "8px",
        color: C.slate,
        fontSize: "11px",
        lineHeight: 1.5,
        padding: "12px 13px",
      }}
    >
      {children}
    </div>
  );
}

export default function StateGoSystemPoc() {
  return (
    <section
      id="state-provision-delivery-readiness"
      style={{ marginBottom: "38px" }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dbe4ee",
          borderRadius: "12px",
          boxShadow: "0 2px 9px rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(120deg, #0f1623 0%, #1e3a5f 60%, #2563eb 100%)",
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              color: "#bfdbfe",
              fontSize: "10px",
              fontWeight: 850,
              letterSpacing: "0.09em",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Pilot · Unified delivery readiness dashboard
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "21px", margin: 0 }}>
            State & Provision Delivery Readiness
          </h1>
          <p
            style={{
              color: "#dbeafe",
              fontSize: "12px",
              lineHeight: 1.55,
              margin: "8px 0 0",
              maxWidth: "1040px",
            }}
          >
            A single evidence-bound view of the October 9, 2026 State and
            Provision demonstrations, target architectures, planning targets,
            and source references. This page does not establish production
            readiness or approved integration contracts.
          </p>
        </div>

        <div style={{ padding: "20px" }}>
          <section
            aria-labelledby="executive-overview"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="1 · Executive overview"
              title="State & Provision Readiness Summary"
              subtitle="Demonstration findings are separated from proposed architecture and unverified integration work."
            />
            <div
              id="executive-overview"
              style={{
                display: "grid",
                gap: "14px",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              <Notice accent={C.blue}>
                <strong style={{ color: C.navy }}>State:</strong> The October 9
                demonstration showed Tax Portal-to-Roger ingestion, State
                source-data mapping, practitioner confirmation, apportionment
                input organization, and reconciliation functionality. It did not
                establish successful IMS translation, GoSystem calculation
                execution, or calculated-results return to Roger.
              </Notice>
              <Notice accent={C.purple}>
                <strong style={{ color: C.navy }}>Provision:</strong> The
                October 9 demonstration showed initial Return to Provision and
                Deferred Rollforward functionality using dummy data. Initial
                Provision database tables were created. Federal Summary, BTP
                Export, and Bloomberg Tax Provision calculation were also
                demonstrated. This confirms demonstrated capability, not a
                validated automated integration. BTP transfer, end-to-end
                output, and detailed validation evidence remain pending
                confirmation.
              </Notice>
            </div>
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                color: "#92400e",
                fontSize: "11px",
                fontWeight: 850,
                lineHeight: 1.45,
                marginTop: "14px",
                padding: "10px 12px",
              }}
            >
              Overall Status: Partially Demonstrated — End-to-End Integration
              Not Yet Validated
            </div>
          </section>

          <section
            aria-labelledby="october-9-comparison"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="2 · October 9 demonstration"
              title="October 9 Demonstrated Capabilities — State & Provision"
              subtitle="This table shows the State and Provision capabilities demonstrated on October 9, with their evidence-bound status. Provision Federal Summary, BTP Export, and Bloomberg Tax Provision calculation are Demonstrated; transfer and end-to-end validation remain pending."
              accent={C.teal}
            />
            <div
              id="october-9-comparison"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={[
                  "Capability",
                  "State — Demonstrated Capability",
                  "State Status",
                  "Provision — Demonstrated Capability",
                  "Provision Status",
                ]}
                rows={COMPARISON_ROWS}
                statusColumns={[2, 4]}
                minWidth="1220px"
              />
            </div>
            <p
              style={{
                color: C.slate,
                fontSize: "10px",
                lineHeight: 1.5,
                margin: "9px 0 0",
              }}
            >
              <strong>Terminology:</strong> <strong>Demonstrated</strong> means
              capability shown during the session;{" "}
              <strong>Partially Demonstrated</strong> means supporting
              functionality was shown but the complete requirement was not;{" "}
              <strong>Initial Structure Created</strong> means a foundation was
              reported; and <strong>Not Demonstrated</strong> does not mean Not
              Developed. Demonstration status does not by itself establish an
              automated integration, production readiness, or end-to-end
              validation.
            </p>
          </section>

          <section
            aria-labelledby="target-end-to-end-architecture"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="3 · PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION"
              title="Target End-to-End Architecture"
              subtitle="The State and Provision architectures originate in Roger but use distinct external calculation and output paths. State MVP vision retains transparent entity-and-jurisdiction calculations in Roger, while GoSystem supports return-level roll-up and filing behavior. Provision uses BTP Export and Bloomberg Tax Provision—not the State IMS / GoSystem path."
              accent={C.blue}
            />
            <div
              id="target-end-to-end-architecture"
              style={{
                background: "#f8fafc",
                border: "1px solid #dbe4ee",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                }}
              >
                <div>
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderLeft: `4px solid ${C.blue}`,
                      borderRadius: "8px",
                      color: "#1e3a5f",
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: "0.055em",
                      marginBottom: "9px",
                      padding: "9px 11px",
                      textTransform: "uppercase",
                    }}
                  >
                    State — GoSystem Roll-Up & Filing Integration
                  </div>
                  <ExecutiveProcessFlow
                    ariaLabel="State GoSystem roll-up and filing integration target architecture"
                    steps={STATE_ARCHITECTURE_STEPS}
                    supportNote="Forward direction: Roger UI → TDC → IMS → GoSystem. Return direction: GoSystem → IMS → TDC → Roger. IMS is the proposed integration and translation layer; Roger retains transparent entity-and-jurisdiction calculation review, while GoSystem supports return-level roll-up and filing behavior."
                    outcome="The State round trip is not validated until the representative package, translation, GoSystem comparison or roll-up behavior, returned results, correlation, and practitioner review are confirmed."
                  />
                </div>
                <div>
                  <div
                    style={{
                      background: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderLeft: `4px solid ${C.purple}`,
                      borderRadius: "8px",
                      color: "#581c87",
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: "0.055em",
                      marginBottom: "9px",
                      padding: "9px 11px",
                      textTransform: "uppercase",
                    }}
                  >
                    Provision — Bloomberg Tax Provision Workflow
                  </div>
                  <div
                    style={{
                      alignItems: "center",
                      background: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderRadius: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "7px",
                      marginBottom: "9px",
                      padding: "9px 10px",
                    }}
                  >
                    <span
                      style={{
                        color: "#581c87",
                        fontSize: "10px",
                        fontWeight: 850,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      October 9 workflow evidence
                    </span>
                    <StatusPill status="Prototype Demonstrated" />
                    <StatusPill status="Demonstrated with Dummy Data" />
                    <StatusPill status="Initial Structure Created" />
                    <StatusPill status="Demonstrated" />
                    <span
                      style={{
                        color: C.slate,
                        fontSize: "10px",
                        lineHeight: 1.4,
                      }}
                    >
                      Updated October 9 evidence: Roger Core, Return to
                      Provision, Deferred Rollforward, Federal Summary, BTP
                      Export, and Bloomberg Tax Provision calculation were
                      demonstrated. BTP transfer, end-to-end output, and
                      detailed validation evidence remain pending confirmation.
                    </span>
                  </div>
                  <ExecutiveProcessFlow
                    ariaLabel="Provision Bloomberg Tax Provision target workflow"
                    steps={PROVISION_ARCHITECTURE_STEPS}
                    supportNote="Provision does not use GoSystem or the State IMS calculation pathway. The BTP handoff uses BTP Export; no automated API transmission or automated results return is assumed."
                    outcome="Federal Summary, BTP Export, and Bloomberg Tax Provision calculation are demonstrated alongside the Roger Core, Return to Provision, and Deferred Rollforward workflow. BTP transfer, end-to-end outputs, and detailed validation evidence remain pending confirmation."
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="pilot-milestones"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="4 · Pilot delivery milestones"
              title="Planning Targets Discussed on October 9"
              subtitle="These are planning targets, not verified delivery commitments. Performance testing requires confirmation in the integrated delivery plan."
              accent={C.purple}
            />
            <div
              id="pilot-milestones"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={["Milestone", "Planning Target"]}
                rows={PILOT_MILESTONES}
                minWidth="650px"
              />
            </div>
          </section>

          <section aria-labelledby="supporting-documents">
            <PanelHeading
              eyebrow="5 · Supporting documents and references"
              title="Evidence Sources"
              subtitle="Only verified source links are provided; no demonstration-note, contract, or ADO link has been invented."
              accent={C.teal}
            />
            <div
              id="supporting-documents"
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "9px",
                  padding: "13px",
                }}
              >
                <div
                  style={{
                    color: "#0369a1",
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  State POC transcript
                </div>
                <div
                  style={{
                    color: C.navy,
                    fontSize: "13px",
                    fontWeight: 850,
                    marginTop: "4px",
                  }}
                >
                  Roger → GoSystem POC Meeting Transcript
                </div>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "10px",
                    lineHeight: 1.45,
                    margin: "6px 0 10px",
                  }}
                >
                  Working-session source for proposed architecture, design
                  questions, and feasibility considerations; not an approved
                  implementation specification.
                </p>
                <a
                  href={POC_TRANSCRIPT_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#0369a1",
                    fontSize: "10px",
                    fontWeight: 850,
                  }}
                >
                  Open transcript (DOCX) ↗
                </a>
              </div>
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "9px",
                  padding: "13px",
                }}
              >
                <div
                  style={{
                    color: C.green,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  State PI4 product vision and scope
                </div>
                <div
                  style={{
                    color: C.navy,
                    fontSize: "13px",
                    fontWeight: 850,
                    marginTop: "4px",
                  }}
                >
                  Roger State MVP Product Vision and Scope — PI4
                </div>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "10px",
                    lineHeight: 1.45,
                    margin: "6px 0 10px",
                  }}
                >
                  State-team source for the PI4 MVP boundary: entity and
                  jurisdiction remain the calculation authority in the Roger
                  workflow; controlled group context supports comparison without
                  silently changing that authority; GoSystem supports
                  return-level roll-up and filing behavior. Full State
                  tax-accrual calculation is identified as post-MVP.
                </p>
                <a
                  href={STATE_MVP_PRODUCT_VISION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: C.green,
                    fontSize: "10px",
                    fontWeight: 850,
                  }}
                >
                  Open State MVP vision deck ↗
                </a>
              </div>
              <div
                style={{
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: "9px",
                  padding: "13px",
                }}
              >
                <div
                  style={{
                    color: C.purple,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Provision demonstration evidence
                </div>
                <div
                  style={{
                    color: C.navy,
                    fontSize: "13px",
                    fontWeight: 850,
                    marginTop: "4px",
                  }}
                >
                  October 9 Meeting Notes and Demo Transcript Window
                </div>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "10px",
                    lineHeight: 1.45,
                    margin: "6px 0 0",
                  }}
                >
                  Supplied October 9 meeting notes and Provision demonstration
                  transcript window (12:11–16:52), together with the latest
                  supplied October 9 demonstration-status update. Federal
                  Summary, BTP Export, and Bloomberg Tax Provision calculation
                  are marked Demonstrated; BTP transfer and end-to-end
                  validation remain pending. No separate source link was
                  attached to this update.
                </p>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                color: C.slate,
                fontSize: "11px",
                lineHeight: 1.5,
                marginTop: "20px",
                paddingTop: "16px",
              }}
            >
              <strong style={{ color: C.navy }}>Jenniver Dawn Stafford</strong>
              <br />
              Business Analysis Manager
              <br />
              (CATT) Center for Advanced Tax Technology
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

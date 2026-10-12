import type { ReactNode } from "react";

const C = {
  navy: "#0f1623",
  slate: "#475569",
  purple: "#7c3aed",
  teal: "#0f766e",
  amber: "#b45309",
  blue: "#2563eb",
};

const PROVISION_STEPS = [
  {
    number: "1",
    title: "Return to Provision",
    status: "Demonstrated Using Dummy Data",
    purpose:
      "Compare prior-year Provision amounts against the amounts reported on the prior-year tax return to identify differences relevant to the current-year provision.",
    accent: C.teal,
    surface: "#f0fdfa",
    items: [
      "Read-only comparison of prior-year Provision and tax-return amounts.",
      "Entity-level filtering, global search, and column-level search and filtering.",
      "Roger Core navigation and breadcrumbs.",
    ],
    note: "Users review amounts on this screen but do not edit them.",
  },
  {
    number: "2",
    title: "Deferred Rollforward",
    status: "Demonstrated Using Dummy Data",
    purpose:
      "Support the review and maintenance of temporary differences and the components contributing to current-year ending balances.",
    accent: C.purple,
    surface: "#faf5ff",
    items: [
      "Entity-level filtering and search, plus Edit Entity Amount.",
      "Selection, entry, saving, and display of entity-specific amounts.",
      "Add Other Adjustment, user-defined adjustment columns, and deletion of custom columns.",
      "Last-updated date and timestamp.",
    ],
  },
  {
    number: "3",
    title: "Federal Summary",
    status: "Placeholder — Not Yet Demonstrated",
    purpose:
      "Consolidate relevant Provision information into a Federal Summary screen.",
    accent: C.blue,
    surface: "#eff6ff",
    items: [
      "Requirements and the associated story were still being refined.",
      "This screen was not demonstrated and is not presented as complete.",
    ],
  },
  {
    number: "4",
    title: "BTP Export",
    status: "Placeholder — Not Yet Demonstrated",
    purpose:
      "Generate an Excel file containing Provision information for users to transfer into Bloomberg Tax Provision.",
    accent: C.amber,
    surface: "#fffbeb",
    items: [
      "The BTP Export UI and export functionality were not demonstrated.",
      "This is not a completed automated integration with Bloomberg Tax Provision.",
    ],
  },
] as const;

const BACKEND_READINESS_ROWS = [
  [
    "Provision Database Tables",
    "Initial Structure Created",
    "Initial tables required for Provision have been created.",
  ],
  [
    "Provision Test Data",
    "Dummy Data Only",
    "The demonstration did not use actual Provision data.",
  ],
  [
    "Return to Provision UI",
    "Demonstrated",
    "Read-only comparison and navigation functionality shown.",
  ],
  [
    "Deferred Rollforward UI",
    "Demonstrated",
    "Editing, custom adjustment columns, and timestamps shown.",
  ],
  [
    "Federal Summary",
    "Pending Development",
    "Requirements still being refined.",
  ],
  ["BTP Export", "Pending Development", "Planned Excel export functionality."],
  [
    "State Summary",
    "Not Demonstrated",
    "Expected within the separate State workflow.",
  ],
  [
    "Final Return Structure Design",
    "Pending Alignment",
    "The demonstrated screen was temporary; Santosh's workflow design was expected to replace or refine it.",
  ],
] as const;

const DEPENDENCIES = [
  "Finalize Federal Summary requirements.",
  "Develop the Federal Summary UI.",
  "Develop the BTP Excel export functionality.",
  "Coordinate with Roger Core on the shared workflow architecture.",
  "Align Provision navigation with Santosh's workflow-group design.",
  "Confirm how State Provision information will be handled within the separate State workflow.",
  "Introduce representative test data and validate the Provision workflow beyond dummy-data demonstrations.",
  "Confirm the remaining integration and QA requirements for Pilot readiness.",
] as const;

const DELIVERY_TARGETS = [
  ["Development completion", "Mid-December 2026"],
  [
    "Availability for internal testing / QA / UAT",
    "Targeted before the holiday break",
  ],
  ["Significant defect remediation", "Early January 2027"],
  ["Pilot launch", "Mid-January 2027"],
] as const;

function PanelHeading({
  eyebrow,
  title,
  subtitle,
  accent = C.purple,
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
      <h3 style={{ color: C.navy, fontSize: "16px", margin: 0 }}>{title}</h3>
      {subtitle && (
        <p
          style={{
            color: C.slate,
            fontSize: "11px",
            lineHeight: 1.45,
            margin: "4px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status.includes("Demonstrated") && !status.includes("Not Yet")
      ? { background: "#dcfce7", border: "#86efac", color: "#166534" }
      : status.includes("Initial Structure")
        ? { background: "#dbeafe", border: "#93c5fd", color: "#1d4ed8" }
        : status.includes("Placeholder") ||
            status.includes("Pending") ||
            status.includes("Dummy")
          ? { background: "#fef3c7", border: "#fcd34d", color: "#92400e" }
          : { background: "#f1f5f9", border: "#cbd5e1", color: C.slate };
  return (
    <span
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: "999px",
        color: style.color,
        display: "inline-flex",
        fontSize: "9px",
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
  minWidth = "760px",
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
                  {cellIndex === 1 ? <StatusBadge status={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({
  children,
  accent,
  surface = "#f8fafc",
}: {
  children: ReactNode;
  accent: string;
  surface?: string;
}) {
  return (
    <div
      style={{
        background: surface,
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

export function ProvisionOctober9DemonstrationDetails() {
  return <ProvisionOctober9Demonstration embedded />;
}

export default function ProvisionOctober9Demonstration({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <section
      id="provision-october-9-demonstration"
      style={{ marginBottom: embedded ? 0 : "30px" }}
    >
      <div
        style={
          embedded
            ? undefined
            : {
                background: "#ffffff",
                border: "1px solid #e9d5ff",
                borderRadius: "12px",
                boxShadow: "0 2px 9px rgba(15,23,42,0.06)",
                overflow: "hidden",
              }
        }
      >
        {embedded ? (
          <div
            style={{
              borderTop: `2px solid ${C.purple}`,
              marginBottom: "18px",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                color: C.purple,
                fontSize: "10px",
                fontWeight: 850,
                letterSpacing: "0.09em",
                marginBottom: "5px",
                textTransform: "uppercase",
              }}
            >
              Provision extension · Evidence-bound delivery readiness
            </div>
            <h3 style={{ color: C.navy, fontSize: "17px", margin: 0 }}>
              Provision — October 9 Demonstration and Delivery Readiness
            </h3>
            <p
              style={{
                color: C.slate,
                fontSize: "11px",
                lineHeight: 1.55,
                margin: "7px 0 0",
                maxWidth: "1040px",
              }}
            >
              The October 9 demonstration showed initial Roger Provision
              workflow screens. Provision is intended to reuse the first nine
              Federal Compliance workflow steps and then add four
              Provision-specific steps. The session used duplicate return
              structures and dummy data because production-like Provision data
              was not yet available.
            </p>
          </div>
        ) : (
          <div
            style={{
              background:
                "linear-gradient(120deg, #0f1623 0%, #4c1d95 65%, #7c3aed 100%)",
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                color: "#e9d5ff",
                fontSize: "10px",
                fontWeight: 850,
                letterSpacing: "0.09em",
                marginBottom: "5px",
                textTransform: "uppercase",
              }}
            >
              Provision extension · Evidence-bound delivery readiness
            </div>
            <h2 style={{ color: "#ffffff", fontSize: "20px", margin: 0 }}>
              Provision — October 9 Demonstration and Delivery Readiness
            </h2>
            <p
              style={{
                color: "#ede9fe",
                fontSize: "12px",
                lineHeight: 1.55,
                margin: "8px 0 0",
                maxWidth: "1040px",
              }}
            >
              The October 9 demonstration showed initial Roger Provision
              workflow screens. Provision is intended to reuse the first nine
              Federal Compliance workflow steps and then add four
              Provision-specific steps. The session used duplicate return
              structures and dummy data because production-like Provision data
              was not yet available.
            </p>
          </div>
        )}

        <div style={{ padding: embedded ? 0 : "20px" }}>
          <section
            aria-labelledby="provision-progress-summary"
            style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderLeft: `5px solid ${C.purple}`,
              borderRadius: "9px",
              marginBottom: "20px",
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
              <div style={{ maxWidth: "900px" }}>
                <div
                  id="provision-progress-summary"
                  style={{
                    color: C.purple,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  October 9, 2026 — Provision Progress
                </div>
                <p
                  style={{
                    color: C.navy,
                    fontSize: "12px",
                    lineHeight: 1.55,
                    margin: "7px 0 0",
                  }}
                >
                  The Provision team demonstrated initial Return to Provision
                  and Deferred Rollforward workflows using dummy data. Return to
                  Provision supports read-only comparison and review of
                  prior-year Provision and tax-return amounts. Deferred
                  Rollforward supports entity-specific data entry, custom
                  adjustment columns, and update tracking.
                </p>
                <p
                  style={{
                    color: C.slate,
                    fontSize: "11px",
                    lineHeight: 1.5,
                    margin: "7px 0 0",
                  }}
                >
                  Initial Provision database tables have been created. However,
                  the Federal Summary and BTP Export screens remain
                  placeholders, and final workflow integration and
                  representative-data validation are still outstanding.
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
                  maxWidth: "275px",
                  padding: "9px 10px",
                  textAlign: "center",
                }}
              >
                Overall Status
                <br />
                Partially Demonstrated — Initial UI Capabilities Available;
                End-to-End Provision Workflow Not Yet Validated
              </div>
            </div>
          </section>

          <Callout accent={C.purple} surface="#f8fafc">
            <strong style={{ color: C.navy }}>Evidence source:</strong> Supplied
            October 9 meeting notes and the Provision demonstration transcript
            window (12:11–16:52). No separate transcript or meeting-notes link
            was attached to this update; the section records only the supplied
            evidence.
          </Callout>

          <section
            aria-labelledby="provision-workflow"
            style={{ marginTop: "22px", marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Workflow structure · Demonstration status shown per Provision step"
              title="Provision Workflow"
              subtitle="The four Provision-specific screens follow the first nine shared Federal Compliance workflow steps. The visual distinguishes the demonstrated dummy-data steps from placeholders."
            />
            <div
              id="provision-workflow"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  color: "#1e3a5f",
                  padding: "11px 13px",
                }}
              >
                <div
                  style={{
                    color: C.blue,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Shared workflow foundation
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    marginTop: "3px",
                  }}
                >
                  Roger Federal Compliance — First Nine Shared Steps
                </div>
              </div>
              <div
                style={{
                  color: C.purple,
                  fontSize: "22px",
                  fontWeight: 900,
                  lineHeight: 1,
                  padding: "8px 0",
                  textAlign: "center",
                }}
                aria-hidden="true"
              >
                ↓
              </div>
              <div
                style={{
                  color: C.purple,
                  fontSize: "10px",
                  fontWeight: 850,
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                Provision-specific workflow
              </div>
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
                    minWidth: "940px",
                  }}
                >
                  {PROVISION_STEPS.map(step => (
                    <article
                      key={step.number}
                      style={{
                        background: step.surface,
                        border: `1px solid ${step.accent}55`,
                        borderTop: `4px solid ${step.accent}`,
                        borderRadius: "8px",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: step.accent,
                          fontSize: "10px",
                          fontWeight: 850,
                          letterSpacing: "0.065em",
                          textTransform: "uppercase",
                        }}
                      >
                        Step {step.number}
                      </div>
                      <div
                        style={{
                          color: C.navy,
                          fontSize: "14px",
                          fontWeight: 900,
                          margin: "4px 0 8px",
                        }}
                      >
                        {step.title}
                      </div>
                      <StatusBadge status={step.status} />
                      <div
                        style={{
                          color: C.slate,
                          fontSize: "10px",
                          lineHeight: 1.45,
                          marginTop: "9px",
                        }}
                      >
                        {step.purpose}
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
                        {step.items.map(item => (
                          <li key={item} style={{ marginBottom: "4px" }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                      {"note" in step && (
                        <div
                          style={{
                            color: step.accent,
                            fontSize: "10px",
                            fontWeight: 800,
                            lineHeight: 1.4,
                            marginTop: "8px",
                          }}
                        >
                          {step.note}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="provision-backend-readiness"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Backend and UI readiness"
              title="Provision Backend Readiness"
              subtitle="Status is limited to the October 9 demonstration and supplied meeting findings; dummy-data UI demonstrations do not establish production readiness."
              accent={C.teal}
            />
            <div
              id="provision-backend-readiness"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={["Component", "Status", "October 9 Finding"]}
                rows={BACKEND_READINESS_ROWS}
                minWidth="860px"
              />
            </div>
          </section>

          <section
            aria-labelledby="provision-dependencies"
            style={{ marginBottom: "24px" }}
          >
            <PanelHeading
              eyebrow="Dependencies and next steps"
              title="Provision Dependencies"
              subtitle="These activities are required to move from the demonstrated initial UI to Pilot readiness. They are not stated as completed commitments."
              accent={C.amber}
            />
            <div
              id="provision-dependencies"
              style={{
                display: "grid",
                gap: "14px",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              }}
            >
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "9px",
                  padding: "13px",
                }}
              >
                <div
                  style={{
                    color: C.amber,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Required follow-up activities
                </div>
                <ol
                  style={{
                    color: C.slate,
                    fontSize: "11px",
                    lineHeight: 1.45,
                    margin: "8px 0 0",
                    paddingLeft: "18px",
                  }}
                >
                  {DEPENDENCIES.map(item => (
                    <li key={item} style={{ marginBottom: "6px" }}>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              <Callout accent={C.purple} surface="#faf5ff">
                <div
                  style={{
                    color: C.purple,
                    fontSize: "10px",
                    fontWeight: 850,
                    letterSpacing: "0.08em",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Pending development and validation
                </div>
                Federal Summary and BTP Export remain placeholders. The
                demonstrated return structure was temporary, and final workflow
                integration, representative-data validation, remaining
                integration requirements, QA, and performance testing must be
                addressed before Pilot readiness can be assessed.
              </Callout>
            </div>
          </section>

          <section aria-labelledby="provision-pilot-timeline">
            <PanelHeading
              eyebrow="Planning targets · Not verified delivery commitments"
              title="Pilot Delivery Timeline"
              subtitle="Targets were discussed during the meeting and are planning inputs only. Performance testing must also be accounted for in the delivery plan."
              accent={C.blue}
            />
            <div
              id="provision-pilot-timeline"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <DataTable
                columns={["Milestone", "Target"]}
                rows={DELIVERY_TARGETS}
                minWidth="600px"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

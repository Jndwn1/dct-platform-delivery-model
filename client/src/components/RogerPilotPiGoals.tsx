import type { ReactNode } from "react";

const NAVY = "#003865";
const NAVY_INK = "#0f172a";
const SLATE = "#475569";
const BORDER = "#cbd5e1";
const CARD_SHADOW = "0 7px 18px rgba(15, 23, 42, 0.055)";

type PiWorkstream =
  | "Federal NV POD 1"
  | "Federal NV POD 2"
  | "TDC"
  | "State"
  | "Provision";

type PiGoal = {
  workstream: PiWorkstream;
  goal: string;
  objectives: readonly string[];
  dependencies: readonly string[];
  outcome: string;
};

const WORKSTREAM_STYLE: Record<
  PiWorkstream,
  { accent: string; surface: string; ink: string }
> = {
  "Federal NV POD 1": { accent: "#2563eb", surface: "#eff6ff", ink: "#1d4ed8" },
  "Federal NV POD 2": { accent: "#1d4ed8", surface: "#eff6ff", ink: "#1e40af" },
  TDC: { accent: "#0369a1", surface: "#f0f9ff", ink: "#075985" },
  State: { accent: "#0f766e", surface: "#f0fdfa", ink: "#115e59" },
  Provision: { accent: "#6d28d9", surface: "#f5f3ff", ink: "#5b21b6" },
};

/**
 * PI-wide planning framework. The supplied evidence establishes the five workstreams
 * and portfolio metrics, not per-team completion, scope, or burndown. Statements
 * below are leadership planning outcomes that require workstream confirmation.
 */
export const ROGER_PI4_GOALS: readonly PiGoal[] = [
  {
    workstream: "Federal NV POD 1",
    goal: "Advance assigned Priority Must Have Federal capabilities while making cross-team data, workflow, and defect dependencies visible.",
    objectives: [
      "Confirm the PI feature set, ownership, and dependency links for the pod’s Priority Must Have work.",
      "Identify dependencies on shared Roger, TDC, integration, and environment capabilities.",
      "Provide leadership-ready evidence for risks, blockers, and defect impact without inferring completion from the dashboard snapshot.",
    ],
    dependencies: [
      "Confirmed feature-to-team assignment",
      "Shared data and integration decisions",
      "Defect triage and environment readiness",
    ],
    outcome:
      "A transparent Federal POD 1 delivery view that can be sequenced with the rest of the PI once team-level evidence is supplied.",
  },
  {
    workstream: "Federal NV POD 2",
    goal: "Advance assigned Priority Must Have Federal capabilities and coordinate shared experience, dependency, and defect impacts across the PI.",
    objectives: [
      "Confirm the PI feature set, ownership, and dependency links for the pod’s Priority Must Have work.",
      "Align shared workflow and data impacts with Federal POD 1, TDC, State, and Provision.",
      "Surface blockers requiring portfolio-level sequencing or decision support.",
    ],
    dependencies: [
      "Confirmed feature-to-team assignment",
      "Cross-POD workflow alignment",
      "Shared platform and defect resolution",
    ],
    outcome:
      "A Federal POD 2 plan that is comparable with the other workstreams without asserting team-specific progress.",
  },
  {
    workstream: "TDC",
    goal: "Provide governed data, contract, access, environment, and defect-resolution support for PI-wide Roger delivery.",
    objectives: [
      "Confirm the TDC, IMS, and Gateway contract and validation path required by consuming Roger experiences.",
      "Triage shared data, performance, access, and defect items to the accountable current delivery team.",
      "Provide explicit data and technical decision inputs for Federal, State, and Provision sequencing.",
    ],
    dependencies: [
      "Named contract and data owners",
      "Current-team defect ownership",
      "Validation and environment evidence",
    ],
    outcome:
      "A governed shared-services path that reduces the risk of workstreams building against unconfirmed data or integration assumptions.",
  },
  {
    workstream: "State",
    goal: "Advance the State MVP filing, data, taxonomy, apportionment, and calculation-review foundations within the PI product boundary.",
    objectives: [
      "Confirm State filing footprint, current-year input, entity, jurisdiction, and apportionment scope.",
      "Align State taxonomy, mappings, and the required TDC / IMS / GoSystem discussion inputs.",
      "Use practitioner and SME evidence to refine calculation-review and downstream output requirements.",
    ],
    dependencies: [
      "State and Process SME confirmation",
      "TDC, IMS, and GoSystem data-movement decisions",
      "Confirmed representative scenarios and mappings",
    ],
    outcome:
      "A governed State MVP path with transparent practitioner review and explicitly managed integration dependencies.",
  },
  {
    workstream: "Provision",
    goal: "Advance Return-to-Provision, Deferred Rollforward, summary, export, and Bloomberg Tax Provision delivery readiness across the PI.",
    objectives: [
      "Confirm the provision workflow, data location, prior-year inputs, auditability, and output requirements.",
      "Validate BTP Export and Bloomberg Tax Provision handoff readiness without assuming an unapproved integration contract.",
      "Align Provision priorities with shared entity, prior-year, data, and defect dependencies.",
    ],
    dependencies: [
      "Provision product and data ownership",
      "Prior-year source and audit-history decisions",
      "BTP Export and downstream validation evidence",
    ],
    outcome:
      "A Provision plan that connects demonstrated workflow capability to the PI’s remaining data, integration, validation, and readiness decisions.",
  },
] as const;

const PI_ALIGNMENT = [
  [
    "Federal NV POD 1 + POD 2",
    "TDC",
    "Federal delivery requires clear shared data, contract, integration, environment, and defect-triage paths; detailed team dependencies remain to be confirmed.",
  ],
  [
    "TDC",
    "State + Provision",
    "TDC provides governed data and technical decision inputs. State and Provision confirm the consuming workflow, business rules, mappings, and review evidence.",
  ],
  [
    "State",
    "Provision",
    "State and Provision share entity, prior-year, source, review, and downstream-output dependency considerations; the exact contracts remain subject to confirmation.",
  ],
  [
    "All five workstreams",
    "Leadership",
    "The PI outcome is a sequenced, decision-ready portfolio: priority features, defects, dependencies, accountable owners, and readiness evidence can be managed together after team-level data is refreshed.",
  ],
] as const;

function MiniHeading({
  children,
  color = NAVY,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        color,
        fontSize: "9px",
        fontWeight: 900,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export default function RogerPilotPiGoals() {
  return (
    <section aria-labelledby="roger-pi-goals" style={{ marginBottom: "30px" }}>
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${BORDER}`,
          borderLeft: `4px solid ${NAVY}`,
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(15, 23, 42, 0.035)",
          marginBottom: "14px",
          padding: "13px 15px",
        }}
      >
        <div
          style={{
            color: NAVY,
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          PI-wide planning alignment
        </div>
        <h2
          id="roger-pi-goals"
          style={{
            color: NAVY_INK,
            fontSize: "20px",
            fontWeight: 900,
            letterSpacing: "-0.018em",
            margin: "4px 0 0",
          }}
        >
          PI4 Goals, Objectives & Cross-Workstream Outcome
        </h2>
        <p
          style={{
            color: SLATE,
            fontSize: "12px",
            lineHeight: 1.5,
            margin: "6px 0 0",
            maxWidth: "980px",
          }}
        >
          The leadership view organizes the five Team Roger workstreams around
          PI-wide outcomes. It is not a team burndown or completion view:
          detailed ownership, scope, sizing, dates, and status require a
          refreshed team-level export or reviewed artifact.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${BORDER}`,
          borderRadius: "11px",
          boxShadow: CARD_SHADOW,
          marginBottom: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: NAVY,
            color: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "space-between",
            padding: "12px 15px",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 900 }}>
              Cross-workstream outcome and dependency view
            </div>
            <div style={{ fontSize: "10px", marginTop: "3px", opacity: 0.86 }}>
              Relationship statements make PI-level coordination visible; they
              do not approve technical design or delivery commitments.
            </div>
          </div>
          <span
            style={{
              border: "1px solid rgba(255,255,255,0.32)",
              borderRadius: "999px",
              fontSize: "9px",
              fontWeight: 850,
              padding: "4px 8px",
            }}
          >
            Leadership coordination view
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              minWidth: "920px",
              width: "100%",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f5f9",
                  color: NAVY_INK,
                  textAlign: "left",
                }}
              >
                <th
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    padding: "10px 12px",
                    textTransform: "uppercase",
                  }}
                >
                  From
                </th>
                <th
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    padding: "10px 12px",
                    textTransform: "uppercase",
                  }}
                >
                  To / Impact
                </th>
                <th
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    padding: "10px 12px",
                    textTransform: "uppercase",
                  }}
                >
                  PI-wide Alignment
                </th>
              </tr>
            </thead>
            <tbody>
              {PI_ALIGNMENT.map((relationship, index) => (
                <tr
                  key={`${relationship[0]}-${relationship[1]}`}
                  style={{
                    background: index % 2 ? "#ffffff" : "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                    verticalAlign: "top",
                  }}
                >
                  <td
                    style={{
                      color: NAVY,
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "11px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {relationship[0]}
                  </td>
                  <td
                    style={{
                      color: NAVY_INK,
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "11px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {relationship[1]}
                  </td>
                  <td
                    style={{
                      color: SLATE,
                      fontSize: "11px",
                      lineHeight: 1.55,
                      padding: "11px 12px",
                    }}
                  >
                    {relationship[2]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {ROGER_PI4_GOALS.map(goal => {
          const style = WORKSTREAM_STYLE[goal.workstream];
          return (
            <article
              key={goal.workstream}
              style={{
                background: "#ffffff",
                border: `1px solid ${BORDER}`,
                borderLeft: `6px solid ${style.accent}`,
                borderRadius: "11px",
                boxShadow: CARD_SHADOW,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: `linear-gradient(90deg, ${style.surface} 0%, #ffffff 82%)`,
                  borderBottom: `1px solid ${BORDER}`,
                  padding: "15px 17px",
                }}
              >
                <div
                  style={{
                    color: style.ink,
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                  }}
                >
                  {goal.workstream}
                </div>
                <div
                  style={{
                    color: NAVY_INK,
                    fontSize: "16px",
                    fontWeight: 900,
                    letterSpacing: "-0.012em",
                    lineHeight: 1.35,
                    marginTop: "5px",
                  }}
                >
                  {goal.goal}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  gridTemplateColumns:
                    "minmax(300px, 1.05fr) minmax(300px, 0.95fr)",
                  padding: "16px 17px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <MiniHeading color={style.ink}>PI objectives</MiniHeading>
                  <ol
                    style={{
                      color: SLATE,
                      fontSize: "11px",
                      lineHeight: 1.55,
                      margin: "9px 0 0",
                      paddingLeft: "18px",
                    }}
                  >
                    {goal.objectives.map(objective => (
                      <li key={objective} style={{ marginBottom: "7px" }}>
                        {objective}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <MiniHeading color={style.ink}>
                    Dependencies and required alignment
                  </MiniHeading>
                  <ul
                    style={{
                      color: SLATE,
                      fontSize: "11px",
                      lineHeight: 1.55,
                      margin: "9px 0 0",
                      paddingLeft: "18px",
                    }}
                  >
                    {goal.dependencies.map(dependency => (
                      <li key={dependency} style={{ marginBottom: "7px" }}>
                        {dependency}
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${style.accent}44`,
                      borderRadius: "8px",
                      marginTop: "12px",
                      padding: "10px 11px",
                    }}
                  >
                    <MiniHeading color={style.ink}>PI outcome</MiniHeading>
                    <p
                      style={{
                        color: SLATE,
                        fontSize: "10px",
                        lineHeight: 1.5,
                        margin: "7px 0 0",
                      }}
                    >
                      {goal.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

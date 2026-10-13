import { Link } from "wouter";
import {
  ROGER_PI4_EXECUTIVE_METRICS,
  ROGER_PILOT_BACKLOG_SOURCE,
  ROGER_PILOT_BACKLOG_SUMMARY,
  ROGER_PILOT_FEATURES,
  type RogerPilotFeatureState,
} from "@/lib/rogerPilotBacklog";
import { ROGER_PI4_GOALS } from "@/components/RogerPilotPiGoals";
import RogerPilotPiGoals from "@/components/RogerPilotPiGoals";

const NAVY = "#003865";
const NAVY_INK = "#0f172a";
const GREEN = "#00843d";
const SLATE = "#475569";
const BORDER = "#cbd5e1";
const CARD_SHADOW = "0 8px 20px rgba(15, 23, 42, 0.06)";

const FEATURE_STATE_STYLE: Record<
  RogerPilotFeatureState,
  { color: string; surface: string }
> = {
  Requirements: { color: "#6d28d9", surface: "#f3e8ff" },
  New: { color: "#475569", surface: "#e2e8f0" },
  Active: { color: "#0369a1", surface: "#e0f2fe" },
  "On Hold": { color: "#b91c1c", surface: "#fee2e2" },
};

const WORKSTREAM_SCORECARD_ROWS = ROGER_PI4_EXECUTIVE_METRICS.workstreams.map(
  workstream => ({
    workstream,
    goal:
      ROGER_PI4_GOALS.find(candidate => candidate.workstream === workstream)
        ?.goal ?? "PI goal requires workstream confirmation.",
    metricStatus: "Not supplied — requires reviewed team-level extract",
  })
);

const SUMMARY_METRICS = [
  {
    label: "Total features",
    value: ROGER_PI4_EXECUTIVE_METRICS.totalFeatures,
    detail: "PI-wide feature inventory across all Team Roger workstreams",
    accent: NAVY,
    surface: "#f8fafc",
  },
  {
    label: "Priority Must Have",
    value: ROGER_PI4_EXECUTIVE_METRICS.priorityMustHaveFeatures,
    detail: "Features tagged Must Have in the supplied priority query",
    accent: GREEN,
    surface: "#f0fdf4",
  },
  {
    label: "Defects",
    value: ROGER_PI4_EXECUTIVE_METRICS.defects,
    detail: "PI-wide defect inventory for leadership triage",
    accent: "#b45309",
    surface: "#fffaf0",
  },
  {
    label: "Dependencies",
    value: ROGER_PI4_EXECUTIVE_METRICS.dependencies,
    detail: "Cross-workstream dependencies requiring coordinated ownership",
    accent: "#6d28d9",
    surface: "#faf5ff",
  },
] as const;

function FeatureStatePill({ state }: { state: RogerPilotFeatureState }) {
  const style = FEATURE_STATE_STYLE[state];
  return (
    <span
      style={{
        background: style.surface,
        border: `1px solid ${style.color}44`,
        borderRadius: "999px",
        color: style.color,
        display: "inline-flex",
        fontSize: "10px",
        fontWeight: 850,
        padding: "4px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {state}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
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
        {eyebrow}
      </div>
      <h2
        style={{
          color: NAVY_INK,
          fontSize: "20px",
          fontWeight: 900,
          letterSpacing: "-0.018em",
          margin: "4px 0 0",
        }}
      >
        {title}
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
        {description}
      </p>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  detail,
  accent,
  surface,
}: (typeof SUMMARY_METRICS)[number]) {
  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${accent}35`,
        borderRadius: "10px",
        boxShadow: "0 3px 10px rgba(15, 23, 42, 0.035)",
        minHeight: "126px",
        overflow: "hidden",
        padding: "14px 15px",
        position: "relative",
      }}
    >
      <div
        style={{
          background: accent,
          height: "4px",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          color: SLATE,
          fontSize: "9px",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: accent,
          fontSize: "32px",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginTop: "12px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: SLATE,
          fontSize: "10px",
          lineHeight: 1.35,
          marginTop: "8px",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

function WorkstreamScorecardTable() {
  const metricColumns = [
    "Features",
    "Priority Must Have",
    "Defects",
    "Dependencies",
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${BORDER}`,
        borderRadius: "11px",
        boxShadow: CARD_SHADOW,
        marginTop: "14px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          background: "#f8fafc",
          borderBottom: `1px solid ${BORDER}`,
          padding: "11px 14px",
        }}
      >
        <div
          style={{
            color: NAVY,
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          All-workstream metric capture
        </div>
        <div
          style={{
            color: SLATE,
            fontSize: "11px",
            lineHeight: 1.5,
            marginTop: "3px",
          }}
        >
          The table establishes a leadership scorecard shell for every Team
          Roger workstream. Metric values remain Not supplied until a reviewed
          team-level source is provided.
        </div>
      </div>
      <table
        style={{
          borderCollapse: "collapse",
          minWidth: "1040px",
          width: "100%",
        }}
      >
        <thead>
          <tr style={{ background: NAVY, color: "#ffffff", textAlign: "left" }}>
            {[
              "Workstream",
              "PI Goal / Focus",
              ...metricColumns,
              "Metric Status",
            ].map(column => (
              <th
                key={column}
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.06em",
                  padding: "10px 12px",
                  textTransform: "uppercase",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORKSTREAM_SCORECARD_ROWS.map((row, index) => (
            <tr
              key={row.workstream}
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
                {row.workstream}
              </td>
              <td
                style={{
                  color: SLATE,
                  fontSize: "10px",
                  lineHeight: 1.45,
                  minWidth: "330px",
                  padding: "11px 12px",
                }}
              >
                {row.goal}
              </td>
              {metricColumns.map(metric => (
                <td
                  key={metric}
                  style={{
                    color: "#64748b",
                    fontSize: "10px",
                    fontStyle: "italic",
                    padding: "11px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Not supplied
                </td>
              ))}
              <td
                style={{
                  color: "#7c2d12",
                  fontSize: "10px",
                  fontWeight: 750,
                  lineHeight: 1.4,
                  padding: "11px 12px",
                }}
              >
                {row.metricStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssessmentSummary({
  feature,
}: {
  feature: (typeof ROGER_PILOT_FEATURES)[number];
}) {
  return (
    <div
      style={{
        color: SLATE,
        fontSize: "10px",
        lineHeight: 1.5,
        maxWidth: "420px",
      }}
    >
      <strong style={{ color: NAVY_INK }}>Focus:</strong>{" "}
      {feature.deliveryFocus}
      <br />
      <strong style={{ color: NAVY_INK }}>Review finding:</strong>{" "}
      {feature.ownershipFinding}
    </div>
  );
}

export function buildRogerPilotBacklogMarkdown() {
  const featureInventory = ROGER_PILOT_FEATURES.map(
    feature =>
      `| ${feature.id} | ${feature.title} | ${feature.featureState} | ${feature.candidateWorkstream} |`
  ).join("\n");
  const piGoals = ROGER_PI4_GOALS.map(
    goal =>
      `### ${goal.workstream}\n\n**PI goal:** ${goal.goal}\n\n**Objectives:**\n${goal.objectives.map((objective, index) => `${index + 1}. ${objective}`).join("\n")}\n\n**Dependencies:**\n${goal.dependencies.map(dependency => `- ${dependency}`).join("\n")}\n\n**PI outcome:** ${goal.outcome}`
  ).join("\n\n");
  return `# Team Roger Executive PI4 Dashboard\n\n## Leadership snapshot\n\n- Total features: ${ROGER_PI4_EXECUTIVE_METRICS.totalFeatures}\n- Priority Must Have features: ${ROGER_PI4_EXECUTIVE_METRICS.priorityMustHaveFeatures}\n- Defects: ${ROGER_PI4_EXECUTIVE_METRICS.defects}\n- Dependencies: ${ROGER_PI4_EXECUTIVE_METRICS.dependencies}\n- Workstreams: ${ROGER_PI4_EXECUTIVE_METRICS.workstreams.join(", ")}\n- Source: ${ROGER_PI4_EXECUTIVE_METRICS.sourceLabel}\n- Captured: ${ROGER_PI4_EXECUTIVE_METRICS.capturedOn}\n- Boundary: ${ROGER_PI4_EXECUTIVE_METRICS.scopeNote}\n\n## PI4 goals, objectives, and cross-workstream outcome\n\n${piGoals}\n\n## Detailed parent-feature evidence register\n\nThe register is a 25-record evidence subset with visible child indicators, not a current full-inventory or team-metric extract.\n\n| Feature ID | Feature title | Parent state | Candidate workstream |\n| --- | --- | --- | --- |\n${featureInventory}\n\n## Leadership actions required\n\n1. Refresh the team-level extract with each workstream’s feature, Priority Must Have, defect, dependency, owner, state, scope, and delivery-date evidence.\n2. Confirm the eight cross-workstream dependencies, accountable owners, and decision dates.\n3. Expand the remaining ${ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount} hierarchy-marked parent records before deriving child-level commitment, readiness, or delivery conclusions.\n4. Confirm shared data, contract, environment, and defect decisions that affect Federal POD 1, Federal POD 2, TDC, State, and Provision.\n\n## Refresh rule\n\n${ROGER_PILOT_BACKLOG_SOURCE.refreshRule}\n`;
}

function exportCurrentAssessment() {
  const blob = new Blob([buildRogerPilotBacklogMarkdown()], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Team_Roger_Executive_PI4_Dashboard.md";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function RogerPilotBacklogPage() {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #f8fafc 0, #ffffff 440px)",
        fontFamily: "system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: "1460px",
        minHeight: "100%",
        padding: "28px 32px 56px",
      }}
    >
      <header
        style={{
          background:
            "linear-gradient(118deg, #002b4f 0%, #003865 58%, #075985 100%)",
          borderRadius: "15px",
          boxShadow: "0 12px 30px rgba(0, 56, 101, 0.2)",
          color: "#ffffff",
          marginBottom: "24px",
          overflow: "hidden",
          padding: "23px 25px",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexWrap: "wrap",
            gap: "18px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ maxWidth: "780px" }}>
            <div
              style={{
                color: "#bfdbfe",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
              }}
            >
              Executive Health · Post Pilot
            </div>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "30px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "7px 0 0",
              }}
            >
              Team Roger Executive PI4 Dashboard
            </h1>
            <p
              style={{
                color: "#dbeafe",
                fontSize: "13px",
                lineHeight: 1.5,
                margin: "8px 0 0",
              }}
            >
              PI-wide leadership snapshot for all Team Roger workstreams:
              portfolio metrics, goals, objectives, cross-workstream outcomes,
              dependencies, and evidence-bound detailed feature review.
            </p>
          </div>
          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              flexDirection: "column",
              gap: "9px",
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "999px",
                color: "#eff6ff",
                fontSize: "10px",
                fontWeight: 850,
                padding: "5px 9px",
              }}
            >
              PI-wide leadership snapshot
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={exportCurrentAssessment}
                style={{
                  background: "#ffffff",
                  border: "1px solid #ffffff",
                  borderRadius: "7px",
                  color: NAVY,
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 900,
                  padding: "9px 12px",
                }}
              >
                Export dashboard (.md)
              </button>
              <Link
                href="/post-pilot"
                style={{
                  border: "1px solid rgba(255,255,255,0.52)",
                  borderRadius: "7px",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 850,
                  padding: "9px 12px",
                  textDecoration: "none",
                }}
              >
                ← Back to Post Pilot
              </Link>
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.17)",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "19px",
            paddingTop: "12px",
          }}
        >
          {ROGER_PI4_EXECUTIVE_METRICS.workstreams.map(workstream => (
            <span
              key={workstream}
              style={{
                border: "1px solid rgba(255,255,255,0.24)",
                borderRadius: "999px",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                padding: "4px 8px",
              }}
            >
              {workstream}
            </span>
          ))}
        </div>
      </header>

      <section
        aria-labelledby="roger-pi-summary"
        style={{ marginBottom: "30px" }}
      >
        <SectionHeading
          eyebrow="Leadership snapshot"
          title="All Team Roger Workstreams — PI4 Portfolio Metrics"
          description="The first leadership snapshot captures the entire PI portfolio across Federal NV POD 1, Federal NV POD 2, TDC, State, and Provision. Team-level scope, remaining work, completed percentage, and burndown figures are intentionally not inferred from the supplied aggregate metrics."
        />
        <div
          id="roger-pi-summary"
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          }}
        >
          {SUMMARY_METRICS.map(metric => (
            <SummaryMetric key={metric.label} {...metric} />
          ))}
        </div>
        <div
          style={{
            background: "#f0f7fc",
            border: "1px solid #9dbad0",
            borderLeft: `4px solid ${NAVY}`,
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(15, 23, 42, 0.035)",
            color: NAVY_INK,
            fontSize: "11px",
            lineHeight: 1.55,
            marginTop: "12px",
            padding: "12px 14px",
          }}
        >
          <strong>Metric boundary:</strong> The supplied Executive PI4 Dashboard
          establishes only the aggregate portfolio counts shown above. Populate
          individual workstream scorecards after a reviewed team-level extract
          provides per-team scope, status, defect, dependency, and priority
          evidence.
        </div>
        <WorkstreamScorecardTable />
      </section>

      <RogerPilotPiGoals />

      <section
        aria-labelledby="dependencies-and-gaps"
        style={{ marginBottom: "30px" }}
      >
        <SectionHeading
          eyebrow="Leadership action register"
          title="PI-wide Dependencies, Gaps & Decision Questions"
          description="The portfolio has 8 identified dependencies, but the supplied snapshot does not expose dependency links, accountable owners, target dates, or impact for each. These action areas prepare the team-level dashboard refresh."
        />
        <div
          id="dependencies-and-gaps"
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              borderTop: `4px solid ${NAVY}`,
              borderRadius: "10px",
              boxShadow: CARD_SHADOW,
              padding: "15px",
            }}
          >
            <div
              style={{
                color: NAVY,
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Portfolio dependency control
            </div>
            <ul
              style={{
                color: SLATE,
                fontSize: "11px",
                lineHeight: 1.55,
                listStylePosition: "outside",
                listStyleType: "disc",
                margin: "10px 0 0",
                paddingLeft: "21px",
              }}
            >
              <li>
                Confirm all 8 dependencies with accountable owner, affected
                workstreams, required decision, and date.
              </li>
              <li>
                Separate shared TDC, integration, environment, and defect
                dependencies from team-owned delivery dependencies.
              </li>
              <li>
                Escalate dependencies that constrain multiple Priority Must Have
                features.
              </li>
            </ul>
          </div>
          <div
            style={{
              background: "#fffdf7",
              border: "1px solid #fed7aa",
              borderTop: "4px solid #b45309",
              borderRadius: "10px",
              boxShadow: CARD_SHADOW,
              padding: "15px",
            }}
          >
            <div
              style={{
                color: "#9a3412",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Defect triage control
            </div>
            <ul
              style={{
                color: "#7c2d12",
                fontSize: "11px",
                lineHeight: 1.55,
                listStylePosition: "outside",
                listStyleType: "disc",
                margin: "10px 0 0",
                paddingLeft: "21px",
              }}
            >
              <li>
                Classify all 23 defects by workstream, customer / practitioner
                impact, severity, blocker status, and release relevance.
              </li>
              <li>
                Confirm current owner for legacy Data, Gateway, environment, and
                shared-platform items.
              </li>
              <li>
                Keep defect counts separate from feature scope and completion
                reporting.
              </li>
            </ul>
          </div>
          <div
            style={{
              background: "#fffafa",
              border: "1px solid #fecaca",
              borderTop: "4px solid #b91c1c",
              borderRadius: "10px",
              boxShadow: CARD_SHADOW,
              padding: "15px",
            }}
          >
            <div
              style={{
                color: "#b91c1c",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Team scorecard gaps
            </div>
            <ul
              style={{
                color: "#7f1d1d",
                fontSize: "11px",
                lineHeight: 1.55,
                listStylePosition: "outside",
                listStyleType: "disc",
                margin: "10px 0 0",
                paddingLeft: "21px",
              }}
            >
              <li>
                Per-team feature count, Priority Must Have count, defect count,
                dependency count, scope, remaining work, and completion measure
                were not supplied.
              </li>
              <li>
                Do not derive team burndown, completion percentage, or target
                date from the aggregate snapshot.
              </li>
              <li>
                Refresh the detailed evidence register before using it as a
                PI-wide capacity or delivery-control view.
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            background: "#f0f7fc",
            border: "1px solid #9dbad0",
            borderLeft: `4px solid ${NAVY}`,
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(15, 23, 42, 0.035)",
            marginTop: "12px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              color: NAVY,
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Leadership decisions for the next PI review
          </div>
          <ol
            style={{
              color: NAVY_INK,
              columns: "2 290px",
              fontSize: "11px",
              lineHeight: 1.55,
              margin: "9px 0 0",
              paddingLeft: "18px",
            }}
          >
            <li>
              Validate the 93-feature population and the 50 Priority Must Have
              selection across all five workstreams.
            </li>
            <li>
              Assign an accountable owner and planned resolution path to each of
              the 8 dependencies.
            </li>
            <li>
              Confirm defect triage ownership and release relevance for the 23
              defects.
            </li>
            <li>
              Approve the team-level metrics extract needed to add workstream
              scorecards without inferring status or completion.
            </li>
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="parent-feature-review"
        style={{ marginBottom: "28px" }}
      >
        <SectionHeading
          eyebrow="Detailed evidence subset"
          title="Parent-Feature Review Register"
          description="The retained 25-record register provides captured feature-level context from a prior detailed evidence subset. It supports review and refresh activities but is not the current 93-feature team dashboard."
        />
        <div
          id="parent-feature-review"
          style={{
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: "11px",
            boxShadow: CARD_SHADOW,
            overflowX: "auto",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#f8fafc",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "space-between",
              padding: "10px 14px",
            }}
          >
            <div style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 900 }}>
              Parent-feature evidence register
            </div>
            <div style={{ color: SLATE, fontSize: "10px" }}>
              {ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildIndicatorCount}{" "}
              captured records ·{" "}
              {ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount} awaiting
              child-row expansion
            </div>
          </div>
          <table
            style={{
              borderCollapse: "collapse",
              minWidth: "900px",
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            <thead>
              <tr
                style={{
                  background: NAVY,
                  color: "#ffffff",
                  textAlign: "left",
                }}
              >
                <th
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    padding: "11px 12px",
                    textTransform: "uppercase",
                    width: "29%",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    padding: "11px 12px",
                    textTransform: "uppercase",
                    width: "13%",
                  }}
                >
                  Captured state
                </th>
                <th
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    padding: "11px 12px",
                    textTransform: "uppercase",
                    width: "23%",
                  }}
                >
                  Candidate workstream
                </th>
                <th
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    padding: "11px 12px",
                    textTransform: "uppercase",
                    width: "35%",
                  }}
                >
                  Review context
                </th>
              </tr>
            </thead>
            <tbody>
              {ROGER_PILOT_FEATURES.map((feature, index) => (
                <tr
                  key={feature.id}
                  style={{
                    background: index % 2 ? "#ffffff" : "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                    verticalAlign: "top",
                  }}
                >
                  <td
                    style={{
                      color: NAVY_INK,
                      fontSize: "11px",
                      fontWeight: 800,
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                      padding: "12px",
                    }}
                  >
                    <span style={{ color: NAVY }}>{feature.id}</span> ·{" "}
                    {feature.title}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <FeatureStatePill state={feature.featureState} />
                  </td>
                  <td
                    style={{
                      color: NAVY_INK,
                      fontSize: "10px",
                      fontWeight: 800,
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                      padding: "12px",
                    }}
                  >
                    {feature.candidateWorkstream}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <AssessmentSummary feature={feature} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

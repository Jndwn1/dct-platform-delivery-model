import { Link } from "wouter";
import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc";
import StatePocBaDiscoveryPackage from "@/components/StatePocBaDiscoveryPackage";
import {
  POST_PILOT_PLANNING_INVENTORY,
  POST_PILOT_PLANNING_SUMMARY,
} from "@/lib/postPilotPlanningInventory";

const PURPLE = "#7c3aed";
const PURPLE_INK = "#6d28d9";
const PURPLE_SURFACE = "#faf5ff";
const PURPLE_BORDER = "#e9d5ff";
const POD_DELIVERY_FLOW_IMAGE = "/manus-storage/pi4-pod-delivery-data-review-process_8340aaca.png";

type SprintPriorityArea = {
  title: string;
  accent: string;
  bullets: string[];
};

type Pi4Sprint = {
  sprint: string;
  dates: string;
  priorities?: SprintPriorityArea[];
};

const SPRINT_2_PRIORITY_AREAS: SprintPriorityArea[] = [
  {
    title: "DCT",
    accent: "#1e3a5f",
    bullets: [
      "UAT / MVP defects",
      "High / Critical first",
      "Backend / data support",
      "Cross-pod consultation",
    ],
  },
  {
    title: "State",
    accent: "#0f766e",
    bullets: [
      "Filing Footprint",
      "Automated Apportionment & Payments",
      "State Taxonomy / GoSystem Alignment",
    ],
  },
  {
    title: "Provision",
    accent: "#b45309",
    bullets: [
      "Package 1 — Return to Provision",
      "Prior-Year Provision + Prior-Year Tax Return ingestion",
      "RTP calculation / data foundation",
      "Corrections and governed downstream outputs",
    ],
  },
  {
    title: "Additional Objective",
    accent: PURPLE,
    bullets: [
      "Entity Mapping Requirements",
      "Non-Legal Entities",
    ],
  },
];

const PI4_SPRINT_TIMELINE: Pi4Sprint[] = [
  { sprint: "PI4 · Sprint 1", dates: "9/16 – 9/22" },
  { sprint: "PI4 · Sprint 2", dates: "9/23 – 10/6", priorities: SPRINT_2_PRIORITY_AREAS },
  { sprint: "PI4 · Sprint 3", dates: "10/7 – 10/20" },
  { sprint: "PI4 · Sprint 4", dates: "10/21 – 11/3" },
  { sprint: "PI4 · Sprint 5", dates: "11/4 – 11/17" },
];

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  color: string;
  surface?: string;
  border?: string;
};

function MetricCard({ label, value, detail, color, surface = "#ffffff", border = "#e2e8f0" }: MetricCardProps) {
  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderTop: `4px solid ${color}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", minHeight: "124px", padding: "14px" }}>
      <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.075em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color, fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, marginTop: "12px" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "10px", lineHeight: 1.45, marginTop: "7px" }}>{detail}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${PURPLE}`, marginBottom: "14px", paddingLeft: "12px" }}>
      <div style={{ color: PURPLE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>{eyebrow}</div>
      <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>{title}</h2>
      <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" }}>{description}</p>
    </div>
  );
}

export default function PostPilotPage() {
  const planningMetrics: MetricCardProps[] = [
    { label: "PI4 Planning Records", value: POST_PILOT_PLANNING_SUMMARY.planningRecordCount, detail: "Supplied planning inventory rows", color: PURPLE, surface: PURPLE_SURFACE, border: PURPLE_BORDER },
    { label: "Committed", value: POST_PILOT_PLANNING_SUMMARY.markedCommittedCount, detail: "No commitments captured", color: "#64748b", surface: "#f8fafc", border: "#cbd5e1" },
    { label: "Sized", value: POST_PILOT_PLANNING_SUMMARY.sizedCount, detail: "No sizing captured", color: "#64748b", surface: "#f8fafc", border: "#cbd5e1" },
    { label: "High Business Value", value: POST_PILOT_PLANNING_SUMMARY.highValueCount, detail: "Rated 9 or 10 in source", color: "#0f766e", surface: "#f0fdfa", border: "#99f6e4" },
    { label: "Linked ADO Dependencies", value: POST_PILOT_PLANNING_SUMMARY.linkedAdoDependencyCount, detail: `${POST_PILOT_PLANNING_SUMMARY.unresolvedDependencyCount} records show TBD`, color: "#b45309", surface: "#fffbeb", border: "#fde68a" },
  ];

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "28px 32px 48px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <div style={{ color: PURPLE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.1em", textTransform: "uppercase" }}>Executive Health</div>
          <h1 style={{ color: "#0f172a", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: "5px 0 0" }}>Post Pilot</h1>
          <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.5, margin: "6px 0 0", maxWidth: "760px" }}>
            A PI4 planning dashboard for managing post-pilot planning records, commitments, sizing, business value, and ADO dependencies without treating planning inventory as delivered work.
          </p>
        </div>
        <div style={{ backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE_BORDER}`, borderRadius: "999px", color: PURPLE_INK, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", padding: "7px 10px", textTransform: "uppercase" }}>
          Planning visibility only
        </div>
      </div>

      <section aria-labelledby="pi4-post-pilot-title" style={{ backgroundColor: PURPLE_SURFACE, border: `1px solid ${PURPLE_BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.07)", marginBottom: "26px", overflow: "hidden" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "18px", justifyContent: "space-between", padding: "18px 20px 14px" }}>
          <div>
            <div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900 }} id="pi4-post-pilot-title">PI 4</div>
            <div style={{ color: PURPLE, fontSize: "11px", fontWeight: 850, letterSpacing: "0.07em", marginTop: "3px", textTransform: "uppercase" }}>Post Pilot · Planning Visibility Only</div>
          </div>
          <div style={{ color: PURPLE, fontSize: "24px", fontWeight: 900, lineHeight: 1 }}>0%</div>
        </div>
        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", margin: "0 20px" }} />
        <div style={{ borderTop: `1px solid ${PURPLE_BORDER}`, marginTop: "14px", padding: "14px 20px 18px" }}>
          <div style={{ color: "#64748b", fontSize: "11px", fontStyle: "italic" }}>
            Planning visibility only — excluded from all PI4 and MVP delivery metrics. Commitment and sizing fields are displayed as supplied; neither has been captured for this inventory.
          </div>
          <Link href="/pi4-planning" style={{ color: PURPLE_INK, display: "inline-flex", fontSize: "12px", fontWeight: 850, marginTop: "12px", textDecoration: "none" }}>
            Open PI4 Sprint &amp; Story Tracker →
          </Link>
        </div>
      </section>

      <section aria-labelledby="pi4-sprint-timeline" style={{ marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 delivery calendar"
          title="PI4 Sprint Timeline"
          description="Planning cadence for the five PI4 sprints. Dates reflect the supplied PI4 sprint schedule."
        />
        <div style={{ background: "#ffffff", border: `1px solid ${PURPLE_BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", padding: "14px" }}>
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {PI4_SPRINT_TIMELINE.map((item, index) => (
              <div key={item.sprint} style={{ background: index === 1 ? PURPLE_SURFACE : "#f8fafc", border: `1px solid ${index === 1 ? PURPLE_BORDER : "#e2e8f0"}`, borderTop: `4px solid ${index === 1 ? PURPLE : "#94a3b8"}`, borderRadius: "8px", gridColumn: index === 1 || index >= 3 ? "span 2" : undefined, minHeight: "86px", padding: "11px 12px" }}>
                <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                  <span style={{ alignItems: "center", background: index === 1 ? PURPLE : "#475569", borderRadius: "999px", color: "#ffffff", display: "inline-flex", fontSize: "10px", fontWeight: 900, height: "21px", justifyContent: "center", width: "21px" }}>{index + 1}</span>
                  <span style={{ color: index === 1 ? PURPLE_INK : "#334155", fontSize: "11px", fontWeight: 850 }}>{item.sprint}</span>
                </div>
                <div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, letterSpacing: "-0.02em", marginTop: "12px" }}>{item.dates}</div>
                {item.priorities && (
                  <div style={{ borderTop: `1px solid ${PURPLE_BORDER}`, marginTop: "12px", paddingTop: "11px" }}>
                    <div style={{ color: PURPLE_INK, fontSize: "9px", fontWeight: 900, letterSpacing: "0.075em", marginBottom: "8px", textTransform: "uppercase" }}>Sprint 2 Goals &amp; Objectives</div>
                    <div style={{ display: "grid", gap: "7px", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
                      {item.priorities.map((area) => (
                        <div key={area.title} style={{ background: "#ffffff", border: `1px solid ${area.accent}33`, borderLeft: `3px solid ${area.accent}`, borderRadius: "6px", padding: "8px" }}>
                          <div style={{ color: area.accent, fontSize: "9px", fontWeight: 900, lineHeight: 1.2, marginBottom: "5px" }}>{area.title}</div>
                          <ul style={{ color: "#475569", fontSize: "9px", lineHeight: 1.35, margin: 0, paddingLeft: "13px" }}>
                            {area.bullets.map((bullet) => <li key={bullet} style={{ marginBottom: "2px" }}>{bullet}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ color: "#64748b", fontSize: "10px", fontStyle: "italic", marginTop: "11px" }}>Sprint 2 is visually highlighted as the immediate post-launch planning window.</div>
        </div>
      </section>

      <section aria-labelledby="pi4-planning-metrics" style={{ marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 planning inventory"
          title="Post Pilot Metrics"
          description="These values describe the submitted planning inventory only. They do not represent active or completed PI4 delivery."
        />
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))" }}>
          {planningMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
      </section>

      <section aria-labelledby="planned-pi4-features">
        <SectionHeading
          eyebrow="Planning inventory detail"
          title="Planned Features and ADO Dependencies"
          description="Feature and dependency details transcribed from the supplied Post Pilot planning inventory. Blank source fields remain marked as not captured; TBD dependencies remain unresolved."
        />
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
          <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", padding: "11px 14px" }}>
            <div id="planned-pi4-features" style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>Post Pilot feature inventory</div>
            <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 850 }}>No PI4 delivery commitment recorded</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1060px", width: "100%" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "#ffffff", textAlign: "left" }}>
                  {[
                    "Obj. #",
                    "Feature / Objective Description",
                    "Committed?",
                    "Business Value (1–10)",
                    "Sizing",
                    "ADO Story / Dependency IDs",
                  ].map((label) => (
                    <th key={label} style={{ fontSize: "10px", fontWeight: 850, letterSpacing: "0.055em", padding: "10px 12px", textTransform: "uppercase" }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POST_PILOT_PLANNING_INVENTORY.map((record, index) => {
                  const dependencyIsTbd = record.adoDependencies === "TBD";
                  const dependencyText = Array.isArray(record.adoDependencies) ? record.adoDependencies.join(", ") : "TBD";
                  return (
                    <tr key={`${record.featureId}-${record.objectiveNumber || index}`} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}>
                      <td style={{ color: "#475569", fontSize: "12px", fontWeight: 800, padding: "11px 12px", textAlign: "center", width: "6%" }}>{record.objectiveNumber || "—"}</td>
                      <td style={{ padding: "11px 12px", width: "39%" }}>
                        <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 850 }}>FEATURE {record.featureId}</div>
                        <div style={{ color: "#1e293b", fontSize: "12px", fontWeight: 700, lineHeight: 1.4, marginTop: "3px" }}>{record.objectiveDescription}</div>
                      </td>
                      <td style={{ color: "#64748b", fontSize: "11px", padding: "11px 12px", width: "12%" }}>{record.committed}</td>
                      <td style={{ padding: "11px 12px", width: "13%" }}>
                        {record.businessValue === null ? <span style={{ color: "#94a3b8", fontSize: "11px" }}>Not provided</span> : (
                          <span style={{ background: record.businessValue === 10 ? "#dcfce7" : "#eff6ff", border: `1px solid ${record.businessValue === 10 ? "#86efac" : "#bfdbfe"}`, borderRadius: "99px", color: record.businessValue === 10 ? "#166534" : "#1d4ed8", display: "inline-flex", fontSize: "11px", fontWeight: 850, padding: "3px 7px" }}>{record.businessValue}</span>
                        )}
                      </td>
                      <td style={{ color: "#64748b", fontSize: "11px", padding: "11px 12px", width: "12%" }}>{record.sizing}</td>
                      <td style={{ padding: "11px 12px", width: "18%" }}>
                        {dependencyIsTbd ? <span style={{ color: "#b45309", fontSize: "11px", fontWeight: 850 }}>TBD</span> : <span style={{ color: "#334155", fontSize: "11px", lineHeight: 1.45 }}>{dependencyText}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="pi4-pod-delivery-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 delivery operating model"
          title="PI4 Pod Delivery & Data Review Process"
          description="Visual process flow showing how high-level functionality moves through requirements, pod review, Gary data sign-off when needed, pod implementation, accountability, and TDC/DCT cross-functional support."
        />
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
          <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
            <div id="pi4-pod-delivery-flow" style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>Pod delivery and data review flow</div>
            <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 850 }}>PO / Process · Pod Lead / BAs · Gary / Data Review · Pod Development · TDC/DCT Support</div>
              <a href={POD_DELIVERY_FLOW_IMAGE} target="_blank" rel="noopener noreferrer" style={{ background: "#0f172a", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, padding: "7px 9px", textDecoration: "none" }}>Open readable flow</a>
            </div>
          </div>
          <div style={{ overflowX: "auto", padding: "14px" }}>
            <img
              src={POD_DELIVERY_FLOW_IMAGE}
              alt="PI4 Pod Delivery and Data Review Process swimlane showing PO, Process Team, Pod Lead, BAs, Gary Data Review, Pod Development Team, and TDC/DCT cross-functional support path"
              style={{ border: "1px solid #cbd5e1", borderRadius: "8px", display: "block", maxWidth: "100%", minWidth: "980px", width: "100%" }}
            />
          </div>
          <div style={{ background: PURPLE_SURFACE, borderTop: `1px solid ${PURPLE_BORDER}`, color: "#475569", display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", padding: "12px 14px" }}>
            <div>
              <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>Main delivery path</div>
              <p style={{ fontSize: "11px", lineHeight: 1.45, margin: "5px 0 0" }}>PO, Process Team, and Pod Lead define the outcome; Pod Lead and BAs decompose requirements; the pod reviews stories, routes data work to Gary for sign-off, then returns to the pod for implementation and delivery.</p>
            </div>
            <div>
              <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>TDC / DCT support lane</div>
              <p style={{ fontSize: "11px", lineHeight: 1.45, margin: "5px 0 0" }}>TDC/DCT handles MVP/UAT defects, cross-pod data work, migration/shared technical work, and Scrum of Scrums capacity support when work spans multiple pods or is better handled centrally.</p>
            </div>
          </div>
        </div>
      </section>

      <StateGoSystemPoc />
      <StatePocBaDiscoveryPackage />
      <StateGoSystemPocClosingDetails />
    </div>
  );
}

import { Link } from "wouter";
import ExecutiveProcessFlow, { type ExecutiveFlowStep } from "@/components/ExecutiveProcessFlow";
import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc";
import StatePocBaDiscoveryPackage from "@/components/StatePocBaDiscoveryPackage";
import StateProvisionPrototypeFlow from "@/components/StateProvisionPrototypeFlow";
import StateProvisionStoryReview from "@/components/StateProvisionStoryReview";
import PostPilotDeploymentSnapshot from "@/components/PostPilotDeploymentSnapshot";
import {
  POST_PILOT_PLANNING_INVENTORY,
  POST_PILOT_PLANNING_SOURCE_SELECTION,
  POST_PILOT_PLANNING_SUMMARY,
  POST_PILOT_PLANNING_SPRINT,
} from "@/lib/postPilotPlanningInventory";

const PURPLE = "#7c3aed";
const PURPLE_INK = "#6d28d9";
const PURPLE_SURFACE = "#faf5ff";
const PURPLE_BORDER = "#e9d5ff";
const PROVISION_PROTOTYPE_URL = "https://rogertaxpro-bkwikmrm.manus.space/";

type SprintPriorityArea = {
  title: string;
  accent: string;
  bullets: string[];
};

type Pi4Sprint = {
  number: 2 | 3 | 4 | 5;
  sprint: string;
  dates: string;
  priorities?: SprintPriorityArea[];
  workItemCount?: number;
};

type SprintWorkItem = {
  itemNumber: number;
  title: string;
  status: "Active" | "New" | "Requirements" | "Review Ready" | "QA Ready" | "Awaiting Approval" | "On Hold";
  owners: string;
  parentFeature: string;
  parentFeatureId: number;
};

type SprintMetricSnapshot = {
  sprint: Pi4Sprint["number"];
  source: string;
  closeout?: {
    totalWorkItems: number;
    completedClosed: number;
    carriedForward: number;
    completionRate: number;
    carryoverRate: number;
  };
};

const SPRINT_2_PRIORITY_AREAS: SprintPriorityArea[] = [
  {
    title: "TDC",
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
  { number: 2, sprint: "PI4 · Sprint 2", dates: "9/23 – 10/6", priorities: SPRINT_2_PRIORITY_AREAS },
  { number: 3, sprint: "PI4 · Sprint 3", dates: "10/7 – 10/20", workItemCount: 14 },
  { number: 4, sprint: "PI4 · Sprint 4", dates: "10/21 – 11/3" },
  { number: 5, sprint: "PI4 · Sprint 5", dates: "11/4 – 11/17" },
];

const SPRINT_3_WORK_ITEMS: SprintWorkItem[] = [
  { itemNumber: 1, title: "PriorYearAmounts Batch Post returns 500", status: "Active", owners: "Sajja, Reshma", parentFeature: "Implement TDC Prior Year Data Persistence", parentFeatureId: 1481607 },
  { itemNumber: 2, title: "TDC — Implement Database Architecture Enhancements and…", status: "New", owners: "Luca, Gary", parentFeature: "Roger Core | TDC — Database Architecture …", parentFeatureId: 1503663 },
  { itemNumber: 3, title: "TDC — Expand MappingCarryForward to Match Confirmed M…", status: "Requirements", owners: "Luca, Gary", parentFeature: "Data & Workflow Enhancements", parentFeatureId: 1501719 },
  { itemNumber: 4, title: "TDC — Create Governed State Input Code Reference Data an…", status: "Requirements", owners: "Luca, Gary", parentFeature: "TDC — Governed State Input Code Referen…", parentFeatureId: 1501980 },
  { itemNumber: 5, title: "TDC - Retrieve and Migrate Prior Year Financial Amounts for …", status: "Review Ready", owners: "Luca, Gary", parentFeature: "Roll-forward (prior yr TWB)", parentFeatureId: 1472917 },
  { itemNumber: 6, title: "Roger UI | Book Return Review | Line 22 is missing in Book R…", status: "Active", owners: "Willis, Morgan", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1463645 },
  { itemNumber: 7, title: "Perf Env - TDC - DTUs (100) Reaching 100%", status: "New", owners: "Luca, Gary", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1483802 },
  { itemNumber: 8, title: "TDC | Return Filings | Return Filing Page Counts Each Unma…", status: "QA Ready", owners: "Luca, Gary", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1488477 },
  { itemNumber: 9, title: "TDC | Return Filings | TB with Line Mapping Issue Is Not Dis…", status: "QA Ready", owners: "Luca, Gary", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1488494 },
  { itemNumber: 10, title: "Roger UAT | Known Line Mappings Require Reapproval and …", status: "QA Ready", owners: "Luca, Gary", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1497978 },
  { itemNumber: 11, title: "Perf Env - Gateway Calls Failure", status: "QA Ready", owners: "Luca, Gary", parentFeature: "Data — Defect & Bug Management", parentFeatureId: 1487890 },
  { itemNumber: 12, title: "Define Data Type & Validation Standards for TDC → IMS → …", status: "Awaiting Approval", owners: "Luca, Gary", parentFeature: "Finding - 5.2 API and Payload Definitions", parentFeatureId: 1433863 },
  { itemNumber: 13, title: "Data Gateway - Support Creation and Storage of New Acco…", status: "On Hold", owners: "Luca, Gary", parentFeature: "User-Defined Nonstandard TDC Codes", parentFeatureId: 1450150 },
  { itemNumber: 14, title: "Implement Persistent Manual Client Accounts as First-Class …", status: "On Hold", owners: "Luca, Gary", parentFeature: "User-Defined Nonstandard TDC Codes", parentFeatureId: 1454679 },
];

const POST_PILOT_SPRINT_METRICS: SprintMetricSnapshot[] = [
  {
    sprint: 2,
    source: "Supplied TDC — PI4 Sprint 2 closeout summary",
    closeout: {
      totalWorkItems: 12,
      completedClosed: 9,
      carriedForward: 3,
      completionRate: 75,
      carryoverRate: 25,
    },
  },
  { sprint: 3, source: "Backlog snapshot not yet supplied" },
  { sprint: 4, source: "Backlog snapshot not yet supplied" },
  { sprint: 5, source: "Backlog snapshot not yet supplied" },
];

const POD_DELIVERY_FLOW_STEPS: readonly ExecutiveFlowStep[] = [
  { label: "1 · Define outcome", title: "PO / Process / Pod Lead", detail: "Set the business outcome, scope boundary, and expected value before a story is decomposed.", accent: PURPLE, surface: PURPLE_SURFACE },
  { label: "2 · Ready the work", title: "Pod Lead + BA", detail: "Translate the outcome into scoped requirements, dependencies, and testable acceptance criteria.", accent: "#2563eb", surface: "#eff6ff" },
  { label: "3 · Validate approach", title: "Pod Review", detail: "Confirm implementation approach, ownership, sequencing, and any data-story implications.", accent: "#0369a1", surface: "#f0f9ff" },
  { label: "4 · Data control", title: "Gary Review — when needed", detail: "Provide final technical review for data, API, persistence, architecture, and repository decisions.", accent: "#b45309", surface: "#fffbeb" },
  { label: "5 · Build and test", title: "Owning Pod", detail: "Implement, test, and return delivery evidence to the accountable product and business owners.", accent: "#0f766e", surface: "#f0fdfa" },
  { label: "6 · Confirm outcome", title: "PO + Leadership", detail: "Assess delivered capability, risk, and readiness against the original intended outcome.", accent: PURPLE, surface: PURPLE_SURFACE },
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
    { label: "PI4 Planning Records", value: POST_PILOT_PLANNING_SUMMARY.planningRecordCount, detail: `${POST_PILOT_PLANNING_SPRINT} feature rows`, color: PURPLE, surface: PURPLE_SURFACE, border: PURPLE_BORDER },
    { label: "Committed", value: POST_PILOT_PLANNING_SUMMARY.markedCommittedCount, detail: "No commitments captured", color: "#64748b", surface: "#f8fafc", border: "#cbd5e1" },
    { label: "Sized", value: POST_PILOT_PLANNING_SUMMARY.sizedCount, detail: "No sizing captured", color: "#64748b", surface: "#f8fafc", border: "#cbd5e1" },
    { label: "High Business Value", value: POST_PILOT_PLANNING_SUMMARY.highValueCount, detail: "Rated 9 or 10 in source", color: "#0f766e", surface: "#f0fdfa", border: "#99f6e4" },
    { label: "Linked ADO Dependencies", value: POST_PILOT_PLANNING_SUMMARY.linkedAdoDependencyCount, detail: POST_PILOT_PLANNING_SUMMARY.unresolvedDependencyCount === 0 ? "All supplied dependencies are identified" : `${POST_PILOT_PLANNING_SUMMARY.unresolvedDependencyCount} records show TBD`, color: "#b45309", surface: "#fffbeb", border: "#fde68a" },
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
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <Link href="/post-pilot/roger-pilot-backlog" style={{ background: "#003865", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, letterSpacing: "0.04em", padding: "8px 10px", textDecoration: "none", textTransform: "uppercase" }}>
            Roger Pilot Backlog
          </Link>
          <Link href="/post-pilot/state-taxonomy-readiness" style={{ background: "#0f766e", borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 850, letterSpacing: "0.04em", padding: "8px 10px", textDecoration: "none", textTransform: "uppercase" }}>
            State Taxonomy Readiness
          </Link>
          <div style={{ backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE_BORDER}`, borderRadius: "999px", color: PURPLE_INK, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", padding: "7px 10px", textTransform: "uppercase" }}>
            Planning visibility only
          </div>
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
            Open PI4 Sprint &amp; Feature Tracker →
          </Link>
        </div>
      </section>

      <section aria-labelledby="pi4-sprint-timeline" style={{ marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 delivery calendar"
          title="PI4 Sprint Timeline"
          description="Planning cadence for Sprints 2–5. Dates reflect the supplied PI4 delivery schedule."
        />
        <div style={{ background: "#ffffff", border: `1px solid ${PURPLE_BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", padding: "14px" }}>
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {PI4_SPRINT_TIMELINE.map((item, index) => (
              <div key={item.sprint} style={{ background: item.priorities ? PURPLE_SURFACE : "#f8fafc", border: `1px solid ${item.priorities ? PURPLE_BORDER : "#e2e8f0"}`, borderTop: `4px solid ${item.priorities ? PURPLE : "#94a3b8"}`, borderRadius: "8px", gridColumn: item.priorities || index >= 3 ? "span 2" : undefined, minHeight: "86px", padding: "11px 12px" }}>
                <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                  <span style={{ alignItems: "center", background: item.priorities ? PURPLE : "#475569", borderRadius: "999px", color: "#ffffff", display: "inline-flex", fontSize: "10px", fontWeight: 900, height: "21px", justifyContent: "center", width: "21px" }}>{item.number}</span>
                  <span style={{ color: item.priorities ? PURPLE_INK : "#334155", fontSize: "11px", fontWeight: 850 }}>{item.sprint}</span>
                </div>
                <div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, letterSpacing: "-0.02em", marginTop: "12px" }}>{item.dates}</div>
                {item.workItemCount && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "999px", color: "#1d4ed8", display: "inline-flex", fontSize: "9px", fontWeight: 850, marginTop: "9px", padding: "4px 7px" }}>{item.workItemCount} supplied work items</div>}
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

      <section aria-labelledby="sprint-3-work-items" style={{ marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="TDC PI4 · Sprint 3"
          title="Sprint 3 Work-Item Snapshot"
          description="Fourteen work items captured from the supplied ADO screenshot, including status, listed owners, and parent-feature references. Titles retain source truncation where the screenshot does not show the full text."
        />
        <div style={{ background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
          <div style={{ alignItems: "center", background: "#eff6ff", borderBottom: "1px solid #bfdbfe", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", padding: "11px 14px" }}>
            <div style={{ color: "#1e3a5f", fontSize: "12px", fontWeight: 900 }}>14 captured work items</div>
            <div style={{ background: "#ffffff", border: "1px solid #93c5fd", borderRadius: "999px", color: "#1d4ed8", fontSize: "9px", fontWeight: 850, padding: "4px 7px" }}>Screenshot-backed backlog snapshot</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "980px", width: "100%" }}>
              <thead>
                <tr style={{ background: "#1e3a5f" }}>
                  {[
                    { label: "#", width: "48px" },
                    { label: "Work item", width: "38%" },
                    { label: "Status", width: "12%" },
                    { label: "Listed owner(s)", width: "15%" },
                    { label: "Parent feature", width: "25%" },
                  ].map((column) => <th key={column.label} style={{ color: "#ffffff", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "9px 10px", textAlign: "left", textTransform: "uppercase", width: column.width }}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {SPRINT_3_WORK_ITEMS.map((item, index) => {
                  const statusColors: Record<SprintWorkItem["status"], { background: string; border: string; color: string }> = {
                    Active: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
                    New: { background: "#f8fafc", border: "#cbd5e1", color: "#475569" },
                    Requirements: { background: "#faf5ff", border: "#e9d5ff", color: "#7e22ce" },
                    "Review Ready": { background: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
                    "QA Ready": { background: "#f0fdfa", border: "#99f6e4", color: "#0f766e" },
                    "Awaiting Approval": { background: "#fffbeb", border: "#fde68a", color: "#a16207" },
                    "On Hold": { background: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
                  };
                  const statusColor = statusColors[item.status];
                  return (
                    <tr key={`${item.parentFeatureId}-${item.itemNumber}`} style={{ background: index % 2 === 0 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                      <td style={{ color: "#64748b", fontSize: "11px", fontWeight: 850, padding: "10px" }}>{item.itemNumber}</td>
                      <td style={{ color: "#1e293b", fontSize: "11px", fontWeight: 750, lineHeight: 1.4, padding: "10px" }}>{item.title}</td>
                      <td style={{ padding: "10px" }}><span style={{ background: statusColor.background, border: `1px solid ${statusColor.border}`, borderRadius: "999px", color: statusColor.color, display: "inline-flex", fontSize: "9px", fontWeight: 850, padding: "4px 7px", whiteSpace: "nowrap" }}>{item.status}</span></td>
                      <td style={{ color: "#475569", fontSize: "10px", lineHeight: 1.4, padding: "10px" }}>{item.owners}</td>
                      <td style={{ color: "#334155", fontSize: "10px", lineHeight: 1.4, padding: "10px" }}><strong>{item.parentFeature}</strong><br /><span style={{ color: "#64748b" }}>Feature {item.parentFeatureId}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "10px", lineHeight: 1.45, padding: "10px 14px" }}>
            <strong>Source boundary:</strong> The capture shows parent-feature references and status/owner information. Individual work-item IDs and any truncated title text were not visible and are not inferred here.
          </div>
        </div>
      </section>

      <section aria-labelledby="pi4-sprint-metrics" style={{ marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 sprint planning"
          title="Sprint Metrics"
          description="TDC Sprint 2 closeout and subsequent-sprint visibility. Closeout indicators remain separate from PI4 portfolio progress and MVP KPIs."
        />
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {POST_PILOT_SPRINT_METRICS.map((metric) => {
            const closeout = metric.closeout;
            const hasSnapshot = closeout !== undefined;
            return (
              <div key={metric.sprint} style={{ background: metric.sprint === 2 ? PURPLE_SURFACE : "#ffffff", border: `1px solid ${metric.sprint === 2 ? PURPLE_BORDER : "#e2e8f0"}`, borderTop: `4px solid ${metric.sprint === 2 ? PURPLE : "#94a3b8"}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", minHeight: "172px", padding: "14px" }}>
                <div style={{ alignItems: "center", display: "flex", gap: "8px", justifyContent: "space-between" }}>
                  <div style={{ color: metric.sprint === 2 ? PURPLE_INK : "#334155", fontSize: "12px", fontWeight: 900 }}>{metric.sprint === 2 ? "TDC · PI4 Sprint 2" : `PI4 · Sprint ${metric.sprint}`}</div>
                  <div style={{ background: hasSnapshot ? "#dcfce7" : "#f8fafc", border: `1px solid ${hasSnapshot ? "#86efac" : "#cbd5e1"}`, borderRadius: "999px", color: hasSnapshot ? "#166534" : "#64748b", fontSize: "9px", fontWeight: 850, padding: "3px 7px" }}>{hasSnapshot ? "Closeout source" : "Pending source"}</div>
                </div>
                {closeout ? (
                  <>
                    <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "14px" }}>
                      {[
                        { label: "Total sprint work items", value: closeout.totalWorkItems, color: PURPLE_INK },
                        { label: "Completed / closed", value: closeout.completedClosed, color: "#15803d" },
                        { label: "Carried forward to Sprint 3", value: closeout.carriedForward, color: "#2563eb" },
                        { label: "Completion rate", value: `${closeout.completionRate}%`, color: "#15803d" },
                        { label: "Carryover rate", value: `${closeout.carryoverRate}%`, color: "#2563eb" },
                      ].map((item) => (
                        <div key={item.label} style={{ background: "#ffffff", border: `1px solid ${item.color}22`, borderLeft: `3px solid ${item.color}`, borderRadius: "6px", padding: "8px" }}>
                          <div style={{ color: item.color, fontSize: "18px", fontWeight: 900, lineHeight: 1 }}>{item.value}</div>
                          <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 800, lineHeight: 1.3, marginTop: "4px", textTransform: "uppercase" }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#64748b", fontSize: "11px", lineHeight: 1.5, marginTop: "19px" }}>Closeout metrics will populate when the sprint source summary is supplied. No values are inferred.</div>
                )}
                <div style={{ color: "#64748b", fontSize: "9px", lineHeight: 1.4, marginTop: hasSnapshot ? "10px" : "15px" }}>Source: {metric.source}</div>
              </div>
            );
          })}
        </div>
      </section>

      <PostPilotDeploymentSnapshot />

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
          description={`${POST_PILOT_PLANNING_SPRINT} feature and dependency details transcribed from the supplied ADO backlog snapshot. Commitment and sizing remain marked as not captured.`}
        />
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
          <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", padding: "11px 14px" }}>
            <div id="planned-pi4-features" style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>{POST_PILOT_PLANNING_SPRINT} feature inventory</div>
            <div style={{ color: PURPLE_INK, fontSize: "10px", fontWeight: 850 }}>{POST_PILOT_PLANNING_SOURCE_SELECTION} · No PI4 delivery commitment recorded</div>
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

      <section aria-labelledby="post-pilot-prototypes" style={{ marginTop: "26px", marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="Post Pilot experience references"
          title="State & Provision Prototypes"
          description="Interactive Roger-aligned reference experiences supporting PI4 planning, story refinement, and stakeholder walkthroughs."
        />
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderLeft: "4px solid #0f766e", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", padding: "16px" }}>
            <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>State prototype</div>
            <div id="post-pilot-prototypes" style={{ color: "#0f172a", fontSize: "15px", fontWeight: 900, marginTop: "6px" }}>Roger — State Compliance Prototype</div>
            <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, margin: "8px 0 14px" }}>Roger-aligned State filing workflow reference from Return Filings through Outputs &amp; Tracking. It supports PI4 State planning while preserving the separate Federal experience.</p>
            <Link href="/state-compliance" style={{ alignItems: "center", background: "#0f766e", borderRadius: "6px", color: "#ffffff", display: "inline-flex", fontSize: "11px", fontWeight: 850, padding: "9px 12px", textDecoration: "none" }}>Open State Prototype →</Link>
          </div>
          <div style={{ background: PURPLE_SURFACE, border: `1px solid ${PURPLE_BORDER}`, borderLeft: `4px solid ${PURPLE}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", padding: "16px" }}>
            <div style={{ color: PURPLE, fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Provision prototype</div>
            <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 900, marginTop: "6px" }}>Roger — Tax Provision Prototype</div>
            <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, margin: "8px 0 14px" }}>Interactive Roger Provision prototype illustrating the proposed Provision workflow, screen sequence, Return-to-Provision experience, Deferred Rollforward, and related practitioner interactions.</p>
            <a href={PROVISION_PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" style={{ alignItems: "center", background: PURPLE, borderRadius: "6px", color: "#ffffff", display: "inline-flex", fontSize: "11px", fontWeight: 850, padding: "9px 12px", textDecoration: "none" }}>Open Provision Prototype ↗</a>
          </div>
        </div>
      </section>

      <StateProvisionPrototypeFlow />

      <section aria-labelledby="pi4-pod-delivery-flow" style={{ marginTop: "26px", marginBottom: "26px" }}>
        <SectionHeading
          eyebrow="PI4 delivery operating model"
          title="PI4 Pod Delivery & Data Review Process"
          description="Executive delivery sequence from outcome definition through accountable implementation and readiness confirmation. Gary’s review is a decision control for data work, not a delivery approval substitute."
        />
        <div id="pi4-pod-delivery-flow">
          <ExecutiveProcessFlow
            ariaLabel="PI4 pod delivery and data review executive process flow"
            steps={POD_DELIVERY_FLOW_STEPS}
            supportNote="TDC/DCT handles MVP/UAT defects, cross-pod data work, migration/shared technical work, and Scrum of Scrums capacity support when work spans multiple pods or is better handled centrally."
            outcome="Work progresses through clear ownership, with technical data controls applied only where needed and delivery accountability retained by the owning pod."
          />
        </div>
      </section>

      <StateProvisionStoryReview />
      <StateGoSystemPoc />
      <StatePocBaDiscoveryPackage />
      <StateGoSystemPocClosingDetails />
    </div>
  );
}

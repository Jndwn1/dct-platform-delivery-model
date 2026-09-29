import { Link } from "wouter";
import {
  ROGER_PILOT_BACKLOG_SOURCE,
  ROGER_PILOT_BACKLOG_SUMMARY,
  ROGER_PILOT_FEATURES,
  type RogerPilotFeatureState,
} from "@/lib/rogerPilotBacklog";
import {
  ROGER_PI4_SPRINT_2_ALIGNMENT,
  ROGER_PI4_SPRINT_2_FEATURE_TITLES,
  ROGER_PI4_SPRINT_2_GOALS,
} from "@/lib/rogerPilotSprintGoals";
import RogerPilotSprintGoals from "@/components/RogerPilotSprintGoals";

const NAVY = "#003865";
const NAVY_INK = "#0f172a";
const GREEN = "#00843d";
const SLATE = "#475569";
const LIGHT_GRAY = "#f1f5f9";
const BORDER = "#cbd5e1";

const FEATURE_STATE_STYLE: Record<RogerPilotFeatureState, { color: string; surface: string }> = {
  Requirements: { color: "#6d28d9", surface: "#f3e8ff" },
  New: { color: "#475569", surface: "#e2e8f0" },
  Active: { color: "#0369a1", surface: "#e0f2fe" },
  "On Hold": { color: "#b91c1c", surface: "#fee2e2" },
};

function FeatureStatePill({ state }: { state: RogerPilotFeatureState }) {
  const style = FEATURE_STATE_STYLE[state];
  return <span style={{ background: style.surface, border: `1px solid ${style.color}44`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "10px", fontWeight: 850, padding: "3px 7px", whiteSpace: "nowrap" }}>{state}</span>;
}

function EvidencePill({ label }: { label: string }) {
  const isCaptured = label === "Child rows captured";
  return <span style={{ background: isCaptured ? "#ecfdf5" : "#fffbeb", border: `1px solid ${isCaptured ? "#86efac" : "#fcd34d"}`, borderRadius: "999px", color: isCaptured ? "#166534" : "#92400e", display: "inline-flex", fontSize: "9px", fontWeight: 850, padding: "3px 7px", whiteSpace: "nowrap" }}>{label}</span>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${NAVY}`, marginBottom: "14px", paddingLeft: "12px" }}>
      <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>{eyebrow}</div>
      <h2 style={{ color: NAVY_INK, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>{title}</h2>
      <p style={{ color: SLATE, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "970px" }}>{description}</p>
    </div>
  );
}

function childEvidenceLabel(feature: (typeof ROGER_PILOT_FEATURES)[number]) {
  return feature.childEvidence === "Captured child rows" ? "Child rows captured" : "Child rows need expansion";
}

function AssessmentSummary({ feature }: { feature: (typeof ROGER_PILOT_FEATURES)[number] }) {
  return (
    <div style={{ color: SLATE, fontSize: "10px", lineHeight: 1.45, maxWidth: "380px" }}>
      <strong style={{ color: NAVY_INK }}>Focus:</strong> {feature.deliveryFocus}<br />
      <strong style={{ color: NAVY_INK }}>Review finding:</strong> {feature.ownershipFinding}
    </div>
  );
}

export function buildRogerPilotBacklogMarkdown() {
  const featureStateSummary = ROGER_PILOT_BACKLOG_SUMMARY.featureStateCounts.map(({ state, count }) => `- ${state}: ${count}`).join("\n");
  const featureInventory = ROGER_PILOT_FEATURES.map((feature) => `| ${feature.id} | ${feature.title} | ${feature.featureState} | ${feature.childEvidence} | ${feature.candidateWorkstream} |`).join("\n");
  const sprintGoalSections = ROGER_PI4_SPRINT_2_GOALS.map((goal) => {
    const objectives = goal.objectives.map((objective, index) => `${index + 1}. ${objective}`).join("\n");
    const features = goal.supportingFeatures.map((feature) => {
      const relatedAdoIds = ROGER_PILOT_FEATURES.find((candidate) => candidate.id === feature.featureId)?.workItems.map((item) => item.id) ?? [];
      const relatedAdoLabel = relatedAdoIds.length ? ` · Related ADO IDs: ${relatedAdoIds.join(", ")}` : "";
      return `| ${feature.featureId} | ${ROGER_PI4_SPRINT_2_FEATURE_TITLES[feature.featureId] ?? "Feature title requires source refresh"}${relatedAdoLabel} | ${feature.purpose} |`;
    }).join("\n");
    const dependencies = goal.dependencies.map((dependency) => `- ${dependency}`).join("\n");
    return `### ${goal.workstream} goal\n\n**Goal:** ${goal.goal}\n\n**Objectives:**\n${objectives}\n\n| Supporting feature | Feature title | Purpose |\n| --- | --- | --- |\n${features}\n\n**Dependencies:**\n${dependencies}\n\n**Sprint impact:** ${goal.impact}\n\n*Source: ${goal.sourceBasis}; ${goal.sourceWindow}*`;
  }).join("\n\n");
  const sprintAlignment = ROGER_PI4_SPRINT_2_ALIGNMENT.map((relationship) => `| ${relationship.from} | ${relationship.to} | ${relationship.relationship} |`).join("\n");
  return `# Roger Pilot Backlog Assessment\n\n## Source and assessment boundary\n\n- Sprint: ${ROGER_PILOT_BACKLOG_SOURCE.sprint}\n- Source: ${ROGER_PILOT_BACKLOG_SOURCE.sourceLabel}\n- Captured: ${ROGER_PILOT_BACKLOG_SOURCE.capturedOn}\n- ${ROGER_PILOT_BACKLOG_SOURCE.coverageNote}\n- Scope: Planning and backlog assessment only. This is not a live Azure DevOps connection and does not assert delivery completion.\n\n## Executive summary\n\n- Parent features visible in source list: ${ROGER_PILOT_BACKLOG_SUMMARY.totalListedFeatureCount}\n- Features with visible child indicator: ${ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildIndicatorCount}\n- Features with captured child rows: ${ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildDetailCount}\n- Features requiring child-row expansion: ${ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount}\n- Captured child work items: ${ROGER_PILOT_BACKLOG_SUMMARY.workItemCount}\n\n### Feature-state distribution\n\n${featureStateSummary}\n\n## PI4–Sprint 2 goals, objectives, and cross-workstream outcome\n\nPlanning boundary: State and Provision objectives are taken from the supplied goal captures. TDC objectives are limited to the captured TDC, Gateway, API, security, environment, and defect evidence already present in this backlog. These goals do not assert story commitment, feature completion, deployment readiness, or architecture approval.\n\n${sprintGoalSections}\n\n### Cross-workstream alignment and dependency\n\n| From | To / impact | Alignment and dependency |\n| --- | --- | --- |\n${sprintAlignment}\n\n## All parent features with child indicators\n\n| Feature ID | Feature title | Parent state | Child evidence | Candidate workstream |\n| --- | --- | --- | --- | --- |\n${featureInventory}\n\n## Required validation before commitments or scheduling\n\n1. Expand the remaining feature child rows before deriving child scope, owner, readiness, dependency, or delivery dates.\n2. Confirm the accountable team and product owner for each legacy Data-labeled Return Filings item.\n3. Confirm State and Provision scope, owner, and dependency treatment for every State and Provision parent feature.\n4. Confirm API/data-contract ownership, acceptance criteria, and test evidence for Gateway, TDC, and shared platform capabilities.\n5. Confirm dependency links, sizing, commitments, and delivery dates from an updated ADO export or reviewed artifact.\n\n## Refresh rule\n\n${ROGER_PILOT_BACKLOG_SOURCE.refreshRule}\n`;
}

function exportCurrentAssessment() {
  const blob = new Blob([buildRogerPilotBacklogMarkdown()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Roger_Pilot_Backlog_Assessment_PI4_Sprint_2.md";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function RogerPilotBacklogPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", margin: "0 auto", maxWidth: "1440px", padding: "28px 32px 52px" }}>
      <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>Executive Health · Post Pilot</div>
          <h1 style={{ color: NAVY_INK, fontSize: "27px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>Roger Pilot Backlog</h1>
        </div>
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button type="button" onClick={exportCurrentAssessment} style={{ background: NAVY, border: "1px solid #002c5c", borderRadius: "6px", color: "#ffffff", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: "9px 12px" }}>Export assessment (.md)</button>
          <Link href="/post-pilot" style={{ color: NAVY, fontSize: "11px", fontWeight: 850, padding: "9px 2px", textDecoration: "none" }}>← Back to Post Pilot</Link>
        </div>
      </div>

      <section aria-labelledby="roger-pilot-summary" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Leadership snapshot" title="PI4–Sprint 2 feature review coverage" description={`Counts distinguish the ${ROGER_PILOT_BACKLOG_SUMMARY.totalListedFeatureCount} parent features visible in the source list, the ${ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildIndicatorCount} parent features with visible child indicators, and the ${ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildDetailCount} features with captured child-row evidence.`} />
        <div id="roger-pilot-summary" style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))" }}>
          <div style={{ background: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderTop: `4px solid ${NAVY}`, borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Features in source list</div><div style={{ color: NAVY, fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.totalListedFeatureCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>Visible PI4–Sprint 2 parent features</div></div>
          <div style={{ background: "#eef7f1", border: "1px solid #a7d7b8", borderTop: `4px solid ${GREEN}`, borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Features reviewed</div><div style={{ color: GREEN, fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildIndicatorCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>Visible child indicator in supplied source</div></div>
          <div style={{ background: "#e0f2fe", border: "1px solid #93c5fd", borderTop: "4px solid #0369a1", borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Child rows captured</div><div style={{ color: "#0369a1", fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildDetailCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.workItemCount} child work items available for detail review</div></div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderTop: "4px solid #b45309", borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Child rows pending</div><div style={{ color: "#b45309", fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>Expand before child-level commitments</div></div>
        </div>
      </section>

      <RogerPilotSprintGoals />

      <section aria-labelledby="dependencies-and-gaps" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Readiness assessment" title="Dependencies, gaps, and decision questions" description="The source captures feature title, feature state, visible hierarchy marker, and a limited child-row subset. It does not expose validated dependency links, acceptance criteria, delivery dates, or formal ownership boundaries for the remaining 21 marked features." />
        <div id="dependencies-and-gaps" style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "14px" }}><div style={{ color: NAVY, fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Inter-team dependency signals</div><ul style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>Entity mappings, prior-year rollforward, State data, Return-to-Provision, and Book-to-Tax titles signal cross-workstream data dependencies.</li><li>Gateway, API/payload, security, environment, and delegated-access titles signal technical coordination but not verified dependency links.</li><li>Parent Active, New, Requirements, and On Hold states do not provide child acceptance or release readiness.</li></ul></div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#9a3412", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Data-contract / API concerns</div><ul style={{ color: "#7c2d12", fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>Feature 1441524 explicitly calls out API and payload definitions, but producer, consumer, schema version, and acceptance evidence are absent.</li><li>State taxable-income, entity-mapping, and Provision packages need confirmed inbound source, governed identifier, contract owner, and downstream deliverable.</li><li>Manual account creation, Book Adjustments, and return workflow features need explicit persistence and audit boundaries.</li></ul></div>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#b91c1c", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Scheduling risks</div><ul style={{ color: "#7f1d1d", fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>{ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount} reviewed parent features still require expanded child evidence.</li><li>Assignee, sizing, sprint commitment, target date, and dependency link are not available for most parent features.</li><li>Two feature parents are On Hold; the source does not provide the reason, unblock criteria, or impact.</li></ul></div>
        </div>
        <div style={{ background: "#eaf2f8", border: "1px solid #9dbad0", borderRadius: "10px", marginTop: "12px", padding: "13px 14px" }}><div style={{ color: NAVY, fontSize: "11px", fontWeight: 900 }}>Decision questions for the next review</div><ol style={{ color: NAVY_INK, fontSize: "11px", lineHeight: 1.55, margin: "8px 0 0", paddingLeft: "18px" }}><li>Can the remaining 21 marked parent features be expanded so child count, state, owner, and dependencies can be evidenced?</li><li>Which current product team owns each legacy Data-labeled Return Filings child item, and does it affect State, Provision, or both?</li><li>Which named owner approves API/payload, validation, security, environment, and data-contract readiness across the shared capabilities?</li><li>Which parent features are actually committed and release-relevant in PI4–Sprint 2 versus backlog candidates?</li></ol></div>
      </section>

      <section aria-labelledby="parent-feature-review" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Complete parent feature review" title="All 25 features with visible child indicators" description="Each parent feature is shown with the captured source state, child-evidence status, candidate workstream, and review context. Candidate workstreams remain a review aid, not a delivery ownership assignment." />
        <div id="parent-feature-review" style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "1160px", width: "100%" }}>
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff", textAlign: "left" }}>
                <th style={{ fontSize: "10px", padding: "10px 11px", textTransform: "uppercase" }}>Feature</th>
                <th style={{ fontSize: "10px", padding: "10px 11px", textTransform: "uppercase" }}>Parent state</th>
                <th style={{ fontSize: "10px", padding: "10px 11px", textTransform: "uppercase" }}>Child evidence</th>
                <th style={{ fontSize: "10px", padding: "10px 11px", textTransform: "uppercase" }}>Candidate workstream</th>
                <th style={{ fontSize: "10px", padding: "10px 11px", textTransform: "uppercase" }}>Review context</th>
              </tr>
            </thead>
            <tbody>
              {ROGER_PILOT_FEATURES.map((feature, index) => (
                <tr key={feature.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}>
                  <td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 800, lineHeight: 1.4, padding: "10px 11px", width: "24%" }}><span style={{ color: NAVY }}>{feature.id}</span> · {feature.title}</td>
                  <td style={{ padding: "10px 11px" }}><FeatureStatePill state={feature.featureState} /></td>
                  <td style={{ padding: "10px 11px" }}><EvidencePill label={childEvidenceLabel(feature)} /></td>
                  <td style={{ color: NAVY_INK, fontSize: "10px", fontWeight: 800, lineHeight: 1.4, padding: "10px 11px", width: "16%" }}>{feature.candidateWorkstream}</td>
                  <td style={{ padding: "10px 11px", width: "40%" }}><AssessmentSummary feature={feature} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

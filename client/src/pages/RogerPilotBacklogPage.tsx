import { Link } from "wouter";
import {
  ROGER_PILOT_BACKLOG_SOURCE,
  ROGER_PILOT_BACKLOG_SUMMARY,
  ROGER_PILOT_FEATURES,
  ROGER_PILOT_STATE_ORDER,
  ROGER_PILOT_WORK_ITEMS,
  type RogerPilotWorkItemState,
} from "@/lib/rogerPilotBacklog";

const NAVY = "#003865";
const NAVY_INK = "#0f172a";
const GREEN = "#00843d";
const SLATE = "#475569";
const LIGHT_GRAY = "#f1f5f9";
const BORDER = "#cbd5e1";
const TEAM_ROGER_BACKLOG_URL = "https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_backlogs/backlog/Team%20Roger/Features";

const STATE_STYLE: Record<RogerPilotWorkItemState, { color: string; surface: string }> = {
  Active: { color: "#0369a1", surface: "#e0f2fe" },
  "Review Ready": { color: "#6d28d9", surface: "#f3e8ff" },
  "QA Ready": { color: "#0f766e", surface: "#ccfbf1" },
  New: { color: "#475569", surface: "#e2e8f0" },
  Closed: { color: GREEN, surface: "#dcfce7" },
};

function StatePill({ state }: { state: RogerPilotWorkItemState }) {
  const style = STATE_STYLE[state];
  return (
    <span style={{ background: style.surface, border: `1px solid ${style.color}44`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "10px", fontWeight: 850, padding: "3px 7px", whiteSpace: "nowrap" }}>
      {state}
    </span>
  );
}

function EvidencePill({ label = "Validate" }: { label?: string }) {
  return <span style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "999px", color: "#92400e", display: "inline-flex", fontSize: "9px", fontWeight: 850, padding: "3px 7px", whiteSpace: "nowrap" }}>{label}</span>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${NAVY}`, marginBottom: "14px", paddingLeft: "12px" }}>
      <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>{eyebrow}</div>
      <h2 style={{ color: NAVY_INK, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>{title}</h2>
      <p style={{ color: SLATE, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "930px" }}>{description}</p>
    </div>
  );
}

export function buildRogerPilotBacklogMarkdown() {
  const stateSummary = ROGER_PILOT_BACKLOG_SUMMARY.stateCounts.map(({ state, count }) => `- ${state}: ${count}`).join("\n");
  const featureSections = ROGER_PILOT_FEATURES.map((feature) => {
    const workItems = feature.workItems.map((item) => `| ${item.id} | ${item.titleExcerpt} | ${item.state} | ${item.assignedTo} | ${item.candidateTeam} |`).join("\n");
    return `## Feature ${feature.id} — ${feature.title}\n\nBusiness value: ${feature.businessValue}/10\n\nDelivery focus: ${feature.deliveryFocus}\n\nOwnership finding: ${feature.ownershipFinding}\n\n| ADO ID | Title as captured | State | Assigned to | Candidate team / validation state |\n| --- | --- | --- | --- | --- |\n${workItems}`;
  }).join("\n\n");

  return `# Roger Pilot Backlog Assessment\n\n## Source and scope\n\n- Sprint: ${ROGER_PILOT_BACKLOG_SOURCE.sprint}\n- Source: ${ROGER_PILOT_BACKLOG_SOURCE.sourceLabel}\n- Captured: ${ROGER_PILOT_BACKLOG_SOURCE.capturedOn}\n- Scope: Planning and backlog assessment only. This is not a live Azure DevOps connection and does not assert delivery completion.\n\n## Executive summary\n\n- Features captured: ${ROGER_PILOT_BACKLOG_SUMMARY.featureCount}\n- Child work items captured: ${ROGER_PILOT_BACKLOG_SUMMARY.workItemCount}\n- Legacy DCT-labeled items requiring current-team allocation: ${ROGER_PILOT_BACKLOG_SUMMARY.legacyDctLabelCount}\n\n### State distribution\n\n${stateSummary}\n\n## What needs validation before scheduling\n\n1. Confirm the accountable team and product owner for each legacy DCT-labeled Return Filings item.\n2. Confirm the API/data-contract owner and acceptance criteria for the Gateway and TDC technical items.\n3. Confirm whether performance-environment issues block Sprint 2 validation, UAT, or deployment readiness.\n4. Confirm dependency links, sizing, commitments, and delivery dates from an updated ADO export or reviewed artifact.\n\n${featureSections}\n\n## Refresh rule\n\n${ROGER_PILOT_BACKLOG_SOURCE.refreshRule}\n`;
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

function RoadmapLane({ title, color, subtitle, items }: { title: string; color: string; subtitle: string; items: Array<{ id: string; text: string; status?: RogerPilotWorkItemState }> }) {
  return (
    <div style={{ borderLeft: `4px solid ${color}`, minWidth: 0, padding: "10px 12px" }}>
      <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "7px" }}>
        <div style={{ color, fontSize: "12px", fontWeight: 900 }}>{title}</div>
        <EvidencePill label="Candidate allocation" />
      </div>
      <div style={{ color: SLATE, fontSize: "10px", lineHeight: 1.4, marginTop: "3px" }}>{subtitle}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "9px" }}>
        {items.length ? items.map((item) => (
          <div key={item.id} style={{ alignItems: "center", background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "6px", color: NAVY_INK, display: "inline-flex", fontSize: "10px", fontWeight: 750, gap: "5px", lineHeight: 1.3, padding: "5px 6px" }}>
            <span style={{ color, fontWeight: 900 }}>{item.id}</span>
            <span>{item.text}</span>
            {item.status && <StatePill state={item.status} />}
          </div>
        )) : <div style={{ color: "#64748b", fontSize: "10px", fontStyle: "italic", padding: "5px 0" }}>No child work item is explicitly assigned to this team in the supplied source.</div>}
      </div>
    </div>
  );
}

export default function RogerPilotBacklogPage() {
  const stateCount = (state: RogerPilotWorkItemState) => ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === state).length;
  const rogerCoreItems = ROGER_PILOT_WORK_ITEMS.filter((item) => item.candidateTeam === "Roger Core");
  const tdcItems = ROGER_PILOT_WORK_ITEMS.filter((item) => item.candidateTeam.includes("TDC"));
  const legacyItems = ROGER_PILOT_WORK_ITEMS.filter((item) => item.legacyDctLabel);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", margin: "0 auto", maxWidth: "1440px", padding: "28px 32px 52px" }}>
      <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>Executive Health · Post Pilot</div>
          <h1 style={{ color: NAVY_INK, fontSize: "27px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>Roger Pilot Backlog</h1>
          <p style={{ color: SLATE, fontSize: "13px", lineHeight: 1.55, margin: "6px 0 0", maxWidth: "865px" }}>
            A manual, evidence-bound view of Team Roger’s PI4–Sprint 2 feature backlog. It separates Roger Core experience work from TDC data capability and highlights work that still requires State, Provision, or team-assignment validation.
          </p>
        </div>
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button type="button" onClick={exportCurrentAssessment} style={{ background: NAVY, border: "1px solid #002c5c", borderRadius: "6px", color: "#ffffff", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: "9px 12px" }}>
            Export assessment (.md)
          </button>
          <Link href="/post-pilot" style={{ color: NAVY, fontSize: "11px", fontWeight: 850, padding: "9px 2px", textDecoration: "none" }}>← Back to Post Pilot</Link>
        </div>
      </div>

      <section aria-label="Backlog source status" style={{ background: "#eaf2f8", border: `1px solid #9dbad0`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", marginBottom: "24px", padding: "15px 16px" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Manual source baseline</div>
            <div style={{ color: NAVY_INK, fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>{ROGER_PILOT_BACKLOG_SOURCE.sprint} · {ROGER_PILOT_BACKLOG_SOURCE.sourceLabel}</div>
            <div style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, marginTop: "5px" }}>Captured {ROGER_PILOT_BACKLOG_SOURCE.capturedOn}. No live Azure DevOps connection is used, and no missing owner, dependency, or delivery date is inferred.</div>
            <a href={TEAM_ROGER_BACKLOG_URL} target="_blank" rel="noopener noreferrer" style={{ color: NAVY, display: "inline-flex", fontSize: "10px", fontWeight: 850, marginTop: "7px", textDecoration: "none" }}>Open Team Roger ADO backlog ↗</a>
          </div>
          <div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "7px", color: "#7c2d12", fontSize: "10px", fontWeight: 800, lineHeight: 1.45, maxWidth: "355px", padding: "8px 10px" }}>
            Refresh behavior: a newer ADO export, screenshot, or reviewed artifact replaces this evidence baseline and is compared to the prior review. Changes are not auto-fetched.
          </div>
        </div>
      </section>

      <section aria-labelledby="roger-pilot-summary" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Leadership snapshot" title="PI4–Sprint 2 at a glance" description="Current counts are derived only from the 18 child work items visible in the supplied Team Roger capture." />
        <div id="roger-pilot-summary" style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))" }}>
          <div style={{ background: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderTop: `4px solid ${NAVY}`, borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Features captured</div><div style={{ color: NAVY, fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.featureCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>Feature-level rows in Sprint 2</div></div>
          <div style={{ background: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderTop: `4px solid ${NAVY}`, borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Child work items</div><div style={{ color: NAVY, fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.workItemCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>Current screenshot total</div></div>
          <div style={{ background: "#eef7f1", border: "1px solid #a7d7b8", borderTop: `4px solid ${GREEN}`, borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Ready for review / QA</div><div style={{ color: GREEN, fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{stateCount("Review Ready") + stateCount("QA Ready")}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>{stateCount("Review Ready")} review-ready · {stateCount("QA Ready")} QA-ready</div></div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderTop: "4px solid #b45309", borderRadius: "10px", minHeight: "118px", padding: "13px" }}><div style={{ color: SLATE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>Legacy label triage</div><div style={{ color: "#b45309", fontSize: "29px", fontWeight: 900, marginTop: "11px" }}>{ROGER_PILOT_BACKLOG_SUMMARY.legacyDctLabelCount}</div><div style={{ color: SLATE, fontSize: "10px", marginTop: "5px" }}>DCT-labeled items needing current-team assignment</div></div>
        </div>
        <div style={{ alignItems: "center", background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "9px", display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", padding: "10px 12px" }}>
          <span style={{ color: NAVY_INK, fontSize: "10px", fontWeight: 900, marginRight: "2px", textTransform: "uppercase" }}>State distribution</span>
          {ROGER_PILOT_STATE_ORDER.map((state) => <span key={state} style={{ alignItems: "center", display: "inline-flex", gap: "5px" }}><StatePill state={state} /><span style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 900 }}>{stateCount(state)}</span></span>)}
          <span style={{ borderLeft: `1px solid ${BORDER}`, color: SLATE, fontSize: "10px", marginLeft: "3px", paddingLeft: "9px" }}>Technical-story and bug types were not provided as readable source fields, so no type count is inferred.</span>
        </div>
      </section>

      <section aria-labelledby="sprint-2-backlog" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Feature-by-feature assessment" title="PI4–Sprint 2 backlog" description="Each feature stays grouped with the child work items captured under it. Candidate ownership is an assessment aid, not an assignment or delivery approval." />
        <div id="sprint-2-backlog" style={{ display: "grid", gap: "14px" }}>
          {ROGER_PILOT_FEATURES.map((feature) => (
            <article key={feature.id} style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", overflow: "hidden" }}>
              <div style={{ alignItems: "flex-start", background: LIGHT_GRAY, borderBottom: `1px solid ${BORDER}`, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "13px 15px" }}>
                <div>
                  <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Feature {feature.id}</div>
                  <div style={{ color: NAVY_INK, fontSize: "15px", fontWeight: 900, lineHeight: 1.35, marginTop: "3px" }}>{feature.title}</div>
                </div>
                <div style={{ alignItems: "center", display: "flex", gap: "8px" }}><span style={{ background: "#ffffff", border: "1px solid #93c5fd", borderRadius: "999px", color: NAVY, fontSize: "10px", fontWeight: 900, padding: "4px 8px" }}>Business value {feature.businessValue}/10</span><EvidencePill label="Planning only" /></div>
              </div>
              <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "minmax(220px, .9fr) minmax(300px, 1.7fr)", padding: "13px 15px" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #dbe4ee", borderRadius: "7px", padding: "10px" }}><div style={{ color: NAVY, fontSize: "9px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Delivery focus</div><p style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, margin: "5px 0 0" }}>{feature.deliveryFocus}</p></div>
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "7px", padding: "10px" }}><div style={{ color: "#92400e", fontSize: "9px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Ownership finding</div><p style={{ color: "#78350f", fontSize: "11px", lineHeight: 1.5, margin: "5px 0 0" }}>{feature.ownershipFinding}</p></div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", minWidth: "1080px", width: "100%" }}>
                  <thead><tr style={{ background: NAVY, color: "#ffffff", textAlign: "left" }}>{["ADO ID", "Child work item", "State", "Assigned to", "Candidate team", "Assessment / validation"].map((label) => <th key={label} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "10px 11px", textTransform: "uppercase" }}>{label}</th>)}</tr></thead>
                  <tbody>{feature.workItems.map((item, index) => <tr key={item.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}>
                    <td style={{ color: NAVY, fontSize: "11px", fontWeight: 900, padding: "10px 11px", whiteSpace: "nowrap" }}>{item.id}</td>
                    <td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 750, lineHeight: 1.45, maxWidth: "310px", padding: "10px 11px" }}><div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "5px" }}>{item.titleExcerpt}{item.legacyDctLabel && <EvidencePill label="Legacy DCT label" />}</div></td>
                    <td style={{ padding: "10px 11px" }}><StatePill state={item.state} /></td>
                    <td style={{ color: SLATE, fontSize: "11px", padding: "10px 11px", whiteSpace: "nowrap" }}>{item.assignedTo}</td>
                    <td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 750, lineHeight: 1.4, padding: "10px 11px" }}>{item.candidateTeam}</td>
                    <td style={{ color: SLATE, fontSize: "10px", lineHeight: 1.45, maxWidth: "310px", padding: "10px 11px" }}>{item.teamAssessment}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="roger-sprint-roadmap" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Executive planning visual" title="Sprint roadmap and proposed workstream boundaries" description="The roadmap organizes the captured work for executive review. Lanes are candidate groupings derived from item titles and must be validated with the product and delivery leads." />
        <div id="roger-sprint-roadmap" style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", overflow: "hidden" }}>
          <div style={{ alignItems: "center", background: NAVY, color: "#ffffff", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "12px 15px" }}><div style={{ fontSize: "13px", fontWeight: 900 }}>PI4–Sprint 2 · manual planning roadmap</div><div style={{ fontSize: "10px", opacity: .84 }}>No delivery sequence or dependency is asserted by this visual</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 48px minmax(220px, 1fr) 48px minmax(220px, 1fr)", overflowX: "auto", padding: "14px" }}>
            <div style={{ minWidth: "220px" }}><RoadmapLane title="1 · Triage and allocation" color="#b45309" subtitle="Separate legacy labels and cross-cutting defects before committing team capacity." items={legacyItems.map((item) => ({ id: item.id, text: "Return Filings allocation", status: item.state }))} /></div>
            <div style={{ alignItems: "center", color: NAVY, display: "flex", fontSize: "23px", fontWeight: 900, justifyContent: "center", minWidth: "48px" }}>→</div>
            <div style={{ minWidth: "220px" }}><RoadmapLane title="2 · Contract and data capability" color="#0f766e" subtitle="Resolve Gateway, API, validation, access, and TDC prerequisites with a named contract owner." items={tdcItems.slice(0, 7).map((item) => ({ id: item.id, text: item.titleExcerpt, status: item.state }))} /></div>
            <div style={{ alignItems: "center", color: NAVY, display: "flex", fontSize: "23px", fontWeight: 900, justifyContent: "center", minWidth: "48px" }}>→</div>
            <div style={{ minWidth: "220px" }}><RoadmapLane title="3 · Roger Core experience" color={NAVY} subtitle="Validate practitioner-visible fixes with the supporting data path, then move through review and QA." items={rogerCoreItems.map((item) => ({ id: item.id, text: item.titleExcerpt, status: item.state }))} /></div>
          </div>
          <div style={{ background: "#f8fafc", borderTop: `1px solid ${BORDER}`, display: "grid", gap: "12px", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", padding: "12px 14px" }}>
            <RoadmapLane title="State lane" color="#0f766e" subtitle="No Sprint 2 child work item is explicitly assigned to State in the supplied Team Roger capture. The legacy Return Filings group must be evaluated for State scope." items={[]} />
            <RoadmapLane title="Provision lane" color="#6d28d9" subtitle="No Sprint 2 child work item is explicitly assigned to Provision in the supplied Team Roger capture. The legacy Return Filings group must be evaluated for Provision scope." items={[]} />
          </div>
          <div style={{ background: "#fff7ed", borderTop: "1px solid #fed7aa", color: "#7c2d12", fontSize: "11px", lineHeight: 1.45, padding: "10px 14px" }}>Leadership decision point: assign the four legacy DCT-labeled Return Filings items to the current State, Provision, or Roger Core team before using this view for capacity or release planning.</div>
        </div>
      </section>

      <section aria-labelledby="team-recommendations" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Ownership validation" title="Team assignment recommendations" description="These recommendations distinguish explicit title evidence from decisions that must be confirmed. They do not replace ADO ownership, architecture review, or delivery commitments." />
        <div id="team-recommendations" style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
          <div style={{ background: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderTop: `4px solid ${NAVY}`, borderRadius: "10px", padding: "14px" }}><div style={{ color: NAVY, fontSize: "12px", fontWeight: 900 }}>Roger Core</div><p style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0" }}>Treat the four work items explicitly labeled “Roger UI” as the starting point for Roger Core review. Confirm the companion data, persistence, and service ownership for each item before accepting a complete status.</p></div>
          <div style={{ background: "#eef7f1", border: "1px solid #a7d7b8", borderTop: `4px solid ${GREEN}`, borderRadius: "10px", padding: "14px" }}><div style={{ color: GREEN, fontSize: "12px", fontWeight: 900 }}>TDC — Data Capability</div><p style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0" }}>Use the explicitly TDC- and Gateway-labeled items as a technical support candidate set. Name a data-contract owner for API, validation, access, capacity, and persistence decisions.</p></div>
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderTop: "4px solid #b45309", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#92400e", fontSize: "12px", fontWeight: 900 }}>State / Provision</div><p style={{ color: "#78350f", fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0" }}>Do not assign the Return Filings items by title alone. Validate the affected workflow, practitioner journey, state jurisdiction context, provision impact, and accountable product owner before moving the legacy DCT-labeled work.</p></div>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderTop: "4px solid #b91c1c", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#b91c1c", fontSize: "12px", fontWeight: 900 }}>Cross-team defect triage</div><p style={{ color: "#7f1d1d", fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0" }}>Keep “Data — Defect & Bug Management” as a portfolio triage feature until every child work item has a current team, a clear user or technical impact, and a verified relationship to the affected capability.</p></div>
        </div>
      </section>

      <section aria-labelledby="dependencies-and-gaps" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Readiness assessment" title="Dependencies, gaps, and decision questions" description="The source capture provides work-item titles, state, assignee, parent feature, and ID. It does not show validated dependency links, acceptance criteria, delivery dates, or formal ownership boundaries." />
        <div id="dependencies-and-gaps" style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "14px" }}><div style={{ color: NAVY, fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Inter-team dependency signals</div><ul style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>Gateway, API/payload, data-validation, and delegated-access titles signal shared technical coordination but not verified dependency links.</li><li>Roger UI defects may require TDC or Gateway validation when the display depends on calculation, persistence, or service results.</li><li>Performance-environment TDC and Gateway items may affect QA readiness; the source does not confirm the affected test path.</li></ul></div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#9a3412", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Data-contract / API concerns</div><ul style={{ color: "#7c2d12", fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>Feature 1441524 explicitly calls out API and payload definitions, but contract fields, producer, consumer, schema version, and acceptance evidence are not in the capture.</li><li>Manual account creation and storage work requires confirmed persistence and audit boundaries before Roger-facing behavior is treated as ready.</li><li>Access to TIM and validation standards should have a named accountable technical owner and a documented test path.</li></ul></div>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#b91c1c", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>Scheduling risks</div><ul style={{ color: "#7f1d1d", fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0", paddingLeft: "17px" }}><li>Assignee is not necessarily the accountable delivery team, so capacity cannot be derived from this source alone.</li><li>Four legacy DCT-labeled items are not yet allocated to State, Provision, or Roger Core.</li><li>No sizing, sprint commitment, target date, dependency link, or accepted release evidence is visible for the captured work.</li></ul></div>
        </div>
        <div style={{ background: "#eaf2f8", border: "1px solid #9dbad0", borderRadius: "10px", marginTop: "12px", padding: "13px 14px" }}><div style={{ color: NAVY, fontSize: "11px", fontWeight: 900 }}>Decision questions for the next review</div><ol style={{ color: NAVY_INK, fontSize: "11px", lineHeight: 1.55, margin: "8px 0 0", paddingLeft: "18px" }}><li>Which current product team owns each legacy DCT-labeled Return Filings issue, and does the issue affect State, Provision, or both?</li><li>Which named owner approves the API/payload and data-validation contract for Feature 1441524?</li><li>Which Sprint 2 work items are committed, sized, and release-relevant, versus triage-only backlog candidates?</li><li>Do the Perf Env TDC and Gateway issues block any current Roger QA, UAT, or deployment path?</li></ol></div>
      </section>

      <section aria-labelledby="deployment-planning" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Release readiness" title="Deployment Planning" description="This source is a backlog capture, not a deployment plan. It does not contain release targets, environments, planned deployment dates, or completed release evidence." />
        <div id="deployment-planning" style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "900px", width: "100%" }}>
            <thead><tr style={{ background: NAVY, color: "#ffffff", textAlign: "left" }}>{["Readiness area", "Evidence in current capture", "Planning implication", "Required validation"].map((label) => <th key={label} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase" }}>{label}</th>)}</tr></thead>
            <tbody>
              <tr style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 850, padding: "11px 12px" }}>Review Ready items</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>{stateCount("Review Ready")} items are labeled Review Ready.</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>Candidate review queue only; do not schedule a deployment from this state.</td><td style={{ padding: "11px 12px" }}><EvidencePill label="Technical and product acceptance" /></td></tr>
              <tr style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 850, padding: "11px 12px" }}>QA Ready items</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>{stateCount("QA Ready")} items are labeled QA Ready.</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>Confirm QA scope, expected results, test evidence, environment, and defect disposition.</td><td style={{ padding: "11px 12px" }}><EvidencePill label="QA evidence and release candidate" /></td></tr>
              <tr style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 850, padding: "11px 12px" }}>Contract / data readiness</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>API, Gateway, TDC, access, and validation work appears in the titles.</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>Block release selection until the affected contract and technical owner are named.</td><td style={{ padding: "11px 12px" }}><EvidencePill label="Approved contract and dependency evidence" /></td></tr>
              <tr style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 850, padding: "11px 12px" }}>Release record</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>No deployment date, environment, release name, or release-note evidence is captured.</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>Create a deployment record only after the readiness evidence above is confirmed.</td><td style={{ padding: "11px 12px" }}><Link href="/post-pilot" style={{ color: NAVY, fontSize: "10px", fontWeight: 850, textDecoration: "none" }}>Open Post Pilot Deployment Registry →</Link></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="backlog-change-log" style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Backlog review history" title="Changes since last backlog review" description="This is the initial baseline. The first newer, reviewed ADO artifact will populate an evidence-bound change comparison rather than a guessed delta." />
        <div id="backlog-change-log" style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "820px", width: "100%" }}><thead><tr style={{ background: NAVY, color: "#ffffff", textAlign: "left" }}>{["Review date", "Source", "Change status", "Result", "Next evidence needed"].map((label) => <th key={label} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase" }}>{label}</th>)}</tr></thead><tbody><tr style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 850, padding: "11px 12px" }}>{ROGER_PILOT_BACKLOG_SOURCE.capturedOn}</td><td style={{ color: SLATE, fontSize: "11px", padding: "11px 12px" }}>{ROGER_PILOT_BACKLOG_SOURCE.sourceLabel}</td><td style={{ padding: "11px 12px" }}><EvidencePill label="Baseline established" /></td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>4 features and 18 child work items recorded. No prior review baseline was supplied for a delta comparison.</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.45, padding: "11px 12px" }}>A newer Team Roger ADO export, screenshot, or reviewed backlog artifact.</td></tr></tbody></table>
        </div>
      </section>

      <section aria-labelledby="backlog-refresh" style={{ background: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "15px" }}>
        <SectionHeading eyebrow="Manual refresh protocol" title="How this page stays current" description="This workspace deliberately avoids a live Azure DevOps connection. Its authority is the most recently reviewed ADO evidence supplied to the delivery workspace." />
        <div id="backlog-refresh" style={{ color: SLATE, fontSize: "11px", lineHeight: 1.55 }}><strong style={{ color: NAVY_INK }}>Accepted evidence:</strong> a Team Roger ADO backlog export, screenshot, or reviewed artifact with the sprint, work-item ID, title, state, assignee, and parent feature visible. The refresh compares the new source to this baseline, updates work-item and state counts, and flags changed state, team, owner, parent, or dependency information. It will not turn a backlog state into a delivery or architecture approval without separate evidence.</div>
      </section>
    </div>
  );
}

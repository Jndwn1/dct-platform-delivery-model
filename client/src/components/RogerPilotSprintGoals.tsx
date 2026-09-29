import type { ReactNode } from "react";
import { ROGER_PILOT_FEATURES } from "@/lib/rogerPilotBacklog";
import {
  ROGER_PI4_SPRINT_2_ALIGNMENT,
  ROGER_PI4_SPRINT_2_FEATURE_TITLES,
  ROGER_PI4_SPRINT_2_GOALS,
  type RogerSprintGoalWorkstream,
} from "@/lib/rogerPilotSprintGoals";

const NAVY = "#003865";
const NAVY_INK = "#0f172a";
const SLATE = "#475569";
const BORDER = "#cbd5e1";

const WORKSTREAM_STYLE: Record<RogerSprintGoalWorkstream, { accent: string; surface: string; ink: string }> = {
  State: { accent: "#0f766e", surface: "#f0fdfa", ink: "#115e59" },
  Provision: { accent: "#6d28d9", surface: "#f5f3ff", ink: "#5b21b6" },
  TDC: { accent: "#0369a1", surface: "#eff6ff", ink: "#075985" },
};

function getFeatureTitle(featureId: string) {
  return ROGER_PI4_SPRINT_2_FEATURE_TITLES[featureId]
    ?? ROGER_PILOT_FEATURES.find((feature) => feature.id === featureId)?.title
    ?? "Feature title requires source refresh";
}

function getRelatedAdoIds(featureId: string) {
  return ROGER_PILOT_FEATURES.find((feature) => feature.id === featureId)?.workItems.map((item) => item.id) ?? [];
}

function MiniHeading({ children, color = NAVY }: { children: ReactNode; color?: string }) {
  return <div style={{ color, fontSize: "9px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</div>;
}

export default function RogerPilotSprintGoals() {
  return (
    <section aria-labelledby="pi4-sprint-2-goals" style={{ marginBottom: "26px" }}>
      <div style={{ borderLeft: `4px solid ${NAVY}`, marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: NAVY, fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>Sprint planning alignment</div>
        <h2 id="pi4-sprint-2-goals" style={{ color: NAVY_INK, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>PI4–Sprint 2 goals, objectives, and cross-workstream outcome</h2>
        <p style={{ color: SLATE, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "980px" }}>This section translates the supplied State and Provision goal captures and the current TDC backlog evidence into one planning view. It lists the supporting backlog features and their purpose, then makes the objective, impact, and dependency path explicit without treating planning intent as a completed commitment.</p>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        {ROGER_PI4_SPRINT_2_GOALS.map((goal) => {
          const style = WORKSTREAM_STYLE[goal.workstream];
          return (
            <article key={goal.workstream} style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderLeft: `5px solid ${style.accent}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", overflow: "hidden" }}>
              <div style={{ alignItems: "flex-start", background: style.surface, borderBottom: `1px solid ${BORDER}`, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "13px 15px" }}>
                <div>
                  <div style={{ color: style.ink, fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>{goal.workstream} · PI4–Sprint 2</div>
                  <div style={{ color: NAVY_INK, fontSize: "15px", fontWeight: 900, lineHeight: 1.4, marginTop: "4px", maxWidth: "940px" }}>{goal.goal}</div>
                </div>
                <div style={{ background: "#ffffff", border: `1px solid ${style.accent}55`, borderRadius: "999px", color: style.ink, fontSize: "10px", fontWeight: 850, padding: "4px 8px", whiteSpace: "nowrap" }}>{goal.sourceWindow}</div>
              </div>

              <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "minmax(310px, 1fr) minmax(340px, 1.15fr)", padding: "14px 15px" }}>
                <div>
                  <MiniHeading color={style.ink}>Sprint objectives</MiniHeading>
                  <ol style={{ color: SLATE, fontSize: "11px", lineHeight: 1.55, margin: "8px 0 0", paddingLeft: "18px" }}>{goal.objectives.map((objective) => <li key={objective} style={{ marginBottom: "6px" }}>{objective}</li>)}</ol>
                </div>
                <div>
                  <MiniHeading color={style.ink}>Supporting features and purpose</MiniHeading>
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: "7px", marginTop: "8px", overflow: "hidden" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead><tr style={{ background: "#f8fafc", color: NAVY_INK, textAlign: "left" }}><th style={{ fontSize: "9px", fontWeight: 900, padding: "7px 8px", textTransform: "uppercase" }}>Feature</th><th style={{ fontSize: "9px", fontWeight: 900, padding: "7px 8px", textTransform: "uppercase" }}>Purpose in the goal</th></tr></thead>
                      <tbody>{goal.supportingFeatures.map((feature, index) => {
                        const relatedAdoIds = getRelatedAdoIds(feature.featureId);
                        return <tr key={feature.featureId} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY, fontSize: "10px", fontWeight: 850, lineHeight: 1.35, minWidth: "145px", padding: "8px" }}><span>{feature.featureId}</span><br /><span style={{ color: NAVY_INK, fontWeight: 750 }}>{getFeatureTitle(feature.featureId)}</span>{relatedAdoIds.length > 0 && <><br /><span style={{ color: "#64748b", fontSize: "9px", fontWeight: 800 }}>Related ADO IDs: {relatedAdoIds.join(", ")}</span></>}</td><td style={{ color: SLATE, fontSize: "10px", lineHeight: 1.4, padding: "8px" }}>{feature.purpose}</td></tr>;
                      })}</tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", borderTop: `1px solid ${BORDER}`, display: "grid", gap: "12px", gridTemplateColumns: "minmax(280px, 1.1fr) minmax(260px, .9fr)", padding: "12px 15px" }}>
                <div><MiniHeading color={style.ink}>Dependencies and required alignment</MiniHeading><ul style={{ color: SLATE, fontSize: "10px", lineHeight: 1.5, margin: "7px 0 0", paddingLeft: "16px" }}>{goal.dependencies.map((dependency) => <li key={dependency} style={{ marginBottom: "4px" }}>{dependency}</li>)}</ul></div>
                <div style={{ background: "#ffffff", border: `1px solid ${style.accent}44`, borderRadius: "7px", padding: "9px 10px" }}><MiniHeading color={style.ink}>Sprint impact</MiniHeading><p style={{ color: SLATE, fontSize: "10px", lineHeight: 1.5, margin: "6px 0 0" }}>{goal.impact}</p><div style={{ color: "#64748b", fontSize: "9px", fontWeight: 750, marginTop: "7px" }}>Source: {goal.sourceBasis}</div></div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", marginTop: "14px", overflow: "hidden" }}>
        <div style={{ background: NAVY, color: "#ffffff", padding: "11px 14px" }}><div style={{ fontSize: "13px", fontWeight: 900 }}>How the workstreams align and depend on one another</div><div style={{ fontSize: "10px", marginTop: "3px", opacity: 0.86 }}>The relationship statements make the handoffs visible; they do not invent or approve a technical design.</div></div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "900px", width: "100%" }}><thead><tr style={{ background: "#f1f5f9", color: NAVY_INK, textAlign: "left" }}><th style={{ fontSize: "9px", fontWeight: 900, padding: "9px 11px", textTransform: "uppercase" }}>From</th><th style={{ fontSize: "9px", fontWeight: 900, padding: "9px 11px", textTransform: "uppercase" }}>To / impact</th><th style={{ fontSize: "9px", fontWeight: 900, padding: "9px 11px", textTransform: "uppercase" }}>Alignment and dependency</th></tr></thead><tbody>{ROGER_PI4_SPRINT_2_ALIGNMENT.map((relationship, index) => <tr key={`${relationship.from}-${relationship.to}`} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}><td style={{ color: NAVY, fontSize: "11px", fontWeight: 900, padding: "10px 11px", whiteSpace: "nowrap" }}>{relationship.from}</td><td style={{ color: NAVY_INK, fontSize: "11px", fontWeight: 800, padding: "10px 11px", whiteSpace: "nowrap" }}>{relationship.to}</td><td style={{ color: SLATE, fontSize: "11px", lineHeight: 1.5, padding: "10px 11px" }}>{relationship.relationship}</td></tr>)}</tbody></table>
        </div>
      </div>

    </section>
  );
}

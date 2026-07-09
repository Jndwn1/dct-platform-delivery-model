// Step7Complete.tsx
// Discovery Hub Step 7 — Discovery Complete
// Summary, readiness confirmation, and next steps for the Provision & State workstream

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete, ONBOARDING_STEPS, getOnboardingProgress } from "./OnboardingHub";

const NEXT_STEPS = [
  {
    icon: "📋",
    title: "Review Your Discovery Questions",
    desc: "Return to Step 6 to review and answer your open discovery questions before writing stories.",
    action: "/onboarding/step6",
    actionLabel: "View Questions",
    color: "#7c3aed",
  },
  {
    icon: "✍️",
    title: "Use the BA Story Builder",
    desc: "Use the guided Story Builder to generate Azure DevOps-ready user stories for the Provision & State workstream.",
    action: "/discovery/ba-story-builder",
    actionLabel: "Open Story Builder",
    color: "#059669",
  },
  {
    icon: "🕸️",
    title: "Explore the Knowledge Graph",
    desc: "Navigate the DCT Knowledge Graph to understand how IMS, TDC, Roger, and the Gateway are connected.",
    action: "/discovery/knowledge-graph",
    actionLabel: "Open Knowledge Graph",
    color: "#1e3a5f",
  },
  {
    icon: "🤖",
    title: "Ask Buddy — Ongoing Support",
    desc: "Ask Buddy is available on every Discovery page. Use it to answer questions as you write stories.",
    action: "/ask-buddy",
    actionLabel: "Open Ask Buddy",
    color: "#0369a1",
  },
  {
    icon: "🔍",
    title: "Review Batch Detail Pages",
    desc: "Review B9A, B16, and B28 batch detail pages for the latest status, stories, and API coverage.",
    action: "/batch/b9a",
    actionLabel: "View B9A",
    color: "#b45309",
  },
];

const READINESS_ITEMS = [
  "Reviewed existing DCT capabilities (B9A, B16, B28) before defining requirements",
  "Understands DCT platform architecture and system boundaries",
  "Knows PDC (Phoenix Data Consolidation) and TDC (Tax Data Consolidation) roles",
  "Understands Roger's read-only role and override flow",
  "Understands GoSystem's downstream consumer role",
  "Validated the end-to-end business process through the data flow simulation",
  "Researched existing capabilities using Ask Buddy before documenting new requirements",
  "Captured requirements discovery entries with Business Need, Gap, and Recommendation",
];

export default function Step7Complete() {
  const [, navigate] = useLocation();
  const [printed, setPrinted] = useState(false);
  const progressMap = getOnboardingProgress();
  const completedCount = ONBOARDING_STEPS.filter(s => progressMap[s.key]).length;
  const progress = { completed: completedCount, total: ONBOARDING_STEPS.length };
  const questionsRaw = localStorage.getItem("onboarding-discovery-questions");
  const questions = questionsRaw ? JSON.parse(questionsRaw) : [];
  const openQuestions = questions.filter((q: { status: string }) => q.status === "Open").length;

  function handlePrint() {
    setPrinted(true);
    window.print();
  }

  // Mark step 7 complete
  markStepComplete("step7-complete");

  return (
    <div style={{ padding: "28px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Provision &amp; State Discovery Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 7 — Discovery Complete</span>
      </div>

      {/* Completion banner */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "2px solid #86efac",
        borderRadius: "14px", padding: "28px 32px", marginBottom: "28px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔎</div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#065f46", margin: "0 0 10px" }}>
          Discovery Complete!
        </h1>
        <p style={{ fontSize: "15px", color: "#166534", lineHeight: "1.7", maxWidth: "640px", margin: "0 auto 16px" }}>
          You now understand the existing DCT capabilities supporting the Provision and State workstreams.
          You are prepared to begin documenting business requirements based on the current DCT solution.
          If new requirements are identified, validate that they represent capability gaps before proposing enhancements.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={handlePrint}
            style={{
              fontSize: "13px", fontWeight: 700, color: "#065f46",
              backgroundColor: "white", border: "2px solid #86efac",
              borderRadius: "8px", padding: "10px 20px", cursor: "pointer",
            }}
          >
            🖨️ Print Completion Certificate
          </button>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              fontSize: "13px", fontWeight: 700, color: "white",
              backgroundColor: "#059669", border: "none",
              borderRadius: "8px", padding: "10px 20px", cursor: "pointer",
            }}
          >
            ↩ Back to Discovery Hub
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Steps Completed", value: `${progress.completed} / ${progress.total}`, color: "#059669", icon: "✅" },
          { label: "Questions Captured", value: questions.length, color: "#7c3aed", icon: "📝" },
          { label: "Open Questions", value: openQuestions, color: openQuestions > 0 ? "#dc2626" : "#059669", icon: "❓" },
          { label: "Readiness Score", value: "100%", color: "#059669", icon: "🎯" },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: "white", border: "1px solid #e2e8f0",
            borderRadius: "10px", padding: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "4px" }}>{s.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Readiness checklist */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "20px 24px", marginBottom: "24px",
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f1623", margin: "0 0 14px" }}>
          ✅ Readiness Checklist
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {READINESS_ITEMS.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "8px",
              padding: "8px 10px", backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0", borderRadius: "6px",
            }}>
              <span style={{ color: "#059669", fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "12px", color: "#166534", lineHeight: "1.4" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f1623", margin: "0 0 14px" }}>
          🚀 Recommended Next Steps
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {NEXT_STEPS.map((step, i) => (
            <div key={i} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "16px 18px",
              borderLeft: `4px solid ${step.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "20px" }}>{step.icon}</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623" }}>{step.title}</span>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", margin: "0 0 10px" }}>
                {step.desc}
              </p>
              <button
                onClick={() => navigate(step.action)}
                style={{
                  fontSize: "12px", fontWeight: 700, color: step.color,
                  backgroundColor: `${step.color}10`, border: `1px solid ${step.color}30`,
                  borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
                }}
              >
                {step.actionLabel} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Open questions reminder */}
      {openQuestions > 0 && (
        <div style={{
          backgroundColor: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: "10px", padding: "14px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: "13px", color: "#92400e" }}>
            ⚠️ You have <strong>{openQuestions} open discovery entr{openQuestions === 1 ? "y" : "ies"}</strong> that still need answers. Review and resolve them before writing requirements.
          </div>
          <button
            onClick={() => navigate("/onboarding/step6")}
            style={{
              fontSize: "12px", fontWeight: 700, color: "#92400e",
              backgroundColor: "white", border: "1px solid #fde68a",
              borderRadius: "6px", padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Review Questions →
          </button>
        </div>
      )}
    </div>
  );
}

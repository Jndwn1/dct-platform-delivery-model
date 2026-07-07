// OnboardingHub.tsx
// Provision & State Discovery Hub
// Guided discovery experience to understand existing DCT capabilities before defining business requirements.

import { useLocation } from "wouter";

export const ONBOARDING_STEPS = [
  {
    id: 1,
    key: "step1-features",
    title: "Review Existing DCT Capabilities",
    subtitle: "Required — Cannot Skip",
    description: "Review the DCT capabilities that have already been designed and planned. Understand the business purpose, scope, architecture, APIs, user stories, acceptance criteria, and downstream consumers before documenting new requirements.",
    icon: "📋",
    route: "/onboarding/step1",
    required: true,
  },
  {
    id: 2,
    key: "step2-feature-detail",
    title: "Analyze Existing Capabilities",
    subtitle: "Deep-dive into each capability",
    description: "Review each capability in detail to determine: what business problem it solves, what functionality already exists, what is in scope, what is out of scope, dependencies, and integration points.",
    icon: "🔍",
    route: "/onboarding/step2",
    required: true,
  },
  {
    id: 3,
    key: "step3-discovery-center",
    title: "Understand the DCT Solution",
    subtitle: "Platform responsibilities & architecture",
    description: "Review platform responsibilities, system ownership, architecture, data flow, Roger, TDC, GoSystem, and integration responsibilities. The objective is to understand where each capability exists within the DCT ecosystem.",
    icon: "🧭",
    route: "/onboarding/step3",
    required: true,
  },
  {
    id: 4,
    key: "step4-simulation",
    title: "Validate the Business Process",
    subtitle: "End-to-end business process walkthrough",
    description: "Walk through the end-to-end business process. Observe how data moves through the DCT ecosystem. Understand which platform owns each step. Understand downstream impacts.",
    icon: "🔄",
    route: "/onboarding/step4",
    required: true,
  },
  {
    id: 5,
    key: "step5-ask-buddy",
    title: "Research Existing Capabilities",
    subtitle: "Use Ask Buddy before documenting new requirements",
    description: "Use Ask Buddy to research existing functionality before documenting new requirements. Buddy will first check whether DCT already supports the need, identify the relevant Feature, Batch, APIs, and business objects.",
    icon: "💬",
    route: "/onboarding/step5",
    required: false,
  },
  {
    id: 6,
    key: "step6-questions",
    title: "Requirements Discovery",
    subtitle: "Document findings from the capability review",
    description: "Document findings from the capability review. Capture: Business Need, Existing Capability, Gap, Recommendation, Dependency, Questions, and Potential Enhancement.",
    icon: "❓",
    route: "/onboarding/step6",
    required: false,
  },
  {
    id: 7,
    key: "step7-complete",
    title: "Discovery Complete",
    subtitle: "Ready to begin requirements documentation",
    description: "You now understand the existing DCT capabilities supporting the Provision and State workstreams. You are prepared to begin documenting business requirements based on the current DCT solution.",
    icon: "✅",
    route: "/onboarding/step7",
    required: false,
  },
];

export function getOnboardingProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem("dct-onboarding-progress") || "{}");
  } catch {
    return {};
  }
}

export function markStepComplete(stepKey: string) {
  const progress = getOnboardingProgress();
  progress[stepKey] = true;
  localStorage.setItem("dct-onboarding-progress", JSON.stringify(progress));
}

export function resetOnboarding() {
  localStorage.removeItem("dct-onboarding-progress");
}

export function isStepUnlocked(stepIndex: number, progress: Record<string, boolean>): boolean {
  if (stepIndex === 0) return true;
  for (let i = 0; i < stepIndex; i++) {
    if (ONBOARDING_STEPS[i].required && !progress[ONBOARDING_STEPS[i].key]) {
      return false;
    }
  }
  return true;
}

export default function OnboardingHub() {
  const [, navigate] = useLocation();
  const progress = getOnboardingProgress();
  const completedCount = ONBOARDING_STEPS.filter(s => progress[s.key]).length;
  const pct = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#059669", fontWeight: 900, fontSize: "18px",
          }}>🔎</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
              Provision &amp; State Discovery Hub
            </h1>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
              Guided discovery experience to understand existing DCT capabilities before defining business requirements.
            </div>
          </div>
        </div>

        {/* Discovery Principle banner */}
        <div style={{
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "8px", padding: "14px 16px", marginTop: "14px",
        }}>
          <div style={{ fontSize: "13px", color: "#1e40af", fontWeight: 700, marginBottom: "6px" }}>
            🎯 Discovery Principle
          </div>
          <div style={{ fontSize: "13px", color: "#1e3a8a", lineHeight: "1.7" }}>
            <strong>Effective discovery begins with understanding existing capabilities before defining new requirements.</strong>
            <br />
            The purpose of this Discovery Hub is to help Business Analysts determine whether a business need is already supported by DCT, identify potential gaps, and build requirements based on the current solution architecture.
          </div>
        </div>

        {/* Purpose section */}
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "8px", padding: "14px 16px", marginTop: "12px",
        }}>
          <div style={{ fontSize: "13px", color: "#0f1623", fontWeight: 700, marginBottom: "8px" }}>
            📌 Purpose
          </div>
          <div style={{ fontSize: "13px", color: "#334155", marginBottom: "6px" }}>
            This Discovery Hub is designed to help the Provision and State Business Analysts:
          </div>
          <ul style={{ margin: "0 0 8px 0", paddingLeft: "20px", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
            <li>Understand the DCT capabilities that already exist.</li>
            <li>Learn how those capabilities support their business processes.</li>
            <li>Identify where existing functionality satisfies business needs.</li>
            <li>Recognize capability gaps that may require additional requirements.</li>
            <li>Build well-informed business requirements using the current DCT solution as the baseline.</li>
          </ul>
          <div style={{
            fontSize: "13px", color: "#1e40af", fontWeight: 600,
            backgroundColor: "#eff6ff", borderRadius: "6px", padding: "8px 12px",
            borderLeft: "3px solid #2563eb",
          }}>
            The goal is not to redesign DCT. The goal is to understand the current solution before proposing enhancements.
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: "10px", padding: "14px 20px", marginBottom: "28px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>Discovery Progress</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#059669" }}>{completedCount} / {ONBOARDING_STEPS.length} steps</span>
          </div>
          <div style={{ height: "8px", backgroundColor: "#d1fae5", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#059669", borderRadius: "4px", transition: "width 0.4s" }} />
          </div>
        </div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669", minWidth: "48px", textAlign: "right" }}>
          {pct}%
        </div>
        {completedCount > 0 && (
          <button
            onClick={() => { resetOnboarding(); window.location.reload(); }}
            style={{
              fontSize: "11px", color: "#94a3b8", background: "none", border: "1px solid #e2e8f0",
              borderRadius: "5px", padding: "4px 8px", cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ONBOARDING_STEPS.map((step, idx) => {
          const done = !!progress[step.key];
          const unlocked = isStepUnlocked(idx, progress);
          const isCurrent = !done && unlocked;

          return (
            <div
              key={step.id}
              onClick={() => unlocked && navigate(step.route)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "16px",
                backgroundColor: done ? "#f0fdf4" : isCurrent ? "#eff6ff" : "#f8fafc",
                border: `1.5px solid ${done ? "#86efac" : isCurrent ? "#93c5fd" : "#e2e8f0"}`,
                borderRadius: "10px", padding: "16px 20px",
                cursor: unlocked ? "pointer" : "not-allowed",
                opacity: unlocked ? 1 : 0.5,
                transition: "border-color 0.2s, background-color 0.2s",
              }}
            >
              {/* Step number / status */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                backgroundColor: done ? "#059669" : isCurrent ? "#2563eb" : "#e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? "18px" : "14px",
                fontWeight: 700,
                color: done || isCurrent ? "white" : "#94a3b8",
              }}>
                {done ? "✓" : step.id}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "16px" }}>{step.icon}</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f1623" }}>{step.title}</span>
                  {step.required && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "#dc2626",
                      backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: "4px", padding: "1px 6px",
                    }}>REQUIRED</span>
                  )}
                  {done && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "#065f46",
                      backgroundColor: "#f0fdf4", border: "1px solid #86efac",
                      borderRadius: "4px", padding: "1px 6px",
                    }}>COMPLETE</span>
                  )}
                  {isCurrent && !done && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "#1d4ed8",
                      backgroundColor: "#eff6ff", border: "1px solid #93c5fd",
                      borderRadius: "4px", padding: "1px 6px",
                    }}>START HERE</span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                  {step.subtitle}
                </div>
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                  {step.description}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: "18px", color: unlocked ? "#94a3b8" : "#d1d5db", flexShrink: 0, alignSelf: "center" }}>
                {unlocked ? "→" : "🔒"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: "24px", padding: "12px 16px",
        backgroundColor: "#fffbeb", border: "1px solid #fde68a",
        borderRadius: "8px", fontSize: "12px", color: "#92400e",
      }}>
        <strong>Note:</strong> Steps 1–4 are required and must be completed in order. These steps ensure you have reviewed existing DCT capabilities before proceeding to research and requirements documentation. Steps 5–7 become available after completing the required steps.
      </div>
    </div>
  );
}

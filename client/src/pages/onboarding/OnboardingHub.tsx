// OnboardingHub.tsx
// Provision & State Workstream Onboarding Hub
// 7-step guided onboarding within the Discovery Center

import { useLocation } from "wouter";

export const ONBOARDING_STEPS = [
  {
    id: 1,
    key: "step1-features",
    title: "Review DCT Features",
    subtitle: "Required — Cannot Skip",
    description: "Review the existing DCT Features to understand business capabilities already planned and in development.",
    icon: "📋",
    route: "/onboarding/step1",
    required: true,
  },
  {
    id: 2,
    key: "step2-feature-detail",
    title: "Explore Feature Details",
    subtitle: "Deep-dive into each feature",
    description: "Select a feature to review its business objectives, scope, architecture, APIs, stories, and acceptance criteria.",
    icon: "🔍",
    route: "/onboarding/step2",
    required: true,
  },
  {
    id: 3,
    key: "step3-discovery-center",
    title: "Discovery Center Review",
    subtitle: "Platform responsibilities & architecture",
    description: "Understand platform responsibilities, system ownership, data flow, Roger, TDC, and GoSystem.",
    icon: "🧭",
    route: "/onboarding/step3",
    required: true,
  },
  {
    id: 4,
    key: "step4-simulation",
    title: "Data Flow Simulation",
    subtitle: "GoSystem integration walkthrough",
    description: "Complete the GoSystem integration simulation to understand what data moves through each platform.",
    icon: "🔄",
    route: "/onboarding/step4",
    required: true,
  },
  {
    id: 5,
    key: "step5-ask-buddy",
    title: "Engage Ask Buddy",
    subtitle: "Ask questions about DCT capabilities",
    description: "Use Ask Buddy to explore DCT features, batches, and capabilities before forming new requirements.",
    icon: "💬",
    route: "/onboarding/step5",
    required: false,
  },
  {
    id: 6,
    key: "step6-questions",
    title: "Prepare Discovery Questions",
    subtitle: "Capture questions for the DCT BA team",
    description: "Document your questions and gaps discovered during the review to guide your BA discussion.",
    icon: "❓",
    route: "/onboarding/step6",
    required: false,
  },
  {
    id: 7,
    key: "step7-complete",
    title: "Ready for BA Discussion",
    subtitle: "Onboarding complete",
    description: "You have completed the DCT onboarding review and are ready to meet with the DCT Business Analysts.",
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
  // Each step unlocks when the previous required step is done
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
          }}>🎓</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
              Provision & State Workstream Onboarding
            </h1>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
              DCT Platform · Discovery Center · Guided Onboarding Experience
            </div>
          </div>
        </div>

        {/* Principle banner */}
        <div style={{
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "8px", padding: "12px 16px", marginTop: "14px",
        }}>
          <div style={{ fontSize: "13px", color: "#1e40af", fontWeight: 600, marginBottom: "3px" }}>
            🎯 Onboarding Principle
          </div>
          <div style={{ fontSize: "13px", color: "#1e3a8a", lineHeight: "1.6" }}>
            <strong>Understand the existing DCT capabilities before identifying new requirements.</strong>{" "}
            Discovery begins with understanding what is already planned and in development — not with defining new scope.
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
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>Onboarding Progress</span>
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
        <strong>Note:</strong> Steps 1–4 are required and must be completed in order before proceeding to Ask Buddy and Discovery Questions.
        Steps 5–7 are available after completing the required steps.
      </div>
    </div>
  );
}

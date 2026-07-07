// Step4Simulation.tsx
// Onboarding Step 4 — GoSystem Integration Data Flow Simulation
// Animated step-by-step walkthrough: ERP → PDC → TDC → Roger → GoSystem

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const SIMULATION_STEPS = [
  {
    id: 1,
    from: "ERP",
    to: "PDC",
    platform: "PDC — Phoenix Data Consolidation",
    platformColor: "#1e3a5f",
    owner: "RSM / CATT — PDC Team",
    dataOwner: "PDC owns the source financial record",
    businessRuleOwner: "PDC owns normalization and canonicalization rules",
    dataMoving: "Raw financial transactions, trial balance data, account balances, entity metadata",
    description: "Financial data is ingested from ERP systems (SAP, Oracle, NetSuite) into PDC. PDC normalizes the data into the DCT canonical financial data model — standardizing account codes, entity IDs, currency, and period.",
    keyFact: "PDC does NOT apply tax rules. It only normalizes financial data.",
    icon: "🏭",
  },
  {
    id: 2,
    from: "PDC",
    to: "TDC",
    platform: "TDC — Tax Data Consolidation (DCT)",
    platformColor: "#065f46",
    owner: "RSM / CATT — TDC Team",
    dataOwner: "TDC owns all tax decisions and classified records",
    businessRuleOwner: "TDC owns Known Mapping rules, tax classifications, and adjustment logic",
    dataMoving: "Normalized financial records, account classifications, entity data, period data",
    description: "PDC publishes normalized financial records to TDC via the published API contract. TDC applies Known Mapping rules to classify each financial record into a tax category, computes adjustments, and builds the provision schedule.",
    keyFact: "TDC is the only system that makes tax decisions. All downstream systems receive TDC outputs.",
    icon: "⚙️",
  },
  {
    id: 3,
    from: "TDC",
    to: "Gateway",
    platform: "Gateway — B9A Governed Consumer Access Layer",
    platformColor: "#7c3aed",
    owner: "RSM / CATT — Platform Team",
    dataOwner: "Gateway does not own data — it routes and scopes TDC data",
    businessRuleOwner: "Gateway owns access policies and consumer scoping rules",
    dataMoving: "Classified tax records, provision schedules, audit trail data, workpaper data",
    description: "TDC makes its governed outputs available through the Gateway (Batch 9A). The Gateway is the single entry point for all downstream consumers. No consumer can access TDC data directly — all requests go through the Gateway.",
    keyFact: "The Gateway enforces consumer scoping — Provision sees provision data; State sees state data; Roger sees practitioner data.",
    icon: "🔐",
  },
  {
    id: 4,
    from: "Gateway",
    to: "Roger",
    platform: "Roger — Practitioner Interface",
    platformColor: "#0369a1",
    owner: "RSM / CATT — Roger Team",
    dataOwner: "Roger does NOT own data — it displays TDC data read-only",
    businessRuleOwner: "Roger does NOT own business rules — all rules are in TDC",
    dataMoving: "Practitioner-scoped classifications, workpaper summaries, audit trail for review",
    description: "Roger requests practitioner-scoped data from the Gateway. The Gateway returns only the data Roger's consumer profile allows. Roger displays classifications, workpapers, and audit trail for practitioner review. When a practitioner submits an override, Roger sends it to TDC via the Gateway — TDC processes it.",
    keyFact: "Roger is READ-ONLY. It does not save data or make decisions. All overrides are processed by TDC.",
    icon: "👤",
  },
  {
    id: 5,
    from: "Gateway",
    to: "GoSystem",
    platform: "GoSystem Tax",
    platformColor: "#be185d",
    owner: "RSM — Tax Compliance Team",
    dataOwner: "GoSystem owns the tax return and filing — not the source data",
    businessRuleOwner: "GoSystem owns filing rules and regulatory compliance logic",
    dataMoving: "Tax workpapers, provision schedules, adjustment history, state apportionment data",
    description: "GoSystem requests workpaper and provision exports from the Gateway. The Gateway returns GoSystem-scoped data in the GoSystem-compatible export format (Batch 28). GoSystem uses this data for tax return preparation and regulatory filing.",
    keyFact: "GoSystem is a DOWNSTREAM CONSUMER. It receives data from TDC — it does not send data back into DCT.",
    icon: "🖥️",
  },
];

export default function Step4Simulation() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const step = SIMULATION_STEPS[currentStep];

  function handleNext() {
    if (currentStep < SIMULATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  }

  function handleContinue() {
    markStepComplete("step4-simulation");
    navigate("/onboarding/step5");
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Onboarding Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 4 — Data Flow Simulation</span>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 8px" }}>
        🔄 GoSystem Integration Data Flow Simulation
      </h1>
      <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px", lineHeight: "1.6" }}>
        Walk through the complete data flow from ERP to GoSystem. For each step, understand which platform is active,
        who owns the data, who owns the business rules, and what information moves downstream.
      </p>

      {/* Flow diagram */}
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "14px 20px", marginBottom: "24px",
        overflowX: "auto",
      }}>
        {["ERP", "PDC", "TDC", "Gateway", "Roger / GoSystem"].map((node, i) => (
          <div key={node} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
              backgroundColor: i <= currentStep ? "#0f1623" : "#e2e8f0",
              color: i <= currentStep ? "white" : "#94a3b8",
              whiteSpace: "nowrap",
            }}>
              {node}
            </div>
            {i < 4 && (
              <div style={{ fontSize: "16px", color: i < currentStep ? "#059669" : "#d1d5db" }}>→</div>
            )}
          </div>
        ))}
      </div>

      {!completed ? (
        <>
          {/* Step progress */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {SIMULATION_STEPS.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setCurrentStep(i)}
                style={{
                  flex: 1, height: "6px", borderRadius: "3px", cursor: "pointer",
                  backgroundColor: i < currentStep ? "#059669" : i === currentStep ? "#2563eb" : "#e2e8f0",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
            Step {currentStep + 1} of {SIMULATION_STEPS.length}: <strong>{step.from} → {step.to}</strong>
          </div>

          {/* Step card */}
          <div style={{
            backgroundColor: "white", border: `2px solid ${step.platformColor}`,
            borderRadius: "12px", overflow: "hidden",
          }}>
            {/* Platform header */}
            <div style={{
              backgroundColor: step.platformColor, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{ fontSize: "28px" }}>{step.icon}</span>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Active Platform
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>{step.platform}</div>
              </div>
            </div>

            {/* Step content */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <InfoBox label="Data Owner" value={step.dataOwner} color={step.platformColor} />
                <InfoBox label="Business Rule Owner" value={step.businessRuleOwner} color={step.platformColor} />
              </div>

              <div style={{
                backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "14px 16px", marginBottom: "14px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
                  What Moves Downstream
                </div>
                <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>
                  {step.dataMoving}
                </div>
              </div>

              <div style={{
                backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "14px 16px", marginBottom: "14px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
                  What Happens at This Step
                </div>
                <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.7" }}>
                  {step.description}
                </div>
              </div>

              {/* Key fact */}
              <div style={{
                backgroundColor: `${step.platformColor}08`, border: `1px solid ${step.platformColor}30`,
                borderRadius: "8px", padding: "12px 16px",
                borderLeft: `4px solid ${step.platformColor}`,
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: step.platformColor, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
                  Key Fact
                </div>
                <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, lineHeight: "1.5" }}>
                  {step.keyFact}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <button
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate("/onboarding/step3")}
              style={{
                fontSize: "13px", fontWeight: 600, color: "#64748b",
                backgroundColor: "white", border: "1px solid #e2e8f0",
                borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
              }}
            >
              ← {currentStep > 0 ? "Previous Step" : "Back to Step 3"}
            </button>
            <button
              onClick={handleNext}
              style={{
                fontSize: "13px", fontWeight: 700, color: "white",
                backgroundColor: step.platformColor, border: "none",
                borderRadius: "7px", padding: "9px 20px", cursor: "pointer",
              }}
            >
              {currentStep < SIMULATION_STEPS.length - 1 ? `Next: ${SIMULATION_STEPS[currentStep + 1].from} → ${SIMULATION_STEPS[currentStep + 1].to} →` : "Complete Simulation ✓"}
            </button>
          </div>
        </>
      ) : (
        /* Completion state */
        <div style={{
          backgroundColor: "#f0fdf4", border: "1px solid #86efac",
          borderRadius: "12px", padding: "28px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#065f46", margin: "0 0 10px" }}>
            Simulation Complete!
          </h2>
          <p style={{ fontSize: "14px", color: "#166534", lineHeight: "1.7", maxWidth: "600px", margin: "0 auto 20px" }}>
            You have completed the GoSystem Integration Data Flow Simulation. You now understand how data flows
            from ERP through PDC, TDC, and the Gateway to Roger and GoSystem — and who owns the data and
            business rules at each step.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => { setCompleted(false); setCurrentStep(0); }}
              style={{
                fontSize: "13px", fontWeight: 600, color: "#065f46",
                backgroundColor: "white", border: "1px solid #86efac",
                borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
              }}
            >
              ↺ Replay Simulation
            </button>
            <button
              onClick={handleContinue}
              style={{
                fontSize: "13px", fontWeight: 700, color: "white",
                backgroundColor: "#059669", border: "none",
                borderRadius: "7px", padding: "9px 20px", cursor: "pointer",
              }}
            >
              ✓ Continue to Step 5 — Ask Buddy →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "12px 14px", backgroundColor: `${color}06`,
      border: `1px solid ${color}20`, borderRadius: "8px",
    }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>{value}</div>
    </div>
  );
}

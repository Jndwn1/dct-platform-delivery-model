import { useState, useEffect, useRef } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface SimStep {
  id: number;
  phase: string;
  system: string;
  systemColor: string;
  action: string;
  detail: string;
  icon: string;
}

const SIM_STEPS: SimStep[] = [
  // Phase 1: PDC
  { id: 1,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Customer uploads Trial Balance",  detail: "Client submits trial balance file via Tax Portal. PDC receives the upload event.", icon: "📤" },
  { id: 2,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "PDC ingests raw data",             detail: "PDC validates file format, parses GL entries, and stages data for normalization.", icon: "⬇" },
  { id: 3,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Normalize financial data",         detail: "PDC applies canonical model transformations — account codes, amounts, currency normalization.", icon: "⚙" },
  { id: 4,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Assign Entity",                    detail: "PDC resolves the entity identifier from the client's entity master and assigns it to all records.", icon: "🏢" },
  { id: 5,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Assign Reporting Period",          detail: "PDC assigns the correct fiscal year and reporting period based on the client's calendar.", icon: "📅" },
  { id: 6,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Create Financial Truth",           detail: "PDC creates the canonical financial truth record — the authoritative source for all downstream processing.", icon: "✓" },
  { id: 7,  phase: "Phase 1: PDC Ingestion",     system: "PDC",     systemColor: "#1e3a5f", action: "Send to TDC",                     detail: "PDC publishes normalized financial data to TDC via the PDC→TDC data contract.", icon: "→" },
  // Phase 2: TDC
  { id: 8,  phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "TDC receives financial data",      detail: "TDC receives the normalized financial data event from PDC and begins tax transformation.", icon: "📥" },
  { id: 9,  phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Apply tax rules",                  detail: "TDC runs the tax rules engine against each financial record to determine applicable tax treatment.", icon: "⚖" },
  { id: 10, phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Apply known mappings",             detail: "TDC applies pre-configured known mappings to automatically classify accounts to tax lines.", icon: "🗺" },
  { id: 11, phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Apply book/tax classifications",   detail: "TDC classifies each item as book or tax, resolving book-to-tax differences.", icon: "📊" },
  { id: 12, phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Apply tax adjustments",            detail: "TDC applies system-level tax adjustments including depreciation, amortization, and deferred items.", icon: "±" },
  { id: 13, phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Apply state rules",                detail: "TDC applies state-specific tax rules for each applicable jurisdiction.", icon: "🗺" },
  { id: 14, phase: "Phase 2: TDC Transformation", system: "TDC",    systemColor: "#065f46", action: "Store tax-ready data",             detail: "TDC persists the fully transformed, tax-ready data with complete lineage metadata.", icon: "💾" },
  // Phase 3: Roger
  { id: 15, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Roger loads APIs",                 detail: "Roger calls TDC Read APIs to load the practitioner's assigned accounts and mappings.", icon: "🔌" },
  { id: 16, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Roger displays data",              detail: "Roger renders the tax data in the practitioner workspace — accounts, amounts, classifications.", icon: "🖥" },
  { id: 17, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "User edits account",               detail: "Tax professional reviews an account mapping and updates the classification.", icon: "✏" },
  { id: 18, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Creates adjustment",               detail: "Practitioner creates a manual tax adjustment with a supporting memo.", icon: "+" },
  { id: 19, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Adds memo",                        detail: "Practitioner documents the rationale for the adjustment in the memo field.", icon: "📝" },
  { id: 20, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Approves",                         detail: "Practitioner approves the reviewed items, marking them ready for downstream processing.", icon: "✓" },
  { id: 21, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Calls Update API",                 detail: "Roger calls the TDC Update API to send the practitioner's changes back to TDC.", icon: "📤" },
  { id: 22, phase: "Phase 3: Roger Review",       system: "Roger",  systemColor: "#7c3aed", action: "Sends changes back to TDC",        detail: "All practitioner decisions are transmitted to TDC for validation and persistence.", icon: "→" },
  // Phase 4: TDC Persistence
  { id: 23, phase: "Phase 4: TDC Persistence",   system: "TDC",    systemColor: "#065f46", action: "TDC validates",                    detail: "TDC validates the incoming practitioner changes against business rules and constraints.", icon: "✓" },
  { id: 24, phase: "Phase 4: TDC Persistence",   system: "TDC",    systemColor: "#065f46", action: "TDC persists",                     detail: "TDC persists the validated changes to the data store — TDC is the system of record.", icon: "💾" },
  { id: 25, phase: "Phase 4: TDC Persistence",   system: "TDC",    systemColor: "#065f46", action: "Updates lineage",                  detail: "TDC updates the lineage record to capture who changed what, when, and why.", icon: "🔗" },
  { id: 26, phase: "Phase 4: TDC Persistence",   system: "TDC",    systemColor: "#065f46", action: "Publishes events",                 detail: "TDC publishes downstream events to notify IMS and other governed consumers that data is ready.", icon: "📡" },
  { id: 27, phase: "Phase 4: TDC Persistence",   system: "TDC",    systemColor: "#065f46", action: "Makes data available downstream",  detail: "Finalized, practitioner-approved data is now available via the B9A Gateway. IMS retrieves it as a governed consumer.", icon: "→" },
  // Phase 5: IMS Integration
  { id: 28, phase: "Phase 5: IMS Integration",   system: "IMS",    systemColor: "#7c3aed", action: "IMS retrieves payload via B9A",    detail: "IMS (Integration & Management System) retrieves the governed tax-ready payload from TDC via the B9A Gateway API. IMS is a governed consumer — it does not receive a direct push from TDC.", icon: "📥" },
  { id: 29, phase: "Phase 5: IMS Integration",   system: "IMS",    systemColor: "#7c3aed", action: "IMS translates IRS line codes",    detail: "IMS translates each formLineCode from the TDC flat payload into the target engine's specific field format. TDC sends one flat line per record; IMS rolls up to per-form-line totals.", icon: "↔" },
  { id: 30, phase: "Phase 5: IMS Integration",   system: "IMS",    systemColor: "#7c3aed", action: "IMS routes to return engine",      detail: "IMS routes the translated, engine-shaped payload to the correct return engine (GoSystem Tax, CCH, OIT, or future engine) based on the filing's engine assignment.", icon: "🔀" },
  { id: 31, phase: "Phase 5: IMS Integration",   system: "IMS",    systemColor: "#7c3aed", action: "Return engine produces return",    detail: "The target return engine (e.g., GoSystem Tax) receives the IMS-translated payload and assembles the federal return, state returns, schedules, and tax forms.", icon: "📋" },
  { id: 32, phase: "Phase 5: IMS Integration",   system: "IMS",    systemColor: "#7c3aed", action: "IMS sends per-line feedback",      detail: "IMS returns per-line results to TDC using the returnLineId correlation key. TDC records delivery status (DELIVERED or DELIVERY_FAILED) for lineage.", icon: "↩" },
];

const PHASES = ["Phase 1: PDC Ingestion", "Phase 2: TDC Transformation", "Phase 3: Roger Review", "Phase 4: TDC Persistence", "Phase 5: IMS Integration"];

const SYSTEM_COLORS: Record<string, string> = {
  "PDC": "#1e3a5f",
  "TDC": "#065f46",
  "Roger": "#7c3aed",
  "IMS": "#7c3aed",
  "GoSystem": "#92400e",
};

export default function DataFlowSimulation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= SIM_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const activeStep = SIM_STEPS[currentStep];
  const progress = ((currentStep + 1) / SIM_STEPS.length) * 100;

  const currentPhaseIdx = PHASES.indexOf(activeStep.phase);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>🎮</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Data Flow Simulation</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Watch data move through the DCT ecosystem in real time. Use the controls to play, pause, and step through each action.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: "#0f1623", borderRadius: "10px", padding: "16px 20px",
        marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: "8px 20px", borderRadius: "6px", border: "none", cursor: "pointer",
            backgroundColor: isPlaying ? "#dc2626" : "#059669", color: "white",
            fontWeight: 700, fontSize: "13px",
          }}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #334155", cursor: "pointer", backgroundColor: "transparent", color: "#94a3b8", fontSize: "13px" }}
        >
          ← Prev
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(SIM_STEPS.length - 1, currentStep + 1))}
          style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #334155", cursor: "pointer", backgroundColor: "transparent", color: "#94a3b8", fontSize: "13px" }}
        >
          Next →
        </button>
        <button
          onClick={reset}
          style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #334155", cursor: "pointer", backgroundColor: "transparent", color: "#94a3b8", fontSize: "13px" }}
        >
          ↺ Reset
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Speed:</span>
          {[["Slow", 2000], ["Normal", 1200], ["Fast", 600]].map(([label, ms]) => (
            <button
              key={label}
              onClick={() => setSpeed(ms as number)}
              style={{
                padding: "4px 10px", borderRadius: "4px", border: "none", cursor: "pointer",
                backgroundColor: speed === ms ? "#3b82f6" : "#1e2a3a", color: speed === ms ? "white" : "#64748b",
                fontSize: "11px", fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Step {currentStep + 1} of {SIM_STEPS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#059669", borderRadius: "3px", transition: "width 0.3s ease" }} />
        </div>
        {/* Phase indicators */}
        <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
          {PHASES.map((phase, idx) => (
            <div key={phase} style={{
              flex: 1, padding: "4px 6px", borderRadius: "4px", textAlign: "center",
              backgroundColor: idx === currentPhaseIdx ? "#1e3a5f" : idx < currentPhaseIdx ? "#059669" : "#f1f5f9",
              transition: "background-color 0.3s",
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: idx <= currentPhaseIdx ? "white" : "#94a3b8", lineHeight: "1.3" }}>
                {phase.split(":")[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main simulation display */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Active step card */}
        <div style={{
          backgroundColor: "white", border: `2px solid ${activeStep.systemColor}`,
          borderRadius: "12px", padding: "24px",
          boxShadow: `0 4px 20px ${activeStep.systemColor}22`,
        }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: activeStep.systemColor, marginBottom: "6px" }}>
            {activeStep.system} — {activeStep.phase}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "10px",
              backgroundColor: activeStep.systemColor, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0,
            }}>
              {activeStep.icon}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f1623", lineHeight: "1.3" }}>
              {activeStep.action}
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.7", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
            {activeStep.detail}
          </div>
        </div>

        {/* System pipeline visual */}
        <div style={{
          backgroundColor: "#0f1623", borderRadius: "12px", padding: "20px",
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>
            System Pipeline
          </div>
          {["ERP / Client", "PDC", "TDC", "Roger", "TDC (Persist)", "IMS"].map((sys, idx) => {
            const sysKey = sys.split(" ")[0].replace("(Persist)", "").trim();
            const color = SYSTEM_COLORS[sysKey] ?? "#475569";
            const isActive = activeStep.system === sysKey || (sys === "TDC (Persist)" && activeStep.system === "TDC" && activeStep.phase === "Phase 4: TDC Persistence");
            const isPast = idx < ["ERP / Client", "PDC", "TDC", "Roger", "TDC (Persist)", "IMS"].indexOf(
              activeStep.system === "TDC" && activeStep.phase === "Phase 4: TDC Persistence" ? "TDC (Persist)" : activeStep.system
            );
            return (
              <div key={sys} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                  backgroundColor: isActive ? "#10b981" : isPast ? color : "#1e2a3a",
                  border: `2px solid ${isActive ? "#10b981" : isPast ? color : "#334155"}`,
                  transition: "background-color 0.3s",
                }} />
                <div style={{
                  flex: 1, padding: "6px 12px", borderRadius: "6px",
                  backgroundColor: isActive ? `${color}33` : isPast ? `${color}11` : "#1e2a3a",
                  border: `1px solid ${isActive ? color : isPast ? `${color}44` : "#334155"}`,
                  transition: "all 0.3s",
                }}>
                  <span style={{ fontSize: "12px", fontWeight: isActive ? 700 : 500, color: isActive ? "white" : isPast ? "#94a3b8" : "#475569" }}>
                    {sys}
                  </span>
                  {isActive && <span style={{ fontSize: "10px", color: "#10b981", marginLeft: "8px" }}>● ACTIVE</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step log */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
        padding: "16px", maxHeight: "200px", overflowY: "auto",
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "10px" }}>
          Simulation Log
        </div>
        {SIM_STEPS.slice(0, currentStep + 1).reverse().map((step) => (
          <div key={step.id} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "4px 0", borderBottom: "1px solid #f1f5f9",
            opacity: step.id === SIM_STEPS[currentStep].id ? 1 : 0.5,
          }}>
            <span style={{ fontSize: "10px", color: "#94a3b8", width: "24px", flexShrink: 0 }}>#{step.id}</span>
            <span style={{
              fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontWeight: 700,
              backgroundColor: step.systemColor, color: "white", flexShrink: 0,
            }}>{step.system}</span>
            <span style={{ fontSize: "11px", color: "#334155" }}>{step.action}</span>
          </div>
        ))}
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/simulation" pageTitle="Data Flow Simulation" />
    </div>
  );
}

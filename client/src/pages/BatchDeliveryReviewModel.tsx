// Batch Delivery Review Model — AI-Assisted Batch Delivery Lifecycle
// RSM | DCT Platform | Governance Workflow
// Batch Flow V1.0 — 19 Steps · 5 Phases · 5 Gates
// Companion to AAP Review Model (Design Governance → Delivery Governance)
// NON-PRODUCTION ARCHITECTURE REFERENCE

import { useState, useEffect, useRef } from "react";
import GovernanceBanner from "@/components/GovernanceBanner";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

type CardType = "agent" | "governance" | "approved" | "gate";

interface StageCard {
  stage: number;
  lane: string;
  type: CardType;
  label: string;
  sublabel: string;
  badge?: string;
  badgeColor?: string;
  outputs?: string[];
  artifact?: string;
  checks?: string[];
  decisionPaths?: string[];
}

// ─── SWIM LANES ──────────────────────────────────────────────────────────────

const LANES = [
  { key: "po",            label: "PRODUCT\nOWNER" },
  { key: "ba",            label: "BUSINESS\nANALYST" },
  { key: "lead-dev",      label: "LEAD DEV /\nARCHITECT" },
  { key: "build-agent",   label: "BUILD\nAGENT" },
  { key: "val-agent",     label: "VALIDATION\nAGENT" },
  { key: "test-agent",    label: "TEST GEN\nAGENT" },
  { key: "developer",     label: "DEVELOPER" },
  { key: "qa",            label: "QA TEAM" },
];

// ─── PHASE DEFINITIONS ───────────────────────────────────────────────────────

const PHASES = [
  { label: "REQUIREMENTS",  stages: [1, 2, 3, 4],             color: "#3b82f6", bg: "#eff6ff" },
  { label: "DESIGN",        stages: [5, 6],                   color: "#ea580c", bg: "#fff7ed" },
  { label: "BUILD",         stages: [7, 8, 9, 10],            color: "#7c3aed", bg: "#f5f3ff" },
  { label: "MERGE & VERIFY",stages: [11, 12, 13, 14, 15, 16], color: "#059669", bg: "#f0fdf4" },
  { label: "QA OPERATIONS", stages: [17, 18, 19],             color: "#0891b2", bg: "#f0f9ff" },
];

const STAGE_PHASE: Record<number, typeof PHASES[0]> = {};
for (const phase of PHASES) {
  for (const s of phase.stages) STAGE_PHASE[s] = phase;
}

// ─── STAGE CARDS (19 stages) ─────────────────────────────────────────────────

const STAGE_CARDS: StageCard[] = [
  // ── REQUIREMENTS PHASE ──────────────────────────────────────────────────────
  {
    stage: 1, lane: "po", type: "governance",
    label: "Batch Planning",
    sublabel: "Batch selected and prioritized. Context brief produced with scope, dependencies, and invariants. Saved to ADO Epic.",
    badge: "STEP 1", badgeColor: "#3b82f6",
    outputs: ["Batch Context Brief", "Scope", "Dependencies", "Invariants"],
    artifact: "Batch Context Brief",
  },
  {
    stage: 2, lane: "ba", type: "governance",
    label: "Story Creation",
    sublabel: "Stories written as constraints (AI-assisted). Compiled into Build Prompt MD. Placeholders created in DevOps.",
    badge: "STEP 2", badgeColor: "#3b82f6",
    outputs: ["Story Template", "Build Prompt"],
    artifact: "Build Prompt",
  },
  {
    stage: 3, lane: "lead-dev", type: "gate",
    label: "Review & Lock",
    sublabel: "Scope review, AC coverage, dependency validation. No TBD items. Build Prompt locked. Nothing proceeds until PO + Lead Dev sign off.",
    badge: "GATE 1 — REVIEW & LOCK", badgeColor: "#dc2626",
    checks: ["Scope Review", "AC Coverage", "Dependency Validation", "No TBD Items"],
    artifact: "Locked Build Prompt",
  },
  {
    stage: 4, lane: "ba", type: "governance",
    label: "Work Tracking Entry",
    sublabel: "Full story detail entered into ADO from locked Build Prompt. Generate QA Artifacts task created. Accurate capture, not interpretation.",
    badge: "STEP 4 · ADO", badgeColor: "#7c3aed",
    outputs: ["ADO Story", "Generate QA Artifacts Task"],
  },
  // ── DESIGN PHASE ────────────────────────────────────────────────────────────
  {
    stage: 5, lane: "build-agent", type: "agent",
    label: "Generate Agent Action Plan",
    sublabel: "Build agent reads locked Build Prompt → generates AAP (design intent, not code). Design intent and data plan produced. Saved to ADO immediately.",
    badge: "STEP 5 · AAP", badgeColor: "#ea580c",
    outputs: ["Agent Action Plan (AAP)", "Design Intent"],
    artifact: "AAP",
  },
  {
    stage: 6, lane: "lead-dev", type: "gate",
    label: "Plan Validation",
    sublabel: "AAP vs Build Prompt, data plan alignment, architecture alignment. No code until approved. Loop-back to Step 5 or Step 2 if off.",
    badge: "GATE 2 — PLAN VALIDATION", badgeColor: "#dc2626",
    checks: ["AAP vs Build Prompt", "Data Plan Alignment", "Architecture Alignment"],
    artifact: "Approved AAP",
  },
  // ── BUILD PHASE ─────────────────────────────────────────────────────────────
  {
    stage: 7, lane: "build-agent", type: "agent",
    label: "Code Generation",
    sublabel: "Build agent generates code from approved AAP: DB migrations, models, APIs, tests, Build One-Pager. Saved to feature branch.",
    badge: "STEP 7 · BUILD", badgeColor: "#7c3aed",
    outputs: ["Code", "Migrations", "APIs", "Tests", "Build One-Pager"],
    artifact: "Build One-Pager",
  },
  {
    stage: 8, lane: "developer", type: "governance",
    label: "Runtime Verification",
    sublabel: "Dev verifies build success, migration success, unit tests, UI validation, and API validation on feature branch.",
    badge: "STEP 8", badgeColor: "#0891b2",
    checks: ["Build Success", "Migration Success", "Unit Tests", "UI Validation", "API Validation"],
  },
  {
    stage: 9, lane: "build-agent", type: "agent",
    label: "AI Code Review",
    sublabel: "Code Review Agent runs against PR. Produces review comments, NFR findings, risk findings, and scope violations. Dev triages every comment.",
    badge: "STEP 9 · AI REVIEW", badgeColor: "#7c3aed",
    outputs: ["Review Comments", "NFR Findings", "Risk Findings", "Scope Violations"],
  },
  {
    stage: 10, lane: "lead-dev", type: "approved",
    label: "Approval & Refinement",
    sublabel: "Lead Dev approves skip recommendations. Selects refinement path: A (Refine PR), B (Full Reset), or C (Developer Fixes).",
    badge: "STEP 10 · APPROVE", badgeColor: "#059669",
    decisionPaths: ["Path A — Refine PR", "Path B — Full Reset", "Path C — Developer Fixes"],
  },
  // ── MERGE & VERIFY PHASE ────────────────────────────────────────────────────
  {
    stage: 11, lane: "val-agent", type: "agent",
    label: "Generate Validation Boundary",
    sublabel: "Validation Agent generates Validation Boundary One-Pager with known gaps. Defines what is and is not covered by automated tests.",
    badge: "STEP 11 · VAL", badgeColor: "#059669",
    outputs: ["Validation Boundary One-Pager", "Known Gaps"],
    artifact: "Validation Boundary",
  },
  {
    stage: 12, lane: "po", type: "gate",
    label: "Validation Boundary Approval",
    sublabel: "Product Owner reviews invariant coverage and known gap decisions. Approved Validation Boundary unlocks test generation.",
    badge: "GATE 3 — VAL APPROVAL", badgeColor: "#dc2626",
    checks: ["Invariant Coverage", "Known Gap Decisions"],
    artifact: "Approved Validation Boundary",
  },
  {
    stage: 13, lane: "test-agent", type: "agent",
    label: "Generate Playwright Suite",
    sublabel: "Test Generation Agent generates automated Playwright test suite from approved Validation Boundary. Saved to ADO and feature branch.",
    badge: "STEP 13 · PLAYWRIGHT", badgeColor: "#059669",
    outputs: ["Automated Playwright Test Suite"],
    artifact: "Playwright Suite",
  },
  {
    stage: 14, lane: "lead-dev", type: "governance",
    label: "Test Review",
    sublabel: "Lead Dev reviews Playwright suite for coverage, traceability, and validation alignment. Approves or requests regeneration.",
    badge: "STEP 14", badgeColor: "#0891b2",
    checks: ["Coverage", "Traceability", "Validation Alignment"],
  },
  {
    stage: 15, lane: "lead-dev", type: "gate",
    label: "Final Review & Merge",
    sublabel: "Scope compliance, invariant enforcement, production readiness. Invariants enforced, scope respected, ACs satisfied. PR merged to release branch.",
    badge: "GATE 4 — FINAL REVIEW", badgeColor: "#dc2626",
    checks: ["Scope Compliance", "Invariant Enforcement", "Production Readiness"],
    artifact: "Merged Release Branch",
  },
  {
    stage: 16, lane: "lead-dev", type: "approved",
    label: "Post Merge Verification",
    sublabel: "Runtime validation, integration validation, release health check. Same as Step 8 plus integration with other merged work on release branch.",
    badge: "STEP 16 · VERIFY", badgeColor: "#059669",
    checks: ["Runtime Validation", "Integration Validation", "Release Health"],
  },
  // ── QA OPERATIONS PHASE ─────────────────────────────────────────────────────
  {
    stage: 17, lane: "qa", type: "governance",
    label: "Pipeline Execution",
    sublabel: "CI/CD pipeline executes Playwright suite. Results, screenshots, logs, and reports produced and saved to ADO.",
    badge: "STEP 17 · CI/CD", badgeColor: "#0891b2",
    outputs: ["Playwright Results", "Screenshots", "Logs", "Reports"],
  },
  {
    stage: 18, lane: "qa", type: "governance",
    label: "Triage & Exploratory",
    sublabel: "QA Team triages all failures. Each classified as: Real Defect, Flaky Test, Environment Issue, Known Gap, or Bad Test.",
    badge: "STEP 18 · TRIAGE", badgeColor: "#0891b2",
    decisionPaths: ["Real Defect", "Flaky Test", "Environment Issue", "Known Gap", "Bad Test"],
  },
  {
    stage: 19, lane: "qa", type: "gate",
    label: "Batch Sign-Off",
    sublabel: "QA Lead confirms Sev1 cleared, Sev2 cleared, governance acknowledged. Batch closed. Artifact chain complete.",
    badge: "GATE 5 — BATCH SIGN-OFF", badgeColor: "#059669",
    checks: ["Sev1 Cleared", "Sev2 Cleared", "Governance Acknowledged"],
    artifact: "Batch Closed — COMPLETE",
  },
];

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────

const CARD_STYLES: Record<CardType, { bg: string; border: string; titleColor: string }> = {
  agent:      { bg: "#fff7ed", border: "#fb923c", titleColor: "#9a3412" },
  governance: { bg: "#eff6ff", border: "#60a5fa", titleColor: "#1e40af" },
  approved:   { bg: "#f0fdf4", border: "#4ade80", titleColor: "#166534" },
  gate:       { bg: "#fef2f2", border: "#f87171", titleColor: "#991b1b" },
};

const STAGE_COUNT = 19;
const STAGE_W = 108;
const LANE_H = 92;
const LANE_LABEL_W = 108;

// ─── ARTIFACT CHAIN ──────────────────────────────────────────────────────────

const ARTIFACT_CHAIN = [
  { name: "Batch Context Brief", stage: 1 },
  { name: "Build Prompt",        stage: 2 },
  { name: "AAP",                 stage: 5 },
  { name: "Build One-Pager",     stage: 7 },
  { name: "Validation Boundary", stage: 11 },
  { name: "Playwright Suite",    stage: 13 },
  { name: "QA Results",          stage: 17 },
  { name: "Batch Sign-Off",      stage: 19 },
];

const GATE_LIST = [
  { num: 1, label: "Review & Lock",          stage: 3,  owner: "PO + Lead Dev" },
  { num: 2, label: "Plan Validation",        stage: 6,  owner: "Lead Dev" },
  { num: 3, label: "Validation Approval",    stage: 12, owner: "Product Owner" },
  { num: 4, label: "Final Review & Merge",   stage: 15, owner: "Lead Dev" },
  { num: 5, label: "Batch Sign-Off",         stage: 19, owner: "QA Lead" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function BatchDeliveryReviewModel() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simStage, setSimStage] = useState<number | null>(null);
  const [simDone, setSimDone] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simStageRef = useRef<number>(1);
  const simPausedRef = useRef<boolean>(false);

  // Build lookups
  const cardMap: Record<string, Record<number, StageCard>> = {};
  for (const card of STAGE_CARDS) {
    if (!cardMap[card.lane]) cardMap[card.lane] = {};
    cardMap[card.lane][card.stage] = card;
  }

  const stageFirstCard: Record<number, string> = {};
  for (const card of STAGE_CARDS) {
    if (!stageFirstCard[card.stage]) {
      stageFirstCard[card.stage] = `${card.lane}-${card.stage}`;
    }
  }

  const totalW = LANE_LABEL_W + STAGE_COUNT * STAGE_W;

  // ── Simulation logic ──────────────────────────────────────────────────────
  const goToStage = (stage: number) => {
    const clamped = Math.max(1, Math.min(STAGE_COUNT, stage));
    simStageRef.current = clamped;
    setSimStage(clamped);
    setSelectedCard(stageFirstCard[clamped] ?? null);
  };

  const stopSimulation = () => {
    if (simRef.current) clearInterval(simRef.current);
    setSimRunning(false);
    setSimPaused(false);
    simPausedRef.current = false;
    setSimStage(null);
    setSimDone(false);
    setSelectedCard(null);
  };

  const runInterval = () => {
    simRef.current = setInterval(() => {
      if (simPausedRef.current) return;
      simStageRef.current += 1;
      if (simStageRef.current > STAGE_COUNT) {
        if (simRef.current) clearInterval(simRef.current);
        setSimRunning(false);
        setSimPaused(false);
        simPausedRef.current = false;
        setSimStage(null);
        setSimDone(true);
        setTimeout(() => { setSimDone(false); setSelectedCard(null); }, 3000);
        return;
      }
      setSimStage(simStageRef.current);
      setSelectedCard(stageFirstCard[simStageRef.current] ?? null);
    }, 950);
  };

  const pauseResumeSimulation = () => {
    if (!simRunning) return;
    if (simPausedRef.current) {
      simPausedRef.current = false;
      setSimPaused(false);
      runInterval();
    } else {
      if (simRef.current) clearInterval(simRef.current);
      simPausedRef.current = true;
      setSimPaused(true);
    }
  };

  const startSimulation = () => {
    if (simRunning) { stopSimulation(); return; }
    setSimDone(false);
    setSimPaused(false);
    simPausedRef.current = false;
    setSimRunning(true);
    simStageRef.current = 1;
    setSimStage(1);
    setSelectedCard(stageFirstCard[1] ?? null);
    runInterval();
  };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!simRunning) return;
      if (e.code === "Space") {
        e.preventDefault();
        pauseResumeSimulation();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (simPausedRef.current) goToStage(simStageRef.current + 1);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (simPausedRef.current) goToStage(simStageRef.current - 1);
      } else if (e.code === "Escape") {
        e.preventDefault();
        stopSimulation();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRunning]);

  useEffect(() => {
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      backgroundColor: presentationMode ? "#0f172a" : "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {!presentationMode && <GovernanceBanner />}

      <div style={{ padding: presentationMode ? "16px 20px" : "20px 24px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: "16px", flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <h1 style={{
                fontSize: presentationMode ? "20px" : "18px",
                fontWeight: 800, color: presentationMode ? "#f1f5f9" : "#0f172a",
                margin: 0, letterSpacing: "-0.01em",
              }}>
                Batch Delivery Review Model
              </h1>
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px",
                backgroundColor: "#fff7ed", color: "#9a3412", border: "1px solid #fb923c",
                letterSpacing: "0.06em",
              }}>BLITZY</span>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
                backgroundColor: presentationMode ? "#1e293b" : "#f0fdf4",
                color: presentationMode ? "#4ade80" : "#166534",
                border: `1px solid ${presentationMode ? "#166534" : "#4ade80"}`,
                letterSpacing: "0.04em",
              }}>Batch Flow V1.0</span>
              <span style={{
                fontSize: "11px", color: "#64748b",
                backgroundColor: presentationMode ? "#1e293b" : "#f1f5f9",
                padding: "2px 8px", borderRadius: "4px",
              }}>19 Steps · 5 Phases · 5 Gates · End-to-End Governance Flow</span>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
                backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #60a5fa",
                letterSpacing: "0.04em",
              }}>Governance Visualization Active</span>
            </div>
            <p style={{
              fontSize: "12px", color: presentationMode ? "#94a3b8" : "#64748b",
              margin: 0, maxWidth: "860px", lineHeight: "1.6",
            }}>
              <strong style={{ color: presentationMode ? "#cbd5e1" : "#374151" }}>AI-Assisted Batch Delivery Lifecycle.</strong>{" "}
              Stories are written as constraints. Artifacts flow forward through design, development, validation, and QA operations.
              Humans approve at governance gates. Agents accelerate execution. Every artifact feeds the next and maintains full traceability
              from Batch Planning through Batch Sign-Off.
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => setPresentationMode(p => !p)}
              style={{
                fontSize: "12px", fontWeight: 600, padding: "7px 14px", borderRadius: "6px",
                border: "1px solid #cbd5e1", cursor: "pointer",
                backgroundColor: presentationMode ? "#1e293b" : "white",
                color: presentationMode ? "#f1f5f9" : "#374151",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              ⊞ {presentationMode ? "Exit Presentation" : "Presentation Mode"}
            </button>
            <button
              style={{
                fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "6px",
                border: "none", cursor: "pointer",
                backgroundColor: simDone ? "#059669" : simRunning ? "#dc2626" : "#f97316",
                color: "white",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "background-color 0.2s ease",
              }}
              onClick={startSimulation}
            >
              {simDone ? "✓ Batch Complete" : simRunning ? "⏹ Stop" : "▶ Run Batch Simulation"}
            </button>
          </div>
        </div>

        {/* ── Simulation progress bar ── */}
        {simRunning && simStage !== null && (
          <div style={{
            marginBottom: "12px", padding: "8px 14px", borderRadius: "8px",
            backgroundColor: presentationMode ? "#1e293b" : "#fff7ed",
            border: "1px solid #fb923c",
            display: "flex", alignItems: "center", gap: "10px",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", flexShrink: 0, minWidth: "120px" }}>
              {simPaused ? "⏸ Paused —" : "▶"} Stage {simStage} / {STAGE_COUNT}
            </span>
            <div style={{ flex: 1, minWidth: "80px", height: "6px", backgroundColor: "#fed7aa", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                backgroundColor: simPaused ? "#94a3b8" : "#f97316",
                width: `${(simStage / STAGE_COUNT) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: "11px", color: "#ea580c", flexShrink: 0, fontWeight: 600, minWidth: "110px" }}>
              {STAGE_PHASE[simStage]?.label ?? ""}
            </span>
            <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
              <button
                onClick={() => { if (!simPaused) pauseResumeSimulation(); else goToStage(simStageRef.current - 1); }}
                title="Previous stage"
                style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "5px", border: "1px solid #fb923c", backgroundColor: "white", color: "#9a3412", cursor: "pointer" }}
              >← Prev</button>
              <button
                onClick={pauseResumeSimulation}
                title="Pause / Resume (Space)"
                style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "5px", border: "1px solid #fb923c", backgroundColor: simPaused ? "#f97316" : "white", color: simPaused ? "white" : "#9a3412", cursor: "pointer" }}
              >{simPaused ? "▶ Resume" : "⏸ Pause"}</button>
              <button
                onClick={() => { if (!simPaused) pauseResumeSimulation(); else goToStage(simStageRef.current + 1); }}
                title="Next stage"
                style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "5px", border: "1px solid #fb923c", backgroundColor: "white", color: "#9a3412", cursor: "pointer" }}
              >Next →</button>
            </div>
            <span style={{ fontSize: "10px", color: "#94a3b8", flexShrink: 0, fontStyle: "italic" }}>
              Space = pause · ←→ = step (paused) · Esc = stop
            </span>
          </div>
        )}

        {/* ── Legend ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "20px", marginBottom: "12px",
          flexWrap: "wrap", fontSize: "11px", fontWeight: 600,
        }}>
          {[
            { color: "#fb923c", label: "Agent / AI Generation" },
            { color: "#60a5fa", label: "Review / Governance" },
            { color: "#4ade80", label: "Approved / Complete" },
            { color: "#f87171", label: "Gate" },
          ].map(item => (
            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px", color: presentationMode ? "#cbd5e1" : "#374151" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: item.color, display: "inline-block" }} />
              {item.label}
            </span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "10px", color: presentationMode ? "#64748b" : "#94a3b8", fontStyle: "italic", fontWeight: 400 }}>
            Click any card to view details · Artifacts flow forward — each feeds the next
          </span>
        </div>

        {/* ── Main layout: swimlane + governance panel ── */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

          {/* ── Swimlane Grid ── */}
          <div style={{ flex: 1, overflowX: "auto", overflowY: "visible" }}>
            <div style={{ minWidth: `${totalW}px`, position: "relative" }}>

              {/* Phase divider row */}
              <div style={{ display: "flex", borderBottom: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}` }}>
                <div style={{ width: `${LANE_LABEL_W}px`, flexShrink: 0 }} />
                {Array.from({ length: STAGE_COUNT }, (_, i) => i + 1).map(s => {
                  const phase = STAGE_PHASE[s];
                  const isFirst = phase && phase.stages[0] === s;
                  const isLast = phase && phase.stages[phase.stages.length - 1] === s;
                  return (
                    <div key={s} style={{
                      width: `${STAGE_W}px`, flexShrink: 0,
                      backgroundColor: presentationMode ? `${phase?.color}22` : phase?.bg,
                      borderLeft: isFirst ? `2px solid ${phase?.color}` : `1px solid ${presentationMode ? "#1e293b" : "#e2e8f0"}`,
                      borderRight: isLast ? `2px solid ${phase?.color}` : "none",
                      padding: "4px 6px",
                      display: "flex", alignItems: "center", justifyContent: isFirst ? "flex-start" : "center",
                      overflow: "hidden",
                    }}>
                      {isFirst && (
                        <span style={{
                          fontSize: "9px", fontWeight: 800, color: phase?.color,
                          textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap",
                        }}>{phase?.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage header row */}
              <div style={{
                display: "flex",
                borderBottom: `2px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
                backgroundColor: presentationMode ? "#1e293b" : "#f1f5f9",
              }}>
                <div style={{
                  width: `${LANE_LABEL_W}px`, flexShrink: 0, padding: "6px 10px",
                  fontSize: "10px", fontWeight: 700, color: presentationMode ? "#64748b" : "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>LANE</div>
                {Array.from({ length: STAGE_COUNT }, (_, i) => i + 1).map(s => {
                  const phase = STAGE_PHASE[s];
                  const isSimActive = simStage === s;
                  return (
                    <div key={s} style={{
                      width: `${STAGE_W}px`, flexShrink: 0, textAlign: "center",
                      padding: "6px 4px", fontSize: "11px", fontWeight: 700,
                      color: isSimActive ? phase?.color : (presentationMode ? "#94a3b8" : "#64748b"),
                      borderLeft: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
                      backgroundColor: isSimActive ? (presentationMode ? `${phase?.color}22` : phase?.bg) : "transparent",
                      transition: "background-color 0.3s ease",
                    }}>{s}</div>
                  );
                })}
              </div>

              {/* Lane rows */}
              {LANES.map((lane, laneIdx) => (
                <div
                  key={lane.key}
                  style={{
                    display: "flex",
                    borderBottom: `1px solid ${presentationMode ? "#1e293b" : "#f1f5f9"}`,
                    backgroundColor: laneIdx % 2 === 0
                      ? (presentationMode ? "#0f172a" : "white")
                      : (presentationMode ? "#0c1420" : "#fafafa"),
                    minHeight: `${LANE_H}px`,
                  }}
                >
                  {/* Lane label */}
                  <div style={{
                    width: `${LANE_LABEL_W}px`, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                    padding: "8px 12px 8px 8px",
                    borderRight: `2px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
                  }}>
                    <span style={{
                      fontSize: "9px", fontWeight: 800, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right",
                      lineHeight: "1.3", whiteSpace: "pre-line",
                    }}>{lane.label}</span>
                  </div>

                  {/* Stage cells */}
                  {Array.from({ length: STAGE_COUNT }, (_, i) => i + 1).map(s => {
                    const card = cardMap[lane.key]?.[s];
                    const cardKey = card ? `${lane.key}-${s}` : null;
                    const isSelected = cardKey === selectedCard;
                    const isSimHighlight = simRunning && simStage === s && card !== undefined;
                    const phase = STAGE_PHASE[s];

                    return (
                      <div
                        key={s}
                        style={{
                          width: `${STAGE_W}px`, flexShrink: 0,
                          padding: "6px 5px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderLeft: `1px solid ${presentationMode ? "#1e293b" : "#f1f5f9"}`,
                          backgroundColor: isSimHighlight
                            ? (presentationMode ? `${phase?.color}18` : phase?.bg)
                            : "transparent",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        {card && (
                          <button
                            onClick={() => {
                              if (!simRunning) setSelectedCard(isSelected ? null : cardKey);
                            }}
                            title={card.sublabel}
                            style={{
                              width: "100%", padding: "7px 7px 6px",
                              borderRadius: "7px", cursor: simRunning ? "default" : "pointer",
                              border: `${isSimHighlight ? "2px" : "1.5px"} solid ${CARD_STYLES[card.type].border}`,
                              backgroundColor: isSelected || isSimHighlight
                                ? CARD_STYLES[card.type].border
                                : CARD_STYLES[card.type].bg,
                              boxShadow: isSelected || isSimHighlight
                                ? `0 3px 12px ${CARD_STYLES[card.type].border}66`
                                : "0 1px 3px rgba(0,0,0,0.07)",
                              textAlign: "left",
                              transition: "all 0.25s ease",
                              transform: isSimHighlight ? "scale(1.03)" : "scale(1)",
                            }}
                          >
                            {card.badge && (
                              <div style={{
                                fontSize: "8px", fontWeight: 800,
                                color: (isSelected || isSimHighlight) ? "white" : (card.badgeColor ?? "#374151"),
                                letterSpacing: "0.04em", marginBottom: "3px",
                                textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              }}>{card.badge}</div>
                            )}
                            <div style={{
                              fontSize: "11px", fontWeight: 700, lineHeight: "1.25",
                              color: (isSelected || isSimHighlight) ? "white" : CARD_STYLES[card.type].titleColor,
                              marginBottom: "3px",
                            }}>{card.label}</div>
                            <div style={{
                              fontSize: "9px", lineHeight: "1.3",
                              color: (isSelected || isSimHighlight) ? "rgba(255,255,255,0.85)" : "#6b7280",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical" as const,
                              overflow: "hidden",
                            }}>{card.sublabel}</div>
                            {card.artifact && (
                              <div style={{
                                marginTop: "4px", fontSize: "8px", fontWeight: 700,
                                color: (isSelected || isSimHighlight) ? "rgba(255,255,255,0.9)" : "#059669",
                                display: "flex", alignItems: "center", gap: "3px",
                              }}>
                                <span>↓</span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.artifact}</span>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right-side Governance Panel ── */}
          <div style={{
            width: "220px", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: "12px",
          }}>

            {/* Artifact Chain */}
            <div style={{
              backgroundColor: presentationMode ? "#1e293b" : "white",
              border: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
              borderRadius: "10px", padding: "12px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                ↓ Artifact Chain
              </div>
              {ARTIFACT_CHAIN.map((a, i) => {
                const isActive = simRunning && simStage !== null && simStage >= a.stage;
                const isCurrentArtifact = simRunning && simStage !== null &&
                  (i === ARTIFACT_CHAIN.length - 1 ? simStage >= a.stage : simStage >= a.stage && simStage < ARTIFACT_CHAIN[i + 1].stage);
                return (
                  <div key={a.name}>
                    <div style={{
                      fontSize: "11px", fontWeight: isCurrentArtifact ? 800 : 600,
                      color: isCurrentArtifact ? "#059669" : isActive ? "#374151" : (presentationMode ? "#64748b" : "#9ca3af"),
                      padding: "4px 8px", borderRadius: "5px",
                      backgroundColor: isCurrentArtifact ? "#f0fdf4" : "transparent",
                      border: isCurrentArtifact ? "1px solid #4ade80" : "1px solid transparent",
                      transition: "all 0.3s ease",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                        backgroundColor: isCurrentArtifact ? "#059669" : isActive ? "#4ade80" : "#d1d5db",
                        transition: "background-color 0.3s ease",
                      }} />
                      {a.name}
                    </div>
                    {i < ARTIFACT_CHAIN.length - 1 && (
                      <div style={{
                        fontSize: "11px", color: isActive ? "#059669" : "#d1d5db",
                        paddingLeft: "18px", lineHeight: "1.2", transition: "color 0.3s ease",
                      }}>↓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gate Status */}
            <div style={{
              backgroundColor: presentationMode ? "#1e293b" : "white",
              border: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
              borderRadius: "10px", padding: "12px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                🔒 Gate Status
              </div>
              {GATE_LIST.map(g => {
                const passed = simRunning && simStage !== null && simStage > g.stage;
                const active = simRunning && simStage !== null && simStage === g.stage;
                const isFinalGate = g.num === 5;
                return (
                  <div key={g.num} style={{
                    marginBottom: "6px", padding: "5px 8px", borderRadius: "5px",
                    backgroundColor: active ? "#fef2f2" : passed ? (isFinalGate ? "#f0fdf4" : "#f0fdf4") : "transparent",
                    border: active ? "1px solid #f87171" : passed ? "1px solid #4ade80" : `1px solid ${presentationMode ? "#334155" : "#f1f5f9"}`,
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: active ? "#dc2626" : passed ? "#059669" : (presentationMode ? "#64748b" : "#9ca3af") }}>
                      {passed ? "✓" : active ? "●" : "○"} Gate {g.num} — {g.label}
                    </div>
                    <div style={{ fontSize: "9px", color: presentationMode ? "#475569" : "#9ca3af", marginTop: "1px" }}>{g.owner}</div>
                  </div>
                );
              })}
            </div>

            {/* Audit Chain */}
            <div style={{
              backgroundColor: presentationMode ? "#1e293b" : "white",
              border: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
              borderRadius: "10px", padding: "12px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                ◈ Audit Chain
              </div>
              {[
                { label: "Build Prompt ID",           stage: 2 },
                { label: "AAP Version",               stage: 5 },
                { label: "PR Number",                 stage: 7 },
                { label: "Validation Boundary Ver.",  stage: 11 },
                { label: "Playwright Version",        stage: 13 },
                { label: "Batch Status",              stage: 19 },
              ].map(item => {
                const active = simRunning && simStage !== null && simStage >= item.stage;
                return (
                  <div key={item.label} style={{
                    marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <span style={{
                      width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                      backgroundColor: active ? "#7c3aed" : "#d1d5db",
                      transition: "background-color 0.3s ease",
                    }} />
                    <span style={{
                      fontSize: "10px", fontWeight: active ? 700 : 400,
                      color: active ? (presentationMode ? "#c4b5fd" : "#7c3aed") : (presentationMode ? "#475569" : "#9ca3af"),
                      transition: "all 0.3s ease",
                    }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Selected card detail panel ── */}
        {selectedCard && !simRunning && (() => {
          const parts = selectedCard.split("-");
          const stageNum = parseInt(parts[parts.length - 1]);
          const laneKey = parts.slice(0, -1).join("-");
          const card = cardMap[laneKey]?.[stageNum];
          if (!card) return null;
          const cs = CARD_STYLES[card.type];
          const laneMeta = LANES.find(l => l.key === laneKey);
          const phase = STAGE_PHASE[card.stage];
          return (
            <div style={{
              marginTop: "16px", padding: "16px 20px", borderRadius: "10px",
              border: `1.5px solid ${cs.border}`,
              backgroundColor: presentationMode ? "#1e293b" : cs.bg,
              display: "flex", alignItems: "flex-start", gap: "20px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: cs.titleColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Stage {card.stage}
                  </span>
                  {card.badge && (
                    <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px", backgroundColor: card.badgeColor ?? cs.border, color: "white", letterSpacing: "0.05em" }}>
                      {card.badge}
                    </span>
                  )}
                  {phase && (
                    <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px", backgroundColor: `${phase.color}22`, color: phase.color, letterSpacing: "0.04em" }}>
                      {phase.label}
                    </span>
                  )}
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{laneMeta?.label.replace("\n", " ")}</span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: presentationMode ? "#f1f5f9" : cs.titleColor, marginBottom: "6px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "12px", color: presentationMode ? "#94a3b8" : "#4b5563", lineHeight: "1.6", marginBottom: "10px" }}>
                  {card.sublabel}
                </div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {card.outputs && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Outputs</div>
                      {card.outputs.map(o => (
                        <div key={o} style={{ fontSize: "11px", color: presentationMode ? "#94a3b8" : "#374151", display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                          <span style={{ color: "#059669" }}>•</span> {o}
                        </div>
                      ))}
                    </div>
                  )}
                  {card.checks && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Gate Checks</div>
                      {card.checks.map(c => (
                        <div key={c} style={{ fontSize: "11px", color: presentationMode ? "#94a3b8" : "#374151", display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                          <span style={{ color: "#dc2626" }}>✓</span> {c}
                        </div>
                      ))}
                    </div>
                  )}
                  {card.decisionPaths && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Decision Paths</div>
                      {card.decisionPaths.map(d => (
                        <div key={d} style={{ fontSize: "11px", color: presentationMode ? "#94a3b8" : "#374151", display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                          <span style={{ color: "#7c3aed" }}>→</span> {d}
                        </div>
                      ))}
                    </div>
                  )}
                  {card.artifact && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Artifact Output</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>↓</span> {card.artifact}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                style={{ fontSize: "18px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
              >×</button>
            </div>
          );
        })()}

        {/* ── Simulation detail panel ── */}
        {simRunning && simStage !== null && (() => {
          const card = STAGE_CARDS.find(c => c.stage === simStage);
          if (!card) return null;
          const cs = CARD_STYLES[card.type];
          const phase = STAGE_PHASE[card.stage];
          const laneMeta = LANES.find(l => l.key === card.lane);
          return (
            <div style={{
              marginTop: "16px", padding: "14px 18px", borderRadius: "10px",
              border: `2px solid ${cs.border}`,
              backgroundColor: presentationMode ? "#1e293b" : cs.bg,
              display: "flex", alignItems: "flex-start", gap: "16px",
              boxShadow: `0 4px 16px ${cs.border}44`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: cs.titleColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Stage {card.stage} of {STAGE_COUNT}
                  </span>
                  {card.badge && (
                    <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px", backgroundColor: card.badgeColor ?? cs.border, color: "white", letterSpacing: "0.05em" }}>
                      {card.badge}
                    </span>
                  )}
                  {phase && (
                    <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px", backgroundColor: `${phase.color}22`, color: phase.color, letterSpacing: "0.04em" }}>
                      {phase.label}
                    </span>
                  )}
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{laneMeta?.label.replace("\n", " ")}</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: presentationMode ? "#f1f5f9" : cs.titleColor, marginBottom: "4px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "12px", color: presentationMode ? "#94a3b8" : "#4b5563", lineHeight: "1.5" }}>
                  {card.sublabel}
                </div>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>
                Auto-advancing…
              </span>
            </div>
          );
        })()}

        {/* ── Gate flow note ── */}
        <div style={{
          marginTop: "14px", padding: "10px 16px", borderRadius: "8px",
          backgroundColor: presentationMode ? "#1e293b" : "#fef2f2",
          border: `1px solid ${presentationMode ? "#334155" : "#fca5a5"}`,
          fontSize: "11px", color: presentationMode ? "#fca5a5" : "#991b1b",
          display: "flex", gap: "16px", flexWrap: "wrap",
        }}>
          <span style={{ fontWeight: 700 }}>Gate checkpoints (Batch Flow V1.0):</span>
          <span>🔒 <strong>Stage 3 — Gate 1 (Review &amp; Lock):</strong> Build Prompt locked. Nothing proceeds until PO + Lead Dev sign off.</span>
          <span>🔒 <strong>Stage 6 — Gate 2 (Plan Validation):</strong> AAP validated. No code until approved. Loop-back to Step 5 or Step 2 if off.</span>
          <span>🔒 <strong>Stage 12 — Gate 3 (Validation Approval):</strong> PO approves Validation Boundary. Invariant coverage confirmed.</span>
          <span>🔒 <strong>Stage 15 — Gate 4 (Final Review &amp; Merge):</strong> Invariants enforced, scope respected. PR merged to release branch.</span>
          <span>✅ <strong>Stage 19 — Gate 5 (Batch Sign-Off):</strong> Sev1/Sev2 cleared, governance acknowledged. Batch closed.</span>
        </div>

      </div>
    </div>
  );
}

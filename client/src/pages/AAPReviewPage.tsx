// AAPReviewPage.tsx
// Agent Action Plan Review Model (Blitzy) — 13-stage governed delivery swimlane
// E2E Flow V2.0: 12 steps, 4 phases, 3 gates
// Enhancements: phase dividers, run simulation, loop-back indicator
import { useState, useEffect, useRef } from "react";

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────

type CardType = "blitzy" | "governance" | "approved" | "gate";

interface StageCard {
  stage: number;
  lane: string;
  type: CardType;
  label: string;
  sublabel: string;
  badge?: string;
  badgeColor?: string;
}

// ─── SWIM LANES ──────────────────────────────────────────────────────────────
// Lanes aligned to E2E Flow V2.0 role assignments

const LANES = [
  { key: "po",               label: "PRODUCT\nOWNER" },
  { key: "ba",               label: "BA" },
  { key: "po-lead-devs",     label: "PO + LEAD\nDEVS" },
  { key: "lead-dev",         label: "LEAD DEV" },
  { key: "lead-dev-trigger", label: "LEAD DEV\n(TRIGGERS)" },
  { key: "developer",        label: "DEVELOPER" },
  { key: "lead-dev-gate",    label: "LEAD DEV\n(GATE)" },
];

// ─── PHASE DEFINITIONS ───────────────────────────────────────────────────────
// Maps stage ranges to phase metadata for divider rendering

const PHASES = [
  { label: "REQUIREMENTS",  stages: [1, 2, 3, 4],       color: "#3b82f6", bg: "#eff6ff" },
  { label: "DESIGN",        stages: [5, 6, 7],           color: "#ea580c", bg: "#fff7ed" },
  { label: "BUILD",         stages: [8, 9, 10, 11],      color: "#7c3aed", bg: "#f5f3ff" },
  { label: "MERGE & VERIFY",stages: [12, 13],            color: "#059669", bg: "#f0fdf4" },
];

// Build a lookup: stage → phase
const STAGE_PHASE: Record<number, typeof PHASES[0]> = {};
for (const phase of PHASES) {
  for (const s of phase.stages) STAGE_PHASE[s] = phase;
}

// ─── STAGE CARDS (13 stages) ─────────────────────────────────────────────────
// Aligned 1:1 to E2E Development Flow V2.0 — 12 steps, 4 phases, 3 gates

const STAGE_CARDS: StageCard[] = [
  // ── REQUIREMENTS PHASE ──────────────────────────────────────────────────────
  {
    stage: 1, lane: "po", type: "governance",
    label: "Batch Planning",
    sublabel: "Batch selected, prioritized. Context brief produced and saved to ADO Epic.",
    badge: "STEP 1", badgeColor: "#3b82f6",
  },
  {
    stage: 2, lane: "ba", type: "governance",
    label: "Story Creation",
    sublabel: "Stories generated (AI-assisted), compiled into Build Prompt MD. Placeholders in DevOps.",
    badge: "STEP 2", badgeColor: "#3b82f6",
  },
  {
    stage: 3, lane: "po-lead-devs", type: "gate",
    label: "Review & Lock",
    sublabel: "Scope, feasibility, iteration. Nothing proceeds until locked. Build Prompt is source of truth.",
    badge: "GATE 1 — REQ. LOCK", badgeColor: "#dc2626",
  },
  {
    stage: 4, lane: "ba", type: "governance",
    label: "DevOps Entry",
    sublabel: "Full story detail entered into DevOps from the locked Build Prompt. Accurate capture, not interpretation.",
    badge: "STEP 4 · ADO", badgeColor: "#7c3aed",
  },
  // ── DESIGN PHASE ────────────────────────────────────────────────────────────
  {
    stage: 5, lane: "lead-dev-trigger", type: "blitzy",
    label: "AAP Generation",
    sublabel: "Build agent reads locked Build Prompt → generates AAP (design intent, not code). Saved to ADO immediately.",
    badge: "STEP 5 · AAP", badgeColor: "#ea580c",
  },
  {
    stage: 6, lane: "lead-dev", type: "governance",
    label: "Second Opinion",
    sublabel: "Optional: Lead Dev may run a second-opinion plan from another agent (e.g. GH Copilot Agent). Not required.",
    badge: "OPTIONAL · ADVISORY", badgeColor: "#0891b2",
  },
  {
    stage: 7, lane: "lead-dev", type: "gate",
    label: "Plan Validation",
    sublabel: "AAP vs Build Prompt + data plans. No code until approved. Loop-back to Step 5 or Step 2 if off.",
    badge: "GATE 2 — PLAN LOCK", badgeColor: "#dc2626",
  },
  // ── BUILD PHASE ─────────────────────────────────────────────────────────────
  {
    stage: 8, lane: "lead-dev-trigger", type: "blitzy",
    label: "Code Generation",
    sublabel: "Build agent generates code from approved AAP: DB migrations, models, APIs, tests, Swagger/OpenAPI.",
    badge: "STEP 7 · BLITZY", badgeColor: "#ea580c",
  },
  {
    stage: 9, lane: "developer", type: "governance",
    label: "Runtime Verification",
    sublabel: "Build, DB migrations, unit tests, UI/API/Swagger on feature branch. Behavior aligns with AC scenarios.",
    badge: "STEP 8", badgeColor: "#0891b2",
  },
  {
    stage: 10, lane: "developer", type: "blitzy",
    label: "GH Copilot Review",
    sublabel: "Dev runs GH Copilot review against PR from VS Code. Triages every comment as fix or skip.",
    badge: "STEP 9 · TRIAGE", badgeColor: "#ea580c",
  },
  {
    stage: 11, lane: "lead-dev", type: "approved",
    label: "Approval & Refinement",
    sublabel: "Lead Dev approves skip recommendations. Selects refinement path: A (Refine PR), B (Full Reset), or C (Dev-Only).",
    badge: "STEP 10 · APPROVE", badgeColor: "#059669",
  },
  // ── MERGE & VERIFY PHASE ────────────────────────────────────────────────────
  {
    stage: 12, lane: "lead-dev-gate", type: "gate",
    label: "Final Review & Merge",
    sublabel: "Invariants enforced, scope respected, ACs satisfied, no silent assumptions. PR merged to dev.",
    badge: "GATE 3 — MERGE", badgeColor: "#dc2626",
  },
  {
    stage: 13, lane: "lead-dev-gate", type: "approved",
    label: "Post-Merge Verification",
    sublabel: "Same as Step 8 + integration with other merged work on dev branch. Hotfix PR if issues found.",
    badge: "STEP 12 · VERIFY", badgeColor: "#059669",
  },
];

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────

const CARD_STYLES: Record<CardType, { bg: string; border: string; titleColor: string }> = {
  blitzy:     { bg: "#fff7ed", border: "#fb923c", titleColor: "#9a3412" },
  governance: { bg: "#eff6ff", border: "#60a5fa", titleColor: "#1e40af" },
  approved:   { bg: "#f0fdf4", border: "#4ade80", titleColor: "#166534" },
  gate:       { bg: "#fef2f2", border: "#f87171", titleColor: "#991b1b" },
};

const STAGE_COUNT = 13;
const STAGE_W = 110;
const LANE_H = 90;
const LANE_LABEL_W = 100;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AAPReviewPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simStage, setSimStage] = useState<number | null>(null);
  const [simDone, setSimDone] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build a lookup: lane → stage → card
  const cardMap: Record<string, Record<number, StageCard>> = {};
  for (const card of STAGE_CARDS) {
    if (!cardMap[card.lane]) cardMap[card.lane] = {};
    cardMap[card.lane][card.stage] = card;
  }

  // Build a lookup: stage → first card in that stage (for auto-selection)
  const stageFirstCard: Record<number, string> = {};
  for (const card of STAGE_CARDS) {
    if (!stageFirstCard[card.stage]) {
      stageFirstCard[card.stage] = `${card.lane}-${card.stage}`;
    }
  }

  const totalW = LANE_LABEL_W + STAGE_COUNT * STAGE_W;

  // ── Simulation logic ──────────────────────────────────────────────────────
  const startSimulation = () => {
    if (simRunning) {
      // Stop
      if (simRef.current) clearInterval(simRef.current);
      setSimRunning(false);
      setSimStage(null);
      setSimDone(false);
      setSelectedCard(null);
      return;
    }
    setSimDone(false);
    setSimRunning(true);
    let current = 1;
    setSimStage(current);
    setSelectedCard(stageFirstCard[current] ?? null);

    simRef.current = setInterval(() => {
      current += 1;
      if (current > STAGE_COUNT) {
        if (simRef.current) clearInterval(simRef.current);
        setSimRunning(false);
        setSimStage(null);
        setSimDone(true);
        setTimeout(() => {
          setSimDone(false);
          setSelectedCard(null);
        }, 2500);
        return;
      }
      setSimStage(current);
      setSelectedCard(stageFirstCard[current] ?? null);
    }, 950);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: presentationMode ? "0" : "20px 24px",
      backgroundColor: presentationMode ? "#0f172a" : "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "18px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <h1 style={{
              fontSize: presentationMode ? "20px" : "18px",
              fontWeight: 800, color: presentationMode ? "#f1f5f9" : "#0f172a",
              margin: 0, letterSpacing: "-0.01em",
            }}>
              Agent Action Plan Review Model
            </h1>
            <span style={{
              fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px",
              backgroundColor: "#fff7ed", color: "#9a3412", border: "1px solid #fb923c",
              letterSpacing: "0.06em",
            }}>BLITZY</span>
            <span style={{
              fontSize: "11px", color: "#64748b",
              backgroundColor: presentationMode ? "#1e293b" : "#f1f5f9",
              padding: "2px 8px", borderRadius: "4px",
            }}>13 stages · 12 steps · 3 gates · E2E Flow V2.0</span>
          </div>
          <p style={{
            fontSize: "12px", color: presentationMode ? "#94a3b8" : "#64748b",
            margin: 0, maxWidth: "780px", lineHeight: "1.6",
          }}>
            Four phases, twelve steps, three gates. Stories are written as constraints. Artifacts flow forward — each feeds the next.
            {" "}<strong style={{ color: presentationMode ? "#cbd5e1" : "#374151" }}>Requirements (Steps 1–4):</strong> Batch planning → Story creation → Review &amp; Lock → DevOps entry.
            {" "}<strong style={{ color: presentationMode ? "#cbd5e1" : "#374151" }}>Design (Steps 5–6):</strong> AAP generation → Plan validation. No code until the AAP is approved.
            {" "}<strong style={{ color: presentationMode ? "#cbd5e1" : "#374151" }}>Build (Steps 7–10):</strong> Code generation → Runtime verification → GH Copilot review → Approval &amp; refinement.
            {" "}<strong style={{ color: presentationMode ? "#cbd5e1" : "#374151" }}>Merge &amp; Verify (Steps 11–12):</strong> Final review &amp; merge → Post-merge verification.
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
            {simDone ? "✓ Complete" : simRunning ? "⏹ Stop Simulation" : "▶ Run Review Simulation"}
          </button>
        </div>
      </div>

      {/* ── Simulation progress bar ── */}
      {simRunning && simStage !== null && (
        <div style={{
          marginBottom: "12px", padding: "8px 14px", borderRadius: "8px",
          backgroundColor: presentationMode ? "#1e293b" : "#fff7ed",
          border: "1px solid #fb923c",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", flexShrink: 0 }}>
            ▶ Stage {simStage} of {STAGE_COUNT}
          </span>
          <div style={{ flex: 1, height: "6px", backgroundColor: "#fed7aa", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "3px",
              backgroundColor: "#f97316",
              width: `${(simStage / STAGE_COUNT) * 100}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
          <span style={{ fontSize: "11px", color: "#ea580c", flexShrink: 0, fontWeight: 600 }}>
            {STAGE_PHASE[simStage]?.label ?? ""}
          </span>
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "20px", marginBottom: "12px",
        flexWrap: "wrap", fontSize: "11px", fontWeight: 600,
      }}>
        {[
          { color: "#fb923c", label: "Blitzy / AI Generation" },
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
          All changes via Build Prompt — no manual edits
        </span>
      </div>

      {/* ── Swimlane Grid ── */}
      <div style={{ overflowX: "auto", overflowY: "visible" }}>
        <div style={{ minWidth: `${totalW}px`, position: "relative" }}>

          {/* ── Phase divider row ── */}
          <div style={{
            display: "flex",
            borderBottom: `1px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
          }}>
            {/* Lane label spacer */}
            <div style={{ width: `${LANE_LABEL_W}px`, flexShrink: 0 }} />
            {/* Phase bands */}
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
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}>
                      {phase?.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Stage header row ── */}
          <div style={{
            display: "flex",
            borderBottom: `2px solid ${presentationMode ? "#334155" : "#e2e8f0"}`,
            backgroundColor: presentationMode ? "#1e293b" : "#f1f5f9",
            position: "relative",
          }}>
            {/* Lane label header cell */}
            <div style={{ width: `${LANE_LABEL_W}px`, flexShrink: 0, padding: "6px 10px",
              fontSize: "10px", fontWeight: 700, color: presentationMode ? "#64748b" : "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>LANE</div>

            {/* Stage number cells */}
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
                  position: "relative",
                }}>
                  {s}
                  {/* Loop-back indicator between stages 5–7 */}
                  {s === 5 && (
                    <div style={{
                      position: "absolute", bottom: "-2px", left: "0",
                      width: `${STAGE_W * 3}px`, // spans stages 5, 6, 7
                      height: "0",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}>
                      <svg width={STAGE_W * 3} height="18" style={{ overflow: "visible", display: "block" }}>
                        {/* Dashed arc from stage 7 back to stage 5 */}
                        <path
                          d={`M ${STAGE_W * 3 - 10} 4 Q ${STAGE_W * 1.5} 18 10 4`}
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          markerEnd="url(#arrowRed)"
                        />
                        <defs>
                          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#dc2626" />
                          </marker>
                        </defs>
                        <text x={STAGE_W * 1.5} y="16" textAnchor="middle"
                          style={{ fontSize: "8px", fill: "#dc2626", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                          ↩ loop-back if Gate 2 fails
                        </text>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Lane rows ── */}
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
                  fontSize: "10px", fontWeight: 800, color: "#64748b",
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
                        ? (presentationMode ? `${phase?.color}18` : `${phase?.bg}`)
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
                          position: "relative",
                          transform: isSimHighlight ? "scale(1.03)" : "scale(1)",
                        }}
                      >
                        {/* Badge */}
                        {card.badge && (
                          <div style={{
                            fontSize: "8px", fontWeight: 800,
                            color: (isSelected || isSimHighlight) ? "white" : (card.badgeColor ?? "#374151"),
                            letterSpacing: "0.04em", marginBottom: "3px",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>{card.badge}</div>
                        )}
                        {/* Card title */}
                        <div style={{
                          fontSize: "11px", fontWeight: 700, lineHeight: "1.25",
                          color: (isSelected || isSimHighlight) ? "white" : CARD_STYLES[card.type].titleColor,
                          marginBottom: "3px",
                        }}>{card.label}</div>
                        {/* Card sublabel */}
                        <div style={{
                          fontSize: "9px", lineHeight: "1.3",
                          color: (isSelected || isSimHighlight) ? "rgba(255,255,255,0.85)" : "#6b7280",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}>{card.sublabel}</div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
            marginTop: "16px", padding: "14px 18px", borderRadius: "10px",
            border: `1.5px solid ${cs.border}`,
            backgroundColor: presentationMode ? "#1e293b" : cs.bg,
            display: "flex", alignItems: "flex-start", gap: "16px",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: cs.titleColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Stage {card.stage}
                </span>
                {card.badge && (
                  <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px",
                    backgroundColor: card.badgeColor ?? cs.border, color: "white", letterSpacing: "0.05em" }}>
                    {card.badge}
                  </span>
                )}
                {phase && (
                  <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px",
                    backgroundColor: `${phase.color}22`, color: phase.color, letterSpacing: "0.04em" }}>
                    {phase.label}
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {laneMeta?.label.replace("\n", " ")}
                </span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: presentationMode ? "#f1f5f9" : cs.titleColor, marginBottom: "4px" }}>
                {card.label}
              </div>
              <div style={{ fontSize: "12px", color: presentationMode ? "#94a3b8" : "#4b5563", lineHeight: "1.5" }}>
                {card.sublabel}
              </div>
            </div>
            <button
              onClick={() => setSelectedCard(null)}
              style={{ fontSize: "16px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
            >×</button>
          </div>
        );
      })()}

      {/* ── Simulation detail panel (shown during sim) ── */}
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: cs.titleColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Stage {card.stage} of {STAGE_COUNT}
                </span>
                {card.badge && (
                  <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px",
                    backgroundColor: card.badgeColor ?? cs.border, color: "white", letterSpacing: "0.05em" }}>
                    {card.badge}
                  </span>
                )}
                {phase && (
                  <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px",
                    backgroundColor: `${phase.color}22`, color: phase.color, letterSpacing: "0.04em" }}>
                    {phase.label}
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {laneMeta?.label.replace("\n", " ")}
                </span>
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
        display: "flex", gap: "20px", flexWrap: "wrap",
      }}>
        <span style={{ fontWeight: 700 }}>Gate checkpoints (E2E Flow V2.0):</span>
        <span>🔒 <strong>Stage 3 — Gate 1 (Review &amp; Lock):</strong> Build Prompt locked. Nothing proceeds until PO + Lead Devs sign off.</span>
        <span>🔒 <strong>Stage 7 — Gate 2 (Plan Validation):</strong> AAP validated against Build Prompt + data plans. No code until approved.</span>
        <span>🔒 <strong>Stage 12 — Gate 3 (Final Review &amp; Merge):</strong> Invariants enforced, scope respected, ACs satisfied. PR merged to dev.</span>
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: presentationMode ? "#64748b" : "#b91c1c", fontWeight: 400 }}>
          Loop-back: Gate 2 failure → re-run Step 5 (AAP) or return to Step 2 (stories)
        </span>
      </div>
    </div>
  );
}

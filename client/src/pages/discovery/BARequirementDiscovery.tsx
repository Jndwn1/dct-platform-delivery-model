import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";

// ── Discovery Lifecycle (Stephane Lacombe operating model) ─────────────────────
const LIFECYCLE_STEPS = [
  {
    id: 1, label: "Business Need",
    owner: "BA",
    color: "#1e3a5f",
    icon: "💡",
    desc: "Identify and articulate the business problem or capability gap. Describe what the practitioner needs to accomplish — capture it, change it, correct it, approve it, remove it, retrieve it, and by which handles.",
    example: '"A preparer records estimated payments per entity per state per year."',
  },
  {
    id: 2, label: "BA Requirements",
    owner: "BA",
    color: "#0369a1",
    icon: "📝",
    desc: "Submit requirements using the DCT intake template. Write at the level of a user story — what the practitioner does, the business outcome, the business process, the required data, user actions, and business rules. No API design, no endpoint definitions, no payload structures.",
    example: '"A reviewer approves form entries and needs every state for one entity and year in one view."',
  },
  {
    id: 3, label: "DCT Intake",
    owner: "DCT",
    color: "#065f46",
    icon: "📥",
    desc: "DCT receives the requirements via the intake template. The intake is the formal handoff point — DCT takes ownership of platform design from this point forward.",
    example: "Requirements submitted via the DCT intake template. DCT acknowledges receipt.",
  },
  {
    id: 4, label: "Gap Analysis",
    owner: "DCT",
    color: "#7c3aed",
    icon: "🔍",
    desc: "DCT runs AI-assisted gap analysis against existing platform contracts and capabilities. Each requirement is classified as: Covered (integration starts immediately), Partially Covered (scoping agreement produced), or Net-New (DCT authors the build spec).",
    example: "Covered items point at contracts that exist today. Net-new is the scoping agreement — you see what DCT will build before it is built.",
  },
  {
    id: 5, label: "Platform Specification",
    owner: "DCT",
    color: "#92400e",
    icon: "📋",
    desc: "DCT authors the implementation specification. Your requirements plus platform conventions become the build spec, with an explicit list of assumptions made about your intent. Agents build from this spec.",
    example: "Build spec includes: business object mapping, API contract shape, validation rules, downstream impacts, and assumption list.",
  },
  {
    id: 6, label: "Platform Build",
    owner: "DCT",
    color: "#059669",
    icon: "⚙️",
    desc: "DCT generates the initial platform build. Your first built iteration exists within a few days of the requirement clearing gap analysis. Nothing idles on either side.",
    example: "Build is agent-speed. The scarce resources are review and certified content.",
  },
  {
    id: 7, label: "API Review",
    owner: "BA + Team",
    color: "#dc2626",
    icon: "✅",
    desc: "You receive the API contract and the documented assumptions list. Review one question: can everything you described be done through what is on this page, and are the assumptions right? Your team mocks and wires integration against it at the same time.",
    example: "Review confirms: DCT understood the intent, all capabilities are represented, assumptions are correct, the contract supports the requested process.",
  },
  {
    id: 8, label: "Feedback Cycle",
    owner: "BA + DCT",
    color: "#b45309",
    icon: "🔄",
    desc: "One consolidated feedback pass. Issues come back as one response within five business days; silence confirms. A miss means a spec fix and a rebuild — days, not batches. Disputes route to the DCT Product Owner.",
    example: "Single feedback cycle. All issues consolidated. Resolution prior to QA.",
  },
  {
    id: 9, label: "QA",
    owner: "DCT",
    color: "#475569",
    icon: "🧪",
    desc: "DCT runs QA against the published spec. QA validates that the build satisfies the contract. The published contract is where you hold DCT accountable.",
    example: "QA is internal to DCT. Consuming teams do not run DCT QA — they test their own integration.",
  },
  {
    id: 10, label: "Published Contract",
    owner: "DCT",
    color: "#0f1623",
    icon: "📄",
    desc: "The contract publishes. Your integration carries straight over — you have been building against the same shape the whole time. The published contract is the implementation baseline.",
    example: "Consuming teams integrate against the published contract. Application-specific testing is the team's responsibility.",
  },
];

// ── Gap Analysis classification ────────────────────────────────────────────────
const GAP_CLASSIFICATIONS = [
  {
    label: "Covered",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: "✓",
    desc: "The capability already exists in the platform. Integration can start immediately against the existing contract. No new build required.",
    action: "Integrate now against the published contract.",
  },
  {
    label: "Partially Covered",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: "~",
    desc: "The platform partially satisfies the requirement. DCT produces a scoping agreement showing what is covered and what is net-new. You see what DCT will build before it is built.",
    action: "Review scoping agreement. Confirm net-new scope before build begins.",
  },
  {
    label: "Net-New",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: "+",
    desc: "No existing capability covers this requirement. DCT authors the build specification and agents build. First iteration available within days of gap analysis completion.",
    action: "Review build spec and assumption list. Prepare for API review within days.",
  },
];

// ── Ownership table ────────────────────────────────────────────────────────────
const OWNERSHIP = [
  {
    owner: "Business Analyst",
    color: "#1e3a5f",
    icon: "👤",
    owns: [
      "Business requirements",
      "Practitioner workflows",
      "Business rules",
      "Acceptance criteria",
      "Validation of business intent",
      "Review of DCT-generated assumptions",
    ],
    notOwns: [
      "API design",
      "Endpoint design",
      "Payload modeling",
      "Integration architecture",
      "Technical implementation",
    ],
  },
  {
    owner: "DCT",
    color: "#065f46",
    icon: "⚙️",
    owns: [
      "Gap analysis",
      "Platform design",
      "API contracts",
      "Build specifications",
      "Platform implementation",
      "QA",
      "Published contracts",
    ],
    notOwns: [
      "Business requirements",
      "Practitioner workflow decisions",
      "Acceptance criteria",
      "Application-specific testing",
    ],
  },
  {
    owner: "Consuming Teams",
    color: "#7c3aed",
    icon: "🔌",
    owns: [
      "Integration with published contracts",
      "Application-specific implementation",
      "Testing within their application",
      "Mocking against the API contract during review",
    ],
    notOwns: [
      "DCT QA",
      "Platform design decisions",
      "API contract authoring",
    ],
  },
];

// ── BA Discovery Questions (retained from original, updated for new model) ─────
const DISCOVERY_QUESTIONS: { category: string; color: string; icon: string; questions: string[] }[] = [
  {
    category: "Business Intent",
    color: "#1e3a5f",
    icon: "💼",
    questions: [
      "What does the practitioner need to accomplish?",
      "What is the business outcome?",
      "What is the business process?",
      "Who performs the task?",
      "What are the business rules?",
    ],
  },
  {
    category: "Required Data",
    color: "#065f46",
    icon: "🗄",
    questions: [
      "What data does the practitioner need to see?",
      "What data does the practitioner need to change?",
      "What data does the practitioner need to approve or reject?",
      "By which handles is the data accessed (entity, period, state, year)?",
      "What is the expected outcome when the action is complete?",
    ],
  },
  {
    category: "User Actions",
    color: "#0369a1",
    icon: "🖱",
    questions: [
      "What does the practitioner capture?",
      "What does the practitioner change?",
      "What does the practitioner correct?",
      "What does the practitioner approve?",
      "What does the practitioner remove or retrieve?",
    ],
  },
  {
    category: "Gap Analysis Review",
    color: "#7c3aed",
    icon: "🔍",
    questions: [
      "Is this requirement Covered, Partially Covered, or Net-New?",
      "If Covered — which existing contract satisfies this?",
      "If Partially Covered — what is the net-new scope?",
      "If Net-New — are the DCT assumptions correct?",
      "Can everything described be done through what is on the API page?",
    ],
  },
  {
    category: "Downstream",
    color: "#92400e",
    icon: "→",
    questions: [
      "What is the IMS/return engine impact?",
      "What is the state tax impact?",
      "What is the provision impact?",
      "What audit records are created?",
      "How is lineage updated?",
    ],
  },
];

export default function BARequirementDiscovery() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Business Intent");
  const [activeOwner, setActiveOwner] = useState<string | null>("Business Analyst");

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>🔍</span>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>BA Requirement Discovery</h1>
          <span style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
            backgroundColor: "#dc2626", color: "white", fontWeight: 700,
          }}>KEY PAGE</span>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          How Business Analysts engage with DCT under the intake and platform delivery model. BAs define business intent — DCT owns platform design, gap analysis, build, and published contracts.
        </p>
      </div>

      {/* ── Core Principle ── */}
      <div style={{
        backgroundColor: "#0f1623", borderRadius: "12px", padding: "20px 24px",
        marginBottom: "28px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "12px" }}>
          Operating Model — How Workstreams Get Platform Capability
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {[
            {
              title: "Describe what you need in business terms",
              desc: "Write at user-story altitude. What the practitioner needs to do with the data. No API knowledge required, no endpoint design wanted.",
              color: "#2563eb", icon: "📝",
            },
            {
              title: "Get back what already exists in days",
              desc: "DCT runs gap analysis against live contracts and code. Covered items point at contracts that exist today — integration starts immediately.",
              color: "#059669", icon: "⚡",
            },
            {
              title: "Alignment through artifacts, not meetings",
              desc: "Meetings go only where they pay: intent and certification. Everything else is an artifact exchange with a clock on it.",
              color: "#7c3aed", icon: "🎯",
            },
          ].map(p => (
            <div key={p.title} style={{
              backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px",
              padding: "14px 16px", border: `1px solid ${p.color}33`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>{p.icon}</span>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "white", lineHeight: "1.3" }}>{p.title}</div>
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5" }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: "16px", padding: "12px 16px", backgroundColor: "rgba(5,150,105,0.1)",
          borderRadius: "8px", border: "1px solid #059669",
          fontSize: "13px", color: "#6ee7b7", lineHeight: "1.6",
        }}>
          <strong style={{ color: "#10b981" }}>A note on endpoints:</strong> There is no endpoint design phase, on either side. You describe what practitioners do; the agents derive the actual API from that, following the same conventions as every published DCT contract. The answer to "what are the actual endpoints" is an artifact, not a design session.
        </div>
      </div>

      {/* ── Discovery Lifecycle + Questions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>

        {/* Discovery Lifecycle */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
            Discovery Lifecycle — 10 Steps
          </div>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: "19px", top: "20px", bottom: "20px",
              width: "2px", backgroundColor: "#e2e8f0", borderRadius: "1px",
            }} />
            {LIFECYCLE_STEPS.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <div key={step.id} style={{ display: "flex", gap: "14px", marginBottom: "8px", position: "relative" }}>
                  <div
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      backgroundColor: isActive ? step.color : "white",
                      border: `2px solid ${step.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1, cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>{step.icon}</span>
                  </div>
                  <div
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      flex: 1, padding: "8px 12px",
                      backgroundColor: isActive ? `${step.color}0d` : "white",
                      border: `1px solid ${isActive ? step.color : "#e2e8f0"}`,
                      borderRadius: "8px", cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: step.color }}>Step {step.id}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{step.label}</span>
                      <span style={{
                        fontSize: "9px", padding: "2px 5px", borderRadius: "3px",
                        backgroundColor: step.owner === "BA" || step.owner === "BA + Team" || step.owner === "BA + DCT"
                          ? "#eff6ff" : step.owner === "DCT" ? "#f0fdf4" : "#faf5ff",
                        color: step.owner === "BA" || step.owner === "BA + Team" || step.owner === "BA + DCT"
                          ? "#1d4ed8" : step.owner === "DCT" ? "#065f46" : "#6b21a8",
                        fontWeight: 700,
                      }}>{step.owner}</span>
                    </div>
                    {isActive && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", marginBottom: "6px" }}>
                          {step.desc}
                        </div>
                        <div style={{
                          fontSize: "11px", color: "#64748b", fontStyle: "italic",
                          backgroundColor: "#f8fafc", padding: "6px 10px", borderRadius: "4px",
                          borderLeft: `3px solid ${step.color}`,
                        }}>
                          {step.example}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discovery Questions */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
            Discovery Questions by Category
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {DISCOVERY_QUESTIONS.map(cat => {
              const isOpen = expandedCategory === cat.category;
              return (
                <div key={cat.category} style={{
                  backgroundColor: "white", border: `1px solid ${isOpen ? cat.color : "#e2e8f0"}`,
                  borderRadius: "8px", overflow: "hidden",
                }}>
                  <button
                    onClick={() => setExpandedCategory(isOpen ? null : cat.category)}
                    style={{
                      width: "100%", padding: "12px 16px", background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{cat.category}</span>
                    <span style={{
                      fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                      backgroundColor: `${cat.color}15`, color: cat.color, fontWeight: 700,
                    }}>
                      {cat.questions.length} questions
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f1f5f9" }}>
                      {cat.questions.map((q, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: "8px",
                          padding: "7px 0", borderBottom: i < cat.questions.length - 1 ? "1px solid #f8fafc" : "none",
                        }}>
                          <div style={{
                            width: "18px", height: "18px", borderRadius: "50%",
                            backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, fontSize: "9px", fontWeight: 700, color: cat.color,
                          }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Gap Analysis Section ── */}
      <div style={{
        marginBottom: "28px", padding: "20px 24px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>
          DCT Gap Analysis
        </div>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 16px", lineHeight: "1.6" }}>
          DCT evaluates every submitted requirement against existing platform capabilities and classifies it into one of three categories. This analysis drives implementation planning and eliminates duplicate development.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {GAP_CLASSIFICATIONS.map(g => (
            <div key={g.label} style={{
              backgroundColor: g.bg, border: `1px solid ${g.border}`,
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  backgroundColor: g.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 900, flexShrink: 0,
                }}>{g.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: g.color }}>{g.label}</div>
              </div>
              <p style={{ fontSize: "12px", color: "#334155", margin: "0 0 8px", lineHeight: "1.5" }}>{g.desc}</p>
              <div style={{
                fontSize: "11px", fontWeight: 600, color: g.color,
                backgroundColor: "white", padding: "5px 8px", borderRadius: "4px",
                border: `1px solid ${g.border}`,
              }}>
                → {g.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── API Review Section ── */}
      <div style={{
        marginBottom: "28px", padding: "20px 24px",
        backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#9a3412", marginBottom: "4px" }}>
          API Review — Validation, Not Design
        </div>
        <p style={{ fontSize: "13px", color: "#7c2d12", margin: "0 0 14px", lineHeight: "1.6" }}>
          The API review is a validation activity. You review one question: can everything you described be done through what is on this page, and are the assumptions right?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Review Confirms
            </div>
            {[
              "DCT correctly understood the business intent",
              "All required capabilities are represented",
              "Assumptions are correct",
              "The generated contract supports the requested business process",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#059669", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Not the Objective
            </div>
            {[
              "Endpoint design",
              "Payload structure decisions",
              "API naming or versioning",
              "Integration architecture choices",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feedback Process ── */}
      <div style={{
        marginBottom: "28px", padding: "20px 24px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>
          Feedback Process
        </div>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 14px", lineHeight: "1.6" }}>
          One consolidated feedback cycle. Issues come back as one response within five business days; silence confirms.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { label: "One feedback cycle", desc: "All issues consolidated into a single response", color: "#1e3a5f" },
            { label: "5 business days", desc: "Response window. Silence confirms the contract.", color: "#059669" },
            { label: "Spec fix = days", desc: "A miss means a spec fix and a rebuild — days, not batches", color: "#d97706" },
            { label: "Disputes → PO", desc: "Unresolved disputes route to the DCT Product Owner", color: "#7c3aed" },
          ].map(f => (
            <div key={f.label} style={{
              backgroundColor: "white", border: `1px solid ${f.color}30`,
              borderRadius: "8px", padding: "12px 14px",
              borderTop: `3px solid ${f.color}`,
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: f.color, marginBottom: "4px" }}>{f.label}</div>
              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ownership Table ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
          Roles and Responsibilities
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {OWNERSHIP.map(o => (
            <button
              key={o.owner}
              onClick={() => setActiveOwner(o.owner)}
              style={{
                padding: "6px 14px", borderRadius: "6px", border: `2px solid ${o.color}`,
                backgroundColor: activeOwner === o.owner ? o.color : "white",
                color: activeOwner === o.owner ? "white" : o.color,
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
              }}
            >
              {o.icon} {o.owner}
            </button>
          ))}
        </div>
        {OWNERSHIP.filter(o => o.owner === activeOwner).map(o => (
          <div key={o.owner} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{
              backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "8px", padding: "16px 18px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Owns
              </div>
              {o.owns.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "12px", color: "#166534", lineHeight: "1.5" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{
              backgroundColor: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "8px", padding: "16px 18px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Does Not Own
              </div>
              {o.notOwns.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                  <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: "12px", color: "#991b1b", lineHeight: "1.5" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Flow Diagram ── */}
      <div style={{
        marginBottom: "28px", padding: "20px 24px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
          Discovery Flow
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "900px", flexWrap: "nowrap" }}>
            {[
              { label: "Business Need", owner: "BA", color: "#1e3a5f" },
              { label: "BA Requirements", owner: "BA", color: "#0369a1" },
              { label: "DCT Intake", owner: "DCT", color: "#065f46" },
              { label: "Gap Analysis", owner: "DCT", color: "#7c3aed" },
              { label: "Platform Spec", owner: "DCT", color: "#92400e" },
              { label: "Platform Build", owner: "DCT", color: "#059669" },
              { label: "API Review", owner: "BA + Team", color: "#dc2626" },
              { label: "Feedback Cycle", owner: "BA + DCT", color: "#b45309" },
              { label: "QA", owner: "DCT", color: "#475569" },
              { label: "Published Contract", owner: "DCT", color: "#0f1623" },
            ].map((node, i, arr) => (
              <div key={node.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  backgroundColor: node.color, borderRadius: "6px",
                  padding: "8px 10px", textAlign: "center", minWidth: "80px",
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "white", lineHeight: "1.3" }}>{node.label}</div>
                  <div style={{
                    fontSize: "9px", marginTop: "3px",
                    color: node.owner === "BA" || node.owner === "BA + Team" || node.owner === "BA + DCT"
                      ? "#bfdbfe" : "#a7f3d0",
                    fontWeight: 600,
                  }}>{node.owner}</div>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 700 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "BA owns", color: "#1e3a5f" },
            { label: "DCT owns", color: "#065f46" },
            { label: "Shared", color: "#dc2626" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: l.color }} />
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story Template (retained, updated for new model) ── */}
      <div style={{
        marginBottom: "28px", padding: "20px 24px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "12px" }}>
          User Story Template — Business Intent Level
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: "12px", color: "#334155",
          lineHeight: "1.8", padding: "14px 16px",
          backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0",
        }}>
          <div><strong>As a</strong> [tax professional role]</div>
          <div><strong>I want to</strong> [action — capture / change / correct / approve / remove / retrieve]</div>
          <div><strong>So that</strong> [business outcome]</div>
          <br />
          <div><strong>Business Process:</strong> [describe the practitioner workflow]</div>
          <div><strong>Required Data:</strong> [what data is needed, by which handles]</div>
          <div><strong>Business Rules:</strong> [what rules govern this action]</div>
          <br />
          <div><strong>Acceptance Criteria:</strong></div>
          <div>• Given [business condition], When [user action], Then [expected business outcome]</div>
          <div>• Given [error condition], When [action fails], Then [expected practitioner experience]</div>
          <div>• Given [approval], When [user approves], Then [downstream outcome]</div>
          <br />
          <div style={{ color: "#94a3b8", fontSize: "11px" }}>
            Note: Do not include API endpoints, payload fields, or technical implementation details. DCT derives those from the business intent.
          </div>
        </div>
      </div>

      {/* ── Cross-References ── */}
      <div style={{
        marginBottom: "28px", padding: "16px 20px",
        backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", marginBottom: "10px" }}>
          Related Discovery Center Pages
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {[
            { label: "DCT Overview", path: "/discovery/overview", desc: "Platform architecture and system boundaries" },
            { label: "IMS Integration", path: "/discovery/ims", desc: "TDC outbound contract and IMS responsibilities" },
            { label: "Roger Overview", path: "/discovery/roger", desc: "Practitioner UI and Roger's role" },
            { label: "Integration Architecture", path: "/discovery/integration-architecture", desc: "End-to-end integration patterns" },
            { label: "Provision & State Discovery Hub", path: "/onboarding", desc: "Workstream-specific capability mapping" },
            { label: "Learning Center", path: "/learning-center", desc: "Tutorials on the DCT intake and delivery model" },
          ].map(ref => (
            <a key={ref.path} href={ref.path} style={{
              display: "block", padding: "10px 12px",
              backgroundColor: "white", border: "1px solid #bfdbfe",
              borderRadius: "6px", textDecoration: "none",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", marginBottom: "2px" }}>{ref.label}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{ref.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <DiscoveryAskBuddy pagePath="/discovery/ba-requirements" pageTitle="BA Requirement Discovery" />
    </div>
  );
}

import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


const WORKFLOW_STEPS = [
  { id: 1, label: "Business Need",           icon: "💡", color: "#1e3a5f", desc: "Identify and articulate the business problem or capability gap. What does the tax professional need to accomplish?" },
  { id: 2, label: "Identify TDC Object",     icon: "🔍", color: "#065f46", desc: "Determine which TDC business object owns the data. Every Roger story must trace to a TDC object — this is the starting point." },
  { id: 3, label: "Identify API",            icon: "⚡", color: "#0369a1", desc: "Find the TDC API that exposes the object. Confirm whether a Read API and/or Update API exists for this object." },
  { id: 4, label: "Understand Validations",  icon: "✓",  color: "#059669", desc: "Document all validation rules TDC enforces on this object. These become the acceptance criteria for the Roger story." },
  { id: 5, label: "Determine Editable Fields", icon: "✏", color: "#7c3aed", desc: "Identify which fields the practitioner can edit in Roger. Not all fields are editable — TDC owns the rules on editability." },
  { id: 6, label: "Determine Persistence",   icon: "💾", color: "#92400e", desc: "Confirm how changes are persisted. Roger calls TDC Update API — TDC persists. Roger does NOT persist independently." },
  { id: 7, label: "Determine Downstream Impacts", icon: "→", color: "#dc2626", desc: "Identify what downstream systems (IMS, Roger, State, Provision, reporting, lineage) are affected by changes to this object." },
  { id: 8, label: "Design Roger Experience", icon: "🖥", color: "#475569", desc: "Design the practitioner UI experience — screen layout, actions, buttons, validation messages, save behavior." },
  { id: 9, label: "Create User Story",        icon: "📝", color: "#0f1623", desc: "Write the user story with complete acceptance criteria, referencing the TDC API, validations, and downstream impacts." },
];

const DISCOVERY_QUESTIONS: { category: string; color: string; icon: string; questions: string[] }[] = [
  {
    category: "Business",
    color: "#1e3a5f",
    icon: "💼",
    questions: [
      "What problem is being solved?",
      "Who performs the task?",
      "Why is it needed?",
      "What is the expected outcome?",
    ],
  },
  {
    category: "Data",
    color: "#065f46",
    icon: "🗄",
    questions: [
      "What TDC object is involved?",
      "Who owns the object?",
      "What is the source system?",
      "Is the data editable?",
      "What are the required fields?",
    ],
  },
  {
    category: "API",
    color: "#0369a1",
    icon: "⚡",
    questions: [
      "What is the retrieve endpoint?",
      "What is the update endpoint?",
      "What validations does the API enforce?",
      "What errors can the API return?",
      "What security/auth is required?",
    ],
  },
  {
    category: "Roger",
    color: "#7c3aed",
    icon: "🖥",
    questions: [
      "Which screen displays this data?",
      "What actions can the user take?",
      "What buttons are needed?",
      "What is the save behavior?",
      "What validation messages appear?",
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Business");

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
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
          The most important page for Business Analysts. Understand why every Roger requirement begins with TDC — and how to discover the right requirements.
        </p>
      </div>

      {/* Core principle */}
      <div style={{
        backgroundColor: "#0f1623", borderRadius: "12px", padding: "20px 24px",
        marginBottom: "28px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "12px" }}>
          Core Principle — Why BAs Start with TDC
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { title: "Roger does NOT own business rules", desc: "Roger is a UI. It displays and collects data. It does not define what is valid, what is editable, or what persists.", color: "#dc2626", icon: "✕" },
            { title: "Roger owns the user experience", desc: "Roger owns how the practitioner sees and interacts with data — screens, actions, buttons, validation messages, workflows.", color: "#7c3aed", icon: "✓" },
            { title: "TDC owns the data", desc: "TDC is the system of record. All data changes go through TDC APIs. All business rules live in TDC. All persistence is TDC.", color: "#059669", icon: "✓" },
          ].map(p => (
            <div key={p.title} style={{
              backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px",
              padding: "14px 16px", border: `1px solid ${p.color}33`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px", color: p.color, fontWeight: 900 }}>{p.icon}</span>
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
          <strong style={{ color: "#10b981" }}>Therefore:</strong> All Roger requirements begin with understanding TDC. Before writing a Roger story, a BA must identify the TDC object, the TDC API, the TDC validations, and the downstream impacts. The Roger story describes the experience — TDC defines the rules.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Discovery Workflow */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
            Discovery Workflow
          </div>
          <div style={{ position: "relative" }}>
            {/* Vertical connector */}
            <div style={{
              position: "absolute", left: "19px", top: "20px", bottom: "20px",
              width: "2px", backgroundColor: "#e2e8f0", borderRadius: "1px",
            }} />

            {WORKFLOW_STEPS.map((step, idx) => {
              const isActive = activeStep === step.id;
              return (
                <div key={step.id} style={{ display: "flex", gap: "14px", marginBottom: "10px", position: "relative" }}>
                  {/* Circle */}
                  <div
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      backgroundColor: isActive ? step.color : "white",
                      border: `2px solid ${step.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{step.icon}</span>
                  </div>

                  {/* Content */}
                  <div
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      flex: 1, padding: "8px 12px",
                      backgroundColor: isActive ? `${step.color}0d` : "white",
                      border: `1px solid ${isActive ? step.color : "#e2e8f0"}`,
                      borderRadius: "8px", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: step.color }}>Step {step.id}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>{step.label}</span>
                    </div>
                    {isActive && (
                      <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", marginTop: "6px" }}>
                        {step.desc}
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
                  transition: "border-color 0.2s",
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
                            fontSize: "9px", fontWeight: 700, color: cat.color, flexShrink: 0, marginTop: "1px",
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

      {/* Story template */}
      <div style={{
        marginTop: "24px", padding: "20px 24px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "12px" }}>
          User Story Template (TDC-First)
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: "12px", color: "#334155",
          lineHeight: "1.8", padding: "14px 16px",
          backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0",
        }}>
          <div><strong>As a</strong> [tax professional role]</div>
          <div><strong>I want to</strong> [action in Roger UI]</div>
          <div><strong>So that</strong> [business outcome]</div>
          <br />
          <div><strong>TDC Object:</strong> [object name]</div>
          <div><strong>TDC API:</strong> [Read API] / [Update API]</div>
          <div><strong>Editable Fields:</strong> [field list]</div>
          <br />
          <div><strong>Acceptance Criteria:</strong></div>
          <div>• Given [TDC validation rule], When [user action], Then [expected behavior]</div>
          <div>• Given [error condition], When [API returns error], Then [Roger displays message]</div>
          <div>• Given [approval], When [user approves], Then [TDC Update API called, lineage updated]</div>
        </div>
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/ba-requirements" pageTitle="BA Requirement Discovery" />
    </div>
  );
}

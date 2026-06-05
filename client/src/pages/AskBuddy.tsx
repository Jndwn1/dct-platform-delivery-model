// RSM | DCT Platform | Ask Buddy — AI Business Analysis Assistant
// SuperCATT mascot · 7 capability areas · Natural language Q&A
// NON-PRODUCTION ARCHITECTURE REFERENCE

import { useState, useRef, useEffect } from "react";
import GovernanceBanner from "@/components/GovernanceBanner";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "buddy";
  text: string;
  timestamp: Date;
  capability?: string;
}

interface Capability {
  id: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  sampleQuestions: string[];
}

// ─── CAPABILITIES ────────────────────────────────────────────────────────────

const CAPABILITIES: Capability[] = [
  {
    id: "architecture",
    icon: "🏗",
    label: "Architecture Assistant",
    color: "#1e40af",
    bg: "#eff6ff",
    border: "#93c5fd",
    description: "Explain components, system relationships, data flow, integration points, and ownership boundaries.",
    sampleQuestions: [
      "What is the role of PDC in the DCT Platform?",
      "How does Roger interact with the Gateway?",
      "Explain the surface-not-store principle.",
      "What are the ownership boundaries between TDC and PDC?",
    ],
  },
  {
    id: "api",
    icon: "⚡",
    label: "API Assistant",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    description: "Search APIs, explain endpoints, payloads, dependencies, and consumer usage patterns.",
    sampleQuestions: [
      "What endpoints does the Gateway Read Contract expose?",
      "How does the IMS pass-through surface work?",
      "What is the CEM pass-through payload structure?",
      "Which consumers are authorized to call the Gateway?",
    ],
  },
  {
    id: "delivery",
    icon: "🚀",
    label: "Delivery Assistant",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#86efac",
    description: "Explain batch status, sprint status, dependencies, readiness, and delivery progress.",
    sampleQuestions: [
      "What is the current status of Batch 9?",
      "What batches are in PI 3?",
      "What is the 9/16 MVP cutoff scope?",
      "Which batches are on hold and why?",
    ],
  },
  {
    id: "governance",
    icon: "⚖",
    label: "Governance Assistant",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
    description: "Explain ownership, decision history, approval processes, and governance models.",
    sampleQuestions: [
      "Who owns the Gateway Read Contract?",
      "What are the DCT invariants?",
      "How does the Gate Verification process work?",
      "What is the Schema Lock governance rule?",
    ],
  },
  {
    id: "documentation",
    icon: "📄",
    label: "Documentation Assistant",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    description: "Search platform documentation, summarize documents, and answer questions from project artifacts.",
    sampleQuestions: [
      "Summarize the Batch Roadmap v4.",
      "What does the DCT Delivery Model replace?",
      "What is in the Master Data Intake?",
      "Explain the Architectural Batch model.",
    ],
  },
  {
    id: "onboarding",
    icon: "🎓",
    label: "Onboarding Assistant",
    color: "#6d28d9",
    bg: "#faf5ff",
    border: "#d8b4fe",
    description: "Help new team members understand the platform, terminology, workflows, and guided learning paths.",
    sampleQuestions: [
      "I'm new to DCT — where do I start?",
      "What does 'Invariant Lock' mean?",
      "What is the difference between PDC and TDC?",
      "Explain the Batch Gate process in simple terms.",
    ],
  },
  {
    id: "executive",
    icon: "📊",
    label: "Executive Assistant",
    color: "#be185d",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    description: "Generate leadership summaries, executive briefings, project health summaries, and delivery status updates.",
    sampleQuestions: [
      "Give me a one-paragraph platform status summary.",
      "What are the top 3 risks for the 9/16 pilot?",
      "Summarize Batch 9 for a leadership audience.",
      "What decisions are still open in PI 3?",
    ],
  },
];

// ─── KNOWLEDGE BASE (simulated responses) ────────────────────────────────────

const KNOWLEDGE_BASE: Record<string, string> = {
  // Architecture
  "pdc": "**PDC (Platform Data Core)** is the governed data repository for the DCT Platform. It is responsible for schema management, data ingestion, lineage tracking, and contract publication. PDC does not own tax logic — it is the governed storage and surface layer. In Batch 9, PDC delivers the Ocelot gateway scaffolding and IMS/CEM/TIM pass-through surfaces.",
  "roger": "**Roger** is the AI-powered tax assistant that consumes data from the DCT Platform via the Gateway. Roger calls the Gateway — not underlying systems directly. This is the 'surface-not-store' principle: the Gateway surfaces data from IMS, CEM, and TIM without storing it in PDC.",
  "gateway": "**The Roger Gateway** (Batch 9) is the single entry point for Roger and all consumers. It is built on Ocelot and provides auth, routing, and pass-through surfaces for IMS (prior year tax data), CEM (client authorization), and TIM (engagement metadata). The Gateway Read Contract is additive-only once published.",
  "surface-not-store": "**Surface-not-store** is the governing principle for the Gateway. The Gateway surfaces data from IMS, CEM, and TIM — it does not store that data in PDC. This keeps PDC as the governed repository for platform-owned data only, while pass-through data flows through without persistence.",
  "tdc": "**TDC (Tax Decision Core)** is responsible for tax judgment, immutable decisions, and rule execution. TDC owns the tax logic — PDC does not derive eligibility or perform tax calculations. TDC decisions are immutable once recorded. In the current roadmap, TDC Batch 9 (Rollforward) is ON HOLD — absorbed by other batches.",
  "ownership": "**Ownership boundaries** in the DCT Platform: PDC = financial truth and governed data storage (no tax logic). TDC = tax judgment and immutable decisions. Orchestrator = AI execution coordination. Roger = read-only output consumer. The Gateway = single consumer entry point (PDC-owned).",
  // Delivery
  "batch 9": "**Batch 9 — Roger Gateway & Governed Consumer Access Layer** (PDC only). Delivers: Ocelot gateway scaffolding, IMS pass-through surface, CEM pass-through surface, TIM pass-through surface, and Gateway Read Contract publication. TDC Rollforward scope is ON HOLD — absorbed by other batches. Status: Ready for QA.",
  "pi 3": "**PI 3** includes the final MVP delivery batches targeting the 9/16 Pilot Start. Key batches include B26 (Roger UI MVP), B28 (TDC Final Rule Lock), B29 (End-to-End Integration), B31 (TDC Rollforward — absorbed from B9), B33 (Final MVP TDC Batch), and B39 (Promoted to MVP). The hard cutoff is September 16, 2026.",
  "mvp": "**MVP Cutoff: September 16, 2026 (9/16 Pilot Start)**. The MVP scope is defined by the PI 3 batches. B33 (Final MVP TDC Batch) and B39 (Promoted to MVP) are the final delivery gates before the pilot. All PI 3 batches must pass gate verification before the cutoff.",
  // Governance
  "invariant": "**Invariants** are governance rules that must always be true — they cannot be violated by any delivery. Key platform invariants include: Roger calls the Gateway (not underlying systems directly). The Gateway Read Contract is additive-only. PDC does not store pass-through data. TDC decisions are immutable once recorded.",
  "schema lock": "**Schema Lock** is a gate condition that freezes the data schema for a batch once it passes Gate 1 (Review & Lock). No schema changes are permitted after Schema Lock without a formal change request and re-gate. This ensures downstream consumers can rely on a stable contract.",
  "gate": "**Gate Verification** is the DCT delivery governance model. Each batch must pass 5 gates: Gate 1 (Review & Lock — PO + Lead Dev), Gate 2 (Plan Validation — Lead Dev), Gate 3 (Validation Boundary Approval — PO), Gate 4 (Final Review & Merge — Lead Dev), Gate 5 (Batch Sign-Off — QA Lead). No batch proceeds without gate approval.",
  "contract": "**Contract Publication** is the formal release of a versioned API or data contract. The Gateway Read Contract is the consumer surface for Roger. Once published, it is additive-only — no fields may be removed or re-typed. This ensures consumer stability across releases.",
  // Documentation
  "batch roadmap": "**DCT Batch Roadmap v4** defines all delivery batches across PI 1, PI 2, PI 3, and On Hold. It covers 39+ batches organized by PDC and TDC tracks. Key architectural changes in v4 include: B9 repurposed from IMS Integration to Roger Gateway, eODS deferred, and TDC Rollforward scope absorbed from B9 into B31.",
  "delivery model": "**The DCT Delivery Model** replaces story-first sprint delivery with Architectural Batches and Gate Verification. Core concepts: Schema Lock, Invariant Lock, Contract Publication, and Lineage Closure. The model is designed for platform integrity, lineage assurance, and safe parallel development using agent-assisted execution.",
  "master data intake": "**The Master Data Intake** is the structured intake document used to collect actual enterprise data from SMEs and leadership, replacing seed data in the platform. It covers 8 intake entities and is used to assess readiness gaps between current seed data and required platform data.",
};

function getBuddyResponse(input: string): { text: string; capability: string } {
  const lower = input.toLowerCase();

  // Match knowledge base
  for (const [key, response] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(key)) {
      return { text: response, capability: "documentation" };
    }
  }

  // Capability-specific routing
  if (lower.includes("batch") && (lower.includes("status") || lower.includes("progress") || lower.includes("pi"))) {
    return {
      text: "Based on the DCT Batch Roadmap v4, the platform is currently in **PI 3 delivery**. Batch 9 (Roger Gateway) is Ready for QA. PI 3 batches (B26–B39) are targeting the **9/16 Pilot Start** cutoff. Several batches are in active development, and TDC B9 Rollforward is ON HOLD — absorbed by B31. Would you like details on a specific batch?",
      capability: "delivery",
    };
  }

  if (lower.includes("who") && (lower.includes("own") || lower.includes("responsible"))) {
    return {
      text: "**Ownership in the DCT Platform** is clearly bounded: **PDC** owns data storage, schema, and the Gateway. **TDC** owns tax logic, decisions, and rule execution. **Roger** is a read-only consumer. **The Orchestrator** manages AI execution. The Gateway is the single entry point — no consumer calls underlying systems directly. Would you like details on a specific ownership boundary?",
      capability: "governance",
    };
  }

  if (lower.includes("new") || lower.includes("start") || lower.includes("explain") || lower.includes("what is")) {
    return {
      text: "Welcome to the DCT Platform! Here's a quick orientation:\n\n**DCT (Data Coordination Technology)** is an enterprise data platform that governs tax data, AI-assisted delivery, and system integration for RSM.\n\n**Key components:**\n• **PDC** — Platform Data Core (governed data storage)\n• **TDC** — Tax Decision Core (tax logic and decisions)\n• **Roger** — AI tax assistant (read-only consumer)\n• **Gateway** — Single entry point for all consumers\n\nWhat would you like to explore first?",
      capability: "onboarding",
    };
  }

  if (lower.includes("summary") || lower.includes("leadership") || lower.includes("executive") || lower.includes("status update")) {
    return {
      text: "**DCT Platform Executive Summary — June 2026**\n\nThe DCT Platform is in **PI 3 delivery**, targeting the September 16, 2026 MVP Pilot Start. Batch 9 (Roger Gateway & Governed Consumer Access Layer) is Ready for QA. The Gateway establishes the single consumer entry point for Roger, surfacing IMS, CEM, and TIM data via pass-through without PDC storage.\n\n**Key decisions:** B9 TDC Rollforward is ON HOLD (absorbed by B31). eODS pass-through is deferred. The Gateway Read Contract is additive-only once published.\n\n**Top risks:** Consumer readiness alignment, TIM contract availability, and QA coverage for pass-through surfaces.",
      capability: "executive",
    };
  }

  // Default response
  return {
    text: `That's a great question about **"${input}"**. I'm currently operating as a knowledge reference assistant for the DCT Platform architecture reference workspace. For the most accurate and up-to-date answer, I recommend checking:\n\n• **Batch Roadmap v4** — for delivery scope and batch details\n• **Control Panel** — for current batch status\n• **Gateway Architecture page** — for integration and API details\n• **Data Governance page** — for ownership and invariant rules\n\nIs there a specific area I can help you navigate?`,
    capability: "documentation",
  };
}

// ─── KNOWLEDGE SOURCES ───────────────────────────────────────────────────────

const KNOWLEDGE_SOURCES = [
  { label: "Architecture Repository", icon: "🏗", status: "Active" },
  { label: "Delivery Intelligence Platform", icon: "🚀", status: "Active" },
  { label: "Governance Documentation", icon: "⚖", status: "Active" },
  { label: "Swagger APIs", icon: "⚡", status: "Reference" },
  { label: "Azure DevOps Features", icon: "📋", status: "Reference" },
  { label: "Azure DevOps Stories", icon: "📝", status: "Reference" },
  { label: "Meeting Notes", icon: "📄", status: "Pending" },
  { label: "Tax Workbooks", icon: "📊", status: "Pending" },
  { label: "QA Documentation", icon: "✅", status: "Pending" },
  { label: "Ownership Models", icon: "🗂", status: "Active" },
  { label: "Business Analysis OS", icon: "💡", status: "Active" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AskBuddy() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "buddy",
      text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. Ask me anything about architecture, APIs, delivery status, ownership, data flow, governance, testing, or project documentation.",
      timestamp: new Date(),
      capability: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text: responseText, capability } = getBuddyResponse(text);
      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "buddy",
        text: responseText,
        timestamp: new Date(),
        capability,
      };
      setMessages((prev) => [...prev, buddyMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleSampleQuestion = (q: string) => {
    sendMessage(q);
    setActiveCapability(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatText = (text: string) => {
    // Simple markdown-like formatting
    return text
      .split("\n")
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Bullet
        if (line.startsWith("• ")) {
          return `<li key="${i}" style="margin-left:1rem;list-style:disc">${line.slice(2)}</li>`;
        }
        return `<p key="${i}" style="margin-bottom:0.25rem">${line}</p>`;
      })
      .join("");
  };

  const statusColor = (s: string) =>
    s === "Active" ? "#059669" : s === "Reference" ? "#0891b2" : "#9ca3af";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <GovernanceBanner />

      {/* ── Page Header ── */}
      <div style={{ background: "#0f172a", padding: "1.5rem 2rem", borderBottom: "3px solid #0d9488" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
          <img
            src="/manus-storage/SuperCATTlogo_c2dbec15.png"
            alt="Ask Buddy — SuperCATT Mascot"
            style={{ width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ color: "#f1f5f9", fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                Ask Buddy
              </h1>
              <span style={{ background: "#0d9488", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 4, letterSpacing: "0.08em" }}>
                AI ASSISTANT
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
              DCT Business Analysis Assistant · Architecture · APIs · Delivery · Governance · Documentation
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowSources(!showSources)}
              style={{
                background: showSources ? "#0d9488" : "transparent",
                color: showSources ? "#fff" : "#94a3b8",
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📚 Knowledge Sources
            </button>
            <button
              onClick={() => setMessages([{
                id: "welcome",
                role: "buddy",
                text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. Ask me anything about architecture, APIs, delivery status, ownership, data flow, governance, testing, or project documentation.",
                timestamp: new Date(),
                capability: "welcome",
              }])}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ↺ Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem", display: "flex", gap: "1.5rem" }}>

        {/* ── Left: Capabilities Panel ── */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ background: "#f1f5f9", padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>CAPABILITIES</p>
            </div>
            {CAPABILITIES.map((cap) => (
              <button
                key={cap.id}
                onClick={() => setActiveCapability(activeCapability === cap.id ? null : cap.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.65rem 1rem",
                  background: activeCapability === cap.id ? cap.bg : "transparent",
                  borderBottom: "1px solid #f1f5f9",
                  border: "none",
                  borderLeft: activeCapability === cap.id ? `3px solid ${cap.color}` : "3px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{cap.icon}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: activeCapability === cap.id ? 700 : 500, color: activeCapability === cap.id ? cap.color : "#374151" }}>
                  {cap.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sample Questions */}
          {activeCapability && (() => {
            const cap = CAPABILITIES.find((c) => c.id === activeCapability)!;
            return (
              <div style={{ background: cap.bg, borderRadius: 10, border: `1px solid ${cap.border}`, padding: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 700, color: cap.color, letterSpacing: "0.08em" }}>
                  SAMPLE QUESTIONS
                </p>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "#64748b" }}>{cap.description}</p>
                {cap.sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleQuestion(q)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "#fff",
                      border: `1px solid ${cap.border}`,
                      borderRadius: 6,
                      padding: "0.5rem 0.75rem",
                      marginBottom: "0.4rem",
                      fontSize: "0.75rem",
                      color: "#374151",
                      cursor: "pointer",
                      lineHeight: 1.4,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Center: Chat Panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Messages */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              flex: 1,
              minHeight: 480,
              maxHeight: 560,
              overflowY: "auto",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                {msg.role === "buddy" ? (
                  <img
                    src="/manus-storage/SuperCATTlogo_c2dbec15.png"
                    alt="Ask Buddy"
                    style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0, marginTop: 2 }}
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: "#0f172a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#0d9488", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                  }}>
                    You
                  </div>
                )}
                {/* Bubble */}
                <div style={{
                  maxWidth: "75%",
                  background: msg.role === "buddy" ? "#f8fafc" : "#0f172a",
                  border: msg.role === "buddy" ? "1px solid #e2e8f0" : "none",
                  borderRadius: msg.role === "buddy" ? "0 10px 10px 10px" : "10px 0 10px 10px",
                  padding: "0.75rem 1rem",
                  color: msg.role === "buddy" ? "#1e293b" : "#f1f5f9",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}>
                  {msg.role === "buddy" ? (
                    <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                  ) : (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  )}
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.7rem", color: msg.role === "buddy" ? "#94a3b8" : "#64748b" }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {msg.capability && msg.capability !== "welcome" && (
                      <span style={{ marginLeft: "0.5rem", color: "#0d9488" }}>
                        · {CAPABILITIES.find((c) => c.id === msg.capability)?.label ?? msg.capability}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                <img
                  src="/manus-storage/SuperCATTlogo_c2dbec15.png"
                  alt="Ask Buddy typing"
                  style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }}
                />
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "0 10px 10px 10px", padding: "0.75rem 1rem",
                }}>
                  <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7, height: 7, borderRadius: "50%", background: "#0d9488",
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "0.75rem 1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about architecture, APIs, delivery status, governance, or documentation..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.9rem",
                color: "#1e293b",
                background: "transparent",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() && !isTyping ? "#0d9488" : "#e2e8f0",
                color: input.trim() && !isTyping ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.25rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              Send →
            </button>
          </div>

          {/* Quick prompts */}
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              "What is Batch 9?",
              "Explain the Gateway",
              "What is surface-not-store?",
              "Who owns the Gateway Read Contract?",
              "What is the 9/16 MVP cutoff?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSampleQuestion(q)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 20,
                  padding: "0.3rem 0.85rem",
                  fontSize: "0.75rem",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Knowledge Sources Panel ── */}
        {showSources && (
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ background: "#f1f5f9", padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>KNOWLEDGE SOURCES</p>
              </div>
              {KNOWLEDGE_SOURCES.map((src, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 1rem",
                    borderBottom: i < KNOWLEDGE_SOURCES.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{src.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#374151", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {src.label}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.65rem", color: statusColor(src.status), fontWeight: 600 }}>
                      {src.status}
                    </p>
                  </div>
                </div>
              ))}
              <div style={{ padding: "0.75rem 1rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", lineHeight: 1.4 }}>
                  Non-production reference workspace. Ask Buddy answers are sourced from platform architecture documentation only.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

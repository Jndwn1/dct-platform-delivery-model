// RSM | DCT Platform | Ask Buddy — AI Business Analysis Assistant
// Pulls live data from batchModel.ts, dctData.ts, platformData.ts, BatchDetailPage BATCH_CONTENT
// NON-PRODUCTION ARCHITECTURE REFERENCE

import { useState, useRef, useEffect } from "react";
import GovernanceBanner from "@/components/GovernanceBanner";
import {
  getAllBatches,
  getBatchById,
  getPlatformSummary,
  getBatchesByStatus,
  getBatchesByPI,
  type BatchEntry,
} from "@/lib/batchModel";
import {
  ARCHITECTURE_GUARDRAILS,
  SYSTEM_OWNERSHIP,
  ADR_REGISTRY,
  GATES,
  AGENTS,
  PLATFORM_LAYERS,
  STORY_GUARANTEES,
} from "@/lib/platformData";
import { allBatches as dctBatches, type ArchitecturalBatch } from "@/lib/dctData";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "buddy";
  text: string;
  timestamp: Date;
  capability?: string;
  sources?: string[];
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
      "What are the platform layers?",
      "Who owns the Gateway?",
      "What are the architecture guardrails?",
      "List all open architecture decisions (ADRs)",
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
      "What gates must a batch pass?",
      "What agents are in the platform?",
      "What are the story guarantees?",
      "What is the ingestion contract?",
    ],
  },
  {
    id: "delivery",
    icon: "🚀",
    label: "Delivery Assistant",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#86efac",
    description: "Explain batch status, dependencies, readiness, and delivery progress from the live Control Panel.",
    sampleQuestions: [
      "What is the current status of Batch 9?",
      "What batches are in PI 3?",
      "Which batches are complete?",
      "What batches are in review?",
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
      "What are the architecture guardrails?",
      "List all ADRs",
      "What does each gate verify?",
      "What are the story guarantees?",
    ],
  },
  {
    id: "documentation",
    icon: "📄",
    label: "Documentation Assistant",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    description: "Search platform documentation, summarize batches, and answer questions from project artifacts.",
    sampleQuestions: [
      "Summarize the platform delivery model",
      "What is Batch 28?",
      "What does Batch 6 deliver?",
      "What are the key outcomes of Batch 3?",
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
      "What is the difference between PDC and TDC?",
      "Explain the Batch Gate process",
      "What are the platform agents?",
    ],
  },
  {
    id: "executive",
    icon: "📊",
    label: "Executive Assistant",
    color: "#be185d",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    description: "Generate leadership summaries, executive briefings, and delivery status updates from live data.",
    sampleQuestions: [
      "Give me a platform status summary",
      "How many batches are complete?",
      "What is the PI 3 delivery scope?",
      "What are the top open architecture decisions?",
    ],
  },
];

// ─── LIVE QUERY ENGINE ───────────────────────────────────────────────────────
// All answers are derived from the live platform data sources.
// No hardcoded knowledge base — data comes from batchModel.ts, platformData.ts, dctData.ts.

function queryPlatform(input: string): { text: string; capability: string; sources: string[] } {
  const lower = input.toLowerCase();
  const allBatches = getAllBatches();

  // ── Batch lookup by ID or name ──────────────────────────────────────────
  // Match "batch 9", "b9", "batch 28", "b28", "foundation core", etc.
  const batchIdMatch = lower.match(/\b(?:batch\s*)?(?:b(\d+[a-z]?)|(\d+[a-z]?))\b/i);
  const foundationMatch = lower.includes("foundation core") || lower.includes("fc");
  const mtMatch = lower.includes("migration") || lower.includes("mt");

  let targetBatch: BatchEntry | undefined;
  if (foundationMatch) targetBatch = getBatchById("FC");
  else if (mtMatch) targetBatch = getBatchById("MT");
  else if (batchIdMatch) {
    const rawId = batchIdMatch[1] || batchIdMatch[2];
    targetBatch = getBatchById(`B${rawId.toUpperCase()}`) ?? getBatchById(rawId.toUpperCase());
  }

  if (targetBatch) {
    const dctBatch: ArchitecturalBatch | undefined = dctBatches.find(
      (b: ArchitecturalBatch) => b.id?.toLowerCase() === targetBatch!.id.toLowerCase()
    );
    const storiesText = dctBatch?.stories?.length
      ? `\n\n**Stories (${dctBatch.stories.length}):**\n${(dctBatch.stories as string[]).map((s: string) => `• ${s}`).join("\n")}`
      : "";
    const outcomesText = targetBatch.keyOutcomes?.length
      ? `\n\n**Key Outcomes:**\n${targetBatch.keyOutcomes.map((o) => `• ${o}`).join("\n")}`
      : "";
    const whatMustText = dctBatch?.whatMustBeTrue
      ? `\n\n**What Must Be True:**\n${dctBatch.whatMustBeTrue.slice(0, 300)}${dctBatch.whatMustBeTrue.length > 300 ? "…" : ""}`
      : "";
    const depsText = targetBatch.dependencies?.length
      ? `\n\n**Dependencies:** ${targetBatch.dependencies.join(", ")}`
      : "";

    return {
      text: `**${targetBatch.id} — ${targetBatch.fullName}**\n\n**PI:** ${targetBatch.piLabel}\n**Status:** ${targetBatch.status}\n**Area:** ${targetBatch.area}\n**Story Count:** ${targetBatch.storyCount}\n\n${targetBatch.description}${storiesText}${outcomesText}${whatMustText}${depsText}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)", "DCT Data (dctData.ts)"],
    };
  }

  // ── Platform summary / status overview ──────────────────────────────────
  if (
    lower.includes("platform summary") ||
    lower.includes("status summary") ||
    lower.includes("how many batch") ||
    lower.includes("overall status") ||
    lower.includes("platform status")
  ) {
    const summary = getPlatformSummary();
    return {
      text: `**DCT Platform Delivery Summary**\n\n**Total Batches:** ${summary.total}\n\n**By Status:**\n• Complete: ${summary.complete}\n• In Development: ${summary.dev}\n• In Review: ${summary.review}\n• Planned: ${summary.planned}\n\n**Total Stories:** ${summary.totalStories}\n\n**Completion Rate:** ${Math.round(summary.complete / summary.total * 100)}%`,
      capability: "executive",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }

  // ── PI-specific batch list ───────────────────────────────────────────────
  const piMatch = lower.match(/pi\s*([1-4])/);
  if (piMatch) {
    const piKey = `PI${piMatch[1]}` as "PI1" | "PI2" | "PI3" | "PI4";
    const piBatches = getBatchesByPI(piKey);
    const batchLines = piBatches.map((b) => `• **${b.id}** — ${b.name} [${b.status}]`).join("\n");
    return {
      text: `**${piKey} Batches (${piBatches.length} total):**\n\n${batchLines || "No batches found for this PI."}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }

  // ── Status-filtered batch list ───────────────────────────────────────────
  if (lower.includes("complete") && (lower.includes("batch") || lower.includes("which"))) {
    const batches = getBatchesByStatus("Complete");
    return {
      text: `**Complete Batches (${batches.length}):**\n\n${batches.map((b: BatchEntry) => `• **${b.id}** — ${b.name}`).join("\n")}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }
  if (lower.includes("review") && (lower.includes("batch") || lower.includes("which"))) {
    const batches = getBatchesByStatus("Review");
    return {
      text: `**Batches in Review (${batches.length}):**\n\n${batches.map((b: BatchEntry) => `• **${b.id}** — ${b.name}`).join("\n")}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }
  if ((lower.includes("active") || lower.includes("in progress") || lower.includes("in dev")) && lower.includes("batch")) {
    const devBatches = [...getBatchesByStatus("Active"), ...getBatchesByStatus("Dev")];
    return {
      text: `**Active / In Development Batches (${devBatches.length}):**\n\n${devBatches.map((b: BatchEntry) => `• **${b.id}** — ${b.name} [${b.status}]`).join("\n")}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }

  // ── Architecture guardrails ──────────────────────────────────────────────
  if (lower.includes("guardrail") || lower.includes("architecture rule") || lower.includes("arch rule")) {
    const lines = ARCHITECTURE_GUARDRAILS.map(
      (g) => `• **${g.rule}** — ${g.detail}`
    ).join("\n");
    return {
      text: `**Architecture Guardrails (${ARCHITECTURE_GUARDRAILS.length}):**\n\n${lines}`,
      capability: "governance",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── System ownership ─────────────────────────────────────────────────────
  if (lower.includes("own") || lower.includes("responsible") || lower.includes("ownership")) {
    const lines = SYSTEM_OWNERSHIP.map(
      (s) => `• **${s.system}** (${s.owner}) — ${s.role}\n  ↳ Layer: ${s.layer} | System of Record: ${s.sor ? "Yes" : "No"}`
    ).join("\n\n");
    return {
      text: `**System Ownership Boundaries:**\n\n${lines}`,
      capability: "governance",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── ADRs ─────────────────────────────────────────────────────────────────
  if (lower.includes("adr") || lower.includes("architecture decision") || lower.includes("open decision")) {
    const lines = ADR_REGISTRY.map(
      (a) => `• **${a.id}** [${a.status}] — ${a.title}\n  ${a.decision.slice(0, 120)}${a.decision.length > 120 ? "…" : ""}`
    ).join("\n\n");
    return {
      text: `**Architecture Decision Records (${ADR_REGISTRY.length}):**\n\n${lines}`,
      capability: "governance",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── Gates ────────────────────────────────────────────────────────────────
  if (lower.includes("gate") && !lower.includes("gateway")) {
    const lines = GATES.map(
      (g) => `• **${g.name}** (${g.owner}) — ${g.description}\n  Artifacts: ${g.artifacts?.join(", ") ?? "N/A"}`
    ).join("\n\n");
    return {
      text: `**Batch Delivery Gates (${GATES.length}):**\n\n${lines}`,
      capability: "governance",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── Agents ───────────────────────────────────────────────────────────────
  if (lower.includes("agent")) {
    const lines = AGENTS.map(
      (a) => `• **${a.name}** [${a.status}] — ${a.role}\n  ${a.description}`
    ).join("\n\n");
    return {
      text: `**Platform Agents (${AGENTS.length}):**\n\n${lines}`,
      capability: "api",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── Platform layers ──────────────────────────────────────────────────────
  if (lower.includes("layer") || lower.includes("platform layer") || lower.includes("component")) {
    const lines = PLATFORM_LAYERS.map(
      (l) => `• **${l.label}** — ${l.sublabel} (${l.authority})\n  Systems: ${l.systems?.join(", ") ?? "N/A"}`
    ).join("\n\n");
    return {
      text: `**Platform Layers (${PLATFORM_LAYERS.length}):**\n\n${lines}`,
      capability: "architecture",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── Story guarantees ─────────────────────────────────────────────────────
  if (lower.includes("guarantee") || lower.includes("story guarantee") || lower.includes("lineage") || lower.includes("schema lock") || lower.includes("contract")) {
    const lines = STORY_GUARANTEES.map(
      (g) => `• **${g.guaranteeType}** [${g.status}] — ${g.title}\n  Gate: ${g.gate} · ${g.platformGuarantee.slice(0, 100)}${g.platformGuarantee.length > 100 ? "…" : ""}`
    ).join("\n\n");
    return {
      text: `**Story Guarantees (${STORY_GUARANTEES.length}):**\n\n${lines}`,
      capability: "governance",
      sources: ["Platform Data (platformData.ts)"],
    };
  }

  // ── All batches list ─────────────────────────────────────────────────────
  if (lower.includes("all batch") || lower.includes("list batch") || lower.includes("every batch")) {
    const lines = allBatches.map((b) => `• **${b.id}** — ${b.name} [${b.status}] (${b.pi})`).join("\n");
    return {
      text: `**All Batches (${allBatches.length}):**\n\n${lines}`,
      capability: "delivery",
      sources: ["Batch Registry (batchModel.ts)"],
    };
  }

  // ── Gateway / surface-not-store ──────────────────────────────────────────
  if (lower.includes("gateway") || lower.includes("surface-not-store") || lower.includes("surface not store")) {
    const b9 = getBatchById("B9");
    const b9pdc = getBatchById("B9-PDC") ?? getBatchById("B9");
    return {
      text: `**Roger Gateway & Governed Consumer Access Layer (Batch 9)**\n\n${b9?.description ?? ""}\n\n**Governing Principle:** Surface-not-store — the Gateway surfaces data from IMS, CEM, and TIM without storing it in PDC.\n\n**Status:** ${b9pdc?.status ?? "Unknown"}\n\n**Key Outcomes:**\n${b9?.keyOutcomes?.map((o) => `• ${o}`).join("\n") ?? "See Batch 9 in Control Panel"}`,
      capability: "architecture",
      sources: ["Batch Registry (batchModel.ts)", "Control Panel"],
    };
  }

  // ── Onboarding / new to DCT ──────────────────────────────────────────────
  if (lower.includes("new") || lower.includes("start") || lower.includes("orientation") || lower.includes("what is dct")) {
    const summary = getPlatformSummary();
    const layers = PLATFORM_LAYERS.slice(0, 4).map((l) => `• **${l.label}** — ${l.sublabel}`).join("\n");
    return {
      text: `**Welcome to the DCT Platform!**\n\nDCT is an enterprise data platform that governs tax data, AI-assisted delivery, and system integration for RSM. It has ${summary.total} delivery batches across 4 PIs.\n\n**Key Platform Layers:**\n${layers}\n\nFor a full orientation, explore the **Batch Roadmap**, **Control Panel**, and **Gateway Architecture** pages in the sidebar.`,
      capability: "onboarding",
      sources: ["Platform Data (platformData.ts)", "Batch Registry (batchModel.ts)"],
    };
  }

  // ── Executive summary ────────────────────────────────────────────────────
  if (lower.includes("executive") || lower.includes("leadership") || lower.includes("summary") || lower.includes("briefing")) {
    const summary = getPlatformSummary();
    const openAdrs = ADR_REGISTRY.filter((a) => a.status === "PROPOSED").length;
    return {
      text: `**DCT Platform — Executive Summary**\n\n**Total Batches:** ${summary.total}\n**Complete:** ${summary.complete} | **In Development:** ${summary.dev} | **In Review:** ${summary.review} | **Planned:** ${summary.planned}\n**Completion Rate:** ${Math.round(summary.complete / summary.total * 100)}%\n\n**Open Architecture Decisions:** ${openAdrs} ADR${openAdrs !== 1 ? "s" : ""} pending\n**Platform Agents:** ${AGENTS.length} agents defined\n**Delivery Gates:** ${GATES.length} gates per batch\n\nFor full batch-level detail, see the **Control Panel** and **Batch Roadmap** pages.`,
      capability: "executive",
      sources: ["Batch Registry (batchModel.ts)", "Platform Data (platformData.ts)"],
    };
  }

  // ── Default: suggest relevant searches ──────────────────────────────────
  const summary = getPlatformSummary();
  return {
    text: `I searched the live platform data for **"${input}"** but couldn't find a direct match.\n\n**Try asking about:**\n• A specific batch (e.g., "What is Batch 6?" or "Tell me about B28")\n• Platform status (e.g., "Give me a platform summary")\n• PI scope (e.g., "What batches are in PI 3?")\n• Governance (e.g., "List all ADRs" or "What are the guardrails?")\n• Agents, gates, or platform layers\n\n**Current platform:** ${summary.total} batches · ${summary.complete} complete · ${summary.review} in review`,
    capability: "documentation",
    sources: ["Batch Registry (batchModel.ts)"],
  };
}

// ─── KNOWLEDGE SOURCES ───────────────────────────────────────────────────────

const KNOWLEDGE_SOURCES = [
  { label: "Batch Registry (batchModel.ts)", icon: "🏗", status: "Live" },
  { label: "DCT Data (dctData.ts)", icon: "📋", status: "Live" },
  { label: "Platform Data (platformData.ts)", icon: "⚙", status: "Live" },
  { label: "Architecture Guardrails", icon: "⚖", status: "Live" },
  { label: "System Ownership", icon: "🗂", status: "Live" },
  { label: "ADR Registry", icon: "📝", status: "Live" },
  { label: "Gate Definitions", icon: "✅", status: "Live" },
  { label: "Agent Definitions", icon: "🤖", status: "Live" },
  { label: "Story Guarantees", icon: "🔒", status: "Live" },
  { label: "Platform Layers", icon: "📊", status: "Live" },
  { label: "Meeting Notes", icon: "📄", status: "Pending" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AskBuddy() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "buddy",
      text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. I pull live data directly from the Control Panel — batch status, stories, invariants, ownership, gates, agents, and governance rules. Ask me anything.",
      timestamp: new Date(),
      capability: "welcome",
      sources: [],
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
      const { text: responseText, capability, sources } = queryPlatform(text);
      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "buddy",
        text: responseText,
        timestamp: new Date(),
        capability,
        sources,
      };
      setMessages((prev) => [...prev, buddyMsg]);
      setIsTyping(false);
    }, 700 + Math.random() * 400);
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
    return text
      .split("\n")
      .map((line, i) => {
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.startsWith("• ")) {
          return `<li style="margin-left:1.2rem;list-style:disc;margin-bottom:0.15rem">${line.slice(2)}</li>`;
        }
        if (line.startsWith("  ↳ ")) {
          return `<p style="margin-left:1.5rem;color:#64748b;font-size:0.8rem;margin-bottom:0.1rem">${line.slice(4)}</p>`;
        }
        return `<p style="margin-bottom:0.2rem">${line}</p>`;
      })
      .join("");
  };

  const statusColor = (s: string) =>
    s === "Live" ? "#059669" : s === "Reference" ? "#0891b2" : "#9ca3af";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <GovernanceBanner />

      {/* ── Page Header ── */}
      <div style={{ background: "#0f172a", padding: "1.5rem 2rem", borderBottom: "3px solid #0d9488" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
          <img
            src="/manus-storage/SuperCATTlogo_55cea789.png"
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
              <span style={{ background: "#1e3a5f", color: "#7dd3fc", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 4, letterSpacing: "0.08em" }}>
                LIVE DATA
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
              Pulling live data from the Control Panel · Batch Registry · Platform Data · Governance Rules
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
              📚 Data Sources
            </button>
            <button
              onClick={() => setMessages([{
                id: "welcome",
                role: "buddy",
                text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. I pull live data directly from the Control Panel — batch status, stories, invariants, ownership, gates, agents, and governance rules. Ask me anything.",
                timestamp: new Date(),
                capability: "welcome",
                sources: [],
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
                {msg.role === "buddy" ? (
                  <img
                    src="/manus-storage/SuperCATTlogo_55cea789.png"
                    alt="Ask Buddy"
                    style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0, marginTop: 2 }}
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: "#0f172a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#0d9488", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                  }}>
                    You
                  </div>
                )}
                <div style={{
                  maxWidth: "78%",
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
                  <div style={{ marginTop: "0.4rem", display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: msg.role === "buddy" ? "#94a3b8" : "#64748b" }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.capability && msg.capability !== "welcome" && (
                      <span style={{ fontSize: "0.65rem", color: "#0d9488", fontWeight: 600 }}>
                        · {CAPABILITIES.find((c) => c.id === msg.capability)?.label ?? msg.capability}
                      </span>
                    )}
                    {msg.sources && msg.sources.length > 0 && msg.sources.map((src, i) => (
                      <span key={i} style={{
                        fontSize: "0.62rem", background: "#f0fdf4", color: "#059669",
                        border: "1px solid #86efac", borderRadius: 3, padding: "0.1rem 0.4rem", fontWeight: 600,
                      }}>
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                <img
                  src="/manus-storage/SuperCATTlogo_55cea789.png"
                  alt="Ask Buddy typing"
                  style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }}
                />
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "0 10px 10px 10px", padding: "0.75rem 1rem",
                }}>
                  <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#0d9488",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
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
              placeholder="Ask about any batch, PI status, guardrails, ADRs, agents, gates, or ownership..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: "0.9rem", color: "#1e293b", background: "transparent" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() && !isTyping ? "#0d9488" : "#e2e8f0",
                color: input.trim() && !isTyping ? "#fff" : "#94a3b8",
                border: "none", borderRadius: 8, padding: "0.5rem 1.25rem",
                fontWeight: 700, fontSize: "0.875rem",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              }}
            >
              Send →
            </button>
          </div>

          {/* Quick prompts */}
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              "What is Batch 9?",
              "List all ADRs",
              "What batches are in PI 3?",
              "Platform status summary",
              "What are the guardrails?",
              "List all agents",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSampleQuestion(q)}
                style={{
                  background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20,
                  padding: "0.3rem 0.85rem", fontSize: "0.75rem", color: "#475569",
                  cursor: "pointer", fontWeight: 500,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Data Sources Panel ── */}
        {showSources && (
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ background: "#f1f5f9", padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>LIVE DATA SOURCES</p>
              </div>
              {KNOWLEDGE_SOURCES.map((src, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.6rem 1rem",
                  borderBottom: i < KNOWLEDGE_SOURCES.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  <span style={{ fontSize: "0.9rem" }}>{src.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#374151", fontWeight: 500, lineHeight: 1.3 }}>
                      {src.label}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.65rem", color: statusColor(src.status), fontWeight: 600 }}>
                      {src.status}
                    </p>
                  </div>
                </div>
              ))}
              <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", borderTop: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#059669", fontWeight: 600 }}>
                  ✓ Pulling live data from Control Panel sources
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

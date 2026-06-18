// RSM | DCT Platform | Ask Buddy — AI Business Analysis Assistant
// Pulls live data from batchModel.ts, dctData.ts, platformData.ts, BatchDetailPage BATCH_CONTENT
// NON-PRODUCTION ARCHITECTURE REFERENCE

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import GovernanceBanner from "@/components/GovernanceBanner";
import { trpc } from "@/lib/trpc";

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

// ─── PLATFORM TOUR STEPS ─────────────────────────────────────────────────────

interface TourStep {
  id: string;
  section: string;
  navLabel: string;
  icon: string;
  accentColor: string;
  buddyMessage: string;
  highlights: string[];
  examplePrompt?: string;
  navPath?: string;
  navButtonLabel?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    section: "Welcome",
    navLabel: "Welcome",
    icon: "👋",
    accentColor: "#0d9488",
    buddyMessage: `Welcome to the DCT Platform.

I'm Buddy, your DCT Business Analysis Assistant.

Think of me as your guide to everything in this workspace.

I can explain batches, stories, APIs, architecture, governance rules, deployments, Roger integrations, gates, agents, and platform data.

Let's take a quick tour.`,
    highlights: ["Ask Buddy", "Platform Tour", "Data Sources", "Clear Chat"],
  },
  {
    id: "delivery",
    section: "Delivery Model",
    navLabel: "Delivery Model",
    icon: "🚀",
    accentColor: "#059669",
    buddyMessage: `The Delivery Model is where all DCT Features are organized by Program Increment (PI).

Here you can view:

• Current batches
• Delivery status
• PI planning
• Feature progression
• Platform ownership

If you want to know:
- What is being delivered?
- What batch are we on?
- What is in scope?

Start here.`,
    highlights: ["PI 2", "PI 3", "Batches", "Done", "Committed", "Stretch", "MVP"],
    examplePrompt: "What batches are in PI 3?",
    navPath: "/",
    navButtonLabel: "Go to Delivery Model →",
  },
  {
    id: "gates",
    section: "Gates",
    navLabel: "Gates",
    icon: "✅",
    accentColor: "#2563eb",
    buddyMessage: `Gates represent delivery readiness checkpoints.

Each gate validates a different aspect of platform quality and governance.

• Gate 1 — Schema Lock: All data contracts are finalized and locked.
• Gate 2 — Invariant Lock: Business rules and constraints are verified.
• Gate 3 — Contract Publishing: APIs and interfaces are published and stable.
• Gate 4 — Lineage Certification: Full data lineage is traceable and certified.

A batch cannot advance until its gates are passed.`,
    highlights: ["Gate 1 — Schema Lock", "Gate 2 — Invariant Lock", "Gate 3 — Contract Publishing", "Gate 4 — Lineage Certification"],
    examplePrompt: "Buddy, why is Gate 4 still in progress?",
    navPath: "/gate-status",
    navButtonLabel: "Go to Gate Status →",
  },
  {
    id: "agents",
    section: "Agents",
    navLabel: "Agents",
    icon: "🤖",
    accentColor: "#7c3aed",
    buddyMessage: `Agents are specialized AI assistants that support delivery activities.

• Analyst Agent — Requirements and discovery support. Helps BAs define scope, write stories, and identify gaps.

• Architect Agent — Architecture and technical design guidance. Explains system relationships, ADRs, and guardrails.

• Developer Agent — Implementation and API assistance. Supports engineers with contracts, endpoints, and integration patterns.

• QA Agent — Testing and validation support. Assists with test coverage, invariant verification, and gate readiness.

Each agent operates within defined ownership boundaries.`,
    highlights: ["Analyst Agent", "Architect Agent", "Developer Agent", "QA Agent"],
    examplePrompt: "What agents are available on the platform?",
    navPath: "/agent-hub",
    navButtonLabel: "Go to Agent Hub →",
  },
  {
    id: "ba",
    section: "BA & Requirements",
    navLabel: "BA & Requirements",
    icon: "📋",
    accentColor: "#0891b2",
    buddyMessage: `This section contains the primary Business Analysis tools used by DCT.

• Deployment Registry — Tracks all platform deployments and release history. Use when reviewing release notes or understanding production changes.

• Batch Control Panel — Central command center for batch management. Use when reviewing scope, managing delivery, or tracking status.

• Gate Status — Real-time gate progression. Use when determining readiness or tracking approvals.

• Touchpoints (T1–T11) — Cross-team integration map. Shows where DCT interacts with Roger, IMS, TIM, EODS, and other platforms.

• Data Model & Gaps — Platform source of truth for data architecture.

• Classification Wall — Review taxonomy classifications and mapping decisions.`,
    highlights: ["Deployment Registry", "Batch Control Panel", "Gate Status", "Touchpoints T1–T11", "Data Model & Gaps", "Classification Wall"],
    examplePrompt: "Show me the latest deployment.",
    navPath: "/deployment-registry",
    navButtonLabel: "Go to Deployment Registry →",
  },
  {
    id: "roger",
    section: "Roger UI",
    navLabel: "Roger UI",
    icon: "🔗",
    accentColor: "#be185d",
    buddyMessage: `Roger is the consumer-facing experience for reviewing and managing tax decisions.

• Consumer Integration — View DCT → Roger integration points and how data flows from the platform to practitioners.

• Integration Simulation — Simulate end-to-end workflow behavior. Use when training users, testing scenarios, or demonstrating flows.

• Roger API Evolution — Track Roger API versions and changes over time.

Roger is read-only from DCT's perspective. DCT produces the data; Roger consumes it.`,
    highlights: ["Consumer Integration", "Integration Simulation", "Roger API Evolution", "Read-Only Output"],
    examplePrompt: "How does DCT send data to Roger?",
    navPath: "/consumer-integration-hub",
    navButtonLabel: "Go to Roger Consumer Hub →",
  },
  {
    id: "governance",
    section: "Governance",
    navLabel: "Governance",
    icon: "⚖",
    accentColor: "#b45309",
    buddyMessage: `Governance ensures platform decisions remain controlled, traceable, and compliant.

• Gap Analysis Engine — Identify process, architecture, and data gaps across the platform.

• AAP Review Model — Governance review workflow for architecture and delivery decisions.

• Batch Delivery Review — Delivery readiness and governance validation before promotion.

• Data Governance & Source of Truth — Defines authoritative ownership of data. Use when determining system ownership or resolving conflicts.

• Roger UI Data Mapping — Maps Roger UI fields to DCT data structures.

Every major decision should have a governance artifact.`,
    highlights: ["Gap Analysis Engine", "AAP Review Model", "Batch Delivery Review", "Data Governance", "Roger UI Data Mapping"],
    examplePrompt: "What are the architecture guardrails?",
    navPath: "/gap-analysis",
    navButtonLabel: "Go to Gap Analysis →",
  },
  {
    id: "architecture",
    section: "Architecture & Diagrams",
    navLabel: "Architecture",
    icon: "🏗",
    accentColor: "#1e40af",
    buddyMessage: `This section contains the technical blueprints of the platform.

• Agent Hub — Central view of AI agents and their interactions across the platform.

• Architecture Diagram — High-level platform architecture. Best starting point for new users and stakeholder presentations.

• Architecture Sync — Shows latest synchronization status between platform components.

• Developer Architecture — Detailed implementation design. Used by developers and architects for deep technical reference.

You're now ready to explore the DCT Platform.

Remember: If you're ever unsure where to go, simply ask me.

Examples:
• Where can I find Batch 42?
• What does this gate mean?
• Which API supports this feature?
• Show me the architecture.
• What changed in the latest deployment?

I can guide you directly to the correct area.`,
    highlights: ["Agent Hub", "Architecture Diagram", "Architecture Sync", "Developer Architecture"],
    examplePrompt: "Show me the platform architecture.",
    navPath: "/architecture",
    navButtonLabel: "Go to Architecture →",
  },
];

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

const TOUR_STORAGE_KEY = "dct_platform_tour_completed";

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AskBuddy() {
  const initialPrompt = typeof window !== "undefined"
    ? decodeURIComponent(new URLSearchParams(window.location.search).get("prompt") ?? "")
    : "";

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
  const [input, setInput] = useState(initialPrompt);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Tour state
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // First-time user popup
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTourPrompt(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Keyboard shortcuts for tour navigation
  useEffect(() => {
    if (!tourActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleTourNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleTourPrev();
      } else if (e.key === "Escape") {
        handleTourSkip();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tourActive, tourStep]);

  const startTour = () => {
    setTourActive(true);
    setTourStep(0);
    setShowTourPrompt(false);
    // Inject the welcome tour message into chat
    const step = TOUR_STEPS[0];
    const tourMsg: Message = {
      id: `tour-${Date.now()}`,
      role: "buddy",
      text: step.buddyMessage,
      timestamp: new Date(),
      capability: "onboarding",
      sources: ["Platform Tour"],
    };
    setMessages([
      {
        id: "welcome",
        role: "buddy",
        text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. I pull live data directly from the Control Panel — batch status, stories, invariants, ownership, gates, agents, and governance rules. Ask me anything.",
        timestamp: new Date(),
        capability: "welcome",
        sources: [],
      },
      tourMsg,
    ]);
  };

  const handleTourNext = () => {
    const nextStep = tourStep + 1;
    if (nextStep >= TOUR_STEPS.length) {
      // Tour complete
      setTourActive(false);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      const doneMsg: Message = {
        id: `tour-done-${Date.now()}`,
        role: "buddy",
        text: "🎉 Tour complete! You now know your way around the DCT Platform.\n\nFeel free to ask me anything — I'm always here to help.",
        timestamp: new Date(),
        capability: "onboarding",
        sources: ["Platform Tour"],
      };
      setMessages((prev) => [...prev, doneMsg]);
      return;
    }
    setTourStep(nextStep);
    const step = TOUR_STEPS[nextStep];
    const tourMsg: Message = {
      id: `tour-${Date.now()}`,
      role: "buddy",
      text: step.buddyMessage,
      timestamp: new Date(),
      capability: "onboarding",
      sources: ["Platform Tour"],
    };
    setMessages((prev) => [...prev, tourMsg]);
  };

  const handleTourPrev = () => {
    if (tourStep === 0) return;
    const prevStep = tourStep - 1;
    setTourStep(prevStep);
    const step = TOUR_STEPS[prevStep];
    const tourMsg: Message = {
      id: `tour-${Date.now()}`,
      role: "buddy",
      text: `↩ Going back to: ${step.section}\n\n${step.buddyMessage}`,
      timestamp: new Date(),
      capability: "onboarding",
      sources: ["Platform Tour"],
    };
    setMessages((prev) => [...prev, tourMsg]);
  };

  const handleTourSkip = () => {
    setTourActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    const skipMsg: Message = {
      id: `tour-skip-${Date.now()}`,
      role: "buddy",
      text: "Tour skipped. You can restart it anytime using the 🎓 Platform Tour button.\n\nAsk me anything about the DCT Platform!",
      timestamp: new Date(),
      capability: "onboarding",
      sources: [],
    };
    setMessages((prev) => [...prev, skipMsg]);
  };

  const handleTourRestart = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    startTour();
  };

  const chatMutation = trpc.askBuddy.chat.useMutation({
    onSuccess: (data) => {
      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "buddy",
        text: data.text,
        timestamp: new Date(),
        capability: "ai",
        sources: ["LLM (Full Platform Knowledge Base)"],
      };
      setMessages((prev) => [...prev, buddyMsg]);
      setIsTyping(false);
    },
    onError: (err) => {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "buddy",
        text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
        capability: "error",
        sources: [],
      };
      setMessages((prev) => [...prev, errMsg]);
      setIsTyping(false);
    },
  });

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    // If tour is active, pause it when user types
    if (tourActive) setTourActive(false);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));

    chatMutation.mutate({
      messages: [
        ...history,
        { role: "user" as const, content: text.trim() },
      ],
    });
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
      .map((line) => {
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

  const [, navigate] = useLocation();

  const currentTourStep = TOUR_STEPS[tourStep];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <GovernanceBanner />

      {/* ── First-time Tour Prompt ── */}
      {showTourPrompt && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.55)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 14, padding: "2rem 2.5rem",
            maxWidth: 460, width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <img
              src="/manus-storage/SuperCATTlogo_55cea789.png"
              alt="Buddy"
              style={{ width: 72, height: 72, objectFit: "contain", marginBottom: "1rem" }}
            />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>
              Welcome to the DCT Platform!
            </h2>
            <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
              Would you like Buddy to give you a quick platform tour? It covers all major sections and takes about 5 minutes.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={startTour}
                style={{
                  background: "#0d9488", color: "#fff", border: "none",
                  borderRadius: 8, padding: "0.6rem 1.5rem",
                  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                }}
              >
                🎓 Yes, Start Tour
              </button>
              <button
                onClick={() => {
                  setShowTourPrompt(false);
                  localStorage.setItem(TOUR_STORAGE_KEY, "true");
                }}
                style={{
                  background: "transparent", color: "#64748b",
                  border: "1px solid #e2e8f0", borderRadius: 8,
                  padding: "0.6rem 1.5rem", fontWeight: 600,
                  fontSize: "0.9rem", cursor: "pointer",
                }}
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

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
                NON-PRODUCTION
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
              Pulling live data from the Control Panel · Batch Registry · Platform Data · Governance Rules
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Platform Tour Button */}
            <button
              onClick={tourActive ? handleTourRestart : startTour}
              style={{
                background: tourActive ? "#0d9488" : "#1e3a5f",
                color: "#fff",
                border: `1px solid ${tourActive ? "#0d9488" : "#334155"}`,
                borderRadius: 6,
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              🎓 {tourActive ? "Restart Tour" : "Platform Tour"}
            </button>
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
              onClick={() => {
                setTourActive(false);
                setMessages([{
                  id: "welcome",
                  role: "buddy",
                  text: "Hi, I'm Ask Buddy! Your DCT Business Analysis Assistant. I pull live data directly from the Control Panel — batch status, stories, invariants, ownership, gates, agents, and governance rules. Ask me anything.",
                  timestamp: new Date(),
                  capability: "welcome",
                  sources: [],
                }]);
              }}
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

      {/* ── Tour Progress Bar ── */}
      {tourActive && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0.6rem 2rem" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" }}>
              PLATFORM TOUR
            </span>
            {/* Step dots */}
            <div style={{ display: "flex", gap: "0.4rem", flex: 1, alignItems: "center" }}>
              {TOUR_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  title={step.navLabel}
                  style={{
                    height: 6,
                    flex: 1,
                    borderRadius: 3,
                    background: i <= tourStep ? "#0d9488" : "#1e293b",
                    transition: "background 0.3s ease",
                    cursor: "default",
                  }}
                />
              ))}
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" }}>
              Step {tourStep + 1} of {TOUR_STEPS.length} — {currentTourStep.icon} {currentTourStep.navLabel}
            </span>
            {/* Nav buttons */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                onClick={handleTourPrev}
                disabled={tourStep === 0}
                style={{
                  background: tourStep === 0 ? "#1e293b" : "#334155",
                  color: tourStep === 0 ? "#475569" : "#e2e8f0",
                  border: "none", borderRadius: 5,
                  padding: "0.3rem 0.7rem", fontSize: "0.75rem",
                  fontWeight: 600, cursor: tourStep === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>
              <button
                onClick={handleTourNext}
                style={{
                  background: "#0d9488", color: "#fff",
                  border: "none", borderRadius: 5,
                  padding: "0.3rem 0.7rem", fontSize: "0.75rem",
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                {tourStep === TOUR_STEPS.length - 1 ? "Finish ✓" : "Next →"}
              </button>
              <button
                onClick={handleTourSkip}
                style={{
                  background: "transparent", color: "#64748b",
                  border: "1px solid #334155", borderRadius: 5,
                  padding: "0.3rem 0.7rem", fontSize: "0.75rem",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tour Section Highlight Card ── */}
      {tourActive && (
        <div style={{ background: "#f0fdf4", borderBottom: `3px solid ${currentTourStep.accentColor}`, padding: "0.75rem 2rem" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.4rem" }}>{currentTourStep.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: currentTourStep.accentColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Now Exploring
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                  {currentTourStep.section}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {currentTourStep.highlights.map((h, i) => (
                <span key={i} style={{
                  background: "#fff",
                  border: `1px solid ${currentTourStep.accentColor}40`,
                  color: currentTourStep.accentColor,
                  borderRadius: 4, padding: "0.2rem 0.6rem",
                  fontSize: "0.72rem", fontWeight: 600,
                }}>
                  {h}
                </span>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {currentTourStep.examplePrompt && (
                <button
                  onClick={() => handleSampleQuestion(currentTourStep.examplePrompt!)}
                  style={{
                    background: currentTourStep.accentColor,
                    color: "#fff", border: "none",
                    borderRadius: 6, padding: "0.35rem 0.9rem",
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Try: "{currentTourStep.examplePrompt}"
                </button>
              )}
              {currentTourStep.navPath && (
                <button
                  onClick={() => navigate(currentTourStep.navPath!)}
                  style={{
                    background: "#fff",
                    color: currentTourStep.accentColor,
                    border: `2px solid ${currentTourStep.accentColor}`,
                    borderRadius: 6, padding: "0.35rem 0.9rem",
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentTourStep.navButtonLabel}
                </button>
              )}
            </div>
            <span style={{ color: "#64748b", fontSize: "0.68rem" }}>
              ← → arrow keys to navigate · Esc to skip
            </span>
          </div>
        </div>
      )}

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

          {/* Tour Navigation Panel (when tour active) */}
          {tourActive && (
            <div style={{ background: "#f0fdf4", borderRadius: 10, border: "1px solid #86efac", padding: "1rem", marginTop: "1rem" }}>
              <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 700, color: "#059669", letterSpacing: "0.08em" }}>
                TOUR SECTIONS
              </p>
              {TOUR_STEPS.map((step, i) => (
                <div key={step.id} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.35rem 0.5rem",
                  borderRadius: 5,
                  background: i === tourStep ? "#dcfce7" : "transparent",
                  marginBottom: "0.2rem",
                }}>
                  <span style={{ fontSize: "0.85rem" }}>{step.icon}</span>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: i === tourStep ? 700 : 500,
                    color: i < tourStep ? "#059669" : i === tourStep ? "#065f46" : "#94a3b8",
                  }}>
                    {i < tourStep ? "✓ " : ""}{step.navLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
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

          {/* Tour inline nav (when tour active) */}
          {tourActive && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: 10, padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
              display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46" }}>
                {currentTourStep.icon} {currentTourStep.section} — Step {tourStep + 1} of {TOUR_STEPS.length}
              </span>
              <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                <button onClick={handleTourPrev} disabled={tourStep === 0}
                  style={{
                    background: tourStep === 0 ? "#e2e8f0" : "#fff",
                    color: tourStep === 0 ? "#94a3b8" : "#374151",
                    border: "1px solid #d1fae5", borderRadius: 6,
                    padding: "0.35rem 0.85rem", fontSize: "0.8rem",
                    fontWeight: 600, cursor: tourStep === 0 ? "not-allowed" : "pointer",
                  }}>
                  ← Previous
                </button>
                <button onClick={handleTourNext}
                  style={{
                    background: "#059669", color: "#fff",
                    border: "none", borderRadius: 6,
                    padding: "0.35rem 0.85rem", fontSize: "0.8rem",
                    fontWeight: 700, cursor: "pointer",
                  }}>
                  {tourStep === TOUR_STEPS.length - 1 ? "Finish Tour ✓" : `Next — ${TOUR_STEPS[tourStep + 1]?.navLabel} →`}
                </button>
                <button onClick={handleTourSkip}
                  style={{
                    background: "transparent", color: "#6b7280",
                    border: "1px solid #d1d5db", borderRadius: 6,
                    padding: "0.35rem 0.85rem", fontSize: "0.8rem",
                    fontWeight: 600, cursor: "pointer",
                  }}>
                  Skip Tour
                </button>
              </div>
            </div>
          )}

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

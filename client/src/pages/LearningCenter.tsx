// DCT Platform — Learning Center
// Tutorial video library organized by topic, with Ask Buddy as live chat support
// RSM | CATT | Non-Production Architecture Reference Workspace

import { useState } from "react";
import { Link } from "wouter";
import GovernanceBanner from "@/components/GovernanceBanner";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  videoUrl?: string;        // YouTube embed URL (optional — placeholder if not yet recorded)
  comingSoon?: boolean;
  relatedPath?: string;     // Deep link to the relevant dashboard section
  relatedLabel?: string;
}

interface Topic {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

// ─── TOPICS ───────────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
  {
    id: "all",
    label: "All Topics",
    icon: "📚",
    color: "#0f172a",
    bg: "#f8fafc",
    border: "#e2e8f0",
    description: "Browse all available tutorials",
  },
  {
    id: "platform-overview",
    label: "Platform Overview",
    icon: "🏛",
    color: "#1e3a5f",
    bg: "#eff6ff",
    border: "#93c5fd",
    description: "Understand the DCT platform architecture, components, and delivery model",
  },
  {
    id: "batch-delivery",
    label: "Batch Delivery",
    icon: "🚀",
    color: "#065f46",
    bg: "#f0fdf4",
    border: "#86efac",
    description: "Learn how batches are structured, tracked, and delivered through PIs",
  },
  {
    id: "gates-governance",
    label: "Gates & Governance",
    icon: "✅",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#93c5fd",
    description: "Understand the four delivery gates and governance requirements",
  },
  {
    id: "ba-requirements",
    label: "BA & Requirements",
    icon: "📋",
    color: "#0891b2",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    description: "Business analysis tools, story writing, and requirements discovery",
  },
  {
    id: "data-architecture",
    label: "Data & Architecture",
    icon: "🗄",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    description: "Data models, APIs, lineage, and system integration patterns",
  },
  {
    id: "roger-integration",
    label: "Roger Integration",
    icon: "🔗",
    color: "#be185d",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    description: "How DCT data flows to Roger and how practitioners consume it",
  },
  {
    id: "ims-integration",
    label: "IMS & Return Engines",
    icon: "🔀",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fcd34d",
    description: "IMS as integration broker between DCT and downstream return engines",
  },
  {
    id: "ask-buddy",
    label: "Ask Buddy",
    icon: "🐱",
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#99f6e4",
    description: "How to get the most out of Ask Buddy for BA discovery and research",
  },
];

// ─── TUTORIALS ────────────────────────────────────────────────────────────────

const TUTORIALS: Tutorial[] = [
  // ── Platform Overview ──────────────────────────────────────────────────────
  {
    id: "t01",
    title: "DCT Platform Introduction",
    description: "A high-level walkthrough of the DCT platform — what it is, why it exists, and how it supports RSM's tax technology delivery model. Covers the four platform layers (PDC, TDC, Orchestrator, Roger) and the role of each.",
    duration: "8 min",
    topic: "platform-overview",
    level: "Beginner",
    tags: ["DCT", "Platform Layers", "PDC", "TDC", "Roger", "Overview"],
    comingSoon: true,
    relatedPath: "/discovery/dct-overview",
    relatedLabel: "DCT Overview",
  },
  {
    id: "t02",
    title: "Ecosystem Overview: All Platform Components",
    description: "Walk through every component in the DCT ecosystem — PDC, TDC, Orchestrator, Roger, IMS, B9A Gateway, and their relationships. Understand who owns what and how data flows between systems.",
    duration: "12 min",
    topic: "platform-overview",
    level: "Beginner",
    tags: ["Ecosystem", "Components", "Ownership", "IMS", "B9A Gateway"],
    comingSoon: true,
    relatedPath: "/discovery/ecosystem",
    relatedLabel: "Ecosystem Overview",
  },
  {
    id: "t03",
    title: "Platform Responsibilities: Who Owns What",
    description: "Learn the strict ownership boundaries across DCT systems. Understand why PDC owns financial truth, TDC owns tax judgment, and why no system should cross these boundaries — and what happens when they do.",
    duration: "10 min",
    topic: "platform-overview",
    level: "Intermediate",
    tags: ["Ownership", "Boundaries", "PDC", "TDC", "Governance"],
    comingSoon: true,
    relatedPath: "/discovery/platform-responsibilities",
    relatedLabel: "Platform Responsibilities",
  },
  {
    id: "t04",
    title: "End-to-End Data Flow: ERP to Return Engine",
    description: "Follow a single financial transaction from ERP ingestion through PDC normalization, TDC tax classification, Roger review, and IMS delivery to the return engine. See every handoff point and ownership boundary.",
    duration: "15 min",
    topic: "platform-overview",
    level: "Intermediate",
    tags: ["Data Flow", "ERP", "PDC", "TDC", "IMS", "Return Engine", "Lineage"],
    comingSoon: true,
    relatedPath: "/discovery/data-flow",
    relatedLabel: "End-to-End Data Flow",
  },

  // ── Batch Delivery ─────────────────────────────────────────────────────────
  {
    id: "t05",
    title: "What Is a Batch? Delivery Model Explained",
    description: "Understand the batch-driven delivery model. Learn what a batch is, how batches are organized into Program Increments (PIs), and how each batch maps to a Feature and set of user stories.",
    duration: "9 min",
    topic: "batch-delivery",
    level: "Beginner",
    tags: ["Batch", "PI", "Delivery Model", "Features", "Stories"],
    comingSoon: true,
    relatedPath: "/",
    relatedLabel: "Delivery Model",
  },
  {
    id: "t06",
    title: "Navigating the Batch Control Panel",
    description: "A hands-on walkthrough of the Batch Control Panel. Learn how to view batch status, update delivery progress, review scope, and track PI completion in real time.",
    duration: "11 min",
    topic: "batch-delivery",
    level: "Beginner",
    tags: ["Batch Control Panel", "Status", "PI", "Delivery"],
    comingSoon: true,
    relatedPath: "/batch-control-panel",
    relatedLabel: "Batch Control Panel",
  },
  {
    id: "t07",
    title: "Batch 9A: Gateway & Governed Access",
    description: "Deep dive into Batch 9A — the B9A Gateway. Learn how it provides governed, API-first access to TDC data for all downstream consumers including Roger, IMS, State, and Provision.",
    duration: "13 min",
    topic: "batch-delivery",
    level: "Intermediate",
    tags: ["B9A", "Gateway", "Governed Access", "APIs", "TDC"],
    comingSoon: true,
    relatedPath: "/batch/9A",
    relatedLabel: "Batch 9A Detail",
  },
  {
    id: "t08",
    title: "Batch 16: Audit Trail & Lineage Governance",
    description: "Understand Batch 16 — the audit trail and lineage governance batch. Learn how every TDC decision is captured, what the immutable audit record contains, and how lineage is maintained from source to output.",
    duration: "14 min",
    topic: "batch-delivery",
    level: "Intermediate",
    tags: ["B16", "Audit Trail", "Lineage", "Immutability", "Governance"],
    comingSoon: true,
    relatedPath: "/batch/16",
    relatedLabel: "Batch 16 Detail",
  },
  {
    id: "t09",
    title: "Batch 28: Provision Reference Data & BTP Outbound",
    description: "Learn what Batch 28 actually delivers — provision reference data (DTAClassification, DTLClassification, ETRCategory, ValuationAllowanceCriterion) and the BTPProvisionOutbound contract. Understand what B28 does NOT do (provision compute, UTP, period mismatch).",
    duration: "12 min",
    topic: "batch-delivery",
    level: "Intermediate",
    tags: ["B28", "Provision", "BTP", "Reference Data", "DTA", "DTL", "ETR"],
    comingSoon: true,
    relatedPath: "/batch/28",
    relatedLabel: "Batch 28 Detail",
  },

  // ── Gates & Governance ─────────────────────────────────────────────────────
  {
    id: "t10",
    title: "The Four Delivery Gates Explained",
    description: "A complete walkthrough of the four DCT delivery gates: G1 Schema Lock, G2 Invariant Lock, G3 Contract Publication, and G4 Lineage Closure. Learn what each gate validates, who owns it, and what artifacts are required to pass.",
    duration: "16 min",
    topic: "gates-governance",
    level: "Beginner",
    tags: ["Gates", "G1", "G2", "G3", "G4", "Schema Lock", "Invariant Lock", "Lineage"],
    comingSoon: true,
    relatedPath: "/gate-status",
    relatedLabel: "Gate Status",
  },
  {
    id: "t11",
    title: "Architecture Decision Records (ADRs)",
    description: "Understand what ADRs are, why they exist in the DCT model, and how to read and reference them. Learn how ADRs enforce architectural guardrails and prevent scope drift.",
    duration: "10 min",
    topic: "gates-governance",
    level: "Intermediate",
    tags: ["ADR", "Architecture", "Guardrails", "Governance", "Decisions"],
    comingSoon: true,
    relatedPath: "/discovery/integration-architecture",
    relatedLabel: "Integration Architecture",
  },
  {
    id: "t12",
    title: "Architecture Guardrails: What You Cannot Do",
    description: "Learn the non-negotiable architecture guardrails in the DCT model. Understand why certain patterns are prohibited — direct DB access, cross-layer writes, bypassing the Gateway — and what the approved alternatives are.",
    duration: "11 min",
    topic: "gates-governance",
    level: "Advanced",
    tags: ["Guardrails", "Architecture", "Prohibited Patterns", "Governance"],
    comingSoon: true,
    relatedPath: "/discovery/integration-architecture",
    relatedLabel: "Integration Architecture",
  },

  // ── BA & Requirements ──────────────────────────────────────────────────────
  {
    id: "t13",
    title: "BA Discovery Workflow: Start Here",
    description: "The recommended workflow for Business Analysts starting a new requirements discovery. Covers the mandatory capability pre-check, how to use the Discovery Workspace, and when to write a new story vs. reference an existing feature.",
    duration: "14 min",
    topic: "ba-requirements",
    level: "Beginner",
    tags: ["BA", "Discovery", "Requirements", "Pre-Check", "Stories"],
    comingSoon: true,
    relatedPath: "/onboarding",
    relatedLabel: "Discovery Workspace",
  },
  {
    id: "t14",
    title: "Using the BA Story Builder",
    description: "Step-by-step guide to the BA Story Builder. Learn how to write well-structured user stories, acceptance criteria, and dependency flags using the DCT story template. Covers the 'As a... I want... So that...' format with DCT-specific guardrails.",
    duration: "18 min",
    topic: "ba-requirements",
    level: "Beginner",
    tags: ["Story Builder", "User Stories", "Acceptance Criteria", "BA", "Backlog"],
    comingSoon: true,
    relatedPath: "/discovery/ba-story-builder",
    relatedLabel: "BA Story Builder",
  },
  {
    id: "t15",
    title: "Capability Pre-Check: Before You Write a Story",
    description: "Learn the mandatory 5-step capability pre-check every BA must complete before writing a new requirement. Understand how to search the Batch Registry, Feature Catalog, and API inventory to determine if DCT already satisfies the business need.",
    duration: "12 min",
    topic: "ba-requirements",
    level: "Intermediate",
    tags: ["Pre-Check", "Capability", "BA", "Requirements", "Batch Registry", "APIs"],
    comingSoon: true,
    relatedPath: "/onboarding",
    relatedLabel: "Discovery Workspace",
  },
  {
    id: "t16",
    title: "Discovery Checklist: Are You Ready to Write Requirements?",
    description: "Walk through the DCT Discovery Checklist — 12 questions every BA should answer before writing requirements. Covers scope, data, lineage, integration, governance, and downstream impact.",
    duration: "10 min",
    topic: "ba-requirements",
    level: "Intermediate",
    tags: ["Discovery Checklist", "BA", "Readiness", "Scope", "Governance"],
    comingSoon: true,
    relatedPath: "/discovery/checklist",
    relatedLabel: "Discovery Checklist",
  },

  // ── Data & Architecture ────────────────────────────────────────────────────
  {
    id: "t17",
    title: "Understanding the DCT Data Model",
    description: "A guided tour of the DCT data model — business objects, tax objects, classification structures, and how they relate to each other. Learn how financial data becomes tax-ready data through the TDC pipeline.",
    duration: "20 min",
    topic: "data-architecture",
    level: "Intermediate",
    tags: ["Data Model", "Business Objects", "Tax Objects", "Classification", "TDC"],
    comingSoon: true,
    relatedPath: "/discovery/data-model",
    relatedLabel: "Data Model & Gaps",
  },
  {
    id: "t18",
    title: "API Inventory: What APIs Does DCT Expose?",
    description: "A complete walkthrough of the DCT API catalog. Learn what APIs are available, what each endpoint returns, who the consumers are, and how to reference APIs in your requirements and stories.",
    duration: "15 min",
    topic: "data-architecture",
    level: "Intermediate",
    tags: ["APIs", "Endpoints", "Consumers", "B9A Gateway", "TDC"],
    comingSoon: true,
    relatedPath: "/discovery/integration-architecture",
    relatedLabel: "Integration Architecture",
  },
  {
    id: "t19",
    title: "Lineage: Tracing Data from Source to Output",
    description: "Understand DCT lineage — how every data point is traceable from its ERP source through PDC normalization, TDC classification, and final output. Learn why lineage is a gate requirement and how to verify it.",
    duration: "13 min",
    topic: "data-architecture",
    level: "Advanced",
    tags: ["Lineage", "Traceability", "Audit", "G4", "Governance"],
    comingSoon: true,
    relatedPath: "/discovery/data-flow",
    relatedLabel: "End-to-End Data Flow",
  },

  // ── Roger Integration ──────────────────────────────────────────────────────
  {
    id: "t20",
    title: "Roger Overview: What Practitioners See",
    description: "Understand Roger from the practitioner's perspective — what screens exist, what data they display, and how that data originates from DCT. Learn the Roger read-only rule and why Roger never writes back to TDC.",
    duration: "11 min",
    topic: "roger-integration",
    level: "Beginner",
    tags: ["Roger", "Practitioner", "Read-Only", "Screens", "TDC"],
    comingSoon: true,
    relatedPath: "/discovery/roger-overview",
    relatedLabel: "Roger Overview",
  },
  {
    id: "t21",
    title: "DCT → Roger Data Flow",
    description: "Trace how data flows from TDC through the B9A Gateway to Roger. Understand the API contracts, data objects, and screen mappings that connect the platform to the practitioner experience.",
    duration: "14 min",
    topic: "roger-integration",
    level: "Intermediate",
    tags: ["Roger", "B9A Gateway", "Data Flow", "APIs", "Screen Mapping"],
    comingSoon: true,
    relatedPath: "/consumer-integration-hub",
    relatedLabel: "Roger Consumer Hub",
  },

  // ── IMS & Return Engines ───────────────────────────────────────────────────
  {
    id: "t22",
    title: "IMS: The Integration Broker Explained",
    description: "Understand IMS (Integration & Management System) — why it exists, what it does, and why DCT does not connect directly to any return engine. Learn the IMS architecture rule and how to apply it when writing requirements.",
    duration: "12 min",
    topic: "ims-integration",
    level: "Beginner",
    tags: ["IMS", "Integration Broker", "Return Engine", "GoSystem", "CCH", "OIT"],
    comingSoon: true,
    relatedPath: "/discovery/gosystem",
    relatedLabel: "IMS Integration",
  },
  {
    id: "t23",
    title: "BTPProvisionOutbound: What B28 Delivers to BTP",
    description: "Deep dive into the BTPProvisionOutbound contract — what data B28 delivers to BTP, what DTA/DTL recon and ETR recon data looks like, and what the Provision team is responsible for after receiving it.",
    duration: "10 min",
    topic: "ims-integration",
    level: "Advanced",
    tags: ["B28", "BTP", "BTPProvisionOutbound", "DTA", "DTL", "ETR", "Provision"],
    comingSoon: true,
    relatedPath: "/batch/28",
    relatedLabel: "Batch 28 Detail",
  },

  {
    id: "t24",
    title: "TDC to IMS: Understanding the Outbound Contract",
    description: "A detailed walkthrough of the TDC Outbound Contract to IMS (v1.0, 07.09.2026). Covers the envelope structure (clientId, entityId, taxYear, returnType, filingId, assemblyId, deliveryId, contractVersion), the flat tax-line payload (returnLineId, formLineCode, formLineLabel, scheduleReference, amount), the two-identifier model (filingId for IMS idempotency vs. deliveryId for TDC per-attempt tracking), IMS roll-up responsibility (TDC emits one line per record; IMS rolls up to per-form-line totals), and the current delivery status (payload is built and real — only the live transport is stubbed until IMS stands up its endpoint).",
    duration: "18 min",
    topic: "ims-integration",
    level: "Advanced",
    tags: ["IMS", "TDC Outbound", "Payload", "Contract", "filingId", "deliveryId", "formLineCode", "returnLineId", "Roll-Up", "Flat Payload", "B9A Gateway"],
    comingSoon: true,
    relatedPath: "/discovery/gosystem",
    relatedLabel: "IMS Integration",
  },

  // ── Ask Buddy ──────────────────────────────────────────────────────────────
  {
    id: "t25",
    title: "Getting Started with Ask Buddy",
    description: "Learn how to use Ask Buddy effectively — how to ask good questions, what data sources Buddy has access to, how the capability pre-check works, and how to use Buddy for BA discovery, architecture research, and requirements validation.",
    duration: "8 min",
    topic: "ask-buddy",
    level: "Beginner",
    tags: ["Ask Buddy", "AI Assistant", "Discovery", "BA", "Research"],
    comingSoon: true,
    relatedPath: "/ask-buddy",
    relatedLabel: "Ask Buddy",
  },
  {
    id: "t26",
    title: "Ask Buddy: Advanced Prompting for BAs",
    description: "Advanced techniques for getting precise, actionable answers from Ask Buddy. Covers multi-step research prompts, capability gap analysis, story validation, and how to use Buddy to prepare for PI planning.",
    duration: "15 min",
    topic: "ask-buddy",
    level: "Advanced",
    tags: ["Ask Buddy", "Prompting", "Advanced", "PI Planning", "Gap Analysis"],
    comingSoon: true,
    relatedPath: "/ask-buddy",
    relatedLabel: "Ask Buddy",
  },
];

// ─── LEVEL COLORS ─────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "#f0fdf4", color: "#166534", border: "#86efac" },
  Intermediate: { bg: "#fff7ed", color: "#9a3412", border: "#fdba74" },
  Advanced:     { bg: "#faf5ff", color: "#6b21a8", border: "#d8b4fe" },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function LearningCenter() {
  const [activeTopic, setActiveTopic] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  // Filter tutorials
  const filtered = TUTORIALS.filter((t) => {
    const matchTopic = activeTopic === "all" || t.topic === activeTopic;
    const matchLevel = activeLevel === "all" || t.level === activeLevel;
    const matchSearch =
      searchQuery.trim() === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTopic && matchLevel && matchSearch;
  });

  const activeTopic_ = TOPICS.find((t) => t.id === activeTopic) ?? TOPICS[0];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "28px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
          }}>
            📚
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>
              Learning Center
            </h1>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              DCT Platform · Tutorial Library · Architecture & BA Reference
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#0d9488", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 4, padding: "3px 8px" }}>
              {TUTORIALS.length} Tutorials
            </span>
            <Link href="/ask-buddy">
              <button style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#0d9488", color: "#fff",
                border: "none", borderRadius: 6, padding: "6px 14px",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
              }}>
                🐱 Ask Buddy — Live Support
              </button>
            </Link>
          </div>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#475569", lineHeight: 1.6, maxWidth: "780px" }}>
          Structured tutorials for Business Analysts, Product Owners, and team members learning the DCT platform.
          All tutorials are organized by topic and skill level. Use <strong>Ask Buddy</strong> for live Q&A support at any time.
        </p>
      </div>

      <GovernanceBanner />

      {/* ── Ask Buddy Support Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderRadius: 10, padding: "16px 20px", marginBottom: "24px",
        display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
      }}>
        <img
          src="/manus-storage/SuperCATTlogo_55cea789.png"
          alt="Ask Buddy"
          style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", marginBottom: "3px" }}>
            Ask Buddy — Your Live DCT Support Assistant
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
            Have a question while watching a tutorial? Not sure how something applies to your work?
            Ask Buddy has full access to the DCT knowledge base — batches, APIs, governance rules, architecture, and more.
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            "What does B9A deliver?",
            "Who owns the Gateway?",
            "What is IMS?",
            "How do I write a story?",
          ].map((q) => (
            <Link key={q} href={`/ask-buddy?prompt=${encodeURIComponent(q)}`}>
              <button style={{
                background: "rgba(255,255,255,0.08)", color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5,
                padding: "5px 10px", fontSize: "11px", fontWeight: 500,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                {q}
              </button>
            </Link>
          ))}
          <Link href="/ask-buddy">
            <button style={{
              background: "#0d9488", color: "#fff",
              border: "none", borderRadius: 5,
              padding: "5px 12px", fontSize: "11px", fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Open Ask Buddy →
            </button>
          </Link>
        </div>
      </div>

      {/* ── Search & Level Filter ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search tutorials by title, topic, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, minWidth: "240px",
            border: "1px solid #e2e8f0", borderRadius: 7,
            padding: "8px 14px", fontSize: "13px", color: "#1e293b",
            outline: "none", background: "#fff",
          }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "Beginner", "Intermediate", "Advanced"].map((level) => {
            const style = level === "all"
              ? { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" }
              : LEVEL_STYLE[level];
            const isActive = activeLevel === level;
            return (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                style={{
                  background: isActive ? style.bg : "#fff",
                  color: isActive ? style.color : "#64748b",
                  border: `1px solid ${isActive ? style.border : "#e2e8f0"}`,
                  borderRadius: 5, padding: "5px 12px",
                  fontSize: "11px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {level === "all" ? "All Levels" : level}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

        {/* ── Left: Topic Sidebar ── */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "#f1f5f9", padding: "0.65rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>TOPICS</p>
            </div>
            {TOPICS.map((topic) => {
              const count = topic.id === "all"
                ? TUTORIALS.length
                : TUTORIALS.filter((t) => t.topic === topic.id).length;
              const isActive = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "0.6rem 1rem",
                    background: isActive ? topic.bg : "transparent",
                    borderBottom: "1px solid #f1f5f9",
                    border: "none",
                    borderLeft: isActive ? `3px solid ${topic.color}` : "3px solid transparent",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{topic.icon}</span>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: isActive ? 700 : 500,
                    color: isActive ? topic.color : "#374151", flex: 1, lineHeight: 1.3,
                  }}>
                    {topic.label}
                  </span>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600,
                    color: isActive ? topic.color : "#94a3b8",
                    background: isActive ? topic.bg : "#f8fafc",
                    border: `1px solid ${isActive ? topic.border : "#e2e8f0"}`,
                    borderRadius: 10, padding: "1px 6px", flexShrink: 0,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Links */}
          <div style={{ background: "#f0fdf4", borderRadius: 10, border: "1px solid #86efac", padding: "1rem", marginTop: "12px" }}>
            <p style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 700, color: "#065f46", letterSpacing: "0.08em" }}>
              QUICK LINKS
            </p>
            {[
              { label: "Discovery Workspace", path: "/onboarding" },
              { label: "BA Story Builder", path: "/discovery/ba-story-builder" },
              { label: "Discovery Checklist", path: "/discovery/checklist" },
              { label: "Glossary", path: "/discovery/glossary" },
              { label: "Ask Buddy", path: "/ask-buddy" },
            ].map((link) => (
              <Link key={link.path} href={link.path}>
                <div style={{
                  fontSize: "0.75rem", color: "#065f46", fontWeight: 500,
                  padding: "4px 0", borderBottom: "1px solid #d1fae5",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <span style={{ color: "#10b981" }}>→</span> {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right: Tutorial Cards ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Topic header */}
          <div style={{
            background: activeTopic_.bg, border: `1px solid ${activeTopic_.border}`,
            borderRadius: 8, padding: "10px 16px", marginBottom: "16px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "1.1rem" }}>{activeTopic_.icon}</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: activeTopic_.color }}>{activeTopic_.label}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{activeTopic_.description}</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>
              {filtered.length} tutorial{filtered.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>

          {/* Tutorial cards */}
          {filtered.length === 0 ? (
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
              padding: "40px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>No tutorials found</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Try adjusting your search or topic filter, or{" "}
                <Link href="/ask-buddy">
                  <span style={{ color: "#0d9488", fontWeight: 600, cursor: "pointer" }}>ask Buddy</span>
                </Link>{" "}
                for help.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "14px" }}>
              {filtered.map((tutorial) => {
                const levelStyle = LEVEL_STYLE[tutorial.level];
                const topicData = TOPICS.find((t) => t.id === tutorial.topic);
                const isExpanded = expandedVideo === tutorial.id;

                return (
                  <div
                    key={tutorial.id}
                    style={{
                      background: "#fff", border: "1px solid #e2e8f0",
                      borderRadius: 10, overflow: "hidden",
                      borderTop: `3px solid ${topicData?.color ?? "#e2e8f0"}`,
                    }}
                  >
                    {/* Video thumbnail / placeholder */}
                    <div
                      style={{
                        background: tutorial.comingSoon
                          ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
                          : "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
                        height: "140px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column", gap: "8px",
                        cursor: tutorial.comingSoon ? "default" : "pointer",
                        position: "relative",
                      }}
                      onClick={() => !tutorial.comingSoon && setExpandedVideo(isExpanded ? null : tutorial.id)}
                    >
                      {tutorial.comingSoon ? (
                        <>
                          <div style={{ fontSize: "2rem", opacity: 0.4 }}>🎬</div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em" }}>
                            COMING SOON
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            background: "rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.4rem",
                          }}>
                            ▶
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                            Click to play
                          </div>
                        </>
                      )}
                      {/* Duration badge */}
                      <div style={{
                        position: "absolute", bottom: 8, right: 10,
                        background: "rgba(0,0,0,0.5)", color: "#fff",
                        fontSize: "10px", fontWeight: 700, borderRadius: 3,
                        padding: "2px 6px",
                      }}>
                        {tutorial.duration}
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", lineHeight: 1.3, marginBottom: "4px" }}>
                            {tutorial.title}
                          </div>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: 700,
                              background: levelStyle.bg, color: levelStyle.color,
                              border: `1px solid ${levelStyle.border}`,
                              borderRadius: 3, padding: "1px 6px",
                            }}>
                              {tutorial.level}
                            </span>
                            <span style={{
                              fontSize: "10px", fontWeight: 600,
                              background: topicData?.bg ?? "#f8fafc",
                              color: topicData?.color ?? "#475569",
                              border: `1px solid ${topicData?.border ?? "#e2e8f0"}`,
                              borderRadius: 3, padding: "1px 6px",
                            }}>
                              {topicData?.icon} {topicData?.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                        {tutorial.description}
                      </p>

                      {/* Tags */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                        {tutorial.tags.slice(0, 5).map((tag) => (
                          <span key={tag} style={{
                            fontSize: "10px", color: "#64748b",
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            borderRadius: 3, padding: "1px 5px",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {tutorial.comingSoon ? (
                          <span style={{
                            fontSize: "11px", fontWeight: 600, color: "#94a3b8",
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            borderRadius: 5, padding: "4px 10px",
                          }}>
                            Video coming soon
                          </span>
                        ) : (
                          <button
                            onClick={() => setExpandedVideo(isExpanded ? null : tutorial.id)}
                            style={{
                              background: "#0f172a", color: "#fff",
                              border: "none", borderRadius: 5,
                              padding: "5px 12px", fontSize: "11px", fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ▶ Watch Tutorial
                          </button>
                        )}
                        {tutorial.relatedPath && (
                          <Link href={tutorial.relatedPath}>
                            <button style={{
                              background: "transparent", color: "#0d9488",
                              border: "1px solid #99f6e4", borderRadius: 5,
                              padding: "4px 10px", fontSize: "11px", fontWeight: 600,
                              cursor: "pointer",
                            }}>
                              {tutorial.relatedLabel ?? "Open in Dashboard"} →
                            </button>
                          </Link>
                        )}
                        <Link href={`/ask-buddy?prompt=${encodeURIComponent(`Tell me more about: ${tutorial.title}`)}`}>
                          <button style={{
                            background: "transparent", color: "#0d9488",
                            border: "none", borderRadius: 5,
                            padding: "4px 8px", fontSize: "11px", fontWeight: 600,
                            cursor: "pointer", marginLeft: "auto",
                          }}>
                            🐱 Ask Buddy
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Bottom CTA ── */}
          <div style={{
            marginTop: "28px", background: "#f0fdf4",
            border: "1px solid #86efac", borderRadius: 10,
            padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>
                Can't find what you're looking for?
              </div>
              <div style={{ fontSize: "12px", color: "#374151", lineHeight: 1.5 }}>
                Ask Buddy has access to the full DCT knowledge base — every batch, API, governance rule, architecture decision, and platform concept.
                Ask any question and get a sourced, structured answer instantly.
              </div>
            </div>
            <Link href="/ask-buddy">
              <button style={{
                background: "#059669", color: "#fff",
                border: "none", borderRadius: 7,
                padding: "10px 20px", fontSize: "13px", fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                🐱 Open Ask Buddy →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

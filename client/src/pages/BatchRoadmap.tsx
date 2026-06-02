// Batch Calendar — DCT Platform Delivery
// RSM | CATT | DCT Platform
// Governance Readiness Reference: DCT Delivery Schedule / Epic Mapping (Architecture Reference)
// Design: Executive-readable, PI-grouped, Feature-collapsed by default
// Last refreshed: 2026-05-28 | Source: DCT_Batch_Roadmap_v4_corrected.docx
// Non-production workspace — architecture visualization and readiness planning only
import { useState } from "react";
import { Link } from "wouter";
import GovernanceBanner from "@/components/GovernanceBanner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Circle, AlertTriangle, Play, ArrowRight, Info } from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type OwnerType = "PDC" | "TDC" | "Platform" | "PDC+TDC";
type StatusType = "Complete" | "Active" | "Committed" | "Stretch" | "Planned" | "Program Close";

interface GovernanceIndicator {
  label: string;
  color: string;
  bg: string;
  border: string;
}

interface FeatureRow {
  id: string;
  batch: string;
  name: string;
  owner: OwnerType;
  pi: string;
  startDate: string;
  endDate: string;
  status: StatusType;
  // Hover summary fields
  batchSummary: string;
  governanceFocus: string;
  majorDependency: string;
  readContractImpact: string;
  downstreamImpact: string;
  // Governance indicators
  governance: string[];
  // Cross-batch chain (if this feature is part of a multi-PI chain)
  chainNote?: string;
}

// ─── GOVERNANCE INDICATOR DEFINITIONS ────────────────────────────────────────
const GOV_INDICATORS: Record<string, GovernanceIndicator> = {
  "Contract Published": { label: "Contract Published", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  "Read Contract":      { label: "Read Contract",      color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
  "Schema Published":   { label: "Schema Published",   color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
  "Lineage Enabled":    { label: "Lineage Enabled",    color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  "Additive-Only":      { label: "Additive-Only",      color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  "Immutable":          { label: "Immutable",          color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<StatusType, { dot: string; badge: string; label: string; icon: React.ElementType }> = {
  "Complete":      { dot: "#059669", badge: "bg-emerald-100 text-emerald-800", label: "Complete",      icon: CheckCircle2 },
  "Active":        { dot: "#2563eb", badge: "bg-blue-100 text-blue-800",       label: "Active",        icon: Play },
  "Committed":     { dot: "#2563eb", badge: "bg-blue-100 text-blue-800",       label: "Committed",     icon: Clock },
  "Stretch":       { dot: "#ea580c", badge: "bg-orange-100 text-orange-800",   label: "Stretch",       icon: AlertTriangle },
  "Planned":       { dot: "#94a3b8", badge: "bg-slate-100 text-slate-500",     label: "Planned",       icon: Circle },
  "Program Close": { dot: "#7c3aed", badge: "bg-purple-100 text-purple-800",   label: "Program Close", icon: CheckCircle2 },
};

const OWNER_CFG: Record<OwnerType, { color: string; bg: string; border: string }> = {
  "PDC":      { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  "TDC":      { color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  "Platform": { color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
  "PDC+TDC":  { color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe" },
};

// ─── CROSS-BATCH DEPENDENCIES ─────────────────────────────────────────────────
const CROSS_BATCH_DEPS: { from: string; to: string; label: string }[] = [
  { from: "B2",  to: "B2A", label: "B2 → B2A: Normalization feeds Classification Contract Enforcement" },
  { from: "B5",  to: "B7",  label: "B5 → B7: Entity Identity required for Tax Profile & Eligibility" },
  { from: "B6",  to: "B10", label: "B6 → B10: Practitioner Review Lock required for Return Assembly" },
  { from: "B16", to: "B16", label: "B16 PDC (PI 2 Stretch) → B16 TDC (PI 3): Lineage governance chain" },
  { from: "B24", to: "B25", label: "B24 → B25: Advisory Reference Data required for Detection & Surfacing" },
];

// ─── FEATURE DATA (authoritative from ADO wiki) ───────────────────────────────
const FEATURES: FeatureRow[] = [
  // ── PI 1 — Complete ──────────────────────────────────────────────────────────
  {
    id: "pi1-fc", batch: "FC", name: "Foundation Core", owner: "Platform", pi: "PI 1",
    startDate: "", endDate: "", status: "Complete",
    batchSummary: "Platform foundation: schema lock, ingestion pipeline, and core infrastructure.",
    governanceFocus: "Schema Lock. Invariant Lock. Platform baseline.",
    majorDependency: "None — foundational batch.",
    readContractImpact: "All downstream batches depend on FC schema contracts.",
    downstreamImpact: "All PI 1–4 batches.",
    governance: ["Schema Published", "Contract Published", "Immutable"],
  },
  {
    id: "pi1-b1", batch: "B1", name: "File Ingestion & Initial Storage", owner: "PDC", pi: "PI 1",
    startDate: "", endDate: "", status: "Complete",
    batchSummary: "File ingestion pipeline and initial storage layer for all LOB data.",
    governanceFocus: "Ingestion contract. Storage schema lock.",
    majorDependency: "FC — Foundation Core.",
    readContractImpact: "B2 normalization reads B1 ingestion contracts.",
    downstreamImpact: "B2, B9 PDC.",
    governance: ["Schema Published", "Contract Published", "Additive-Only"],
  },
  {
    id: "pi1-b2", batch: "B2", name: "Normalization & Cross-LOB Taxonomy", owner: "PDC", pi: "PI 1",
    startDate: "", endDate: "", status: "Complete",
    batchSummary: "Cross-LOB normalization and taxonomy. Feeds B2A classification enforcement.",
    governanceFocus: "Taxonomy contract. Cross-LOB normalization schema.",
    majorDependency: "B1 — File Ingestion.",
    readContractImpact: "B2A reads B2 normalization contracts.",
    downstreamImpact: "B2A, B3.",
    governance: ["Schema Published", "Contract Published", "Read Contract"],
    chainNote: "B2 → B2A (PI 2): Normalization feeds Classification Contract Enforcement",
  },
  {
    id: "pi1-b3", batch: "B3", name: "Tax Domain Authority & Tax Taxonomy", owner: "TDC", pi: "PI 1",
    startDate: "", endDate: "", status: "Complete",
    batchSummary: "Tax domain authority and taxonomy. Establishes TDC as the governing authority for all tax classification.",
    governanceFocus: "Tax taxonomy authority. TDC domain boundary.",
    majorDependency: "B2 — Normalization.",
    readContractImpact: "B4 AI Mapping reads B3 tax taxonomy contracts.",
    downstreamImpact: "B4, B7, B14, B15.",
    governance: ["Schema Published", "Contract Published", "Immutable"],
  },
  // ── PI 2 — Committed ─────────────────────────────────────────────────────────
  {
    id: "pi2-b4", batch: "B4", name: "AI Mapping Proposals, Decisions & Governance", owner: "TDC", pi: "PI 2",
    startDate: "", endDate: "", status: "Complete" as StatusType,
    batchSummary: "AI mapping proposals, human decisions, and governance. TDC governs all AI mapping decisions.",
    governanceFocus: "AI decision governance. Human-in-the-loop enforcement.",
    majorDependency: "B3 — Tax Domain Authority.",
    readContractImpact: "B5 entity identity reads B4 mapping decisions.",
    downstreamImpact: "B5, B6, B11.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi2-b5", batch: "B5", name: "Entity Identity & Structure", owner: "PDC", pi: "PI 2",
    startDate: "4/22", endDate: "4/30", status: "Complete" as StatusType,
    batchSummary: "Entity identity and structure. PDC governs all entity identity records.",
    governanceFocus: "Entity identity contract. PDC ownership boundary.",
    majorDependency: "B4 — AI Mapping.",
    readContractImpact: "B7 tax profile reads B5 entity identity contracts.",
    downstreamImpact: "B2A, B7, B8 PDC.",
    governance: ["Schema Published", "Contract Published", "Read Contract"],
    chainNote: "B5 → B7 (PI 2): Entity Identity required for Tax Profile & Eligibility",
  },
  {
    id: "pi2-b6", batch: "B6", name: "Practitioner Review & Adjustment Workflow", owner: "TDC", pi: "PI 2",
    startDate: "4/22", endDate: "4/30", status: "Complete" as StatusType,
    batchSummary: "Practitioner review and adjustment workflow. TDC governs all practitioner decisions.",
    governanceFocus: "Practitioner decision governance. Review lock enforcement.",
    majorDependency: "B4 — AI Mapping.",
    readContractImpact: "B10 return assembly requires B6 review lock.",
    downstreamImpact: "B7, B10.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
    chainNote: "B6 → B10 (PI 2): Practitioner Review Lock required for Return Assembly",
  },
  {
    id: "pi2-b2a", batch: "B2A", name: "Orchestrator Classification Result & Contract Enforcement", owner: "PDC", pi: "PI 2",
    startDate: "4/29", endDate: "5/9", status: "Complete" as StatusType,
    batchSummary: "Orchestrator classification result and contract enforcement. PDC enforces classification contracts.",
    governanceFocus: "Classification contract enforcement. Orchestrator boundary.",
    majorDependency: "B5 — Entity Identity.",
    readContractImpact: "B7 tax profile reads B2A classification contracts.",
    downstreamImpact: "B7, B8 PDC.",
    governance: ["Contract Published", "Schema Published", "Read Contract"],
  },
  {
    id: "pi2-b7", batch: "B7", name: "Client Tax Profile & Eligibility", owner: "TDC", pi: "PI 2",
    startDate: "5/1", endDate: "5/11", status: "Complete" as StatusType,
    batchSummary: "Client tax profile and eligibility. TDC governs all tax profile and eligibility determinations.",
    governanceFocus: "Tax profile governance. Eligibility determination authority.",
    majorDependency: "B2A, B5, B6 — Classification, Entity Identity, Review Lock.",
    readContractImpact: "B8 TDC exceptions read B7 eligibility contracts.",
    downstreamImpact: "B8 TDC, B10.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi2-b8-pdc", batch: "B8", name: "Exceptions & Remediation", owner: "PDC", pi: "PI 2",
    startDate: "5/12", endDate: "5/20", status: "Active",
    batchSummary: "Exceptions and remediation — PDC side. Exception records, remediation actions, re-ingestion triggers.",
    governanceFocus: "Exception record governance. Remediation action contract.",
    majorDependency: "B5 PDC, B2A — Entity Identity, Classification Contract.",
    readContractImpact: "B9 PDC reads B8 PDC exception clearance.",
    downstreamImpact: "B9 PDC.",
    governance: ["Contract Published", "Lineage Enabled"],
  },
  {
    id: "pi2-b8-tdc", batch: "B8", name: "Exceptions & Remediation", owner: "TDC", pi: "PI 2",
    startDate: "5/12", endDate: "5/20", status: "Active",
    batchSummary: "Exceptions and remediation — TDC side. Parallel with B8 PDC.",
    governanceFocus: "TDC exception governance. Remediation authority.",
    majorDependency: "B8 PDC — Exception Records.",
    readContractImpact: "B9 TDC reads B8 TDC exception clearance.",
    downstreamImpact: "B9 TDC.",
    governance: ["Contract Published", "Lineage Enabled"],
  },
  {
    id: "pi2-b9-pdc", batch: "B9", name: "Roger Gateway & Governed Consumer Access Layer", owner: "PDC", pi: "PI 2",
    startDate: "5/31", endDate: "6/12", status: "Committed",
    batchSummary: "Ocelot API gateway as the governed consumer surface. IMS, CEM, and TIM data surfaced via pass-through — surface-not-store. Roger and all consumers call the gateway, not underlying systems directly. ARCHITECTURAL CHANGE per v4_corrected.",
    governanceFocus: "Gateway Read Contract (versioned). No PDC storage of IMS/CEM/TIM data. Consumer surface governance.",
    majorDependency: "B8 PDC — Exceptions cleared.",
    readContractImpact: "All Roger consumers read via gateway contract. No direct system calls permitted.",
    downstreamImpact: "B10, B12, B16 PDC.",
    governance: ["Contract Published", "Read Contract", "Additive-Only"],
  },
  {
    id: "pi2-b9-tdc", batch: "B9", name: "Rollforward & Prior Year Intelligence — ON HOLD", owner: "TDC", pi: "PI 2",
    startDate: "TBD", endDate: "TBD", status: "Stretch",
    batchSummary: "ON HOLD per v4_corrected. Scope absorbed: existing-client rollforward queries TDC records directly; legacy-tool carry-forward lands via B31 TDC. Retained for governance traceability only.",
    governanceFocus: "ON HOLD — no active delivery. Absorbed by B31 TDC (PI 3 MVP).",
    majorDependency: "Absorbed by B31 TDC.",
    readContractImpact: "N/A — On Hold.",
    downstreamImpact: "B31 TDC absorbs scope.",
    governance: ["Lineage Enabled"],
  },
  {
    id: "pi2-b10", batch: "B10", name: "Return Assembly, Filing & Lineage Closure", owner: "TDC", pi: "PI 2",
    startDate: "6/3", endDate: "6/11", status: "Committed",
    batchSummary: "Return assembly, filing, and lineage closure. TDC governs all filing records.",
    governanceFocus: "Filing record authority. Lineage closure enforcement.",
    majorDependency: "B6 Review Lock, B9 PDC Gateway (consumer surface established).",
    readContractImpact: "B11 learning governance reads B10 filing lineage.",
    downstreamImpact: "B11.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi2-b11", batch: "B11", name: "Learning Governance & Model Evolution", owner: "TDC", pi: "PI 2",
    startDate: "6/12", endDate: "6/22", status: "Committed",
    batchSummary: "Learning governance and model evolution. TDC governs all learning signals and model promotion.",
    governanceFocus: "Learning signal governance. PromotionHash immutability. Human-controlled model evolution.",
    majorDependency: "B10 — Return Assembly complete.",
    readContractImpact: "B14 formula governance reads B11 learning contracts.",
    downstreamImpact: "B12, B14, B16 PDC, B24 PDC.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  // ── PI 2 — Stretch ───────────────────────────────────────────────────────────
  {
    id: "pi2s-b24-pdc", batch: "B24", name: "Advisory Opportunity Reference Data", owner: "PDC", pi: "PI 2 Stretch",
    startDate: "6/5", endDate: "6/15", status: "Stretch",
    batchSummary: "Advisory opportunity reference data — PDC governance framework, cross-LOB scoring rules, and ScoringFramework contracts.",
    governanceFocus: "Advisory governance framework. Cross-LOB scoring. SuppressionRule contracts.",
    majorDependency: "B11 — Learning Governance complete.",
    readContractImpact: "B25 PDC reads B24 PDC advisory reference contracts.",
    downstreamImpact: "B25 PDC, B24 TDC (PI 3).",
    governance: ["Contract Published", "Schema Published", "Read Contract"],
    chainNote: "B24 PDC (PI 2 Stretch) → B24 TDC (PI 3): Advisory Reference Data governance chain",
  },
  {
    id: "pi2s-b25-pdc", batch: "B25", name: "Advisory Opportunity Detection & Surfacing", owner: "PDC", pi: "PI 2 Stretch",
    startDate: "6/16", endDate: "6/24", status: "Stretch",
    batchSummary: "Advisory opportunity detection and surfacing — PDC consumer-initiated detection framework and OpportunityRecord contracts.",
    governanceFocus: "Consumer-initiated detection. OpportunityRecord governance. No autonomous background jobs.",
    majorDependency: "B24 PDC — Advisory Reference Data.",
    readContractImpact: "B25 TDC (PI 3) reads B25 PDC detection contracts.",
    downstreamImpact: "B25 TDC (PI 3).",
    governance: ["Contract Published", "Read Contract", "Lineage Enabled"],
    chainNote: "B25 PDC (PI 2 Stretch) → B25 TDC (PI 3): Detection & Surfacing governance chain",
  },
  {
    id: "pi2s-b16-pdc", batch: "B16", name: "Audit Trail & Lineage Governance", owner: "PDC", pi: "PI 2 Stretch",
    startDate: "6/25", endDate: "7/3", status: "Stretch",
    batchSummary: "Audit trail and lineage governance — PDC side. EventTypeCatalog, AccessLoggingRequirement, and disclosure logging contracts.",
    governanceFocus: "Audit trail immutability. EventTypeCatalog governance. Legal hold enforcement.",
    majorDependency: "B11 — Learning Governance.",
    readContractImpact: "B16 TDC (PI 3) reads B16 PDC audit contracts.",
    downstreamImpact: "B16 TDC (PI 3).",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
    chainNote: "B16 PDC (PI 2 Stretch) → B16 TDC (PI 3): Audit lineage governance chain",
  },
  // ── PI 3 ─────────────────────────────────────────────────────────────────────
  {
    id: "pi3-b14", batch: "B14", name: "Tax Computation Rules & Formula Governance", owner: "TDC", pi: "PI 3",
    startDate: "6/23", endDate: "7/1", status: "Planned",
    batchSummary: "Tax computation rules and formula governance. TDC governs all formula definitions and deterministic execution.",
    governanceFocus: "Formula registry governance. Deterministic execution. Effective dating.",
    majorDependency: "B11 — Learning Governance.",
    readContractImpact: "B15 provision reference reads B14 formula contracts.",
    downstreamImpact: "B15, B18.",
    governance: ["Contract Published", "Schema Published", "Immutable", "Read Contract"],
  },
  {
    id: "pi2s-b12", batch: "B12", name: "Engagement Identity, Reference Data & TIM Reconciliation", owner: "PDC", pi: "PI 2 Stretch",
    startDate: "6/25", endDate: "7/7", status: "Stretch",
    batchSummary: "Canonical EngagementId issuance and TIM identifier reconciliation API. TIM read pass-through moved to B9 gateway. Manual write surface dropped per v4_corrected. PDC is the single integration point for engagement identity.",
    governanceFocus: "EngagementId issuance authority. TIM reconciliation API governance. No manual write surface.",
    majorDependency: "B9 PDC Gateway — TIM pass-through established.",
    readContractImpact: "B13 platform reference reads B12 engagement identity contracts.",
    downstreamImpact: "B13.",
    governance: ["Contract Published", "Read Contract", "Additive-Only"],
  },
  {
    id: "pi3-b15", batch: "B15", name: "Tax Provision Reference Data & ASC 740 Authority", owner: "TDC", pi: "PI 3",
    startDate: "7/6", endDate: "7/14", status: "Planned",
    batchSummary: "Tax provision reference data and ASC 740 authority. TDC governs all provision reference data.",
    governanceFocus: "ASC 740 authority. Provision reference governance.",
    majorDependency: "B14 — Formula Governance.",
    readContractImpact: "B18 provision computation reads B15 reference contracts.",
    downstreamImpact: "B18.",
    governance: ["Contract Published", "Schema Published", "Immutable"],
  },
  {
    id: "pi3-b13", batch: "B13", name: "Platform Reference & Document Provenance", owner: "PDC", pi: "PI 3",
    startDate: "7/8", endDate: "7/16", status: "Planned",
    batchSummary: "Platform reference and document provenance. PDC governs all platform reference data and document lineage.",
    governanceFocus: "Document provenance governance. Platform reference authority.",
    majorDependency: "B12 — TIM Integration.",
    readContractImpact: "B22 client communication reads B13 reference contracts.",
    downstreamImpact: "B22 PDC.",
    governance: ["Contract Published", "Lineage Enabled", "Additive-Only"],
  },
  {
    id: "pi3-b18", batch: "B18", name: "Provision Computation, DTA/DTL & ETR Reconciliation", owner: "TDC", pi: "PI 3",
    startDate: "7/15", endDate: "7/23", status: "Planned",
    batchSummary: "Provision computation, DTA/DTL, and ETR reconciliation. TDC governs all provision computations.",
    governanceFocus: "Provision computation authority. DTA/DTL governance. ETR reconciliation.",
    majorDependency: "B15 — Provision Reference.",
    readContractImpact: "B19 provision workflow reads B18 computation contracts.",
    downstreamImpact: "B19.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "post-mvp-b22", batch: "B22", name: "Client Communication & Outstanding Items — Post-MVP", owner: "PDC", pi: "Post-MVP",
    startDate: "TBD", endDate: "TBD", status: "Planned",
    batchSummary: "POST-MVP per v4_corrected. Client communication and outstanding items. Parked pending MVP pilot completion (9/16). No active delivery until after pilot.",
    governanceFocus: "Post-MVP scope. Parked.",
    majorDependency: "MVP pilot completion (9/16).",
    readContractImpact: "TBD — Post-MVP.",
    downstreamImpact: "TBD.",
    governance: ["Contract Published"],
  },
  {
    id: "pi3-b19", batch: "B19", name: "Provision Workflow, Sign-Off & Cross-LOB Output", owner: "TDC", pi: "PI 3",
    startDate: "7/24", endDate: "8/3", status: "Planned",
    batchSummary: "Provision workflow, sign-off, and cross-LOB output. TDC governs all provision sign-off and cross-LOB outputs.",
    governanceFocus: "Sign-off authority. Cross-LOB output governance.",
    majorDependency: "B18 — Provision Computation.",
    readContractImpact: "B24 TDC advisory reads B19 provision workflow contracts.",
    downstreamImpact: "B24 TDC.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi3-b20", batch: "B20", name: "Firm Governance & Professional Standards", owner: "PDC", pi: "PI 3",
    startDate: "7/28", endDate: "8/5", status: "Planned",
    batchSummary: "Firm governance and professional standards. PDC governs all firm-level governance records.",
    governanceFocus: "Firm governance authority. Professional standards contract.",
    majorDependency: "B22 — Client Communication.",
    readContractImpact: "B21 PDC quality control reads B20 governance contracts.",
    downstreamImpact: "B21 PDC.",
    governance: ["Contract Published", "Schema Published"],
  },
  {
    id: "parked-b24-tdc", batch: "B24", name: "Advisory Opportunity Reference Data — Parked", owner: "TDC", pi: "Post-MVP",
    startDate: "TBD", endDate: "TBD", status: "Planned",
    batchSummary: "PARKED per v4_corrected — superseded by Blue J integration. Advisory reference data scope absorbed by Blue J. Retained for governance traceability.",
    governanceFocus: "Parked. Blue J supersedes this scope.",
    majorDependency: "Blue J integration (supersedes).",
    readContractImpact: "N/A — Parked.",
    downstreamImpact: "None — Blue J absorbs scope.",
    governance: ["Contract Published"],
  },
  {
    id: "pi3-b21-pdc", batch: "B21", name: "Quality Control (PDC MVP)", owner: "PDC", pi: "PI 3",
    startDate: "8/6", endDate: "8/14", status: "Planned",
    batchSummary: "Quality control — PDC MVP scope only per v4_corrected. TDC QC is Post-MVP. PDC governs all quality control records and review standards for MVP pilot.",
    governanceFocus: "Quality control authority (PDC MVP only). TDC QC deferred to Post-MVP.",
    majorDependency: "B20 — Firm Governance.",
    readContractImpact: "Post-MVP: B21 TDC reads B21 PDC quality control contracts.",
    downstreamImpact: "B21 TDC (Post-MVP).",
    governance: ["Contract Published", "Schema Published"],
    chainNote: "B21 PDC (PI 3 MVP) → B21 TDC (Post-MVP): Quality Control chain",
  },
  {
    id: "parked-b25-tdc", batch: "B25", name: "Advisory Opportunity Detection & Surfacing — Parked", owner: "TDC", pi: "Post-MVP",
    startDate: "TBD", endDate: "TBD", status: "Planned",
    batchSummary: "PARKED per v4_corrected — superseded by Blue J integration. Advisory detection scope absorbed by Blue J. Retained for governance traceability only.",
    governanceFocus: "Parked. Blue J supersedes this scope.",
    majorDependency: "Blue J integration (supersedes).",
    readContractImpact: "N/A — Parked.",
    downstreamImpact: "None — Blue J absorbs scope.",
    governance: ["Contract Published"],
  },
  {
    id: "post-mvp-b23", batch: "B23", name: "Benchmark & Peer Analytics — Post-MVP", owner: "PDC", pi: "Post-MVP",
    startDate: "TBD", endDate: "TBD", status: "Planned",
    batchSummary: "POST-MVP per v4_corrected. Benchmark and peer analytics. Parked pending MVP pilot completion.",
    governanceFocus: "Post-MVP scope. Parked.",
    majorDependency: "MVP pilot completion (9/16).",
    readContractImpact: "TBD — Post-MVP.",
    downstreamImpact: "TBD.",
    governance: ["Contract Published", "Additive-Only"],
  },
  {
    id: "pi3-b17", batch: "B17", name: "Decision Support — Overrides, Evidence & Workpapers", owner: "TDC", pi: "PI 3",
    startDate: "8/24", endDate: "9/1", status: "Planned",
    batchSummary: "Decision support — overrides, evidence, and workpapers. TDC governs all override and evidence records.",
    governanceFocus: "Override authority. Evidence record governance. Workpaper lineage.",
    majorDependency: "B25 TDC — Advisory Detection.",
    readContractImpact: "B16 TDC audit reads B17 override contracts.",
    downstreamImpact: "B16 TDC.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi3-b16-tdc", batch: "B16", name: "Audit Trail & Lineage Governance", owner: "TDC", pi: "PI 3",
    startDate: "9/2", endDate: "9/11", status: "Planned",
    batchSummary: "Audit trail and lineage governance — TDC side. Canonical audit lineage, disclosure logging, legal hold enforcement.",
    governanceFocus: "Canonical audit lineage. Disclosure logging. Legal hold enforcement. READ_CONTRACT_PUBLISHED events.",
    majorDependency: "B17 TDC — Decision Support. B16 PDC (PI 2 Stretch).",
    readContractImpact: "B21 TDC (PI 4) reads B16 TDC audit contracts.",
    downstreamImpact: "B21 TDC (PI 4).",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
    chainNote: "Follows B16 PDC (PI 2 Stretch, 6/25–7/3)",
  },
  // ── PI 3 MVP — New Batches (v4_corrected) ───────────────────────────────────
  {
    id: "pi3-b28", batch: "B28", name: "Tax Workpaper & Provision Schedules", owner: "TDC", pi: "PI 3",
    startDate: "7/15", endDate: "8/3", status: "Planned",
    batchSummary: "Tax workpaper and provision schedules. Absorbs MVP slices of B14 (reconciliation formulas, depreciation rules) and B15 (provision reference data). TDC governs all workpaper and schedule records.",
    governanceFocus: "Workpaper lineage. Provision schedule authority. MVP slice absorption from B14/B15.",
    majorDependency: "B11 Learning Governance. B14/B15 MVP slices absorbed.",
    readContractImpact: "B29 consolidated return reads B28 workpaper contracts.",
    downstreamImpact: "B29 TDC.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi3-b29", batch: "B29", name: "Consolidated Return Assembly", owner: "TDC", pi: "PI 3",
    startDate: "8/4", endDate: "8/21", status: "Planned",
    batchSummary: "Consolidated return assembly. Assembles tax returns from locked workpaper and provision schedule records. TDC governs all consolidated return records.",
    governanceFocus: "Consolidated return authority. Assembly lineage. Filing record governance.",
    majorDependency: "B28 TDC — Workpaper & Provision Schedules.",
    readContractImpact: "B39 calculation report reads B29 consolidated return contracts.",
    downstreamImpact: "B39 TDC (MVP).",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi3-b31", batch: "B31", name: "Legacy Tool Prior Year Ingestion", owner: "TDC", pi: "PI 3",
    startDate: "7/3", endDate: "7/21", status: "Planned",
    batchSummary: "Legacy tool prior year ingestion. Absorbs B9 TDC On Hold scope: legacy-tool carry-forward data ingestion. Existing-client rollforward queries TDC records directly.",
    governanceFocus: "Legacy ingestion governance. Prior year data authority. Absorbs B9 TDC On Hold scope.",
    majorDependency: "B9 PDC Gateway. B9 TDC On Hold — scope absorbed here.",
    readContractImpact: "B28 TDC workpaper reads B31 prior year ingestion contracts.",
    downstreamImpact: "B28 TDC.",
    governance: ["Contract Published", "Lineage Enabled", "Additive-Only"],
  },
  {
    id: "pi3-b33", batch: "B33", name: "State Tax — Apportionment, NOL & Forms", owner: "TDC", pi: "PI 3",
    startDate: "8/22", endDate: "9/8", status: "Planned",
    batchSummary: "State tax apportionment, NOL tracking, and state form generation. TDC governs all state tax records.",
    governanceFocus: "State tax authority. Apportionment governance. NOL tracking. State form lineage.",
    majorDependency: "B29 TDC — Consolidated Return Assembly.",
    readContractImpact: "B39 calculation report reads B33 state tax contracts.",
    downstreamImpact: "B39 TDC (MVP).",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  {
    id: "pi3-b26", batch: "B26", name: "Entity Constituents & Allocations (MVP)", owner: "PDC", pi: "PI 3",
    startDate: "7/3", endDate: "7/21", status: "Planned",
    batchSummary: "Entity constituent records and allocation logic. PDC governs all constituent and allocation data. Promoted to MVP per v4_corrected.",
    governanceFocus: "Constituent record authority. Allocation governance. PDC boundary.",
    majorDependency: "B11 Learning Governance. B12 Engagement Identity.",
    readContractImpact: "B28 TDC workpaper reads B26 allocation contracts.",
    downstreamImpact: "B28 TDC.",
    governance: ["Contract Published", "Schema Published", "Read Contract"],
  },
  {
    id: "pi3-b39", batch: "B39", name: "Calculation Report (MVP Promoted)", owner: "TDC", pi: "PI 3",
    startDate: "9/2", endDate: "9/15", status: "Planned",
    batchSummary: "Calculation report — promoted to MVP per v4_corrected. Must land before 9/16 pilot start. Assembles final calculation output from B29 and B33. TDC governs all calculation report records.",
    governanceFocus: "Calculation report authority. MVP pilot gate (9/16). Final output lineage.",
    majorDependency: "B29 TDC Consolidated Return. B33 TDC State Tax.",
    readContractImpact: "Final consumer-facing output. Roger reads via gateway contract.",
    downstreamImpact: "Roger MVP pilot (9/16 start).",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
  },
  // ── Post-MVP / Parked ─────────────────────────────────────────────────────────
  // ── PI 4 — Program Close ─────────────────────────────────────────────────────
  {
    id: "pi4-b21-tdc", batch: "B21", name: "Quality Control Review Records", owner: "TDC", pi: "PI 4",
    startDate: "9/14", endDate: "9/22", status: "Program Close",
    batchSummary: "Quality control review records — program close. Final QC review records and sign-off.",
    governanceFocus: "QC review record authority. Program close governance.",
    majorDependency: "B16 TDC — Audit Trail. B21 PDC (PI 3).",
    readContractImpact: "Program close — no further downstream dependencies.",
    downstreamImpact: "None — program close.",
    governance: ["Contract Published", "Lineage Enabled", "Immutable"],
    chainNote: "Follows B21 PDC (PI 3, 8/6–8/14) — program close",
  },
];

// ─── PI GROUP DEFINITIONS ─────────────────────────────────────────────────────
const PI_GROUPS: { label: string; pi: string; color: string; bg: string; border: string; summary: string }[] = [
  {
    label: "PI 1 — Complete",
    pi: "PI 1",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    summary: "Foundation, ingestion, normalization, and tax domain authority. All batches complete.",
  },
  {
    label: "PI 2 — Committed",
    pi: "PI 2",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    summary: "AI mapping, entity identity, practitioner review, eligibility, exceptions, IMS integration, return assembly, and learning governance.",
  },
  {
    label: "PI 2 — Stretch",
    pi: "PI 2 Stretch",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    summary: "Engagement Identity & TIM Reconciliation (B12 PDC), Audit Trail & Lineage Governance (B16 PDC), Entity Constituents & Allocations (B26 PDC), Legacy Tool Prior Year Ingestion (B31 TDC). Opportunistic — non-blocking.",
  },
  {
    label: "PI 3",
    pi: "PI 3",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    summary: "PI 3 MVP: B14 TDC, B15 TDC, B17 TDC, B18 TDC, B19 TDC, B20 PDC, B21 PDC (MVP only), B26 PDC, B28 TDC, B29 TDC, B31 TDC, B33 TDC, B39 TDC (MVP Promoted). B22/B23/B24/B25 are Post-MVP or Parked per v4_corrected.",
  },
  {
    label: "PI 4 — Program Close",
    pi: "PI 4",
    color: "#475569",
    bg: "#f8fafc",
    border: "#e2e8f0",
    summary: "Quality control review records — program close.",
  },
  {
    label: "Post-MVP / Parked",
    pi: "Post-MVP",
    color: "#9f1239",
    bg: "#fff1f2",
    border: "#fecdd3",
    summary: "B22 PDC (Client Communication), B23 PDC (Benchmark Analytics), B24 TDC (Advisory Reference — superseded by Blue J), B25 TDC (Advisory Detection — superseded by Blue J). Parked pending MVP pilot completion (9/16) or superseded by integration.",
  },
];

// ─── EPIC INDEX DATA ──────────────────────────────────────────────────────────
const EPIC_INDEX: { batch: string; name: string; features: string }[] = [
  { batch: "FC",  name: "Foundation Core",                                      features: "Foundation Core (Platform, PI 1)" },
  { batch: "B1",  name: "File Ingestion & Initial Storage",                     features: "File Ingestion & Initial Storage (PDC, PI 1)" },
  { batch: "B2",  name: "Normalization & Cross-LOB Taxonomy",                   features: "Normalization & Cross-LOB Taxonomy (PDC, PI 1) → Orchestrator Classification Result & Contract Enforcement (PDC, PI 2, 4/29–5/9)" },
  { batch: "B3",  name: "Tax Domain Authority & Tax Taxonomy",                  features: "Tax Domain Authority & Tax Taxonomy (TDC, PI 1)" },
  { batch: "B4",  name: "AI Mapping Proposals, Decisions & Governance",         features: "AI Mapping Proposals, Decisions & Governance (TDC, PI 2, complete)" },
  { batch: "B5",  name: "Entity Identity & Structure",                          features: "Entity Identity & Structure (PDC, PI 2, complete, 4/22–4/30)" },
  { batch: "B6",  name: "Practitioner Review, Adjustments & Lock",              features: "Practitioner Review & Adjustment Workflow (TDC, PI 2, complete, 4/22–4/30)" },
  { batch: "B7",  name: "Client Tax Profile & Eligibility",                     features: "Client Tax Profile & Eligibility (TDC, PI 2, complete, 5/1–5/11)" },
  { batch: "B8",  name: "Exceptions & Remediation",                             features: "Exceptions & Remediation (PDC, PI 2, 5/12–5/20) + Exceptions & Remediation (TDC, PI 2, 5/12–5/20)" },
  { batch: "B9",  name: "Roger Gateway & Governed Consumer Access Layer",         features: "Roger Gateway & Governed Consumer Access Layer (PDC, PI 2, 5/31–6/12) + TDC B9 Rollforward ON HOLD — absorbed by B31 (PI 3 MVP)" },
  { batch: "B10", name: "Return Assembly, Filing & Lineage Closure",            features: "Return Assembly, Filing & Lineage Closure (TDC, PI 2, 6/3–6/11)" },
  { batch: "B11", name: "Learning Governance & Model Evolution",                features: "Learning Governance & Model Evolution (TDC, PI 2, 6/12–6/22)" },
  { batch: "B12", name: "Engagement Identity, Reference Data & TIM Reconciliation", features: "Engagement Identity, Reference Data & TIM Reconciliation (PDC, PI 2 Stretch, 6/25–7/7)" },
  { batch: "B13", name: "Platform Reference & Document Provenance",             features: "Platform Reference & Document Provenance (PDC, PI 3, 7/8–7/16)" },
  { batch: "B14", name: "Tax Computation Rules & Formula Governance",           features: "Tax Computation Rules & Formula Governance (TDC, PI 3, 6/23–7/1)" },
  { batch: "B15", name: "Tax Provision Reference Data & ASC 740 Authority",     features: "Tax Provision Reference Data & ASC 740 Authority (TDC, PI 3, 7/6–7/14)" },
  { batch: "B16", name: "Audit Trail & Lineage Governance",                     features: "Audit Trail & Lineage Governance (PDC, PI 2 Stretch, 6/25–7/3) → Audit Trail & Lineage Governance (TDC, PI 3, 9/2–9/11)" },
  { batch: "B17", name: "Decision Support — Overrides, Evidence & Workpapers",  features: "Decision Support — Overrides, Evidence & Workpapers (TDC, PI 3, 8/24–9/1)" },
  { batch: "B18", name: "Provision Computation, DTA/DTL & ETR Reconciliation",  features: "Provision Computation, DTA/DTL & ETR Reconciliation (TDC, PI 3, 7/15–7/23)" },
  { batch: "B19", name: "Provision Workflow, Sign-Off & Cross-LOB Output",      features: "Provision Workflow, Sign-Off & Cross-LOB Output (TDC, PI 3, 7/24–8/3)" },
  { batch: "B20", name: "Firm Governance & Professional Standards",             features: "Firm Governance & Professional Standards (PDC, PI 3, 7/28–8/5)" },
  { batch: "B21", name: "Quality Control",                                      features: "Quality Control Standards (PDC, PI 3, 8/6–8/14) → Quality Control Review Records (TDC, PI 4, 9/14–9/22)" },
  { batch: "B22", name: "Client Communication & Outstanding Items",             features: "Client Communication & Outstanding Items (PDC, PI 3, 7/17–7/27)" },
  { batch: "B23", name: "Benchmark & Peer Analytics",                           features: "Benchmark & Peer Analytics (PDC, PI 3, 8/17–8/25)" },
  { batch: "B24", name: "Advisory Opportunity Reference Data",                  features: "Advisory Opportunity Reference Data (PDC, PI 2 Stretch, 6/5–6/15) → Advisory Opportunity Reference Data (TDC, PI 3, 8/4–8/12)" },
  { batch: "B25", name: "Advisory Opportunity Detection & Surfacing",           features: "Advisory Opportunity Detection & Surfacing (PDC, PI 2 Stretch, 6/16–6/24) → Advisory Opportunity Detection & Surfacing (TDC, PI 3, 8/13–8/21)" },
];

// ─── FEATURE ROW COMPONENT ────────────────────────────────────────────────────
function FeatureCard({ feature, isExpanded, onToggle }: {
  feature: FeatureRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusCfg = STATUS_CFG[feature.status];
  const ownerCfg = OWNER_CFG[feature.owner];

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderLeft: `4px solid ${statusCfg.dot}`,
      borderRadius: "8px",
      overflow: "hidden",
    }}>
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          padding: "11px 14px", textAlign: "left", background: "none", border: "none",
          cursor: "pointer",
        }}
      >
        {/* Batch badge */}
        <span style={{
          fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "5px",
          backgroundColor: ownerCfg.bg, color: ownerCfg.color, border: `1px solid ${ownerCfg.border}`,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {feature.batch}
        </span>

        {/* Feature name */}
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1, minWidth: 0 }}>
          {feature.name}
        </span>

        {/* Owner badge */}
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px",
          backgroundColor: ownerCfg.bg, color: ownerCfg.color, border: `1px solid ${ownerCfg.border}`,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {feature.owner}
        </span>

        {/* Date range */}
        {feature.startDate && (
          <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
            {feature.startDate} → {feature.endDate}
          </span>
        )}

        {/* Status badge */}
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px",
          backgroundColor: feature.status === "Complete" ? "#f0fdf4" :
            feature.status === "Committed" || feature.status === "Active" ? "#eff6ff" :
            feature.status === "Stretch" ? "#fff7ed" :
            feature.status === "Program Close" ? "#f5f3ff" : "#f8fafc",
          color: statusCfg.dot,
          border: `1px solid ${feature.status === "Complete" ? "#bbf7d0" :
            feature.status === "Committed" || feature.status === "Active" ? "#bfdbfe" :
            feature.status === "Stretch" ? "#fed7aa" :
            feature.status === "Program Close" ? "#ddd6fe" : "#e2e8f0"}`,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {feature.status}
        </span>

        {/* Governance indicators (compact) */}
        <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
          {feature.governance.slice(0, 3).map(g => {
            const gi = GOV_INDICATORS[g];
            if (!gi) return null;
            return (
              <span key={g} title={g} style={{
                fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px",
                backgroundColor: gi.bg, color: gi.color, border: `1px solid ${gi.border}`,
                whiteSpace: "nowrap",
              }}>
                {g.split(" ")[0]}
              </span>
            );
          })}
          {feature.governance.length > 3 && (
            <span style={{ fontSize: "9px", color: "#94a3b8" }}>+{feature.governance.length - 3}</span>
          )}
        </div>

        {isExpanded
          ? <ChevronDown style={{ width: "13px", height: "13px", color: "#94a3b8", flexShrink: 0 }} />
          : <ChevronRight style={{ width: "13px", height: "13px", color: "#94a3b8", flexShrink: 0 }} />
        }
      </button>

      {/* Expanded hover summary */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "12px 16px 14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              {/* Chain note */}
              {feature.chainNote && (
                <div style={{
                  backgroundColor: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: "6px", padding: "7px 12px",
                  fontSize: "11px", color: "#78350f", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <ArrowRight style={{ width: "11px", height: "11px", flexShrink: 0 }} />
                  {feature.chainNote}
                </div>
              )}

              {/* Summary grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "9px 12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "4px" }}>Batch Summary</div>
                  <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{feature.batchSummary}</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "9px 12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "4px" }}>Key Governance Focus</div>
                  <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{feature.governanceFocus}</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "9px 12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "4px" }}>Major Dependency</div>
                  <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{feature.majorDependency}</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "9px 12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "4px" }}>Downstream Impact</div>
                  <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{feature.downstreamImpact}</div>
                </div>
              </div>

              {/* Read contract impact */}
              <div style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "6px", padding: "8px 12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5b21b6", marginBottom: "3px" }}>Read Contract Impact</div>
                <div style={{ fontSize: "12px", color: "#3730a3", lineHeight: "1.5" }}>{feature.readContractImpact}</div>
              </div>

              {/* All governance indicators */}
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {feature.governance.map(g => {
                  const gi = GOV_INDICATORS[g];
                  if (!gi) return null;
                  return (
                    <span key={g} style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px",
                      backgroundColor: gi.bg, color: gi.color, border: `1px solid ${gi.border}`,
                    }}>
                      {gi.label}
                    </span>
                  );
                })}
              </div>

              {/* Detail link */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href={`/batch/${feature.batch.replace("B", "").replace("FC", "fc")}`}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    fontSize: "11px", fontWeight: 700, color: "#1e40af",
                    backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                    borderRadius: "6px", padding: "5px 12px", cursor: "pointer",
                  }}>
                    View Batch Detail
                    <ArrowRight style={{ width: "11px", height: "11px" }} />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BatchRoadmap() {
  const [expanded, setExpanded] = useState<string>("");
  const [showEpicIndex, setShowEpicIndex] = useState(false);
  const [showDeps, setShowDeps] = useState(false);

  const toggle = (id: string) => setExpanded(prev => prev === id ? "" : id);

  // Stats
  const totalFeatures = FEATURES.length;
  const completedFeatures = FEATURES.filter(f => f.status === "Complete").length;
  const activeFeatures = FEATURES.filter(f => f.status === "Active" || f.status === "Committed").length;

  return (
    <div style={{ padding: "24px 28px", maxWidth: "980px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Governance Banner ── */}
      <GovernanceBanner />

      {/* ── Architecture Reference Banner ── */}
      <div style={{
        backgroundColor: "#1e3a5f", color: "white",
        borderRadius: "10px", padding: "14px 20px", marginBottom: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
      }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#93c5fd", marginBottom: "4px" }}>
            Architecture Reference: DCT Delivery Schedule / Epic Mapping (Non-Production)
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>
            Batch Calendar — DCT Platform Delivery
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
            Last updated: May 12, 2026 · Reference: DCT Batch Roadmap (Architecture Visualization — Non-Production)
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#34d399" }}>{completedFeatures}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Completed Features</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#60a5fa" }}>{activeFeatures}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Active Features</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "white" }}>{totalFeatures}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Total Features</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24" }}>PI 2</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Currently in Execution</div>
          </div>
        </div>
      </div>

      {/* ── How to Read This Page ── */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "14px 18px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px" }}>
          How to Read This Page
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "12px", color: "#475569" }}>
          {[
            { icon: "📦", text: "Features are the unit of delivery — each Feature has a defined window, scope (PDC or TDC), and governance indicators." },
            { icon: "📋", text: "Features roll up to Epics (Batches) for context — see the Epic Index at the bottom." },
            { icon: "🗂️", text: "Features are grouped by PI and collapsed by default — click any row to expand the full governance summary." },
            { icon: "🔵", text: "PDC (Phoenix Data Consolidation) owns financial data consolidation. TDC (Tax Data Consolidation) owns tax decisions and filing authority." },
            { icon: "📅", text: "Date ranges represent planned delivery windows from the architecture reference schedule. Authoritative scheduling is maintained in ADO outside this workspace." },
            { icon: "🔗", text: "Cross-batch dependencies show where one Feature's output is required as input for another Feature." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ lineHeight: "1.5" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cross-Batch Dependency Visualization ── */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "10px", marginBottom: "16px", overflow: "hidden",
      }}>
        <button
          onClick={() => setShowDeps(d => !d)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 18px", background: "none", border: "none", cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
            Cross-Batch Dependency Map
          </div>
          {showDeps
            ? <ChevronDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
            : <ChevronRight style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
          }
        </button>
        <AnimatePresence>
          {showDeps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {CROSS_BATCH_DEPS.map((dep, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    backgroundColor: "#f8fafc", borderRadius: "6px", padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px",
                      backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                      whiteSpace: "nowrap",
                    }}>
                      {dep.from}
                    </span>
                    <ArrowRight style={{ width: "12px", height: "12px", color: "#94a3b8", flexShrink: 0 }} />
                    <span style={{
                      fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px",
                      backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
                      whiteSpace: "nowrap",
                    }}>
                      {dep.to}
                    </span>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{dep.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PI Sections ── */}
      {PI_GROUPS.map(group => {
        const groupFeatures = FEATURES.filter(f => f.pi === group.pi);
        return (
          <div key={group.pi} style={{ marginBottom: "20px" }}>
            {/* PI header */}
            <div style={{
              backgroundColor: group.bg, border: `1px solid ${group.border}`,
              borderRadius: "10px 10px 0 0", padding: "12px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: group.color }}>{group.label}</div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px", lineHeight: "1.5" }}>{group.summary}</div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: "white", color: group.color, border: `1px solid ${group.border}`,
                }}>
                  {groupFeatures.length} Feature{groupFeatures.length !== 1 ? "s" : ""}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: "white", color: "#059669", border: "1px solid #bbf7d0",
                }}>
                  {groupFeatures.filter(f => f.status === "Complete").length} Complete
                </span>
              </div>
            </div>

            {/* Feature rows */}
            <div style={{
              border: `1px solid ${group.border}`, borderTop: "none",
              borderRadius: "0 0 10px 10px", overflow: "hidden",
              display: "flex", flexDirection: "column", gap: "1px",
              backgroundColor: "#f1f5f9",
            }}>
              {groupFeatures.map(feature => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isExpanded={expanded === feature.id}
                  onToggle={() => toggle(feature.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Epic Index ── */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "10px", marginBottom: "16px", overflow: "hidden",
      }}>
        <button
          onClick={() => setShowEpicIndex(e => !e)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f1623" }}>Epic Index</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Reference: which Features make up each Epic (Batch), in delivery order.
            </div>
          </div>
          {showEpicIndex
            ? <ChevronDown style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
            : <ChevronRight style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
          }
        </button>
        <AnimatePresence>
          {showEpicIndex && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 18px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {EPIC_INDEX.map(epic => (
                    <div key={epic.batch} style={{
                      display: "flex", gap: "10px", alignItems: "flex-start",
                      padding: "8px 12px", borderRadius: "6px",
                      backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                    }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px",
                        backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {epic.batch}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {epic.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                        — {epic.features}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginTop: "4px",
        display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>See also:</span>
        {[
          { label: "DCT Delivery Model", path: "/" },
          { label: "Control Panel", path: "/control-panel" },
          { label: "Gate Status", path: "/gate-status" },
          { label: "Batch Delivery Calendar", path: "/batch-delivery-calendar" },
        ].map(l => (
          <Link key={l.path} href={l.path}>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#2563eb",
              border: "1px solid #bfdbfe", borderRadius: "6px",
              padding: "3px 8px", cursor: "pointer",
              backgroundColor: "#eff6ff", display: "inline-block",
            }}>
              {l.label} →
            </span>
          </Link>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>
          DCT Delivery Model · Batch Calendar v3.0 · Source: ADO Wiki
        </span>
      </div>
    </div>
  );
}

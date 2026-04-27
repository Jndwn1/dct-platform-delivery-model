// ─────────────────────────────────────────────────────────────────────────────
// Weekly Demo Simulator — DCT Platform Data Flow Simulation
// PROTECTION RULE: This screen must NOT be removed or structurally altered.
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// Layout: Top controls bar → 5-node horizontal system flow →
//         System Events log (left) + Data State / API Proof / Demo Readiness (right)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ChevronRight, ChevronLeft, BarChart2, Mic, GitCompare,
  CheckCircle2, Clock, AlertCircle, Zap,
  Database, Network, FileText, ArrowRight,
  Play, RotateCcw, Shield
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type NodeStatus = "Complete" | "Processing" | "Pending" | "Decision Workflow Active" | "Gap";
type Readiness  = "Ready" | "Partial" | "Blocked";
type FeatureStatus = "Complete" | "Dev" | "Blocked" | "Planned";
type ApiMethod = "GET" | "POST" | "PUT";
type ApiSystem = "PDC" | "Orchestrator" | "TDC";

interface FlowNode {
  id: string;
  label: string;
  sub: string;
  system: "Portal" | "PDC" | "Orchestrator" | "TDC" | "Output";
  status: NodeStatus;
}

interface ApiEndpoint {
  method: ApiMethod;
  path: string;
  desc: string;
  system: ApiSystem;
}

interface BatchDemoData {
  name: string;
  shortName: string;
  readiness: Readiness;
  readinessDetail: string;
  runId: string;
  agentChain: string;
  status: string;
  target: string;
  totalSteps: number;
  events: { time: string; msg: string }[];
  apis: ApiEndpoint[];
  features: { id: string; label: string; status: FeatureStatus }[];
  flowNodes: FlowNode[];
}

// ─── BATCH DATA ───────────────────────────────────────────────────────────────

const BATCH_DATA: Record<string, BatchDemoData> = {
  "1": {
    name: "Batch 1 — File Ingestion & Initial Storage",
    shortName: "Batch 1 — File Ingestion",
    readiness: "Ready",
    readinessDetail: "PDC, APIs, Schema Lock available",
    runId: "RUN-20240315-0041",
    agentChain: "Ingest → Validate",
    status: "INGESTING",
    target: "PDC — Source Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Schema recognition triggered" },
      { time: "12:10:50 PM", msg: "Schema: Trial Balance — PASS" },
      { time: "12:10:50 PM", msg: "SourceRecord table populated" },
      { time: "12:10:50 PM", msg: "Validation complete — 1,842 records" },
    ],
    apis: [
      { method: "POST", path: "/ingest/job", desc: "Create ingestion job in PDC", system: "PDC" },
      { method: "GET",  path: "/schema/recognize/{fileId}", desc: "Run AI schema recognition", system: "Orchestrator" },
      { method: "GET",  path: "/ingest/{jobId}/status", desc: "Check ingestion job status", system: "PDC" },
    ],
    features: [
      { id: "DCT-101", label: "File intake via Tax Portal", status: "Complete" },
      { id: "DCT-102", label: "Schema recognition (AI)", status: "Complete" },
      { id: "DCT-103", label: "SourceRecord persistence in PDC", status: "Complete" },
      { id: "DCT-104", label: "G1 Schema Lock Certificate", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Processing" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "2": {
    name: "Batch 2 — Normalization & Cross-LOB Taxonomy",
    shortName: "Batch 2 — Normalization",
    readiness: "Ready",
    readinessDetail: "PDC, AI Orchestrator, APIs available",
    runId: "RUN-20240315-0042",
    agentChain: "Ingest → Normalize → Map → Validate",
    status: "NORMALIZING",
    target: "PDC — Normalized Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Normalization pipeline triggered" },
      { time: "12:10:38 PM", msg: "Status: PROCESSING → READY" },
      { time: "12:10:50 PM", msg: "Agent chain executing" },
      { time: "12:10:50 PM", msg: "Normalization event dispatched" },
      { time: "12:10:50 PM", msg: "Cross-LOB taxonomy mapping initiated" },
      { time: "12:10:50 PM", msg: "TDC handoff queued" },
    ],
    apis: [
      { method: "GET",  path: "/normalized/{runId}/facts",     desc: "Confirm normalized output ready for TDC", system: "PDC" },
      { method: "POST", path: "/orchestration/dispatch",       desc: "Dispatch agent chain to TDC",            system: "Orchestrator" },
      { method: "GET",  path: "/orchestration/{runId}/log",    desc: "Retrieve agent execution log",           system: "Orchestrator" },
    ],
    features: [
      { id: "DCT-201", label: "Normalization pipeline (AI)", status: "Complete" },
      { id: "DCT-202", label: "Cross-LOB taxonomy mappings", status: "Complete" },
      { id: "DCT-203", label: "NormalizedRecord table in PDC", status: "Dev" },
      { id: "DCT-204", label: "Contract publication (vNormalizedTb)", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Processing" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "2a": {
    name: "Batch 2A — Orchestrator Contract Enforcement & Classification",
    shortName: "Batch 2A — Contract Enforcement",
    readiness: "Partial",
    readinessDetail: "Classification enforcement rule defined; audit log and rejection demo pending",
    runId: "RUN-20240315-002A",
    agentChain: "Ingest → Validate Classification → Reject or Accept → Persist",
    status: "VALIDATING",
    target: "PDC — Classification Enforcement Layer",
    totalSteps: 4,
    events: [
      { time: "12:10:38 PM", msg: "Orchestrator response received by PDC" },
      { time: "12:10:39 PM", msg: "Validation: checking FirmTaxonomyId on all records" },
      { time: "12:10:40 PM", msg: "REJECTED: FirmTaxonomyId missing on 3 records" },
      { time: "12:10:40 PM", msg: "Rejection logged with RunId, EntityId, PeriodStart, reason" },
      { time: "12:10:41 PM", msg: "Audit log entry created — traceable and queryable" },
      { time: "12:10:42 PM", msg: "Orchestrator notified: resubmission required" },
      { time: "12:10:50 PM", msg: "Resubmission received — FirmTaxonomyId present on all records" },
      { time: "12:10:51 PM", msg: "ACCEPTED: all records persisted with FirmTaxonomyId at record level" },
    ],
    apis: [
      { method: "POST", path: "/api/pdc/orchestrator/validate",         desc: "Submit Orchestrator response for classification validation", system: "PDC" },
      { method: "GET",  path: "/api/pdc/orchestrator/audit-log/{runId}", desc: "Retrieve classification validation audit log",              system: "PDC" },
      { method: "GET",  path: "/api/pdc/normalized-tb",                  desc: "Confirm classified normalized records are queryable",        system: "PDC" },
    ],
    features: [
      { id: "DCT-2A01", label: "FirmTaxonomyId enforcement rule",    status: "Dev" },
      { id: "DCT-2A02", label: "Deterministic rejection logic",       status: "Dev" },
      { id: "DCT-2A03", label: "Classification audit log",            status: "Planned" },
      { id: "DCT-2A04", label: "Bulk insert vs upsert strategy",      status: "Planned" },
    ],
    flowNodes: [
      { id: "portal",   label: "Tax Portal",    sub: "File Intake",         system: "Portal",       status: "Complete" },
      { id: "pdc",      label: "PDC",           sub: "Financial Truth",      system: "PDC",          status: "Processing" },
      { id: "orch",     label: "Orchestrator",  sub: "Classification Owner", system: "Orchestrator", status: "Gap" as NodeStatus },
      { id: "validate", label: "Validation",    sub: "Enforce FirmTaxId",    system: "PDC",          status: "Processing" },
      { id: "out",      label: "Output",        sub: "Roger (Read-Only)",    system: "Output",       status: "Pending" },
    ],
  },
  "3": {
    name: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    shortName: "Batch 3 — Tax Domain Authority",
    readiness: "Ready",
    readinessDetail: "TDC, PDC, APIs available",
    runId: "RUN-20240315-0042",
    agentChain: "Ingest → Normalize → Map → Validate",
    status: "ROUTING",
    target: "TDC Tax Domain",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Normalization pipeline triggered" },
      { time: "12:10:38 PM", msg: "Status: PROCESSING → READY" },
      { time: "12:10:50 PM", msg: "Agent chain executing" },
      { time: "12:10:50 PM", msg: "Normalization event dispatched" },
      { time: "12:10:50 PM", msg: "Cross-LOB taxonomy mapping initiated" },
      { time: "12:10:50 PM", msg: "TDC handoff queued" },
    ],
    apis: [
      { method: "GET",  path: "/normalized/{runId}/facts",   desc: "Confirm normalized output ready for TDC", system: "PDC" },
      { method: "POST", path: "/orchestration/dispatch",     desc: "Dispatch agent chain to TDC",            system: "Orchestrator" },
      { method: "GET",  path: "/orchestration/{runId}/log",  desc: "Retrieve agent execution log",           system: "Orchestrator" },
    ],
    features: [
      { id: "DCT-301", label: "TDC schema established", status: "Complete" },
      { id: "DCT-302", label: "Tax taxonomy loaded", status: "Complete" },
      { id: "DCT-303", label: "TaxMapping table created", status: "Dev" },
      { id: "DCT-304", label: "G2 Invariant Lock Certificate", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Processing" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "4": {
    name: "Batch 4 — AI Mapping Proposals, Decisions & Governance",
    shortName: "Batch 4 — AI Tax Mapping",
    readiness: "Ready",
    readinessDetail: "TDC, AI Mapping Layer, Governed Contract, APIs available",
    runId: "RUN-20240315-0043",
    agentChain: "Normalize → Propose → Govern → Decide → Publish",
    status: "PROPOSALS GENERATED",
    target: "TDC — Mapping Proposals & Decisions",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "NormalizedRecord set received from PDC (DocumentId: DOC-0041, RunId: RUN-0043)" },
      { time: "12:10:39 PM", msg: "Orchestrator: Stateless AI execution — generating mapping proposals from normalized facts" },
      { time: "12:10:42 PM", msg: "1,842 mapping proposals generated — Avg confidence: 94.7% — Orchestrator has no persistence" },
      { time: "12:10:42 PM", msg: "Proposals delivered to TDC via governed contract (POST /api/tdc/mapping-proposals)" },
      { time: "12:10:43 PM", msg: "TDC: Proposals received and persisted as IMMUTABLE records — TDC governs decisions, not AI execution" },
      { time: "12:10:43 PM", msg: "TDC: Each record carries ProposalId, CanonicalAccountId, SuggestedTaxLine, ConfidenceScore" },
      { time: "12:10:43 PM", msg: "TDC: Source lineage attached — DocumentId → RunId → SourceRecordId" },
      { time: "12:10:44 PM", msg: "TDC: Decision workflow initialized — State: Proposed → awaiting practitioner review" },
      { time: "12:10:50 PM", msg: "TDC: Roger read contract published — GET /api/tdc/mapping-proposals available (read-only, no edit)" },
    ],
    apis: [
      { method: "POST", path: "/api/tdc/mapping-proposals",        desc: "Orchestrator delivers immutable proposals to TDC via governed contract", system: "TDC" },
      { method: "GET",  path: "/api/tdc/mapping-proposals",        desc: "Retrieve proposals by entityId & period — read-only Roger surface",     system: "TDC" },
      { method: "PUT",  path: "/api/tdc/mapping-decisions/{id}",   desc: "Record practitioner decision: Proposed → Accepted / Rejected",          system: "TDC" },
    ],
    features: [
      { id: "DCT-401", label: "AI Mapping Proposals Generated",          status: "Complete" },
      { id: "DCT-402", label: "TDC Decision Workflow Active",             status: "Complete" },
      { id: "DCT-403", label: "Lineage Preserved Across Mapping Layer",   status: "Complete" },
      { id: "DCT-404", label: "Immutable Proposal Persistence in TDC",    status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal",   sub: "File Intake",                          system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",          sub: "Financial Truth — No Tax Logic",        system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Stateless AI Execution — No Persistence",  system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",          sub: "Proposed → Reviewed → Accepted / Rejected", system: "TDC",          status: "Decision Workflow Active" },
      { id: "out",    label: "Output",       sub: "Roger — Read-Only View",                system: "Output",       status: "Pending" },
    ],
  },
  "5": {
    name: "Batch 5 — Entity Identity & Structure",
    shortName: "Batch 5 — Entity Identity",
    readiness: "Partial",
    readinessDetail: "PDC entity registry in dev; CEM sync in design",
    runId: "RUN-20240315-0044",
    agentChain: "Register → Sync → Entitle → Publish",
    status: "REGISTERING",
    target: "PDC — Entity Registry",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Client group created in PDC entity registry" },
      { time: "12:10:42 PM", msg: "Legal entities registered with immutable EntityId (GUID)" },
      { time: "12:10:45 PM", msg: "Ownership relationships (parent/sub) persisted" },
      { time: "12:10:48 PM", msg: "CEM sync executed — idempotent, versioned" },
      { time: "12:10:50 PM", msg: "User-to-entity entitlement mappings stored" },
      { time: "12:10:52 PM", msg: "DataSourceType = CEM_SYNC recorded on all records" },
    ],
    apis: [
      { method: "GET",  path: "/api/v1/entities/{entityId}",           desc: "Retrieve entity identity record",                   system: "PDC" },
      { method: "GET",  path: "/api/v1/entities/{clientId}/hierarchy", desc: "Client group hierarchy with ownership relationships", system: "PDC" },
      { method: "GET",  path: "/api/v1/entities/{entityId}/entitlements", desc: "User-to-entity entitlement mappings",            system: "PDC" },
    ],
    features: [
      { id: "DCT-501", label: "Client Groups & Legal Entity Registration", status: "Dev" },
      { id: "DCT-502", label: "CEM Integration & Sync", status: "Dev" },
      { id: "DCT-503", label: "User Entitlement Sync & Read Contract", status: "Planned" },
      { id: "DCT-504", label: "Ownership Chains, Jurisdictions & Entity Characteristics", status: "Planned" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Entity Registry (System of Record)", system: "PDC", status: "Processing" },
      { id: "orch",   label: "Orchestrator", sub: "Stateless — Not Invoked", system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Consumes EntityId",   system: "TDC",      status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger — Identity Layer", system: "Output", status: "Pending" },
    ],
  },
  "6": {
    name: "Batch 6 — Practitioner Review, Adjustments & Lock",
    shortName: "Batch 6 — Review & Lock",
    readiness: "Partial",
    readinessDetail: "TDC adjustment workflow in dev; Roger sign-off UI planned",
    runId: "RUN-20240315-0045",
    agentChain: "Task Generate → Review → Adjust → Derive → Lock",
    status: "REVIEWING",
    target: "TDC + Roger — Full Practitioner Workflow",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Review tasks generated automatically from data state" },
      { time: "12:10:42 PM", msg: "Book-to-tax adjustment submitted by practitioner" },
      { time: "12:10:45 PM", msg: "Adjustment approved through governed lifecycle" },
      { time: "12:10:48 PM", msg: "Tax-ready records derived deterministically" },
      { time: "12:10:50 PM", msg: "Non-repudiable sign-off completed" },
      { time: "12:10:52 PM", msg: "Entity locked — state = FINALIZED (terminal)" },
    ],
    apis: [
      { method: "GET",  path: "/api/v1/review-tasks/{entityId}/{periodStart}/{periodEnd}", desc: "Review tasks generated from data state",    system: "TDC" },
      { method: "POST", path: "/api/v1/adjustments",                                       desc: "Submit book-to-tax adjustment",             system: "TDC" },
      { method: "POST", path: "/api/v1/sign-off/{entityId}",                               desc: "Non-repudiable sign-off and terminal lock", system: "TDC" },
    ],
    features: [
      { id: "DCT-601", label: "Review Task Management & Entity Status", status: "Dev" },
      { id: "DCT-602", label: "Book-to-Tax Adjustments & Approval Routing", status: "Dev" },
      { id: "DCT-603", label: "Tax-Ready Record Derivation", status: "Dev" },
      { id: "DCT-604", label: "Sign-Off, Lock & Entity Finalization", status: "Planned" },
      { id: "DCT-605", label: "Batch 6 Read Contract Update (Roger Read Surface)", status: "Planned" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",          system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth",       system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Stateless — Not Invoked", system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment + Lock",   system: "TDC",          status: "Processing" },
      { id: "out",    label: "Output",     sub: "Roger — Full Workflow",  system: "Output",       status: "Processing" },
    ],
  },
  "7": {
    name: "Batch 7 — Client Tax Profile & Eligibility",
    shortName: "Batch 7 — Tax Profile",
    readiness: "Partial",
    readinessDetail: "TDC tax profile reference data in design; eligibility model planned",
    runId: "RUN-20240315-0046",
    agentChain: "Profile → Evaluate → Determine → Gate → Publish",
    status: "EVALUATING",
    target: "TDC — Tax Profile & Eligibility Determinations",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Client entity tax profile evaluated (Form 1120)" },
      { time: "12:10:42 PM", msg: "Must Have rules executed — all conditions met" },
      { time: "12:10:45 PM", msg: "Must Not Have rules executed — no violations" },
      { time: "12:10:48 PM", msg: "Flag & Review condition detected — practitioner confirmation required" },
      { time: "12:10:50 PM", msg: "Controlled group determination derived from PDC ownership data" },
      { time: "12:10:52 PM", msg: "Eligibility gate = ELIGIBLE — entity cleared for downstream processing" },
    ],
    apis: [
      { method: "GET",  path: "/api/v1/tdc/profile/{entityId}/{periodStart}",     desc: "Retrieve client tax profile and eligibility determination", system: "TDC" },
      { method: "POST", path: "/api/v1/tdc/profile/{entityId}/determine",         desc: "Trigger eligibility determination (explicit, governed)",   system: "TDC" },
      { method: "GET",  path: "/api/v1/tdc/profile/{entityId}/eligibility-gate",  desc: "Eligibility gate status (ELIGIBLE / INELIGIBLE / FLAG)",   system: "TDC" },
    ],
    features: [
      { id: "DCT-701", label: "Corporate Tax Profile Reference Data (Form 1120)", status: "Planned" },
      { id: "DCT-702", label: "Non-Corporate Profile Reference Data", status: "Planned" },
      { id: "DCT-703", label: "Three-Tier Eligibility Model", status: "Planned" },
      { id: "DCT-704", label: "Client Tax Profile Lifecycle & Determination Records", status: "Planned" },
      { id: "DCT-705", label: "Controlled Group & Affiliated Group Determination", status: "Planned" },
      { id: "DCT-706", label: "Batch 7 Read Contract (Roger Read Surface)", status: "Planned" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",                system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Entity Registry (Ownership Source)", system: "PDC", status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Stateless — Not Invoked",  system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Tax Profile + Eligibility Gate", system: "TDC",    status: "Processing" },
      { id: "out",    label: "Output",     sub: "Roger — Eligibility Status",  system: "Output",       status: "Pending" },
    ],
  },
  "8": {
    name: "Batch 8 — Exceptions & Remediation",
    shortName: "Batch 8 — Exceptions",
    readiness: "Partial",
    readinessDetail: "PDC parallel to Batch 7; TDC sequential after Batch 7 closes",
    runId: "RUN-20240315-0047",
    agentChain: "Capture → Classify → Flag → Remediate → Resolve",
    status: "TRACKING",
    target: "PDC + TDC — Exception Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Ingestion exception captured — failure type, entity, period, root cause" },
      { time: "12:10:42 PM", msg: "Normalization exception flagged — structured, queryable" },
      { time: "12:10:45 PM", msg: "Mapping exception recorded in TDC with full context" },
      { time: "12:10:48 PM", msg: "Practitioner assigned remediation action" },
      { time: "12:10:50 PM", msg: "Root cause tracked and resolution recorded" },
      { time: "12:10:52 PM", msg: "Exception resolved — end-to-end traceability confirmed" },
    ],
    apis: [
      { method: "GET",  path: "/api/v1/pdc/exceptions/{entityId}/{periodStart}",  desc: "PDC exceptions: ingestion and normalization failures",   system: "PDC" },
      { method: "GET",  path: "/api/v1/tdc/exceptions/{entityId}/{periodStart}",  desc: "TDC exceptions: mapping, decision, and workflow failures", system: "TDC" },
      { method: "POST", path: "/api/v1/exceptions/{exceptionId}/remediate",       desc: "Record remediation action and resolution",              system: "PDC" },
    ],
    features: [
      { id: "DCT-801", label: "PDC/TDC Exception Record Structure & Failure Tracking", status: "Planned" },
      { id: "DCT-802", label: "PDC/TDC Flag Management & Remediation Actions", status: "Planned" },
      { id: "DCT-803", label: "PDC/TDC Root Cause Tracking & Resolution Records", status: "Planned" },
      { id: "DCT-804", label: "PDC/TDC Exceptions Read Contract (Roger Read Surface)", status: "Planned" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",                  system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Ingestion + Normalization Exceptions", system: "PDC", status: "Processing" },
      { id: "orch",   label: "Orchestrator", sub: "Stateless — Not Invoked",    system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Mapping + Workflow Exceptions", system: "TDC",          status: "Processing" },
      { id: "out",    label: "Output",     sub: "Roger — Exception Status",     system: "Output",       status: "Pending" },
    ],
  },
};

// ─── STYLE MAPS ───────────────────────────────────────────────────────────────

const NODE_STYLE: Record<string, { bg: string; border: string; color: string; icon: React.ElementType }> = {
  Portal:       { bg: "#1a2e1a", border: "#22c55e", color: "#22c55e", icon: FileText },
  PDC:          { bg: "#1a2e1a", border: "#22c55e", color: "#22c55e", icon: Database },
  Orchestrator: { bg: "#1e1a2e", border: "#a855f7", color: "#a855f7", icon: Network },
  TDC:          { bg: "#1a1a2e", border: "#64748b", color: "#94a3b8", icon: Shield },
  Output:       { bg: "#1a1a2e", border: "#64748b", color: "#94a3b8", icon: BarChart2 },
};

const NODE_STATUS_STYLE: Record<NodeStatus, { bg: string; text: string }> = {
  Complete:                  { bg: "#166534", text: "#86efac" },
  Processing:                { bg: "#1e3a5f", text: "#93c5fd" },
  Pending:                   { bg: "#1e293b", text: "#475569" },
  "Decision Workflow Active": { bg: "#3b1f6e", text: "#c4b5fd" },
  Gap:                         { bg: "#7f1d1d", text: "#fca5a5" },
};

const METHOD_COLOR: Record<ApiMethod, string> = {
  GET: "#3b82f6", POST: "#22c55e", PUT: "#f59e0b",
};

const FEATURE_STYLE: Record<FeatureStatus, { bg: string; text: string }> = {
  Complete: { bg: "#166534", text: "#86efac" },
  Dev:      { bg: "#1e3a5f", text: "#93c5fd" },
  Planned:  { bg: "#1c1c2e", text: "#94a3b8" },
  Blocked:  { bg: "#7f1d1d", text: "#fca5a5" },
};

const READINESS_STYLE: Record<Readiness, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  Ready:   { bg: "#166534", text: "#86efac", dot: "#22c55e", icon: CheckCircle2 },
  Partial: { bg: "#78350f", text: "#fde68a", dot: "#f59e0b", icon: Clock },
  Blocked: { bg: "#7f1d1d", text: "#fca5a5", dot: "#ef4444", icon: AlertCircle },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WeeklyDemo() {
  const [location] = useLocation();

  // Read ?batch= query param for deep-link support (e.g. /weekly-demo?batch=1)
  const getInitialBatch = (): string => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const b = params.get("batch");
    return b && BATCH_DATA[b] ? b : "3";
  };

  const [selectedBatch, setSelectedBatch] = useState(getInitialBatch);
  const [currentStep, setCurrentStep] = useState(1);
  const [speakerMode, setSpeakerMode] = useState(true);
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<number>(-1);
  const eventsRef = useRef<HTMLDivElement>(null);

  const batch = BATCH_DATA[selectedBatch] ?? BATCH_DATA["3"];
  const totalSteps = batch.totalSteps;
  const readinessCfg = READINESS_STYLE[batch.readiness];
  const ReadinessIcon = readinessCfg.icon;

  // Sync batch selection when URL changes (deep-link from sidebar)
  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const b = params.get("batch");
    if (b && BATCH_DATA[b]) setSelectedBatch(b);
  }, [location]);

  // Reset on batch change
  useEffect(() => {
    setVisibleEvents(-1);
    setCurrentStep(1);
    setRunning(false);
  }, [selectedBatch]);

  // Animate events
  useEffect(() => {
    if (!running) return;
    if (visibleEvents >= batch.events.length) { setRunning(false); return; }
    const t = setTimeout(() => {
      setVisibleEvents(v => v + 1);
      if (eventsRef.current) eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }, 400);
    return () => clearTimeout(t);
  }, [running, visibleEvents, batch.events.length]);

  const handleRun = () => { setVisibleEvents(0); setRunning(true); };
  const handleReset = () => { setVisibleEvents(-1); setRunning(false); };
  const handleNextStep = () => { if (currentStep < totalSteps) setCurrentStep(s => s + 1); };
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "#0a0f1a", color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif", minHeight: "100vh"
    }}>

      {/* ── TOP CONTROLS BAR ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
        padding: "8px 16px", borderBottom: "1px solid #1e2a3a",
        backgroundColor: "#0d1420"
      }}>
        {/* Badges */}
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase" }}>
          System Simulation
        </span>
        <span style={{ fontSize: "10px", color: "#94a3b8", backgroundColor: "#1e293b", padding: "2px 8px", borderRadius: "4px" }}>
          No Live Execution
        </span>

        {/* Title */}
        <div style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>
          DCT Platform — Data Flow Simulation
        </div>

        {/* Batch selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Batch</span>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            style={{
              backgroundColor: "#1e293b", color: "#e2e8f0",
              border: "1px solid #334155", borderRadius: "6px",
              padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer"
            }}
          >
            {Object.entries(BATCH_DATA).map(([k, b]) => (
              <option key={k} value={k}>{b.shortName}</option>
            ))}
          </select>
        </div>

        {/* Readiness pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          backgroundColor: readinessCfg.bg, color: readinessCfg.text,
          padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: readinessCfg.dot, display: "inline-block" }} />
          {batch.readiness}
        </div>

        {/* Compare */}
        <button
          onClick={() => toast.info("Batch comparison — feature coming soon")}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            backgroundColor: "#1e293b", color: "#94a3b8",
            border: "1px solid #334155", borderRadius: "6px",
            padding: "4px 10px", fontSize: "11px", cursor: "pointer"
          }}
        >
          <GitCompare size={12} /> Compare
        </button>

        {/* Speaker toggle */}
        <button
          onClick={() => setSpeakerMode(m => !m)}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            backgroundColor: speakerMode ? "#1e3a5f" : "#1e293b",
            color: speakerMode ? "#93c5fd" : "#94a3b8",
            border: `1px solid ${speakerMode ? "#3b82f6" : "#334155"}`,
            borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer"
          }}
        >
          <Mic size={12} /> {speakerMode ? "Speaker" : "Audience"}
        </button>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Step {currentStep} of {totalSteps}</span>
          <div style={{ display: "flex", gap: "3px" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: "18px", height: "4px", borderRadius: "2px",
                backgroundColor: i < currentStep ? "#3b82f6" : "#1e293b"
              }} />
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={handlePrevStep}
            disabled={currentStep <= 1}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              backgroundColor: currentStep <= 1 ? "#1e293b" : "#1e3a5f",
              color: currentStep <= 1 ? "#475569" : "#93c5fd",
              border: `1px solid ${currentStep <= 1 ? "#334155" : "#3b82f6"}`,
              borderRadius: "7px",
              padding: "6px 12px", fontSize: "12px", fontWeight: 700,
              cursor: currentStep <= 1 ? "not-allowed" : "pointer"
            }}
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            onClick={handleNextStep}
            disabled={currentStep >= totalSteps}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              backgroundColor: currentStep >= totalSteps ? "#1e293b" : "#2563eb",
              color: currentStep >= totalSteps ? "#475569" : "white",
              border: "none", borderRadius: "7px",
              padding: "6px 14px", fontSize: "12px", fontWeight: 700,
              cursor: currentStep >= totalSteps ? "not-allowed" : "pointer"
            }}
          >
            Next Step <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── SYSTEM FLOW ───────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #1e2a3a" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "10px" }}>
          System Flow
        </div>
        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", gap: "0" }}>
          {batch.flowNodes.map((node, i) => {
            const ns = NODE_STYLE[node.system];
            const ss = NODE_STATUS_STYLE[node.status];
            const Icon = ns.icon;
            return (
              <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  backgroundColor: ns.bg, border: `2px solid ${ns.border}`,
                  borderRadius: "10px", padding: "12px 16px",
                  minWidth: "110px", textAlign: "center"
                }}>
                  <Icon size={18} style={{ color: ns.color, margin: "0 auto 5px" }} />
                  <div style={{ fontSize: "12px", fontWeight: 700, color: ns.color }}>{node.label}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>{node.sub}</div>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: ss.bg, color: ss.text,
                    fontSize: "10px", fontWeight: 700,
                    padding: "2px 8px", borderRadius: "4px"
                  }}>
                    {node.status}
                  </div>
                  {/* Batch 4: immutability indicator on TDC node */}
                  {selectedBatch === "4" && node.system === "TDC" && (
                    <div style={{
                      marginTop: "5px",
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      backgroundColor: "#1c1a0e", color: "#fbbf24",
                      border: "1px solid #92400e",
                      fontSize: "10px", fontWeight: 700,
                      padding: "3px 7px", borderRadius: "4px",
                      letterSpacing: "0.04em"
                    }}>
                      🔒 IMMUTABLE
                    </div>
                  )}
                </div>
                {i < batch.flowNodes.length - 1 && (
                  <ArrowRight size={14} style={{ color: "#334155", flexShrink: 0, margin: "0 3px" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM PANELS ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* LEFT — System Events */}
        <div style={{
          flex: "1 1 0", borderRight: "1px solid #1e2a3a",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px", borderBottom: "1px solid #1e2a3a"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Zap size={13} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                System Events
              </span>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button onClick={handleRun} style={{
                display: "flex", alignItems: "center", gap: "3px",
                backgroundColor: "#166534", color: "#86efac",
                border: "none", borderRadius: "5px",
                padding: "4px 11px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
              }}>
                <Play size={11} /> Run
              </button>
              <button onClick={handleReset} style={{
                display: "flex", alignItems: "center", gap: "3px",
                backgroundColor: "#1e293b", color: "#94a3b8",
                border: "1px solid #334155", borderRadius: "5px",
                padding: "4px 11px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
              }}>
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>

          <div ref={eventsRef} style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {visibleEvents >= 0 && batch.events.slice(0, visibleEvents).map((ev, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "7px",
                padding: "4px 14px"
              }}>
                <ChevronRight size={10} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#cbd5e1", flex: 1 }}>{ev.msg}</span>
                <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0 }}>{ev.time}</span>
              </div>
            ))}
            {visibleEvents < 0 && !running && (
              <div style={{ padding: "14px", textAlign: "center", color: "#475569", fontSize: "12px" }}>
                Click Run to simulate system events
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Data State + API Proof + Demo Readiness */}
        <div style={{ width: "290px", flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Data State */}
          <div style={{ borderBottom: "1px solid #1e2a3a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Database size={13} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                Data State
              </span>
            </div>
            <div style={{ padding: "2px 14px 10px" }}>
              {[
                { label: "RunId",       value: batch.runId },
                { label: "AgentChain",  value: batch.agentChain },
                { label: "Status",      value: batch.status },
                { label: "Target",      value: batch.target },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", borderBottom: "1px solid #1e293b"
                }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 600, textAlign: "right", maxWidth: "155px", wordBreak: "break-word" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* API Proof */}
          <div style={{ borderBottom: "1px solid #1e2a3a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Network size={13} style={{ color: "#a78bfa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                API Proof
              </span>
            </div>
            <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {batch.apis.map((api, i) => (
                <div key={i}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                    ● {api.system} API
                  </div>
                  <div style={{
                    backgroundColor: "#0d1420", border: "1px solid #1e293b",
                    borderRadius: "5px", padding: "5px 8px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: METHOD_COLOR[api.method] }}>{api.method}</span>
                      <code style={{ fontSize: "11px", color: "#93c5fd" }}>{api.path}</code>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{api.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Batch 4 — Governance Rules */}
          {selectedBatch === "4" && (
            <div style={{ borderBottom: "1px solid #1e2a3a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
                <Shield size={13} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                  Governance Rules
                </span>
              </div>
              <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  "Proposals are IMMUTABLE once created",
                  "Only TDC stores tax mapping decisions",
                  "PDC cannot store or modify tax logic",
                  "All mappings trace: DocumentId → RunId → SourceRecordId",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                    <span style={{ color: "#fbbf24", fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>●</span>
                    <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch 4 — Roger Output (Read-Only) */}
          {selectedBatch === "4" && (
            <div style={{ borderBottom: "1px solid #1e2a3a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
                <BarChart2 size={13} style={{ color: "#94a3b8" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                  Roger Output — Read-Only
                </span>
                <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, backgroundColor: "#1e293b", color: "#94a3b8", padding: "2px 6px", borderRadius: "3px" }}>NO EDIT</span>
              </div>
              <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {[
                  { proposalId: "PROP-0001", account: "Acct-4421", taxLine: "Sch M-1 Line 2a", confidence: "97%", status: "Proposed" },
                  { proposalId: "PROP-0002", account: "Acct-1183", taxLine: "Form 1120 Line 28", confidence: "91%", status: "Accepted" },
                  { proposalId: "PROP-0003", account: "Acct-7702", taxLine: "Sch M-1 Line 4", confidence: "78%", status: "Rejected" },
                ].map((row) => (
                  <div key={row.proposalId} style={{
                    backgroundColor: "#0d1420", border: "1px solid #1e293b",
                    borderRadius: "5px", padding: "6px 8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <code style={{ fontSize: "11px", color: "#60a5fa" }}>{row.proposalId}</code>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px",
                        backgroundColor: row.status === "Accepted" ? "#166534" : row.status === "Rejected" ? "#7f1d1d" : "#1e3a5f",
                        color: row.status === "Accepted" ? "#86efac" : row.status === "Rejected" ? "#fca5a5" : "#93c5fd",
                      }}>{row.status}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#cbd5e1" }}>{row.account} → {row.taxLine}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Confidence: {row.confidence}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Readiness */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Shield size={13} style={{ color: "#34d399" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                Demo Readiness
              </span>
            </div>
            <div style={{ padding: "2px 14px 12px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                backgroundColor: readinessCfg.bg, color: readinessCfg.text,
                padding: "6px 10px", borderRadius: "6px", marginBottom: "8px"
              }}>
                <ReadinessIcon size={12} />
                <span style={{ fontSize: "12px", fontWeight: 700 }}>{batch.readiness} to Demo</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>{batch.readinessDetail}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Delivered in This Demo
              </div>
              {batch.features.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 0" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    backgroundColor: FEATURE_STYLE[f.status].bg,
                    color: FEATURE_STYLE[f.status].text,
                    padding: "2px 7px", borderRadius: "3px", flexShrink: 0
                  }}>
                    {f.status}
                  </span>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>{f.id} — {f.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

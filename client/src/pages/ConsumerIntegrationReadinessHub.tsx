// ─────────────────────────────────────────────────────────────────────────────
// Consumer Integration Readiness Hub
// Purpose: Governance readiness reference hub for Roger and future consumers.
//          Centralizes API relationship guidance, payload sequencing,
//          lineage mappings, integration dependencies, and consumer onboarding.
// Non-production workspace — architecture visualization and readiness planning only
//
// Sections:
//   1.  Executive Summary
//   2.  Consumer Integration Architecture Overview
//   3.  Canonical ID & Relationship Mapping Matrix
//   4.  API Relationship Sequencing
//   5.  Required vs Optional Field Governance
//   6.  End-to-End Payload Walkthroughs
//   7.  Consumer Integration Test Dataset
//   8.  API Maturity & Stability Matrix
//   9.  Known Consumer Enhancement Requests
//   10. Governance Boundaries
//   11. Open Questions / Pending Decisions
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "wouter";
import GovernanceBanner from "@/components/GovernanceBanner";
import { GovernanceStatusBar } from "@/components/GovernanceStatusBar";
import {
  ChevronDown, ChevronUp, Shield, Link2, Database, AlertTriangle,
  CheckCircle2, Clock, Circle, FileText, Zap, Eye, Lock, Users, Printer, Mail, Copy, X,
} from "lucide-react";

// ── Sections 12-17 data (migrated from Consumer Readiness Center) ──────────────
type ReadinessStatus = "Consumer Ready" | "Partial Data" | "Governance Pending" | "Draft Contract" | "Future State" | "Blocked";
type DataStatus = "Real Data" | "Partial" | "Mock Data" | "None";
type RiskLevel = "Critical" | "High" | "Medium" | "Low";
type AdrStatus = "Open" | "In Review" | "Resolved";

const READINESS_STYLES: Record<ReadinessStatus, { bg: string; text: string }> = {
  "Consumer Ready":    { bg: "#dcfce7", text: "#15803d" },
  "Partial Data":      { bg: "#fef9c3", text: "#854d0e" },
  "Governance Pending":{ bg: "#fef3c7", text: "#92400e" },
  "Draft Contract":    { bg: "#fee2e2", text: "#991b1b" },
  "Future State":      { bg: "#f1f5f9", text: "#475569" },
  "Blocked":           { bg: "#fce7f3", text: "#9d174d" },
};

const ENDPOINT_MATRIX_DATA = [
  { batch: "FC",  api: "File Ingestion Status",           path: "GET /api/v1/Ingestion/{runId}",                    purpose: "Track ingestion job state by run ID",                       status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B1",  api: "Lineage Anchor (Processing Run)", path: "GET /api/v1/processing-runs/{id}",                 purpose: "DocumentId → EntityId → PeriodStart/End lineage",           status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B2",  api: "Normalized Trial Balance",         path: "GET /api/v1/data-records",                        purpose: "vNormalizedTb financial data records",                      status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B2A", api: "FirmTaxonomyId on Data Records",   path: "GET /api/v1/data-records",                        purpose: "Enforce FirmTaxonomyId classification presence",           status: "Partial Data" as ReadinessStatus,   data: "Partial" as DataStatus,   govStatus: "Field pending Orchestrator", blockers: "Orchestrator not returning FirmTaxonomyId", owner: "PDC + Orchestrator" },
  { batch: "B5",  api: "Client List",                      path: "GET /api/v1/clients",                             purpose: "Retrieve all active clients for current user",             status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B5",  api: "Legal Entity by Client",           path: "GET /api/v1/legal-entities",                      purpose: "All legal entities for a client",                          status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B5",  api: "Jurisdiction Assignments",         path: "GET /api/v1/jurisdiction-assignments",            purpose: "Jurisdiction assignments for an entity",                   status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B5",  api: "Ownership Relationships",          path: "GET /api/v1/ownership-relationships/by-parent/{parentEntityId}", purpose: "Entity ownership hierarchy", status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B5",  api: "Taxonomy Concepts",                path: "GET /api/v1/taxonomy/concepts",                   purpose: "All active taxonomy concepts",                             status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "PDC" },
  { batch: "B3",  api: "Tax Forms",                        path: "GET /api/TaxForms",                               purpose: "Tax forms by return type, jurisdiction, tax year",         status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "TDC" },
  { batch: "B3",  api: "Mapping Rules",                    path: "GET /api/MappingRules",                           purpose: "Mapping rules by rule type, jurisdiction, tax year",       status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "TDC" },
  { batch: "B4",  api: "AI Mapping Proposals",             path: "GET /api/v1/ai-mapping-proposals",                purpose: "AI proposals by tax year, client, entity",                 status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "TDC" },
  { batch: "B6",  api: "Adjustments by Entity Scope",      path: "GET /api/Adjustments",                            purpose: "All adjustments by entityId and taxYear",                  status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus, govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined", owner: "TDC" },
  { batch: "B6",  api: "Review Tasks",                     path: "GET /api/v1/review-tasks",                        purpose: "Review tasks for entity and tax year scope",               status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus, govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined", owner: "TDC" },
  { batch: "B7",  api: "Entity Finalization State",        path: "GET /api/v1/entity-finalization",                 purpose: "Finalization state for entity and tax year",               status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "TDC" },
  { batch: "B7",  api: "Tax Profile Determinations",       path: "GET /api/v1/tax-profile-determinations",          purpose: "Tax profile determinations for entity scope",              status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus, govStatus: "G3 Contract Published", blockers: "None", owner: "TDC" },
  { batch: "B8",  api: "Exception Records (TDC Read)",     path: "GET /api/v1/TdcExceptionsRead",                   purpose: "Read exception records (TDC read contract)",               status: "Draft Contract" as ReadinessStatus, data: "None" as DataStatus, govStatus: "In Development", blockers: "Contract not yet published — B8 gate not passed", owner: "TDC" },
  { batch: "B9",  api: "Roger Gateway (Ocelot)",           path: "GET /api/gateway/* (planned)",                    purpose: "Governed pass-through to IMS/CEM/TIM — surface-not-store", status: "Future State" as ReadinessStatus, data: "None" as DataStatus, govStatus: "Planned — PI 2", blockers: "B9 PDC gate required", owner: "PDC" },
];

const SCREEN_DEPS = [
  { screen: "Dashboard",         apis: ["File Ingestion Status", "Entity Identity & Structure"],                                    readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Client List",       apis: ["Entity Identity & Structure", "Client Tax Profile"],                                       readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Work Queue",        apis: ["Practitioner Review Queue", "Entity Identity & Structure"],                                readiness: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus, risks: "Role assignment ownership unresolved [BLOCKING]" },
  { screen: "Filing Review",     apis: ["Normalized Trial Balance", "AI Mapping Proposals", "Client Tax Profile"],                  readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Adjustments",       apis: ["Normalized Trial Balance", "FirmTaxonomyId Enforcement"],                                  readiness: "Partial Data" as ReadinessStatus,   data: "Partial" as DataStatus,    risks: "FirmTaxonomyId field missing from Orchestrator [WARNING]" },
  { screen: "Upload Experience", apis: ["File Ingestion Status", "Lineage Anchor"],                                                 readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Entity Review",     apis: ["Entity Identity & Structure", "FirmTaxonomyId Enforcement"],                               readiness: "Partial Data" as ReadinessStatus,   data: "Partial" as DataStatus,    risks: "FirmTaxonomyId not yet returned by Orchestrator [WARNING]" },
  { screen: "Tax Mapping",       apis: ["Tax Form Templates", "AI Mapping Proposals", "Client Tax Profile"],                        readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "Tax Form Templates are Orchestrator-facing only — Roger reads via TDC Read Contract" },
  { screen: "Exception Mgmt",    apis: ["Exception Record", "Remedy Action", "Re-ingestion Trigger"],                               readiness: "Blocked" as ReadinessStatus,        data: "None" as DataStatus,       risks: "All B8 APIs in Draft Contract state. Roger cannot consume until G3 gate passed [BLOCKING]" },
];

const INTEGRATION_RISKS_DATA = [
  { id: "IR-01", title: "FirmTaxonomyId Missing from Orchestrator",    level: "High" as RiskLevel,     category: "Payload Gap",          description: "Orchestrator is not returning FirmTaxonomyId in normalized records. Roger Adjustments and Entity Review screens depend on this field.", resolution: "Orchestrator team to add FirmTaxonomyId to payload. ADO #1370843." },
  { id: "IR-02", title: "Role Assignment Ownership Unresolved",        level: "Critical" as RiskLevel, category: "Governance Gap",        description: "Work Queue API exists but no team has been assigned ownership of role assignment logic. Roger cannot consume without governance approval.", resolution: "Governance decision required: PDC vs TDC vs Roger ownership. Escalate to architecture." },
  { id: "IR-03", title: "B8 Exception APIs Not Yet Published",         level: "High" as RiskLevel,     category: "Contract Gap",          description: "Exception Record, Remedy Action, and Re-ingestion Trigger are in draft. Roger Exception Management screen is fully blocked.", resolution: "B8 must pass G3 Contract Publication gate before Roger can consume." },
  { id: "IR-04", title: "tax_year Field Naming Inconsistency",         level: "Medium" as RiskLevel,   category: "Contract Instability",  description: "tax_year uses camelCase in some endpoints and snake_case in others. Roger UI must not hardcode field names until contract is stabilized.", resolution: "Normalize to snake_case across all TDC contracts. ADO #1349152." },
  { id: "IR-05", title: "PeriodStart/End Not Referenced in Swagger",   level: "Medium" as RiskLevel,   category: "Swagger Gap",           description: "PeriodStart and PeriodEnd fields are in the data model but not referenced in Swagger schema. Roger cannot rely on these fields.", resolution: "Add PeriodStart/PeriodEnd to Swagger schema for lineage endpoints." },
  { id: "IR-06", title: "Read/Write Contract Distinction Missing",     level: "Medium" as RiskLevel,   category: "Governance Gap",        description: "Some endpoints do not clearly distinguish Read Contract from Write Contract. Roger must only consume Read Contracts.", resolution: "Architect to add Read/Write distinction to all published contracts." },
  { id: "IR-07", title: "Gateway Routing Strategy Not Finalized",      level: "High" as RiskLevel,     category: "Architecture Gap",      description: "Roger Gateway routing strategy is not finalized. Roger UI may be calling PDC/TDC APIs directly without proper gateway mediation.", resolution: "ADR required: Gateway routing strategy. Escalate to architecture team." },
  { id: "IR-08", title: "Authentication Provisioning for Roger",       level: "High" as RiskLevel,     category: "Auth Gap",              description: "Roger authentication against PDC/TDC APIs is not yet provisioned in UAT. Demo uses mock auth.", resolution: "Auth provisioning request to platform team. Required before UAT." },
];

const OPEN_ADRS_DATA = [
  { id: "ADR-01", title: "Filing Signoff Ownership",           status: "Open" as AdrStatus,      impact: "High",     blocking: "Work Queue, Filing Review",  description: "Who owns the filing signoff decision — TDC or Roger? Unresolved." },
  { id: "ADR-02", title: "Identity Reconciliation Strategy",   status: "In Review" as AdrStatus, impact: "High",     blocking: "Entity Review, Client List", description: "How are EntityId conflicts resolved across PDC and TDC? Strategy pending." },
  { id: "ADR-03", title: "Gateway Routing Strategy",           status: "Open" as AdrStatus,      impact: "Critical", blocking: "All Roger screens",          description: "How does Roger route API calls — direct to PDC/TDC or via Ocelot gateway? ADR required." },
  { id: "ADR-04", title: "Role Assignment Ownership",          status: "Open" as AdrStatus,      impact: "Critical", blocking: "Work Queue",                 description: "Which team owns role assignment logic for practitioner work queue?" },
  { id: "ADR-05", title: "Event-Driven Synchronization",       status: "Open" as AdrStatus,      impact: "Medium",   blocking: "Dashboard, Work Queue",      description: "Should Roger UI use polling or event-driven updates for real-time data?" },
  { id: "ADR-06", title: "Additive-Only Contract Enforcement", status: "In Review" as AdrStatus, impact: "Medium",   blocking: "All contracts",              description: "Process for enforcing additive-only constraint across all published contracts." },
];

const NEXT_ACTIONS_DATA = [
  { action: "Request FirmTaxonomyId payload from Orchestrator",    owner: "Orchestrator Team", status: "In Progress", impact: "High",     adoRef: "#1370843" },
  { action: "Resolve role assignment ownership for Work Queue",     owner: "Architecture",      status: "Open",        impact: "Critical", adoRef: "—" },
  { action: "Publish B8 Exception Record Read Contract (G3)",       owner: "PDC BA",            status: "In Progress", impact: "High",     adoRef: "#B8" },
  { action: "Finalize Gateway routing strategy (ADR-03)",           owner: "Architecture",      status: "Open",        impact: "Critical", adoRef: "—" },
  { action: "Normalize tax_year field naming across TDC contracts", owner: "TDC BA",            status: "Open",        impact: "Medium",   adoRef: "#1349152" },
  { action: "Add PeriodStart/PeriodEnd to Swagger schema",          owner: "PDC BA",            status: "Open",        impact: "Medium",   adoRef: "—" },
  { action: "Provision Roger auth against PDC/TDC in UAT",          owner: "Platform Team",     status: "Open",        impact: "High",     adoRef: "—" },
  { action: "Add Read/Write contract distinction to all contracts",  owner: "Architecture",      status: "Open",        impact: "Medium",   adoRef: "—" },
];

// ── Version metadata ─────────────────────────────────────────────────────────
const HUB_VERSION = "v4.0";
const HUB_SOURCE  = "DCT_Batch_Roadmap_v4.docx";
const HUB_UPDATED = "May 26, 2026";
const HUB_AUTHOR  = "CATT · Sr. BA · Jenniver";

// ── Collapsible Section Wrapper ──────────────────────────────────────────────
function Section({
  id, title, badge, badgeColor = "#003865", children, defaultOpen = false,
}: {
  id: string; title: string; badge?: string; badgeColor?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
        style={{ background: open ? "#f0f7ff" : "#f8fafc" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className="text-sm font-bold text-[#003865]">{title}</span>
          {badge && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: badgeColor + "22", color: badgeColor, border: `1px solid ${badgeColor}44` }}
            >
              {badge}
            </span>
          )}
        </div>
      </button>
      {open && <div className="px-5 py-4 bg-white border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ── Callout Box ───────────────────────────────────────────────────────────────
function Callout({
  type = "info", title, children,
}: { type?: "info" | "warning" | "governance" | "boundary"; title: string; children: React.ReactNode }) {
  const styles = {
    info:       { bg: "#eff6ff", border: "#3b82f6", icon: <Circle className="w-4 h-4" style={{ color: "#3b82f6" }} />, titleColor: "#1e40af" },
    warning:    { bg: "#fffbeb", border: "#f59e0b", icon: <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />, titleColor: "#92400e" },
    governance: { bg: "#f0fdf4", border: "#16a34a", icon: <Shield className="w-4 h-4" style={{ color: "#16a34a" }} />, titleColor: "#14532d" },
    boundary:   { bg: "#faf5ff", border: "#7c3aed", icon: <Lock className="w-4 h-4" style={{ color: "#7c3aed" }} />, titleColor: "#4c1d95" },
  }[type];
  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: styles.bg, borderLeft: `4px solid ${styles.border}` }}>
      <div className="flex items-center gap-2 mb-1.5">
        {styles.icon}
        <span className="text-sm font-bold" style={{ color: styles.titleColor }}>{title}</span>
      </div>
      <div className="text-sm" style={{ color: styles.titleColor }}>{children}</div>
    </div>
  );
}

// ── Table Component ───────────────────────────────────────────────────────────
function DataTable({ headers, rows, compact = false }: { headers: string[]; rows: (string | React.ReactNode)[][]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200 mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#003865] text-white">
            {headers.map((h, i) => (
              <th key={i} className={`text-left font-semibold px-3 ${compact ? "py-1.5" : "py-2"} whitespace-nowrap`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 ${compact ? "py-1.5" : "py-2"} text-slate-700 align-top`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "#059669": { bg: "#d1fae5", text: "#065f46" },
    "#003865": { bg: "#dbeafe", text: "#1e40af" },
    "#7c3aed": { bg: "#ede9fe", text: "#4c1d95" },
    "#dc2626": { bg: "#fee2e2", text: "#991b1b" },
    "#d97706": { bg: "#fef3c7", text: "#92400e" },
    "#6b7280": { bg: "#f3f4f6", text: "#374151" },
    "#0e7490": { bg: "#cffafe", text: "#164e63" },
  };
  const s = map[color] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {label}
    </span>
  );
}

// ── Email Summary Modal ─────────────────────────────────────────────────────
const EMAIL_SUBJECT = "DCT Consumer Integration Readiness Hub — Strategy & Governance Alignment";

const EMAIL_BODY = `To: Roger Team · DCT Team · Product Owners · Architects · Integration Leads · BAs · Governance Stakeholders
From: CATT Sr. Business Analyst — DCT Platform Delivery
Date: ${HUB_UPDATED}
Subject: ${EMAIL_SUBJECT}

──────────────────────────────────────────────────────────────────
OPENING SUMMARY
──────────────────────────────────────────────────────────────────
Thank you to the Roger team for consolidating and surfacing the integration questions over the past several batches. That effort helped the DCT team identify specific opportunities to improve how integration guidance is organized, surfaced, and consumed across teams.

Much of the requested information already exists across current DCT governance artifacts — Swagger schemas, Consumer Guides, Batch documentation, ADO Features, Manus documentation, and Roger UI Data Availability artifacts. The current effort is focused on centralizing and operationalizing that existing information into a more implementation-oriented, consumer-ready experience.

──────────────────────────────────────────────────────────────────
NEW: CONSUMER INTEGRATION READINESS HUB
──────────────────────────────────────────────────────────────────
DCT has created a new centralized page within the DCT Platform Control Panel:

  "Consumer Integration Readiness Hub"

This hub is the authoritative onboarding and integration enablement location for Roger and all future consumers. It consolidates:
  • API relationships and producer/consumer direction
  • Payload sequencing (8-step authoritative chain)
  • Lineage flows and canonical ID mapping
  • Integration dependencies and gate-gated sequencing
  • Consumer onboarding documentation and test datasets
  • Known enhancement requests (tracked separately from contract gaps)
  • Governance boundaries — DCT owns vs. Roger owns

Hub Location: DCT Platform Dashboard → Roger UI → Consumer Integration Hub

──────────────────────────────────────────────────────────────────
10 KEY FOCUS AREAS
──────────────────────────────────────────────────────────────────
 1. Consumer Integration Architecture Overview — single-page system relationship map
 2. Canonical ID & Relationship Mapping Matrix — all primary keys with immutable/lineage/derived/consumer-safe classifications
 3. API Relationship Sequencing — authoritative 8-step API chaining sequence
 4. Required vs Optional Field Governance — per-model field rules with ADO Feature links
 5. End-to-End Payload Walkthroughs — 5 complete request/response examples
 6. Consumer Integration Test Dataset — known validation dataset for integration QA
 7. API Maturity & Stability Matrix — 17 endpoints classified by maturity and consumer-safe status
 8. Consumer Enhancement Request Tracking — 8 tracked requests, separate from contract gaps
 9. Governance Boundary Clarification — formal DCT Owns / Roger Owns ownership matrix
10. Open Questions & Pending Decisions — 10 tracked items with ADO Feature links and owners

──────────────────────────────────────────────────────────────────
GOVERNANCE BOUNDARY CLARIFICATION
──────────────────────────────────────────────────────────────────
DCT OWNS: governed contracts · lineage · taxonomy governance · authoritative tax-ready outputs · validation expectations · API governance

ROGER OWNS: UI orchestration · workflow composition · presentation behavior · consumer-side paging · screen composition · UI rendering behavior

NOTE: Consumer enhancement requests are evaluated separately from governance contract completeness.

──────────────────────────────────────────────────────────────────
IMMEDIATE NEXT STEPS
──────────────────────────────────────────────────────────────────
• Hub is live — access via DCT Platform Dashboard → Roger UI → Consumer Integration Hub
• Consolidating API relationship mappings as B9 and B12 complete gate sign-off
• Publishing additional payload walkthroughs for B8 exception and B9 gateway flows
• Enhancement requests tracked in hub — submit new requests via the hub tracker
• Swagger documentation will be aligned with governing ADO Feature definitions during B10/B11

──────────────────────────────────────────────────────────────────
CLOSING
──────────────────────────────────────────────────────────────────
Thank you for continued collaboration. The goal is to reduce fragmented integration discussions by creating a single, authoritative reference that any consumer team can navigate independently. We look forward to building a scalable consumer enablement model that supports Roger and all future consumers through PI 3, PI 4, and beyond.

──────────────────────────────────────────────────────────────────
Source: ${HUB_SOURCE} · Version: ${HUB_VERSION} · ${HUB_UPDATED}
Author: ${HUB_AUTHOR}
──────────────────────────────────────────────────────────────────`;

function EmailSummaryModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL_BODY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleMailto() {
    const encoded = encodeURIComponent(EMAIL_BODY);
    window.open(`mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encoded}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#003865]" />
            <span className="font-bold text-[#003865] text-base">BA Touchpoint Email Summary</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#ede9fe", color: "#4c1d95" }}>Ready to Send</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject line */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <p className="text-xs text-slate-500 mb-0.5">Subject</p>
          <p className="text-sm font-semibold text-slate-800">{EMAIL_SUBJECT}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{EMAIL_BODY}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-400">Copy to clipboard and paste into Outlook, or click Open in Mail App to launch your email client.</p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button
              onClick={handleMailto}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "#003865" }}
            >
              <Mail className="w-4 h-4" />
              Open in Mail App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
// ─── Command Center Tab Data ──────────────────────────────────────────────────
const COMMAND_TABS = [
  "Integration Risks",
  "Open Questions",
  "API Contract Health",
  "Batch Dependency Tracker",
  "Governance Decision Feed",
  "Source System Readiness",
  "QA Readiness",
  "Roger UI Readiness",
  "PI Carry Forward Risks",
] as const;
type CommandTab = typeof COMMAND_TABS[number];

const GOVERNANCE_FEED_ITEMS = [
  { date: "Jun 5, 2026",  action: "Known Mapping Strategy Approved",          owner: "Architecture",  type: "decision" },
  { date: "Jun 5, 2026",  action: "Client-Level Mapping Reuse Approved",       owner: "TDC BA",        type: "decision" },
  { date: "Jun 5, 2026",  action: "Book/Reclass API Story Created (Batch 6)",  owner: "Jenniver",      type: "story" },
  { date: "Jun 4, 2026",  action: "Gateway Validation Rule Added (ARB-7)",     owner: "Nasar",         type: "rule" },
  { date: "Jun 3, 2026",  action: "TIM Deliverables Integration Scoped",       owner: "Nasar",         type: "scope" },
  { date: "May 30, 2026", action: "FirmTaxonomyId ADR Escalated to Architecture", owner: "Architecture", type: "adr" },
  { date: "May 28, 2026", action: "Roger Read-Only Boundary Confirmed",        owner: "Architecture",  type: "decision" },
];

const SOURCE_READINESS = [
  { system: "PDC",          status: "Ready",    note: "Contracts published through B7. B8 in draft.",                color: "#059669" },
  { system: "TDC",          status: "Partial",  note: "B6 adjustments governance pending. Book/Reclass gap open.",   color: "#d97706" },
  { system: "Orchestrator", status: "Warning",  note: "FirmTaxonomyId not returned in payload. ADO #1370843.",       color: "#d97706" },
  { system: "Gateway (B9)", status: "Planned",  note: "ARB-7 active. TIM deliverables integration in flight.",       color: "#7c3aed" },
  { system: "TIM",          status: "Active",   note: "Deliverables integration scoped by Nasar. In flight.",        color: "#0ea5e9" },
  { system: "CEM",          status: "Active",   note: "Client setup in CEM active. Login integration in progress.",  color: "#0ea5e9" },
  { system: "IMS",          status: "Deferred", note: "Not in current MVP scope. Gated on IMS readiness.",           color: "#6b7280" },
];

const BATCH_DEPS = [
  { batch: "B2A", name: "FirmTaxonomyId Enforcement",         status: "Blocked",    blocker: "Orchestrator not returning FirmTaxonomyId",           owner: "PDC + Orchestrator" },
  { batch: "B6",  name: "Practitioner Review, Adjustments",   status: "Warning",    blocker: "Book/Reclass update endpoint gap — story being created", owner: "TDC" },
  { batch: "B8",  name: "Exception Management",               status: "Blocked",    blocker: "G3 Contract not yet published",                       owner: "PDC" },
  { batch: "B9",  name: "Roger Gateway (Ocelot)",             status: "In Flight",  blocker: "ARB-7 active. TIM deliverables integration ongoing.",   owner: "PDC + Nasar" },
  { batch: "B12", name: "Known Mappings Reuse",               status: "Defect",     blocker: "Gary's Known Mappings API bug — fix expected post-batch", owner: "TDC + Gary" },
];

const PI_CARRY_FORWARD = [
  { item: "Known Mappings API Defect",            pi: "PI 2 → PI 3", severity: "Blocking",  owner: "Gary / TDC",    note: "API only queries newest TaxReadyRecord — misses LOCKED records with approved decisions." },
  { item: "Book/Reclass Update Endpoint Gap",     pi: "PI 2 → PI 3", severity: "Blocking",  owner: "Nasar / TDC",   note: "Roger UI can retrieve but not persist adjustment updates. Story being created." },
  { item: "Role Assignment Ownership (ADR-04)",   pi: "PI 2 → PI 3", severity: "Blocking",  owner: "Architecture",  note: "Work Queue API exists but no team owns role assignment logic." },
  { item: "FirmTaxonomyId Payload Gap",           pi: "PI 2 → PI 3", severity: "Warning",   owner: "Orchestrator",  note: "Field missing from Orchestrator response. ADO #1370843." },
  { item: "Gateway Routing Strategy (ADR-03)",    pi: "PI 2 → PI 3", severity: "Warning",   owner: "Architecture",  note: "ADR required before Roger routes calls through Ocelot." },
];

const QA_READINESS = [
  { area: "Known Mappings Reuse Flow",     status: "Blocked",   note: "Gary's API defect blocks second-run validation. Fix expected after current batch.",    owner: "Gary" },
  { area: "Book/Reclass Save Capability",  status: "Gap",       note: "Roger UI save triggers no TDC persist. TDC update endpoint missing.",                  owner: "Nasar" },
  { area: "Gateway TIM Deliverables",      status: "In Flight", note: "Nasar actively integrating. Target: next batch.",                                      owner: "Nasar" },
  { area: "Client Setup in CEM",           status: "In Flight", note: "Client provisioning required before Gateway flow can execute.",                         owner: "Nasar" },
  { area: "FirmTaxonomyId Enforcement",    status: "Warning",   note: "Orchestrator payload fix needed before B2A QA can pass.",                              owner: "Orchestrator" },
  { area: "B8 Exception Management",       status: "Blocked",   note: "All B8 APIs in Draft Contract state. Cannot QA until G3 gate passed.",                 owner: "PDC BA" },
];

const ROGER_UI_READINESS = [
  { screen: "Dashboard",          status: "Ready",   apis: "Ingestion Status, Entity Identity",         risk: "None" },
  { screen: "Client List",        status: "Ready",   apis: "Entity Identity, Client Tax Profile",        risk: "None" },
  { screen: "Work Queue",         status: "Blocked", apis: "Practitioner Review Queue",                  risk: "Role assignment ownership unresolved [BLOCKING]" },
  { screen: "Filing Review",      status: "Ready",   apis: "Normalized TB, AI Proposals, Tax Profile",   risk: "None" },
  { screen: "Adjustments",        status: "Warning", apis: "Normalized TB, FirmTaxonomyId",              risk: "FirmTaxonomyId missing from Orchestrator [WARNING]" },
  { screen: "Book/Reclass Edit",  status: "Gap",     apis: "TDC Update Endpoint (missing)",              risk: "No TDC API to persist save. Story being created." },
  { screen: "Exception Mgmt",     status: "Blocked", apis: "Exception Record, Remedy Action",            risk: "All B8 APIs in Draft Contract state [BLOCKING]" },
  { screen: "Tax Mapping",        status: "Ready",   apis: "Tax Forms, AI Proposals, Tax Profile",       risk: "None" },
];

// ─── Executive Summary KPI Panel ─────────────────────────────────────────────
function ExecSummaryPanel() {
  const kpis = [
    { label: "Governance Health",    value: "72%",   sub: "6 open issues",           color: "#d97706", bg: "#fffbeb" },
    { label: "Blocking Items",       value: "3",     sub: "Known Mappings, B8, Roles", color: "#dc2626", bg: "#fef2f2" },
    { label: "Critical Dependencies",value: "5",     sub: "Cross-batch dependencies", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Batch Readiness",      value: "PI 2",  sub: "B9/B12 in flight",        color: "#003865", bg: "#eff6ff" },
    { label: "Release Readiness",    value: "Partial",sub: "B6 gap open",            color: "#d97706", bg: "#fffbeb" },
    { label: "Tax Return Readiness", value: "Pending",sub: "Known Mappings blocked",  color: "#dc2626", bg: "#fef2f2" },
  ];
  return (
    <div style={{ background: "#0f1623", borderBottom: "1px solid #1e3a5f", padding: "12px 20px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Executive Summary — Integration Command Center</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: "6px", padding: "8px 12px", minWidth: "110px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", marginTop: "2px" }}>{k.label}</div>
            <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "1px" }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Command Center Panel ─────────────────────────────────────────────────────
function CommandCenterPanel() {
  const [activeTab, setActiveTab] = useState<CommandTab>("Integration Risks");

  const RISK_COLOR: Record<string, { bg: string; text: string }> = {
    Critical: { bg: "#fef2f2", text: "#991b1b" },
    High:     { bg: "#fff7ed", text: "#9a3412" },
    Medium:   { bg: "#fefce8", text: "#854d0e" },
    Low:      { bg: "#f0fdf4", text: "#166534" },
  };
  const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
    Ready:     { bg: "#dcfce7", text: "#15803d" },
    Partial:   { bg: "#fef9c3", text: "#854d0e" },
    Warning:   { bg: "#fff7ed", text: "#9a3412" },
    Planned:   { bg: "#eff6ff", text: "#1d4ed8" },
    Active:    { bg: "#e0f2fe", text: "#0369a1" },
    Deferred:  { bg: "#f3f4f6", text: "#6b7280" },
    Blocked:   { bg: "#fef2f2", text: "#991b1b" },
    "In Flight":{ bg: "#f0fdf4", text: "#15803d" },
    Defect:    { bg: "#fef2f2", text: "#991b1b" },
    Gap:       { bg: "#fff7ed", text: "#9a3412" },
    Blocking:  { bg: "#fef2f2", text: "#991b1b" },
    decision:  { bg: "#eff6ff", text: "#1d4ed8" },
    story:     { bg: "#f0fdf4", text: "#15803d" },
    rule:      { bg: "#f5f3ff", text: "#5b21b6" },
    scope:     { bg: "#fef9c3", text: "#854d0e" },
    adr:       { bg: "#fff7ed", text: "#9a3412" },
  };
  function Chip({ label, type }: { label: string; type: string }) {
    const s = STATUS_COLOR[type] ?? { bg: "#f3f4f6", text: "#374151" };
    return (
      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: s.bg, color: s.text, whiteSpace: "nowrap" }}>{label}</span>
    );
  }

  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ background: "#003865", padding: "0 16px", display: "flex", gap: "2px", overflowX: "auto" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "center", marginRight: "8px", whiteSpace: "nowrap" }}>Control Tower</div>
        {COMMAND_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 14px",
              fontSize: "11px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#003865" : "rgba(255,255,255,0.75)",
              borderRadius: activeTab === tab ? "6px 6px 0 0" : "0",
              marginTop: "4px",
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px 20px" }}>

        {activeTab === "Integration Risks" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Active integration risks grounded in live platform data and meeting context (Jun 5, 2026).</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {INTEGRATION_RISKS_DATA.map(r => (
                <div key={r.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", background: r.level === "Critical" ? "#fff5f5" : r.level === "High" ? "#fffbeb" : "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", fontFamily: "monospace" }}>{r.id}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{r.title}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: RISK_COLOR[r.level]?.bg, color: RISK_COLOR[r.level]?.text }}>{r.level}</span>
                    <span style={{ fontSize: "10px", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{r.category}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 4px" }}>{r.description}</p>
                  <p style={{ fontSize: "11px", color: "#059669", margin: 0 }}>↳ Resolution: {r.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Open Questions" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Open architecture decisions and pending governance questions requiring resolution.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {OPEN_ADRS_DATA.map(a => (
                <div key={a.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", background: a.impact === "Critical" ? "#fff5f5" : "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", fontFamily: "monospace" }}>{a.id}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{a.title}</span>
                    <Chip label={a.status} type={a.status === "Open" ? "Blocked" : "Warning"} />
                    <Chip label={a.impact} type={a.impact === "Critical" ? "Blocking" : a.impact === "High" ? "Warning" : "Partial"} />
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 4px" }}>{a.description}</p>
                  <p style={{ fontSize: "11px", color: "#dc2626", margin: 0 }}>Blocking: {a.blocking}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "API Contract Health" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Contract health by system. Color indicates readiness for Roger consumption.</p>
            {[
              { system: "PDC Contracts",     passed: 8, warning: 1, blocking: 1, note: "B8 Exception APIs in Draft Contract state — blocking Roger Exception Management." },
              { system: "TDC Contracts",     passed: 6, warning: 2, blocking: 1, note: "B6 Adjustments governance pending. Book/Reclass update endpoint gap identified." },
              { system: "Gateway Contracts", passed: 0, warning: 1, blocking: 0, note: "ARB-7 active. TIM deliverables integration in flight. B9 planned PI 2." },
              { system: "Roger Contracts",   passed: 5, warning: 2, blocking: 0, note: "FirmTaxonomyId field missing from Orchestrator. Work Queue role assignment open." },
            ].map(c => (
              <div key={c.system} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#003865", flex: 1 }}>{c.system}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>✓ {c.passed} Passed</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", background: "#fef9c3", padding: "2px 8px", borderRadius: "4px" }}>⚠ {c.warning} Warning</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", background: "#fef2f2", padding: "2px 8px", borderRadius: "4px" }}>✕ {c.blocking} Blocking</span>
                </div>
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{c.note}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Batch Dependency Tracker" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Cross-batch dependencies and current blockers.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {BATCH_DEPS.map(b => (
                <div key={b.batch} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", background: b.status === "Blocked" || b.status === "Defect" ? "#fff5f5" : "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: "#e2e8f0", color: "#0f1623", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>{b.batch}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{b.name}</span>
                    <Chip label={b.status} type={b.status} />
                    <span style={{ fontSize: "10px", color: "#64748b" }}>{b.owner}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#dc2626", margin: 0 }}>⚠ {b.blocker}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Governance Decision Feed" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Recent governance decisions, approved strategies, and new story creation events.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {GOVERNANCE_FEED_ITEMS.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc" }}>
                  <Chip label={item.type.toUpperCase()} type={item.type} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f1623", flex: 1 }}>{item.action}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>{item.owner}</span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Source System Readiness" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Current readiness status for each source system feeding the DCT platform.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SOURCE_READINESS.map(s => (
                <div key={s.system} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: s.color, minWidth: "90px" }}>{s.system}</span>
                  <Chip label={s.status} type={s.status} />
                  <span style={{ fontSize: "12px", color: "#475569" }}>{s.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "QA Readiness" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>QA readiness by integration area. Grounded in Jun 5 meeting context.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {QA_READINESS.map(q => (
                <div key={q.area} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", background: q.status === "Blocked" || q.status === "Gap" ? "#fff5f5" : "#f8fafc" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#003865", minWidth: "180px" }}>{q.area}</span>
                  <Chip label={q.status} type={q.status} />
                  <span style={{ fontSize: "12px", color: "#475569", flex: 1 }}>{q.note}</span>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{q.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Roger UI Readiness" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Roger UI screen-by-screen readiness based on current API contract status.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ROGER_UI_READINESS.map(r => (
                <div key={r.screen} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", background: r.status === "Blocked" || r.status === "Gap" ? "#fff5f5" : "#f8fafc" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#003865", minWidth: "140px" }}>{r.screen}</span>
                  <Chip label={r.status} type={r.status} />
                  <span style={{ fontSize: "11px", color: "#64748b", flex: 1 }}>APIs: {r.apis}</span>
                  <span style={{ fontSize: "11px", color: r.risk === "None" ? "#15803d" : "#dc2626" }}>{r.risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "PI Carry Forward Risks" && (
          <div>
            <p style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>Items carrying forward from PI 2 into PI 3. Requires resolution before PI 3 planning.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PI_CARRY_FORWARD.map((p, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", background: p.severity === "Blocking" ? "#fff5f5" : "#fffbeb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{p.item}</span>
                    <Chip label={p.severity} type={p.severity} />
                    <span style={{ fontSize: "10px", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{p.pi}</span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>{p.owner}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>{p.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConsumerIntegrationReadinessHub() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <ExecSummaryPanel />
      <GovernanceStatusBar
        blocking={3}
        warnings={3}
        openQuestions={6}
        contractsActive={2}
        contractsTotal={8}
        governanceStatus="Degraded"
        context="Consumer Integration Hub"
      />
      <div className="px-6 pt-4"><GovernanceBanner /></div>
      {showEmailModal && <EmailSummaryModal onClose={() => setShowEmailModal(false)} />}
      {/* ── Page Header ────────────────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-5 h-5 text-[#003865]" />
              <h1 className="text-xl font-bold text-[#003865]">Consumer Integration Readiness Hub</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
                Non-Production Reference
              </span>
            </div>
            <p className="text-sm text-slate-500">
              DCT Platform · Single integration enablement hub for Roger and future consumers
            </p>
            <p className="text-xs mt-1" style={{ color: "#9ca3af", fontStyle: "italic" }}>
              Authoritative scope: Consumer integration readiness, API contracts &amp; touchpoint governance ·{" "}
              <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>← Platform Home</a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">API-First Architecture</span>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">Lineage Governed</span>
              <span className="px-2 py-1 rounded bg-violet-50 text-violet-800 font-medium border border-violet-200">Roger Read-Only</span>
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">Contract Published</span>
            </div>
            {/* Generate Email Summary button */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: "#7c3aed", color: "#fff", border: "1px solid #7c3aed" }}
              title="Generate a BA Touchpoint email summary ready to send to stakeholders"
            >
              <Mail className="w-3.5 h-3.5" />
              Generate Email Summary
            </button>
            {/* Print / Export to PDF button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: "#003865", color: "#fff", border: "1px solid #003865" }}
              title="Print or Save as PDF — use your browser's Print dialog and choose 'Save as PDF'"
            >
              <Printer className="w-3.5 h-3.5" />
              Export to PDF
            </button>
          </div>
        </div>

        {/* Quick-jump nav */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            ["#exec-summary", "Executive Summary"],
            ["#arch-overview", "Architecture"],
            ["#id-matrix", "ID Matrix"],
            ["#api-sequencing", "API Sequencing"],
            ["#field-governance", "Field Governance"],
            ["#payload-walkthroughs", "Payload Walkthroughs"],
            ["#test-dataset", "Test Dataset"],
            ["#maturity-matrix", "Maturity Matrix"],
            ["#enhancements", "Enhancements"],
            ["#gov-boundaries", "Gov Boundaries"],
            ["#open-questions", "Open Questions"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-[#003865] hover:text-white hover:border-[#003865] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 max-w-7xl mx-auto">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — Executive Summary                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="exec-summary">
          <Section id="s1" title="1 — Executive Summary" badge="Governance" badgeColor="#003865" defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-700 mb-3">
                  The DCT platform exposes <strong>governed APIs and lineage-safe contracts</strong> that enable Roger
                  and future consumers to access authoritative financial data, tax decisions, and AI mapping outputs.
                  This hub centralizes all consumer implementation guidance to reduce fragmentation across Swagger,
                  ADO Features, batch documentation, Consumer Guides, and BA walkthroughs.
                </p>
                <p className="text-sm text-slate-700 mb-3">
                  Prior to this hub, integration knowledge was distributed across multiple artifacts with no single
                  authoritative reference. This page consolidates:
                </p>
                <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc">
                  <li>API relationship and sequencing guidance</li>
                  <li>Canonical ID and lineage chain documentation</li>
                  <li>Payload examples and field governance rules</li>
                  <li>Consumer onboarding and test dataset references</li>
                  <li>API maturity and stability classifications</li>
                  <li>Governance boundary definitions</li>
                </ul>
              </div>
              <div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ownership Model</p>
                  <div className="space-y-2">
                    {[
                      { system: "PDC", role: "Phoenix Data Consolidation — ingestion, normalization, lineage anchoring", color: "#1e40af" },
                      { system: "TDC", role: "Tax Data Consolidation — tax decisions, eligibility, proposals, tax-ready records", color: "#059669" },
                      { system: "Orchestrator", role: "AI execution — mapping proposals, classification, confidence scoring", color: "#7c3aed" },
                      { system: "Roger", role: "Read-only consumer — UI orchestration, workflow composition, presentation logic", color: "#d97706" },
                    ].map(({ system, role, color }) => (
                      <div key={system} className="flex items-start gap-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: color + "18", color }}>{system}</span>
                        <span className="text-xs text-slate-600">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Lineage Chain</p>
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    {["DocumentId", "EntityId", "ReportingPeriodId", "ProposalId", "DecisionId", "TaxReadyRecordId"].map((id, i, arr) => (
                      <span key={id} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded font-mono font-semibold" style={{ background: "#dbeafe", color: "#1e40af" }}>{id}</span>
                        {i < arr.length - 1 && <span className="text-slate-400">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Callout type="boundary" title="Important Boundary Statement">
              DCT governs authoritative contracts, lineage, taxonomy, and tax-ready outputs.
              Consumer applications (Roger and future consumers) remain responsible for UI orchestration,
              workflow composition, presentation logic, and consumer-side implementation behavior.
              DCT does <strong>not</strong> own Roger UI behavior, paging strategies, caching, or rendering decisions.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — Architecture Overview                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="arch-overview">
          <Section id="s2" title="2 — Consumer Integration Architecture Overview" badge="Architecture" badgeColor="#7c3aed">
            <p className="text-sm text-slate-600 mb-4">
              The following diagram describes the end-to-end relationship between all platform systems,
              showing authoritative ownership, inbound vs outbound integrations, and producer vs consumer relationships.
            </p>

            {/* Architecture visual — system relationship grid */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">System Relationship Map</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { name: "PDC", subtitle: "Phoenix Data Consolidation", role: "Producer", color: "#1e40af", bg: "#dbeafe", items: ["Ingestion", "Normalization", "Lineage Anchor", "Exception Remediation", "Roger Gateway (B9)"] },
                  { name: "TDC", subtitle: "Tax Data Consolidation", role: "Producer", color: "#059669", bg: "#d1fae5", items: ["Tax Profile", "Eligibility", "AI Proposals", "Decisions", "Tax-Ready Records"] },
                  { name: "Orchestrator", subtitle: "AI Execution Engine", role: "Producer", color: "#7c3aed", bg: "#ede9fe", items: ["Mapping Proposals", "Confidence Scoring", "Classification", "Model Governance"] },
                  { name: "Roger", subtitle: "Practitioner Consumer", role: "Consumer (Read-Only)", color: "#d97706", bg: "#fef3c7", items: ["UI Orchestration", "Workflow Composition", "Presentation Logic", "Consumer Caching"] },
                ].map(({ name, subtitle, role, color, bg, items }) => (
                  <div key={name} className="rounded-lg border p-3" style={{ borderColor: color + "44", background: bg + "88" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color }}>{name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: color + "22", color }}>{role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
                    <ul className="text-xs space-y-0.5">
                      {items.map(i => <li key={i} className="text-slate-600">· {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* External systems */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">External Systems (Pass-Through via B9 Gateway)</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: "IMS", desc: "Prior year + current year data. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "CEM", desc: "Client auth + user mapping. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "TIM", desc: "Engagement metadata, deliverables, due dates. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "eODS", desc: "Deferred. Not in current MVP scope. Gated on IMS readiness.", color: "#6b7280" },
                ].map(({ name, desc, color }) => (
                  <div key={name} className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="text-xs font-bold" style={{ color }}>{name}</span>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <DataTable
              headers={["System", "Direction", "Relationship", "Read/Write", "Authoritative Owner", "Notes"]}
              rows={[
                ["PDC", "Inbound", "Receives raw financial data from Tax Portal via Service Bus", "Write", "PDC", "Ingestion anchor. DocumentId issued here."],
                ["PDC → TDC", "Outbound", "Normalized records consumed by TDC for classification", "Read", "PDC", "NormalizedRecordId is the PDC→TDC handoff key."],
                ["TDC → Orchestrator", "Outbound", "TDC requests AI mapping proposals from Orchestrator", "Read", "TDC", "Orchestrator is execution-only. TDC owns decisions."],
                ["Orchestrator → TDC", "Inbound", "Proposals returned to TDC for practitioner review", "Write (proposals only)", "Orchestrator", "Proposals are immutable once submitted."],
                ["TDC → Roger", "Outbound", "Tax-ready records, proposals, decisions surfaced to Roger", "Read-Only", "TDC", "Roger is read-only. No write surface to TDC."],
                ["PDC → Roger", "Outbound", "Gateway (B9) surfaces IMS/CEM/TIM pass-through to Roger", "Read-Only", "PDC", "Surface-not-store. No IMS/CEM/TIM data persisted in PDC."],
                ["IMS → PDC Gateway", "Inbound pass-through", "Prior year + current year data surfaced via Ocelot", "Read-Only", "IMS", "PDC does not store IMS data. Pass-through only."],
                ["CEM → PDC Gateway", "Inbound pass-through", "Client auth + user mapping surfaced via Ocelot", "Read-Only", "CEM", "PDC does not store CEM data. Pass-through only."],
                ["TIM → PDC Gateway", "Inbound pass-through", "Engagement metadata surfaced via Ocelot", "Read-Only", "TIM", "PDC does not store TIM data. Pass-through only."],
              ]}
            />

            <Callout type="governance" title="Lineage Chain — Authoritative Sequence">
              <span className="font-mono text-xs">
                DocumentId → EntityId → ReportingPeriodId → ProposalId → DecisionId → TaxReadyRecordId
              </span>
              <p className="mt-1 text-xs">
                Each ID in this chain is immutable and lineage-anchored. Consumers must traverse this chain
                in sequence. Skipping steps or resolving IDs out of order is a governance violation.
              </p>
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — Canonical ID & Relationship Mapping Matrix         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="id-matrix">
          <Section id="s3" title="3 — Canonical ID & Relationship Mapping Matrix" badge="Lineage" badgeColor="#059669">
            <p className="text-sm text-slate-600 mb-3">
              The following matrix documents all primary keys, foreign key relationships, and lineage properties
              for every authoritative DCT resource. Consumers must use these IDs exactly as issued — they are
              never to be generated, inferred, or substituted by consumer applications.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: "Immutable", color: "#92400e", bg: "#fef3c7" },
                { label: "Lineage Anchor", color: "#065f46", bg: "#d1fae5" },
                { label: "Derived", color: "#1e40af", bg: "#dbeafe" },
                { label: "Consumer-Safe", color: "#4c1d95", bg: "#ede9fe" },
              ].map(({ label, color, bg }) => (
                <span key={label} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
                  ● {label}
                </span>
              ))}
            </div>

            <DataTable
              headers={["Resource", "Primary Key", "Foreign Keys", "Related Resource", "Relationship Purpose", "Authoritative Owner", "Properties"]}
              rows={[
                ["TaxReadyRecord", "TaxReadyRecordId", "DecisionId, EntityId, ReportingPeriodId", "ProposalDecision, Entity, ReportingPeriod", "Terminal lineage output — tax-ready state", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["AIMappingProposal", "ProposalId", "NormalizedRecordId, FirmTaxonomyId, EntityId", "NormalizedRecord, FirmTaxonomy", "AI classification proposal for practitioner review", "Orchestrator / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ProposalDecision", "DecisionId", "ProposalId, ReviewTaskId", "AIMappingProposal, ReviewTask", "Practitioner accept/reject/override decision", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /></span>],
                ["TaxForm", "TaxFormId", "TaxReadyRecordId, EntityId", "TaxReadyRecord, Entity", "Resolved tax form for a given entity + period", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Derived" color="#003865" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["TaxFormLine", "TaxFormLineId", "TaxFormId, TaxTaxonomyAccountId", "TaxForm, TaxTaxonomyAccount", "Individual line item within a resolved tax form", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Derived" color="#003865" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["TaxTaxonomyAccount", "TaxTaxonomyAccountCode", "FirmTaxonomyId", "FirmTaxonomy", "Canonical taxonomy account — maps financial data to tax lines", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["NormalizedRecord", "NormalizedRecordId", "DocumentId, EntityId, ReportingPeriodId", "Document, Entity, ReportingPeriod", "PDC normalized financial record — TDC input", "PDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["Entity", "EntityId", "ClientId", "Client", "Legal entity within a client engagement", "PDC / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["Client", "ClientId", "—", "Entity (1:N)", "RSM client — top-level engagement anchor", "PDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ReportingPeriod", "ReportingPeriodId", "EntityId", "Entity", "Tax reporting period for a given entity", "PDC / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Lineage Anchor" color="#059669" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ReviewTask", "ReviewTaskId", "ProposalId, EntityId, AssignedUserId", "AIMappingProposal, Entity", "Practitioner review assignment for a proposal", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
              ]}
            />

            <Callout type="warning" title="Consumer Implementation Rule">
              All IDs marked <strong>Immutable</strong> must be stored and referenced exactly as issued by the
              authoritative system. Consumer applications must never generate, hash, or substitute these IDs.
              Lineage Anchor IDs are required for all downstream API calls — missing anchors will result in
              rejected requests.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — API Relationship Sequencing                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="api-sequencing">
          <Section id="s4" title="4 — API Relationship Sequencing" badge="Implementation" badgeColor="#0e7490">
            <p className="text-sm text-slate-600 mb-4">
              The following step-by-step walkthrough documents the authoritative API chaining sequence for a
              complete end-to-end integration. Each step must be completed in order — keys produced in earlier
              steps are required inputs for later steps.
            </p>

            <div className="space-y-3">
              {[
                {
                  step: 1, name: "Retrieve Normalized Records",
                  endpoint: "GET /api/v1/data-records", system: "PDC",
                  produced: ["NormalizedRecordId", "EntityId", "ReportingPeriodId", "DocumentId"],
                  consumed: ["EntityId (filter)", "ReportingPeriodId (filter)"],
                  depends: "Ingestion run complete (B1/B2)",
                  lineage: "NormalizedRecordId is the PDC lineage anchor. All downstream TDC calls require this ID.",
                  batch: "B2",
                },
                {
                  step: 2, name: "Retrieve FirmTaxonomy Classifications",
                  endpoint: "GET /api/v1/firm-taxonomy", system: "TDC",
                  produced: ["FirmTaxonomyId", "TaxTaxonomyAccountCode"],
                  consumed: ["EntityId"],
                  depends: "Entity resolved (Step 1)",
                  lineage: "FirmTaxonomyId is required for proposal creation and tax form line resolution.",
                  batch: "B3",
                },
                {
                  step: 3, name: "Retrieve AI Mapping Proposals",
                  endpoint: "GET /api/v1/ai-mapping-proposals", system: "TDC / Orchestrator",
                  produced: ["ProposalId", "FirmTaxonomyId", "NormalizedRecordId"],
                  consumed: ["EntityId", "ReportingPeriodId", "NormalizedRecordId"],
                  depends: "Normalized records resolved (Step 1), FirmTaxonomy resolved (Step 2)",
                  lineage: "ProposalId is the TDC lineage anchor for the decision chain.",
                  batch: "B4 / B5",
                },
                {
                  step: 4, name: "Submit Proposal Decisions",
                  endpoint: "POST /api/v1/proposal-decisions", system: "TDC",
                  produced: ["DecisionId"],
                  consumed: ["ProposalId", "ReviewTaskId"],
                  depends: "Proposal retrieved (Step 3), ReviewTask assigned",
                  lineage: "DecisionId is immutable. Once submitted, the decision cannot be modified — only superseded.",
                  batch: "B6",
                },
                {
                  step: 5, name: "Retrieve Tax-Ready Records",
                  endpoint: "GET /api/v1/tax-ready-records", system: "TDC",
                  produced: ["TaxReadyRecordId"],
                  consumed: ["EntityId", "ReportingPeriodId", "DecisionId"],
                  depends: "All proposals decided (Step 4), eligibility confirmed (B7)",
                  lineage: "TaxReadyRecordId is the terminal lineage output. This is the authoritative tax-ready state.",
                  batch: "B7",
                },
                {
                  step: 6, name: "Resolve Form Lines",
                  endpoint: "GET /api/v1/tax-form-lines", system: "TDC",
                  produced: ["TaxFormLineId", "TaxFormId"],
                  consumed: ["TaxReadyRecordId", "TaxTaxonomyAccountCode"],
                  depends: "Tax-ready records resolved (Step 5)",
                  lineage: "TaxFormLineId is derived from TaxReadyRecordId. Required for practitioner review rendering.",
                  batch: "B7 / B11",
                },
                {
                  step: 7, name: "Generate Review Tasks",
                  endpoint: "POST /api/v1/review-tasks", system: "TDC",
                  produced: ["ReviewTaskId"],
                  consumed: ["ProposalId", "EntityId", "AssignedUserId"],
                  depends: "Proposals available (Step 3)",
                  lineage: "ReviewTaskId links to ProposalId. Required for practitioner assignment and sign-off.",
                  batch: "B6",
                },
                {
                  step: 8, name: "Retrieve Practitioner Review State",
                  endpoint: "GET /api/v1/review-tasks/{taskId}", system: "TDC",
                  produced: ["ReviewState", "SignOffStatus"],
                  consumed: ["ReviewTaskId"],
                  depends: "Review task generated (Step 7)",
                  lineage: "SignOffStatus is immutable once submitted. Drives downstream eligibility and tax-ready state.",
                  batch: "B6 / B7",
                },
              ].map(({ step, name, endpoint, system, produced, consumed, depends, lineage, batch }) => (
                <div key={step} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#003865" }}>
                      {step}
                    </span>
                    <span className="text-sm font-bold text-[#003865]">{name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">{endpoint}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold ml-auto" style={{ background: "#dbeafe", color: "#1e40af" }}>{system}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "#d1fae5", color: "#065f46" }}>{batch}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Produced Keys</p>
                      {produced.map(k => <p key={k} className="text-xs font-mono text-emerald-700">{k}</p>)}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Consumed Keys</p>
                      {consumed.map(k => <p key={k} className="text-xs font-mono text-blue-700">{k}</p>)}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dependencies</p>
                      <p className="text-xs text-slate-600">{depends}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lineage Implication</p>
                      <p className="text-xs text-slate-600">{lineage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — Required vs Optional Field Governance              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="field-governance">
          <Section id="s5" title="5 — Required vs Optional Field Governance" badge="Contracts" badgeColor="#dc2626">
            <Callout type="warning" title="Swagger Is Not the Full Contract">
              Swagger schemas alone do not represent the full governance contract. Batch Features and governing
              ADO stories remain authoritative for conditional rules, lineage requirements, and validation
              expectations. Always cross-reference Swagger with the relevant ADO Feature before implementing.
            </Callout>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                {
                  type: "Required", color: "#dc2626", bg: "#fee2e2",
                  desc: "Must be present in every request. Absence results in HTTP 400 rejection.",
                  examples: ["EntityId on all entity-scoped endpoints", "ReportingPeriodId on period-scoped endpoints", "ProposalId on decision submission", "NormalizedRecordId on proposal creation"],
                },
                {
                  type: "Optional", color: "#059669", bg: "#d1fae5",
                  desc: "May be omitted. Default behavior applies when absent. Documented per endpoint.",
                  examples: ["PageSize (defaults to 50)", "SortOrder (defaults to ascending)", "IncludeInactive (defaults to false)", "FilterByStatus (returns all statuses if omitted)"],
                },
                {
                  type: "Conditional", color: "#d97706", bg: "#fef3c7",
                  desc: "Required only when a related field is present or a specific state is active.",
                  examples: ["DecisionId required when submitting sign-off", "SupersedeReason required when superseding a decision", "ReviewTaskId required when closing a review", "FirmTaxonomyId required when creating a proposal"],
                },
                {
                  type: "Nullable", color: "#6b7280", bg: "#f3f4f6",
                  desc: "May be null in response. Consumers must handle null gracefully — do not assume presence.",
                  examples: ["ConfidenceScore (null if Orchestrator has not processed)", "SignOffDate (null until sign-off submitted)", "TaxReadyDate (null until tax-ready state achieved)", "AssignedUserId (null if unassigned)"],
                },
              ].map(({ type, color, bg, desc, examples }) => (
                <div key={type} className="rounded-lg border p-3" style={{ borderColor: color + "44", background: bg + "66" }}>
                  <p className="text-sm font-bold mb-1" style={{ color }}>{type} Fields</p>
                  <p className="text-xs text-slate-600 mb-2">{desc}</p>
                  <ul className="text-xs space-y-0.5">
                    {examples.map(e => <li key={e} className="text-slate-700">· {e}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <DataTable
              compact
              headers={["Behavior", "HTTP Status", "Trigger", "Consumer Action Required"]}
              rows={[
                ["Required field missing", "400 Bad Request", "EntityId, ReportingPeriodId, or ProposalId absent", "Add required field. Do not retry without correction."],
                ["Conditional field missing", "422 Unprocessable Entity", "Conditional dependency not met (e.g., DecisionId missing on sign-off)", "Resolve dependency chain before retrying."],
                ["Lineage anchor invalid", "404 Not Found", "Referenced ID does not exist in authoritative system", "Verify ID was issued by the correct system. Do not fabricate IDs."],
                ["Immutable field mutation attempt", "409 Conflict", "Attempt to update an immutable field (e.g., DecisionId, ProposalId)", "Immutable fields cannot be changed. Create a supersede record instead."],
                ["Eligibility gate blocked", "403 Forbidden", "Entity in INELIGIBLE or FLAG_AND_REVIEW state", "Resolve eligibility before proceeding. TDC is the eligibility authority."],
              ]}
            />

            {/* ── Per-Model Field Governance Table ──────────────────────── */}
            <div className="mt-5">
              <p className="text-sm font-bold text-[#003865] mb-1">Per-Model Field Governance Reference</p>
              <p className="text-xs text-slate-500 mb-3">
                The table below documents required, optional, conditional, and validation expectations for each
                major DCT API model. Swagger schemas alone are not the complete governance contract — Batch
                Features and ADO stories remain authoritative for conditional validation logic and lineage requirements.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: "#003865", color: "#fff" }}>
                      {["API / Model", "Required Fields", "Optional Fields", "Conditional Fields", "Validation Notes", "Source Artifact"].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-semibold whitespace-nowrap border border-slate-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        model: "FinancialFact",
                        required: "EntityId, ReportingPeriodId, DocumentId, AccountCode, Amount",
                        optional: "CurrencyCode, Description, SourceSystem",
                        conditional: "FiscalYearId (required if multi-year)",
                        validation: "Amount must be non-null and numeric. AccountCode must resolve to a known FirmTaxonomy entry.",
                        links: [
                          { label: "B1 — File Ingestion Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B1+File+Ingestion" },
                          { label: "B2 — Normalization Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B2+Normalization" },
                        ],
                      },
                      {
                        model: "TdcRecord",
                        required: "NormalizedRecordId, EntityId, ReportingPeriodId, FirmTaxonomyId",
                        optional: "Metadata fields, Tags",
                        conditional: "ClassificationOverride (required if manual override applied)",
                        validation: "NormalizedRecordId must be issued by PDC. FirmTaxonomyId must resolve to an active taxonomy.",
                        links: [
                          { label: "B3 — Tax Domain Authority Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B3+Tax+Domain" },
                          { label: "B4 — AI Mapping Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B4+AI+Mapping" },
                        ],
                      },
                      {
                        model: "AIMappingProposal",
                        required: "ProposalId, NormalizedRecordId, FirmTaxonomyId, TaxTaxonomyAccountCode, ConfidenceScore",
                        optional: "ConfidenceBand (derived), Notes",
                        conditional: "ReviewTaskId (required once assigned)",
                        validation: "ProposalId is immutable once issued. ConfidenceScore must be between 0.0 and 1.0.",
                        links: [
                          { label: "B4 — AI Mapping & Taxonomy Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B4+AI+Mapping" },
                          { label: "B5 — Entity Identity Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B5+Entity+Identity" },
                        ],
                      },
                      {
                        model: "MappingDecision",
                        required: "DecisionId, ProposalId, ReviewTaskId, Decision, DecidedBy, DecidedAt",
                        optional: "SupersedeReason",
                        conditional: "SupersedeReason (required if superseding a prior decision)",
                        validation: "DecisionId is immutable. Decision must be ACCEPTED, REJECTED, or OVERRIDDEN. Supersede creates a new DecisionId.",
                        links: [
                          { label: "B6 — Practitioner Review Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B6+Practitioner+Review" },
                        ],
                      },
                      {
                        model: "TaxReadyRecord",
                        required: "TaxReadyRecordId, EntityId, ReportingPeriodId, DecisionId, Status, TaxReadyDate",
                        optional: "Notes",
                        conditional: "— (no conditional fields; all required fields are always required)",
                        validation: "TaxReadyRecordId is the terminal lineage output. Status must be Tax Ready before downstream form line resolution.",
                        links: [
                          { label: "B7 — Client Tax Profile Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B7+Client+Tax+Profile" },
                        ],
                      },
                      {
                        model: "ReviewTask",
                        required: "ReviewTaskId, ProposalId, EntityId, AssignedUserId",
                        optional: "DueDate, Notes",
                        conditional: "DueDate (required for SLA-governed engagements)",
                        validation: "ReviewTaskId links to ProposalId. AssignedUserId must resolve to an active CEM user.",
                        links: [
                          { label: "B6 — Practitioner Review Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B6+Practitioner+Review" },
                        ],
                      },
                      {
                        model: "EntityRecord",
                        required: "EntityId, ClientId, EntityName, EntityType",
                        optional: "JurisdictionCode, TaxYear",
                        conditional: "JurisdictionCode (required for multi-jurisdiction entities)",
                        validation: "EntityId is the lineage anchor for all entity-scoped APIs. EntityType must be a governed enumeration value.",
                        links: [
                          { label: "B5 — Entity Identity & Structure Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B5+Entity+Identity" },
                        ],
                      },
                      {
                        model: "EligibilityDetermination",
                        required: "EntityId, ReportingPeriodId, EligibilityStatus, DeterminedAt",
                        optional: "Notes, Flags",
                        conditional: "FlagReason (required if status is FLAG_AND_REVIEW)",
                        validation: "EligibilityStatus must be ELIGIBLE, INELIGIBLE, or FLAG_AND_REVIEW. Ineligible entities are gated from downstream APIs.",
                        links: [
                          { label: "B7 — Client Tax Profile Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B7+Client+Tax+Profile" },
                        ],
                      },
                      {
                        model: "ExceptionRecord",
                        required: "ExceptionId, EntityId, ExceptionType, DetectedAt, Status",
                        optional: "ResolutionNotes, AssignedTo",
                        conditional: "ResolutionNotes (required when status transitions to RESOLVED)",
                        validation: "ExceptionId is immutable. ExceptionType must be a governed enumeration. Status transitions are unidirectional.",
                        links: [
                          { label: "B8 — Exceptions & Remediation Feature", url: "https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/?workItemType=Feature&text=B8+Exceptions" },
                        ],
                      },
                    ].map((row, i) => (
                      <tr key={row.model} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                        <td className="px-3 py-2 font-semibold text-[#003865] border border-slate-200 whitespace-nowrap">{row.model}</td>
                        <td className="px-3 py-2 border border-slate-200">
                          <span className="text-red-700">{row.required}</span>
                        </td>
                        <td className="px-3 py-2 border border-slate-200">
                          <span className="text-emerald-700">{row.optional}</span>
                        </td>
                        <td className="px-3 py-2 border border-slate-200">
                          <span className="text-amber-700">{row.conditional}</span>
                        </td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{row.validation}</td>
                        <td className="px-3 py-2 border border-slate-200">
                          <div className="flex flex-col gap-1">
                            {row.links.map(link => (
                              <a
                                key={link.label}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-[#003865] underline hover:text-blue-700 leading-snug"
                                title={`Open ADO Feature: ${link.label}`}
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Governance Clarification</p>
                <p className="text-xs text-amber-700">
                  Required, optional, conditional, and lineage-sensitive field expectations are currently governed within
                  DCT Feature definitions, Batch governance documentation, and supporting ADO stories. The Consumer
                  Integration Readiness initiative will consolidate these expectations into a more implementation-oriented
                  consumer reference model. <strong>Swagger schemas alone are not the complete governance contract.</strong>
                  Batch Features remain authoritative for conditional validation logic and lineage requirements.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — End-to-End Payload Walkthroughs                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="payload-walkthroughs">
          <Section id="s6" title="6 — End-to-End Payload Walkthroughs" badge="Examples" badgeColor="#0e7490">
            <p className="text-sm text-slate-600 mb-4">
              The following payload examples illustrate the authoritative request/response structure for each
              major integration flow. All IDs shown are representative — use the Known Integration Validation
              Dataset (Section 7) for actual test values.
            </p>

            {[
              {
                id: "A", name: "Normalization Flow", batch: "B1/B2",
                request: `POST /api/v1/Ingestion\n{\n  "clientId": "CLT-00042",\n  "entityId": "ENT-10019",\n  "documentTypeCode": "TRIAL_BALANCE",\n  "reportingPeriodId": "RP-2024-Q4",\n  "fileReference": "s3://dct-ingestion/tb-2024-q4.csv"\n}`,
                response: `{\n  "ingestionRunId": "IR-88821",\n  "documentId": "DOC-55310",\n  "entityId": "ENT-10019",\n  "status": "Processing",\n  "submittedAt": "2026-05-21T09:00:00Z"\n}`,
                lineage: "DocumentId → EntityId → ReportingPeriodId",
                required: ["clientId", "entityId", "documentTypeCode", "reportingPeriodId", "fileReference"],
                downstream: "GET /api/v1/data-records?entityId=ENT-10019&reportingPeriodId=RP-2024-Q4",
                next: "Step 2 — Retrieve normalized records once ingestion status = Completed",
              },
              {
                id: "B", name: "AI Proposal Flow", batch: "B4/B5",
                request: `GET /api/v1/ai-mapping-proposals\n?entityId=ENT-10019\n&reportingPeriodId=RP-2024-Q4\n&normalizedRecordId=NR-77201`,
                response: `{\n  "proposals": [\n    {\n      "proposalId": "PROP-33401",\n      "normalizedRecordId": "NR-77201",\n      "firmTaxonomyId": "FT-2024-CORP",\n      "taxTaxonomyAccountCode": "4100-REVENUE",\n      "confidenceScore": 0.94,\n      "confidenceBand": "EXACT",\n      "status": "Pending Review"\n    }\n  ]\n}`,
                lineage: "NormalizedRecordId → ProposalId → FirmTaxonomyId",
                required: ["entityId", "reportingPeriodId"],
                downstream: "POST /api/v1/review-tasks (assign to practitioner)",
                next: "Step 4 — Submit proposal decision after practitioner review",
              },
              {
                id: "C", name: "Mapping Decision Flow", batch: "B6",
                request: `POST /api/v1/proposal-decisions\n{\n  "proposalId": "PROP-33401",\n  "reviewTaskId": "RT-99102",\n  "decision": "ACCEPTED",\n  "decidedBy": "user@rsm.com",\n  "decidedAt": "2026-05-21T14:30:00Z"\n}`,
                response: `{\n  "decisionId": "DEC-44501",\n  "proposalId": "PROP-33401",\n  "decision": "ACCEPTED",\n  "status": "Immutable",\n  "taxReadyEligible": true\n}`,
                lineage: "ProposalId → DecisionId",
                required: ["proposalId", "reviewTaskId", "decision", "decidedBy", "decidedAt"],
                downstream: "GET /api/v1/tax-ready-records?entityId=ENT-10019",
                next: "Step 5 — Retrieve tax-ready records once all proposals decided",
              },
              {
                id: "D", name: "Tax Ready Record Flow", batch: "B7",
                request: `GET /api/v1/tax-ready-records\n?entityId=ENT-10019\n&reportingPeriodId=RP-2024-Q4`,
                response: `{\n  "taxReadyRecords": [\n    {\n      "taxReadyRecordId": "TRR-66701",\n      "entityId": "ENT-10019",\n      "reportingPeriodId": "RP-2024-Q4",\n      "decisionId": "DEC-44501",\n      "status": "Tax Ready",\n      "taxReadyDate": "2026-05-21T15:00:00Z"\n    }\n  ]\n}`,
                lineage: "DecisionId → TaxReadyRecordId",
                required: ["entityId", "reportingPeriodId"],
                downstream: "GET /api/v1/tax-form-lines?taxReadyRecordId=TRR-66701",
                next: "Step 6 — Resolve form lines for practitioner review rendering",
              },
              {
                id: "E", name: "Review Task Flow", batch: "B6",
                request: `POST /api/v1/review-tasks\n{\n  "proposalId": "PROP-33401",\n  "entityId": "ENT-10019",\n  "assignedUserId": "USR-12345",\n  "dueDate": "2026-05-28T00:00:00Z"\n}`,
                response: `{\n  "reviewTaskId": "RT-99102",\n  "proposalId": "PROP-33401",\n  "assignedUserId": "USR-12345",\n  "status": "Open",\n  "dueDate": "2026-05-28T00:00:00Z"\n}`,
                lineage: "ProposalId → ReviewTaskId",
                required: ["proposalId", "entityId", "assignedUserId"],
                downstream: "POST /api/v1/proposal-decisions (after review complete)",
                next: "Step 4 — Submit decision after practitioner completes review",
              },
            ].map(({ id, name, batch, request, response, lineage, required, downstream, next }) => (
              <div key={id} className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#0e7490" }}>{id}</span>
                  <span className="text-sm font-bold text-[#003865]">{name}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold ml-auto" style={{ background: "#d1fae5", color: "#065f46" }}>{batch}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Request</p>
                    <pre className="text-xs font-mono bg-slate-900 text-green-400 rounded p-2.5 overflow-x-auto whitespace-pre-wrap">{request}</pre>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Response</p>
                    <pre className="text-xs font-mono bg-slate-900 text-blue-300 rounded p-2.5 overflow-x-auto whitespace-pre-wrap">{response}</pre>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100 border-t border-slate-100">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">ID Lineage</p>
                    <p className="text-xs font-mono text-slate-600">{lineage}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Required Fields</p>
                    {required.map(f => <p key={f} className="text-xs font-mono text-red-700">{f}</p>)}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Downstream API</p>
                    <p className="text-xs font-mono text-blue-700">{downstream}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Next Step</p>
                    <p className="text-xs text-slate-600">{next}</p>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — Consumer Integration Test Dataset                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="test-dataset">
          <Section id="s7" title="7 — Consumer Integration Test Dataset" badge="QA / Testing" badgeColor="#059669">
            <p className="text-sm text-slate-600 mb-3">
              The following known integration validation dataset allows Roger and future consumers to validate
              joins, lineage traversal, UI rendering, pagination, and relationship chaining against a known
              authoritative state.
            </p>

            <Callout type="info" title="Known Integration Validation Dataset — Purpose">
              Use these values to validate that your consumer implementation correctly resolves the full lineage
              chain from DocumentId through to TaxReadyRecordId. All IDs are authoritative test values — do not
              modify or substitute them in validation scenarios.
            </Callout>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Known Test Entity</p>
                <div className="space-y-2">
                  {[
                    { label: "Client", value: "RSM Test Client — CATT Integration Validation" },
                    { label: "ClientId", value: "CLT-00042" },
                    { label: "EntityId", value: "ENT-10019" },
                    { label: "ReportingPeriodId", value: "RP-2024-Q4" },
                    { label: "FirmTaxonomyId", value: "FT-2024-CORP" },
                    { label: "DocumentId", value: "DOC-55310" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                      <span className="text-xs font-mono font-semibold text-[#003865] bg-white px-2 py-0.5 rounded border border-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Known Lineage Chain</p>
                <div className="space-y-2">
                  {[
                    { label: "ProposalId", value: "PROP-33401" },
                    { label: "DecisionId", value: "DEC-44501" },
                    { label: "TaxReadyRecordId", value: "TRR-66701" },
                    { label: "TaxFormId", value: "TF-88801" },
                    { label: "TaxFormLineId", value: "TFL-99201" },
                    { label: "ReviewTaskId", value: "RT-99102" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                      <span className="text-xs font-mono font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DataTable
              headers={["Validation Scenario", "IDs Required", "Expected Result", "Validates"]}
              rows={[
                ["Lineage traversal — full chain", "EntityId + ReportingPeriodId", "DocumentId → NormalizedRecordId → ProposalId → DecisionId → TaxReadyRecordId all resolve", "ID chain integrity"],
                ["Proposal retrieval", "EntityId + ReportingPeriodId + NormalizedRecordId", "PROP-33401 returned with EXACT confidence band (0.94)", "Proposal API + confidence scoring"],
                ["Decision immutability", "ProposalId PROP-33401", "DEC-44501 returned with status=Immutable. PUT/PATCH rejected with 409.", "Immutability enforcement"],
                ["Tax-ready state", "EntityId + ReportingPeriodId", "TRR-66701 returned with status=Tax Ready", "Tax-ready record resolution"],
                ["Form line resolution", "TaxReadyRecordId TRR-66701", "TFL-99201 returned with TaxTaxonomyAccountCode=4100-REVENUE", "Form line derivation"],
                ["Eligibility gate", "EntityId ENT-10019", "Entity in ELIGIBLE state — downstream APIs accessible", "Eligibility gate enforcement"],
                ["Pagination", "GET /api/v1/data-records?entityId=ENT-10019&pageSize=10", "First page of 10 records returned with continuation token", "Pagination + continuation token"],
                ["Review task assignment", "ProposalId PROP-33401", "RT-99102 returned with status=Open, assignedUserId=USR-12345", "Review task creation + assignment"],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 8 — API Maturity & Stability Matrix                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="maturity-matrix">
          <Section id="s8" title="8 — API Maturity & Stability Matrix" badge="Stability" badgeColor="#003865">
            <p className="text-sm text-slate-600 mb-3">
              The following matrix classifies each API endpoint by maturity and stability status.
              Consumers should only integrate against <strong>Stable</strong> or <strong>MVP</strong> endpoints
              for enterprise implementation work. Experimental and Future PI endpoints are subject to breaking changes.
              All data in this workspace is mock/seed data for readiness planning purposes only.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: "Stable", color: "#059669", bg: "#d1fae5", desc: "Enterprise-implementation-ready. No breaking changes without versioning." },
                { label: "MVP", color: "#1e40af", bg: "#dbeafe", desc: "Approved for 9/16 pilot. Stable within MVP scope." },
                { label: "Experimental", color: "#d97706", bg: "#fef3c7", desc: "Subject to change. Do not use for enterprise implementation integrations." },
                { label: "Future PI", color: "#6b7280", bg: "#f3f4f6", desc: "Not yet available. Planned for post-MVP delivery." },
                { label: "Internal Only", color: "#dc2626", bg: "#fee2e2", desc: "Not exposed to consumers. DCT internal use only." },
              ].map(({ label, color, bg, desc }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
                  <span className="font-bold">{label}</span>
                  <span className="text-xs opacity-70">— {desc}</span>
                </div>
              ))}
            </div>

            <DataTable
              headers={["Endpoint", "System", "Status", "Stability", "Consumer Safe", "PI Scope", "Notes"]}
              rows={[
                ["POST /api/v1/Ingestion", "PDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1", "Lineage anchor. DocumentId issued here."],
                ["GET /api/v1/data-records", "PDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1/2", "Primary normalized record retrieval."],
                ["GET /api/v1/firm-taxonomy", "TDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1", "FirmTaxonomyId resolution."],
                ["GET /api/v1/ai-mapping-proposals", "TDC/Orch", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1/2", "Proposal retrieval with confidence scoring."],
                ["POST /api/v1/proposal-decisions", "TDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 2", "Immutable decision submission."],
                ["GET /api/v1/tax-ready-records", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2", "Terminal lineage output."],
                ["GET /api/v1/tax-form-lines", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2/3", "Form line derivation from TaxReadyRecordId."],
                ["POST /api/v1/review-tasks", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2", "Review task creation and assignment."],
                ["GET /api/v1/exceptions", "TDC+PDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2 (B8)", "Exception identification surface."],
                ["POST /api/v1/remedy-actions", "TDC", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B8)", "Remediation workflow — in progress."],
                ["GET /api/v1/gateway/ims/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "IMS pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/gateway/cem/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "CEM pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/gateway/tim/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "TIM pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/engagement-identity", "TDC", <Badge label="Experimental" color="#d97706" />, "Subject to change", "No", "PI 3 (B12)", "EngagementId issuance — B12 scope."],
                ["GET /api/v1/rollforward", "TDC", <Badge label="Future PI" color="#6b7280" />, "Not available", "No", "PI 3+ (B31)", "Legacy tool carry-forward. B31 scope."],
                ["POST /api/v1/eods/*", "PDC", <Badge label="Future PI" color="#6b7280" />, "Not available", "No", "TBD", "eODS deferred. Gated on IMS readiness."],
                ["GET /api/v1/processing-runs/internal", "PDC", <Badge label="Internal Only" color="#dc2626" />, "Internal", "No", "All", "Internal processing state. Not for consumers."],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 9 — Known Consumer Enhancement Requests                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="enhancements">
          <Section id="s9" title="9 — Known Consumer Enhancement Requests" badge="Backlog" badgeColor="#d97706">
            <Callout type="info" title="Enhancement Request Governance Note">
              These items represent consumer enhancement requests and do not indicate absence of governed contracts.
              All current governed contracts are complete and consumer-safe. Enhancement requests are tracked for
              future PI consideration and are subject to architecture review before acceptance.
            </Callout>

            <DataTable
              headers={["Request", "Requested By", "Category", "Current State", "Priority", "Status", "Notes"]}
              rows={[
                ["Reverse lookup endpoint — resolve EntityId from TaxReadyRecordId", "Roger", "API Design", "Not available — forward traversal only", "High", <Badge label="Under Review" color="#d97706" />, "Architecture review required. Lineage direction is forward-only by design."],
                ["Schedule field enrichment on ReviewTask", "Roger", "Field Enrichment", "DueDate available. Recurrence/schedule not modeled.", "Medium", <Badge label="Backlogged" color="#6b7280" />, "Requires TDC data model extension. PI 3 candidate."],
                ["Pagination metadata improvements — total count + page info", "Roger", "Pagination", "Continuation token available. Total count not returned.", "High", <Badge label="Under Review" color="#d97706" />, "Total count adds query cost. Architecture decision pending."],
                ["Continuation token support on all list endpoints", "Roger", "Pagination", "Available on some endpoints. Not universal.", "Medium", <Badge label="In Progress" color="#003865" />, "Being standardized across all list endpoints in B10/B11."],
                ["Consumer convenience API — single-call entity summary", "Roger", "Consumer API", "Not available — requires multi-step traversal", "Low", <Badge label="Future PI" color="#6b7280" />, "Would aggregate EntityId + proposals + decisions + tax-ready in one call. Post-MVP."],
                ["Bulk proposal decision submission", "Roger", "Performance", "Single decision per call only", "Medium", <Badge label="Backlogged" color="#6b7280" />, "Batch decision endpoint not in current scope. PI 3+ candidate."],
                ["Proposal confidence band filter on list endpoint", "Roger", "Filtering", "Confidence score returned but not filterable", "Low", <Badge label="Backlogged" color="#6b7280" />, "Add ?confidenceBand=EXACT filter param. Low complexity."],
                ["TaxFormLine → source NormalizedRecord reverse link", "Roger", "Lineage", "Forward chain only. Reverse not available.", "Medium", <Badge label="Under Review" color="#d97706" />, "Useful for practitioner drill-down. Architecture review required."],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 10 — Governance Boundaries                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="gov-boundaries">
          <Section id="s10" title="10 — Governance Boundaries" badge="Ownership" badgeColor="#4c1d95">
            <p className="text-sm text-slate-600 mb-4">
              The following ownership matrix defines the authoritative boundary between DCT (PDC + TDC + Orchestrator)
              and Roger for every platform capability. This matrix is the governance reference for all scope
              discussions, ADO feature assignments, and PI planning decisions.
            </p>

            <DataTable
              headers={["Capability", "DCT Ownership", "Roger Ownership", "Shared Responsibility"]}
              rows={[
                ["Taxonomy governance", "TDC owns FirmTaxonomy, TaxTaxonomyAccount definitions. Immutable once published.", "Roger renders taxonomy labels. No write access.", "—"],
                ["Lineage", "DCT issues all lineage IDs. Lineage chain is authoritative and immutable.", "Roger traverses lineage chain. Does not modify or extend it.", "—"],
                ["Tax-ready outputs", "TDC determines tax-ready state. TaxReadyRecordId is the authoritative terminal output.", "Roger reads and renders tax-ready records. No write access.", "—"],
                ["UI orchestration", "—", "Roger owns all UI composition, page layout, navigation, and rendering decisions.", "—"],
                ["Workflow composition", "DCT defines workflow states (Open, Decided, Tax Ready, Signed Off).", "Roger composes UI workflows from DCT state. Roger does not define states.", "Roger may add consumer-side workflow steps that do not modify DCT state."],
                ["Paging behavior", "DCT provides continuation tokens and optional page size.", "Roger owns paging strategy, scroll behavior, and load-more UX.", "DCT and Roger align on continuation token contract."],
                ["Caching", "—", "Roger owns all consumer-side caching. DCT does not cache on Roger's behalf.", "Roger must respect DCT cache-control headers."],
                ["Proposal rendering", "TDC issues proposals with confidence scores and bands.", "Roger owns proposal card layout, sorting, and display logic.", "Roger must not modify confidence scores or bands in rendering."],
                ["Validation", "DCT validates all inbound data against governed schemas. Rejects invalid payloads.", "Roger validates consumer-side form inputs before submission.", "Both validate — DCT is the final authority."],
                ["Presentation logic", "—", "Roger owns all presentation logic, theming, and UX decisions.", "—"],
                ["Error handling", "DCT returns structured error responses (HTTP 400/403/404/409/422).", "Roger owns consumer-side error display and recovery UX.", "Both must implement error handling. DCT errors are authoritative."],
                ["Authentication", "PDC Gateway (B9) handles auth routing via Ocelot.", "Roger handles consumer-side token management and refresh.", "CEM pass-through via gateway handles user mapping."],
              ]}
            />

            <Callout type="boundary" title="Scope Drift Prevention">
              Any capability not listed under Roger Ownership above is owned by DCT. If a Roger team member
              requests a DCT change to support a Roger UI behavior, that request must be evaluated against
              this boundary matrix before acceptance. Consumer UI requirements do not drive DCT contract changes.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 11 — Open Questions / Pending Decisions                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="open-questions">
          <Section id="s11" title="11 — Open Questions / Pending Decisions" badge="Action Required" badgeColor="#dc2626">
            <p className="text-sm text-slate-600 mb-3">
              The following items are unresolved integration questions, pending architecture decisions, and
              future PI considerations that require PO, architecture, or engineering input before proceeding.
            </p>

            <DataTable
              headers={["#", "ADO Feature", "Question / Decision", "Category", "Owner", "Priority", "Status", "Target Resolution"]}
              rows={[
                ["1",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-IMS-Gate</a>,
                  "What is the IMS API contract readiness date? Does B10 gate need to be split into B10-core (proceed) and B10-IMS (hold)?", "Architecture Decision", "PO + IMS Team", "Critical", <Badge label="Open" color="#dc2626" />, "Before B10 gate sign-off"],
                ["2",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B12-Scope</a>,
                  "B12 manual write surface was dropped per Roadmap v4. Was this a formal ADO scope change or an informal decision? Needs documented scope change record.", "Governance Record", "BA + PO", "High", <Badge label="Open" color="#dc2626" />, "Before B12 batch start"],
                ["3",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B28-MVP</a>,
                  "Which specific stories from B14 and B15 are absorbed into B28? Roadmap v4 names reconciliation formulas and depreciation rule definitions — are these the complete MVP slices?", "Scope Boundary", "PO + Architecture", "High", <Badge label="Open" color="#dc2626" />, "Before B28 batch start"],
                ["4",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B39-MVP</a>,
                  "B39 (Calculation Report) is promoted to MVP with a hard 9/16 date. Is TDC engineering capacity confirmed for this promotion given existing PI 3 load?", "Resourcing", "PO + Engineering", "Critical", <Badge label="Open" color="#dc2626" />, "PI 3 planning"],
                ["5",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-API-Rev</a>,
                  "Reverse lookup endpoint (EntityId from TaxReadyRecordId) — is this a governance-safe operation or does it violate the forward-only lineage principle?", "Architecture Decision", "Architecture", "Medium", <Badge label="Under Review" color="#d97706" />, "PI 3 planning"],
                ["6",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-Paging</a>,
                  "Pagination total count — does returning total count on list endpoints create unacceptable query cost at scale? What is the acceptable performance threshold?", "Performance", "Engineering", "Medium", <Badge label="Under Review" color="#d97706" />, "B10/B11 batch"],
                ["7",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-ConvAPI</a>,
                  "Consumer convenience API (single-call entity summary) — is this a DCT responsibility or should Roger aggregate via multiple calls?", "Boundary Decision", "Architecture + Roger", "Low", <Badge label="Future PI" color="#6b7280" />, "Post-MVP PI planning"],
                ["8",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-eODS</a>,
                  "eODS integration — what is the current IMS readiness date that gates eODS? Is there a provisional PI 4 slot for eODS if IMS readiness is confirmed?", "Dependency Risk", "Architecture + IMS", "Medium", <Badge label="Watching" color="#6b7280" />, "PI 4 planning"],
                ["9",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B9-Contract</a>,
                  "B9 PDC Gateway Read Contract — what is the publication date for the versioned consumer surface? Roger cannot begin gateway integration without this contract.", "Contract Publication", "PDC + BA", "High", <Badge label="Open" color="#dc2626" />, "B9 gate sign-off"],
                ["10",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-GW-Ver</a>,
                  "Roger consumer surface versioning — how will the gateway version the IMS/CEM/TIM pass-through surfaces as underlying systems evolve?", "Architecture Decision", "Architecture", "Medium", <Badge label="Open" color="#dc2626" />, "B9 gate sign-off"],
              ]}
            />

            <Callout type="warning" title="Escalation Path">
              Items marked <strong>Critical</strong> or <strong>High</strong> with status <strong>Open</strong> require
              immediate PO or architecture review. These items are blocking downstream delivery or gate sign-off.
              Unresolved items should be raised in the next PI planning session or architecture review meeting.
            </Callout>
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 mt-4 pt-4 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Version + source metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#003865", color: "#fff" }}>
                  {HUB_VERSION}
                </span>
                <span className="text-xs text-slate-500">Consumer Integration Readiness Hub</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <FileText className="w-3 h-3" />
                <span>Source: <span className="font-semibold text-slate-600">{HUB_SOURCE}</span></span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Last updated: <span className="font-semibold text-slate-600">{HUB_UPDATED}</span></span>
              </div>
              <div className="text-xs text-slate-400">
                Author: <span className="font-semibold text-slate-600">{HUB_AUTHOR}</span>
              </div>
            </div>
            {/* Quick links */}
            <div className="flex items-center gap-3 text-xs">
              <Link href="/control-panel" className="text-[#003865] hover:underline">Control Panel</Link>
              <span className="text-slate-300">·</span>
              <Link href="/roger-consumer-readiness" className="text-[#003865] hover:underline">Consumer Readiness Center</Link>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-[#003865] hover:underline"
              >
                <Printer className="w-3 h-3" />
                Export PDF
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            DCT Platform · CATT · RSM US LLP · This document is a governance readiness reference as of {HUB_UPDATED}, based on {HUB_SOURCE}.
            This workspace is non-production. ADO Feature IDs are placeholders — update with actual ADO work item numbers before distributing.
            Do not treat this document as an authoritative operational record. Formal implementation occurs outside this workspace.
          </p>
        </div>

      {/* ── Section 12: Endpoint Readiness Matrix ─────────────────────────────── */}
      <Section id="s12" title="12. Roger Endpoint Readiness Matrix" badge={`${ENDPOINT_MATRIX_DATA.length} APIs`} badgeColor="#0369a1">
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 mb-3">Sourced from TDC Swagger v1.0.0 and PDC Swagger v1.0.0 (uploaded 2026-05-19). Status derived from DCT Control Panel batch gates.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  {["Batch","API","Path","Purpose","Status","Data","Gov Status","Blockers","Owner"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENDPOINT_MATRIX_DATA.map((row, i) => {
                  const s = READINESS_STYLES[row.status];
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-mono font-bold text-[#003865]">{row.batch}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{row.api}</td>
                      <td className="px-3 py-2 font-mono text-slate-500 text-[10px] whitespace-nowrap">{row.path}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs">{row.purpose}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.text }}>{row.status}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: row.data === "Real Data" ? "#dcfce7" : row.data === "Partial" ? "#fef9c3" : "#fee2e2", color: row.data === "Real Data" ? "#15803d" : row.data === "Partial" ? "#854d0e" : "#991b1b" }}>{row.data}</span></td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.govStatus}</td>
                      <td className="px-3 py-2 text-slate-600">{row.blockers}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{row.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── Section 13: Roger UI Screen Dependency Map ──────────────────────────── */}
      <Section id="s13" title="13. Roger UI Screen Dependency Map" badge={`${SCREEN_DEPS.length} screens`} badgeColor="#7c3aed">
        <div className="px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  {["Screen","APIs Required","Readiness","Data","Risks / Blockers"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCREEN_DEPS.map((row, i) => {
                  const s = READINESS_STYLES[row.readiness];
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{row.screen}</td>
                      <td className="px-3 py-2 text-slate-600">{row.apis.join(" · ")}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.text }}>{row.readiness}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: row.data === "Real Data" ? "#dcfce7" : row.data === "Partial" ? "#fef9c3" : "#fee2e2", color: row.data === "Real Data" ? "#15803d" : row.data === "Partial" ? "#854d0e" : "#991b1b" }}>{row.data}</span></td>
                      <td className="px-3 py-2 text-slate-600">{row.risks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── Section 14: Integration Risks ───────────────────────────────────────── */}
      <Section id="s14" title="14. Integration Risks" badge={`${INTEGRATION_RISKS_DATA.length} risks`} badgeColor="#dc2626">
        <div className="px-5 py-4 space-y-3">
          {INTEGRATION_RISKS_DATA.map(risk => {
            const lvlColor = risk.level === "Critical" ? "#dc2626" : risk.level === "High" ? "#ea580c" : risk.level === "Medium" ? "#d97706" : "#16a34a";
            return (
              <div key={risk.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={{ background: lvlColor + "18", color: lvlColor, border: `1px solid ${lvlColor}44` }}>{risk.level}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{risk.id}</span>
                      <span className="text-sm font-bold text-slate-800">{risk.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{risk.description}</p>
                    <p className="text-xs text-emerald-700"><span className="font-semibold">Resolution:</span> {risk.resolution}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Section 15: Open ADRs ────────────────────────────────────────────────── */}
      <Section id="s15" title="15. Open Decisions & ADRs" badge={`${OPEN_ADRS_DATA.filter(a => a.status !== "Resolved").length} open`} badgeColor="#7c3aed">
        <div className="px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  {["ID","Title","Status","Impact","Blocking","Description"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPEN_ADRS_DATA.map((adr, i) => {
                  const stColor = adr.status === "Open" ? { bg: "#fee2e2", text: "#991b1b" } : adr.status === "In Review" ? { bg: "#fef9c3", text: "#854d0e" } : { bg: "#dcfce7", text: "#15803d" };
                  const impColor = adr.impact === "Critical" ? "#dc2626" : adr.impact === "High" ? "#ea580c" : adr.impact === "Medium" ? "#d97706" : "#16a34a";
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-mono font-bold text-[#003865]">{adr.id}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{adr.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: stColor.bg, color: stColor.text }}>{adr.status}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs font-bold" style={{ color: impColor }}>{adr.impact}</span></td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{adr.blocking}</td>
                      <td className="px-3 py-2 text-slate-600">{adr.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── Section 16: Next Actions ─────────────────────────────────────────────── */}
      <Section id="s16" title="16. Next Actions" badge={`${NEXT_ACTIONS_DATA.length} actions`} badgeColor="#059669">
        <div className="px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  {["Action","Owner","Status","Impact","ADO Ref"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NEXT_ACTIONS_DATA.map((row, i) => {
                  const stColor = row.status === "In Progress" ? { bg: "#dbeafe", text: "#1d4ed8" } : row.status === "Open" ? { bg: "#fef9c3", text: "#854d0e" } : { bg: "#dcfce7", text: "#15803d" };
                  const impColor = row.impact === "Critical" ? "#dc2626" : row.impact === "High" ? "#ea580c" : row.impact === "Medium" ? "#d97706" : "#16a34a";
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 text-slate-700">{row.action}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{row.owner}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: stColor.bg, color: stColor.text }}>{row.status}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs font-bold" style={{ color: impColor }}>{row.impact}</span></td>
                      <td className="px-3 py-2 font-mono text-slate-500">{row.adoRef}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      </div>
    </div>
  );
}

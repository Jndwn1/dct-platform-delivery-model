/**
 * Roger Consumer Readiness Center
 *
 * Single source of truth for the Roger team, POs, QA, Architects, and leadership.
 * Answers: What can Roger consume? What is blocked? What is mock/demo only?
 * What governance dependencies exist? What is production-ready vs future-state?
 *
 * 11 Sections:
 *   1. Executive Summary
 *   2. Roger Endpoint Readiness Matrix
 *   3. Roger UI Dependency Map
 *   4. Consumer Readiness vs Platform Readiness
 *   5. Data Availability Status
 *   6. Gateway Access Model
 *   7. Governance & Ownership
 *   8. Roger Integration Risks
 *   9. Demo Readiness
 *  10. Open Decisions & ADRs
 *  11. Next Actions
 */

import React, { useState, useMemo } from "react";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, AlertCircle, Shield, Zap,
  ArrowRight, ArrowDown, Info, Copy, Filter, Activity,
  Database, Lock, Globe, Users, FileText, Star, Target,
  TrendingUp, Layers, GitBranch, Radio,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

type ReadinessStatus = "Consumer Ready" | "Delivered" | "Mock Only" | "Partial Data" | "Draft Contract" | "Governance Pending" | "Blocked" | "Future State";
type DataStatus = "Real Data" | "Mock Data" | "Partial" | "Seeded" | "None";
type RiskLevel = "Critical" | "High" | "Medium" | "Low";
type DemoStatus = "Demo Ready" | "Mocked" | "Partial" | "Conceptual" | "Production Ready";
type AdrStatus = "Open" | "In Review" | "Resolved" | "Blocked";

const READINESS_STYLES: Record<ReadinessStatus, { bg: string; text: string; border: string; label: string }> = {
  "Consumer Ready":    { bg: "#d1fae5", text: "#065f46", border: "#34d399", label: "Consumer Ready" },
  "Delivered":         { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa", label: "Delivered" },
  "Mock Only":         { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", label: "Mock Only" },
  "Partial Data":      { bg: "#fef9c3", text: "#854d0e", border: "#fbbf24", label: "Partial Data" },
  "Draft Contract":    { bg: "#ede9fe", text: "#5b21b6", border: "#a78bfa", label: "Draft Contract" },
  "Governance Pending":{ bg: "#fff7ed", text: "#9a3412", border: "#fb923c", label: "Gov. Pending" },
  "Blocked":           { bg: "#fee2e2", text: "#991b1b", border: "#f87171", label: "Blocked" },
  "Future State":      { bg: "#f1f5f9", text: "#475569", border: "#94a3b8", label: "Future State" },
};

const DATA_STYLES: Record<DataStatus, { bg: string; text: string }> = {
  "Real Data":  { bg: "#d1fae5", text: "#065f46" },
  "Mock Data":  { bg: "#fef3c7", text: "#92400e" },
  "Partial":    { bg: "#fef9c3", text: "#854d0e" },
  "Seeded":     { bg: "#dbeafe", text: "#1e40af" },
  "None":       { bg: "#fee2e2", text: "#991b1b" },
};

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string }> = {
  "Critical": { bg: "#fee2e2", text: "#991b1b" },
  "High":     { bg: "#ffedd5", text: "#9a3412" },
  "Medium":   { bg: "#fef9c3", text: "#854d0e" },
  "Low":      { bg: "#f1f5f9", text: "#475569" },
};

const DEMO_STYLES: Record<DemoStatus, { bg: string; text: string }> = {
  "Production Ready": { bg: "#d1fae5", text: "#065f46" },
  "Demo Ready":       { bg: "#dbeafe", text: "#1e40af" },
  "Partial":          { bg: "#fef9c3", text: "#854d0e" },
  "Mocked":           { bg: "#fef3c7", text: "#92400e" },
  "Conceptual":       { bg: "#f1f5f9", text: "#475569" },
};

// ── Swagger Snapshot Metadata ─────────────────────────────────────────────────
const SWAGGER_SOURCES = [
  { name: "TDC-Api",                  file: "pasted_content_49.txt (TDC Swagger)",  server: "https://dev-tdc.api.rsmus.com", version: "1.0.0", uploadDate: "2026-05-19", totalEndpoints: 141, tags: 35 },
  { name: "RSM.TaxSolutions.PDC.Api", file: "pasted_content_50.txt (PDC Swagger)",  server: "https://dev-pdc.api.rsmus.com", version: "1.0.0", uploadDate: "2026-05-19", totalEndpoints: 63,  tags: 15 },
];

// Section 2 — Endpoint Readiness Matrix
// Paths sourced directly from uploaded Swagger JSON snapshots (TDC v1.0.0, PDC v1.0.0)
// Last Swagger upload: 2026-05-19 | Status source: DCT Control Panel
const ENDPOINT_MATRIX = [
  // ── PDC Endpoints ──────────────────────────────────────────────────────────
  { batch: "FC",  api: "File Ingestion Status",       path: "GET /api/v1/Ingestion/{runId}",                    purpose: "Track ingestion job state by run ID",                       capability: "View ingestion run status and processing state",        status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B1",  api: "Lineage Anchor (Processing Run)", path: "GET /api/v1/processing-runs/{id}",             purpose: "DocumentId → EntityId → PeriodStart/End lineage",          capability: "Resolve lineage for a document run",                   status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B1",  api: "Processing Run by Ingestion",  path: "GET /api/v1/processing-runs/by-ingestion/{ingestionRunId}/latest", purpose: "Latest processing run for an ingestion run", capability: "Confirm processing completed for ingestion",           status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B2",  api: "Normalized Trial Balance",     path: "GET /api/v1/data-records",                        purpose: "vNormalizedTb financial data records",                      capability: "Display TB data in Roger",                             status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B2A", api: "FirmTaxonomyId on Data Records", path: "GET /api/v1/data-records",                    purpose: "Enforce FirmTaxonomyId classification presence",           capability: "Filter records by firm taxonomy",                      status: "Partial Data" as ReadinessStatus,       data: "Partial" as DataStatus,    govStatus: "Field pending Orchestrator", blockers: "Orchestrator not returning FirmTaxonomyId in payload",   owner: "PDC + Orchestrator", swaggerSource: "PDC" },
  { batch: "B5",  api: "Client List",                  path: "GET /api/v1/clients",                             purpose: "Retrieve all active clients for current user",             capability: "Populate client selector in Roger",                    status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "Legal Entity by Client",       path: "GET /api/v1/legal-entities",                      purpose: "All legal entities for a client",                          capability: "Resolve entity context and legal structure in Roger",  status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "Legal Entity by ID",           path: "GET /api/v1/legal-entities/{id}",                 purpose: "Single legal entity by unique identifier",                 capability: "Resolve individual entity details",                    status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "Jurisdiction Assignments",     path: "GET /api/v1/jurisdiction-assignments",            purpose: "Jurisdiction assignments for an entity",                   capability: "Show entity jurisdiction context in Roger",            status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "Ownership Relationships",      path: "GET /api/v1/ownership-relationships/by-parent/{parentEntityId}", purpose: "Entity ownership hierarchy", capability: "Display entity ownership structure",                   status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "Taxonomy Concepts",            path: "GET /api/v1/taxonomy/concepts",                   purpose: "All active taxonomy concepts",                             capability: "Populate taxonomy dropdowns in Roger",                 status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  { batch: "B5",  api: "File Schemas",                 path: "GET /api/v1/file-schemas",                        purpose: "All active file schema versions",                          capability: "Validate file format before upload",                   status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "PDC",  swaggerSource: "PDC" },
  // ── TDC Endpoints ──────────────────────────────────────────────────────────
  { batch: "B3",  api: "TDC Reference Data (Orchestrator-facing)", path: "GET /api/v1/reference-data", purpose: "Complete reference data contract by return type, jurisdiction, tax year", capability: "Read reference data via Orchestrator", status: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  govStatus: "Orchestrator-facing Read Contract", blockers: "Not Roger-facing directly — consumed via Orchestrator", owner: "TDC", swaggerSource: "TDC" },
  { batch: "B3",  api: "Tax Forms",                    path: "GET /api/TaxForms",                               purpose: "Tax forms by return type, jurisdiction, tax year",         capability: "Display tax form options in Roger",                    status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B3",  api: "Tax Form Lines",               path: "GET /api/tax-forms/{formId}/lines",               purpose: "All lines for a given tax form",                           capability: "Display form line details in Roger",                   status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B3",  api: "Mapping Rules",                path: "GET /api/MappingRules",                           purpose: "Mapping rules by rule type, jurisdiction, tax year",       capability: "Show mapping rule context in Roger",                   status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B3",  api: "Return Templates",             path: "GET /api/ReturnTemplates",                        purpose: "Return templates by return type, jurisdiction, tax year",  capability: "Display return template options",                      status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B4",  api: "AI Mapping Proposals",         path: "GET /api/v1/ai-mapping-proposals",                purpose: "AI proposals by tax year, client, entity",                 capability: "Show AI mapping suggestions in Roger",                 status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B4",  api: "Proposal Decisions (Confirmed)", path: "GET /api/v1/proposal-decisions/confirmed",    purpose: "Confirmed proposal decisions by client/entity",            capability: "Show confirmed mapping decisions in Roger",            status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Adjustments by Entity Scope",  path: "GET /api/Adjustments",                            purpose: "All adjustments by entityId and taxYear",                  capability: "Display adjustment history in Roger",                  status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Adjustment by ID",             path: "GET /api/Adjustments/{id}",                       purpose: "Single adjustment with predecessor chain",                 capability: "View adjustment detail and lineage",                   status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Review Tasks",                 path: "GET /api/v1/review-tasks",                        purpose: "Review tasks for entity and tax year scope",               capability: "Display practitioner review queue in Roger",           status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Flag & Review Queue",          path: "GET /api/v1/flag-and-review",                     purpose: "Practitioner Flag & Review queue for an entity",           capability: "Show flagged items for practitioner review",           status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Entity Review Status",         path: "GET /api/v1/entity-review-status",                purpose: "Aggregate review status for entity and tax year",          capability: "Show review completion status in Roger",               status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B6",  api: "Sign-Off Attestations",        path: "GET /api/v1/sign-off",                            purpose: "Sign-off attestation records for entity and tax year",     capability: "Display sign-off status in Roger",                     status: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus,  govStatus: "Role assignment unresolved", blockers: "Role assignment ownership not defined",                 owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B7",  api: "Entity Finalization State",    path: "GET /api/v1/entity-finalization",                 purpose: "Finalization state for entity and tax year",               capability: "Show finalization status in Roger",                    status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B7",  api: "Tax Profile Determinations",   path: "GET /api/v1/tax-profile-determinations",          purpose: "Tax profile determinations for entity scope",              capability: "Show client tax profile context in Roger",             status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B7",  api: "Controlled Group Determinations", path: "GET /api/v1/controlled-group-determinations", purpose: "Active controlled-group determinations for entity",        capability: "Show controlled group context in Roger",               status: "Consumer Ready" as ReadinessStatus,     data: "Real Data" as DataStatus,  govStatus: "G3 Contract Published",      blockers: "None",                                                  owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B8",  api: "Exception Records (TDC Read)",  path: "GET /api/v1/TdcExceptionsRead",                   purpose: "Read exception records (TDC read contract)",               capability: "View exception records in Roger",                      status: "Draft Contract" as ReadinessStatus,     data: "None" as DataStatus,       govStatus: "In Development",             blockers: "Contract not yet published — B8 gate not passed",       owner: "TDC",  swaggerSource: "TDC" },
  { batch: "B9",  api: "Gateway Read Contract (IMS/CEM/TIM pass-through)", path: "GET /api/v1/gateway/* (Ocelot)",         purpose: "Roger and all consumers call the gateway — not underlying systems directly",  capability: "Roger accesses IMS/CEM/TIM data via governed gateway pass-through",  status: "Future State" as ReadinessStatus,       data: "None" as DataStatus,       govStatus: "Planned — PI 2 Stretch",         blockers: "B9 PDC not started — Gateway Read Contract not yet published",            owner: "PDC",  swaggerSource: "N/A" },
  { batch: "B10", api: "Return Assembly & Lineage",    path: "GET /api/v1/return-assembly (planned)",           purpose: "Assembled return with lineage trace",                      capability: "View assembled return in Roger",                       status: "Future State" as ReadinessStatus,       data: "None" as DataStatus,       govStatus: "Planned — PI 3",             blockers: "Not yet in scope",                                      owner: "TDC",  swaggerSource: "N/A" },
];

// Section 3 — Roger UI Dependency Map
const SCREEN_DEPENDENCIES = [
  { screen: "Dashboard",         apis: ["File Ingestion Status", "Entity Identity & Structure"],                                    readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Client List",       apis: ["Entity Identity & Structure", "Client Tax Profile"],                                       readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Work Queue",        apis: ["Practitioner Review Queue", "Entity Identity & Structure"],                                readiness: "Governance Pending" as ReadinessStatus, data: "Mock Data" as DataStatus, risks: "Role assignment ownership unresolved [BLOCKING]" },
  { screen: "Filing Review",     apis: ["Normalized Trial Balance", "AI Mapping Proposals", "Client Tax Profile"],                  readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Eligibility",       apis: ["Client Tax Profile", "AI Mapping Proposals"],                                              readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Adjustments",       apis: ["Normalized Trial Balance", "FirmTaxonomyId Enforcement"],                                  readiness: "Partial Data" as ReadinessStatus,   data: "Partial" as DataStatus,    risks: "FirmTaxonomyId field missing from Orchestrator [WARNING]" },
  { screen: "Upload Experience", apis: ["File Ingestion Status", "Lineage Anchor"],                                                 readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "None" },
  { screen: "Entity Review",     apis: ["Entity Identity & Structure", "FirmTaxonomyId Enforcement"],                               readiness: "Partial Data" as ReadinessStatus,   data: "Partial" as DataStatus,    risks: "FirmTaxonomyId not yet returned by Orchestrator [WARNING]" },
  { screen: "Tax Mapping",       apis: ["Tax Form Templates", "AI Mapping Proposals", "Client Tax Profile"],                        readiness: "Consumer Ready" as ReadinessStatus, data: "Real Data" as DataStatus,  risks: "Tax Form Templates are Orchestrator-facing only — Roger reads via TDC Read Contract" },
  { screen: "Exception Mgmt",    apis: ["Exception Record", "Remedy Action", "Re-ingestion Trigger"],                               readiness: "Blocked" as ReadinessStatus,        data: "None" as DataStatus,       risks: "All B8 APIs in Draft Contract state. Roger cannot consume until G3 gate passed [BLOCKING]" },
];

// Section 4 — Consumer vs Platform Readiness
const CONSUMER_VS_PLATFORM = [
  { capability: "File Ingestion Status",    platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. Roger can call GET /api/v1/ingestion/{runId} directly." },
  { capability: "Lineage Anchor",           platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. DocumentId → EntityId → PeriodStart/End available." },
  { capability: "Normalized Trial Balance", platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. vNormalizedTb schema stable and additive-only." },
  { capability: "FirmTaxonomyId",           platformExists: true,  rogerConsumable: false, reason: "API exists but Orchestrator is not yet returning FirmTaxonomyId in payload. Field pending." },
  { capability: "AI Mapping Proposals",     platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. Confidence + evidence fields available." },
  { capability: "Entity Identity",          platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. EntityId, FirmId, legal structure stable." },
  { capability: "Practitioner Review Queue",platformExists: true,  rogerConsumable: false, reason: "API exists but role assignment ownership is unresolved. No governance approval for Roger consumption." },
  { capability: "Client Tax Profile",       platformExists: true,  rogerConsumable: true,  reason: "Published Read Contract. Tax year, jurisdiction, filing status available." },
  { capability: "Exception Record",         platformExists: false, rogerConsumable: false, reason: "In development. Draft contract only. Roger cannot consume until G3 gate passed." },
  { capability: "Remedy Action",            platformExists: false, rogerConsumable: false, reason: "In development. Depends on Exception Record contract publication." },
  { capability: "Re-ingestion Trigger",     platformExists: false, rogerConsumable: false, reason: "Not yet designed. Blocked until B8 exception flow is complete." },
  { capability: "Rollforward / Prior Year", platformExists: false, rogerConsumable: false, reason: "Planned for PI 3. Not yet in scope." },
];

// Section 5 — Data Availability
const DATA_AVAILABILITY = [
  { api: "File Ingestion Status",       realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "Operational data available via PDC ingestion pipeline" },
  { api: "Lineage Anchor",              realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "DocumentId → EntityId linkage validated in B1" },
  { api: "Normalized Trial Balance",    realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "vNormalizedTb schema stable. Seeded with test client data." },
  { api: "FirmTaxonomyId",              realData: false, mockData: true,  samplePayload: false, pipelineValidated: false, notes: "Field not yet returned by Orchestrator. Mock only in UAT." },
  { api: "AI Mapping Proposals",        realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "Confidence + evidence data available from TDC." },
  { api: "Entity Identity",             realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "EntityId, FirmId stable. Legal structure data available." },
  { api: "Practitioner Review Queue",   realData: false, mockData: true,  samplePayload: false, pipelineValidated: false, notes: "Mock data only. Role assignment not yet provisioned." },
  { api: "Client Tax Profile",          realData: true,  mockData: false, samplePayload: true,  pipelineValidated: true,  notes: "Tax year, jurisdiction, filing status available from TDC." },
  { api: "Exception Record",            realData: false, mockData: false, samplePayload: false, pipelineValidated: false, notes: "In development. No data available yet." },
  { api: "Remedy Action",               realData: false, mockData: false, samplePayload: false, pipelineValidated: false, notes: "In development. Depends on Exception Record." },
];

// Section 7 — Governance & Ownership
const GOVERNANCE_OWNERSHIP = [
  { domain: "Entity Structure",     owner: "PDC",          accessType: "Read Contract",   notes: "PDC is system of record. Roger reads via published contract." },
  { domain: "Filing Status",        owner: "TDC",          accessType: "Read Contract",   notes: "TDC owns tax authority. Roger reads via TDC Read Contract." },
  { domain: "Adjustments",          owner: "PDC + TDC",    accessType: "Read Contract",   notes: "Financial adjustments in PDC, tax adjustments in TDC. Roger reads both." },
  { domain: "Eligibility",          owner: "TDC",          accessType: "Read Contract",   notes: "TDC determines eligibility. Roger does not derive eligibility." },
  { domain: "Tax Mapping",          owner: "TDC",          accessType: "Read Contract",   notes: "TDC owns tax mapping rules and AI proposals. Roger reads only." },
  { domain: "Lineage",              owner: "PDC",          accessType: "Read Contract",   notes: "PDC owns lineage. Roger does not own lineage governance." },
  { domain: "Work Queue Data",      owner: "Unresolved",   accessType: "Pending",         notes: "Role assignment ownership not yet defined. Governance decision pending." },
  { domain: "Exception Records",    owner: "PDC",          accessType: "In Development",  notes: "PDC owns exception records. Roger will consume via B8 Read Contract." },
  { domain: "Rollforward Data",     owner: "PDC",          accessType: "Future State",    notes: "Planned for PI 3. Roger will consume via future Read Contract." },
];

// Section 8 — Integration Risks
const INTEGRATION_RISKS = [
  { id: "IR-01", title: "FirmTaxonomyId Missing from Orchestrator",    level: "High" as RiskLevel,     category: "Payload Gap",          description: "Orchestrator is not returning FirmTaxonomyId in normalized records. Roger Adjustments and Entity Review screens depend on this field.", resolution: "Orchestrator team to add FirmTaxonomyId to payload. ADO #1370843.", screens: ["Adjustments", "Entity Review"] },
  { id: "IR-02", title: "Role Assignment Ownership Unresolved",        level: "Critical" as RiskLevel, category: "Governance Gap",        description: "Work Queue API exists but no team has been assigned ownership of role assignment logic. Roger cannot consume without governance approval.", resolution: "Governance decision required: PDC vs TDC vs Roger ownership. Escalate to architecture.", screens: ["Work Queue"] },
  { id: "IR-03", title: "B8 Exception APIs Not Yet Published",         level: "High" as RiskLevel,     category: "Contract Gap",          description: "Exception Record, Remedy Action, and Re-ingestion Trigger are in draft. Roger Exception Management screen is fully blocked.", resolution: "B8 must pass G3 Contract Publication gate before Roger can consume.", screens: ["Exception Mgmt"] },
  { id: "IR-04", title: "tax_year Field Naming Inconsistency",         level: "Medium" as RiskLevel,   category: "Contract Instability",  description: "tax_year uses camelCase in some endpoints and snake_case in others. Roger UI must not hardcode field names until contract is stabilized.", resolution: "Normalize to snake_case across all TDC contracts. ADO #1349152.", screens: ["Tax Mapping", "Filing Review"] },
  { id: "IR-05", title: "PeriodStart/End Not Referenced in Swagger",   level: "Medium" as RiskLevel,   category: "Swagger Gap",           description: "PeriodStart and PeriodEnd fields are in the data model but not referenced in Swagger schema. Roger cannot rely on these fields.", resolution: "Add PeriodStart/PeriodEnd to Swagger schema for lineage endpoints.", screens: ["Upload Experience", "Entity Review"] },
  { id: "IR-06", title: "Read/Write Contract Distinction Missing",     level: "Medium" as RiskLevel,   category: "Governance Gap",        description: "Some endpoints do not clearly distinguish Read Contract from Write Contract. Roger must only consume Read Contracts.", resolution: "Architect to add Read/Write distinction to all published contracts.", screens: ["All screens"] },
  { id: "IR-07", title: "Gateway Routing Strategy Not Finalized",      level: "High" as RiskLevel,     category: "Architecture Gap",      description: "Roger Gateway routing strategy is not finalized. Roger UI may be calling PDC/TDC APIs directly without proper gateway mediation.", resolution: "ADR required: Gateway routing strategy. Escalate to architecture team.", screens: ["All screens"] },
  { id: "IR-08", title: "Authentication Provisioning for Roger",       level: "High" as RiskLevel,     category: "Auth Gap",              description: "Roger authentication against PDC/TDC APIs is not yet provisioned in UAT. Demo uses mock auth.", resolution: "Auth provisioning request to platform team. Required before UAT.", screens: ["All screens"] },
];

// Section 9 — Demo Readiness
const DEMO_READINESS = [
  { capability: "File Ingestion Status",     demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. Fully operational." },
  { capability: "Lineage Anchor",            demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. Fully operational." },
  { capability: "Normalized Trial Balance",  demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. Seeded with test clients." },
  { capability: "FirmTaxonomyId",            demoReady: "Mocked" as DemoStatus,        prodReady: "Conceptual" as DemoStatus,       notes: "Mock only. Field not yet returned by Orchestrator." },
  { capability: "AI Mapping Proposals",      demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. Confidence + evidence available." },
  { capability: "Entity Identity",           demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. EntityId stable." },
  { capability: "Work Queue",                demoReady: "Mocked" as DemoStatus,        prodReady: "Conceptual" as DemoStatus,       notes: "Mock data. Role assignment governance pending." },
  { capability: "Client Tax Profile",        demoReady: "Demo Ready" as DemoStatus,    prodReady: "Production Ready" as DemoStatus, notes: "Real data. Tax year, jurisdiction available." },
  { capability: "Exception Management",      demoReady: "Conceptual" as DemoStatus,    prodReady: "Conceptual" as DemoStatus,       notes: "B8 in development. Not available for demo." },
  { capability: "Rollforward / Prior Year",  demoReady: "Conceptual" as DemoStatus,    prodReady: "Conceptual" as DemoStatus,       notes: "Planned PI 3. Not yet in scope." },
];

// Section 10 — Open ADRs
const OPEN_ADRS = [
  { id: "ADR-01", title: "Filing Signoff Ownership",           status: "Open" as AdrStatus,      impact: "High",   blocking: "Work Queue, Filing Review",  description: "Who owns the filing signoff decision — TDC or Roger? Unresolved." },
  { id: "ADR-02", title: "Identity Reconciliation Strategy",   status: "In Review" as AdrStatus, impact: "High",   blocking: "Entity Review, Client List", description: "How are EntityId conflicts resolved across PDC and TDC? Strategy pending." },
  { id: "ADR-03", title: "Gateway Routing Strategy",           status: "Open" as AdrStatus,      impact: "Critical", blocking: "All Roger screens",        description: "Roger Gateway routing strategy not finalized. Direct vs mediated API calls." },
  { id: "ADR-04", title: "Role Assignment Ownership",          status: "Open" as AdrStatus,      impact: "Critical", blocking: "Work Queue",               description: "Which team owns role assignment logic for practitioner work queue?" },
  { id: "ADR-05", title: "Event-Driven Synchronization",       status: "Open" as AdrStatus,      impact: "Medium", blocking: "Dashboard, Work Queue",      description: "Should Roger UI use polling or event-driven updates for real-time data?" },
  { id: "ADR-06", title: "Additive-Only Contract Enforcement", status: "In Review" as AdrStatus, impact: "Medium", blocking: "All contracts",              description: "Process for enforcing additive-only constraint across all published contracts." },
];

// Section 11 — Next Actions
const NEXT_ACTIONS = [
  { action: "Request FirmTaxonomyId payload from Orchestrator",  owner: "Orchestrator Team", status: "In Progress", impact: "High",   adoRef: "#1370843" },
  { action: "Resolve role assignment ownership for Work Queue",   owner: "Architecture",      status: "Open",        impact: "Critical", adoRef: "—" },
  { action: "Publish B8 Exception Record Read Contract (G3)",     owner: "PDC BA",            status: "In Progress", impact: "High",   adoRef: "#B8" },
  { action: "Finalize Gateway routing strategy (ADR-03)",         owner: "Architecture",      status: "Open",        impact: "Critical", adoRef: "—" },
  { action: "Normalize tax_year field naming across TDC contracts", owner: "TDC BA",          status: "Open",        impact: "Medium", adoRef: "#1349152" },
  { action: "Add PeriodStart/PeriodEnd to Swagger schema",        owner: "PDC BA",            status: "Open",        impact: "Medium", adoRef: "—" },
  { action: "Provision Roger auth against PDC/TDC in UAT",        owner: "Platform Team",     status: "Open",        impact: "High",   adoRef: "—" },
  { action: "Add Read/Write contract distinction to all contracts", owner: "Architecture",    status: "Open",        impact: "Medium", adoRef: "—" },
  { action: "Request sample payload for Exception Record API",    owner: "Roger BA",          status: "Open",        impact: "Medium", adoRef: "—" },
  { action: "Validate consumer guide for AI Mapping Proposals",   owner: "Roger BA",          status: "Open",        impact: "Low",    adoRef: "#1349156" },
];

// ── Batch label → context key mapping (matches Control Panel logic) ─────────
function batchShortToKey(batch: string): string {
  const b = batch.trim().toUpperCase();
  if (b === "FC") return "foundation-core";
  const m = batch.trim().match(/^B([0-9]+[A-Za-z]?)$/i);
  if (m) return m[1].toLowerCase();
  return batch.trim().toLowerCase();
}

// Derive ReadinessStatus from live batch context status
function deriveReadiness(batchKey: string, statuses: Record<string, string>, baseStatus: ReadinessStatus): ReadinessStatus {
  const s = statuses[batchKey];
  if (!s) return baseStatus;
  if (s === "Complete" || s === "Delivered") return "Consumer Ready";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") {
    if (baseStatus === "Future State") return "Draft Contract";
    if (baseStatus === "Governance Pending" || baseStatus === "Blocked") return "Governance Pending";
    return "Partial Data";
  }
  if (s === "Blocked") return "Blocked";
  return baseStatus;
}

// Derive DataStatus from live batch context status
function deriveDataStatus(batchKey: string, statuses: Record<string, string>, baseData: DataStatus): DataStatus {
  const s = statuses[batchKey];
  if (!s) return baseData;
  if (s === "Complete" || s === "Delivered") return "Real Data";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") return "Partial";
  if (s === "Blocked") return baseData;
  return baseData;
}

// ── Helper Components ─────────────────────────────────────────────────────────

function ReadinessBadge({ status }: { status: ReadinessStatus }) {
  const s = READINESS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {(status === "Consumer Ready" || status === "Delivered") && <CheckCircle2 className="w-3 h-3" />}
      {(status === "Blocked") && <XCircle className="w-3 h-3" />}
      {(status === "Governance Pending" || status === "Draft Contract") && <Clock className="w-3 h-3" />}
      {(status === "Mock Only" || status === "Partial Data") && <AlertTriangle className="w-3 h-3" />}
      {(status === "Future State") && <Clock className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function DataBadge({ status }: { status: DataStatus }) {
  const s = DATA_STYLES[status];
  return (
    <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>{status}</span>
  );
}

function DemoBadge({ status }: { status: DemoStatus }) {
  const s = DEMO_STYLES[status];
  return (
    <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>{status}</span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLES[level];
  return (
    <span className="inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>{level}</span>
  );
}

function SectionHeader({ num, title, icon, count }: { num: number; title: string; icon: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0"
        style={{ background: "#1e3a5f" }}>{num}</div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {count && <span className="text-xs text-slate-400 font-medium ml-1">{count}</span>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RogerConsumerReadinessCenter() {
  const [matrixFilter, setMatrixFilter] = useState<ReadinessStatus | "All">("All");
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
  const [copiedMatrix, setCopiedMatrix] = useState(false);

  // ── Live batch status from Control Panel ─────────────────────────────────
  const { statuses } = useBatchStatus();
  const liveStatuses = statuses as unknown as Record<string, string>;

  // ── Live Endpoint Matrix — status + data derived from batch context ───────
  const liveEndpointMatrix = useMemo(() =>
    ENDPOINT_MATRIX.map(row => {
      const key = batchShortToKey(row.batch);
      return {
        ...row,
        status: deriveReadiness(key, liveStatuses, row.status),
        data: deriveDataStatus(key, liveStatuses, row.data),
      };
    }),
  [liveStatuses]);

  // ── Live Data Availability — realData/mockData/pipelineValidated from context
  const liveDataAvailability = useMemo(() =>
    DATA_AVAILABILITY.map(row => {
      // Map API name → batch key
      const batchKeyMap: Record<string, string> = {
        "File Ingestion Status":     "foundation-core",
        "Lineage Anchor":            "1",
        "Normalized Trial Balance":  "2",
        "FirmTaxonomyId":            "2a",
        "AI Mapping Proposals":      "4",
        "Entity Identity":           "5",
        "Practitioner Review Queue": "6",
        "Client Tax Profile":        "7",
        "Exception Record":          "8",
        "Remedy Action":             "8",
      };
      const key = batchKeyMap[row.api];
      if (!key) return row;
      const s = liveStatuses[key];
      if (!s) return row;
      const isComplete = s === "Complete" || s === "Delivered";
      const isActive = ["In Progress","Ready for QA","QA In Progress","Demo Ready","MVP","Stretch"].includes(s);
      return {
        ...row,
        realData: isComplete ? true : isActive ? row.realData : row.realData,
        mockData: isComplete ? false : row.mockData,
        samplePayload: isComplete ? true : isActive ? row.samplePayload : row.samplePayload,
        pipelineValidated: isComplete ? true : isActive ? row.pipelineValidated : row.pipelineValidated,
        notes: isComplete
          ? row.notes.replace(/ Mock only[^.]*\./, "").replace(/ Not yet[^.]*\./, "").trim() + " ✓ Batch Complete."
          : row.notes,
      };
    }),
  [liveStatuses]);

  // ── Computed summary stats (live) ─────────────────────────────────────────
  const consumerReady = liveEndpointMatrix.filter(r => r.status === "Consumer Ready" || r.status === "Delivered").length;
  const mockOnly = liveEndpointMatrix.filter(r => r.status === "Mock Only").length;
  const govBlocked = liveEndpointMatrix.filter(r => r.status === "Governance Pending" || r.status === "Blocked").length;
  const futureState = liveEndpointMatrix.filter(r => r.status === "Future State").length;
  const partialData = liveEndpointMatrix.filter(r => r.status === "Partial Data" || r.status === "Draft Contract").length;
  const demoReady = DEMO_READINESS.filter(r => r.demoReady === "Demo Ready" || r.demoReady === "Production Ready").length;
  const prodReady = DEMO_READINESS.filter(r => r.prodReady === "Production Ready").length;
  const openAdrs = OPEN_ADRS.filter(a => a.status === "Open").length;
  const criticalRisks = INTEGRATION_RISKS.filter(r => r.level === "Critical").length;

  const filteredMatrix = useMemo(() => {
    if (matrixFilter === "All") return liveEndpointMatrix;
    return liveEndpointMatrix.filter(r => r.status === matrixFilter);
  }, [matrixFilter, liveEndpointMatrix]);

  const copyMatrix = () => {
    const header = "Batch | API | Purpose | Roger Capability | Status | Data | Gov Status | Blockers | Owner";
    const rows = liveEndpointMatrix.map(r =>
      `${r.batch} | ${r.api} | ${r.purpose} | ${r.capability} | ${r.status} | ${r.data} | ${r.govStatus} | ${r.blockers} | ${r.owner}`
    );
    navigator.clipboard.writeText([header, ...rows].join("\n")).then(() => {
      setCopiedMatrix(true);
      setTimeout(() => setCopiedMatrix(false), 2000);
    });
  };

  const filterOptions: Array<ReadinessStatus | "All"> = [
    "All", "Consumer Ready", "Delivered", "Partial Data", "Draft Contract",
    "Governance Pending", "Blocked", "Future State",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #0f2744 0%, #1e3a5f 60%, #1e40af 100%)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-xl bg-white/10">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Roger Consumer Readiness Center</h1>
            <p className="text-sm text-blue-200 mt-0.5">Single source of truth for Roger API readiness, consumer dependencies, governance status, and operational availability</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Roger Read-Only", color: "#60a5fa" },
            { label: "Consumer Perspective", color: "#34d399" },
            { label: "Governance-Aware", color: "#f59e0b" },
            { label: "Operationally Actionable", color: "#a78bfa" },
          ].map(b => (
            <span key={b.label} className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* ── DATA SOURCE STATUS CARD ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Data Source Status</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Swagger Source: Uploaded JSON Snapshot</span>
              </div>
              <div className="text-xs text-amber-700 leading-relaxed">
                <strong>Live Sync:</strong> No — static snapshot only<br />
                <strong>Last Uploaded:</strong> May 19, 2026 (pasted_content_49.txt = TDC API, pasted_content_50.txt = PDC API)<br />
                <strong>Status:</strong> Swagger source is a static artifact. Endpoint data may be stale if the platform has changed since upload. Do not treat Swagger as a live contract source.
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">Current Status Source: DCT Control Panel</span>
              </div>
              <div className="text-xs text-emerald-700 leading-relaxed">
                <strong>Live Sync:</strong> Yes — reflects current batch/API status<br />
                <strong>Last Synced:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}<br />
                <strong>Status:</strong> Readiness, governance status, and blocker data sourced from the DCT Control Panel. This is the authoritative source for current delivery state.
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: Executive Summary ─────────────────────────────────── */}
        <section>
          <SectionHeader num={1} title="Executive Summary" icon={<TrendingUp className="w-4 h-4" />} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section tells Roger what is currently usable, what is still blocked, and what needs governance or technical follow-up before consumption. Numbers are derived from the DCT Control Panel — the authoritative source for current delivery state.
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Consumer-Ready APIs",     value: consumerReady,  total: ENDPOINT_MATRIX.length, color: "#065f46", bg: "#d1fae5", icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: "Demo-Ready Capabilities", value: demoReady,      total: DEMO_READINESS.length,  color: "#1e40af", bg: "#dbeafe", icon: <Star className="w-4 h-4" /> },
              { label: "Production-Ready",        value: prodReady,      total: DEMO_READINESS.length,  color: "#065f46", bg: "#d1fae5", icon: <Target className="w-4 h-4" /> },
              { label: "Governance Blocked",      value: govBlocked,     total: ENDPOINT_MATRIX.length, color: "#991b1b", bg: "#fee2e2", icon: <XCircle className="w-4 h-4" /> },
              { label: "Partial / Draft",         value: partialData,    total: ENDPOINT_MATRIX.length, color: "#854d0e", bg: "#fef9c3", icon: <AlertTriangle className="w-4 h-4" /> },
              { label: "Mock / Demo Only",        value: mockOnly,       total: ENDPOINT_MATRIX.length, color: "#92400e", bg: "#fef3c7", icon: <Eye className="w-4 h-4" /> },
              { label: "Future State",            value: futureState,    total: ENDPOINT_MATRIX.length, color: "#475569", bg: "#f1f5f9", icon: <Clock className="w-4 h-4" /> },
              { label: "Open ADR Decisions",      value: openAdrs,       total: OPEN_ADRS.length,       color: "#5b21b6", bg: "#ede9fe", icon: <FileText className="w-4 h-4" /> },
              { label: "Critical Risks",          value: criticalRisks,  total: INTEGRATION_RISKS.length, color: "#991b1b", bg: "#fee2e2", icon: <AlertCircle className="w-4 h-4" /> },
            ].map(t => (
              <div key={t.label} className="bg-white rounded-xl border border-slate-200 px-3 py-3 flex items-center gap-2.5 shadow-sm">
                <span className="p-1.5 rounded-lg shrink-0" style={{ color: t.color, background: t.bg }}>{t.icon}</span>
                <div className="min-w-0">
                  <div className="text-xl font-bold leading-none" style={{ color: t.color }}>
                    {t.value}<span className="text-xs font-normal text-slate-400 ml-0.5">/{t.total}</span>
                  </div>
                  <div className="text-xs text-slate-500 leading-tight mt-0.5">{t.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Governance banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-blue-800">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <strong>Governance Rule:</strong> Roger is a READ-ONLY consumer. Roger does not own lineage, tax authority, or governance decisions.
              PDC (Phoenix Data Consolidation) = financial data source. TDC (Tax Data Consolidation) = tax decision source.
              Roger consumes governed Read Contracts via the Roger Gateway. Write contracts are internal to PDC/TDC.
              Additive-Only: fields may never be removed or renamed once a contract is published.
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Endpoint Readiness Matrix ─────────────────────────── */}
        <section>
          <SectionHeader num={2} title="Roger Endpoint Readiness Matrix" icon={<Database className="w-4 h-4" />} count={`${liveEndpointMatrix.length} APIs`} />
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #34d399" }}>
              <Activity className="w-3 h-3" /> Live — synced from Control Panel
            </span>
            <span className="text-xs text-slate-400">Status and data availability update automatically when batches are marked Complete</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section maps each endpoint to the batch, capability, source system, readiness status, data availability, and blocker so Roger can quickly see what can be consumed today versus what is pending governance, in development, or future state.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
              {filterOptions.map(f => (
                <button key={f} onClick={() => setMatrixFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    matrixFilter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}>{f}</button>
              ))}
              <button onClick={copyMatrix}
                className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 rounded px-2 py-1 transition-colors bg-white">
                <Copy className="w-3 h-3" />
                {copiedMatrix ? "Copied!" : "Copy Matrix"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 1000 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-12">Batch</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">API</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">Roger Capability</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Data</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-40">Governance Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Blockers</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-20">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrix.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5"><span className="font-mono font-bold text-slate-700">{row.batch}</span></td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-800 leading-tight">{row.api}</div>
                        <div className="text-slate-400 font-mono mt-0.5 break-all" style={{ fontSize: "10px" }}>{row.path}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 leading-snug">{row.capability}</td>
                      <td className="px-3 py-2.5"><ReadinessBadge status={row.status} /></td>
                      <td className="px-3 py-2.5"><DataBadge status={row.data} /></td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.govStatus}</td>
                      <td className="px-3 py-2.5">
                        {row.blockers === "None"
                          ? <span className="text-emerald-700 font-medium">No blockers</span>
                          : <span className="text-amber-700 leading-snug">{row.blockers}</span>}
                      </td>
                      <td className="px-3 py-2.5"><span className="font-mono text-xs text-slate-600">{row.owner}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Roger UI Dependency Map ───────────────────────────── */}
        <section>
          <SectionHeader num={3} title="Roger UI Screen Dependency Map" icon={<Layers className="w-4 h-4" />} count={`${SCREEN_DEPENDENCIES.length} screens`} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section shows which Roger screens or workflows depend on which APIs and whether the required data is available. Use this to identify which screens are ready to build or demo, and which are blocked by missing APIs or governance decisions.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 900 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-36">Roger Screen</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Required APIs</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Readiness</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Data</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Risks / Gaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCREEN_DEPENDENCIES.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{row.screen}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {row.apis.map(a => (
                            <span key={a} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{a}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><ReadinessBadge status={row.readiness} /></td>
                      <td className="px-3 py-2.5"><DataBadge status={row.data} /></td>
                      <td className="px-3 py-2.5">
                        {row.risks === "None"
                          ? <span className="text-emerald-700 font-medium">No risks</span>
                          : <span className={row.risks.includes("BLOCKING") ? "text-red-700" : "text-amber-700"} style={{ lineHeight: 1.4 }}>{row.risks}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Consumer vs Platform Readiness ────────────────────── */}
        <section>
          <SectionHeader num={4} title="Consumer Readiness vs Platform Readiness" icon={<GitBranch className="w-4 h-4" />} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section separates APIs that exist from APIs Roger can actually use. An endpoint can be delivered by the platform but not consumer-ready if data, authentication, payloads, or governance are incomplete. Platform Exists ≠ Roger Can Consume.
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <strong>Critical Distinction:</strong>&nbsp;Platform Exists ≠ Roger Can Consume. An API may exist in PDC/TDC but Roger cannot consume it until the Read Contract is published (G3 gate), governance is approved, and the payload is complete.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-48">Capability</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Platform Exists</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Roger Consumable</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Why / Why Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CONSUMER_VS_PLATFORM.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">{row.capability}</td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1 font-semibold ${row.platformExists ? "text-emerald-700" : "text-slate-400"}`}>
                          {row.platformExists ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {row.platformExists ? "Exists" : "In Dev"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1 font-semibold ${row.rogerConsumable ? "text-emerald-700" : "text-red-600"}`}>
                          {row.rogerConsumable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {row.rogerConsumable ? "Can Consume" : "Cannot Yet"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

          {/* ── SECTION 5: Data Availability ─────────────────────────────────── */}
        <section>
          <SectionHeader num={5} title="Data Availability Status" icon={<Activity className="w-4 h-4" />} />
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #34d399" }}>
              <Activity className="w-3 h-3" /> Live — synced from Control Panel
            </span>
            <span className="text-xs text-slate-400">Real Data and Pipeline Validated flags update when the corresponding batch is marked Complete</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section shows whether Roger is looking at real data, mock data, sample payloads, or draft contract data. Real Data means the pipeline is operational. Mock Data means the demo uses simulated values. Pipeline Validated means the end-to-end data flow has been tested.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 800 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">API</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">Real Data</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">Mock Data</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-24">Sample Payload</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-28">Pipeline Validated</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveDataAvailability.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">{row.api}</td>
                      {[row.realData, row.mockData, row.samplePayload, row.pipelineValidated].map((val, j) => (
                        <td key={j} className="px-3 py-2.5 text-center">
                          {val
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                            : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Gateway Access Model ──────────────────────────────── */}
        <section>
          <SectionHeader num={6} title="Gateway Access Model" icon={<Globe className="w-4 h-4" />} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section shows how Roger should consume governed DCT data without directly coupling to internal PDC/TDC services. Roger consumes governed Read Contracts via the Roger Gateway. The Gateway mediates access and enforces ownership boundaries so PDC/TDC can evolve independently.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Flow visual */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
              <div className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wide">Access Flow</div>
              {[
                { label: "Roger UI",          sub: "Practitioner-facing application",    color: "#1e3a5f", text: "white" },
                { label: "Roger Gateway",     sub: "Mediates all API access",            color: "#1e40af", text: "white" },
                { label: "PDC Governed APIs", sub: "Phoenix Data Consolidation",         color: "#065f46", text: "white" },
                { label: "TDC Governed APIs", sub: "Tax Data Consolidation",             color: "#5b21b6", text: "white" },
              ].map((node, i, arr) => (
                <React.Fragment key={node.label}>
                  <div className="rounded-lg px-4 py-2.5 flex items-center gap-2"
                    style={{ background: node.color }}>
                    <div>
                      <div className="text-sm font-bold" style={{ color: node.text }}>{node.label}</div>
                      <div className="text-xs opacity-70" style={{ color: node.text }}>{node.sub}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* What the Gateway protects */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
              <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">What the Gateway Protects Roger From</div>
              <div className="space-y-2.5">
                {[
                  { icon: <Shield className="w-3.5 h-3.5 text-blue-500" />, text: "Direct exposure to internal PDC/TDC write APIs — Roger only sees Read Contracts" },
                  { icon: <Lock className="w-3.5 h-3.5 text-blue-500" />, text: "Breaking changes — Additive-Only enforcement means existing fields are never removed" },
                  { icon: <AlertCircle className="w-3.5 h-3.5 text-blue-500" />, text: "Governance violations — Gateway enforces contract publication requirements" },
                  { icon: <Zap className="w-3.5 h-3.5 text-blue-500" />, text: "Internal service evolution — PDC/TDC can refactor internally without breaking Roger" },
                  { icon: <Users className="w-3.5 h-3.5 text-blue-500" />, text: "Ownership boundary violations — Roger cannot accidentally write to PDC/TDC" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800">
                <strong>Note:</strong> The Gateway routing strategy is currently under ADR review (ADR-03). Roger UI should not call PDC/TDC APIs directly until the routing strategy is finalized.
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: Governance & Ownership ────────────────────────────── */}
        <section>
          <SectionHeader num={7} title="Governance & Ownership" icon={<Users className="w-4 h-4" />} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section clarifies who owns the data and what Roger is allowed to consume. Roger is a consumer layer, not the system of record. PDC (Phoenix Data Consolidation) owns financial data. TDC (Tax Data Consolidation) owns tax decisions. Roger reads only — it does not write, derive, or govern.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-40">Data Domain</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Owner</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Roger Access Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {GOVERNANCE_OWNERSHIP.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{row.domain}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                          row.owner === "Unresolved" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}>{row.owner}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          row.accessType === "Read Contract" ? "bg-emerald-50 text-emerald-700" :
                          row.accessType === "Pending" ? "bg-red-50 text-red-700" :
                          row.accessType === "In Development" ? "bg-blue-50 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{row.accessType}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700 mb-1">Roger Ownership Boundaries</div>
            {[
              "Roger is a consumer layer — it does not own any data domain",
              "Roger is not the system of record for any financial or tax data",
              "Roger does not own tax authority — TDC is the authoritative tax decision source",
              "Roger does not own lineage governance — PDC owns lineage",
              "Roger does not derive eligibility — TDC determines eligibility",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                {rule}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 8: Integration Risks ─────────────────────────────────── */}
        <section>
          <SectionHeader num={8} title="Roger Integration Risks" icon={<AlertCircle className="w-4 h-4" />} count={`${INTEGRATION_RISKS.length} risks`} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section highlights the blockers that could prevent Roger from consuming the APIs or showing the data correctly. Click any risk to expand the resolution path. Critical and High risks must be resolved before Roger can go to UAT or production.
          </div>
          <div className="space-y-2">
            {INTEGRATION_RISKS.map((risk, i) => (
              <div key={risk.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedRisk(expandedRisk === i ? null : i)}
                >
                  <RiskBadge level={risk.level} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-800">{risk.id} — {risk.title}</span>
                      <span className="text-xs text-slate-400 italic">{risk.category}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">{risk.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-wrap gap-1">
                      {risk.screens.map(s => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    {expandedRisk === i ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>
                {expandedRisk === i && (
                  <div className="px-4 pb-3 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-start gap-1.5 mt-2">
                      <Zap className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-blue-700">Resolution: </span>
                        <span className="text-xs text-blue-700">{risk.resolution}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 9: Demo Readiness ─────────────────────────────────────── */}
        <section>
          <SectionHeader num={9} title="Demo Readiness" icon={<Star className="w-4 h-4" />} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section tells the Roger team what can be shown in a demo today versus what is production-ready. Demo Ready means the capability works with real or seeded data and is safe to show. Mocked means the demo uses simulated values. Conceptual means the capability is not yet built.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">Capability</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-36">Demo Ready</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-36">Production Ready</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEMO_READINESS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">{row.capability}</td>
                      <td className="px-3 py-2.5"><DemoBadge status={row.demoReady} /></td>
                      <td className="px-3 py-2.5"><DemoBadge status={row.prodReady} /></td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 10: Open ADRs ─────────────────────────────────────────── */}
        <section>
          <SectionHeader num={10} title="Open Decisions & ADRs" icon={<FileText className="w-4 h-4" />} count={`${openAdrs} open`} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section lists the governance decisions that must be resolved before Roger can fully consume or rely on certain capabilities. Open ADRs with Critical or High impact are blocking Roger delivery. Escalate unresolved items to the architecture team.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-16">ADR</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-48">Decision</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-20">Impact</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-40">Blocking Capability</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OPEN_ADRS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-700">{row.id}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 leading-snug">{row.title}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          row.status === "Open" ? "bg-red-50 text-red-700" :
                          row.status === "In Review" ? "bg-amber-50 text-amber-700" :
                          row.status === "Resolved" ? "bg-emerald-50 text-emerald-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-bold ${
                          row.impact === "Critical" ? "text-red-700" :
                          row.impact === "High" ? "text-orange-700" :
                          row.impact === "Medium" ? "text-amber-700" : "text-slate-500"
                        }`}>{row.impact}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.blocking}</td>
                      <td className="px-3 py-2.5 text-slate-600 leading-snug">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 11: Next Actions ──────────────────────────────────────── */}
        <section>
          <SectionHeader num={11} title="Next Actions" icon={<Target className="w-4 h-4" />} count={`${NEXT_ACTIONS.length} actions`} />
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-800 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            This section gives the team a working action list for closing gaps and moving endpoints toward consumer readiness. Critical and High impact actions should be prioritized for the current sprint. Use ADO references to track progress in Azure DevOps.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Action</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Owner</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-20">Impact</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-20">ADO Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {NEXT_ACTIONS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-slate-800 leading-snug">{row.action}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-700">{row.owner}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          row.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                          row.status === "Open" ? "bg-amber-50 text-amber-700" :
                          "bg-emerald-50 text-emerald-700"
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-bold ${
                          row.impact === "Critical" ? "text-red-700" :
                          row.impact === "High" ? "text-orange-700" :
                          row.impact === "Medium" ? "text-amber-700" : "text-slate-500"
                        }`}>{row.impact}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-blue-700">{row.adoRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

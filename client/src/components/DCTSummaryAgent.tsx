/**
 * DCTSummaryAgent.tsx
 * Floating AI Summary Agent panel for the Data Model & Gaps page.
 * Analyzes all 6 data sources and generates 4 summary types + ADR candidates.
 * NO manual input required — all analysis is derived from live page data.
 */

import { useState, useMemo } from "react";
import { ROGER_MODEL_GROUPS, type Readiness } from "../lib/rogerModelData";
import { getDataAvailabilityRows } from "../lib/batchModelSource";
import { useBatchStatus } from "../contexts/BatchStatusContext";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type SummaryType = "ba" | "po" | "arch" | "demo" | "adr" | null;

interface SummarySection {
  title: string;
  severity: "green" | "amber" | "red" | "gray";
  items: string[];
}

interface GeneratedSummary {
  type: SummaryType;
  title: string;
  generatedAt: string;
  confidenceScore: number;
  readinessScore: number;
  governanceScore: number;
  sections: SummarySection[];
  plainText: string;
}

// ─── SEVERITY COLORS ─────────────────────────────────────────────────────────

const SEV: Record<"green" | "amber" | "red" | "gray", { bg: string; text: string; border: string }> = {
  green: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  amber: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  red:   { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  gray:  { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
};

// ─── ANALYSIS ENGINE ─────────────────────────────────────────────────────────

function analyzePageData(statuses: Record<string, string>) {
  const allFields = ROGER_MODEL_GROUPS.flatMap(g => g.fields.map(f => ({ ...f, group: g.title })));
  const dataRows = getDataAvailabilityRows();

  // Field-level counts
  const delivered  = allFields.filter(f => f.status === "Delivered");
  const mocked     = allFields.filter(f => f.status === "Mocked");
  const missing    = allFields.filter(f => f.status === "Missing");
  const partial    = allFields.filter(f => f.status === "Partial");
  const deferred   = allFields.filter(f => f.status === "Deferred");

  // Ownership analysis
  const undefinedOwner = allFields.filter(f => !f.owner || f.owner === "Roger" || f.owner === "Undefined");
  const timDeps        = allFields.filter(f => f.owner === "TIM" || f.source === "TIM");
  const dmsDeps        = allFields.filter(f => f.owner === "DMS" || f.source === "DMS");

  // Contract analysis
  const missingContracts = allFields.filter(f => f.swagger === "—" && f.status !== "Deferred");
  const rogerCanUseRows  = dataRows.filter(r => r.rogerCanUse);
  const missingContractRogerBlocking = dataRows.filter(r => r.rogerCanUse && r.swaggerStatus === "MISSING_CONTRACT");
  const outOfSync        = dataRows.filter(r => r.swaggerStatus === "OUT_OF_SYNC");

  // Gap analysis
  const allGaps = allFields.filter(f => f.gap && f.gap !== "—");
  const highRisk = allFields.filter(f => f.status === "Mocked" && (!f.owner || f.owner === "Roger" || f.owner === "Undefined"));
  const consumerReadinessRisk = missingContractRogerBlocking;

  // Architecture violations (from static VIOLATIONS data)
  const violations = [
    { id: "V1", title: "No Direct PDC ↔ TDC Communication", type: "BOUNDARY RULE", severity: "red" as const },
    { id: "V2", title: "No Tax Logic in PDC",                type: "SEPARATION OF CONCERNS", severity: "amber" as const },
    { id: "V3", title: "No Write Access from Roger",         type: "READ-ONLY CONSUMER", severity: "amber" as const },
  ];

  // Batch dependency analysis
  const futureBatches = allFields.filter(f => {
    const b = f.batch;
    return b && (b.includes("B10") || b.includes("B10+") || b.includes("B11") || b.includes("B12") || b.includes("B13"));
  });

  // Scores
  const totalFields = allFields.length;
  const readinessScore = Math.round(((delivered.length + partial.length * 0.5) / totalFields) * 100);
  const governanceScore = Math.round(100 - ((violations.length * 10) + (outOfSync.length * 5) + (missingContracts.length * 2)));
  const confidenceScore = Math.round(85 - (highRisk.length * 3) - (undefinedOwner.length * 2));

  return {
    allFields, delivered, mocked, missing, partial, deferred,
    undefinedOwner, timDeps, dmsDeps,
    missingContracts, rogerCanUseRows, missingContractRogerBlocking, outOfSync,
    allGaps, highRisk, consumerReadinessRisk,
    violations, futureBatches, dataRows,
    readinessScore: Math.max(0, Math.min(100, readinessScore)),
    governanceScore: Math.max(0, Math.min(100, governanceScore)),
    confidenceScore: Math.max(0, Math.min(100, confidenceScore)),
    statuses,
  };
}

// ─── SUMMARY GENERATORS ──────────────────────────────────────────────────────

function generateBASummary(d: ReturnType<typeof analyzePageData>): GeneratedSummary {
  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const sections: SummarySection[] = [
    {
      title: "1. Delivered Data",
      severity: d.delivered.length > 10 ? "green" : "amber",
      items: [
        `${d.delivered.length} of ${d.allFields.length} fields delivered (${Math.round(d.delivered.length / d.allFields.length * 100)}%)`,
        ...d.delivered.slice(0, 5).map(f => `✓ ${f.uiField} — ${f.group} (${f.owner}, ${f.batch})`),
        d.delivered.length > 5 ? `...and ${d.delivered.length - 5} more delivered fields` : "",
      ].filter(Boolean),
    },
    {
      title: "2. Mocked Data",
      severity: d.mocked.length > 5 ? "amber" : "green",
      items: [
        `${d.mocked.length} fields currently mocked — not production-ready`,
        ...d.mocked.map(f => `~ ${f.uiField} (${f.group}) — ${f.gap !== "—" ? f.gap : "Mocked, no gap defined"}`),
      ],
    },
    {
      title: "3. Missing Contracts",
      severity: d.missingContracts.length > 0 ? "red" : "green",
      items: [
        `${d.missingContracts.length} fields have no Swagger contract`,
        ...d.missingContracts.slice(0, 6).map(f => `○ ${f.uiField} — ${f.swagger} (${f.owner}, ${f.batch})`),
        d.missingContracts.length > 6 ? `...and ${d.missingContracts.length - 6} more missing contracts` : "",
      ].filter(Boolean),
    },
    {
      title: "4. Swagger Gaps",
      severity: d.outOfSync.length > 0 ? "red" : "amber",
      items: [
        `${d.outOfSync.length} data rows Out of Sync with Swagger`,
        `${d.missingContractRogerBlocking.length} Roger-blocking rows with Missing Contract`,
        ...d.outOfSync.map(r => `⚠ ${r.stage} — Out of Sync (${r.system})`),
        ...d.missingContractRogerBlocking.map(r => `○ ${r.stage} — Missing Contract, Roger Can Use = Yes`),
      ],
    },
    {
      title: "5. Undefined Ownership",
      severity: d.undefinedOwner.length > 0 ? "amber" : "green",
      items: [
        `${d.undefinedOwner.length} fields with undefined or Roger-owned data (Roger is a consumer, not an owner)`,
        ...d.undefinedOwner.map(f => `⚠ ${f.uiField} — owner: ${f.owner} (${f.group})`),
        d.timDeps.length > 0 ? `TIM dependency: ${d.timDeps.length} fields — TIM integration not yet delivered` : "",
        d.dmsDeps.length > 0 ? `DMS dependency: ${d.dmsDeps.length} fields — Document ingestion dependency` : "",
      ].filter(Boolean),
    },
    {
      title: "6. Batch Dependencies",
      severity: d.futureBatches.length > 0 ? "amber" : "green",
      items: [
        `${d.futureBatches.length} fields depend on Batch 10+ (future-state)`,
        ...d.futureBatches.slice(0, 5).map(f => `D ${f.uiField} — ${f.batch} (${f.group})`),
        d.futureBatches.length > 5 ? `...and ${d.futureBatches.length - 5} more future-state dependencies` : "",
      ].filter(Boolean),
    },
    {
      title: "7. Open Questions",
      severity: "amber",
      items: [
        "On Track / At Risk / Overdue: calculation logic not defined — owner undefined",
        "TIM integration boundary: TIM owns deliverables and due dates but integration not delivered",
        "Aggregation logic for % Complete not formalized across Clients, Entities, Consolidations",
        "DMS document ingestion: pending/received state governance undefined",
        "Assignee source for Issues: TIM or Roger user — not resolved",
        "IMS integration contract: must be formally defined before Batch 8 delivery",
      ],
    },
    {
      title: "8. Recommended BA Follow-Ups",
      severity: "amber",
      items: [
        "Define On Track / At Risk / Overdue formula — assign owner (Roger, TIM, or TDC)",
        "Formalize TIM integration contract for deliverables, due dates, and assignees",
        "Resolve DMS document state governance (Workpaper | Tax Form | Reconciliation)",
        "Confirm aggregation logic for % Complete at Client and Consolidation level",
        "Validate append-only enforcement at DB and API layer before Gate 2 (Invariant Lock)",
        `Review ${d.undefinedOwner.length} undefined-owner fields and assign authoritative system`,
      ],
    },
    {
      title: "9. Stories / ADR Candidates",
      severity: "gray",
      items: [
        "Story: Define On Track / At Risk / Overdue calculation — acceptance criteria: formula agreed, owner assigned",
        "Story: TIM integration contract — deliverables, due dates, assignees (Batch 10)",
        "Story: DMS document ingestion boundary — pending/received state (Batch 10)",
        "ADR: Aggregation logic for % Complete — PDC vs TDC vs Roger",
        "ADR: IMS outbound contract — vFinalTaxReady and vReturnSummary format",
        "ADR: Append-only enforcement mechanism — DB trigger vs API layer",
      ],
    },
  ];

  const plainText = `DCT PLATFORM — BA SUMMARY\nGenerated: ${now}\n\n` +
    sections.map(s => `${s.title}\n${s.items.map(i => `  • ${i}`).join("\n")}`).join("\n\n");

  return {
    type: "ba", title: "BA Operational Summary", generatedAt: now,
    confidenceScore: d.confidenceScore, readinessScore: d.readinessScore, governanceScore: d.governanceScore,
    sections, plainText,
  };
}

function generatePOSummary(d: ReturnType<typeof analyzePageData>): GeneratedSummary {
  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const sections: SummarySection[] = [
    {
      title: "1. Platform Readiness",
      severity: d.readinessScore >= 60 ? "amber" : "red",
      items: [
        `Overall field readiness: ${d.readinessScore}% (${d.delivered.length} delivered, ${d.partial.length} partial, ${d.mocked.length} mocked, ${d.missing.length} missing)`,
        `${d.deferred.length} fields deferred to future batches`,
        `${d.dataRows.filter(r => r.rogerCanUse).length} of ${d.dataRows.length} data stages available to Roger`,
      ],
    },
    {
      title: "2. Roger Consumption Readiness",
      severity: d.missingContractRogerBlocking.length > 0 ? "red" : "amber",
      items: [
        `${d.rogerCanUseRows.length} stages Roger-accessible; ${d.missingContractRogerBlocking.length} blocked by missing contracts`,
        ...d.missingContractRogerBlocking.map(r => `⛔ ${r.stage} — Missing Contract blocking Roger consumption`),
        d.mocked.length > 0 ? `${d.mocked.length} mocked fields — not production-ready for Roger` : "All Roger-facing fields are production-ready",
      ],
    },
    {
      title: "3. Highest Risks",
      severity: d.highRisk.length > 0 ? "red" : "amber",
      items: [
        ...d.highRisk.map(f => `🔴 HIGH DELIVERY RISK: ${f.uiField} — Mocked + owner undefined (${f.group})`),
        ...d.consumerReadinessRisk.map(r => `🔴 CONSUMER READINESS RISK: ${r.stage} — Missing Contract, Roger Can Use = Yes`),
        d.outOfSync.length > 0 ? `⚠ ${d.outOfSync.length} Swagger contracts Out of Sync` : "",
      ].filter(Boolean),
    },
    {
      title: "4. Blocked Features",
      severity: d.missing.length > 5 ? "red" : "amber",
      items: [
        `${d.missing.length} fields in Missing status — features blocked`,
        "Return Detail (Group 3): all 8 fields Missing — Batch 5/6 dependency",
        "Consolidation Detail (Group 4): workflow APIs not yet delivered (Batch 6)",
        "Issues (Group 5): all APIs mocked — Batch 6 dependency",
        "Documents (Group 6): all APIs mocked — DMS Batch 10 dependency",
      ],
    },
    {
      title: "5. Deferred Scope",
      severity: "gray",
      items: [
        `${d.deferred.length} fields deferred to Batch 10+`,
        "Consolidated Return support: future-state only (Batch 10+)",
        "Document ingestion: DMS dependency (Batch 10)",
        "TIM integration (deliverables, due dates, assignees): Batch 10",
        "Return Assembly & Lineage Closure: Batch 10",
      ],
    },
    {
      title: "6. Critical Decisions Needed",
      severity: "amber",
      items: [
        "On Track / At Risk / Overdue formula — must be agreed before Roger can display status",
        "TIM integration contract — deliverables and due date authority",
        "IMS outbound contract — vFinalTaxReady and vReturnSummary format (before Batch 8)",
        "Append-only enforcement mechanism — DB trigger vs API layer (before Gate 2)",
        "Aggregation logic for % Complete — PDC vs TDC vs Roger ownership",
      ],
    },
    {
      title: "7. Demo Impact",
      severity: d.mocked.length > 8 ? "amber" : "green",
      items: [
        `${d.mocked.length} mocked fields visible in demo — must be disclosed`,
        "My Clients: % Complete, Deliverables, Approaching Date, On Track/Risk/Overdue — all mocked",
        "Consolidation: Due Date, Client Due Date, Issue Count — mocked",
        "All Issues and Documents panels: mocked data only",
        "Recommendation: add demo disclaimer for mocked sections",
      ],
    },
    {
      title: "8. Recommended Next Steps",
      severity: "green",
      items: [
        "Prioritize Batch 5 entity identity delivery — unblocks Return Detail and Entities groups",
        "Prioritize Batch 6 workflow APIs — unblocks Consolidation, Issues, Return Detail",
        "Define TIM integration contract — unblocks 6 mocked fields in My Clients and Consolidation",
        "Publish missing Swagger contracts for Roger-blocking stages",
        "Assign owner for On Track / At Risk / Overdue — currently undefined",
      ],
    },
  ];

  const plainText = `DCT PLATFORM — PO EXECUTIVE SUMMARY\nGenerated: ${now}\n\n` +
    sections.map(s => `${s.title}\n${s.items.map(i => `  • ${i}`).join("\n")}`).join("\n\n");

  return {
    type: "po", title: "PO Executive Summary", generatedAt: now,
    confidenceScore: d.confidenceScore, readinessScore: d.readinessScore, governanceScore: d.governanceScore,
    sections, plainText,
  };
}

function generateArchSummary(d: ReturnType<typeof analyzePageData>): GeneratedSummary {
  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const sections: SummarySection[] = [
    {
      title: "Architecture Health Score",
      severity: d.governanceScore >= 70 ? "amber" : "red",
      items: [
        `Governance Score: ${d.governanceScore}/100`,
        `${d.violations.length} active architecture violation rules`,
        `${d.outOfSync.length} Swagger contracts Out of Sync`,
        `${d.missingContracts.length} missing API contracts`,
      ],
    },
    {
      title: "Critical Violations",
      severity: "red",
      items: [
        "V1 — BOUNDARY RULE: No Direct PDC ↔ TDC Communication. All PDC→TDC flows must route via AI Orchestrator or Service Bus.",
        "V2 — SEPARATION OF CONCERNS: No Tax Logic in PDC. TaxYear, MappingDecision, TaxReadyRecord owned exclusively by TDC.",
        "V3 — READ-ONLY CONSUMER: Roger has zero write access to PDC or TDC. Any POST/PUT/DELETE from Roger is a violation.",
      ],
    },
    {
      title: "Warning Areas",
      severity: "amber",
      items: [
        "PeriodStart / PeriodEnd adoption: all transactional records must use DateOnly fields; TaxYear is derived in TDC only",
        "Append-only enforcement: MappingDecision, LineageEvent, FilingRecord, AdjustmentRecord — no update/delete permitted",
        "AI Orchestrator statelessness: all persistence must flow through PDC or TDC APIs; no second AI execution for same file",
        "IMS integration boundary: IMS receives outbound outputs from TDC only; no read access; contract not yet formalized",
        `${d.undefinedOwner.length} fields with undefined ownership — ownership conflicts risk`,
      ],
    },
    {
      title: "Governance Alignment",
      severity: "green",
      items: [
        "PDC → Service Bus → AI Orchestrator → TDC: correct event-driven flow enforced",
        "Roger read-only constraint: enforced in API design (GET only for Roger-facing endpoints)",
        "EntityId (GUID) lineage: assigned by EODS/CEM, travels through all systems",
        "TaxYear derived in TDC only: never stored in PDC — enforced in data model",
        "Append-only records: defined in architecture; enforcement validation pending Gate 2",
      ],
    },
    {
      title: "ADR Recommendations",
      severity: "amber",
      items: [
        "ADR-001: Append-only enforcement mechanism — DB trigger vs API layer (required before Gate 2)",
        "ADR-002: IMS outbound contract format — vFinalTaxReady and vReturnSummary schema (required before Batch 8)",
        "ADR-003: Aggregation logic for % Complete — PDC vs TDC vs Roger ownership boundary",
        "ADR-004: On Track / At Risk / Overdue formula — system of record and calculation authority",
        "ADR-005: TIM integration boundary — read contract scope and data ownership",
      ],
    },
    {
      title: "PDC vs TDC Boundary Analysis",
      severity: "green",
      items: [
        "PDC owns: FinancialFact, IngestionJob, SourceFile, vNormalizedTb, EntityId, ClientGroup, Engagement",
        "TDC owns: TaxYear, MappingDecision, TaxReadyRecord, FilingRecord, AdjustmentRecord, TdcRecordId",
        "Boundary respected in current API design — no cross-boundary ownership detected",
        "Risk: EntityId travels through all systems without formal master data contract",
      ],
    },
    {
      title: "Lineage & Temporal Governance",
      severity: "amber",
      items: [
        "PeriodStart (DateOnly) → PeriodEnd (DateOnly): governing temporal fields assigned by EODS/CEM",
        "TaxYear: derived in TDC only from PeriodStart — never stored in PDC",
        "PeriodEnd >= PeriodStart: enforced as invariant",
        "Risk: any screen or API still using tax_year as a stored field must be updated",
        "Lineage chain: Client Group → Entity → Engagement → Source File → PDC Record → TDC Record → Tax-Ready Record → Filed Return",
      ],
    },
  ];

  const plainText = `DCT PLATFORM — ARCHITECTURE SUMMARY\nGenerated: ${now}\n\n` +
    sections.map(s => `${s.title}\n${s.items.map(i => `  • ${i}`).join("\n")}`).join("\n\n");

  return {
    type: "arch", title: "Architecture Governance Summary", generatedAt: now,
    confidenceScore: d.confidenceScore, readinessScore: d.readinessScore, governanceScore: d.governanceScore,
    sections, plainText,
  };
}

function generateDemoSummary(d: ReturnType<typeof analyzePageData>): GeneratedSummary {
  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const demoReady   = d.allFields.filter(f => f.status === "Delivered" || f.status === "Partial");
  const mockedOnly  = d.mocked;
  const notReady    = d.missing;

  const sections: SummarySection[] = [
    {
      title: "1. Demo-Ready APIs",
      severity: demoReady.length > 10 ? "green" : "amber",
      items: [
        `${demoReady.length} fields demo-ready (Delivered or Partial)`,
        "✓ My Clients: Client ID, Client Name — Delivered",
        "✓ Entities: Entity ID, Code, Name, EIN, Type, Tax Year — Partial (Batch 5 in progress)",
        "✓ AI Mapping: Consolidation AI Process % — Partial (Batch 4 in progress)",
        "✓ Lookup APIs: Tax years, entity types — Delivered",
      ],
    },
    {
      title: "2. Mocked-Only Flows",
      severity: mockedOnly.length > 5 ? "amber" : "green",
      items: [
        `${mockedOnly.length} fields mocked — will show placeholder data in demo`,
        "My Clients: % Complete, Deliverables, Approaching Date, On Track/Risk/Overdue — MOCKED",
        "Consolidation: Due Date, Client Due Date, Issue Count, Document Count — MOCKED",
        "Issues panel: all fields mocked (Batch 6 dependency)",
        "Documents panel: all fields mocked (DMS Batch 10 dependency)",
      ],
    },
    {
      title: "3. Missing Integrations",
      severity: "red",
      items: [
        "TIM integration: not delivered — deliverables, due dates, assignees all mocked",
        "DMS integration: not delivered — document ingestion mocked",
        "IMS outbound contract: not formalized — Batch 8 dependency",
        "Return Detail: all 8 fields Missing — Batch 5/6 dependency",
      ],
    },
    {
      title: "4. UI Fields Without Backing Contracts",
      severity: d.missingContracts.length > 0 ? "amber" : "green",
      items: [
        `${d.missingContracts.length} UI fields have no Swagger contract`,
        ...d.missingContracts.slice(0, 5).map(f => `○ ${f.uiField} — ${f.group} (${f.batch})`),
        d.missingContracts.length > 5 ? `...and ${d.missingContracts.length - 5} more` : "",
      ].filter(Boolean),
    },
    {
      title: "5. Swagger Readiness",
      severity: d.outOfSync.length > 0 ? "red" : "amber",
      items: [
        `${d.dataRows.filter(r => r.swaggerStatus === "ALIGNED").length} contracts Aligned`,
        `${d.dataRows.filter(r => r.swaggerStatus === "MISSING_CONTRACT").length} Missing Contract`,
        `${d.outOfSync.length} Out of Sync`,
        `${d.dataRows.filter(r => r.swaggerStatus === "NOT_APPLICABLE").length} N/A (infrastructure)`,
      ],
    },
    {
      title: "6. Roger-Visible Blockers",
      severity: d.missingContractRogerBlocking.length > 0 ? "red" : "green",
      items: [
        `${d.missingContractRogerBlocking.length} Roger-blocking missing contracts`,
        ...d.missingContractRogerBlocking.map(r => `⛔ ${r.stage} — Roger Can Use = Yes but contract missing`),
        d.missingContractRogerBlocking.length === 0 ? "No Roger-blocking contract gaps detected" : "",
      ].filter(Boolean),
    },
    {
      title: "7. Batch Delivery Status",
      severity: "amber",
      items: [
        "FC + B1 + B3: Delivered — Foundation Core, File Ingestion, Tax Domain Authority",
        "B2 + B2A + B4: In Progress — Normalization, Contract Enforcement, AI Mapping",
        "B5–B8: Not Started — Entity Identity, Practitioner Review, Client Profile, Exceptions",
        "B10+: Future-State — TIM integration, DMS, Return Assembly, IMS outbound",
      ],
    },
    {
      title: "8. Recommended Demo Disclaimers",
      severity: "amber",
      items: [
        "DISCLAIMER: % Complete, Deliverables, and Due Dates are mocked — TIM integration not yet delivered",
        "DISCLAIMER: Issues and Documents panels show placeholder data — Batch 6/10 dependencies",
        "DISCLAIMER: Return Detail is not demo-ready — Batch 5/6 required",
        "DISCLAIMER: On Track / At Risk / Overdue logic is not yet implemented",
        "SAFE TO DEMO: Client list, Entity hierarchy, AI mapping progress, Lookup APIs",
      ],
    },
  ];

  const plainText = `DCT PLATFORM — DEMO READINESS SUMMARY\nGenerated: ${now}\n\n` +
    sections.map(s => `${s.title}\n${s.items.map(i => `  • ${i}`).join("\n")}`).join("\n\n");

  return {
    type: "demo", title: "Demo Readiness Assessment", generatedAt: now,
    confidenceScore: d.confidenceScore, readinessScore: d.readinessScore, governanceScore: d.governanceScore,
    sections, plainText,
  };
}

function generateADRCandidates(d: ReturnType<typeof analyzePageData>): GeneratedSummary {
  const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const sections: SummarySection[] = [
    {
      title: "ADR-001: Append-Only Enforcement Mechanism",
      severity: "red",
      items: [
        "Decision: How is append-only enforced for MappingDecision, LineageEvent, FilingRecord, AdjustmentRecord?",
        "Options: (A) Database trigger, (B) API layer validation, (C) Both",
        "Rationale: Gate 2 (Invariant Lock) cannot close without enforcement validated",
        "Owner: Architecture / TDC team",
        "Required by: Gate 2 — Invariant Lock",
      ],
    },
    {
      title: "ADR-002: IMS Outbound Contract Format",
      severity: "red",
      items: [
        "Decision: What is the formal schema for vFinalTaxReady and vReturnSummary sent to IMS?",
        "Context: IMS receives outbound outputs from TDC only; no read access; no write access",
        "Rationale: IMS integration contract must be formally defined before Batch 8 delivery",
        "Owner: TDC team + IMS integration team",
        "Required by: Batch 8 delivery gate",
      ],
    },
    {
      title: "ADR-003: % Complete Aggregation Logic",
      severity: "amber",
      items: [
        "Decision: Who owns % Complete calculation — PDC, TDC, or Roger?",
        "Context: % Complete appears at Client, Entity, and Consolidation level; no agreed formula",
        "Options: (A) TDC derives from workflow state, (B) Roger derives from API counts, (C) PDC aggregates",
        "Rationale: Undefined aggregation logic blocks Roger UI and reporting",
        "Owner: BA + PO + Architecture",
      ],
    },
    {
      title: "ADR-004: On Track / At Risk / Overdue Formula",
      severity: "amber",
      items: [
        "Decision: What is the formula for On Track / At Risk / Overdue status in Roger?",
        "Context: Currently derived from readiness score + due date delta; no agreed definition",
        "Options: (A) TIM owns status derivation, (B) Roger derives from TIM due date + TDC workflow state",
        "Rationale: Status field is Missing in current model; owner is undefined",
        "Owner: BA + TIM integration team",
      ],
    },
    {
      title: "ADR-005: TIM Integration Boundary",
      severity: "amber",
      items: [
        "Decision: What is the read contract scope between TIM and Roger?",
        "Context: TIM owns deliverables, due dates, and assignees; 6 Roger fields depend on TIM",
        "Options: (A) TIM exposes a Roger-specific read API, (B) TDC mediates TIM data for Roger",
        "Rationale: TIM integration not yet delivered; 6 fields mocked as a result",
        "Owner: TIM team + Roger team + BA",
      ],
    },
    {
      title: "ADR-006: EntityId Master Data Contract",
      severity: "amber",
      items: [
        "Decision: How is EntityId (GUID) governed as it travels through Tax Portal, PDC, TDC, and Roger?",
        "Context: EntityId originates in EODS/CEM but passes through all systems without a formal master data contract",
        "Rationale: Risk of divergence across systems without a formal contract",
        "Owner: EODS/CEM team + PDC team + Architecture",
        "Required by: Gate 1 — Schema Lock",
      ],
    },
  ];

  const plainText = `DCT PLATFORM — ADR CANDIDATES\nGenerated: ${now}\n\n` +
    sections.map(s => `${s.title}\n${s.items.map(i => `  • ${i}`).join("\n")}`).join("\n\n");

  return {
    type: "adr", title: "ADR Candidates", generatedAt: now,
    confidenceScore: d.confidenceScore, readinessScore: d.readinessScore, governanceScore: d.governanceScore,
    sections, plainText,
  };
}

// ─── SCORE BADGE ─────────────────────────────────────────────────────────────

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{ fontSize: "18px", fontWeight: 800, color }}>{score}</div>
      <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function DCTSummaryAgent() {
  const { statuses } = useBatchStatus();
  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState<SummaryType>(null);
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const analysis = useMemo(() => analyzePageData(statuses as unknown as Record<string, string>), [statuses]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const n = new Set(prev);
      n.has(title) ? n.delete(title) : n.add(title);
      return n;
    });
  };

  const generate = (type: SummaryType) => {
    if (!type) return;
    setGenerating(true);
    setActiveType(type);
    setSummary(null);
    setExpandedSections(new Set());
    setTimeout(() => {
      let result: GeneratedSummary;
      if (type === "ba")   result = generateBASummary(analysis);
      else if (type === "po")   result = generatePOSummary(analysis);
      else if (type === "arch") result = generateArchSummary(analysis);
      else if (type === "demo") result = generateDemoSummary(analysis);
      else                      result = generateADRCandidates(analysis);
      setSummary(result);
      setGenerating(false);
      // Auto-expand first 3 sections
      setExpandedSections(new Set(result.sections.slice(0, 3).map(s => s.title)));
    }, 800);
  };

  const copyText = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportMarkdown = () => {
    if (!summary) return;
    const md = `# ${summary.title}\n_Generated: ${summary.generatedAt}_\n\n` +
      `**Confidence:** ${summary.confidenceScore}/100 · **Readiness:** ${summary.readinessScore}/100 · **Governance:** ${summary.governanceScore}/100\n\n` +
      summary.sections.map(s => `## ${s.title}\n${s.items.map(i => `- ${i}`).join("\n")}`).join("\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dct-${summary.type}-summary-${Date.now()}.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  const BUTTONS: { type: SummaryType; label: string; icon: string; color: string }[] = [
    { type: "ba",   label: "Generate BA Summary",           icon: "📋", color: "#1d4ed8" },
    { type: "po",   label: "Generate PO Summary",           icon: "📊", color: "#059669" },
    { type: "arch", label: "Generate Architecture Summary", icon: "🏛️", color: "#7c3aed" },
    { type: "demo", label: "Generate Demo Readiness",       icon: "🎯", color: "#d97706" },
    { type: "adr",  label: "Generate ADR Candidates",       icon: "📝", color: "#dc2626" },
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 1000,
          backgroundColor: "#003865", color: "white",
          border: "none", borderRadius: "10px", cursor: "pointer",
          padding: "10px 16px", fontSize: "12px", fontWeight: 700,
          boxShadow: "0 4px 16px rgba(0,56,101,0.35)",
          display: "flex", alignItems: "center", gap: "7px",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        title="Open DCT Summary Agent"
      >
        <span style={{ fontSize: "14px" }}>🤖</span>
        DCT Summary Agent
        <span style={{ fontSize: "10px", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Main panel */}
      {open && (
        <div style={{
          position: "fixed", top: "124px", right: "24px", zIndex: 999,
          width: "420px", maxHeight: "calc(100vh - 148px)",
          backgroundColor: "white", borderRadius: "14px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}>
          {/* Panel header */}
          <div style={{ backgroundColor: "#003865", padding: "14px 18px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>DCT Summary Agent</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", marginTop: "2px" }}>Analyzes all 6 page sections · No manual input required</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", fontSize: "16px", padding: "2px 6px", borderRadius: "4px" }}>✕</button>
            </div>
            {/* Score bar */}
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}>
              <ScoreBadge label="Confidence" score={analysis.confidenceScore} />
              <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.15)" }} />
              <ScoreBadge label="Readiness" score={analysis.readinessScore} />
              <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.15)" }} />
              <ScoreBadge label="Governance" score={analysis.governanceScore} />
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Action buttons */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Generate Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {BUTTONS.map(btn => (
                  <button
                    key={btn.type}
                    onClick={() => generate(btn.type)}
                    disabled={generating}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "9px 14px", borderRadius: "8px", border: "none", cursor: generating ? "not-allowed" : "pointer",
                      backgroundColor: activeType === btn.type ? btn.color : "#f8fafc",
                      color: activeType === btn.type ? "white" : "#374151",
                      fontSize: "12px", fontWeight: 600, textAlign: "left",
                      opacity: generating && activeType !== btn.type ? 0.5 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{btn.icon}</span>
                    <span style={{ flex: 1 }}>{btn.label}</span>
                    {activeType === btn.type && generating && <span style={{ fontSize: "10px", opacity: 0.8 }}>Analyzing…</span>}
                    {activeType === btn.type && !generating && summary && <span style={{ fontSize: "10px", opacity: 0.8 }}>✓ Ready</span>}
                  </button>
                ))}
              </div>

              {/* Export row */}
              {summary && !generating && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={copyText} style={{ flex: 1, padding: "7px", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: copied ? "#d1fae5" : "white", color: copied ? "#065f46" : "#374151", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    {copied ? "✓ Copied!" : "📋 Copy Summary"}
                  </button>
                  <button onClick={exportMarkdown} style={{ flex: 1, padding: "7px", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    ⬇ Export Markdown
                  </button>
                </div>
              )}
            </div>

            {/* Generated summary output */}
            {generating && (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>Analyzing page data…</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Scanning all 6 sections · {analysis.allFields.length} fields · {analysis.dataRows.length} data rows</div>
              </div>
            )}

            {summary && !generating && (
              <div style={{ padding: "14px 16px" }}>
                {/* Summary header */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>{summary.title}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>Generated: {summary.generatedAt}</div>
                </div>

                {/* Section cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {summary.sections.map(section => {
                    const sev = SEV[section.severity];
                    const isOpen = expandedSections.has(section.title);
                    return (
                      <div key={section.title} style={{ border: `1px solid ${sev.border}`, borderRadius: "8px", overflow: "hidden" }}>
                        <button
                          onClick={() => toggleSection(section.title)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 12px", backgroundColor: sev.bg, border: "none", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: "11px", fontWeight: 700, color: sev.text }}>{section.title}</span>
                          <span style={{ fontSize: "10px", color: sev.text, opacity: 0.7 }}>{isOpen ? "▲" : "▼"} {section.items.length}</span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: "10px 12px", backgroundColor: "white" }}>
                            {section.items.map((item, i) => (
                              <div key={i} style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5", padding: "2px 0", borderBottom: i < section.items.length - 1 ? "1px solid #f9fafb" : "none" }}>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

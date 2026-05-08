/**
 * rogerModelData.ts
 * Roger API Design v1.0 — 05.07.2026
 * 9 model groupings: field-level readiness, ownership, batch dependency, Swagger endpoint, gap/blocker
 */

export type Readiness = "Delivered" | "Partial" | "Mocked" | "Missing" | "Deferred";

export interface ModelField {
  uiField: string;
  apiField: string;
  source: string;
  owner: string;
  batch: string;
  swagger: string;
  status: Readiness;
  gap: string;
  notes?: string;
}

export interface ModelGroup {
  id: string;
  title: string;
  desc: string;
  fields: ModelField[];
}

export const READINESS_STYLE: Record<Readiness, { bg: string; text: string; label: string }> = {
  Delivered: { bg: "#d1fae5", text: "#065f46", label: "✓ Delivered" },
  Partial:   { bg: "#fef3c7", text: "#92400e", label: "~ Partial"   },
  Mocked:    { bg: "#dbeafe", text: "#1e40af", label: "M Mocked"    },
  Missing:   { bg: "#fee2e2", text: "#991b1b", label: "! Missing"   },
  Deferred:  { bg: "#f3f4f6", text: "#6b7280", label: "D Deferred"  },
};

export const OWNER_STYLE: Record<string, { bg: string; text: string }> = {
  PDC:   { bg: "#dbeafe", text: "#1e40af" },
  TDC:   { bg: "#ede9fe", text: "#5b21b6" },
  TIM:   { bg: "#ffedd5", text: "#9a3412" },
  DMS:   { bg: "#ccfbf1", text: "#0f766e" },
  Roger: { bg: "#f3f4f6", text: "#374151" },
};

export const ROGER_MODEL_GROUPS: ModelGroup[] = [
  // ── 1. My Clients ──────────────────────────────────────────────────────────
  {
    id: "my-clients",
    title: "1. My Clients",
    desc: "GET /api/clients?taxYear={year} — PDC owns entity hierarchy; TIM owns deliverables and due dates. Roger consumes read contracts only.",
    fields: [
      { uiField: "Client ID",          apiField: "clientId",        source: "PDC",     owner: "PDC",   batch: "FC",  swagger: "GET /api/clients",  status: "Delivered", gap: "—" },
      { uiField: "Client Name",        apiField: "name",            source: "PDC",     owner: "PDC",   batch: "FC",  swagger: "GET /api/clients",  status: "Delivered", gap: "—" },
      { uiField: "% Complete",         apiField: "pctcompleted",    source: "TIM/PDC", owner: "TIM",   batch: "B10", swagger: "GET /api/clients",  status: "Mocked",    gap: "Aggregation logic not defined; TIM integration not yet delivered" },
      { uiField: "Entity Count",       apiField: "entityCount",     source: "PDC",     owner: "PDC",   batch: "B5",  swagger: "GET /api/clients",  status: "Partial",   gap: "Requires Batch 5 entity identity delivery" },
      { uiField: "Deliverables",       apiField: "deliverables",    source: "TIM",     owner: "TIM",   batch: "B10", swagger: "GET /api/clients",  status: "Mocked",    gap: "TIM integration not yet delivered" },
      { uiField: "Approaching Date",   apiField: "approachingDate", source: "TIM",     owner: "TIM",   batch: "B10", swagger: "GET /api/clients",  status: "Mocked",    gap: "Client due date authority unclear" },
      { uiField: "On Track / At Risk", apiField: "(derived)",       source: "TIM/PDC", owner: "Roger", batch: "B10", swagger: "—",                 status: "Missing",   gap: "On-track/risk calculation logic not defined" },
      { uiField: "Overdue Flag",       apiField: "(derived)",       source: "TIM",     owner: "TIM",   batch: "B10", swagger: "—",                 status: "Missing",   gap: "Overdue logic not yet implemented" },
    ],
  },
  // ── 2. Entities ────────────────────────────────────────────────────────────
  {
    id: "entities",
    title: "2. Entities",
    desc: "GET /api/clients/{clientId}/entities?taxYear={year} — PDC owns entity master data. Batch 5 delivers entity identity; Batch 6 workflow; Batch 7 eligibility/profile.",
    fields: [
      { uiField: "Entity ID",      apiField: "entityId",     source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",  gap: "Batch 5 entity identity in progress" },
      { uiField: "Entity Code",    apiField: "entityCode",   source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",  gap: "CEM sync required" },
      { uiField: "Entity Name",    apiField: "entityName",   source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",  gap: "Live CEM sync not yet delivered" },
      { uiField: "EIN",            apiField: "ein",          source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",  gap: "EIN sourced from CEM — sync gap" },
      { uiField: "Entity Type",    apiField: "type",         source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",  gap: "C-Corp | S-Corp | Partnership | LLC | Disregarded | Foreign" },
      { uiField: "Tax Return",     apiField: "taxReturn",    source: "TDC", owner: "TDC", batch: "B7",  swagger: "GET /api/clients/{clientId}/entities", status: "Missing",  gap: "Batch 7 eligibility/profile not yet started" },
      { uiField: "Filing Status",  apiField: "filingStatus", source: "TDC", owner: "TDC", batch: "B6",  swagger: "GET /api/clients/{clientId}/entities", status: "Missing",  gap: "Filing workflow aggregation not delivered" },
      { uiField: "Tax Year",       apiField: "taxYear",      source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/lookups?key=tax-years",        status: "Partial",  gap: "Lookup API delivered; entity filter pending" },
    ],
  },
  // ── 3. Return Detail ───────────────────────────────────────────────────────
  {
    id: "return-detail",
    title: "3. Return Detail",
    desc: "Return membership management — full CRUD: list, add, remove, rename, role change. Batch 5 entity structure required.",
    fields: [
      { uiField: "Return ID",          apiField: "returnId",    source: "TDC",  owner: "TDC",   batch: "B6",  swagger: "GET /api/returns/{returnId}/members",                status: "Missing",  gap: "Batch 6 workflow/signoff not yet started" },
      { uiField: "Return Name",        apiField: "returnName",  source: "TDC",  owner: "TDC",   batch: "B6",  swagger: "PUT /api/returns/{returnId}/name",                   status: "Missing",  gap: "Inline edit requires Batch 6 delivery" },
      { uiField: "Member Entity Name", apiField: "name",        source: "PDC",  owner: "PDC",   batch: "B5",  swagger: "GET /api/returns/{returnId}/members",                status: "Missing",  gap: "Depends on Batch 5 entity identity" },
      { uiField: "Entity Type",        apiField: "type",        source: "PDC",  owner: "PDC",   batch: "B5",  swagger: "GET /api/returns/{returnId}/members",                status: "Missing",  gap: "C-Corp | S-Corp | Partnership | LLC | Disregarded | Foreign" },
      { uiField: "Role",               apiField: "role",        source: "TDC",  owner: "TDC",   batch: "B6",  swagger: "PATCH /api/returns/{returnId}/members/{entityId}",   status: "Missing",  gap: "Parent | Member | Elimination — role governance needed" },
      { uiField: "Add Members",        apiField: "entityIds[]", source: "PDC",  owner: "Roger", batch: "B5",  swagger: "POST /api/returns/{returnId}/members",               status: "Missing",  gap: "Requires Batch 5 available entities endpoint" },
      { uiField: "Remove Member",      apiField: "entityId",    source: "TDC",  owner: "TDC",   batch: "B6",  swagger: "DELETE /api/returns/{returnId}/members/{entityId}",  status: "Missing",  gap: "Cannot remove last Parent — governance rule" },
      { uiField: "Available Entities", apiField: "available[]", source: "PDC",  owner: "PDC",   batch: "B5",  swagger: "GET /api/clients/{clientId}/entities/available",     status: "Missing",  gap: "Excludes already-attached members" },
    ],
  },
  // ── 4. Consolidation Detail ────────────────────────────────────────────────
  {
    id: "consolidation-detail",
    title: "4. Consolidation Detail",
    desc: "GET /api/clients/{clientId}/consolidations — slim grid load, lazy detail fetch on click. TIM integration required for due dates.",
    fields: [
      { uiField: "Consolidation ID",  apiField: "id",             source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Missing",  gap: "Workflow APIs not yet delivered" },
      { uiField: "Filing Name",       apiField: "name",            source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Missing",  gap: "—" },
      { uiField: "Filing Type",       apiField: "type",            source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Missing",  gap: "federal-extension | federal-compliance | state | international" },
      { uiField: "Return Count",      apiField: "returnCount",     source: "TDC", owner: "TDC",  batch: "B10",  swagger: "GET /api/consolidations/{id}/returns",        status: "Deferred",  gap: "Filing assembly deferred to Batch 10" },
      { uiField: "AI Process %",      apiField: "aiProcess",       source: "TDC", owner: "TDC",  batch: "B4",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Partial",   gap: "Mapping proposals in progress (Batch 4)" },
      { uiField: "Due Date",          apiField: "dueDate",         source: "TIM", owner: "TIM",  batch: "B10",  swagger: "GET /api/clients/{clientId}/consolidations",  status: "Mocked",    gap: "TIM integration dependency" },
      { uiField: "Client Due Date",   apiField: "clientDueDate",   source: "TIM", owner: "TIM",  batch: "B10",  swagger: "GET /api/clients/{clientId}/consolidations",  status: "Mocked",    gap: "Client due date authority — TIM" },
      { uiField: "Status",            apiField: "status",          source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Missing",   gap: "On Track | At Risk | Overdue | Completed" },
      { uiField: "% Complete",        apiField: "pctComplete",     source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/clients/{clientId}/consolidations",  status: "Missing",   gap: "Workflow completion aggregation not defined" },
      { uiField: "Issue Count",       apiField: "issueCount",      source: "TDC", owner: "TDC",  batch: "B6",   swagger: "GET /api/consolidations/{id}/issues",         status: "Mocked",    gap: "Issue APIs mocked — Batch 6 dependency" },
      { uiField: "Document Count",    apiField: "docCount",        source: "DMS", owner: "DMS",  batch: "B10",  swagger: "GET /api/consolidations/{id}/documents",      status: "Mocked",    gap: "Document ingestion dependency" },
      { uiField: "Pending Doc Count", apiField: "pendingDocCount", source: "DMS", owner: "DMS",  batch: "B10",  swagger: "GET /api/consolidations/{id}/documents",      status: "Mocked",    gap: "Pending/received state — DMS dependency" },
      { uiField: "Consolidated Return","apiField": "(future)",     source: "TDC", owner: "TDC",  batch: "B10+", swagger: "—",                                           status: "Deferred",  gap: "Consolidated return support future-state only" },
    ],
  },
  // ── 5. Issues ──────────────────────────────────────────────────────────────
  {
    id: "issues",
    title: "5. Issues",
    desc: "GET /api/consolidations/{consolidationId}/issues — lazy loaded on issues badge click. TDC owns issue state.",
    fields: [
      { uiField: "Issue ID",      apiField: "id",          source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "Issue APIs mocked" },
      { uiField: "Title",         apiField: "title",       source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "—" },
      { uiField: "Workflow Step", apiField: "step",        source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "Workflow step linkage not yet defined" },
      { uiField: "Priority",      apiField: "priority",    source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "High | Medium | Low" },
      { uiField: "Status",        apiField: "status",      source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "Open | In Review | Resolved" },
      { uiField: "Assignee",      apiField: "assignee",    source: "TIM", owner: "TIM",  batch: "B10", swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "Assignee source — TIM or Roger user?" },
      { uiField: "Created Date",  apiField: "createdDate", source: "TDC", owner: "TDC",  batch: "B6",  swagger: "GET /api/consolidations/{id}/issues", status: "Mocked",  gap: "YYYY-MM-DD" },
    ],
  },
  // ── 6. Documents ───────────────────────────────────────────────────────────
  {
    id: "documents",
    title: "6. Documents",
    desc: "GET /api/consolidations/{consolidationId}/documents — lazy loaded on documents badge click. DMS owns document state.",
    fields: [
      { uiField: "Document ID",   apiField: "id",           source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "Document ingestion dependency" },
      { uiField: "File Name",     apiField: "name",         source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "—" },
      { uiField: "Document Type", apiField: "type",         source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "Workpaper | Tax Form | Reconciliation" },
      { uiField: "Status",        apiField: "status",       source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "Pending | Received" },
      { uiField: "Due Date",      apiField: "dueDate",      source: "TIM", owner: "TIM",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "TIM due date authority" },
      { uiField: "Received Date", apiField: "receivedDate", source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "Only present when status = Received" },
      { uiField: "Uploaded By",   apiField: "uploadedBy",   source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "Uploader display name" },
      { uiField: "File Size",     apiField: "size",         source: "DMS", owner: "DMS",  batch: "B10", swagger: "GET /api/consolidations/{id}/documents", status: "Mocked",  gap: "e.g. 240KB" },
    ],
  },
  // ── 7. Workflow / Status Tracking ──────────────────────────────────────────
  {
    id: "workflow",
    title: "7. Workflow / Status Tracking",
    desc: "GET /api/consolidations/{id}/workflow/{stepKey} — Batch 6 delivers core workflow. Signoff is immutable once committed.",
    fields: [
      { uiField: "Not Started",          apiField: "status: Not Started",    source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "Workflow APIs not yet delivered" },
      { uiField: "In Progress",          apiField: "status: In Progress",    source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "—" },
      { uiField: "In Review",            apiField: "status: In Review",      source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "—" },
      { uiField: "Completed",            apiField: "status: Completed",      source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "—" },
      { uiField: "Locked",               apiField: "status: Locked",         source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "Immutable signoff dependency" },
      { uiField: "Deferred",             apiField: "status: Deferred",       source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "—" },
      { uiField: "Escalated",            apiField: "status: Escalated",      source: "TDC", owner: "TDC", batch: "B6",   swagger: "GET /api/consolidations/{id}/workflow/{stepKey}", status: "Missing",  gap: "Escalation path not yet defined" },
      { uiField: "Expired",              apiField: "status: Expired",        source: "TIM", owner: "TIM", batch: "B10",  swagger: "—",                                                status: "Deferred",  gap: "TIM due date expiry logic" },
      { uiField: "Signoff Lifecycle",    apiField: "(governed)",             source: "TDC", owner: "TDC", batch: "B6",   swagger: "—",                                                status: "Missing",  gap: "Signoff governance not yet delivered" },
      { uiField: "Advisory Opportunity", apiField: "(future)",               source: "TDC", owner: "TDC", batch: "B25",  swagger: "—",                                                status: "Deferred",  gap: "Batch 25 future state" },
    ],
  },
  // ── 8. Practitioner Actions ────────────────────────────────────────────────
  {
    id: "practitioner-actions",
    title: "8. Practitioner Actions",
    desc: "TDC owns all decision records. Immutable once committed. Batch 4 delivers mapping decisions; Batch 6 delivers adjustments and signoff.",
    fields: [
      { uiField: "Accept Mapping",    apiField: "decision: accept",   source: "TDC", owner: "TDC", batch: "B4", swagger: "GET /api/tdc/mapping-decisions", status: "Partial",  gap: "Mapping decisions in progress (Batch 4)" },
      { uiField: "Override Mapping",  apiField: "decision: override", source: "TDC", owner: "TDC", batch: "B4", swagger: "GET /api/tdc/mapping-decisions", status: "Partial",  gap: "Out of Sync — tax_year field gap in Swagger" },
      { uiField: "Reject Mapping",    apiField: "decision: reject",   source: "TDC", owner: "TDC", batch: "B4", swagger: "GET /api/tdc/mapping-decisions", status: "Partial",  gap: "—" },
      { uiField: "Approve Adjustment",apiField: "(adjustment)",       source: "TDC", owner: "TDC", batch: "B6", swagger: "—",                              status: "Missing",  gap: "Six-state adjustment lifecycle in development" },
      { uiField: "Lock / Signoff",    apiField: "(signoff)",          source: "TDC", owner: "TDC", batch: "B6", swagger: "—",                              status: "Missing",  gap: "Immutable signoff not yet delivered" },
      { uiField: "Review Task",       apiField: "(review-task)",      source: "TDC", owner: "TDC", batch: "B6", swagger: "—",                              status: "Missing",  gap: "Review task management not yet delivered" },
    ],
  },
  // ── 9. Lookup / Reference Data ─────────────────────────────────────────────
  {
    id: "lookup-reference",
    title: "9. Lookup / Reference Data",
    desc: "GET /api/lookups?key={key} — TDC owns tax reference data; PDC owns taxonomy. Drives all dropdown population in Roger.",
    fields: [
      { uiField: "Tax Year Dropdown",          apiField: "options[]",                source: "PDC", owner: "PDC", batch: "FC",  swagger: "GET /api/lookups?key=tax-years",        status: "Delivered", gap: "Returns [2026, 2025, 2024, 2023, 2022, 2021]" },
      { uiField: "Tax Form Templates",         apiField: "TaxFormTemplates",         source: "TDC", owner: "TDC", batch: "B3",  swagger: "GET /api/tdc/tax-forms",               status: "Delivered", gap: "Queryable by Jurisdiction and TaxYear" },
      { uiField: "Mapping Rules",              apiField: "MappingRules",             source: "TDC", owner: "TDC", batch: "B3",  swagger: "GET /api/tdc/reference-data",          status: "Delivered", gap: "Orchestrator-facing reference data" },
      { uiField: "XLOB Taxonomy",              apiField: "FirmTaxonomyId",           source: "PDC", owner: "PDC", batch: "B2",  swagger: "GET /api/pdc/taxonomy",                status: "Partial",   gap: "FirmTaxonomyId not documented in Consumer Guide" },
      { uiField: "Confidence Band Thresholds", apiField: "ConfidenceBandThresholds", source: "TDC", owner: "TDC", batch: "B3",  swagger: "GET /api/tdc/reference-data",          status: "Delivered", gap: "Used by AI mapping proposals" },
      { uiField: "Entity Type Enum",           apiField: "type",                     source: "PDC", owner: "PDC", batch: "B5",  swagger: "GET /api/clients/{clientId}/entities", status: "Partial",   gap: "Batch 5 entity identity in progress" },
      { uiField: "Filing Status Enum",         apiField: "filingStatus",             source: "TDC", owner: "TDC", batch: "B6",  swagger: "GET /api/clients/{clientId}/entities", status: "Missing",   gap: "Batch 6 workflow dependency" },
    ],
  },
];

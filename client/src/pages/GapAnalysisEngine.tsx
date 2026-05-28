// ─────────────────────────────────────────────────────────────────────────────
// Gap Analysis Engine — Master Data Intake Readiness Assessment
// Core question 1: Does the Master Data Intake align with what is in Manus?
// Core question 2: What gaps need to be resolved before real data can load?
// Source: DCT_Master_Data_Intake1.xlsx (8 intake entities)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

type AlignStatus = "Aligned" | "Partial" | "Missing";
type GapSeverity = "Critical" | "High" | "Medium" | "Low";
type DataStatus = "Seed Data" | "No Platform Destination" | "Aligned";

interface IntakeField {
  fieldName: string;
  apiField: string;
  required: boolean;
  dashboardStatus: DataStatus;
  gap: string | null;
}

interface ResolutionItem {
  severity: GapSeverity;
  item: string;
  owner: string;
}

interface IntakeEntity {
  id: string;
  sheet: string;
  system: "PDC" | "TDC";
  purpose: string;
  alignStatus: AlignStatus;
  apiEndpoint: string;
  batchOwner: string;
  smesRequired: string;
  fields: IntakeField[];
  resolutionItems: ResolutionItem[];
}

// ── Authoritative intake entity data from DCT_Master_Data_Intake1.xlsx ───────
const INTAKE_ENTITIES: IntakeEntity[] = [
  {
    id: "firm-taxonomy",
    sheet: "PDC — Firm Taxonomy (XLOB)",
    system: "PDC",
    purpose:
      "Cross-LOB financial concept taxonomy. Maps firm-specific account codes to canonical XLOB concepts. Foundation entity — every downstream TDC entity depends on it being loaded first.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/FirmTaxonomy  |  POST /api/FirmTaxonomy/bulk-upload",
    batchOwner: "B4 (Done)",
    smesRequired: "Finance / Chart of Accounts owners",
    fields: [
      { fieldName: "Firm Code", apiField: "firmCode", required: true, dashboardStatus: "Seed Data", gap: "Sample codes (REV-SALES, COGS, OPEX-SAL) — real firm chart of accounts not loaded" },
      { fieldName: "Firm Label", apiField: "firmLabel", required: true, dashboardStatus: "Seed Data", gap: "Sample labels only — real account names from source systems needed from Finance SMEs" },
      { fieldName: "Canonical XLOB Code", apiField: "xlobConceptCode", required: true, dashboardStatus: "Seed Data", gap: "XLOB concept codes present in dashboard but mapped to sample data, not real firm accounts" },
      { fieldName: "Family Code", apiField: "familyCode", required: true, dashboardStatus: "Seed Data", gap: "Family groupings (REVENUE, COGS, OPEX) are seed — real taxonomy hierarchy needed from SMEs" },
      { fieldName: "GL Code", apiField: "glCode", required: false, dashboardStatus: "No Platform Destination", gap: "GL code field exists in intake but has no corresponding field in the dashboard data model" },
      { fieldName: "Normalized Label", apiField: "normalizedLabel", required: false, dashboardStatus: "No Platform Destination", gap: "Normalized label not surfaced in any dashboard page" },
      { fieldName: "Effective Start Date", apiField: "effectiveStartDate", required: true, dashboardStatus: "Seed Data", gap: "Hardcoded to 2024-01-01 in samples — real effective dates needed per firm account" },
      { fieldName: "Created By", apiField: "createdBy", required: true, dashboardStatus: "Seed Data", gap: "Placeholder 'tax.practice' — real user IDs needed" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Obtain real firm chart of accounts from Finance/GL system owners", owner: "PO + Finance SME" },
      { severity: "Critical", item: "Map real firm account codes to canonical XLOB concepts (B4 deliverable)", owner: "Architecture + Tax SME" },
      { severity: "High", item: "Add GL Code field to dashboard data model — currently no platform destination", owner: "Engineering (B4/B5)" },
      { severity: "Medium", item: "Confirm effective date ranges for all firm accounts with Finance", owner: "Finance SME" },
    ],
  },
  {
    id: "entity-types",
    sheet: "PDC — Entity Types",
    system: "PDC",
    purpose:
      "Legal entity classification codes (CCORP, SCORP, PARTNERSHIP, etc.). Required FK for Tax Taxonomy Accounts and Mapping Rules. Must be loaded before TDC tabs.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/EntityTypes  |  POST /api/EntityTypes/bulk-upload",
    batchOwner: "B5 (Done)",
    smesRequired: "Tax Practice / Legal Entity owners",
    fields: [
      { fieldName: "Entity Type Code", apiField: "entityTypeCode", required: true, dashboardStatus: "Seed Data", gap: "CCORP, SCORP, PARTNERSHIP present as seed — confirm these are the complete set for the practice" },
      { fieldName: "Entity Type Name", apiField: "entityTypeName", required: true, dashboardStatus: "Seed Data", gap: "Display names are seed — confirm official names with Tax Practice" },
      { fieldName: "Tax Basis", apiField: "taxBasis", required: true, dashboardStatus: "Seed Data", gap: "Tax basis values (ACCRUAL, CASH, etc.) are seed — real values needed from Tax SMEs" },
      { fieldName: "Description", apiField: "description", required: false, dashboardStatus: "Seed Data", gap: "Descriptions are placeholder — should reflect real practice definitions" },
      { fieldName: "Created By", apiField: "createdBy", required: true, dashboardStatus: "Seed Data", gap: "Placeholder 'tax.practice' — real user IDs needed" },
    ],
    resolutionItems: [
      { severity: "High", item: "Confirm complete list of entity type codes used by the practice (are CCORP/SCORP/PARTNERSHIP sufficient or are there additional types?)", owner: "Tax Practice SME" },
      { severity: "High", item: "Confirm tax basis values per entity type — these drive downstream rule evaluation", owner: "Tax SME" },
      { severity: "Low", item: "Update descriptions to reflect official practice definitions", owner: "Tax Practice SME" },
    ],
  },
  {
    id: "tax-forms",
    sheet: "TDC — Tax Forms & Lines",
    system: "TDC",
    purpose:
      "Tax form codes and line-level definitions. The anchor for all TDC mapping. Every Tax Taxonomy Account and Mapping Rule references a Tax Form Line Code.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/TaxForms  |  POST /api/TaxFormLines/bulk-upload",
    batchOwner: "B6 (Done)",
    smesRequired: "Tax Practice / Form specialists",
    fields: [
      { fieldName: "Form Code", apiField: "formCode", required: true, dashboardStatus: "Seed Data", gap: "1120, 1065, 1120S present as seed — confirm complete list of forms in scope for pilot" },
      { fieldName: "Form Name", apiField: "formName", required: true, dashboardStatus: "Seed Data", gap: "Form names are seed — should match IRS official form titles" },
      { fieldName: "Line Code", apiField: "lineCode", required: true, dashboardStatus: "Seed Data", gap: "Line codes (1120-L1A, 1120-L2, etc.) are seed — real line definitions from IRS forms needed" },
      { fieldName: "Line Label", apiField: "lineLabel", required: true, dashboardStatus: "Seed Data", gap: "Line labels are seed — must match IRS form line descriptions exactly for audit trail" },
      { fieldName: "Line Number", apiField: "lineNumber", required: true, dashboardStatus: "Seed Data", gap: "Line numbers are seed — must be validated against current tax year forms" },
      { fieldName: "Schedule", apiField: "schedule", required: false, dashboardStatus: "No Platform Destination", gap: "Schedule field (e.g., Schedule M-1) exists in intake but not surfaced in dashboard" },
      { fieldName: "Tax Year", apiField: "taxYear", required: true, dashboardStatus: "Seed Data", gap: "Hardcoded to 2024 — real tax year scope needs to be confirmed for pilot" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Confirm which tax forms are in scope for the 9/16 pilot (1120 only? 1065? 1120S?)", owner: "PO + Tax SME" },
      { severity: "Critical", item: "Validate all line codes and labels against current IRS form publications for TY2024", owner: "Tax Practice SME" },
      { severity: "High", item: "Add Schedule field to dashboard data model — currently no platform destination", owner: "Engineering (B6)" },
      { severity: "Medium", item: "Confirm tax year scope — is TY2024 the only year for pilot or are prior years needed?", owner: "PO" },
    ],
  },
  {
    id: "return-templates",
    sheet: "TDC — Return Templates",
    system: "TDC",
    purpose:
      "Return type + jurisdiction + tax year combinations that define what returns the platform supports. Required before entities can be associated with a return.",
    alignStatus: "Missing",
    apiEndpoint: "POST /api/ReturnTemplates  |  POST /api/ReturnTemplates/bulk-upload",
    batchOwner: "B9 PDC (Active)",
    smesRequired: "Tax Practice / Engagement management",
    fields: [
      { fieldName: "Parent Form Code", apiField: "parentFormCode", required: true, dashboardStatus: "No Platform Destination", gap: "Return Templates entity has no corresponding page or data model section in the dashboard" },
      { fieldName: "Return Type", apiField: "returnType", required: true, dashboardStatus: "No Platform Destination", gap: "Not documented anywhere in dashboard — needs a dedicated section in Data Model page" },
      { fieldName: "Tax Year", apiField: "taxYear", required: true, dashboardStatus: "No Platform Destination", gap: "Tax year scoping for return templates not surfaced in dashboard" },
      { fieldName: "Jurisdiction Code", apiField: "jurisdictionCode", required: true, dashboardStatus: "No Platform Destination", gap: "Jurisdiction codes (FED, state codes) not documented in dashboard" },
      { fieldName: "Template Name", apiField: "templateName", required: true, dashboardStatus: "No Platform Destination", gap: "Template naming convention not established in dashboard" },
      { fieldName: "Description", apiField: "description", required: false, dashboardStatus: "No Platform Destination", gap: "No destination" },
      { fieldName: "Created By", apiField: "createdBy", required: true, dashboardStatus: "No Platform Destination", gap: "No destination" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Add Return Templates to the Data Model page — currently zero dashboard coverage for this entity", owner: "Engineering + BA (B9 PDC)" },
      { severity: "Critical", item: "Define jurisdiction scope for pilot — Federal only? Which states?", owner: "PO + Tax SME" },
      { severity: "Critical", item: "Confirm return type list with Tax Practice — which return types are in scope for 9/16 pilot?", owner: "Tax Practice SME" },
      { severity: "High", item: "Establish template naming convention — no standard defined yet", owner: "PO + Tax SME" },
      { severity: "High", item: "Add Jurisdiction Codes reference table to dashboard (needed as FK by Return Templates, Mapping Rules, Filing Due Dates)", owner: "Engineering" },
    ],
  },
  {
    id: "tax-taxonomy",
    sheet: "TDC — Tax Taxonomy Accounts",
    system: "TDC",
    purpose:
      "The bridge between PDC XLOB concepts and TDC tax treatment. Maps canonical financial accounts to tax categories and default form lines. Requires PDC Firm Taxonomy and TDC Tax Form Lines to be loaded first.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/TaxTaxonomyAccounts  |  POST /api/TaxTaxonomyAccounts/bulk-upload",
    batchOwner: "B6 / B7 (Done)",
    smesRequired: "Tax SMEs / Tax Practice leads",
    fields: [
      { fieldName: "Account Code", apiField: "accountCode", required: true, dashboardStatus: "Seed Data", gap: "TAX-REV-SALES, TAX-COGS etc. are seed — real tax account codes needed from Tax SMEs" },
      { fieldName: "Account Name", apiField: "accountName", required: true, dashboardStatus: "Seed Data", gap: "Names are seed — real tax account names needed" },
      { fieldName: "Tax Category", apiField: "taxCategory", required: true, dashboardStatus: "Seed Data", gap: "REVENUE/COGS/DEDUCTION categories are seed — confirm complete category list with Tax SMEs" },
      { fieldName: "Default Form Line Code", apiField: "defaultTaxFormLineCode", required: false, dashboardStatus: "Seed Data", gap: "Default line assignments are seed — real defaults need Tax SME validation" },
      { fieldName: "XLOB Concept Code (FK)", apiField: "xlobConceptCode", required: true, dashboardStatus: "Seed Data", gap: "FK to Firm Taxonomy — will break if real firm taxonomy codes differ from seed" },
      { fieldName: "Effective Start Date", apiField: "effectiveStartDate", required: true, dashboardStatus: "Seed Data", gap: "Hardcoded 2024-01-01 — real effective dates needed" },
      { fieldName: "Applicable Entity Types", apiField: "entityTypes", required: true, dashboardStatus: "Seed Data", gap: "Pipe-separated entity type codes — must match real Entity Types loaded in PDC" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Tax Taxonomy Accounts depend on real Firm Taxonomy being loaded first — resolve PDC Firm Taxonomy gaps before this entity can be populated with real data", owner: "PO (sequencing dependency)" },
      { severity: "Critical", item: "Tax SMEs must validate all default form line assignments — incorrect defaults will produce wrong AI mapping proposals", owner: "Tax Practice SME" },
      { severity: "High", item: "Confirm complete tax category list (REVENUE, COGS, DEDUCTION — are there others such as CREDIT, ADJUSTMENT?)", owner: "Tax SME" },
      { severity: "Medium", item: "Validate entity type applicability per account — seed data uses CCORP broadly; real data may differ by account", owner: "Tax SME" },
    ],
  },
  {
    id: "mapping-rules",
    sheet: "TDC — Mapping Rules",
    system: "TDC",
    purpose:
      "The encoded tax judgment of the practice. Rules drive AI mapping proposals. Each rule carries authorship provenance. Four rule types: DIRECT, PATTERN, OVERRIDE, DEFAULT.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/MappingRules  |  POST /api/MappingRules/bulk-upload",
    batchOwner: "B7 / B17 (Active/Planned)",
    smesRequired: "Tax Practice leads / Senior Tax SMEs",
    fields: [
      { fieldName: "Description", apiField: "description", required: true, dashboardStatus: "Seed Data", gap: "Sample rule descriptions — real rule descriptions must come from Tax Practice" },
      { fieldName: "Rule Type", apiField: "ruleType", required: true, dashboardStatus: "Seed Data", gap: "DIRECT/PATTERN/OVERRIDE/DEFAULT types are in dashboard but mapped to sample rules only" },
      { fieldName: "Target Line Code (FK)", apiField: "targetTaxFormLineCode", required: true, dashboardStatus: "Seed Data", gap: "FK to Tax Form Lines — will break if real form line codes differ from seed" },
      { fieldName: "Weight", apiField: "weight", required: true, dashboardStatus: "No Platform Destination", gap: "Weight (0.00–1.00) field exists in intake but not surfaced in dashboard Mapping Rules view" },
      { fieldName: "Confidence Contribution", apiField: "confidenceContribution", required: true, dashboardStatus: "No Platform Destination", gap: "Confidence contribution field not documented in any dashboard page" },
      { fieldName: "Author ID", apiField: "authorId", required: true, dashboardStatus: "Seed Data", gap: "Placeholder 'jdoe'/'msmith' — real author IDs needed (must match practitioner IDs in system)" },
      { fieldName: "Author Name", apiField: "authorName", required: true, dashboardStatus: "Seed Data", gap: "Placeholder names — real practitioner names needed" },
      { fieldName: "Authored At", apiField: "authoredAt", required: true, dashboardStatus: "Seed Data", gap: "Sample dates — real authorship timestamps needed for audit trail" },
      { fieldName: "Jurisdiction Codes", apiField: "jurisdictionCodes", required: true, dashboardStatus: "Seed Data", gap: "FED only in seed — real jurisdiction scope needed" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Tax Practice leads must author real mapping rules — this is encoded tax judgment, cannot be fabricated or carried from seed data", owner: "Tax Practice SME (Senior)" },
      { severity: "Critical", item: "Add Weight and Confidence Contribution fields to the dashboard Mapping Rules view — currently no platform destination for these fields", owner: "Engineering (B17)" },
      { severity: "High", item: "Establish author ID convention — must match practitioner IDs used in the engagement system", owner: "PO + Engineering" },
      { severity: "High", item: "Confirm jurisdiction scope for pilot — FED only or include state jurisdictions?", owner: "PO + Tax SME" },
      { severity: "Medium", item: "Define rule priority/conflict resolution policy — what happens when multiple rules match the same account?", owner: "Architecture + Tax SME" },
    ],
  },
  {
    id: "filing-due-dates",
    sheet: "TDC — Filing Due Dates",
    system: "TDC",
    purpose:
      "Filing deadlines per return type, jurisdiction, and tax year. Drives deadline-aware workflow and reporting. Must be set before the platform can compute deadline-driven triggers.",
    alignStatus: "Missing",
    apiEndpoint: "POST /api/FilingDueDates  |  POST /api/FilingDueDates/bulk-upload",
    batchOwner: "B20 (Planned)",
    smesRequired: "Tax Practice / Compliance calendar owners",
    fields: [
      { fieldName: "Return Type", apiField: "returnType", required: true, dashboardStatus: "No Platform Destination", gap: "Filing Due Dates entity has no corresponding page or section in the dashboard" },
      { fieldName: "Jurisdiction Code", apiField: "jurisdictionCode", required: true, dashboardStatus: "No Platform Destination", gap: "No jurisdiction code reference table in dashboard" },
      { fieldName: "Tax Year", apiField: "taxYear", required: true, dashboardStatus: "No Platform Destination", gap: "No tax year scoping for filing deadlines in dashboard" },
      { fieldName: "Due Date", apiField: "dueDate", required: true, dashboardStatus: "No Platform Destination", gap: "Filing deadline dates not surfaced anywhere in dashboard" },
      { fieldName: "Created By", apiField: "createdBy", required: true, dashboardStatus: "No Platform Destination", gap: "No destination" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Add Filing Due Dates to the Data Model page — currently zero dashboard coverage for this entity", owner: "Engineering + BA (B20)" },
      { severity: "Critical", item: "Compliance calendar owners must provide real filing deadlines per return type and jurisdiction for TY2024", owner: "Tax Practice / Compliance SME" },
      { severity: "High", item: "Confirm whether extension deadlines are also needed (e.g., 1120 extended to October 15)", owner: "Tax SME" },
      { severity: "High", item: "Jurisdiction code reference table must be established before this entity can be loaded (shared dependency with Return Templates and Mapping Rules)", owner: "Engineering (B20)" },
    ],
  },
  {
    id: "confidence-bands",
    sheet: "TDC — Confidence Bands",
    system: "TDC",
    purpose:
      "Numeric thresholds that classify AI mapping proposals into GREEN/YELLOW/RED bands. These are the practice's policy levers — they determine which proposals auto-accept, require review, or block progression.",
    alignStatus: "Partial",
    apiEndpoint: "POST /api/ConfidenceBandThresholds  |  PUT /api/ConfidenceBandThresholds/{id}",
    batchOwner: "B7 / B17 (Active/Planned)",
    smesRequired: "Tax Practice leadership / QA leads",
    fields: [
      { fieldName: "Band Name", apiField: "bandName", required: true, dashboardStatus: "Aligned", gap: null },
      { fieldName: "Min Value", apiField: "minValue", required: true, dashboardStatus: "Seed Data", gap: "Sample thresholds (0.85/0.60/0.00) — real thresholds must be set by Tax Practice leadership as a policy decision" },
      { fieldName: "Max Value", apiField: "maxValue", required: true, dashboardStatus: "Seed Data", gap: "Sample thresholds — same as above" },
      { fieldName: "Generates Review Task?", apiField: "generatesReviewTask", required: true, dashboardStatus: "No Platform Destination", gap: "Review task generation flag not surfaced in dashboard Confidence Band view" },
      { fieldName: "Bulk-Accept Eligible?", apiField: "bulkAcceptEligible", required: true, dashboardStatus: "No Platform Destination", gap: "Bulk-accept eligibility flag not documented in any dashboard page" },
      { fieldName: "Blocks Progression?", apiField: "blocksProgression", required: true, dashboardStatus: "No Platform Destination", gap: "Progression blocking flag not surfaced in dashboard" },
    ],
    resolutionItems: [
      { severity: "Critical", item: "Tax Practice leadership must set real confidence thresholds as a formal policy decision — seed values (0.85/0.60/0.00) are directional only", owner: "Tax Practice Leadership" },
      { severity: "High", item: "Add Generates Review Task, Bulk-Accept Eligible, and Blocks Progression flags to the dashboard Confidence Band view — currently no platform destination for these fields", owner: "Engineering (B17)" },
      { severity: "High", item: "Define the review task workflow — when a YELLOW/RED proposal generates a review task, what is the assignment and escalation path?", owner: "PO + Tax SME" },
      { severity: "Medium", item: "Confirm whether different confidence thresholds apply per entity type or jurisdiction (or are thresholds global?)", owner: "Tax Practice Leadership" },
    ],
  },
];

// ── Computed stats ────────────────────────────────────────────────────────────
const aligned = INTAKE_ENTITIES.filter(e => e.alignStatus === "Aligned").length;
const partial = INTAKE_ENTITIES.filter(e => e.alignStatus === "Partial").length;
const missing = INTAKE_ENTITIES.filter(e => e.alignStatus === "Missing").length;
const totalGaps = INTAKE_ENTITIES.flatMap(e => e.resolutionItems).length;
const criticalGaps = INTAKE_ENTITIES.flatMap(e => e.resolutionItems).filter(r => r.severity === "Critical").length;
const noDestCount = INTAKE_ENTITIES.flatMap(e => e.fields).filter(f => f.dashboardStatus === "No Platform Destination").length;

// ── Style helpers ─────────────────────────────────────────────────────────────
const alignColor: Record<AlignStatus, string> = { Aligned: "#16a34a", Partial: "#d97706", Missing: "#dc2626" };
const alignBg: Record<AlignStatus, string> = { Aligned: "#f0fdf4", Partial: "#fffbeb", Missing: "#fef2f2" };
const sevColor: Record<GapSeverity, string> = { Critical: "#dc2626", High: "#ea580c", Medium: "#d97706", Low: "#6b7280" };
const sevBg: Record<GapSeverity, string> = { Critical: "#fef2f2", High: "#fff7ed", Medium: "#fffbeb", Low: "#f9fafb" };
const dsColor: Record<DataStatus, string> = { "Seed Data": "#7c3aed", "No Platform Destination": "#dc2626", "Aligned": "#16a34a" };

// ── Gap Report builder ────────────────────────────────────────────────────────
function buildGapReport(): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const critItems = INTAKE_ENTITIES.flatMap(e =>
    e.resolutionItems.filter(r => r.severity === "Critical").map(r => `  • [${e.sheet}] ${r.item}\n    Owner: ${r.owner}`)
  ).join("\n\n");
  const highItems = INTAKE_ENTITIES.flatMap(e =>
    e.resolutionItems.filter(r => r.severity === "High").map(r => `  • [${e.sheet}] ${r.item}\n    Owner: ${r.owner}`)
  ).join("\n\n");
  const entitySummary = INTAKE_ENTITIES.map(e => {
    const icon = e.alignStatus === "Aligned" ? "✓" : e.alignStatus === "Partial" ? "~" : "✗";
    return `  ${icon} ${e.sheet} (${e.system}) — ${e.alignStatus} | Batch: ${e.batchOwner}`;
  }).join("\n");

  return `DCT PLATFORM — MASTER DATA INTAKE GAP REPORT
Generated: ${today}
Source: DCT_Master_Data_Intake1.xlsx
Dashboard Version: v4_corrected

═══════════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

The Master Data Intake workbook defines 8 data entities required to move
the DCT Platform from seed/sample data to real production data for the
9/16 Pilot Start. This report assesses alignment between the intake
instrument and the current Manus dashboard, and identifies gaps that
must be resolved before SMEs and leadership can begin populating real data.

ALIGNMENT SCORECARD
  Fully Aligned:        ${aligned} of 8 entities
  Partially Aligned:    ${partial} of 8 entities
  Missing (no coverage): ${missing} of 8 entities

GAP SUMMARY
  Total resolution items:              ${totalGaps}
  Critical gaps (must resolve first):  ${criticalGaps}
  Fields with no platform destination: ${noDestCount}

OVERALL READINESS: NOT READY FOR REAL DATA COLLECTION
  — ${missing} entities have zero dashboard coverage and must be built
    before the intake form can be used to load real data.
  — ${noDestCount} fields in the intake have no corresponding destination
    in the platform data model.
  — All 8 entities currently contain seed/sample data only.

═══════════════════════════════════════════════════════════════
ENTITY ALIGNMENT STATUS
═══════════════════════════════════════════════════════════════

${entitySummary}

═══════════════════════════════════════════════════════════════
CRITICAL GAPS — MUST RESOLVE BEFORE DATA COLLECTION BEGINS
═══════════════════════════════════════════════════════════════

${critItems}

═══════════════════════════════════════════════════════════════
HIGH PRIORITY GAPS
═══════════════════════════════════════════════════════════════

${highItems}

═══════════════════════════════════════════════════════════════
ENTITIES WITH NO PLATFORM DESTINATION (BUILD REQUIRED)
═══════════════════════════════════════════════════════════════

  • Return Templates — No dashboard page or data model section exists.
    Required fields: parentFormCode, returnType, taxYear, jurisdictionCode,
    templateName. Batch owner: B9 PDC.

  • Filing Due Dates — No dashboard page or data model section exists.
    Required fields: returnType, jurisdictionCode, taxYear, dueDate.
    Batch owner: B20.

  • Jurisdiction Code Reference Table — Required as FK by Return Templates,
    Mapping Rules, and Filing Due Dates. Not yet established in the platform.

═══════════════════════════════════════════════════════════════
RECOMMENDED NEXT STEPS FOR PO
═══════════════════════════════════════════════════════════════

  1. Schedule SME working sessions for PDC Firm Taxonomy and TDC Tax Forms —
     these are the foundational entities. All other entities depend on them.

  2. Escalate Return Templates and Filing Due Dates to Engineering for
     B9 PDC and B20 scope — both entities have zero platform coverage.

  3. Request Tax Practice leadership to set real confidence band thresholds
     as a formal policy decision before B17 begins.

  4. Establish Jurisdiction Code reference table as a shared dependency
     resolution item (blocks 3 entities).

  5. Confirm pilot scope: which forms, which entity types, which jurisdictions,
     which tax year — before any real data collection begins.

═══════════════════════════════════════════════════════════════
© 2026 RSM US LLP · CATT · DCT Platform · CONFIDENTIAL
═══════════════════════════════════════════════════════════════`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GapAnalysisEngine() {
  const [activeEntity, setActiveEntity] = useState<string>("firm-taxonomy");
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterSev, setFilterSev] = useState<GapSeverity | "All">("All");

  const entity = INTAKE_ENTITIES.find(e => e.id === activeEntity);
  const reportText = buildGapReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const allItems = INTAKE_ENTITIES.flatMap(e =>
    e.resolutionItems.map(r => ({ ...r, entitySheet: e.sheet, system: e.system }))
  ).filter(r => filterSev === "All" || r.severity === filterSev);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#0f2d5e", padding: "24px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>G</span>
              </div>
              <div>
                <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Gap Analysis Engine</h1>
                <p style={{ color: "#93c5fd", fontSize: 13, margin: 0 }}>Master Data Intake — Platform Readiness Assessment</p>
              </div>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, maxWidth: 680 }}>
              <strong style={{ color: "#fff" }}>Question 1:</strong> Does the Master Data Intake align with what is in Manus?&nbsp;&nbsp;
              <strong style={{ color: "#fff" }}>Question 2:</strong> What gaps must be resolved before real data can replace seed data?
            </p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            📋 Generate Gap Report
          </button>
        </div>
      </div>

      {/* Scorecard bar */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 32px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#dc2626", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#374151" }}><strong style={{ color: "#dc2626" }}>{missing}</strong> Missing</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#d97706", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#374151" }}><strong style={{ color: "#d97706" }}>{partial}</strong> Partial</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#374151" }}><strong style={{ color: "#16a34a" }}>{aligned}</strong> Aligned</span>
        </div>
        <div style={{ width: 1, height: 18, backgroundColor: "#e2e8f0" }} />
        <span style={{ fontSize: 13, color: "#374151" }}><strong style={{ color: "#dc2626" }}>{criticalGaps}</strong> critical gaps</span>
        <span style={{ fontSize: 13, color: "#374151" }}><strong style={{ color: "#7c3aed" }}>{noDestCount}</strong> fields with no platform destination</span>
        <div style={{ marginLeft: "auto", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 12px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>⚠ NOT READY FOR REAL DATA COLLECTION</span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 170px)" }}>

        {/* Left nav */}
        <div style={{ width: 260, flexShrink: 0, backgroundColor: "#fff", borderRight: "1px solid #e2e8f0", paddingTop: 12 }}>
          <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Intake Entities (8)
          </div>
          {INTAKE_ENTITIES.map(e => (
            <button
              key={e.id}
              onClick={() => setActiveEntity(e.id)}
              style={{
                width: "100%", textAlign: "left", padding: "10px 16px", border: "none", cursor: "pointer",
                backgroundColor: activeEntity === e.id ? "#eff6ff" : "transparent",
                borderLeft: activeEntity === e.id ? "3px solid #1d4ed8" : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: activeEntity === e.id ? 600 : 400, color: activeEntity === e.id ? "#1d4ed8" : "#374151", lineHeight: 1.3 }}>{e.sheet}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{e.system} · {e.batchOwner}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: alignColor[e.alignStatus], backgroundColor: alignBg[e.alignStatus], padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {e.alignStatus}
                </span>
              </div>
            </button>
          ))}
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }}>
            <button
              onClick={() => setActiveEntity("all-gaps")}
              style={{
                width: "100%", textAlign: "left", padding: "10px 16px", border: "none", cursor: "pointer",
                backgroundColor: activeEntity === "all-gaps" ? "#fef2f2" : "transparent",
                borderLeft: activeEntity === "all-gaps" ? "3px solid #dc2626" : "3px solid transparent",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: activeEntity === "all-gaps" ? 600 : 400, color: activeEntity === "all-gaps" ? "#dc2626" : "#374151" }}>
                📋 All Resolution Items
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{totalGaps} items · {criticalGaps} critical</div>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>

          {activeEntity === "all-gaps" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>All Resolution Items</h2>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Complete list of gaps to resolve before real data collection can begin</p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Critical", "High", "Medium", "Low"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterSev(s)}
                      style={{
                        padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
                        backgroundColor: filterSev === s ? (s === "All" ? "#0f2d5e" : sevBg[s as GapSeverity]) : "#fff",
                        color: filterSev === s ? (s === "All" ? "#fff" : sevColor[s as GapSeverity]) : "#6b7280",
                        borderColor: filterSev === s ? (s === "All" ? "#0f2d5e" : sevColor[s as GapSeverity]) : "#e2e8f0",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allItems.map((r, i) => (
                  <div key={i} style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${sevColor[r.severity]}`, borderRadius: 8, padding: "12px 16px", display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[r.severity], backgroundColor: sevBg[r.severity], padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start" }}>
                      {r.severity}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{r.item}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{r.entitySheet}</span> · Owner: {r.owner}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : entity ? (
            <div>
              {/* Entity header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>{entity.sheet}</h2>
                  <span style={{ fontSize: 12, fontWeight: 700, color: alignColor[entity.alignStatus], backgroundColor: alignBg[entity.alignStatus], padding: "3px 10px", borderRadius: 6, border: `1px solid ${alignColor[entity.alignStatus]}` }}>
                    {entity.alignStatus}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: entity.system === "PDC" ? "#1d4ed8" : "#7c3aed", backgroundColor: entity.system === "PDC" ? "#eff6ff" : "#f5f3ff", padding: "3px 8px", borderRadius: 6 }}>
                    {entity.system}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#475569", margin: 0, maxWidth: 700 }}>{entity.purpose}</p>
              </div>

              {/* Meta row */}
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { label: "API Endpoint", value: entity.apiEndpoint, mono: true },
                  { label: "Batch Owner", value: entity.batchOwner, mono: false },
                  { label: "SMEs Required", value: entity.smesRequired, mono: false },
                ].map(m => (
                  <div key={m.label} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", minWidth: 180 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                    <div style={{ fontSize: m.mono ? 11 : 12, fontFamily: m.mono ? "monospace" : "inherit", color: "#0f172a", marginTop: 3 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Field status table */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
                  Field Status — Intake vs. Dashboard
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0f2d5e" }}>
                        {["Field Name", "API Field", "Required", "Dashboard Status", "Gap / Action Needed"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entity.fields.map((f, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0f172a" }}>{f.fieldName}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>{f.apiField}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: f.required ? "#dc2626" : "#6b7280", backgroundColor: f.required ? "#fef2f2" : "#f9fafb", padding: "2px 7px", borderRadius: 4 }}>
                              {f.required ? "Required" : "Optional"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: dsColor[f.dashboardStatus], backgroundColor: f.dashboardStatus === "Aligned" ? "#f0fdf4" : f.dashboardStatus === "Seed Data" ? "#f5f3ff" : "#fef2f2", padding: "2px 7px", borderRadius: 4 }}>
                              {f.dashboardStatus}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: f.gap ? "#374151" : "#16a34a" }}>
                            {f.gap ?? "✓ Aligned"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resolution items */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
                  Resolution Items ({entity.resolutionItems.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {entity.resolutionItems.map((r, i) => (
                    <div key={i} style={{ backgroundColor: "#fff", border: `1px solid ${sevColor[r.severity]}33`, borderLeft: `4px solid ${sevColor[r.severity]}`, borderRadius: 8, padding: "12px 16px", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[r.severity], backgroundColor: sevBg[r.severity], padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start" }}>
                        {r.severity}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{r.item}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Owner: <strong>{r.owner}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Generate Gap Report Modal */}
      {showReport && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, width: "100%", maxWidth: 760, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Master Data Intake — Gap Report</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Ready to copy into Outlook, Teams, or a Word document</p>
              </div>
              <button onClick={() => setShowReport(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              <pre style={{ fontSize: 12, fontFamily: "monospace", color: "#0f172a", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0 }}>
                {reportText}
              </pre>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => window.print()}
                style={{ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#374151" }}
              >
                🖨 Print / Save as PDF
              </button>
              <button
                onClick={handleCopy}
                style={{ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: copied ? "#16a34a" : "#dc2626", color: "#fff" }}
              >
                {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Source: DCT_Master_Data_Intake1.xlsx · Dashboard: v4_corrected · © 2026 RSM US LLP</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Last analyzed: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
    </div>
  );
}

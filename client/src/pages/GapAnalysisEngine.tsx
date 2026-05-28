import { useState } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type GapSeverity = "Critical" | "High" | "Medium" | "Low";
type GapStatus = "Open" | "In Progress" | "Resolved";
type CoverageStatus = "Yes" | "No" | "Partial";

interface GapItem {
  id: string;
  entity: string;
  category: string;
  description: string;
  severity: GapSeverity;
  impactedSystem: string;
  impactedBatch: string;
  impactedApis: string;
  governanceRisk: string;
  operationalRisk: string;
  action: string;
  owner: string;
  status: GapStatus;
}

interface EntityCoverage {
  entity: string;
  sheet: string;
  purpose: string;
  owner: string;
  dependency: string;
  criticality: string;
  existsInManus: CoverageStatus;
  existsInSwagger: CoverageStatus;
  requiredFieldsDoc: CoverageStatus;
  validationRulesDoc: CoverageStatus;
  ownershipBoundaries: CoverageStatus;
  apiContract: CoverageStatus;
  lineageControls: CoverageStatus;
  aiGovernance: CoverageStatus;
  productionReady: CoverageStatus;
}

// ─── MASTER ENTITY INVENTORY ─────────────────────────────────────────────────
const ENTITY_INVENTORY: EntityCoverage[] = [
  {
    entity: "Firm Taxonomy (XLOB)",
    sheet: "PDC - Firm Taxonomy (XLOB)",
    purpose: "Cross-LOB chart of accounts. Foundation for all classification, mapping, and tax treatment. Every TDC entity requires a valid XLOB Concept reference.",
    owner: "PDC",
    dependency: "None — must load first",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Partial",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Partial",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "Partial",
  },
  {
    entity: "Standard Appearances",
    sheet: "PDC - Standard Appearances",
    purpose: "Maps XLOB concepts to external standards (XBRL, US-GAAP, IFRS). Provides canonical URIs and balance/period types for interoperability.",
    owner: "PDC",
    dependency: "PDC - Firm Taxonomy (XLOB)",
    criticality: "High",
    existsInManus: "Partial",
    existsInSwagger: "No",
    requiredFieldsDoc: "No",
    validationRulesDoc: "No",
    ownershipBoundaries: "Partial",
    apiContract: "No",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "No",
  },
  {
    entity: "Entity Types",
    sheet: "PDC - Entity Types",
    purpose: "Reference data for legal entity classifications (CCORP, SCORP, PARTNER, etc.). Required before any TDC content can load.",
    owner: "PDC",
    dependency: "None — must load after XLOB",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Partial",
    requiredFieldsDoc: "Yes",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Partial",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "Partial",
  },
  {
    entity: "Jurisdiction Types",
    sheet: "PDC - Jurisdiction Types",
    purpose: "Reference data for jurisdiction categories (FED, STATE, etc.). Required by Tax Forms, Mapping Rules, and Filing Due Dates.",
    owner: "PDC",
    dependency: "PDC - Firm Taxonomy (XLOB)",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Partial",
    requiredFieldsDoc: "Yes",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Partial",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "Partial",
  },
  {
    entity: "Tax Forms",
    sheet: "TDC - Tax Forms",
    purpose: "Header record for each supported tax form (Form 1120, Form 1065, etc.). Return Templates and Tax Form Lines both reference this entity.",
    owner: "TDC",
    dependency: "PDC Entity Types, PDC Jurisdiction Types",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Yes",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Yes",
    lineageControls: "Partial",
    aiGovernance: "No",
    productionReady: "Partial",
  },
  {
    entity: "Tax Form Lines",
    sheet: "TDC - Tax Form Lines",
    purpose: "Line-level structure of each tax form. Tax Taxonomy Accounts use these as default destinations; Mapping Rules use these as targets.",
    owner: "TDC",
    dependency: "TDC - Tax Forms",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Yes",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Yes",
    lineageControls: "Partial",
    aiGovernance: "No",
    productionReady: "Partial",
  },
  {
    entity: "Return Templates",
    sheet: "TDC - Return Templates",
    purpose: "Named templates for a given tax form, tax year, and jurisdiction combination. Referenced by Orchestrator and Roger when generating mapping proposals.",
    owner: "TDC",
    dependency: "TDC - Tax Forms",
    criticality: "High",
    existsInManus: "Partial",
    existsInSwagger: "Partial",
    requiredFieldsDoc: "No",
    validationRulesDoc: "No",
    ownershipBoundaries: "Partial",
    apiContract: "Partial",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "No",
  },
  {
    entity: "Tax Taxonomy Accounts",
    sheet: "TDC - Tax Taxonomy Accounts",
    purpose: "Bridge between cross-LOB financial data (XLOB) and tax treatment. Connects firm-classified data to a default tax form line. Core of the classification engine.",
    owner: "TDC",
    dependency: "XLOB Taxonomy, Entity Types, Tax Form Lines",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Yes",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Yes",
    lineageControls: "Partial",
    aiGovernance: "Partial",
    productionReady: "Partial",
  },
  {
    entity: "Mapping Rules",
    sheet: "TDC - Mapping Rules",
    purpose: "Rules driving how firm-classified financial data lands on a specific tax form line. AI uses these rules to generate mapping proposals. Carries authorship provenance.",
    owner: "TDC",
    dependency: "Tax Form Lines, PDC reference data",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Yes",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Yes",
    lineageControls: "Partial",
    aiGovernance: "Partial",
    productionReady: "Partial",
  },
  {
    entity: "Filing Due Dates",
    sheet: "TDC - Filing Due Dates",
    purpose: "Filing deadline per return type, jurisdiction, and tax year. Drives deadline-aware workflow and reporting triggers.",
    owner: "TDC",
    dependency: "Tax Forms, Jurisdiction Types, Tax Year",
    criticality: "High",
    existsInManus: "Partial",
    existsInSwagger: "No",
    requiredFieldsDoc: "No",
    validationRulesDoc: "No",
    ownershipBoundaries: "Partial",
    apiContract: "No",
    lineageControls: "No",
    aiGovernance: "No",
    productionReady: "No",
  },
  {
    entity: "Confidence Band Thresholds",
    sheet: "TDC - Confidence Bands",
    purpose: "Numeric ranges classifying AI mapping proposals into GREEN/YELLOW/RED bands. Governs auto-accept eligibility, review requirements, and progression blocking.",
    owner: "TDC",
    dependency: "None — independent; must be set before AI proposals are generated",
    criticality: "Critical",
    existsInManus: "Yes",
    existsInSwagger: "Partial",
    requiredFieldsDoc: "Partial",
    validationRulesDoc: "No",
    ownershipBoundaries: "Yes",
    apiContract: "Partial",
    lineageControls: "No",
    aiGovernance: "Partial",
    productionReady: "Partial",
  },
];

// ─── GAP ANALYSIS DATA ────────────────────────────────────────────────────────
const GAP_DATA: GapItem[] = [
  // CRITICAL GAPS
  { id: "GAP-001", entity: "Firm Taxonomy (XLOB)", category: "Missing Validation Rules", description: "No validation rules documented for ConceptCode format, parentCode referential integrity, or LOB applicability bitmask values. Downstream classification failures will be silent.", severity: "Critical", impactedSystem: "PDC", impactedBatch: "B1, B2", impactedApis: "POST /xlob-concepts, PATCH /xlob-concepts/{id}", governanceRisk: "Silent data corruption in classification engine", operationalRisk: "Invalid concepts accepted at load time; downstream tax mapping failures", action: "Define and document validation rules for all 8 XLOB fields in Swagger and Consumer Hub", owner: "PDC Architect", status: "Open" },
  { id: "GAP-002", entity: "Confidence Band Thresholds", category: "Missing Validation Rules", description: "No validation rules for band overlap prevention (GREEN max must equal YELLOW min), range completeness (0.00–1.00 must be fully covered), or boolean flag consistency (bulkAcceptEligible must be FALSE when blocksProgression is TRUE).", severity: "Critical", impactedSystem: "TDC", impactedBatch: "B4", impactedApis: "POST /confidence-bands, GET /confidence-bands", governanceRisk: "AI proposals may be auto-accepted when they should be blocked", operationalRisk: "Practitioners bypass required review; incorrect tax decisions propagate", action: "Add band overlap and completeness validation to Confidence Band API contract and Consumer Hub Section 5", owner: "TDC Architect", status: "Open" },
  { id: "GAP-003", entity: "Mapping Rules", category: "Missing Lineage", description: "Mapping Rules carry authorId and authoredAt but there is no immutable audit trail for rule modifications. Rule versioning, supersession tracking, and rollback capability are undocumented.", severity: "Critical", impactedSystem: "TDC", impactedBatch: "B4, B6", impactedApis: "PUT /mapping-rules/{id}, DELETE /mapping-rules/{id}", governanceRisk: "Tax decisions cannot be traced to the rule version that generated them", operationalRisk: "Regulatory audit exposure; inability to replay historical tax computations", action: "Define immutable rule versioning model in Batch 4 feature scope; add lineage chain to Swagger", owner: "TDC Architect / BA", status: "Open" },
  { id: "GAP-004", entity: "Tax Taxonomy Accounts", category: "Missing Validation Rules", description: "No validation for XLOB Concept Code FK referential integrity at load time. accountCode uniqueness constraint is undocumented. entityTypes pipe-separated format has no documented enumeration.", severity: "Critical", impactedSystem: "TDC", impactedBatch: "B3, B4", impactedApis: "POST /tax-taxonomy-accounts", governanceRisk: "Invalid taxonomy accounts accepted; AI classification produces incorrect proposals", operationalRisk: "Tax form line mapping failures at runtime; practitioner review of invalid proposals", action: "Document FK validation, uniqueness constraints, and entityTypes enumeration in Swagger and Consumer Hub", owner: "TDC Architect", status: "Open" },
  { id: "GAP-005", entity: "Filing Due Dates", category: "Missing API Support", description: "Filing Due Dates entity has no documented API contract in Swagger or Consumer Hub. No CRUD endpoints, no pagination, no filtering by tax year or jurisdiction. Deadline-aware workflow cannot be operationalized.", severity: "Critical", impactedSystem: "TDC", impactedBatch: "B10", impactedApis: "None — missing entirely", governanceRisk: "Filing deadline governance is undocumented and unenforceable", operationalRisk: "Platform cannot drive deadline-aware triggers; manual deadline tracking required", action: "Define Filing Due Date API contract (GET/POST/PUT) in B10 feature scope; add to Swagger and Consumer Hub", owner: "TDC Architect / B10 PO", status: "Open" },
  { id: "GAP-006", entity: "Standard Appearances", category: "Missing API Support", description: "Standard Appearances (XBRL/US-GAAP/IFRS mappings) have no documented API contract. No endpoints for creating, reading, or updating standard appearance mappings. External interoperability is blocked.", severity: "Critical", impactedSystem: "PDC", impactedBatch: "B2, B13", impactedApis: "None — missing entirely", governanceRisk: "XBRL/US-GAAP compliance cannot be verified or audited", operationalRisk: "External reporting and regulatory filing requires manual standard mapping", action: "Define Standard Appearances API contract in B2/B13 feature scope; add externalUri validation", owner: "PDC Architect", status: "Open" },
  // HIGH GAPS
  { id: "GAP-007", entity: "Return Templates", category: "Missing Required Fields Documentation", description: "Return Template fields (parentFormCode, returnType, taxYear, jurisdictionCode, templateName) are documented in the workbook but not in Swagger or Consumer Hub. Description and createdBy are undocumented as optional.", severity: "High", impactedSystem: "TDC", impactedBatch: "B9, B10", impactedApis: "POST /return-templates, GET /return-templates", governanceRisk: "Roger cannot reliably reference return templates without field contract", operationalRisk: "Orchestrator mapping proposal generation may fail on missing template references", action: "Add Return Template field contract to Consumer Hub Section 5 and Swagger", owner: "TDC Architect", status: "Open" },
  { id: "GAP-008", entity: "Confidence Band Thresholds", category: "Missing AI Governance", description: "Confidence bands define AI behavior (auto-accept, review, block) but there is no documented governance process for who can modify bands, what approval is required, and how changes are audited.", severity: "High", impactedSystem: "TDC", impactedBatch: "B4", impactedApis: "PUT /confidence-bands/{id}", governanceRisk: "Unauthorized band changes could silently alter AI acceptance behavior", operationalRisk: "Practitioners may not be aware of band changes affecting their review queue", action: "Define confidence band change governance process: approver role, audit log, notification to practitioners", owner: "TDC PO / Governance", status: "Open" },
  { id: "GAP-009", entity: "Mapping Rules", category: "Missing Jurisdiction Logic", description: "Mapping Rules carry jurisdictionCodes (pipe-separated) but there is no documented validation that jurisdiction codes exist in the PDC Jurisdiction Types reference table before a rule is accepted.", severity: "High", impactedSystem: "TDC", impactedBatch: "B4", impactedApis: "POST /mapping-rules", governanceRisk: "Rules referencing invalid jurisdictions are silently accepted", operationalRisk: "Tax form line mapping fails for jurisdictions with invalid rule references", action: "Add FK validation for jurisdictionCodes against PDC Jurisdiction Types in Mapping Rule API contract", owner: "TDC Architect", status: "Open" },
  { id: "GAP-010", entity: "Tax Form Lines", category: "Missing State Transitions", description: "Tax Form Lines have no documented lifecycle states (Draft, Active, Deprecated). No process for deprecating a line that is referenced by active Mapping Rules or Tax Taxonomy Accounts.", severity: "High", impactedSystem: "TDC", impactedBatch: "B3", impactedApis: "DELETE /tax-form-lines/{id}, PATCH /tax-form-lines/{id}", governanceRisk: "Active mapping rules may reference deprecated form lines; tax computation errors", operationalRisk: "Form line changes during a tax year break in-flight return assembly", action: "Define Tax Form Line lifecycle states and deprecation guard in B3 feature scope", owner: "TDC Architect", status: "Open" },
  { id: "GAP-011", entity: "Firm Taxonomy (XLOB)", category: "Missing Lineage", description: "XLOB Concept hierarchy (hierarchyPath) has no documented lineage controls. Parent-child relationship changes are not tracked. No audit trail for concept reclassifications.", severity: "High", impactedSystem: "PDC", impactedBatch: "B2", impactedApis: "PATCH /xlob-concepts/{id}", governanceRisk: "Reclassification of XLOB concepts silently changes downstream tax treatment", operationalRisk: "Historical financial data mapped under old hierarchy produces incorrect tax results", action: "Add XLOB concept change audit trail to B2 feature scope; document in lineage governance section", owner: "PDC Architect", status: "Open" },
  { id: "GAP-012", entity: "Tax Taxonomy Accounts", category: "Missing Practitioner Review Controls", description: "Tax Taxonomy Account changes (new accounts, effective date changes, entity type applicability changes) have no documented practitioner review or approval workflow.", severity: "High", impactedSystem: "TDC", impactedBatch: "B4, B6", impactedApis: "POST /tax-taxonomy-accounts, PUT /tax-taxonomy-accounts/{id}", governanceRisk: "Unauthorized taxonomy changes alter AI classification behavior without review", operationalRisk: "Practitioners receive mapping proposals based on unapproved taxonomy changes", action: "Define taxonomy account change review workflow in B4/B6 feature scope", owner: "TDC PO", status: "Open" },
  // MEDIUM GAPS
  { id: "GAP-013", entity: "Entity Types", category: "Missing Enumerations", description: "Entity Types (CCORP, SCORP, PARTNER, etc.) are referenced throughout the platform but the complete enumeration is not documented in Swagger or Consumer Hub. Roger consumers cannot validate entity type values.", severity: "Medium", impactedSystem: "PDC", impactedBatch: "B5", impactedApis: "GET /entity-types", governanceRisk: "Roger consumers may submit invalid entity type codes", operationalRisk: "Entity type validation failures at runtime cause silent data rejection", action: "Add complete Entity Types enumeration to Consumer Hub Section 5 and Swagger enum definition", owner: "PDC Architect", status: "Open" },
  { id: "GAP-014", entity: "Jurisdiction Types", category: "Missing Enumerations", description: "Jurisdiction Types (FED, STATE, LOCAL) are referenced in Tax Forms, Mapping Rules, and Filing Due Dates but the complete enumeration is not documented in Swagger or Consumer Hub.", severity: "Medium", impactedSystem: "PDC", impactedBatch: "B5", impactedApis: "GET /jurisdiction-types", governanceRisk: "Invalid jurisdiction codes accepted in downstream entities", operationalRisk: "Filing due date lookups fail for unrecognized jurisdiction codes", action: "Add Jurisdiction Types enumeration to Consumer Hub and Swagger", owner: "PDC Architect", status: "Open" },
  { id: "GAP-015", entity: "Return Templates", category: "Missing Dependency Sequencing", description: "Return Templates depend on Tax Forms but the load order dependency is not documented in the Consumer Hub or Batch Roadmap. Teams may attempt to load templates before forms exist.", severity: "Medium", impactedSystem: "TDC", impactedBatch: "B9", impactedApis: "POST /return-templates", governanceRisk: "Load order violations cause FK constraint failures at data load time", operationalRisk: "Sprint 0 data loading fails; delays B9 delivery", action: "Add Return Template → Tax Form dependency to Consumer Hub dependency matrix and B9 feature scope", owner: "TDC BA", status: "Open" },
  { id: "GAP-016", entity: "Standard Appearances", category: "Missing Versioning", description: "Standard Appearances carry effectiveStartDate and effectiveEndDate but there is no documented versioning model for standard changes (e.g., XBRL taxonomy updates). No version identifier field.", severity: "Medium", impactedSystem: "PDC", impactedBatch: "B2", impactedApis: "GET /standard-appearances", governanceRisk: "XBRL standard updates silently change external reporting mappings", operationalRisk: "Historical reports reference superseded standard appearances", action: "Add versionId and supersededBy fields to Standard Appearances model; document in B2 feature scope", owner: "PDC Architect", status: "Open" },
  { id: "GAP-017", entity: "Filing Due Dates", category: "Missing Operational Workflow", description: "Filing Due Dates drive deadline-aware workflow but there is no documented process for how the platform handles extension requests, amended returns, or missed deadlines.", severity: "Medium", impactedSystem: "TDC", impactedBatch: "B10", impactedApis: "N/A", governanceRisk: "Extension and amendment scenarios are unhandled; compliance risk", operationalRisk: "Practitioners cannot manage extension workflows within the platform", action: "Define extension and amendment workflow in B10 feature scope; add to operational readiness documentation", owner: "TDC PO / BA", status: "Open" },
  { id: "GAP-018", entity: "Mapping Rules", category: "Missing Escalation Handling", description: "Mapping Rules with OVERRIDE type have no documented escalation path when an override conflicts with a DEFAULT rule for the same entity type and jurisdiction.", severity: "Medium", impactedSystem: "TDC", impactedBatch: "B4, B6", impactedApis: "POST /mapping-rules", governanceRisk: "Rule conflicts produce non-deterministic AI proposals", operationalRisk: "Practitioners receive conflicting mapping proposals for the same financial data", action: "Define rule conflict resolution logic and escalation path in B4 feature scope", owner: "TDC Architect", status: "Open" },
  // LOW GAPS
  { id: "GAP-019", entity: "Firm Taxonomy (XLOB)", category: "Missing Optional Fields Documentation", description: "Standard Mapping (standardAppearances) is documented as optional in the workbook but its format and expected values are not documented in Swagger or Consumer Hub.", severity: "Low", impactedSystem: "PDC", impactedBatch: "B2", impactedApis: "POST /xlob-concepts", governanceRisk: "Inconsistent standard mapping entries reduce interoperability", operationalRisk: "XBRL export produces incomplete mappings for concepts without standard appearances", action: "Document standardAppearances field format in Consumer Hub Section 5", owner: "PDC BA", status: "Open" },
  { id: "GAP-020", entity: "Tax Form Lines", category: "Missing Pagination/Filtering", description: "Tax Form Lines API has no documented filtering by parentFormCode or sortOrder. Large forms (Form 1120 has 100+ lines) will require pagination support that is not documented.", severity: "Low", impactedSystem: "TDC", impactedBatch: "B3", impactedApis: "GET /tax-form-lines", governanceRisk: "Roger consumers cannot efficiently retrieve lines for a specific form", operationalRisk: "Full form line retrieval on large forms causes performance degradation", action: "Add ?parentFormCode and ?sortOrder filter parameters to Tax Form Lines GET endpoint in Swagger", owner: "TDC Architect", status: "Open" },
];

// ─── REMEDIATION WAVES ────────────────────────────────────────────────────────
const REMEDIATION_WAVES = [
  {
    wave: 1,
    focus: "Required Fields & Validation Rules",
    priority: "Immediate",
    description: "Document all required field validation rules for XLOB Taxonomy, Confidence Bands, Tax Taxonomy Accounts, and Mapping Rules. Add FK referential integrity validation to all cross-entity references. This is the foundation — without it, all downstream data is untrustworthy.",
    dependencies: "None",
    owner: "PDC Architect + TDC Architect",
    gaps: ["GAP-001", "GAP-002", "GAP-004", "GAP-009"],
  },
  {
    wave: 2,
    focus: "Missing API Contracts",
    priority: "B9 / B10 Sprint 0",
    description: "Define and publish API contracts for Filing Due Dates and Standard Appearances — both are completely missing from Swagger and Consumer Hub. Add Return Template field contract. These gaps block Roger consumer integration.",
    dependencies: "Wave 1",
    owner: "TDC Architect + PDC Architect",
    gaps: ["GAP-005", "GAP-006", "GAP-007"],
  },
  {
    wave: 3,
    focus: "Lineage & Audit Trail",
    priority: "Pre-Gate G2",
    description: "Implement immutable audit trail for Mapping Rule modifications. Add XLOB concept reclassification history. Define Tax Form Line lifecycle states and deprecation guards. These are required for G2 Invariant Lock.",
    dependencies: "Wave 1",
    owner: "TDC Architect + PDC Architect",
    gaps: ["GAP-003", "GAP-010", "GAP-011"],
  },
  {
    wave: 4,
    focus: "AI Governance",
    priority: "Pre-Pilot (9/16)",
    description: "Define confidence band change governance process with approver roles, audit log, and practitioner notification. Define taxonomy account change review workflow. These are required before the platform can be trusted for production AI-driven proposals.",
    dependencies: "Wave 1, Wave 3",
    owner: "TDC PO + Governance",
    gaps: ["GAP-008", "GAP-012"],
  },
  {
    wave: 5,
    focus: "Enumerations & Dependency Sequencing",
    priority: "Pre-Pilot (9/16)",
    description: "Publish complete Entity Types and Jurisdiction Types enumerations in Swagger and Consumer Hub. Document Return Template → Tax Form load order dependency. Add Standard Appearances versioning model.",
    dependencies: "Wave 2",
    owner: "PDC Architect + TDC BA",
    gaps: ["GAP-013", "GAP-014", "GAP-015", "GAP-016"],
  },
  {
    wave: 6,
    focus: "Operational Readiness Hardening",
    priority: "Post-Pilot",
    description: "Define extension and amendment workflow for Filing Due Dates. Define Mapping Rule conflict resolution and escalation path. Add Tax Form Lines pagination and filtering. These complete the production operationalization.",
    dependencies: "Wave 2, Wave 3",
    owner: "TDC PO + BA + Architect",
    gaps: ["GAP-017", "GAP-018", "GAP-019", "GAP-020"],
  },
];

// ─── ARCHITECTURE DRIFT FINDINGS ─────────────────────────────────────────────
const ARCH_DRIFT = [
  { id: "AD-001", finding: "Tax Year in PDC context", severity: "Critical" as GapSeverity, description: "TaxYear is referenced in PDC Firm Taxonomy effective dates and PDC Entity Type scoping. Tax Year authority belongs to TDC. PDC should derive tax year context from TDC contracts, not maintain it independently.", recommendation: "Remove TaxYear from PDC entity scope. PDC uses effectiveDateStart/End only. TDC owns all taxYear references.", batch: "B2, B5" },
  { id: "AD-002", finding: "Taxonomy ownership ambiguity", severity: "Critical" as GapSeverity, description: "XLOB Taxonomy (PDC) and Tax Taxonomy Accounts (TDC) both define classification hierarchies. The boundary between 'firm classification' (PDC) and 'tax treatment' (TDC) is not formally documented in any governance artifact.", recommendation: "Publish a formal taxonomy ownership boundary document. PDC owns XLOB concept hierarchy. TDC owns tax category and form line mapping. No overlap.", batch: "B2, B3, B4" },
  { id: "AD-003", finding: "Mapping Rule authorship in TDC bypasses PDC entity validation", severity: "High" as GapSeverity, description: "Mapping Rules reference PDC Entity Types and PDC Jurisdiction Types via pipe-separated codes, but there is no documented API-level validation that these codes exist in PDC before a TDC rule is accepted.", recommendation: "TDC Mapping Rule API must validate Entity Type and Jurisdiction Type codes against PDC reference APIs at write time. Document this cross-system validation contract.", batch: "B4" },
  { id: "AD-004", finding: "Roger direct access risk", severity: "High" as GapSeverity, description: "Consumer Hub documents Roger as a read-only consumer via the B9 PDC Gateway (Ocelot). However, Standard Appearances and Filing Due Dates have no gateway-mediated API contracts, creating a path where Roger could access these entities directly without governance controls.", recommendation: "All Roger-accessible entities must be explicitly listed in the B9 Gateway contract. Entities without gateway coverage must be flagged as not Roger-accessible until B9 is complete.", batch: "B9" },
  { id: "AD-005", finding: "Confidence Band authority unclear", severity: "High" as GapSeverity, description: "Confidence Bands are owned by TDC but the bands directly govern AI behavior that affects PDC-owned financial data classification. The governance boundary for who can modify bands (TDC only, or requires PDC sign-off) is not documented.", recommendation: "Define Confidence Band change governance: TDC owns the bands, but changes must be reviewed by PDC Architect and PDC PO before activation. Document in governance ownership matrix.", batch: "B4" },
  { id: "AD-006", finding: "Filing authority unclear for consolidated returns", severity: "Medium" as GapSeverity, description: "Return Templates support consolidated filing scenarios (templateName field) but the filing authority — which system owns the consolidated return assembly decision — is not documented. PDC owns entity hierarchy; TDC owns tax form structure.", recommendation: "Define consolidated return filing authority in B10 feature scope. Recommend: TDC owns the template; PDC provides the entity hierarchy. Orchestrator assembles.", batch: "B10" },
];

// ─── AI GOVERNANCE FINDINGS ───────────────────────────────────────────────────
const AI_GOV_FINDINGS = [
  { capability: "Confidence Bands (GREEN/YELLOW/RED)", status: "Partial" as const, detail: "Bands are defined in workbook and referenced in Consumer Hub. Thresholds (0.85/0.60) are recommended but not enforced. No API-level validation of band completeness or overlap prevention." },
  { capability: "Auto-Accept Thresholds", status: "Partial" as const, detail: "bulkAcceptEligible flag exists in Confidence Band model. No documented threshold for what confidence score triggers auto-accept. No audit trail for auto-accepted proposals." },
  { capability: "Practitioner Overrides", status: "Partial" as const, detail: "Override workflow exists in B6 scope. Override reason codes and audit trail are partially documented. No escalation path for overrides that conflict with active Mapping Rules." },
  { capability: "Escalation Workflows", status: "Missing" as const, detail: "No documented escalation path for RED band proposals that remain unresolved beyond a defined SLA. No escalation to senior practitioner or governance committee." },
  { capability: "Review Requirements", status: "Partial" as const, detail: "generatesReviewTask flag in Confidence Bands drives review task creation. Review task lifecycle (assigned, in-review, approved, rejected) is partially documented in B6." },
  { capability: "Explainability", status: "Missing" as const, detail: "AI mapping proposals carry confidence scores but no explanation of which Mapping Rules contributed to the score. Practitioners cannot understand why a proposal was generated." },
  { capability: "Model Provenance", status: "Missing" as const, detail: "No documentation of which AI model version generated a proposal. Model versioning and deployment history are not tracked in any current platform artifact." },
  { capability: "Model Versioning", status: "Missing" as const, detail: "Mapping Rules carry authoredAt but the AI model that consumed those rules is not versioned. Rule changes do not trigger model retraining documentation." },
  { capability: "Steward Ratification", status: "Missing" as const, detail: "No documented steward ratification process for new Mapping Rules or Taxonomy Account changes before they influence AI proposals." },
  { capability: "Audit Lineage for AI Decisions", status: "Partial" as const, detail: "MappingDecision entity exists in Consumer Hub. Lineage from proposal → decision → tax form line is partially documented. Immutable decision record is not confirmed." },
  { capability: "Proposal Governance", status: "Partial" as const, detail: "AIMappingProposal entity is documented in Consumer Hub. Proposal lifecycle (generated, reviewed, accepted, rejected, escalated) is partially defined. No SLA governance." },
];

// ─── OPERATIONAL READINESS ────────────────────────────────────────────────────
const OPS_READINESS = [
  { area: "Real Production Data", status: "No" as const, detail: "All current dashboard data is demo/sample data. No production financial data is loaded or referenced." },
  { area: "Operational Workflows", status: "Partial" as const, detail: "Filing lifecycle (B10), practitioner review (B6), exception remediation (B8) are defined in batch scope but not operationalized in production." },
  { area: "Filing Lifecycle Management", status: "Partial" as const, detail: "Return Templates and Filing Due Dates define the structure but extension, amendment, and missed deadline workflows are undocumented." },
  { area: "Jurisdictional Complexity", status: "Partial" as const, detail: "Jurisdiction Types reference data exists. Multi-jurisdiction filing (consolidated returns) is partially addressed in Return Templates. State-specific rules are undocumented." },
  { area: "Versioned Tax Forms", status: "Partial" as const, detail: "Tax Forms carry taxYear. Form versioning (e.g., Form 1120 2023 vs 2024) is implied but not formally documented as a versioning model." },
  { area: "Filing Deadlines", status: "No" as const, detail: "Filing Due Dates entity has no API contract. Deadline-aware workflow cannot be operationalized until GAP-005 is resolved." },
  { area: "Exception Remediation", status: "Partial" as const, detail: "B8 defines exception and remediation scope. ExceptionRecord entity is in Consumer Hub. Full remediation workflow (escalation, resolution, audit) is partially documented." },
  { area: "Practitioner Signoff", status: "Partial" as const, detail: "ReviewTask entity exists. Signoff workflow is defined in B6. Bulk signoff and delegation are not documented." },
  { area: "Consolidated Filing", status: "No" as const, detail: "Return Templates support consolidated filing by name convention but the consolidated entity hierarchy governance (PDC) and consolidated return assembly (Orchestrator) are undocumented." },
  { area: "Production-Scale Pagination", status: "Partial" as const, detail: "Pagination is mentioned in Consumer Hub maturity matrix but not consistently documented across all endpoints. Tax Form Lines filtering gap (GAP-020) is a known blocker." },
  { area: "Historical Version Tracking", status: "No" as const, detail: "No versioning model for XLOB concepts, Tax Taxonomy Accounts, or Mapping Rules. Historical tax computation replay is not supported." },
  { area: "Immutable Lineage", status: "Partial" as const, detail: "Lineage Closure is a platform gate (G4) but immutable lineage for AI decisions and rule changes is not yet implemented (GAP-003, GAP-011)." },
];

// ─── SEVERITY COLORS ─────────────────────────────────────────────────────────
const SEVERITY_STYLE: Record<GapSeverity, { bg: string; text: string; border: string }> = {
  Critical: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  High:     { bg: "#fff7ed", text: "#9a3412", border: "#fdba74" },
  Medium:   { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  Low:      { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

const COVERAGE_STYLE: Record<CoverageStatus, { bg: string; text: string }> = {
  Yes:     { bg: "#dcfce7", text: "#166534" },
  Partial: { bg: "#fef9c3", text: "#854d0e" },
  No:      { bg: "#fee2e2", text: "#991b1b" },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Documented":            { bg: "#dcfce7", text: "#166534" },
  "Partial":               { bg: "#fef9c3", text: "#854d0e" },
  "Missing":               { bg: "#fee2e2", text: "#991b1b" },
  "Undocumented":          { bg: "#fee2e2", text: "#991b1b" },
  "Yes":                   { bg: "#dcfce7", text: "#166534" },
  "No":                    { bg: "#fee2e2", text: "#991b1b" },
};

// ─── SECTION IDs ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "s0", label: "Executive Summary" },
  { id: "s1", label: "Entity Inventory" },
  { id: "s2", label: "Gap Analysis" },
  { id: "s3", label: "Architecture Drift" },
  { id: "s4", label: "AI Governance" },
  { id: "s5", label: "Operational Readiness" },
  { id: "s6", label: "Remediation Roadmap" },
  { id: "s7", label: "Field Matrix" },
  { id: "s8", label: "Dependency Matrix" },
  { id: "s9", label: "Ownership Matrix" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function GapAnalysisEngine() {
  const [activeSection, setActiveSection] = useState("s0");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [copied, setCopied] = useState(false);

  const totalGaps = GAP_DATA.length;
  const criticalGaps = GAP_DATA.filter(g => g.severity === "Critical").length;
  const highGaps = GAP_DATA.filter(g => g.severity === "High").length;
  const mediumGaps = GAP_DATA.filter(g => g.severity === "Medium").length;
  const lowGaps = GAP_DATA.filter(g => g.severity === "Low").length;
  const openGaps = GAP_DATA.filter(g => g.status === "Open").length;

  const filteredGaps = GAP_DATA.filter(g => {
    if (severityFilter !== "All" && g.severity !== severityFilter) return false;
    if (statusFilter !== "All" && g.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    window.print();
  };

  const handleCopyEmail = () => {
    const text = `DCT Platform — Workbook vs Manus Gap Analysis\n\nTotal Gaps: ${totalGaps} | Critical: ${criticalGaps} | High: ${highGaps} | Medium: ${mediumGaps} | Low: ${lowGaps}\n\nSource: DCT_Master_Data_Intake1.xlsx vs DCT Platform Dashboard\nDate: ${new Date().toLocaleDateString()}\n\nSee full analysis in the DCT Platform Gate Verification Dashboard → Governance Tools → Gap Analysis Engine.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border-b border-red-900/40 px-8 pt-8 pb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Governance Grade</span>
              <span className="text-xs text-slate-400">v1.0 · Source: DCT_Master_Data_Intake1.xlsx · {new Date().toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Workbook vs Manus Enterprise Gap Analysis</h1>
            <p className="text-slate-400 text-sm max-w-2xl">Production Readiness Governance Assessment for the DCT Platform. Comprehensive comparison of the Master Data Intake Workbook against all existing Manus platform pages, API contracts, and governance documentation.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopyEmail} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded border border-slate-700 transition-colors">
              {copied ? "✓ Copied" : "📋 Copy Summary"}
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded transition-colors">
              🖨 Export PDF
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {[
            { label: "Total Gaps", value: totalGaps, color: "text-white" },
            { label: "Critical", value: criticalGaps, color: "text-red-400" },
            { label: "High", value: highGaps, color: "text-orange-400" },
            { label: "Medium", value: mediumGaps, color: "text-yellow-400" },
            { label: "Low", value: lowGaps, color: "text-green-400" },
            { label: "Open", value: openGaps, color: "text-slate-300" },
          ].map(card => (
            <div key={card.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Jump */}
        <div className="flex flex-wrap gap-2 mt-5">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${activeSection === s.id ? "bg-red-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-2xl mx-auto">

        {/* ── S0: EXECUTIVE SUMMARY ─────────────────────────────────────── */}
        {activeSection === "s0" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Executive Governance Readiness Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Overall Assessment</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">The DCT Platform has strong architectural foundations — PDC/TDC ownership boundaries are well-defined, the batch delivery model is sound, and the Roger Gateway (B9 PDC) correctly enforces read-only consumer access. However, the platform is <strong className="text-white">not production-ready</strong> across 6 critical dimensions: validation rule documentation, API contract completeness, lineage and audit trail implementation, AI governance formalization, operational workflow coverage, and historical versioning.</p>
                <p className="text-slate-300 text-sm leading-relaxed">Of the 11 workbook entities, <strong className="text-white">0 are fully production-ready</strong>, 8 are partially documented, and 3 (Standard Appearances, Filing Due Dates, Return Templates) have critical API contract gaps that block Roger consumer integration.</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3">Top 5 Governance Risks</h3>
                <ol className="space-y-2">
                  {[
                    "Confidence Band validation gaps allow AI proposals to be auto-accepted without enforcement of band completeness rules",
                    "Mapping Rule modifications have no immutable audit trail — regulatory audit exposure for historical tax decisions",
                    "Filing Due Dates have no API contract — deadline-aware workflow cannot be operationalized before 9/16 pilot",
                    "Standard Appearances (XBRL/US-GAAP) have no API contract — external reporting compliance cannot be verified",
                    "Taxonomy ownership boundary between PDC XLOB and TDC Tax Taxonomy Accounts is not formally documented",
                  ].map((risk, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "API Maturity", score: "62%", detail: "7 of 11 entities have partial or full API contracts. 3 are missing entirely.", color: "text-yellow-400" },
                { label: "Documentation Coverage", score: "45%", detail: "Required fields documented for 5 of 11 entities. Validation rules documented for 0 of 11.", color: "text-orange-400" },
                { label: "AI Governance Maturity", score: "30%", detail: "3 of 11 AI governance capabilities are partially implemented. 5 are missing entirely.", color: "text-red-400" },
                { label: "Production Readiness", score: "0%", detail: "No entity is fully production-ready. 8 are partial. 3 are not started.", color: "text-red-500" },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.score}</div>
                  <div className="text-sm font-semibold text-white mb-2">{card.label}</div>
                  <div className="text-xs text-slate-400">{card.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── S1: ENTITY INVENTORY ──────────────────────────────────────── */}
        {activeSection === "s1" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Master Entity Inventory</h2>
            <p className="text-slate-400 text-sm mb-5">Canonical comparison inventory of all 11 workbook entities against existing Manus platform coverage.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    {["Entity", "Sheet", "Owner", "Criticality", "In Manus?", "In Swagger?", "Req Fields?", "Validation?", "Ownership?", "API Contract?", "Lineage?", "AI Gov?", "Prod Ready?"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold border border-slate-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ENTITY_INVENTORY.map((e, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}>
                      <td className="px-3 py-2 border border-slate-800 font-medium text-white whitespace-nowrap">{e.entity}</td>
                      <td className="px-3 py-2 border border-slate-800 text-slate-400 whitespace-nowrap">{e.sheet}</td>
                      <td className="px-3 py-2 border border-slate-800">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${e.owner === "PDC" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300"}`}>{e.owner}</span>
                      </td>
                      <td className="px-3 py-2 border border-slate-800">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${e.criticality === "Critical" ? "bg-red-900 text-red-300" : "bg-orange-900 text-orange-300"}`}>{e.criticality}</span>
                      </td>
                      {([e.existsInManus, e.existsInSwagger, e.requiredFieldsDoc, e.validationRulesDoc, e.ownershipBoundaries, e.apiContract, e.lineageControls, e.aiGovernance, e.productionReady] as CoverageStatus[]).map((val, j) => (
                        <td key={j} className="px-3 py-2 border border-slate-800 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold`} style={{ background: COVERAGE_STYLE[val].bg, color: COVERAGE_STYLE[val].text }}>{val}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── S2: GAP ANALYSIS ──────────────────────────────────────────── */}
        {activeSection === "s2" && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Formal Gap Analysis</h2>
                <p className="text-slate-400 text-sm mt-0.5">{filteredGaps.length} of {totalGaps} gaps shown</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "Critical", "High", "Medium", "Low"].map(s => (
                  <button key={s} onClick={() => setSeverityFilter(s)} className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${severityFilter === s ? "bg-red-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{s}</button>
                ))}
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1.5 rounded">
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {filteredGaps.map(gap => (
                <div key={gap.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5" style={{ borderLeftColor: SEVERITY_STYLE[gap.severity].border, borderLeftWidth: 4 }}>
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 font-mono">{gap.id}</span>
                      <span className="text-sm font-bold text-white">{gap.entity}</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{gap.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: SEVERITY_STYLE[gap.severity].bg, color: SEVERITY_STYLE[gap.severity].text }}>{gap.severity}</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{gap.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{gap.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-slate-500">System:</span> <span className="text-slate-300 ml-1">{gap.impactedSystem}</span></div>
                    <div><span className="text-slate-500">Batch:</span> <span className="text-slate-300 ml-1">{gap.impactedBatch}</span></div>
                    <div><span className="text-slate-500">APIs:</span> <span className="text-slate-300 ml-1 font-mono">{gap.impactedApis}</span></div>
                    <div><span className="text-slate-500">Owner:</span> <span className="text-slate-300 ml-1">{gap.owner}</span></div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><span className="text-red-400 font-semibold">Governance Risk:</span> <span className="text-slate-300 ml-1">{gap.governanceRisk}</span></div>
                    <div><span className="text-orange-400 font-semibold">Operational Risk:</span> <span className="text-slate-300 ml-1">{gap.operationalRisk}</span></div>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-green-400 font-semibold">Recommended Action:</span> <span className="text-slate-300 ml-1">{gap.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── S3: ARCHITECTURE DRIFT ────────────────────────────────────── */}
        {activeSection === "s3" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Architecture Boundary Drift Findings</h2>
            <p className="text-slate-400 text-sm mb-5">Violations where PDC/TDC ownership boundaries are ambiguous, duplicated, or incorrectly assigned.</p>
            <div className="space-y-4">
              {ARCH_DRIFT.map(d => (
                <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5" style={{ borderLeftColor: SEVERITY_STYLE[d.severity].border, borderLeftWidth: 4 }}>
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">{d.id}</span>
                      <span className="text-sm font-bold text-white">{d.finding}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: SEVERITY_STYLE[d.severity].bg, color: SEVERITY_STYLE[d.severity].text }}>{d.severity}</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Batch: {d.batch}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{d.description}</p>
                  <div className="text-xs"><span className="text-green-400 font-semibold">Recommendation:</span> <span className="text-slate-300 ml-1">{d.recommendation}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── S4: AI GOVERNANCE ─────────────────────────────────────────── */}
        {activeSection === "s4" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">AI Governance Findings</h2>
            <p className="text-slate-400 text-sm mb-5">Assessment of whether the platform operationalizes all required AI governance capabilities.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700">AI Governance Capability</th>
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700 w-28">Status</th>
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {AI_GOV_FINDINGS.map((f, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}>
                      <td className="px-4 py-3 border border-slate-800 font-medium text-white">{f.capability}</td>
                      <td className="px-4 py-3 border border-slate-800">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: STATUS_STYLE[f.status]?.bg || "#1e293b", color: STATUS_STYLE[f.status]?.text || "#94a3b8" }}>{f.status}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-300 text-xs">{f.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── S5: OPERATIONAL READINESS ─────────────────────────────────── */}
        {activeSection === "s5" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Operational Readiness Findings</h2>
            <p className="text-slate-400 text-sm mb-5">Assessment of whether the platform supports production operational workflows.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700">Operational Area</th>
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700 w-24">Status</th>
                    <th className="px-4 py-3 text-left font-semibold border border-slate-700">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {OPS_READINESS.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}>
                      <td className="px-4 py-3 border border-slate-800 font-medium text-white">{r.area}</td>
                      <td className="px-4 py-3 border border-slate-800">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: STATUS_STYLE[r.status]?.bg || "#1e293b", color: STATUS_STYLE[r.status]?.text || "#94a3b8" }}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-300 text-xs">{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── S6: REMEDIATION ROADMAP ───────────────────────────────────── */}
        {activeSection === "s6" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Prioritized Remediation Roadmap</h2>
            <p className="text-slate-400 text-sm mb-5">6 remediation waves ordered by dependency and delivery urgency.</p>
            <div className="space-y-4">
              {REMEDIATION_WAVES.map(w => (
                <div key={w.wave} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-600">W{w.wave}</span>
                      <div>
                        <div className="text-base font-bold text-white">{w.focus}</div>
                        <div className="text-xs text-slate-400">Priority: <span className="text-yellow-400 font-semibold">{w.priority}</span> · Owner: {w.owner}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {w.gaps.map(g => (
                        <span key={g} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">{g}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{w.description}</p>
                  <div className="text-xs text-slate-500">Dependencies: {w.dependencies}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── S7: FIELD MATRIX ──────────────────────────────────────────── */}
        {activeSection === "s7" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Required vs Optional Field Matrix</h2>
            <p className="text-slate-400 text-sm mb-5">Complete field governance reference for all 11 workbook entities, sourced from DCT_Master_Data_Intake1.xlsx.</p>
            <div className="space-y-6">
              {[
                { entity: "PDC - Firm Taxonomy (XLOB)", required: ["conceptCode", "label", "hierarchyPath", "lobApplicability", "isFirmInternal", "effectiveDateStart"], optional: ["parentCode", "standardAppearances"], conditional: [], notes: "parentCode is blank for top-level concepts. lobApplicability is a bitmask (1=Tax, 2=Audit, 4=Consulting, 7=All)." },
                { entity: "PDC - Standard Appearances", required: ["parentConceptCode (FK)", "standardType", "governingBody", "formalConceptName", "externalUri", "balanceType", "periodType", "effectiveDateStart"], optional: ["effectiveDateEnd"], conditional: [], notes: "effectiveDateEnd is blank for currently active standards." },
                { entity: "PDC - Entity Types", required: ["code", "displayName"], optional: [], conditional: [], notes: "code must be ALL CAPS, no spaces. Examples: CCORP, SCORP, PARTNER, TRUST, INDIVIDUAL." },
                { entity: "PDC - Jurisdiction Types", required: ["code", "displayName"], optional: [], conditional: [], notes: "Examples: FED, STATE, LOCAL. Must exist before any TDC content references jurisdictions." },
                { entity: "TDC - Tax Forms", required: ["formCode", "formName", "returnType", "jurisdictionCode (FK)", "taxYear", "createdBy"], optional: [], conditional: [], notes: "taxYear is 4-digit. jurisdictionCode must exist in PDC Jurisdiction Types." },
                { entity: "TDC - Tax Form Lines", required: ["parentFormCode (FK)", "lineNumber", "lineCode", "lineLabel", "sortOrder", "createdBy"], optional: [], conditional: [], notes: "lineCode must be globally unique. sortOrder is integer, ascending." },
                { entity: "TDC - Return Templates", required: ["parentFormCode (FK)", "returnType", "taxYear", "jurisdictionCode (FK)", "templateName", "createdBy"], optional: ["description"], conditional: [], notes: "Supports consolidated filing via templateName convention." },
                { entity: "TDC - Tax Taxonomy Accounts", required: ["accountCode", "accountName", "taxCategory", "xlobConceptCode (FK)", "effectiveStartDate", "applicableEntityTypes", "createdBy"], optional: ["defaultTaxFormLineCode", "effectiveEndDate"], conditional: [], notes: "taxCategory values: REVENUE, COGS, DEDUCTION, CREDIT, etc. entityTypes pipe-separated." },
                { entity: "TDC - Mapping Rules", required: ["description", "ruleType", "targetTaxFormLineCode (FK)", "weight", "confidenceContribution", "authorId", "authorName", "authoredAt", "taxYear", "entityTypes", "jurisdictionCodes"], optional: [], conditional: [], notes: "ruleType values: DIRECT, PATTERN, OVERRIDE, DEFAULT. weight and confidenceContribution are 0.00–1.00." },
                { entity: "TDC - Filing Due Dates", required: ["returnType", "jurisdictionCode (FK)", "taxYear", "dueDate", "createdBy"], optional: [], conditional: [], notes: "dueDate format: YYYY-MM-DD. Must be set per tax year before deadline-aware workflow can run." },
                { entity: "TDC - Confidence Bands", required: ["bandName", "minValue", "maxValue", "generatesReviewTask", "bulkAcceptEligible", "blocksProgression"], optional: [], conditional: [], notes: "bandName values: GREEN, YELLOW, RED. Bands must cover 0.00–1.00 without gaps or overlaps." },
              ].map(e => (
                <div key={e.entity} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3">{e.entity}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <div className="text-red-400 font-semibold mb-1.5">Required Fields ({e.required.length})</div>
                      <div className="space-y-1">
                        {e.required.map(f => <div key={f} className="font-mono bg-red-950/40 text-red-300 px-2 py-0.5 rounded">{f}</div>)}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-400 font-semibold mb-1.5">Optional Fields ({e.optional.length})</div>
                      <div className="space-y-1">
                        {e.optional.length > 0 ? e.optional.map(f => <div key={f} className="font-mono bg-green-950/40 text-green-300 px-2 py-0.5 rounded">{f}</div>) : <div className="text-slate-600 italic">None</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-semibold mb-1.5">Governance Notes</div>
                      <div className="text-slate-400 leading-relaxed">{e.notes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── S8: DEPENDENCY MATRIX ─────────────────────────────────────── */}
        {activeSection === "s8" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Dependency Sequencing Matrix</h2>
            <p className="text-slate-400 text-sm mb-5">Authoritative load order from the workbook Load Order tab. Must be followed for Sprint 0 data loading and batch delivery sequencing.</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    {["Load Order", "Entity", "System", "Must Come Before", "Why"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold border border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { order: 1, entity: "PDC - Firm Taxonomy (XLOB)", system: "PDC", before: "All TDC entities", why: "Every Tax Taxonomy Account requires a valid XLOB Concept reference. Without this, no tax content can load." },
                    { order: 2, entity: "PDC - Standard Appearances", system: "PDC", before: "External reporting, XBRL export", why: "Provides canonical URIs for XLOB concepts. Required before any external standard mapping is referenced." },
                    { order: 3, entity: "PDC - Entity Types", system: "PDC", before: "TDC Tax Taxonomy Accounts, TDC Mapping Rules", why: "Tax Taxonomy Accounts and Mapping Rules reference entity type codes. Must exist as Active before TDC loads." },
                    { order: 4, entity: "PDC - Jurisdiction Types", system: "PDC", before: "TDC Tax Forms, TDC Mapping Rules, TDC Filing Due Dates", why: "Tax Forms, Mapping Rules, and Filing Due Dates all carry jurisdiction scoping." },
                    { order: 5, entity: "TDC - Tax Forms", system: "TDC", before: "TDC Tax Form Lines, TDC Return Templates", why: "Tax Form Lines and Return Templates both reference a Tax Form. Without this, neither can load." },
                    { order: 6, entity: "TDC - Tax Form Lines", system: "TDC", before: "TDC Tax Taxonomy Accounts, TDC Mapping Rules", why: "Tax Taxonomy Accounts use these as default destinations; Mapping Rules use these as targets." },
                    { order: 7, entity: "TDC - Return Templates", system: "TDC", before: "Orchestrator, Roger mapping proposals", why: "Orchestrator and Roger reference templates when generating mapping proposals and presenting returns." },
                    { order: 8, entity: "TDC - Tax Taxonomy Accounts", system: "TDC", before: "TDC Mapping Rules, AI classification engine", why: "The bridge between XLOB and tax treatment. Mapping Rules and AI proposals depend on this." },
                    { order: 9, entity: "TDC - Mapping Rules", system: "TDC", before: "AI proposal generation", why: "AI uses these rules to generate mapping proposals. Must be loaded before any proposals are generated." },
                    { order: 10, entity: "TDC - Filing Due Dates", system: "TDC", before: "Deadline-aware workflow, B10 return assembly", why: "Drives deadline-aware workflow and reporting. Must be set per tax year before deadline triggers can fire." },
                    { order: 11, entity: "TDC - Confidence Bands", system: "TDC", before: "AI proposal generation, review task creation", why: "Governs AI proposal acceptance behavior. Must be configured before any proposals are generated." },
                  ].map(r => (
                    <tr key={r.order} className={r.order % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}>
                      <td className="px-4 py-3 border border-slate-800 text-center font-bold text-slate-400">{r.order}</td>
                      <td className="px-4 py-3 border border-slate-800 font-medium text-white">{r.entity}</td>
                      <td className="px-4 py-3 border border-slate-800">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${r.system === "PDC" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300"}`}>{r.system}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-300 text-xs">{r.before}</td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-400 text-xs">{r.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── S9: OWNERSHIP MATRIX ──────────────────────────────────────── */}
        {activeSection === "s9" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Governance Ownership Matrix</h2>
            <p className="text-slate-400 text-sm mb-5">Authoritative ownership boundaries for all platform capabilities, derived from workbook governance notes and Roadmap v4_corrected.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    {["Capability / Entity", "PDC Owns", "TDC Owns", "Orchestrator Role", "Roger Access", "Drift Risk"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold border border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: "Firm Taxonomy (XLOB)", pdc: "Full authority — concept hierarchy, LOB applicability, effective dates", tdc: "Consumes XLOB codes as FK references only", orch: "Reads XLOB for classification context", roger: "Read-only via B9 Gateway", drift: "Low" },
                    { cap: "Standard Appearances", pdc: "Full authority — XBRL/US-GAAP/IFRS mappings", tdc: "No ownership", orch: "No direct access", roger: "Not yet accessible — no gateway contract", drift: "Medium — no API contract" },
                    { cap: "Entity Types", pdc: "Full authority — reference enumeration", tdc: "Consumes as FK references in Mapping Rules and Taxonomy Accounts", orch: "Reads for entity scoping", roger: "Read-only via B9 Gateway", drift: "Low" },
                    { cap: "Jurisdiction Types", pdc: "Full authority — reference enumeration", tdc: "Consumes as FK references in Tax Forms, Mapping Rules, Filing Due Dates", orch: "Reads for jurisdiction scoping", roger: "Read-only via B9 Gateway", drift: "Low" },
                    { cap: "Tax Forms", pdc: "No ownership", tdc: "Full authority — form structure, tax year, jurisdiction", orch: "Reads for return assembly", roger: "Read-only via B9 Gateway", drift: "Low" },
                    { cap: "Tax Form Lines", pdc: "No ownership", tdc: "Full authority — line structure, sort order", orch: "Reads for mapping proposal targets", roger: "Read-only via B9 Gateway", drift: "Low" },
                    { cap: "Return Templates", pdc: "No ownership", tdc: "Full authority — template definitions", orch: "Reads for proposal generation and return assembly", roger: "Read-only via B9 Gateway", drift: "Medium — consolidated filing authority unclear" },
                    { cap: "Tax Taxonomy Accounts", pdc: "No ownership", tdc: "Full authority — tax classification bridge", orch: "Reads for AI proposal generation", roger: "Read-only via B9 Gateway", drift: "High — change governance undocumented" },
                    { cap: "Mapping Rules", pdc: "No ownership", tdc: "Full authority — rule authorship, versioning", orch: "Reads for AI proposal generation", roger: "Read-only via B9 Gateway", drift: "Critical — no immutable audit trail" },
                    { cap: "Filing Due Dates", pdc: "No ownership", tdc: "Full authority — deadline governance", orch: "Reads for deadline-aware workflow", roger: "Not yet accessible — no gateway contract", drift: "Critical — no API contract" },
                    { cap: "Confidence Bands", pdc: "No ownership", tdc: "Full authority — AI behavior governance", orch: "Reads for proposal classification", roger: "No direct access", drift: "High — change governance undocumented" },
                    { cap: "AI Mapping Proposals", pdc: "No ownership", tdc: "Full authority — proposal lifecycle", orch: "Generates proposals", roger: "Read-only via B9 Gateway", drift: "Medium — explainability undocumented" },
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}>
                      <td className="px-4 py-3 border border-slate-800 font-medium text-white">{r.cap}</td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-300 text-xs">{r.pdc}</td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-300 text-xs">{r.tdc}</td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-400 text-xs">{r.orch}</td>
                      <td className="px-4 py-3 border border-slate-800 text-slate-400 text-xs">{r.roger}</td>
                      <td className="px-4 py-3 border border-slate-800">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.drift === "Critical" ? "bg-red-900 text-red-300" : r.drift === "High" ? "bg-orange-900 text-orange-300" : r.drift === "Medium" ? "bg-yellow-900 text-yellow-300" : "bg-green-900 text-green-300"}`}>{r.drift}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-400">DCT Platform — Workbook vs Manus Enterprise Gap Analysis</span>
            <span className="mx-2">·</span>
            Source: DCT_Master_Data_Intake1.xlsx
            <span className="mx-2">·</span>
            Roadmap: v4_corrected
            <span className="mx-2">·</span>
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div>CATT · Sr. BA · Jenniver · RSM</div>
        </div>
      </div>
    </div>
  );
}

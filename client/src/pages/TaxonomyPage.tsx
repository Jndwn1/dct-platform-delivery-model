// Taxonomy Explorer — PDC XLOB & TDC Tax Taxonomy Visualization
// Upgraded: Metadata-driven taxonomy model aligned to PDC/TDC architecture
// Model: CanonicalAccount → MetadataLayer → TaxRule → TaxFormLine → Roger
// Adds: TaxonomyFamily grouping, MetadataAttributes, enhanced TaxRule engine,
//       AdjustmentLink, MetadataRuleMapping, full lineage trace with metadata

import { useState, useMemo } from "react";
import { Search, Info, ChevronRight, ChevronDown, ChevronUp, GitBranch, Layers, AlertCircle } from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MetadataAttributes {
  jurisdiction: "Federal" | "State" | "Local";
  entityType: "Partnership" | "C-Corp" | "S-Corp" | "Trust" | "LLC";
  basisType: "Book" | "Tax";
  adjustmentType?: "Temporary" | "Permanent" | "None";
  activityType: "Operating" | "Investment" | "Financing";
  industryClassification?: string;
  timingClassification: "Current" | "Deferred";
}

interface TaxonomyFamily {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];          // canonical account IDs
  sharedMetadata: Partial<MetadataAttributes>;
}

interface CanonicalAccount {
  id: string;
  name: string;
  cls: string;
  balance: "Debit" | "Credit";
  contra: boolean;
  gaap: string;
  ifrs: string;
  familyId: string;
  metadata: MetadataAttributes;
}

interface FirmMapping {
  firmCode: string;
  firmLabel: string;
  canonicalId: string;
  taxCategory: string;
  entityType: string;
  effectiveFrom: string;
  inheritedMetadata?: Partial<MetadataAttributes>;
}

interface MetadataCondition {
  field: keyof MetadataAttributes;
  operator: "eq" | "in" | "neq";
  value: string | string[];
}

interface TaxRule {
  id: string;
  taxForm: string;
  year: number;
  lineNum: string;
  lineLabel: string;
  canonicalId: string;
  ruleType: "Direct" | "Derived" | "Adjustment-Based" | "Contra Offset";
  metadataConditions: MetadataCondition[];
  priority: number;
  weight: number;
  effectiveDateRange: { from: string; to?: string };
  version: string;
}

interface AdjustmentLink {
  id: string;
  label: string;
  canonicalId: string;
  taxRuleId: string;
  adjustmentType: "Temporary" | "Permanent";
  basisType: "Book" | "Tax";
  description: string;
  amount?: number;
  metadata: Partial<MetadataAttributes>;
}

// ─── TAXONOMY FAMILIES ────────────────────────────────────────────────────────

const TAXONOMY_FAMILIES: TaxonomyFamily[] = [
  {
    id: "FAM-FA",
    name: "Fixed Assets Family",
    description: "Tangible long-lived assets, accumulated depreciation, and related depreciation expense",
    color: "#f59e0b",
    memberIds: ["CA-5001", "CA-5002", "CA-4002"],
    sharedMetadata: { activityType: "Investment", basisType: "Tax" },
  },
  {
    id: "FAM-CASH",
    name: "Liquid Assets Family",
    description: "Cash, equivalents, and short-term liquid instruments",
    color: "#0ea5e9",
    memberIds: ["CA-1001"],
    sharedMetadata: { activityType: "Operating", basisType: "Book" },
  },
  {
    id: "FAM-AR",
    name: "Receivables Family",
    description: "Trade receivables, unbilled revenue, and contra allowances",
    color: "#8b5cf6",
    memberIds: ["CA-1002", "CA-1003"],
    sharedMetadata: { activityType: "Operating", basisType: "Book" },
  },
  {
    id: "FAM-AP",
    name: "Payables Family",
    description: "Trade payables and accrued liabilities",
    color: "#ef4444",
    memberIds: ["CA-2001"],
    sharedMetadata: { activityType: "Operating", basisType: "Book" },
  },
  {
    id: "FAM-REV",
    name: "Revenue Family",
    description: "Service revenue, fee income, and other operating revenue",
    color: "#10b981",
    memberIds: ["CA-3001"],
    sharedMetadata: { activityType: "Operating", basisType: "Book" },
  },
  {
    id: "FAM-EXP",
    name: "Expense Family",
    description: "Operating expenses including compensation and non-depreciation items",
    color: "#6366f1",
    memberIds: ["CA-4001"],
    sharedMetadata: { activityType: "Operating", basisType: "Book" },
  },
];

// ─── PDC CANONICAL ACCOUNTS ───────────────────────────────────────────────────

const PDC_ACCOUNTS: CanonicalAccount[] = [
  // Fixed Assets Family (seed data per spec)
  {
    id: "CA-5001", name: "Fixed Assets — Property & Equipment", cls: "Asset", balance: "Debit", contra: false,
    gaap: "ASC 360", ifrs: "IAS 16", familyId: "FAM-FA",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Tax", activityType: "Investment", timingClassification: "Current", adjustmentType: "Temporary", industryClassification: "Professional Services" },
  },
  {
    id: "CA-5002", name: "Accumulated Depreciation", cls: "Asset", balance: "Credit", contra: true,
    gaap: "ASC 360", ifrs: "IAS 16", familyId: "FAM-FA",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Tax", activityType: "Investment", timingClassification: "Deferred", adjustmentType: "Temporary", industryClassification: "Professional Services" },
  },
  {
    id: "CA-4002", name: "Depreciation Expense", cls: "Expense", balance: "Debit", contra: false,
    gaap: "ASC 360", ifrs: "IAS 16", familyId: "FAM-FA",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Tax", activityType: "Operating", timingClassification: "Current", adjustmentType: "Temporary", industryClassification: "Professional Services" },
  },
  // Existing accounts
  {
    id: "CA-1001", name: "Cash and Cash Equivalents", cls: "Asset", balance: "Debit", contra: false,
    gaap: "ASC 230", ifrs: "IAS 7", familyId: "FAM-CASH",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current" },
  },
  {
    id: "CA-1002", name: "Accounts Receivable", cls: "Asset", balance: "Debit", contra: false,
    gaap: "ASC 310", ifrs: "IFRS 9", familyId: "FAM-AR",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current" },
  },
  {
    id: "CA-1003", name: "Allowance for Doubtful Accounts", cls: "Asset", balance: "Credit", contra: true,
    gaap: "ASC 310-10", ifrs: "IFRS 9", familyId: "FAM-AR",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current", adjustmentType: "Temporary" },
  },
  {
    id: "CA-2001", name: "Accounts Payable", cls: "Liability", balance: "Credit", contra: false,
    gaap: "ASC 405", ifrs: "IAS 37", familyId: "FAM-AP",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current" },
  },
  {
    id: "CA-3001", name: "Revenue — Professional Services", cls: "Revenue", balance: "Credit", contra: false,
    gaap: "ASC 606", ifrs: "IFRS 15", familyId: "FAM-REV",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current" },
  },
  {
    id: "CA-4001", name: "Salaries and Wages Expense", cls: "Expense", balance: "Debit", contra: false,
    gaap: "ASC 420", ifrs: "IAS 19", familyId: "FAM-EXP",
    metadata: { jurisdiction: "Federal", entityType: "Partnership", basisType: "Book", activityType: "Operating", timingClassification: "Current" },
  },
];

// ─── FIRM TAXONOMY BRIDGE ─────────────────────────────────────────────────────

const FIRM_TAXONOMY: FirmMapping[] = [
  { firmCode: "5000", firmLabel: "PP&E — Machinery & Equipment",  canonicalId: "CA-5001", taxCategory: "Fixed Assets",         entityType: "Partnership", effectiveFrom: "2024-01-01", inheritedMetadata: { basisType: "Tax", activityType: "Investment" } },
  { firmCode: "5001", firmLabel: "PP&E — Leasehold Improvements", canonicalId: "CA-5001", taxCategory: "Fixed Assets",         entityType: "Partnership", effectiveFrom: "2024-01-01", inheritedMetadata: { basisType: "Tax", activityType: "Investment" } },
  { firmCode: "5100", firmLabel: "Accum. Depr. — Machinery",      canonicalId: "CA-5002", taxCategory: "Contra Fixed Assets",  entityType: "Partnership", effectiveFrom: "2024-01-01", inheritedMetadata: { basisType: "Tax", timingClassification: "Deferred" } },
  { firmCode: "6100", firmLabel: "Fixed Asset Depreciation",      canonicalId: "CA-4002", taxCategory: "Depreciation",         entityType: "Partnership", effectiveFrom: "2024-01-01", inheritedMetadata: { basisType: "Tax", adjustmentType: "Temporary" } },
  { firmCode: "1000", firmLabel: "Operating Cash Account",        canonicalId: "CA-1001", taxCategory: "Liquid Assets",        entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "1001", firmLabel: "Client Trust Account",          canonicalId: "CA-1001", taxCategory: "Liquid Assets",        entityType: "S-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "1100", firmLabel: "Trade Receivables",             canonicalId: "CA-1002", taxCategory: "Receivables",          entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "1101", firmLabel: "Unbilled Revenue Receivable",   canonicalId: "CA-1002", taxCategory: "Receivables",          entityType: "C-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "1110", firmLabel: "Bad Debt Reserve",              canonicalId: "CA-1003", taxCategory: "Contra Receivables",   entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "2000", firmLabel: "Vendor Payables",               canonicalId: "CA-2001", taxCategory: "Trade Payables",       entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "4000", firmLabel: "Consulting Revenue",            canonicalId: "CA-3001", taxCategory: "Service Revenue",      entityType: "Partnership", effectiveFrom: "2024-01-01" },
  { firmCode: "4001", firmLabel: "Advisory Fee Revenue",          canonicalId: "CA-3001", taxCategory: "Service Revenue",      entityType: "S-Corp",      effectiveFrom: "2024-01-01" },
  { firmCode: "6000", firmLabel: "Staff Compensation",            canonicalId: "CA-4001", taxCategory: "Compensation Expense", entityType: "Partnership", effectiveFrom: "2024-01-01" },
];

// ─── TDC TAX RULES (ENHANCED — METADATA-DRIVEN) ───────────────────────────────

const TDC_RULES: TaxRule[] = [
  // Fixed Assets Family — metadata-driven rules (seed data per spec)
  {
    id: "TR-FA-001",
    taxForm: "Form 1065", year: 2024, lineNum: "L20", lineLabel: "Depreciable Assets (Gross)",
    canonicalId: "CA-5001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0",
    effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "basisType",    operator: "eq", value: "Tax" },
      { field: "activityType", operator: "eq", value: "Investment" },
      { field: "adjustmentType", operator: "eq", value: "Temporary" },
    ],
  },
  {
    id: "TR-FA-002",
    taxForm: "Form 1065", year: 2024, lineNum: "L20a", lineLabel: "Less: Accumulated Depreciation",
    canonicalId: "CA-5002", ruleType: "Contra Offset", priority: 1, weight: -1,
    version: "v1.0",
    effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction",         operator: "eq", value: "Federal" },
      { field: "basisType",            operator: "eq", value: "Tax" },
      { field: "timingClassification", operator: "eq", value: "Deferred" },
    ],
  },
  {
    id: "TR-FA-003",
    taxForm: "Form 1065", year: 2024, lineNum: "L14a", lineLabel: "Depreciation (Book vs Tax Adjustment)",
    canonicalId: "CA-4002", ruleType: "Adjustment-Based", priority: 1, weight: 1,
    version: "v1.0",
    effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction",   operator: "eq", value: "Federal" },
      { field: "basisType",      operator: "eq", value: "Tax" },
      { field: "adjustmentType", operator: "eq", value: "Temporary" },
      { field: "activityType",   operator: "eq", value: "Operating" },
    ],
  },
  {
    id: "TR-FA-004",
    taxForm: "Form 4562", year: 2024, lineNum: "L17", lineLabel: "MACRS Depreciation Deduction",
    canonicalId: "CA-4002", ruleType: "Derived", priority: 2, weight: 1,
    version: "v1.0",
    effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction",   operator: "eq", value: "Federal" },
      { field: "basisType",      operator: "eq", value: "Tax" },
      { field: "adjustmentType", operator: "eq", value: "Temporary" },
    ],
  },
  // Existing rules (enhanced with metadata conditions)
  {
    id: "TR-001",
    taxForm: "Form 1065", year: 2024, lineNum: "L1",   lineLabel: "Cash",
    canonicalId: "CA-1001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "Partnership" },
    ],
  },
  {
    id: "TR-002",
    taxForm: "Form 1065", year: 2024, lineNum: "L2",   lineLabel: "Accounts Receivable",
    canonicalId: "CA-1002", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "Partnership" },
    ],
  },
  {
    id: "TR-003",
    taxForm: "Form 1065", year: 2024, lineNum: "L2a",  lineLabel: "Less: Allowance for Bad Debts",
    canonicalId: "CA-1003", ruleType: "Contra Offset", priority: 1, weight: -1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction",   operator: "eq", value: "Federal" },
      { field: "adjustmentType", operator: "eq", value: "Temporary" },
    ],
  },
  {
    id: "TR-004",
    taxForm: "Form 1065", year: 2024, lineNum: "L17",  lineLabel: "Accounts Payable",
    canonicalId: "CA-2001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "Partnership" },
    ],
  },
  {
    id: "TR-005",
    taxForm: "Form 1065", year: 2024, lineNum: "L1a",  lineLabel: "Gross Receipts or Sales",
    canonicalId: "CA-3001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "Partnership" },
      { field: "activityType", operator: "eq", value: "Operating" },
    ],
  },
  {
    id: "TR-006",
    taxForm: "Form 1065", year: 2024, lineNum: "L9",   lineLabel: "Salaries and Wages",
    canonicalId: "CA-4001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "Partnership" },
    ],
  },
  {
    id: "TR-007",
    taxForm: "Form 1120S", year: 2024, lineNum: "L1a",  lineLabel: "Gross Receipts",
    canonicalId: "CA-3001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "S-Corp" },
    ],
  },
  {
    id: "TR-008",
    taxForm: "Form 1120S", year: 2024, lineNum: "L8",   lineLabel: "Salaries and Wages",
    canonicalId: "CA-4001", ruleType: "Direct", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction", operator: "eq", value: "Federal" },
      { field: "entityType",   operator: "eq", value: "S-Corp" },
    ],
  },
  {
    id: "TR-009",
    taxForm: "Form 1120S", year: 2024, lineNum: "L14",  lineLabel: "Depreciation",
    canonicalId: "CA-4002", ruleType: "Adjustment-Based", priority: 1, weight: 1,
    version: "v1.0", effectiveDateRange: { from: "2024-01-01" },
    metadataConditions: [
      { field: "jurisdiction",   operator: "eq", value: "Federal" },
      { field: "entityType",     operator: "eq", value: "S-Corp" },
      { field: "adjustmentType", operator: "eq", value: "Temporary" },
    ],
  },
];

// ─── ADJUSTMENT LINKS ─────────────────────────────────────────────────────────

const ADJUSTMENT_LINKS: AdjustmentLink[] = [
  {
    id: "ADJ-001",
    label: "Book-to-Tax Depreciation Adjustment",
    canonicalId: "CA-4002",
    taxRuleId: "TR-FA-003",
    adjustmentType: "Temporary",
    basisType: "Tax",
    description: "Book depreciation uses straight-line (GAAP). Tax depreciation uses MACRS accelerated method. Temporary difference recorded as deferred tax liability.",
    amount: -42500,
    metadata: { jurisdiction: "Federal", basisType: "Tax", adjustmentType: "Temporary", timingClassification: "Deferred" },
  },
  {
    id: "ADJ-002",
    label: "Section 179 Immediate Expensing",
    canonicalId: "CA-5001",
    taxRuleId: "TR-FA-001",
    adjustmentType: "Temporary",
    basisType: "Tax",
    description: "Section 179 election allows immediate expensing of qualifying PP&E up to the annual limit. Creates a temporary difference between book and tax basis.",
    amount: -125000,
    metadata: { jurisdiction: "Federal", basisType: "Tax", adjustmentType: "Temporary", activityType: "Investment" },
  },
  {
    id: "ADJ-003",
    label: "Bad Debt Reserve — Tax vs Book",
    canonicalId: "CA-1003",
    taxRuleId: "TR-003",
    adjustmentType: "Temporary",
    basisType: "Tax",
    description: "Book uses allowance method (GAAP ASC 310-10). Tax uses specific charge-off method. Reserve balance creates a temporary difference.",
    amount: -8200,
    metadata: { jurisdiction: "Federal", basisType: "Tax", adjustmentType: "Temporary", timingClassification: "Deferred" },
  },
];

// ─── METADATA RULE MAPPINGS (evaluation trace) ────────────────────────────────

const METADATA_RULE_MAPPINGS: Record<string, { triggeredBy: string[]; outcome: string }> = {
  "TR-FA-003": {
    triggeredBy: ["basisType = Tax", "adjustmentType = Temporary", "activityType = Operating"],
    outcome: "Rule type escalated from Direct → Adjustment-Based. Adjustment ADJ-001 linked. Practitioner review required before tax-ready derivation.",
  },
  "TR-FA-004": {
    triggeredBy: ["basisType = Tax", "adjustmentType = Temporary", "jurisdiction = Federal"],
    outcome: "Derived rule activated. MACRS schedule applied. Form 4562 line populated from depreciation schedule, not direct balance.",
  },
  "TR-003": {
    triggeredBy: ["adjustmentType = Temporary"],
    outcome: "Contra offset applied. Temporary difference triggers deferred tax calculation. Adjustment ADJ-003 linked.",
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CLASS_COLORS: Record<string, { bg: string; text: string }> = {
  Asset:     { bg: "#eff6ff", text: "#1d4ed8" },
  Liability: { bg: "#fef3c7", text: "#92400e" },
  Revenue:   { bg: "#f0fdf4", text: "#166534" },
  Expense:   { bg: "#fdf4ff", text: "#7e22ce" },
};

const RULE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Direct":           { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "Derived":          { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  "Adjustment-Based": { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  "Contra Offset":    { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
};

const META_FIELD_COLORS: Record<string, string> = {
  jurisdiction: "#0ea5e9",
  entityType:   "#8b5cf6",
  basisType:    "#f59e0b",
  adjustmentType: "#ef4444",
  activityType: "#10b981",
  timingClassification: "#6366f1",
  industryClassification: "#64748b",
};

function ClassBadge({ cls }: { cls: string }) {
  const c = CLASS_COLORS[cls] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", backgroundColor: c.bg, color: c.text }}>{cls}</span>
  );
}

function MetaBadge({ field, value }: { field: string; value: string }) {
  const color = META_FIELD_COLORS[field] ?? "#64748b";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", backgroundColor: `${color}15`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: "9px", opacity: 0.7 }}>{field.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
      <span>= {value}</span>
    </span>
  );
}

function FamilyBadge({ family }: { family: TaxonomyFamily }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", backgroundColor: `${family.color}15`, color: family.color, border: `1px solid ${family.color}30` }}>
      <Layers style={{ width: "10px", height: "10px" }} />
      {family.name}
    </span>
  );
}

// ─── LINEAGE CHAIN (ENHANCED WITH METADATA) ───────────────────────────────────

const LINEAGE_STEPS = [
  { label: "Client Account",         sub: "Source financial data",              color: "#64748b" },
  { label: "Firm Taxonomy",          sub: "Firm code → canonical (metadata inherited)", color: "#8b5cf6" },
  { label: "Canonical Account",      sub: "PDC — financial truth + metadata",   color: "#0ea5e9" },
  { label: "Metadata Layer",         sub: "Jurisdiction · Basis · Adjustment",  color: "#f59e0b", isNew: true },
  { label: "Tax Rule Engine",        sub: "TDC — metadata-driven evaluation",   color: "#10b981" },
  { label: "Tax Form Line",          sub: "Form 1065 / 1120S / 4562 output",    color: "#6366f1" },
  { label: "Roger Read Surface",     sub: "Read-only practitioner view",        color: "#ef4444" },
];

function LineageChain() {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px 24px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          End-to-End Lineage Chain — Metadata-Driven
        </div>
        <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fffbeb", color: "#92400e", padding: "2px 8px", borderRadius: "10px", border: "1px solid #fde68a" }}>
          Metadata Layer Added
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: "0", overflowX: "auto", paddingBottom: "4px" }}>
        {LINEAGE_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              border: `1.5px solid ${step.color}${(step as any).isNew ? "80" : "30"}`,
              borderRadius: "8px", padding: "10px 14px",
              background: `${step.color}${(step as any).isNew ? "18" : "08"}`,
              minWidth: "130px", textAlign: "center",
              boxShadow: (step as any).isNew ? `0 0 0 2px ${step.color}25` : "none",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: step.color, marginBottom: "3px" }}>
                {step.label}
                {(step as any).isNew && <span style={{ fontSize: "9px", fontWeight: 800, marginLeft: "4px", backgroundColor: step.color, color: "white", padding: "1px 4px", borderRadius: "4px" }}>NEW</span>}
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.3 }}>{step.sub}</div>
            </div>
            {i < LINEAGE_STEPS.length - 1 && (
              <ChevronRight style={{ width: "16px", height: "16px", color: "#cbd5e1", flexShrink: 0, margin: "0 2px" }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
        <strong style={{ color: "#0ea5e9" }}>PDC</strong> owns canonical financial truth + metadata.{" "}
        <strong style={{ color: "#f59e0b" }}>Metadata Layer</strong> drives rule evaluation (jurisdiction, basis, adjustment type).{" "}
        <strong style={{ color: "#10b981" }}>TDC</strong> evaluates metadata conditions before applying rules.{" "}
        <strong style={{ color: "#ef4444" }}>Roger</strong> reads results only — no writes.
      </div>
    </div>
  );
}

// ─── METADATA PANEL (EXPANDABLE) ─────────────────────────────────────────────

function MetadataPanel({ account }: { account: CanonicalAccount }) {
  const family = TAXONOMY_FAMILIES.find(f => f.id === account.familyId);
  const adjustments = ADJUSTMENT_LINKS.filter(a => a.canonicalId === account.id);
  const rules = TDC_RULES.filter(r => r.canonicalId === account.id);

  return (
    <div style={{ margin: "0 16px 16px", padding: "14px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
        <Layers style={{ width: "12px", height: "12px" }} />
        Metadata Layer — {account.name}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        {(Object.entries(account.metadata) as [string, string][]).map(([field, value]) => (
          value ? <MetaBadge key={field} field={field} value={value} /> : null
        ))}
      </div>
      {family && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Family</div>
          <FamilyBadge family={family} />
          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "8px" }}>{family.description}</span>
        </div>
      )}
      {adjustments.length > 0 && (
        <div style={{ marginTop: "10px", padding: "10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <GitBranch style={{ width: "10px", height: "10px" }} />
            Linked Adjustments ({adjustments.length})
          </div>
          {adjustments.map(adj => (
            <div key={adj.id} style={{ marginBottom: "6px", fontSize: "11px" }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{adj.label}</div>
              <div style={{ color: "#64748b", marginTop: "2px" }}>{adj.description}</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                <MetaBadge field="adjustmentType" value={adj.adjustmentType} />
                <MetaBadge field="basisType" value={adj.basisType} />
                {adj.amount !== undefined && (
                  <span style={{ fontSize: "10px", fontWeight: 700, color: adj.amount < 0 ? "#dc2626" : "#166534" }}>
                    ${Math.abs(adj.amount).toLocaleString()} {adj.amount < 0 ? "deduction" : "addition"}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "10px", color: "#8b5cf6", marginTop: "3px" }}>
                → Linked to rule: {adj.taxRuleId}
              </div>
            </div>
          ))}
        </div>
      )}
      {rules.length > 0 && (
        <div style={{ marginTop: "10px", fontSize: "10px", color: "#64748b" }}>
          <strong>{rules.length} tax rule{rules.length > 1 ? "s" : ""}</strong> evaluate this account using the metadata conditions above.
        </div>
      )}
    </div>
  );
}

// ─── RULE EVALUATION TRACE ────────────────────────────────────────────────────

function RuleEvalTrace({ rule }: { rule: TaxRule }) {
  const mapping = METADATA_RULE_MAPPINGS[rule.id];
  const adj = ADJUSTMENT_LINKS.find(a => a.taxRuleId === rule.id);
  if (!mapping && !adj) return null;
  return (
    <div style={{ margin: "0 0 8px 0", padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "11px" }}>
      <div style={{ fontWeight: 700, color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
        <AlertCircle style={{ width: "11px", height: "11px" }} />
        Metadata Evaluation Trace — {rule.id}
      </div>
      {mapping && (
        <>
          <div style={{ color: "#64748b", marginBottom: "4px" }}>
            <strong>Triggered by:</strong>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
            {mapping.triggeredBy.map(t => (
              <span key={t} style={{ fontSize: "10px", fontWeight: 600, backgroundColor: "#fffbeb", color: "#92400e", padding: "1px 6px", borderRadius: "8px", border: "1px solid #fde68a" }}>{t}</span>
            ))}
          </div>
          <div style={{ color: "#166534", fontWeight: 500 }}>{mapping.outcome}</div>
        </>
      )}
      {adj && (
        <div style={{ marginTop: "6px", color: "#7e22ce", fontWeight: 500 }}>
          Adjustment linked: <strong>{adj.label}</strong> ({adj.adjustmentType})
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [formFilter, setFormFilter]         = useState<"All" | "Form 1065" | "Form 1120S" | "Form 4562">("All");
  const [familyFilter, setFamilyFilter]     = useState<string>("All");
  const [showMetaPanel, setShowMetaPanel]   = useState(true);
  const [showRuleTrace, setShowRuleTrace]   = useState(true);

  const selectedAccount = PDC_ACCOUNTS.find(a => a.id === selectedId);

  const filteredPdc = useMemo(() => {
    let accounts = PDC_ACCOUNTS;
    if (familyFilter !== "All") accounts = accounts.filter(a => a.familyId === familyFilter);
    if (search) accounts = accounts.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
    );
    return accounts;
  }, [search, familyFilter]);

  const filteredTdc = useMemo(
    () => formFilter === "All" ? TDC_RULES : TDC_RULES.filter(r => r.taxForm === formFilter),
    [formFilter],
  );

  const highlightedFirm = selectedId
    ? new Set(FIRM_TAXONOMY.filter(f => f.canonicalId === selectedId).map(f => f.firmCode))
    : null;

  const highlightedTdc = selectedId
    ? new Set(filteredTdc.filter(r => r.canonicalId === selectedId).map(r => r.id))
    : null;

  const rowBg = (highlighted: boolean, selected: boolean) =>
    selected ? "#dbeafe" : highlighted ? "#eff6ff" : "transparent";

  const TH_STYLE: React.CSSProperties = {
    padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: 700,
    color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase",
    borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap",
    backgroundColor: "#f8fafc",
  };
  const TD: React.CSSProperties = { padding: "8px 10px" };

  return (
    <div style={{ padding: "24px 28px", backgroundColor: "#f8fafc", minHeight: "100%" }}>

      {/* Page header */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>
          DCT Platform · Metadata-Driven Taxonomy Model
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
          Taxonomy Explorer
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
          Canonical Account (PDC) → Metadata Layer → Tax Taxonomy Rules (TDC) → Tax Form Line → Roger Read Surface.
          Rules evaluate metadata combinations — not static direct mappings.
        </p>
      </div>

      <LineageChain />

      {/* Instruction hint */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#0ea5e9", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "8px 14px", marginBottom: "16px" }}>
        <Info style={{ width: "14px", height: "14px", flexShrink: 0 }} />
        <span>
          <strong>Click any row</strong> in the PDC Canonical Accounts table to highlight linked firm accounts, metadata layer, and tax rules across all panels.
          The <strong>Fixed Assets Family</strong> demonstrates the full metadata-driven model with adjustment linkage.
        </span>
      </div>

      {/* 3-panel grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", alignItems: "start" }}>

        {/* ── PANEL 1: PDC Canonical Accounts ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>PDC — Canonical Accounts</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                XLOB Taxonomy
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#0ea5e9", marginBottom: "10px" }}>
              Canonical financial truth. Each account carries metadata attributes and belongs to a Family.
            </div>

            {/* Family filter */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Layers style={{ width: "10px", height: "10px" }} /> Filter by Family
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <button
                  onClick={() => setFamilyFilter("All")}
                  style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", border: "1px solid", borderColor: familyFilter === "All" ? "#0ea5e9" : "#e2e8f0", backgroundColor: familyFilter === "All" ? "#0ea5e9" : "white", color: familyFilter === "All" ? "white" : "#475569", cursor: "pointer" }}
                >All</button>
                {TAXONOMY_FAMILIES.map(fam => (
                  <button
                    key={fam.id}
                    onClick={() => setFamilyFilter(fam.id)}
                    style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", border: "1px solid", borderColor: familyFilter === fam.id ? fam.color : "#e2e8f0", backgroundColor: familyFilter === fam.id ? `${fam.color}20` : "white", color: familyFilter === fam.id ? fam.color : "#475569", cursor: "pointer" }}
                  >{fam.name.replace(" Family", "")}</button>
                ))}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#94a3b8" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts..."
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px 6px 30px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#0f172a", backgroundColor: "#f8fafc" }}
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["ID", "Account Name", "Family", "Class", "Balance", "Contra", "GAAP", "IFRS"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPdc.map(a => {
                  const isSelected = selectedId === a.id;
                  const family = TAXONOMY_FAMILIES.find(f => f.id === a.familyId);
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedId(prev => prev === a.id ? null : a.id)}
                      style={{ backgroundColor: rowBg(false, isSelected), cursor: "pointer", transition: "background-color 0.15s" }}
                    >
                      <td style={{ ...TD, fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>{a.id}</td>
                      <td style={{ ...TD, color: "#0f172a", fontWeight: isSelected ? 600 : 400 }}>{a.name}</td>
                      <td style={TD}>
                        {family && (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: family.color, backgroundColor: `${family.color}15`, padding: "1px 6px", borderRadius: "8px", border: `1px solid ${family.color}30`, whiteSpace: "nowrap" }}>
                            {family.name.replace(" Family", "")}
                          </span>
                        )}
                      </td>
                      <td style={TD}><ClassBadge cls={a.cls} /></td>
                      <td style={{ ...TD, color: "#475569" }}>{a.balance}</td>
                      <td style={TD}>
                        {a.contra && (
                          <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fef2f2", color: "#dc2626", padding: "1px 6px", borderRadius: "8px", border: "1px solid #fecaca" }}>Contra</span>
                        )}
                      </td>
                      <td style={{ ...TD, color: "#64748b", fontSize: "11px" }}>{a.gaap}</td>
                      <td style={{ ...TD, color: "#64748b", fontSize: "11px" }}>{a.ifrs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Metadata panel — expandable */}
          {selectedAccount && (
            <div>
              <button
                onClick={() => setShowMetaPanel(p => !p)}
                style={{ width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fffbeb", border: "none", borderTop: "1px solid #fde68a", cursor: "pointer", fontSize: "11px", fontWeight: 700, color: "#92400e" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers style={{ width: "12px", height: "12px" }} />
                  Metadata Layer — {selectedAccount.id}
                </span>
                {showMetaPanel ? <ChevronUp style={{ width: "14px", height: "14px" }} /> : <ChevronDown style={{ width: "14px", height: "14px" }} />}
              </button>
              {showMetaPanel && <MetadataPanel account={selectedAccount} />}
            </div>
          )}
        </div>

        {/* ── PANEL 2: Firm Taxonomy Bridge ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Firm Taxonomy Bridge</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fdf4ff", color: "#7e22ce", padding: "2px 8px", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                {FIRM_TAXONOMY.length} mappings
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#8b5cf6", marginBottom: "8px" }}>
              Firm account → Canonical XLOB account. Metadata is inherited from the canonical account's Family.
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <ChevronRight style={{ width: "12px", height: "12px", color: "#8b5cf6" }} />
              Firm Account Code → canonical_account_id (FK to PDC) → inherits metadata
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Firm Code", "Firm Label", "→ Canonical ID", "Tax Category", "Entity Type", "Inherited Metadata", "Effective From"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIRM_TAXONOMY.map(f => {
                  const isHighlighted = highlightedFirm ? highlightedFirm.has(f.firmCode) : false;
                  return (
                    <tr key={f.firmCode} style={{ backgroundColor: rowBg(isHighlighted, isHighlighted), transition: "background-color 0.15s" }}>
                      <td style={{ ...TD, fontWeight: 700, color: "#7e22ce" }}>{f.firmCode}</td>
                      <td style={{ ...TD, color: "#0f172a", fontWeight: isHighlighted ? 600 : 400 }}>{f.firmLabel}</td>
                      <td style={TD}><span style={{ fontWeight: 700, color: "#2563eb" }}>{f.canonicalId}</span></td>
                      <td style={{ ...TD, color: "#475569" }}>{f.taxCategory}</td>
                      <td style={{ ...TD, color: "#475569" }}>{f.entityType}</td>
                      <td style={TD}>
                        {f.inheritedMetadata && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                            {(Object.entries(f.inheritedMetadata) as [string, string][]).map(([k, v]) =>
                              v ? <MetaBadge key={k} field={k} value={v} /> : null
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: "11px" }}>{f.effectiveFrom}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PANEL 3: TDC Tax Taxonomy ── */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>TDC — Tax Rule Engine</span>
              <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                {TDC_RULES.length} rules
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#10b981", marginBottom: "8px" }}>
              Rules evaluate metadata conditions — not static direct mappings. Multiple rules per canonical account supported.
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
              <ChevronRight style={{ width: "12px", height: "12px", color: "#10b981" }} />
              Canonical Account + Metadata Conditions → Tax Form Line
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(["All", "Form 1065", "Form 1120S", "Form 4562"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormFilter(f)}
                  style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", border: "1px solid", borderColor: formFilter === f ? "#10b981" : "#e2e8f0", backgroundColor: formFilter === f ? "#10b981" : "white", color: formFilter === f ? "white" : "#475569", cursor: "pointer", transition: "all 0.15s" }}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Rule evaluation trace toggle */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Show evaluation trace for highlighted rules</span>
            <button
              onClick={() => setShowRuleTrace(p => !p)}
              style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: showRuleTrace ? "#f0fdf4" : "white", color: showRuleTrace ? "#166534" : "#64748b", cursor: "pointer" }}
            >{showRuleTrace ? "Trace ON" : "Trace OFF"}</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Rule ID", "Tax Form", "Line #", "Line Label", "→ Canonical ID", "Rule Type", "Metadata Conditions", "Priority", "Weight", "Version"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTdc.map(r => {
                  const isHighlighted = highlightedTdc ? highlightedTdc.has(r.id) : false;
                  const ruleStyle = RULE_TYPE_COLORS[r.ruleType] ?? RULE_TYPE_COLORS["Direct"];
                  return (
                    <>
                      <tr key={r.id} style={{ backgroundColor: rowBg(isHighlighted, isHighlighted), transition: "background-color 0.15s" }}>
                        <td style={{ ...TD, fontWeight: 700, color: "#64748b", fontSize: "10px", whiteSpace: "nowrap" }}>{r.id}</td>
                        <td style={{ ...TD, fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }}>{r.taxForm}</td>
                        <td style={{ ...TD, fontWeight: 700, color: "#0f172a" }}>{r.lineNum}</td>
                        <td style={{ ...TD, color: "#0f172a", fontWeight: isHighlighted ? 600 : 400 }}>{r.lineLabel}</td>
                        <td style={TD}><span style={{ fontWeight: 700, color: "#2563eb" }}>{r.canonicalId}</span></td>
                        <td style={TD}>
                          <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: ruleStyle.bg, color: ruleStyle.text, padding: "1px 7px", borderRadius: "8px", border: `1px solid ${ruleStyle.border}`, whiteSpace: "nowrap" }}>{r.ruleType}</span>
                        </td>
                        <td style={TD}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                            {r.metadataConditions.map(c => (
                              <MetaBadge key={`${c.field}-${String(c.value)}`} field={c.field} value={String(c.value)} />
                            ))}
                          </div>
                        </td>
                        <td style={{ ...TD, color: "#475569", textAlign: "center" }}>{r.priority}</td>
                        <td style={{ ...TD, color: r.weight < 0 ? "#dc2626" : "#166534", fontWeight: 700, textAlign: "center" }}>{r.weight}</td>
                        <td style={{ ...TD, color: "#94a3b8", fontSize: "10px" }}>{r.version}</td>
                      </tr>
                      {isHighlighted && showRuleTrace && (
                        <tr key={`${r.id}-trace`}>
                          <td colSpan={10} style={{ padding: "0 12px 8px" }}>
                            <RuleEvalTrace rule={r} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

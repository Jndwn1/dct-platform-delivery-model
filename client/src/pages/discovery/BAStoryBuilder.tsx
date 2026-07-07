// BAStoryBuilder.tsx
// Guided form that auto-generates a complete Azure DevOps-ready user story
// from BA discovery inputs. Output can be copied directly into ADO.

import { useState } from "react";
import { Link } from "wouter";
import { Copy, Check, ChevronDown, ChevronUp, FileText, Zap, RotateCcw, BookOpen } from "lucide-react";

// ── Data: TDC objects, APIs, screens ─────────────────────────────────────────
const TDC_OBJECTS = [
  "TaxProfile", "MappingDecision", "MappingRule", "TaxFormTemplate",
  "Adjustment", "SignOffRecord", "EligibilityRecord", "FilingRecord",
  "ExceptionRecord", "RemedyAction", "AuditRecord", "LineageRecord",
  "ConfidenceBand", "EngagementId", "EntityId",
];

const API_OPTIONS = [
  { label: "GET /api/v1/tax-profiles/{entityId} — TDC", value: "GET /api/v1/tax-profiles/{entityId}" },
  { label: "POST /api/v1/mapping-decisions — TDC", value: "POST /api/v1/mapping-decisions" },
  { label: "GET /api/v1/eligibility/{entityId} — TDC", value: "GET /api/v1/eligibility/{entityId}" },
  { label: "PUT /api/v1/adjustments/{id} — TDC", value: "PUT /api/v1/adjustments/{id}" },
  { label: "POST /api/v1/sign-off — TDC", value: "POST /api/v1/sign-off" },
  { label: "GET /api/v1/filing-records/{id} — TDC", value: "GET /api/v1/filing-records/{id}" },
  { label: "GET /api/v1/normalized-records — PDC", value: "GET /api/v1/normalized-records" },
  { label: "GET /api/v1/ingestion/{jobId} — PDC", value: "GET /api/v1/ingestion/{jobId}" },
  { label: "POST /api/v1/exception-records — TDC", value: "POST /api/v1/exception-records" },
  { label: "GET /api/v1/lineage/{entityId} — TDC", value: "GET /api/v1/lineage/{entityId}" },
];

const ROGER_SCREENS = [
  "Roger Dashboard", "Roger Mapping Review", "Roger Tax Profile",
  "Roger Adjustments Screen", "Roger Sign-Off Screen", "Roger Eligibility Check",
  "Roger Filing Status", "Roger Ingestion Status", "Roger Audit Trail",
  "Roger Exception Management",
];

const BATCH_OPTIONS = [
  "FC — Foundation Core", "B1 — File Ingestion", "B2 — Financial Normalization",
  "B2A — Classification Enforcement", "B3 — TDC Reference Data", "B4 — AI Tax Mapping",
  "B5 — Roger Read Contract", "B6 — Adjustments & Overrides", "B7 — Sign-Off Workflow",
  "B8 — Exception Management", "B9 — Eligibility & Readiness", "B10 — Tax Return Assembly",
  "B12 — Engagement Identity", "B16 — Audit Event Log",
];

const VALIDATION_TEMPLATES = [
  "Field is required and must not be null",
  "Value must be immutable once submitted",
  "Audit record must be created on state change",
  "API must return 422 if required fields are missing",
  "Response must include lineage trace ID",
  "Decision must be persisted before Roger UI reflects change",
  "Confidence band must be GREEN, YELLOW, or RED only",
  "Sign-off requires practitioner authentication",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoryForm {
  // Who / What / Why
  persona: string;
  action: string;
  benefit: string;
  // Context
  batch: string;
  tdcObject: string;
  api: string;
  rogerScreen: string;
  // Behavior
  editableFields: string;
  validations: string[];
  customValidation: string;
  errorHandling: string;
  // Governance
  isImmutable: boolean;
  requiresAudit: boolean;
  requiresLineage: boolean;
  requiresSignOff: boolean;
  // Acceptance criteria extras
  extraAC: string;
  // Metadata
  storyTitle: string;
  featureTag: string;
  priority: string;
  storyPoints: string;
}

const EMPTY_FORM: StoryForm = {
  persona: "Tax Practitioner",
  action: "",
  benefit: "",
  batch: "",
  tdcObject: "",
  api: "",
  rogerScreen: "",
  editableFields: "",
  validations: [],
  customValidation: "",
  errorHandling: "",
  isImmutable: false,
  requiresAudit: true,
  requiresLineage: false,
  requiresSignOff: false,
  extraAC: "",
  storyTitle: "",
  featureTag: "",
  priority: "Medium",
  storyPoints: "3",
};

// ── Story generator ───────────────────────────────────────────────────────────
function generateStory(f: StoryForm): string {
  const lines: string[] = [];

  // Title
  const title = f.storyTitle || `As a ${f.persona}, I want to ${f.action || "[action]"}`;
  lines.push(`USER STORY — ${title}`);
  lines.push("─".repeat(60));
  lines.push("");

  // Metadata
  if (f.featureTag) lines.push(`Feature: ${f.featureTag}`);
  if (f.batch) lines.push(`Batch: ${f.batch}`);
  lines.push(`Priority: ${f.priority}`);
  lines.push(`Story Points: ${f.storyPoints}`);
  lines.push("");

  // User Story Statement
  lines.push("USER STORY");
  lines.push(`As a ${f.persona},`);
  lines.push(`I want to ${f.action || "[describe the action]"},`);
  lines.push(`So that ${f.benefit || "[describe the business benefit]"}.`);
  lines.push("");

  // Context
  if (f.tdcObject || f.api || f.rogerScreen) {
    lines.push("PLATFORM CONTEXT");
    if (f.tdcObject) lines.push(`• TDC Object: ${f.tdcObject}`);
    if (f.api) lines.push(`• API Endpoint: ${f.api}`);
    if (f.rogerScreen) lines.push(`• Roger Screen: ${f.rogerScreen}`);
    lines.push("");
  }

  // Governance flags
  const govFlags: string[] = [];
  if (f.isImmutable) govFlags.push("IMMUTABLE — record cannot be modified once submitted");
  if (f.requiresAudit) govFlags.push("AUDIT REQUIRED — state change must create an immutable audit record");
  if (f.requiresLineage) govFlags.push("LINEAGE REQUIRED — lineage trace ID must be included in response");
  if (f.requiresSignOff) govFlags.push("SIGN-OFF REQUIRED — practitioner authentication required before submission");
  if (govFlags.length > 0) {
    lines.push("GOVERNANCE FLAGS");
    govFlags.forEach(g => lines.push(`⚑ ${g}`));
    lines.push("");
  }

  // Acceptance Criteria
  lines.push("ACCEPTANCE CRITERIA");
  let acIndex = 1;

  // Given/When/Then core
  if (f.action) {
    lines.push(`AC${acIndex++}: Given a ${f.persona} is on the ${f.rogerScreen || "Roger screen"},`);
    lines.push(`        When they ${f.action},`);
    lines.push(`        Then the system calls ${f.api || "the appropriate API"} and returns a success response.`);
    lines.push("");
  }

  // Editable fields
  if (f.editableFields) {
    const fields = f.editableFields.split(",").map(s => s.trim()).filter(Boolean);
    lines.push(`AC${acIndex++}: The following fields are editable by the ${f.persona}:`);
    fields.forEach(field => lines.push(`        • ${field}`));
    lines.push("");
  }

  // Validations
  const allValidations = [
    ...f.validations,
    ...(f.customValidation ? f.customValidation.split("\n").filter(Boolean) : []),
  ];
  if (allValidations.length > 0) {
    lines.push(`AC${acIndex++}: Validation rules:`);
    allValidations.forEach(v => lines.push(`        • ${v}`));
    lines.push("");
  }

  // Error handling
  if (f.errorHandling) {
    lines.push(`AC${acIndex++}: Error handling:`);
    lines.push(`        ${f.errorHandling}`);
    lines.push("");
  }

  // Governance ACs
  if (f.isImmutable) {
    lines.push(`AC${acIndex++}: Once submitted, the ${f.tdcObject || "record"} cannot be modified. Any attempt to update returns HTTP 409 Conflict.`);
    lines.push("");
  }
  if (f.requiresAudit) {
    lines.push(`AC${acIndex++}: Every state change creates an immutable audit record containing: timestamp, actor, previous state, new state, and correlation ID.`);
    lines.push("");
  }
  if (f.requiresLineage) {
    lines.push(`AC${acIndex++}: The API response includes a lineage trace ID that can be used to reconstruct the full data lineage chain.`);
    lines.push("");
  }
  if (f.requiresSignOff) {
    lines.push(`AC${acIndex++}: The sign-off action requires the practitioner to be authenticated. Unauthenticated requests return HTTP 401.`);
    lines.push("");
  }

  // Extra AC
  if (f.extraAC) {
    const extras = f.extraAC.split("\n").filter(Boolean);
    extras.forEach(e => {
      lines.push(`AC${acIndex++}: ${e}`);
      lines.push("");
    });
  }

  // Out of scope
  lines.push("OUT OF SCOPE");
  lines.push("• Roger does not own tax logic — all decisions are owned by TDC");
  lines.push("• Roger does not call GoSystem Tax directly");
  lines.push("• This story does not include downstream filing or return assembly");
  lines.push("");

  // Definition of Done
  lines.push("DEFINITION OF DONE");
  lines.push("☐ API endpoint implemented and unit tested");
  lines.push("☐ Roger UI screen renders correctly with live API data");
  lines.push("☐ All acceptance criteria verified by QA");
  lines.push("☐ Consumer Guide updated to reflect new endpoint");
  if (f.requiresAudit) lines.push("☐ Audit record creation verified in audit log");
  if (f.requiresLineage) lines.push("☐ Lineage trace ID verified in response payload");
  if (f.isImmutable) lines.push("☐ Immutability enforced — update/delete returns 409");
  lines.push("☐ Story demo-ready for PI review");
  lines.push("");

  lines.push("─".repeat(60));
  lines.push(`Generated by DCT Platform BA Story Builder · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);

  return lines.join("\n");
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
      borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #f1f5f9",
        backgroundColor: "#f8fafc",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "16px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "4px" }}>
        {label}
      </label>
      {hint && <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "5px" }}>{hint}</div>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: "12px",
  border: "1px solid #e2e8f0", borderRadius: "6px",
  color: "#1e293b", backgroundColor: "#fafafa",
  outline: "none", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BAStoryBuilder() {
  const [form, setForm] = useState<StoryForm>(EMPTY_FORM);
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const update = (key: keyof StoryForm, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }));
    setGenerated(null);
  };

  const toggleValidation = (v: string) => {
    setForm(f => ({
      ...f,
      validations: f.validations.includes(v)
        ? f.validations.filter(x => x !== v)
        : [...f.validations, v],
    }));
    setGenerated(null);
  };

  const handleGenerate = () => {
    const story = generateStory(form);
    setGenerated(story);
    setShowPreview(true);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setGenerated(null);
    setShowPreview(false);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "16px",
          }}>✍</div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f1623", margin: 0 }}>
              BA Story Builder
            </h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Discovery Center · DCT Platform · RSM | CATT · Non-Production Workspace
            </div>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0", lineHeight: "1.6" }}>
          Fill in the discovery inputs below to auto-generate a complete, Azure DevOps-ready user story.
          All generated stories follow DCT governance standards — TDC ownership, immutability rules, audit requirements, and Roger boundary constraints.
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          <Link href="/discovery/checklist">
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", backgroundColor: "#ede9fe", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}>
              ☑ Discovery Checklist
            </span>
          </Link>
          <Link href="/discovery/ba-requirements">
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", backgroundColor: "#d1fae5", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}>
              🔍 BA Requirement Discovery
            </span>
          </Link>
          <Link href="/discovery">
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#1e40af", backgroundColor: "#dbeafe", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}>
              🧭 Discovery Center
            </span>
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>

        {/* LEFT — Form */}
        <div>

          {/* Section 1: Story Statement */}
          <FormSection title="1. Story Statement" subtitle="Define the persona, action, and business benefit">
            <Field label="Persona" hint="Who is performing this action in Roger?">
              <select style={selectStyle} value={form.persona} onChange={e => update("persona", e.target.value)}>
                <option>Tax Practitioner</option>
                <option>Tax Manager</option>
                <option>Senior Tax Reviewer</option>
                <option>Engagement Partner</option>
                <option>QA Reviewer</option>
                <option>System Administrator</option>
              </select>
            </Field>
            <Field label="Action" hint="What does the persona want to do? (e.g., 'view the mapping decisions for an entity')">
              <input style={inputStyle} type="text" value={form.action}
                onChange={e => update("action", e.target.value)}
                placeholder="e.g., review and confirm AI-generated mapping decisions for an entity" />
            </Field>
            <Field label="Business Benefit" hint="Why does this matter? What outcome does it enable?">
              <input style={inputStyle} type="text" value={form.benefit}
                onChange={e => update("benefit", e.target.value)}
                placeholder="e.g., practitioners can validate AI proposals before they become immutable decisions" />
            </Field>
            <Field label="Story Title (optional)" hint="Leave blank to auto-generate from persona + action">
              <input style={inputStyle} type="text" value={form.storyTitle}
                onChange={e => update("storyTitle", e.target.value)}
                placeholder="e.g., Roger — Mapping Review Screen" />
            </Field>
          </FormSection>

          {/* Section 2: Platform Context */}
          <FormSection title="2. Platform Context" subtitle="Which batch, TDC object, API, and Roger screen does this story touch?">
            <Field label="Batch">
              <select style={selectStyle} value={form.batch} onChange={e => update("batch", e.target.value)}>
                <option value="">— Select Batch —</option>
                {BATCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="TDC Business Object">
              <select style={selectStyle} value={form.tdcObject} onChange={e => update("tdcObject", e.target.value)}>
                <option value="">— Select TDC Object —</option>
                {TDC_OBJECTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="API Endpoint">
              <select style={selectStyle} value={form.api} onChange={e => update("api", e.target.value)}>
                <option value="">— Select API —</option>
                {API_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Roger Screen">
              <select style={selectStyle} value={form.rogerScreen} onChange={e => update("rogerScreen", e.target.value)}>
                <option value="">— Select Roger Screen —</option>
                {ROGER_SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </FormSection>

          {/* Section 3: Editable Fields & Validations */}
          <FormSection title="3. Editable Fields & Validations" subtitle="What can the user edit? What rules apply?">
            <Field label="Editable Fields" hint="Comma-separated list of fields the user can modify">
              <input style={inputStyle} type="text" value={form.editableFields}
                onChange={e => update("editableFields", e.target.value)}
                placeholder="e.g., decisionType, overrideReason, adjustmentAmount" />
            </Field>
            <Field label="Validation Rules" hint="Select all that apply">
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {VALIDATION_TEMPLATES.map(v => (
                  <label key={v} style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.validations.includes(v)}
                      onChange={() => toggleValidation(v)}
                      style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5" }}>{v}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Custom Validation Rules" hint="One rule per line">
              <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
                value={form.customValidation}
                onChange={e => update("customValidation", e.target.value)}
                placeholder="e.g., Adjustment amount must be a non-zero decimal&#10;Override reason must be at least 10 characters" />
            </Field>
            <Field label="Error Handling" hint="What happens when validation fails or the API returns an error?">
              <input style={inputStyle} type="text" value={form.errorHandling}
                onChange={e => update("errorHandling", e.target.value)}
                placeholder="e.g., Display inline validation error; do not submit until resolved" />
            </Field>
          </FormSection>

          {/* Section 4: Governance */}
          <FormSection title="4. Governance Flags" subtitle="Select all governance constraints that apply to this story">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "isImmutable", label: "Immutable Record", desc: "Once submitted, this record cannot be modified or deleted" },
                { key: "requiresAudit", label: "Audit Required", desc: "Every state change must create an immutable audit record" },
                { key: "requiresLineage", label: "Lineage Required", desc: "Response must include a lineage trace ID" },
                { key: "requiresSignOff", label: "Sign-Off Required", desc: "Practitioner authentication required before submission" },
              ].map(({ key, label, desc }) => (
                <label key={key} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer",
                  padding: "8px 10px", borderRadius: "6px",
                  backgroundColor: form[key as keyof StoryForm] ? "#faf5ff" : "#f8fafc",
                  border: `1px solid ${form[key as keyof StoryForm] ? "#ddd6fe" : "#e2e8f0"}`,
                }}>
                  <input type="checkbox"
                    checked={!!form[key as keyof StoryForm]}
                    onChange={e => update(key as keyof StoryForm, e.target.checked)}
                    style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#4c1d95" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </FormSection>

          {/* Section 5: Metadata */}
          <FormSection title="5. Story Metadata" subtitle="ADO tagging and estimation">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Feature Tag">
                <input style={inputStyle} type="text" value={form.featureTag}
                  onChange={e => update("featureTag", e.target.value)}
                  placeholder="e.g., Roger UI — Mapping Review" />
              </Field>
              <Field label="Priority">
                <select style={selectStyle} value={form.priority} onChange={e => update("priority", e.target.value)}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </Field>
              <Field label="Story Points">
                <select style={selectStyle} value={form.storyPoints} onChange={e => update("storyPoints", e.target.value)}>
                  <option>1</option><option>2</option><option>3</option>
                  <option>5</option><option>8</option><option>13</option>
                </select>
              </Field>
            </div>
            <Field label="Additional Acceptance Criteria" hint="One criterion per line — added verbatim to the story output">
              <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
                value={form.extraAC}
                onChange={e => update("extraAC", e.target.value)}
                placeholder="e.g., Screen must be accessible via keyboard navigation&#10;Loading state must be shown while API call is in progress" />
            </Field>
          </FormSection>

          {/* Generate button */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleGenerate}
              style={{
                flex: 1, padding: "12px", borderRadius: "8px",
                backgroundColor: "#7c3aed", color: "white",
                fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              <Zap style={{ width: "14px", height: "14px" }} />
              Generate User Story
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "12px 16px", borderRadius: "8px",
                backgroundColor: "#f8fafc", color: "#64748b",
                fontSize: "13px", fontWeight: 600, border: "1px solid #e2e8f0", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <RotateCcw style={{ width: "14px", height: "14px" }} />
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
            borderRadius: "10px", overflow: "hidden",
          }}>
            {/* Output header */}
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid #f1f5f9",
              backgroundColor: generated ? "#faf5ff" : "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: generated ? "#4c1d95" : "#94a3b8" }}>
                  {generated ? "✓ Story Generated" : "Story Output"}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                  {generated ? "Ready to paste into Azure DevOps" : "Fill the form and click Generate"}
                </div>
              </div>
              {generated && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setShowPreview(p => !p)}
                    style={{
                      fontSize: "11px", fontWeight: 600, padding: "4px 10px",
                      borderRadius: "5px", border: "1px solid #ddd6fe",
                      backgroundColor: "#ede9fe", color: "#6d28d9", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    {showPreview
                      ? <><ChevronUp style={{ width: "12px", height: "12px" }} /> Hide</>
                      : <><ChevronDown style={{ width: "12px", height: "12px" }} /> Show</>
                    }
                  </button>
                  <button
                    onClick={handleCopy}
                    style={{
                      fontSize: "11px", fontWeight: 600, padding: "4px 10px",
                      borderRadius: "5px", border: "1px solid #bbf7d0",
                      backgroundColor: copied ? "#d1fae5" : "#f0fdf4",
                      color: copied ? "#065f46" : "#059669", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    {copied
                      ? <><Check style={{ width: "12px", height: "12px" }} /> Copied!</>
                      : <><Copy style={{ width: "12px", height: "12px" }} /> Copy to Clipboard</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Output body */}
            {!generated ? (
              <div style={{
                padding: "40px 24px", textAlign: "center",
                color: "#94a3b8", fontSize: "13px",
              }}>
                <FileText style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: "6px" }}>No story generated yet</div>
                <div style={{ fontSize: "11px" }}>
                  Complete the form on the left and click<br />"Generate User Story" to see the output here.
                </div>
              </div>
            ) : showPreview ? (
              <div style={{ padding: "16px" }}>
                <pre style={{
                  fontSize: "11px", lineHeight: "1.7", color: "#1e293b",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  fontFamily: "ui-monospace, monospace",
                  maxHeight: "600px", overflowY: "auto",
                  backgroundColor: "#f8fafc", padding: "14px",
                  borderRadius: "6px", border: "1px solid #e2e8f0",
                }}>
                  {generated}
                </pre>
                <div style={{
                  marginTop: "12px", padding: "10px 12px",
                  backgroundColor: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: "6px", fontSize: "11px", color: "#92400e",
                }}>
                  <strong>How to use:</strong> Click "Copy to Clipboard" above, then paste directly into the Azure DevOps story description field. The story is pre-formatted for ADO's plain-text description editor.
                </div>
              </div>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "#6d28d9", fontSize: "12px" }}>
                <Check style={{ width: "24px", height: "24px", margin: "0 auto 8px", color: "#059669" }} />
                Story generated — click "Show" to preview or "Copy to Clipboard" to use it.
              </div>
            )}
          </div>

          {/* Tips panel */}
          <div style={{
            marginTop: "14px", padding: "14px 16px",
            backgroundColor: "#f0f9ff", border: "1px solid #bae6fd",
            borderRadius: "8px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", marginBottom: "8px" }}>
              <BookOpen style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
              BA Story Builder Tips
            </div>
            <ul style={{ fontSize: "11px", color: "#0c4a6e", lineHeight: "1.7", margin: 0, paddingLeft: "16px" }}>
              <li>Always select a TDC Object — it anchors the story to the data model</li>
              <li>Select the specific API endpoint — QA needs this for test case generation</li>
              <li>Check "Audit Required" for any story that changes state in TDC</li>
              <li>Check "Immutable" for sign-off, filing, and decision records</li>
              <li>Use the Discovery Checklist to verify all 13 items before submitting to ADO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// PDC Overview — Phoenix Data Consolidation
// The upstream source of all financial data in the DCT platform
// Audience: All roles — mandatory reading before any other Discovery Center page

import { useState } from "react";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ label, sub, sectionNum }: { label: string; sub?: string; sectionNum?: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      {sectionNum && (
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>
          {sectionNum}
        </div>
      )}
      <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1.2 }}>{label}</h2>
      {sub && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>{sub}</div>}
    </div>
  );
}

// ─── Capability card ──────────────────────────────────────────────────────────
const PDC_CAPABILITIES = [
  {
    id: "ingestion",
    icon: "⬇",
    title: "ERP Data Ingestion",
    color: "#1e3a5f",
    desc: "Receives raw financial data from ERP source systems (SAP, Oracle, NetSuite, and others) via the Tax Portal. Validates file format, completeness, and structural integrity before accepting the payload.",
  },
  {
    id: "normalization",
    icon: "⇄",
    title: "Data Normalization",
    color: "#065f46",
    desc: "Transforms raw ERP data into the DCT Canonical Data Model — a standardized, system-agnostic financial record format. Normalization ensures every downstream system receives data in a consistent, predictable structure regardless of the source ERP.",
  },
  {
    id: "entity",
    icon: "🏢",
    title: "Entity Assignment",
    color: "#0369a1",
    desc: "Assigns each financial record to the correct legal entity, tax jurisdiction, and reporting period. Entity assignment is the foundation for all downstream tax calculations and return assembly.",
  },
  {
    id: "taxonomy",
    icon: "🗂",
    title: "Firm Taxonomy & Classification",
    color: "#7c3aed",
    desc: "Applies the firm's chart-of-accounts taxonomy to each financial record. PDC owns the canonical account classification — it maps ERP account codes to the firm's standardized taxonomy before passing data to TDC.",
  },
  {
    id: "contract",
    icon: "📋",
    title: "PDC → TDC Data Contract",
    color: "#059669",
    desc: "Publishes a governed, versioned data contract to TDC. The contract defines the exact structure, field names, data types, and required values of every financial record PDC delivers. TDC cannot consume data that does not conform to this contract.",
  },
  {
    id: "lineage",
    icon: "🔗",
    title: "Source Lineage Tracking",
    color: "#92400e",
    desc: "Maintains an immutable record of the source origin for every financial record — which ERP system, which file, which upload session, and which timestamp. Source lineage is the foundation of the platform's end-to-end audit trail.",
  },
  {
    id: "validation",
    icon: "✓",
    title: "Data Quality Validation",
    color: "#dc2626",
    desc: "Runs a suite of data quality rules before publishing to TDC — completeness checks, referential integrity, duplicate detection, and business rule validation. Records that fail validation are quarantined and surfaced as exceptions.",
  },
  {
    id: "api",
    icon: "⚡",
    title: "PDC API Layer",
    color: "#475569",
    desc: "Exposes governed Read APIs to TDC and the Data Gateway for reference data queries (firm taxonomies, entity structures, reporting periods). PDC does not expose write APIs to external systems — all data enters PDC through the Tax Portal ingestion pipeline.",
  },
];

// ─── Ownership boundaries ─────────────────────────────────────────────────────
const BOUNDARIES = [
  { owns: "Raw ERP data ingestion and validation", color: "#059669" },
  { owns: "Canonical data model and normalization", color: "#059669" },
  { owns: "Entity assignment and jurisdiction mapping", color: "#059669" },
  { owns: "Firm taxonomy and chart-of-accounts classification", color: "#059669" },
  { owns: "PDC → TDC data contract publication", color: "#059669" },
  { owns: "Source lineage tracking (ERP origin)", color: "#059669" },
  { owns: "Data quality validation and exception quarantine", color: "#059669" },
];

const NOT_BOUNDARIES = [
  { owns: "Tax logic, tax rules, or tax transformation", color: "#dc2626" },
  { owns: "Tax-ready data or tax classifications", color: "#dc2626" },
  { owns: "Practitioner workflow or UI/UX", color: "#dc2626" },
  { owns: "Return engine production or IMS integration", color: "#dc2626" },
  { owns: "Roger API layer or practitioner-facing APIs", color: "#dc2626" },
  { owns: "Post-ingestion data persistence (owned by TDC)", color: "#dc2626" },
];

// ─── Canonical data model fields ─────────────────────────────────────────────
const CANONICAL_FIELDS = [
  { field: "entityId", type: "string", desc: "Legal entity identifier — assigned during entity assignment" },
  { field: "taxJurisdiction", type: "string", desc: "Primary tax jurisdiction for the record (federal, state, or international)" },
  { field: "reportingPeriod", type: "date", desc: "Tax reporting period (fiscal year end or interim period)" },
  { field: "accountCode", type: "string", desc: "Firm taxonomy account code — normalized from ERP chart of accounts" },
  { field: "accountDescription", type: "string", desc: "Human-readable account description from firm taxonomy" },
  { field: "accountType", type: "enum", desc: "Account classification: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE" },
  { field: "amount", type: "decimal", desc: "Financial amount in functional currency (always positive; sign carried in accountType)" },
  { field: "currency", type: "string", desc: "ISO 4217 currency code of the source amount" },
  { field: "erpSource", type: "string", desc: "Identifier of the source ERP system (SAP, Oracle, NetSuite, etc.)" },
  { field: "erpAccountCode", type: "string", desc: "Original ERP account code before normalization — preserved for lineage" },
  { field: "uploadSessionId", type: "string", desc: "Unique identifier of the Tax Portal upload session that created this record" },
  { field: "lineageId", type: "string", desc: "Immutable lineage identifier — links this record to its source origin" },
  { field: "pdcVersion", type: "string", desc: "PDC data contract version that produced this record" },
];

// ─── Batch groups ─────────────────────────────────────────────────────────────
const BATCH_GROUPS = [
  {
    group: "Foundation",
    color: "#1e3a5f",
    batches: [
      "FC — Foundation Core: establishes the PDC schema, entity model, and canonical data model",
      "B1 — File Ingestion & Initial Storage: Tax Portal upload pipeline, file validation, and initial staging",
      "B2 — Normalization & Cross-LOB Taxonomy: ERP-to-canonical normalization and firm taxonomy application",
      "B2A — Contract Enforcement & Classification: PDC → TDC data contract publication and enforcement",
    ],
  },
  {
    group: "Entity & Quality",
    color: "#065f46",
    batches: [
      "B5 — Entity Identity & Structure: legal entity assignment, jurisdiction mapping, and entity hierarchy",
      "B8 | PDC — Exception & Remediation: data quality exception quarantine and remediation workflow",
      "B21 | PDC — Quality Control: data quality validation suite and completeness checks",
    ],
  },
  {
    group: "Audit & Lineage",
    color: "#92400e",
    batches: [
      "B16 — Audit Trail & Lineage Governance: source lineage tracking and immutable audit record",
      "B13 — Platform Reference & Document Provenance: reference data management and document origin tracking",
    ],
  },
];

// ─── BA Guidance ──────────────────────────────────────────────────────────────
const BA_RULES = [
  {
    rule: "Start with PDC",
    detail: "Every DCT story begins with a financial record in PDC. Before designing any TDC, Roger, or IMS story, identify the PDC canonical record that the story depends on.",
    icon: "1",
  },
  {
    rule: "PDC does not own tax logic",
    detail: "PDC classifies accounts using the firm's financial taxonomy — not tax rules. If a story requires tax classification, tax transformation, or tax-ready data, that belongs to TDC, not PDC.",
    icon: "2",
  },
  {
    rule: "The data contract is the boundary",
    detail: "The PDC → TDC data contract defines exactly what TDC can consume. If a story requires a field that is not in the contract, it requires a PDC contract change — which is a separate, governed process.",
    icon: "3",
  },
  {
    rule: "Entity assignment is PDC's responsibility",
    detail: "Which legal entity a financial record belongs to is determined by PDC. TDC and Roger consume the entity assignment — they do not override it. Stories that require entity changes must be routed to PDC.",
    icon: "4",
  },
  {
    rule: "Lineage starts at PDC",
    detail: "The platform's end-to-end audit trail begins with PDC's source lineage record. Every downstream change is linked back to the original PDC record. Stories that require lineage tracing must reference the PDC lineageId.",
    icon: "5",
  },
];

export default function PDCOverview() {
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [activeBatchGroup, setActiveBatchGroup] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e3a5f",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "14px", flexShrink: 0,
          }}>PDC</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>PDC — Phoenix Data Consolidation</h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Upstream Financial Data Source · Canonical Model Owner · PDC → TDC Contract Publisher
            </div>
          </div>
        </div>

        {/* Role badges */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
          {[
            { label: "All Roles", color: "#1e3a5f" },
            { label: "Read First", color: "#059669" },
            { label: "Foundation", color: "#7c3aed" },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: "10px", fontWeight: 700, color: "white",
              backgroundColor: b.color, borderRadius: "4px", padding: "2px 8px",
            }}>{b.label}</span>
          ))}
        </div>

        <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "14px 0 0" }}>
          PDC (Phoenix Data Consolidation) is the <strong>upstream financial data source</strong> for the entire DCT platform.
          It receives raw financial data from ERP systems via the Tax Portal, normalizes it into the DCT Canonical Data Model,
          assigns each record to the correct legal entity and jurisdiction, and publishes a governed data contract to TDC.
          Every tax calculation, practitioner review, and return assembly in the platform begins with a financial record that PDC created.
        </p>

        {/* Start Here callout */}
        <div style={{
          marginTop: "14px", padding: "12px 16px", borderRadius: "8px",
          backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <div style={{ fontSize: "16px", flexShrink: 0 }}>🟢</div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46", marginBottom: "3px" }}>
              Start Here — Read This Page First
            </div>
            <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>
              PDC is the foundation of the entire DCT platform. Understanding what PDC does — and what it does not do —
              is a prerequisite for understanding TDC, Roger, IMS, and the Data Gateway. Every story, every API call,
              and every tax calculation in the platform traces back to a financial record that PDC created.
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1: Core Capabilities ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="Core Capabilities"
          sub="What PDC does — click any capability to expand"
          sectionNum="Section 1"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
          {PDC_CAPABILITIES.map(cap => {
            const isActive = activeCapability === cap.id;
            return (
              <div
                key={cap.id}
                onClick={() => setActiveCapability(isActive ? null : cap.id)}
                style={{
                  backgroundColor: isActive ? cap.color : "#f8fafc",
                  border: `2px solid ${isActive ? cap.color : "#e2e8f0"}`,
                  borderRadius: "10px",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: isActive ? "10px" : 0 }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : cap.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "14px", flexShrink: 0,
                  }}>{cap.icon}</div>
                  <div style={{
                    fontSize: "12px", fontWeight: 700,
                    color: isActive ? "white" : "#0f1623",
                    lineHeight: "1.3",
                  }}>{cap.title}</div>
                </div>
                {isActive && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", lineHeight: "1.6" }}>
                    {cap.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Ownership Boundaries ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="Ownership Boundaries"
          sub="What PDC owns — and what it does not own"
          sectionNum="Section 2"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Owns */}
          <div style={{
            backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "10px", padding: "16px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              ✓ PDC Owns
            </div>
            {BOUNDARIES.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669", marginTop: "5px", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{b.owns}</div>
              </div>
            ))}
          </div>
          {/* Does not own */}
          <div style={{
            backgroundColor: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "10px", padding: "16px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              ✕ PDC Does Not Own
            </div>
            {NOT_BOUNDARIES.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#dc2626", marginTop: "5px", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>{b.owns}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Principle */}
        <div style={{
          marginTop: "14px", padding: "12px 16px", borderRadius: "8px",
          backgroundColor: "#fffbeb", border: "1px solid #fde68a",
        }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>Key Principle</div>
          <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>
            PDC is responsible for <strong>financial truth</strong> — the accurate, normalized representation of what happened in the client's books.
            TDC is responsible for <strong>tax truth</strong> — the transformation of financial data into tax-ready data using the firm's tax rules.
            These two responsibilities must never be mixed. PDC does not apply tax logic. TDC does not ingest raw ERP data.
          </div>
        </div>
      </div>

      {/* ── Section 3: PDC in the Platform Flow ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="PDC in the Platform Flow"
          sub="How PDC fits into the end-to-end data journey"
          sectionNum="Section 3"
        />
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "20px 24px", overflowX: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "700px" }}>
            {[
              { label: "ERP Systems", sub: "SAP / Oracle / NetSuite", color: "#475569", arrow: true },
              { label: "Tax Portal", sub: "File Upload & Validation", color: "#334155", arrow: true },
              { label: "PDC", sub: "Normalize · Classify · Contract", color: "#1e3a5f", highlight: true, arrow: true },
              { label: "TDC", sub: "Tax Transformation", color: "#065f46", arrow: true },
              { label: "Roger", sub: "Practitioner Review", color: "#7c3aed", arrow: true },
              { label: "IMS / Gateway", sub: "Return Assembly", color: "#92400e", arrow: false },
            ].map((node, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  backgroundColor: node.highlight ? node.color : "#f8fafc",
                  border: `2px solid ${node.color}`,
                  borderRadius: "8px", padding: "10px 14px", textAlign: "center", minWidth: "100px",
                  boxShadow: node.highlight ? `0 0 0 3px ${node.color}33` : "none",
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: node.highlight ? "white" : node.color, lineHeight: "1.3" }}>{node.label}</div>
                  <div style={{ fontSize: "9px", color: node.highlight ? "rgba(255,255,255,0.8)" : "#64748b", marginTop: "2px" }}>{node.sub}</div>
                </div>
                {node.arrow && <div style={{ fontSize: "16px", color: "#94a3b8" }}>→</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "14px", fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>
            PDC sits between the ERP source systems and TDC. It is the <strong>only entry point</strong> for financial data into the DCT platform.
            No financial data reaches TDC, Roger, or IMS without first being ingested, normalized, and validated by PDC.
          </div>
        </div>
      </div>

      {/* ── Section 4: Canonical Data Model ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="Canonical Data Model"
          sub="The standardized financial record structure PDC publishes to TDC"
          sectionNum="Section 4"
        />
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "160px 80px 1fr",
            padding: "8px 16px", backgroundColor: "#1e3a5f",
            fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <div>Field</div>
            <div>Type</div>
            <div>Description</div>
          </div>
          {CANONICAL_FIELDS.map((f, i) => (
            <div key={f.field} style={{
              display: "grid", gridTemplateColumns: "160px 80px 1fr",
              padding: "9px 16px",
              backgroundColor: i % 2 === 0 ? "white" : "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "12px",
            }}>
              <div style={{ fontFamily: "monospace", fontWeight: 600, color: "#1e3a5f" }}>{f.field}</div>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: "#7c3aed",
                backgroundColor: "#f3e8ff", borderRadius: "3px",
                padding: "1px 5px", alignSelf: "start", width: "fit-content",
              }}>{f.type}</div>
              <div style={{ color: "#475569", lineHeight: "1.5" }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: "10px", padding: "10px 14px", borderRadius: "6px",
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "12px", color: "#1e40af",
        }}>
          <strong>Contract Note:</strong> The canonical data model is versioned. TDC consumes a specific contract version.
          Any change to the canonical model requires a formal PDC → TDC contract change process, including impact assessment,
          TDC schema migration, and gate verification before deployment.
        </div>
      </div>

      {/* ── Section 5: Batches ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="PDC Batch Groups"
          sub="Which batches build PDC capabilities — click to expand"
          sectionNum="Section 5"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {BATCH_GROUPS.map(group => {
            const isOpen = activeBatchGroup === group.group;
            return (
              <div key={group.group} style={{
                border: `1px solid ${group.color}33`,
                borderRadius: "8px", overflow: "hidden",
              }}>
                <button
                  onClick={() => setActiveBatchGroup(isOpen ? null : group.group)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                    padding: "12px 16px",
                    backgroundColor: isOpen ? group.color : `${group.color}11`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: isOpen ? "white" : group.color }}>
                    {group.group}
                  </span>
                  <span style={{ fontSize: "11px", color: isOpen ? "rgba(255,255,255,0.7)" : group.color }}>
                    {isOpen ? "▲" : "▼"} {group.batches.length} batches
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "12px 16px", backgroundColor: "white" }}>
                    {group.batches.map((b, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        padding: "8px 0", borderBottom: i < group.batches.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}>
                        <div style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          backgroundColor: group.color, marginTop: "6px", flexShrink: 0,
                        }} />
                        <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{b}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 6: BA Guidance ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="BA Guidance — Writing PDC Stories"
          sub="Five rules for Business Analysts when writing stories that involve PDC"
          sectionNum="Section 6"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {BA_RULES.map(rule => (
            <div key={rule.rule} style={{
              display: "flex", alignItems: "flex-start", gap: "14px",
              backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                backgroundColor: "#1e3a5f", color: "white",
                fontSize: "12px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{rule.icon}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>{rule.rule}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>{rule.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 7: Next Steps ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeading
          label="What to Read Next"
          sub="Continue your Discovery Center learning journey"
          sectionNum="Section 7"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {[
            { label: "TDC / DCT Overview", sub: "How PDC data becomes tax-ready", path: "/discovery/dct-overview", color: "#065f46", icon: "T" },
            { label: "End-to-End Data Flow", sub: "See PDC's role in the full journey", path: "/discovery/data-flow", color: "#1e3a5f", icon: "→" },
            { label: "Platform Responsibilities", sub: "Ownership boundaries across all systems", path: "/discovery/platform-responsibilities", color: "#7c3aed", icon: "▦" },
            { label: "Integration Architecture", sub: "PDC → TDC contract details", path: "/discovery/integration-architecture", color: "#92400e", icon: "↝" },
          ].map(next => (
            <a key={next.label} href={next.path} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#f8fafc", border: `1px solid ${next.color}33`,
                borderRadius: "8px", padding: "14px",
                cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = `${next.color}11`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#f8fafc"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "5px",
                    backgroundColor: next.color, color: "white",
                    fontSize: "11px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{next.icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>{next.label}</div>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{next.sub}</div>
                <div style={{ fontSize: "11px", color: next.color, marginTop: "6px", fontWeight: 600 }}>Read next →</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Connected Knowledge Graph ── */}
      <RelatedObjectsPanel rootNodeId="sys-pdc" title="PDC — Connected Knowledge Graph" />
    </div>
  );
}

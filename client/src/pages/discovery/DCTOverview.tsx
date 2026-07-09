import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";


const CORE_CAPABILITIES = [
  { id: "ingestion",     icon: "⬇", title: "Data Ingestion",          color: "#1e3a5f", desc: "Receives normalized financial data from PDC via the PDC→TDC data contract. Validates, stages, and queues data for the tax transformation pipeline." },
  { id: "rules",        icon: "⚖", title: "Tax Rules Engine",         color: "#065f46", desc: "Applies the full tax rules library to each financial record — federal rules, state rules, provision rules, and entity-specific overrides." },
  { id: "mapping",      icon: "🗺", title: "Known Mapping Service",    color: "#0369a1", desc: "Applies pre-configured known mappings to automatically classify financial accounts to tax lines without practitioner intervention." },
  { id: "classification",icon: "📊",title: "Book-to-Tax Classifier",  color: "#7c3aed", desc: "Classifies each financial item as book or tax, resolves book-to-tax differences, and tracks timing differences for deferred tax calculations." },
  { id: "adjustments",  icon: "±",  title: "Tax Adjustment Engine",   color: "#059669", desc: "Applies system-level tax adjustments — depreciation, amortization, deferred items — and accepts practitioner-created adjustments from Roger." },
  { id: "state",        icon: "🗺", title: "State Rules Processor",   color: "#dc2626", desc: "Applies state-specific tax rules, apportionment factors, and NOL calculations for each applicable jurisdiction." },
  { id: "lineage",      icon: "🔗", title: "Lineage Tracker",         color: "#92400e", desc: "Maintains an immutable audit trail of every data change — who changed what, when, and why. Lineage cannot be deleted or modified." },
  { id: "api",          icon: "⚡", title: "API Layer",                color: "#475569", desc: "Exposes governed Read and Update APIs to Roger and IMS (via B9A Gateway). All external access to TDC data goes through the API layer. DCT does not expose APIs directly to return engines." },
];

const BOUNDARIES = [
  { system: "PDC",      owns: "Financial data normalization, entity assignment, canonical model", doesNotOwn: "Tax logic, tax rules, tax-ready data", color: "#1e3a5f" },
  { system: "TDC",      owns: "Tax transformation, business rules, data persistence, lineage, API layer", doesNotOwn: "UI/UX, practitioner workflow, return engine production (owned by IMS)", color: "#065f46" },
  { system: "Roger",    owns: "Practitioner UI/UX, user workflow, exception resolution interface", doesNotOwn: "Business rules, data persistence, tax logic", color: "#7c3aed" },
  { system: "GoSystem", owns: "Return preparation, form generation, filing package assembly", doesNotOwn: "Tax data, business rules, lineage", color: "#92400e" },
];

const BATCH_GROUPS = [
  { group: "Foundation", batches: ["FC — Foundation Core", "B1 — Entity Model", "B2 — Reporting Period", "B3 — Canonical Model"], color: "#1e3a5f" },
  { group: "Tax Transformation", batches: ["B4 — Tax Rules Engine", "B5 — Known Mappings", "B6 — Book-to-Tax", "B7 — Tax Adjustments", "B8 — State Rules", "B9 — Provision"], color: "#065f46" },
  { group: "Roger Integration", batches: ["B10 — Roger Read APIs", "B11 — Roger Update APIs", "B12 — Roger Approval Flow"], color: "#7c3aed" },
  { group: "IMS & Lineage", batches: ["B9A — Gateway & Governed Access", "B14 — Lineage Closure", "B15 — Audit & Reporting"], color: "#92400e" },
];

export default function DCTOverview() {
  const [activeCapability, setActiveCapability] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#065f46",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "16px",
          }}>T</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>TDC / DCT Overview</h1>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Tax Data Consolidation — System of Record for All Tax Data</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          TDC (Tax Data Consolidation) is the central tax transformation platform. It receives financial data from PDC, applies the complete tax transformation pipeline, serves data to Roger and IMS (via the B9A Gateway), and maintains immutable lineage for all changes.
        </p>
      </div>

      {/* Mission statement */}
      <div style={{
        backgroundColor: "#065f46", borderRadius: "10px", padding: "16px 20px",
        marginBottom: "28px", color: "white",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6ee7b7", marginBottom: "6px" }}>
          Mission
        </div>
        <div style={{ fontSize: "14px", lineHeight: "1.7" }}>
          TDC transforms normalized financial data into tax-ready data through a governed, auditable, API-driven pipeline — ensuring every tax professional has access to accurate, traceable, and compliant tax data.
        </div>
      </div>

      {/* Core capabilities */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Core Capabilities</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {CORE_CAPABILITIES.map(cap => {
            const isActive = activeCapability === cap.id;
            return (
              <div
                key={cap.id}
                onClick={() => setActiveCapability(isActive ? null : cap.id)}
                style={{
                  backgroundColor: isActive ? `${cap.color}0d` : "white",
                  border: `2px solid ${isActive ? cap.color : "#e2e8f0"}`,
                  borderRadius: "10px", padding: "14px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>{cap.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: isActive ? "8px" : "0", lineHeight: "1.3" }}>
                  {cap.title}
                </div>
                {isActive && (
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>{cap.desc}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System boundaries */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>System Boundaries</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {BOUNDARIES.map(b => (
            <div key={b.system} style={{
              display: "grid", gridTemplateColumns: "100px 1fr 1fr",
              gap: "12px", alignItems: "start",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "12px 16px",
              borderLeft: `3px solid ${b.color}`,
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: b.color }}>{b.system}</div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Owns</div>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{b.owns}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Does NOT Own</div>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{b.doesNotOwn}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch model */}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Batch Delivery Model</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {BATCH_GROUPS.map(group => (
            <div key={group.group} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "10px", overflow: "hidden",
              borderTop: `3px solid ${group.color}`,
            }}>
              <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: group.color }}>{group.group}</div>
              </div>
              <div style={{ padding: "10px 14px" }}>
                {group.batches.map(batch => (
                  <div key={batch} style={{
                    fontSize: "12px", color: "#334155", padding: "4px 0",
                    borderBottom: "1px solid #f8fafc",
                  }}>
                    {batch}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* TDC Outbound Contract */}
      <div style={{ marginBottom: "28px", marginTop: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "6px" }}>TDC Outbound Contract — IMS Delivery</div>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>Source: TDC Outbound to IMS — Structure and Aggregation v1.0 (07.09.2026)</div>

        {/* Delivery status note */}
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Implementation Status</div>
          <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.6" }}>
            The outbound payload to IMS is <strong>built and exists in code</strong>. Only the live transport is stubbed: until IMS stands up its endpoint, delivery attempts return a 503 and TDC records a <code style={{backgroundColor:"#fef3c7",padding:"1px 4px",borderRadius:"3px",fontSize:"11px"}}>DELIVERY_FAILED</code> outcome. <strong>The payload shape is real and is the contract IMS builds to.</strong>
          </div>
        </div>

        {/* Envelope + Tax Line side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", borderTop: "3px solid #065f46" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Envelope Fields</div>
            {["clientId","entityId","taxYear","returnType","filingId","assemblyId","deliveryId","contractVersion (\"1.0\")"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                <code style={{ fontSize: "11px", backgroundColor: "#f0fdf4", color: "#065f46", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace" }}>{f}</code>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", borderTop: "3px solid #0369a1" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Each Tax Line</div>
            {["returnLineId","formLineCode","formLineLabel","scheduleReference","amount"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                <code style={{ fontSize: "11px", backgroundColor: "#eff6ff", color: "#0369a1", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace" }}>{f}</code>
              </div>
            ))}
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "10px", lineHeight: "1.5" }}>
              The payload is a <strong>flat list of tax lines</strong> — no nesting, no grouping containers. Grouping context is carried only as a <code style={{fontSize:"10px",backgroundColor:"#f1f5f9",padding:"1px 3px",borderRadius:"2px"}}>scheduleReference</code> string on each line.
            </div>
          </div>
        </div>

        {/* Identifier table */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>Two Identifiers, Two Purposes</div>
          </div>
          <div style={{ padding: "0" }}>
            {[
              { field: "filingId", purpose: "IMS idempotency key", detail: "IMS dedupes on it. A second delivery of the same filing requires an explicit re-delivery." },
              { field: "deliveryId", purpose: "TDC per-attempt tracking key", detail: "Unique per attempt. Used for TDC-side delivery tracking, not for IMS deduplication." },
            ].map((row, i) => (
              <div key={row.field} style={{ display: "grid", gridTemplateColumns: "140px 180px 1fr", gap: "12px", padding: "10px 14px", borderBottom: i === 0 ? "1px solid #f1f5f9" : "none" }}>
                <code style={{ fontSize: "11px", backgroundColor: "#f0fdf4", color: "#065f46", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace", alignSelf: "start" }}>{row.field}</code>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>{row.purpose}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{row.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Structural responsibility table */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>Structural Responsibility — TDC vs. IMS</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th style={{ padding: "8px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0", width: "160px" }}>Structure</th>
                  <th style={{ padding: "8px 14px", textAlign: "left", fontWeight: 700, color: "#065f46", borderBottom: "1px solid #e2e8f0" }}>How TDC Represents It</th>
                  <th style={{ padding: "8px 14px", textAlign: "left", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #e2e8f0" }}>Where Shaping Happens</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { structure: "Simple fields", tdc: "formLineCode + amount per line", shaping: "TDC provides directly" },
                  { structure: "Repeating data", tdc: "Multiple flat lines. Same formLineCode can appear more than once — one line per underlying record", shaping: "TDC provides as repeated lines" },
                  { structure: "Grouped / multi-level", tdc: "Not structured in the payload. Each line carries a flat scheduleReference. No nested worksheet or multi-level container", shaping: "IMS shapes into the engine's structure" },
                  { structure: "Data-copy scenarios", tdc: "Not in the payload. TDC sends each governed value once", shaping: "IMS, if an engine needs a value in multiple places" },
                  { structure: "Activity / sub-entity", tdc: "Not represented outbound. Current data layer does not capture activity-level grouping within a legal entity", shaping: "Intake gap — out of MVP scope. Requirements still owed." },
                ].map((row, i) => (
                  <tr key={row.structure} style={{ backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" }}>{row.structure}</td>
                    <td style={{ padding: "9px 14px", color: "#334155", borderBottom: "1px solid #f1f5f9", lineHeight: "1.5", verticalAlign: "top" }}>{row.tdc}</td>
                    <td style={{ padding: "9px 14px", color: "#334155", borderBottom: "1px solid #f1f5f9", lineHeight: "1.5", verticalAlign: "top" }}>{row.shaping}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Through-line statement */}
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "13px", color: "#065f46", lineHeight: "1.6" }}>
            <strong>The through-line:</strong> TDC provides governed, lineage-preserving line detail tagged with an IRS-form schedule reference. It does not provide engine-shaped structure. Every consumer receives the same flat, IRS-form-structured lines regardless of engine.
          </div>
        </div>
      </div>

      <RelatedObjectsPanel rootNodeId="sys-tdc" title="TDC / DCT — Connected Knowledge Graph" />
      <DiscoveryAskBuddy pagePath="/discovery/dct-overview" pageTitle="TDC / DCT Overview" />
    </div>
  );
}

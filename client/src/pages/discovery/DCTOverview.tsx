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
  { id: "api",          icon: "⚡", title: "API Layer",                color: "#475569", desc: "Exposes governed Read and Update APIs to Roger and GoSystem. All external access to TDC data goes through the API layer." },
];

const BOUNDARIES = [
  { system: "PDC",      owns: "Financial data normalization, entity assignment, canonical model", doesNotOwn: "Tax logic, tax rules, tax-ready data", color: "#1e3a5f" },
  { system: "TDC",      owns: "Tax transformation, business rules, data persistence, lineage, API layer", doesNotOwn: "UI/UX, practitioner workflow, GoSystem return production", color: "#065f46" },
  { system: "Roger",    owns: "Practitioner UI/UX, user workflow, exception resolution interface", doesNotOwn: "Business rules, data persistence, tax logic", color: "#7c3aed" },
  { system: "GoSystem", owns: "Return preparation, form generation, filing package assembly", doesNotOwn: "Tax data, business rules, lineage", color: "#92400e" },
];

const BATCH_GROUPS = [
  { group: "Foundation", batches: ["FC — Foundation Core", "B1 — Entity Model", "B2 — Reporting Period", "B3 — Canonical Model"], color: "#1e3a5f" },
  { group: "Tax Transformation", batches: ["B4 — Tax Rules Engine", "B5 — Known Mappings", "B6 — Book-to-Tax", "B7 — Tax Adjustments", "B8 — State Rules", "B9 — Provision"], color: "#065f46" },
  { group: "Roger Integration", batches: ["B10 — Roger Read APIs", "B11 — Roger Update APIs", "B12 — Roger Approval Flow"], color: "#7c3aed" },
  { group: "GoSystem & Lineage", batches: ["B13 — GoSystem Export", "B14 — Lineage Closure", "B15 — Audit & Reporting"], color: "#92400e" },
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
            <div style={{ fontSize: "11px", color: "#64748b" }}>Tax Data Cloud — System of Record for All Tax Data</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          TDC (Tax Data Cloud) is the central tax transformation platform. It receives financial data from PDC, applies the complete tax transformation pipeline, serves data to Roger and GoSystem, and maintains immutable lineage for all changes.
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
      <RelatedObjectsPanel rootNodeId="sys-tdc" title="TDC / DCT — Connected Knowledge Graph" />
      <DiscoveryAskBuddy pagePath="/discovery/dct-overview" pageTitle="TDC / DCT Overview" />
    </div>
  );
}

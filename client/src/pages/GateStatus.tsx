// Gate Status — DCT Governance Reference Guide
// RSM | CATT | DCT Platform
// Informational / educational overview of the four readiness gates.
// All artifact-level operational detail has been intentionally removed.

import { Lock, Shield, Link2, FileText } from "lucide-react";

// ─── GATE DEFINITIONS ─────────────────────────────────────────────────────────

const GATES = [
  {
    id: "G1",
    name: "Schema Lock",
    Icon: Lock,
    accentColor: "#7c3aed",        // violet
    accentBg: "#f5f3ff",
    accentBorder: "#ddd6fe",
    accentLight: "#ede9fe",
    purpose:
      "Ensure the canonical data structure is stable, approved, and ready for downstream consumption.",
    whyItMatters:
      "Prevents schema drift and ensures all consumers operate from the same governed structure.",
  },
  {
    id: "G2",
    name: "Invariant Lock",
    Icon: Shield,
    accentColor: "#1d4ed8",        // blue
    accentBg: "#eff6ff",
    accentBorder: "#bfdbfe",
    accentLight: "#dbeafe",
    purpose:
      "Ensure business rules, validation logic, and tax domain constraints are reviewed and approved.",
    whyItMatters:
      "Provides consistency and prevents conflicting interpretations of governed data.",
  },
  {
    id: "G3",
    name: "Contract Publication",
    Icon: Link2,
    accentColor: "#065f46",        // emerald
    accentBg: "#f0fdf4",
    accentBorder: "#bbf7d0",
    accentLight: "#d1fae5",
    purpose:
      "Ensure the published API and data contract are formally approved and available to consumers.",
    whyItMatters:
      "Allows downstream applications to integrate confidently using a governed contract.",
  },
  {
    id: "G4",
    name: "Lineage Closure",
    Icon: FileText,
    accentColor: "#92400e",        // amber
    accentBg: "#fffbeb",
    accentBorder: "#fde68a",
    accentLight: "#fef3c7",
    purpose:
      "Ensure complete end-to-end traceability exists from source ingestion through tax-ready output.",
    whyItMatters:
      "Supports auditability, governance, and regulatory compliance.",
  },
];

// ─── GATE CARD ────────────────────────────────────────────────────────────────

function GateCard({ gate }: { gate: typeof GATES[0] }) {
  const { Icon } = gate;
  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: `1px solid ${gate.accentBorder}`,
      borderLeft: `5px solid ${gate.accentColor}`,
      borderRadius: "12px",
      padding: "24px 28px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Gate header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          backgroundColor: gate.accentBg,
          border: `1px solid ${gate.accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon style={{ width: "22px", height: "22px", color: gate.accentColor }} />
        </div>
        <div>
          <div style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: gate.accentColor, marginBottom: "2px",
          }}>{gate.id}</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f1623", lineHeight: 1.2 }}>
            {gate.name}
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div style={{
        backgroundColor: gate.accentBg,
        border: `1px solid ${gate.accentBorder}`,
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "12px",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: gate.accentColor, marginBottom: "6px",
        }}>Purpose</div>
        <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.65", margin: 0 }}>
          {gate.purpose}
        </p>
      </div>

      {/* Why It Matters */}
      <div style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "14px 16px",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "#475569", marginBottom: "6px",
        }}>Why It Matters</div>
        <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.65", margin: 0 }}>
          {gate.whyItMatters}
        </p>
      </div>
    </div>
  );
}

// ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────

function GateFlow() {
  const steps = [
    { id: "G1", label: "Schema Lock",          color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    { id: "G2", label: "Invariant Lock",        color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { id: "G3", label: "Contract Publication",  color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0" },
    { id: "G4", label: "Lineage Closure",       color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  ];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px 28px",
      marginBottom: "24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#64748b", marginBottom: "16px",
      }}>Gate Progression — Batch Readiness Lifecycle</div>

      <div style={{
        display: "flex", alignItems: "center", gap: "0",
        overflowX: "auto", paddingBottom: "4px",
      }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "120px" }}>
            {/* Gate pill */}
            <div style={{
              flex: 1,
              backgroundColor: step.bg,
              border: `2px solid ${step.border}`,
              borderRadius: "10px",
              padding: "12px 14px",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
                textTransform: "uppercase", color: step.color, marginBottom: "4px",
              }}>{step.id}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", lineHeight: 1.3 }}>
                {step.label}
              </div>
            </div>
            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div style={{
                flexShrink: 0, width: "32px", textAlign: "center",
                fontSize: "18px", color: "#94a3b8", lineHeight: 1,
              }}>→</div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "14px", fontSize: "11px", color: "#64748b",
        borderTop: "1px solid #f1f5f9", paddingTop: "10px",
      }}>
        Each gate must be satisfied in sequence before a batch progresses to the next readiness stage.
        Gates are not optional — all four must pass before a batch is considered delivery-ready.
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function GateStatus() {
  return (
    <div style={{
      padding: "28px 32px",
      maxWidth: "1100px",
      margin: "0 auto",
      fontFamily: "system-ui, sans-serif",
      paddingBottom: "48px",
    }}>

      {/* ── Page header ── */}
      <div style={{
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "20px",
        marginBottom: "28px",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#64748b", marginBottom: "4px",
        }}>
          DCT Platform · Governance Framework
        </div>
        <h1 style={{
          fontSize: "26px", fontWeight: 900, color: "#0f1623",
          margin: "0 0 8px", letterSpacing: "-0.02em",
        }}>
          Gate Status — Governance Reference
        </h1>
        <p style={{
          fontSize: "14px", color: "#475569", lineHeight: "1.7",
          maxWidth: "780px", margin: 0,
        }}>
          The DCT governance framework uses four readiness gates to ensure that data, rules, contracts,
          and lineage are governed before a batch progresses through the delivery lifecycle.
        </p>
        <div style={{ marginTop: "10px" }}>
          <a
            href="/"
            style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
          >
            ← Platform Home
          </a>
        </div>
      </div>

      {/* ── Gate flow visual ── */}
      <GateFlow />

      {/* ── Gate cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {GATES.map(gate => (
          <GateCard key={gate.id} gate={gate} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: "36px",
        paddingTop: "16px",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          DCT Platform · Governance Reference · RSM | CATT
        </span>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          All four gates are required for batch delivery readiness
        </span>
      </div>
    </div>
  );
}

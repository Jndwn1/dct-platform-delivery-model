// ─────────────────────────────────────────────────────────────────────────────
// GovernanceBanner — Persistent Enterprise Governance Notice
// Per RSM Manus Usage Governance Policy (May 2026)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export default function GovernanceBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        title="Show governance notice"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: "#fef3c7", border: "1px solid #f59e0b",
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          fontSize: 11, fontWeight: 700, color: "#92400e", margin: "8px 0",
        }}
      >
        ⚠ Governance Notice (click to expand)
      </button>
    );
  }

  return (
    <div
      role="alert"
      style={{
        backgroundColor: "#fffbeb",
        border: "1px solid #f59e0b",
        borderLeft: "4px solid #d97706",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠</div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Enterprise Governance Notice
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#b45309", backgroundColor: "#fde68a", padding: "1px 6px", borderRadius: 4 }}>
            RSM Manus Usage Policy · May 2026
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>
          <strong>Manus is an enterprise governance, readiness, architecture, and operational visualization workspace only.</strong>{" "}
          Manus is <strong>not</strong> an approved production system, system of record, or integrated operational platform.
          All data in this workspace is mock, seed, or synthetic — for governance planning and architecture visualization purposes only.{" "}
          <strong>Do not upload client data, PII, PHI, confidential tax data, or protected intellectual property.</strong>
        </p>
        <div style={{ marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            "Non-production workspace",
            "No client data",
            "No ADO integration",
            "Seed/mock data only",
            "Governance planning use only",
          ].map(tag => (
            <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#92400e", backgroundColor: "#fde68a", padding: "2px 7px", borderRadius: 4 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        title="Dismiss (click to restore)"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#b45309", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}

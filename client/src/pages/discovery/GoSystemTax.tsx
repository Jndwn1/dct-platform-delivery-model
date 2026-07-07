import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
export default function GoSystemTax() {
  const OUTPUTS = [
    { title: "Federal Return",    icon: "📋", desc: "The complete federal income tax return assembled from TDC finalized data.", color: "#1e3a5f" },
    { title: "State Returns",     icon: "🗺", desc: "State income tax returns for each applicable jurisdiction.", color: "#065f46" },
    { title: "Schedules",         icon: "📊", desc: "All required supporting schedules (depreciation, amortization, NOL, etc.).", color: "#0369a1" },
    { title: "Tax Forms",         icon: "📄", desc: "All required federal and state tax forms generated from the finalized data.", color: "#7c3aed" },
    { title: "Filing Package",    icon: "📦", desc: "The complete filing package assembled and ready for submission.", color: "#92400e" },
  ];

  const RULES = [
    { rule: "GoSystem is read-only from TDC",          detail: "GoSystem consumes finalized data from TDC. It never writes back to TDC.", icon: "✕" },
    { rule: "GoSystem does not own tax data",          detail: "All tax data lives in TDC. GoSystem only produces return outputs from that data.", icon: "✕" },
    { rule: "GoSystem receives finalized data only",   detail: "GoSystem only receives data after TDC has completed transformation and Roger has approved.", icon: "✓" },
    { rule: "GoSystem is the last step",               detail: "GoSystem is the final consumer in the pipeline. No system reads from GoSystem in the DCT model.", icon: "→" },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#92400e",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "14px",
          }}>GS</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>GoSystem Tax</h1>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Thomson Reuters — Tax Return Preparation System</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          GoSystem Tax is the enterprise tax return preparation system that consumes finalized, practitioner-approved data from TDC and produces the complete tax return package. GoSystem is the final step in the DCT pipeline.
        </p>
      </div>

      {/* Role in DCT */}
      <div style={{
        backgroundColor: "#92400e", borderRadius: "10px", padding: "16px 20px",
        marginBottom: "28px", color: "white",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fcd34d", marginBottom: "8px" }}>
          GoSystem's Role in the DCT Pipeline
        </div>
        <div style={{ fontSize: "14px", lineHeight: "1.7" }}>
          GoSystem is a <strong>read-only consumer</strong> of TDC data. It receives finalized, practitioner-approved, tax-ready data from TDC and uses it to produce federal returns, state returns, schedules, and filing packages. GoSystem does not write back to TDC and does not own any tax data.
        </div>
      </div>

      {/* Outputs */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Outputs Produced</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {OUTPUTS.map(out => (
            <div key={out.title} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "14px",
              textAlign: "center", borderTop: `3px solid ${out.color}`,
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{out.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "6px" }}>{out.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{out.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance rules */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>Governance Rules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {RULES.map(r => (
            <div key={r.rule} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "12px 16px",
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                backgroundColor: r.icon === "✕" ? "#fef2f2" : r.icon === "✓" ? "#f0fdf4" : "#eff6ff",
                border: `1px solid ${r.icon === "✕" ? "#fecaca" : r.icon === "✓" ? "#bbf7d0" : "#bfdbfe"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
                color: r.icon === "✕" ? "#dc2626" : r.icon === "✓" ? "#059669" : "#1e40af",
                flexShrink: 0,
              }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "4px" }}>{r.rule}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration summary */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "16px 20px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>Integration Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Data Source", value: "TDC Data Export API (read-only)" },
            { label: "Trigger", value: "TDC publishes downstream event when data is finalized" },
            { label: "Data Direction", value: "TDC → GoSystem (one-way only)" },
            { label: "Write-back to TDC", value: "None — GoSystem never writes to TDC" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", minWidth: "120px" }}>{item.label}:</div>
              <div style={{ fontSize: "12px", color: "#334155" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <DiscoveryAskBuddy pagePath="/discovery/gosystem" pageTitle="GoSystem Tax" />
    </div>
  );
}

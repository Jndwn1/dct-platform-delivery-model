// UATProcessFlowDiagram.tsx
// Enterprise BPMN-style UAT process flow diagram
// Happy path: horizontal top row
// Defect path: lower branch with loop-back to UAT Validation

export default function UATProcessFlowDiagram() {
  // ── Color palette ──────────────────────────────────────────────────────────
  const C = {
    blue:       "#1d4ed8",
    blueBg:     "#eff6ff",
    blueBorder: "#93c5fd",
    orange:     "#d97706",
    orangeBg:   "#fffbeb",
    orangeBorder:"#fcd34d",
    yellow:     "#92400e",
    yellowBg:   "#fef3c7",
    yellowBorder:"#fbbf24",
    green:      "#065f46",
    greenBg:    "#f0fdf4",
    greenBorder:"#86efac",
    red:        "#dc2626",
    redBg:      "#fef2f2",
    redBorder:  "#fca5a5",
    navy:       "#003865",
    navyBg:     "#f0f4f8",
    slate:      "#475569",
    purple:     "#6d28d9",
    purpleBg:   "#faf5ff",
    purpleBorder:"#c4b5fd",
    teal:       "#0891b2",
    tealBg:     "#ecfeff",
    tealBorder: "#67e8f9",
    white:      "#ffffff",
    border:     "#e2e8f0",
    arrowGray:  "#94a3b8",
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const box = (bg: string, border: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    background: bg, border: `1.5px solid ${border}`, borderRadius: 8,
    padding: "8px 12px", textAlign: "center", color,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...extra,
  });

  const diamond = (bg: string, border: string, color: string): React.CSSProperties => ({
    width: 80, height: 80, background: bg, border: `2px solid ${border}`,
    transform: "rotate(45deg)", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  });

  const diamondLabel: React.CSSProperties = {
    transform: "rotate(-45deg)", fontSize: 10, fontWeight: 800,
    color: C.orange, textAlign: "center", lineHeight: 1.2, width: 60,
  };

  const label = (size = 11, weight = 700, color = C.navy): React.CSSProperties => ({
    fontSize: size, fontWeight: weight, color, lineHeight: 1.35,
  });

  const sublabel: React.CSSProperties = {
    fontSize: 10, color: C.slate, marginTop: 3, lineHeight: 1.4,
  };

  const arrow = (color = C.arrowGray): React.CSSProperties => ({
    color, fontSize: 18, lineHeight: 1, flexShrink: 0, userSelect: "none",
  });

  const hArrow = (color = C.arrowGray) => (
    <div style={{ ...arrow(color), display: "flex", alignItems: "center", padding: "0 4px" }}>→</div>
  );

  const vArrow = (color = C.arrowGray, label?: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2px 0" }}>
      <div style={{ width: 2, height: 14, background: color === C.arrowGray ? "#cbd5e1" : color }} />
      <div style={{ ...arrow(color) }}>↓</div>
      {label && <div style={{ fontSize: 9, fontWeight: 700, color, marginTop: 1 }}>{label}</div>}
    </div>
  );

  // ── Reload strategy columns ────────────────────────────────────────────────
  const reloadCols = [
    { label: "Partial Reload", sub: "Independent Reference Data", color: C.blue, bg: C.blueBg, border: C.blueBorder,
      items: ["Single worksheet affected", "No downstream impact", "Reload changed worksheet only"] },
    { label: "Coordinated Partial", sub: "Dependent Objects", color: C.orange, bg: C.orangeBg, border: C.orangeBorder,
      items: ["Multiple worksheets affected", "Some downstream dependencies", "Reload in dependency order"] },
    { label: "Full Reload", sub: "Foundational Changes", color: C.red, bg: C.redBg, border: C.redBorder,
      items: ["Foundational change (XLOB, Entity)", "All downstream data affected", "Full Load Order sequence"] },
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Main diagram area ── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* ── Left: process flow ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Source document ── */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
            <div style={{ ...box(C.navyBg, C.navy, C.navy), display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 10, borderWidth: 2 }}>
              <div style={{ fontSize: 22 }}>📄</div>
              <div>
                <div style={{ ...label(12, 800, C.navy) }}>Approved Master Data Workbook</div>
                <div style={{ ...sublabel }}>Authoring Guide · Load Order · MVP Scope</div>
              </div>
            </div>
          </div>

          {vArrow()}

          {/* ── Happy path: horizontal row ── */}
          <div style={{
            background: C.blueBg, border: `1px solid ${C.blueBorder}`,
            borderRadius: 10, padding: "12px 10px", marginBottom: 4,
            overflowX: "auto",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, textAlign: "center" }}>
              ● HAPPY PATH — Standard UAT Execution
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "nowrap", gap: 0, minWidth: "max-content", padding: "0 4px" }}>

              {/* Step 1 */}
              <div style={{ ...box(C.white, C.blueBorder, C.navy), minWidth: 100, width: 110 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>📋</div>
                <div style={{ ...label(10, 700, C.blue) }}>Review Authoring Guide</div>
                <div style={{ ...sublabel }}>Identify MVP worksheets · Confirm readiness</div>
              </div>
              {hArrow(C.blue)}

              {/* Step 2 */}
              <div style={{ ...box(C.white, C.blueBorder, C.navy), minWidth: 100, width: 110 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>✍️</div>
                <div style={{ ...label(10, 700, C.blue) }}>Author Approved Data</div>
                <div style={{ ...sublabel }}>Populate Ready for Authoring worksheets only</div>
              </div>
              {hArrow(C.blue)}

              {/* Step 3 */}
              <div style={{ ...box(C.white, C.blueBorder, C.navy), minWidth: 100, width: 110 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>⬆️</div>
                <div style={{ ...label(10, 700, C.blue) }}>Development Loads</div>
                <div style={{ ...sublabel }}>Load in dependency order · Validate ingestion</div>
              </div>
              {hArrow(C.blue)}

              {/* Step 4 */}
              <div style={{ ...box(C.white, C.blueBorder, C.navy), minWidth: 100, width: 110 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>🔍</div>
                <div style={{ ...label(10, 700, C.blue) }}>Business Executes UAT</div>
                <div style={{ ...sublabel }}>Validate data · Rules · Relationships · Dependencies</div>
              </div>
              {hArrow(C.orange)}

              {/* Decision diamond */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ ...diamond(C.orangeBg, C.orange, C.orange) }}>
                  <div style={{ ...diamondLabel }}>Defects Found?</div>
                </div>
              </div>
              {hArrow(C.green)}

              {/* Step 5 — Sign-off */}
              <div style={{ ...box(C.greenBg, C.greenBorder, C.green), minWidth: 100, width: 110 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>✅</div>
                <div style={{ ...label(10, 700, C.green) }}>Business Sign-off</div>
                <div style={{ ...sublabel }}>Workbook approved as Production Source of Truth</div>
              </div>
              {hArrow(C.green)}

              {/* End */}
              <div style={{ ...box(C.greenBg, C.green, C.green), minWidth: 72, width: 80, borderRadius: 20, borderWidth: 2 }}>
                <div style={{ ...label(11, 800, C.green) }}>END</div>
                <div style={{ ...sublabel }}>Production Ready</div>
              </div>

            </div>
            {/* NO label under decision */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.green, letterSpacing: "0.06em" }}>NO ↑</div>
            </div>
          </div>

          {/* YES arrow down from decision */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 2, height: 12, background: C.red }} />
              <div style={{ fontSize: 9, fontWeight: 800, color: C.red }}>YES ↓</div>
              <div style={{ width: 2, height: 8, background: C.red }} />
              <div style={{ color: C.red, fontSize: 16 }}>↓</div>
            </div>
          </div>

          {/* ── Defect path ── */}
          <div style={{
            background: C.redBg, border: `1px solid ${C.redBorder}`,
            borderRadius: 10, padding: "12px 10px", marginBottom: 4,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, textAlign: "center" }}>
              ⚠ DEFECT PATH — Impact Assessment &amp; Reload Cycle
            </div>

            {/* Row 1: Log → Impact Assessment */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 8 }}>
              <div style={{ ...box(C.white, C.redBorder, C.red), minWidth: 120 }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>🐛</div>
                <div style={{ ...label(10, 700, C.red) }}>Business Logs Defect</div>
                <div style={{ ...sublabel }}>Workbook Tab · Row · Expected vs Actual</div>
              </div>
              {hArrow(C.red)}
              <div style={{ ...box(C.yellowBg, C.yellowBorder, C.yellow), minWidth: 160 }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>📊</div>
                <div style={{ ...label(10, 700, C.yellow) }}>BA Performs Impact Assessment</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 8px", marginTop: 4, justifyContent: "center" }}>
                  {["Master Data Objects","Dataset Dependencies","Taxonomy Relationships","Taxonomy ID Changes","Trial Balance Impact"].map(i => (
                    <span key={i} style={{ fontSize: 9, color: C.yellow, background: "#fef9c3", borderRadius: 3, padding: "1px 5px" }}>• {i}</span>
                  ))}
                </div>
              </div>
              {hArrow(C.orange)}
              {/* Reload strategy diamond */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ ...diamond(C.orangeBg, C.orange, C.orange) }}>
                  <div style={{ ...diamondLabel }}>Reload Strategy</div>
                </div>
              </div>
            </div>

            {/* Reload strategy columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
              {reloadCols.map(col => (
                <div key={col.label} style={{ ...box(col.bg, col.border, col.color), textAlign: "left" }}>
                  <div style={{ ...label(10, 800, col.color), marginBottom: 2 }}>{col.label}</div>
                  <div style={{ fontSize: 9, color: col.color, opacity: 0.8, marginBottom: 5, fontStyle: "italic" }}>{col.sub}</div>
                  {col.items.map(i => (
                    <div key={i} style={{ fontSize: 10, color: "#1e293b", display: "flex", gap: 4, marginBottom: 2 }}>
                      <span style={{ color: col.color }}>•</span>{i}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Row 2: Reload → Validation → Revalidate */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <div style={{ ...box(C.white, C.redBorder, C.red), minWidth: 120 }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>🔄</div>
                <div style={{ ...label(10, 700, C.red) }}>Development Executes Reload</div>
                <div style={{ ...sublabel }}>Per BA reload decision</div>
              </div>
              {hArrow(C.red)}
              <div style={{ ...box(C.purpleBg, C.purpleBorder, C.purple), minWidth: 160 }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>🧪</div>
                <div style={{ ...label(10, 700, C.purple) }}>Validation Before UAT Resumes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 6px", marginTop: 4, justifyContent: "center" }}>
                  {["Previously loaded data","New workbook changes","Dependencies","Taxonomy relationships","Search indexes"].map(i => (
                    <span key={i} style={{ fontSize: 9, color: C.purple, background: "#ede9fe", borderRadius: 3, padding: "1px 5px" }}>✔ {i}</span>
                  ))}
                </div>
              </div>
              {hArrow(C.teal)}
              <div style={{ ...box(C.tealBg, C.tealBorder, C.teal), minWidth: 130 }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>🔁</div>
                <div style={{ ...label(10, 700, C.teal) }}>Business Revalidates</div>
                <div style={{ ...sublabel }}>Impacted worksheets only</div>
                <div style={{ marginTop: 6, fontSize: 9, fontWeight: 700, color: C.teal, background: C.tealBg, border: `1px solid ${C.tealBorder}`, borderRadius: 4, padding: "2px 6px" }}>
                  ↩ Returns to UAT Validation
                </div>
              </div>
            </div>
          </div>

          {/* Loop-back label */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, fontStyle: "italic", padding: "4px 12px", background: C.tealBg, border: `1px solid ${C.tealBorder}`, borderRadius: 20 }}>
              ↩ Iterative loop — repeat until all defects resolved and Business Sign-off obtained
            </div>
          </div>
        </div>

        {/* ── Right: callout panel ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: C.navyBg, border: `2px solid ${C.navy}`,
          borderRadius: 10, padding: "16px 14px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            📌 Workbook Drives the Entire UAT Lifecycle
          </div>
          <p style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.6, margin: "0 0 12px" }}>
            The Approved Master Data Workbook governs every stage of User Acceptance Testing.
          </p>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 6 }}>It defines:</div>
          {[
            ["📋", "What is tested",        "MVP Scope"],
            ["🔢", "When it is tested",     "Load Order"],
            ["👤", "Who owns each dataset", "Authoring Guide"],
            ["✅", "What is approved",      "Business Validation"],
            ["📝", "What changes",          "Workbook Updates"],
            ["⚖️", "Reload strategy",       "Impact Assessment"],
            ["🏁", "Final sign-off",        "Production Workbook"],
          ].map(([icon, what, how]) => (
            <div key={String(what)} style={{ display: "flex", gap: 6, marginBottom: 7, alignItems: "flex-start" }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.navy }}>{what}</div>
                <div style={{ fontSize: 10, color: C.slate }}>{how}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom governance banner ── */}
      <div style={{
        marginTop: 16, background: C.navy, borderRadius: 10,
        padding: "14px 20px", display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>🏛️</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
            Governance Principle
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: 0 }}>
            The <strong style={{ color: "white" }}>Approved Master Data Workbook</strong> is the single authoritative source of truth for implementation, loading, validation, reload decisions, and business approval. Every approved workbook change must undergo <strong style={{ color: "#fbbf24" }}>Business Analyst impact assessment</strong> before Development executes a reload. UAT resumes only after successful validation confirms data integrity.
          </p>
        </div>
      </div>
    </div>
  );
}

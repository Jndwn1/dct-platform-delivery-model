/**
 * IMSArchitectureDiagrams.tsx
 * Five interactive architecture diagrams for the IMS Discovery page.
 * Maintains DCT Discovery Center visual style (navy / green / blue / purple / orange).
 */

import { useState } from "react";
import { useLocation } from "wouter";

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = "#0f1623";
const BLUE   = "#1e3a5f";
const GREEN  = "#065f46";
const ORANGE = "#c2410c";
const PURPLE = "#6b21a8";
const SLATE  = "#475569";
const BORDER = "#e2e8f0";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function DiagramCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: "white",
      border: `1px solid ${BORDER}`,
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "24px",
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: NAVY,
        padding: "14px 20px",
        borderBottom: `3px solid #059669`,
      }}>
        <div style={{ fontSize: "15px", fontWeight: 800, color: "white" }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{subtitle}</div>
        )}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
      <div style={{ width: "2px", height: "16px", backgroundColor: "#94a3b8" }} />
      <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #94a3b8" }} />
      {label && <div style={{ fontSize: "10px", color: SLATE, marginTop: "2px", fontWeight: 600 }}>{label}</div>}
    </div>
  );
}

function HArrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px" }}>
      <div style={{ flex: 1, height: "2px", backgroundColor: "#94a3b8" }} />
      <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "7px solid #94a3b8" }} />
    </div>
  );
}

// ─── Diagram 1: DCT → IMS High-Level Architecture ────────────────────────────
interface PlatformCardProps {
  title: string;
  color: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  link?: string;
}

function PlatformCard({ title, color, responsibilities, inputs, outputs, link }: PlatformCardProps) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: hover ? `${color}15` : "#f8fafc",
        border: `2px solid ${hover ? color : BORDER}`,
        borderRadius: "10px",
        padding: "14px 16px",
        transition: "all 0.2s",
        cursor: "pointer",
        minWidth: "160px",
        flex: 1,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "8px",
      }}>
        <div style={{
          fontSize: "12px", fontWeight: 800, color: "white",
          backgroundColor: color, borderRadius: "6px",
          padding: "3px 10px",
        }}>{title}</div>
        <span style={{ fontSize: "10px", color: SLATE }}>{expanded ? "▲" : "▼"}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {responsibilities.map(r => (
          <div key={r} style={{ fontSize: "11px", color: "#334155", lineHeight: "1.4" }}>• {r}</div>
        ))}
      </div>
      {expanded && (
        <div style={{ marginTop: "10px", borderTop: `1px solid ${BORDER}`, paddingTop: "10px" }}>
          <div style={{ marginBottom: "6px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Inputs</div>
            {inputs.map(i => <div key={i} style={{ fontSize: "11px", color: SLATE }}>→ {i}</div>)}
          </div>
          <div style={{ marginBottom: link ? "8px" : 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Outputs</div>
            {outputs.map(o => <div key={o} style={{ fontSize: "11px", color: SLATE }}>← {o}</div>)}
          </div>
          {link && (
            <button
              onClick={e => { e.stopPropagation(); navigate(link); }}
              style={{
                fontSize: "10px", fontWeight: 700, color: color,
                background: "none", border: `1px solid ${color}`,
                borderRadius: "4px", padding: "2px 8px", cursor: "pointer",
              }}
            >
              View Discovery Page →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Diagram1() {
  return (
    <DiagramCard
      title="DCT → IMS High-Level Architecture"
      subtitle="Click any platform card to expand inputs, outputs, and links · Executive overview"
    >
      {/* Source Systems */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
        <div style={{
          backgroundColor: "#f1f5f9", border: `1px dashed ${SLATE}`,
          borderRadius: "8px", padding: "8px 24px",
          fontSize: "12px", fontWeight: 700, color: SLATE,
        }}>
          Source Systems
        </div>
      </div>
      <Arrow label="Raw Financial Data" />

      {/* PDC */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
        <PlatformCard
          title="PDC Platform"
          color="#0369a1"
          responsibilities={["Normalize data", "Canonical model", "Source lineage", "Financial ingestion"]}
          inputs={["Trial balance", "Source extracts", "GL data"]}
          outputs={["Normalized records", "Canonical financial model", "Lineage metadata"]}
        />
      </div>
      <Arrow label="Normalized Records" />

      {/* DCT / TDC */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
        <PlatformCard
          title="DCT / TDC Platform"
          color={GREEN}
          responsibilities={["Tax-ready records", "Adjustments", "Assembly", "Approved totals", "Sign-Off", "Immutable Filing Record", "Gateway (Batch 9A)"]}
          inputs={["PDC canonical model", "Tax rules", "Adjustment data"]}
          outputs={["Filing Record", "Outbound contract", "Approved totals"]}
          link="/discovery/gosystem"
        />
      </div>
      <Arrow label="Outbound Contract via Gateway" />

      {/* IMS */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
        <PlatformCard
          title="IMS Integration Layer"
          color={ORANGE}
          responsibilities={["IRS line translation", "Roll-up", "Engine routing", "Payload delivery"]}
          inputs={["DCT outbound contract", "Approved totals", "Filing Record"]}
          outputs={["Translated payload", "Engine-specific format", "Acknowledgements"]}
          link="/discovery/gosystem"
        />
      </div>

      {/* Fan-out arrow */}
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "2px", height: "12px", backgroundColor: "#94a3b8" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
            {["GoSystem", "CCH Axcess", "OIT", "Future Engines"].map((eng, i, arr) => (
              <div key={eng} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  {i > 0 && <div style={{ width: `${i * 28}px`, height: "2px", backgroundColor: "#94a3b8", marginTop: "0px" }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return Engines */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { name: "GoSystem", note: "Primary" },
          { name: "CCH Axcess", note: "Planned" },
          { name: "OIT", note: "Planned" },
          { name: "Future Engines", note: "Extensible" },
        ].map(eng => (
          <div key={eng.name} style={{
            backgroundColor: `${PURPLE}15`,
            border: `1px solid ${PURPLE}`,
            borderRadius: "8px", padding: "8px 14px",
            textAlign: "center", minWidth: "100px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>{eng.name}</div>
            <div style={{ fontSize: "9px", color: SLATE, marginTop: "2px" }}>{eng.note}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: "16px", padding: "10px 14px",
        backgroundColor: "#f8fafc", borderRadius: "8px",
        border: `1px solid ${BORDER}`,
        display: "flex", gap: "16px", flexWrap: "wrap",
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>Legend:</div>
        {[
          { label: "PDC", color: "#0369a1" },
          { label: "DCT / TDC", color: GREEN },
          { label: "IMS", color: ORANGE },
          { label: "Return Engine", color: PURPLE },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color }} />
            <span style={{ fontSize: "10px", color: SLATE, fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </DiagramCard>
  );
}

// ─── Diagram 2: Architecture Ownership Swimlane ───────────────────────────────
const SWIMLANES = [
  {
    title: "PDC",
    color: "#0369a1",
    bg: "#eff6ff",
    responsibilities: [
      "Normalize data",
      "Canonical model",
      "Source lineage",
      "Financial ingestion",
    ],
  },
  {
    title: "DCT",
    color: GREEN,
    bg: "#f0fdf4",
    responsibilities: [
      "Tax calculations",
      "Tax-ready records",
      "Adjustments",
      "Assembly",
      "Filing Record",
      "Sign-Off",
      "Gateway",
      "Outbound contract",
    ],
  },
  {
    title: "IMS",
    color: ORANGE,
    bg: "#fff7ed",
    responsibilities: [
      "IRS line translation",
      "Payload transformation",
      "Roll-up",
      "Engine routing",
      "Delivery",
      "Processing acknowledgements",
    ],
  },
  {
    title: "Return Engine",
    color: PURPLE,
    bg: "#faf5ff",
    responsibilities: [
      "Import payload",
      "Populate return",
      "Return processing",
    ],
  },
];

function Diagram2() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <DiagramCard
      title="Architecture Ownership"
      subtitle="Color-coded responsibility swimlanes — hover to highlight"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {SWIMLANES.map(lane => (
          <div
            key={lane.title}
            onMouseEnter={() => setHovered(lane.title)}
            onMouseLeave={() => setHovered(null)}
            style={{
              backgroundColor: hovered === lane.title ? lane.bg : "white",
              border: `2px solid ${hovered === lane.title ? lane.color : BORDER}`,
              borderRadius: "10px",
              overflow: "hidden",
              transition: "all 0.2s",
            }}
          >
            {/* Lane header */}
            <div style={{
              backgroundColor: lane.color,
              padding: "8px 12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "white" }}>{lane.title}</div>
            </div>
            {/* Responsibilities */}
            <div style={{ padding: "12px" }}>
              {lane.responsibilities.map(r => (
                <div key={r} style={{
                  display: "flex", alignItems: "flex-start", gap: "6px",
                  marginBottom: "6px",
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    backgroundColor: lane.color, flexShrink: 0, marginTop: "4px",
                  }} />
                  <div style={{ fontSize: "11px", color: "#1e293b", lineHeight: "1.4" }}>{r}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: "14px", padding: "10px 14px",
        backgroundColor: "#f8fafc", borderRadius: "8px",
        border: `1px solid ${BORDER}`,
        display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Legend:</div>
        {SWIMLANES.map(l => (
          <div key={l.title} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: l.color }} />
            <span style={{ fontSize: "10px", color: SLATE, fontWeight: 600 }}>{l.title}</span>
          </div>
        ))}
      </div>
    </DiagramCard>
  );
}

// ─── Diagram 3: End-to-End Data Flow ─────────────────────────────────────────
const DATA_FLOW_STAGES = [
  { label: "Book Data", owner: "Source", color: "#64748b", desc: "Raw financial data from source systems — trial balance, GL entries, and source extracts." },
  { label: "PDC", owner: "PDC", color: "#0369a1", desc: "Normalizes data into the canonical financial model. Establishes source lineage." },
  { label: "Tax Ready Records", owner: "DCT", color: GREEN, desc: "PDC output transformed into tax-ready records within the TDC platform." },
  { label: "Adjustments", owner: "DCT", color: GREEN, desc: "Three adjustment types applied: Book, Reclass, and Tax adjustments.", sub: ["Book", "Reclass", "Tax"] },
  { label: "Assembly", owner: "DCT", color: GREEN, desc: "Adjusted records assembled into the consolidated tax position." },
  { label: "Approved Totals", owner: "DCT", color: GREEN, desc: "Final approved values at the approved grain level (summary or detail)." },
  { label: "Sign-Off", owner: "DCT", color: GREEN, desc: "Practitioner sign-off locks the filing position. Immutable after this point." },
  { label: "Immutable Filing Record", owner: "DCT", color: GREEN, desc: "The locked, auditable record of the final tax position. Cannot be modified." },
  { label: "Gateway (Batch 9A)", owner: "DCT", color: GREEN, desc: "Batch 9A packages the outbound contract and delivers it to IMS." },
  { label: "IMS", owner: "IMS", color: ORANGE, desc: "Translates, rolls up, and routes the payload to the appropriate return engine.", sub: ["Translate", "Roll-Up", "Route"] },
  { label: "Return Engine", owner: "Engine", color: PURPLE, desc: "Imports the translated payload and populates the tax return." },
  { label: "Acknowledgement", owner: "IMS", color: ORANGE, desc: "Return engine sends processing acknowledgement back to IMS." },
];

function Diagram3() {
  const [hovered, setHovered] = useState<string | null>(null);

  const ownerColor = (owner: string) => {
    if (owner === "PDC") return "#0369a1";
    if (owner === "DCT") return GREEN;
    if (owner === "IMS") return ORANGE;
    if (owner === "Engine") return PURPLE;
    return "#64748b";
  };

  return (
    <DiagramCard
      title="Roger/TDC → IMS Data Flow"
      subtitle="Complete data lifecycle — hover each stage for description"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {DATA_FLOW_STAGES.map((stage, i) => (
          <div key={stage.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div
              onMouseEnter={() => setHovered(stage.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                backgroundColor: hovered === stage.label ? `${ownerColor(stage.owner)}20` : "white",
                border: `2px solid ${hovered === stage.label ? ownerColor(stage.owner) : BORDER}`,
                borderRadius: "10px",
                padding: "10px 20px",
                width: "100%",
                maxWidth: "480px",
                transition: "all 0.2s",
                cursor: "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    backgroundColor: ownerColor(stage.owner), flexShrink: 0,
                  }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY }}>{stage.label}</div>
                </div>
                <div style={{
                  fontSize: "9px", fontWeight: 700, color: "white",
                  backgroundColor: ownerColor(stage.owner),
                  borderRadius: "4px", padding: "1px 6px",
                }}>{stage.owner}</div>
              </div>
              {stage.sub && (
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", paddingLeft: "16px" }}>
                  {stage.sub.map(s => (
                    <div key={s} style={{
                      fontSize: "10px", color: ownerColor(stage.owner),
                      border: `1px solid ${ownerColor(stage.owner)}`,
                      borderRadius: "4px", padding: "1px 6px",
                    }}>{s}</div>
                  ))}
                </div>
              )}
              {hovered === stage.label && (
                <div style={{
                  marginTop: "8px", paddingTop: "8px",
                  borderTop: `1px solid ${BORDER}`,
                  fontSize: "11px", color: "#334155", lineHeight: "1.5",
                }}>
                  {stage.desc}
                </div>
              )}
            </div>
            {i < DATA_FLOW_STAGES.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </DiagramCard>
  );
}

// ─── Diagram 4: Approved Grain Decision ──────────────────────────────────────
function Diagram4() {
  return (
    <DiagramCard
      title="Approved Grain Model"
      subtitle="Summary vs Detail decision — how TDC delivers approved values to IMS"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* IRS Form Line */}
        <div style={{
          backgroundColor: NAVY, color: "white",
          borderRadius: "8px", padding: "10px 28px",
          fontSize: "13px", fontWeight: 700,
        }}>IRS Form Line</div>
        <Arrow />

        {/* Decision diamond */}
        <div style={{
          width: "140px", height: "70px",
          backgroundColor: "#fef9c3", border: "2px solid #ca8a04",
          transform: "rotate(0deg)",
          borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700, color: "#92400e",
          textAlign: "center",
        }}>
          Summary<br />or Detail?
        </div>

        {/* Branch arrows */}
        <div style={{ display: "flex", gap: "80px", marginTop: "8px", marginBottom: "4px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "2px", height: "16px", backgroundColor: "#94a3b8" }} />
            <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #94a3b8" }} />
            <div style={{ fontSize: "10px", color: SLATE, fontWeight: 600, marginTop: "2px" }}>Summary</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "2px", height: "16px", backgroundColor: "#94a3b8" }} />
            <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #94a3b8" }} />
            <div style={{ fontSize: "10px", color: SLATE, fontWeight: 600, marginTop: "2px" }}>Detail</div>
          </div>
        </div>

        {/* Two branches */}
        <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "480px" }}>
          {/* Summary branch */}
          <div style={{
            flex: 1,
            backgroundColor: "#f0fdf4", border: "2px solid #059669",
            borderRadius: "10px", padding: "14px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#065f46", marginBottom: "8px" }}>Summary</div>
            <div style={{
              backgroundColor: "#059669", color: "white",
              borderRadius: "6px", padding: "6px 10px",
              fontSize: "11px", fontWeight: 700, textAlign: "center",
              marginBottom: "10px",
            }}>Approved Total</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {["One approved value", "Detail retained inside TDC", "Lineage preserved"].map(p => (
                <div key={p} style={{ display: "flex", gap: "5px" }}>
                  <span style={{ color: "#059669", fontSize: "11px" }}>✓</span>
                  <div style={{ fontSize: "11px", color: "#1e293b" }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail branch */}
          <div style={{
            flex: 1,
            backgroundColor: "#eff6ff", border: "2px solid #0369a1",
            borderRadius: "10px", padding: "14px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e3a5f", marginBottom: "8px" }}>Detail</div>
            <div style={{
              backgroundColor: "#0369a1", color: "white",
              borderRadius: "6px", padding: "6px 10px",
              fontSize: "11px", fontWeight: 700, textAlign: "center",
              marginBottom: "10px",
            }}>Detail Instances</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {["Multiple approved instances", "No aggregation", "IMS imports as received"].map(p => (
                <div key={p} style={{ display: "flex", gap: "5px" }}>
                  <span style={{ color: "#0369a1", fontSize: "11px" }}>✓</span>
                  <div style={{ fontSize: "11px", color: "#1e293b" }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Merge into IMS */}
        <div style={{ display: "flex", gap: "80px", marginTop: "8px" }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "2px", height: "16px", backgroundColor: "#94a3b8" }} />
              <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #94a3b8" }} />
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: `${ORANGE}15`, border: `2px solid ${ORANGE}`,
          borderRadius: "8px", padding: "10px 28px",
          fontSize: "13px", fontWeight: 700, color: ORANGE,
        }}>IMS</div>
        <Arrow />
        <div style={{
          backgroundColor: `${PURPLE}15`, border: `2px solid ${PURPLE}`,
          borderRadius: "8px", padding: "10px 28px",
          fontSize: "13px", fontWeight: 700, color: PURPLE,
        }}>Return Engine</div>
      </div>

      {/* Spec reference */}
      <div style={{
        marginTop: "16px", backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe", borderRadius: "8px",
        padding: "10px 14px", fontSize: "11px", color: "#1e3a5f",
      }}>
        <strong>Reference:</strong> See the Architecture Specification section below for the complete Approved Grain Model, including field-level grain assignments and the Summary vs Detail decision matrix.
      </div>
    </DiagramCard>
  );
}

// ─── Diagram 5: Platform Ownership Boundary ───────────────────────────────────
const OWNERSHIP_LAYERS = [
  {
    title: "Business Need",
    owner: "Process Team",
    color: "#475569",
    bg: "#f8fafc",
    items: ["Business rules", "Requirements"],
    icon: "👥",
  },
  {
    title: "DCT",
    owner: "DCT Platform",
    color: GREEN,
    bg: "#f0fdf4",
    items: ["Architecture", "APIs", "Data Contracts", "Assembly", "Gateway"],
    icon: "🏗",
  },
  {
    title: "IMS",
    owner: "IMS Layer",
    color: ORANGE,
    bg: "#fff7ed",
    items: ["Translation", "Transformation", "Routing"],
    icon: "⚙",
  },
  {
    title: "Return Engine",
    owner: "Engine",
    color: PURPLE,
    bg: "#faf5ff",
    items: ["Import", "Return Population", "Validation"],
    icon: "📋",
  },
];

function Diagram5() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <DiagramCard
      title="Who Owns What?"
      subtitle="Platform ownership boundary — layered responsibility model"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        {OWNERSHIP_LAYERS.map((layer, i) => (
          <div key={layer.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div
              onMouseEnter={() => setHovered(layer.title)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "100%",
                maxWidth: "520px",
                backgroundColor: hovered === layer.title ? layer.bg : "white",
                border: `2px solid ${hovered === layer.title ? layer.color : BORDER}`,
                borderRadius: "10px",
                padding: "12px 16px",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>{layer.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: NAVY }}>{layer.title}</div>
                    <div style={{
                      fontSize: "9px", fontWeight: 700, color: "white",
                      backgroundColor: layer.color, borderRadius: "4px", padding: "1px 6px",
                    }}>{layer.owner}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {layer.items.map(item => (
                      <div key={item} style={{
                        fontSize: "10px", color: layer.color,
                        border: `1px solid ${layer.color}`,
                        borderRadius: "4px", padding: "1px 7px",
                        backgroundColor: `${layer.color}10`,
                      }}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {i < OWNERSHIP_LAYERS.length - 1 && <Arrow />}
          </div>
        ))}
      </div>

      {/* Ownership Principle callout */}
      <div style={{
        marginTop: "20px",
        backgroundColor: "#fffbeb", border: "1px solid #fcd34d",
        borderRadius: "10px", padding: "14px 18px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Ownership Principle
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { who: "Process Team", what: "defines what the business needs.", color: "#475569" },
            { who: "DCT", what: "determines how those requirements fit within the platform.", color: GREEN },
            { who: "IMS", what: "translates and routes governed data.", color: ORANGE },
            { who: "Return Engines", what: "consume the translated payload.", color: PURPLE },
          ].map(p => (
            <div key={p.who} style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>
              <strong style={{ color: p.color }}>{p.who}</strong> {p.what}
            </div>
          ))}
        </div>
      </div>
    </DiagramCard>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function IMSArchitectureDiagrams() {
  const TABS = [
    { id: "arch", label: "High-Level Architecture" },
    { id: "swimlane", label: "Ownership Swimlane" },
    { id: "flow", label: "Data Flow" },
    { id: "grain", label: "Approved Grain" },
    { id: "boundary", label: "Who Owns What?" },
  ];
  const [activeTab, setActiveTab] = useState("arch");

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: "4px", flexWrap: "wrap",
        marginBottom: "16px",
        borderBottom: `2px solid ${BORDER}`,
        paddingBottom: "0",
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: "11px", fontWeight: 700,
              padding: "7px 14px",
              backgroundColor: activeTab === tab.id ? NAVY : "transparent",
              color: activeTab === tab.id ? "white" : SLATE,
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${NAVY}` : "2px solid transparent",
              cursor: "pointer",
              borderRadius: "6px 6px 0 0",
              transition: "all 0.15s",
              marginBottom: "-2px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active diagram */}
      {activeTab === "arch"     && <Diagram1 />}
      {activeTab === "swimlane" && <Diagram2 />}
      {activeTab === "flow"     && <Diagram3 />}
      {activeTab === "grain"    && <Diagram4 />}
      {activeTab === "boundary" && <Diagram5 />}
    </div>
  );
}

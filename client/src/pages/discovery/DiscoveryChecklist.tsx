import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";


interface CheckItem {
  id: string;
  label: string;
  category: string;
  categoryColor: string;
  tooltip: string;
}

const CHECKLIST: CheckItem[] = [
  { id: "c1",  label: "Business objective defined",          category: "Business",   categoryColor: "#1e3a5f", tooltip: "Clearly articulate what business problem this story solves and what the expected outcome is." },
  { id: "c2",  label: "TDC owner identified",               category: "TDC",        categoryColor: "#065f46", tooltip: "Identify which TDC team/domain owns the object or API involved in this story." },
  { id: "c3",  label: "Data owner confirmed",               category: "Data",       categoryColor: "#0369a1", tooltip: "Confirm who owns the data — PDC or TDC — and that the correct team has been consulted." },
  { id: "c4",  label: "APIs identified",                    category: "API",        categoryColor: "#0369a1", tooltip: "Identify both the Read API and Update API (if applicable) for the TDC object involved." },
  { id: "c5",  label: "Required fields documented",         category: "Data",       categoryColor: "#0369a1", tooltip: "List all required fields for the TDC object and confirm which are mandatory vs optional." },
  { id: "c6",  label: "Validation rules documented",        category: "API",        categoryColor: "#0369a1", tooltip: "Document all validation rules the TDC API enforces — these become acceptance criteria." },
  { id: "c7",  label: "Error handling documented",          category: "API",        categoryColor: "#0369a1", tooltip: "Document all error responses the API can return and how Roger should display them to the user." },
  { id: "c8",  label: "UI behavior documented",             category: "Roger",      categoryColor: "#7c3aed", tooltip: "Document the screen layout, actions, buttons, save behavior, and validation message display." },
  { id: "c9",  label: "Security documented",                category: "API",        categoryColor: "#0369a1", tooltip: "Confirm authentication requirements, role-based access, and any field-level security rules." },
  { id: "c10", label: "Audit requirements captured",        category: "Downstream", categoryColor: "#92400e", tooltip: "Identify what audit records must be created when this action is performed." },
  { id: "c11", label: "Lineage reviewed",                   category: "TDC",        categoryColor: "#065f46", tooltip: "Confirm how the lineage record is updated when this data changes and who can trace it." },
  { id: "c12", label: "Downstream impacts understood",      category: "Downstream", categoryColor: "#92400e", tooltip: "Identify all downstream systems (GoSystem, state, provision, reporting) affected by this change." },
  { id: "c13", label: "Acceptance Criteria complete",       category: "Story",      categoryColor: "#0f1623", tooltip: "Write complete Given/When/Then acceptance criteria covering happy path, errors, and edge cases." },
];

const CATEGORIES = ["Business", "TDC", "Data", "API", "Roger", "Downstream", "Story"];
const CATEGORY_COLORS: Record<string, string> = {
  "Business": "#1e3a5f",
  "TDC": "#065f46",
  "Data": "#0369a1",
  "API": "#0369a1",
  "Roger": "#7c3aed",
  "Downstream": "#92400e",
  "Story": "#0f1623",
};

const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #discovery-checklist-print, #discovery-checklist-print * { visibility: visible !important; }
    #discovery-checklist-print { position: fixed; top: 0; left: 0; width: 100%; padding: 24px 32px; }
    .no-print { display: none !important; }
    .print-page-break { page-break-before: always; }
    @page { margin: 1.5cm; size: A4; }
  }
`;

export default function DiscoveryChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [storyName, setStoryName] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [baName, setBAName] = useState("");

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkAll = () => setChecked(new Set(CHECKLIST.map(c => c.id)));
  const clearAll = () => setChecked(new Set());

  const progress = Math.round((checked.size / CHECKLIST.length) * 100);
  const isComplete = checked.size === CHECKLIST.length;

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    items: CHECKLIST.filter(c => c.category === cat),
    color: CATEGORY_COLORS[cat],
  })).filter(g => g.items.length > 0);

  const handlePrint = () => {
    // Inject print styles if not already present
    const styleId = "discovery-print-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = PRINT_STYLES;
      document.head.appendChild(style);
    }
    window.print();
  };

  const printDate = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div id="discovery-checklist-print" style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Print header — only visible when printing */}
      <div style={{ display: "none" }} className="print-only" id="print-header">
        <div style={{ borderBottom: "2px solid #0f1623", paddingBottom: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f1623" }}>DCT Platform — Story Readiness Checklist</div>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>RSM · CATT · Discovery Center · Sprint Ceremony Artifact</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "11px", color: "#64748b" }}>
              <div>Printed: {printDate}</div>
              {baName && <div>BA: {baName}</div>}
              {sprintName && <div>Sprint: {sprintName}</div>}
            </div>
          </div>
          {storyName && (
            <div style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", borderLeft: "3px solid #1e3a5f" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Story / Feature: </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{storyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Screen header */}
      <div style={{ marginBottom: "24px" }} className="no-print">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>☑</span>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Discovery Checklist</h1>
          </div>
          {/* Export button */}
          <button
            onClick={handlePrint}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "6px", border: "none",
              backgroundColor: "#1e3a5f", color: "white",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#0f1623"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#1e3a5f"}
          >
            <span style={{ fontSize: "14px" }}>⬇</span>
            Export / Print PDF
          </button>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
          Use this checklist before writing any Roger user story. All 13 items must be checked before a story is considered ready for development.
        </p>
      </div>

      {/* Artifact metadata inputs (screen only) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }} className="no-print">
        {[
          { label: "Story / Feature Name", value: storyName, setter: setStoryName, placeholder: "e.g., B9 — Roger Account Mapping" },
          { label: "Sprint Name", value: sprintName, setter: setSprintName, placeholder: "e.g., PI3 Sprint 1" },
          { label: "BA Name", value: baName, setter: setBAName, placeholder: "e.g., Jenniver" },
        ].map(field => (
          <div key={field.label}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px" }}>
              {field.label}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={e => field.setter(e.target.value)}
              placeholder={field.placeholder}
              style={{
                width: "100%", padding: "7px 10px", borderRadius: "6px",
                border: "1px solid #e2e8f0", fontSize: "12px", color: "#0f1623",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      {/* Print-visible story name */}
      {storyName && (
        <div style={{ display: "none" }} className="print-story-name">
          <div style={{ marginBottom: "16px", padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", borderLeft: "3px solid #1e3a5f" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Story: </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{storyName}</span>
            {sprintName && <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "16px" }}>Sprint: {sprintName}</span>}
            {baName && <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "16px" }}>BA: {baName}</span>}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        backgroundColor: isComplete ? "#f0fdf4" : "white",
        border: `1px solid ${isComplete ? "#059669" : "#e2e8f0"}`,
        borderRadius: "10px", padding: "16px 20px", marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: isComplete ? "#059669" : "#0f1623" }}>
              {isComplete ? "✓ Checklist Complete — Story is Ready" : `${checked.size} of ${CHECKLIST.length} items complete`}
            </div>
            {storyName && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{storyName}</div>}
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: isComplete ? "#059669" : "#1e3a5f" }}>{progress}%</div>
        </div>
        <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            backgroundColor: isComplete ? "#059669" : "#3b82f6",
            borderRadius: "4px", transition: "width 0.3s ease",
          }} />
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }} className="no-print">
          <button
            onClick={checkAll}
            style={{
              fontSize: "11px", padding: "4px 10px", borderRadius: "4px", border: "none",
              cursor: "pointer", backgroundColor: "#059669", color: "white", fontWeight: 600,
            }}
          >
            Check All
          </button>
          <button
            onClick={clearAll}
            style={{
              fontSize: "11px", padding: "4px 10px", borderRadius: "4px",
              border: "1px solid #e2e8f0", cursor: "pointer", backgroundColor: "transparent",
              color: "#64748b", fontWeight: 600,
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Checklist by category */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {byCategory.map(({ cat, items, color }) => {
          const catChecked = items.filter(i => checked.has(i.id)).length;
          return (
            <div key={cat} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
              overflow: "hidden", borderLeft: `3px solid ${color}`,
            }}>
              {/* Category header */}
              <div style={{
                padding: "10px 16px", backgroundColor: "#f8fafc",
                borderBottom: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color, flex: 1 }}>{cat}</div>
                <div style={{
                  fontSize: "10px", padding: "2px 7px", borderRadius: "10px",
                  backgroundColor: catChecked === items.length ? "#f0fdf4" : "#f1f5f9",
                  color: catChecked === items.length ? "#059669" : "#64748b",
                  fontWeight: 700,
                }}>
                  {catChecked}/{items.length}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: "8px 0" }}>
                {items.map(item => {
                  const isChecked = checked.has(item.id);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "12px",
                        padding: "8px 16px", cursor: "pointer",
                        backgroundColor: isChecked ? "#f0fdf4" : "transparent",
                        transition: "background-color 0.15s",
                        position: "relative",
                      }}
                      onClick={() => toggle(item.id)}
                      onMouseEnter={() => setHoveredTooltip(item.id)}
                      onMouseLeave={() => setHoveredTooltip(null)}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "4px",
                        border: `2px solid ${isChecked ? "#059669" : "#cbd5e1"}`,
                        backgroundColor: isChecked ? "#059669" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "1px", transition: "all 0.15s",
                      }}>
                        {isChecked && <span style={{ color: "white", fontSize: "12px", fontWeight: 900 }}>✓</span>}
                      </div>

                      {/* Label */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "13px", color: isChecked ? "#065f46" : "#334155",
                          fontWeight: isChecked ? 600 : 400,
                        }}>
                          {item.label}
                        </div>

                        {/* Tooltip on hover (screen only) */}
                        {hoveredTooltip === item.id && (
                          <div className="no-print" style={{
                            fontSize: "11px", color: "#475569", marginTop: "4px",
                            lineHeight: "1.5", padding: "6px 10px",
                            backgroundColor: "#f8fafc", borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}>
                            {item.tooltip}
                          </div>
                        )}
                        {/* Tooltip always visible on print */}
                        <div className="print-tooltip" style={{ display: "none", fontSize: "10px", color: "#64748b", marginTop: "3px", lineHeight: "1.4" }}>
                          {item.tooltip}
                        </div>
                      </div>

                      {/* Category tag */}
                      <span style={{
                        fontSize: "9px", padding: "1px 5px", borderRadius: "3px",
                        backgroundColor: `${color}15`, color, fontWeight: 700, flexShrink: 0,
                      }}>
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {isComplete && (
        <div style={{
          marginTop: "24px", padding: "20px 24px",
          backgroundColor: "#f0fdf4", border: "2px solid #059669",
          borderRadius: "10px", textAlign: "center",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>✓</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#065f46", marginBottom: "4px" }}>
            {storyName ? `"${storyName}" is Ready` : "Story is Ready for Development"}
          </div>
          <div style={{ fontSize: "13px", color: "#059669" }}>
            All 13 discovery items are complete. This story is ready to be written and submitted to the backlog.
          </div>
        </div>
      )}

      {/* Print footer */}
      <div style={{ display: "none" }} className="print-footer">
        <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8" }}>
          <span>DCT Platform — Story Readiness Artifact · RSM CATT</span>
          <span>{printDate}</span>
        </div>
      </div>

      {/* Inject print CSS into page head via style tag rendered in DOM */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-tooltip { display: block !important; }
          .print-footer { display: block !important; }
          .print-story-name { display: block !important; }
          #print-header { display: block !important; }
          body > *:not(#discovery-checklist-print) { display: none !important; }
          #discovery-checklist-print { display: block !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
      <DiscoveryAskBuddy pagePath="/discovery/checklist" pageTitle="Discovery Checklist" />
    </div>
  );
}

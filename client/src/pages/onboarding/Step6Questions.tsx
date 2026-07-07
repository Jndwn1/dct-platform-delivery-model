// Step6Questions.tsx
// Discovery Hub Step 6 — Requirements Discovery
// BAs capture: Business Need, Existing Capability, Gap, Recommendation, Dependency, Questions, Potential Enhancement

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const DISCOVERY_CATEGORIES = [
  { id: "provision", label: "Provision Workstream", color: "#7c3aed", icon: "📊" },
  { id: "state", label: "State Filing", color: "#b45309", icon: "🗺️" },
  { id: "gosystem", label: "GoSystem Integration", color: "#be185d", icon: "🖥️" },
  { id: "roger", label: "Roger / Practitioner UI", color: "#0369a1", icon: "👤" },
  { id: "tdc", label: "TDC / Tax Data Consolidation", color: "#065f46", icon: "⚙️" },
  { id: "gateway", label: "Gateway / API Access", color: "#1e3a5f", icon: "🔐" },
  { id: "other", label: "Other / General", color: "#64748b", icon: "💬" },
];

type DiscoveryEntry = {
  id: string;
  category: string;
  businessNeed: string;
  existingCapability: string;
  gap: string;
  recommendation: string;
  dependency: string;
  questions: string;
  potentialEnhancement: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Answered" | "Deferred";
};

const STORAGE_KEY = "onboarding-discovery-questions";

function loadEntries(): DiscoveryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DiscoveryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const EMPTY_FORM = {
  category: "provision",
  businessNeed: "",
  existingCapability: "",
  gap: "",
  recommendation: "",
  dependency: "",
  questions: "",
  potentialEnhancement: "",
  priority: "Medium" as const,
};

export default function Step6Questions() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<DiscoveryEntry[]>(loadEntries);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canProceed = entries.length >= 1;

  function updateForm(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addEntry() {
    if (!form.businessNeed.trim()) return;
    const entry: DiscoveryEntry = {
      id: `de-${Date.now()}`,
      ...form,
      status: "Open",
    };
    const updated = [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
    setForm(EMPTY_FORM);
  }

  function updateStatus(id: string, status: DiscoveryEntry["status"]) {
    const updated = entries.map(e => e.id === id ? { ...e, status } : e);
    setEntries(updated);
    saveEntries(updated);
  }

  function removeEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  }

  function exportToText() {
    const lines = ["DCT Provision & State Discovery Hub — Requirements Discovery", "=".repeat(60), ""];
    DISCOVERY_CATEGORIES.forEach(cat => {
      const catEntries = entries.filter(e => e.category === cat.id);
      if (catEntries.length === 0) return;
      lines.push(`## ${cat.label}`);
      catEntries.forEach((e, i) => {
        lines.push(`\n### Entry ${i + 1} — [${e.priority}] [${e.status}]`);
        lines.push(`Business Need: ${e.businessNeed}`);
        if (e.existingCapability) lines.push(`Existing Capability: ${e.existingCapability}`);
        if (e.gap) lines.push(`Gap: ${e.gap}`);
        if (e.recommendation) lines.push(`Recommendation: ${e.recommendation}`);
        if (e.dependency) lines.push(`Dependency: ${e.dependency}`);
        if (e.questions) lines.push(`Questions: ${e.questions}`);
        if (e.potentialEnhancement) lines.push(`Potential Enhancement: ${e.potentialEnhancement}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DCT_Requirements_Discovery.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleContinue() {
    markStepComplete("step6-questions");
    navigate("/onboarding/step7");
  }

  const filtered = filterCat === "all" ? entries : entries.filter(e => e.category === filterCat);
  const openCount = entries.filter(e => e.status === "Open").length;
  const answeredCount = entries.filter(e => e.status === "Answered").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Provision &amp; State Discovery Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 6 — Requirements Discovery</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 6px" }}>
            📝 Requirements Discovery
          </h1>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
            Document findings from the capability review. For each business need, capture the existing capability,
            any identified gap, your recommendation, dependencies, open questions, and potential enhancements.
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={exportToText}
            style={{
              fontSize: "12px", fontWeight: 600, color: "#1e3a5f",
              backgroundColor: "white", border: "1px solid #1e3a5f",
              borderRadius: "7px", padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            ↓ Export Discovery
          </button>
        )}
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total", value: entries.length, color: "#1e3a5f" },
            { label: "Open", value: openCount, color: "#dc2626" },
            { label: "Answered", value: answeredCount, color: "#059669" },
            { label: "Deferred", value: entries.length - openCount - answeredCount, color: "#d97706" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "10px 16px", backgroundColor: "white",
              border: "1px solid #e2e8f0", borderRadius: "8px", textAlign: "center",
            }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add entry form */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "18px 20px", marginBottom: "20px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "14px" }}>
          + Add Discovery Entry
        </div>

        {/* Category + Priority row */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <select
            value={form.category}
            onChange={e => updateForm("category", e.target.value)}
            style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f1623", backgroundColor: "white" }}
          >
            {DISCOVERY_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            value={form.priority}
            onChange={e => updateForm("priority", e.target.value)}
            style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#0f1623", backgroundColor: "white" }}
          >
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>

        {/* Discovery fields */}
        {[
          { field: "businessNeed" as const, label: "Business Need *", placeholder: "What business need or requirement are you trying to address?", required: true },
          { field: "existingCapability" as const, label: "Existing Capability", placeholder: "Does DCT already support this? Which Feature / Batch / API?" },
          { field: "gap" as const, label: "Gap", placeholder: "What gap exists between the existing capability and the business need?" },
          { field: "recommendation" as const, label: "Recommendation", placeholder: "What do you recommend? (Enhancement, new requirement, or accept existing capability)" },
          { field: "dependency" as const, label: "Dependency", placeholder: "What dependencies exist? (Other batches, systems, teams)" },
          { field: "questions" as const, label: "Questions", placeholder: "What open questions need to be answered before writing requirements?" },
          { field: "potentialEnhancement" as const, label: "Potential Enhancement", placeholder: "If a gap exists, describe the potential enhancement to DCT" },
        ].map(({ field, label, placeholder, required }) => (
          <div key={field} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {label}
            </div>
            <textarea
              value={form[field]}
              onChange={e => updateForm(field, e.target.value)}
              placeholder={placeholder}
              rows={2}
              style={{
                width: "100%", padding: "8px 10px", fontSize: "13px",
                border: `1px solid ${required && !form[field] ? "#fca5a5" : "#e2e8f0"}`,
                borderRadius: "6px", outline: "none", color: "#0f1623",
                resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <button
          onClick={addEntry}
          disabled={!form.businessNeed.trim()}
          style={{
            padding: "9px 20px", fontSize: "13px", fontWeight: 700,
            backgroundColor: form.businessNeed.trim() ? "#1e3a5f" : "#94a3b8",
            color: "white", border: "none", borderRadius: "6px",
            cursor: form.businessNeed.trim() ? "pointer" : "not-allowed",
          }}
        >
          Add Discovery Entry
        </button>
      </div>

      {/* Filter */}
      {entries.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterCat("all")}
            style={{
              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "5px",
              border: "none", cursor: "pointer",
              backgroundColor: filterCat === "all" ? "#1e3a5f" : "#f1f5f9",
              color: filterCat === "all" ? "white" : "#64748b",
            }}
          >
            All ({entries.length})
          </button>
          {DISCOVERY_CATEGORIES.filter(c => entries.some(e => e.category === c.id)).map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              style={{
                fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "5px",
                border: "none", cursor: "pointer",
                backgroundColor: filterCat === c.id ? c.color : "#f1f5f9",
                color: filterCat === c.id ? "white" : "#64748b",
              }}
            >
              {c.icon} {c.label} ({entries.filter(e => e.category === c.id).length})
            </button>
          ))}
        </div>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "32px", backgroundColor: "#f8fafc",
          border: "1px dashed #e2e8f0", borderRadius: "10px",
          fontSize: "14px", color: "#94a3b8",
        }}>
          {entries.length === 0
            ? "No discovery entries yet. Add your first entry above."
            : "No entries in this category."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(entry => {
            const cat = DISCOVERY_CATEGORIES.find(c => c.id === entry.category)!;
            const priorityColor = entry.priority === "High" ? "#dc2626" : entry.priority === "Medium" ? "#d97706" : "#059669";
            const statusColor = entry.status === "Open" ? "#dc2626" : entry.status === "Answered" ? "#059669" : "#d97706";
            const isExpanded = expandedId === entry.id;

            return (
              <div key={entry.id} style={{
                backgroundColor: "white", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "12px 16px",
                borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: `${cat.color}15`, color: cat.color }}>
                        {cat.icon} {cat.label}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: `${priorityColor}15`, color: priorityColor }}>
                        {entry.priority}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: `${statusColor}15`, color: statusColor }}>
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, lineHeight: "1.5", marginBottom: "4px" }}>
                      Business Need: {entry.businessNeed}
                    </div>
                    {isExpanded && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                        {[
                          { label: "Existing Capability", value: entry.existingCapability },
                          { label: "Gap", value: entry.gap },
                          { label: "Recommendation", value: entry.recommendation },
                          { label: "Dependency", value: entry.dependency },
                          { label: "Questions", value: entry.questions },
                          { label: "Potential Enhancement", value: entry.potentialEnhancement },
                        ].filter(f => f.value).map(f => (
                          <div key={f.label} style={{ fontSize: "12px", color: "#475569" }}>
                            <strong style={{ color: "#334155" }}>{f.label}:</strong> {f.value}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      style={{ fontSize: "11px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: "4px 0 0 0" }}
                    >
                      {isExpanded ? "▲ Collapse" : "▼ View Details"}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <select
                      value={entry.status}
                      onChange={e => updateStatus(entry.id, e.target.value as DiscoveryEntry["status"])}
                      style={{ fontSize: "11px", padding: "4px 6px", border: "1px solid #e2e8f0", borderRadius: "5px", color: "#0f1623", backgroundColor: "white" }}
                    >
                      <option value="Open">Open</option>
                      <option value="Answered">Answered</option>
                      <option value="Deferred">Deferred</option>
                    </select>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      style={{ fontSize: "11px", padding: "4px 8px", border: "1px solid #fecaca", borderRadius: "5px", cursor: "pointer", backgroundColor: "#fef2f2", color: "#dc2626" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue */}
      <div style={{
        marginTop: "20px", padding: "14px 18px",
        backgroundColor: canProceed ? "#f0fdf4" : "#f8fafc",
        border: `1px solid ${canProceed ? "#86efac" : "#e2e8f0"}`,
        borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: "13px", color: canProceed ? "#065f46" : "#64748b" }}>
          {canProceed
            ? `✓ ${entries.length} discovery entr${entries.length === 1 ? "y" : "ies"} captured — you're ready to complete discovery.`
            : "Add at least 1 discovery entry to unlock the final step."}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/onboarding/step5")}
            style={{
              fontSize: "13px", fontWeight: 600, color: "#64748b",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canProceed}
            style={{
              fontSize: "13px", fontWeight: 700, color: "white",
              backgroundColor: canProceed ? "#059669" : "#94a3b8",
              border: "none", borderRadius: "7px", padding: "9px 20px",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            ✓ Complete Discovery →
          </button>
        </div>
      </div>
    </div>
  );
}

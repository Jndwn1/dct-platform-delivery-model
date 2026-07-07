// Step6Questions.tsx
// Onboarding Step 6 — Capture Discovery Questions
// BAs capture open questions, gaps, and items to clarify before story writing

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const QUESTION_CATEGORIES = [
  { id: "gosystem", label: "GoSystem Integration", color: "#be185d", icon: "🖥️" },
  { id: "roger", label: "Roger / Practitioner UI", color: "#0369a1", icon: "👤" },
  { id: "tdc", label: "TDC / Tax Data Consolidation", color: "#065f46", icon: "⚙️" },
  { id: "provision", label: "Provision Workstream", color: "#7c3aed", icon: "📊" },
  { id: "state", label: "State Filing", color: "#b45309", icon: "🗺️" },
  { id: "gateway", label: "Gateway / API Access", color: "#1e3a5f", icon: "🔐" },
  { id: "other", label: "Other / General", color: "#64748b", icon: "💬" },
];

type Question = {
  id: string;
  category: string;
  text: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Answered" | "Deferred";
  notes: string;
};

const STORAGE_KEY = "onboarding-discovery-questions";

function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQuestions(qs: Question[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
}

export default function Step6Questions() {
  const [, navigate] = useLocation();
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("gosystem");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [filterCat, setFilterCat] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const canProceed = questions.length >= 1;

  function addQuestion() {
    if (!newText.trim()) return;
    const q: Question = {
      id: `q-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
      priority: newPriority,
      status: "Open",
      notes: "",
    };
    const updated = [...questions, q];
    setQuestions(updated);
    saveQuestions(updated);
    setNewText("");
  }

  function updateStatus(id: string, status: Question["status"]) {
    const updated = questions.map(q => q.id === id ? { ...q, status } : q);
    setQuestions(updated);
    saveQuestions(updated);
  }

  function saveNotes(id: string) {
    const updated = questions.map(q => q.id === id ? { ...q, notes: editNotes } : q);
    setQuestions(updated);
    saveQuestions(updated);
    setEditingId(null);
  }

  function removeQuestion(id: string) {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
  }

  function exportToText() {
    const lines = ["DCT Onboarding — Discovery Questions", "=".repeat(50), ""];
    QUESTION_CATEGORIES.forEach(cat => {
      const catQs = questions.filter(q => q.category === cat.id);
      if (catQs.length === 0) return;
      lines.push(`## ${cat.label}`);
      catQs.forEach((q, i) => {
        lines.push(`${i + 1}. [${q.priority}] [${q.status}] ${q.text}`);
        if (q.notes) lines.push(`   Notes: ${q.notes}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DCT_Discovery_Questions.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleContinue() {
    markStepComplete("step6-questions");
    navigate("/onboarding/step7");
  }

  const filtered = filterCat === "all" ? questions : questions.filter(q => q.category === filterCat);
  const openCount = questions.filter(q => q.status === "Open").length;
  const answeredCount = questions.filter(q => q.status === "Answered").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Onboarding Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 6 — Discovery Questions</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 6px" }}>
            📝 Capture Discovery Questions
          </h1>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" }}>
            Record open questions, gaps, and items to clarify before writing stories.
            These will be saved and available throughout your onboarding.
          </p>
        </div>
        {questions.length > 0 && (
          <button
            onClick={exportToText}
            style={{
              fontSize: "12px", fontWeight: 600, color: "#1e3a5f",
              backgroundColor: "white", border: "1px solid #1e3a5f",
              borderRadius: "7px", padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            ↓ Export Questions
          </button>
        )}
      </div>

      {/* Stats */}
      {questions.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total", value: questions.length, color: "#1e3a5f" },
            { label: "Open", value: openCount, color: "#dc2626" },
            { label: "Answered", value: answeredCount, color: "#059669" },
            { label: "Deferred", value: questions.length - openCount - answeredCount, color: "#d97706" },
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

      {/* Add question form */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "16px 20px", marginBottom: "20px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "12px" }}>
          + Add a Discovery Question
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={{
              padding: "8px 10px", fontSize: "12px", border: "1px solid #e2e8f0",
              borderRadius: "6px", color: "#0f1623", backgroundColor: "white",
            }}
          >
            {QUESTION_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as "High" | "Medium" | "Low")}
            style={{
              padding: "8px 10px", fontSize: "12px", border: "1px solid #e2e8f0",
              borderRadius: "6px", color: "#0f1623", backgroundColor: "white",
            }}
          >
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addQuestion()}
            placeholder="Type your discovery question..."
            style={{
              flex: 1, padding: "9px 12px", fontSize: "13px",
              border: "1px solid #e2e8f0", borderRadius: "6px",
              outline: "none", color: "#0f1623",
            }}
          />
          <button
            onClick={addQuestion}
            disabled={!newText.trim()}
            style={{
              padding: "9px 18px", fontSize: "13px", fontWeight: 700,
              backgroundColor: newText.trim() ? "#1e3a5f" : "#94a3b8",
              color: "white", border: "none", borderRadius: "6px",
              cursor: newText.trim() ? "pointer" : "not-allowed",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Filter */}
      {questions.length > 0 && (
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
            All ({questions.length})
          </button>
          {QUESTION_CATEGORIES.filter(c => questions.some(q => q.category === c.id)).map(c => (
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
              {c.icon} {c.label} ({questions.filter(q => q.category === c.id).length})
            </button>
          ))}
        </div>
      )}

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "32px", backgroundColor: "#f8fafc",
          border: "1px dashed #e2e8f0", borderRadius: "10px",
          fontSize: "14px", color: "#94a3b8",
        }}>
          {questions.length === 0
            ? "No questions yet. Add your first discovery question above."
            : "No questions in this category."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(q => {
            const cat = QUESTION_CATEGORIES.find(c => c.id === q.category)!;
            const priorityColor = q.priority === "High" ? "#dc2626" : q.priority === "Medium" ? "#d97706" : "#059669";
            const statusColor = q.status === "Answered" ? "#059669" : q.status === "Deferred" ? "#d97706" : "#dc2626";
            return (
              <div key={q.id} style={{
                backgroundColor: "white", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "12px 16px",
                borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        backgroundColor: `${cat.color}15`, color: cat.color,
                      }}>
                        {cat.icon} {cat.label}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        backgroundColor: `${priorityColor}15`, color: priorityColor,
                      }}>
                        {q.priority}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        backgroundColor: `${statusColor}15`, color: statusColor,
                      }}>
                        {q.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, lineHeight: "1.5" }}>
                      {q.text}
                    </div>
                    {q.notes && (
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>
                        Notes: {q.notes}
                      </div>
                    )}
                    {editingId === q.id && (
                      <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                        <input
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="Add notes..."
                          style={{
                            flex: 1, padding: "6px 10px", fontSize: "12px",
                            border: "1px solid #e2e8f0", borderRadius: "5px", outline: "none",
                          }}
                        />
                        <button
                          onClick={() => saveNotes(q.id)}
                          style={{
                            padding: "6px 12px", fontSize: "12px", fontWeight: 600,
                            backgroundColor: "#059669", color: "white", border: "none",
                            borderRadius: "5px", cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <select
                      value={q.status}
                      onChange={e => updateStatus(q.id, e.target.value as Question["status"])}
                      style={{
                        fontSize: "11px", padding: "4px 6px", border: "1px solid #e2e8f0",
                        borderRadius: "5px", color: "#0f1623", backgroundColor: "white",
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="Answered">Answered</option>
                      <option value="Deferred">Deferred</option>
                    </select>
                    <button
                      onClick={() => { setEditingId(editingId === q.id ? null : q.id); setEditNotes(q.notes); }}
                      style={{
                        fontSize: "11px", padding: "4px 8px", border: "1px solid #e2e8f0",
                        borderRadius: "5px", cursor: "pointer", backgroundColor: "white", color: "#64748b",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      style={{
                        fontSize: "11px", padding: "4px 8px", border: "1px solid #fecaca",
                        borderRadius: "5px", cursor: "pointer", backgroundColor: "#fef2f2", color: "#dc2626",
                      }}
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
            ? `✓ ${questions.length} question${questions.length === 1 ? "" : "s"} captured — you're ready to complete your onboarding.`
            : "Add at least 1 discovery question to unlock the final step."}
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
            ✓ Complete Onboarding →
          </button>
        </div>
      </div>
    </div>
  );
}

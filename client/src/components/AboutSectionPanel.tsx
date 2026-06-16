// AboutSectionPanel — Reusable onboarding context card
// Appears at the top of BA & Requirements, Roger UI, Governance, and Architecture & Diagrams sections
// Design: matches existing platform styling (navy/slate/green), collapsible, Ask Buddy integrated

import { useState } from "react";
import { useLocation } from "wouter";
import { Info, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

export interface AboutSectionPanelProps {
  section: string;           // Section title, e.g. "BA & Requirements"
  purpose: string;           // What this section contains
  whenToUse: string[];       // Bullet list of scenarios
  whoUsesIt: string[];       // Audience list
  askBuddyPrompt: string;    // Pre-filled Ask Buddy prompt
  defaultOpen?: boolean;     // Whether the panel starts expanded (default: true)
}

export default function AboutSectionPanel({
  section,
  purpose,
  whenToUse,
  whoUsesIt,
  askBuddyPrompt,
  defaultOpen = true,
}: AboutSectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [, navigate] = useLocation();

  function handleAskBuddy() {
    // Encode the prompt and navigate to Ask Buddy with it pre-filled
    const encoded = encodeURIComponent(askBuddyPrompt);
    navigate(`/ask-buddy?prompt=${encoded}`);
  }

  return (
    <div style={{
      backgroundColor: "#f0f7ff",
      border: "1px solid #bfdbfe",
      borderLeft: "4px solid #1e3a5f",
      borderRadius: "10px",
      marginBottom: "24px",
      overflow: "hidden",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={16} color="#1e3a5f" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e3a5f", letterSpacing: "0.02em" }}>
            About This Section
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "#3b82f6",
            backgroundColor: "#dbeafe", borderRadius: "4px", padding: "1px 7px",
          }}>
            {section}
          </span>
        </div>
        <div style={{ color: "#64748b", flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{ padding: "0 18px 16px 18px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "14px",
          }}>
            {/* Purpose */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Purpose
              </div>
              <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", margin: 0 }}>
                {purpose}
              </p>
            </div>

            {/* When to Use It */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                When to Use It
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#334155", lineHeight: "1.7" }}>
                {whenToUse.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Who Uses It */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Who Uses It
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#334155", lineHeight: "1.7" }}>
                {whoUsesIt.map((role, i) => (
                  <li key={i}>{role}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Need Help / Ask Buddy */}
          <div style={{
            backgroundColor: "#fff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1 }}>
              <MessageCircle size={15} color="#2563eb" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e3a5f" }}>Need Help? </span>
                <span style={{ fontSize: "12px", color: "#475569" }}>
                  If you are unsure where to start, Ask Buddy can help identify the correct section, document, feature, workflow, or architecture artifact.
                </span>
              </div>
            </div>
            <button
              onClick={handleAskBuddy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#1e3a5f",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <MessageCircle size={13} />
              Ask Buddy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

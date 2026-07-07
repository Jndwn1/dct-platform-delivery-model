// ContextAwarenessPanel.tsx
// Persistent context panel that automatically surfaces relevant features, APIs,
// stories, screens, business rules, batches, business objects, and integrations
// based on the user's current location in the DCT Platform.
// Renders as a collapsible right-side drawer anchored to the layout.

import { useState } from "react";
import { useGlobalPageContext } from "@/contexts/GlobalPageContext";
import { Link } from "wouter";

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  features:       { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  apis:           { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e" },
  stories:        { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff", dot: "#a855f7" },
  screens:        { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", dot: "#f97316" },
  businessRules:  { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", dot: "#ef4444" },
  batches:        { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd", dot: "#0ea5e9" },
  businessObjects:{ bg: "#fefce8", text: "#713f12", border: "#fde68a", dot: "#eab308" },
  integrations:   { bg: "#f0fdf4", text: "#065f46", border: "#a7f3d0", dot: "#10b981" },
};

interface SectionProps {
  title: string;
  items: string[];
  colorKey: string;
  defaultOpen?: boolean;
}

function ContextSection({ title, items, colorKey, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const c = SECTION_COLORS[colorKey] ?? SECTION_COLORS.features;

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: "8px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "5px 8px", borderRadius: "5px", border: `1px solid ${c.border}`,
          backgroundColor: c.bg, cursor: "pointer",
          fontSize: "11px", fontWeight: 700, color: c.text,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: c.dot, flexShrink: 0, display: "inline-block" }} />
          {title}
          <span style={{
            marginLeft: "4px", backgroundColor: c.dot, color: "white",
            borderRadius: "10px", padding: "0 5px", fontSize: "10px", fontWeight: 700,
          }}>
            {items.length}
          </span>
        </span>
        <span style={{ fontSize: "10px", color: c.text, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          marginTop: "3px", padding: "6px 8px",
          backgroundColor: "white", border: `1px solid ${c.border}`,
          borderRadius: "5px",
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "6px",
              padding: "3px 0",
              borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              <span style={{ color: c.dot, fontSize: "10px", marginTop: "2px", flexShrink: 0 }}>•</span>
              <span style={{ fontSize: "11px", color: "#374151", lineHeight: "1.4" }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContextAwarenessPanel() {
  const { pageContext, currentPath } = useGlobalPageContext();
  const [collapsed, setCollapsed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Don't render on sign-in or 404 pages
  if (currentPath === "/signin" || currentPath === "/404") return null;

  // Collapsed tab (always visible)
  if (!panelOpen) {
    return (
      <div
        style={{
          position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
          zIndex: 100,
          backgroundColor: "#0f1623", color: "white",
          borderRadius: "8px 0 0 8px",
          padding: "12px 6px",
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          boxShadow: "-2px 0 12px rgba(0,0,0,0.15)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
        }}
        onClick={() => setPanelOpen(true)}
        title="Open Context Panel"
      >
        <span style={{ transform: "rotate(180deg)" }}>◀</span>
        <span>CONTEXT</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", right: 0, top: "64px", bottom: 0,
        width: collapsed ? "40px" : "260px",
        zIndex: 90,
        backgroundColor: "#ffffff",
        borderLeft: "1px solid #e2e8f0",
        boxShadow: "-2px 0 12px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: collapsed ? "10px 8px" : "10px 12px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#0f1623",
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: pageContext ? "#22c55e" : "#94a3b8",
            }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Context Awareness
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: "4px", marginLeft: collapsed ? "auto" : undefined }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "2px 4px",
              borderRadius: "3px",
            }}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "◀" : "▶"}
          </button>
          {!collapsed && (
            <button
              onClick={() => setPanelOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "2px 4px",
                borderRadius: "3px",
              }}
              title="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content — only shown when not collapsed */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {pageContext ? (
            <>
              {/* Page identity */}
              <div style={{
                backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: "6px", padding: "8px 10px", marginBottom: "10px",
              }}>
                <div style={{ fontSize: "16px", marginBottom: "2px" }}>{pageContext.pageIcon}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", lineHeight: "1.3" }}>
                  {pageContext.pageTitle}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px", lineHeight: "1.4" }}>
                  {pageContext.description}
                </div>
              </div>

              {/* Context sections */}
              <ContextSection
                title="Features"
                items={pageContext.features}
                colorKey="features"
                defaultOpen={true}
              />
              <ContextSection
                title="APIs"
                items={pageContext.apis}
                colorKey="apis"
                defaultOpen={true}
              />
              <ContextSection
                title="User Stories"
                items={pageContext.stories}
                colorKey="stories"
              />
              <ContextSection
                title="Screens"
                items={pageContext.screens}
                colorKey="screens"
              />
              <ContextSection
                title="Business Rules"
                items={pageContext.businessRules}
                colorKey="businessRules"
              />
              <ContextSection
                title="Related Batches"
                items={pageContext.batches}
                colorKey="batches"
              />
              <ContextSection
                title="Business Objects"
                items={pageContext.businessObjects}
                colorKey="businessObjects"
              />
              <ContextSection
                title="Integrations"
                items={pageContext.integrations}
                colorKey="integrations"
              />

              {/* Ask Buddy quick link */}
              <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                <Link href="/ask-buddy">
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 10px", borderRadius: "6px",
                    backgroundColor: "#0f1623", color: "white",
                    fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    textDecoration: "none",
                  }}>
                    <span>🤖</span>
                    <span>Ask Buddy about this page</span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "200px", gap: "8px",
              color: "#94a3b8", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px" }}>🧭</div>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>No context available</div>
              <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                Navigate to a platform page to see context
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed icon strip */}
      {collapsed && pageContext && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: "12px", gap: "8px",
        }}>
          <div style={{ fontSize: "18px" }} title={pageContext.pageTitle}>
            {pageContext.pageIcon}
          </div>
        </div>
      )}
    </div>
  );
}

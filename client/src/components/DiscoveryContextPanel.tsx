// DiscoveryContextPanel.tsx
// Renders inside the Control Panel whenever a Discovery Center page is active.
// Displays: current page, related features, APIs, batches, business objects,
// user stories, screens, and integrations — all derived from discoveryRegistry.ts.

import { Link } from "wouter";
import { useDiscovery } from "@/contexts/DiscoveryContext";
import type { DiscoveryPageContext } from "@/lib/discoveryRegistry";

// ── Method badge ──────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: "#dbeafe", text: "#1e40af" },
  POST:   { bg: "#d1fae5", text: "#065f46" },
  PUT:    { bg: "#fef3c7", text: "#92400e" },
  PATCH:  { bg: "#ede9fe", text: "#5b21b6" },
  DELETE: { bg: "#fee2e2", text: "#991b1b" },
};

function MethodBadge({ method }: { method: string }) {
  const c = METHOD_COLORS[method] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{
      fontSize: "9px", fontWeight: 800, padding: "1px 5px", borderRadius: "3px",
      backgroundColor: c.bg, color: c.text, flexShrink: 0,
    }}>
      {method}
    </span>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────
function ContextSection({
  title, icon, color, children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{
        fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color, marginBottom: "6px",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <span>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function Tag({ label, color, href }: { label: string; color: string; href?: string }) {
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center",
    fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px",
    backgroundColor: `${color}12`, color, border: `1px solid ${color}25`,
    cursor: href ? "pointer" : "default",
    textDecoration: "none",
  };
  if (href) {
    return (
      <Link href={href}>
        <span style={style}>{label}</span>
      </Link>
    );
  }
  return <span style={style}>{label}</span>;
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function DiscoveryContextPanel() {
  const { activeDiscoveryContext, isDiscoveryActive } = useDiscovery();

  if (!isDiscoveryActive || !activeDiscoveryContext) return null;

  const ctx: DiscoveryPageContext = activeDiscoveryContext;

  return (
    <div style={{
      backgroundColor: "#faf5ff",
      border: "1px solid #ddd6fe",
      borderLeft: "3px solid #7c3aed",
      borderRadius: "10px",
      padding: "16px 18px",
      marginBottom: "16px",
    }}>
      {/* Panel header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "14px", paddingBottom: "12px",
        borderBottom: "1px solid #ede9fe",
      }}>
        <div>
          <div style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#7c3aed", marginBottom: "4px",
          }}>
            🧭 Discovery Center — Active Context
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>{ctx.icon}</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e1b4b" }}>
                {ctx.title}
              </div>
              <div style={{ fontSize: "11px", color: "#6d28d9", marginTop: "1px", lineHeight: "1.4" }}>
                {ctx.description}
              </div>
            </div>
          </div>
        </div>
        <Link href={ctx.path}>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#7c3aed",
            backgroundColor: "#ede9fe", padding: "3px 8px", borderRadius: "4px",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Open Page →
          </span>
        </Link>
      </div>

      {/* Related Batches */}
      {ctx.relatedBatches.length > 0 && (
        <ContextSection title="Related Batches" icon="📦" color="#1e40af">
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {ctx.relatedBatches.map(b => {
              const href = b === "FC" ? "/batch/foundation-core"
                : b === "MT" ? "/batch/mt"
                : `/batch/${b.replace("B", "")}`;
              return <Tag key={b} label={b} color="#1e40af" href={href} />;
            })}
          </div>
        </ContextSection>
      )}

      {/* Related Features */}
      {ctx.relatedFeatures.length > 0 && (
        <ContextSection title="Related Features" icon="⚡" color="#065f46">
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {ctx.relatedFeatures.map(f => (
              <div key={f} style={{
                fontSize: "11px", color: "#1e293b", padding: "3px 8px",
                backgroundColor: "#f0fdf4", borderRadius: "4px",
                borderLeft: "2px solid #059669",
              }}>
                {f}
              </div>
            ))}
          </div>
        </ContextSection>
      )}

      {/* Related APIs */}
      {ctx.relatedAPIs.length > 0 && (
        <ContextSection title="Related APIs" icon="🔌" color="#0369a1">
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {ctx.relatedAPIs.map((api, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 8px", backgroundColor: "#f0f9ff",
                borderRadius: "4px", border: "1px solid #bae6fd",
              }}>
                <MethodBadge method={api.method} />
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#0369a1", flex: 1 }}>
                  {api.path}
                </span>
                <span style={{
                  fontSize: "9px", fontWeight: 700, color: "#64748b",
                  backgroundColor: "#e2e8f0", padding: "1px 5px", borderRadius: "3px",
                }}>
                  {api.owner}
                </span>
              </div>
            ))}
          </div>
        </ContextSection>
      )}

      {/* Related Business Objects */}
      {ctx.relatedBusinessObjects.length > 0 && (
        <ContextSection title="Related Business Objects" icon="🗂" color="#7c3aed">
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {ctx.relatedBusinessObjects.map(obj => (
              <Tag key={obj} label={obj} color="#7c3aed" />
            ))}
          </div>
        </ContextSection>
      )}

      {/* Related User Stories */}
      {ctx.relatedStories.length > 0 && (
        <ContextSection title="Related User Stories" icon="📝" color="#0f1623">
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {ctx.relatedStories.map(s => (
              <div key={s} style={{
                fontSize: "11px", color: "#334155", padding: "3px 8px",
                backgroundColor: "#f8fafc", borderRadius: "4px",
                borderLeft: "2px solid #94a3b8",
              }}>
                {s}
              </div>
            ))}
          </div>
        </ContextSection>
      )}

      {/* Related Screens */}
      {ctx.relatedScreens.length > 0 && (
        <ContextSection title="Related Screens" icon="🖥" color="#0e7490">
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {ctx.relatedScreens.map(s => (
              <Tag key={s} label={s} color="#0e7490" />
            ))}
          </div>
        </ContextSection>
      )}

      {/* Related Integrations */}
      {ctx.relatedIntegrations.length > 0 && (
        <ContextSection title="Related Integrations" icon="🔗" color="#92400e">
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {ctx.relatedIntegrations.map(i => (
              <div key={i} style={{
                fontSize: "11px", color: "#78350f", padding: "3px 8px",
                backgroundColor: "#fffbeb", borderRadius: "4px",
                borderLeft: "2px solid #f59e0b",
              }}>
                {i}
              </div>
            ))}
          </div>
        </ContextSection>
      )}

      {/* Footer link to full Discovery Center */}
      <div style={{
        marginTop: "12px", paddingTop: "10px",
        borderTop: "1px solid #ede9fe",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: "10px", color: "#a78bfa" }}>
          Context auto-updates as you navigate Discovery Center
        </span>
        <Link href="/discovery">
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#7c3aed", cursor: "pointer",
          }}>
            All Discovery Pages →
          </span>
        </Link>
      </div>
    </div>
  );
}

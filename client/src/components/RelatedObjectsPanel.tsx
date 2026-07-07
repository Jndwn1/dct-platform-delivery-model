// RelatedObjectsPanel.tsx
// Inline "Related Objects" panel for Discovery pages
// Shows all connected nodes from the knowledge graph for a given root node
// Users can click any related object to navigate directly

import { useLocation } from "wouter";
import {
  GRAPH_NODES,
  NODE_TYPE_CONFIG,
  NodeType,
  getConnectedNodes,
  getRelatedByType,
  findNode,
} from "@/lib/knowledgeGraph";

interface RelatedObjectsPanelProps {
  rootNodeId: string;
  title?: string;
  compact?: boolean;
}

const SECTION_ORDER: { type: NodeType; icon: string; label: string }[] = [
  { type: "api",            icon: "📡", label: "Related APIs" },
  { type: "story",          icon: "📖", label: "Related User Stories" },
  { type: "feature",        icon: "⭐", label: "Related Features" },
  { type: "businessObject", icon: "💼", label: "Related Business Objects" },
  { type: "screen",         icon: "🖥️", label: "Related Screens" },
  { type: "batch",          icon: "📦", label: "Related Batches" },
  { type: "qa",             icon: "✅", label: "Related QA" },
  { type: "gate",           icon: "🔒", label: "Related Gates" },
  { type: "rule",           icon: "📏", label: "Business Rules" },
  { type: "system",         icon: "🏛️", label: "Related Systems" },
  { type: "page",           icon: "🧭", label: "Related Pages" },
];

export default function RelatedObjectsPanel({ rootNodeId, title, compact = false }: RelatedObjectsPanelProps) {
  const [, navigate] = useLocation();
  const rootNode = findNode(rootNodeId);
  if (!rootNode) return null;

  const connected = getConnectedNodes(rootNodeId);

  const sections = SECTION_ORDER
    .map(s => ({
      ...s,
      nodes: connected.filter(c => c.node.type === s.type),
    }))
    .filter(s => s.nodes.length > 0);

  if (sections.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: "10px", padding: compact ? "14px 16px" : "20px 24px",
      marginTop: "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Knowledge Graph
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f1623", margin: "2px 0 0" }}>
            {title ?? `${rootNode.label} — Related Objects`}
          </h3>
        </div>
        <button
          onClick={() => navigate(`/discovery/knowledge-graph`)}
          style={{
            fontSize: "11px", fontWeight: 600, padding: "5px 10px", borderRadius: "5px",
            border: "1px solid #1e3a5f", backgroundColor: "#1e3a5f", color: "white",
            cursor: "pointer",
          }}
        >
          🕸️ Open Full Graph
        </button>
      </div>

      {/* Sections grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
      }}>
        {sections.map(section => {
          const cfg = NODE_TYPE_CONFIG[section.type];
          return (
            <div key={section.type} style={{
              backgroundColor: "white", border: `1px solid ${cfg.border}`,
              borderRadius: "8px", padding: "10px 12px",
            }}>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: cfg.color,
                textTransform: "uppercase", letterSpacing: "0.07em",
                marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px",
              }}>
                <span>{section.icon}</span>
                {section.label} ({section.nodes.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {section.nodes.map(({ node, edge, direction }) => (
                  <button
                    key={node.id}
                    onClick={() => node.route && navigate(node.route)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 7px", borderRadius: "5px",
                      border: `1px solid ${cfg.border}`, backgroundColor: cfg.bg,
                      cursor: node.route ? "pointer" : "default", textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: "12px", flexShrink: 0 }}>{node.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "11px", fontWeight: 600, color: "#1e293b",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {node.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {direction === "outbound" ? "→" : "←"} {edge.label ?? edge.type}
                      </div>
                    </div>
                    {node.route && (
                      <span style={{ fontSize: "10px", color: "#94a3b8", flexShrink: 0 }}>↗</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "10px", textAlign: "center" }}>
        Click any object to navigate · Open Full Graph to explore all connections visually
      </div>
    </div>
  );
}

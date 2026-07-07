// KnowledgeGraphPage.tsx
// Full-page interactive knowledge graph for the DCT Discovery Center
// Shows all platform entities as connected nodes — click any node to explore relationships

import { useState } from "react";
import { useLocation } from "wouter";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import {
  GRAPH_NODES,
  NODE_TYPE_CONFIG,
  NodeType,
  getNodesByType,
} from "@/lib/knowledgeGraph";

const QUICK_FILTERS: { label: string; nodeId: string; icon: string }[] = [
  { label: "Roger",         nodeId: "sys-roger",       icon: "💬" },
  { label: "TDC",           nodeId: "sys-tdc",         icon: "🏛️" },
  { label: "GoSystem",      nodeId: "sys-gosystem",    icon: "💼" },
  { label: "PDC",           nodeId: "sys-pdc",         icon: "🏦" },
  { label: "Known Mapping", nodeId: "bo-known-mapping",icon: "🗺️" },
  { label: "G1 Schema Lock",nodeId: "gate-g1",         icon: "🔒" },
  { label: "B9 Roger API",  nodeId: "batch-b9",        icon: "📦" },
  { label: "B38 GoSystem",  nodeId: "batch-b38",       icon: "📦" },
];

export default function KnowledgeGraphPage() {
  const [, navigate] = useLocation();
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = searchQuery.trim().length > 1
    ? GRAPH_NODES.filter(n =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const stats = {
    systems: getNodesByType("system").length,
    apis: getNodesByType("api").length,
    stories: getNodesByType("story").length,
    batches: getNodesByType("batch").length,
    businessObjects: getNodesByType("businessObject").length,
    screens: getNodesByType("screen").length,
    qa: getNodesByType("qa").length,
    total: GRAPH_NODES.length,
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <button
            onClick={() => navigate("/discovery")}
            style={{ fontSize: "12px", color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ← Discovery Center
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>
              🕸️ DCT Knowledge Graph
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
              Every platform entity is connected. Click any node to explore its relationships. Navigate by clicking connected nodes.
            </p>
          </div>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search nodes…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              style={{
                padding: "7px 12px", borderRadius: "6px", border: "1px solid #e2e8f0",
                fontSize: "13px", width: "200px", outline: "none",
              }}
            />
            {showSearch && searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: "4px",
              }}>
                {searchResults.map(node => {
                  const cfg = NODE_TYPE_CONFIG[node.type];
                  return (
                    <button
                      key={node.id}
                      onClick={() => { setRootNodeId(node.id); setSearchQuery(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        width: "100%", padding: "8px 10px", border: "none",
                        backgroundColor: "transparent", cursor: "pointer", textAlign: "left",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span>{node.icon}</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>{node.label}</div>
                        <div style={{ fontSize: "10px", color: cfg.color }}>{cfg.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px",
      }}>
        {[
          { label: "Total Nodes", value: stats.total, color: "#1e293b" },
          { label: "Systems", value: stats.systems, color: NODE_TYPE_CONFIG.system.color },
          { label: "APIs", value: stats.apis, color: NODE_TYPE_CONFIG.api.color },
          { label: "Business Objects", value: stats.businessObjects, color: NODE_TYPE_CONFIG.businessObject.color },
          { label: "Screens", value: stats.screens, color: NODE_TYPE_CONFIG.screen.color },
          { label: "Stories", value: stats.stories, color: NODE_TYPE_CONFIG.story.color },
          { label: "Batches", value: stats.batches, color: NODE_TYPE_CONFIG.batch.color },
          { label: "QA Items", value: stats.qa, color: NODE_TYPE_CONFIG.qa.color },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center", minWidth: "60px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button
          onClick={() => setRootNodeId(null)}
          style={{
            fontSize: "12px", fontWeight: 600, padding: "5px 10px", borderRadius: "5px",
            border: `1px solid ${rootNodeId === null ? "#1e3a5f" : "#e2e8f0"}`,
            backgroundColor: rootNodeId === null ? "#1e3a5f" : "white",
            color: rootNodeId === null ? "white" : "#64748b",
            cursor: "pointer",
          }}
        >
          🌐 Full Graph
        </button>
        {QUICK_FILTERS.map(f => (
          <button
            key={f.nodeId}
            onClick={() => setRootNodeId(prev => prev === f.nodeId ? null : f.nodeId)}
            style={{
              fontSize: "12px", fontWeight: 600, padding: "5px 10px", borderRadius: "5px",
              border: `1px solid ${rootNodeId === f.nodeId ? "#1e3a5f" : "#e2e8f0"}`,
              backgroundColor: rootNodeId === f.nodeId ? "#1e3a5f" : "white",
              color: rootNodeId === f.nodeId ? "white" : "#374151",
              cursor: "pointer",
            }}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Active filter label */}
      {rootNodeId && (
        <div style={{
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "6px", padding: "8px 12px", marginBottom: "12px",
          fontSize: "12px", color: "#1d4ed8", fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>
            Showing: <strong>{GRAPH_NODES.find(n => n.id === rootNodeId)?.label}</strong> and all directly connected nodes
          </span>
          <button
            onClick={() => setRootNodeId(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontSize: "14px" }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Graph */}
      <KnowledgeGraph
        rootNodeId={rootNodeId}
        height={580}
        showLegend={true}
      />

      {/* How to use */}
      <div style={{
        marginTop: "16px", backgroundColor: "#fafafa", border: "1px solid #e2e8f0",
        borderRadius: "8px", padding: "12px 16px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px",
      }}>
        {[
          { icon: "🖱️", title: "Click a node", desc: "Select it to see all connected nodes in the detail panel" },
          { icon: "🔗", title: "Click a connected node", desc: "Navigate to that node and explore its own connections" },
          { icon: "↗️", title: "Open Page button", desc: "Navigate directly to the platform page for the selected node" },
          { icon: "🎯", title: "Quick Filters", desc: "Focus the graph on a specific system or entity" },
          { icon: "🔍", title: "Search", desc: "Find any node by name or description" },
          { icon: "🏷️", title: "Type Filters", desc: "Show/hide node types using the filter buttons above the graph" },
        ].map(tip => (
          <div key={tip.title} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>{tip.icon}</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{tip.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

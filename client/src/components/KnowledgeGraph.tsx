// KnowledgeGraph.tsx
// Interactive knowledge graph visualization for the DCT Discovery Center
// Uses a force-directed layout rendered on HTML Canvas
// Clicking any node opens a detail panel showing all connected nodes

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  GRAPH_NODES,
  GRAPH_EDGES,
  GraphNode,
  GraphEdge,
  NODE_TYPE_CONFIG,
  NodeType,
  getConnectedNodes,
} from "@/lib/knowledgeGraph";

interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const TYPE_ORDER: NodeType[] = [
  "system", "api", "businessObject", "screen", "feature",
  "story", "batch", "qa", "gate", "rule", "page",
];

interface KnowledgeGraphProps {
  filterType?: NodeType | null;
  rootNodeId?: string | null;
  height?: number;
  showLegend?: boolean;
}

export default function KnowledgeGraph({
  filterType = null,
  rootNodeId = null,
  height = 600,
  showLegend = true,
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, navigate] = useLocation();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map());
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(TYPE_ORDER));
  const animFrameRef = useRef<number>(0);
  const positionsRef = useRef<Map<string, NodePosition>>(new Map());
  const isDragging = useRef(false);
  const dragNodeId = useRef<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Determine which nodes to show
  const visibleNodes = GRAPH_NODES.filter(n => {
    if (!activeTypes.has(n.type)) return false;
    if (filterType && n.type !== filterType) return false;
    if (rootNodeId) {
      // Show root node + all directly connected nodes
      if (n.id === rootNodeId) return true;
      return GRAPH_EDGES.some(e =>
        (e.source === rootNodeId && e.target === n.id) ||
        (e.target === rootNodeId && e.source === n.id)
      );
    }
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = GRAPH_EDGES.filter(
    e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // Initialize positions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = height;
    const newPositions = new Map<string, NodePosition>();

    visibleNodes.forEach((node, i) => {
      const existing = positionsRef.current.get(node.id);
      if (existing) {
        newPositions.set(node.id, existing);
      } else {
        // Arrange by type in rings
        const typeIdx = TYPE_ORDER.indexOf(node.type);
        const nodesOfType = visibleNodes.filter(n => n.type === node.type);
        const posInType = nodesOfType.findIndex(n => n.id === node.id);
        const ringRadius = 80 + typeIdx * 55;
        const angle = (posInType / Math.max(nodesOfType.length, 1)) * Math.PI * 2;
        newPositions.set(node.id, {
          id: node.id,
          x: W / 2 + ringRadius * Math.cos(angle) + (Math.random() - 0.5) * 30,
          y: H / 2 + ringRadius * Math.sin(angle) + (Math.random() - 0.5) * 30,
          vx: 0,
          vy: 0,
        });
      }
    });

    positionsRef.current = newPositions;
    setPositions(new Map(newPositions));
  }, [visibleNodes.length, height]);

  // Force-directed simulation
  const simulate = useCallback(() => {
    const pos = positionsRef.current;
    const canvas = canvasRef.current;
    if (!canvas || pos.size === 0) return;

    const W = canvas.width;
    const H = height;
    const REPULSION = 2200;
    const ATTRACTION = 0.018;
    const DAMPING = 0.82;
    const CENTER_FORCE = 0.004;

    const nodeArr = Array.from(pos.values());

    // Repulsion between all nodes
    for (let i = 0; i < nodeArr.length; i++) {
      for (let j = i + 1; j < nodeArr.length; j++) {
        const a = nodeArr[i];
        const b = nodeArr[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of visibleEdges) {
      const a = pos.get(edge.source);
      const b = pos.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 120;
      const force = (dist - targetDist) * ATTRACTION;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of nodeArr) {
      node.vx += (W / 2 - node.x) * CENTER_FORCE;
      node.vy += (H / 2 - node.y) * CENTER_FORCE;
    }

    // Apply velocity with damping + boundary
    for (const node of nodeArr) {
      if (dragNodeId.current === node.id) continue;
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x = Math.max(30, Math.min(W - 30, node.x + node.vx));
      node.y = Math.max(30, Math.min(H - 30, node.y + node.vy));
    }

    setPositions(new Map(pos));
  }, [visibleEdges, height]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = height;
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (const edge of visibleEdges) {
      const a = positions.get(edge.source);
      const b = positions.get(edge.target);
      if (!a || !b) continue;

      const isHighlighted = selectedNode &&
        (edge.source === selectedNode.id || edge.target === selectedNode.id);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = isHighlighted ? "#2563eb" : "#cbd5e1";
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.globalAlpha = isHighlighted ? 0.9 : 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Arrow head
      if (isHighlighted) {
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const arrowLen = 8;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - arrowLen * Math.cos(angle - 0.4), my - arrowLen * Math.sin(angle - 0.4));
        ctx.lineTo(mx - arrowLen * Math.cos(angle + 0.4), my - arrowLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = "#2563eb";
        ctx.fill();
      }
    }

    // Draw nodes
    for (const node of visibleNodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const config = NODE_TYPE_CONFIG[node.type];
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const isConnected = selectedNode && GRAPH_EDGES.some(
        e => (e.source === selectedNode.id && e.target === node.id) ||
             (e.target === selectedNode.id && e.source === node.id)
      );
      const isRoot = rootNodeId === node.id;

      const radius = isRoot ? 22 : isSelected ? 20 : isConnected ? 16 : 13;

      // Shadow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#2563eb33" : "#94a3b833";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? config.color : config.bg;
      ctx.fill();
      ctx.strokeStyle = isSelected ? config.color : config.border;
      ctx.lineWidth = isSelected ? 3 : isConnected ? 2 : 1.5;
      ctx.stroke();

      // Emoji icon
      ctx.font = `${isRoot ? 14 : 11}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isSelected ? "white" : config.color;
      ctx.fillText(node.icon, pos.x, pos.y);

      // Label below node
      const labelOpacity = selectedNode
        ? (isSelected || isConnected ? 1 : 0.3)
        : 0.85;
      ctx.globalAlpha = labelOpacity;
      ctx.font = `${isSelected ? "600" : "500"} 10px system-ui, sans-serif`;
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Truncate long labels
      const maxLen = 16;
      const label = node.label.length > maxLen
        ? node.label.substring(0, maxLen) + "…"
        : node.label;
      ctx.fillText(label, pos.x, pos.y + radius + 3);
      ctx.globalAlpha = 1;
    }
  }, [positions, selectedNode, hoveredNode, visibleNodes, visibleEdges, rootNodeId, height]);

  // Animation loop
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      if (frame % 2 === 0) simulate(); // run physics every other frame
      frame++;
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [simulate]);

  // Hit test
  const getNodeAtPoint = useCallback((x: number, y: number): GraphNode | null => {
    for (const node of visibleNodes) {
      const pos = positionsRef.current.get(node.id);
      if (!pos) continue;
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= 20) return node;
    }
    return null;
  }, [visibleNodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging.current && dragNodeId.current) {
      const pos = positionsRef.current.get(dragNodeId.current);
      if (pos) {
        pos.x = x;
        pos.y = y;
        pos.vx = 0;
        pos.vy = 0;
      }
      lastMousePos.current = { x, y };
      return;
    }

    const node = getNodeAtPoint(x, y);
    setHoveredNode(node?.id ?? null);
    canvasRef.current!.style.cursor = node ? "pointer" : "default";
  }, [getNodeAtPoint]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPoint(x, y);
    if (node) {
      isDragging.current = true;
      dragNodeId.current = node.id;
      lastMousePos.current = { x, y };
    }
  }, [getNodeAtPoint]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - lastMousePos.current.x;
    const dy = y - lastMousePos.current.y;
    const moved = Math.sqrt(dx * dx + dy * dy);

    if (moved < 5 && dragNodeId.current) {
      // It was a click, not a drag
      const node = visibleNodes.find(n => n.id === dragNodeId.current);
      if (node) setSelectedNode(prev => prev?.id === node.id ? null : node);
    }

    isDragging.current = false;
    dragNodeId.current = null;
  }, [visibleNodes]);

  const connectedNodes = selectedNode ? getConnectedNodes(selectedNode.id) : [];

  const toggleType = (type: NodeType) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", gap: "16px", width: "100%" }}>
      {/* Graph canvas */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {showLegend && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
            {TYPE_ORDER.map(type => {
              const cfg = NODE_TYPE_CONFIG[type];
              const active = activeTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  style={{
                    fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                    borderRadius: "4px", border: `1px solid ${active ? cfg.border : "#e2e8f0"}`,
                    backgroundColor: active ? cfg.bg : "#f8fafc",
                    color: active ? cfg.color : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{
          border: "1px solid #e2e8f0", borderRadius: "10px",
          overflow: "hidden", backgroundColor: "#f8fafc",
        }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={height}
            style={{ width: "100%", height: `${height}px`, display: "block" }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoveredNode(null)}
          />
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", textAlign: "center" }}>
          Click a node to explore its connections · Drag to reposition · Click filters above to show/hide types
        </div>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div style={{
          width: "280px", flexShrink: 0,
          border: "1px solid #e2e8f0", borderRadius: "10px",
          backgroundColor: "white", padding: "16px",
          maxHeight: `${height + 40}px`, overflowY: "auto",
        }}>
          {/* Node header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
              backgroundColor: NODE_TYPE_CONFIG[selectedNode.type].bg,
              border: `1px solid ${NODE_TYPE_CONFIG[selectedNode.type].border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>
              {selectedNode.icon}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", lineHeight: 1.3 }}>
                {selectedNode.label}
              </div>
              <div style={{
                display: "inline-block", fontSize: "10px", fontWeight: 600,
                color: NODE_TYPE_CONFIG[selectedNode.type].color,
                backgroundColor: NODE_TYPE_CONFIG[selectedNode.type].bg,
                border: `1px solid ${NODE_TYPE_CONFIG[selectedNode.type].border}`,
                borderRadius: "3px", padding: "1px 5px", marginTop: "3px",
              }}>
                {NODE_TYPE_CONFIG[selectedNode.type].label}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", marginBottom: "14px" }}>
            {selectedNode.description}
          </p>

          {/* Metadata */}
          {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              {Object.entries(selectedNode.metadata).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "6px", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600, minWidth: "50px", textTransform: "capitalize" }}>{k}:</span>
                  <span style={{ color: "#374151", fontFamily: "monospace" }}>{Array.isArray(v) ? v.join(", ") : v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigate button */}
          {selectedNode.route && (
            <button
              onClick={() => navigate(selectedNode.route!)}
              style={{
                width: "100%", padding: "7px", borderRadius: "6px",
                backgroundColor: "#1e3a5f", color: "white",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                border: "none", marginBottom: "14px",
              }}
            >
              Open Page →
            </button>
          )}

          {/* Connected nodes grouped by type */}
          {connectedNodes.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Connected ({connectedNodes.length})
              </div>
              {TYPE_ORDER.map(type => {
                const group = connectedNodes.filter(c => c.node.type === type);
                if (group.length === 0) return null;
                const cfg = NODE_TYPE_CONFIG[type];
                return (
                  <div key={type} style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                      {cfg.label}s ({group.length})
                    </div>
                    {group.map(({ node, edge, direction }) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          width: "100%", padding: "5px 7px", marginBottom: "3px",
                          borderRadius: "5px", border: `1px solid ${cfg.border}`,
                          backgroundColor: cfg.bg, cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "13px" }}>{node.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {node.label}
                          </div>
                          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                            {direction === "outbound" ? "→" : "←"} {edge.label ?? edge.type}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

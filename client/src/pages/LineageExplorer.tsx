// Lineage Explorer — RSM Command Center design
// doc_id → run_id → source_record_id → normalized_record → tax_mapping → tax_decision

import { useState } from "react";
import { ArrowRight, ArrowDown, Search, FileText, Database, Cpu, CheckCircle, GitBranch, BarChart2 } from "lucide-react";

interface LineageRecord {
  docId: string;
  clientName: string;
  fileType: string;
  receivedDate: string;
  runId: string;
  sourceRecordCount: number;
  normalizedRecordCount: number;
  taxMappingCount: number;
  taxDecisionCount: number;
  status: "COMPLETE" | "IN_PROGRESS" | "PENDING";
}

const lineageRecords: LineageRecord[] = [
  {
    docId: "TB-2025-Q4-ACME-001",
    clientName: "Acme Corp",
    fileType: "Trial Balance",
    receivedDate: "2026-03-11",
    runId: "RUN-20260311-001",
    sourceRecordCount: 1842,
    normalizedRecordCount: 1842,
    taxMappingCount: 1842,
    taxDecisionCount: 1842,
    status: "COMPLETE",
  },
  {
    docId: "GL-2025-Q4-BETA-001",
    clientName: "Beta Industries",
    fileType: "General Ledger",
    receivedDate: "2026-03-10",
    runId: "RUN-20260310-003",
    sourceRecordCount: 4217,
    normalizedRecordCount: 4217,
    taxMappingCount: 4217,
    taxDecisionCount: 0,
    status: "IN_PROGRESS",
  },
  {
    docId: "TB-2025-Q3-ACME-001",
    clientName: "Acme Corp",
    fileType: "Trial Balance",
    receivedDate: "2025-12-15",
    runId: "RUN-20251215-001",
    sourceRecordCount: 1798,
    normalizedRecordCount: 1798,
    taxMappingCount: 1798,
    taxDecisionCount: 1798,
    status: "COMPLETE",
  },
];

interface ChainNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  count?: number;
  details: { label: string; value: string }[];
}

function buildChain(rec: LineageRecord): ChainNode[] {
  return [
    {
      id: "source",
      label: "Source File",
      sublabel: rec.docId,
      icon: <FileText size={16} />,
      color: "#5B21B6",
      bgColor: "#F5F3FF",
      borderColor: "#7C3AED",
      details: [
        { label: "Document ID", value: rec.docId },
        { label: "Client", value: rec.clientName },
        { label: "File Type", value: rec.fileType },
        { label: "Received", value: rec.receivedDate },
        { label: "System", value: "Phoenix / DMS" },
      ],
    },
    {
      id: "run",
      label: "Processing Run",
      sublabel: rec.runId,
      icon: <Cpu size={16} />,
      color: "#1D4ED8",
      bgColor: "#EFF6FF",
      borderColor: "#2563EB",
      details: [
        { label: "Run ID", value: rec.runId },
        { label: "Agent", value: "Recognizer Agent + Normalization Agent" },
        { label: "System", value: "AI Orchestrator" },
        { label: "Touchpoints", value: "T2, T3" },
      ],
    },
    {
      id: "source_records",
      label: "Source Records",
      sublabel: `${rec.sourceRecordCount.toLocaleString()} records`,
      icon: <Database size={16} />,
      color: "#065F46",
      bgColor: "#ECFDF5",
      borderColor: "#059669",
      count: rec.sourceRecordCount,
      details: [
        { label: "Record Count", value: rec.sourceRecordCount.toLocaleString() },
        { label: "Schema", value: "Standard Chart of Accounts" },
        { label: "System", value: "PDC — Canonical Ingestion" },
        { label: "Touchpoint", value: "T4" },
      ],
    },
    {
      id: "normalized",
      label: "Normalized Records",
      sublabel: `${rec.normalizedRecordCount.toLocaleString()} records`,
      icon: <GitBranch size={16} />,
      color: "#065F46",
      bgColor: "#ECFDF5",
      borderColor: "#059669",
      count: rec.normalizedRecordCount,
      details: [
        { label: "Record Count", value: rec.normalizedRecordCount.toLocaleString() },
        { label: "Model", value: "DCT Canonical Financial Model v1.0" },
        { label: "System", value: "PDC — Canonical Dataset" },
        { label: "Touchpoints", value: "T5, T6, T7" },
        { label: "Lineage Record", value: `LR-${rec.runId}` },
      ],
    },
    {
      id: "tax_mapping",
      label: "Tax Mappings",
      sublabel: rec.taxMappingCount > 0 ? `${rec.taxMappingCount.toLocaleString()} proposals` : "Pending",
      icon: <BarChart2 size={16} />,
      color: "#92400E",
      bgColor: "#FFFBEB",
      borderColor: "#D97706",
      count: rec.taxMappingCount,
      details: [
        { label: "Proposal Count", value: rec.taxMappingCount > 0 ? rec.taxMappingCount.toLocaleString() : "Pending" },
        { label: "Agent", value: "Mapping Agent" },
        { label: "System", value: "AI Mapping Layer" },
        { label: "Touchpoint", value: "T8" },
        { label: "Avg Confidence", value: rec.taxMappingCount > 0 ? "94.7%" : "—" },
      ],
    },
    {
      id: "tax_decision",
      label: "Tax Decisions",
      sublabel: rec.taxDecisionCount > 0 ? `${rec.taxDecisionCount.toLocaleString()} decisions` : "Pending",
      icon: <CheckCircle size={16} />,
      color: "#991B1B",
      bgColor: "#FEF2F2",
      borderColor: "#DC2626",
      count: rec.taxDecisionCount,
      details: [
        { label: "Decision Count", value: rec.taxDecisionCount > 0 ? rec.taxDecisionCount.toLocaleString() : "Pending" },
        { label: "System", value: "TDC — Tax Decision Core" },
        { label: "Touchpoints", value: "T9, T10" },
        { label: "Status", value: rec.taxDecisionCount > 0 ? "Immutable · Persisted" : "Awaiting review" },
        { label: "UI", value: rec.taxDecisionCount > 0 ? "Available in Roger UI (T11)" : "—" },
      ],
    },
  ];
}

function ChainNodeCard({ node, isSelected, onClick }: {
  node: ChainNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-full px-4 py-3 rounded-lg border-2 text-left transition-all hover:shadow-md"
        style={{
          background: node.bgColor,
          borderColor: isSelected ? node.color : node.borderColor,
          boxShadow: isSelected ? `0 0 0 3px ${node.color}30` : undefined,
          minWidth: 140,
        }}
      >
        <div className="flex items-center gap-2 mb-1" style={{ color: node.color }}>
          {node.icon}
          <span className="text-xs font-bold">{node.label}</span>
        </div>
        <div className="text-xs font-mono text-gray-600 truncate">{node.sublabel}</div>
      </div>
    </button>
  );
}

export default function LineageExplorer() {
  const [selectedDocId, setSelectedDocId] = useState<string>(lineageRecords[0].docId);
  const [selectedNode, setSelectedNode] = useState<ChainNode | null>(null);
  const [searchVal, setSearchVal] = useState("");

  const selectedRecord = lineageRecords.find(r => r.docId === selectedDocId) || lineageRecords[0];
  const chain = buildChain(selectedRecord);

  const filtered = lineageRecords.filter(r =>
    r.docId.toLowerCase().includes(searchVal.toLowerCase()) ||
    r.clientName.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Lineage Explorer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Trace any document from source file through normalized records, tax mappings, and final tax decisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Select Document</div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search doc_id or client…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {filtered.map(rec => (
              <button
                key={rec.docId}
                onClick={() => { setSelectedDocId(rec.docId); setSelectedNode(null); }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedDocId === rec.docId ? "shadow-md" : "hover:border-border/80"
                }`}
                style={{
                  borderColor: selectedDocId === rec.docId ? "oklch(0.28 0.12 264)" : "#E5E7EB",
                  background: selectedDocId === rec.docId ? "oklch(0.95 0.03 264)" : "white",
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold font-mono" style={{ color: "oklch(0.28 0.12 264)" }}>
                    {rec.docId}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                    rec.status === "COMPLETE" ? "bg-green-100 text-green-700"
                    : rec.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                    {rec.status === "COMPLETE" ? "Complete" : rec.status === "IN_PROGRESS" ? "In Progress" : "Pending"}
                  </span>
                </div>
                <div className="text-xs text-foreground font-medium">{rec.clientName}</div>
                <div className="text-xs text-muted-foreground">{rec.fileType} · {rec.receivedDate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lineage chain */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Traceability Chain — {selectedRecord.docId}
          </div>

          {/* Chain visualization */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              {chain.map((node, idx) => (
                <div key={node.id}>
                  <ChainNodeCard
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => setSelectedNode(prev => prev?.id === node.id ? null : node)}
                  />
                  {idx < chain.length - 1 && (
                    <div className="flex justify-start pl-16 py-1">
                      <ArrowDown size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Node detail */}
          {selectedNode && (
            <div className="bg-card border-2 rounded-lg p-5 shadow-sm"
              style={{ borderColor: selectedNode.borderColor }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: selectedNode.color }}>
                {selectedNode.icon}
                <span className="font-bold text-sm">{selectedNode.label}</span>
                <span className="text-xs text-muted-foreground ml-1">— {selectedNode.sublabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {selectedNode.details.map(d => (
                  <div key={d.label}>
                    <div className="text-xs text-muted-foreground">{d.label}</div>
                    <div className="text-xs font-semibold text-foreground">{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Source Records", value: selectedRecord.sourceRecordCount.toLocaleString(), color: "#059669" },
              { label: "Normalized", value: selectedRecord.normalizedRecordCount.toLocaleString(), color: "#059669" },
              { label: "Tax Mappings", value: selectedRecord.taxMappingCount > 0 ? selectedRecord.taxMappingCount.toLocaleString() : "—", color: "#D97706" },
              { label: "Tax Decisions", value: selectedRecord.taxDecisionCount > 0 ? selectedRecord.taxDecisionCount.toLocaleString() : "—", color: "#DC2626" },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

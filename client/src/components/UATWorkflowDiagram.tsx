// UATWorkflowDiagram — Executive-quality iterative UAT process diagram
// Swimlane layout: Business | Business Analyst | Development | Roger (Application)
// RSM color palette: navy, blue, slate, green, teal

export default function UATWorkflowDiagram() {
  // ── Design tokens ──────────────────────────────────────────────────────────
  const NAVY    = "#0f2744";
  const BLUE    = "#1a56db";
  const GREEN   = "#065f46";
  const TEAL    = "#0d9488";
  const SLATE   = "#64748b";
  const GRAY_BG = "#f8fafc";
  const BORDER  = "#e2e8f0";

  // Canvas dimensions
  const W = 900;
  const H = 660;

  // Swimlane config
  const LANE_HEADER_W = 110;
  const LANE_H = (H - 60) / 4; // 4 lanes, 60px for top header row
  const TOP = 60; // y start of swimlanes

  const lanes = [
    { label: "Business",          color: "#eff6ff", headerColor: BLUE,  textColor: "white" },
    { label: "Business Analyst",  color: "#f0fdf4", headerColor: GREEN, textColor: "white" },
    { label: "Development",       color: "#f8fafc", headerColor: NAVY,  textColor: "white" },
    { label: "Roger (Application)", color: "#f0fdfa", headerColor: TEAL, textColor: "white" },
  ];

  // ── Node helper ────────────────────────────────────────────────────────────
  // Rounded rectangle node
  function Node({
    x, y, w = 130, h = 44, label, sub, fill = "white", stroke = BORDER,
    textColor = NAVY, bold = false, fontSize = 11.5,
  }: {
    x: number; y: number; w?: number; h?: number; label: string; sub?: string;
    fill?: string; stroke?: string; textColor?: string; bold?: boolean; fontSize?: number;
  }) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={8} ry={8}
          fill={fill} stroke={stroke} strokeWidth={1.5} />
        <text x={x + w / 2} y={y + (sub ? h / 2 - 5 : h / 2 + 1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} fontWeight={bold ? 700 : 600} fill={textColor}
          fontFamily="system-ui, -apple-system, sans-serif">
          {label}
        </text>
        {sub && (
          <text x={x + w / 2} y={y + h / 2 + 10}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9.5} fontWeight={400} fill={SLATE}
            fontFamily="system-ui, -apple-system, sans-serif">
            {sub}
          </text>
        )}
      </g>
    );
  }

  // Diamond decision node
  function Diamond({
    cx, cy, w = 90, h = 50, label, sub,
  }: {
    cx: number; cy: number; w?: number; h?: number; label: string; sub?: string;
  }) {
    const pts = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
    return (
      <g>
        <polygon points={pts} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fontWeight={700} fill="#92400e"
          fontFamily="system-ui, -apple-system, sans-serif">
          {label}
        </text>
        {sub && (
          <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={400} fill="#78350f"
            fontFamily="system-ui, -apple-system, sans-serif">
            {sub}
          </text>
        )}
      </g>
    );
  }

  // Arrow connector
  function Arrow({
    x1, y1, x2, y2, label, labelX, labelY, dashed = false, color = "#94a3b8",
  }: {
    x1: number; y1: number; x2: number; y2: number;
    label?: string; labelX?: number; labelY?: number;
    dashed?: boolean; color?: string;
  }) {
    const id = `arrow-${x1}-${y1}-${x2}-${y2}`;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={color} />
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={1.5}
          strokeDasharray={dashed ? "5,4" : undefined}
          markerEnd={`url(#${id})`} />
        {label && (
          <text x={labelX ?? (x1 + x2) / 2} y={labelY ?? (y1 + y2) / 2 - 5}
            textAnchor="middle" fontSize={9} fontWeight={600} fill={color}
            fontFamily="system-ui, -apple-system, sans-serif">
            {label}
          </text>
        )}
      </g>
    );
  }

  // Curved path connector
  function CurvedArrow({
    d, label, labelX, labelY, color = "#94a3b8", dashed = false,
  }: {
    d: string; label?: string; labelX?: number; labelY?: number;
    color?: string; dashed?: boolean;
  }) {
    const id = `carrow-${d.slice(0, 10).replace(/\s/g, "")}`;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={color} />
          </marker>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth={1.5}
          strokeDasharray={dashed ? "5,4" : undefined}
          markerEnd={`url(#${id})`} />
        {label && (
          <text x={labelX} y={labelY} textAnchor="middle" fontSize={9}
            fontWeight={600} fill={color}
            fontFamily="system-ui, -apple-system, sans-serif">
            {label}
          </text>
        )}
      </g>
    );
  }

  // ── Layout constants ───────────────────────────────────────────────────────
  // Column x-centers (content area starts at LANE_HEADER_W)
  const CONTENT_W = W - LANE_HEADER_W;
  // 5 columns across content area
  const COL = (i: number) => LANE_HEADER_W + (CONTENT_W / 5) * i + CONTENT_W / 10;
  // Lane y-centers
  const LANE_Y = (i: number) => TOP + LANE_H * i + LANE_H / 2;

  // Node dimensions
  const NW = 130; const NH = 44;
  const NW_SM = 110; const NH_SM = 40;

  return (
    <div style={{
      backgroundColor: "white", border: "1px solid #e2e8f0",
      borderRadius: 12, padding: "24px 20px", overflowX: "auto",
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SLATE, marginBottom: 3 }}>
          Process Diagram
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>
          UAT Iterative Validation Cycle
        </div>
        <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>
          Master Data validation continues until Business Sign-Off is achieved
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}
        xmlns="http://www.w3.org/2000/svg">

        {/* ── Background ── */}
        <rect width={W} height={H} fill={GRAY_BG} rx={10} />

        {/* ── Swimlane backgrounds ── */}
        {lanes.map((lane, i) => (
          <rect key={i}
            x={LANE_HEADER_W} y={TOP + LANE_H * i}
            width={CONTENT_W} height={LANE_H}
            fill={lane.color} stroke={BORDER} strokeWidth={0.5} />
        ))}

        {/* ── Swimlane header column ── */}
        <rect x={0} y={TOP} width={LANE_HEADER_W} height={H - TOP} fill={NAVY} rx={0} />
        {lanes.map((lane, i) => (
          <g key={i}>
            <rect x={0} y={TOP + LANE_H * i} width={LANE_HEADER_W} height={LANE_H}
              fill={lane.headerColor} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            <text
              x={LANE_HEADER_W / 2}
              y={TOP + LANE_H * i + LANE_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10.5} fontWeight={700} fill="white"
              fontFamily="system-ui, -apple-system, sans-serif"
              transform={`rotate(-90, ${LANE_HEADER_W / 2}, ${TOP + LANE_H * i + LANE_H / 2})`}>
              {lane.label}
            </text>
          </g>
        ))}

        {/* ── Top header bar ── */}
        <rect x={0} y={0} width={W} height={TOP} fill={NAVY} rx={10} />
        <rect x={0} y={40} width={W} height={20} fill={NAVY} />
        <text x={W / 2} y={30} textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fontWeight={800} fill="white"
          fontFamily="system-ui, -apple-system, sans-serif">
          DCT Platform · UAT Master Data Validation Process
        </text>

        {/* ────────────────────────────────────────────────────────────────────
            NODES
            Lane 0 (Business)     — y center: LANE_Y(0)
            Lane 1 (BA)           — y center: LANE_Y(1)
            Lane 2 (Development)  — y center: LANE_Y(2)
            Lane 3 (Roger)        — y center: LANE_Y(3)
        ──────────────────────────────────────────────────────────────────── */}

        {/* Col 1: Master Data Workbook (BA lane) */}
        <Node x={COL(0) - NW / 2} y={LANE_Y(1) - NH / 2}
          w={NW} h={NH} label="Master Data" sub="Workbook (Source of Truth)"
          fill={GREEN} stroke={GREEN} textColor="white" bold />

        {/* Col 1: Business updates workbook (Business lane) */}
        <Node x={COL(0) - NW_SM / 2} y={LANE_Y(0) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Business Input" sub="Data Requirements"
          fill="white" stroke={BLUE} textColor={NAVY} />

        {/* Arrow: Business → Workbook */}
        <Arrow x1={COL(0)} y1={LANE_Y(0) + NH_SM / 2}
               x2={COL(0)} y2={LANE_Y(1) - NH / 2 - 4}
               color={BLUE} />

        {/* Col 2: Initial Data Load (Development lane) */}
        <Node x={COL(1) - NW_SM / 2} y={LANE_Y(2) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Initial Data Load" sub="Dev loads into Roger"
          fill="white" stroke={NAVY} textColor={NAVY} />

        {/* Arrow: Workbook → Initial Load (diagonal) */}
        <Arrow x1={COL(0) + NW / 2} y1={LANE_Y(1)}
               x2={COL(1) - NW_SM / 2 - 4} y2={LANE_Y(2)}
               color={SLATE} />

        {/* Col 2: Roger Database (Roger lane) */}
        <Node x={COL(1) - NW_SM / 2} y={LANE_Y(3) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Roger Database" sub="Data Loaded"
          fill={TEAL} stroke={TEAL} textColor="white" bold />

        {/* Arrow: Initial Load → Roger DB */}
        <Arrow x1={COL(1)} y1={LANE_Y(2) + NH_SM / 2}
               x2={COL(1)} y2={LANE_Y(3) - NH_SM / 2 - 4}
               color={TEAL} />

        {/* Col 3: Business Validation (Business lane) — CENTRAL ACTIVITY */}
        <Node x={COL(2) - (NW + 10) / 2} y={LANE_Y(0) - (NH + 6) / 2}
          w={NW + 10} h={NH + 6} label="Business Validation" sub="UAT Testing"
          fill={BLUE} stroke={BLUE} textColor="white" bold fontSize={12} />

        {/* Arrow: Roger DB → Business Validation */}
        <Arrow x1={COL(1) + NW_SM / 2} y1={LANE_Y(3)}
               x2={COL(2) - (NW + 10) / 2 - 4} y2={LANE_Y(0) + (NH + 6) / 4}
               color={TEAL} />

        {/* Col 3: Log Defects (Business lane — below validation) */}
        <Node x={COL(2) - NW_SM / 2} y={LANE_Y(1) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Log Defects" sub="Issues Identified"
          fill="white" stroke="#dc2626" textColor="#991b1b" />

        {/* Arrow: Business Validation → Log Defects */}
        <Arrow x1={COL(2)} y1={LANE_Y(0) + (NH + 6) / 2}
               x2={COL(2)} y2={LANE_Y(1) - NH_SM / 2 - 4}
               color="#dc2626" />

        {/* Col 3: Review & Triage (BA lane) */}
        <Node x={COL(2) - NW_SM / 2} y={LANE_Y(1) + NH_SM / 2 + 8}
          w={NW_SM} h={NH_SM} label="Review & Triage" sub="BA + Dev + Business"
          fill="white" stroke={GREEN} textColor={GREEN} />

        {/* Arrow: Log Defects → Review */}
        <Arrow x1={COL(2)} y1={LANE_Y(1) + NH_SM / 2}
               x2={COL(2)} y2={LANE_Y(1) + NH_SM / 2 + 8 - 4}
               color={SLATE} />

        {/* Col 4: Decision Diamond (BA lane) */}
        <Diamond cx={COL(3)} cy={LANE_Y(1) + NH_SM / 2 + 8 + NH_SM / 2 + 30}
          w={100} h={54} label="Changes" sub="Required?" />

        {/* Arrow: Review → Decision */}
        <Arrow x1={COL(2) + NW_SM / 2} y1={LANE_Y(1) + NH_SM / 2 + 8 + NH_SM / 2}
               x2={COL(3) - 50 - 4} y2={LANE_Y(1) + NH_SM / 2 + 8 + NH_SM / 2 + 30}
               color={SLATE} />

        {/* ── NO branch → Business Sign-Off ── */}
        {/* Col 5: Business Sign-Off (Business lane) */}
        <Node x={COL(4) - NW / 2} y={LANE_Y(0) - NH / 2}
          w={NW} h={NH} label="Business Sign-Off" sub="Approval Granted"
          fill={GREEN} stroke={GREEN} textColor="white" bold />

        {/* Col 5: UAT Complete */}
        <Node x={COL(4) - NW_SM / 2} y={LANE_Y(1) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="UAT Complete" sub="Ready for Production"
          fill={NAVY} stroke={NAVY} textColor="white" bold />

        {/* Arrow: Decision → Sign-Off (NO) */}
        <Arrow x1={COL(3) + 50} y1={LANE_Y(1) + NH_SM / 2 + 8 + NH_SM / 2 + 30}
               x2={COL(4) - NW / 2 - 4} y2={LANE_Y(0) + NH / 4}
               color={GREEN} label="No Changes" labelX={COL(3) + 100} labelY={LANE_Y(1) + 20} />

        {/* Arrow: Sign-Off → UAT Complete */}
        <Arrow x1={COL(4)} y1={LANE_Y(0) + NH / 2}
               x2={COL(4)} y2={LANE_Y(1) - NH_SM / 2 - 4}
               color={GREEN} />

        {/* ── YES branch → Update Workbook ── */}
        {/* Col 4: Update Workbook (BA lane — below decision) */}
        <Node x={COL(3) - NW_SM / 2} y={LANE_Y(2) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Update Workbook" sub="BA approves change"
          fill="white" stroke={GREEN} textColor={GREEN} />

        {/* Arrow: Decision → Update Workbook (YES) */}
        <Arrow x1={COL(3)} y1={LANE_Y(1) + NH_SM / 2 + 8 + NH_SM / 2 + 30 + 27}
               x2={COL(3)} y2={LANE_Y(2) - NH_SM / 2 - 4}
               color="#d97706" label="Changes Required" labelX={COL(3) + 55} labelY={LANE_Y(2) - 20} />

        {/* Col 3-4: Reload Strategy decision (Development lane) */}
        <Diamond cx={COL(3)} cy={LANE_Y(2) + NH_SM / 2 + 30}
          w={100} h={48} label="Reload" sub="Strategy?" />

        {/* Arrow: Update Workbook → Reload Strategy */}
        <Arrow x1={COL(3)} y1={LANE_Y(2) + NH_SM / 2}
               x2={COL(3)} y2={LANE_Y(2) + NH_SM / 2 + 30 - 24 - 4}
               color={SLATE} />

        {/* Col 2: Partial Reload (Development lane) */}
        <Node x={COL(2) - NW_SM / 2} y={LANE_Y(2) + NH_SM / 2 + 30 - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Partial Reload" sub="Targeted records"
          fill="white" stroke={NAVY} textColor={NAVY} />

        {/* Arrow: Reload Strategy → Partial */}
        <Arrow x1={COL(3) - 50} y1={LANE_Y(2) + NH_SM / 2 + 30}
               x2={COL(2) + NW_SM / 2 + 4} y2={LANE_Y(2) + NH_SM / 2 + 30}
               color={NAVY} label="Partial" labelX={COL(2) + NW_SM / 2 + 40} labelY={LANE_Y(2) + NH_SM / 2 + 22} />

        {/* Col 4: Full Reload (Development lane) */}
        <Node x={COL(4) - NW_SM / 2} y={LANE_Y(2) + NH_SM / 2 + 30 - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Full Reload" sub="Complete dataset"
          fill="white" stroke={NAVY} textColor={NAVY} />

        {/* Arrow: Reload Strategy → Full */}
        <Arrow x1={COL(3) + 50} y1={LANE_Y(2) + NH_SM / 2 + 30}
               x2={COL(4) - NW_SM / 2 - 4} y2={LANE_Y(2) + NH_SM / 2 + 30}
               color={NAVY} label="Full" labelX={COL(4) - NW_SM / 2 - 30} labelY={LANE_Y(2) + NH_SM / 2 + 22} />

        {/* Both reload paths converge to Roger (Roger lane) */}
        {/* Reload Roger (Roger lane) */}
        <Node x={COL(3) - NW_SM / 2} y={LANE_Y(3) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Reload Roger" sub="Data refreshed"
          fill={TEAL} stroke={TEAL} textColor="white" bold />

        {/* Arrow: Partial Reload → Reload Roger */}
        <CurvedArrow
          d={`M ${COL(2)} ${LANE_Y(2) + NH_SM / 2 + 30 + NH_SM / 2} Q ${COL(2)} ${LANE_Y(3)} ${COL(3) - NW_SM / 2 - 4} ${LANE_Y(3)}`}
          color={TEAL} />

        {/* Arrow: Full Reload → Reload Roger */}
        <CurvedArrow
          d={`M ${COL(4)} ${LANE_Y(2) + NH_SM / 2 + 30 + NH_SM / 2} Q ${COL(4)} ${LANE_Y(3)} ${COL(3) + NW_SM / 2 + 4} ${LANE_Y(3)}`}
          color={TEAL} />

        {/* Business Revalidation (Business lane, col 3) */}
        <Node x={COL(3) - NW_SM / 2} y={LANE_Y(0) - NH_SM / 2}
          w={NW_SM} h={NH_SM} label="Business Revalidation" sub="Re-test affected data"
          fill="white" stroke={BLUE} textColor={NAVY} />

        {/* Arrow: Reload Roger → Business Revalidation */}
        <Arrow x1={COL(3)} y1={LANE_Y(3) - NH_SM / 2}
               x2={COL(3)} y2={LANE_Y(0) + NH_SM / 2 + 4}
               color={TEAL} />

        {/* Feedback loop: Business Revalidation → Business Validation (curved, iterative) */}
        <CurvedArrow
          d={`M ${COL(3) - NW_SM / 2} ${LANE_Y(0)} Q ${COL(2) + 20} ${TOP + 10} ${COL(2) + (NW + 10) / 2} ${LANE_Y(0) - (NH + 6) / 2 - 4}`}
          color={BLUE} dashed label="Iterate" labelX={COL(2) + 60} labelY={TOP + 20} />

        {/* ── Legend ── */}
        <g transform={`translate(${LANE_HEADER_W + 10}, ${H - 30})`}>
          <rect x={0} y={0} width={8} height={8} rx={2} fill={GREEN} />
          <text x={12} y={7} fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">Approved / Complete</text>
          <rect x={90} y={0} width={8} height={8} rx={2} fill={BLUE} />
          <text x={102} y={7} fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">Business Activity</text>
          <rect x={195} y={0} width={8} height={8} rx={2} fill={TEAL} />
          <text x={207} y={7} fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">Application / Data</text>
          <rect x={295} y={0} width={8} height={8} rx={2} fill="#fde68a" stroke="#d97706" strokeWidth={1} />
          <text x={307} y={7} fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">Decision Point</text>
          <line x1={395} y1={4} x2={415} y2={4} stroke={BLUE} strokeWidth={1.5} strokeDasharray="4,3" />
          <text x={420} y={7} fontSize={9} fill={SLATE} fontFamily="system-ui, sans-serif">Iterative Feedback Loop</text>
        </g>

      </svg>

      {/* Caption */}
      <div style={{ marginTop: 12, fontSize: 11, color: SLATE, textAlign: "center" }}>
        UAT is a controlled, iterative process. Validation continues until all defects are resolved and Business Sign-Off is achieved.
      </div>
    </div>
  );
}

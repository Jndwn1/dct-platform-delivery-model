// UATWorkflowDiagram — Executive-quality UAT process diagram
// RSM brand: Navy #0F2D52, Blue #2E6EBE, Light Blue #DCE9F8, Slate #5E6A71
// Layout: vertical main flow with YES branch splitting right, NO branch going down-left
// Matches the exact ASCII flow provided by Jenniver Stafford

export default function UATWorkflowDiagram() {
  // ── RSM Design tokens ──────────────────────────────────────────────────────
  const NAVY    = "#0F2D52";
  const BLUE    = "#2E6EBE";
  const LBLUE   = "#DCE9F8";
  const SLATE   = "#5E6A71";
  const LGRAY   = "#F5F7FA";
  const GREEN   = "#2E8B57";
  const GOLD    = "#D4A017";
  const PURPLE  = "#6F42C1";
  const BORDER  = "#D1DCE8";

  // Canvas
  const W = 860;
  const H = 820;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function Box({
    x, y, w = 160, h = 64, label, sub, owner,
    fill = "white", stroke = BORDER, textColor = NAVY,
    subColor, ownerColor,
    bold = false, accent = false,
  }: {
    x: number; y: number; w?: number; h?: number;
    label: string; sub?: string; owner?: string;
    fill?: string; stroke?: string; textColor?: string;
    subColor?: string; ownerColor?: string;
    bold?: boolean; accent?: boolean;
  }) {
    return (
      <g filter="url(#shadow)">
        <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
          fill={fill} stroke={stroke} strokeWidth={accent ? 2 : 1.5} />
        <text x={x + w / 2} y={y + (sub ? (owner ? h / 2 - 12 : h / 2 - 8) : h / 2 + 1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={bold ? 13 : 12.5} fontWeight={bold ? 800 : 700} fill={textColor}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {label}
        </text>
        {sub && (
          <text x={x + w / 2} y={y + (owner ? h / 2 + 4 : h / 2 + 11)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight={400} fill={subColor ?? SLATE}
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {sub}
          </text>
        )}
        {owner && (
          <text x={x + w / 2} y={y + h / 2 + 18}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={600} fill={ownerColor ?? BLUE}
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {owner}
          </text>
        )}
      </g>
    );
  }

  function Diamond({
    cx, cy, w = 100, h = 56, label, sub,
  }: {
    cx: number; cy: number; w?: number; h?: number; label: string; sub?: string;
  }) {
    const pts = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
    return (
      <g filter="url(#shadow)">
        <polygon points={pts} fill="#FFFBEA" stroke={GOLD} strokeWidth={2} />
        <text x={cx} y={cy - (sub ? 6 : 2)} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={800} fill="#7A5C00"
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {label}
        </text>
        {sub && (
          <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
            fontSize={9.5} fontWeight={500} fill="#9A7000"
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {sub}
          </text>
        )}
      </g>
    );
  }

  // Straight arrow with arrowhead
  function Arrow({
    x1, y1, x2, y2, color = SLATE, label, lx, ly, dashed = false,
  }: {
    x1: number; y1: number; x2: number; y2: number;
    color?: string; label?: string; lx?: number; ly?: number; dashed?: boolean;
  }) {
    const id = `ah-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}`;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill={color} />
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={1.5}
          strokeDasharray={dashed ? "6,4" : undefined}
          markerEnd={`url(#${id})`} />
        {label && (
          <text x={lx ?? (x1 + x2) / 2} y={ly ?? (y1 + y2) / 2 - 6}
            textAnchor="middle" fontSize={9.5} fontWeight={700} fill={color}
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {label}
          </text>
        )}
      </g>
    );
  }

  // Curved path arrow
  function PathArrow({
    d, color = SLATE, label, lx, ly, dashed = false,
  }: {
    d: string; color?: string; label?: string; lx?: number; ly?: number; dashed?: boolean;
  }) {
    const id = `ph-${d.replace(/\s/g, "").slice(0, 12)}`;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill={color} />
          </marker>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth={1.5}
          strokeDasharray={dashed ? "6,4" : undefined}
          markerEnd={`url(#${id})`} />
        {label && (
          <text x={lx} y={ly} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={color}
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {label}
          </text>
        )}
      </g>
    );
  }

  // ── Layout constants ───────────────────────────────────────────────────────
  // Main vertical spine: centered at x = 200
  const MX = 200;   // main column center
  const BW = 168;   // box width (main)
  const BH = 64;    // box height
  const BW_SM = 148; const BH_SM = 58; // smaller boxes

  // YES branch column: x = 560
  const YX = 560;
  const BW_Y = 160; const BH_Y = 58;

  // Vertical positions (y top of each box)
  const Y1  = 40;   // Master Data Workbook
  const Y2  = 164;  // Initial Load
  const Y3  = 288;  // Business Validation
  const YD  = 400;  // Decision diamond center y
  const Y_NO_SIGNOFF = 470;  // Sign-Off (NO branch, main column)
  const Y_NO_COMPLETE = 572; // UAT Complete
  const Y_YES_TRIAGE  = 340; // Review & Triage (YES branch)
  const Y_YES_UPDATE  = 440; // Update Workbook
  const Y_YES_RELOAD_D = 530; // Reload Strategy diamond center y
  const Y_YES_PARTIAL = 600; // Partial / Full Reload row
  const Y_YES_ROGER   = 680; // Reload Roger
  const Y_YES_REVAL   = 750; // Business Revalidation

  return (
    <div style={{
      backgroundColor: "white",
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: "28px 24px 20px",
      boxShadow: "0 2px 12px rgba(15,45,82,0.07)",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: BLUE, marginBottom: 4,
        }}>
          Process Diagram · UAT Governance
        </div>
        <div style={{
          fontSize: 18, fontWeight: 800, color: NAVY,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          UAT Iterative Validation Cycle
        </div>
        <div style={{ fontSize: 12, color: SLATE, marginTop: 3 }}>
          Master data validation continues until Business Sign-Off is achieved
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
        style={{ maxWidth: W, display: "block", overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg">

        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(15,45,82,0.10)" />
          </filter>
        </defs>

        {/* ── MAIN SPINE ─────────────────────────────────────────────────── */}

        {/* 1. Master Data Workbook */}
        <Box x={MX - BW / 2} y={Y1} w={BW} h={BH}
          label="Master Data Workbook" sub="Authoritative Source of Truth"
          owner="Business Analyst"
          fill={LBLUE} stroke={BLUE} textColor={NAVY} bold accent />

        {/* Arrow 1→2 */}
        <Arrow x1={MX} y1={Y1 + BH} x2={MX} y2={Y2 - 6} color={SLATE} />

        {/* 2. Initial Load */}
        <Box x={MX - BW / 2} y={Y2} w={BW} h={BH}
          label="Initial Load into Roger" sub="Master Data Ingestion"
          owner="Development"
          fill="white" stroke={BORDER} textColor={NAVY} />

        {/* Arrow 2→3 */}
        <Arrow x1={MX} y1={Y2 + BH} x2={MX} y2={Y3 - 6} color={SLATE} />

        {/* 3. Business Validation — PRIMARY */}
        <Box x={MX - (BW + 16) / 2} y={Y3} w={BW + 16} h={BH + 4}
          label="Business Validation" sub="User Acceptance Testing"
          owner="Business"
          fill={BLUE} stroke={BLUE} textColor="#FFFFFF" subColor="#DCE9F8" ownerColor="#DCE9F8" bold accent />

        {/* Arrow 3→Decision */}
        <Arrow x1={MX} y1={Y3 + BH + 4} x2={MX} y2={YD - 28 - 6} color={SLATE} />

        {/* Decision Diamond */}
        <Diamond cx={MX} cy={YD} w={130} h={56} label="Changes Required?" />

        {/* ── NO BRANCH (straight down) ──────────────────────────────────── */}
        <Arrow x1={MX} y1={YD + 28} x2={MX} y2={Y_NO_SIGNOFF - 6}
          color={GREEN} label="No" lx={MX + 18} ly={YD + 48} />

        {/* Sign-Off */}
        <Box x={MX - BW_SM / 2} y={Y_NO_SIGNOFF} w={BW_SM} h={BH_SM}
          label="Business Sign-Off" sub="Business Approval"
          fill="#F0FDF4" stroke={GREEN} textColor={GREEN} bold accent />

        {/* Arrow Sign-Off → Complete */}
        <Arrow x1={MX} y1={Y_NO_SIGNOFF + BH_SM} x2={MX} y2={Y_NO_COMPLETE - 6} color={GREEN} />

        {/* UAT Complete */}
        <Box x={MX - BW_SM / 2} y={Y_NO_COMPLETE} w={BW_SM} h={BH_SM}
          label="UAT Complete" sub="Ready for Production"
          fill={GREEN} stroke={GREEN} textColor="#FFFFFF" subColor="#D1FAE5" bold accent />

        {/* ── YES BRANCH (right column) ──────────────────────────────────── */}
        {/* Arrow Decision → Review & Triage (right) */}
        <Arrow x1={MX + 65} y1={YD} x2={YX - BW_Y / 2 - 6} y2={Y_YES_TRIAGE + BH_Y / 2}
          color={PURPLE} label="Yes" lx={MX + 120} ly={YD - 10} />

        {/* Review & Triage */}
        <Box x={YX - BW_Y / 2} y={Y_YES_TRIAGE} w={BW_Y} h={BH_Y}
          label="Review & Triage" sub="Business + BA + Development"
          fill="white" stroke={BORDER} textColor={NAVY} />

        {/* Arrow Triage → Update Workbook */}
        <Arrow x1={YX} y1={Y_YES_TRIAGE + BH_Y} x2={YX} y2={Y_YES_UPDATE - 6} color={SLATE} />

        {/* Update Workbook */}
        <Box x={YX - BW_Y / 2} y={Y_YES_UPDATE} w={BW_Y} h={BH_Y}
          label="Update Master Data" sub="Approved Changes"
          fill="#F5F0FF" stroke={PURPLE} textColor={PURPLE} />

        {/* Arrow Update → Reload Strategy */}
        <Arrow x1={YX} y1={Y_YES_UPDATE + BH_Y} x2={YX} y2={Y_YES_RELOAD_D - 28 - 6} color={SLATE} />

        {/* Reload Strategy diamond */}
        <Diamond cx={YX} cy={Y_YES_RELOAD_D} w={120} h={50} label="Reload Strategy" />

        {/* Partial Reload (left of diamond) */}
        <Arrow x1={YX - 60} y1={Y_YES_RELOAD_D}
               x2={YX - 100} y2={Y_YES_PARTIAL + BH_SM / 2}
               color={SLATE} label="Partial" lx={YX - 100} ly={Y_YES_RELOAD_D + 20} />
        <Box x={YX - 100 - BW_SM / 2} y={Y_YES_PARTIAL} w={BW_SM} h={BH_SM}
          label="Partial Reload" sub="Targeted records"
          fill="white" stroke={BORDER} textColor={NAVY} />

        {/* Full Reload (right of diamond) */}
        <Arrow x1={YX + 60} y1={Y_YES_RELOAD_D}
               x2={YX + 100} y2={Y_YES_PARTIAL + BH_SM / 2}
               color={SLATE} label="Full" lx={YX + 100} ly={Y_YES_RELOAD_D + 20} />
        <Box x={YX + 100 - BW_SM / 2} y={Y_YES_PARTIAL} w={BW_SM} h={BH_SM}
          label="Full Reload" sub="Complete dataset"
          fill="white" stroke={BORDER} textColor={NAVY} />

        {/* Both converge down to Reload Roger */}
        <PathArrow
          d={`M ${YX - 100} ${Y_YES_PARTIAL + BH_SM} L ${YX - 100} ${Y_YES_ROGER + BH_SM / 2} L ${YX - BW_Y / 2 - 4} ${Y_YES_ROGER + BH_SM / 2}`}
          color={SLATE} />
        <PathArrow
          d={`M ${YX + 100} ${Y_YES_PARTIAL + BH_SM} L ${YX + 100} ${Y_YES_ROGER + BH_SM / 2} L ${YX + BW_Y / 2 + 4} ${Y_YES_ROGER + BH_SM / 2}`}
          color={SLATE} />

        {/* Reload Roger */}
        <Box x={YX - BW_Y / 2} y={Y_YES_ROGER} w={BW_Y} h={BH_SM}
          label="Reload Roger" sub="Data Refreshed"
          fill={LBLUE} stroke={BLUE} textColor={NAVY} />

        {/* Arrow Reload Roger → Business Revalidation */}
        <Arrow x1={YX} y1={Y_YES_ROGER + BH_SM} x2={YX} y2={Y_YES_REVAL - 6} color={SLATE} />

        {/* Business Revalidation */}
        <Box x={YX - BW_Y / 2} y={Y_YES_REVAL} w={BW_Y} h={BH_SM}
          label="Business Revalidation" sub="Re-test Affected Data"
          fill={LBLUE} stroke={BLUE} textColor={NAVY} />

        {/* ── FEEDBACK LOOP: Revalidation → Business Validation ─────────── */}
        {/* Single clean curved arrow going left from Revalidation back up to Business Validation */}
        <PathArrow
          d={`M ${YX - BW_Y / 2} ${Y_YES_REVAL + BH_SM / 2}
              C ${YX - BW_Y / 2 - 80} ${Y_YES_REVAL + BH_SM / 2},
                ${MX + BW / 2 + 80} ${Y3 + BH / 2},
                ${MX + (BW + 16) / 2 + 4} ${Y3 + (BH + 4) / 2}`}
          color={BLUE} dashed
          label="Iterate until Sign-Off"
          lx={(YX - BW_Y / 2 + MX + BW / 2) / 2 + 10}
          ly={Y_YES_REVAL - 18} />

        {/* ── LEGEND ─────────────────────────────────────────────────────── */}
        <g transform={`translate(20, ${H - 42})`}>
          <rect x={0} y={6} width={10} height={10} rx={2} fill={BLUE} />
          <text x={14} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Primary Activity</text>

          <rect x={110} y={6} width={10} height={10} rx={2} fill={GREEN} />
          <text x={124} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Approval / Complete</text>

          <rect x={240} y={6} width={10} height={10} rx={2} fill={PURPLE} />
          <text x={254} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Change Required</text>

          <polygon points="360,6 366,11 360,16 354,11" fill="#FFFBEA" stroke={GOLD} strokeWidth={1.5} />
          <text x={372} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Decision Point</text>

          <line x1={470} y1={11} x2={492} y2={11} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5,3" />
          <text x={496} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Iterative Loop</text>
        </g>

      </svg>

      {/* Footer */}
      <div style={{
        marginTop: 16,
        padding: "10px 16px",
        backgroundColor: LGRAY,
        borderRadius: 8,
        borderLeft: `3px solid ${BLUE}`,
        fontSize: 11,
        color: SLATE,
        lineHeight: 1.6,
        fontStyle: "italic",
      }}>
        <strong style={{ color: NAVY, fontStyle: "normal" }}>Governance Note: </strong>
        The Master Data Workbook serves as the authoritative source of truth. Master data changes are managed through a controlled UAT process until Business Sign-Off is achieved.
      </div>
    </div>
  );
}

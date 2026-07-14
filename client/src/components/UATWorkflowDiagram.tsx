// UATWorkflowDiagram — Architecture-accurate UAT Iterative Validation Cycle
// Reflects the revised 6-step Change Control process with:
//   • BA Impact Assessment governance box (new, prominent)
//   • Three-way Reload Strategy decision (Partial / Coordinated Partial / Full)
//   • Merged Validation Before UAT Resumes checkpoint
//   • Dashed iterative loop back to Business Validation
// RSM brand: Navy #0F2D52, Blue #2E6EBE, Light Blue #DCE9F8, Slate #5E6A71

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

  // Reload strategy colors (per spec)
  const PARTIAL_BLUE   = "#1D4ED8";  // Partial Reload
  const COORD_ORANGE   = "#C2410C";  // Coordinated Partial Reload
  const FULL_RED       = "#BE123C";  // Full Reload

  // Canvas — wider and taller to accommodate 3-branch layout
  const W = 1060;
  const H = 1340;

  // ── Helpers ────────────────────────────────────────────────────────────────
  // Multi-line text helper
  function TextLines({
    x, y, lines, fontSize = 10.5, fill = SLATE, fontWeight = 400, lineH = 14,
  }: {
    x: number; y: number;
    lines: string[];
    fontSize?: number; fill?: string; fontWeight?: number; lineH?: number;
  }) {
    return (
      <>
        {lines.map((line, i) => (
          <text key={i}
            x={x} y={y + i * lineH}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fontWeight={fontWeight} fill={fill}
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {line}
          </text>
        ))}
      </>
    );
  }

  // Standard box
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

  // Governance box — large, with bullet list inside
  function GovernanceBox({
    x, y, w, h, title, subtitle, bullets,
  }: {
    x: number; y: number; w: number; h: number;
    title: string; subtitle: string; bullets: string[];
  }) {
    const lineH = 13.5;
    const bulletStartY = y + 44;
    return (
      <g filter="url(#shadow)">
        {/* Outer border — amber/gold to signal governance */}
        <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
          fill="#FFFDF0" stroke={GOLD} strokeWidth={2.5} />
        {/* Header band */}
        <rect x={x} y={y} width={w} height={30} rx={10} ry={10}
          fill="#FEF3C7" stroke="none" />
        <rect x={x} y={y + 20} width={w} height={10} fill="#FEF3C7" stroke="none" />
        {/* Title */}
        <text x={x + w / 2} y={y + 15}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={12} fontWeight={800} fill="#78350F"
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {title}
        </text>
        {/* Subtitle */}
        <text x={x + w / 2} y={y + 38}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fontWeight={400} fill={SLATE}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {subtitle}
        </text>
        {/* Bullets */}
        {bullets.map((b, i) => (
          <g key={i}>
            <circle cx={x + 16} cy={bulletStartY + 10 + i * lineH} r={2.5} fill={GOLD} />
            <text x={x + 24} y={bulletStartY + 10 + i * lineH}
              dominantBaseline="middle"
              fontSize={10} fontWeight={400} fill="#1E293B"
              fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
              {b}
            </text>
          </g>
        ))}
      </g>
    );
  }

  // Small reload column box with color-coded header band
  function ReloadBox({
    x, y, w, h, title, desc, bullets, note,
    headerFill, headerText, bodyFill, bodyStroke,
  }: {
    x: number; y: number; w: number; h: number;
    title: string; desc: string; bullets: string[]; note?: string;
    headerFill: string; headerText: string; bodyFill: string; bodyStroke: string;
  }) {
    const lineH = 13;
    const bulletStartY = y + 54;
    return (
      <g filter="url(#shadow)">
        <rect x={x} y={y} width={w} height={h} rx={8} ry={8}
          fill={bodyFill} stroke={bodyStroke} strokeWidth={1.5} />
        {/* Header band */}
        <rect x={x} y={y} width={w} height={26} rx={8} ry={8}
          fill={headerFill} stroke="none" />
        <rect x={x} y={y + 16} width={w} height={10} fill={headerFill} stroke="none" />
        {/* Title */}
        <text x={x + w / 2} y={y + 13}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={10.5} fontWeight={800} fill={headerText}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {title}
        </text>
        {/* Desc */}
        <text x={x + w / 2} y={y + 40}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9.5} fontWeight={400} fill={SLATE}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {desc}
        </text>
        {/* Bullets */}
        {bullets.map((b, i) => (
          <g key={i}>
            <circle cx={x + 12} cy={bulletStartY + i * lineH} r={2} fill={bodyStroke} />
            <text x={x + 20} y={bulletStartY + i * lineH}
              dominantBaseline="middle"
              fontSize={9.5} fontWeight={400} fill="#1E293B"
              fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
              {b}
            </text>
          </g>
        ))}
        {note && (
          <text x={x + w / 2} y={y + h - 10}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={500} fill={bodyStroke} fontStyle="italic"
            fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
            {note}
          </text>
        )}
      </g>
    );
  }

  // Validation checkpoint box with checkmarks
  function ValidationBox({
    x, y, w, h, title, subtitle, checks,
  }: {
    x: number; y: number; w: number; h: number;
    title: string; subtitle: string; checks: string[];
  }) {
    const lineH = 14;
    const checkStartY = y + 46;
    return (
      <g filter="url(#shadow)">
        <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
          fill="#F0FDF4" stroke={GREEN} strokeWidth={2} />
        {/* Header band */}
        <rect x={x} y={y} width={w} height={28} rx={10} ry={10}
          fill={GREEN} stroke="none" />
        <rect x={x} y={y + 18} width={w} height={10} fill={GREEN} stroke="none" />
        <text x={x + w / 2} y={y + 14}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={12} fontWeight={800} fill="white"
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {title}
        </text>
        <text x={x + w / 2} y={y + 38}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9.5} fontWeight={400} fill={SLATE}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
          {subtitle}
        </text>
        {checks.map((c, i) => (
          <g key={i}>
            <text x={x + 14} y={checkStartY + i * lineH}
              dominantBaseline="middle"
              fontSize={11} fontWeight={700} fill={GREEN}
              fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
              ✔
            </text>
            <text x={x + 26} y={checkStartY + i * lineH}
              dominantBaseline="middle"
              fontSize={9.5} fontWeight={400} fill="#166534"
              fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif">
              {c}
            </text>
          </g>
        ))}
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

  function PathArrow({
    d, color = SLATE, label, lx, ly, dashed = false,
  }: {
    d: string; color?: string; label?: string; lx?: number; ly?: number; dashed?: boolean;
  }) {
    const id = `ph-${d.replace(/\s/g, "").slice(0, 16)}`;
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
  // Main vertical spine: centered at x = 180
  const MX = 180;
  const BW = 168;
  const BH = 64;

  // YES branch column center: x = 660 (shifted right to allow 3 reload columns)
  const YX = 660;
  const BW_Y = 168;
  const BH_Y = 58;

  // Three reload columns: centered at x = 480, 660, 840
  const RC_L = 480;   // Partial Reload
  const RC_M = 660;   // Coordinated Partial
  const RC_R = 840;   // Full Reload
  const RC_W = 152;   // reload column box width
  const RC_H = 168;   // reload column box height

  // Vertical positions
  const Y1  = 40;    // Master Data Workbook
  const Y2  = 164;   // Initial Load
  const Y3  = 288;   // Business Validation (PRIMARY)
  const YD1 = 410;   // Decision diamond 1 center y: Issue Identified?

  // NO branch
  const Y_NO_SIGNOFF   = 490;
  const Y_NO_COMPLETE  = 608;
  const BH_SM = 58;

  // YES branch — right column
  const Y_TRIAGE   = 360;   // Review & Triage
  const Y_IMPACT   = 460;   // BA Impact Assessment (governance box)
  const IMPACT_H   = 148;   // tall governance box
  const IMPACT_W   = 220;
  const Y_WB_UPD   = 640;   // Master Data Workbook Updated
  const YD2        = 760;   // Reload Strategy diamond center y
  const Y_RELOAD   = 820;   // Reload column boxes top
  const Y_DEV_EXEC = 1010;  // Development Executes Reload (merged)
  const DEV_EXEC_H = 68;
  const Y_VALID    = 1110;  // Validation Before UAT Resumes
  const VALID_H    = 148;
  const VALID_W    = 280;

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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MAIN SPINE                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {/* 1. Master Data Workbook */}
        <Box x={MX - BW / 2} y={Y1} w={BW} h={BH}
          label="Master Data Workbook" sub="Authoritative Source"
          owner="Business Analyst"
          fill={LBLUE} stroke={BLUE} textColor={NAVY} bold accent />

        <Arrow x1={MX} y1={Y1 + BH} x2={MX} y2={Y2 - 6} color={SLATE} />

        {/* 2. Initial Load into Roger */}
        <Box x={MX - BW / 2} y={Y2} w={BW} h={BH}
          label="Initial Load into Roger" sub="Master Data Ingestion"
          owner="Development"
          fill="white" stroke={BORDER} textColor={NAVY} />

        <Arrow x1={MX} y1={Y2 + BH} x2={MX} y2={Y3 - 6} color={SLATE} />

        {/* 3. Business Validation — PRIMARY (anchor for iterative loop) */}
        <Box x={MX - (BW + 16) / 2} y={Y3} w={BW + 16} h={BH + 4}
          label="Business Validation" sub="User Acceptance Testing"
          owner="Business"
          fill={BLUE} stroke={BLUE} textColor="#FFFFFF" subColor="#DCE9F8" ownerColor="#DCE9F8" bold accent />

        <Arrow x1={MX} y1={Y3 + BH + 4} x2={MX} y2={YD1 - 28 - 6} color={SLATE} />

        {/* Decision Diamond 1: Issue Identified? */}
        <Diamond cx={MX} cy={YD1} w={136} h={56} label="Issue Identified?" />

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* NO BRANCH — straight down                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        <Arrow x1={MX} y1={YD1 + 28} x2={MX} y2={Y_NO_SIGNOFF - 6}
          color={GREEN} label="No" lx={MX + 20} ly={YD1 + 48} />

        <Box x={MX - 74} y={Y_NO_SIGNOFF} w={148} h={BH_SM}
          label="Business Sign-Off" sub="Business Approval"
          fill="#F0FDF4" stroke={GREEN} textColor={GREEN} bold accent />

        <Arrow x1={MX} y1={Y_NO_SIGNOFF + BH_SM} x2={MX} y2={Y_NO_COMPLETE - 6} color={GREEN} />

        <Box x={MX - 74} y={Y_NO_COMPLETE} w={148} h={BH_SM}
          label="UAT Complete" sub="Ready for Production"
          fill={GREEN} stroke={GREEN} textColor="#FFFFFF" subColor="#D1FAE5" bold accent />

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* YES BRANCH — right column                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {/* Arrow: Decision → Review & Triage */}
        <Arrow x1={MX + 68} y1={YD1} x2={YX - BW_Y / 2 - 6} y2={Y_TRIAGE + BH_Y / 2}
          color={PURPLE} label="Yes" lx={MX + 160} ly={YD1 - 12} />

        {/* Review & Triage */}
        <Box x={YX - BW_Y / 2} y={Y_TRIAGE} w={BW_Y} h={BH_Y}
          label="Review & Triage" sub="Business · BA · Development"
          fill="white" stroke={BORDER} textColor={NAVY} />

        <Arrow x1={YX} y1={Y_TRIAGE + BH_Y} x2={YX} y2={Y_IMPACT - 6} color={SLATE} />

        {/* BA Impact Assessment — GOVERNANCE BOX (prominent) */}
        <GovernanceBox
          x={YX - IMPACT_W / 2} y={Y_IMPACT}
          w={IMPACT_W} h={IMPACT_H}
          title="BA Performs Impact Assessment"
          subtitle="Governance decision before any Master Data change"
          bullets={[
            "Master Data objects affected",
            "Dataset dependencies",
            "Taxonomy relationships",
            "Taxonomy ID changes",
            "Previously loaded Trial Balance impact",
            "📄 Reload Impact Assessment",
            "Recommended Reload Strategy",
          ]}
        />

        <Arrow x1={YX} y1={Y_IMPACT + IMPACT_H} x2={YX} y2={Y_WB_UPD - 6} color={SLATE} />

        {/* Master Data Workbook Updated */}
        <Box x={YX - BW_Y / 2} y={Y_WB_UPD} w={BW_Y} h={BH_Y}
          label="Master Data Workbook Updated"
          sub="Version · Change Log · SharePoint"
          fill="#F5F0FF" stroke={PURPLE} textColor={PURPLE} />

        <Arrow x1={YX} y1={Y_WB_UPD + BH_Y} x2={YX} y2={YD2 - 28 - 6} color={SLATE} />

        {/* Decision Diamond 2: Determine Reload Strategy (3-way) */}
        <Diamond cx={YX} cy={YD2} w={148} h={56} label="Determine Reload" sub="Strategy" />

        {/* ── Branch arrows from diamond ── */}
        {/* Left: Partial Reload */}
        <PathArrow
          d={`M ${YX - 74} ${YD2} L ${RC_L} ${YD2} L ${RC_L} ${Y_RELOAD - 6}`}
          color={PARTIAL_BLUE} label="Partial" lx={RC_L + 30} ly={YD2 - 10} />

        {/* Center: Coordinated Partial */}
        <Arrow x1={YX} y1={YD2 + 28} x2={RC_M} y2={Y_RELOAD - 6}
          color={COORD_ORANGE} label="Coord. Partial" lx={RC_M + 60} ly={YD2 + 44} />

        {/* Right: Full Reload */}
        <PathArrow
          d={`M ${YX + 74} ${YD2} L ${RC_R} ${YD2} L ${RC_R} ${Y_RELOAD - 6}`}
          color={FULL_RED} label="Full" lx={RC_R - 28} ly={YD2 - 10} />

        {/* ── Three Reload Column Boxes ── */}

        {/* Partial Reload */}
        <ReloadBox
          x={RC_L - RC_W / 2} y={Y_RELOAD} w={RC_W} h={RC_H}
          title="Partial Reload"
          desc="Independent reference data"
          bullets={[
            "Reference values",
            "Taxonomy additions",
            "Independent Mapping Rules",
            "Confidence Bands",
            "Filing Due Dates",
          ]}
          note="Service Bus index update"
          headerFill={PARTIAL_BLUE} headerText="white"
          bodyFill="#EFF6FF" bodyStroke={PARTIAL_BLUE}
        />

        {/* Coordinated Partial Reload */}
        <ReloadBox
          x={RC_M - RC_W / 2} y={Y_RELOAD} w={RC_W} h={RC_H}
          title="Coordinated Partial"
          desc="Dependent datasets"
          bullets={[
            "Tax Forms",
            "Tax Form Lines",
            "Tax-Taxonomy Associations",
            "Mapping Rules",
            "Other dependent entities",
          ]}
          note="All related datasets together"
          headerFill={COORD_ORANGE} headerText="white"
          bodyFill="#FFF7ED" bodyStroke={COORD_ORANGE}
        />

        {/* Full Reload */}
        <ReloadBox
          x={RC_R - RC_W / 2} y={Y_RELOAD} w={RC_W} h={RC_H}
          title="Full Reload"
          desc="Foundational changes"
          bullets={[
            "Foundational Master Data",
            "Taxonomy relationships",
            "Referential integrity",
            "Trial Balance remapping",
            "Partial reload insufficient",
          ]}
          headerFill={FULL_RED} headerText="white"
          bodyFill="#FFF1F2" bodyStroke={FULL_RED}
        />

        {/* ── Development Executes Reload (merged from all 3) ── */}
        {/* Converge arrows from each column to merged box */}
        <PathArrow
          d={`M ${RC_L} ${Y_RELOAD + RC_H} L ${RC_L} ${Y_DEV_EXEC + DEV_EXEC_H / 2} L ${RC_M - BW_Y / 2 - 4} ${Y_DEV_EXEC + DEV_EXEC_H / 2}`}
          color={SLATE} />
        <Arrow x1={RC_M} y1={Y_RELOAD + RC_H} x2={RC_M} y2={Y_DEV_EXEC - 6} color={SLATE} />
        <PathArrow
          d={`M ${RC_R} ${Y_RELOAD + RC_H} L ${RC_R} ${Y_DEV_EXEC + DEV_EXEC_H / 2} L ${RC_M + BW_Y / 2 + 4} ${Y_DEV_EXEC + DEV_EXEC_H / 2}`}
          color={SLATE} />

        <Box x={RC_M - BW_Y / 2} y={Y_DEV_EXEC} w={BW_Y} h={DEV_EXEC_H}
          label="Development Executes Reload"
          sub="Reload · Refresh Indexes · Reprocess"
          fill={LBLUE} stroke={BLUE} textColor={NAVY} bold />

        <Arrow x1={RC_M} y1={Y_DEV_EXEC + DEV_EXEC_H} x2={RC_M} y2={Y_VALID - 6} color={SLATE} />

        {/* Validation Before UAT Resumes */}
        <ValidationBox
          x={RC_M - VALID_W / 2} y={Y_VALID}
          w={VALID_W} h={VALID_H}
          title="Validation Before UAT Resumes"
          subtitle="Development and Business jointly validate"
          checks={[
            "Previously processed data remains accurate",
            "Newly loaded Master Data reflected correctly",
            "Taxonomy mappings remain valid",
            "Search indexes refreshed",
            "Validation suite passes",
          ]}
        />

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ITERATIVE FEEDBACK LOOP                                            */}
        {/* From bottom of Validation box → back up to Business Validation     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <PathArrow
          d={`M ${RC_M - VALID_W / 2} ${Y_VALID + VALID_H / 2}
              C ${RC_M - VALID_W / 2 - 120} ${Y_VALID + VALID_H / 2},
                ${MX + (BW + 16) / 2 + 120} ${Y3 + (BH + 4) / 2},
                ${MX + (BW + 16) / 2 + 4} ${Y3 + (BH + 4) / 2}`}
          color={BLUE} dashed
          label="Repeat until Business Sign-Off"
          lx={(RC_M - VALID_W / 2 + MX + (BW + 16) / 2) / 2 + 20}
          ly={Y_VALID - 22}
        />

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* LEGEND                                                              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <g transform={`translate(20, ${H - 52})`}>
          <rect x={0} y={6} width={10} height={10} rx={2} fill={BLUE} />
          <text x={14} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Primary Activity</text>

          <rect x={120} y={6} width={10} height={10} rx={2} fill={GREEN} />
          <text x={134} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Approval / Complete</text>

          <rect x={260} y={6} width={10} height={10} rx={2} fill="#FEF3C7" stroke={GOLD} strokeWidth={1.5} />
          <text x={274} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Governance / Decision</text>

          <rect x={410} y={6} width={10} height={10} rx={2} fill={PARTIAL_BLUE} />
          <text x={424} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Partial Reload</text>

          <rect x={520} y={6} width={10} height={10} rx={2} fill={COORD_ORANGE} />
          <text x={534} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Coordinated Partial</text>

          <rect x={650} y={6} width={10} height={10} rx={2} fill={FULL_RED} />
          <text x={664} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Full Reload</text>

          <line x1={760} y1={11} x2={782} y2={11} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5,3" />
          <text x={786} y={14} fontSize={9.5} fill={SLATE} fontFamily="'Segoe UI', system-ui, sans-serif">Iterative Loop</text>
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
        The Master Data Workbook is the authoritative source of truth. Every change requires BA Impact Assessment before any reload is executed. UAT resumes only after validation confirms data integrity. Business Sign-Off is required before UAT Complete.
      </div>
    </div>
  );
}

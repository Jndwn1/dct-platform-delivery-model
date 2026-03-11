# DCT Gate Verification Dashboard — Design Ideas

## Design Approach Options

<response>
<text>
**Idea A — RSM Command Center (Chosen)**

Design Movement: Enterprise Command Center / Consulting-Grade Analytics
Core Principles:
1. Authority through structure — every element has a clear hierarchy; nothing competes for attention
2. Data density without clutter — maximum information per pixel, zero decoration for its own sake
3. RSM blue as the single dominant hue — all other colors serve as status signals only
4. Sidebar-anchored navigation — persistent left rail with section labels, content fills the remaining canvas

Color Philosophy: RSM Blue (#003A8F) as the primary brand anchor. White panels on a very light gray (#F5F7FA) canvas. Status colors are semantic only: green for PASSED, amber for PENDING, red for BLOCKED, slate for PLANNED. No gradients except subtle header treatment.

Layout Paradigm: Fixed left sidebar (240px) + scrollable main content area. Top header bar with RSM branding and batch selector. Main content uses a 3-column card grid at top (summary KPIs), then a full-width gate progress rail, then a T1–T11 touchpoint journey strip, then batch detail tables.

Signature Elements:
1. Gate status rail — a horizontal progress bar showing G1→G2→G3→G4 with color-coded status badges and artifact counts
2. Touchpoint journey strip — T1 through T11 as connected nodes, each colored by status, with hover tooltips showing artifact state
3. Batch accordion — expandable rows showing each AB with its gate status, open issues, and QA artifact readiness

Interaction Philosophy: Click any gate to expand its artifact checklist. Click any touchpoint node to see its current state and responsible system. Batch rows expand inline. No page navigation — everything is on one scrollable canvas.

Animation: Subtle fade-in on load. Gate status badges pulse once when PENDING. No continuous animation — this is a professional tool, not a marketing page.

Typography System: System sans-serif stack (matching Aptos Display). Headers: 600 weight, 14px uppercase tracking. Body: 400 weight, 14px. KPI numbers: 700 weight, 32px. Monospace for artifact IDs and version strings.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
**Idea B — Blueprint Dark Mode**

Design Movement: Technical Blueprint / Dark Analytics
Core Principles: Dark navy canvas, white-on-dark data, electric blue accents, grid-line texture

Color Philosophy: #0A1628 background, #1E3A5F panels, #4F7DF3 accents, white text
Layout Paradigm: Full-width dark canvas, floating card panels, no sidebar
Signature Elements: Blueprint grid texture, glowing status indicators, animated data flows
Typography System: Monospace headers, sans-serif body
</text>
<probability>0.06</probability>
</response>

<response>
<text>
**Idea C — Minimal Audit Log**

Design Movement: Minimal / Audit-First
Core Principles: Maximum whitespace, table-first layout, no decoration
Color Philosophy: Pure white, black text, single blue accent for active states
Layout Paradigm: Single column, full-width tables, no sidebar
Signature Elements: Dense audit log tables, inline status chips, expandable rows
Typography System: Monospace throughout
</text>
<probability>0.04</probability>
</response>

---

## Selected Design: Idea A — RSM Command Center

RSM Blue authority palette, sidebar navigation, gate status rail, T1–T11 touchpoint journey strip, and batch accordion. Consulting-grade, data-forward, zero decoration.

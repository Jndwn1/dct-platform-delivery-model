// RegistryAudit.tsx
// Developer governance tool — shows the health of the pageContextRegistry.
// RULE: Every route in App.tsx must have a corresponding entry in PAGE_CONTEXT_REGISTRY.
// This page surfaces any missing, stale, or unregistered routes so they can be fixed immediately.

import { useState } from "react";
import { PAGE_CONTEXT_REGISTRY, REGISTRY_MANIFEST } from "@/lib/pageContextRegistry";

// ─── All routes currently in App.tsx ─────────────────────────────────────────
// Update this list whenever a new route is added to App.tsx
const APP_ROUTES: string[] = [
  "/",
  "/batch-calendar",
  "/gate-status",
  "/touchpoints",
  "/agent-hub",
  "/architecture",
  "/architecture/developer",
  "/architecture/enterprise",
  "/integration-simulation",
  "/consumer-integration-hub",
  "/roger-api",
  "/runtime-journey",
  "/control-panel",
  "/batch/:id",
  "/gate/overview",
  "/gate/:id",
  "/agent/:id",
  "/taxonomy",
  "/data-model",
  "/data-governance",
  "/roger-mapping",
  "/aap-review",
  "/batch-delivery-review",
  "/ask-buddy",
  "/tax-mapping",
  "/classification-walkthrough",
  "/gap-analysis",
  "/deployment-registry",
  "/delivery-intelligence",
  "/discovery",
  "/discovery/ecosystem",
  "/discovery/platform-responsibilities",
  "/discovery/data-flow",
  "/discovery/simulation",
  "/discovery/integration-architecture",
  "/discovery/ba-requirements",
  "/discovery/checklist",
  "/discovery/glossary",
  "/discovery/dct-overview",
  "/discovery/roger-overview",
  "/discovery/gosystem",
  "/discovery/pdc",
  "/discovery/data-gateway",
  "/discovery/ba-story-builder",
  "/discovery/knowledge-graph",
  "/uat-testing",
  "/learning-center",
  "/onboarding",
  "/onboarding/step1",
  "/onboarding/step2",
  "/onboarding/step3",
  "/onboarding/step4",
  "/onboarding/step5",
  "/onboarding/step6",
  "/onboarding/step7",
];

// ─── Staleness threshold ──────────────────────────────────────────────────────
const STALE_DAYS = 30;

function getDaysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(route: string): "ok" | "missing" | "stale" | "dynamic" {
  if (route.includes(":")) return "dynamic";
  const entry = PAGE_CONTEXT_REGISTRY[route];
  if (!entry) return "missing";
  if (!entry.lastUpdated) return "stale";
  if (getDaysSince(entry.lastUpdated) > STALE_DAYS) return "stale";
  return "ok";
}

const STATUS_CONFIG = {
  ok: { label: "Registered", bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
  missing: { label: "MISSING", bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", dot: "#ef4444" },
  stale: { label: "Stale (>30d)", bg: "#fffbeb", border: "#fcd34d", text: "#92400e", dot: "#f59e0b" },
  dynamic: { label: "Dynamic Route", bg: "#f0f9ff", border: "#7dd3fc", text: "#075985", dot: "#0ea5e9" },
};

export default function RegistryAudit() {
  const [filter, setFilter] = useState<"all" | "missing" | "stale" | "ok" | "dynamic">("all");

  const rows = APP_ROUTES.map((route) => {
    const status = getStatus(route);
    const entry = PAGE_CONTEXT_REGISTRY[route];
    return { route, status, entry };
  });

  const missing = rows.filter((r) => r.status === "missing").length;
  const stale = rows.filter((r) => r.status === "stale").length;
  const ok = rows.filter((r) => r.status === "ok").length;
  const dynamic = rows.filter((r) => r.status === "dynamic").length;

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const overallHealth = missing === 0 ? (stale === 0 ? "Healthy" : "Needs Attention") : "Action Required";
  const healthColor = missing === 0 ? (stale === 0 ? "#059669" : "#d97706") : "#dc2626";

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#059669", fontWeight: 900, fontSize: "16px",
          }}>R</div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
              Context Awareness Registry Audit
            </h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              DCT Platform · Developer Governance Tool · Registry {REGISTRY_MANIFEST.version} · Last Audit: {REGISTRY_MANIFEST.lastAudit}
            </div>
          </div>
        </div>

        {/* Governance Rule Banner */}
        <div style={{
          backgroundColor: "#f0f9ff", border: "1px solid #bae6fd",
          borderRadius: "8px", padding: "12px 16px", marginTop: "14px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            ● Governance Rule
          </div>
          <div style={{ fontSize: "13px", color: "#0c4a6e", lineHeight: "1.6" }}>
            <strong>Every route added to App.tsx must have a corresponding entry in <code>pageContextRegistry.ts</code></strong> with all fields populated and <code>lastUpdated</code> set to the date of the most recent page change. When updating a page, update <code>lastUpdated</code> and <code>lastChange</code> in the registry entry on the same day. The Registry Audit page (this page) will flag any violations.
          </div>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Overall Health", value: overallHealth, color: healthColor, bg: "#f8fafc" },
          { label: "Registered", value: ok, color: "#059669", bg: "#f0fdf4" },
          { label: "Missing", value: missing, color: "#dc2626", bg: "#fef2f2" },
          { label: "Stale (>30d)", value: stale, color: "#d97706", bg: "#fffbeb" },
          { label: "Dynamic Routes", value: dynamic, color: "#0ea5e9", bg: "#f0f9ff" },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            backgroundColor: kpi.bg, border: `1px solid ${kpi.color}30`,
            borderRadius: "8px", padding: "14px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: typeof kpi.value === "number" ? "24px" : "16px", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {(["all", "missing", "stale", "ok", "dynamic"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: "12px", fontWeight: 600, padding: "5px 12px",
              borderRadius: "6px", border: "1px solid",
              cursor: "pointer",
              backgroundColor: filter === f ? "#0f1623" : "#f8fafc",
              color: filter === f ? "white" : "#374151",
              borderColor: filter === f ? "#0f1623" : "#e2e8f0",
            }}
          >
            {f === "all" ? `All Routes (${rows.length})` :
             f === "missing" ? `Missing (${missing})` :
             f === "stale" ? `Stale (${stale})` :
             f === "ok" ? `Registered (${ok})` :
             `Dynamic (${dynamic})`}
          </button>
        ))}
      </div>

      {/* ── Route Table ── */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr",
          backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
          padding: "10px 16px", fontSize: "11px", fontWeight: 700,
          color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          <div>Route</div>
          <div>Status</div>
          <div>Last Updated</div>
          <div>Last Change</div>
        </div>

        {filtered.map(({ route, status, entry }, idx) => {
          const cfg = STATUS_CONFIG[status];
          const daysSince = entry?.lastUpdated ? getDaysSince(entry.lastUpdated) : null;
          return (
            <div key={route} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr",
              gap: "8px", alignItems: "start",
              padding: "10px 16px",
              borderBottom: idx < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: status === "missing" ? "#fef9f9" : status === "stale" ? "#fffdf5" : "white",
            }}>
              {/* Route */}
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>
                {route}
                {entry?.pageTitle && (
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 400, marginTop: "2px" }}>
                    {entry.pageIcon} {entry.pageTitle}
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                  backgroundColor: cfg.bg, color: cfg.text,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "4px", padding: "2px 7px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0, display: "inline-block" }} />
                  {cfg.label}
                </span>
              </div>

              {/* Last updated */}
              <div style={{ fontSize: "12px", color: status === "stale" ? "#d97706" : "#374151" }}>
                {entry?.lastUpdated ? (
                  <>
                    <div>{entry.lastUpdated}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>{daysSince}d ago</div>
                  </>
                ) : (
                  <span style={{ color: "#dc2626", fontSize: "11px" }}>Not set</span>
                )}
              </div>

              {/* Last change */}
              <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>
                {entry?.lastChange ?? (
                  status === "missing"
                    ? <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠ No registry entry — add to pageContextRegistry.ts</span>
                    : <span style={{ color: "#94a3b8" }}>No change description</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── How to Fix ── */}
      {missing > 0 && (
        <div style={{
          marginTop: "24px",
          backgroundColor: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: "10px", padding: "16px 20px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b", marginBottom: "10px" }}>
            ⚠ {missing} route{missing > 1 ? "s are" : " is"} missing from the registry — action required
          </div>
          <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.8" }}>
            For each missing route, add an entry to <code style={{ backgroundColor: "#fee2e2", padding: "1px 4px", borderRadius: "3px" }}>client/src/lib/pageContextRegistry.ts</code> with:<br />
            <code style={{ backgroundColor: "#fee2e2", padding: "1px 4px", borderRadius: "3px" }}>pageTitle, pageIcon, description, features, apis, stories, screens, businessRules, batches, businessObjects, integrations, lastUpdated, lastChange</code>
          </div>
        </div>
      )}

      {/* ── Update Rule Reminder ── */}
      <div style={{
        marginTop: "20px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "16px 20px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
          📋 Registry Update Checklist — Run this every time a page is added or changed
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            "New page added to App.tsx → add entry to PAGE_CONTEXT_REGISTRY",
            "Page content updated → update lastUpdated to today's date",
            "New section added → add to features[] and screens[]",
            "New API added → add to apis[]",
            "New batch linked → add to batches[]",
            "New business object → add to businessObjects[]",
            "New integration → add to integrations[]",
            "Update lastChange with a one-line description of what changed",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#374151" }}>
              <span style={{ color: "#059669", flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

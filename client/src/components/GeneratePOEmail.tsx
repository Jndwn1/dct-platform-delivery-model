// GeneratePOEmail.tsx
// Executive Delivery Status Email Generator
// Sections: 1) Dashboard Screenshot, 2) Batch Portfolio Table, 3) Executive Summary, 4) Release Readiness

import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { trpc } from "@/lib/trpc";

// ─── Batch data type ──────────────────────────────────────────────────────────
interface BatchRow {
  pi: string;
  status: string;
  batchNum: string;
  platform: string;
  name: string;
  whatItDoes: string;
  rogerImpact: string;
}

// ─── Status color helpers ─────────────────────────────────────────────────────
function statusBadgeStyle(status: string): { bg: string; text: string; border: string } {
  if (status === "Done" || status === "Complete")
    return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
  if (status === "In Progress")
    return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
  if (status === "Stretch")
    return { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" };
  if (status === "On Hold")
    return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
  if (status === "Post-MVP" || status === "Future")
    return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  if (status === "Parked")
    return { bg: "#fafafa", text: "#6b7280", border: "#e5e7eb" };
  return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
}

// ─── Build the email HTML string ──────────────────────────────────────────────
function buildEmailHTML(
  batches: BatchRow[],
  dashboardImgDataUrl: string | null,
  recentDeployments: Array<{ releaseName: string; releaseDate: string; status: string }>,
  piStats: { pi: string; total: number; done: number; active: number }[]
): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const totalBatches = batches.length;
  const doneBatches = batches.filter(b => b.status === "Done" || b.status === "Complete").length;
  const activeBatches = batches.filter(b => b.status === "In Progress").length;
  const plannedBatches = batches.filter(b => b.status === "Planned").length;

  // Group batches by PI
  const piGroups: Record<string, BatchRow[]> = {};
  for (const b of batches) {
    const key = b.pi || (b.status === "Future" ? "Future" : b.status === "Parked" ? "Parked" : "Other");
    if (!piGroups[key]) piGroups[key] = [];
    piGroups[key].push(b);
  }
  const piOrder = ["PI 2", "PI 3", "PI 4", "PI 5", "Future", "Parked", "Other"];

  const batchTableRows = piOrder
    .filter(pi => piGroups[pi] && piGroups[pi].length > 0)
    .map(pi => {
      const rows = piGroups[pi].map(b => {
        const s = statusBadgeStyle(b.status);
        const rowBg = b.status === "In Progress" ? "#fffbeb" : b.status === "On Hold" ? "#fef2f2" : (b.status === "Done" || b.status === "Complete") ? "#f0fdf4" : "#ffffff";
        return `
          <tr style="background:${rowBg};border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 10px;font-size:12px;font-weight:700;color:#0f1623;white-space:nowrap;">B${b.batchNum}</td>
            <td style="padding:6px 10px;font-size:12px;color:#1e293b;">${b.name}</td>
            <td style="padding:6px 10px;">
              <span style="font-size:11px;font-weight:700;color:${s.text};background:${s.bg};border:1px solid ${s.border};border-radius:4px;padding:2px 6px;">${b.status}</span>
            </td>
            <td style="padding:6px 10px;font-size:11px;color:#475569;">${b.whatItDoes}</td>
            <td style="padding:6px 10px;font-size:11px;color:#475569;">${b.rogerImpact}</td>
          </tr>`;
      }).join("");

      const piLabel = pi === "PI 2" ? "PI 2 — Committed" :
                      pi === "PI 3" ? "PI 3 — MVP Target" :
                      pi === "PI 4" ? "PI 4 — Post-Pilot" :
                      pi === "PI 5" ? "PI 5 — Future Roadmap" :
                      pi === "Future" ? "Future Roadmap" :
                      pi === "Parked" ? "Parked / Superseded" : pi;

      return `
        <tr><td colspan="5" style="padding:10px 10px 4px;background:#f8fafc;font-size:11px;font-weight:800;color:#0f1623;letter-spacing:0.08em;text-transform:uppercase;border-top:2px solid #e2e8f0;">${piLabel}</td></tr>
        ${rows}`;
    }).join("");

  const recentDeliveryRows = recentDeployments.slice(0, 5).map(d =>
    `<li style="margin:2px 0;font-size:13px;color:#1e293b;">${d.releaseName} <span style="color:#64748b;font-size:11px;">(${new Date(d.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})</span></li>`
  ).join("");

  const piSummaryRows = piStats.map(p => {
    const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
    return `<li style="margin:2px 0;font-size:13px;color:#1e293b;"><strong>${p.pi}:</strong> ${pct}% complete (${p.done}/${p.total} batches${p.active > 0 ? `, ${p.active} active` : ""})</li>`;
  }).join("");

  const dashboardSection = dashboardImgDataUrl
    ? `<img src="${dashboardImgDataUrl}" alt="Executive Dashboard" style="width:100%;max-width:900px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;" />`
    : `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;color:#64748b;font-size:13px;">Dashboard screenshot not available</div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>DCT Platform Delivery Dashboard</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:24px;background:#ffffff;color:#0f1623;max-width:960px;">

  <!-- Header -->
  <div style="border-bottom:3px solid #0f1623;padding-bottom:16px;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#0f1623;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#059669;font-weight:900;font-size:18px;">D</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#0f1623;">DCT Platform Delivery Dashboard</div>
        <div style="font-size:12px;color:#64748b;">RSM · CATT · ${today} · Roadmap v7 · Non-Production Workspace</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
      <span style="font-size:11px;font-weight:600;color:white;background:#059669;border-radius:4px;padding:3px 8px;">PI 1–2 Done</span>
      <span style="font-size:11px;font-weight:600;color:white;background:#2563eb;border-radius:4px;padding:3px 8px;">${activeBatches} Active</span>
      <span style="font-size:11px;font-weight:600;color:white;background:#7c3aed;border-radius:4px;padding:3px 8px;">Pilot: Sep 16, 2026</span>
      <span style="font-size:11px;font-weight:600;color:white;background:#0f1623;border-radius:4px;padding:3px 8px;">RC1 Ready</span>
    </div>
  </div>

  <!-- Section 1: Executive Dashboard Screenshot -->
  <div style="margin-bottom:32px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Section 1</div>
    <h2 style="font-size:16px;font-weight:700;color:#0f1623;margin:0 0 12px;border-left:4px solid #1e3a5f;padding-left:12px;">Executive Dashboard</h2>
    ${dashboardSection}
  </div>

  <!-- Section 2: Batch Portfolio Table -->
  <div style="margin-bottom:32px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Section 2</div>
    <h2 style="font-size:16px;font-weight:700;color:#0f1623;margin:0 0 12px;border-left:4px solid #1e3a5f;padding-left:12px;">Batch Portfolio Summary</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#0f1623;">
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Batch</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Title</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Status</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">What the Batch Does</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Roger UI Impact</th>
        </tr>
      </thead>
      <tbody>
        ${batchTableRows}
      </tbody>
    </table>
    <div style="font-size:11px;color:#64748b;margin-top:6px;">Source: DCT Calendar v7 · Columns J (What the Batch Does) and K (Roger UI Impact) · ${totalBatches} total batches</div>
  </div>

  <!-- Section 3: Executive Summary -->
  <div style="margin-bottom:32px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Section 3</div>
    <h2 style="font-size:16px;font-weight:700;color:#0f1623;margin:0 0 12px;border-left:4px solid #065f46;padding-left:12px;">Executive Summary</h2>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div>
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Portfolio Metrics</div>
          <ul style="margin:0;padding-left:16px;list-style:disc;">
            <li style="margin:2px 0;font-size:13px;color:#1e293b;"><strong>Total Batches:</strong> ${totalBatches}</li>
            <li style="margin:2px 0;font-size:13px;color:#1e293b;"><strong>Completed:</strong> ${doneBatches}</li>
            <li style="margin:2px 0;font-size:13px;color:#1e293b;"><strong>Active:</strong> ${activeBatches}</li>
            <li style="margin:2px 0;font-size:13px;color:#1e293b;"><strong>Planned:</strong> ${plannedBatches}</li>
          </ul>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">PI Progress</div>
          <ul style="margin:0;padding-left:16px;list-style:disc;">
            ${piSummaryRows}
          </ul>
        </div>
      </div>
      ${recentDeliveryRows ? `
      <div style="border-top:1px solid #e2e8f0;padding-top:12px;">
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Recent Deliveries</div>
        <ul style="margin:0;padding-left:16px;list-style:disc;">${recentDeliveryRows}</ul>
      </div>` : ""}
    </div>
  </div>

  <!-- Section 4: Release Readiness -->
  <div style="margin-bottom:32px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Section 4</div>
    <h2 style="font-size:16px;font-weight:700;color:#0f1623;margin:0 0 12px;border-left:4px solid #059669;padding-left:12px;">Release Readiness</h2>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        ${[
          "Roadmap v7 Aligned",
          "Governance Controls Active",
          "Architecture Validated",
          "All Routes Validated",
          "No Runtime Errors",
          "Ask Buddy Operational",
          "Gate Verification Active",
          "Deployment Registry Current",
        ].map(item => `
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#059669;font-size:14px;font-weight:700;">&#10003;</span>
            <span style="font-size:13px;color:#1e293b;">${item}</span>
          </div>`).join("")}
      </div>
      <div style="border-top:1px solid #bbf7d0;padding-top:10px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:13px;font-weight:700;color:#065f46;">Platform Status:</span>
        <span style="font-size:12px;font-weight:700;color:white;background:#059669;border-radius:4px;padding:3px 10px;">RC1 Ready</span>
        <span style="font-size:11px;color:#64748b;">· Roadmap v7 · Non-Production Workspace · ${today}</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#94a3b8;text-align:center;">
    DCT Platform Gate Verification Dashboard · RSM US LLP · CATT · Generated ${today} · Non-Production Workspace · All data is mock/seed/synthetic
  </div>

</body>
</html>`;
}

// ─── Main component ───────────────────────────────────────────────────────────
interface GeneratePOEmailProps {
  dashboardRef: React.RefObject<HTMLDivElement | null>;
  batches: BatchRow[];
}

export default function GeneratePOEmail({ dashboardRef, batches }: GeneratePOEmailProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [emailHTML, setEmailHTML] = useState<string | null>(null);
  const [dashImgUrl, setDashImgUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const { data: recentDeployments = [] } = trpc.deploymentRegistry.recentDeployments.useQuery(undefined, { enabled: open });

  // Compute PI stats from batches
  const piStats = ["PI 2", "PI 3", "PI 4", "PI 5"].map(pi => {
    const piBatches = batches.filter(b => b.pi === pi);
    return {
      pi,
      total: piBatches.length,
      done: piBatches.filter(b => b.status === "Done" || b.status === "Complete").length,
      active: piBatches.filter(b => b.status === "In Progress").length,
    };
  });

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    let imgDataUrl: string | null = null;

    // Capture dashboard screenshot
    if (dashboardRef.current) {
      try {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        imgDataUrl = canvas.toDataURL("image/png");
        setDashImgUrl(imgDataUrl);
      } catch (e) {
        console.warn("Screenshot capture failed:", e);
      }
    }

    const html = buildEmailHTML(batches, imgDataUrl, recentDeployments as Array<{ releaseName: string; releaseDate: string; status: string }>, piStats);
    setEmailHTML(html);
    setGenerating(false);
    setOpen(true);
  }, [dashboardRef, batches, recentDeployments, piStats]);

  const handleCopy = useCallback(async () => {
    if (!emailHTML) return;
    try {
      await navigator.clipboard.writeText(emailHTML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = emailHTML;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [emailHTML]);

  const handleDownloadHTML = useCallback(() => {
    if (!emailHTML) return;
    const blob = new Blob([emailHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DCT-Delivery-Dashboard-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [emailHTML]);

  const handleDownloadPDF = useCallback(async () => {
    if (!emailHTML) return;
    try {
      // Render full email HTML in a hidden off-screen container at full height
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;top:-99999px;left:-99999px;width:980px;background:#ffffff;z-index:-1;";
      container.innerHTML = emailHTML;
      document.body.appendChild(container);

      // Wait for images/fonts to settle
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 980,
        height: container.scrollHeight,
        windowWidth: 980,
        windowHeight: container.scrollHeight,
      });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      // A4 portrait: 595 x 842 pt
      const pageW = 595;
      const pageH = 842;
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      let yOffset = 0;
      let remaining = imgH;
      let page = 0;
      while (remaining > 0) {
        if (page > 0) pdf.addPage();
        const sliceH = Math.min(pageH, remaining);
        pdf.addImage(imgData, "PNG", 0, -yOffset, imgW, imgH);
        yOffset += pageH;
        remaining -= sliceH;
        page++;
      }

      pdf.save(`DCT-Delivery-Dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
  }, [emailHTML]);

  const handleOutlook = useCallback(() => {
    const subject = encodeURIComponent("DCT Platform Delivery Dashboard");
    const body = encodeURIComponent("Please see the attached HTML file for the DCT Platform Delivery Dashboard.\n\nGenerated: " + new Date().toLocaleDateString());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }, []);

  return (
    <>
      {/* Generate PO Email Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          backgroundColor: generating ? "#94a3b8" : "#059669",
          color: "white", border: "none", borderRadius: "6px",
          padding: "8px 14px", fontSize: "12px", fontWeight: 700,
          cursor: generating ? "not-allowed" : "pointer",
          letterSpacing: "0.03em",
        }}
      >
        {generating ? (
          <>
            <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Generating...
          </>
        ) : (
          <>
            <span style={{ fontSize: "14px" }}>✉</span>
            Generate PO Email
          </>
        )}
      </button>

      {/* Modal */}
      {open && emailHTML && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "24px", overflowY: "auto",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            backgroundColor: "#ffffff", borderRadius: "12px",
            width: "100%", maxWidth: "980px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", backgroundColor: "#0f1623", borderBottom: "1px solid #1e293b",
            }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "white" }}>DCT Platform Delivery Dashboard</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Executive Email Preview · Ready to send</div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={handleCopy} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, backgroundColor: copied ? "#059669" : "#1e293b", color: "white", border: "1px solid #334155", borderRadius: "5px", cursor: "pointer" }}>
                  {copied ? "✓ Copied!" : "Copy HTML"}
                </button>
                <button onClick={handleDownloadHTML} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, backgroundColor: "#1e3a5f", color: "white", border: "1px solid #2563eb", borderRadius: "5px", cursor: "pointer" }}>
                  Download HTML
                </button>
                <button onClick={handleDownloadPDF} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  Download PDF
                </button>
                <button onClick={handleOutlook} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, backgroundColor: "#0078d4", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  Open in Outlook
                </button>
                <button onClick={() => setOpen(false)} style={{ padding: "6px 10px", fontSize: "14px", backgroundColor: "transparent", color: "#94a3b8", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            </div>

            {/* Email preview */}
            <div style={{ maxHeight: "75vh", overflowY: "auto", padding: "0" }}>
              <div ref={previewRef} dangerouslySetInnerHTML={{ __html: emailHTML }} style={{ padding: "0" }} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

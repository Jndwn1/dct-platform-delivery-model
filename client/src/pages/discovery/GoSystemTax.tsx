import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";
import IMSArchitectureDiagrams from "@/components/IMSArchitectureDiagrams";

// ─── Design tokens (match existing Discovery Center palette) ─────────────────
const NAVY   = "#0f1623";
const BLUE   = "#2563eb";
const PURPLE = "#7c3aed";
const SLATE  = "#475569";
const BORDER = "#e2e8f0";

// ─── Section heading helper ───────────────────────────────────────────────────
function SectionHeading({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: SLATE, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ─── Expandable Architecture Specification ────────────────────────────────────
function ArchitectureSpec() {
  const [open, setOpen] = useState(false);

  const pre = (code: string) => (
    <pre style={{
      backgroundColor: "#0f172a", color: "#e2e8f0",
      borderRadius: "8px", padding: "16px", fontSize: "11px",
      overflowX: "auto", lineHeight: "1.6", margin: "12px 0",
    }}>{code}</pre>
  );

  const h2 = (t: string) => (
    <div style={{ fontSize: "15px", fontWeight: 800, color: NAVY, margin: "24px 0 8px", borderBottom: `2px solid ${BORDER}`, paddingBottom: "6px" }}>{t}</div>
  );
  const h3 = (t: string) => (
    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e3a5f", margin: "16px 0 6px" }}>{t}</div>
  );
  const p = (t: string) => (
    <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", margin: "0 0 10px" }}>{t}</p>
  );

  const fieldRows = [
    ["clientId, entityId, taxYear, returnType", "Scope. Whose return this is and which form."],
    ["filingId", "The immutable filing record. Also the IMS idempotency key; a repeat requires an explicit re-delivery."],
    ["assemblyId", "The assembled version of the return the filing was derived from. Provenance."],
    ["deliveryId", "TDC's per-attempt tracking key, unique per delivery attempt."],
    ["contractVersion", "The outbound contract version this delivery targets."],
    ["formLineCode + formLineLabel", "The IRS form line the value maps to, and its human-readable label."],
    ["scheduleReference", "The form or schedule context for the line."],
    ["grain", "SUMMARY or DETAIL. Set by the governed summary-versus-detail rule on the form-line definition, not by IMS."],
    ["approvedAmount", "The value the user approved at this grain. Stored, attested figure — not recomputed at send."],
    ["supportsDetailRef", "On a summary line, a lineage reference to the underlying detail records held in TDC as support."],
    ["instances", "On a detail line, the distinct rows. Each carries instanceId, instanceLabel, and its own approvedAmount."],
  ];

  const examplePayload = `{
  "clientId": "CLT-0098432",
  "entityId": "ENT-0098432-01",
  "taxYear": 2025,
  "returnType": "1120",
  "filingId": "8f1c2d4a-7b3e-4a91-9c2f-1e6d5a8b4c30",
  "assemblyId": "3a2b1c0d-9e8f-4d6c-b5a4-2f1e0d9c8b7a",
  "deliveryId": "d4e5f6a7-b8c9-40d1-a2b3-c4d5e6f7a8b9",
  "contractVersion": "1.0",
  "taxLines": [
    {
      "formLineCode": "1120-L1a",
      "formLineLabel": "Gross receipts or sales",
      "scheduleReference": "Form 1120, Page 1",
      "grain": "SUMMARY",
      "approvedAmount": 6114000.00,
      "supportsDetailRef": "derived-records/entity/ENT-0098432-01/2025/line/1120-L1a"
    },
    {
      "formLineCode": "1120-L2",
      "formLineLabel": "Cost of goods sold",
      "scheduleReference": "Form 1120, Page 1 / Form 1125-A",
      "grain": "SUMMARY",
      "approvedAmount": 3180000.00,
      "supportsDetailRef": "derived-records/entity/ENT-0098432-01/2025/line/1120-L2"
    },
    {
      "formLineCode": "8825-RENTAL",
      "formLineLabel": "Rental real estate income",
      "scheduleReference": "Form 8825",
      "grain": "DETAIL",
      "instances": [
        { "instanceId": "prop-001", "instanceLabel": "100 Main St", "approvedAmount": 240000.00 },
        { "instanceId": "prop-002", "instanceLabel": "220 Oak Ave", "approvedAmount": 185000.00 }
      ]
    }
  ]
}`;

  return (
    <div style={{ marginBottom: "28px" }}>
      <SectionHeading label="Architecture Specification" sub="Roger/TDC → IMS Integration Architecture Specification (MVP)" />

      {/* Spec card */}
      <div style={{
        backgroundColor: "#f0f4ff", border: `2px solid ${BLUE}`,
        borderRadius: "12px", padding: "20px 24px", marginBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginBottom: "6px" }}>
              Authoritative Technical Specification
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: NAVY, marginBottom: "8px" }}>
              Roger/TDC → IMS Integration Architecture Specification (MVP)
            </div>
            <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.6", marginBottom: "12px" }}>
              This document is the authoritative technical specification for the Roger/TDC outbound integration.
              It documents current architecture, responsibilities, Approved Grain Model, Summary vs Detail, Data Ownership,
              Sign-off, Filing Record, Outbound Contract, Payload Structure, MVP implementation, and Post-MVP roadmap.
              <strong style={{ color: NAVY }}> This document should be reviewed before proposing architectural or integration changes.</strong>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Current Architecture","Responsibilities","Approved Grain Model","Summary vs Detail","Data Ownership","Sign-off","Filing Record","Outbound Contract","Payload Structure","MVP Scope","Post-MVP Roadmap"].map(tag => (
                <span key={tag} style={{
                  fontSize: "10px", fontWeight: 600, backgroundColor: "#dbeafe", color: "#1e40af",
                  borderRadius: "4px", padding: "2px 7px",
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: BLUE, color: "white",
              border: "none", borderRadius: "8px", padding: "10px 18px",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            📄 {open ? "Close Specification" : "Open Architecture Specification"}
          </button>
        </div>
      </div>

      {/* Expandable spec content */}
      {open && (
        <div style={{
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: "12px", padding: "28px 32px",
        }}>
          {/* From / For / Status */}
          <div style={{
            display: "flex", gap: "24px", flexWrap: "wrap",
            backgroundColor: "#f8fafc", border: `1px solid ${BORDER}`,
            borderRadius: "8px", padding: "12px 16px", marginBottom: "20px",
          }}>
            {[["From","DCT"],["For","Roger / TDC / IMS / Process alignment"],["Status","Post-meeting agreed direction, for review"]].map(([k,v]) => (
              <div key={k}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}: </span>
                <span style={{ fontSize: "12px", color: NAVY, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          {p("This captures what was agreed for the Roger and TDC to GoSystem integration: what TDC will do, how data flows, and what we are building to get there. It reflects the current TDC codebase plus the changes the meeting agreed to.")}

          {h2("The one decision that shapes everything")}
          {p("IMS is a translation and import layer, not a calculation engine. It maps and imports the data a user reviewed and approved. It does not aggregate, sum, or apply business logic.")}
          <div style={{
            backgroundColor: "#fef3c7", border: "1px solid #fcd34d",
            borderRadius: "8px", padding: "12px 16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#78350f", lineHeight: "1.6" }}>
              That single decision has one direct consequence for TDC: the values a user approves must be determined, calculated, stored, and attested inside TDC before they reach IMS. Today TDC stores and signs off on detail only. The totals a user actually approves are computed for display but not stored as approved artifacts. Closing that gap is the core of this work.
            </div>
          </div>

          {h2("What TDC sends, and at what grain")}
          {p("Not all data is the same shape. The approach is neither all-summary nor all-detail. A governed rule decides, per mapping, whether a value transmits as an approved total or as detail rows.")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Summary Lines</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>Most Form 1120 lines are a single figure the user approves as a total (e.g., gross receipts). TDC sends the approved total. The underlying detail stays in TDC as support and lineage.</div>
            </div>
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Detail Lines</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>Some areas are genuinely multiple rows the user approves as detail (rental properties on 8825, grid data). TDC sends each row as a distinct instance. Nothing is summed.</div>
            </div>
          </div>
          {p("In both cases, the grain that flows to IMS is the grain the user signed off on. IMS receives it and maps it. It never decides grain and never recomputes.")}

          {h2("The flow, end to end")}
          {[
            ["1. Detail layer", "Tax-ready records carry the book source. Adjustments apply in layers: book, reclass (two-sided, nets to zero), and tax. Each derived record carries a final amount. This exists today."],
            ["2. Aggregation rule", "A governed rule marks each mapping as summary or detail. This is new."],
            ["3. Resolve to approved grain", "Assembly rolls summary lines into a stored total and keeps detail lines as distinct instances. This modifies assembly and stores the totals."],
            ["4. Sign-off", "Detail attestation continues as today. A new attestation covers the approved totals, so the number the user approves is the number stored and sent."],
            ["5. Filing record", "The immutable filing record snapshots the return at the approved grain."],
            ["6. Deliver to IMS", "TDC sends the approved grain with lineage. IMS maps and imports only."],
          ].map(([step, desc]) => (
            <div key={step} style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, minWidth: "130px", paddingTop: "2px" }}>{step}</div>
              <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>{desc}</div>
            </div>
          ))}
          <div style={{ backgroundColor: "#0f172a", color: "#e2e8f0", borderRadius: "8px", padding: "12px 16px", fontSize: "12px", fontStyle: "italic", margin: "12px 0 20px" }}>
            The boundary in one line: TDC determines, calculates, stores, and attests what the user approves. IMS translates and imports it.
          </div>

          {h2("What is already built versus what is new")}
          {p("This is an extension of the current platform, not a rebuild.")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>✓ Already Built</div>
              {["The full detail layer: tax-ready records, adjustments, derived records with final amounts.","The adjustment model, including two-sided reclass that nets to zero across its lines.","Detail sign-off with a cryptographic hash over the attested records.","Return assembly and the immutable filing record.","A published outbound contract with a stubbed delivery path pending IMS."].map(item => (
                <div key={item} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ color: "#059669", fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>✓</span>
                  <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{item}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>New Work — MVP</div>
                {["Store approved totals as first-class, attested values, persisted at assembly rather than recomputed at send.","Add total-level sign-off on the approved totals. Detail sign-off stays unchanged; this is additive.","A summary-versus-detail rule that governs which mappings transmit as total versus detail.","Extend the outbound contract to carry both grains with lineage, plus a minimal detail-instance shape."].map(item => (
                  <div key={item} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <span style={{ color: BLUE, fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>→</span>
                    <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{item}</div>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b21a8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>New Work — Post-MVP</div>
                <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>A general repeating-and-nesting primitive so multi-row and nested structures scale to K-1, K-2, K-3, international forms, depreciation schedules, and additional workpapers without per-form logic. The MVP detail-instance shape is designed as the simple case of this primitive.</div>
              </div>
            </div>
          </div>

          {h2("Annex A — Example Payload at Approved Grain")}
          {p("Illustrative. Values are examples; the fields and structure are the agreed direction. The examples show the range: a summary line, a detail structure with instances, a summary line carrying a schedule reference, and a zero line that is still sent because it was approved.")}
          {pre(examplePayload)}

          {h3("Field Reference")}
          <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", backgroundColor: "#f8fafc", borderBottom: `1px solid ${BORDER}`, padding: "8px 14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em" }}>Field</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em" }}>Meaning</div>
            </div>
            {fieldRows.map(([field, meaning], i) => (
              <div key={field} style={{
                display: "grid", gridTemplateColumns: "220px 1fr",
                padding: "9px 14px",
                borderBottom: i < fieldRows.length - 1 ? `1px solid #f1f5f9` : "none",
                backgroundColor: i % 2 === 0 ? "white" : "#f8fafc",
              }}>
                <code style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "monospace" }}>{field}</code>
                <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{meaning}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#78350f", marginBottom: "6px" }}>Notes</div>
            {[
              "A summary line sends one approved total and points to its supporting detail by reference. The detail stays in TDC.",
              "A detail line sends distinct instances with identifiers. Nothing is aggregated on either side of the boundary.",
              "An approved value of zero is still sent when the line was reviewed and approved (e.g., intercompany revenue fully eliminated). Absence and approved-zero are different.",
              "locatorId, the user-selected destination return instance, is expected at the envelope level but is not yet in the build. It is an open contract item.",
              "This is the target shape. The current build sends flat detail lines only and does not yet carry grain, approved totals, or instances. Annex A represents the agreed direction, not the current contract.",
            ].map(note => (
              <div key={note} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
                <span style={{ color: "#d97706", fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>•</span>
                <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>{note}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", fontSize: "11px", color: SLATE, fontStyle: "italic", borderTop: `1px solid ${BORDER}`, paddingTop: "12px" }}>
            Prepared by DCT for cross-team alignment. Reflects the agreed post-meeting direction.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoSystemTax() {
  const [gapRows, setGapRows] = useState([
    { req: "", capability: "", gap: "", owner: "" },
  ]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [qaOpen, setQaOpen] = useState<Record<string, boolean>>({});
  const toggleQa = (title: string) => setQaOpen(o => ({ ...o, [title]: !o[title] }));

  const toggleCheck = (key: string) =>
    setChecklist(c => ({ ...c, [key]: !c[key] }));

  const RESPONSIBILITIES = [
    { title: "IRS Line Translation",  icon: "↔", desc: "Translates each IRS form line code (formLineCode) from the TDC flat payload into the GoSystem-specific field. IMS owns the IRS-to-engine mapping.", color: "#7c3aed" },
    { title: "Roll-Up & Grouping",    icon: "∑", desc: "Sums per-record tax lines into the single per-form-line figure the engine's input grid expects. Groups lines into engine worksheet structures. TDC emits one line per record; IMS aggregates.", color: "#0369a1" },
    { title: "Data-Copy",             icon: "📋", desc: "Where the target engine requires the same value in multiple fields, IMS performs the copy. TDC sends each governed value once.", color: "#065f46" },
    { title: "Engine Routing",        icon: "🔀", desc: "Routes data to the correct engine and return instance. Writes data into GoSystem. Determines which return instance receives the payload.", color: "#92400e" },
    { title: "Per-Line Feedback",     icon: "📨", desc: "Returns per-line processing results using returnLineId for correlation. IMS echoes the returnLineId from the TDC payload to identify which lines succeeded or failed.", color: "#1e3a5f" },
  ];

  const RULES = [
    { rule: "DCT does not integrate directly with any return engine",   detail: "GoSystem, CCH, OIT, and all future return engines are reached exclusively through IMS. There is no direct TDC → GoSystem connection.", icon: "✕" },
    { rule: "IMS is a governed consumer of TDC via B9A Gateway",        detail: "IMS retrieves data through the same governed B9A Gateway APIs as Roger and other consumers. It does not have direct database access to TDC.", icon: "✓" },
    { rule: "IMS owns all engine routing and translation logic",         detail: "The decision of which engine receives which payload — and in what format — belongs entirely to IMS. TDC and Roger have no knowledge of engine-specific requirements.", icon: "✓" },
    { rule: "IMS does not own or modify tax data",                       detail: "IMS is an integration broker only. It does not compute tax, apply business rules, or modify the governed payload it receives from TDC.", icon: "✕" },
    { rule: "GoSystem is one of several possible return engines",        detail: "GoSystem is a downstream return engine that IMS may route to. CCH, OIT, and future engines are also valid targets. IMS abstracts this from DCT.", icon: "→" },
  ];

  const APIS = [
    { method: "GET",  path: "/api/v1/ims/payload/{entityId}",            desc: "Retrieve governed tax-ready payload for an entity from TDC via B9A" },
    { method: "POST", path: "/api/v1/ims/deliver/{entityId}/{engine}",   desc: "Deliver translated payload to the specified return engine" },
    { method: "GET",  path: "/api/v1/ims/engine-lookup/{entityId}",      desc: "Determine which return engine is assigned to an entity" },
    { method: "GET",  path: "/api/v1/ims/delivery-status/{entityId}",    desc: "Check delivery status and acknowledgement for a payload" },
    { method: "POST", path: "/api/v1/ims/inbound/{engine}/{entityId}",   desc: "Receive inbound return data from a return engine back to IMS" },
  ];

  const methodColor = (m: string) => m === "GET" ? "#0369a1" : m === "POST" ? "#059669" : "#7c3aed";

  const DISCOVERY_STEPS = [
    {
      num: "01", title: "Understand the Business Need", color: BLUE,
      items: ["Business process","User workflow","IMS expectations","Required identifiers","Required attributes","Expected payload","Transformation expectations"],
    },
    {
      num: "02", title: "Review Existing DCT Capabilities", color: "#0369a1",
      items: ["IMS Overview","Architecture Specification","Batch 9A","Batch 16","Batch 28","Gateway","Existing APIs","Existing Data Contracts","Existing Payload Structure"],
    },
    {
      num: "03", title: "Ask Buddy", color: PURPLE,
      items: ["Does DCT already support this capability?","Does this identifier already exist?","Does this attribute already exist?","Does an API already exist?","Is this owned by IMS or DCT?","Which batch already implements this?"],
    },
    {
      num: "04", title: "Document Only the Gaps", color: "#059669",
      items: ["If the capability already exists, no additional requirement should be created.","If a capability does not exist, document the gap for DCT review.","Identify the existing capability.","Determine whether the work belongs to IMS or DCT.","Document only true enhancements."],
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "ims-overview",  label: "Reviewed IMS Overview" },
    { key: "arch-spec",     label: "Reviewed Architecture Specification" },
    { key: "b9a",           label: "Reviewed Batch 9A" },
    { key: "b16",           label: "Reviewed Batch 16" },
    { key: "b28",           label: "Reviewed Batch 28" },
    { key: "apis",          label: "Reviewed existing APIs" },
    { key: "payload",       label: "Reviewed existing payload" },
    { key: "buddy",         label: "Asked Ask Buddy" },
    { key: "verify",        label: "Verified capability does not already exist" },
    { key: "gaps",          label: "Identified a true platform gap" },
  ];

  const BUDDY_PROMPTS = [
    "Explain the IMS architecture.",
    "Explain the Roger → IMS integration.",
    "Explain Batch 9A.",
    "Explain Batch 16.",
    "Explain Batch 28.",
    "Explain the Gateway.",
    "What identifiers already exist?",
    "What APIs already exist?",
    "What data contracts already exist?",
    "Show me the outbound payload.",
    "Explain approved grain.",
    "Explain summary versus detail.",
    "Explain Filing Record.",
    "Explain Return Assembly.",
    "What does IMS own?",
    "What does DCT own?",
    "Does DCT already support this capability?",
    "Is this an IMS responsibility or a DCT responsibility?",
    "What remains an open decision?",
  ];

  const QA_CATEGORIES = [
    {
      title: "Architecture",
      color: BLUE,
      icon: "🏗",
      questions: [
        "How does IMS integrate with DCT?",
        "Does TDC integrate directly with GoSystem?",
        "What is IMS responsible for?",
        "What is DCT responsible for?",
        "Where is the architecture boundary?",
      ],
    },
    {
      title: "Existing Capabilities",
      color: "#0369a1",
      icon: "✓",
      questions: [
        "Which capabilities already exist?",
        "Which batches implement those capabilities?",
        "Which APIs already exist?",
        "Which data contracts already exist?",
        "Which payloads already exist?",
      ],
    },
    {
      title: "Data",
      color: "#059669",
      icon: "📊",
      questions: [
        "What identifiers already exist?",
        "What attributes already exist?",
        "What payload does IMS receive?",
        "What metadata already exists?",
        "What information is included in the outbound contract?",
      ],
    },
    {
      title: "Processing",
      color: PURPLE,
      icon: "⚙",
      questions: [
        "Who owns roll-up?",
        "Who translates IRS form lines?",
        "Who performs payload transformation?",
        "Who owns engine routing?",
        "Who owns tax calculations?",
        "Who owns lineage?",
        "Who owns Filing Record?",
        "Who owns Return Assembly?",
      ],
    },
    {
      title: "Implementation",
      color: "#92400e",
      icon: "🔧",
      questions: [
        "Does DCT already support this capability?",
        "Which batch owns the functionality?",
        "Is the work already planned?",
        "Does the enhancement belong to IMS or DCT?",
      ],
    },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: PURPLE,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "14px",
          }}>IMS</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: NAVY, margin: 0 }}>IMS — Integration & Management System</h1>
            <div style={{ fontSize: "11px", color: SLATE }}>Integration Broker — Routes governed DCT data to downstream return engines</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", margin: "10px 0 0", lineHeight: "1.6" }}>
          IMS is the integration layer between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT, and future engines).
          DCT does not integrate directly with any return engine — IMS owns all engine routing, payload translation, and delivery.
          IMS retrieves governed data from TDC via the B9A Gateway and delivers it to the appropriate engine.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — BEFORE YOU BEGIN DISCOVERY                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: "#eff6ff", border: `2px solid ${BLUE}`,
        borderRadius: "12px", padding: "20px 24px", marginBottom: "28px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginBottom: "6px" }}>
          Process Team — Self-Service Discovery
        </div>
        <div style={{ fontSize: "17px", fontWeight: 800, color: NAVY, marginBottom: "10px" }}>
          Self-Service Discovery
        </div>
        <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", margin: "0 0 14px" }}>
          This page is intended to answer the majority of questions regarding the Roger/DCT → IMS integration. Before documenting new requirements or requesting DCT enhancements, use this page and Ask Buddy to determine whether the capability already exists within DCT. The goal is to identify <strong>true capability gaps</strong>, not recreate existing functionality.
        </p>
        {/* Discovery Principle callout */}
        <div style={{
          backgroundColor: "white", border: `1px solid ${BLUE}`,
          borderRadius: "8px", padding: "14px 18px",
          borderLeft: `4px solid ${BLUE}`,
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Discovery Principle
          </div>
          <div style={{ fontSize: "13px", color: "#1e3a5f", lineHeight: "1.7" }}>
            Discovery begins by understanding the existing platform.<br />
            If the answer already exists within this workspace or Ask Buddy, additional DCT discovery should not be required.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — DISCOVERY WORKFLOW (4 steps)                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="Discovery Process" sub="Complete these steps before creating any new requirement" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {DISCOVERY_STEPS.map(step => (
            <div key={step.num} style={{
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: "10px", padding: "16px",
              borderTop: `3px solid ${step.color}`,
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                backgroundColor: step.color, color: "white",
                fontSize: "11px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "10px",
              }}>{step.num}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>{step.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {step.items.map(item => (
                  <div key={item} style={{ display: "flex", gap: "5px", alignItems: "flex-start" }}>
                    <span style={{ color: step.color, fontSize: "10px", flexShrink: 0, marginTop: "3px" }}>•</span>
                    <div style={{ fontSize: "11px", color: SLATE, lineHeight: "1.4" }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2b — WHAT QUESTIONS CAN THIS PAGE ANSWER?                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="What Questions Can This Page Answer?" sub="Expand a category to see what this workspace covers" />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {QA_CATEGORIES.map(cat => (
            <div key={cat.title} style={{
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: "10px", overflow: "hidden",
            }}>
              <button
                onClick={() => toggleQa(cat.title)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", backgroundColor: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left",
                  borderLeft: `4px solid ${cat.color}`,
                }}
              >
                <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: NAVY, flex: 1 }}>{cat.title}</span>
                <span style={{ fontSize: "11px", color: SLATE }}>{qaOpen[cat.title] ? "▲ Collapse" : "▼ Expand"}</span>
              </button>
              {qaOpen[cat.title] && (
                <div style={{ padding: "12px 16px 14px 36px", borderTop: `1px solid ${BORDER}`, backgroundColor: "#f8fafc" }}>
                  {cat.questions.map(q => (
                    <div key={q} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ color: cat.color, fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>→</span>
                      <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>{q}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — DELIVERY MODEL (2 side-by-side cards)                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="Delivery Model" sub="Ownership boundaries between the Process Team and DCT" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
          {/* Process Team */}
          <div style={{
            backgroundColor: "white", border: `1px solid ${BORDER}`,
            borderRadius: "10px", padding: "18px 20px",
            borderTop: `3px solid ${BLUE}`,
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Process Team</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY, marginBottom: "10px" }}>Responsible for</div>
            {["Business discovery","Business requirements","Functional requirements","User workflow","Process documentation","IMS expectations","Mockups"].map(item => (
              <div key={item} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
                <span style={{ color: BLUE, fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>✓</span>
                <div style={{ fontSize: "12px", color: "#334155" }}>{item}</div>
              </div>
            ))}
          </div>
          {/* DCT */}
          <div style={{
            backgroundColor: "white", border: `1px solid ${BORDER}`,
            borderRadius: "10px", padding: "18px 20px",
            borderTop: `3px solid ${PURPLE}`,
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>DCT</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY, marginBottom: "10px" }}>Responsible for</div>
            {["Existing platform capabilities","Architecture","APIs","Data Contracts","Gap Analysis","Solution Design","Development","Governance"].map(item => (
              <div key={item} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
                <span style={{ color: PURPLE, fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>✓</span>
                <div style={{ fontSize: "12px", color: "#334155" }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          backgroundColor: "#faf5ff", border: "1px solid #e9d5ff",
          borderRadius: "8px", padding: "12px 16px",
          borderLeft: `4px solid ${PURPLE}`,
        }}>
          <div style={{ fontSize: "13px", color: "#3b0764", lineHeight: "1.7" }}>
            The Process Team defines <strong>what the business needs.</strong> DCT determines <strong>how those requirements fit within the existing platform</strong> and identifies any enhancements required.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — BEFORE REQUESTING A DCT ENHANCEMENT (checklist)           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="Before Requesting a DCT Enhancement" sub="Complete this checklist before submitting any new IMS requirement" />
        <div style={{
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: "10px", padding: "18px 20px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {CHECKLIST_ITEMS.map(item => (
              <label key={item.key} style={{
                display: "flex", alignItems: "center", gap: "10px",
                cursor: "pointer", padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: checklist[item.key] ? "#f0fdf4" : "#f8fafc",
                border: `1px solid ${checklist[item.key] ? "#bbf7d0" : BORDER}`,
              }}>
                <input
                  type="checkbox"
                  checked={!!checklist[item.key]}
                  onChange={() => toggleCheck(item.key)}
                  style={{ width: "15px", height: "15px", accentColor: "#059669", cursor: "pointer" }}
                />
                <span style={{
                  fontSize: "12px",
                  color: checklist[item.key] ? "#065f46" : "#334155",
                  fontWeight: checklist[item.key] ? 600 : 400,
                  textDecoration: checklist[item.key] ? "line-through" : "none",
                }}>{item.label}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: "12px", fontSize: "11px", color: SLATE, fontStyle: "italic" }}>
            Checkboxes are for local tracking only. All items must be completed before requesting DCT enhancements.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — ASK BUDDY INSTEAD                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="Ask Buddy Instead" sub="Before contacting DCT, ask Buddy questions such as:" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {BUDDY_PROMPTS.map(prompt => (
            <div key={prompt} style={{
              backgroundColor: "#faf5ff", border: "1px solid #e9d5ff",
              borderRadius: "8px", padding: "10px 12px",
              fontSize: "11px", color: "#3b0764", lineHeight: "1.4",
              cursor: "default",
            }}>
              <span style={{ color: PURPLE, fontWeight: 700, marginRight: "4px" }}>→</span>
              {prompt}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — GAP ANALYSIS TEMPLATE                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "28px" }}>
        <SectionHeading label="Gap Analysis" sub="Before requesting DCT enhancements, complete a row for each business requirement" />
        <div style={{
          backgroundColor: "#fffbeb", border: "1px solid #fcd34d",
          borderRadius: "8px", padding: "10px 14px", marginBottom: "12px",
          fontSize: "12px", color: "#78350f", lineHeight: "1.6",
        }}>
          Before documenting a DCT enhancement: identify the existing capability, determine whether the capability already satisfies the business requirement, identify only true capability gaps, and determine whether the enhancement belongs to IMS or DCT.
        </div>
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px",
            backgroundColor: "#f8fafc", borderBottom: `1px solid ${BORDER}`,
            padding: "8px 14px", gap: "12px",
          }}>
            {["Business Requirement","Existing DCT Capability","Gap","Owner"].map(h => (
              <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
            ))}
          </div>
          {/* Editable rows */}
          {gapRows.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px",
              padding: "8px 14px", gap: "12px",
              borderBottom: i < gapRows.length - 1 ? `1px solid #f1f5f9` : "none",
              backgroundColor: i % 2 === 0 ? "white" : "#f8fafc",
            }}>
              {(["req","capability","gap","owner"] as const).map(field => (
                <input
                  key={field}
                  value={row[field]}
                  onChange={e => {
                    const updated = [...gapRows];
                    updated[i] = { ...updated[i], [field]: e.target.value };
                    setGapRows(updated);
                  }}
                  placeholder={field === "req" ? "Describe requirement..." : field === "capability" ? "Existing capability..." : field === "gap" ? "Gap description..." : "IMS / DCT"}
                  style={{
                    fontSize: "12px", color: "#334155",
                    border: `1px solid ${BORDER}`, borderRadius: "4px",
                    padding: "5px 8px", width: "100%", boxSizing: "border-box",
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                />
              ))}
            </div>
          ))}
          {/* Add row */}
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={() => setGapRows(r => [...r, { req: "", capability: "", gap: "", owner: "" }])}
              style={{
                fontSize: "11px", fontWeight: 600, color: BLUE,
                backgroundColor: "transparent", border: `1px dashed ${BLUE}`,
                borderRadius: "4px", padding: "4px 12px", cursor: "pointer",
              }}
            >+ Add Row</button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7a — ARCHITECTURE DIAGRAMS (interactive)                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "4px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginBottom: "4px" }}>Section 7a</div>
        <div style={{ fontSize: "17px", fontWeight: 800, color: NAVY, marginBottom: "4px" }}>Architecture Diagrams</div>
        <div style={{ fontSize: "12px", color: SLATE, marginBottom: "14px" }}>Interactive visual reference — select a diagram tab to explore the platform architecture, ownership boundaries, and data flow.</div>
      </div>
      <IMSArchitectureDiagrams />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7b — ARCHITECTURE SPECIFICATION (expandable)                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ArchitectureSpec />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DIVIDER — existing technical reference below                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "28px",
      }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: BORDER }} />
        <div style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: SLATE, whiteSpace: "nowrap",
        }}>
          Technical Reference — Existing DCT Documentation
        </div>
        <div style={{ flex: 1, height: "1px", backgroundColor: BORDER }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* EXISTING CONTENT — PRESERVED UNCHANGED                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* Role in DCT */}
      <div style={{
        backgroundColor: PURPLE, borderRadius: "10px", padding: "16px 20px",
        marginBottom: "28px", color: "white",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e9d5ff", marginBottom: "8px" }}>
          IMS's Role in the DCT Architecture
        </div>
        <div style={{ fontSize: "14px", lineHeight: "1.7" }}>
          IMS is the <strong>integration broker</strong> between DCT and all return engines. It retrieves governed, tax-ready data from TDC via the B9A Gateway, translates it into the format required by the target engine, and delivers it. IMS abstracts all engine-specific knowledge from DCT — TDC and Roger have no awareness of GoSystem, CCH, OIT, or any other return engine.
        </div>
      </div>

      {/* Architecture boundary callout */}
      <div style={{
        backgroundColor: "#fef2f2", border: "1px solid #fecaca",
        borderRadius: "10px", padding: "14px 18px", marginBottom: "28px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>Architecture Boundary — Important for BAs</div>
          <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.6" }}>
            When documenting requirements, do not write stories that assume a direct TDC → GoSystem connection.
            All return engine integration is owned by IMS. If a business need involves delivering data to GoSystem, CCH, or OIT,
            the requirement belongs to the IMS integration layer — not to DCT, TDC, or B28.
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px" }}>IMS Responsibilities</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {RESPONSIBILITIES.map(r => (
            <div key={r.title} style={{
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: "10px", padding: "14px",
              textAlign: "center", borderTop: `3px solid ${r.color}`,
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{r.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>{r.title}</div>
              <div style={{ fontSize: "11px", color: SLATE, lineHeight: "1.4" }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance rules */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px" }}>Governance Rules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {RULES.map(r => (
            <div key={r.rule} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: "8px", padding: "12px 16px",
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                backgroundColor: r.icon === "✕" ? "#fef2f2" : r.icon === "✓" ? "#f0fdf4" : "#eff6ff",
                border: `1px solid ${r.icon === "✕" ? "#fecaca" : r.icon === "✓" ? "#bbf7d0" : "#bfdbfe"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
                color: r.icon === "✕" ? "#dc2626" : r.icon === "✓" ? "#059669" : "#1e40af",
                flexShrink: 0,
              }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY, marginBottom: "4px" }}>{r.rule}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APIs */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px" }}>IMS APIs</div>
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          {APIS.map((api, i) => (
            <div key={api.path} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 16px",
              borderBottom: i < APIS.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: i % 2 === 0 ? "#f8fafc" : "white",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px",
                backgroundColor: `${methodColor(api.method)}15`, color: methodColor(api.method),
                minWidth: "40px", textAlign: "center", flexShrink: 0,
              }}>{api.method}</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#0f172a", flex: 1 }}>{api.path}</span>
              <span style={{ fontSize: "11px", color: SLATE }}>{api.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration summary */}
      <div style={{
        backgroundColor: "#f8fafc", border: `1px solid ${BORDER}`,
        borderRadius: "10px", padding: "16px 20px", marginBottom: "28px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "10px" }}>Integration Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Data Source",         value: "TDC via B9A Gateway (governed consumer, scoped profile)" },
            { label: "Trigger",             value: "TDC publishes downstream event when data is finalized and Roger-approved" },
            { label: "Data Direction",      value: "TDC → B9A Gateway → IMS → Return Engine (one-way delivery)" },
            { label: "Return Engines",      value: "GoSystem, CCH, OIT, and future engines (IMS abstracts all engine specifics)" },
            { label: "Write-back to TDC",   value: "None — IMS never writes back to TDC" },
            { label: "Inbound from Engine", value: "IMS receives acknowledgements and inbound return data from engines" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: SLATE, minWidth: "140px" }}>{item.label}:</div>
              <div style={{ fontSize: "12px", color: "#334155" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The Dividing Test */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px" }}>The Dividing Test — TDC vs. IMS</div>
        <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "16px 20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", color: "#0c4a6e", lineHeight: "1.7" }}>
            <strong>Does the operation depend on the target engine's input format?</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>If YES → IMS</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>The operation is engine-shaped. IMS owns it.</div>
            </div>
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>If NO → TDC</div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>The operation is the same for every engine because it is defined by the IRS form or tax law. TDC owns it.</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Roll-Up Ownership — Explicit Assignment</div>
          <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
            TDC emits <strong>one line per tax-ready record</strong>, not a rolled-up total per form line. The same <code style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>formLineCode</code> can appear on several lines. This is deliberate: one line per record preserves line-level lineage back to the source. Rolling those up into a single per-form-line total is lossy and engine-shaped, so it sits downstream.
          </div>
          <div style={{ marginTop: "10px", padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>
              <strong>DCT's position:</strong> The roll-up from line-per-record to per-form-line totals is IMS's responsibility, as part of translating to the engine. It must be <strong>assigned explicitly</strong> so it does not fall through the gap between TDC and IMS.
            </div>
          </div>
        </div>
      </div>

      {/* IMS Does NOT Own */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px" }}>IMS Does NOT Own</div>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "14px 18px" }}>
          <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.7" }}>
            IMS <strong>does not perform tax-semantic calculations</strong>. Tax calculations and governed values remain the responsibility of TDC. IMS translates, shapes, and routes — it does not compute tax.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" }}>
            {["Tax-semantic calculations","Governed tax values","IRS-form structure","Lineage preservation","Stable outbound contract","Stable identifiers (filingId, assemblyId, deliveryId, returnLineId)"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "#dc2626", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✕</span>
                <div style={{ fontSize: "12px", color: "#7f1d1d" }}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "#92400e", marginTop: "10px", fontStyle: "italic" }}>These are owned by TDC / DCT.</div>
        </div>
      </div>

      {/* Open Decisions */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Open Decisions</div>
        <div style={{ fontSize: "12px", color: SLATE, marginBottom: "14px" }}>Items requiring future agreement or implementation — not yet in the build.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "OD-1", title: "Destination Return Locator (locatorId)", detail: "Not carried in the payload today. DCT's position: it is user intent, selected in Roger and carried explicitly, not inferred by IMS. Needs to be added to the contract.", status: "Open" },
            { id: "OD-2", title: "Confirm IMS Owns Roll-Up", detail: "Confirm IMS owns the roll-up from line-per-record to per-form-line totals. Must be assigned explicitly so it does not fall through the gap.", status: "Open" },
            { id: "OD-3", title: "Per-Line Error Response Contract", detail: "Structure for IMS to return per-line processing results (which returnLineId failed and why) back to TDC. Not yet defined.", status: "Open" },
            { id: "OD-4", title: "Activity / Sub-Entity Differentiation", detail: "Not represented in the outbound payload. Current data layer does not capture activity-level grouping within a legal entity. Out of MVP scope.", status: "Out of Scope (MVP)" },
          ].map(od => (
            <div key={od.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, backgroundColor: od.status === "Open" ? "#fef3c7" : "#f1f5f9", color: od.status === "Open" ? "#92400e" : SLATE, padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap", alignSelf: "flex-start", marginTop: "1px" }}>{od.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY, marginBottom: "4px" }}>{od.title}</div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{od.detail}</div>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, backgroundColor: od.status === "Open" ? "#fef2f2" : "#f8fafc", color: od.status === "Open" ? "#dc2626" : SLATE, padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", alignSelf: "flex-start" }}>{od.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* EXPECTED OUTCOME                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: "12px", padding: "20px 24px", marginBottom: "28px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#065f46", marginBottom: "6px" }}>
          Expected Outcome
        </div>
        <div style={{ fontSize: "15px", fontWeight: 800, color: NAVY, marginBottom: "12px" }}>
          After reviewing this workspace, a Process Team Business Analyst should be able to:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            "Understand the Roger/DCT → IMS architecture.",
            "Understand the ownership boundaries between IMS and DCT.",
            "Identify existing DCT capabilities.",
            "Determine whether an existing capability already satisfies the business requirement.",
            "Understand the current APIs, payloads, identifiers, and data contracts.",
            "Identify only true capability gaps requiring DCT enhancements.",
            "Document requirements without needing a DCT architecture walkthrough.",
          ].map(item => (
            <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "#059669", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{item}</div>
            </div>
          ))}
        </div>
      </div>

      <RelatedObjectsPanel rootNodeId="sys-ims" title="IMS — Connected Knowledge Graph" />
      <DiscoveryAskBuddy pagePath="/discovery/gosystem" pageTitle="IMS — Integration & Management System" />
    </div>
  );
}

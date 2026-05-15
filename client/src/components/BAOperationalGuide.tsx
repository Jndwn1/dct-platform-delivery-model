import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, AlertTriangle, CheckCircle, Info, ExternalLink, Zap, Eye } from "lucide-react";
import { Link } from "wouter";

interface GuideCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  metricKey: string;
  healthColor: "green" | "yellow" | "red" | "purple";
  explanation: string;
  whyItMatters: string;
  baInterpretation: string;
  commonRisks: string[];
  recommendedActions: string[];
  sourceDependencies: { label: string; path: string }[];
  escalationGuidance: string;
  questionsToAsk: string[];
  redFlags: string[];
  baCallout: string;
}

const GUIDE_CARDS: GuideCard[] = [
  {
    id: "batches-complete",
    title: "Batches Complete",
    icon: <CheckCircle className="w-5 h-5" />,
    metricKey: "batchesComplete",
    healthColor: "green",
    explanation:
      "A batch is considered Complete when all four gate conditions have been verified: Schema Lock (data structure is finalized and immutable), Invariant Lock (business rules are enforced), Contract Publication (the Read Contract is published and versioned), and Lineage Closure (the full data lineage chain is traceable end-to-end). Completion is recorded in the DCT Control Panel and reflected in the Batch Roadmap.",
    whyItMatters:
      "Batch completion is the foundation of PI demo readiness and production eligibility. A batch that is 'done' in ADO stories is not the same as a batch that has passed all four gates. Leadership and Roger consumers depend on gate-verified completion — not story closure — to make downstream delivery decisions.",
    baInterpretation:
      "When you see a batch marked Complete, verify it has passed all four gates in the Gate Status page. A batch with stories closed but gates open is delivery-incomplete. The Control Panel is the authoritative source — not ADO sprint boards.",
    commonRisks: [
      "Stories closed in ADO but gates not verified in the Control Panel",
      "Schema Lock passed but Lineage Closure deferred to a future batch",
      "Contract Publication recorded as 'Partial' instead of fully published",
      "Batch marked Complete in one system but still Active in another",
    ],
    recommendedActions: [
      "Validate all four gates in the Gate Status page before marking a batch complete in PI planning artifacts",
      "Cross-reference the Batch Roadmap completion % against the Control Panel gate status",
      "Confirm the Read Contract is published and versioned — not just drafted",
      "Ensure lineage closure is documented in the Batch Detail page before closing the batch",
    ],
    sourceDependencies: [
      { label: "DCT Control Panel", path: "/control-panel" },
      { label: "Gate Status", path: "/gate-status" },
      { label: "Batch Roadmap", path: "/batch-roadmap" },
    ],
    escalationGuidance:
      "If a batch appears Complete in ADO but gates are not verified, escalate to the PO and Architecture team immediately. Do not count the batch as complete in PI reporting until all four gates are confirmed in the Control Panel.",
    questionsToAsk: [
      "Have all four gates been verified in the Gate Status page?",
      "Is the Read Contract published and versioned — not just drafted?",
      "Is lineage closure documented in the Batch Detail page?",
      "Does the Batch Roadmap reflect the same completion status as the Control Panel?",
    ],
    redFlags: [
      "Batch shows Complete in ADO but Gate Status shows In Progress",
      "Read Contract is 'Partial' or 'Pending'",
      "Lineage Closure is deferred to a future batch",
      "Completion % in Batch Roadmap does not match Control Panel",
    ],
    baCallout:
      "A batch is only complete when all four gates are verified in the DCT Control Panel. Story closure in ADO is a necessary but not sufficient condition for batch completion.",
  },
  {
    id: "active-batches",
    title: "Active Batches",
    icon: <Zap className="w-5 h-5" />,
    metricKey: "activeBatches",
    healthColor: "yellow",
    explanation:
      "An Active batch is currently in delivery — stories are in progress, engineering is building, and gates are being worked toward. Active batches have not yet passed all four gate conditions. The current active batch is B8 (Exceptions & Remediation). Multiple batches can be Active simultaneously within a PI if they have no blocking dependencies on each other.",
    whyItMatters:
      "Active batches represent the current delivery risk surface. Every active batch is a potential blocker for downstream Roger readiness, PI demo commitments, and contract publication. BAs must monitor active batches weekly to catch dependency conflicts before they become sprint blockers.",
    baInterpretation:
      "Track active batches against their PI target dates in the Batch Delivery Calendar. Confirm that ADO stories are aligned to the batch scope — not just the sprint. Watch for batches that have been Active for more than one sprint without gate progress.",
    commonRisks: [
      "Active batch scope expanding beyond the original batch definition",
      "Stories in the sprint not mapped to the correct batch",
      "Active batch blocked by an upstream dependency that has not been escalated",
      "No gate progress after two or more sprints",
    ],
    recommendedActions: [
      "Review active batch scope weekly against the Batch Detail page",
      "Confirm ADO stories are tagged to the correct batch and PI",
      "Track gate progress in the Gate Status page — not just story velocity",
      "Escalate any active batch with no gate progress after two sprints",
    ],
    sourceDependencies: [
      { label: "DCT Control Panel", path: "/control-panel" },
      { label: "Batch Delivery Calendar", path: "/batch-calendar" },
      { label: "Batch Detail", path: "/batch/8" },
    ],
    escalationGuidance:
      "If an active batch has been in delivery for more than two sprints without gate progress, escalate to the PO and Architecture team. Identify whether the blocker is a DEV issue, architecture decision, or governance gap.",
    questionsToAsk: [
      "What is the target gate completion date for the active batch?",
      "Are all ADO stories tagged to the correct batch?",
      "Is there any gate progress this sprint?",
      "Are there any upstream dependencies that could block gate completion?",
    ],
    redFlags: [
      "Active batch with no gate progress after two sprints",
      "Stories in the sprint not mapped to the active batch",
      "Scope expanding beyond the original batch definition",
      "No dependency tracking in the Batch Detail page",
    ],
    baCallout:
      "Active batches are the current delivery risk surface. Monitor gate progress weekly — not just story velocity. A batch with 100% stories done but 0% gate progress is not delivery-complete.",
  },
  {
    id: "blocked-batches",
    title: "Blocked Batches",
    icon: <AlertTriangle className="w-5 h-5" />,
    metricKey: "blockedBatches",
    healthColor: "red",
    explanation:
      "A batch is Blocked when one or more of its dependencies have not been met. Blockers fall into five categories: DEV (engineering implementation not complete), Architecture (an architectural decision is pending or unresolved), Governance (a governance gap or ADR is open), API Contract (a required API contract is not published), or Upstream Dependency (a predecessor batch has not completed its gates). Blocked batches cannot progress to gate verification until the blocker is resolved.",
    whyItMatters:
      "Blocked batches are the highest delivery risk in the platform. A single unresolved blocker can cascade through multiple downstream batches, delaying Roger readiness, PI demo commitments, and contract publication. BAs are responsible for tracking and escalating blockers — not waiting for engineering to surface them.",
    baInterpretation:
      "Review the Carry-Forward Items panel in this Hub for all blocked batches. For each blocker, identify the type (DEV / Architecture / Governance / API / Upstream) and the responsible team. Governance and Architecture blockers require escalation to the PO and Architecture team — BAs should not attempt to resolve these independently.",
    commonRisks: [
      "Blocker identified but not escalated to the correct team",
      "Governance gap treated as a DEV issue",
      "Upstream dependency not tracked in the Batch Detail page",
      "Blocker resolved in engineering but not updated in the Control Panel",
    ],
    recommendedActions: [
      "Review the Carry-Forward Items panel weekly for all blocked batches",
      "Classify each blocker by type and assign to the correct team",
      "Escalate Governance and Architecture blockers to the PO immediately",
      "Update the Control Panel when a blocker is resolved",
    ],
    sourceDependencies: [
      { label: "Integration Alignment Hub — Carry-Forward Panel", path: "/integration-hub" },
      { label: "DCT Control Panel", path: "/control-panel" },
      { label: "Batch Roadmap", path: "/batch-roadmap" },
    ],
    escalationGuidance:
      "Governance and Architecture blockers must be escalated to the PO and Architecture team within the same sprint they are identified. DEV blockers should be tracked in ADO and reviewed in the daily standup. API Contract blockers require coordination between the DCT BA and Roger BA teams.",
    questionsToAsk: [
      "What type of blocker is this — DEV, Architecture, Governance, API, or Upstream?",
      "Who is the responsible team for resolving this blocker?",
      "Has the blocker been escalated to the correct team?",
      "What is the impact on Roger readiness if this blocker is not resolved this sprint?",
    ],
    redFlags: [
      "Blocker older than one sprint with no resolution owner",
      "Governance gap treated as a DEV issue",
      "Upstream dependency not tracked in the Batch Detail page",
      "Blocker resolved in engineering but not updated in the Control Panel",
    ],
    baCallout:
      "Blocked batches are the highest delivery risk in the platform. BAs are responsible for tracking and escalating blockers — not waiting for engineering to surface them. Classify every blocker by type and assign to the correct team within the same sprint.",
  },
  {
    id: "open-governance-gaps",
    title: "Open Governance Gaps",
    icon: <AlertTriangle className="w-5 h-5" />,
    metricKey: "openGaps",
    healthColor: "purple",
    explanation:
      "A governance gap is an identified condition where the platform's current state does not meet the governance requirements defined in the DCT Architecture. Governance gaps are not bugs — they are architectural or policy deficiencies that must be resolved through an Architecture Decision Record (ADR) or a formal governance review. Common gap types include: Filing Governance (unclear authority for consolidated filing decisions), Ownership Ambiguity (no clear system-of-record for a data object), Lineage Gaps (data lineage chain is incomplete or untraceable), and Missing Immutable Records (decisions that should be immutable are not locked).",
    whyItMatters:
      "Governance gaps are high-risk items because they can invalidate the integrity of the entire platform. A single unresolved lineage gap can make audit trails unreliable. An unresolved ownership ambiguity can create conflicting data authority between PDC and TDC. These gaps must be resolved before a batch can be considered production-ready.",
    baInterpretation:
      "Review the Blocking Governance Gaps panel in this Hub. For each gap, identify whether it is an ADR candidate (requires an Architecture Decision Record) or a delivery gap (can be resolved in the current sprint). ADR candidates must be escalated to the Architecture team — BAs should not attempt to resolve governance decisions independently.",
    commonRisks: [
      "Governance gap treated as a story in the sprint backlog",
      "ADR candidate not escalated to the Architecture team",
      "Gap resolved informally without documentation",
      "Gap marked as resolved in ADO but not updated in the Control Panel",
    ],
    recommendedActions: [
      "Review the Blocking Governance Gaps panel weekly",
      "Classify each gap as ADR candidate or delivery gap",
      "Escalate ADR candidates to the Architecture team immediately",
      "Document all gap resolutions in the Control Panel and Batch Detail page",
    ],
    sourceDependencies: [
      { label: "Integration Alignment Hub — Blocking Gaps Panel", path: "/integration-hub" },
      { label: "Data Model & Gaps", path: "/data-model" },
      { label: "DCT Control Panel", path: "/control-panel" },
    ],
    escalationGuidance:
      "ADR candidates must be escalated to the Architecture team within the same sprint they are identified. Governance gaps that affect filing authority or lineage must be escalated to PO leadership. Never resolve a governance gap informally — all resolutions must be documented.",
    questionsToAsk: [
      "Is this gap an ADR candidate or a delivery gap?",
      "Which system-of-record is affected by this gap?",
      "Has this gap been escalated to the Architecture team?",
      "What is the impact on Roger readiness if this gap is not resolved?",
    ],
    redFlags: [
      "Governance gap treated as a story in the sprint backlog",
      "ADR candidate not escalated to the Architecture team",
      "Gap resolved informally without documentation",
      "Filing authority gap with no resolution owner",
    ],
    baCallout:
      "Governance gaps are not bugs — they are architectural deficiencies. BAs must classify every gap as ADR candidate or delivery gap, and escalate ADR candidates to the Architecture team immediately. Never resolve a governance gap informally.",
  },
  {
    id: "roger-fields-delivered",
    title: "Roger Fields Delivered",
    icon: <CheckCircle className="w-5 h-5" />,
    metricKey: "rogerFieldsDelivered",
    healthColor: "green",
    explanation:
      "Roger Fields Delivered counts the number of data fields that are available for Roger UI consumption across all delivered batches. A field is counted as 'Delivered' when: the API endpoint is published, the field is included in the Read Contract, the field has a governed source in PDC or TDC, and the field is mapped in the Roger UI Data Point Mapping page. 'Partial' means the field exists in the API but is missing from the Read Contract or has no governed source. 'Missing' means the field is expected by Roger UI but has no API or governed source.",
    whyItMatters:
      "Roger UI fields drive the practitioner experience. A missing or partial field means practitioners cannot see the data they need to make tax decisions. BAs must validate field delivery against the Roger UI mapping — not just the API inventory.",
    baInterpretation:
      "Review the Roger UI Data Point Mapping page to validate field delivery. For each batch, confirm that all expected fields are in the 'Delivered' state — not just 'Partial'. Partial fields create consumer experience gaps that are not visible in the API inventory.",
    commonRisks: [
      "Field exists in the API but is not in the Read Contract",
      "Field is mapped in Roger UI but has no governed source in PDC or TDC",
      "Partial field counted as delivered in sprint reporting",
      "Field delivery not validated against the Roger UI mapping",
    ],
    recommendedActions: [
      "Review the Roger UI Data Point Mapping page after each batch delivery",
      "Validate that all expected fields are in 'Delivered' state — not 'Partial'",
      "Confirm each field has a governed source in PDC or TDC",
      "Escalate any field that is 'Partial' or 'Missing' to the DCT BA team",
    ],
    sourceDependencies: [
      { label: "Roger UI Data Point Mapping", path: "/roger-mapping" },
      { label: "DCT Control Panel — Swagger Section", path: "/control-panel" },
      { label: "Data Model & Gaps", path: "/data-model" },
    ],
    escalationGuidance:
      "Partial or missing fields that are expected by Roger UI must be escalated to the DCT BA team. The Roger BA team should not attempt to source fields from non-governed APIs or workarounds.",
    questionsToAsk: [
      "Is this field in the Read Contract or just the API?",
      "Does this field have a governed source in PDC or TDC?",
      "Is this field mapped in the Roger UI Data Point Mapping page?",
      "Is this field 'Delivered' or 'Partial' in the mapping?",
    ],
    redFlags: [
      "Field exists in the API but is not in the Read Contract",
      "Partial field counted as delivered in sprint reporting",
      "Field mapped in Roger UI but no governed source",
      "Field delivery not validated against the Roger UI mapping",
    ],
    baCallout:
      "Roger fields are only delivered when they are in the Read Contract with a governed source. API existence alone is not sufficient. Validate every field against the Roger UI Data Point Mapping page — not just the API inventory.",
  },
  {
    id: "roger-data-points",
    title: "Roger Data Points",
    icon: <Info className="w-5 h-5" />,
    metricKey: "rogerDataPoints",
    healthColor: "yellow",
    explanation:
      "A Roger Data Point is a specific, named piece of information that Roger UI can surface to a practitioner. Data points are distinct from API fields — a single data point may be composed of multiple fields from multiple APIs. A data point is considered 'Available' when: the underlying API is operational, the Read Contract is published, the data point is mapped in the Roger API Evolution page, and the data point has been validated in a Roger UI demo. 'Partially Available' means the data point exists but has known gaps (missing fields, partial lineage, or unvalidated mapping). 'Not Available' means the data point is planned but not yet deliverable.",
    whyItMatters:
      "Roger Data Points are the unit of consumer readiness. A practitioner cannot use a data point that is 'Partially Available' — they need the complete, governed version. BAs must track data point availability against the Roger API Evolution page, not just the API inventory.",
    baInterpretation:
      "Review the Roger API Evolution page to track data point availability by batch. Confirm that 'Available' data points have been validated in a Roger UI demo — not just marked available in the API inventory. 'Partially Available' data points should have a documented resolution path.",
    commonRisks: [
      "Data point marked 'Available' without Roger UI demo validation",
      "Partially available data point with no documented resolution path",
      "Data point composed of fields from multiple APIs with no lineage connection",
      "Data point availability not updated after batch completion",
    ],
    recommendedActions: [
      "Review the Roger API Evolution page after each batch delivery",
      "Validate 'Available' data points in a Roger UI demo",
      "Document resolution paths for all 'Partially Available' data points",
      "Update data point availability in the Roger API Evolution page after each batch",
    ],
    sourceDependencies: [
      { label: "Roger API Evolution", path: "/roger-api" },
      { label: "Roger UI Data Point Mapping", path: "/roger-mapping" },
      { label: "DCT Control Panel", path: "/control-panel" },
    ],
    escalationGuidance:
      "Data points that remain 'Partially Available' for more than one sprint must be escalated to the DCT BA team. The Roger BA team should document the specific fields or lineage gaps that are preventing full availability.",
    questionsToAsk: [
      "Has this data point been validated in a Roger UI demo?",
      "What fields are missing that make this data point 'Partially Available'?",
      "Is there a documented resolution path for partial data points?",
      "Is the data point availability updated in the Roger API Evolution page?",
    ],
    redFlags: [
      "Data point marked 'Available' without Roger UI demo validation",
      "Partially available data point with no resolution path",
      "Data point availability not updated after batch completion",
      "Data point composed of fields with no lineage connection",
    ],
    baCallout:
      "A data point is only consumable when it is Available, validated in a Roger UI demo, and has a published Read Contract. 'Partially Available' is not consumer-ready. Document resolution paths for every partial data point.",
  },
  {
    id: "governance-coverage",
    title: "Governance Coverage",
    icon: <Eye className="w-5 h-5" />,
    metricKey: "governanceCoverage",
    healthColor: "purple",
    explanation:
      "Governance Coverage measures how many of the platform's six governance controls are active for a given batch: (1) Lineage — data lineage chain is complete and traceable; (2) Auditability — all decisions are logged and replayable; (3) Immutable Records — tax decisions are locked and cannot be modified; (4) Authority Boundaries — each system owns only its defined scope; (5) Additive-Only Contracts — Read Contracts can only add fields, never remove; (6) Governance ADR — all open governance decisions have a documented ADR. A score of 0/6 means none of these controls are active for the batch.",
    whyItMatters:
      "Governance coverage is the difference between a platform that is operationally delivered and one that is production-ready. A batch with 0/6 governance coverage may have working APIs and passing stories, but it cannot be trusted for tax decision-making. Low governance coverage is a critical risk that must be escalated to Architecture and PO leadership.",
    baInterpretation:
      "Review the Governance Coverage score for each batch in the Integration Hub. A score below 4/6 is a yellow flag requiring a documented remediation plan. A score of 0/6 or 1/6 is a red flag requiring immediate escalation. Do not count a batch as production-ready unless governance coverage is 5/6 or 6/6.",
    commonRisks: [
      "Batch with 0/6 governance coverage counted as production-ready",
      "Immutable records deferred to a future batch",
      "Authority boundary violations not identified until post-delivery",
      "Additive-only contract rule violated by a field removal",
    ],
    recommendedActions: [
      "Review governance coverage scores in the Integration Hub weekly",
      "Escalate any batch with coverage below 4/6 to the Architecture team",
      "Document remediation plans for all governance gaps",
      "Confirm immutable records are locked before marking a batch complete",
    ],
    sourceDependencies: [
      { label: "Gate Status", path: "/gate-status" },
      { label: "Data Model & Gaps", path: "/data-model" },
      { label: "DCT Control Panel", path: "/control-panel" },
    ],
    escalationGuidance:
      "Any batch with governance coverage below 4/6 must be escalated to the Architecture team and PO leadership. Do not present a batch as production-ready in PI planning or leadership reviews unless governance coverage is 5/6 or 6/6.",
    questionsToAsk: [
      "What is the governance coverage score for this batch?",
      "Which governance controls are missing?",
      "Are immutable records locked for all tax decisions in this batch?",
      "Is there a documented remediation plan for any missing governance controls?",
    ],
    redFlags: [
      "Batch with 0/6 or 1/6 governance coverage",
      "Immutable records deferred to a future batch",
      "Authority boundary violation identified post-delivery",
      "Additive-only contract rule violated",
    ],
    baCallout:
      "Governance coverage is the difference between delivery-complete and production-ready. A batch with 0/6 governance coverage cannot be trusted for tax decision-making. Escalate any batch below 4/6 to Architecture and PO leadership immediately.",
  },
  {
    id: "pi-completion",
    title: "PI Completion",
    icon: <BookOpen className="w-5 h-5" />,
    metricKey: "piCompletion",
    healthColor: "green",
    explanation:
      "PI Completion measures the percentage of batches within a Program Increment that have passed all four gate conditions. This is distinct from story completion percentage in ADO — a PI can be 100% complete in stories but 0% complete in gate verification. PI Completion in the Integration Hub is calculated from the DCT Control Panel gate status, not from ADO sprint boards.",
    whyItMatters:
      "PI Completion is the metric that leadership uses to assess delivery health and demo readiness. A PI that is 100% complete in stories but 60% complete in gate verification is not demo-ready. BAs must communicate the distinction between story completion and gate completion to leadership and stakeholders.",
    baInterpretation:
      "When reporting PI status to leadership, always cite the gate completion percentage from the Integration Hub — not the story completion percentage from ADO. A PI is demo-ready when all committed batches have passed Schema Lock and Invariant Lock. A PI is operationally ready when all committed batches have passed all four gates.",
    commonRisks: [
      "PI reported as complete based on ADO story closure, not gate verification",
      "Demo readiness confused with operational readiness",
      "Stretch batches counted in PI completion percentage",
      "Gate completion not communicated to leadership",
    ],
    recommendedActions: [
      "Report PI completion using gate verification percentage from the Integration Hub",
      "Distinguish between demo readiness (Schema Lock + Invariant Lock) and operational readiness (all four gates)",
      "Exclude stretch batches from PI completion percentage unless they have passed all four gates",
      "Include gate completion status in all PI planning and leadership review artifacts",
    ],
    sourceDependencies: [
      { label: "Batch Roadmap", path: "/batch-roadmap" },
      { label: "Gate Status", path: "/gate-status" },
      { label: "Batch Delivery Calendar", path: "/batch-calendar" },
    ],
    escalationGuidance:
      "If PI completion percentage in gate verification is more than 20% below story completion percentage, escalate to the PO immediately. This gap indicates that stories are being closed without gate verification — a significant governance risk.",
    questionsToAsk: [
      "What is the gate completion percentage for this PI?",
      "How does gate completion compare to story completion in ADO?",
      "Are all committed batches demo-ready (Schema Lock + Invariant Lock)?",
      "Are any stretch batches being counted in the PI completion percentage?",
    ],
    redFlags: [
      "PI reported as complete based on ADO story closure, not gate verification",
      "Gate completion more than 20% below story completion",
      "Stretch batches counted in PI completion percentage",
      "Demo readiness confused with operational readiness in leadership reports",
    ],
    baCallout:
      "PI completion is measured by gate verification — not story closure. Always report gate completion percentage to leadership. A PI with 100% stories done but 60% gate completion is not demo-ready.",
  },
];

const HEALTH_STYLES = {
  green: {
    border: "border-l-4 border-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
    icon: "text-emerald-600",
    label: "Healthy",
  },
  yellow: {
    border: "border-l-4 border-amber-500",
    badge: "bg-amber-100 text-amber-800",
    icon: "text-amber-600",
    label: "Monitor",
  },
  red: {
    border: "border-l-4 border-red-500",
    badge: "bg-red-100 text-red-800",
    icon: "text-red-600",
    label: "High Risk",
  },
  purple: {
    border: "border-l-4 border-purple-500",
    badge: "bg-purple-100 text-purple-800",
    icon: "text-purple-600",
    label: "Governance",
  },
};

interface BAOperationalGuideProps {
  forceExpand?: boolean;
}

export function BAOperationalGuide({ forceExpand = false }: BAOperationalGuideProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [interpretationMode, setInterpretationMode] = useState(false);

  const effectivelyExpanded = interpretationMode || forceExpand;

  const toggleCard = (id: string) => {
    if (effectivelyExpanded) return;
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isExpanded = (id: string) => effectivelyExpanded || expandedCards.has(id);

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">BA Operational Guide — How to Read the Integration Hub</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Purpose: This guide helps Business Analysts interpret operational readiness, governance health, delivery alignment, Roger consumability, and integration risk across the DCT platform.
            </p>
          </div>
        </div>
        <button
          onClick={() => setInterpretationMode((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
            interpretationMode
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Eye className="w-4 h-4" />
          {interpretationMode ? "BA Mode: ON" : "BA Interpretation Mode"}
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {GUIDE_CARDS.map((card) => {
          const styles = HEALTH_STYLES[card.healthColor];
          const open = isExpanded(card.id);
          return (
            <div
              key={card.id}
              className={`bg-slate-800 rounded-lg ${styles.border} overflow-hidden`}
            >
              {/* Card Header */}
              <button
                onClick={() => toggleCard(card.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={styles.icon}>{card.icon}</span>
                  <span className="font-semibold text-white text-sm">{card.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                    {styles.label}
                  </span>
                </div>
                <span className="text-slate-400">
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>

              {/* Card Body */}
              {open && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-700">
                  {/* BA Callout */}
                  <div className="mt-4 bg-blue-950 border border-blue-700 rounded-lg px-4 py-3">
                    <p className="text-blue-200 text-sm font-medium">
                      <span className="text-blue-400 font-bold">What This Means for the BA: </span>
                      {card.baCallout}
                    </p>
                  </div>

                  {/* Two-column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Plain-English Explanation</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{card.explanation}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Why It Matters</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{card.whyItMatters}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">BA Interpretation Guidance</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{card.baInterpretation}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Escalation Guidance</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{card.escalationGuidance}</p>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">⚠ Common Red Flags</h4>
                        <ul className="space-y-1">
                          {card.redFlags.map((flag, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-red-400 mt-0.5 shrink-0">•</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">✓ Recommended BA Actions</h4>
                        <ul className="space-y-1">
                          {card.recommendedActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">? Questions the BA Should Ask</h4>
                        <ul className="space-y-1">
                          {card.questionsToAsk.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-amber-400 mt-0.5 shrink-0">?</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Related Pages</h4>
                        <div className="flex flex-wrap gap-2">
                          {card.sourceDependencies.map((dep) => (
                            <Link
                              key={dep.path}
                              href={dep.path}
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-slate-700 px-2 py-1 rounded transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {dep.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

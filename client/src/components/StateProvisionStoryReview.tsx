import { useState, type ChangeEvent } from "react";
import StoryReviewAskBuddy from "@/components/StoryReviewAskBuddy";

const C = {
  navy: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  purple: "#7c3aed",
  purpleInk: "#6d28d9",
  purpleSurface: "#faf5ff",
  blue: "#0284c7",
  blueSurface: "#f0f9ff",
  teal: "#0f766e",
  tealSurface: "#f0fdfa",
  green: "#15803d",
  greenSurface: "#f0fdf4",
  amber: "#b45309",
  amberSurface: "#fffbeb",
  red: "#be123c",
  redSurface: "#fff1f2",
};

const STORY_ID = "1494344";
const STORY_TITLE = "Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions";
const ADO_LINK = "https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1494344";

type ReviewStatus = "Known" | "TBD" | "Missing" | "Needs Gary Review" | "Pending";

type ChecklistItem = {
  number: string;
  title: string;
  prompt: string;
  example: string;
  status: ReviewStatus;
};

const CHECKLIST: ChecklistItem[] = [
  {
    number: "01",
    title: "Business Outcome",
    prompt: "Confirm a clear objective, understandable expected behavior, one identifiable State or Provision workflow, and whether the story contains one capability or mixed capabilities.",
    example: "For 1494344, distinguish mapping, correction, review, and save / persistence behavior. Flag them if grouped without clear technical requirements.",
    status: "Missing",
  },
  {
    number: "02",
    title: "Story Type",
    prompt: "Classify the work item as a User Story, Technical Story, Task, Dependency, or Spike.",
    example: "Expected first-pass classification: Technical Story, because the title names Gateway and TDC backend behavior rather than a standalone UI capability.",
    status: "Known",
  },
  {
    number: "03",
    title: "System Ownership",
    prompt: "Classify each requirement by Roger, State / Provision, Gateway, TDC, PDC, Orchestrator, IMS, TIM, Taxonomy, or another owner.",
    example: "Flag any responsibility that cannot be assigned to a defined system boundary from supplied evidence.",
    status: "Needs Gary Review",
  },
  {
    number: "04",
    title: "Gateway Requirements",
    prompt: "Determine endpoint impact, method, request / response payloads, required identifiers, validation, errors, idempotency, correlation, authorization, and retry behavior.",
    example: "Ask whether 1494344 uses a new or existing endpoint, one action contract or separate contracts, supported action types, and Roger's returned result.",
    status: "TBD",
  },
  {
    number: "05",
    title: "TDC Persistence",
    prompt: "Establish what is persisted, filing scope, action type, values, actor, timestamp, reason, version, source, lineage, correlation, and current-versus-historical behavior.",
    example: "Determine whether practitioner actions are separate records, a generic action record, versioned governed values, audit events, overrides, or decisions.",
    status: "Missing",
  },
  {
    number: "06",
    title: "Identifiers & Scope",
    prompt: "Check for ClientId, EntityId, TaxYear, ReportingPeriodId, DeliverableId, State, FilingId, FilingGroupId, ConsolidationId, taxonomy / mapping IDs, and RunId / CorrelationId.",
    example: "Do not invent identifiers. Label each absent technical key as “Technical requirement required.”",
    status: "Missing",
  },
  {
    number: "07",
    title: "Data Contract Readiness",
    prompt: "Review Field, Business Meaning, Source, Target, Required?, Data Type, Validation, Current Status, and Open Question.",
    example: "Use candidate categories only as a review aid; keep actionType, actor, values, reason, status, version, and correlation ID as TBD until story evidence defines them.",
    status: "TBD",
  },
  {
    number: "08",
    title: "Acceptance Criteria Quality",
    prompt: "Check successful request, Gateway validation, TDC persistence, retrieval, version behavior, audit / lineage, invalid input, unsupported action, identifiers, update, and retry behavior.",
    example: "Output Existing AC versus Gap / Recommended Clarification. Do not silently rewrite unapproved requirements.",
    status: "Pending",
  },
  {
    number: "09",
    title: "Data Governance",
    prompt: "Check source of truth, governed and prior value, actor, timestamp, reason, lineage, version, audit history, approval state, and correction propagation.",
    example: "For corrections, make original value, corrected value, effective value, who / when / why, and downstream behavior explicit.",
    status: "Needs Gary Review",
  },
  {
    number: "10",
    title: "Dependencies",
    prompt: "Identify dependencies on Roger, State, Provision, Gateway, TDC, Taxonomy, PDC, TIM, IMS, Orchestrator, GoSystem, master data, and shared API contracts.",
    example: "Record why each dependency is needed, its owner, whether it blocks delivery, and its evidence-based status.",
    status: "TBD",
  },
  {
    number: "11",
    title: "Story Split Review",
    prompt: "Assess whether Gateway contract, TDC persistence, TDC retrieval, audit / history, validation, or mapping behavior require separate technical work.",
    example: "Output Yes / No / Needs Technical Review with rationale. Gary makes the final split decision.",
    status: "Needs Gary Review",
  },
];

const OWNERSHIP_ROWS = [
  ["Practitioner performs mapping / correction / review action", "Roger / State UI"],
  ["Submit practitioner action", "Roger / Gateway"],
  ["Validate request contract", "Gateway"],
  ["Persist governed practitioner action", "TDC"],
  ["Version / audit saved action", "TDC"],
  ["Return saved result", "Gateway / TDC"],
  ["Display saved result", "Roger"],
];

const CONTRACT_FIELDS = [
  "actionType",
  "practitionerId / actor",
  "State / jurisdiction",
  "Entity",
  "Filing / deliverable",
  "mapping identifier",
  "original value",
  "updated value",
  "correction reason",
  "review status",
  "timestamp",
  "version",
  "correlation ID",
];

const DEPENDENCIES = [
  ["State / Provision team", "Business workflow, requirements, and story updates", "State / Provision", "Potential", "Needs validation"],
  ["Roger / State UI", "Practitioner action and saved-result display", "Roger / State", "Potential", "Needs contract evidence"],
  ["Gateway", "Action submission, validation, and response contract", "Gateway", "Likely", "Needs Gary review"],
  ["TDC", "Governed persistence, audit, retrieval, and lineage behavior", "TDC", "Likely", "Needs Gary review"],
  ["Taxonomy / shared master data", "Mapping identifiers and governed business meaning", "Taxonomy", "Possible", "TBD"],
  ["Existing API / persistence pattern", "Reuse or conflict assessment", "TDC / Gateway", "Potential", "Requires codebase context"],
];

const REVIEW_FILE_SECTIONS = [
  "Story Information",
  "Executive Summary",
  "Business Outcome",
  "System Ownership",
  "Gateway Impact",
  "TDC Impact",
  "Data Contract",
  "Required Identifiers",
  "Persistence Requirements",
  "Governance / Audit Requirements",
  "Acceptance Criteria Review",
  "Dependencies",
  "Open Questions",
  "Potential Gaps",
  "Story Split Assessment",
  "Ask Buddy Recommendation",
  "Items Requiring Gary Review",
  "Review Status",
];

type CurrentYearStateReview = {
  id: string;
  title: string;
  status: "Yellow" | "Yellow/Orange" | "Orange";
  solid: string;
  gaps: string;
  url: string;
};

const CURRENT_YEAR_STATE_REVIEW_REPORT_URL = "/manus-storage/Current_Year_State_Story_First_Pass_Review_Report_for_Gary_004d26df.md";
const CURRENT_YEAR_STATE_REVIEW_PACKAGE_URL = "/manus-storage/Current_Year_State_Story_Review_Package_for_Gary_5d3a36f5.zip";

const CURRENT_YEAR_STATE_REVIEWS: CurrentYearStateReview[] = [
  {
    id: "1494188",
    title: "PDC — Enable Current-Year State Source Documents Without Financial Mappings",
    status: "Yellow",
    solid: "Clear exception condition with retained standard controls and audit / reason context.",
    gaps: "Define approved State-processing context, mapping-applicability signal, and PDC status values.",
    url: "/manus-storage/ADO_1494188_PDC_Current_Year_State_Source_Documents_Review_9792f3ed.md",
  },
  {
    id: "1494198",
    title: "PDC — Create and Route Current-Year State Source Submissions for Orchestrator Classification",
    status: "Yellow",
    solid: "Clear Tax Portal, PDC, and Orchestrator ownership split with an explicit source-file boundary.",
    gaps: "Confirm submission envelope, idempotency, failure behavior, and stateFootprintVersion rule.",
    url: "/manus-storage/ADO_1494198_PDC_Current_Year_State_Submission_Routing_Review_e35b8be3.md",
  },
  {
    id: "1494222",
    title: "TDC — Persist and Govern the Orchestrator-Mapped Current-Year State Input Dataset",
    status: "Yellow/Orange",
    solid: "Strong governance intent for provenance, mapping status, versioning, and source preservation.",
    gaps: "Define dataset identity, lifecycle, status encoding, mapping-target rules, and payment normalization.",
    url: "/manus-storage/ADO_1494222_TDC_Govern_Current_Year_State_Input_Dataset_Review_4bf487fa.md",
  },
  {
    id: "1494339",
    title: "Gateway — Provide the Current-Year State Input Dataset to Roger",
    status: "Yellow",
    solid: "The read contract, Not Ready concept, and raw-source exclusion are clear at a high level.",
    gaps: "Define endpoint, identifiers, DTO, authorization, response behavior, and Gateway non-calculation boundary.",
    url: "/manus-storage/ADO_1494339_Gateway_Current_Year_State_Input_Dataset_to_Roger_Review_d839808c.md",
  },
  {
    id: "1494344",
    title: "Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions",
    status: "Orange",
    solid: "Broad practitioner-action coverage with strong audit / lineage intent and source-record preservation.",
    gaps: "Define the action model, request and persistence contracts, versioning, authorization, retry, and retrieval behavior.",
    url: "/manus-storage/ADO_1494344_Gateway_TDC_State_Practitioner_Actions_Review_c1c9320d.md",
  },
];

function StatusChip({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, { background: string; border: string; color: string }> = {
    Known: { background: C.greenSurface, border: "#86efac", color: C.green },
    TBD: { background: C.blueSurface, border: "#bae6fd", color: C.blue },
    Missing: { background: C.redSurface, border: "#fecdd3", color: C.red },
    "Needs Gary Review": { background: C.amberSurface, border: "#fde68a", color: C.amber },
    Pending: { background: "#f8fafc", border: "#cbd5e1", color: C.slate },
  };
  const style = styles[status];
  return <span style={{ background: style.background, border: `1px solid ${style.border}`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "3px 7px", whiteSpace: "nowrap" }}>{status}</span>;
}

function FirstPassChip({ status }: { status: CurrentYearStateReview["status"] }) {
  const styles: Record<CurrentYearStateReview["status"], { background: string; border: string; color: string }> = {
    Yellow: { background: C.amberSurface, border: "#fde68a", color: C.amber },
    "Yellow/Orange": { background: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    Orange: { background: C.redSurface, border: "#fecdd3", color: C.red },
  };
  const style = styles[status];
  return <span style={{ background: style.background, border: `1px solid ${style.border}`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "3px 7px", whiteSpace: "nowrap" }}>{status}</span>;
}

function FileSelection({ title, description, accept, onChange, files }: { title: string; description: string; accept?: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; files: string[] }) {
  return (
    <label style={{ background: "#ffffff", border: `1px dashed ${C.purple}`, borderRadius: "9px", cursor: "pointer", display: "block", padding: "13px" }}>
      <div style={{ alignItems: "flex-start", display: "flex", gap: "10px" }}>
        <div style={{ alignItems: "center", background: C.purpleSurface, borderRadius: "7px", color: C.purpleInk, display: "flex", fontSize: "16px", fontWeight: 900, height: "30px", justifyContent: "center", width: "30px" }}>+</div>
        <div>
          <div style={{ color: C.navy, fontSize: "11px", fontWeight: 900 }}>{title}</div>
          <div style={{ color: C.muted, fontSize: "10px", lineHeight: 1.4, marginTop: "3px" }}>{description}</div>
          <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 850, marginTop: "7px" }}>Select files for review context</div>
        </div>
      </div>
      <input accept={accept} multiple onChange={onChange} style={{ display: "none" }} type="file" />
      {files.length > 0 && <div style={{ color: C.teal, fontSize: "10px", fontWeight: 750, marginTop: "9px" }}>Selected: {files.join(", ")}</div>}
      {files.length === 0 && <div style={{ color: C.muted, fontSize: "9px", fontStyle: "italic", marginTop: "9px" }}>Selection is session-only; source files are not retained by this dashboard.</div>}
    </label>
  );
}

function downloadMarkdownReview() {
  const markdown = `# Story Review\n\n## Story Information\nADO ID: ${STORY_ID}\nTitle: ${STORY_TITLE}\nWork Item Type: Technical Story (first-pass classification; confirm with Gary)\nOwning Team: State / Provision team\nReview Date: [Complete during review]\n\n## Executive Summary\nNo ADO story description, acceptance criteria, or supporting evidence were supplied with this example. This review file is a first-pass template and must not be treated as final technical approval.\n\n## Business Outcome\nTBD — distinguish mapping, correction, review, and persistence behavior.\n\n## System Ownership\nCandidate ownership is listed in the operating-model review. Confirm all boundaries with story evidence and Gary.\n\n## Gateway Impact\nNeeds Gateway endpoint, method, contract, validation, identifiers, response, error, idempotency, correlation, and authorization evidence.\n\n## TDC Impact\nNeeds persistence model, scope, version / audit behavior, lineage, retrieval, and correlation evidence.\n\n## Data Contract\nCandidate fields are TBD until the story or approved artifacts define them.\n\n## Required Identifiers\nTechnical requirement required — do not infer ClientId, EntityId, TaxYear, DeliverableId, State, FilingId, MappingId, or CorrelationId.\n\n## Persistence Requirements\nNeeds technical review.\n\n## Governance / Audit Requirements\nNeeds explicit current / historical, actor, timestamp, reason, source, version, lineage, and approval behavior.\n\n## Acceptance Criteria Review\nExisting AC: [Not supplied]\nGap / Recommended Clarification: [Complete during review]\n\n## Dependencies\nState / Provision, Roger, Gateway, TDC, Taxonomy / master data, and shared API or persistence patterns require evidence-based review.\n\n## Open Questions\n[Complete during review]\n\n## Potential Gaps\n[Complete during review]\n\n## Story Split Assessment\nNeeds Technical Review — Gary makes the final split decision.\n\n## Ask Buddy Recommendation\nYELLOW — Minor clarification needed before Gary review.\n\n## Items Requiring Gary Review\nGateway implementation, TDC persistence, service patterns, API / contract compatibility, database behavior, architecture constraints, and repository context.\n\n## Review Status\nYELLOW — Minor clarification needed\n`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ADO_1494344_Gateway_TDC_State_Practitioner_Actions_Review.md";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function openGaryEmailDraft(recipient: string) {
  const subject = "Current-Year State Story First-Pass Review Package";
  const body = [
    "Gary,",
    "",
    "Attached is the current-year State first-pass review package for your technical review.",
    "",
    "The package contains five evidence-bound story reviews and a consolidated report. The priority review items are 1494344 (Orange) and 1494222 (Yellow/Orange).",
    "",
    "Please confirm the technical decisions, contract patterns, persistence and lifecycle approach, and any required story split recommendations.",
    "",
    "Thank you,",
    "Jenniver",
  ].join("\n");
  window.location.href = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function StateProvisionStoryReview() {
  const [storyFiles, setStoryFiles] = useState<string[]>([]);
  const [standardFiles, setStandardFiles] = useState<string[]>([]);
  const [garyEmail, setGaryEmail] = useState("");
  const collectFiles = (setter: (files: string[]) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(Array.from(event.target.files ?? []).map((file) => file.name));

  return (
    <section aria-labelledby="state-provision-story-review-title" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: `4px solid ${C.purple}`, marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: C.purple, fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>PI4 operating model · story readiness</div>
        <h2 id="state-provision-story-review-title" style={{ color: C.navy, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>State &amp; Provision Story Review — Ask Buddy First Pass + Gary Technical Review</h2>
        <p style={{ color: C.muted, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "1000px" }}>A repeatable pre-review process for stories requiring TDC, Gateway, or shared data-layer work. Ask Buddy / Manus structures the first pass; Gary remains accountable for final technical validation.</p>
      </div>

      <div style={{ background: C.amberSurface, border: "1px solid #fde68a", borderRadius: "9px", color: "#713f12", display: "grid", gap: "8px", gridTemplateColumns: "auto 1fr", marginBottom: "14px", padding: "12px 14px" }}>
        <div style={{ alignItems: "center", background: "#fef3c7", borderRadius: "999px", display: "flex", fontSize: "12px", fontWeight: 900, height: "24px", justifyContent: "center", width: "24px" }}>!</div>
        <div><strong style={{ fontSize: "11px" }}>Control point:</strong> <span style={{ fontSize: "11px", lineHeight: 1.45 }}>Ask Buddy / Manus does not replace Gary’s final technical review. Repository, implementation, API, persistence, architectural, and Claude Code context may not be represented in the submitted story.</span></div>
      </div>

      <div style={{ background: C.purpleSurface, border: `1px solid #e9d5ff`, borderRadius: "10px", marginTop: "14px", padding: "14px" }}>
        <div style={{ alignItems: "flex-start", display: "grid", gap: "12px", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Worked example</div>
            <div style={{ color: C.navy, fontSize: "15px", fontWeight: 900, lineHeight: 1.3, marginTop: "5px" }}>Tech Story {STORY_ID} — {STORY_TITLE}</div>
            <a href={ADO_LINK} target="_blank" rel="noopener noreferrer" style={{ color: C.purpleInk, display: "inline-block", fontSize: "11px", fontWeight: 850, marginTop: "7px", textDecoration: "none" }}>Open ADO work item {STORY_ID} ↗</a>
            <p style={{ color: C.muted, fontSize: "11px", lineHeight: 1.5, margin: "9px 0 0" }}>The example demonstrates the review method only. The dashboard does not manufacture story requirements when description, acceptance criteria, attachments, or approved technical evidence have not been supplied.</p>
          </div>
          <div style={{ background: "#ffffff", border: `1px solid #ddd6fe`, borderRadius: "8px", padding: "11px" }}>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>Example review status</div>
            <div style={{ marginTop: "8px" }}><StatusChip status="Pending" /></div>
            <div style={{ color: C.muted, fontSize: "10px", lineHeight: 1.45, marginTop: "8px" }}>Awaiting source story content and Ask Buddy first-pass analysis. Final outcome must be validated by Gary.</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", marginTop: "14px", overflow: "hidden" }}>
        <div style={{ alignItems: "flex-start", background: "#f8fafc", borderBottom: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "14px" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Current-year State review package</div>
            <div style={{ color: C.navy, fontSize: "15px", fontWeight: 900, marginTop: "4px" }}>First-pass findings for Gary</div>
            <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "760px" }}>Five story-level reviews are grounded in the supplied findings. They identify strengths and evidence gaps without inventing unprovided acceptance criteria, endpoints, data models, or implementation details.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            <a download href={CURRENT_YEAR_STATE_REVIEW_PACKAGE_URL} style={{ background: C.purple, borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 900, padding: "9px 11px", textDecoration: "none", whiteSpace: "nowrap" }}>Download all reviews (.zip)</a>
            <a download href={CURRENT_YEAR_STATE_REVIEW_REPORT_URL} style={{ background: "#ffffff", border: `1px solid ${C.purple}`, borderRadius: "6px", color: C.purpleInk, fontSize: "10px", fontWeight: 900, padding: "8px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>Download report (.md)</a>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "1080px", width: "100%" }}>
            <thead>
              <tr style={{ background: C.navy, color: "#ffffff" }}>
                {[
                  "Story",
                  "First-pass status",
                  "What looks solid",
                  "Main gaps / questions to resolve",
                  "Review file",
                ].map((header) => <th key={header} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "10px", textAlign: "left", textTransform: "uppercase" }}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {CURRENT_YEAR_STATE_REVIEWS.map((review, index) => (
                <tr key={review.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}`, verticalAlign: "top" }}>
                  <td style={{ color: C.navy, fontSize: "10px", fontWeight: 850, lineHeight: 1.4, padding: "10px", width: "24%" }}><strong style={{ color: C.purpleInk }}>{review.id}</strong> — {review.title}</td>
                  <td style={{ padding: "10px" }}><FirstPassChip status={review.status} /></td>
                  <td style={{ color: C.slate, fontSize: "10px", lineHeight: 1.45, padding: "10px", width: "22%" }}>{review.solid}</td>
                  <td style={{ color: C.amber, fontSize: "10px", lineHeight: 1.45, padding: "10px", width: "30%" }}>{review.gaps}</td>
                  <td style={{ padding: "10px", whiteSpace: "nowrap" }}><a download href={review.url} style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, textDecoration: "none" }}>Download review ↓</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ alignItems: "end", background: "#f8fafc", borderTop: `1px solid ${C.border}`, display: "grid", gap: "10px", gridTemplateColumns: "minmax(230px, 1fr) minmax(190px, 0.7fr) auto", padding: "12px 14px" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Email package to Gary</div>
            <div style={{ color: C.muted, fontSize: "10px", lineHeight: 1.45, marginTop: "3px" }}>Download the ZIP first. The email action opens a prefilled draft; attach the downloaded package before sending.</div>
          </div>
          <label style={{ color: C.navy, display: "grid", fontSize: "9px", fontWeight: 850, gap: "5px" }}>
            Gary’s email address
            <input aria-label="Gary’s email address" onChange={(event) => setGaryEmail(event.target.value)} placeholder="gary@example.com" style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "6px", color: C.navy, fontSize: "11px", outline: "none", padding: "8px 9px" }} type="email" value={garyEmail} />
          </label>
          <button disabled={!garyEmail.trim()} onClick={() => openGaryEmailDraft(garyEmail)} style={{ background: C.navy, border: "none", borderRadius: "6px", color: "#ffffff", cursor: garyEmail.trim() ? "pointer" : "not-allowed", fontSize: "10px", fontWeight: 900, opacity: garyEmail.trim() ? 1 : 0.45, padding: "9px 11px", whiteSpace: "nowrap" }} type="button">Open email draft</button>
        </div>
        <div style={{ background: C.amberSurface, borderTop: "1px solid #fde68a", color: "#713f12", fontSize: "10px", lineHeight: 1.5, padding: "10px 14px" }}><strong>Technical control:</strong> Gary’s final review remains required for implementation, API, persistence, architectural, and repository-pattern decisions. The individual review files preserve the detailed unresolved questions and split assessment.</div>
      </div>

      <StoryReviewAskBuddy />

      <div style={{ marginTop: "20px" }}>
        <div style={{ borderLeft: `3px solid ${C.blue}`, marginBottom: "11px", paddingLeft: "10px" }}>
          <div style={{ color: C.blue, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Ask Buddy First-Pass Review Checklist</div>
          <p style={{ color: C.muted, fontSize: "11px", lineHeight: 1.45, margin: "4px 0 0" }}>Every uploaded State or Provision story is evaluated against the same eleven categories before it reaches Gary.</p>
        </div>
        <div style={{ display: "grid", gap: "9px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {CHECKLIST.map((item) => (
            <details key={item.number} style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "0 11px" }}>
              <summary style={{ alignItems: "center", cursor: "pointer", display: "flex", gap: "9px", listStyle: "none", minHeight: "52px" }}>
                <span style={{ alignItems: "center", background: C.blueSurface, borderRadius: "6px", color: C.blue, display: "inline-flex", fontSize: "9px", fontWeight: 900, height: "24px", justifyContent: "center", width: "28px" }}>{item.number}</span>
                <span style={{ color: C.navy, flex: 1, fontSize: "11px", fontWeight: 900 }}>{item.title}</span>
                <StatusChip status={item.status} />
              </summary>
              <div style={{ borderTop: `1px solid ${C.border}`, color: C.slate, fontSize: "10px", lineHeight: 1.5, padding: "10px 1px 12px" }}>
                <div><strong>Review:</strong> {item.prompt}</div>
                <div style={{ background: "#f8fafc", borderRadius: "6px", color: C.muted, marginTop: "8px", padding: "8px" }}><strong style={{ color: C.blue }}>1494344 example:</strong> {item.example}</div>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", marginTop: "20px" }}>
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
          <div style={{ color: C.teal, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Example ownership table</div>
          <div style={{ color: C.navy, fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>Candidate boundaries for {STORY_ID}</div>
          <div style={{ overflowX: "auto", marginTop: "10px" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "480px", width: "100%" }}>
              <thead><tr style={{ background: C.navy, color: "#ffffff" }}><th style={{ fontSize: "9px", padding: "8px", textAlign: "left" }}>Requirement / Capability</th><th style={{ fontSize: "9px", padding: "8px", textAlign: "left" }}>Expected Owner</th></tr></thead>
              <tbody>{OWNERSHIP_ROWS.map(([capability, owner], index) => <tr key={capability} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}` }}><td style={{ color: C.slate, fontSize: "10px", padding: "8px" }}>{capability}</td><td style={{ color: C.teal, fontSize: "10px", fontWeight: 800, padding: "8px" }}>{owner}</td></tr>)}</tbody>
            </table>
          </div>
          <p style={{ color: C.muted, fontSize: "9px", fontStyle: "italic", lineHeight: 1.45, margin: "9px 0 0" }}>Candidate boundaries guide the first pass; flag any unassigned or conflicting responsibility for Gary and the owning team.</p>
        </div>

        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
          <div style={{ color: C.amber, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Data-contract review</div>
          <div style={{ color: C.navy, fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>Candidate fields — evidence required</div>
          <div style={{ overflowX: "auto", marginTop: "10px" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "510px", width: "100%" }}>
              <thead><tr style={{ background: C.navy, color: "#ffffff" }}>{["Field", "Business Meaning", "Source", "Target", "Current Status", "Open Question"].map((header) => <th key={header} style={{ fontSize: "9px", padding: "8px", textAlign: "left" }}>{header}</th>)}</tr></thead>
              <tbody>{CONTRACT_FIELDS.map((field, index) => <tr key={field} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}` }}><td style={{ color: C.slate, fontFamily: "monospace", fontSize: "9px", padding: "7px" }}>{field}</td><td style={{ color: C.muted, fontSize: "9px", padding: "7px" }}>TBD from ADO story / approved evidence</td><td style={{ color: C.muted, fontSize: "9px", padding: "7px" }}>TBD</td><td style={{ color: C.muted, fontSize: "9px", padding: "7px" }}>TBD</td><td style={{ padding: "7px" }}><StatusChip status="TBD" /></td><td style={{ color: C.amber, fontSize: "9px", padding: "7px" }}>Technical requirement required</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", marginTop: "14px", padding: "14px" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Markdown review file</div>
            <div style={{ color: C.navy, fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>Repeatable review output</div>
            <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.45, margin: "5px 0 0" }}>Naming convention: <strong>ADO_&lt;StoryID&gt;_&lt;ShortTitle&gt;_Review.md</strong>. The starter file preserves Unknown / TBD items rather than inventing requirements.</p>
          </div>
          <button onClick={downloadMarkdownReview} style={{ background: C.purple, border: "none", borderRadius: "6px", color: "#ffffff", cursor: "pointer", fontSize: "10px", fontWeight: 900, padding: "9px 11px" }}>Download example Markdown review</button>
        </div>
        <div style={{ display: "grid", gap: "6px", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", marginTop: "10px" }}>
          {REVIEW_FILE_SECTIONS.map((section, index) => <div key={section} style={{ background: index > 14 ? C.amberSurface : "#f8fafc", border: `1px solid ${index > 14 ? "#fde68a" : C.border}`, borderRadius: "5px", color: index > 14 ? "#713f12" : C.slate, fontSize: "9px", fontWeight: 750, padding: "6px 8px" }}>## {section}</div>)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "10px" }}>
          <StatusChip status="Known" /><span style={{ color: C.muted, fontSize: "9px" }}>evidence explicitly supplied</span>
          <StatusChip status="TBD" /><span style={{ color: C.muted, fontSize: "9px" }}>source evidence required</span>
          <StatusChip status="Missing" /><span style={{ color: C.muted, fontSize: "9px" }}>clarification required</span>
          <StatusChip status="Needs Gary Review" /><span style={{ color: C.muted, fontSize: "9px" }}>final technical judgment</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", marginTop: "14px" }}>
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
          <div style={{ color: C.green, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Gary’s TDC / Gateway Development Standard</div>
          <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.5, margin: "6px 0 10px" }}>When available, Gary’s development-process standard is compared to every story to identify compliant, missing, conflicting, architectural, reusable-pattern, new-capability, and code-context items.</p>
          <FileSelection title="Attach Gary’s development standards" description="Standards, API guidance, persistence patterns, ADRs, or repository conventions for the final review." accept=".md,.pdf,.doc,.docx,.txt" files={standardFiles} onChange={collectFiles(setStandardFiles)} />
        </div>
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
          <div style={{ color: C.blue, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Story evidence intake</div>
          <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.5, margin: "6px 0 10px" }}>Provide the ADO story, description, acceptance criteria, requirements, attachments, prototype or BRD references, dependencies, screenshots, and approved API / data-contract material.</p>
          <FileSelection title="Select story evidence" description="Use the files to prepare a first-pass review; include only evidence suitable for the review context." accept=".md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.xlsx" files={storyFiles} onChange={collectFiles(setStoryFiles)} />
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div style={{ borderLeft: `3px solid ${C.teal}`, marginBottom: "11px", paddingLeft: "10px" }}>
          <div style={{ color: C.teal, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Jenniver review dashboard</div>
          <p style={{ color: C.muted, fontSize: "11px", lineHeight: 1.45, margin: "4px 0 0" }}>Lightweight tracking for the first-pass handoff and Gary’s final review.</p>
        </div>
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "1050px", width: "100%" }}>
            <thead><tr style={{ background: C.navy, color: "#ffffff" }}>{["ADO ID", "Story Title", "Team", "Ask Buddy Review", "Requirements Status", "Gateway Impact", "TDC Impact", "Gary Review", "Returned to Team?", "Final Status"].map((header) => <th key={header} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "10px", textAlign: "left", textTransform: "uppercase" }}>{header}</th>)}</tr></thead>
            <tbody><tr style={{ background: "#f8fafc", borderTop: `1px solid ${C.border}` }}>
              <td style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, padding: "10px" }}>{STORY_ID}</td>
              <td style={{ color: C.slate, fontSize: "10px", fontWeight: 800, lineHeight: 1.4, padding: "10px", width: "27%" }}>{STORY_TITLE}</td>
              <td style={{ color: C.slate, fontSize: "10px", padding: "10px" }}>State</td>
              <td style={{ padding: "10px" }}><StatusChip status="Pending" /></td>
              <td style={{ color: C.amber, fontSize: "10px", fontWeight: 800, padding: "10px" }}>Pending Review</td>
              <td style={{ color: C.green, fontSize: "10px", fontWeight: 900, padding: "10px" }}>Yes</td>
              <td style={{ color: C.green, fontSize: "10px", fontWeight: 900, padding: "10px" }}>Yes</td>
              <td style={{ padding: "10px" }}><StatusChip status="Pending" /></td>
              <td style={{ color: C.slate, fontSize: "10px", padding: "10px" }}>No</td>
              <td style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, padding: "10px" }}>Awaiting First Pass</td>
            </tr></tbody>
          </table>
        </div>
      </div>

      <div style={{ background: C.tealSurface, border: "1px solid #99f6e4", borderRadius: "10px", color: "#134e4a", marginTop: "14px", padding: "13px 14px" }}>
        <div style={{ color: C.teal, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Process principle</div>
        <p style={{ fontSize: "11px", lineHeight: 1.5, margin: "6px 0 0" }}>The goal is not to move ownership of State or Provision development to DCT. The purpose is to ensure that stories requiring TDC, Gateway, or governed data-layer changes are sufficiently defined before they reach Gary and the data development team.</p>
        <p style={{ fontSize: "11px", lineHeight: 1.5, margin: "5px 0 0" }}>State and Provision remain responsible for business capability and application-layer work. TDC / Gateway teams own only the technical work that falls within their system boundaries.</p>
      </div>
    </section>
  );
}

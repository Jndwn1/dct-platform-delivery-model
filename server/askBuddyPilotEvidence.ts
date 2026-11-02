import { COMPARISON_ROWS, PILOT_FLOW_PAGE, PILOT_PROCESS_FLOW, PILOT_TARGET_ARCHITECTURE, PROVISION_ARCHITECTURE_STEPS, STATE_ARCHITECTURE_STEPS } from "../client/src/lib/pilotFlowEvidence";
import type { BuddyGrounding } from "./askBuddyGrounding";
import type { BuddyRequestMessage } from "../client/src/lib/askBuddyRequestContext";

const FLOW_TOPIC = /\b(process\s*flow|architecture|end[-\s]to[-\s]end|data\s*flow|flows?|paths?|handoffs?|downstream|upstream|calculation|calculations|bloomberg|btp|roll[-\s]?up|return[-\s]to[-\s]provision|owns?|responsibilit\w*)\b/i;
const PILOT_REFERENCE = /\b(?:post[-\s]?pilot|pilot|pi\s?4)\b|\/post-pilot(?:[\s/#?]|$)/i;
export function isPilotFlowQuestion(question: string, currentPagePath?: string): boolean {
  const topic = FLOW_TOPIC.test(question);
  const specificJourney = /client\s+file\s+to\s+roger|state\s*(?:and|&|\/)\s*provision/i.test(question);
  return topic && (PILOT_REFERENCE.test(question) || currentPagePath?.split(/[?#]/)[0] === PILOT_FLOW_PAGE || specificJourney);
}
export function explicitlyTargetsPilotFlow(question: string): boolean {
  return isPilotFlowQuestion(question) && PILOT_REFERENCE.test(question);
}
export function resolvePilotFlowScope(question: string, messages: BuddyRequestMessage[], currentPagePath?: string): string | null {
  if (isPilotFlowQuestion(question, currentPagePath)) return question;
  // Carry only an immediately relevant Pilot-flow user scope, never a prior AI claim.
  const isFollowUp = /\b(that|this|those|these|what about|how about|state|provision|ims|tdc|pdc|roger|btp|gosystem)\b/i.test(question);
  if (!isFollowUp || /\b(new topic|different story|instead|batch\s+\d|mvp\s+metrics)\b/i.test(question)) return null;
  const prior = messages.slice(0, -1).filter(message => message.role === "user").at(-1);
  return prior && isPilotFlowQuestion(prior.content) && (FLOW_TOPIC.test(question) || /\b(what about|how about|that|those|these)\b/i.test(question))
    ? `${question}\nPilot flow scope from the preceding user question: ${prior.content}`
    : null;
}

export function buildPilotFlowEvidence(question: string): string {
  const processRequested = /process\s*flow|client\s*file|journey|federal|five[-\s]?phase|data\s*flow/i.test(question);
  const architectureRequested = /architecture|ims|gosystem|btp|bloomberg|roll[-\s]?up|return[-\s]to[-\s]provision|deferred|handoff|calculation/i.test(question);
  const includeProcess = processRequested || !architectureRequested;
  const stateOnly = /\b(state|ims|gosystem)\b/i.test(question) && !/\b(provision|btp|bloomberg)\b/i.test(question);
  const provisionOnly = /\b(provision|btp|bloomberg)\b/i.test(question) && !/\b(state|ims|gosystem)\b/i.test(question);
  const lines = [
    "## Pilot page — registered process-flow and architecture evidence",
    `Page: ${PILOT_FLOW_PAGE}. These records are shared with the current page renderer, not a live integration query or a claim of implementation completion.`,
    "Use this specific page evidence instead of broad MVP metrics, unrelated batches, or generic platform summaries. Answer the question directly. Do not regenerate a six-part assessment. Use the page section link only when useful; do not append source lists or provenance footers.",
  ];
  if (includeProcess) lines.push(
    `### ${PILOT_PROCESS_FLOW.title} (${PILOT_FLOW_PAGE}#${PILOT_PROCESS_FLOW.sectionId})`,
    PILOT_PROCESS_FLOW.description,
    `Five phases: ${PILOT_PROCESS_FLOW.phases.join(" → ")}.`,
    ...PILOT_PROCESS_FLOW.steps.map(step => `${step.number}. ${step.title}: ${step.detail}`),
    PILOT_PROCESS_FLOW.branchNote,
    PILOT_PROCESS_FLOW.boundary,
    `Diagram: ${PILOT_PROCESS_FLOW.image}. Text steps are an index of the registered diagram, not new technical contracts.`,
  );
  lines.push(`### ${PILOT_TARGET_ARCHITECTURE.title} (${PILOT_FLOW_PAGE}#${PILOT_TARGET_ARCHITECTURE.sectionId})`, PILOT_TARGET_ARCHITECTURE.boundary, PILOT_TARGET_ARCHITECTURE.description);
  if (!provisionOnly) lines.push(
    `#### ${PILOT_TARGET_ARCHITECTURE.state.title}`,
    ...STATE_ARCHITECTURE_STEPS.map(step => `${step.label} | ${step.title}: ${step.detail}`),
    PILOT_TARGET_ARCHITECTURE.state.supportNote, PILOT_TARGET_ARCHITECTURE.state.outcome,
  );
  if (!stateOnly) lines.push(
    `#### ${PILOT_TARGET_ARCHITECTURE.provision.title}`,
    ...PROVISION_ARCHITECTURE_STEPS.map(step => `${step.label} | ${step.title}: ${step.detail}`),
    PILOT_TARGET_ARCHITECTURE.provision.supportNote, PILOT_TARGET_ARCHITECTURE.provision.outcome,
  );
  lines.push(`### October 9, 2026 demonstration evidence (${PILOT_FLOW_PAGE}#october-9-comparison)`);
  for (const row of COMPARISON_ROWS.filter(row => ["Data Governance", "Summary Output", "Downstream Integration", "External Calculation", "End-to-End Results"].includes(row[0]))) {
    lines.push(`${row[0]}: ${stateOnly ? "" : `Provision: ${row[3]} [${row[4]}]. `}${provisionOnly ? "" : `State: ${row[1]} [${row[2]}].`}`);
  }
  lines.push("Demonstrated means shown, not approved production integration; Not Demonstrated does not mean Not Developed. Never invent endpoints, fields, work-item links, owners, validation evidence, or live status. Label implications Proposed or Potential. The generic graphic's downstream GoSystem/TIM label is not evidence of a Provision→GoSystem route or a new TIM dependency; flag unclear cross-path details for validation instead of overriding the explicit BTP separation.");
  return lines.join("\n");
}

export function buildPilotFlowGrounding(question: string): BuddyGrounding {
  const sources: BuddyGrounding["sources"] = [
    { id: "pilot-process-flow", label: PILOT_PROCESS_FLOW.title, path: `${PILOT_FLOW_PAGE}#${PILOT_PROCESS_FLOW.sectionId}`, authority: "Intended executive process; registered diagram and page captions", lastUpdated: "Not dated", artifactStatus: "Reference" },
    { id: "pilot-target-architecture", label: PILOT_TARGET_ARCHITECTURE.title, path: `${PILOT_FLOW_PAGE}#${PILOT_TARGET_ARCHITECTURE.sectionId}`, authority: "Proposed architecture, not completed implementation", lastUpdated: "Not dated", artifactStatus: "Open" },
    { id: "pilot-demo-comparison", label: "October 9 State and Provision demonstration comparison", path: `${PILOT_FLOW_PAGE}#october-9-comparison`, authority: "Demonstration evidence, not production validation", lastUpdated: "2026-10-09", artifactStatus: "Reference" },
  ];
  return { sources, conflicts: [], status: "Open", checkedAt: new Date().toISOString(), latestSource: sources[2], hasSufficientEvidence: true, evidenceBlock: buildPilotFlowEvidence(question) };
}

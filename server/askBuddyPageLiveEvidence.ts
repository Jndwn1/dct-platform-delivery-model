import { desc } from "drizzle-orm";
import { deployments, integrationQuestions, postPilotDeployments, qaDeployments, qaScreenRecords, tdcMeetingRecaps, uatDefects, uatRisks, uatTestCases } from "../drizzle/schema";
import type { getDb } from "./db";

export const LIVE_PAGE_RECORD_LIMIT = 6;
export const LIVE_PAGE_EVIDENCE_LIMIT = 8_000;
export function requestedLivePagePaths(question: string, paths: string[]): string[] {
  const selected = new Set(paths);
  const result: string[] = [];
  if (selected.has("/post-pilot/meeting-recaps") || /\b(meeting recap|standup recap|latest recap)\b/i.test(question)) result.push("/post-pilot/meeting-recaps");
  if (selected.has("/deployment-registry") || /\bdeployment registry\b/i.test(question) && !/\b(pilot|qa)\b/i.test(question)) result.push("/deployment-registry");
  if (selected.has("/qa-deployment-registry") || /\bqa (registry|releases?|deployments?)\b/i.test(question)) result.push("/qa-deployment-registry");
  if (selected.has("/post-pilot") && /\bdeployments?|registry\b/i.test(question) || /\bpilot deployments?\b/i.test(question)) result.push("/post-pilot");
  if (selected.has("/uat-testing") || /\buat (test|defect|risk|readiness)\b/i.test(question)) result.push("/uat-testing");
  if (selected.has("/integration-simulation") && /\bquestions?|open|unresolved\b/i.test(question)) result.push("/integration-simulation");
  return Array.from(new Set(result)).slice(0, 2);
}

const ALLOWED_FIELDS = new Set(["id", "deploymentId", "releaseName", "deploymentDate", "platform", "type", "status", "summary", "environment", "relatedFeature", "relatedStory", "adoWorkItemId", "meetingDate", "meetingTitle", "sprint", "keyFocus", "emailStatus", "overallStatus", "recapJson", "emailBodyText", "transcriptFileName", "notes", "testId", "epic", "feature", "story", "requirementId", "rogerScreen", "expectedResult", "actualResult", "priority", "defectId", "defectNumber", "description", "severity", "riskId", "riskNumber", "title", "impact", "mitigation", "question", "answer", "screenName", "availableInQa", "validationStatus", "whatChanged", "expectedResults", "knownIssues", "qaTestInstructions", "createdAt", "updatedAt"]);
for (const field of ["keyFocusJson", "emailSubject", "developerUpdatesJson", "actionItemsJson", "blockersRisksJson", "decisionsCalloutsJson"]) ALLOWED_FIELDS.add(field);
export function formatLivePageRows(path: string, records: Record<string, unknown>[]): string {
  if (!records.length) return `${path}: No retained records were returned from the workspace database; do not invent rows.`;
  const safeRows = records.map(record => Object.fromEntries(Object.entries(record).filter(([key]) => ALLOWED_FIELDS.has(key)).map(([key, value]) => [key, typeof value === "string" && value.length > 1_500 ? `${value.slice(0, 1_500)} [field excerpt; later text omitted]` : value])));
  return `${path}: newest ${records.length} retained workspace records (sample, not full-table metrics)\n${JSON.stringify(safeRows)}`;
}

export async function loadBuddyLivePageEvidence(question: string, paths: string[], db: Awaited<ReturnType<typeof getDb>>): Promise<string> {
  const requested = requestedLivePagePaths(question, paths);
  if (!requested.length) return "";
  if (!db) return "Current page records are unavailable because the workspace database could not be reached. Use authored page context only; do not invent current rows.";
  const readers = {
    "/post-pilot/meeting-recaps": () => db.select().from(tdcMeetingRecaps).orderBy(desc(tdcMeetingRecaps.meetingDate)).limit(LIVE_PAGE_RECORD_LIMIT),
    "/deployment-registry": () => db.select().from(deployments).orderBy(desc(deployments.deploymentDate)).limit(LIVE_PAGE_RECORD_LIMIT),
    "/post-pilot": () => db.select().from(postPilotDeployments).orderBy(desc(postPilotDeployments.deploymentDate)).limit(LIVE_PAGE_RECORD_LIMIT),
    "/qa-deployment-registry": async () => [...await db.select().from(qaDeployments).orderBy(desc(qaDeployments.deploymentDate)).limit(3), ...await db.select().from(qaScreenRecords).orderBy(desc(qaScreenRecords.createdAt)).limit(3)],
    "/uat-testing": async () => [...await db.select().from(uatTestCases).orderBy(desc(uatTestCases.createdAt)).limit(3), ...await db.select().from(uatDefects).orderBy(desc(uatDefects.createdAt)).limit(2), ...await db.select().from(uatRisks).orderBy(desc(uatRisks.createdAt)).limit(1)],
    "/integration-simulation": () => db.select().from(integrationQuestions).orderBy(desc(integrationQuestions.createdAt)).limit(LIVE_PAGE_RECORD_LIMIT),
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const content = await Promise.race([
      Promise.all(requested.map(async path => {
        try { const rows = await readers[path as keyof typeof readers](); return formatLivePageRows(path, rows); }
        catch { return `${path}: Current workspace records could not be read; authored page content does not establish the missing current values.`; }
      })),
      new Promise<string[]>(resolve => { timer = setTimeout(() => resolve(["Current page-data lookup exceeded its 1.5-second budget. Authored page context remains available; do not claim live rows were retrieved."]), 1_500); }),
    ]);
    return ["## Current retained page records — read only", "These are workspace database records checked for this request, not a live ADO query or production system evidence. Do not compute full-table totals from a bounded sample. User-confirmed delivery phases govern phase interpretation; individual recorded statuses remain as recorded.", ...content].join("\n").slice(0, LIVE_PAGE_EVIDENCE_LIMIT) + "\n[Bounded page-record evidence; only rows and fields supplied above are available.]";
  } finally { if (timer) clearTimeout(timer); }
}

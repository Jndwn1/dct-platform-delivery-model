import { invokeLLM } from "./_core/llm";

export const TDC_DEVELOPERS = ["Gary", "Reshma", "Morgan"] as const;
export type TdcDeveloper = (typeof TDC_DEVELOPERS)[number];

export type DeveloperUpdate = {
  teamMember: TdcDeveloper;
  completedProgress: string;
  currentFocus: string;
  nextStep: string;
  blockersSupportNeeded: string;
};

export type MeetingActionItem = {
  actionItem: string;
  owner: string;
  statusNextStep: string;
  dueDate: string;
};

export type MeetingRecapAnalysis = {
  meetingDate: string;
  meetingTitle: string;
  attendees: string[];
  sprint: string;
  summaryBullets: string[];
  keyFocus: string[];
  developerUpdates: DeveloperUpdate[];
  actionItems: MeetingActionItem[];
  blockersRisks: string[];
  decisionsCallouts: string[];
  notes: string;
};

const NEEDS_CONFIRMATION = "Needs confirmation";
const NOT_SPECIFIED = "Not specified";
const NONE_REPORTED = "None reported";

function textOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function actionStatusOr(value: unknown) {
  const status = textOr(value, NOT_SPECIFIED);
  return /^(pending|in progress|open|tbd)$/i.test(status) ? NOT_SPECIFIED : status;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}

function normalizeDeveloperUpdates(value: unknown): DeveloperUpdate[] {
  const supplied = Array.isArray(value) ? value : [];
  return TDC_DEVELOPERS.map((teamMember) => {
    const match = supplied.find((item) => item && typeof item === "object" && (item as { teamMember?: unknown }).teamMember === teamMember) as Record<string, unknown> | undefined;
    return {
      teamMember,
      completedProgress: textOr(match?.completedProgress, NEEDS_CONFIRMATION),
      currentFocus: textOr(match?.currentFocus, NEEDS_CONFIRMATION),
      nextStep: textOr(match?.nextStep, NOT_SPECIFIED),
      blockersSupportNeeded: textOr(match?.blockersSupportNeeded, NONE_REPORTED),
    };
  });
}

function normalizeActionItems(value: unknown): MeetingActionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      actionItem: textOr(item.actionItem, NEEDS_CONFIRMATION),
      owner: textOr(item.owner, NEEDS_CONFIRMATION),
      statusNextStep: actionStatusOr(item.statusNextStep),
      dueDate: textOr(item.dueDate, NOT_SPECIFIED),
    }));
}

function omitUnsupportedWorkItemNumbers(text: string) {
  return text
    .replace(/\b(?:story|stories|bug|bugs)(?:\s*\/\s*(?:story|stories|bug|bugs))?\s+\d{1,5}(?:\s*(?:and|&|,)\s*\d{1,5})?\b/gi, (match) => {
      const label = match.toLowerCase().includes("story") ? "referenced stories" : "referenced bugs";
      return label;
    })
    .replace(/\bQA-ready referenced (?:bugs|stories)\b/gi, "QA-ready work items")
    .replace(/\s*\(\s*\d{1,5}(?:\s*(?:and|&|,)\s*\d{1,5})?\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function omitUnsupportedNumbersFromAnalysis(analysis: MeetingRecapAnalysis): MeetingRecapAnalysis {
  const scrub = omitUnsupportedWorkItemNumbers;
  return {
    ...analysis,
    summaryBullets: analysis.summaryBullets.map(scrub),
    keyFocus: analysis.keyFocus.map(scrub),
    developerUpdates: analysis.developerUpdates.map((update) => ({
      ...update,
      completedProgress: scrub(update.completedProgress),
      currentFocus: scrub(update.currentFocus),
      nextStep: scrub(update.nextStep),
      blockersSupportNeeded: scrub(update.blockersSupportNeeded),
    })),
    actionItems: analysis.actionItems.map((item) => ({
      ...item,
      actionItem: scrub(item.actionItem).replace(/\bQA-ready referenced (?:bugs|stories)\b/gi, "QA-ready work items"),
      statusNextStep: actionStatusOr(scrub(item.statusNextStep)),
    })),
    blockersRisks: analysis.blockersRisks.map(scrub),
    decisionsCallouts: analysis.decisionsCallouts.map(scrub),
    notes: scrub(analysis.notes),
  };
}

export function normalizeMeetingRecapAnalysis(value: unknown): MeetingRecapAnalysis {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    meetingDate: textOr(source.meetingDate, NEEDS_CONFIRMATION),
    meetingTitle: textOr(source.meetingTitle, "TDC Daily Standup"),
    attendees: stringList(source.attendees),
    sprint: textOr(source.sprint, NOT_SPECIFIED),
    summaryBullets: stringList(source.summaryBullets),
    keyFocus: stringList(source.keyFocus).slice(0, 3),
    developerUpdates: normalizeDeveloperUpdates(source.developerUpdates),
    actionItems: normalizeActionItems(source.actionItems),
    blockersRisks: stringList(source.blockersRisks),
    decisionsCallouts: stringList(source.decisionsCallouts),
    notes: textOr(source.notes, NOT_SPECIFIED),
  };
}

function escapeCell(value: string) {
  return value.replace(/[|\r\n]/g, " ").replace(/\s+/g, " ").trim();
}

export function formatMeetingDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function buildTdcStandupEmail(analysis: MeetingRecapAnalysis) {
  const dateLabel = formatMeetingDate(analysis.meetingDate);
  const lines = [
    `Subject: TDC Daily Standup Recap — ${dateLabel}`,
    "",
    "Hi Team,",
    "",
    "Below is the recap from today's TDC Daily Standup.",
    "",
    "MEETING SUMMARY",
    ...analysis.summaryBullets.map((bullet) => `- ${bullet}`),
    "",
    "DEV UPDATES",
    "",
    "| Team Member | Completed / Progress | Current Focus | Next Step | Blockers / Support Needed |",
    "|---|---|---|---|---|",
    ...analysis.developerUpdates.map((update) => `| ${update.teamMember} | ${escapeCell(update.completedProgress)} | ${escapeCell(update.currentFocus)} | ${escapeCell(update.nextStep)} | ${escapeCell(update.blockersSupportNeeded)} |`),
    "",
    "ACTION ITEMS",
    "",
    "| # | Action Item | Owner | Status / Next Step | Due Date |",
    "|---:|---|---|---|---|",
  ];

  if (analysis.actionItems.length === 0) {
    lines.push("| — | No action items identified from the transcript. | — | — | — |");
  } else {
    analysis.actionItems.forEach((item, index) => lines.push(`| ${index + 1} | ${escapeCell(item.actionItem)} | ${escapeCell(item.owner)} | ${escapeCell(item.statusNextStep)} | ${escapeCell(item.dueDate)} |`));
  }

  if (analysis.blockersRisks.length > 0) {
    lines.push("", "BLOCKERS / RISKS", ...analysis.blockersRisks.map((item) => `- ${item}`));
  }

  if (analysis.decisionsCallouts.length > 0) {
    lines.push("", "DECISIONS / KEY CALL-OUTS", ...analysis.decisionsCallouts.map((item) => `- ${item}`));
  }

  lines.push("", "Thanks,", "Jenniver");
  return lines.join("\n");
}

const analysisSchema = {
  type: "object",
  properties: {
    meetingDate: { type: "string" },
    meetingTitle: { type: "string" },
    attendees: { type: "array", items: { type: "string" } },
    sprint: { type: "string" },
    summaryBullets: { type: "array", items: { type: "string" } },
    keyFocus: { type: "array", items: { type: "string" } },
    developerUpdates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          teamMember: { type: "string", enum: [...TDC_DEVELOPERS] },
          completedProgress: { type: "string" },
          currentFocus: { type: "string" },
          nextStep: { type: "string" },
          blockersSupportNeeded: { type: "string" },
        },
        required: ["teamMember", "completedProgress", "currentFocus", "nextStep", "blockersSupportNeeded"],
        additionalProperties: false,
      },
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          actionItem: { type: "string" },
          owner: { type: "string" },
          statusNextStep: { type: "string" },
          dueDate: { type: "string" },
        },
        required: ["actionItem", "owner", "statusNextStep", "dueDate"],
        additionalProperties: false,
      },
    },
    blockersRisks: { type: "array", items: { type: "string" } },
    decisionsCallouts: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
  required: ["meetingDate", "meetingTitle", "attendees", "sprint", "summaryBullets", "keyFocus", "developerUpdates", "actionItems", "blockersRisks", "decisionsCallouts", "notes"],
  additionalProperties: false,
} as const;

export async function analyzeTdcStandupTranscript(transcriptText: string) {
  const systemPrompt = `You create evidence-bound TDC Daily Standup recap records. Treat the submitted transcript as the authoritative source. Analyze the entire transcript before producing output.

Rules:
- Do not invent ADO story numbers, owners, due dates, blockers, decisions, statuses, sprint information, assignments, or dependencies.
- If a detail is unclear, write exactly "Needs confirmation". Do not infer a commitment just because it was discussed.
- If a developer did not report a blocker, write exactly "None reported" in blockersSupportNeeded. If no next step was explicitly stated, write exactly "Not specified".
- Create exactly three developer updates, one each for Gary, Reshma, and Morgan. Never combine their work.
- The meeting date must use YYYY-MM-DD only when the transcript clearly states it; otherwise use "Needs confirmation".
- Meeting title defaults to "TDC Daily Standup" unless the transcript gives a different title.
- Sprint is "Not specified" unless explicitly stated in the transcript.
- Summary bullets: 3–6 concise, executive-ready bullets focused on priority, progress, blockers/risks, decisions, capacity, and cross-team dependencies only when discussed.
- Action items must be real follow-ups or assignments from the meeting. Include explicit follow-ups Jenniver commits to perform. If no due date was stated, write exactly "Not specified"; use "Needs confirmation" only if the transcript refers to a date but the date is unclear. Do not use generic status labels such as "Pending", "In progress", or "Open" unless the transcript explicitly uses that status; otherwise write the evidenced next step or "Not specified".
- Treat explicit waiting, requested status, requested review, requested assignment, unresolved investigation, or needed clarification as a blocker/risk or dependency. Include blockersRisks only for those explicit blockers, risks, unresolved questions, or dependencies. Include decisionsCallouts only for explicit decisions, direction, ownership, or organization changes.
- If a speaker says they are waiting for a named stakeholder's update on QA-ready work, include that waiting item in blockersRisks and create the associated follow-up action item for that speaker. Do not omit it because the stakeholder is not present.
- Preserve organizational relationships precisely. If the transcript distinguishes the TDC/Gateway team from PDC, do not combine their ownership, product-owner reporting, or scope.
- Preserve team language including TDC, Gateway, Roger, State, Provision, Federal, PDC, UAT, MVP, QA, DEV, and ADO.
- Include an ADO story or bug number only when it is clearly and unambiguously stated in the transcript. If the transcription garbles, truncates, or conflicts on a number, omit the number rather than guessing or combining fragments. Do not treat a board position (for example, "9 and 10") as a bug or story identifier unless the transcript independently provides the full identifier.

Transcript:\n${transcriptText}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the strict meeting recap JSON now." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tdc_daily_standup_recap",
        strict: true,
        schema: analysisSchema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("The transcript analysis did not return a recap record.");
  return omitUnsupportedNumbersFromAnalysis(normalizeMeetingRecapAnalysis(JSON.parse(content)));
}

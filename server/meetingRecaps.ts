import { invokeLLM, LLMRequestTimeoutError } from "./_core/llm";

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
const RECAP_MODEL = "gpt-5-mini";
const RECAP_LLM_TIMEOUT_MS = 45_000;
const RECAP_LLM_MAX_ATTEMPTS = 2;
const DIRECT_TRANSCRIPT_CHAR_LIMIT = 18_000;
const TRANSCRIPT_CHUNK_CHAR_LIMIT = 12_000;

export function splitTranscriptForRecap(transcriptText: string, maxChars = TRANSCRIPT_CHUNK_CHAR_LIMIT) {
  const normalized = transcriptText.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (normalized.length <= maxChars) return [normalized];

  const chunks: string[] = [];
  let current = "";
  const blocks = normalized.split(/\n{2,}/).filter(Boolean);

  const addBlock = (block: string) => {
    const normalizedBlock = block.trim();
    if (!normalizedBlock) return;
    if (normalizedBlock.length <= maxChars) {
      if (current && current.length + normalizedBlock.length + 2 > maxChars) {
        chunks.push(current);
        current = "";
      }
      current = current ? `${current}\n\n${normalizedBlock}` : normalizedBlock;
      return;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    let remaining = normalizedBlock;
    while (remaining.length > maxChars) {
      const boundary = Math.max(
        remaining.lastIndexOf(". ", maxChars),
        remaining.lastIndexOf(" ", maxChars)
      );
      const end = boundary > Math.floor(maxChars * 0.6) ? boundary + 1 : maxChars;
      chunks.push(remaining.slice(0, end).trim());
      remaining = remaining.slice(end).trim();
    }
    current = remaining;
  };

  blocks.forEach(addBlock);
  if (current) chunks.push(current);
  return chunks;
}

export async function retryTimedOutRecapAnalysis<T>(
  run: () => Promise<T>,
  maxAttempts = RECAP_LLM_MAX_ATTEMPTS
) {
  let lastTimeout: LLMRequestTimeoutError | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      if (!(error instanceof LLMRequestTimeoutError) || attempt === maxAttempts) {
        throw error;
      }
      lastTimeout = error;
    }
  }

  throw lastTimeout ?? new Error("The transcript analysis did not return a result.");
}

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

const evidenceSchema = {
  type: "object",
  properties: {
    evidence: { type: "array", items: { type: "string" } },
  },
  required: ["evidence"],
  additionalProperties: false,
} as const;

const recapRules = `
Rules:
- Use only the supplied source. Do not invent ADO numbers, owners, due dates, blockers, decisions, statuses, sprint details, assignments, or dependencies.
- For unclear details, use exactly "Needs confirmation". For unreported next steps use "Not specified"; for unreported developer blockers use "None reported".
- Create exactly three separate developer updates: Gary, Reshma, and Morgan.
- Use YYYY-MM-DD for the meeting date only when clearly stated; otherwise use "Needs confirmation". Default the title to "TDC Daily Standup" and sprint to "Not specified" when unstated.
- Summary bullets: 3–6 concise, executive-ready points focused only on discussed priority, progress, risk, decision, capacity, or dependency.
- Include action items only for explicit follow-ups or assignments, including an explicit Jenniver commitment. Treat explicit waiting, requested review, unresolved investigation, or needed clarification as a blocker/risk.
- Preserve TDC/Gateway versus PDC relationships precisely and retain the terms TDC, Gateway, Roger, State, Provision, Federal, PDC, UAT, MVP, QA, DEV, and ADO when used in the source.
- Include ADO numbers only when clearly and unambiguously stated. Omit garbled, truncated, or conflicting numbers.
`;

async function invokeRecapModel(messages: { role: "system" | "user"; content: string }[], schema: typeof analysisSchema | typeof evidenceSchema, maxTokens: number) {
  return retryTimedOutRecapAnalysis(() => invokeLLM({
    model: RECAP_MODEL,
    messages,
    maxTokens,
    reasoning: { effort: "minimal" },
    timeoutMs: RECAP_LLM_TIMEOUT_MS,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schema === analysisSchema ? "tdc_daily_standup_recap" : "tdc_transcript_evidence",
        strict: true,
        schema,
      },
    },
  }));
}

async function extractTranscriptEvidence(chunk: string, index: number, total: number) {
  const response = await invokeRecapModel([
    {
      role: "system",
      content: "Extract factual meeting evidence only. Preserve names, assignments, stated risks, decisions, dates, and explicit next steps. Do not summarize by inference or create commitments.",
    },
    {
      role: "user",
      content: `Transcript part ${index + 1} of ${total}:\n${chunk}`,
    },
  ], evidenceSchema, 1_600);
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("A transcript evidence extraction did not return content.");
  return stringList(JSON.parse(content).evidence).slice(0, 12);
}

async function mapWithConcurrency<T, R>(items: T[], worker: (item: T, index: number) => Promise<R>, concurrency = 3) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

export async function analyzeTdcStandupTranscript(transcriptText: string) {
  let response;
  try {
    const normalizedTranscript = transcriptText.trim();
    const chunks = normalizedTranscript.length > DIRECT_TRANSCRIPT_CHAR_LIMIT
      ? splitTranscriptForRecap(normalizedTranscript)
      : [normalizedTranscript];
    const source = chunks.length === 1
      ? `Transcript:\n${chunks[0]}`
      : `Evidence extracted in parallel from ${chunks.length} transcript parts:\n${(await mapWithConcurrency(chunks, (chunk, index) => extractTranscriptEvidence(chunk, index, chunks.length))).flat().map((item) => `- ${item}`).join("\n")}`;

    response = await invokeRecapModel([
      { role: "system", content: `You create evidence-bound TDC Daily Standup recap records. ${recapRules}` },
      { role: "user", content: `${source}\n\nGenerate the strict meeting recap JSON now.` },
    ], analysisSchema, 3_600);
  } catch (error) {
    if (error instanceof LLMRequestTimeoutError) {
      throw new Error("Transcript analysis did not complete after two bounded attempts. Please retry; no recap was created.");
    }
    throw error;
  }

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("The transcript analysis did not return a recap record.");
  return omitUnsupportedNumbersFromAnalysis(normalizeMeetingRecapAnalysis(JSON.parse(content)));
}

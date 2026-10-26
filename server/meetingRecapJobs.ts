import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import mammoth from "mammoth";
import {
  tdcMeetingRecapJobs,
  tdcMeetingRecaps,
  type TdcMeetingRecapJob,
} from "../drizzle/schema";
import { getDb } from "./db";
import {
  analyzeTdcStandupTranscript,
  buildTdcStandupEmail,
  formatMeetingDate,
} from "./meetingRecaps";
import { storagePut } from "./storage";

export const MAX_RECAP_UPLOAD_BYTES = 10 * 1024 * 1024;
export const RECAP_UPLOAD_PART_BYTES = 384 * 1024;
export const MAX_RECAP_UPLOAD_PARTS = Math.ceil(
  MAX_RECAP_UPLOAD_BYTES / RECAP_UPLOAD_PART_BYTES
);

export type RecapJobStatus =
  | "Uploading"
  | "Queued"
  | "Running"
  | "Complete"
  | "Failed";

type UploadedRecapPart = {
  partNumber: number;
  storageUrl: string;
  byteLength: number;
};

type SafeRecapJob = {
  id: string;
  status: RecapJobStatus;
  stage: string;
  recapId: number | null;
  failureMessage: string | null;
  attemptCount: number;
};

function getJobParts(job: Pick<TdcMeetingRecapJob, "uploadedPartsJson">): UploadedRecapPart[] {
  try {
    const parsed = JSON.parse(job.uploadedPartsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (part): part is UploadedRecapPart =>
          part &&
          typeof part === "object" &&
          Number.isInteger(part.partNumber) &&
          typeof part.storageUrl === "string" &&
          typeof part.byteLength === "number"
      )
      .sort((left, right) => left.partNumber - right.partNumber);
  } catch {
    return [];
  }
}

function toSafeJob(job: TdcMeetingRecapJob): SafeRecapJob {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    recapId: job.recapId ?? null,
    failureMessage: job.failureMessage ?? null,
    attemptCount: job.attemptCount,
  };
}

function requireSupportedTranscript(fileName: string, mimeType: string, fileSizeBytes: number) {
  if (!/\.(docx|txt)$/i.test(fileName)) {
    throw new Error("Upload a TDC Daily Standup transcript in DOCX or TXT format.");
  }
  if (fileSizeBytes < 1 || fileSizeBytes > MAX_RECAP_UPLOAD_BYTES) {
    throw new Error("Transcripts must be 10 MB or smaller.");
  }
  if (mimeType.length > 128) {
    throw new Error("The transcript file type could not be validated.");
  }
}

function getAffectedRows(result: unknown) {
  const header = Array.isArray(result) ? result[0] : result;
  if (!header || typeof header !== "object") return 0;
  const affectedRows = (header as { affectedRows?: unknown }).affectedRows;
  return typeof affectedRows === "number" ? affectedRows : 0;
}

function userSafeFailure(error: unknown) {
  const message = error instanceof Error ? error.message.trim() : "";
  if (/transcript analysis did not complete/i.test(message)) {
    return "The recap analysis did not complete within its safe processing window. The uploaded transcript is retained; select Retry generation to try again.";
  }
  if (/not contain enough readable text|more than 48,000 readable characters|DOCX or TXT format|10 MB or smaller/i.test(message)) {
    return message;
  }
  return "The recap could not be generated. The uploaded transcript is retained; select Retry generation to try again.";
}

async function updateJob(
  id: string,
  values: Partial<Pick<TdcMeetingRecapJob, "status" | "stage" | "recapId" | "failureMessage" | "attemptCount">>
) {
  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  await db.update(tdcMeetingRecapJobs).set(values).where(eq(tdcMeetingRecapJobs.id, id));
}

async function readTranscriptBuffer(job: TdcMeetingRecapJob) {
  const parts = getJobParts(job);
  if (parts.length !== job.totalParts || parts.some((part, index) => part.partNumber !== index)) {
    throw new Error("The transcript upload is incomplete. Re-select the file and upload it again.");
  }

  const buffers = await Promise.all(
    parts.map(async (part) => {
      const response = await fetch(part.storageUrl);
      if (!response.ok) throw new Error("The retained transcript upload could not be read.");
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length !== part.byteLength) throw new Error("The retained transcript upload could not be verified.");
      return buffer;
    })
  );

  const transcript = Buffer.concat(buffers);
  if (transcript.length !== job.fileSizeBytes || transcript.length > MAX_RECAP_UPLOAD_BYTES) {
    throw new Error("The retained transcript upload could not be verified.");
  }
  return transcript;
}

async function extractTranscriptText(buffer: Buffer, fileName: string) {
  if (/\.docx$/i.test(fileName)) {
    const extracted = await mammoth.extractRawText({ buffer });
    return extracted.value.trim();
  }
  return buffer.toString("utf8").trim();
}

/**
 * Claims and processes a queued recap job. Work runs outside the request that
 * created the job, while its state remains durable and recoverable on refresh.
 */
export async function runMeetingRecapJob(jobId: string) {
  const db = await getDb();
  if (!db) return;

  const [queuedJob] = await db
    .select({ attemptCount: tdcMeetingRecapJobs.attemptCount })
    .from(tdcMeetingRecapJobs)
    .where(and(eq(tdcMeetingRecapJobs.id, jobId), eq(tdcMeetingRecapJobs.status, "Queued")))
    .limit(1);
  if (!queuedJob) return;

  const claim = await db
    .update(tdcMeetingRecapJobs)
    .set({
      status: "Running",
      stage: "Reading uploaded transcript",
      failureMessage: null,
      attemptCount: queuedJob.attemptCount + 1,
    })
    .where(and(eq(tdcMeetingRecapJobs.id, jobId), eq(tdcMeetingRecapJobs.status, "Queued")));

  if (getAffectedRows(claim) === 0) return;

  try {
    const [job] = await db.select().from(tdcMeetingRecapJobs).where(eq(tdcMeetingRecapJobs.id, jobId)).limit(1);
    if (!job) return;

    const buffer = await readTranscriptBuffer(job);
    await updateJob(jobId, { status: "Running", stage: "Extracting readable transcript text" });
    const transcriptText = await extractTranscriptText(buffer, job.transcriptFileName);
    if (transcriptText.length < 80) {
      throw new Error("The uploaded transcript does not contain enough readable text to generate a recap.");
    }

    const safeName = job.transcriptFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    await updateJob(jobId, { status: "Running", stage: "Retaining source transcript" });
    const storedTranscript = await storagePut(
      `tdc-meeting-recaps/${Date.now()}-${safeName}`,
      buffer,
      job.mimeType
    );

    await updateJob(jobId, { status: "Running", stage: "Generating evidence-bound recap" });
    const analysis = await analyzeTdcStandupTranscript(transcriptText);
    const dateLabel = formatMeetingDate(analysis.meetingDate);
    const emailSubject = `TDC Daily Standup Recap — ${dateLabel}`;
    const emailBody = buildTdcStandupEmail(analysis);

    await updateJob(jobId, { status: "Running", stage: "Saving recap draft" });
    await db.insert(tdcMeetingRecaps).values({
      meetingDate: analysis.meetingDate,
      meetingTitle: analysis.meetingTitle,
      sprint: analysis.sprint,
      attendeesJson: JSON.stringify(analysis.attendees),
      keyFocusJson: JSON.stringify(analysis.keyFocus),
      transcriptFileName: job.transcriptFileName,
      transcriptStorageUrl: storedTranscript.url,
      transcriptText,
      emailSubject,
      emailBody,
      developerUpdatesJson: JSON.stringify(analysis.developerUpdates),
      actionItemsJson: JSON.stringify(analysis.actionItems),
      blockersRisksJson: JSON.stringify(analysis.blockersRisks),
      decisionsCalloutsJson: JSON.stringify(analysis.decisionsCallouts),
      notes: analysis.notes,
      emailStatus: "Draft",
      createdBy: job.createdBy ?? null,
    });

    const [recap] = await db
      .select({ id: tdcMeetingRecaps.id })
      .from(tdcMeetingRecaps)
      .where(eq(tdcMeetingRecaps.transcriptStorageUrl, storedTranscript.url))
      .orderBy(desc(tdcMeetingRecaps.id))
      .limit(1);
    if (!recap) throw new Error("The generated recap could not be saved.");

    await updateJob(jobId, {
      status: "Complete",
      stage: "Recap draft ready",
      recapId: Number(recap.id),
      failureMessage: null,
    });
  } catch (error) {
    console.error("[MeetingRecaps] generation failed", error);
    await updateJob(jobId, {
      status: "Failed",
      stage: "Recap generation needs attention",
      failureMessage: userSafeFailure(error),
    }).catch((updateError) => console.error("[MeetingRecaps] failed to record job error", updateError));
  }
}

export async function createMeetingRecapUpload(input: {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  totalParts: number;
  createdBy?: string | null;
}) {
  requireSupportedTranscript(input.fileName, input.mimeType, input.fileSizeBytes);
  if (input.totalParts < 1 || input.totalParts > MAX_RECAP_UPLOAD_PARTS) {
    throw new Error("The transcript upload has an invalid number of parts.");
  }

  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  const id = randomUUID();
  await db.insert(tdcMeetingRecapJobs).values({
    id,
    transcriptFileName: input.fileName,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    totalParts: input.totalParts,
    uploadedPartsJson: "[]",
    status: "Uploading",
    stage: "Uploading transcript securely",
    createdBy: input.createdBy ?? null,
  });
  return { uploadId: id, partSizeBytes: RECAP_UPLOAD_PART_BYTES };
}

export async function uploadMeetingRecapPart(input: {
  uploadId: string;
  partNumber: number;
  partBase64: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  const [job] = await db.select().from(tdcMeetingRecapJobs).where(eq(tdcMeetingRecapJobs.id, input.uploadId)).limit(1);
  if (!job || job.status !== "Uploading") {
    throw new Error("This transcript upload is no longer available. Re-select the file and try again.");
  }
  if (input.partNumber < 0 || input.partNumber >= job.totalParts) {
    throw new Error("The transcript upload part is out of range.");
  }

  const parts = getJobParts(job);
  const existingPart = parts.find((part) => part.partNumber === input.partNumber);
  if (existingPart) {
    return { received: true, partNumber: existingPart.partNumber };
  }

  const partBuffer = Buffer.from(input.partBase64, "base64");
  if (!partBuffer.length || partBuffer.length > RECAP_UPLOAD_PART_BYTES) {
    throw new Error("A transcript upload part is invalid or exceeds the secure part size.");
  }
  const stored = await storagePut(
    `tdc-meeting-recaps/uploads/${job.id}/part-${input.partNumber}`,
    partBuffer,
    "application/octet-stream"
  );
  parts.push({ partNumber: input.partNumber, storageUrl: stored.url, byteLength: partBuffer.length });
  parts.sort((left, right) => left.partNumber - right.partNumber);
  await db
    .update(tdcMeetingRecapJobs)
    .set({ uploadedPartsJson: JSON.stringify(parts), stage: "Uploading transcript securely" })
    .where(eq(tdcMeetingRecapJobs.id, input.uploadId));
  return { received: true, partNumber: input.partNumber };
}

export async function queueMeetingRecapGeneration(uploadId: string) {
  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  const [job] = await db.select().from(tdcMeetingRecapJobs).where(eq(tdcMeetingRecapJobs.id, uploadId)).limit(1);
  if (!job) throw new Error("This transcript upload is no longer available. Re-select the file and try again.");
  if (job.status !== "Uploading" && job.status !== "Queued" && job.status !== "Running") {
    throw new Error("This transcript upload cannot be queued for recap generation.");
  }

  const parts = getJobParts(job);
  const complete =
    parts.length === job.totalParts &&
    parts.every((part, index) => part.partNumber === index) &&
    parts.reduce((total, part) => total + part.byteLength, 0) === job.fileSizeBytes;
  if (!complete) {
    throw new Error("The transcript upload did not finish. Re-select the file and try again.");
  }

  if (job.status === "Uploading") {
    await db
      .update(tdcMeetingRecapJobs)
      .set({ status: "Queued", stage: "Queued for recap analysis", failureMessage: null })
      .where(eq(tdcMeetingRecapJobs.id, uploadId));
  }
  void runMeetingRecapJob(uploadId);
  return getMeetingRecapJobStatus(uploadId);
}

export async function retryMeetingRecapGeneration(jobId: string) {
  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  const [job] = await db.select().from(tdcMeetingRecapJobs).where(eq(tdcMeetingRecapJobs.id, jobId)).limit(1);
  if (!job) throw new Error("This transcript upload is no longer available. Re-select the file and try again.");
  if (job.status !== "Failed") return getMeetingRecapJobStatus(jobId);

  await db
    .update(tdcMeetingRecapJobs)
    .set({ status: "Queued", stage: "Queued for retry", failureMessage: null })
    .where(eq(tdcMeetingRecapJobs.id, jobId));
  void runMeetingRecapJob(jobId);
  return getMeetingRecapJobStatus(jobId);
}

export async function getMeetingRecapJobStatus(jobId: string) {
  const db = await getDb();
  if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
  const [job] = await db.select().from(tdcMeetingRecapJobs).where(eq(tdcMeetingRecapJobs.id, jobId)).limit(1);
  if (!job) throw new Error("The meeting recap request is no longer available.");
  if (job.status === "Queued") void runMeetingRecapJob(jobId);
  return toSafeJob(job);
}

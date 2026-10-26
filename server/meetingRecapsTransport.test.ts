import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Meeting Recaps transport", () => {
  it("sends all recap upload-job mutations through unbatched transport", () => {
    const transport = readFileSync("client/src/main.tsx", "utf8");

    expect(transport).toContain("httpBatchLink,");
    expect(transport).toContain("httpLink,");
    expect(transport).toContain("splitLink,");
    expect(transport).toContain('op.path.startsWith("tdcMeetingRecaps.")');
    expect(transport).toContain("true: httpLink({");
    expect(transport).toContain("false: httpBatchLink({");
    expect(transport).not.toContain('op.path === "tdcMeetingRecaps.createFromTranscript"');
  });

  it("uses bounded upload parts and a tracked generation job instead of a single base64 transcript mutation", () => {
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const router = readFileSync("server/routers.ts", "utf8");
    const jobs = readFileSync("server/meetingRecapJobs.ts", "utf8");
    const schema = readFileSync("drizzle/schema.ts", "utf8");

    expect(page).toContain("RECAP_UPLOAD_PART_BYTES = 384 * 1024");
    expect(page).toContain("filePartToBase64(selectedFile, start, end)");
    expect(page).toContain("trpc.tdcMeetingRecaps.createUpload.useMutation()");
    expect(page).toContain("trpc.tdcMeetingRecaps.uploadPart.useMutation()");
    expect(page).toContain("trpc.tdcMeetingRecaps.queueGeneration.useMutation()");
    expect(page).toContain("trpc.tdcMeetingRecaps.generationStatus.useQuery(");
    expect(page).toContain("trpc.tdcMeetingRecaps.generateEmailDraft.useMutation({");
    expect(page).toContain("Retry generation");
    expect(page).toContain("Generate Daily TDC Standup Recap");
    expect(page).toContain("Generate Recap");
    expect(page).toContain("Generate Email Draft");
    expect(page).toContain("Email Draft Ready");
    expect(page).toContain("Mark Reviewed");
    expect(page).toContain('"Email Actions"');
    expect(page).toContain("Generate Email Recap");
    expect(page).toContain("Mark Read");
    expect(page).toContain('emailStatus: "Reviewed"');
    expect(page).toContain("continues as a tracked job if you refresh the page");
    expect(page).not.toContain("createFromTranscript.useMutation");
    expect(page).not.toContain("fileToBase64(selectedFile)");

    expect(router).toContain("createUpload: publicProcedure");
    expect(router).toContain("uploadPart: publicProcedure");
    expect(router).toContain("queueGeneration: publicProcedure");
    expect(router).toContain("retryGeneration: publicProcedure");
    expect(router).toContain("generationStatus: publicProcedure");
    expect(router).toContain("generateEmailDraft: publicProcedure");
    expect(router).toContain("Select an active Draft or Reviewed recap to prepare its email draft.");
    expect(router).not.toContain("createFromTranscript: publicProcedure");

    expect(jobs).toContain("MAX_RECAP_UPLOAD_BYTES = 10 * 1024 * 1024");
    expect(jobs).toContain("RECAP_UPLOAD_PART_BYTES = 384 * 1024");
    expect(jobs).toContain("storagePut(");
    expect(jobs).toContain("void runMeetingRecapJob(uploadId)");
    expect(jobs).toContain("status: \"Queued\"");
    expect(jobs).toContain("status: \"Complete\"");
    expect(jobs).toContain("status: \"Failed\"");
    expect(jobs).not.toContain("new Map");

    expect(schema).toContain('tdcMeetingRecapJobs = mysqlTable("tdc_meeting_recap_jobs"');
    expect(schema).toContain('uploadedPartsJson: mediumtext("uploadedPartsJson")');
  });

  it("keeps transcript text out of the recap-history response and retries transient history failures", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const listProcedure = router.slice(
      router.indexOf("tdcMeetingRecaps: router({"),
      router.indexOf("createUpload: publicProcedure")
    );

    expect(listProcedure).toContain(
      "transcriptStorageUrl: tdcMeetingRecaps.transcriptStorageUrl"
    );
    expect(listProcedure).not.toContain("transcriptText:");
    expect(page).toContain("tdcMeetingRecaps.list.useQuery(undefined, {");
    expect(page).toContain("retry: 2,");
    expect(page).toContain("Retry loading history");
  });
});

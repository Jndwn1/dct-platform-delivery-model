import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_RECAP_UPLOAD_BYTES } from "./meetingRecapJobs";

describe("Meeting Recap upload latency", () => {
  it("uses one direct secure request for every supported Daily Standup transcript size", () => {
    const largestSupportedTranscriptBytes = 10 * 1024 * 1024;

    expect(MAX_RECAP_UPLOAD_BYTES).toBe(largestSupportedTranscriptBytes);
  });

  it("does not route any supported transcript through sequential browser chunks", () => {
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");

    expect(page).toContain("DIRECT_RECAP_UPLOAD_MAX_BYTES = 10 * 1024 * 1024");
    expect(page).toContain("selectedFile.size > DIRECT_RECAP_UPLOAD_MAX_BYTES");
    expect(page).toContain("Supported transcripts upload as one direct secure file transfer");
    expect(page).not.toContain("Larger files use durable parts automatically");
  });

  it("communicates upload completion separately from background recap generation", () => {
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const server = readFileSync("server/_core/index.ts", "utf8");
    const jobs = readFileSync("server/meetingRecapJobs.ts", "utf8");

    expect(page).toContain("DIRECT_RECAP_UPLOAD_MAX_BYTES = 10 * 1024 * 1024");
    expect(page).toContain('fetch("/api/tdc-meeting-recaps/upload"');
    expect(page).toContain('selectedFile.size > DIRECT_RECAP_UPLOAD_MAX_BYTES');
    expect(page).toContain('"content-type": "application/octet-stream"');
    expect(page).toContain("Supported transcripts upload as one direct secure file transfer");
    expect(page).toContain("transferring the source transcript once, then starting recap generation");
    expect(page).toContain("Transcript upload complete in");
    expect(page).toContain("Recap generation is continuing in the background");
    expect(page).toContain("Generating recap…");
    expect(page).toContain("staleTime: 60_000");
    expect(page).toContain("refetchOnWindowFocus: false");
    expect(server).toContain('app.post(\n    "/api/tdc-meeting-recaps/upload"');
    expect(server).toContain('express.raw({ type: "application/octet-stream", limit: "12mb" })');
    expect(server).toContain("createDirectMeetingRecapUpload");
    expect(jobs).toContain("isFinalSource: true");
    expect(jobs).toContain("Using retained source transcript");
  });
});

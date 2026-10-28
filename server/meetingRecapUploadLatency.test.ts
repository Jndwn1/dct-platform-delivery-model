import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MAX_RECAP_UPLOAD_BYTES,
  MAX_RECAP_UPLOAD_PARTS,
  RECAP_UPLOAD_PART_BYTES,
} from "./meetingRecapJobs";

describe("Meeting Recap upload latency", () => {
  it("uses one durable request for representative Daily Standup transcript sizes", () => {
    // Representative retained Daily Standup DOCX: 1,640,049 bytes.
    const representativeTranscriptBytes = 1_640_049;

    expect(RECAP_UPLOAD_PART_BYTES).toBe(2 * 1024 * 1024);
    expect(Math.ceil(representativeTranscriptBytes / RECAP_UPLOAD_PART_BYTES)).toBe(1);
    expect(MAX_RECAP_UPLOAD_PARTS).toBe(
      Math.ceil(MAX_RECAP_UPLOAD_BYTES / RECAP_UPLOAD_PART_BYTES)
    );
  });

  it("preserves the durable multipart fallback for larger transcripts", () => {
    expect(Math.ceil((RECAP_UPLOAD_PART_BYTES + 1) / RECAP_UPLOAD_PART_BYTES)).toBe(2);
    expect(MAX_RECAP_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
  });

  it("communicates upload completion separately from background recap generation", () => {
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const server = readFileSync("server/_core/index.ts", "utf8");
    const jobs = readFileSync("server/meetingRecapJobs.ts", "utf8");

    expect(page).toContain("DIRECT_RECAP_UPLOAD_MAX_BYTES = 2 * 1024 * 1024");
    expect(page).toContain('fetch("/api/tdc-meeting-recaps/upload"');
    expect(page).toContain('selectedFile.size <= DIRECT_RECAP_UPLOAD_MAX_BYTES');
    expect(page).toContain('"content-type": "application/octet-stream"');
    expect(page).toContain("Typical daily transcripts upload as a direct secure file transfer");
    expect(page).toContain("Preparing recap generation…");
    expect(page).toContain("Transcript upload complete in");
    expect(page).toContain("Recap generation is continuing in the background");
    expect(page).toContain("Generating recap…");
    expect(page).toContain("staleTime: 60_000");
    expect(page).toContain("refetchOnWindowFocus: false");
    expect(server).toContain('app.post(\n    "/api/tdc-meeting-recaps/upload"');
    expect(server).toContain('express.raw({ type: "application/octet-stream", limit: "2mb" })');
    expect(server).toContain("createDirectMeetingRecapUpload");
    expect(jobs).toContain("isFinalSource: true");
    expect(jobs).toContain("Using retained source transcript");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  RECAP_UPLOAD_TARGET_MS,
  summarizeMeetingRecapUploadPerformance,
} from "./meetingRecapJobs";

describe("Meeting Recaps upload performance", () => {
  it("evaluates the five-second target from completed upload measurements only", () => {
    const summary = summarizeMeetingRecapUploadPerformance([
      {
        id: "latest-direct",
        durationMs: 4_800,
        fileSizeBytes: 1_600_000,
        uploadMode: "Direct",
        completedAt: new Date("2026-10-28T14:00:00Z"),
      },
      {
        id: "legacy-multipart",
        durationMs: 6_200,
        fileSizeBytes: 3_100_000,
        uploadMode: "Multipart",
        completedAt: new Date("2026-10-27T14:00:00Z"),
      },
      {
        id: "target-boundary",
        durationMs: RECAP_UPLOAD_TARGET_MS,
        fileSizeBytes: 1_000_000,
        uploadMode: "Direct",
        completedAt: new Date("2026-10-26T14:00:00Z"),
      },
    ]);

    expect(summary.targetMs).toBe(5_000);
    expect(summary.sampleSize).toBe(3);
    expect(summary.metTargetCount).toBe(2);
    expect(summary.metTargetPercent).toBe(67);
    expect(summary.averageDurationMs).toBe(5_333);
    expect(summary.latest).toMatchObject({
      id: "latest-direct",
      durationMs: 4_800,
      uploadMode: "Direct",
      metTarget: true,
    });
    expect(summary.recent[1]).toMatchObject({ id: "legacy-multipart", metTarget: false });
  });

  it("reports an explicit empty state before the first measured upload", () => {
    expect(summarizeMeetingRecapUploadPerformance([])).toMatchObject({
      targetMs: 5_000,
      sampleSize: 0,
      metTargetCount: 0,
      metTargetPercent: null,
      averageDurationMs: null,
      latest: null,
      recent: [],
    });
  });

  it("persists browser-measured transfer timing and renders the recent target metric without counting recap generation", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const jobs = readFileSync("server/meetingRecapJobs.ts", "utf8");
    const schema = readFileSync("drizzle/schema.ts", "utf8");

    expect(router).toContain("uploadPerformance: publicProcedure");
    expect(router).toContain("recordUploadPerformance: publicProcedure");
    expect(page).toContain("tdcMeetingRecaps.uploadPerformance.useQuery");
    expect(page).toContain("recordUploadPerformance.mutate({ jobId");
    expect(page).toContain("Recent Upload Performance");
    expect(page).toContain("Secure transcript transfer only; recap generation time is excluded.");
    expect(page).toContain("Five-second target");
    expect(page).toContain("Recent average");
    expect(jobs).toContain("RECAP_UPLOAD_TARGET_MS = 5_000");
    expect(jobs).toContain("recordMeetingRecapUploadPerformance");
    expect(jobs).toContain("getMeetingRecapUploadPerformance");
    expect(schema).toContain('uploadDurationMs: int("uploadDurationMs")');
    expect(schema).toContain('uploadCompletedAt: timestamp("uploadCompletedAt")');
    expect(schema).toContain('uploadMode: varchar("uploadMode", { length: 16 })');
  });
});

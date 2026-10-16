import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Meeting Recaps transport", () => {
  it("sends the transcript upload through an unbatched tRPC request", () => {
    const transport = readFileSync("client/src/main.tsx", "utf8");

    expect(transport).toContain("httpBatchLink,");
    expect(transport).toContain("httpLink,");
    expect(transport).toContain("splitLink,");
    expect(transport).toContain(
      'op.path === "tdcMeetingRecaps.createFromTranscript"'
    );
    expect(transport).toContain("true: httpLink({");
    expect(transport).toContain("false: httpBatchLink({");
  });

  it("keeps transcript text out of the recap-history response and retries transient history failures", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const page = readFileSync("client/src/pages/MeetingRecapsPage.tsx", "utf8");
    const listProcedure = router.slice(
      router.indexOf("tdcMeetingRecaps: router({"),
      router.indexOf("createFromTranscript: publicProcedure")
    );
    const createResponse = router.slice(
      router.indexOf(
        "const [record] = await db.select().from(tdcMeetingRecaps)"
      ),
      router.indexOf("updateEmailStatus: publicProcedure")
    );

    expect(listProcedure).toContain(
      "transcriptStorageUrl: tdcMeetingRecaps.transcriptStorageUrl"
    );
    expect(listProcedure).not.toContain("transcriptText:");
    expect(createResponse).not.toContain("...record,");
    expect(page).toContain("tdcMeetingRecaps.list.useQuery(undefined, {");
    expect(page).toContain("retry: 2,");
    expect(page).toContain("Retry loading history");
  });
});

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
});

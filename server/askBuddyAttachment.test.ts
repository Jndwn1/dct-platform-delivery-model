import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
const router = readFileSync("server/routers.ts", "utf8");
const transport = readFileSync("client/src/main.tsx", "utf8");

describe("Ask Buddy direct attachment workflow", () => {
  it("provides a general file attachment control beside the question composer", () => {
    expect(askBuddyPage).toContain('id="ask-buddy-attachment"');
    expect(askBuddyPage).toContain("Attach File");
    expect(askBuddyPage).toContain("Attach file for Ask Buddy analysis");
    expect(askBuddyPage).not.toContain('accept=".xlsx,.xls,.csv"');
    expect(askBuddyPage).toContain("Analyze & Ask");
    expect(askBuddyPage).toContain("Source version/date (optional)");
    expect(askBuddyPage).toContain("Ask a question about the attached file");
    expect(askBuddyPage).toContain(
      "Word (.docx), Excel/CSV, and readable text formats"
    );
  });

  it("sends the preserved artifact ID to Buddy instead of trusting client-provided analysis text", () => {
    expect(askBuddyPage).toContain(
      "attachmentArtifactId: artifact.artifact.id"
    );
    expect(router).toContain(
      "attachmentArtifactId: z.number().int().positive().optional()"
    );
    expect(router).toContain("UPLOADED STRUCTURED SOURCE REVIEW — REVIEW ONLY");
    expect(router).toContain("The uploaded attachment could not be found");
  });

  it("uses an unbatched request for general file uploads", () => {
    expect(askBuddyPage).toContain(
      "trpc.askBuddy.uploadAttachment.useMutation()"
    );
    expect(router).toContain("uploadAttachment: publicProcedure");
    expect(transport).toContain('op.path === "askBuddy.uploadAttachment"');
    expect(transport).toContain("true: httpLink({");
  });
});

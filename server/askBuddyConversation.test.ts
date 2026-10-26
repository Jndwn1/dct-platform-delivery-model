import { describe, expect, it } from "vitest";
import { removeRetiredExtractionConversationTurns, type SharedBuddyMessage } from "../client/src/lib/askBuddyConversation";

function message(id: string, role: "user" | "assistant", content: string): SharedBuddyMessage {
  return { id, role, content, createdAt: "2026-10-22T11:16:00.000Z" };
}

describe("Ask Buddy saved conversation migration", () => {
  it("removes the retired extraction-only answer and its paired request", () => {
    const migrated = removeRetiredExtractionConversationTurns([
      message("welcome", "assistant", "Hello, I'm Ask Buddy your Business Analysis Assistant to help you with all your tasks."),
      message("legacy-question", "user", "Review the document and identify TDC dependencies."),
      message("legacy-answer", "assistant", "### Document Analysis — Evidence-Bound First Pass\n\nAsk Buddy prepared this evidence-bound first pass directly from matching extracted statements in the attached document."),
      message("current-question", "user", "Which dependency should be tracked in ADO?"),
      message("current-answer", "assistant", "The field contract is a potential blocker and needs validation."),
    ]);

    expect(migrated.map((item) => item.id)).toEqual(["welcome", "current-question", "current-answer"]);
  });

  it("preserves a valid assessment and its paired request", () => {
    const conversation = [
      message("question", "user", "Complete a full requirements assessment."),
      message("assessment", "assistant", "### 1. Executive Assessment\n\nA current evidence-based assessment."),
    ];

    expect(removeRetiredExtractionConversationTurns(conversation)).toEqual(conversation);
  });

  it("removes the retired State assessment that preceded the direct-answer repair", () => {
    const migrated = removeRetiredExtractionConversationTurns([
      message("state-question", "user", "What are the TDC requirements and dependencies before development?"),
      message("state-answer", "assistant", "### 1. Executive Assessment\n\nThe document does not select a State Apportionment operating model or establish final TDC interface requirements."),
      message("new-question", "user", "Which dependency should be tracked in ADO?"),
    ]);

    expect(migrated.map((item) => item.id)).toEqual(["new-question"]);
  });
});

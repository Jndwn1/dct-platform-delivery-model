import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const askBuddyPage = readFileSync(
  resolve(process.cwd(), "client/src/pages/AskBuddy.tsx"),
  "utf8"
);

describe("Ask Buddy welcome message", () => {
  it("uses the Business Analyst Assistant introduction for new and reset conversations", () => {
    expect(askBuddyPage).toContain(
      "Hi, I'm your Business Analyst Assistant. I'm here to help you with your discovery needs, analysis, requirements gathering, or mapping."
    );
    expect(askBuddyPage).toContain("text: BUDDY_WELCOME_MESSAGE");
    expect(askBuddyPage).toContain(
      'message.id === "welcome" && message.role === "assistant" ? BUDDY_WELCOME_MESSAGE'
    );
    expect(askBuddyPage).not.toContain("Hi, I'm Ask Buddy!");
    expect(askBuddyPage).not.toContain(
      "Hi, I'm Ask Buddy — the DCT Discovery intelligence assistant."
    );
  });
});

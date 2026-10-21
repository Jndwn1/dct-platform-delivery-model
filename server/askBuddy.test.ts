/**
 * Tests for the askBuddy.chat tRPC procedure
 * Verifies that the procedure accepts a valid message array and returns a text response.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock invokeLLM ────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "This is a mock LLM response about the DCT platform.",
        },
      },
    ],
  }),
  LLMRequestTimeoutError: class LLMRequestTimeoutError extends Error {},
}));

// ── Mock platformContext ──────────────────────────────────────────────────────
vi.mock("./platformContext", () => ({
  buildCompactAskBuddyPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a DCT platform assistant. [mock compact system prompt]"
  ),
}));

import { invokeLLM, LLMRequestTimeoutError } from "./_core/llm";
import { buildCompactAskBuddyPrompt } from "./platformContext";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("askBuddy.chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls buildCompactAskBuddyPrompt to build the bounded system context", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What is Batch 6?" }],
    });
    expect(buildCompactAskBuddyPrompt).toHaveBeenCalledOnce();
  });

  it("passes the system prompt + user messages to invokeLLM", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [{ role: "user", content: "List all ADRs" }],
    });
    expect(invokeLLM).toHaveBeenCalledOnce();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1]).toEqual({ role: "user", content: "List all ADRs" });
    expect(callArgs).toMatchObject({
      model: "gpt-6-luna",
      reasoning: { effort: "none" },
      maxTokens: 650,
      timeoutMs: 4200,
    });
  });

  it("returns the LLM response text", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What are the platform guardrails?" }],
    });
    expect(result.text).toContain("This is a mock LLM response about the DCT platform.");
    expect(result.text).toContain("### Sources Used");
    expect(result.knowledgeCheckedAt).toBeTruthy();
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it("handles multi-turn conversation history", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [
        { role: "user", content: "What is Batch 1?" },
        { role: "assistant", content: "Batch 1 covers file ingestion." },
        { role: "user", content: "What about Batch 2?" },
      ],
    });
    expect(result.text).toBeTruthy();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    // system + 3 user/assistant messages = 4 total
    expect(callArgs.messages).toHaveLength(4);
  });

  it("limits provider conversation history to the most recent two turns", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [
        { role: "user", content: "Question one" },
        { role: "assistant", content: "Answer one" },
        { role: "user", content: "Question two" },
        { role: "assistant", content: "Answer two" },
        { role: "user", content: "Question three" },
        { role: "assistant", content: "Answer three" },
        { role: "user", content: "What does TDC own?" },
      ],
    });
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(5);
    expect(callArgs.messages.at(-1)).toEqual({ role: "user", content: "What does TDC own?" });
    expect(callArgs.messages[1]).toEqual({ role: "assistant", content: "Answer two" });
  });

  it("injects documented Pilot story-review evidence for the scoped review agent", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What are the key gaps that Gary should review for Story 1494344?" }],
      currentPagePath: "/post-pilot",
      capability: "story-review",
    });
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain("State & Provision Story Review");
    expect(callArgs.messages[0].content).toContain("Gary retains final technical review authority");
  });

  it("returns fallback text when LLM returns no content", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    });
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What is the platform guardrail?" }],
    });
    expect(result.text).toContain("unable to generate");
  });

  it("returns an evidence-safe response when the fast-model deadline is reached", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new LLMRequestTimeoutError("timeout"));
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What does TDC own?" }],
    });
    expect(result.text).toContain("response-time limit");
    expect(result.text).toContain("No answer has been inferred");
    expect(result.text).toContain("### Sources Used");
  });
});

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
}));

// ── Mock platformContext ──────────────────────────────────────────────────────
vi.mock("./platformContext", () => ({
  buildPlatformSystemPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a DCT platform assistant. [mock system prompt]"
  ),
}));

import { invokeLLM } from "./_core/llm";
import { buildPlatformSystemPrompt } from "./platformContext";
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

  it("calls buildPlatformSystemPrompt to build the system context", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What is Batch 6?" }],
    });
    expect(buildPlatformSystemPrompt).toHaveBeenCalledOnce();
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
  });

  it("returns the LLM response text", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What are the platform guardrails?" }],
    });
    expect(result).toEqual({
      text: "This is a mock LLM response about the DCT platform.",
    });
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

  it("returns fallback text when LLM returns no content", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    });
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.text).toContain("unable to generate");
  });
});

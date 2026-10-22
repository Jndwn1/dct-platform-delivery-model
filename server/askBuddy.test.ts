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
  buildAttachmentAnalysisPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, an attachment-led Business Analysis Assistant. [mock attachment prompt]"
  ),
  buildAttachmentDirectQuestionPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a targeted document-analysis assistant. [mock direct attachment prompt]"
  ),
  buildCompactAskBuddyPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a DCT platform assistant. [mock compact system prompt]"
  ),
  buildCrossTeamDependencyPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a cross-team dependencies assistant. [mock dependency prompt]"
  ),
  buildGeneralAskBuddyPrompt: vi.fn().mockReturnValue(
    "You are Ask Buddy, a Business Analysis Assistant. [mock general guidance prompt]"
  ),
  isStateApportionmentDependencyQuestion: vi.fn((question: string) => /state apportionment/i.test(question)),
}));

import { invokeLLM, LLMRequestTimeoutError } from "./_core/llm";
import { buildAttachmentAnalysisPrompt, buildCompactAskBuddyPrompt, buildCrossTeamDependencyPrompt, buildGeneralAskBuddyPrompt } from "./platformContext";
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
      model: "gemini-3.8-flash",
      thinking: { budget_tokens: 256 },
      maxTokens: 600,
    });
    expect(callArgs.timeoutMs).toBeLessThanOrEqual(6000);
    expect(callArgs.timeoutMs).toBeGreaterThan(400);
  });

  it("returns the LLM response text", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What are the platform guardrails?" }],
    });
    expect(result.text).toContain("This is a mock LLM response about the DCT platform.");
    expect(result.text).not.toContain("### Sources Used");
    expect(result.knowledgeCheckedAt).toBeTruthy();
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it("uses the cross-team dependency framework only when that capability is selected", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({
      messages: [{ role: "user", content: "What are the TDC dependencies and what does TDC need to own?" }],
      currentPagePath: "/post-pilot/state-taxonomy-readiness",
      capability: "cross-team-dependencies",
    });

    expect(buildCrossTeamDependencyPrompt).toHaveBeenCalledOnce();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain("mock dependency prompt");
    expect(callArgs).toMatchObject({
      model: "gemini-3.8-flash",
      thinking: { budget_tokens: 256 },
      maxTokens: 1400,
    });
    expect(callArgs.timeoutMs).toBeLessThanOrEqual(12000);
    expect(callArgs.timeoutMs).toBeGreaterThan(400);
    expect(callArgs.messages[0].content).toContain("Capability-Specific Evidence Packet");
    expect(callArgs.messages[0].content).not.toContain("Full Batch Registry");
  });

  it("uses the reasoning model for a State Apportionment dependency question", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "For State Apportionment, what must TDC own before the spikes move toward implementation?" }],
      currentPagePath: "/ask-buddy",
      capability: "discovery",
    });

    expect(buildCrossTeamDependencyPrompt).toHaveBeenCalledOnce();
    expect(invokeLLM).toHaveBeenCalledOnce();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.thinking).toEqual({ budget_tokens: 256 });
    expect(result.text).toContain("mock LLM response");
    expect(result.text).toContain("Ask Buddy has no live Azure DevOps connection");
    expect(result.sources.map((source) => source.label)).toEqual(["State Taxonomy Readiness"]);
  });

  it("uses reasoning for a natural State dependency follow-up from the recent conversation", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [
        { role: "user", content: "For State Apportionment, what must TDC own before the spikes move toward implementation?" },
        { role: "assistant", content: "The working session identifies three TDC responsibilities." },
        { role: "user", content: "What are the requirements for those three TDC responsibilities?" },
      ],
      currentPagePath: "/ask-buddy",
      capability: "discovery",
    });

    expect(buildCrossTeamDependencyPrompt).toHaveBeenCalledOnce();
    expect(invokeLLM).toHaveBeenCalledOnce();
    expect(result.text).toContain("Ask Buddy has no live Azure DevOps connection");
  });

  it("adds the no-live-ADO boundary for a dependency recommendation even without a supplied ID", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "Recommend ADO dependencies for this integration." }],
      currentPagePath: "/ask-buddy",
    });

    expect(invokeLLM).toHaveBeenCalledOnce();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.thinking).toEqual({ budget_tokens: 256 });
    expect(result.text).toContain("Ask Buddy has no live Azure DevOps connection in this workspace");
    expect(result.text).toContain("cannot open, retrieve, query, or update ADO work items");
  });

  it("answers a general business-analysis question without misrepresenting it as a DCT platform fact", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "How should I prepare for a requirements workshop?" }],
      currentPagePath: "/ask-buddy",
    });

    expect(invokeLLM).toHaveBeenCalledOnce();
    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(buildGeneralAskBuddyPrompt).toHaveBeenCalledWith("/ask-buddy");
    expect(callArgs.messages[0].content).toContain("GENERAL BUSINESS-ANALYSIS MODE");
    expect(callArgs.messages[0].content).toContain("DCT KNOWLEDGE-BASE CHECK");
    expect(result.text).not.toContain("### Sources Used");
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
    // system + the most recent two user/assistant messages = 3 total
    expect(callArgs.messages).toHaveLength(3);
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
    expect(callArgs.messages).toHaveLength(3);
    expect(callArgs.messages.at(-1)).toEqual({ role: "user", content: "What does TDC own?" });
    expect(callArgs.messages[1]).toEqual({ role: "assistant", content: "Answer three" });
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
    expect(result.text).not.toContain("### Sources Used");
  });

  it("returns practical general BA guidance when the fast-model deadline is reached", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new LLMRequestTimeoutError("timeout"));
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "How should I structure a requirements workshop agenda?" }],
      currentPagePath: "/ask-buddy",
    });

    expect(result.text).toContain("decision-oriented workshop agenda");
    expect(result.text).toContain("Facilitation tip");
    expect(result.text).not.toContain("No answer has been inferred");
  });
});

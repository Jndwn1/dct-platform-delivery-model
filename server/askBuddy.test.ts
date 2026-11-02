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
vi.mock("./platformContext", async (importOriginal) => ({
  ...await importOriginal<typeof import("./platformContext")>(),
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
      reasoning: { effort: "low" },
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
      model: "gpt-6-luna",
      reasoning: { effort: "low" },
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
    expect(callArgs.reasoning).toEqual({ effort: "low" });
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
    expect(callArgs.reasoning).toEqual({ effort: "low" });
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
    // System + the complete preceding user/assistant exchange + current question.
    expect(callArgs.messages).toHaveLength(4);
  });

  it("limits provider conversation history to six bounded messages", async () => {
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
    expect(callArgs.messages).toHaveLength(7);
    expect(callArgs.messages.at(-1)).toEqual({ role: "user", content: "What does TDC own?" });
    expect(callArgs.messages[1]).toEqual({ role: "assistant", content: "Answer one" });
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

  it.each(["What are the platform layers?", "Who owns the Gateway?", "Refer to the executive health section", "What batches are in PI 3?"])("routes %s to platform evidence, not general advice", async (question) => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({ messages: [{ role: "user", content: question }], currentPagePath: "/ask-buddy" });
    expect(buildCompactAskBuddyPrompt).toHaveBeenCalledOnce();
    expect(buildGeneralAskBuddyPrompt).not.toHaveBeenCalled();
    const args = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.reasoning).toEqual({ effort: "low" });
    expect(args.thinking).toBeUndefined();
  });

  it("retains the original Pilot/ADO question when the user refers to Executive Health", async () => {
    const caller = appRouter.createCaller(createTestCtx());
    await caller.askBuddy.chat({ messages: [
      { role: "user", content: "For Roger Pilot workflow setup, what dependencies does TDC have? Tech Story 1528380: TDC V2 non-legal entity types API" },
      { role: "assistant", content: "Earlier missing answer." },
      { role: "user", content: "Refer to the executive health section" },
    ], currentPagePath: "/ask-buddy", capability: "cross-team-dependencies" });
    expect(buildCompactAskBuddyPrompt).toHaveBeenCalledWith(expect.objectContaining({ question: expect.stringContaining("1528380") }));
    expect(buildCrossTeamDependencyPrompt).not.toHaveBeenCalled();
    const args = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.messages).toHaveLength(4);
    expect(args.model).toBe("gpt-6-luna");
    expect(args.messages[0].content).toContain("Prior assistant answers are conversational context, not confirmed evidence");
  });

  it("marks a token-truncated answer incomplete instead of a completed analysis", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ choices: [{ message: { content: "Partial answer" }, finish_reason: "length" }] });
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({ messages: [{ role: "user", content: "What does TDC own?" }] });
    expect(result.generationStatus).toBe("incomplete");
    expect(result.status).toBe("Missing");
    expect(result.text).toContain("Incomplete AI response");
  });

  it("does not substitute canned guidance for a failed AI response", async () => {
    (invokeLLM as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new LLMRequestTimeoutError("timeout"));
    const caller = appRouter.createCaller(createTestCtx());
    const result = await caller.askBuddy.chat({
      messages: [{ role: "user", content: "How should I structure a requirements workshop agenda?" }],
      currentPagePath: "/ask-buddy",
    });

    expect(result.text).toContain("predefined answer has not been substituted");
    expect(result.generationStatus).toBe("timeout");
    expect(result.status).toBe("Missing");
  });
});

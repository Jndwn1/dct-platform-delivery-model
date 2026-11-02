import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Direct source-based answer." }, finish_reason: "stop" }] }), LLMRequestTimeoutError: class extends Error {} }));
vi.mock("./db", async importOriginal => ({ ...await importOriginal<typeof import("./db")>(), getDb: vi.fn().mockResolvedValue(null) }));
import { invokeLLM } from "./_core/llm";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
const ctx = { user: null, req: { headers: {}, protocol: "https" }, res: {} } as TrpcContext;
const prompt = () => vi.mocked(invokeLLM).mock.calls.at(-1)![0].messages![0].content as string;

describe("Buddy page-content reasoning route", () => {
  beforeEach(() => vi.clearAllMocks());
  it("answers an explicit page question without retrieving an unrelated previous document", async () => {
    const response = await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "Go to /taxonomy page and explain the taxonomy levels." }], currentPagePath: "/ask-buddy", documentContext: { artifactId: 999997, fileName: "Unrelated old screenshot.png", initialQuestion: "Different old ADO story" } });
    expect(response.generationStatus).toBe("completed");
    expect(prompt()).toContain("REQUESTED PAGE CONTENT");
    expect(prompt()).toContain("/taxonomy");
    expect(prompt()).not.toContain("Different old ADO story");
    expect(response.sources.some(source => source.path === "/taxonomy")).toBe(true);
    expect(response.status).not.toBe("Confirmed");
  });
  it("includes the user's phase/date clarification alongside page evidence", async () => {
    await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "What does the Pilot page show about delivery?" }], currentPagePath: "/ask-buddy" });
    expect(prompt()).toContain("MVP delivered September 26, 2026");
    expect(prompt()).toContain("delivery date December 16, 2026");
    expect(prompt()).toContain("UAT completed last week");
    expect(prompt()).toContain("Pilot is being built, not delivered");
  });
  it("uses complete Pilot flow evidence while preserving proposed/demonstrated boundaries", async () => {
    await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "Explain the Pilot page process flow and architecture" }], currentPagePath: "/ask-buddy" });
    expect(prompt()).toContain("Roger UI → TDC → IMS → GoSystem");
    expect(prompt()).toContain("Provision does not use GoSystem");
    expect(prompt()).toContain("PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION");
    expect(prompt()).toContain("Steps 7–9 are parallel");
  });
  it("keeps general BA questions conversational rather than forcing unrelated page facts", async () => {
    await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "How should I structure a requirements workshop agenda?" }], currentPagePath: "/ask-buddy" });
    expect(prompt()).toContain("GENERAL BUSINESS-ANALYSIS MODE");
    expect(prompt()).not.toContain("REQUESTED PAGE CONTENT");
  });
});

import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BUDDY_CHAT_CONNECTION_TIMEOUT_MS, BUDDY_UPLOAD_CONNECTION_TIMEOUT_MS, fetchBuddyRpc } from "../client/src/lib/askBuddyTransport";
import { buildAttachmentDirectQuestionPrompt, buildAttachmentFollowUpPrompt, buildBuddyResponseSizeInstruction, buildCrossTeamDependencyPrompt } from "./platformContext";

const page = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
const router = readFileSync("server/routers.ts", "utf8");
const transport = readFileSync("client/src/main.tsx", "utf8");

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Buddy responsiveness without replacing AI reasoning", () => {
  it("uses five compact dependency fields in concise mode but preserves all eight in detailed mode", () => {
    for (const makePrompt of [
      (depth: "concise" | "detailed") => buildAttachmentDirectQuestionPrompt("Which dependencies?", depth),
      (depth: "concise" | "detailed") => buildAttachmentFollowUpPrompt("Which dependencies?", depth),
      (depth: "concise" | "detailed") => buildCrossTeamDependencyPrompt({ question: "State Apportionment dependencies", analysisDepth: depth }),
    ]) {
      expect(makePrompt("concise")).toContain("Dependency | Related work item | Proposed responsible team | Required deliverable | Classification");
      expect(makePrompt("concise")).not.toContain("Development or test impact | Classification | Sequencing recommendation");
      expect(makePrompt("detailed")).toContain("Development or test impact | Classification | Sequencing recommendation");
      expect(makePrompt("concise")).toContain("only with direct blocking evidence");
      expect(makePrompt("concise")).toContain("Proposed — validate:");
    }
  });

  it("requests shorter visible answers without truncating reasoning or full assessments", () => {
    expect(buildBuddyResponseSizeInstruction("concise", false)).toContain("150–220 words");
    expect(buildBuddyResponseSizeInstruction("concise", false)).toContain("Do not reduce evidence checks, reasoning, or confirmation boundaries");
    expect(buildBuddyResponseSizeInstruction("concise", true)).toContain("Complete every required assessment section");
    expect(buildBuddyResponseSizeInstruction("concise", true)).not.toContain("150–220");
    expect(router).toContain('reasoning: { effort: "low" }');
    expect(router).toContain("hasCompleteDocumentAnalysis(responseText)");
    expect(router).toContain("buildBuddyResponseSizeInstruction(documentAnalysisDepth, fullDocumentAssessmentMode)");
    expect(page).toContain('useState<"concise" | "detailed">("concise")');
  });

  it("covers upload and answer waiting with real elapsed time and blocks concurrent sends", () => {
    expect(page).toContain("requestBusyRef.current && !options?.attachmentArtifactId");
    expect(page).toContain("if (requestBusyRef.current) return;");
    expect(page).toContain("Elapsed time includes upload and analysis");
    expect(page).toContain("Transferring the file before AI analysis begins.");
    expect(page).toContain("performance.now() - startedAt");
    expect(page).not.toContain("Math.min(92");
    expect(page).not.toContain("up to 30 seconds");
    expect(transport).toContain("return fetchBuddyRpc(input,");
    expect(router).toContain("rememberBuddyScreenshot(stored.key, preparedRecord.imageMimeType, buffer)");
  });

  it("preserves valid JSON, credentials and parent cancellation through the tRPC fetch hook", async () => {
    const mockFetch = vi.fn(async () => new Response('{"result":{"data":"answer"}}', { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", mockFetch);
    const signal = new AbortController().signal;
    const response = await fetchBuddyRpc("/api/trpc/askBuddy.chat", { method: "POST", credentials: "include", signal });
    expect(await response.json()).toEqual({ result: { data: "answer" } });
    expect(mockFetch.mock.calls[0]).toBeTruthy();
  });

  it("does not impose Buddy deadlines on Meeting Recaps or other tRPC operations", async () => {
    const response = new Response("ok");
    const mockFetch = vi.fn(async () => response);
    vi.stubGlobal("fetch", mockFetch);
    const init = { credentials: "include" as const };
    expect(await fetchBuddyRpc("/api/trpc/tdcMeetingRecaps.generateEmailDraft", init)).toBe(response);
    expect(mockFetch).toHaveBeenCalledWith("/api/trpc/tdcMeetingRecaps.generateEmailDraft", init);
  });

  it.each([
    ["chat", BUDDY_CHAT_CONNECTION_TIMEOUT_MS],
    ["uploadAttachment", BUDDY_UPLOAD_CONNECTION_TIMEOUT_MS],
  ] as const)("releases a stalled %s request instead of waiting indefinitely", async (operation, timeout) => {
    vi.useFakeTimers();
    const mockFetch = vi.fn((_url, _init) => new Promise<Response>(() => undefined));
    vi.stubGlobal("fetch", mockFetch);
    const response = fetchBuddyRpc(`/api/trpc/askBuddy.${operation}`);
    const rejection = expect(response).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(timeout);
    await rejection;
    expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the connection deadline through a stalled response body", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async () => ({ arrayBuffer: () => new Promise(() => undefined) })));
    const rejection = expect(fetchBuddyRpc("/api/trpc/askBuddy.chat")).rejects.toThrow("connection timed out");
    await vi.advanceTimersByTimeAsync(BUDDY_CHAT_CONNECTION_TIMEOUT_MS);
    await rejection;
  });

  it("explains preview HTML responses rather than exposing a JSON parsing error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<!doctype html>", { headers: { "content-type": "text/html" } })));
    await expect(fetchBuddyRpc("/api/trpc/askBuddy.chat")).rejects.toThrow("preview connection page");
  });

  it("forwards caller cancellation and clears the deadline", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(new Error("caller cancelled")), { once: true });
    })));
    const controller = new AbortController();
    const rejection = expect(fetchBuddyRpc("/api/trpc/askBuddy.chat", { signal: controller.signal })).rejects.toThrow("caller cancelled");
    controller.abort();
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});

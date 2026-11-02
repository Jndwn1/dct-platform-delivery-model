import { File as NodeFile } from "node:buffer";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ rows: [] as any[], inserts: [] as any[] }));
vi.mock("./db", () => ({ getDb: vi.fn(async () => ({
  select: () => ({ from: () => ({ where: () => ({ limit: async () => mock.rows }) }) }),
  insert: () => ({ values: async (values: any) => { mock.inserts.push(values); return [{ insertId: 42 }]; } }),
})) }));
vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ key: "ask-buddy/test.png", url: "/manus-storage/ask-buddy/test.png" })),
  storageGet: vi.fn(async () => ({ key: "ask-buddy/test.png", url: "https://storage.example.test/test.png" })),
}));
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: "The visible spike is a potential dependency; the cropped acceptance criteria are unknown." }, finish_reason: "stop" }] })),
  LLMRequestTimeoutError: class LLMRequestTimeoutError extends Error {},
}));

import { appRouter } from "./routers";
import { invokeLLM } from "./_core/llm";
import { storageGet, storagePut } from "./storage";
import type { TrpcContext } from "./_core/context";
import { parseAskBuddyAttachmentRecord, prepareAskBuddyAttachment } from "./askBuddyAttachmentEngine";
import {
  BUDDY_SCREENSHOT_CACHE_MAX_ENTRIES,
  BUDDY_SCREENSHOT_CACHE_TTL_MS,
  BUDDY_SCREENSHOT_INSTRUCTION,
  MAX_BUDDY_SCREENSHOT_BYTES,
  clearBuddyScreenshotCache,
  detectBuddyImageMimeType,
  loadBuddyScreenshot,
  rememberBuddyScreenshot,
  type BuddyImageMimeType,
} from "./askBuddyScreenshot";
import { getPastedBuddyScreenshot, isBuddyScreenshot } from "../client/src/lib/askBuddyScreenshotInput";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+oUAAAAASUVORK5CYII=", "base64");
const ctx = { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;
const imageArtifact = () => ({
  id: 42, fileName: "ado-screenshot.png", versionLabel: "Test", mimeType: "image/png", storageUrl: "/manus-storage/ask-buddy/test.png", createdAt: new Date(),
  fieldsJson: JSON.stringify({ kind: "ask-buddy-attachment-v1", format: "Screenshot / image", analysisStatus: "Image Ready", textExcerpt: "", note: "Visible content only", imageMimeType: "image/png", storageKey: "ask-buddy/test.png" }),
});

beforeEach(() => {
  vi.clearAllMocks();
  clearBuddyScreenshotCache();
  mock.rows = [imageArtifact()]; mock.inserts = [];
  vi.stubGlobal("fetch", vi.fn(async () => new Response(PNG, { headers: { "content-type": "image/png" } })));
  vi.stubGlobal("File", NodeFile);
});
afterEach(() => {
  clearBuddyScreenshotCache();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Ask Buddy screenshot support", () => {
  it("recognizes valid PNG bytes and stores metadata, never pixels or extracted assumptions", async () => {
    const prepared = await prepareAskBuddyAttachment(PNG, "screen.png", "application/octet-stream", "Test");
    expect(prepared.analysisStatus).toBe("Image Ready");
    expect(parseAskBuddyAttachmentRecord(prepared.fieldsJson)).toMatchObject({ imageMimeType: "image/png", textExcerpt: "" });
    expect(prepared.fieldsJson).not.toContain("base64");
    expect(prepared.fieldsJson).not.toContain(PNG.toString("base64"));
  });
  it("recognizes JPEG and WebP signatures and rejects spoofed image labels", async () => {
    expect(detectBuddyImageMimeType(Buffer.from([255, 216, 255, 224]))).toBe("image/jpeg");
    expect(detectBuddyImageMimeType(Buffer.from("RIFF0000WEBPVP8 "))).toBe("image/webp");
    await expect(prepareAskBuddyAttachment(Buffer.from("<svg>not a PNG</svg>"), "bad.png", "image/png", "Test")).rejects.toThrow("could not be verified");
  });
  it("stores the verified MIME and returned storage key without a last-row race", async () => {
    await appRouter.createCaller(ctx).askBuddy.uploadAttachment({ fileName: "screen.png", mimeType: "text/plain", versionLabel: "Test", fileBase64: PNG.toString("base64") });
    expect(storagePut).toHaveBeenCalledWith(expect.any(String), PNG, "image/png");
    const inserted = mock.inserts[0];
    expect(JSON.parse(inserted.fieldsJson).storageKey).toBe("ask-buddy/test.png");
    expect(inserted.fieldsJson).not.toContain(PNG.toString("base64"));
  });
  it("rejects malformed base64 before storage", async () => {
    await expect(appRouter.createCaller(ctx).askBuddy.uploadAttachment({ fileName: "screen.png", mimeType: "image/png", versionLabel: "Test", fileBase64: "!!!=" })).rejects.toThrow("encoding is invalid");
    expect(storagePut).not.toHaveBeenCalled();
  });
  it("sends one actual image part with the latest question to the existing vision model", async () => {
    const result = await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "Which visible ADO spike should TDC track?" }], attachmentArtifactId: 42 });
    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    expect(call.model).toBe("gpt-6-luna");
    const content = call.messages[call.messages.length - 1].content as any[];
    expect(content[0]).toEqual({ type: "text", text: "Which visible ADO spike should TDC track?" });
    expect(content[1]).toMatchObject({ type: "image_url", image_url: { url: `data:image/png;base64,${PNG.toString("base64")}`, detail: "high" } });
    expect(call.messages[0].content).toContain("not a live ADO query");
    expect(call.messages[0].content).not.toContain(PNG.toString("base64"));
    expect(result.generationStatus).toBe("completed");
    expect(result.documentAnalysis).toMatchObject({ artifactId: 42, mode: "targeted", complete: true });
    expect(result.text).toContain("no live Azure DevOps connection");
    expect(JSON.stringify(mock.inserts)).not.toContain(PNG.toString("base64"));
  });
  it("reloads the registered image for a direct follow-up without a six-section report", async () => {
    const result = await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "Which acceptance criteria are visible?" }], documentContext: { artifactId: 42, fileName: "ado-screenshot.png" } });
    expect(storageGet).toHaveBeenCalledWith("ask-buddy/test.png");
    expect(result.documentAnalysis).toMatchObject({ mode: "follow-up", complete: true });
  });
  it("reuses retained pixels for a follow-up but invokes the model for each new question", async () => {
    const caller = appRouter.createCaller(ctx);
    await caller.askBuddy.chat({ messages: [{ role: "user", content: "Which ADO spike is visible?" }], attachmentArtifactId: 42 });
    await caller.askBuddy.chat({ messages: [{ role: "user", content: "Which acceptance criteria are visible?" }], documentContext: { artifactId: 42, fileName: "ado-screenshot.png" } });
    expect(storageGet).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(invokeLLM).toHaveBeenCalledTimes(2);
    const followUpCall = vi.mocked(invokeLLM).mock.calls[1][0];
    const followUpContent = followUpCall.messages[followUpCall.messages.length - 1].content as any[];
    expect(followUpContent[0]).toEqual({ type: "text", text: "Which acceptance criteria are visible?" });
    expect(followUpContent[1]).toEqual({ type: "image_url", image_url: { url: `data:image/png;base64,${PNG.toString("base64")}`, detail: "high" } });
  });
  it("does not call the AI or claim completion when retained image bytes are invalid", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not image pixels")));
    const result = await appRouter.createCaller(ctx).askBuddy.chat({ messages: [{ role: "user", content: "Read this screenshot" }], attachmentArtifactId: 42 });
    expect(invokeLLM).not.toHaveBeenCalled();
    expect(result.generationStatus).toBe("error");
    expect(result.documentAnalysis?.complete).toBe(false);
    expect(result.text).toContain("No visual finding has been inferred");
  });
  it("rejects unregistered storage references and excessive response sizes", async () => {
    await expect(loadBuddyScreenshot("../external.png", "image/png")).rejects.toThrow("invalid");
    expect(storageGet).not.toHaveBeenCalled();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(PNG, { headers: { "content-length": String(11 * 1024 * 1024) } })));
    await expect(loadBuddyScreenshot("ask-buddy/test.png", "image/png")).rejects.toThrow("10 MB");
  });
  it("supports clipboard images but leaves text and URL paste alone", () => {
    const image = new NodeFile([PNG], "image.png", { type: "image/png" }) as unknown as File;
    const pasted = getPastedBuddyScreenshot([{ kind: "file", type: "image/png", getAsFile: () => image } as DataTransferItem]);
    expect(isBuddyScreenshot(pasted)).toBe(true);
    expect(pasted?.name).toMatch(/^screenshot-.*\.png$/);
    expect(getPastedBuddyScreenshot([{ kind: "string", type: "text/plain" } as DataTransferItem])).toBeNull();
    expect(getPastedBuddyScreenshot([{ kind: "file", type: "image/svg+xml" } as DataTransferItem])).toBeNull();
  });
  it("provides preview/removal and forbids hidden screenshot or live ADO claims", () => {
    const page = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
    expect(page).toContain("onPaste={handleScreenshotPaste}");
    expect(page).toContain('alt="Attached screenshot preview"');
    expect(page).toContain('aria-label="Remove attached file"');
    expect(page).toContain("URL.revokeObjectURL(url)");
    expect(page).toContain("Ctrl+V / Cmd+V");
    expect(BUDDY_SCREENSHOT_INSTRUCTION).toContain("cropped, missing, or unreadable");
    expect(BUDDY_SCREENSHOT_INSTRUCTION).toContain("do not invent hidden descriptions");
  });
});

describe("Ask Buddy validated screenshot cache", () => {
  const expectedImage = (bytes = PNG, mimeType = "image/png") => ({
    type: "image_url",
    image_url: { url: `data:${mimeType};base64,${bytes.toString("base64")}`, detail: "high" },
  });

  it("uses upload-seeded original pixels without storage lookup or download", async () => {
    const uploadedBytes = Buffer.from(PNG);
    rememberBuddyScreenshot("ask-buddy/seed.png", "image/png", uploadedBytes);
    uploadedBytes.fill(0);

    const first = await loadBuddyScreenshot("ask-buddy/seed.png", "image/png");
    expect(first).toEqual(expectedImage());
    first.image_url.url = "caller mutation";
    first.image_url.detail = "low";
    const followUp = await loadBuddyScreenshot("ask-buddy/seed.png", "image/png");
    expect(followUp).toEqual(expectedImage());
    expect(followUp).not.toBe(first);
    expect(followUp.image_url).not.toBe(first.image_url);
    expect(storageGet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("downloads a retained image once and reuses the exact high-detail pixels on follow-ups", async () => {
    const first = await loadBuddyScreenshot("ask-buddy/follow-up.png", "image/png");
    const followUp = await loadBuddyScreenshot("ask-buddy/follow-up.png", "image/png");
    expect(first).toEqual(expectedImage());
    expect(followUp).toEqual(first);
    expect(followUp.image_url).not.toBe(first.image_url);
    expect(storageGet).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("expires at the fixed TTL even when the screenshot was recently reused", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1_000);
    await loadBuddyScreenshot("ask-buddy/expiry.png", "image/png");
    clock.mockReturnValue(1_000 + BUDDY_SCREENSHOT_CACHE_TTL_MS - 1);
    await loadBuddyScreenshot("ask-buddy/expiry.png", "image/png");
    expect(fetch).toHaveBeenCalledTimes(1);

    clock.mockReturnValue(1_000 + BUDDY_SCREENSHOT_CACHE_TTL_MS);
    expect(await loadBuddyScreenshot("ask-buddy/expiry.png", "image/png")).toEqual(expectedImage());
    expect(storageGet).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("expires upload-seeded entries as well", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1_000);
    rememberBuddyScreenshot("ask-buddy/seed-expiry.png", "image/png", PNG);
    clock.mockReturnValue(1_000 + BUDDY_SCREENSHOT_CACHE_TTL_MS);
    expect(await loadBuddyScreenshot("ask-buddy/seed-expiry.png", "image/png")).toEqual(expectedImage());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("bounds entry count and evicts the least recently used screenshot", async () => {
    for (let index = 0; index < BUDDY_SCREENSHOT_CACHE_MAX_ENTRIES; index++) {
      rememberBuddyScreenshot(`ask-buddy/entry-${index}.png`, "image/png", PNG);
    }
    await loadBuddyScreenshot("ask-buddy/entry-0.png", "image/png");
    rememberBuddyScreenshot("ask-buddy/entry-new.png", "image/png", PNG);
    await loadBuddyScreenshot("ask-buddy/entry-0.png", "image/png");
    await loadBuddyScreenshot("ask-buddy/entry-new.png", "image/png");
    expect(fetch).not.toHaveBeenCalled();

    await loadBuddyScreenshot("ask-buddy/entry-1.png", "image/png");
    expect(storageGet).toHaveBeenCalledTimes(1);
    expect(storageGet).toHaveBeenCalledWith("ask-buddy/entry-1.png");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("bounds the retained base64 payload even below the entry-count limit", async () => {
    const largePng = Buffer.alloc(8 * 1024 * 1024);
    PNG.copy(largePng);
    rememberBuddyScreenshot("ask-buddy/large-first.png", "image/png", largePng);
    rememberBuddyScreenshot("ask-buddy/large-second.png", "image/png", largePng);
    expect(await loadBuddyScreenshot("ask-buddy/large-second.png", "image/png")).toEqual(expectedImage(largePng));
    expect(fetch).not.toHaveBeenCalled();

    expect(await loadBuddyScreenshot("ask-buddy/large-first.png", "image/png")).toEqual(expectedImage());
    expect(storageGet).toHaveBeenCalledTimes(1);
    expect(storageGet).toHaveBeenCalledWith("ask-buddy/large-first.png");
  });

  it.each(["../external.png", "ask-buddy/../bad.png", "ask-buddy/a?b", "ask-buddy/a#b", "ask-buddy/a\\b", "ask-buddy/", "https://example.test/a.png"])("rejects invalid key %s before a lookup or seed", async (key) => {
    rememberBuddyScreenshot("ask-buddy/valid.png", "image/png", PNG);
    expect(() => rememberBuddyScreenshot(key, "image/png", PNG)).toThrow("invalid");
    await expect(loadBuddyScreenshot(key, "image/png")).rejects.toThrow("invalid");
    expect(await loadBuddyScreenshot("ask-buddy/valid.png", "image/png")).toEqual(expectedImage());
    expect(storageGet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["image/svg+xml", "image/PNG", "text/plain", "", undefined])("rejects invalid MIME %s before a lookup or seed", async (invalidMime) => {
    rememberBuddyScreenshot("ask-buddy/mime.png", "image/png", PNG);
    const mimeType = invalidMime as BuddyImageMimeType;
    expect(() => rememberBuddyScreenshot("ask-buddy/mime.png", mimeType, PNG)).toThrow("could not be verified");
    await expect(loadBuddyScreenshot("ask-buddy/mime.png", mimeType)).rejects.toThrow("could not be verified");
    expect(await loadBuddyScreenshot("ask-buddy/mime.png", "image/png")).toEqual(expectedImage());
    expect(storageGet).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps cached MIME variants separate and never serves a cached PNG for an expected JPEG", async () => {
    rememberBuddyScreenshot("ask-buddy/mime.png", "image/png", PNG);
    await expect(loadBuddyScreenshot("ask-buddy/mime.png", "image/jpeg")).rejects.toThrow("could not be verified");
    const jpeg = Buffer.from([255, 216, 255, 224]);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(jpeg));
    expect(await loadBuddyScreenshot("ask-buddy/mime.png", "image/jpeg")).toEqual(expectedImage(jpeg, "image/jpeg"));
    expect(await loadBuddyScreenshot("ask-buddy/mime.png", "image/png")).toEqual(expectedImage());
    expect(await loadBuddyScreenshot("ask-buddy/mime.png", "image/jpeg")).toEqual(expectedImage(jpeg, "image/jpeg"));
    expect(storageGet).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects empty, invalid, mismatched, and oversized seed bytes without replacing valid pixels", async () => {
    rememberBuddyScreenshot("ask-buddy/valid.png", "image/png", PNG);
    for (const bytes of [Buffer.alloc(0), Buffer.from("not image pixels"), Buffer.from([255, 216, 255, 224])]) {
      expect(() => rememberBuddyScreenshot("ask-buddy/valid.png", "image/png", bytes)).toThrow("could not be verified");
    }
    const oversized = Buffer.alloc(MAX_BUDDY_SCREENSHOT_BYTES + 1);
    PNG.copy(oversized);
    expect(() => rememberBuddyScreenshot("ask-buddy/valid.png", "image/png", oversized)).toThrow("10 MB");
    expect(await loadBuddyScreenshot("ask-buddy/valid.png", "image/png")).toEqual(expectedImage());
    expect(fetch).not.toHaveBeenCalled();
  });

  it("never caches validation or download failures", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response("not image pixels"))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockRejectedValueOnce(new Error("network failure"));
    await expect(loadBuddyScreenshot("ask-buddy/retry.png", "image/png")).rejects.toThrow("could not be verified");
    await expect(loadBuddyScreenshot("ask-buddy/retry.png", "image/png")).rejects.toThrow("could not be read");
    await expect(loadBuddyScreenshot("ask-buddy/retry.png", "image/png")).rejects.toThrow("network failure");
    expect(await loadBuddyScreenshot("ask-buddy/retry.png", "image/png")).toEqual(expectedImage());
    await loadBuddyScreenshot("ask-buddy/retry.png", "image/png");
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(storageGet).toHaveBeenCalledTimes(4);
  });

  it("rejects oversized streamed downloads without a content length and does not cache them", async () => {
    const oversized = Buffer.alloc(MAX_BUDDY_SCREENSHOT_BYTES + 1);
    PNG.copy(oversized);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(oversized));
    await expect(loadBuddyScreenshot("ask-buddy/oversized.png", "image/png")).rejects.toThrow("10 MB");
    expect(await loadBuddyScreenshot("ask-buddy/oversized.png", "image/png")).toEqual(expectedImage());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("can clear seeded payloads for test isolation", async () => {
    rememberBuddyScreenshot("ask-buddy/clear.png", "image/png", PNG);
    clearBuddyScreenshotCache();
    expect(await loadBuddyScreenshot("ask-buddy/clear.png", "image/png")).toEqual(expectedImage());
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

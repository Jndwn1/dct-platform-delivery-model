import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTableConfig } from "drizzle-orm/mysql-core";
import type { TrpcContext } from "./_core/context";
import { sprintCloseoutSources } from "../drizzle/schema";
import { CLOSEOUT_MAX_FILE_BYTES, validateCloseoutFile } from "../shared/sprintCloseoutSources";
const state = vi.hoisted(() => ({ results: [] as unknown[][], available: true, insert: vi.fn(), where: vi.fn() }));
vi.mock("./db", () => ({ getDb: vi.fn(async () => state.available ? {
  select: () => {
    const rows = state.results.shift() ?? [];
    const chain = { from: () => chain, where: (condition: unknown) => { state.where(condition); return chain; }, orderBy: () => chain, groupBy: () => chain, limit: () => chain, then: (yes: any, no: any) => Promise.resolve(rows).then(yes, no) };
    return chain;
  }, insert: () => ({ values: state.insert }),
} : null) }));
vi.mock("./storage", () => ({ storagePut: vi.fn(async () => ({ key: "test-key", url: "/manus-storage/test-key" })) }));
import { storagePut } from "./storage";
import { closeoutUploadInput, decodeCloseoutUpload, sprintCloseoutSourcesRouter } from "./sprintCloseoutSources";
const row = { id: 101, reportingPeriod: "QA Validation Closeout", category: "metrics", fileName: "metrics.csv", mimeType: "text/csv", sizeBytes: 11, sha256: "source-hash", storageKey: "test-key", storageUrl: "/manus-storage/test-key", uploadedBy: "Test BA", createdAtMs: 1234567890000 };
const input = { reportingPeriod: row.reportingPeriod, category: "metrics" as const, fileName: row.fileName, fileBase64: Buffer.from("total,done\n").toString("base64") };
const caller = (authenticated = true) => sprintCloseoutSourcesRouter.createCaller({ user: authenticated ? { id: 1, openId: "test", name: "Test BA" } : null, req: {}, res: {} } as TrpcContext);
beforeEach(() => { state.results = []; state.available = true; state.insert.mockReset().mockResolvedValue([{ insertId: 101 }]); state.where.mockReset(); vi.mocked(storagePut).mockReset().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }); });
describe("closeout file source intake", () => {
  it("supports the existing workspace sign-in without forcing a second OAuth login or claiming verified identity", async () => {
    expect(await caller(false).periods()).toEqual([]);
    expect(await caller(false).list({ reportingPeriod: input.reportingPeriod })).toEqual([]);
    state.results = [[], [{ ...row, uploadedBy: "Not server-verified" }]];
    const saved = await caller(false).upload(input);
    expect(saved.uploadedBy).toBe("Not server-verified");
    expect(state.insert).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: "Not server-verified" }));
  });
  it("stores bytes externally and metadata durably, returning no inferred validation", async () => {
    state.results = [[], [row]];
    const saved = await caller().upload(input);
    expect(saved.id).toBe(101);
    expect(storagePut).toHaveBeenCalledWith(expect.stringMatching(/^sprint-closeout\/[\w-]+\/metrics.csv$/), Buffer.from("total,done\n"), "text/csv");
    expect(state.insert).toHaveBeenCalledWith(expect.objectContaining({ reportingPeriod: input.reportingPeriod, category: "metrics", uploadedBy: "Test BA", storageKey: "test-key", sizeBytes: 11, createdAtMs: expect.any(Number) }));
    expect(state.insert.mock.calls[0][0]).not.toHaveProperty("fileBase64");
    expect(saved).not.toHaveProperty("sha256");
    expect(saved).not.toHaveProperty("storageKey");
    expect(saved).not.toHaveProperty("approved");
    expect(saved).not.toHaveProperty("validated");
  });
  it("does not create duplicates when the same source is re-uploaded", async () => {
    state.results = [[row]];
    expect((await caller().upload(input)).id).toBe(101);
    expect(storagePut).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });
  it("handles a simultaneous duplicate using the persisted identity constraint", async () => {
    state.results = [[], [row]];
    state.insert.mockRejectedValueOnce(new Error("duplicate"));
    expect((await caller().upload(input)).id).toBe(101);
    expect(getTableConfig(sprintCloseoutSources).indexes[0].config.unique).toBe(true);
    expect(getTableConfig(sprintCloseoutSources).indexes[0].config.columns.map(c => (c as any).name)).toEqual(["reportingPeriod", "category", "sha256"]);
  });
  it("returns only selected-period files and retains saved metadata for refresh", async () => {
    state.results = [[row]];
    const sources = await caller().list({ reportingPeriod: "QA Validation Closeout" });
    expect(sources).toHaveLength(1);
    expect(sources[0].storageUrl).toBe("/manus-storage/test-key");
    expect(state.where).toHaveBeenCalledTimes(1);
  });
  it("lists available periods without choosing a baseline automatically", async () => {
    state.results = [[{ reportingPeriod: "Period A", latest: 20 }, { reportingPeriod: "Period B", latest: 10 }]];
    expect(await caller().periods()).toEqual(["Period A", "Period B"]);
    expect(state.insert).not.toHaveBeenCalled();
  });
  it("preserves source status as unknown when the store is unavailable", async () => {
    state.available = false;
    await expect(caller().list({ reportingPeriod: "Period A" })).rejects.toThrow("unavailable");
    await expect(caller().upload(input)).rejects.toThrow("unavailable");
    expect(storagePut).not.toHaveBeenCalled();
  });
  it("does not report registration success if storage fails", async () => {
    vi.mocked(storagePut).mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(caller().upload(input)).rejects.toThrow();
    expect(state.insert).not.toHaveBeenCalled();
  });
  it("validates category and reporting label before sending any bytes", async () => {
    await expect(caller().upload({ ...input, reportingPeriod: " " })).rejects.toThrow();
    await expect(caller().upload({ ...input, category: "approved" as any })).rejects.toThrow();
    expect(storagePut).not.toHaveBeenCalled();
    expect(closeoutUploadInput.parse({ ...input, reportingPeriod: "  PI   X  Sprint  Y " }).reportingPeriod).toBe("PI X Sprint Y");
  });
  it("rejects malformed base64, empty, unsupported and mismatched source types", () => {
    for (const text of ["abc", "!!!!", "a==="]) expect(() => decodeCloseoutUpload(text, "metrics.csv", "metrics")).toThrow();
    expect(validateCloseoutFile("metrics.csv", 0, "metrics")).toContain("Empty");
    expect(() => decodeCloseoutUpload(input.fileBase64, "script.html", "metrics")).toThrow("Use PNG");
    expect(() => decodeCloseoutUpload(input.fileBase64, "fake.png", "metrics")).toThrow("does not match");
  });
  it("uses the 10 MB boundary and original PNG-only template categories", () => {
    expect(validateCloseoutFile("data.csv", CLOSEOUT_MAX_FILE_BYTES, "metrics")).toBeNull();
    expect(validateCloseoutFile("data.csv", CLOSEOUT_MAX_FILE_BYTES + 1, "metrics")).toContain("10 MB");
    expect(() => closeoutUploadInput.parse({ ...input, fileBase64: "A".repeat(Math.ceil(CLOSEOUT_MAX_FILE_BYTES / 3) * 4 + 4) })).toThrow();
    expect(validateCloseoutFile("reference.jpg", 100, "template-1")).toContain("PNG");
    expect(decodeCloseoutUpload(Buffer.from("89504e470d0a1a0a", "hex").toString("base64"), "template.png", "template-1").mimeType).toBe("image/png");
  });
});

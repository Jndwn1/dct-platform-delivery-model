import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { CLOSEOUT_MAX_FILE_BYTES } from "../shared/sprintCloseoutSources";

// Lightweight hook harness: exercise the component's event handlers without adding a DOM dependency.
const harness = vi.hoisted(() => ({
  slots: [] as unknown[], cursor: 0,
  list: { data: undefined as any, isLoading: false, isError: false, isPlaceholderData: false, refetch: vi.fn() },
  periods: { data: [] as string[], isLoading: false, isError: false, refetch: vi.fn() },
  query: vi.fn(), mutate: vi.fn(), setData: vi.fn(), invalidateList: vi.fn(), invalidatePeriods: vi.fn(),
}));
vi.mock("react", async importOriginal => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual,
    useId: () => "intake",
    useMemo: (fn: () => unknown) => fn(),
    useEffect: (fn: () => void) => fn(),
    useState: (initial: unknown) => {
      const index = harness.cursor++;
      if (!(index in harness.slots)) harness.slots[index] = initial;
      return [harness.slots[index], (next: unknown) => {
        harness.slots[index] = typeof next === "function" ? next(harness.slots[index]) : next;
      }];
    },
    useRef: (initial: unknown) => {
      const index = harness.cursor++;
      if (!(index in harness.slots)) harness.slots[index] = { current: initial };
      return harness.slots[index];
    },
  };
});
vi.mock("@/lib/trpc", () => ({ trpc: {
  useUtils: () => ({ sprintCloseoutSources: {
    list: { setData: harness.setData, invalidate: harness.invalidateList },
    periods: { invalidate: harness.invalidatePeriods },
  } }),
  sprintCloseoutSources: {
    periods: { useQuery: () => harness.periods },
    list: { useQuery: (...args: unknown[]) => { harness.query(...args); return harness.list; } },
    upload: { useMutation: (options: unknown) => { expect(options).toEqual({ retry: false }); return { mutateAsync: harness.mutate, isPending: false }; } },
  },
} }));
import { SprintCloseoutUploads, readCloseoutFileBase64, safeCloseoutSourceUrl, transferCloseoutFiles } from "../client/src/components/SprintCloseoutUploads";

type Element = ReactElement<any>;
function descendants(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...descendants(element.props.children)];
}
function text(node: unknown): string {
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (node && typeof node === "object" && "props" in node) return text((node as Element).props.children);
  return typeof node === "string" || typeof node === "number" ? String(node) : "";
}
function render(callback = vi.fn()) {
  harness.cursor = 0;
  return SprintCloseoutUploads({ onIntakeState: callback });
}
function control(tree: Element, id: string) { return descendants(tree).find(element => element.props.id === `intake-${id}`)!; }
function button(tree: Element, label: string) { return descendants(tree).find(element => element.type === "button" && text(element).includes(label))!; }
function chooseLabelAndCategory(label = "  PI  8 / Sprint 6  ", category = "metrics") {
  control(render(), "label").props.onChange({ target: { value: label } });
  control(render(), "category").props.onChange({ target: { value: category } });
}
function chooseFiles(files: File[]) {
  control(render(), "files").props.onChange({ target: { files, value: "selected" } });
}
const row = (id: number, fileName: string, reportingPeriod = "PI 8 / Sprint 6") => ({
  id, fileName, reportingPeriod, category: "metrics", mimeType: "text/csv", sizeBytes: 4,
  storageUrl: `/manus-storage/${id}.csv`, uploadedBy: "Reviewer", createdAtMs: 1700000000000,
});

beforeEach(() => {
  vi.clearAllMocks();
  harness.slots = []; harness.cursor = 0;
  Object.assign(harness.list, { data: undefined, isLoading: false, isError: false, isPlaceholderData: false });
  Object.assign(harness.periods, { data: [], isLoading: false, isError: false });
  harness.invalidateList.mockResolvedValue(undefined); harness.invalidatePeriods.mockResolvedValue(undefined);
  harness.setData.mockImplementation((_input, updater) => { harness.list.data = updater(harness.list.data); });
  vi.stubGlobal("FileReader", class {
    result: string | null = null;
    onload?: () => void;
    async readAsDataURL(file: File) {
      this.result = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
      this.onload?.();
    }
  });
});

describe("closeout upload UI", () => {
  it("starts without an assumed closeout and allows entering a label while periods load", () => {
    harness.periods.isLoading = true;
    const callback = vi.fn(); const tree = render(callback);
    expect(control(tree, "label").props.value).toBe("");
    expect(control(tree, "label").props.maxLength).toBe(100);
    expect(control(tree, "label").props.disabled).toBe(false);
    expect(control(tree, "files").props).toMatchObject({ type: "file", multiple: true, disabled: true });
    expect(text(tree)).toContain("Choose files or drag and drop here");
    expect(text(tree)).toContain("Maximum 10 files per selection; 10 MB each.");
    expect(callback).toHaveBeenLastCalledWith({ loaded: false, count: 0, categories: [] });
    expect(harness.query).toHaveBeenLastCalledWith({ reportingPeriod: "" }, expect.objectContaining({ enabled: false }));
  });

  it("normalizes labels and reports only selected-period actual list data", () => {
    chooseLabelAndCategory();
    const callback = vi.fn(); harness.list.data = [row(1, "metrics.csv")];
    render(callback);
    expect(harness.query).toHaveBeenLastCalledWith({ reportingPeriod: "PI 8 / Sprint 6" }, expect.objectContaining({ enabled: true }));
    expect(callback).toHaveBeenLastCalledWith({ loaded: true, count: 1, categories: ["metrics"] });
    for (const flag of ["isLoading", "isError", "isPlaceholderData"] as const) {
      harness.list[flag] = true; render(callback);
      expect(callback).toHaveBeenLastCalledWith({ loaded: false, count: 0, categories: [] });
      harness.list[flag] = false;
    }
    control(render(), "label").props.onChange({ target: { value: "Another sprint" } });
    expect(text(render(callback))).not.toContain("metrics.csv");
    expect(callback).toHaveBeenLastCalledWith({ loaded: false, count: 0, categories: [] });
  });

  it("offers native multiple selection, PNG-only templates, size validation and queue removal", () => {
    chooseLabelAndCategory("New sprint", "template-1");
    expect(control(render(), "files").props.multiple).toBe(true);
    expect(control(render(), "files").props.accept).toBe(".png");
    chooseFiles([new File(["x"], "wrong.pdf"), new File(["x"], "template.png")]);
    expect(text(render())).toContain("must be PNG");
    expect(text(render())).toContain("template.png");
    button(render(), "Remove").props.onClick();
    expect(descendants(render()).some(item => item.props["aria-label"] === "Selected files")).toBe(false);
    chooseFiles([new File([new Uint8Array(CLOSEOUT_MAX_FILE_BYTES + 1)], "large.png")]);
    expect(text(render())).toContain("10 MB or smaller");
  });

  it("limits the combined queue to ten files and supports drag/drop", () => {
    chooseLabelAndCategory();
    const dropzone = descendants(render()).find(item => item.props.onDrop)!;
    const preventDefault = vi.fn();
    dropzone.props.onDrop({ preventDefault, dataTransfer: { files: [new File(["x"], "dropped.csv")] } });
    expect(preventDefault).toHaveBeenCalledOnce();
    chooseFiles(Array.from({ length: 10 }, (_, i) => new File(["x"], `${i}.csv`)));
    expect(text(render())).toContain("at most 10 files");
    expect(descendants(render()).filter(item => item.props["aria-label"]?.startsWith("Remove "))).toHaveLength(1);
  });

  it("retains failed files, names successes, deduplicates cache rows and never retries automatically", async () => {
    chooseLabelAndCategory(); harness.list.data = [row(1, "success.csv")];
    chooseFiles([new File(["data"], "success.csv"), new File(["data"], "failed.csv")]);
    harness.mutate.mockImplementation(async input => {
      if (input.fileName === "failed.csv") throw new Error("Network disconnected");
      return row(1, "success.csv");
    });
    button(render(), "Upload selected").props.onClick();
    button(render(), "Uploading").props.onClick(); // One-flight ref protects even stale events.
    expect(control(render(), "category").props.disabled).toBe(true);
    expect(control(render(), "label").props.disabled).toBe(true);
    expect(control(render(), "period").props.disabled).toBe(true);
    await vi.waitFor(() => expect(harness.invalidateList).toHaveBeenCalledOnce());
    expect(harness.mutate).toHaveBeenCalledTimes(2);
    expect(harness.mutate.mock.calls.map(call => call[0].fileName)).toEqual(["success.csv", "failed.csv"]);
    expect(harness.list.data).toHaveLength(1);
    expect(harness.invalidatePeriods).toHaveBeenCalledOnce();
    const tree = render();
    expect(text(tree)).toMatch(/Successfully registered\s+1\s*:\s*success\.csv/);
    expect(text(tree)).toContain("failed.csv: Network disconnected");
    expect(descendants(tree).filter(item => item.props["aria-label"]?.startsWith("Remove ")).map(item => item.props["aria-label"])).toEqual(["Remove failed.csv from selection"]);
    expect(control(tree, "label").props.value).toBe("  PI  8 / Sprint 6  ");
    expect(control(tree, "category").props.value).toBe("metrics");
    expect(button(tree, "Upload selected").props.disabled).toBe(false);
    const link = descendants(tree).find(item => item.type === "a")!;
    expect(link.props).toMatchObject({ target: "_blank", rel: "noopener noreferrer", href: "/manus-storage/1.csv" });
    expect(text(tree)).toContain("Uploaded — Needs Review");
    expect(text(tree)).toMatch(/Source role:\s+Current sprint metrics/);
  });

  it("shows a confirmed new file immediately but doesn't invent a complete intake before list loading finishes", async () => {
    chooseLabelAndCategory(); harness.list.isLoading = true;
    chooseFiles([new File(["data"], "new.csv")]); harness.mutate.mockResolvedValue(row(2, "new.csv"));
    button(render(), "Upload selected").props.onClick();
    await vi.waitFor(() => expect(harness.invalidateList).toHaveBeenCalledOnce());
    const callback = vi.fn(); expect(text(render(callback))).toContain("new.csv");
    expect(callback).toHaveBeenLastCalledWith({ loaded: false, count: 0, categories: [] });
    control(render(), "label").props.onChange({ target: { value: "Different closeout" } });
    expect(descendants(render()).filter(item => item.type === "a")).toHaveLength(0);
  });

  it("transfers sequentially with accurate stages and strips the FileReader data prefix", async () => {
    const files = [new File(["one"], "one.txt"), new File(["two"], "two.txt")];
    expect(await readCloseoutFileBase64(files[0])).toBe(Buffer.from("one").toString("base64"));
    let release!: (value: number) => void;
    const upload = vi.fn().mockImplementationOnce(() => new Promise<number>(resolve => { release = resolve; })).mockResolvedValueOnce(2);
    const stage = vi.fn(); const success = vi.fn(); const failure = vi.fn();
    const pending = transferCloseoutFiles(files, { upload, stage, success, failure });
    await vi.waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(stage).toHaveBeenLastCalledWith("Uploading 1/2: one.txt");
    release(1); await pending;
    expect(upload).toHaveBeenCalledTimes(2);
    expect(stage).toHaveBeenLastCalledWith("Uploading 2/2: two.txt");
    expect(success).toHaveBeenCalledTimes(2); expect(failure).not.toHaveBeenCalled();
  });

  it("rejects unsafe source URL schemes", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,evil", "//external.example", "\\evil.example"]) expect(safeCloseoutSourceUrl(url)).toBeUndefined();
    expect(safeCloseoutSourceUrl("https://example.com/source.pdf")).toBe("https://example.com/source.pdf");
    expect(safeCloseoutSourceUrl("/manus-storage/source.pdf")).toBe("/manus-storage/source.pdf");
  });
});

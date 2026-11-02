import { describe, expect, it, vi } from "vitest";
import { buildDeliveryPhaseInstruction, classifyDeliveryPage, DELIVERY_PHASE_CONTEXT } from "../client/src/lib/deliveryPhaseContext";
import { formatLivePageRows, loadBuddyLivePageEvidence, requestedLivePagePaths, LIVE_PAGE_RECORD_LIMIT } from "./askBuddyPageLiveEvidence";

describe("confirmed delivery phase context", () => {
  it("retains Jenniver's dates without inventing a UAT completion day or delivered Pilot", () => {
    expect(DELIVERY_PHASE_CONTEXT.mvp.deliveredOn).toBe("2026-09-26");
    expect(DELIVERY_PHASE_CONTEXT.pilot.deliveryDate).toBe("2026-12-16");
    const instruction = buildDeliveryPhaseInstruction();
    expect(instruction).toContain("UAT completed last week (exact day not supplied)");
    expect(instruction).toContain("Pilot is being built, not delivered");
    expect(instruction).toContain("do not rewrite recorded counts");
    expect(instruction).toContain("proposed diagrams");
  });
  it("separates Executive/Pilot pages from the delivered MVP reference baseline", () => {
    for (const path of ["/", "/post-pilot", "/post-pilot/roger-pilot-backlog", "/post-pilot/state-taxonomy-readiness", "/post-pilot/meeting-recaps"]) expect(classifyDeliveryPage(path)).toBe("Pilot");
    expect(classifyDeliveryPage("/architecture/visio")).toBe("MVP baseline");
    expect(classifyDeliveryPage("/uat-testing")).toBe("MVP baseline");
    expect(classifyDeliveryPage("/ask-buddy")).toBe("Assistant");
  });
});

describe("current retained page records", () => {
  it("does not read unrelated registries for a Pilot architecture question", () => {
    expect(requestedLivePagePaths("Explain Pilot architecture", ["/post-pilot"])).toEqual([]);
    expect(requestedLivePagePaths("Summarize the latest meeting recap", [])).toEqual(["/post-pilot/meeting-recaps"]);
    expect(requestedLivePagePaths("Show Pilot deployments", ["/post-pilot"])).toEqual(["/post-pilot"]);
    expect(requestedLivePagePaths("List QA releases", [])).toEqual(["/qa-deployment-registry"]);
  });
  it("keeps stored findings and statuses, excludes private configuration, and labels excerpts", () => {
    const content = formatLivePageRows("/post-pilot/meeting-recaps", [{ id: 3, keyFocusJson: '["Complete schema refactor"]', actionItemsJson: '["Review the API contract"]', emailStatus: "Reviewed", password: "not-for-evidence", transcriptText: "do not include the whole transcript", notes: "n".repeat(2_000) }]);
    expect(content).toContain("Complete schema refactor");
    expect(content).toContain("Review the API contract");
    expect(content).toContain("Reviewed");
    expect(content).not.toContain("not-for-evidence");
    expect(content).not.toContain("whole transcript");
    expect(content).toContain("field excerpt; later text omitted");
    expect(content).toContain("sample, not full-table metrics");
    expect(formatLivePageRows("/deployment-registry", [])).toContain("do not invent rows");
  });
  it("uses bounded read-only database queries and does not claim live ADO access", async () => {
    const limit = vi.fn().mockResolvedValue([{ id: 8, meetingDate: "2026-10-28", keyFocusJson: '["TDC V2"]' }]);
    const from = vi.fn().mockReturnValue({ orderBy: () => ({ limit }) });
    const db = { select: () => ({ from }) } as unknown as NonNullable<Parameters<typeof loadBuddyLivePageEvidence>[2]>;
    const evidence = await loadBuddyLivePageEvidence("latest meeting recap", [], db);
    expect(limit).toHaveBeenCalledWith(LIVE_PAGE_RECORD_LIMIT);
    expect(evidence).toContain("TDC V2");
    expect(evidence).toContain("not a live ADO query");
    expect(evidence).toContain("read only");
  });
  it("returns an explicit unavailable-data boundary instead of invented current values", async () => {
    expect(await loadBuddyLivePageEvidence("latest meeting recap", [], null)).toContain("do not invent current rows");
    expect(await loadBuddyLivePageEvidence("How do I facilitate a workshop?", [], null)).toBe("");
  });
});

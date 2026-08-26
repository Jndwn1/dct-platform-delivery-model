import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Delivery Highlights B31 placement", () => {
  it("lists B31 PDC and B31 TDC as active batch features while retaining the critical-path banner", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain('feature.id === "B31-PDC"');
    expect(source).toContain('feature.id === "B31-TDC"');
    expect(source).not.toContain('{ id: "B31-PDC", batchNumber');
    expect(source).not.toContain('{ id: "B31-TDC", batchNumber');
    expect(source).toContain("deliveryHighlightActiveBatchFeatures.length");
    expect(source).toContain("Critical Path — Must Land Before 9/21 Pilot");
    expect(source).not.toContain("🟣 Upcoming Milestones");
  });
});

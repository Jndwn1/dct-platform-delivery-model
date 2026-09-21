import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_DELIVERY_RECORDS } from "../client/src/contexts/BatchStatusContext";

describe("Delivery Highlights B31 placement", () => {
  it("lists only the still-active B31 PDC feature and retains the targeted critical-path banner", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const activeRecords = BATCH_DELIVERY_RECORDS.filter(record => record.sourceStatusLabel === "Active");

    expect(source).toContain('feature.id === "B31-PDC"');
    expect(source).toContain('feature.id === "B31-TDC"');
    expect(activeRecords.map(record => record.id)).toContain("B31-PDC");
    expect(activeRecords.map(record => record.id)).not.toContain("B31-TDC");
    expect(activeRecords.map(record => record.id)).not.toContain("B7");
    expect(activeRecords.map(record => record.id)).not.toContain("B42");
    expect(source).not.toContain('{ id: "B31-PDC", batchNumber');
    expect(source).not.toContain('{ id: "B31-TDC", batchNumber');
    expect(source).toContain("deliveryHighlightActiveBatchFeatures.length");
    expect(source).toContain("Critical Path — Must Land Before 9/21 Pilot");
    expect(source).toContain("Status: Active (ADO #1390014)");
    expect(source).toContain("B31 TDC data housing is closed.");
    expect(source).not.toContain("ADO #1390014, #1390267");
    expect(source).toContain('{ pi: "PI 2", status: "Done",        batch: "B7"');
    expect(source).toContain('{ pi: "PI 2", status: "Done",        batch: "B42"');
    expect(source).toContain('{ pi: "PI 3", status: "Done",        batch: "B31",  feat: "TDC"');
    expect(source).not.toContain("🟣 Upcoming Milestones");
  });
});

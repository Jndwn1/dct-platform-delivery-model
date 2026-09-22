import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_DELIVERY_RECORDS } from "../client/src/contexts/BatchStatusContext";

describe("Delivery Highlights active and closed workstreams", () => {
  it("shows exactly the two active workstreams and dynamically renders the three current-day closures", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const activeRecords = BATCH_DELIVERY_RECORDS.filter(record => record.sourceStatusLabel === "Active");

    expect(activeRecords.map(record => record.id).sort()).toEqual(["B45", "DEFECT-TRACKING"]);
    expect(activeRecords.map(record => record.featureName)).toEqual(expect.arrayContaining([
      "MVP Enhancements — Rule Logic Expression Table & Adjustment Subtype Domain Expansion",
      "Defect Tracking",
    ]));
    expect(activeRecords.map(record => record.id)).not.toContain("B28");
    expect(activeRecords.map(record => record.id)).not.toContain("B9A");
    expect(activeRecords.map(record => record.id)).not.toContain("ENV-MANAGEMENT");
    expect(source).toContain("Active ADO Workstreams");
    expect(source).toContain("Closed Today — {closedToday.length} Workstreams");
    expect(source).toContain("closedToday.map(item =>");
    expect(source).toContain("deliveryHighlightActiveBatchFeatures.length");
    expect(source).not.toContain("Post-Launch Follow-Up — Prior Year Data");
  });
});

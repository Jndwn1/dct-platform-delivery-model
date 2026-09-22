import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_DELIVERY_RECORDS } from "../client/src/contexts/BatchStatusContext";

describe("Delivery Highlights active and closed workstreams", () => {
  it("shows no active workstreams and dynamically renders the final current-day closures", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const activeRecords = BATCH_DELIVERY_RECORDS.filter(record => record.sourceStatusLabel === "Active");

    expect(activeRecords.map(record => record.id).sort()).toEqual([]);
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "DEFECT-TRACKING")?.sourceStatusLabel).toBe("Closed");
    expect(BATCH_DELIVERY_RECORDS.find(record => record.id === "B45")?.sourceStatusLabel).toBe("Closed");
    expect(activeRecords.map(record => record.id)).not.toContain("B28");
    expect(activeRecords.map(record => record.id)).not.toContain("B9A");
    expect(activeRecords.map(record => record.id)).not.toContain("ENV-MANAGEMENT");
    expect(source).toContain("Active ADO Workstreams");
    expect(source).toContain("Closed Today — {closedToday.length} Workstreams");
    expect(source).toContain("closedToday.map(item =>");
    expect(source).toContain("deliveryHighlightActiveBatchFeatures.length");
    expect(source).toContain("No active ADO workstreams remain. The MVP delivery feature set is complete.");
    expect(source).not.toContain("Post-Launch Follow-Up — Prior Year Data");
  });
});

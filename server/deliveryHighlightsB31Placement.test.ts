import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_DELIVERY_RECORDS } from "../client/src/contexts/BatchStatusContext";

describe("Delivery Highlights active and closed workstreams", () => {
  it("shows exactly the five user-confirmed active workstreams and the four current-day closures", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const activeRecords = BATCH_DELIVERY_RECORDS.filter(record => record.sourceStatusLabel === "Active");

    expect(activeRecords.map(record => record.id).sort()).toEqual(["B28", "B45", "B9A", "DEFECT-TRACKING", "ENV-MANAGEMENT"]);
    expect(activeRecords.map(record => record.featureName)).toEqual(expect.arrayContaining([
      "Batch 28 — Tax Workpaper & Provision Schedules",
      "Batch 9A — Data Gateway (IMS, CDS, DUO)",
      "MVP Enhancements — Rule Logic Expression Table & Adjustment Subtype Domain Expansion",
      "Defect Tracking",
      "Environment Management",
    ]));
    expect(activeRecords.map(record => record.id)).not.toContain("B10");
    expect(activeRecords.map(record => record.id)).not.toContain("B31-PDC");
    expect(source).toContain("Active ADO Workstreams");
    expect(source).toContain("Closed Today — 4 Workstreams");
    expect(source).toContain("B10 — Return Assembly, Filing & Lineage Closure");
    expect(source).toContain("B31 PDC — Legacy Tool Prior Year Ingestion & Housing");
    expect(source).toContain("Performance Testing");
    expect(source).toContain("DCT QA Workstream");
    expect(source).toContain("deliveryHighlightActiveBatchFeatures.length");
    expect(source).not.toContain("Post-Launch Follow-Up — Prior Year Data");
  });
});

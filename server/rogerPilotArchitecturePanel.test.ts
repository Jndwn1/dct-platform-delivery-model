import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createPi4PlanningCopy,
  PI4_ARCHITECTURE_FOCUS,
  PI4_ARCHITECTURE_QUICK_FLOW,
  PI4_LOGICAL_ARCHITECTURE_FLOW,
} from "../client/src/lib/pi4PlanningModel";

describe("PI4 Roger logical architecture panel", () => {
  it("uses the approved uploaded architecture diagram with a replace and expand experience", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/PI4PlanningWorkspace.tsx"), "utf8");

    expect(source).toContain('const APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM = "/manus-storage/image1_38887cda.png"');
    expect(source).toContain("Logical Architecture &amp; End-to-End Flow");
    expect(source).toContain("Roger Logical Architecture – PI4");
    expect(source).toContain("Replace diagram");
    expect(source).toContain("Expand diagram");
    expect(source).toContain("Restore approved");
    expect(source).toContain("accept=\"image/png,image/jpeg,image/webp\"");
    expect(source).toContain("Architecture reference");
  });

  it("keeps the supplied architecture flow, PI4 focus, quick flow, and ownership explanation available", () => {
    expect(PI4_LOGICAL_ARCHITECTURE_FLOW).toHaveLength(10);
    expect(PI4_LOGICAL_ARCHITECTURE_FLOW.map((item) => item.layer)).toEqual([
      "User / Roger Experience Layer",
      "PDC — Platform Data Layer",
      "PDC API / Gateway",
      "Orchestration Layer",
      "File Identification & Data Extraction",
      "Classification & Schema Mapping",
      "Taxonomy / Line Mapping",
      "Human-in-the-Loop Review",
      "TDC — Tax Domain Data Layer",
      "Downstream Tax Processing / Integrations",
    ]);
    expect(PI4_ARCHITECTURE_QUICK_FLOW).toBe("Roger → PDC → PDC API/Gateway → Orchestrator → Extraction & Classification → Schema/Taxonomy Mapping → User Review → TDC → Downstream Tax Processing");
    expect(PI4_ARCHITECTURE_FOCUS.map((item) => item.system)).toEqual(["PDC", "DCT / Gateway", "TDC", "Orchestrator", "Roger"]);

    const copiedText = createPi4PlanningCopy();
    expect(copiedText).toContain("Logical Architecture & End-to-End Flow");
    expect(copiedText).toContain("Human-in-the-Loop Review");
    expect(copiedText).toContain("Downstream Tax Processing / Integrations");
  });
});

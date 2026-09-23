import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State POC BA Discovery and Mapping Package", () => {
  it("keeps the BA requirements package on the existing State workspace", () => {
    const workspace = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");
    const packageSource = readFileSync(resolve(process.cwd(), "client/src/components/StatePocBaDiscoveryPackage.tsx"), "utf8");

    expect(workspace).toContain('import StatePocBaDiscoveryPackage from "@/components/StatePocBaDiscoveryPackage"');
    expect(workspace).toContain("<StatePocBaDiscoveryPackage />");
    expect(packageSource).toContain("POC BA Discovery & Mapping Package");
    expect(packageSource).toContain("The BA objective for the Roger → GoSystem POC");
    expect(packageSource).toContain("BA Deliverables for the POC");
    expect(packageSource).toContain("Minimum POC Input Package");
    expect(packageSource).toContain("Inbound Data Contract");
    expect(packageSource).toContain("Outbound Data Contract");
    expect(packageSource).toContain("Taxonomy Mapping Matrix");
    expect(packageSource).toContain("System Responsibility Matrix");
    expect(packageSource).toContain("POC Acceptance Criteria");
    expect(packageSource).toContain("Where the BA Gets the Requirements");
    expect(packageSource).toContain("Inbound Mapping — Current Known Candidate Fields");
    expect(packageSource).toContain("Outbound Mapping — Current Candidate Results");
    expect(packageSource).toContain("BA Discovery → POC-Ready Requirements");
    expect(packageSource).toContain("Known Concept — Detail TBD");
    expect(packageSource).toContain("Roger_GoSystem_POC_BA_Mapping_Template.xlsx");
    expect(packageSource).toContain("No workbook linked yet");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State POC BA Discovery and Mapping Package", () => {
  it("places the BA requirements package beneath the Pilot POC details", () => {
    const workspace = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");
    const postPilot = readFileSync(resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"), "utf8");
    const packageSource = readFileSync(resolve(process.cwd(), "client/src/components/StatePocBaDiscoveryPackage.tsx"), "utf8");

    expect(workspace).not.toContain('import StatePocBaDiscoveryPackage from "@/components/StatePocBaDiscoveryPackage"');
    expect(workspace).not.toContain("<StatePocBaDiscoveryPackage />");
    expect(postPilot).toContain('import StatePocBaDiscoveryPackage from "@/components/StatePocBaDiscoveryPackage"');
    expect(postPilot.indexOf("<StatePocBaDiscoveryPackage />")).toBeGreaterThan(postPilot.indexOf("<StateGoSystemPoc />"));
    expect(packageSource).toContain("POC BA Discovery & Mapping Package");
    expect(packageSource).toContain("The BA objective for the Roger → GoSystem POC");
    expect(packageSource).toContain(
      "State Data-Movement Working Session — Agenda & Readiness Gaps"
    );
    expect(packageSource).toContain(
      "Confirm target business process and initial apportionment scope"
    );
    expect(packageSource).toContain(
      "Review the three inbound / outbound data movements"
    );
    expect(packageSource).toContain(
      "Confirm required data elements and granularity"
    );
    expect(packageSource).toContain(
      "Tech Story 1433863: Define Data Type & Validation Standards for TDC → IMS → GoSystem Translation"
    );
    expect(packageSource).toContain(
      "Three Data Movements to Separate for Review"
    );
    expect(packageSource).toContain("Prior-year property-detail ingestion");
    expect(packageSource).toContain("State apportionment-detail export");
    expect(packageSource).toContain(
      "GoSystem calculated-value ingestion / return"
    );
    expect(packageSource).toContain("Pre-Session Inputs and Gaps to Close");
    expect(packageSource).toContain("Three distinct mapping materials");
    expect(packageSource).toContain("Initial IMS-usable data subset");
    expect(packageSource).toContain("Prior-year data behavior");
    expect(packageSource).toContain("completion is not assumed");
    expect(packageSource).toContain("Where the BA Gets the Requirements");
    expect(packageSource).toContain("Inbound Mapping — Current Known Candidate Fields");
    expect(packageSource).toContain("Outbound Mapping — Current Candidate Results");
    expect(packageSource).toContain("BA Discovery → POC-Ready Requirements");
    expect(packageSource).toContain('import ExecutiveProcessFlow, { type ExecutiveFlowStep } from "@/components/ExecutiveProcessFlow"');
    expect(packageSource).toContain("BA_DISCOVERY_FLOW_STEPS");
    expect(packageSource).toContain("BA discovery to POC-ready requirements executive process flow");
    expect(packageSource).toContain("A minimum POC package and validated inbound / outbound contracts");
    expect(packageSource).toContain("Known Concept — Detail TBD");
    expect(packageSource).toContain("Roger_GoSystem_POC_BA_Mapping_Template.xlsx");
    expect(packageSource).toContain("Roger_GoSystem_POC_BA_Mapping_Template_45aa60ff.xlsx");
    expect(packageSource).toContain("Open workbook");
    expect(packageSource).not.toContain("No workbook linked yet");
  });
});

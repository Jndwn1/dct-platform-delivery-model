import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PI4 State delivery readiness", () => {
  it("keeps the supplied State timeline, story-sizing assessment, dependencies, and scope on the State page", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");

    expect(source).toContain("State Delivery Readiness");
    expect(source).toContain("State filing / reporting metadata & source ingestion readiness");
    expect(source).toContain('label: "E2E QA", date: "Nov 3–10"');
    expect(source).toContain("S5 is outside the main UAT cycle");
    expect(source).toContain("State Story Readiness for PI 4");
    expect(source).toContain("1464780 – Persist the versioned Apportionment Context, results, approvals, and governed access");
    expect(source).toContain("Cross-Team Dependencies · Orchestration");
    expect(source).toContain("Cross-Team Dependencies · Roger UI");
    expect(source).toContain("PI 4 High-Level Scope");
  });
});

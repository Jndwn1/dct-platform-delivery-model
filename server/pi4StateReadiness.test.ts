import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PI4 State delivery readiness", () => {
  it("shows both approved State stories as refined and DCT-owned while retaining their planning and dependency context", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");

    expect(source).toContain("State Delivery Readiness");
    expect(source).toContain("State filing / reporting metadata & source ingestion readiness");
    expect(source).toContain('label: "E2E QA", date: "Nov 3–10"');
    expect(source).toContain("S5 is outside the main UAT cycle");
    expect(source).toContain("State Story Readiness for PI 4");
    expect(source).toContain("Current State Story Refinement &amp; Ownership");
    expect(source).toContain("Both approved State stories are refined and DCT-owned.");
    expect(source).toContain("1472734 – DCT Gateway — Compose State Return-Filing Response for Roger");
    expect(source).toContain("1471480 – DCT — Retrieve Return Structure Starting Context for a State Filer / Filing Group");
    expect(source).toContain("State Story Refinement &amp; Ownership");
    expect(source).toContain("Managed State Delivery Dependencies");
    expect(source).toContain("DCT Delivery Guardrails");
    expect(source).toContain("Ownership Decision");
    expect(source).toContain("✓ Refined · DCT owned");
    expect(source).toContain("PI4 sprint assignment remains pending the approved baseline");
    expect(source).toContain("Cross-Team Dependencies · Orchestration");
    expect(source).toContain("Cross-Team Dependencies · Roger UI");
    expect(source).toContain("PI 4 High-Level Scope");
  });
});

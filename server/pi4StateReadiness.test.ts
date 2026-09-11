import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PI4 State delivery readiness", () => {
  it("keeps the State planning content while limiting State readiness assessment to the two approved stories", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");

    expect(source).toContain("State Delivery Readiness");
    expect(source).toContain("State filing / reporting metadata & source ingestion readiness");
    expect(source).toContain('label: "E2E QA", date: "Nov 3–10"');
    expect(source).toContain("S5 is outside the main UAT cycle");
    expect(source).toContain("State Story Readiness for PI 4");
    expect(source).toContain("Current State Story Readiness Assessment");
    expect(source).toContain("Both approved State backend stories require clarification before estimation and DCT acceptance; no delivery size is inferred.");
    expect(source).toContain("1472734 — DCT — Integrate, Store, and Provide State Return-Filing Data for the Roger Filing Screen (Integration/backend)");
    expect(source).toContain("1471480 — DCT — Retrieve, Save, and Govern State Filing Footprint Decisions for the Roger Return Structure Screen (Backend)");
    expect(source).not.toContain("1464780");
    expect(source).toContain("Cross-Team Dependencies · Orchestration");
    expect(source).toContain("Cross-Team Dependencies · Roger UI");
    expect(source).toContain("PI 4 High-Level Scope");
  });
});

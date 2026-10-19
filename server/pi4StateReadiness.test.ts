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

  it("records evidence-bound TDC coverage for the scheduled State ↔ IMS ↔ GoSystem working session", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/StateTaxonomyReadinessPage.tsx"), "utf8");
    const data = readFileSync(resolve(process.cwd(), "client/src/lib/stateTaxonomyReadiness.ts"), "utf8");

    expect(page).toContain('id="state-ims-gosystem-working-session"');
    expect(page).toContain("TDC_WORKING_SESSION_COVERAGE.map");
    expect(page).toContain("STATE_IMS_GOSYSTEM_SESSION_AGENDA.map");
    expect(page).toContain("STATE_IMS_GOSYSTEM_PRE_SESSION_INPUTS.map");
    expect(page).toContain("Team");
    expect(page).toContain("What It Does");
    expect(page).toContain("Context / Notes");
    expect(data).toContain("Discovery only — no approved interface contract, committed timeline, or production readiness implied.");
    expect(data).toContain("1514276");
    expect(data).toContain("TDC — Support State Apportionment Data Retrieval and Outbound Integration to IMS");
    expect(data).toContain("1514277");
    expect(data).toContain("TDC — Support Ingestion and Persistence of GoSystem State Calculated Results");
    expect(data).toContain("1433863");
    expect(data).toContain("Define Data Type & Validation Standards for TDC → IMS → GoSystem Translation");
    expect(data).toContain("outbound TDC → IMS → GoSystem translation");
    expect(data).toContain("Spike / Discovery — Not Implemented");
    expect(data).toContain("Related Dependency / Validate");
    expect(data).toContain("Taxonomy classification is not the same as GoSystem translation.");
    expect(data).toContain("1464780, 1502182, 1502155");
    expect(data).toContain("REQ-TAX-009");
    expect(data).toContain("GAP-08");
    expect(data).toContain("GAP-09");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Provision and State Discovery refinement model", () => {
  it("keeps the supplied cross-team ownership, readiness rule, State, and Provision story discovery content", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");

    expect(source).toContain("Cross-Team Discovery & Refinement Model");
    expect(source).toContain("Is there enough information in this story for DCT DEV");
    expect(source).toContain("business clarification before DCT acceptance");
    expect(source).toContain("1471480 — Retrieve Return Structure Starting Context for a State Filer / Filing Group");
    expect(source).toContain("1472734 — DCT Gateway: Compose State Return-Filing Response for Roger");
    expect(source).toContain("1479949 — DCT-P1-01: Provide governed RTP inputs, context, and source evidence");
    expect(source).toContain("1480251 — DCT-P1-03: Persist, audit, and recalculate prior-year amount corrections");
    expect(source).toContain("RTP Difference = PY Tax Return − PY Provision");
    expect(source).toContain("Story Readiness Matrix");
    expect(source).toContain("Ready with Dependency");
    expect(source).toContain("Reusable Refinement Question Framework");
    expect(source).toContain("DCT must not select correction meaning");
  });
});

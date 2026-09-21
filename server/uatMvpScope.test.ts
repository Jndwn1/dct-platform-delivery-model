import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("MVP UAT Scope & Functionality", () => {
  it("separates the supplied in-scope MVP capabilities from TY26 and TY27 exclusions", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/UATTestingPage.tsx"), "utf8");

    expect(source).toContain("MVP Scope &amp; Functionality");
    expect(source).toContain("IN SCOPE FOR UAT TESTING");
    expect(source).toContain("OUT OF SCOPE");

    expect(source).toContain("Client group dashboard & aggregate filing page (status, metrics, issue counts)");
    expect(source).toContain("Trial Balance upload via Tax Portal with automated ingestion into Roger and success/failure notification in Roger");
    expect(source).toContain("Automated chart of accounts (COA) and tax-line mappings");
    expect(source).toContain("Dynamic workflow to manage changes, human validations, and issue identification");
    expect(source).toContain("Standard book adjustment and reclass capabilities");
    expect(source).toContain("Standard and non-standard tax adjustments with input screens");
    expect(source).toContain("Book return review, book-to-tax, and tax reconciliation views");
    expect(source).toContain("Prior-year final tax amounts sourced from CCH");
    expect(source).toContain("Final sign-off with validations, including GoSystem integration to push return data");

    expect(source).toContain("State");
    expect(source).toContain("apportionment, nexus, payments");
    expect(source).toContain("Provision");
    expect(source).toContain("BTP extract/import, RTP");
    expect(source).toContain("BFA/Sage/GoSystem handoff, Form 4562");
    expect(source).toContain("M-3 report UI and Form 8916-A UI");
    expect(source).toContain("snapshots, copy-forward, comparison");
    expect(source).toContain("Non-standard calculations");
    expect(source).toContain("Client entity mappings");
    expect(source).toContain("Client reports");
    expect(source).toContain("S corp, partnership, OIT integrations, complex corporate structures");
    expect(source).toContain('"TY26"');
    expect(source).toContain('"TY27"');
  });
});

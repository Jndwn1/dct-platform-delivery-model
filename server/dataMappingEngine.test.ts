import { describe, expect, it } from "vitest";
import { createMappingCandidates, mappingReadiness, parseArtifactBuffer, type ArtifactField } from "./dataMappingEngine";
import * as XLSX from "xlsx";

const master: ArtifactField[] = [
  { originalField: "Stock Issuance Costs", worksheet: "Master Data", rowNumber: 2 },
  { originalField: "Deferred Tax Asset", worksheet: "Master Data", rowNumber: 3 },
  { originalField: "Unmatched Source Field", worksheet: "Master Data", rowNumber: 4 },
];

const prior: ArtifactField[] = [
  { originalField: "Stock Issuance Costs", inputCode: "STOCK_ISSUE_EXP_TB", ruleCode: "R-100", worksheet: "Prior Year", rowNumber: 2 },
  { originalField: "Deferred Tax Assets", worksheet: "Prior Year", rowNumber: 3 },
];

describe("governed Data Mapping Assistant", () => {
  it("confirms only an exact one-to-one mapping with an authoritative Input Code", () => {
    const results = createMappingCandidates(master, prior);
    expect(results[0]).toMatchObject({ status: "Confirmed", inputCode: "STOCK_ISSUE_EXP_TB", ruleCode: "R-100", confidence: 100 });
    expect(results[0]?.evidence.join(" ")).toContain("Prior Year");
  });

  it("does not invent an Input Code when only semantic similarity exists", () => {
    const results = createMappingCandidates(master, prior);
    expect(results[1]).toMatchObject({ status: "Candidate", inputCode: "Not Confirmed" });
  });

  it("marks missing evidence as No Match and prevents mapping readiness", () => {
    const results = createMappingCandidates(master, prior);
    expect(results[2]).toMatchObject({ status: "No Match", inputCode: "Not Confirmed" });
    expect(mappingReadiness(results).readiness).toBe("NOT READY");
  });

  it("flags a duplicate exact reference with inconsistent Input Codes as Conflict", () => {
    const results = createMappingCandidates([master[0]!], [
      prior[0]!,
      { ...prior[0]!, inputCode: "DIFFERENT_CODE", rowNumber: 8 },
    ]);
    expect(results[0]).toMatchObject({ status: "Conflict", inputCode: "Not Confirmed" });
  });

  it("uses an approved crosswalk before Master Data and Prior Year evidence", () => {
    const crosswalk = [{ originalField: "Stock Issuance Costs", inputCode: "STOCK_ISSUE_EXP_TB", ruleCode: "R-900", worksheet: "Approved Crosswalk", rowNumber: 2 }];
    const results = createMappingCandidates(master, prior, { approvedCrosswalk: crosswalk, approvedCrosswalkLabel: "Approved Crosswalk v2026.08" });
    expect(results[0]).toMatchObject({ status: "Confirmed", inputCode: "STOCK_ISSUE_EXP_TB", ruleCode: "R-900" });
    expect(results[0]?.evidence.join(" ")).toContain("Approved Crosswalk v2026.08");
  });

  it("uses Master Data evidence before Prior Year Inventory and flags disagreement instead of choosing silently", () => {
    const masterWithCode = [{ ...master[0]!, inputCode: "MASTER_CODE" }];
    const results = createMappingCandidates(masterWithCode, [prior[0]!]);
    expect(results[0]).toMatchObject({ status: "Conflict", inputCode: "Not Confirmed" });
  });

  it("uses an already BA-confirmed historical mapping only when higher-precedence sources do not match", () => {
    const results = createMappingCandidates([master[2]!], [], { historicalConfirmed: [{ originalField: "Unmatched Source Field", inputCode: "HISTORICAL_CODE", worksheet: "Historical", rowNumber: 7 }] });
    expect(results[0]).toMatchObject({ status: "Confirmed", inputCode: "HISTORICAL_CODE" });
  });

  it("preserves structured CSV fields and authoritative code columns during intake", () => {
    const artifact = parseArtifactBuffer(Buffer.from("Field Name,Input Code,Rule Code,Description\nStock Issuance Costs,STOCK_ISSUE_EXP_TB,R-100,Stock issuance cost detail\n"), "prior-year.csv", "2026.08");
    expect(artifact.versionLabel).toBe("2026.08");
    expect(artifact.fields[0]).toMatchObject({ originalField: "Stock Issuance Costs", inputCode: "STOCK_ISSUE_EXP_TB", ruleCode: "R-100" });
  });

  it("excludes only explicitly old or non-current workbook tabs from mapping intake", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Account Code", "Account Name"], ["TDC.AST.001", "Active Asset"]]), "TDC - Tax Taxonomy Accounts");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Account Code", "Account Name"], ["OLD.AST.001", "Historical Asset"]]), "OLD TDC - Tax Taxonomy Accounts");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Code", "Name"], ["THRESHOLD", "Corporate Profile Threshold"]]), "TDC - Corp Profile Thresholds");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const parsed = parseArtifactBuffer(buffer, "DCT_Master_Data_Intake.xlsx", "AUTHORITATIVE — test");
    expect(parsed.fields.map((field) => field.worksheet)).toContain("TDC - Corp Profile Thresholds");
    expect(parsed.fields.map((field) => field.worksheet)).not.toContain("OLD TDC - Tax Taxonomy Accounts");
  });

  it("retains active nonstandard-header tabs as domain metadata without creating a mapping candidate", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Minimum Tier", "Maximum Tier", "Result"], ["1", "2", "Tier A"]]), "TDC - Elig Tier Conditions");
    const parsed = parseArtifactBuffer(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }), "DCT_Master_Data_Intake.xlsx", "AUTHORITATIVE — test");
    expect(parsed.fields).toHaveLength(1);
    expect(parsed.fields[0]?.originalField).toContain("__DOMAIN_METADATA__:TDC - Elig Tier Conditions");
  });
});

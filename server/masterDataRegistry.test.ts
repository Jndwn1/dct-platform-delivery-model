import { describe, expect, it } from "vitest";
import { AUTHORITATIVE_MASTER_DATA_FILE, buildMasterDataEvidence, isCurrentMasterDataTab, isHistoricalMasterDataTab, parseCurrentMasterDataFields, selectAuthoritativeMasterDataArtifact } from "./masterDataRegistry";

describe("authoritative Master Data registry", () => {
  it("treats only explicitly OLD tabs as historical and retains Thresholds as active", () => {
    expect(isHistoricalMasterDataTab("OLD PDC - Firm Taxonomy (XLOB)")).toBe(true);
    expect(isHistoricalMasterDataTab("TDC - Corp Profile Thresholds")).toBe(false);
    expect(isCurrentMasterDataTab("TDC - Corp Profile Thresholds")).toBe(true);
    expect(isCurrentMasterDataTab("TDC - Mapping Rules (on hold)")).toBe(false);
  });

  it("selects only the named authoritative workbook and excludes its historical tab records", () => {
    const artifacts = [
      { id: 1, artifactType: "Master Data", fileName: "DCT_Master_Data_Intake_Governance_Final.xlsx", versionLabel: "SAMPLE", storageUrl: "https://sample", fieldsJson: "[]", createdAt: new Date("2026-08-01") },
      { id: 2, artifactType: "Master Data", fileName: AUTHORITATIVE_MASTER_DATA_FILE, versionLabel: "AUTHORITATIVE — 2026-08-19", storageUrl: "https://authoritative", fieldsJson: JSON.stringify([{ originalField: "Cash", worksheet: "TDC - Tax Taxonomy Accounts", rowNumber: 2 }, { originalField: "Old Cash", worksheet: "OLD TDC - Tax Taxonomy Accounts", rowNumber: 2 }]), createdAt: new Date("2026-08-19") },
    ];
    const selected = selectAuthoritativeMasterDataArtifact(artifacts);
    expect(selected?.id).toBe(2);
    expect(parseCurrentMasterDataFields(selected!.fieldsJson)).toEqual([{ originalField: "Cash", worksheet: "TDC - Tax Taxonomy Accounts", rowNumber: 2 }]);
    expect(buildMasterDataEvidence("What is the current tax taxonomy?", selected).hasEvidence).toBe(true);
  });
});

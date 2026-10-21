import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseArtifactBuffer } from "./dataMappingEngine";
import {
  analyzeStateInputReferenceContract,
  buildStateContractMappingWorkbook,
} from "./stateContractAnalysis";

function buildContractBuffer() {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      [
        "Rule Code",
        "Rule Input",
        "Input Name",
        "Source Type",
        "Period",
        "TCC Pattern (tccPattern)",
        "Tax Year",
      ],
      [
        "STATE_PROPERTY",
        "PY_LAND",
        "Land",
        "PRIOR_YEAR",
        "PY",
        "TDC.AST.NCA.PPE.LND.001",
        "2025",
      ],
      [
        "STATE_PROPERTY",
        "PY_BUILDING",
        "Buildings",
        "PRIOR_YEAR",
        "PY",
        "",
        "2025",
      ],
    ]),
    "State Input Reference"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      [
        "Source Table",
        "Source Column",
        "Canonical / API Field",
        "Include in TDC Data",
        "Contract Rule",
      ],
      [
        "TDC - State Rules Inputs",
        "Rule Input",
        "",
        "Yes",
        "Preserve source field",
      ],
    ]),
    "Field Contract"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["Rule ID", "Validation Rule", "Owner", "Status"],
      [
        "VR-06",
        "Orchestrator consumes TDC-governed reference data",
        "TDC / Orchestrator",
        "Confirmed",
      ],
    ]),
    "Validation Rules"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["ID", "Open Question", "Owner", "Status"],
      [
        "OQ-07",
        "Who approves remaining blank TCC relationships?",
        "State / Process / Data / TDC",
        "OPEN",
      ],
    ]),
    "Open Questions"
  );
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

describe("governed State contract mapping analysis", () => {
  it("preserves State Rule Input source attributes rather than treating the rule code as the mapping key", () => {
    const parsed = parseArtifactBuffer(
      buildContractBuffer(),
      "TDC_State_Input_Reference_Data_Contract_v6.xlsx",
      "V6"
    );
    const land = parsed.fields.find(field => field.originalField === "PY_LAND");
    expect(land).toMatchObject({
      worksheet: "State Input Reference",
      ruleCode: "STATE_PROPERTY",
      attributes: {
        "Rule Input": "PY_LAND",
        "Input Name": "Land",
        "TCC Pattern (tccPattern)": "TDC.AST.NCA.PPE.LND.001",
      },
    });
  });

  it("surfaces blank source relationships and working-session dependencies as review items", () => {
    const parsed = parseArtifactBuffer(
      buildContractBuffer(),
      "TDC_State_Input_Reference_Data_Contract_v6.xlsx",
      "V6"
    );
    const analysis = analyzeStateInputReferenceContract(
      parsed.fields,
      "TDC_State_Input_Reference_Data_Contract_v6.xlsx",
      "V6"
    );
    expect(analysis.source.inputRows).toBe(2);
    expect(analysis.source.populatedTccPatterns).toBe(1);
    expect(analysis.source.unclassifiedTccPatterns).toBe(1);
    expect(
      analysis.mappingRows.find(row => row.ruleInput === "PY_BUILDING")
    ).toMatchObject({
      mappingStatus: "Review Required",
      tccPattern: "Not identified",
    });
    expect(
      analysis.gaps.some(
        gap => gap.id === "VALIDATE-03" && gap.finding.includes("1433863")
      )
    ).toBe(true);
    expect(
      analysis.dependencies.some(dependency =>
        dependency.dependency.includes("1514276")
      )
    ).toBe(true);
    expect(
      analysis.dependencies.some(dependency =>
        dependency.dependency.includes("1433863")
      )
    ).toBe(true);
  });

  it("builds a separate Excel mapping review with gaps and dependency tabs", () => {
    const parsed = parseArtifactBuffer(
      buildContractBuffer(),
      "TDC_State_Input_Reference_Data_Contract_v6.xlsx",
      "V6"
    );
    const analysis = analyzeStateInputReferenceContract(
      parsed.fields,
      "TDC_State_Input_Reference_Data_Contract_v6.xlsx",
      "V6"
    );
    const workbook = XLSX.read(
      Buffer.from(buildStateContractMappingWorkbook(analysis), "base64"),
      { type: "buffer" }
    );
    expect(workbook.SheetNames).toEqual([
      "Mapping Review",
      "Gaps",
      "Dependencies",
      "Source Summary",
    ]);
    const review = XLSX.utils.sheet_to_json<string[]>(
      workbook.Sheets["Mapping Review"]!,
      { header: 1, defval: "" }
    );
    expect(review.flat().join(" ")).toContain("Generated review artifact");
    expect(review.flat().join(" ")).toContain("PY_BUILDING");
  });
});

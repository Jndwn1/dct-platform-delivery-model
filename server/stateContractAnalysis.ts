import * as XLSX from "xlsx";
import type { ArtifactField } from "./dataMappingEngine";

export type AnalysisStatus =
  | "Review Required"
  | "Source Relationship Present"
  | "Open"
  | "Reference";

export type StateContractMappingRow = {
  sourceRow: string;
  ruleCode: string;
  ruleInput: string;
  inputName: string;
  sourceType: string;
  period: string;
  tccPattern: string;
  taxYear: string;
  mappingStatus: AnalysisStatus;
  gap: string;
  crossTeamDependency: string;
  nextAction: string;
};

export type StateContractGap = {
  id: string;
  area: string;
  finding: string;
  impact: string;
  accountableTeams: string;
  status: AnalysisStatus;
  nextAction: string;
};

export type StateContractDependency = {
  workstream: string;
  dependency: string;
  evidence: string;
  status: string;
  nextAction: string;
};

export type StateContractAnalysis = {
  source: {
    fileName: string;
    versionLabel: string;
    inputRows: number;
    fieldContractRows: number;
    validationRules: number;
    openQuestions: number;
    populatedTccPatterns: number;
    unclassifiedTccPatterns: number;
  };
  sourceSummary: Array<{ worksheet: string; capturedRows: number }>;
  mappingRows: StateContractMappingRow[];
  gaps: StateContractGap[];
  dependencies: StateContractDependency[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

function sourceValue(field: ArtifactField, aliases: string[]) {
  const attributes = field.attributes ?? {};
  const aliasSet = new Set(aliases.map(normalize));
  const direct = Object.entries(attributes).find(([header]) =>
    aliasSet.has(normalize(header))
  );
  if (direct?.[1]) return direct[1];
  const partial = Object.entries(attributes).find(([header]) =>
    aliases.some(alias => normalize(header).includes(normalize(alias)))
  );
  return partial?.[1] ?? "";
}

function worksheetRows(fields: ArtifactField[], worksheet: string) {
  return fields.filter(field => field.worksheet === worksheet);
}

function escapeCell(value: unknown) {
  return String(value ?? "");
}

function createSheet(
  title: string,
  headers: string[],
  rows: unknown[][],
  notes: string[]
) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    [title],
    ...notes.map(note => [note]),
    [],
    headers,
    ...rows,
  ]);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(0, headers.length - 1) } },
  ];
  worksheet["!cols"] = headers.map(header => ({
    wch: Math.min(Math.max(header.length + 4, 16), 52),
  }));
  worksheet["!rows"] = [{ hpt: 26 }, ...notes.map(() => ({ hpt: 18 }))];
  return worksheet;
}

export function analyzeStateInputReferenceContract(
  fields: ArtifactField[],
  fileName: string,
  versionLabel: string
): StateContractAnalysis {
  const stateInputRows = worksheetRows(fields, "State Input Reference").filter(
    field => {
      const ruleCode =
        sourceValue(field, ["Rule Code"]) || field.ruleCode || "";
      const ruleInput =
        sourceValue(field, ["Rule Input"]) || field.originalField;
      return (
        Boolean(ruleCode || ruleInput) &&
        !/^(rule code|rule input)$/i.test(ruleInput)
      );
    }
  );
  const fieldContractRows = worksheetRows(fields, "Field Contract").filter(
    field => !/^(source column|contract rule)$/i.test(field.originalField)
  );
  const validationRows = worksheetRows(fields, "Validation Rules").filter(
    field => !/^validation rule$/i.test(field.originalField)
  );
  const openQuestionRows = worksheetRows(fields, "Open Questions").filter(
    field => !/^open question$/i.test(field.originalField)
  );

  const mappingRows = stateInputRows.map((field): StateContractMappingRow => {
    const tccPattern = sourceValue(field, ["TCC Pattern", "tccPattern"]);
    const hasTccPattern = Boolean(tccPattern);
    return {
      sourceRow: `${field.worksheet}!${field.rowNumber}`,
      ruleCode:
        sourceValue(field, ["Rule Code"]) || field.ruleCode || "Not supplied",
      ruleInput: sourceValue(field, ["Rule Input"]) || field.originalField,
      inputName: sourceValue(field, ["Input Name"]) || "Not supplied",
      sourceType: sourceValue(field, ["Source Type"]) || "Not supplied",
      period: sourceValue(field, ["Period"]) || "Not supplied",
      tccPattern: tccPattern || "Not identified",
      taxYear: sourceValue(field, ["Tax Year"]) || "Not supplied",
      mappingStatus: hasTccPattern
        ? "Source Relationship Present"
        : "Review Required",
      gap: hasTccPattern
        ? "The source provides a TCC Pattern relationship, but formal State / Process / Data approval for governed use is not established by this analysis."
        : "The TCC Pattern / taxonomy relationship is blank or not identified in the source row.",
      crossTeamDependency: hasTccPattern
        ? "State + Process + Data/Taxonomy + TDC must confirm the source relationship before it is treated as a governed mapping."
        : "State + Process + Data/Taxonomy + TDC must classify the blank relationship as intentionally unmapped, State-specific, or requiring a TDC association.",
      nextAction: hasTccPattern
        ? "Validate the relationship and its tax-year applicability with the accountable SMEs."
        : "Add the item to the mapping decision log; do not infer a substitute association.",
    };
  });

  const openSourceQuestions = openQuestionRows.filter(field =>
    /\bopen\b/i.test(sourceValue(field, ["Status"]))
  );
  const missingCanonicalFields = fieldContractRows.filter(
    field => !sourceValue(field, ["Canonical / API Field"])
  );
  const populatedTccPatterns = mappingRows.filter(
    row => row.mappingStatus === "Source Relationship Present"
  ).length;
  const unclassifiedTccPatterns = mappingRows.length - populatedTccPatterns;

  const gaps: StateContractGap[] = [
    {
      id: "MAP-01",
      area: "TCC Pattern / taxonomy relationships",
      finding: `${unclassifiedTccPatterns} State Rule Input row(s) do not provide a TCC Pattern relationship in the uploaded source.`,
      impact:
        "Those rows cannot be treated as mapped to a TDC taxonomy association without a human decision.",
      accountableTeams: "State + Process + Data/Taxonomy + TDC",
      status: "Review Required",
      nextAction:
        "Classify each blank as intentionally unmapped, State-specific, or requiring a TDC association.",
    },
    {
      id: "CONTRACT-02",
      area: "Canonical / API contract fields",
      finding: `${missingCanonicalFields.length} Field Contract row(s) do not provide a Canonical / API Field in the uploaded source.`,
      impact:
        "The source preserves the State field boundary but does not by itself establish the implementation-facing contract field name.",
      accountableTeams:
        "State / Process + TDC + IMS where translation is in scope",
      status: "Review Required",
      nextAction:
        "Confirm whether the source field name is the governed contract name or map it to an approved canonical/API field.",
    },
    {
      id: "VALIDATE-03",
      area: "Data type and validation standards",
      finding:
        "Tech Story 1433863 is the related validation dependency. The contract identifies validation rules, but it does not independently establish the shared data types, null/zero semantics, precision, valid values, routing metadata, or error ownership for TDC → IMS → GoSystem translation.",
      impact:
        "Outbound and inbound integration mapping cannot be treated as validated from this workbook alone.",
      accountableTeams: "Process + TDC + IMS",
      status: "Open",
      nextAction:
        "Use Tech Story 1433863 to record and validate these standards by data movement.",
    },
    {
      id: "INTEGRATION-04",
      area: "State calculation movement contracts",
      finding:
        "The uploaded State reference-data contract does not establish the approved outbound apportionment package or inbound GoSystem calculated-results contract.",
      impact:
        "No end-to-end IMS / GoSystem interface, field list, or persistence behavior can be inferred.",
      accountableTeams: "State SMEs + Process + TDC + IMS + Roger State",
      status: "Open",
      nextAction:
        "Resolve the separate discovery work for 1514276 (outbound) and 1514277 (inbound) before implementation commitment.",
    },
    {
      id: "SOURCE-05",
      area: "Open source decisions",
      finding: `${openSourceQuestions.length} uploaded Open Question row(s) remain marked open in the source workbook.`,
      impact:
        "These source questions require review rather than automatic conversion into mappings, rules, or delivery commitments.",
      accountableTeams: "Owners identified in the source workbook",
      status: "Open",
      nextAction:
        "Review the source Open Questions tab and record an approved decision or next-step owner for each applicable item.",
    },
  ];

  const dependencies: StateContractDependency[] = [
    {
      workstream: "State / Process / Data-Taxonomy",
      dependency:
        "Approve standardized State business inputs and taxonomy relationships.",
      evidence:
        "Uploaded State Input Reference and TCC Pattern columns; source relationships are not promoted to approved mappings by this analysis.",
      status: "Human confirmation required",
      nextAction:
        "Confirm populated relationships and classify blank relationships before TDC population.",
    },
    {
      workstream: "TDC",
      dependency:
        "Create governed State input-code reference data and retrieval API.",
      evidence:
        "ADO Tech Story 1501980 identified in the supplied Ask Buddy evidence note.",
      status:
        "Referenced delivery dependency — implementation status not assessed here",
      nextAction:
        "Validate the approved reference-data scope and retrieval behavior against the accountable delivery evidence.",
    },
    {
      workstream: "TDC",
      dependency: "Populate approved State input reference data.",
      evidence:
        "ADO Story 1501796 identified in the supplied Ask Buddy evidence note.",
      status: "Dependent on upstream approval and TDC capability readiness",
      nextAction:
        "Load only after the standardized inputs and taxonomy relationships are approved.",
    },
    {
      workstream: "Process + TDC + IMS",
      dependency:
        "Tech Story 1433863 — define data types and validation standards for TDC → IMS → GoSystem translation.",
      evidence:
        "Tech Story 1433863 — related dependency / validate in the State data-movement working-session plan.",
      status: "Open validation dependency",
      nextAction:
        "Document data type, null/zero, precision, valid-value, routing-metadata, and error-ownership decisions by movement.",
    },
    {
      workstream: "State SMEs + Process + TDC + IMS + Roger State",
      dependency:
        "Separate State apportionment outbound (1514276) and calculated-results inbound (1514277) movement contracts.",
      evidence:
        "Pilot State Taxonomy working-session coverage: 1514276 outbound and 1514277 inbound spikes are discovery / not implemented.",
      status: "Open discovery dependency",
      nextAction:
        "Agree field inventory, record grain, keys, lineage, reconciliation, and ownership before interface design or delivery commitment.",
    },
    {
      workstream: "Orchestrator + TDC",
      dependency:
        "Orchestrator consumes the TDC-governed State reference list rather than an independent authoritative list.",
      evidence: "Uploaded Validation Rule VR-06.",
      status: "Source-confirmed rule; current implementation not assessed here",
      nextAction:
        "Confirm the active retrieval contract and that ownership is reflected in implementation planning.",
    },
  ];

  const worksheetCounts = new Map<string, number>();
  for (const field of fields)
    worksheetCounts.set(
      field.worksheet,
      (worksheetCounts.get(field.worksheet) ?? 0) + 1
    );

  return {
    source: {
      fileName,
      versionLabel,
      inputRows: mappingRows.length,
      fieldContractRows: fieldContractRows.length,
      validationRules: validationRows.length,
      openQuestions: openQuestionRows.length,
      populatedTccPatterns,
      unclassifiedTccPatterns,
    },
    sourceSummary: Array.from(worksheetCounts.entries())
      .map(([worksheet, capturedRows]) => ({ worksheet, capturedRows }))
      .sort((left, right) => left.worksheet.localeCompare(right.worksheet)),
    mappingRows,
    gaps,
    dependencies,
  };
}

export function buildStateContractMappingWorkbook(
  analysis: StateContractAnalysis
) {
  const workbook = XLSX.utils.book_new();
  const notes = [
    `Source: ${analysis.source.fileName} · ${analysis.source.versionLabel}`,
    "Generated review artifact — requires State / Process / Data-Taxonomy / TDC / IMS human validation. It does not approve mappings, interfaces, schemas, or delivery commitments.",
  ];

  const mapHeaders = [
    "Source row",
    "Rule Code",
    "Rule Input",
    "Input Name",
    "Source Type",
    "Period",
    "TCC Pattern",
    "Tax Year",
    "Mapping status",
    "Gap",
    "Cross-team dependency",
    "Next action",
  ];
  const mapRows = analysis.mappingRows.map(row =>
    [
      row.sourceRow,
      row.ruleCode,
      row.ruleInput,
      row.inputName,
      row.sourceType,
      row.period,
      row.tccPattern,
      row.taxYear,
      row.mappingStatus,
      row.gap,
      row.crossTeamDependency,
      row.nextAction,
    ].map(escapeCell)
  );
  XLSX.utils.book_append_sheet(
    workbook,
    createSheet("State Input Mapping Review", mapHeaders, mapRows, notes),
    "Mapping Review"
  );

  const gapHeaders = [
    "ID",
    "Area",
    "Finding",
    "Impact",
    "Accountable teams",
    "Status",
    "Next action",
  ];
  const gapRows = analysis.gaps.map(gap =>
    [
      gap.id,
      gap.area,
      gap.finding,
      gap.impact,
      gap.accountableTeams,
      gap.status,
      gap.nextAction,
    ].map(escapeCell)
  );
  XLSX.utils.book_append_sheet(
    workbook,
    createSheet("Gap Register", gapHeaders, gapRows, notes),
    "Gaps"
  );

  const dependencyHeaders = [
    "Workstream",
    "Dependency",
    "Evidence",
    "Status",
    "Next action",
  ];
  const dependencyRows = analysis.dependencies.map(dependency =>
    [
      dependency.workstream,
      dependency.dependency,
      dependency.evidence,
      dependency.status,
      dependency.nextAction,
    ].map(escapeCell)
  );
  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(
      "Cross-Team Dependencies",
      dependencyHeaders,
      dependencyRows,
      notes
    ),
    "Dependencies"
  );

  const sourceHeaders = ["Worksheet", "Captured rows"];
  const sourceRows = analysis.sourceSummary.map(row => [
    row.worksheet,
    row.capturedRows,
  ]);
  XLSX.utils.book_append_sheet(
    workbook,
    createSheet("Source Summary", sourceHeaders, sourceRows, notes),
    "Source Summary"
  );

  return XLSX.write(workbook, {
    type: "base64",
    bookType: "xlsx",
    compression: true,
  });
}

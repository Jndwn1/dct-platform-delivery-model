import * as XLSX from "xlsx";

export type MappingStatus = "Confirmed" | "Candidate" | "Ambiguous" | "No Match" | "Conflict";

export interface ArtifactField {
  originalField: string;
  businessMeaning?: string;
  inputCode?: string;
  ruleCode?: string;
  dataType?: string;
  taxContext?: string;
  worksheet: string;
  rowNumber: number;
}

export interface ParsedArtifact {
  fileName: string;
  versionLabel: string;
  fields: ArtifactField[];
}

export interface MappingCandidate {
  masterField: ArtifactField;
  priorField?: ArtifactField;
  inputCode: string;
  ruleCode: string;
  status: MappingStatus;
  confidence: number;
  evidence: string[];
  reason: string;
}

export interface MappingEvidenceSources {
  approvedCrosswalk?: ArtifactField[];
  historicalConfirmed?: ArtifactField[];
  approvedCrosswalkLabel?: string;
}

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (value: string) => new Set(norm(value).split(" ").filter(Boolean));

function similarity(left: string, right: string) {
  const a = tokens(left); const b = tokens(right);
  const intersection = Array.from(a).filter(token => b.has(token)).length;
  const union = new Set(Array.from(a).concat(Array.from(b))).size || 1;
  return intersection / union;
}

function headerFor(headers: string[], patterns: RegExp[]) {
  return headers.find(header => patterns.some(pattern => pattern.test(header.toLowerCase())));
}

export function parseArtifactBuffer(buffer: Buffer, fileName: string, versionLabel: string): ParsedArtifact {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const fields: ArtifactField[] = [];

  workbook.SheetNames.forEach((worksheet) => {
    const sheet = workbook.Sheets[worksheet];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    const headers = (headerRows[0] ?? []).map(value => String(value).trim()).filter(Boolean);
    const fieldHeader = headerFor(headers, [/^field$/, /field name/, /source field/, /attribute/, /column name/, /^name$/, /account.?code/, /account.?name/, /taxonomy.?code/, /form.?code/, /line.?code/, /rule.?code/, /template.?code/, /concept.?code/, /criteria.?code/]);
    const descriptionHeader = headerFor(headers, [/description/, /business meaning/, /definition/]);
    const inputHeader = headerFor(headers, [/input.?code/, /^input$/]);
    const ruleHeader = headerFor(headers, [/rule.?code/, /^rule$/]);
    const typeHeader = headerFor(headers, [/data.?type/, /^type$/]);
    const taxHeader = headerFor(headers, [/tax.?form/, /tax.?line/, /tax.?context/, /jurisdiction/, /entity/]);

    rows.forEach((row, rowIndex) => {
      const originalField = String(fieldHeader ? row[fieldHeader] : "").trim();
      if (!originalField) return;
      fields.push({
        originalField,
        businessMeaning: descriptionHeader ? String(row[descriptionHeader] || "").trim() || undefined : undefined,
        inputCode: inputHeader ? String(row[inputHeader] || "").trim() || undefined : undefined,
        ruleCode: ruleHeader ? String(row[ruleHeader] || "").trim() || undefined : undefined,
        dataType: typeHeader ? String(row[typeHeader] || "").trim() || undefined : undefined,
        taxContext: taxHeader ? String(row[taxHeader] || "").trim() || undefined : undefined,
        worksheet,
        rowNumber: rowIndex + 2,
      });
    });

    // A simple header-only source is still preserved and evaluated without manufacturing a mapping.
    if (rows.length === 0) {
      headers.forEach((originalField, index) => fields.push({ originalField, worksheet, rowNumber: 1, businessMeaning: undefined, inputCode: undefined, ruleCode: undefined, dataType: undefined, taxContext: undefined }));
    }
  });

  if (!fields.length) throw new Error("No mappable field rows were found. Include a Field Name, Source Field, Attribute, or Name column.");
  return { fileName, versionLabel, fields };
}

function statusForExact(master: ArtifactField, matches: ArtifactField[]): MappingCandidate {
  if (matches.length > 1) {
    const distinctCodes = new Set(matches.map(match => match.inputCode).filter(Boolean));
    return { masterField: master, inputCode: "Not Confirmed", ruleCode: "Not Confirmed", status: distinctCodes.size > 1 ? "Conflict" : "Ambiguous", confidence: 100, evidence: matches.map(match => `${match.worksheet}!${match.originalField}`), reason: distinctCodes.size > 1 ? "Exact field matches contain inconsistent Input Codes." : "More than one exact reference field is available." };
  }
  const priorField = matches[0];
  const inputCode = priorField.inputCode || master.inputCode;
  if (!inputCode) return { masterField: master, priorField, inputCode: "Not Confirmed", ruleCode: priorField.ruleCode || master.ruleCode || "Not Confirmed", status: "No Match", confidence: 100, evidence: [`Exact field match: ${priorField.worksheet}!${priorField.originalField}`], reason: "The exact field match does not contain an authoritative Input Code." };
  return { masterField: master, priorField, inputCode, ruleCode: priorField.ruleCode || master.ruleCode || "Not Confirmed", status: "Confirmed", confidence: 100, evidence: [`Exact field match: ${priorField.worksheet}!${priorField.originalField}`, `Input Code located in ${priorField.inputCode ? "Prior Year Inventory" : "Master Data artifact"}`], reason: "A one-to-one exact field match contains an authoritative Input Code." };
}

function confirmedFrom(master: ArtifactField, source: ArtifactField, sourceLabel: string, priorField?: ArtifactField): MappingCandidate {
  if (!source.inputCode) return { masterField: master, priorField, inputCode: "Not Confirmed", ruleCode: source.ruleCode || "Not Confirmed", status: "No Match", confidence: 100, evidence: [`Exact field match: ${sourceLabel}!${source.originalField}`], reason: `The exact ${sourceLabel} reference does not contain an authoritative Input Code.` };
  return { masterField: master, priorField, inputCode: source.inputCode, ruleCode: source.ruleCode || "Not Confirmed", status: "Confirmed", confidence: 100, evidence: [`Exact field match: ${sourceLabel}!${source.originalField}`, `Input Code located in ${sourceLabel}`], reason: `A one-to-one exact ${sourceLabel} reference contains an authoritative Input Code.` };
}

function conflictFrom(master: ArtifactField, primary: ArtifactField, primaryLabel: string, conflicting: ArtifactField, conflictingLabel: string, priorField?: ArtifactField): MappingCandidate {
  return { masterField: master, priorField, inputCode: "Not Confirmed", ruleCode: "Not Confirmed", status: "Conflict", confidence: 100, evidence: [`${primaryLabel}: ${primary.inputCode}`, `${conflictingLabel}: ${conflicting.inputCode}`], reason: `Exact field evidence contains conflicting Input Codes. ${primaryLabel} has higher precedence, but the discrepancy requires BA or SME resolution.` };
}

export function createMappingCandidates(masterFields: ArtifactField[], priorFields: ArtifactField[], sources: MappingEvidenceSources = {}): MappingCandidate[] {
  return masterFields.map((master) => {
    const crosswalkExact = (sources.approvedCrosswalk ?? []).filter(reference => norm(reference.originalField) === norm(master.originalField));
    const masterExactCode = master.inputCode ? master : undefined;
    const exact = priorFields.filter(prior => norm(prior.originalField) === norm(master.originalField));
    const historicalExact = (sources.historicalConfirmed ?? []).filter(reference => norm(reference.originalField) === norm(master.originalField));
    const priorReference = exact.length === 1 ? exact[0] : undefined;

    if (crosswalkExact.length) {
      if (crosswalkExact.length > 1) return statusForExact(master, crosswalkExact);
      const crosswalk = crosswalkExact[0]!;
      if (masterExactCode && masterExactCode.inputCode !== crosswalk.inputCode) return conflictFrom(master, crosswalk, sources.approvedCrosswalkLabel ?? "Approved Crosswalk", masterExactCode, "Master Data", priorReference);
      if (priorReference?.inputCode && priorReference.inputCode !== crosswalk.inputCode) return conflictFrom(master, crosswalk, sources.approvedCrosswalkLabel ?? "Approved Crosswalk", priorReference, "Prior Year Inventory", priorReference);
      return confirmedFrom(master, crosswalk, sources.approvedCrosswalkLabel ?? "Approved Crosswalk", priorReference);
    }

    if (masterExactCode) {
      if (priorReference?.inputCode && priorReference.inputCode !== masterExactCode.inputCode) return conflictFrom(master, masterExactCode, "Master Data", priorReference, "Prior Year Inventory", priorReference);
      return confirmedFrom(master, masterExactCode, "Master Data", priorReference);
    }

    if (exact.length) return statusForExact(master, exact);
    if (historicalExact.length === 1) return confirmedFrom(master, historicalExact[0]!, "Historical Confirmed Mapping");
    if (historicalExact.length > 1) return statusForExact(master, historicalExact);
    const scored = priorFields.map(prior => ({ prior, score: similarity(master.originalField, prior.originalField) })).filter(item => item.score >= 0.45).sort((a, b) => b.score - a.score);
    if (!scored.length) return { masterField: master, inputCode: "Not Confirmed", ruleCode: "Not Confirmed", status: "No Match", confidence: 0, evidence: [], reason: "No authoritative or semantic reference field was located." };
    const top = scored[0];
    const ties = scored.filter(item => Math.abs(item.score - top.score) < 0.05);
    if (ties.length > 1) return { masterField: master, inputCode: "Not Confirmed", ruleCode: "Not Confirmed", status: "Ambiguous", confidence: Math.round(top.score * 100), evidence: ties.map(item => `Candidate: ${item.prior.worksheet}!${item.prior.originalField}`), reason: "Multiple plausible reference fields require BA or SME review." };
    return { masterField: master, priorField: top.prior, inputCode: "Not Confirmed", ruleCode: top.prior.ruleCode || "Not Confirmed", status: "Candidate", confidence: Math.round(top.score * 100), evidence: [`Semantic candidate: ${top.prior.worksheet}!${top.prior.originalField}`], reason: "Field names are semantically similar, but no authoritative one-to-one Input Code evidence was found." };
  });
}

export function mappingReadiness(results: MappingCandidate[]) {
  const exceptions = {
    candidate: results.filter(result => result.status === "Candidate").length,
    ambiguous: results.filter(result => result.status === "Ambiguous").length,
    noMatch: results.filter(result => result.status === "No Match").length,
    conflict: results.filter(result => result.status === "Conflict").length,
    missingInputCode: results.filter(result => result.inputCode === "Not Confirmed").length,
  };
  const confirmedCodes = results.filter(result => result.status === "Confirmed" && result.inputCode !== "Not Confirmed").map(result => result.inputCode);
  const duplicateInputCodes = new Set(confirmedCodes.filter((code, index) => confirmedCodes.indexOf(code) !== index)).size;
  const unresolved = exceptions.candidate + exceptions.ambiguous + exceptions.noMatch + exceptions.conflict + duplicateInputCodes;
  return { readiness: unresolved === 0 ? "READY" as const : "NOT READY" as const, exceptions: { ...exceptions, duplicateInputCodes }, unresolved };
}

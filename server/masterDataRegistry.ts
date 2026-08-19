import type { ArtifactField } from "./dataMappingEngine";
import { isMappableArtifactField } from "./dataMappingEngine";

export const AUTHORITATIVE_MASTER_DATA_FILE = "DCT_Master_Data_Intake.xlsx";
export const MASTER_DATA_ANSWER_FALLBACK = "The authoritative Master Data Intake workbook does not currently provide enough information to determine this.";

export type MasterDataArtifact = {
  id: number;
  artifactType: string;
  fileName: string;
  versionLabel: string;
  storageUrl: string;
  fieldsJson: string;
  createdAt: Date | string;
};

export type MasterDataSource = {
  id: string;
  label: string;
  path: string;
  authority: string;
  lastUpdated: string;
  artifactStatus: "Current" | "Reference" | "Open" | "Unavailable";
};

const MASTER_DATA_TERMS = /\b(master\s*data|taxonomy|tax\s*taxonomy|firm\s*taxonomy|adjustment\s*rule|rule\s*input|rule\s*line|input\s*code|account\s*mapping|eligibility|reference\s*data|tax\s*form|form\s*line|pdc\s*firm|tdc\s*tax)\b/i;

export function isHistoricalMasterDataTab(tabName: string) {
  return /(^|[^a-z])old([^a-z]|$)/i.test(tabName);
}

export function isCurrentMasterDataTab(tabName: string) {
  return !isHistoricalMasterDataTab(tabName) && !/(on hold|not generated)/i.test(tabName);
}

export function isMasterDataQuestion(question: string) {
  return MASTER_DATA_TERMS.test(question);
}

export function selectAuthoritativeMasterDataArtifact(artifacts: MasterDataArtifact[]) {
  return artifacts.find((artifact) => artifact.artifactType === "Master Data" && artifact.fileName === AUTHORITATIVE_MASTER_DATA_FILE && /authoritative/i.test(artifact.versionLabel)) ?? null;
}

export function parseCurrentMasterDataFields(fieldsJson: string): ArtifactField[] {
  try {
    const parsed = JSON.parse(fieldsJson) as ArtifactField[];
    return parsed.filter((field) => isCurrentMasterDataTab(field.worksheet));
  } catch {
    return [];
  }
}

export function toMasterDataSource(artifact: MasterDataArtifact | null): MasterDataSource | null {
  if (!artifact) return null;
  const updated = artifact.createdAt instanceof Date ? artifact.createdAt.toISOString() : String(artifact.createdAt);
  return {
    id: `master-data:${artifact.id}`,
    label: `Authoritative Master Data Intake — ${artifact.fileName}`,
    path: artifact.storageUrl,
    authority: "Authoritative active tabs in the DCT Master Data Intake workbook",
    lastUpdated: updated,
    artifactStatus: "Current",
  };
}

function questionTokens(question: string) {
  return question.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
}

export function buildMasterDataEvidence(question: string, artifact: MasterDataArtifact | null) {
  const requested = isMasterDataQuestion(question);
  const source = toMasterDataSource(artifact);
  const fields = artifact ? parseCurrentMasterDataFields(artifact.fieldsJson) : [];
  const tokens = questionTokens(question);
  const matches = fields.filter((field) => isMappableArtifactField(field)).filter((field) => {
    const indexed = [field.originalField, field.businessMeaning, field.inputCode, field.ruleCode, field.worksheet].filter(Boolean).join(" ").toLowerCase();
    return tokens.some((token) => indexed.includes(token));
  }).slice(0, 20);
  const hasEvidence = !requested || (Boolean(source) && fields.length > 0);
  const lines = matches.map((field) => `- ${field.worksheet}!${field.originalField}${field.businessMeaning ? ` — ${field.businessMeaning}` : ""}${field.inputCode ? ` | Input Code: ${field.inputCode}` : ""}${field.ruleCode ? ` | Rule Code: ${field.ruleCode}` : ""}`).join("\n");
  const evidenceBlock = requested
    ? `\n\n### Authoritative Master Data Evidence\n${source ? `Current source: ${source.label}. Use active tabs only; tabs explicitly labeled OLD are historical and must never answer current-state questions.\n\nRelevant active-tab records:\n${lines || "No directly matching active-tab record was located."}` : `${MASTER_DATA_ANSWER_FALLBACK}\n\nMissing artifact: register ${AUTHORITATIVE_MASTER_DATA_FILE} with an AUTHORITATIVE source label before answering current Master Data questions.`}\n\nNever infer a mapping merely from similar descriptions. If an active-tab record does not establish the relationship, state that review is required.`
    : "";
  return { requested, source, fields, matches, hasEvidence, evidenceBlock };
}

export function masterDataDomains(fields: ArtifactField[]) {
  const domains = new Map<string, number>();
  for (const field of fields) domains.set(field.worksheet, (domains.get(field.worksheet) ?? 0) + (isMappableArtifactField(field) ? 1 : 0));
  return Array.from(domains.entries()).map(([sourceTab, recordCount]) => ({ sourceTab, recordCount })).sort((a, b) => a.sourceTab.localeCompare(b.sourceTab));
}

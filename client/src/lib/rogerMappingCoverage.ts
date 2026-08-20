import { ROGER_MVP_SCREEN_RECORDS, type RogerMvpScreenRecord } from "./rogerMvpScreenStatus";

export type RogerMappingEvidenceStatus = "Documented" | "Related Evidence" | "Needs Mapping";

export interface RogerMappingCoverage {
  screen: RogerMvpScreenRecord;
  evidenceStatus: RogerMappingEvidenceStatus;
  endpoint?: string;
  source: string;
  note: string;
}

const EXACT_API_DESIGN_EVIDENCE: Record<string, Omit<RogerMappingCoverage, "screen">> = {
  "my-clients": {
    evidenceStatus: "Documented",
    endpoint: "GET /api/clients?taxYear={year}",
    source: "Roger API Design v1.0",
    note: "Documented My Clients contract and fields are available for review.",
  },
  "entity-selection": {
    evidenceStatus: "Related Evidence",
    endpoint: "GET /api/clients/{clientId}/entities?taxYear={year}",
    source: "Roger API Design v1.0",
    note: "Related Entities contract exists; BA confirmation is required before treating it as the Entity Selection screen contract.",
  },
  "return-structure": {
    evidenceStatus: "Related Evidence",
    endpoint: "GET /api/returns/{returnId}/members",
    source: "Roger API Design v1.0",
    note: "Related return-members contract exists; return-structure UI coverage still requires confirmation.",
  },
  "summary-consolidation": {
    evidenceStatus: "Related Evidence",
    endpoint: "GET /api/clients/{clientId}/consolidations",
    source: "Roger API Design v1.0",
    note: "Related consolidation contract exists; Summary Page field coverage remains to be confirmed.",
  },
};

export const ROGER_MAPPING_COVERAGE: RogerMappingCoverage[] = ROGER_MVP_SCREEN_RECORDS.map(screen => ({
  screen,
  ...(EXACT_API_DESIGN_EVIDENCE[screen.id] ?? {
    evidenceStatus: "Needs Mapping" as const,
    source: "Roger API Design / Swagger evidence not yet linked",
    note: "No source-safe endpoint or field mapping is registered for this current QA Registry screen. Do not infer an API contract.",
  }),
}));

export function countMappingCoverage(status: RogerMappingEvidenceStatus) {
  return ROGER_MAPPING_COVERAGE.filter(item => item.evidenceStatus === status).length;
}

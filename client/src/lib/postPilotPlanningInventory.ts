export type PostPilotPlanningRecord = {
  objectiveNumber: string;
  featureId: string;
  objectiveDescription: string;
  committed: "Not captured";
  businessValue: number | null;
  sizing: "Not captured";
  adoDependencies: string[] | "TBD";
};

export const POST_PILOT_PLANNING_SPRINT = "PI4 · Sprint 2";
export const POST_PILOT_PLANNING_SOURCE_SELECTION = "Supplied ADO backlog selection";

export const POST_PILOT_PLANNING_INVENTORY: readonly PostPilotPlanningRecord[] = [
  {
    objectiveNumber: "1",
    featureId: "1441528",
    objectiveDescription: "Finding - 5.6 Security Implementation",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1482205", "1472922"],
  },
  {
    objectiveNumber: "2",
    featureId: "1441524",
    objectiveDescription: "Finding - 5.2 API and Payload Definitions",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1483681", "1433863"],
  },
  {
    objectiveNumber: "3",
    featureId: "1461160",
    objectiveDescription: "User-Defined Nonstandard TDC Codes",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1454679", "1450150"],
  },
  {
    objectiveNumber: "4",
    featureId: "1490944",
    objectiveDescription: "Data Defect & Bug Management",
    committed: "Not captured",
    businessValue: 10,
    sizing: "Not captured",
    adoDependencies: ["1488496", "1488477", "1463645", "1488332", "1488494", "1488497", "1487890", "1483802", "1477411", "1477413", "1477373", "1492007"],
  },
] as const;

const uniqueFeatureIds = new Set(POST_PILOT_PLANNING_INVENTORY.map((record) => record.featureId));
const linkedAdoIds = new Set(
  POST_PILOT_PLANNING_INVENTORY.flatMap((record) => record.adoDependencies === "TBD" ? [] : record.adoDependencies),
);

export const POST_PILOT_PLANNING_SUMMARY = {
  planningRecordCount: POST_PILOT_PLANNING_INVENTORY.length,
  uniqueFeatureCount: uniqueFeatureIds.size,
  markedCommittedCount: 0,
  sizedCount: 0,
  highValueCount: POST_PILOT_PLANNING_INVENTORY.filter((record) => record.businessValue !== null && record.businessValue >= 9).length,
  linkedAdoDependencyCount: linkedAdoIds.size,
  unresolvedDependencyCount: POST_PILOT_PLANNING_INVENTORY.filter((record) => record.adoDependencies === "TBD").length,
} as const;

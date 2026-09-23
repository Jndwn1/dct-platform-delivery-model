export type PostPilotPlanningRecord = {
  objectiveNumber: string;
  featureId: string;
  objectiveDescription: string;
  committed: "Not captured";
  businessValue: number | null;
  sizing: "Not captured";
  adoDependencies: string[] | "TBD";
};

export const POST_PILOT_PLANNING_INVENTORY: readonly PostPilotPlanningRecord[] = [
  {
    objectiveNumber: "1",
    featureId: "1441524",
    objectiveDescription: "Finding - 5.2 API and Payload Definitions",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1433863", "1483681"],
  },
  {
    objectiveNumber: "2",
    featureId: "1461160",
    objectiveDescription: "User-Defined Nonstandard TDC Codes",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1450150"],
  },
  {
    objectiveNumber: "3",
    featureId: "1461160",
    objectiveDescription: "User-Defined Nonstandard TDC Codes",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1454679"],
  },
  {
    objectiveNumber: "4",
    featureId: "1475360",
    objectiveDescription: "Roll-forward (prior yr TWB)",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1472917"],
  },
  {
    objectiveNumber: "5",
    featureId: "1472793",
    objectiveDescription: "Finding - 5.7 Penetration Testing & Security Readiness",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1435463"],
  },
  {
    objectiveNumber: "6",
    featureId: "1474067",
    objectiveDescription: "PDC/TDC Master Data Administration Console",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1474079"],
  },
  {
    objectiveNumber: "7",
    featureId: "1441522",
    objectiveDescription: "Finding - 5.1 Microservice Design: Separating the Database",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: "TBD",
  },
  {
    objectiveNumber: "8",
    featureId: "1441525",
    objectiveDescription: "Finding - 5.3 Scalability: Behavior at Production Volumes",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: "TBD",
  },
  {
    objectiveNumber: "9",
    featureId: "1441526",
    objectiveDescription: "Finding - 5.4 Expandability",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: "TBD",
  },
  {
    objectiveNumber: "10",
    featureId: "1441527",
    objectiveDescription: "Finding - 5.5 Data Model and Schema Flexibility",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1482205"],
  },
  {
    objectiveNumber: "11",
    featureId: "1451927",
    objectiveDescription: "Roger State Taxable Income MVP - State Filing Footprint",
    committed: "Not captured",
    businessValue: 10,
    sizing: "Not captured",
    adoDependencies: ["1471480", "1472734"],
  },
  {
    objectiveNumber: "12",
    featureId: "1492005",
    objectiveDescription: "Data & Workflow Enhancements",
    committed: "Not captured",
    businessValue: null,
    sizing: "Not captured",
    adoDependencies: ["1478431"],
  },
  {
    objectiveNumber: "13",
    featureId: "1490944",
    objectiveDescription: "Data Defect & Bug Management",
    committed: "Not captured",
    businessValue: 10,
    sizing: "Not captured",
    adoDependencies: ["1477412", "1483802", "1483805", "1487890", "1488332", "1463645", "1477411", "1477413"],
  },
  {
    objectiveNumber: "14",
    featureId: "1441528",
    objectiveDescription: "Finding 5.6 Security Implementation",
    committed: "Not captured",
    businessValue: 9,
    sizing: "Not captured",
    adoDependencies: ["1472922", "1444513"],
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

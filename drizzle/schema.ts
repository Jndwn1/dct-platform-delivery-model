import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * Integration questions / decision log for the Roger ↔ DCT Integration Hub.
 * Tracks open questions across integration topics with owner assignment and resolution.
 */
export const integrationQuestions = mysqlTable("integration_questions", {
  id: int("id").autoincrement().primaryKey(),
  /** Which integration topic this question belongs to, e.g. 'reclass' or 'known-mappings' */
  topic: varchar("topic", { length: 64 }).notNull(),
  question: text("question").notNull(),
  status: mysqlEnum("status", ["open", "resolved", "deferred"]).default("open").notNull(),
  owner: varchar("owner", { length: 128 }),
  notes: text("notes"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IntegrationQuestion = typeof integrationQuestions.$inferSelect;
export type InsertIntegrationQuestion = typeof integrationQuestions.$inferInsert;

/**
 * Deployment Registry — authoritative release history for DCT deployments.
 * Provides traceability between batches, features, stories, bugs, technical stories, and deployments.
 * Schema designed to support future ingestion from Azure DevOps, GitHub Releases, and Release Notes.
 */
export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  /** DEP-YYYY-MMDD-NNN format identifier */
  deploymentId: varchar("deploymentId", { length: 32 }).notNull().unique(),
  releaseName: varchar("releaseName", { length: 512 }).notNull(),
  deploymentDate: varchar("deploymentDate", { length: 16 }).notNull(),
  deploymentOwner: varchar("deploymentOwner", { length: 128 }).notNull(),
  productOwner: varchar("productOwner", { length: 128 }).notNull(),
  platform: mysqlEnum("platform", ["PDC", "TDC", "Platform", "Both"]).notNull(),
  type: mysqlEnum("type", ["Batch", "Feature", "Bug", "Technical Story", "Hotfix"]).notNull(),
  status: mysqlEnum("status", ["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).default("Planned").notNull(),
  summary: text("summary"),
  releaseNotesUrl: varchar("releaseNotesUrl", { length: 1024 }),
  swaggerUrl: varchar("swaggerUrl", { length: 1024 }),
  /** Batch identifier e.g. B10, B43 */
  relatedBatch: varchar("relatedBatch", { length: 32 }),
  /** Feature or epic name */
  relatedFeature: varchar("relatedFeature", { length: 256 }),
  /** Story or bug ID/title */
  relatedStory: varchar("relatedStory", { length: 256 }),
  environment: varchar("environment", { length: 64 }).default("Production").notNull(),
  /** Reserved for future Azure DevOps integration */
  adoWorkItemId: varchar("adoWorkItemId", { length: 32 }),
  /** ADO Feature work item URL */
  adoFeatureUrl: varchar("adoFeatureUrl", { length: 1024 }),
  /** ADO Deployment Story work item URL */
  adoStoryUrl: varchar("adoStoryUrl", { length: 1024 }),
  /** Release notes bullet points — one per line, used in wiki entry generation */
  releaseNotesBullets: text("releaseNotesBullets"),
  /** Reserved for future GitHub Releases integration */
  githubReleaseTag: varchar("githubReleaseTag", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;
// ─── UAT Test Cases ──────────────────────────────────────────────────────────
export const uatTestCases = mysqlTable("uat_test_cases", {
  id: int("id").autoincrement().primaryKey(),
  testId: varchar("testId", { length: 32 }).notNull(),
  epic: varchar("epic", { length: 128 }),
  feature: varchar("feature", { length: 128 }),
  story: text("story"),
  requirementId: varchar("requirementId", { length: 64 }),
  configItem: varchar("configItem", { length: 128 }),
  workbookTab: varchar("workbookTab", { length: 64 }),
  rogerScreen: varchar("rogerScreen", { length: 128 }),
  expectedResult: text("expectedResult"),
  actualResult: text("actualResult"),
  tester: varchar("tester", { length: 128 }),
  businessReviewer: varchar("businessReviewer", { length: 128 }),
  priority: mysqlEnum("priority", ["Critical", "High", "Medium", "Low"]).default("Medium").notNull(),
  status: mysqlEnum("status", ["Not Started", "In Progress", "Passed", "Failed", "Blocked", "Deferred", "Retest Required", "Production Ready"]).default("Not Started").notNull(),
  defectId: varchar("defectId", { length: 32 }),
  retest: int("retest").default(0).notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UatTestCase = typeof uatTestCases.$inferSelect;
export type InsertUatTestCase = typeof uatTestCases.$inferInsert;

// ─── UAT Defects ──────────────────────────────────────────────────────────────
export const uatDefects = mysqlTable("uat_defects", {
  id: int("id").autoincrement().primaryKey(),
  defectNumber: varchar("defectNumber", { length: 32 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low"]).default("Medium").notNull(),
  priority: mysqlEnum("priority", ["P1", "P2", "P3", "P4"]).default("P2").notNull(),
  assignedDeveloper: varchar("assignedDeveloper", { length: 128 }),
  status: mysqlEnum("status", ["Open", "In Progress", "Fixed", "Closed", "Deferred"]).default("Open").notNull(),
  targetFixDate: varchar("targetFixDate", { length: 16 }),
  retestStatus: mysqlEnum("retestStatus", ["Pending", "Passed", "Failed", "N/A"]).default("Pending").notNull(),
  daysOpen: int("daysOpen").default(0).notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UatDefect = typeof uatDefects.$inferSelect;
export type InsertUatDefect = typeof uatDefects.$inferInsert;

// ─── UAT Risks ────────────────────────────────────────────────────────────────
export const uatRisks = mysqlTable("uat_risks", {
  id: int("id").autoincrement().primaryKey(),
  risk: text("risk").notNull(),
  businessImpact: varchar("businessImpact", { length: 32 }),
  probability: mysqlEnum("probability", ["Critical", "High", "Medium", "Low"]).default("Medium").notNull(),
  mitigation: text("mitigation"),
  owner: varchar("owner", { length: 128 }),
  status: varchar("status", { length: 64 }).default("Open"),
  targetResolution: varchar("targetResolution", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UatRisk = typeof uatRisks.$inferSelect;
export type InsertUatRisk = typeof uatRisks.$inferInsert;

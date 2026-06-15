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
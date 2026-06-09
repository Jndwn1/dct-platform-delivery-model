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
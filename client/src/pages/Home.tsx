// DCT Delivery Model — Authoritative Platform Anchor Page
// RSM | CATT | DCT + Roger
// Design: RSM Deep Navy headers, RSM Green for success/insight, slate for neutral
// Governance realignment: Non-production workspace, architecture visualization only

import React from "react";
import { Link } from "wouter";
import { useState, useMemo, useCallback } from "react";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import GovernanceBanner from "@/components/GovernanceBanner";
import ExecDashboard from "@/components/ExecDashboard";

// ─── Batch Calendar PI 2 + PI 3 (source of truth for Section 2) ─────────────
// Data sourced directly from DCT_Calendar.xlsx, DCT Calendar sheet
// Columns: PI, Status, Batch, Feat, Name, Start, End, What the batch does, Roger UI impact
const BATCH_CALENDAR_PI23 = [
  // ── PI 2 ──
  { pi: "PI 2", status: "Done",        batch: "B4",    feat: "TDC",     name: "AI Mapping Proposals & Decisions",                                   startDate: "",          endDate: "Done",      whatItDoes: "Generates AI tax-mapping proposals with confidence and evidence per account.",                                                                  rogerImpact: "Line Mappings (stage 2)" },
  { pi: "PI 2", status: "Done",        batch: "B5",    feat: "PDC",     name: "Entity Identity & Structure",                                       startDate: "Wed 4/22",  endDate: "Thu 4/30",  whatItDoes: "Gives every client and entity a permanent identity and access scope.",                                                                          rogerImpact: "Client / entity selection" },
  { pi: "PI 2", status: "Done",        batch: "B6",    feat: "TDC",     name: "Practitioner Review & Lock",                                        startDate: "Wed 4/22",  endDate: "Thu 4/30",  whatItDoes: "Practitioners review, decide, and lock mappings; decisions are immutable.",                                                                     rogerImpact: "Review & lock" },
  { pi: "PI 2", status: "Done",        batch: "B2A",   feat: "PDC",     name: "Orchestrator Classification Result & Contract Enforcement",          startDate: "Wed 4/29",  endDate: "Mon 5/9",   whatItDoes: "Enforces the orchestrator's classification result and contract at intake.",                                                                      rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "Done",        batch: "B7",    feat: "TDC",     name: "Client Tax Profile & Eligibility",                                  startDate: "Fri 5/1",   endDate: "Mon 5/11",  whatItDoes: "Holds the client tax profile and determines which rules apply.",                                                                               rogerImpact: "Eligibility" },
  { pi: "PI 2", status: "Done",        batch: "B8",    feat: "PDC",     name: "Exceptions & Remediation",                                          startDate: "Tue 5/12",  endDate: "Wed 5/20",  whatItDoes: "Surfaces cross-LOB ingestion and data exceptions for remediation.",                                                                             rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",        batch: "B8",    feat: "TDC",     name: "Exceptions & Remediation",                                          startDate: "Tue 5/12",  endDate: "Wed 5/20",  whatItDoes: "Surfaces tax-side exceptions for remediation.",                                                                                               rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",        batch: "B9",    feat: "Gateway", name: "Roger Gateway & Governed Consumer Access Layer",                    startDate: "Thu 5/21",  endDate: "Tue 6/2",   whatItDoes: "Governed gateway exposing approved upstream data to consumers.",                                                                               rogerImpact: "None (gateway)" },
  { pi: "PI 2", status: "Done",        batch: "B10",   feat: "TDC",     name: "Return Assembly, Filing & Lineage",                                 startDate: "Wed 6/3",   endDate: "Fri 6/5",   whatItDoes: "Assembles the return, creates the immutable filing record, anchors lineage.",                                                                    rogerImpact: "Form 1120 / filing (stage 10)" },
  { pi: "PI 2", status: "Done",        batch: "B43",   feat: "TDC",     name: "Practitioner Book & Reclass Adjustments",                           startDate: "Wed 6/10",  endDate: "Tue 6/16",  whatItDoes: "Persists practitioner book and reclass adjustments as a multi-line model.",                                                                 rogerImpact: "High: Book Adjustment & Reclass Adjustment (stages 4-5)" },
  { pi: "PI 2", status: "In Progress", batch: "B9",    feat: "Gateway", name: "Roger Gateway - TDC Integration Endpoints",                         startDate: "Wed 6/17",  endDate: "Fri 6/19",  whatItDoes: "Extends the governed gateway to TDC consumers.",                                                                                              rogerImpact: "None (gateway)" },
  { pi: "PI 2", status: "In Progress", batch: "B11",   feat: "TDC",     name: "Learning Governance & Model Evolution",                             startDate: "Wed 6/17",  endDate: "Thu 6/25",  whatItDoes: "Captures learning from real decisions under consent; governs model evolution.",                                                                 rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "In Progress", batch: "B42",   feat: "TDC",     name: "Tax Rules Framework & Book-to-Tax Adjustment Rules",                startDate: "Wed 6/17",  endDate: "Thu 6/25",  whatItDoes: "Computes book-to-tax adjustments from governed, configured rules.",                                                                            rogerImpact: "High: Tax Adjustment (stage 7) + rule admin screen" },
  { pi: "PI 2", status: "Stretch",     batch: "B16",   feat: "PDC",     name: "Audit Trail & Lineage Governance",                                  startDate: "Mon 6/22",  endDate: "Tue 6/30",  whatItDoes: "Records the cross-LOB audit trail and lineage as governed events.",                                                                             rogerImpact: "None (audit / lineage)" },
  // ── PI 3 ──
  { pi: "PI 3", status: "MVP",         batch: "B16",   feat: "TDC",     name: "Audit Trail & Lineage Governance",                                  startDate: "Mon 7/13",  endDate: "Tue 7/21",  whatItDoes: "Records the tax-side audit trail and lineage as governed events.",                                                                             rogerImpact: "None (audit / lineage)" },
  { pi: "PI 3", status: "MVP",         batch: "B31",   feat: "PDC",     name: "Legacy Tool Prior Year Ingestion",                                  startDate: "Wed 7/1",   endDate: "Mon 7/13",  whatItDoes: "Ingests prior-year data from legacy tools (TWB via CDS / DUO).",                                                                              rogerImpact: "Low: prior-year data appears on TB / rollforward" },
  { pi: "PI 3", status: "MVP",         batch: "B28",   feat: "TDC",     name: "Tax Workpaper & Provision Schedules",                               startDate: "Wed 7/22",  endDate: "Thu 7/30",  whatItDoes: "Produces workpapers and provision schedules (M-1/M-3, Sch J/L, depreciation).",                                                               rogerImpact: "High: Book Return Review & Book to Tax Reconciliation (stages 6, 9)" },
  { pi: "PI 3", status: "MVP",         batch: "B9a",   feat: "Gateway", name: "Data Gateway (IMS, CDS, DUO, Tax Portal)",                          startDate: "Tue 7/14",  endDate: "Wed 7/22",  whatItDoes: "Extends the gateway to new sources (IMS, CDS, DUO) for automated retrieval.",                                                                 rogerImpact: "None (gateway / connectors)" },
  { pi: "PI 3", status: "MVP",         batch: "B39",   feat: "TDC",     name: "Calculation Report",                                                startDate: "Fri 7/31",  endDate: "Mon 8/10",  whatItDoes: "Produces the packaged, partner-ready calculation and sign-off report.",                                                                         rogerImpact: "High: Book to Tax Report (stage 8) + packaged report" },
  { pi: "PI 3", status: "MVP",         batch: "B20",   feat: "PDC",     name: "Firm Governance & Professional Standards",                          startDate: "Thu 7/23",  endDate: "Fri 7/31",  whatItDoes: "Holds firm governance and professional standards that gate sign-off.",                                                                          rogerImpact: "None: gates sign-off, no new screen" },
  { pi: "PI 3", status: "MVP",         batch: "B29",   feat: "TDC",     name: "Consolidated Return Assembly",                                      startDate: "Tue 8/11",  endDate: "Wed 8/19",  whatItDoes: "Assembles consolidated C-corp returns with eliminations and group adjustments.",                                                                rogerImpact: "High: consolidated / multi-entity views + Form 1120" },
  { pi: "PI 3", status: "MVP",         batch: "B21",   feat: "PDC",     name: "Quality Control Standards",                                        startDate: "Mon 8/3",   endDate: "Tue 8/11",  whatItDoes: "Holds quality-control review standards and concurring-partner rules.",                                                                          rogerImpact: "None: reference only, no new screen" },
  { pi: "PI 3", status: "MVP",         batch: "B17",   feat: "TDC",     name: "Decision Support, Overrides, Evidence & Workpapers",               startDate: "Thu 8/20",  endDate: "Fri 8/28",  whatItDoes: "Adds override policies, evidence on decisions, and workpaper lock to snapshot.",                                                                rogerImpact: "Med: wire evidence / override / lock into review screens" },
  { pi: "PI 3", status: "MVP",         batch: "B26",   feat: "PDC",     name: "Entity Constituents & Allocations",                                 startDate: "Wed 8/12",  endDate: "Thu 8/20",  whatItDoes: "Models sub-entities (divisions, branches) and inter-entity allocations.",                                                                       rogerImpact: "None: structure only in MVP" },
  { pi: "PI 3", status: "MVP",         batch: "B31",   feat: "TDC",     name: "Legacy Tool Prior Year Data Housing",                               startDate: "Mon 8/31",  endDate: "Wed 9/9",   whatItDoes: "Houses prior-year balances, filed amounts, and carryforwards in TDC.",                                                                          rogerImpact: "Low: prior-year shown on rollforward / TB" },
  { pi: "PI 3", status: "Stretch",     batch: "B33",   feat: "TDC",     name: "State Reference, Apportionment, Payments, NOL/Credit, Forms, TX Franchise", startDate: "Thu 9/10", endDate: "Fri 9/18", whatItDoes: "Adds state apportionment, nexus, payments, NOL/credit, forms, TX franchise.", rogerImpact: "High (stretch): state screens" },
];

// ─── Batch Reference Data (from DCT Calendar v7) ─────────────────────────────
const BATCH_REFERENCE = [
  { pi: "PI 2", status: "Done",      batchNum: "4",   platform: "TDC",      name: "AI Mapping Proposals & Decisions",                                    whatItDoes: "Generates AI tax-mapping proposals with confidence and evidence per account.",                                                                  rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "5",   platform: "PDC",      name: "Entity Identity & Structure",                                        whatItDoes: "Gives every client and entity a permanent identity and access scope.",                                                                          rogerImpact: "Client / entity selection" },
  { pi: "PI 2", status: "Done",      batchNum: "6",   platform: "TDC",      name: "Practitioner Review & Lock",                                         whatItDoes: "Practitioners review, decide, and lock mappings; decisions are immutable.",                                                                     rogerImpact: "Review & lock" },
  { pi: "PI 2", status: "Done",      batchNum: "2A",  platform: "PDC",      name: "Orchestrator Classification Result & Contract Enforcement",           whatItDoes: "Enforces the orchestrator's classification result and contract at intake.",                                                                      rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "Done",      batchNum: "7",   platform: "TDC",      name: "Client Tax Profile & Eligibility",                                   whatItDoes: "Holds the client tax profile and determines which rules apply.",                                                                               rogerImpact: "Eligibility" },
  { pi: "PI 2", status: "Done",      batchNum: "8",   platform: "PDC",      name: "Exceptions & Remediation",                                           whatItDoes: "Surfaces cross-LOB ingestion and data exceptions for remediation.",                                                                             rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",      batchNum: "8",   platform: "TDC",      name: "Exceptions & Remediation",                                           whatItDoes: "Surfaces tax-side exceptions for remediation.",                                                                                               rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",      batchNum: "9",   platform: "Gateway",  name: "Roger Gateway & Governed Consumer Access Layer",                     whatItDoes: "Governed gateway exposing approved upstream data to consumers.",                                                                               rogerImpact: "None (Gateway)" },
  { pi: "PI 2", status: "Done",      batchNum: "1",   platform: "PDC",      name: "File Ingestion & Initial Storage",                                   whatItDoes: "Ingests files, assigns DocumentId, and anchors lineage.",                                                                                    rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "2",   platform: "PDC",      name: "Normalization & Cross-LOB Taxonomy",                                 whatItDoes: "Normalizes financial data and applies cross-LOB taxonomy.",                                                                                   rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "3",   platform: "TDC",      name: "Tax Domain Authority & Tax Taxonomy",                                whatItDoes: "Establishes TDC reference data, tax form templates, and mapping rules.",                                                                      rogerImpact: "None (infrastructure)" },
  { pi: "PI 2", status: "Done",      batchNum: "43",  platform: "PDC",      name: "Practitioner Book & Reclass Adjustments",                            whatItDoes: "Persists practitioner book and reclass adjustments using a multi-line model.",                                                                 rogerImpact: "Book Adjustment & Reclass Adjustment (Stages 4-5)" },
  { pi: "PI 2", status: "Done",      batchNum: "42",  platform: "TDC",      name: "Tax Rules Framework & Book-to-Tax Adjustment Rules",                 whatItDoes: "Computes book-to-tax adjustments using governed rules.",                                                                                      rogerImpact: "Tax Adjustment (Stage 7) + Rule Administration" },
  { pi: "PI 2", status: "Done",      batchNum: "10",  platform: "TDC",      name: "Return Assembly, Filing & Lineage",                                  whatItDoes: "Assembles return and filing records and anchors lineage.",                                                                                    rogerImpact: "Form 1120 / Filing (Stage 10)" },
  { pi: "PI 2", status: "Done",      batchNum: "16",  platform: "PDC",      name: "Known Mappings Lookup",                                              whatItDoes: "Provides a lookup layer for previously confirmed tax mappings.",                                                                               rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "16",  platform: "TDC",      name: "Known Mappings Lookup",                                              whatItDoes: "TDC-side lookup for confirmed mapping decisions.",                                                                                            rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 2", status: "Done",      batchNum: "13",  platform: "TDC",      name: "API Route Standardization",                                          whatItDoes: "Standardizes TDC API routes for governed consumer access.",                                                                                   rogerImpact: "None (infrastructure)" },
  { pi: "PI 3", status: "In Progress", batchNum: "42", platform: "TDC",     name: "Tax Rules Framework (PI 3 continuation)",                            whatItDoes: "Extends book-to-tax adjustment rules for additional scenarios.",                                                                               rogerImpact: "Tax Adjustment (Stage 7)" },
  { pi: "PI 3", status: "In Progress", batchNum: "17", platform: "PDC",     name: "Many-to-Many Form Line Mapping & Jurisdiction-Aware Derivation",     whatItDoes: "Supports many-to-many form line mappings with jurisdiction-aware tax derivation.",                                                              rogerImpact: "Line Mappings (Stage 2) + Jurisdiction" },
  { pi: "PI 3", status: "Planned",   batchNum: "20",  platform: "TDC",      name: "Apportionment & State Allocation",                                   whatItDoes: "Handles state apportionment and income allocation across jurisdictions.",                                                                     rogerImpact: "State Apportionment" },
  { pi: "PI 3", status: "Planned",   batchNum: "21",  platform: "PDC",      name: "Multi-Entity Consolidation",                                         whatItDoes: "Consolidates financial data across multiple entities for group-level reporting.",                                                              rogerImpact: "Consolidation View" },
  { pi: "PI 3", status: "Planned",   batchNum: "26",  platform: "PDC",      name: "Known Mappings — Confirmed Classification Retrieval",                whatItDoes: "Retrieves and surfaces confirmed classification decisions for practitioner review.",                                                             rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 3", status: "Planned",   batchNum: "28",  platform: "TDC",      name: "Deferred Tax & Temporary Differences",                               whatItDoes: "Computes deferred tax assets/liabilities and temporary differences.",                                                                         rogerImpact: "Deferred Tax" },
  { pi: "PI 3", status: "Planned",   batchNum: "29",  platform: "TDC",      name: "Credits & Incentives",                                               whatItDoes: "Identifies and applies eligible tax credits and incentives.",                                                                                 rogerImpact: "Credits & Incentives" },
  { pi: "PI 3", status: "Planned",   batchNum: "31",  platform: "TDC",      name: "Partnership K-1 & Pass-Through Allocation",                          whatItDoes: "Handles K-1 income allocation and pass-through entity tax treatment.",                                                                         rogerImpact: "K-1 / Pass-Through" },
  { pi: "PI 3", status: "Planned",   batchNum: "9A",  platform: "Gateway",  name: "Roger Gateway — Extended Consumer Contracts",                        whatItDoes: "Extends the Roger Gateway with additional governed consumer contracts.",                                                                       rogerImpact: "Gateway Expansion" },
  { pi: "PI 3", status: "Planned",   batchNum: "39",  platform: "TDC",      name: "International Tax — GILTI, FDII, BEAT",                              whatItDoes: "Computes international tax provisions including GILTI, FDII, and BEAT.",                                                                      rogerImpact: "International Tax" },
  { pi: "PI 3", status: "Stretch",   batchNum: "33",  platform: "TDC",      name: "S-Corp & Flow-Through Specialization",                               whatItDoes: "S-Corp and flow-through entity tax specialization.",                                                                                         rogerImpact: "S-Corp / Flow-Through" },
  { pi: "PI 4", status: "Planned",   batchNum: "19",  platform: "TDC",      name: "Estimated Tax & Safe Harbor",                                        whatItDoes: "Manages estimated tax payments and safe harbor calculations.",                                                                                rogerImpact: "Estimated Tax" },
  { pi: "PI 4", status: "Planned",   batchNum: "21",  platform: "TDC",      name: "Multi-Entity Consolidation (TDC)",                                   whatItDoes: "TDC-side consolidation for group-level tax reporting.",                                                                                      rogerImpact: "Consolidation View" },
  { pi: "PI 4", status: "Planned",   batchNum: "26",  platform: "TDC",      name: "Known Mappings — TDC Contract Publication",                          whatItDoes: "Publishes confirmed TDC mapping contracts for downstream consumers.",                                                                          rogerImpact: "Line Mappings (Stage 2)" },
  { pi: "PI 4", status: "Planned",   batchNum: "35",  platform: "TDC",      name: "Corporate AMT & Book Income Adjustment",                             whatItDoes: "Computes corporate alternative minimum tax and book income adjustments.",                                                                     rogerImpact: "AMT / Book Income" },
  { pi: "PI 4", status: "Planned",   batchNum: "40",  platform: "TDC",      name: "Interest Expense Limitation (163j)",                                 whatItDoes: "Applies Section 163(j) interest expense limitation rules.",                                                                                  rogerImpact: "163(j) Limitation" },
  { pi: "PI 4", status: "Planned",   batchNum: "22",  platform: "PDC",      name: "Client Communication & Outstanding Items",                           whatItDoes: "Client communication and outstanding items management.",                                                                                     rogerImpact: "Post-MVP" },
  { pi: "PI 4", status: "Planned",   batchNum: "23",  platform: "PDC",      name: "Benchmark & Peer Analytics",                                         whatItDoes: "Benchmark and peer analytics for practitioner insight.",                                                                                     rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "11",  platform: "TDC",      name: "NOL & Capital Loss Carryforward",                                    whatItDoes: "Tracks and applies NOL and capital loss carryforward balances.",                                                                              rogerImpact: "NOL / Capital Loss" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "12",  platform: "TDC",      name: "Tax Attribute Preservation & Limitation (382)",                      whatItDoes: "Manages tax attribute preservation and Section 382 limitations.",                                                                             rogerImpact: "Tax Attributes" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "27",  platform: "TDC",      name: "Foreign Tax Credit & Sourcing",                                      whatItDoes: "Computes foreign tax credits and income sourcing.",                                                                                           rogerImpact: "Foreign Tax Credit" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "30",  platform: "TDC",      name: "Qualified Business Income (QBI) Deduction",                          whatItDoes: "Computes the Section 199A QBI deduction.",                                                                                                   rogerImpact: "QBI Deduction" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "32",  platform: "TDC",      name: "R&D Tax Credit",                                                     whatItDoes: "Identifies and computes R&D tax credits.",                                                                                                   rogerImpact: "R&D Credit" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "36",  platform: "TDC",      name: "Partnership Specialization",                                         whatItDoes: "Partnership specialization (1065).",                                                                                                         rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "14",  platform: "TDC",      name: "Tax Computation Rules (in-Roger engine)",                            whatItDoes: "In-Roger tax computation engine (limitation rules, rate/threshold tables).",                                                                  rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "15",  platform: "TDC",      name: "Tax Provision Reference & ASC 740 (in-Roger engine)",               whatItDoes: "Tax provision reference & ASC 740.",                                                                                                         rogerImpact: "Post-MVP" },
  { pi: "PI 5", status: "Post-MVP",  batchNum: "18",  platform: "TDC",      name: "Provision Computation, DTA/DTL & ETR",                               whatItDoes: "Provision computation, DTA/DTL & ETR.",                                                                                                      rogerImpact: "Post-MVP" },
  { pi: "",     status: "Future",    batchNum: "37",  platform: "TDC",      name: "Trust Specialization (1041)",                                        whatItDoes: "Trust specialization (1041).",                                                                                                               rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "38",  platform: "TDC",      name: "Individual Specialization (1040)",                                   whatItDoes: "Individual specialization (1040).",                                                                                                          rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "TBD", platform: "",         name: "Exempt Org Returns (990, 990-PF)",                                   whatItDoes: "Exempt org returns (990, 990-PF).",                                                                                                          rogerImpact: "Future" },
  { pi: "",     status: "Future",    batchNum: "TBD", platform: "",         name: "International Beyond K-2/K-3 (5471, GILTI, FDI, FTC)",              whatItDoes: "International beyond K-2/K-3 (5471, GILTI, FDI, FTC).",                                                                                     rogerImpact: "Future" },
  { pi: "",     status: "Parked",    batchNum: "24",  platform: "PDC",      name: "Advisory Opportunity Reference (superseded by Blue J)",              whatItDoes: "Advisory opportunity reference (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "24",  platform: "TDC",      name: "Advisory Opportunity Reference (superseded by Blue J)",              whatItDoes: "Advisory opportunity reference (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "25",  platform: "PDC",      name: "Advisory Opportunity Detection (superseded by Blue J)",              whatItDoes: "Advisory opportunity detection (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
  { pi: "",     status: "Parked",    batchNum: "25",  platform: "TDC",      name: "Advisory Opportunity Detection (superseded by Blue J)",              whatItDoes: "Advisory opportunity detection (superseded by Blue J).",                                                                                     rogerImpact: "Parked" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children, accent }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "blue" | "green" | "red" | "amber" | "slate";
}) {
  const accentMap: Record<string, string> = {
    blue:  "#1e3a5f",
    green: "#065f46",
    red:   "#7f1d1d",
    amber: "#78350f",
    slate: "#1e293b",
  };
  const borderColor = accentMap[accent ?? "slate"];
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{
        borderLeft: `4px solid ${borderColor}`,
        paddingLeft: "14px",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "2px" }}>
          {subtitle}
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Flow node ────────────────────────────────────────────────────────────────
function FlowNode({ label, owner, color, isGap }: { label: string; owner: string; color: string; isGap?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "110px" }}>
      <div style={{
        backgroundColor: isGap ? "#fef2f2" : color,
        border: `2px solid ${isGap ? "#ef4444" : color}`,
        borderRadius: "8px",
        padding: "10px 14px",
        textAlign: "center",
        width: "100%",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: isGap ? "#dc2626" : "white", lineHeight: "1.3" }}>{label}</div>
      </div>
      <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>{owner}</div>
    </div>
  );
}

function FlowArrow({ broken }: { broken?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "2px" }}>
      <div style={{ fontSize: "18px", color: broken ? "#ef4444" : "#94a3b8", lineHeight: 1 }}>
        {broken ? "✕" : "→"}
      </div>
    </div>
  );
}

// ─── Invariant card ───────────────────────────────────────────────────────────
function InvariantCard({ index, text }: { index: number; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
      borderRadius: "8px", padding: "12px 14px",
    }}>
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        backgroundColor: "#059669", color: "white",
        fontSize: "11px", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {index}
      </div>
      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Failure mode card ────────────────────────────────────────────────────────
function FailureCard({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      backgroundColor: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: "8px", padding: "10px 14px",
    }}>
      <div style={{ color: "#dc2626", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>⚠</div>
      <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Batch row ────────────────────────────────────────────────────────────────
// Maps Home.tsx batch IDs ("FC", "1", "2A", etc.) to BatchStatusContext keys
function toBatchKey(id: string): string {
  if (id === "FC") return "foundation-core";
  return id.toLowerCase();
}

function BatchRow({ id, name, scope }: { id: string; name: string; scope: string }) {
  const { statuses } = useBatchStatus();
  const key = toBatchKey(id);
  const ctxStatus = statuses[key as keyof typeof statuses];

  // Derive badge appearance from live context status
  let badgeLabel: string;
  let badgeBg: string;
  let badgeText: string;
  let dotColor: string;

  if (ctxStatus === "Complete") {
    badgeLabel = "Done"; badgeBg = "#f0fdf4"; badgeText = "#166534"; dotColor = "#059669";
  } else if (ctxStatus === "In Progress" || ctxStatus === "MVP" || ctxStatus === "Stretch") {
    badgeLabel = "Active"; badgeBg = "#fff7ed"; badgeText = "#9a3412"; dotColor = "#ea580c";
  } else if (ctxStatus === "Ready for QA" || ctxStatus === "QA In Progress" || ctxStatus === "Demo Ready") {
    badgeLabel = "QA"; badgeBg = "#faf5ff"; badgeText = "#6b21a8"; dotColor = "#a855f7";
  } else if (ctxStatus === "Delivered") {
    badgeLabel = "Delivered"; badgeBg = "#ecfdf5"; badgeText = "#065f46"; dotColor = "#10b981";
  } else if (ctxStatus === "Blocked") {
    badgeLabel = "Blocked"; badgeBg = "#fef2f2"; badgeText = "#991b1b"; dotColor = "#ef4444";
  } else {
    // Not Started / unknown
    badgeLabel = "Planned"; badgeBg = "#f8fafc"; badgeText = "#475569"; dotColor = "#94a3b8";
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "60px 1fr 1fr auto",
      gap: "12px", alignItems: "start",
      padding: "10px 14px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "13px",
    }}>
      <div style={{
        fontWeight: 700, color: "#0f1623",
        backgroundColor: "#e2e8f0", borderRadius: "4px",
        padding: "2px 6px", textAlign: "center", fontSize: "11px",
      }}>{id}</div>
      <div style={{ color: "#1e293b", fontWeight: 600 }}>{name}</div>
      <div style={{ color: "#475569" }}>{scope}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
        backgroundColor: badgeBg, color: badgeText,
        border: `1px solid ${dotColor}30`,
        borderRadius: "4px", padding: "2px 7px", whiteSpace: "nowrap",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: dotColor, flexShrink: 0, display: "inline-block" }} />
        {badgeLabel}
      </div>
    </div>
  );
}

// ─── Batch Portfolio Overview (Section 2) ─────────────────────────────────────
function BatchReferenceGuide() {
  const [search, setSearch] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Done:           { bg: "#f0fdf4", text: "#059669", border: "#bbf7d0" },
    "In Progress":  { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    MVP:            { bg: "#faf5ff", text: "#7c3aed", border: "#e9d5ff" },
    Stretch:        { bg: "#fff7ed", text: "#b45309", border: "#fde68a" },
    "On Hold":      { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
  };
  const featColors: Record<string, string> = {
    PDC: "#1e3a5f", TDC: "#065f46", Gateway: "#7c3aed",
  };

  const highImpactKeywords = [
    "book adjustment", "tax adjustment", "form 1120", "consolidated return",
    "workpaper", "provision", "calculation report", "state screens",
  ];
  const isHighImpact = (roger: string) =>
    highImpactKeywords.some(kw => roger.toLowerCase().includes(kw));

  const pi2Rows = useMemo(() => BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 2" && (
    !search ||
    b.batch.toLowerCase().includes(search.toLowerCase()) ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.whatItDoes.toLowerCase().includes(search.toLowerCase()) ||
    b.rogerImpact.toLowerCase().includes(search.toLowerCase())
  )), [search]);

  const pi3Rows = useMemo(() => BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 3" && (
    !search ||
    b.batch.toLowerCase().includes(search.toLowerCase()) ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.whatItDoes.toLowerCase().includes(search.toLowerCase()) ||
    b.rogerImpact.toLowerCase().includes(search.toLowerCase())
  )), [search]);

  const totalShown = pi2Rows.length + pi3Rows.length;

  const renderGroup = (label: string, rows: typeof BATCH_CALENDAR_PI23, groupOffset: number) => (
    <>
      {/* PI Group Header */}
      <div style={{
        backgroundColor: "#1e293b",
        padding: "8px 14px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>{rows.length} batches</div>
      </div>
      {rows.map((b, idx) => {
        const globalIdx = groupOffset + idx;
        const sc = statusColors[b.status] ?? { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
        const isExpanded = expandedIdx === globalIdx;
        const highImpact = isHighImpact(b.rogerImpact);
        const noImpact = b.rogerImpact.toLowerCase().startsWith("none");
        return (
          <div key={`${b.pi}-${b.batch}-${idx}`}
            style={{
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: isExpanded ? "#f0f9ff" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
              cursor: "pointer",
            }}
            onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "90px 70px 1fr 90px 90px 1fr 1fr",
              gap: "8px",
              padding: "9px 14px",
              alignItems: "start",
            }}>
              {/* Status badge */}
              <div style={{
                fontSize: "10px", fontWeight: 700,
                backgroundColor: sc.bg, color: sc.text,
                border: `1px solid ${sc.border}`,
                borderRadius: "4px", padding: "2px 7px",
                textAlign: "center", whiteSpace: "nowrap",
                alignSelf: "center",
              }}>{b.status}</div>
              {/* Batch */}
              <div style={{
                fontWeight: 800, fontSize: "12px", color: "#0f1623",
                backgroundColor: "#e2e8f0", borderRadius: "4px",
                padding: "2px 6px", textAlign: "center",
                alignSelf: "center",
              }}>{b.batch}</div>
              {/* Title */}
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", lineHeight: "1.4" }}>
                {b.name}
                <span style={{ marginLeft: "5px", fontSize: "9px", color: "#94a3b8" }}>{isExpanded ? "▲" : "▼"}</span>
                <div style={{ fontSize: "10px", fontWeight: 600, color: featColors[b.feat] ?? "#475569", marginTop: "2px" }}>{b.feat}</div>
              </div>
              {/* Start Date */}
              <div style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace", paddingTop: "2px" }}>{b.startDate || "—"}</div>
              {/* End Date */}
              <div style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace", paddingTop: "2px" }}>{b.endDate || "—"}</div>
              {/* What it Does */}
              <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>{b.whatItDoes}</div>
              {/* Roger UI Impact */}
              <div style={{
                fontSize: "11px", fontWeight: 600, lineHeight: "1.4",
                color: highImpact ? "#059669" : noImpact ? "#94a3b8" : "#1e293b",
                backgroundColor: highImpact ? "#f0fdf4" : "transparent",
                borderRadius: highImpact ? "4px" : undefined,
                padding: highImpact ? "2px 6px" : undefined,
                border: highImpact ? "1px solid #bbf7d0" : undefined,
              }}>{b.rogerImpact}</div>
            </div>
            {/* Expanded detail */}
            {isExpanded && (
              <div style={{
                padding: "10px 14px 12px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f0f9ff",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
              }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>What the Batch Does</div>
                  <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>{b.whatItDoes}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Roger UI Impact</div>
                  <div style={{ fontSize: "13px", color: highImpact ? "#059669" : "#1e293b", fontWeight: 600, lineHeight: "1.6" }}>{b.rogerImpact}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Schedule</div>
                  <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>
                    <span style={{ fontWeight: 600 }}>Start:</span> {b.startDate || "—"}<br />
                    <span style={{ fontWeight: 600 }}>End:</span> {b.endDate || "—"}<br />
                    <span style={{ fontWeight: 600 }}>Platform:</span> {b.feat}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "14px" }}>
        Delivery schedule and Roger practitioner impact for PI 2 (Current Delivery) and PI 3 (MVP Target).
        Source: DCT Calendar v7 · Columns J (What the Batch Does) and K (Roger UI Impact).
      </div>

      {/* Search */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search batch, title, description, or Roger impact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: "1 1 300px", padding: "7px 12px", fontSize: "13px",
            border: "1px solid #cbd5e1", borderRadius: "6px",
            outline: "none", color: "#1e293b", backgroundColor: "#ffffff",
          }}
        />
        <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
          {totalShown} of {BATCH_CALENDAR_PI23.length} batches
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        {/* Column header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "90px 70px 1fr 90px 90px 1fr 1fr",
          gap: "8px",
          backgroundColor: "#0f1623",
          padding: "9px 14px",
        }}>
          {["Status", "Batch", "Title", "Start Date", "End Date", "What the Batch Does", "Roger UI Impact"].map(h => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {totalShown === 0 && (
          <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>No batches match your search.</div>
        )}

        {pi2Rows.length > 0 && renderGroup("PI 2 – Current Delivery", pi2Rows, 0)}
        {pi3Rows.length > 0 && renderGroup("PI 3 – MVP", pi3Rows, pi2Rows.length)}
      </div>
    </>
  );
}


// ─── Collapsible accordion wrapper ──────────────────────────────────────────
function Accordion({ id, title, subtitle, accent, children, defaultOpen = false, open: controlledOpen, onToggle }: {
  id: string; title: string; subtitle?: string; children: React.ReactNode;
  accent?: "blue" | "green" | "red" | "amber" | "slate"; defaultOpen?: boolean;
  open?: boolean; onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onToggle ?? (() => setInternalOpen(o => !o));
  const accentMap: Record<string, string> = {
    blue: "#1e3a5f", green: "#065f46", red: "#7f1d1d", amber: "#78350f", slate: "#1e293b",
  };
  const borderColor = accentMap[accent ?? "slate"];
  return (
    <div
      id={id}
      style={{
        marginBottom: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen()}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
          borderLeft: `4px solid ${borderColor}`,
          textAlign: "left",
        }}
      >
        <div>
          {subtitle && (
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "1px" }}>
              {subtitle}
            </div>
          )}
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f1623" }}>{title}</div>
        </div>
        <div style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 400, flexShrink: 0, marginLeft: "12px", transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</div>
      </button>
      {/* Body */}
      <div style={{
        maxHeight: open ? "9999px" : "0",
        overflow: "hidden",
        transition: "max-height 0.35s ease",
      }}>
        <div style={{ padding: "0 16px 16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { gates } = useBatchStatus();

  // Readiness Status — current PI (PI 2) metrics derived from Batch Calendar
  const pi2Batches = BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 2");
  const pi2Total = pi2Batches.length;
  const pi2Done = pi2Batches.filter(b => b.status === "Done").length;
  const pi2Active = pi2Batches.filter(b => b.status === "In Progress").length;
  const pi2Planned = pi2Batches.filter(b => b.status !== "Done" && b.status !== "In Progress").length;
  const overallPct = pi2Total > 0 ? Math.round((pi2Done / pi2Total) * 100) : 0;

  // Lifted accordion open state — keyed by accordion id
  const ACCORDION_IDS = [
    "section-purpose",
    "section-work-status", "section-architecture", "section-ownership",
    "section-governance", "section-capabilities", "section-guardrails",
    "section-dependencies", "section-failure-modes",
  ];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(ACCORDION_IDS.map(id => [id, false]))
  );
  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const scrollToSection = useCallback((id: string) => {
    // Expand the accordion first, then scroll after a short delay
    if (ACCORDION_IDS.includes(id)) {
      setOpenSections(prev => ({ ...prev, [id]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  }, []);

  // Quick Navigation items — blue = expand accordion on this page, green = external page link
  const quickNavItems = [
    { label: "Purpose",               id: "section-purpose",       internal: true },
    { label: "Batch Portfolio",       id: "section-work-status",   internal: true },
    { label: "End-to-End Flow",       id: "section-architecture",  internal: true },
    { label: "System Ownership",      id: "section-ownership",     internal: true },
    { label: "Foundation Invariants", id: "section-governance",    internal: true },
    { label: "Platform Capabilities", id: "section-capabilities",  internal: true },
    { label: "Architecture Guardrails",id: "section-guardrails",   internal: true },
    { label: "Roger Connection",      id: "section-dependencies",  internal: true },
    { label: "Failure Modes",         id: "section-failure-modes", internal: true },
    { label: "Ask Buddy",             id: "",                       internal: false, href: "/ask-buddy" },
    { label: "Batch Delivery Calendar",id: "",                      internal: false, href: "/batch-calendar" },
  ];

  // Delivery Highlights — active batches in progress
  const activeBatches = BATCH_CALENDAR_PI23.filter(b => b.status === "In Progress");
  const stretchBatches = BATCH_CALENDAR_PI23.filter(b => b.status === "Stretch");
  const pi3MvpCount = BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 3" && b.status === "MVP").length;

  return (
    <div style={{ width: "95%", maxWidth: "1600px", margin: "0 auto", fontFamily: "system-ui, sans-serif", paddingBottom: "40px" }}>

      {/* ═══════════════════════════════════════════════════════════════════════
           EXECUTIVE HERO BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #0f1623 0%, #1e3a5f 60%, #0f2d1a 100%)",
        borderRadius: "14px",
        padding: "32px 40px",
        marginBottom: "0",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />

        {/* Top row: title + meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                backgroundColor: "rgba(5,150,105,0.25)", border: "2px solid #059669",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#34d399", fontWeight: 900, fontSize: "20px",
              }}>D</div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  DCT Delivery Model
                </h1>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  RSM · CATT · Governance &amp; Architecture Readiness Workspace
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, color: "#34d399",
                backgroundColor: "rgba(5,150,105,0.2)", border: "1px solid rgba(52,211,153,0.4)",
                borderRadius: "20px", padding: "3px 10px",
              }}>● ACTIVE — PI 2</span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Entity, Workflow &amp; Tax Ready · Apr–Jun 2026</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Data as of: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
          {/* Release Candidate Status */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px", padding: "14px 20px", textAlign: "center", minWidth: "160px",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Release Candidate</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#34d399" }}>RC-2</div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Target: Sep 16, 2026</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "24px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>PI 2 Readiness</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#34d399" }}>{overallPct}% Complete</span>
          </div>
          <div style={{ height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${overallPct}%`, background: "linear-gradient(90deg, #059669, #34d399)", borderRadius: "5px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginTop: "20px", position: "relative" }}>
          {[
            { label: "Batches Done",    value: pi2Done,    sub: "PI 2 complete",       color: "#34d399" },
            { label: "In Progress",    value: pi2Active,  sub: "Active this week",    color: "#60a5fa" },
            { label: "Remaining",      value: pi2Planned, sub: "PI 2 to close",       color: "#94a3b8" },
            { label: "PI 3 MVP",       value: pi3MvpCount,sub: "Batches queued",      color: "#a78bfa" },
            { label: "Total Batches",  value: BATCH_CALENDAR_PI23.length, sub: "PI 2 + PI 3", color: "#fb923c" },
          ].map(k => (
            <div key={k.label} style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "14px 16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0", marginTop: "4px" }}>{k.label}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════════════════
           EXECUTIVE NAVIGATION TOOLBAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <div id="quick-nav" style={{
        backgroundColor: "#1e293b",
        borderRadius: "8px",
        padding: "0 16px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "stretch",
        height: "40px",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Label */}
        <div style={{
          fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#64748b",
          display: "flex", alignItems: "center",
          paddingRight: "12px",
          borderRight: "1px solid #334155",
          marginRight: "4px",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          Navigate
        </div>

        {/* Internal section buttons */}
        {quickNavItems.filter(i => i.internal).map((item, idx, arr) => (
          <React.Fragment key={item.label}>
            <button
              onClick={() => scrollToSection(item.id)}
              style={{
                fontSize: "11px", fontWeight: 600, color: "#cbd5e1",
                backgroundColor: "transparent", border: "none",
                padding: "0 12px",
                cursor: "pointer", whiteSpace: "nowrap",
                display: "flex", alignItems: "center",
                height: "100%",
                transition: "color 0.15s, background-color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#334155"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1"; (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
            >
              {item.label}
            </button>
            {idx < arr.length - 1 && (
              <div style={{ width: "1px", backgroundColor: "#334155", margin: "8px 0", flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}

        {/* Divider before external links */}
        <div style={{ flex: 1 }} />
        <div style={{ width: "1px", backgroundColor: "#334155", margin: "8px 0", flexShrink: 0 }} />

        {/* External links */}
        {quickNavItems.filter(i => !i.internal).map((item, idx, arr) => (
          <React.Fragment key={item.label}>
            <Link href={item.href ?? "/"}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", fontWeight: 700, color: "#34d399",
                backgroundColor: "transparent",
                padding: "0 12px",
                cursor: "pointer", whiteSpace: "nowrap",
                height: "40px",
                lineHeight: "40px",
              }}>
                {item.label} ↗
              </span>
            </Link>
            {idx < arr.length - 1 && (
              <div style={{ width: "1px", backgroundColor: "#334155", margin: "8px 0", flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Executive Delivery Dashboard (always visible) ── */}
      <div id="exec-dashboard-anchor">
        <ExecDashboard batches={BATCH_REFERENCE} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
           DELIVERY HIGHLIGHTS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "20px 28px",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f1623" }}>Delivery Highlights</div>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>Week of Jun 18, 2026</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>

          {/* Active Batches */}
          <div style={{ backgroundColor: "#eff6ff", borderRadius: "8px", padding: "14px 16px", borderLeft: "3px solid #2563eb" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>🔵 Active Batches</div>
            {activeBatches.map(b => (
              <div key={b.batch + b.feat} style={{ fontSize: "12px", color: "#1e3a5f", marginBottom: "4px", display: "flex", gap: "6px" }}>
                <span style={{ fontWeight: 700, minWidth: "36px" }}>{b.batch}</span>
                <span style={{ color: "#475569" }}>{b.name}</span>
              </div>
            ))}
            {activeBatches.length === 0 && <div style={{ fontSize: "12px", color: "#94a3b8" }}>No active batches</div>}
          </div>

          {/* Upcoming Milestones */}
          <div style={{ backgroundColor: "#faf5ff", borderRadius: "8px", padding: "14px 16px", borderLeft: "3px solid #7c3aed" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#4c1d95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>🟣 Upcoming Milestones</div>
            {stretchBatches.map(b => (
              <div key={b.batch + b.feat} style={{ fontSize: "12px", color: "#4c1d95", marginBottom: "4px", display: "flex", gap: "6px" }}>
                <span style={{ fontWeight: 700, minWidth: "36px" }}>{b.batch}</span>
                <span style={{ color: "#6b21a8" }}>{b.name} <span style={{ color: "#94a3b8" }}>({b.startDate}–{b.endDate})</span></span>
              </div>
            ))}
            <div style={{ fontSize: "12px", color: "#4c1d95", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #e9d5ff" }}>
              <span style={{ fontWeight: 700 }}>PI 3 MVP</span> — {pi3MvpCount} batches queued · Target Aug–Sep 2026
            </div>
          </div>

          {/* Release Readiness */}
          <div style={{ backgroundColor: "#f0fdf4", borderRadius: "8px", padding: "14px 16px", borderLeft: "3px solid #059669" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>🟢 Release Readiness</div>
            {[
              { label: "PI 2 Completion",   value: `${overallPct}%`, ok: overallPct >= 70 },
              { label: "Gates Passed",      value: `${[gates.g1, gates.g2, gates.g3, gates.g4].filter(g => g === "Complete").length} / 4`, ok: [gates.g1, gates.g2].every(g => g === "Complete") },
              { label: "RC Status",         value: "RC-2 On Track",   ok: true },
              { label: "MVP-Required Close",value: "Sep 16, 2026",    ok: true },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                <span style={{ color: "#374151" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.ok ? "#059669" : "#dc2626" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Accordion: Purpose (collapsed by default) ── */}
      <Accordion id="section-purpose" open={openSections["section-purpose"]} onToggle={() => toggleSection("section-purpose")} title="Purpose" subtitle="Section 1 — Platform Overview & Governance Context" accent="slate">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            DCT is a <strong>governed, batch-driven architecture and readiness model</strong> that structures how financial data is ingested,
            normalized, classified, and made available for tax decision-making across RSM's enterprise platform.
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            It enforces a <strong>strict separation of concerns</strong> between financial data (PDC), tax decisions (TDC),
            AI orchestration (Orchestrator), and practitioner consumption (Roger) — ensuring no system owns
            responsibilities outside its defined boundary.
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            The result is <strong>deterministic, traceable, API-driven architecture patterns</strong> that can be audited, replayed,
            and validated at every layer of the platform.
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px", marginTop: 8 }}>
            <strong style={{ color: "#92400e" }}>Governance Note:</strong> This workspace visualizes architecture patterns, readiness status, and governance structures using mock and seed data. It is not a production system, system of record, or integrated operational platform. All outputs require formal enterprise implementation outside this workspace.
          </p>
        </div>
      </Accordion>

      {/* ── Accordion: Batch Portfolio Overview ── */}
      <Accordion id="section-work-status" open={openSections["section-work-status"]} onToggle={() => toggleSection("section-work-status")} title="Batch Portfolio Overview" subtitle="Section 2 — PI 2 & PI 3 Delivery Units" accent="blue">
        <BatchReferenceGuide />
      </Accordion>

      {/* ── Accordion: End-to-End Delivery Model ── */}
      <Accordion id="section-architecture" open={openSections["section-architecture"]} onToggle={() => toggleSection("section-architecture")} title="End-to-End Delivery Model" subtitle="Section 3 — Critical Visual" accent="blue">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "20px 24px",
          overflowX: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "700px" }}>
            <FlowNode label="Tax Portal" owner="Ingestion" color="#334155" />
            <FlowArrow />
            <FlowNode label="Service Bus" owner="Event Trigger" color="#475569" />
            <FlowArrow />
            <FlowNode label="PDC" owner="Financial Data" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="Orchestrator" owner="Stateless AI" color="#7c3aed" />
            <FlowArrow />
            <FlowNode label="PDC (Classified)" owner="Normalized + FirmTaxonomyId" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="TDC" owner="Tax Decisions" color="#065f46" />
            <FlowArrow />
            <FlowNode label="Roger" owner="Read-Only UI" color="#0f1623" />
          </div>
          <div style={{ marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { color: "#1e3a5f", label: "PDC (Phoenix Data Consolidation) — Financial truth, lineage anchor" },
              { color: "#7c3aed", label: "Orchestrator — Stateless, no persistence" },
              { color: "#065f46", label: "TDC (Tax Data Consolidation) — Tax decisions, immutable" },
              { color: "#0f1623", label: "Roger — Read-only, no writes" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#475569" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ── Accordion: System Ownership Model ── */}
      <Accordion id="section-ownership" open={openSections["section-ownership"]} onToggle={() => toggleSection("section-ownership")} title="System Ownership Model" subtitle="Section 4 — No Overlapping Ownership" accent="blue">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
            backgroundColor: "#0f1623", padding: "10px 16px", gap: "12px",
          }}>
            {["Layer", "System", "Responsibility"].map(h => (
              <div key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {[
            { layer: "Ingestion",       system: "Tax Portal",      resp: "File intake, event trigger via Service Bus. Assigns DocumentId at boundary." },
            { layer: "Data Foundation", system: "PDC",             resp: "Financial data storage, lineage anchor (DocumentId), normalization, classification storage. System of record for financial truth." },
            { layer: "Orchestration",   system: "AI Orchestrator", resp: "Stateless processing only. Applies taxonomy rules and returns FirmTaxonomyId. No persistence, no ownership of data." },
            { layer: "Tax Decision",    system: "TDC",             resp: "Tax mapping, adjustments, tax-ready record derivation, eligibility. System of record for all tax decisions. Immutable audit trail." },
            { layer: "Consumption",     system: "Roger",           resp: "Read-only practitioner UI. Reads from TDC primary contract only. No writes, no transformations." },
          ].map((row, i) => (
            <div key={row.layer} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
              gap: "12px", padding: "12px 16px",
              backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              fontSize: "13px",
            }}>
              <div style={{ fontWeight: 700, color: "#0f1623" }}>{row.layer}</div>
              <div style={{ fontWeight: 600, color: "#2563eb" }}>{row.system}</div>
              <div style={{ color: "#475569", lineHeight: "1.5" }}>{row.resp}</div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Accordion: Foundation Invariants ── */}
      <Accordion id="section-governance" open={openSections["section-governance"]} onToggle={() => toggleSection("section-governance")} title="What Must Be True — Foundation Invariants" subtitle="Section 5 — Non-Negotiable Rules" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            "All data must enter through a governed ingestion boundary — no direct system writes.",
            "Every file must be assigned a DocumentId at ingestion. DocumentId is immutable.",
            "DocumentId is the lineage anchor across all systems — PDC, TDC, and Roger.",
            "Data is scoped using EntityId + PeriodStart + PeriodEnd. TaxYear is derived in TDC only — not stored in PDC.",
            "PDC is the system of record for financial data and lineage. No other system may own financial truth.",
            "TDC is the system of record for all tax decisions. Decisions are immutable once locked.",
            "The Orchestrator is stateless. It must not persist data, own records, or hold state between calls.",
            "All system interactions must occur via APIs only. No direct system coupling is permitted.",
          ].map((text, i) => (
            <InvariantCard key={i} index={i + 1} text={text} />
          ))}
        </div>
      </Accordion>

      {/* ── Accordion: Platform Capabilities ── */}
      <Accordion id="section-capabilities" open={openSections["section-capabilities"]} onToggle={() => toggleSection("section-capabilities")} title="What This Enables" subtitle="Section 6 — Platform Capabilities" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { icon: "⟳", title: "Deterministic Processing", desc: "Same input always produces the same output. Results are reproducible and auditable." },
            { icon: "⌥", title: "Full Lineage & Traceability", desc: "Every record traces back to its DocumentId origin through all system layers." },
            { icon: "⟷", title: "Cross-System Interoperability", desc: "PDC ↔ TDC ↔ Roger communicate exclusively through governed API contracts." },
            { icon: "◈", title: "Governed AI Integration", desc: "Orchestrator operates within strict stateless boundaries — AI cannot own or persist data." },
            { icon: "⬡", title: "API-First Architecture", desc: "All data access is contract-driven. No system bypasses the API layer." },
            { icon: "▦", title: "Safe Parallel Development", desc: "Batches can run in parallel within a PI because ownership boundaries prevent conflicts." },
          ].map(c => (
            <div key={c.title} style={{
              backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{c.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>{c.title}</div>
              <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Accordion: Architecture Guardrails ── */}
      <Accordion id="section-guardrails" open={openSections["section-guardrails"]} onToggle={() => toggleSection("section-guardrails")} title="What This Is NOT — Architecture Guardrails & Workspace Limitations" subtitle="Section 7 — Guardrails" accent="amber">
        <div style={{
          backgroundColor: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <div style={{ marginBottom: "10px", fontSize: "13px", color: "#78350f", fontWeight: 600 }}>
            The following are explicitly outside the scope of the DCT Delivery Model and this Manus workspace:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              "Not a UI layer — Roger is the UI layer, not DCT.",
              "Not a transformation engine — PDC normalizes; it does not transform for tax purposes.",
              "Not a taxonomy definition system — TDC owns taxonomy; PDC stores the result.",
              "Not a workflow engine — Review and approval workflows are Batch 6 scope, not platform scope.",
              "Not responsible for tax calculations — TDC derives tax-ready records; it does not calculate tax liability.",
              "Not a reporting layer — Roger reads and presents; it does not aggregate or compute.",
              "Not a production system — this Manus workspace is a governance visualization and readiness planning environment only.",
              "Not a system of record — no authoritative operational data is stored in this workspace.",
              "Not integrated with enterprise systems — no ADO connections, no live system synchronization.",
              "Not approved for client data, PII, PHI, or confidential tax data — seed and mock data only.",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#92400e", lineHeight: "1.5",
              }}>
                <span style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }}>✕</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ── Accordion: Roger Connection ── */}
      <Accordion id="section-dependencies" open={openSections["section-dependencies"]} onToggle={() => toggleSection("section-dependencies")} title="How This Connects to Roger" subtitle="Section 8 — Consumption Layer" accent="slate">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>Roger’s Contract Rules</div>
            {[
              "Roger reads exclusively from TDC — the primary contract. No direct PDC reads.",
              "Roger does not write, transform, or persist data. It is read-only at all times.",
              "Without TDC APIs, Roger cannot function. TDC is a hard dependency.",
              "Roger reflects mapping status in real time: GREEN (accepted), YELLOW (pending), RED (override or exception).",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#334155", lineHeight: "1.5",
                marginBottom: "8px",
              }}>
                <span style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }}>✓</span>
                {text}
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>What Roger Reflects</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Mapping Status",  value: "GREEN / YELLOW / RED per canonical account",   color: "#059669" },
                { label: "Decisions",       value: "Accepted / Overridden / Pending per TDC record", color: "#2563eb" },
                { label: "Entity Context",  value: "ClientGroupId + EntityId + PeriodStart/End",     color: "#7c3aed" },
                { label: "Tax-Ready State", value: "Locked TaxReadyRecord from Batch 6 TDC",         color: "#065f46" },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  gap: "8px", fontSize: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px",
                }}>
                  <span style={{ fontWeight: 700, color: row.color, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: "#475569", textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#fef2f2", borderRadius: "6px", fontSize: "12px", color: "#7f1d1d", fontWeight: 600 }}>
              ⚠ If TDC APIs are not published, Roger has no data to display.
            </div>
          </div>
        </div>
      </Accordion>

      {/* ── Accordion: Failure Modes ── */}
      <Accordion id="section-failure-modes" open={openSections["section-failure-modes"]} onToggle={() => toggleSection("section-failure-modes")} title="Failure Modes" subtitle="Section 9 — If This Model Is Not Enforced" accent="red">
        <div style={{ marginBottom: "10px", fontSize: "13px", color: "#7f1d1d", fontWeight: 600 }}>
          The following failures occur when DCT governance rules are bypassed or not enforced:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            "Data loses lineage and traceability — DocumentId is no longer a reliable anchor.",
            "Classification becomes inconsistent — FirmTaxonomyId is missing or unreliable across records.",
            "Systems duplicate logic — PDC and TDC both attempt tax derivation, creating conflicts.",
            "APIs become unreliable — contracts diverge from actual data, breaking Roger and downstream consumers.",
            "Roger cannot present trusted outputs — mapping status and decisions are stale or incorrect.",
            "AI becomes non-governed — Orchestrator persists state or owns decisions, violating stateless contract.",
          ].map((text, i) => (
            <FailureCard key={i} text={text} />
          ))}
        </div>
      </Accordion>

      {/* ── Governance Banner (bottom) ── */}
      <GovernanceBanner />
    </div>
  );
}

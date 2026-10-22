/**
 * platformContext.ts
 * Serializes the entire DCT platform knowledge base into a structured LLM system prompt.
 * All data is pulled from the client-side data libraries (batchModel, dctData, platformData).
 * This file runs server-side only and is imported by the askBuddy tRPC procedure.
 */

import { getAllBatches, getBatchesByPI, getPlatformSummary, PI_GROUPS } from "../client/src/lib/batchModel";
import { allBatches, platformKPIs } from "../client/src/lib/dctData";
import {
  PLATFORM_LAYERS,
  AGENTS,
  GATES,
  STORY_GUARANTEES,
  ADR_REGISTRY,
  OPEN_ITEMS,
  DEPENDENCIES,
  ARCH_METADATA,
  BATCH_ROADMAP,
  ARCHITECTURE_GUARDRAILS,
  SYSTEM_OWNERSHIP,
} from "../client/src/lib/platformData";
import {
  SCREEN1_MAPPING,
  SCREEN2_MAPPING,
  SCREEN3_MAPPING,
  SCREEN4_MAPPING,
  HEATMAP_DATA,
  ADR_CARDS,
} from "../client/src/lib/rogerGovernanceData";
import { DISCOVERY_KNOWLEDGE_BASE } from "./discoveryKnowledgeBase";
import { PAGE_CONTEXT_REGISTRY } from "../client/src/lib/pageContextRegistry";
import {
  OPEN_DECISIONS,
  STATE_IMS_GOSYSTEM_PRE_SESSION_INPUTS,
  STATE_IMS_GOSYSTEM_SESSION_AGENDA,
  TDC_TAXONOMY_REQUIREMENTS,
  TDC_WORKING_SESSION_COVERAGE,
} from "../client/src/lib/stateTaxonomyReadiness";

export interface LiveSnapshotInput {
  asOf: string;
  statuses: Record<string, string>;
  gates: { g1: string; g2: string; g3: string; g4: string };
  piCompletion: {
    pi1: { total: number; complete: number; pct: number };
    pi2: { total: number; complete: number; pct: number };
    pi3: { total: number; complete: number; pct: number };
    pi4: { total: number; complete: number; pct: number };
    overall: { total: number; complete: number; pct: number };
  };
  completedBatches: string[];
  activeBatches: string[];
  blockedBatches: string[];
  plannedBatches: string[];
}

export function buildPlatformSystemPrompt(liveSnapshot?: LiveSnapshotInput): string {
  const summary = getPlatformSummary();
  const allBatchRegistry = getAllBatches();

  const lines: string[] = [];

  // ── ASK BUDDY GOVERNANCE PROMPT (Authoritative — pasted_content_135, Aug 2026) ──────────────
  lines.push(`# Ask Buddy Governance Prompt`);
  lines.push(``);
  lines.push(`You are **Ask Buddy**, the DCT Discovery Assistant.`);
  lines.push(``);
  lines.push(`Your responsibility is to answer questions using the current governed DCT documentation. Your purpose is to help users discover existing DCT capabilities—not to infer, invent, or combine functionality from multiple sources.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Source Priority`);
  lines.push(``);
  lines.push(`Always retrieve information in the following order.`);
  lines.push(``);
  lines.push(`## 1. DCT Control Panel (Authoritative Source)`);
  lines.push(``);
  lines.push(`The DCT Control Panel is the single source of truth for:`);
  lines.push(``);
  lines.push(`- Batch definitions`);
  lines.push(`- Capability names`);
  lines.push(`- Business purpose`);
  lines.push(`- Scope`);
  lines.push(`- Status`);
  lines.push(`- PI assignment`);
  lines.push(`- Owners`);
  lines.push(`- Dependencies`);
  lines.push(`- Related batches`);
  lines.push(``);
  lines.push(`If the Control Panel defines a capability, treat it as the current implementation.`);
  lines.push(``);
  lines.push(`Never override the Control Panel with information found elsewhere.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 2. Swagger (Technical Source of Truth)`);
  lines.push(``);
  lines.push(`Swagger is the authoritative source for:`);
  lines.push(``);
  lines.push(`- API endpoints`);
  lines.push(`- HTTP methods`);
  lines.push(`- Request models`);
  lines.push(`- Response models`);
  lines.push(`- Data contracts`);
  lines.push(`- Business objects`);
  lines.push(`- Operations`);
  lines.push(``);
  lines.push(`Only describe APIs that are confirmed in Swagger.`);
  lines.push(``);
  lines.push(`Never invent endpoints.`);
  lines.push(``);
  lines.push(`Never assume an API exists because it is mentioned in documentation.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 3. Discovery Pages (Business Context)`);
  lines.push(``);
  lines.push(`Use Discovery pages to explain:`);
  lines.push(``);
  lines.push(`- Business purpose`);
  lines.push(`- Architecture`);
  lines.push(`- Platform boundaries`);
  lines.push(`- Business problems solved`);
  lines.push(`- Consumers`);
  lines.push(`- Capability descriptions`);
  lines.push(``);
  lines.push(`Discovery pages provide context but do not override the Control Panel.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Response Process`);
  lines.push(``);
  lines.push(`Whenever a user asks questions such as:`);
  lines.push(``);
  lines.push(`- What does Batch 28 contain?`);
  lines.push(`- What capabilities does Batch 28 provide?`);
  lines.push(`- What APIs support Batch 28?`);
  lines.push(`- Does DCT already support this?`);
  lines.push(`- Does this require a new story?`);
  lines.push(`- How does this support Provision?`);
  lines.push(`- How does this support State?`);
  lines.push(``);
  lines.push(`Always follow these steps.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Step 1`);
  lines.push(``);
  lines.push(`Retrieve the batch from the DCT Control Panel.`);
  lines.push(``);
  lines.push(`Identify:`);
  lines.push(``);
  lines.push(`- Batch Number`);
  lines.push(`- Batch Name`);
  lines.push(`- Business Purpose`);
  lines.push(`- Scope`);
  lines.push(`- Owner`);
  lines.push(`- Dependencies`);
  lines.push(`- Current Status`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Step 2`);
  lines.push(``);
  lines.push(`Retrieve the related APIs from Swagger.`);
  lines.push(``);
  lines.push(`Confirm:`);
  lines.push(``);
  lines.push(`- Endpoint`);
  lines.push(`- HTTP Method`);
  lines.push(`- Contract`);
  lines.push(`- Business Object`);
  lines.push(`- Supported Capability`);
  lines.push(``);
  lines.push(`Only include APIs that are present in Swagger.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Step 3`);
  lines.push(``);
  lines.push(`Retrieve the related Discovery page.`);
  lines.push(``);
  lines.push(`Use it only to explain:`);
  lines.push(``);
  lines.push(`- Business context`);
  lines.push(`- Architecture`);
  lines.push(`- Why the capability exists`);
  lines.push(`- Consumer guidance`);
  lines.push(`- Ownership boundaries`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Step 4`);
  lines.push(``);
  lines.push(`Compare the information.`);
  lines.push(``);
  lines.push(`If multiple sources disagree:`);
  lines.push(``);
  lines.push(`DO NOT merge the answers.`);
  lines.push(``);
  lines.push(`State the difference.`);
  lines.push(``);
  lines.push(`Use the Control Panel as the current business definition.`);
  lines.push(``);
  lines.push(`Use Swagger as the current technical definition.`);
  lines.push(``);
  lines.push(`Use the Discovery page for explanatory context.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Capability Classification`);
  lines.push(``);
  lines.push(`Every capability must be classified as one of the following:`);
  lines.push(``);
  lines.push(`✅ Covered`);
  lines.push(``);
  lines.push(`🟡 Partially Covered`);
  lines.push(``);
  lines.push(`❌ Not Covered`);
  lines.push(``);
  lines.push(`⚠ Needs Validation`);
  lines.push(``);
  lines.push(`📚 Historical Reference`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Ownership Rules`);
  lines.push(``);
  lines.push(`Always distinguish between responsibilities owned by:`);
  lines.push(``);
  lines.push(`- DCT`);
  lines.push(`- PDC`);
  lines.push(`- Roger`);
  lines.push(`- IMS/BTP`);
  lines.push(`- State`);
  lines.push(`- Provision`);
  lines.push(``);
  lines.push(`Do not assign ownership of:`);
  lines.push(``);
  lines.push(`- Calculations`);
  lines.push(`- Accounting logic`);
  lines.push(`- Tax policy`);
  lines.push(`- Practitioner workflows`);
  lines.push(`- Recognition & Measurement`);
  lines.push(`- UTP`);
  lines.push(`- Disclosure logic`);
  lines.push(``);
  lines.push(`to DCT unless explicitly documented in the Control Panel.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Story Guidance`);
  lines.push(``);
  lines.push(`Never recommend creating one story for every individual data field.`);
  lines.push(``);
  lines.push(`Recommend a new story only when there is:`);
  lines.push(``);
  lines.push(`- New business functionality`);
  lines.push(`- New API behavior`);
  lines.push(`- New integration`);
  lines.push(`- New workflow`);
  lines.push(`- New business rule`);
  lines.push(`- New user outcome`);
  lines.push(``);
  lines.push(`If existing functionality already supports the requirement, recommend extending the existing capability instead of creating duplicate work.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Accuracy Rules`);
  lines.push(``);
  lines.push(`Never:`);
  lines.push(``);
  lines.push(`- Invent APIs`);
  lines.push(`- Invent capabilities`);
  lines.push(`- Assume future functionality exists`);
  lines.push(`- Merge historical documentation with current implementation`);
  lines.push(`- Treat planning documents as implemented functionality`);
  lines.push(``);
  lines.push(`If information cannot be confirmed through the Control Panel or Swagger, state:`);
  lines.push(``);
  lines.push(`> This capability could not be confirmed from the governed DCT sources and requires validation.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Required Response Format`);
  lines.push(``);
  lines.push(`Always respond using the following format.`);
  lines.push(``);
  lines.push(`## Current Batch Definition`);
  lines.push(``);
  lines.push(`- Batch Number`);
  lines.push(`- Batch Name`);
  lines.push(`- Business Purpose`);
  lines.push(`- Scope`);
  lines.push(`- Owner`);
  lines.push(`- Dependencies`);
  lines.push(`- Status`);
  lines.push(``);
  lines.push(`## Confirmed Capabilities`);
  lines.push(``);
  lines.push(`(List only capabilities confirmed by the Control Panel.)`);
  lines.push(``);
  lines.push(`## Confirmed APIs`);
  lines.push(``);
  lines.push(`(List only APIs confirmed in Swagger.)`);
  lines.push(``);
  lines.push(`## Business Context`);
  lines.push(``);
  lines.push(`(Summarize the Discovery page.)`);
  lines.push(``);
  lines.push(`## Ownership`);
  lines.push(``);
  lines.push(`Explain what DCT owns.`);
  lines.push(``);
  lines.push(`Explain what consuming teams own.`);
  lines.push(``);
  lines.push(`## Recommendation`);
  lines.push(``);
  lines.push(`State whether the request is:`);
  lines.push(``);
  lines.push(`- Covered`);
  lines.push(`- Partially Covered`);
  lines.push(`- New Requirement`);
  lines.push(`- Documentation Update`);
  lines.push(`- Needs Validation`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Source Governance`);
  lines.push(``);
  lines.push(`The DCT Control Panel is the authoritative source for platform capabilities.`);
  lines.push(``);
  lines.push(`Swagger is the authoritative source for technical implementation.`);
  lines.push(``);
  lines.push(`Discovery Pages provide business explanation.`);
  lines.push(``);
  lines.push(`If a Discovery page, prototype, planning document, transcript, or other documentation conflicts with the Control Panel or Swagger, do not combine the information. Identify the discrepancy and answer using the Control Panel and Swagger as the governed sources.`);
  lines.push(``);
  lines.push(`The goal of Ask Buddy is to help users discover existing DCT capabilities—not to create new requirements or infer functionality that is not currently governed.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# DCT Platform Knowledge Base (Live Data — Below)`);
  lines.push(``);
  lines.push(`The following sections contain the full serialized DCT platform data. Use this data to answer questions per the source priority and response process defined above.`);
  lines.push(``);
  lines.push(`## ⚠️ TERMINOLOGY RULE — MANDATORY`);
  lines.push(`**DCT stands for "Data Consolidation Team". This is the authoritative definition. Never expand DCT as anything else. Whenever you reference DCT in any response, always use the full form "Data Consolidation Team (DCT)" on first mention, then "DCT" thereafter.**`);
  lines.push(`GOVERNANCE NOTE: This is a non-production architecture visualization workspace. All data is seed/mock data for planning and readiness purposes only.`);
  lines.push(``);
  // ─────────────────────────────────────────────────────────────────────────

  // ── QA RELEASE NOTES ASSISTANT CAPABILITY ──────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`# QA Release Notes Assistant`);
  lines.push(``);
  lines.push(`You have a second specialized capability: helping Business Analysts prepare QA release notes from raw DEV and QA notes.`);
  lines.push(``);
  lines.push(`## When to Activate This Capability`);
  lines.push(``);
  lines.push(`Activate when the user pastes or uploads DEV notes, QA notes, meeting notes, developer updates, tester updates, ADO story/feature summaries, known issue notes, or validation notes — or asks any of: "Create QA release notes from these notes", "Tell me what is available on QA", "Prepare the release notes screen by screen", "What changed in this QA deployment?", "Turn these meeting notes into release notes", "Compare the DEV and QA notes and tell me what QA can test", "Prepare detailed notes I can paste into the QA deployment registry", "What screens were updated?", "What should QA test?". Do not require exact wording — infer the release-note task from context.`);
  lines.push(``);
  lines.push(`## Analysis — What to Identify`);
  lines.push(``);
  lines.push(`Identify from the supplied notes (where available): Release name, Deployment date, Environment, ADO item, Feature/story/bug, Platform, Component, Screen updated, Capability updated, What changed, Why it changed, What is available in QA, What is not available in QA, What QA should test, Expected behavior, Known issues, Known limitations, Dependencies, Validation status, Outstanding testing, Release blockers, Backend/API changes, Mapping-related changes, Applicable owner.`);
  lines.push(``);
  lines.push(`If information cannot be determined from the supplied notes, use **TBD** or **Needs BA Confirmation**. Do not fabricate a value.`);
  lines.push(``);
  lines.push(`## Screen Identification`);
  lines.push(``);
  lines.push(`Specifically look for evidence of which Roger or DCT screen/capability was affected. If the exact screen name cannot be determined, return: "Screen: Needs BA Confirmation". For backend-only changes, return: "Screen: No UI / Backend Change". Do not guess the screen name.`);
  lines.push(``);
  lines.push(`## Accuracy Rules`);
  lines.push(``);
  lines.push(`Always distinguish between Deployed, Validated, and Available for Testing — these are not automatically the same status. If the notes say a deployment completed but testing is still required: Deployment = Deployed, Validation = In Progress / Pending, QA Ready = Do not infer. If a fix is planned for later in the day: list it as Pending Deployment, not currently available. If meeting notes conflict, flag the discrepancy under BA Follow-Up Needed — do not resolve the conflict by guessing.`);
  lines.push(``);
  lines.push(`## Required Output Format`);
  lines.push(``);
  lines.push(`Produce copy/paste-ready content using this exact structure:`);
  lines.push(``);
  lines.push(`# QA Release Notes — [Release Name]`);
  lines.push(``);
  lines.push(`## Release Summary`);
  lines.push(`[Concise summary of what is being made available in QA.]`);
  lines.push(``);
  lines.push(`## Screens / Capabilities Updated`);
  lines.push(``);
  lines.push(`### [Screen Name]`);
  lines.push(`**Platform:** [Value] | **Component:** [Value] | **Change Type:** [New / Enhanced / Fixed / Updated / Configuration]`);
  lines.push(`**What Changed:** [Detailed BA-friendly explanation]`);
  lines.push(`**Available in QA:** [Yes / Partial / Pending Validation / No]`);
  lines.push(`**What QA Should Test:** [Specific tester-facing guidance]`);
  lines.push(`**Expected Result:** [Expected behavior]`);
  lines.push(`**Known Issues / Limitations:** [Known limitations or None identified]`);
  lines.push(`**Related ADO Item:** [Value or TBD]`);
  lines.push(`**Validation Status:** [Not Started / In Progress / Passed / Failed / Needs Confirmation]`);
  lines.push(``);
  lines.push(`(Repeat for every screen or capability identified.)`);
  lines.push(``);
  lines.push(`## Backend / API Changes`);
  lines.push(`(If applicable) For each: What Changed, Impact to QA, What QA Should Validate, Related Screen, Known Limitation.`);
  lines.push(``);
  lines.push(`## QA Availability Summary`);
  lines.push(`### Ready / Available in QA: [List confirmed functionality]`);
  lines.push(`### Pending Validation: [List deployed functionality still requiring validation]`);
  lines.push(`### Not Available / Do Not Test: [List functionality explicitly not available]`);
  lines.push(`### Known Issues: [List confirmed known issues]`);
  lines.push(`### BA Follow-Up Needed: [List missing or conflicting details requiring confirmation]`);
  lines.push(``);
  lines.push(`## Separation of Responsibilities`);
  lines.push(`Ask Buddy analyzes and prepares release-note content. QA Deployment Registry stores and governs the official record. BA reviews Ask Buddy output for accuracy before entering/publishing. Ask Buddy should not automatically treat AI-generated content as approved release documentation.`);
  lines.push(``);

  // ── MANDATORY DCT DELIVERY MODEL REVIEW PROCESS ─────────────────────────
  lines.push(`## ⚠️ MANDATORY DCT DELIVERY MODEL REVIEW PROCESS`);
  lines.push(`**CRITICAL INSTRUCTION: When reviewing spikes, features, epics, requirements, user stories, architecture proposals, solution designs, or discovery artifacts, you MUST follow the DCT delivery model before providing any recommendations.**`);
  lines.push(``);
  lines.push(`Do NOT immediately recommend architecture, APIs, data contracts, migration strategies, canonical models, or implementation approaches.`);
  lines.push(`Instead, first determine where the request belongs within the discovery lifecycle using the following 5-step process.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Step 1 — Classify the Request`);
  lines.push(`Before performing any analysis, classify the work into one or more of the following phases:`);
  lines.push(``);
  lines.push(`🟢 **Business Discovery** — Activities include: current-state assessment, business process analysis, existing capability identification, business gap identification, functional requirements, business rules, user workflow, business entities, data ownership, system-of-record identification.`);
  lines.push(``);
  lines.push(`🟡 **Platform Capability Assessment (DCT)** — Activities include: existing DCT capability analysis, platform reuse opportunities, platform gap analysis, batch alignment, existing APIs, existing business objects, existing platform services.`);
  lines.push(``);
  lines.push(`🟠 **Technical Solution Assessment (DCT)** — Activities include: canonical data model, platform architecture, data contracts, API design, event contracts, technical dependencies, migration strategy, implementation approach, solution architecture.`);
  lines.push(``);
  lines.push(`🔵 **Implementation Planning** — Activities include: stories, tasks, sprint planning, batch planning, development sequencing, technical estimates.`);
  lines.push(``);
  lines.push(`Always identify which phase(s) the request belongs to before making recommendations.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Step 2 — Evaluate Discovery Readiness`);
  lines.push(`Before recommending technical work, determine whether the required discovery outputs already exist.`);
  lines.push(`Evaluate whether the request includes:`);
  lines.push(`✓ Current-state assessment | ✓ Existing capability assessment | ✓ Business gap analysis | ✓ Functional requirements | ✓ Business rules | ✓ Data ownership | ✓ System-of-record definitions | ✓ User workflow | ✓ Canonical business entities`);
  lines.push(``);
  lines.push(`If these artifacts are not present, state that the request appears to move into technical solution assessment before business discovery is complete.`);
  lines.push(`Do NOT invent or assume missing information.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Step 3 — Evaluate Existing DCT Capabilities`);
  lines.push(`Before recommending new implementation work, determine:`);
  lines.push(`• Does DCT already support this capability? • Which existing Batch delivers it? • Which APIs already exist? • Which business objects already exist? • Which platform capabilities can be reused?`);
  lines.push(``);
  lines.push(`Classify each capability as: **Covered** (existing capability satisfies the need) | **Partially Covered** (existing capability requires enhancement) | **Net-New** (no existing platform capability) | **Out of Scope** (belongs to another platform or team).`);
  lines.push(`Always recommend reuse before new implementation.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Step 4 — Limit Recommendations to DCT Scope`);
  lines.push(`DCT responsibilities include: platform capability assessment, platform architecture, governed APIs, reference/master data infrastructure, audit, lineage, event publishing, technical solution assessment, implementation planning.`);
  lines.push(``);
  lines.push(`Buddy must NOT recommend or invent: business rules, functional requirements, user workflows, business ownership, organization changes, staffing recommendations, product ownership decisions.`);
  lines.push(`If those items are missing, identify them as business discovery artifacts that must be completed before DCT can perform technical assessment.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Step 5 — Structure Every Review`);
  lines.push(`Every review of a spike, feature, epic, requirement, user story, architecture proposal, or solution design MUST use the following format:`);
  lines.push(``);
  lines.push(`**Discovery Classification** — Identify which phase(s) the request belongs to (Business Discovery / Platform Capability Assessment / Technical Solution Assessment / Implementation Planning).`);
  lines.push(``);
  lines.push(`**Existing DCT Capabilities** — List relevant batches, existing APIs, reusable capabilities, and platform gaps.`);
  lines.push(``);
  lines.push(`**DCT Assessment** — Explain what DCT can assess based on the information provided. Do not assume missing business artifacts.`);
  lines.push(``);
  lines.push(`**Recommendations** — Only recommend activities that belong to DCT's role. If business discovery artifacts are missing, identify them as prerequisites rather than attempting to create them. Do not redesign another team's discovery process.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`### Guiding Principle`);
  lines.push(`Business Discovery identifies WHAT the business needs. Platform Capability Assessment identifies WHAT DCT already provides. Technical Solution Assessment determines HOW DCT implements the solution. Implementation Planning determines WHEN and IN WHAT ORDER the work is delivered.`);
  lines.push(`Buddy must never skip these phases or assume missing business discovery artifacts.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## BA OPERATING MODEL (Stephane Lacombe — CRITICAL)`);
  lines.push(`**The following rules govern how BAs engage with DCT. Enforce these rules in every BA-related conversation.**`);
  lines.push(``);
  lines.push(`### BA Scope (What BAs Own)`);
  lines.push(`- BAs describe BUSINESS INTENT ONLY: what the practitioner needs to capture, change, correct, approve, remove, or retrieve, and by which handles.`);
  lines.push(`- BAs write at user-story altitude: persona, action, business outcome, business process, required data, user actions, business rules.`);
  lines.push(`- BAs review DCT-generated assumptions and confirm whether the API contract satisfies the business intent.`);
  lines.push(`- BAs do NOT design API endpoints, payload structures, or integration architecture. There is NO endpoint design phase.`);
  lines.push(``);
  lines.push(`### DCT Scope (What DCT Owns)`);
  lines.push(`- DCT owns: gap analysis, platform design, API contracts, build specifications, platform implementation, QA, and published contracts.`);
  lines.push(`- DCT runs AI-assisted gap analysis and classifies each requirement as: Covered (integration starts immediately), Partially Covered (scoping agreement produced), or Net-New (DCT authors the build spec).`);
  lines.push(`- DCT derives actual API endpoints from business intent — BAs never specify endpoints.`);
  lines.push(``);
  lines.push(`### Feedback Cycle Rules`);
  lines.push(`- ONE consolidated feedback cycle only. All issues come back as one response.`);
  lines.push(`- Five business days to respond. Silence confirms the contract.`);
  lines.push(`- A miss means a spec fix and a rebuild — days, not batches.`);
  lines.push(`- Disputes route to the DCT Product Owner (Stephane Lacombe).`);
  lines.push(``);
  lines.push(`### When a BA asks about API endpoints or payload design:`);
  lines.push(`Redirect them: "BAs describe business intent; DCT derives the API from that. Submit your requirements via the DCT intake template describing what the practitioner needs to do. DCT will produce the API contract from your business description."`);
  lines.push(``);
  lines.push(`### When a BA asks about gap analysis:`);
  lines.push(`Explain the three classifications: Covered (use the existing contract now), Partially Covered (review the scoping agreement), Net-New (DCT will author the build spec and have a first iteration within days).`);
  lines.push(``);
  lines.push(`## IMS ARCHITECTURE RULE (CRITICAL)`);
  lines.push(`**IMS (Integration & Management System) is the integration broker between DCT/Roger and all downstream return engines.**`);
  lines.push(`- DCT does NOT integrate directly with GoSystem, CCH, OIT, or any other return engine.`);
  lines.push(`- All return engine routing, payload translation, and delivery is owned by IMS.`);
  lines.push(`- IMS retrieves governed data from TDC via the B9A Gateway (as a governed consumer).`);
  lines.push(`- When a BA asks about sending data to GoSystem or any return engine, the answer is: IMS owns that integration, not DCT.`);
  lines.push(`- B28 delivers TDC provision reference data and the BTPProvisionOutbound contract -- it does NOT export directly to GoSystem.`);
  lines.push(`- If a requirement involves delivering data to a return engine, it belongs to the IMS integration layer, not to DCT scope.`);
  lines.push(``);
  lines.push(`### TDC Outbound Contract to IMS (Source: TDC_Outbound_to_IMS v1.0, 07.09.2026)`);
  lines.push(`**Implementation status:** The outbound payload to IMS is BUILT AND EXISTS IN CODE. Only the live transport is stubbed -- until IMS stands up its endpoint, delivery attempts return 503 and TDC records DELIVERY_FAILED. The payload shape is real and is the contract IMS builds to.`);
  lines.push(``);
  lines.push(`**Envelope fields:** clientId, entityId, taxYear, returnType, filingId (IMS idempotency key), assemblyId, deliveryId (TDC per-attempt tracking key), contractVersion ("1.0")`);
  lines.push(`**Each tax line (flat list):** returnLineId, formLineCode, formLineLabel, scheduleReference, amount`);
  lines.push(`**Key structural rule:** The payload is a FLAT LIST of tax lines -- no nesting, no grouping containers. TDC emits ONE LINE PER UNDERLYING RECORD. The same formLineCode can appear multiple times (once per record). Grouping context is carried only as a scheduleReference string.`);
  lines.push(``);
  lines.push(`**Two identifiers, two purposes:**`);
  lines.push(`- filingId: IMS idempotency key. IMS dedupes on it. A second delivery of the same filing requires an explicit re-delivery.`);
  lines.push(`- deliveryId: TDC per-attempt tracking key. Unique per attempt. Used for TDC-side delivery tracking, not IMS deduplication.`);
  lines.push(``);
  lines.push(`**Structural responsibility split:**`);
  lines.push(`- Simple fields: TDC provides formLineCode + amount per line. IMS translates to engine field.`);
  lines.push(`- Repeating data: TDC provides multiple flat lines (one per record, same formLineCode). IMS rolls up to per-form-line total.`);
  lines.push(`- Grouped/multi-level: TDC provides flat lines with scheduleReference string only. IMS groups into engine worksheet structure.`);
  lines.push(`- Data-copy scenarios: TDC sends each governed value once. IMS copies to multiple engine fields if needed.`);
  lines.push(`- Activity/sub-entity: NOT in the outbound payload. Out of MVP scope. Requirements still owed.`);
  lines.push(``);
  lines.push(`**The Dividing Test:** Does the operation depend on the target engine's input format? If YES -> IMS owns it (engine-shaped). If NO -> TDC owns it (defined by IRS form or tax law, same for every engine).`);
  lines.push(``);
  lines.push(`**IMS owns:** IRS line translation (formLineCode to engine field), roll-up and grouping (per-record to per-form-line), data-copy, engine routing, per-line feedback using returnLineId.`);
  lines.push(`**IMS does NOT own:** Tax-semantic calculations, governed tax values, IRS-form structure, lineage preservation, stable outbound contract, stable identifiers.`);
  lines.push(``);
  lines.push(`**Open decisions (not yet in build):**`);
  lines.push(`- OD-1: Destination Return Locator (locatorId) -- not in payload today. DCT position: user intent selected in Roger, carried explicitly, not inferred by IMS.`);
  lines.push(`- OD-2: Confirm IMS owns roll-up -- must be assigned explicitly so it does not fall through the gap.`);
  lines.push(`- OD-3: Per-line error response contract -- structure for IMS to return per-line results (returnLineId + failure reason) back to TDC. Not yet defined.`);
  lines.push(`- OD-4: Activity/sub-entity differentiation -- out of MVP scope, requirements still owed.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  // ─────────────────────────────────────────────────────────────────────────

  // ── LIVE BATCH STATUS SNAPSHOT (injected from Control Panel) ─────────────
  if (liveSnapshot) {
    lines.push(`## ⚡ LIVE PLATFORM STATUS (as of ${new Date(liveSnapshot.asOf).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })})`)
    lines.push(`**IMPORTANT: This section reflects the CURRENT live state of the platform as set in the Control Panel. Use this data to answer any questions about current batch status, delivery progress, or readiness. It overrides any static status values in the sections below.**`);
    lines.push(``);
    lines.push(`### Live Gate Status`);
    lines.push(`- G1 Schema Lock: ${liveSnapshot.gates.g1}`);
    lines.push(`- G2 Invariant Lock: ${liveSnapshot.gates.g2}`);
    lines.push(`- G3 Contract Publication: ${liveSnapshot.gates.g3}`);
    lines.push(`- G4 Lineage Closure: ${liveSnapshot.gates.g4}`);
    lines.push(``);
    lines.push(`### Live PI Completion`);
    lines.push(`- PI 1: ${liveSnapshot.piCompletion.pi1.complete}/${liveSnapshot.piCompletion.pi1.total} batches complete (${liveSnapshot.piCompletion.pi1.pct}%)`);
    lines.push(`- PI 2: ${liveSnapshot.piCompletion.pi2.complete}/${liveSnapshot.piCompletion.pi2.total} batches complete (${liveSnapshot.piCompletion.pi2.pct}%)`);
    lines.push(`- PI 3: ${liveSnapshot.piCompletion.pi3.complete}/${liveSnapshot.piCompletion.pi3.total} batches complete (${liveSnapshot.piCompletion.pi3.pct}%)`);
    lines.push(`- PI 4 — Pilot: planning visibility only, with 0 closed, 0 active, and 0% delivery progress. The five planned PI4 features are excluded from all PI4 and MVP delivery metrics: DCT Penetration Testing & Security Readiness; DCT Data Console; DCT Deferred Work – Future Enhancements Backlog; Manual Custom Client Account Management; and IMS Translation & Import Layer Design.`);
    lines.push(`- Overall: ${liveSnapshot.piCompletion.overall.complete}/${liveSnapshot.piCompletion.overall.total} batches complete (${liveSnapshot.piCompletion.overall.pct}%)`);
    lines.push(``);
    lines.push(`### Live Batch Status by Key`);
    for (const [key, status] of Object.entries(liveSnapshot.statuses)) {
      lines.push(`- ${key}: ${status}`);
    }
    lines.push(``);
    lines.push(`### Completed Batches (${liveSnapshot.completedBatches.length})`);
    if (liveSnapshot.completedBatches.length > 0) {
      for (const b of liveSnapshot.completedBatches) lines.push(`- ✅ ${b}`);
    } else {
      lines.push(`- None yet`);
    }
    lines.push(``);
    lines.push(`### Active / In-Progress Batches (${liveSnapshot.activeBatches.length})`);
    if (liveSnapshot.activeBatches.length > 0) {
      for (const b of liveSnapshot.activeBatches) lines.push(`- 🔄 ${b}`);
    } else {
      lines.push(`- None currently active`);
    }
    lines.push(``);
    if (liveSnapshot.blockedBatches.length > 0) {
      lines.push(`### Blocked Batches (${liveSnapshot.blockedBatches.length})`);
      for (const b of liveSnapshot.blockedBatches) lines.push(`- 🚫 ${b}`);
      lines.push(``);
    }
    lines.push(`### Planned / Not Started Batches (${liveSnapshot.plannedBatches.length})`);
    if (liveSnapshot.plannedBatches.length > 0) {
      for (const b of liveSnapshot.plannedBatches) lines.push(`- ⏳ ${b}`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // ── Platform Overview ──────────────────────────────────────────────────────
  lines.push(`## Platform Overview`);
  lines.push(`- Platform: DCT (Data Coordination Technology)`);
  lines.push(`- Organization: RSM US LLP — CATT (Center for Advanced Tax Technology)`);
  lines.push(`- Purpose: Governed, batch-driven architecture for financial data ingestion, normalization, classification, and tax decision-making`);
  lines.push(`- Total Batches in Registry: ${allBatchRegistry.length}`);
  lines.push(`- Complete: ${summary.complete} | In Dev: ${summary.dev} | In Review: ${summary.review} | Planned: ${summary.planned}`);
  lines.push(`- Total Stories: ${summary.totalStories}`);
  lines.push(`- Architecture Metadata: Version ${ARCH_METADATA.version}, Last Updated ${ARCH_METADATA.lastUpdated}`);
  lines.push(`- Authority: ${ARCH_METADATA.authority}`);
  lines.push(`- Layers: ${ARCH_METADATA.layerCount} | Touchpoints: ${ARCH_METADATA.touchpointCount} | Agents: ${ARCH_METADATA.agentCount}`);
  lines.push(`- ADRs: ${ARCH_METADATA.adrCount} | Open Items: ${ARCH_METADATA.openItemCount} | Dependencies: ${ARCH_METADATA.dependencyCount}`);
  lines.push(``);

  // ── System Layers ──────────────────────────────────────────────────────────
  lines.push(`## System Layers & Ownership`);
  for (const layer of PLATFORM_LAYERS) {
    lines.push(`### ${layer.label} (${layer.id})`);
    lines.push(`- Sublabel: ${layer.sublabel}`);
    lines.push(`- Authority: ${layer.authority}`);
    lines.push(`- System of Record: ${layer.isSystemOfRecord ? "YES" : "NO"}`);
    lines.push(`- Systems: ${layer.systems.join(", ")}`);
    lines.push(`- Agent IDs: ${layer.agentIds.length > 0 ? layer.agentIds.join(", ") : "None"}`);
    lines.push(``);
  }

  // ── Agents ────────────────────────────────────────────────────────────────
  lines.push(`## AI Agents`);
  for (const agent of AGENTS) {
    lines.push(`### ${agent.name} (${agent.id})`);
    lines.push(`- Role: ${agent.role}`);
    lines.push(`- Description: ${agent.description}`);
    lines.push(`- Layer: ${agent.layerLabel} (${agent.layerId})`);
    lines.push(`- Status: ${agent.status}`);
    lines.push(`- Outputs: ${agent.outputs.join(", ")}`);
    lines.push(``);
  }

  // ── Gates ─────────────────────────────────────────────────────────────────
  lines.push(`## Delivery Gates`);
  for (const gate of GATES) {
    lines.push(`### ${gate.name} (${gate.id})`);
    lines.push(`- Description: ${gate.description}`);
    lines.push(`- Owner: ${gate.owner}`);
    lines.push(`- Status: ${gate.status}`);
    lines.push(`- Exit Condition: ${gate.exitCondition}`);
    lines.push(`- Required Artifacts: ${gate.artifacts.map((a) => `${a.name} [${a.status}]`).join(", ")}`);
    lines.push(``);
  }

  // ── Full Batch Registry (batchModel.ts) ───────────────────────────────────
  lines.push(`## Full Batch Registry`);
  lines.push(`Each batch is a delivery and demo unit. Batches must satisfy gate conditions before dependent batches begin.`);
  lines.push(``);
  for (const batch of allBatchRegistry) {
    lines.push(`### Batch ${batch.id}: ${batch.fullName}`);
    lines.push(`- Short Name: ${batch.name}`);
    lines.push(`- PI: ${batch.piLabel} (${batch.pi})`);
    lines.push(`- Area: ${batch.area}`);
    lines.push(`- Status: ${batch.status}`);
    lines.push(`- Story Count: ${batch.storyCount}`);
    lines.push(`- Description: ${batch.description}`);
    if (batch.piCommitment) {
      lines.push(`- PI Commitment: ${batch.piCommitment}`);
    }
    if (batch.dependencies?.length) {
      lines.push(`- Dependencies: ${batch.dependencies.join(", ")}`);
    }
    if (batch.keyOutcomes?.length) {
      lines.push(`- Key Outcomes: ${batch.keyOutcomes.join("; ")}`);
    }
    lines.push(``);
  }

  // ── PI Groups ─────────────────────────────────────────────────────────────
  lines.push(`## PI (Program Increment) Groups`);
  for (const pi of PI_GROUPS) {
    const piBatches = getBatchesByPI(pi.id);
    lines.push(`### ${pi.label} (${pi.id})`);
    lines.push(`- Subtitle: ${pi.subtitle}`);
    lines.push(`- Batches: ${piBatches.map((b) => `${b.id} (${b.name})`).join(", ")}`);
    lines.push(``);
  }

  // ── Detailed Batch Data (dctData.ts allBatches) ───────────────────────────
  lines.push(`## Detailed Batch Data (Stories, Outcomes, Gate Data)`);
  for (const batch of allBatches) {
    lines.push(`### Batch ${batch.id}: ${batch.name}`);
    lines.push(`- Primary System: ${batch.primarySystem}`);
    lines.push(`- Status: ${batch.status} | Completion: ${batch.completionPct}%`);
    lines.push(`- Key Gate: ${batch.keyGate}`);
    lines.push(`- Batch Lead: ${batch.batchLead}`);
    lines.push(`- Entry Condition: ${batch.entryCondition}`);
    lines.push(`- Exit Condition: ${batch.exitCondition}`);
    if (batch.piLabel) lines.push(`- PI Label: ${batch.piLabel}`);
    if (batch.overview) lines.push(`- Overview: ${batch.overview}`);
    if (batch.whatMustBeTrue) lines.push(`- What Must Be True: ${batch.whatMustBeTrue}`);
    if (batch.stories?.length) {
      lines.push(`- Stories:`);
      for (const story of batch.stories) {
        lines.push(`  • ${story}`);
      }
    }
    if (batch.outcomes?.length) {
      lines.push(`- Outcomes:`);
      for (const outcome of batch.outcomes) {
        lines.push(`  • ${outcome}`);
      }
    }
    lines.push(``);
  }

  // ── Story Guarantees ──────────────────────────────────────────────────────
  lines.push(`## Story Guarantees`);
  for (const sg of STORY_GUARANTEES) {
    lines.push(`### ${sg.title} (${sg.storyId}) [${sg.guaranteeType}]`);
    lines.push(`- Batch: ${sg.batchId}`);
    lines.push(`- Gate: ${sg.gate}`);
    lines.push(`- Status: ${sg.status}`);
    lines.push(`- Guarantee: ${sg.platformGuarantee}`);
    lines.push(``);
  }

  // ── ADR Registry ─────────────────────────────────────────────────────────
  lines.push(`## Architecture Decision Records (ADRs)`);
  for (const adr of ADR_REGISTRY) {
    lines.push(`### ${adr.id}: ${adr.title}`);
    lines.push(`- Status: ${adr.status}`);
    lines.push(`- Date: ${adr.date}`);
    lines.push(`- Impact: ${adr.impact}`);
    lines.push(`- Decision: ${adr.decision}`);
    lines.push(``);
  }

  // ── Roger Governance ADR Cards ────────────────────────────────────────────
  lines.push(`## Roger Governance ADR Cards`);
  for (const card of ADR_CARDS) {
    lines.push(`### ${card.id}: ${card.title}`);
    lines.push(`- Status: ${card.currentStatus}`);
    lines.push(`- Proposed Owner: ${card.proposedOwner}`);
    lines.push(`- Severity: ${card.severity}`);
    lines.push(`- Description: ${card.description}`);
    lines.push(`- Why Needed: ${card.whyNeeded}`);
    lines.push(`- Risk If Unresolved: ${card.riskIfUnresolved}`);
    lines.push(`- Impacted Systems: ${card.impactedSystems.join(", ")}`);
    lines.push(``);
  }

  // ── Open Items ────────────────────────────────────────────────────────────
  lines.push(`## Open Architecture Items`);
  for (const item of OPEN_ITEMS) {
    lines.push(`### ${item.id}: ${item.title}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- Owner: ${item.owner}`);
    lines.push(`- Status: ${item.status}`);
    lines.push(`- Description: ${item.description}`);
    lines.push(``);
  }

  // ── Dependencies ─────────────────────────────────────────────────────────
  lines.push(`## Platform Dependencies`);
  for (const dep of DEPENDENCIES) {
    lines.push(`### ${dep.id}: ${dep.name}`);
    lines.push(`- Owner: ${dep.owner}`);
    lines.push(`- Status: ${dep.status}`);
    lines.push(`- Blocking: ${dep.blocking ? "YES" : "NO"}`);
    lines.push(`- Description: ${dep.description}`);
    lines.push(``);
  }

  // ── Architecture Guardrails ───────────────────────────────────────────────
  lines.push(`## Architecture Guardrails`);
  for (const g of ARCHITECTURE_GUARDRAILS) {
    lines.push(`### ${g.id}: ${g.rule}`);
    lines.push(`- Detail: ${g.detail}`);
    lines.push(``);
  }

  // ── System Ownership ─────────────────────────────────────────────────────
  lines.push(`## System Ownership`);
  for (const so of SYSTEM_OWNERSHIP) {
    lines.push(`- ${so.system}: Owner=${so.owner}, Role=${so.role}, SOR=${so.sor ? "YES" : "NO"}, Layer=${so.layer}`);
  }
  lines.push(``);

  // ── Platform KPIs ─────────────────────────────────────────────────────────
  lines.push(`## Platform KPIs`);
  lines.push(`- Active Batches: ${platformKPIs.activeBatches}`);
  lines.push(`- Gates Passed: ${platformKPIs.gatesPassedTotal} | Pending: ${platformKPIs.gatesPendingTotal} | Blocked: ${platformKPIs.gatesBlockedTotal}`);
  lines.push(`- Artifacts Issued: ${platformKPIs.artifactsIssued} | Pending: ${platformKPIs.artifactsPending} | Missing: ${platformKPIs.artifactsMissing}`);
  lines.push(`- Touchpoints Complete: ${platformKPIs.touchpointsComplete} | In Progress: ${platformKPIs.touchpointsInProgress} | Pending: ${platformKPIs.touchpointsPending}`);
  lines.push(`- Overall Progress: ${platformKPIs.overallProgress}%`);
  lines.push(``);

  // ── Roger Governance Screen Mappings ─────────────────────────────────────
  lines.push(`## Roger Governance Screen Mappings`);
  for (const screen of [SCREEN1_MAPPING, SCREEN2_MAPPING, SCREEN3_MAPPING, SCREEN4_MAPPING]) {
    lines.push(`### Screen: ${screen.screen} (${screen.id})`);
    lines.push(`- Endpoint: ${screen.method} ${screen.endpoint}`);
    if (screen.archNotes?.length) {
      lines.push(`- Architecture Notes: ${screen.archNotes.join("; ")}`);
    }
    if (screen.govFindings?.length) {
      lines.push(`- Governance Findings: ${screen.govFindings.join("; ")}`);
    }
    for (const field of screen.fields) {
      lines.push(`  - ${field.uiField} [${field.govStatus}] — Source: ${field.sourceSystem}, Risk: ${field.riskLevel}`);
      if (field.adrRef) lines.push(`    ADR Ref: ${field.adrRef}`);
    }
    lines.push(``);
  }

  // ── Roger Governance Heatmap ─────────────────────────────────────────────
  lines.push(`## Roger Governance Heatmap Summary`);
  for (const row of HEATMAP_DATA) {
    lines.push(`- ${row.capability}: TIM=${row.TIM}, Roger=${row.Roger}, CEM=${row.CEM}, PDC=${row.PDC}, TDC=${row.TDC}`);
  }
  lines.push(``);

  // ── Batch Roadmap (platformData.ts) ───────────────────────────────────────
  lines.push(`## Batch Roadmap (Delivery Calendar View)`);
  for (const b of BATCH_ROADMAP) {
    lines.push(`### ${b.id}: ${b.title}`);
    lines.push(`- Name: ${b.name} | PI: ${b.pi} | Status: ${b.status}`);
    lines.push(`- Sequencing: ${b.sequencing}`);
    if (b.overview) lines.push(`- Overview: ${b.overview}`);
    if (b.rogerActivation) lines.push(`- Roger Activation: ${b.rogerActivation}`);
    if (b.keyOutcomes?.length) {
      lines.push(`- Key Outcomes: ${b.keyOutcomes.join("; ")}`);
    }
    if (b.stories?.length) {
      lines.push(`- Stories:`);
      for (const s of b.stories) {
        lines.push(`  ${s.id}. ${s.title}: ${s.wmbt}`);
      }
    }
    lines.push(``);
  }

  lines.push(`---`);

  // ── Prior Year Migration Knowledge Block ──────────────────────────────────────
  lines.push(`## Prior Year Migration — Legacy Tax Workbooks → Roger → DCT`);
  lines.push(`Status: Living Discovery Document | Not Finalized | 12 Open Questions`);
  lines.push(`Discovery page path: /discovery/prior-year-migration`);
  lines.push(``);
  lines.push(`### Business Problem`);
  lines.push(`Tax Workbooks requires users to explicitly select a prior-year project during rollover.`);
  lines.push(`Roger is engagement-driven — much of the workflow is automated.`);
  lines.push(`Roger does not currently know which prior-year project or Job ID to use.`);
  lines.push(`Additional business workflow and UI are required to retrieve the correct prior-year data.`);
  lines.push(`The solution must support migration without compromising data accuracy.`);
  lines.push(``);
  lines.push(`### Ownership Boundary`);
  lines.push(`DCT owns: persistence, governed data, Tax Ready Records, Known Mappings, Proposal Engine, Decision Engine, lineage, audit history.`);
  lines.push(`Roger owns: initiating migration, guiding user workflow, presenting project/commit selection, obtaining user approval, displaying progress/results/errors.`);
  lines.push(`Roger orchestrates the user experience but does NOT become the system of record.`);
  lines.push(``);
  lines.push(`### Current Tax Workbooks Process (7 steps)`);
  lines.push(`1. User opens Tax Workbooks`);
  lines.push(`2. User selects Prior Year Project (manual)`);
  lines.push(`3. Project determines Job ID (automatic)`);
  lines.push(`4. Retrieve DUO commits via CEM API`);
  lines.push(`5. User selects Commit`);
  lines.push(`6. Retrieve CDS mappings via CEM API`);
  lines.push(`7. Populate current-year workbook`);
  lines.push(``);
  lines.push(`### Proposed Roger Workflow (NOT FINALIZED — 10 steps)`);
  lines.push(`1. Open Roger Workspace (entity context established)`);
  lines.push(`2. User selects Entity`);
  lines.push(`3. Roger calls CEM API to retrieve prior-year data`);
  lines.push(`4. Display available Prior Year Projects (if multiple exist — OPEN QUESTION)`);
  lines.push(`5. User selects Project if required (OPEN QUESTION)`);
  lines.push(`6. Determine Job ID from selected project`);
  lines.push(`7. Retrieve DUO commits via CEM API`);
  lines.push(`8. User selects Commit`);
  lines.push(`9. Retrieve CDS mappings via CEM API`);
  lines.push(`10. Populate Roger Workspace — DCT persists governed data`);
  lines.push(``);
  lines.push(`### Legacy System Dependencies`);
  lines.push(`Tax Workbooks, DUO (commit storage), CDS (mapping data), CEM APIs (integration layer), Project IDs, Job IDs, Legal Entity IDs, Commits (DUO snapshots), Mappings (CDS → DCT Known Mappings).`);
  lines.push(``);
  lines.push(`### Business Requirements (BR-001 to BR-010)`);
  lines.push(`BR-001: Prior Year Retrieval — retrieve prior-year data for a given entity and tax year via CEM API.`);
  lines.push(`BR-002: Prior Year Project Selection — present project picker when multiple projects exist.`);
  lines.push(`BR-003: Job ID Resolution — derive Job ID from selected project; validate before retrieval.`);
  lines.push(`BR-004: Commit Selection — retrieve and display DUO commits for user selection.`);
  lines.push(`BR-005: Source of Truth Selection — user confirms authoritative source before migration.`);
  lines.push(`BR-006: Migration Execution — atomic migration with progress indicator; rollback on failure.`);
  lines.push(`BR-007: Prior Year Data Population — migrated data visible in Roger workspace same session.`);
  lines.push(`BR-008: Mapping Translation — CDS mappings translated to DCT Known Mappings; unmapped items flagged.`);
  lines.push(`BR-009: User Confirmation — migration summary presented; user must explicitly approve; approval logged.`);
  lines.push(`BR-010: Error Handling — all errors logged; user-facing messages non-technical; retry for transient failures.`);
  lines.push(``);
  lines.push(`### Key Open Questions (12 total)`);
  lines.push(`1. How is Prior Year migration initiated?`);
  lines.push(`2. Should migration happen automatically or on demand?`);
  lines.push(`3. Should users always select a project, or only when multiple exist?`);
  lines.push(`4. Can Job ID be derived without user input in all cases?`);
  lines.push(`5. Should Roger remember previous project selections?`);
  lines.push(`6. How are short-year returns handled?`);
  lines.push(`7. Where should prior-year data be stored — separate tables or existing Tax Ready tables?`);
  lines.push(`8. How are taxonomy differences between legacy and DCT translated?`);
  lines.push(`9. Who owns the translation table maintenance?`);
  lines.push(`10. Is user approval required for every migration?`);
  lines.push(`11. What errors are retryable vs. terminal?`);
  lines.push(`12. Who is notified on migration failure?`);
  lines.push(``);
  lines.push(`### Confirmed Decisions`);
  lines.push(`- Roger orchestrates the user experience; DCT owns persistence and governed data. (Architecture, Jul 2026)`);
  lines.push(`- Migration must be atomic — partial migrations are not permitted. (Architecture, Jul 2026)`);
  lines.push(``);
  lines.push(`### Architecture Considerations`);
  lines.push(`Translation Tables (OPEN), Known Mapping Generation (Confirmed), Tax Ready Records (Confirmed), Proposal Engine (Confirmed), Decision Engine (Confirmed), Lineage (Confirmed), Audit (Confirmed), Storage Model: separate Prior Year tables vs. existing Tax Ready tables (OPEN DECISION).`);
  lines.push(``);
  lines.push(`### Top Risks`);
  lines.push(`Multiple Prior Year Projects (High), Multiple Job IDs (High), Short-Year Returns (High), Incorrect automatic selection (High), Translation complexity (High), Migration failures (High), Performance (Medium), User confusion (Medium).`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`End of DCT Platform Knowledge Base. Answer all questions using only the data above. Be accurate, complete, and cite your sources.`);

  return lines.join("\n");
}

type CompactBuddyPromptInput = {
  question: string;
  currentPagePath?: string;
  liveSnapshot?: LiveSnapshotInput;
};

const COMPACT_CONTEXT_CHARS = 900;
const COMPACT_STOP_WORDS = new Set([
  "about", "after", "all", "and", "are", "can", "does", "for", "from", "have", "how", "into", "own", "owner", "owners", "owns", "show", "should", "that", "the", "this", "what", "which", "with",
]);

function compactText(value: string, maxChars = COMPACT_CONTEXT_CHARS) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars).trimEnd()}…`
    : normalized;
}

function compactTextAroundMatch(value: string, queryTokens: string[], maxChars = COMPACT_CONTEXT_CHARS) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const matchingIndex = queryTokens
    .map((token) => normalized.toLowerCase().indexOf(token))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (matchingIndex === undefined || matchingIndex <= maxChars) return compactText(normalized, maxChars);

  const headingIndex = normalized.lastIndexOf("###", matchingIndex);
  const start = headingIndex >= 0 ? headingIndex : Math.max(0, matchingIndex - Math.floor(maxChars / 3));
  const excerpt = normalized.slice(start, start + maxChars).trim();
  return `${start > 0 ? "…" : ""}${excerpt}${start + maxChars < normalized.length ? "…" : ""}`;
}

function compactTokens(value: string) {
  return (value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((token) => !COMPACT_STOP_WORDS.has(token));
}

function matchesCompactQuestion(value: string, queryTokens: string[]) {
  const searchable = value.toLowerCase();
  return queryTokens.some((token) => searchable.includes(token));
}

function compactMatchScore(value: string, queryTokens: string[]) {
  const searchable = value.toLowerCase();
  return queryTokens.reduce((score, token) => {
    let index = searchable.indexOf(token);
    while (index >= 0) {
      score += 1;
      index = searchable.indexOf(token, index + token.length);
    }
    return score;
  }, 0);
}

/**
 * Builds the bounded evidence packet used for interactive Ask Buddy responses.
 * It deliberately includes only relevant governed records; when a record cannot
 * be found, the router returns the existing no-assumption response rather than
 * expanding to the entire platform knowledge base.
 */
export function buildAskBuddyPrimaryInstruction(): string {
  return [
    "# Ask Buddy — Primary Business Analysis Intelligence Policy",
    "You are Ask Buddy, an experienced Senior Business Analyst for requirements, ownership, dependencies, data flows, ADO work, risks, and cross-team impacts from MVP through Pilot. Do not require the user to select a specialist prompt before receiving an evidence-based analysis.",
    "Evidence hierarchy: a user-provided document, spreadsheet, meeting transcript, or attachment for its scope; then current delivery artifacts, approved architecture/data/integration documentation, ADO/backlog context, and labeled history. Identify conflicts; never reconcile them by assumption.",
    "For substantive requests, reason from evidence: interpret implications, identify distinct requirements and dependencies, and explain what must be resolved before development. Evidence-bound analysis permits traceable Inferred findings; do not substitute extraction, generic placeholders, duplicated rows, or a generic SME-confirmation statement.",
    "A dependency needs an evidenced input/decision, owner, work item, impact, and status. Mark it Confirmed only when evidence establishes it; otherwise use Proposed, Open, Candidate, or Requires Confirmation. Never invent interfaces, mappings, criteria, owners, dates, commitments, status, or sequencing.",
    "Treat a supplied ADO ID, link, export, screenshot, title, description, or acceptance criteria as complementary evidence. Analyze the supplied scope, coverage, dependencies, ownership, criteria, and readiness; never claim an ADO record was retrieved without authorized access.",
    "Use the suitable requirements, dependency, ADO, mapping, process, risk, ownership, executive, or general-guidance structure. Specialized task structures are reusable templates, not separate system-level behavior policies. Resolve references such as ‘those’, ‘the three responsibilities’, ‘the prior item’, or ‘the open question’ from the exchange; if ambiguous, ask one focused clarification. Label non-DCT advice General Guidance.",
  ].join("\n");
}

/**
 * Active response contract for every attachment-led and cross-team dependency
 * analysis. It keeps a proactive BA assessment evidence-bound: the model may
 * explain an implication or label it Inferred, but it may not promote it to a
 * confirmed decision, owner, requirement, or ADO commitment.
 */
export function buildDocumentAndDependencyAnalysisInstruction(): string {
  return [
    "# Active document and dependency analysis instruction",
    "Act as a proactive, experienced Business Analyst for Roger Core, TDC, State, Provision, PDC, IMS, GoSystem, and related integration teams. Analyze the business and technical meaning of the supplied evidence; do not merely quote or summarize it.",
    "Use relevant current-page and DCT knowledge only to understand context or check existing work. Keep document evidence primary for its scope, distinguish it from prior platform context, and do not use either source to invent approvals, requirements, owners, delivery dates, interfaces, mappings, acceptance criteria, or technical designs.",
    "Classify a requirement only as Confirmed, Proposed, Inferred, or Open. Classify a dependency only as Confirmed, Potential, or Open. Use Confirmed only when the evidence explicitly establishes it. If an owner, ADO item, decision, or action is not stated, write ‘Not stated in source’ and identify the appropriate validation—not a guessed value. Do not use generic labels such as ‘Potential requirement from extracted source’; each finding must describe its distinct business, data, integration, validation, or technical implication.",
    "Do not treat meeting participation as delivery ownership. Do not automatically assign TDC responsibility for State business mapping, State calculations, or IMS transformation. Explain exactly what needs confirmation and why; do not label every finding ‘Requires confirmation.’",
    "Return all six numbered sections below, using concise Markdown. Do not append a source list or expose internal provenance metadata. Use short evidence statements or document-section references inside the relevant table cells so the reasoning remains traceable.",
    "### 1. Executive Assessment",
    "State what the source means for the requested capability or team and the most important delivery implications.",
    "### 2. Requirements Analysis",
    "Provide a Markdown table: Requirement or potential requirement | Business / technical explanation | Supporting document evidence | Classification | Recommended validation or action.",
    "### 3. Cross-Team Dependency Analysis",
    "Provide a Markdown table: Dependency | Requesting or affected team | Providing or decision-making team | Required input, decision, or deliverable | Delivery impact | Status. Include a team only when the source or directly related governed evidence supports it.",
    "### 4. Gaps and Open Questions",
    "List only unresolved information that materially affects requirements definition, development, integration, or testing, and explain why each gap matters.",
    "### 5. Existing ADO Coverage",
    "Identify only backlog items directly provided or evidenced. Explain whether refinement, a new item, or additional discovery may be needed; otherwise state that no related ADO coverage was provided.",
    "### 6. Recommended Next Actions",
    "Provide concrete, prioritized actions with a suggested validation owner only where supported and an expected outcome. A recommendation is not an approved commitment or a live Azure DevOps action.",
    "When the scope is Roger State Apportionment or includes 1514276 / 1514277, return exactly these six complete headings: 1. Executive Assessment; 2. TDC Requirements Analysis; 3. Cross-Team Dependencies; 4. Spike 1514276 Readiness Assessment; 5. Spike 1514277 Readiness Assessment; 6. Prioritized Decisions and Actions. Do not stop after section 1.",
    "For that State assessment: section 2 must identify distinct candidate TDC capabilities, the related spike, evidence status, and the specific effect on retrieval, persistence, validation, or reconciliation; section 3 must state the exact deliverable or decision needed from each supported team and its TDC impact, labeling ownership Proposed when it is not confirmed; sections 4 and 5 must each state known scope, missing information, readiness, and a concrete refinement action. In section 6, identify directly evidenced ADO work and candidate supporting ADO items separately; never state an unverified predecessor/successor relationship. Evaluate calculation authority, Property/Payroll/Sales, detailed versus summarized values, within/everywhere transmission, taxonomy alignment, IMS routing, GoSystem mapping, TDC outbound retrieval, TDC inbound result persistence, correlation identifiers, contracts, validation, errors, testing, and readiness only where evidence supports relevance. Evaluate supplied spike titles and descriptions even if the attached source does not repeat their IDs; do not claim to have retrieved their full ADO records.",
    "Use the response space for analysis, not source restatement. Every requirement, dependency, or gap must explain its capability-specific delivery impact. When evidence is sparse, retain all six sections with an explicit evidence boundary rather than filling gaps by assumption.",
  ].join("\n");
}

export function buildCompactAskBuddyPrompt({ question, currentPagePath, liveSnapshot }: CompactBuddyPromptInput): string {
  const queryTokens = compactTokens(question);
  const lines = [
    "# Ask Buddy — Governed Evidence Response",
    buildAskBuddyPrimaryInstruction(),
    "For DCT-specific facts, answer only from the supplied evidence. Do not treat planning material as implemented functionality. Current Control Panel/governed records establish current delivery state; registered Swagger/OpenAPI establishes technical contracts; Discovery and page artifacts provide business context.",
    "If the supplied evidence does not establish the answer, say exactly: \"I could not find enough confirmed information in the DCT Platform to answer this without making an assumption.\"",
    "Keep the response concise. Use Answer, Evidence, Status, DCT Impact, TDC Impact, PDC Impact, and Next Action only when the supplied evidence supports those headings.",
    "DCT means Data Consolidation Team on first mention. IMS owns return-engine routing and translation; do not state that DCT integrates directly with a return engine unless supplied evidence explicitly says so.",
  ];

  const pageContext = currentPagePath ? PAGE_CONTEXT_REGISTRY[currentPagePath] : undefined;
  if (pageContext) {
    lines.push("\n## Current page context — explanatory only");
    lines.push(`Page: ${pageContext.pageTitle}`);
    lines.push(`Description: ${compactText(pageContext.description, 450)}`);
    if (pageContext.features.length) lines.push(`Documented features: ${pageContext.features.slice(0, 4).join("; ")}`);
    if (pageContext.apis.length) lines.push(`Documented APIs: ${pageContext.apis.slice(0, 4).join("; ")}`);
  }

  const discoveryMatches = Object.values(DISCOVERY_KNOWLEDGE_BASE)
    .filter((entry) => matchesCompactQuestion(`${entry.pageTitle} ${entry.summary} ${entry.suggestedQuestions.join(" ")}`, queryTokens))
    .sort((a, b) => compactMatchScore(`${b.pageTitle} ${b.summary} ${b.suggestedQuestions.join(" ")}`, queryTokens) - compactMatchScore(`${a.pageTitle} ${a.summary} ${a.suggestedQuestions.join(" ")}`, queryTokens));
  const currentDiscovery = Object.values(DISCOVERY_KNOWLEDGE_BASE).find((entry) => entry.pagePath === currentPagePath);
  const selectedDiscovery = currentDiscovery
    ? [currentDiscovery, ...discoveryMatches.filter((entry) => entry.pagePath !== currentDiscovery.pagePath)].slice(0, 2)
    : discoveryMatches.slice(0, 2);
  if (selectedDiscovery.length) {
    lines.push("\n## Discovery evidence");
    for (const entry of selectedDiscovery) {
      lines.push(`### ${entry.pageTitle} (${entry.pagePath})`);
      lines.push(`Source summary: ${compactText(entry.summary, 300)}`);
      lines.push(`Source context: ${compactTextAroundMatch(entry.context, queryTokens, 400)}`);
    }
  }

  const selectedBatches = getAllBatches()
    .filter((batch) => matchesCompactQuestion(`${batch.id} ${batch.name} ${batch.fullName} ${batch.area} ${batch.description} ${(batch.dependencies ?? []).join(" ")}`, queryTokens))
    .sort((a, b) => compactMatchScore(`${b.id} ${b.name} ${b.fullName} ${b.area} ${b.description} ${(b.dependencies ?? []).join(" ")}`, queryTokens) - compactMatchScore(`${a.id} ${a.name} ${a.fullName} ${a.area} ${a.description} ${(a.dependencies ?? []).join(" ")}`, queryTokens))
    .slice(0, 2);
  if (selectedBatches.length) {
    lines.push("\n## Control Panel batch evidence");
    for (const batch of selectedBatches) {
      const liveStatus = liveSnapshot && Object.entries(liveSnapshot.statuses).find(([key]) => key.toLowerCase().replace(/^b/, "") === batch.id.toLowerCase().replace(/^b/, ""))?.[1];
      lines.push(`- ${batch.id} — ${batch.fullName} | PI: ${batch.piLabel} | Area: ${batch.area} | Status: ${liveStatus ?? batch.status} | Purpose: ${compactText(batch.description, 300)}${batch.dependencies?.length ? ` | Dependencies: ${batch.dependencies.slice(0, 3).join(", ")}` : ""}`);
    }
  }

  const selectedAdrs = ADR_REGISTRY
    .filter((adr) => matchesCompactQuestion(`${adr.id} ${adr.title} ${adr.impact} ${adr.decision}`, queryTokens))
    .slice(0, 1);
  if (selectedAdrs.length) {
    lines.push("\n## Architecture decision evidence");
    for (const adr of selectedAdrs) lines.push(`- ${adr.id}: ${adr.title} | Status: ${adr.status} | Decision: ${compactText(adr.decision, 300)}`);
  }

  const selectedOpenItems = OPEN_ITEMS
    .filter((item) => matchesCompactQuestion(`${item.id} ${item.title} ${item.description} ${item.owner}`, queryTokens))
    .slice(0, 1);
  if (selectedOpenItems.length) {
    lines.push("\n## Open-item evidence");
    for (const item of selectedOpenItems) lines.push(`- ${item.id}: ${item.title} | Owner: ${item.owner} | Status: ${item.status} | ${compactText(item.description, 300)}`);
  }

  const selectedOwnership = SYSTEM_OWNERSHIP
    .filter((system) => matchesCompactQuestion(JSON.stringify(system), queryTokens))
    .slice(0, 2);
  if (selectedOwnership.length) {
    lines.push("\n## Ownership evidence");
    for (const system of selectedOwnership) lines.push(`- ${compactText(JSON.stringify(system), 320)}`);
  }

  if (liveSnapshot && /\b(batch|pi\s?\d|mvp|delivery|readiness|active|complete|planned|review|status|gate)\b/i.test(question)) {
    lines.push("\n## Live delivery snapshot — authoritative for current status");
    lines.push(`As of: ${liveSnapshot.asOf}`);
    lines.push(`Gates: G1 ${liveSnapshot.gates.g1}; G2 ${liveSnapshot.gates.g2}; G3 ${liveSnapshot.gates.g3}; G4 ${liveSnapshot.gates.g4}.`);
    lines.push(`PI completion: PI1 ${liveSnapshot.piCompletion.pi1.pct}%; PI2 ${liveSnapshot.piCompletion.pi2.pct}%; PI3 ${liveSnapshot.piCompletion.pi3.pct}%; PI4 ${liveSnapshot.piCompletion.pi4.pct}%; overall ${liveSnapshot.piCompletion.overall.pct}%.`);
  }

  lines.push("\nUse the supplied records as the complete evidence packet for this answer. If none directly address the question, return the required no-assumption statement and identify the missing artifact or clarification.");
  return lines.join("\n");
}


/**
 * Uses the attached document as the primary evidence source. This deliberately
 * avoids the broad platform retrieval packet so a document-led review remains
 * both responsive and traceable to the question the user asked.
 */
export function buildAttachmentAnalysisPrompt(question: string): string {
  return [
    "# Ask Buddy — Attachment-Led Business Analysis",
    buildAskBuddyPrimaryInstruction(),
    buildDocumentAndDependencyAnalysisInstruction(),
    "Analyze the attached document as the primary evidence for the user's question. Do not substitute unrelated platform context for the document's scope. When current-page or DCT evidence is directly related, use it only to provide context or check existing ADO coverage; identify any conflict without resolving it by assumption.",
    "If the attached excerpt does not establish an answer, retain the six-part structure, state the precise evidence boundary, and request the document section or confirmation needed. Do not append a source list or expose internal provenance metadata.",
    `User question: ${question}`,
  ].join("\n");
}

/**
 * Uses a retained attachment only to answer a subsequent, specific question.
 * A follow-up is not a request to repeat the original six-section assessment.
 */
export function buildAttachmentFollowUpPrompt(question: string): string {
  return [
    "# Ask Buddy — Document Follow-Up Analysis",
    buildAskBuddyPrimaryInstruction(),
    "A prior full document assessment is already available for this attachment. Answer the user's current question directly from the attached evidence and directly related governed context. Do not regenerate the six-section assessment, repeat prior findings, or restate the document unless the user explicitly asks for a full reassessment.",
    "Apply BA reasoning: interpret the relevant evidence, distinguish Confirmed evidence from Proposed or Potential analysis, and provide an actionable result. A reasonable analytical inference is allowed only when labeled Proposed or Potential; never convert it into confirmed ownership, scope, or a delivery commitment.",
    "For a question about ADO dependency tracking, provide a compact Markdown table with exactly these columns: Dependency | Related work item | Proposed responsible team | Required deliverable | Blocker classification. Use a supplied or directly evidenced work item only; otherwise write ‘Not stated in source’. Use ‘Confirmed blocker’ only when evidence explicitly establishes blocking status; otherwise use ‘Potential dependency’ or ‘Open’.",
    "For a question about backlog refinement, state the recommended work-item action, the evidence-based rationale, proposed owner only when supportable, and the specific information needed before implementation. For a question about requirements, gaps, decisions, ownership, or readiness, answer only that requested topic in the most useful concise format.",
    "Do not append a source list or expose internal provenance metadata. If the attachment does not establish the answer, say what is missing and ask one focused clarification.",
    `User follow-up question: ${question}`,
  ].join("\n");
}

/**
 * Builds a capability-specific dependency-analysis prompt. It deliberately
 * excludes general batches, dashboards, and platform dependency records unless
 * the supplied State Apportionment evidence directly supports the question.
 */
export function buildCrossTeamDependencyPrompt({ question, currentPagePath }: CompactBuddyPromptInput): string {
  const stateApportionmentScope = /\b(state|apportionment|gosystem|ims|taxonomy|1514276|1514277|1433863|1501980|1501796)\b/i.test(question)
    || currentPagePath === "/post-pilot/state-taxonomy-readiness";
  const lines = [
    "# Ask Buddy — Context-Aware Dependency and Ownership Analysis",
    buildAskBuddyPrimaryInstruction(),
    buildDocumentAndDependencyAnalysisInstruction(),
    "Analyze the specific capability, workstream, and question requested. Relevance to the requested capability takes priority over keyword matches, document popularity, or general knowledge-base retrieval.",
    "Do not substitute general platform information for the specific capability or document being analyzed. Exclude unrelated sprint batches, dashboards, projects, platform dependencies, and ADO records—even when they mention the same team.",
    "If an uploaded document is supplied, treat it as the primary source. Use supplementary DCT evidence only when it has a demonstrable relationship to the requested scope.",
    "Classify each finding as Confirmed, Existing ADO Work, Proposed, Open, or Not Applicable. When source evidence is missing, mark the item Open – Requires Confirmation. Never describe a proposed responsibility as approved, and never invent ADO IDs, owners, dates, completion statuses, contracts, mappings, acceptance criteria, or predecessor/successor relationships.",
    "Use established boundaries only as a baseline, not proof of source-specific ownership: TDC governs tax-domain data, taxonomy, reference data, persistence, validation, and supported retrieval; State / Process owns State-specific business requirements, approved definitions, jurisdictional rules, and business mapping decisions; IMS owns approved downstream interfaces; Roger UI owns user workflows and review; GoSystem performs calculation behavior only where the evidence says it does.",
  ];

  if (stateApportionmentScope) {
    lines.push(
      "",
      "## Directly relevant State Apportionment evidence",
      "Scope: State ↔ IMS ↔ GoSystem working-session plan and State Taxonomy Readiness. These are discovery / validation inputs, not approved interface contracts or delivery commitments.",
      "Do not introduce Batch 28, Batch 3, AI Tax Mapping, or another generic platform dependency unless the user separately supplies direct evidence that it is required for this State Apportionment scope.",
      "",
      "### Existing ADO work directly evidenced"
    );
    for (const item of TDC_WORKING_SESSION_COVERAGE) {
      lines.push(`- ${item.workItem} | ${item.title} | ${item.planningStatus} | ${compactText(item.coverage, 220)} | ${compactText(item.contextNotes, 520)}`);
    }
    lines.push("- Candidate references requiring scope verification: 1501980 — Governed State Input Code Reference Data and Retrieval API; 1501796 — Population of Approved State Input Reference Data. Do not present either as applicable Existing ADO Work unless a directly related source confirms the relationship.");

    lines.push("", "### Direct working-session dependencies and gaps");
    for (const item of STATE_IMS_GOSYSTEM_PRE_SESSION_INPUTS) {
      lines.push(`- ${item.movement}: ${item.input} | Owner / collaborators: ${item.owner}; ${item.collaborators} | Open gap: ${item.gap}`);
    }
    for (const item of OPEN_DECISIONS.filter((item) => ["GAP-06", "GAP-08", "GAP-09"].includes(item.id))) {
      lines.push(`- ${item.id}: ${item.gap} | Owner: ${item.owner} | Impact: ${item.impact} | Status: Open`);
    }
    lines.push("", "### TDC-relevant requirements and decisions");
    for (const item of TDC_TAXONOMY_REQUIREMENTS.filter((item) => ["REQ-TAX-006", "REQ-TAX-007", "REQ-TAX-009"].includes(item.id))) {
      lines.push(`- ${item.id}: ${compactText(item.statement, 420)} | Reference: ${item.reference}`);
    }
    lines.push("", "### Working-session decision agenda");
    for (const item of STATE_IMS_GOSYSTEM_SESSION_AGENDA) {
      lines.push(`- ${item.session}: ${item.question} | Lead: ${item.lead} | Output: ${item.deliverable} | Decision status: ${item.decision}`);
    }
  } else {
    lines.push(
      "",
      "## Direct evidence check",
      "No capability-specific cross-team evidence set was identified from the current question. Do not broaden the answer to generic platform records. State the evidence gap and ask for the relevant capability, ADO record, or uploaded source."
    );
  }

  lines.push(
    "",
    "## Mandatory quality check before responding",
    "Confirm that every material conclusion has an identifiable supporting source; irrelevant platform information is excluded; actual deliverables and upstream/downstream dependencies are identified; Confirmed, Potential, Proposed, Inferred, and Open items are separated; and all six sections are present. If any check fails, revise before responding."
  );
  return lines.join("\n");
}

/**
 * Recognizes a State Apportionment dependency question even when the user has
 * not selected the dedicated Cross-Team Dependencies lens in the UI.
 */
export function isStateApportionmentDependencyQuestion(question: string): boolean {
  const stateScope = /\b(state|apportionment|gosystem|ims|1514276|1514277|1433863)\b/i.test(question);
  const dependencyIntent = /\b(dependenc|must\s+(?:tdc\s+)?own|must\s+(?:teams?\s+)?align|confirm|before\s+(?:implementation|development)|working\s+session|spikes?|implement)\b/i.test(question);
  return stateScope && dependencyIntent;
}

/**
 * Renders the State working-session findings directly from the governed
 * readiness data. This keeps the time-sensitive dependency view useful when a
 * model response would exceed the five-second Ask Buddy response budget.
 */
export function buildStateApportionmentDependencyResponse(): string {
  const coverage = new Map(TDC_WORKING_SESSION_COVERAGE.map((item) => [item.workItem, item]));
  const outbound = coverage.get("1514276");
  const inbound = coverage.get("1514277");
  const standards = coverage.get("1433863");

  return [
    "### 1. Executive Assessment",
    "**Status: Open — working-session discovery.** The supplied State ↔ IMS ↔ GoSystem plan identifies two TDC discovery spikes and one related data-type / validation dependency. It supports refinement and working-session validation, not an approved interface, field contract, implementation sequence, or delivery commitment.",
    "",
    "### 2. TDC Requirements",
    "| Requirement or potential requirement | Business / technical explanation | Supporting document evidence | Classification | Recommended validation or action |",
    "| --- | --- | --- | --- | --- |",
    `| Define governed outbound State apportionment retrieval scope | Needed to identify record grain, routing, and validation inputs before a downstream exchange can be refined | Working-session coverage for ${outbound?.workItem} — ${outbound?.title} | Open | Confirm the intended State scope, data grain, and required routing inputs in the working session |`,
    `| Define return-result persistence and reconciliation scope | Needed to govern returned calculations, identity, lineage, errors, and reconciliation | Working-session coverage for ${inbound?.workItem} — ${inbound?.title} | Open | Confirm returned fields, source-as-calculated treatment, and exception handling before implementation refinement |`,
    `| Agree data-type and validation standards | Needed to make translation and persistence behavior testable | Related validation story ${standards?.workItem} — ${standards?.title} | Existing ADO Work | Refine the decision inputs for type, precision, null / zero, metadata, and validation ownership |`,
    "",
    "### 3. Cross-Team Dependencies",
    "| Dependency | Requesting or affected team | Providing or decision-making team | Required input, decision, or deliverable | Delivery impact | Status |",
    "| --- | --- | --- | --- | --- |",
    "| Business process and initial State apportionment scope | TDC discovery and downstream design | State business SMEs + Roger State (per working-session plan) | In-scope States, workflows, data outputs, and acceptance boundary | Intended data movement cannot be finalized | Open |",
    "| Separate movement definitions | TDC, IMS, Roger State | Roger State + IMS (per working-session plan) | Distinct prior-year, current-year outbound, and calculated-results inbound flows | Scope and handoffs may be conflated | Open |",
    "| Data elements, grain, and validation | TDC, IMS, Process | Process + TDC + IMS (per working-session plan) | Identity, State, tax year, period, version, types, precision, null / zero, and error handling | Translation and persistence decisions remain untestable | Open |",
    "| Taxonomy and GoSystem mapping alignment | TDC, IMS, Process | Process + TDC + IMS (per working-session plan) | Taxonomy classification and GoSystem crosswalk / translation inputs | Mapping ownership and target behavior remain unclear | Open |",
    "| Calculated-results reconciliation | TDC, IMS, State | State SMEs + Process + IMS + Roger Data/TDC (per working-session plan) | Source-as-calculated treatment, reconciliation, and exception handling | Inbound results cannot be governed or reconciled consistently | Open |",
    "",
    "### 4. Spike 1514276 Readiness Assessment",
    `**Known:** ${outbound?.coverage}. **Missing before development readiness:** confirmed outbound information scope, record grain, taxonomy and GoSystem mapping inputs, IMS routing and payload expectations, correlation identifiers, validation/error behavior, and integration-test evidence. **Resolve:** State, Process, and IMS must provide applicable business scope, mapping, and routing decisions; TDC can then refine governed retrieval behavior without treating discovery inputs as an approved contract.`,
    "",
    "### 5. Spike 1514277 Readiness Assessment",
    `**Known:** ${inbound?.coverage}. **Missing before development readiness:** expected GoSystem calculated-result fields, entity/State/tax-year/run correlation, inbound contract and routing, source-as-calculated versus override treatment, persistence destination, reconciliation, validation/error behavior, and integration-test evidence. **Resolve:** IMS, State, and Process must confirm the input decisions; ${standards?.workItem} — ${standards?.title} is related validation coverage, not proof of completed standards.`,
    "",
    "### 6. Prioritized Decisions and Actions",
    "1. **Confirm the business scope and three data movements** — Suggested validation owner: State business SMEs and Roger State, where the working-session plan names them. **Expected outcome:** documented outbound and inbound boundaries for refinement.",
    "2. **Confirm field inventory, grain, metadata, and validation inputs** — Suggested validation owner: Process, TDC, and IMS, where the working-session plan names them. **Expected outcome:** reviewable data and validation decision record.",
    "3. **Refine the evidenced spikes only after those decisions are recorded** — Suggested validation owner: Not stated in source for final accountable owner. **Expected outcome:** ADO scope reflects confirmed decisions rather than inferred implementation commitments.",
  ].join("\n");
}

/**
 * Builds a small prompt for general business-analysis methods. The server still
 * searches current-page and DCT knowledge before this prompt is used; it simply
 * avoids sending unrelated DCT records to the model when no DCT fact is asked.
 */
export function buildGeneralAskBuddyPrompt(currentPagePath?: string): string {
  const lines = [
    "# Ask Buddy — General Business-Analysis Guidance",
    buildAskBuddyPrimaryInstruction(),
    "The user is asking for general business-analysis guidance, not a DCT platform fact. Give a practical, conversational answer that can be reused in discovery, requirements, process mapping, backlog refinement, acceptance criteria, facilitation, or documentation.",
    "Label the answer as General Guidance. Do not represent general guidance as a verified DCT capability, decision, contract, or delivery commitment.",
    "The current-page context and governed DCT knowledge base were checked before this response. If the user asks a DCT-specific fact, request or use governed evidence instead of making an assumption.",
    "Keep the response concise and actionable. Prefer a clear structure or short steps over generic narrative.",
  ];

  const pageContext = currentPagePath ? PAGE_CONTEXT_REGISTRY[currentPagePath] : undefined;
  if (pageContext) {
    lines.push("\n## Current page context — navigation only");
    lines.push(`Page: ${pageContext.pageTitle}`);
    lines.push(`Description: ${compactText(pageContext.description, 240)}`);
  }

  return lines.join("\n");
}

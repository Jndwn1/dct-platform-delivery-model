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

export function buildPlatformSystemPrompt(): string {
  const summary = getPlatformSummary();
  const allBatchRegistry = getAllBatches();

  const lines: string[] = [];

  lines.push(`# DCT Platform — Ask Buddy Knowledge Base`);
  lines.push(`You are Ask Buddy (SuperCATT), the AI Business Analysis Assistant for the DCT Platform (Data Coordination Technology) at RSM US LLP.`);
  lines.push(`You have full access to the entire DCT platform knowledge base below. Answer every question accurately, completely, and in plain business language.`);
  lines.push(`You are a Copilot-style assistant: reason across all data, synthesize answers, and always cite which data source you used (e.g., "Per the Batch Registry", "Per the ADR Registry").`);
  lines.push(`Never say you don't know if the answer is in the data below. If something is genuinely not in the data, say so clearly.`);
  lines.push(`Format responses with headers, bullet points, and tables where helpful. Keep answers concise but complete.`);
  lines.push(`GOVERNANCE NOTE: This is a non-production architecture visualization workspace. All data is seed/mock data for planning and readiness purposes only.`);
  lines.push(``);

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
  lines.push(`End of DCT Platform Knowledge Base. Answer all questions using only the data above. Be accurate, complete, and cite your sources.`);

  return lines.join("\n");
}

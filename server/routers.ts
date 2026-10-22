import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM, LLMRequestTimeoutError } from "./_core/llm";
import { buildAttachmentAnalysisPrompt, buildCompactAskBuddyPrompt, buildCrossTeamDependencyPrompt, buildGeneralAskBuddyPrompt, buildStateApportionmentDependencyResponse, isStateApportionmentDependencyQuestion } from "./platformContext";
import { buildDiscoveryContextBlock } from "./discoveryKnowledgeBase";
import { buildBuddyGrounding, buildFocusedCrossTeamGrounding, buildInsufficientEvidenceResponse } from "./askBuddyGrounding";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { askBuddyAudits, integrationQuestions, deployments, deploymentScreens, postPilotDeployments, qaDeployments, qaScreenRecords, tdcMeetingRecaps, uatTestCases, uatDefects, uatRisks, mappingArtifacts, mappingResults, mappingSessions } from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { createMappingCandidates, isMappableArtifactField, mappingReadiness, parseArtifactBuffer, type ArtifactField } from "./dataMappingEngine";
import { analyzeStateInputReferenceContract, buildStateContractMappingWorkbook } from "./stateContractAnalysis";
import { buildMasterDataEvidence, isMasterDataQuestion, MASTER_DATA_ANSWER_FALLBACK, selectAuthoritativeMasterDataArtifact } from "./masterDataRegistry";
import { buildAttachmentEvidenceFallback, parseAskBuddyAttachmentRecord, parseStructuredAttachmentFields, prepareAskBuddyAttachment } from "./askBuddyAttachmentEngine";
import mammoth from "mammoth";
import { analyzeTdcStandupTranscript, buildTdcStandupEmail, formatMeetingDate } from "./meetingRecaps";

const DCT_PLATFORM_QUESTION = /\b(dct|tdc|pdc|roger|ims|gosystem|tax portal|control panel|swagger|openapi|batch|gate|guardrail|lineage|adrs?|ado|pilot|mvp|state taxonomy)\b/i;
const ADO_URL_PATTERN = /https?:\/\/dev\.azure\.com\/[^\s)\]]+\/[^\s)\]]*\/_workitems\/edit\/(\d{4,})[^\s)\]]*/gi;
const ADO_ID_PATTERN = /\b(?:ado\s*(?:work\s*item\s*)?(?:id\s*)?[#: -]?\s*|feature\s*|user\s*story\s*|technical\s*story\s*|spike\s*|bug\s*|task\s*)(\d{4,})\b/gi;
const STANDALONE_ADO_ID_PATTERN = /\b\d{6,8}\b/g;
const DOCUMENT_ANALYSIS_MODEL = "gpt-6-luna";
const DOCUMENT_ANALYSIS_TIMEOUT_MS = 14_000;
const DOCUMENT_ANALYSIS_MAX_TOKENS = 1_000;
const DOCUMENT_EVIDENCE_MAX_CHARS = 10_000;

function getSuppliedAdoReferences(text: string) {
  const references = new Map<string, { id: string; url?: string }>();
  let match: RegExpExecArray | null;
  ADO_URL_PATTERN.lastIndex = 0;
  while ((match = ADO_URL_PATTERN.exec(text)) !== null) {
    references.set(match[1], { id: match[1], url: match[0] });
  }
  ADO_ID_PATTERN.lastIndex = 0;
  while ((match = ADO_ID_PATTERN.exec(text)) !== null) {
    if (!references.has(match[1])) references.set(match[1], { id: match[1] });
  }
  STANDALONE_ADO_ID_PATTERN.lastIndex = 0;
  while ((match = STANDALONE_ADO_ID_PATTERN.exec(text)) !== null) {
    if (!references.has(match[0])) references.set(match[0], { id: match[0] });
  }
  return Array.from(references.values()).slice(0, 12);
}

function buildSuppliedAdoReferenceContext(question: string) {
  const references = getSuppliedAdoReferences(question);
  if (!references.length) return "";
  return `\n\nADO REFERENCES SUPPLIED BY THE USER — ANALYZE ONLY PROVIDED DETAILS\n${references.map((reference) => `- ADO ${reference.id}${reference.url ? ` | ${reference.url}` : ""}`).join("\n")}\nNo authorized Azure DevOps retrieval connection is available in this workspace. Do not claim the links were opened or that title, state, owner, acceptance criteria, hierarchy, or related links were retrieved. Analyze any supplied title, description, acceptance criteria, screenshot, export, or attachment alongside these references; otherwise identify the exact information needed. Preserve the ADO ID and supplied URL in the relevant finding.`;
}

function buildGeneralBusinessGuidanceFallback(question: string) {
  if (/workshop|requirements session|elicitation/i.test(question)) {
    return `### General Guidance

Use a short, decision-oriented workshop agenda:

1. **Purpose and decisions** — confirm the business outcome, decisions needed, and scope boundary.
2. **Current state and evidence** — review the process, source artifacts, assumptions, and constraints already known.
3. **Requirements and scenarios** — walk through priority user scenarios, business rules, exceptions, and data needs.
4. **Gaps and dependencies** — identify unanswered questions, cross-team dependencies, risks, and required SME follow-up.
5. **Decisions and next actions** — capture owners, due dates, and the next backlog or documentation artifact.

**Facilitation tip:** Send the objective, pre-read, and decision questions in advance; use the session to resolve choices rather than read material aloud.`;
  }

  return `### General Guidance

Start with the outcome and decision the work must support. Then capture the current-state evidence, priority scenarios, business rules, data needs, gaps, dependencies, and accountable next actions. Keep confirmed facts separate from assumptions, and turn unresolved items into clearly owned follow-ups.`;
}

function buildStructuredAttachmentAnalysisFallback(
  question: string,
  analysis: ReturnType<typeof analyzeStateInputReferenceContract>
) {
  const gapRows = analysis.gaps.slice(0, 4);
  const dependencyRows = analysis.dependencies.slice(0, 4);
  return [
    "### 1. Executive Assessment",
    `This evidence-bound first pass is based on the uploaded structured source for: ${question}. It identifies captured field-contract gaps and cross-team dependency signals for review; it does not establish an approved mapping, interface, ownership assignment, or delivery commitment.`,
    "",
    "### 2. Requirements Analysis",
    "| Requirement or potential requirement | Business / technical explanation | Supporting document evidence | Classification | Recommended validation or action |",
    "| --- | --- | --- | --- | --- |",
    ...(gapRows.length
      ? gapRows.map((gap) => `| ${gap.area}: ${gap.finding} | Structured-source review identified a field-contract or governance gap. | Source gap ${gap.id} | Open | ${gap.nextAction} |`)
      : ["| No field-contract requirement gap was captured | The structured review did not capture a requirement gap. | Source review summary | Open | Validate the source scope and whether additional requirements exist. |"]),
    "",
    "### 3. Cross-Team Dependency Analysis",
    "| Dependency | Requesting or affected team | Providing or decision-making team | Required input, decision, or deliverable | Delivery impact | Status |",
    "| --- | --- | --- | --- | --- |",
    ...(dependencyRows.length
      ? dependencyRows.map((dependency) => `| ${dependency.dependency} | ${dependency.workstream} | Not stated in source | ${dependency.evidence} | ${dependency.nextAction} | ${dependency.status} |`)
      : ["| No structured cross-team dependency was captured | Not stated in source | Not stated in source | Provide the related decision, contract, or mapping input. | Delivery impact cannot be assessed from the structured source. | Open |"]),
    "",
    "### 4. Gaps and Open Questions",
    ...(gapRows.length
      ? gapRows.map((gap) => `- **${gap.area}:** ${gap.finding} This matters because ${gap.nextAction}`)
      : ["- **Source scope:** No explicit gap was captured. Confirm whether the workbook covers the complete requirement and integration scope."]),
    "",
    "### 5. Existing ADO Coverage",
    "No related ADO item was directly identified in the uploaded structured source. Compare confirmed findings with the governing backlog before creating or refining work.",
    "",
    "### 6. Recommended Next Actions",
    "1. Validate the listed requirement and dependency signals with the accountable SMEs or decision-makers. **Expected outcome:** confirmed status and source-backed ownership.",
    "2. Resolve the highest-priority field-contract gaps in the working session or governing documentation. **Expected outcome:** reviewable inputs for mapping, integration, and testing refinement.",
    "3. Compare confirmed findings with existing backlog coverage. **Expected outcome:** a decision to refine an existing item, create a review-only draft, or continue discovery.",
  ].join("\n");
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  askBuddy: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
          // Optional: current Discovery Center page path for context-aware responses
          discoveryPagePath: z.string().optional(),
          // Current platform page provides context but does not restrict platform-wide evidence retrieval
          currentPagePath: z.string().optional(),
          // Selected assistant changes analysis style, not the sources available to Buddy
          capability: z.string().optional(),
          // Optional structured source uploaded from the Ask Buddy composer. Analysis is retrieved server-side.
          attachmentArtifactId: z.number().int().positive().optional(),
          // Live batch snapshot from the client's BatchStatusContext
          liveSnapshot: z.object({
            asOf: z.string(),
            statuses: z.record(z.string()),
            gates: z.object({
              g1: z.string(),
              g2: z.string(),
              g3: z.string(),
              g4: z.string(),
            }),
            piCompletion: z.object({
              pi1: z.object({ total: z.number(), complete: z.number(), pct: z.number() }),
              pi2: z.object({ total: z.number(), complete: z.number(), pct: z.number() }),
              pi3: z.object({ total: z.number(), complete: z.number(), pct: z.number() }),
              pi4: z.object({ total: z.number(), complete: z.number(), pct: z.number() }),
              overall: z.object({ total: z.number(), complete: z.number(), pct: z.number() }),
            }),
            completedBatches: z.array(z.string()),
            activeBatches: z.array(z.string()),
            blockedBatches: z.array(z.string()),
            plannedBatches: z.array(z.string()),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const requestStartedAt = Date.now();
        const currentPagePath = input.currentPagePath ?? input.discoveryPagePath;
        const question = [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
        const db = await getDb();
        const masterDataQuestion = isMasterDataQuestion(question);
        const masterArtifactsPromise = db && masterDataQuestion
          ? db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt)).limit(8)
          : Promise.resolve([]);
        const attachmentArtifactPromise = input.attachmentArtifactId && db
          ? db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, input.attachmentArtifactId)).limit(1)
          : Promise.resolve([]);
        const [masterArtifacts, attachmentArtifacts] = await Promise.all([masterArtifactsPromise, attachmentArtifactPromise]);
        const attachmentArtifact = attachmentArtifacts[0];
        if (input.attachmentArtifactId && !attachmentArtifact) {
          throw new Error("The uploaded attachment could not be found. Please attach the file again.");
        }
        const attachmentRecord = attachmentArtifact ? parseAskBuddyAttachmentRecord(attachmentArtifact.fieldsJson) : null;
        const structuredAttachmentFields = attachmentArtifact ? parseStructuredAttachmentFields(attachmentArtifact.fieldsJson) : null;
        const attachmentAnalysis = attachmentArtifact && structuredAttachmentFields
          ? analyzeStateInputReferenceContract(structuredAttachmentFields, attachmentArtifact.fileName, attachmentArtifact.versionLabel)
          : null;
        const attachmentEvidence = attachmentAnalysis && attachmentArtifact
          ? `

UPLOADED STRUCTURED SOURCE REVIEW — REVIEW ONLY, NOT AN APPROVED MAPPING OR INTERFACE
Source: ${attachmentArtifact.fileName} · ${attachmentArtifact.versionLabel}
Captured State input rows: ${attachmentAnalysis.source.inputRows}; field-contract rows: ${attachmentAnalysis.source.fieldContractRows}; validation-rule rows: ${attachmentAnalysis.source.validationRules}; open-question rows: ${attachmentAnalysis.source.openQuestions}; TCC relationships needing review: ${attachmentAnalysis.source.unclassifiedTccPatterns}.

Priority gaps from the uploaded source:
${attachmentAnalysis.gaps.map(gap => `- ${gap.id} | ${gap.area}: ${gap.finding} Next action: ${gap.nextAction}`).join("\n")}

Cross-team dependencies from the uploaded source:
${attachmentAnalysis.dependencies.map(dependency => `- ${dependency.workstream} | ${dependency.dependency} (${dependency.status}): ${dependency.evidence} Next action: ${dependency.nextAction}`).join("\n")}

Use the uploaded source to answer the user's question. Clearly distinguish source-backed findings, open gaps, and dependencies from confirmed or approved decisions.`
          : attachmentRecord?.analysisStatus === "Extracted"
            ? `

UPLOADED ATTACHMENT — EXTRACTED CONTENT, REFERENCE ONLY
Source: ${attachmentArtifact?.fileName} · ${attachmentArtifact?.versionLabel}
Format: ${attachmentRecord.format}
Extraction note: ${attachmentRecord.note}

Extracted source excerpt:
${attachmentRecord.textExcerpt}

Use only this extracted content when addressing the user's question. Clearly distinguish source-backed findings from confirmed decisions, and do not infer content beyond the excerpt.`
            : "";
        const attachmentReferenceNote = attachmentRecord?.analysisStatus === "Reference Only"
          ? `

UPLOADED ATTACHMENT — REFERENCE ONLY
Source: ${attachmentArtifact?.fileName} · ${attachmentArtifact?.versionLabel}
Format: ${attachmentRecord.format}
${attachmentRecord.note}
Do not infer content from this file.`
          : "";
        const priorConversation = input.messages
          .slice(0, -1)
          .slice(-2)
          .map((message) => message.content)
          .join("\n");
        const followUpReference = /\b(those|these|them|the three|prior|previous|above)\b/i.test(question);
        const stateApportionmentDependencyQuestion = isStateApportionmentDependencyQuestion(question)
          || (followUpReference && isStateApportionmentDependencyQuestion(priorConversation));
        const crossTeamDependenciesMode = input.capability === "cross-team-dependencies" || stateApportionmentDependencyQuestion;
        const masterEvidence = buildMasterDataEvidence(question, selectAuthoritativeMasterDataArtifact(masterArtifacts));
        const grounding = crossTeamDependenciesMode
          ? buildFocusedCrossTeamGrounding(question, currentPagePath, masterEvidence.source)
          : buildBuddyGrounding(question, currentPagePath, input.liveSnapshot, masterEvidence.source);
        const attachmentAnalysisMode = attachmentRecord?.analysisStatus === "Extracted" && attachmentEvidence.length > 0;
        const structuredAttachmentAnalysisMode = Boolean(attachmentAnalysis && attachmentArtifact);
        const documentAndDependencyAnalysisMode = attachmentAnalysisMode || structuredAttachmentAnalysisMode || crossTeamDependenciesMode;
        const requiresPlatformEvidence = crossTeamDependenciesMode || DCT_PLATFORM_QUESTION.test(question) || masterDataQuestion || Boolean(input.attachmentArtifactId);
        const storyReviewEvidence = input.capability === "story-review" && currentPagePath === "/post-pilot"
          ? buildDiscoveryContextBlock("/post-pilot").slice(0, 6_000)
          : "";
        const entryContext = currentPagePath
          ? `\n\nEntry-page context: ${currentPagePath}. This is a navigation cue only. Do not use it as a factual source or allow it to alter the authoritative answer. You may add a brief optional page-relevance sentence only after answering from the central evidence layer.`
          : "";
        const generalBusinessGuidance = requiresPlatformEvidence
          ? ""
          : `\n\nGENERAL BUSINESS-ANALYSIS MODE\nThe user is asking a general business-analysis question rather than a DCT platform fact. Provide practical, conversational guidance for discovery, requirements, process mapping, backlog refinement, acceptance criteria, facilitation, or documentation. You may use general professional knowledge, but label any non-DCT guidance as general guidance and do not present it as a verified DCT capability, decision, or delivery commitment.`;
        const evidencePacket = requiresPlatformEvidence && !attachmentAnalysisMode
          ? grounding.evidenceBlock
          : `\n\nDCT KNOWLEDGE-BASE CHECK\nThe current-page context and governed DCT knowledge base were checked before this response. No DCT-specific fact is required to answer this general business-analysis question. If the user asks about a DCT capability, return to the supplied governed evidence and do not infer platform facts.`;
        const basePrompt = attachmentAnalysisMode || structuredAttachmentAnalysisMode
          ? buildAttachmentAnalysisPrompt(question)
          : crossTeamDependenciesMode
          ? buildCrossTeamDependencyPrompt({ question, currentPagePath, liveSnapshot: input.liveSnapshot })
          : requiresPlatformEvidence
            ? buildCompactAskBuddyPrompt({ question, currentPagePath, liveSnapshot: input.liveSnapshot })
            : buildGeneralAskBuddyPrompt(currentPagePath);
        const attachmentPrimacy = attachmentArtifact
          ? "\n\nUPLOADED-SOURCE PRIORITY: Treat the uploaded attachment as the primary source for the scope it covers. Use platform documentation only to corroborate a directly related point; if the sources conflict, describe the conflict and preserve the open decision rather than reconciling it by assumption."
          : "";
        const suppliedAdoReferenceContext = buildSuppliedAdoReferenceContext(question);
        const attachmentEvidenceForModel = attachmentEvidence.length > DOCUMENT_EVIDENCE_MAX_CHARS
          ? `${attachmentEvidence.slice(0, DOCUMENT_EVIDENCE_MAX_CHARS).trimEnd()}\n\n[Document evidence supplied to this analysis is truncated at ${DOCUMENT_EVIDENCE_MAX_CHARS.toLocaleString()} characters. Do not draw conclusions from later content.]`
          : attachmentEvidence;
        const systemPrompt = basePrompt + evidencePacket + (documentAndDependencyAnalysisMode ? "" : masterEvidence.evidenceBlock) + storyReviewEvidence + (attachmentAnalysisMode ? attachmentEvidenceForModel : attachmentEvidence.slice(0, structuredAttachmentAnalysisMode ? 12_000 : 8_000)) + attachmentReferenceNote + attachmentPrimacy + suppliedAdoReferenceContext + entryContext + generalBusinessGuidance + `\n\nSelected analysis lens: ${input.capability ?? "General Discovery"}. The lens changes analysis structure; it does not permit unrelated platform facts or inferred delivery dependencies.`;

        const recentMessages = documentAndDependencyAnalysisMode ? input.messages.slice(-1) : input.messages.slice(-2);
        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...recentMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content.slice(requiresPlatformEvidence ? -2_000 : -1_200),
          })),
        ];

        let responseText: string;
        const hasStoryReviewEvidence = storyReviewEvidence.length > 0;
        const hasAttachmentEvidence = attachmentEvidence.length > 0;
        if (stateApportionmentDependencyQuestion && !attachmentArtifact) {
          responseText = buildStateApportionmentDependencyResponse();
        } else if (isMasterDataQuestion(question) && !masterEvidence.hasEvidence) {
          responseText = `${MASTER_DATA_ANSWER_FALLBACK}\n\n### Source Boundary\n${attachmentArtifact ? `The uploaded ${attachmentRecord?.format ?? "file"} remains a user-provided reference and cannot establish authoritative Master Data.` : "No uploaded source was supplied."}\n\n### What is missing\nThe authoritative active-tab workbook artifact is not currently registered in the DCT Platform evidence layer.\n\n### Next Action\nRegister the current DCT_Master_Data_Intake.xlsx artifact with an AUTHORITATIVE source label, then retry the question.`;
        } else if (requiresPlatformEvidence && !grounding.hasSufficientEvidence && !hasStoryReviewEvidence && !hasAttachmentEvidence) {
          responseText = attachmentRecord?.analysisStatus === "Reference Only"
            ? `The attached ${attachmentRecord.format} is retained as a source reference, but its contents were not extracted for analysis. ${attachmentRecord.note}\n\n### Next Action\nUpload a readable Word (.docx), Excel/CSV, or text-based version of the source, or provide the relevant content in the question.`
            : buildInsufficientEvidenceResponse(grounding);
        } else {
          try {
            const responseBudgetMs = attachmentAnalysisMode ? DOCUMENT_ANALYSIS_TIMEOUT_MS : crossTeamDependenciesMode ? 4_700 : requiresPlatformEvidence ? 4_400 : 4_700;
            const remainingResponseBudgetMs = Math.max(400, responseBudgetMs - (Date.now() - requestStartedAt));
            const result = await invokeLLM({
              model: attachmentAnalysisMode ? DOCUMENT_ANALYSIS_MODEL : "gemini-3.8-flash",
              thinking: attachmentAnalysisMode ? undefined : { budget_tokens: 0 },
              maxTokens: attachmentAnalysisMode ? DOCUMENT_ANALYSIS_MAX_TOKENS : crossTeamDependenciesMode ? 720 : requiresPlatformEvidence ? 280 : 180,
              timeoutMs: Math.min(attachmentAnalysisMode ? DOCUMENT_ANALYSIS_TIMEOUT_MS : crossTeamDependenciesMode ? 4_600 : requiresPlatformEvidence ? 4_300 : 4_600, remainingResponseBudgetMs),
              messages: llmMessages,
            });
            const choice = result.choices[0];
            const content = choice?.message?.content;
            if (typeof content === "string") {
              responseText = content;
            } else if (Array.isArray(content)) {
              responseText = content
                .filter((c) => c.type === "text")
                .map((c) => (c as { type: "text"; text: string }).text)
                .join("\n");
            } else {
              responseText = "I was unable to generate a response. Please try again.";
            }
          } catch (error) {
            if (error instanceof LLMRequestTimeoutError) {
              responseText = attachmentAnalysis
                ? buildStructuredAttachmentAnalysisFallback(question, attachmentAnalysis)
                : attachmentAnalysisMode && attachmentRecord
                ? buildAttachmentEvidenceFallback({ question, textExcerpt: attachmentRecord.textExcerpt })
                : requiresPlatformEvidence
                ? "Ask Buddy could not complete an evidence-grounded response within the response-time limit. No answer has been inferred. Please retry or narrow the question."
                : buildGeneralBusinessGuidanceFallback(question);
            } else {
              console.error("[askBuddy] response generation failed", error);
              responseText = "Ask Buddy could not complete an evidence-grounded response. No answer has been inferred. Please retry the question.";
            }
          }
        }

        // Evidence and audit metadata remain retained on the response object and in the
        // audit record, but source provenance is not appended to the user-facing answer.
        const text = responseText;
        if (db) {
          void db.insert(askBuddyAudits).values({
              question,
              currentPagePath: currentPagePath ?? null,
              capability: input.capability ?? null,
              answerStatus: grounding.status,
              sourcesJson: JSON.stringify(grounding.sources.map((source) => ({ id: source.id, label: source.label, path: source.path }))),
              sourceVersionsJson: JSON.stringify(grounding.sources.map((source) => ({ id: source.id, lastUpdated: source.lastUpdated, artifactStatus: source.artifactStatus }))),
              conflictsJson: grounding.conflicts.length > 0 ? JSON.stringify(grounding.conflicts) : null,
            }).catch((error) => console.warn("[askBuddy] audit metadata was not persisted", error));
        }

        const responseElapsedMs = Date.now() - requestStartedAt;
        const expectedResponseWindowMs = attachmentAnalysisMode ? 4_700 : 4_000;
        if (responseElapsedMs > expectedResponseWindowMs) console.warn(`[askBuddy] response exceeded ${expectedResponseWindowMs}ms (${responseElapsedMs}ms)`);

        return {
          text,
          sources: attachmentArtifact
            ? [...grounding.sources, { id: `uploaded-artifact-${attachmentArtifact.id}`, label: `${attachmentRecord?.analysisStatus === "Extracted" ? "User-provided, unverified — Extracted" : "Reference only — contents not analyzed"}: ${attachmentArtifact.fileName}`, path: attachmentArtifact.storageUrl, authority: "User-provided attachment; not an authoritative platform source", lastUpdated: attachmentArtifact.createdAt.toISOString(), artifactStatus: "Reference" as const }]
            : grounding.sources,
          conflicts: grounding.conflicts,
          status: grounding.status,
          knowledgeCheckedAt: grounding.checkedAt,
          latestSource: grounding.latestSource,
        };
      }),
    uploadAttachment: publicProcedure
      .input(z.object({ fileName: z.string().min(1).max(512), versionLabel: z.string().min(1).max(256), mimeType: z.string().min(1).max(128), fileBase64: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const encoded = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(encoded, "base64");
        if (buffer.length > 10 * 1024 * 1024) throw new Error("Attachments must be 10 MB or smaller.");
        const prepared = await prepareAskBuddyAttachment(buffer, input.fileName, input.mimeType, input.versionLabel);
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const stored = await storagePut(`ask-buddy/${Date.now()}-${safeName}`, buffer, input.mimeType);
        const db = await getDb();
        if (!db) throw new Error("The Ask Buddy attachment store is unavailable. Please try again.");
        await db.insert(mappingArtifacts).values({ artifactType: "Other", sourceType: "Upload", fileName: input.fileName, versionLabel: input.versionLabel, mimeType: input.mimeType, storageUrl: stored.url, fieldsJson: prepared.fieldsJson, uploadedBy: ctx.user?.name ?? null });
        const [artifact] = await db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.id)).limit(1);
        if (!artifact) throw new Error("The uploaded attachment could not be registered. Please try again.");
        return { artifact, analysis: { status: prepared.analysisStatus, format: prepared.format, note: prepared.note } };
      }),

  }),

  dataMapping: router({
    listArtifacts: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt));
    }),
    analyzeStateContract: publicProcedure
      .input(z.object({ artifactId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        const [artifact] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, input.artifactId)).limit(1);
        if (!artifact) throw new Error("The selected source artifact was not found.");
        const fields = parseStructuredAttachmentFields(artifact.fieldsJson);
        if (!fields) throw new Error("State contract analysis requires a structured Excel or CSV source.");
        return analyzeStateInputReferenceContract(fields, artifact.fileName, artifact.versionLabel);
      }),
    exportStateContractAnalysis: publicProcedure
      .input(z.object({ artifactId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        const [artifact] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, input.artifactId)).limit(1);
        if (!artifact) throw new Error("The selected source artifact was not found.");
        const fields = parseStructuredAttachmentFields(artifact.fieldsJson);
        if (!fields) throw new Error("State contract analysis requires a structured Excel or CSV source.");
        const analysis = analyzeStateInputReferenceContract(fields, artifact.fileName, artifact.versionLabel);
        return {
          fileBase64: buildStateContractMappingWorkbook(analysis),
          fileName: `${artifact.fileName.replace(/\.(xlsx|xls|csv)$/i, "")}-mapping-review.xlsx`,
        };
      }),
    uploadArtifact: publicProcedure
      .input(z.object({
        artifactType: z.enum(["Master Data", "Prior Year Inventory", "Approved Crosswalk", "Other"]),
        fileName: z.string().min(1).max(512),
        versionLabel: z.string().min(1).max(256),
        mimeType: z.string().min(1).max(128),
        fileBase64: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!/\.(xlsx|xls|csv)$/i.test(input.fileName)) throw new Error("Upload an Excel (.xlsx/.xls) or CSV artifact.");
        const encoded = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(encoded, "base64");
        if (buffer.length > 10 * 1024 * 1024) throw new Error("Artifacts must be 10 MB or smaller.");
        const parsed = parseArtifactBuffer(buffer, input.fileName, input.versionLabel);
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const stored = await storagePut(`data-mapping/${Date.now()}-${safeName}`, buffer, input.mimeType);
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        await db.insert(mappingArtifacts).values({
          artifactType: input.artifactType,
          sourceType: "Upload",
          fileName: input.fileName,
          versionLabel: input.versionLabel,
          mimeType: input.mimeType,
          storageUrl: stored.url,
          fieldsJson: JSON.stringify(parsed.fields),
          uploadedBy: ctx.user?.name ?? null,
        });
        const [artifact] = await db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.id)).limit(1);
        return { artifact, fieldCount: parsed.fields.length };
      }),
    createSession: publicProcedure
      .input(z.object({ masterArtifactId: z.number().int().positive(), priorArtifactId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        const [master] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, input.masterArtifactId)).limit(1);
        const [prior] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, input.priorArtifactId)).limit(1);
        if (!master || !prior) throw new Error("Select both a Master Data artifact and a Prior Year Inventory artifact.");
        if (master.artifactType !== "Master Data" || prior.artifactType !== "Prior Year Inventory") throw new Error("The selected artifacts do not match the required mapping roles.");
        const allArtifacts = await db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt));
        const latestCrosswalk = allArtifacts.find(artifact => artifact.artifactType === "Approved Crosswalk");
        const historicalResults = await db.select().from(mappingResults).where(eq(mappingResults.reviewStatus, "Confirmed"));
        const historicalConfirmed = historicalResults.filter(result => result.inputCode !== "Not Confirmed").map(result => ({ originalField: result.originalMasterField, inputCode: result.inputCode, ruleCode: result.ruleCode === "Not Confirmed" ? undefined : result.ruleCode, worksheet: "Historical Confirmed Mapping", rowNumber: result.id }));
        const candidates = createMappingCandidates(
          (JSON.parse(master.fieldsJson) as ArtifactField[]).filter(isMappableArtifactField),
          (JSON.parse(prior.fieldsJson) as ArtifactField[]).filter(isMappableArtifactField),
          { approvedCrosswalk: latestCrosswalk ? JSON.parse(latestCrosswalk.fieldsJson) as ArtifactField[] : [], historicalConfirmed, approvedCrosswalkLabel: latestCrosswalk ? `Approved Crosswalk ${latestCrosswalk.fileName} (${latestCrosswalk.versionLabel})` : undefined },
        );
        const calculatedReadiness = mappingReadiness(candidates);
        const sampleMaster = /\b(sample|illustrative|non-authoritative)\b/i.test(master.versionLabel);
        const readiness = sampleMaster
          ? { ...calculatedReadiness, readiness: "NOT READY" as const, exceptions: { ...calculatedReadiness.exceptions, nonAuthoritativeMaster: 1 }, unresolved: calculatedReadiness.unresolved + 1 }
          : calculatedReadiness;
        const newestMaster = allArtifacts.find(artifact => artifact.artifactType === "Master Data");
        const newestPrior = allArtifacts.find(artifact => artifact.artifactType === "Prior Year Inventory");
        const staleSelections = [newestMaster && newestMaster.id !== master.id ? "Master Data" : null, newestPrior && newestPrior.id !== prior.id ? "Prior Year Inventory" : null].filter(Boolean);
        await db.insert(mappingSessions).values({
          masterArtifactId: master.id,
          priorArtifactId: prior.id,
          readiness: readiness.readiness,
          exceptionsJson: JSON.stringify(readiness.exceptions),
          createdBy: ctx.user?.name ?? null,
        });
        const [session] = await db.select().from(mappingSessions).orderBy(desc(mappingSessions.id)).limit(1);
        if (!session) throw new Error("Unable to create mapping session.");
        await db.insert(mappingResults).values(candidates.map(candidate => ({
          sessionId: session.id,
          originalMasterField: candidate.masterField.originalField,
          priorInventoryField: candidate.priorField?.originalField ?? null,
          inputCode: candidate.inputCode,
          ruleCode: candidate.ruleCode,
          status: candidate.status,
          confidence: candidate.confidence,
          evidenceJson: JSON.stringify(candidate.evidence),
          reason: candidate.reason,
        })));
        return { session, readiness, sourceGovernance: { masterAuthority: sampleMaster ? "Sample / non-authoritative — mapping output is validation only" : "Authoritative / source label supplied", approvedCrosswalk: latestCrosswalk ? `${latestCrosswalk.fileName} · ${latestCrosswalk.versionLabel}` : "Not registered", historicalConfirmedCount: historicalConfirmed.length, staleSelections }, results: await db.select().from(mappingResults).where(eq(mappingResults.sessionId, session.id)).orderBy(mappingResults.originalMasterField) };
      }),
    getSession: publicProcedure
      .input(z.object({ sessionId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [session] = await db.select().from(mappingSessions).where(eq(mappingSessions.id, input.sessionId)).limit(1);
        if (!session) return null;
        const [master] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, session.masterArtifactId)).limit(1);
        const [prior] = await db.select().from(mappingArtifacts).where(eq(mappingArtifacts.id, session.priorArtifactId)).limit(1);
        const results = await db.select().from(mappingResults).where(eq(mappingResults.sessionId, session.id)).orderBy(mappingResults.originalMasterField);
        const allArtifacts = await db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt));
        const latestCrosswalk = allArtifacts.find(artifact => artifact.artifactType === "Approved Crosswalk");
        const confirmedHistorical = await db.select().from(mappingResults).where(eq(mappingResults.reviewStatus, "Confirmed"));
        const newestMaster = allArtifacts.find(artifact => artifact.artifactType === "Master Data");
        const newestPrior = allArtifacts.find(artifact => artifact.artifactType === "Prior Year Inventory");
        const staleSelections = [newestMaster && newestMaster.id !== master?.id ? "Master Data" : null, newestPrior && newestPrior.id !== prior?.id ? "Prior Year Inventory" : null].filter(Boolean);
        const sampleMaster = /\b(sample|illustrative|non-authoritative)\b/i.test(master?.versionLabel ?? "");
        return { session, master, prior, results, sourceGovernance: { masterAuthority: sampleMaster ? "Sample / non-authoritative — mapping output is validation only" : "Authoritative / source label supplied", approvedCrosswalk: latestCrosswalk ? `${latestCrosswalk.fileName} · ${latestCrosswalk.versionLabel}` : "Not registered", historicalConfirmedCount: confirmedHistorical.filter(result => result.inputCode !== "Not Confirmed").length, staleSelections } };
      }),
    reviewResult: publicProcedure
      .input(z.object({
        resultId: z.number().int().positive(),
        action: z.enum(["Confirm Mapping", "Reject Mapping", "Needs SME Review", "Add Discovery Question"]),
        reviewNotes: z.string().max(4000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        const [result] = await db.select().from(mappingResults).where(eq(mappingResults.id, input.resultId)).limit(1);
        if (!result) throw new Error("Mapping result not found.");
        if (input.action === "Confirm Mapping" && (result.inputCode === "Not Confirmed" || result.status !== "Confirmed")) {
          throw new Error("Only a result with authoritative confirmed Input Code evidence can be confirmed.");
        }
        const reviewStatus = input.action === "Confirm Mapping" ? "Confirmed" : input.action === "Reject Mapping" ? "Rejected" : "Needs SME Review";
        await db.update(mappingResults).set({ reviewStatus, reviewedBy: ctx.user?.name ?? null, reviewedAt: new Date(), reviewNotes: input.reviewNotes ?? null }).where(eq(mappingResults.id, input.resultId));
        if (input.action === "Add Discovery Question") {
          await db.insert(integrationQuestions).values({ topic: "data-mapping", question: `Mapping review: ${result.originalMasterField} — ${input.reviewNotes || result.reason}`, status: "open", owner: "TBD" });
        }
        return { success: true };
      }),
    exportSession: publicProcedure
      .input(z.object({ sessionId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("The governed mapping store is unavailable. Please try again.");
        const results = await db.select().from(mappingResults).where(eq(mappingResults.sessionId, input.sessionId)).orderBy(mappingResults.originalMasterField);
        const header = ["Original Master Data Field", "Prior Year Inventory Field", "Confirmed Input Code", "Confirmed Rule Code", "Mapping Status", "Confidence", "Mapping Evidence", "Review Status", "Review Notes"];
        const esc = (value: string | null) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [header.map(esc).join(","), ...results.map(result => [result.originalMasterField, result.priorInventoryField, result.inputCode, result.ruleCode, result.status, String(result.confidence), result.evidenceJson, result.reviewStatus, result.reviewNotes].map(esc).join(","))].join("\n");
        return { csv, fileName: `dct-governed-mapping-review-${input.sessionId}.csv` };
      }),
  }),

  deploymentRegistry: router({
    // Get all deployments with optional filters
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          type: z.enum(["All", "Batch", "Bug", "Technical Story", "Feature", "Hotfix"]).optional(),
          platform: z.enum(["All", "PDC", "TDC", "Platform", "Both"]).optional(),
          sortBy: z.enum(["deploymentDate", "releaseName", "deploymentOwner"]).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db
          .select()
          .from(deployments)
          .orderBy(desc(deployments.deploymentDate), desc(deployments.createdAt));
        let result = rows;
        if (input?.search) {
          const q = input.search.toLowerCase();
          result = result.filter(
            (r) =>
              r.releaseName.toLowerCase().includes(q) ||
              r.deploymentOwner.toLowerCase().includes(q) ||
              (r.relatedBatch ?? "").toLowerCase().includes(q) ||
              (r.relatedFeature ?? "").toLowerCase().includes(q)
          );
        }
        if (input?.type && input.type !== "All") {
          result = result.filter((r) => r.type === input.type);
        }
        if (input?.platform && input.platform !== "All") {
          result = result.filter((r) => r.platform === input.platform);
        }
        if (input?.sortBy === "releaseName") {
          result = result.sort((a, b) => a.releaseName.localeCompare(b.releaseName));
        } else if (input?.sortBy === "deploymentOwner") {
          result = result.sort((a, b) => a.deploymentOwner.localeCompare(b.deploymentOwner));
        }
        return result;
      }),

    // Get deployments for a specific batch
    getByBatch: publicProcedure
      .input(z.object({ batchId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(deployments)
          .where(eq(deployments.relatedBatch, input.batchId))
          .orderBy(desc(deployments.deploymentDate));
      }),

    // Get summary counts
    summary: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, production: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 };
      const all = await db.select().from(deployments);
      return {
        total: all.length,
        production: all.filter((r) => r.environment === "Production" && r.status === "Deployed").length,
        pdc: all.filter((r) => r.platform === "PDC").length,
        tdc: all.filter((r) => r.platform === "TDC").length,
        rollbackCandidates: all.filter((r) => r.status === "Rolled Back" || r.status === "In Progress").length,
      };
    }),

    // Get all deployments ordered by date — used by landing page live feed
    recent: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(deployments)
        .orderBy(desc(deployments.deploymentDate), desc(deployments.createdAt));
    }),

    // Get single deployment by id
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const rows = await db.select().from(deployments).where(eq(deployments.id, input.id));
        return rows[0] ?? null;
      }),

    // Create a deployment
    create: publicProcedure
      .input(
        z.object({
          releaseName: z.string().min(1),
          deploymentDate: z.string().min(1),
          deploymentOwner: z.string().min(1),
          productOwner: z.string().min(1),
          platform: z.enum(["PDC", "TDC", "Platform", "Both"]),
          type: z.enum(["Batch", "Feature", "Bug", "Technical Story", "Hotfix"]),
          status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).optional(),
          summary: z.string().optional(),
          releaseNotesUrl: z.string().optional(),
          swaggerUrl: z.string().optional(),
          relatedBatch: z.string().optional(),
          relatedFeature: z.string().optional(),
          relatedStory: z.string().optional(),
          environment: z.string().optional(),
          adoWorkItemId: z.string().optional(),
          adoFeatureUrl: z.string().optional(),
          adoStoryUrl: z.string().optional(),
          adoLinks: z.string().optional(),
          releaseNotesBullets: z.string().optional(),
          githubReleaseTag: z.string().optional(),
          knownLimitations: z.string().optional(),
          dependencies: z.string().optional(),
          qaConsiderations: z.string().optional(),
          screens: z.array(z.object({
            screenName: z.string(),
            releaseStatus: z.enum(["Available in QA", "Partially Available", "Not Included in This Deployment"]).optional(),
            changeType: z.string().optional(),
            whatChanged: z.string().optional(),
            newFunctionality: z.string().optional(),
            fixesIncluded: z.string().optional(),
            qaValidationGuidance: z.string().optional(),
            knownLimitations: z.string().optional(),
            functionalityNotIncluded: z.string().optional(),
            dependencies: z.string().optional(),
            adoWorkItems: z.string().optional(),
            notes: z.string().optional(),
          })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        // Generate DEP-YYYY-MMDD-NNN id
        const dateStr = input.deploymentDate.replace(/-/g, "").slice(0, 8);
        const existing = await db.select().from(deployments);
        const seq = String(existing.length + 1).padStart(3, "0");
        const deploymentId = `DEP-${dateStr.slice(0,4)}-${dateStr.slice(4,8)}-${seq}`;
        await db.insert(deployments).values({
          deploymentId,
          releaseName: input.releaseName,
          deploymentDate: input.deploymentDate,
          deploymentOwner: input.deploymentOwner,
          productOwner: input.productOwner,
          platform: input.platform,
          type: input.type,
          status: input.status ?? "Planned",
          summary: input.summary ?? null,
          releaseNotesUrl: input.releaseNotesUrl ?? null,
          swaggerUrl: input.swaggerUrl ?? null,
          relatedBatch: input.relatedBatch ?? null,
          relatedFeature: input.relatedFeature ?? null,
          relatedStory: input.relatedStory ?? null,
          environment: input.environment ?? "Production",
          adoWorkItemId: input.adoWorkItemId ?? null,
          adoFeatureUrl: input.adoFeatureUrl ?? null,
          adoStoryUrl: input.adoStoryUrl ?? null,
          adoLinks: input.adoLinks ?? null,
          releaseNotesBullets: input.releaseNotesBullets ?? null,
          githubReleaseTag: input.githubReleaseTag ?? null,
          knownLimitations: input.knownLimitations ?? null,
          dependencies: input.dependencies ?? null,
          qaConsiderations: input.qaConsiderations ?? null,
        });
        // Insert screen records if provided
        if (input.screens && input.screens.length > 0) {
          await db.insert(deploymentScreens).values(
            input.screens.map((s, i) => ({
              deploymentId,
              screenName: s.screenName,
              releaseStatus: (s.releaseStatus ?? "Available in QA") as "Available in QA" | "Partially Available" | "Not Included in This Deployment",
              changeType: s.changeType ?? null,
              whatChanged: s.whatChanged ?? null,
              newFunctionality: s.newFunctionality ?? null,
              fixesIncluded: s.fixesIncluded ?? null,
              qaValidationGuidance: s.qaValidationGuidance ?? null,
              knownLimitations: s.knownLimitations ?? null,
              functionalityNotIncluded: s.functionalityNotIncluded ?? null,
              dependencies: s.dependencies ?? null,
              adoWorkItems: s.adoWorkItems ?? null,
              notes: s.notes ?? null,
              sortOrder: i,
            }))
          );
        }
        return { success: true, deploymentId };
      }),

    // Update a deployment status
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(deployments).set({ status: input.status }).where(eq(deployments.id, input.id));
        return { success: true };
      }),

    // Update all fields of a deployment
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          releaseName: z.string().min(1),
          deploymentDate: z.string().min(1),
          deploymentOwner: z.string().min(1),
          productOwner: z.string().min(1),
          platform: z.enum(["PDC", "TDC", "Platform", "Both"]),
          type: z.enum(["Batch", "Feature", "Bug", "Technical Story", "Hotfix"]),
          status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).optional(),
          summary: z.string().optional(),
          releaseNotesUrl: z.string().optional(),
          swaggerUrl: z.string().optional(),
          relatedBatch: z.string().optional(),
          relatedFeature: z.string().optional(),
          relatedStory: z.string().optional(),
          environment: z.string().optional(),
          adoWorkItemId: z.string().optional(),
          adoFeatureUrl: z.string().optional(),
          adoStoryUrl: z.string().optional(),
          adoLinks: z.string().optional(),
          releaseNotesBullets: z.string().optional(),
          githubReleaseTag: z.string().optional(),
          knownLimitations: z.string().optional(),
          dependencies: z.string().optional(),
          qaConsiderations: z.string().optional(),
          screens: z.array(z.object({
            screenName: z.string(),
            releaseStatus: z.enum(["Available in QA", "Partially Available", "Not Included in This Deployment"]).optional(),
            changeType: z.string().optional(),
            whatChanged: z.string().optional(),
            newFunctionality: z.string().optional(),
            fixesIncluded: z.string().optional(),
            qaValidationGuidance: z.string().optional(),
            knownLimitations: z.string().optional(),
            functionalityNotIncluded: z.string().optional(),
            dependencies: z.string().optional(),
            adoWorkItems: z.string().optional(),
            notes: z.string().optional(),
          })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { id, ...fields } = input;
        await db.update(deployments).set({
          releaseName: fields.releaseName,
          deploymentDate: fields.deploymentDate,
          deploymentOwner: fields.deploymentOwner,
          productOwner: fields.productOwner,
          platform: fields.platform,
          type: fields.type,
          status: fields.status ?? "Planned",
          summary: fields.summary ?? null,
          releaseNotesUrl: fields.releaseNotesUrl ?? null,
          swaggerUrl: fields.swaggerUrl ?? null,
          relatedBatch: fields.relatedBatch ?? null,
          relatedFeature: fields.relatedFeature ?? null,
          relatedStory: fields.relatedStory ?? null,
          environment: fields.environment ?? "Production",
          adoWorkItemId: fields.adoWorkItemId ?? null,
          adoFeatureUrl: fields.adoFeatureUrl ?? null,
          adoStoryUrl: fields.adoStoryUrl ?? null,
          adoLinks: fields.adoLinks ?? null,
          releaseNotesBullets: fields.releaseNotesBullets ?? null,
          githubReleaseTag: fields.githubReleaseTag ?? null,
          knownLimitations: fields.knownLimitations ?? null,
          dependencies: fields.dependencies ?? null,
          qaConsiderations: fields.qaConsiderations ?? null,
        }).where(eq(deployments.id, id));
        // Update screen records if provided
        if (fields.screens) {
          await db.delete(deploymentScreens).where(eq(deploymentScreens.deploymentId, (await db.select({ deploymentId: deployments.deploymentId }).from(deployments).where(eq(deployments.id, id)))[0]?.deploymentId ?? ""));
          if (fields.screens.length > 0) {
            const dep = await db.select({ deploymentId: deployments.deploymentId }).from(deployments).where(eq(deployments.id, id));
            if (dep[0]) {
              await db.insert(deploymentScreens).values(
                fields.screens.map((s, i) => ({
                  deploymentId: dep[0].deploymentId,
                  screenName: s.screenName,
                  releaseStatus: (s.releaseStatus ?? "Available in QA") as "Available in QA" | "Partially Available" | "Not Included in This Deployment",
                  changeType: s.changeType ?? null,
                  whatChanged: s.whatChanged ?? null,
                  newFunctionality: s.newFunctionality ?? null,
                  fixesIncluded: s.fixesIncluded ?? null,
                  qaValidationGuidance: s.qaValidationGuidance ?? null,
                  knownLimitations: s.knownLimitations ?? null,
                  functionalityNotIncluded: s.functionalityNotIncluded ?? null,
                  dependencies: s.dependencies ?? null,
                  adoWorkItems: s.adoWorkItems ?? null,
                  notes: s.notes ?? null,
                  sortOrder: i,
                }))
              );
            }
          }
        }
        return { success: true };
      }),

    // Delete a deployment
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
      await db.delete(deployments).where(eq(deployments.id, input.id));
        return { success: true };
      }),
  }),

  deploymentScreens: router({
    listByDeployment: publicProcedure
      .input(z.object({ deploymentId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(deploymentScreens).where(eq(deploymentScreens.deploymentId, input.deploymentId)).orderBy(deploymentScreens.sortOrder);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        screenName: z.string().optional(),
        releaseStatus: z.enum(["Available in QA", "Partially Available", "Not Included in This Deployment"]).optional(),
        changeType: z.string().optional(),
        whatChanged: z.string().optional(),
        newFunctionality: z.string().optional(),
        fixesIncluded: z.string().optional(),
        qaValidationGuidance: z.string().optional(),
        knownLimitations: z.string().optional(),
        functionalityNotIncluded: z.string().optional(),
        dependencies: z.string().optional(),
        adoWorkItems: z.string().optional(),
        notes: z.string().optional(),
        screenshots: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { id, ...fields } = input;
        await db.update(deploymentScreens).set(fields as any).where(eq(deploymentScreens.id, id));
        return { success: true };
      }),
    uploadScreenshot: publicProcedure
      .input(z.object({ screenId: z.number(), fileBase64: z.string(), fileName: z.string(), mimeType: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false, url: "" };
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `deployment-screens/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        const rows = await db.select().from(deploymentScreens).where(eq(deploymentScreens.id, input.screenId));
        if (rows[0]) {
          const existing = rows[0].screenshots ? JSON.parse(rows[0].screenshots) : [];
          existing.push({ url, caption: input.fileName });
          await db.update(deploymentScreens).set({ screenshots: JSON.stringify(existing) }).where(eq(deploymentScreens.id, input.screenId));
        }
        return { success: true, url };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(deploymentScreens).where(eq(deploymentScreens.id, input.id));
        return { success: true };
      }),
  }),

  deploymentRegistryBuddy: router({
    analyzeNotes: publicProcedure
      .input(z.object({ notes: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a QA Release Notes Analyst for the DCT Platform. Analyze the provided deployment notes and generate structured release notes organized by affected application screen.

For each affected screen, output:
- screenName: string (use the Roger MVP screen list when applicable: My Clients Page, Return Filing Page, Return Structure Summary, Line Mapping, Book/Reclass Adjustments, Book Return Review, Tax Adjustment, Book-to-Tax Report, Book-to-Tax Reconciliation, 1120 Form, Sign Off)
- releaseStatus: "Available in QA" | "Partially Available" | "Not Included in This Deployment"
- changeType: string (Enhancement | Bug Fix | New Feature | Configuration | Backend)
- whatChanged: string
- newFunctionality: string (or "None" if not applicable)
- fixesIncluded: string (or "None" if not applicable)
- qaValidationGuidance: string
- knownLimitations: string (or "None identified")
- functionalityNotIncluded: string (or "None")
- dependencies: string (or "None")
- adoWorkItems: string (ADO IDs/titles if mentioned, or "")

Also output:
- releaseName: string (suggested deployment name)
- summary: string (1-2 sentence overall summary)
- knownLimitations: string (overall known limitations)
- dependencies: string (overall dependencies)
- qaConsiderations: string (overall QA testing guidance)

IMPORTANT: Only mark functionality as "Available in QA" when the deployment notes explicitly confirm it is included. Do not assume planned functionality has been deployed.

Return ONLY valid JSON matching this schema: { releaseName, summary, knownLimitations, dependencies, qaConsiderations, screens: Array<{screenName, releaseStatus, changeType, whatChanged, newFunctionality, fixesIncluded, qaValidationGuidance, knownLimitations, functionalityNotIncluded, dependencies, adoWorkItems}> }
IMPORTANT: Your entire response must be ONLY a raw JSON object. No markdown, no code fences, no explanation. Start with { and end with }.`;
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt as string },
            { role: "user", content: `Analyze these deployment notes and generate structured release notes:
${input.notes}` as string },
          ],
        });
        const content = response.choices[0]?.message?.content;
        try { return JSON.parse(typeof content === "string" ? content : JSON.stringify(content)); }
        catch { return { error: "Failed to parse response", raw: content }; }
      }),
  }),

  postPilotDeploymentRegistry: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(postPilotDeployments).where(eq(postPilotDeployments.platform, "TDC")).orderBy(desc(postPilotDeployments.deploymentDate), desc(postPilotDeployments.createdAt));
      return rows.map((row) => ({ ...row, id: Number(row.id) }));
    }),
    summary: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, production: 0, tdc: 0, rollbackCandidates: 0 };
      const all = await db.select().from(postPilotDeployments).where(eq(postPilotDeployments.platform, "TDC"));
      return {
        total: all.length,
        production: all.filter((record) => record.environment === "Production" && record.status === "Deployed").length,
        tdc: all.filter((record) => record.platform === "TDC").length,
        rollbackCandidates: all.filter((record) => record.status === "Rolled Back" || record.status === "In Progress").length,
      };
    }),
    create: publicProcedure
      .input(z.object({
        releaseName: z.string().min(1).max(512),
        deploymentDate: z.string().min(1).max(16),
        deploymentOwner: z.string().min(1).max(128),
        productOwner: z.string().min(1).max(128),
        platform: z.literal("TDC"),
        type: z.enum(["Feature", "Bug", "Technical Story", "Hotfix"]),
        status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).optional(),
        screenName: z.string().min(1).max(8000),
        summary: z.string().max(8000).optional(),
        relatedFeature: z.string().max(256).optional(),
        relatedStory: z.string().max(4000).optional(),
        environment: z.string().min(1).max(64).optional(),
        adoWorkItemId: z.string().max(4000).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("The Pilot deployment registry is unavailable. Please try again.");
        const dateStr = input.deploymentDate.replace(/-/g, "").slice(0, 8);
        const existing = await db.select().from(postPilotDeployments);
        const sequence = String(existing.length + 1).padStart(3, "0");
        const deploymentId = `PPDEP-${dateStr.slice(0, 4)}-${dateStr.slice(4, 8)}-${sequence}`;
        await db.insert(postPilotDeployments).values({
          deploymentId,
          releaseName: input.releaseName,
          deploymentDate: input.deploymentDate,
          deploymentOwner: input.deploymentOwner,
          productOwner: input.productOwner,
          platform: input.platform,
          type: input.type,
          status: input.status ?? "Planned",
          screenName: input.screenName,
          summary: input.summary ?? null,
          relatedFeature: input.relatedFeature ?? null,
          relatedStory: input.relatedStory ?? null,
          environment: input.environment ?? "Production",
          adoWorkItemId: input.adoWorkItemId ?? null,
        });
        return { success: true, deploymentId };
      }),
  }),

  tdcMeetingRecaps: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      // The retained transcript remains in storage and is opened through its source link.
      // Do not return transcriptText in the history query: it makes each page load needlessly
      // large and can cause transient browser transport failures.
      const records = await db.select({
        id: tdcMeetingRecaps.id,
        meetingDate: tdcMeetingRecaps.meetingDate,
        meetingTitle: tdcMeetingRecaps.meetingTitle,
        sprint: tdcMeetingRecaps.sprint,
        attendeesJson: tdcMeetingRecaps.attendeesJson,
        keyFocusJson: tdcMeetingRecaps.keyFocusJson,
        transcriptFileName: tdcMeetingRecaps.transcriptFileName,
        transcriptStorageUrl: tdcMeetingRecaps.transcriptStorageUrl,
        emailSubject: tdcMeetingRecaps.emailSubject,
        emailBody: tdcMeetingRecaps.emailBody,
        developerUpdatesJson: tdcMeetingRecaps.developerUpdatesJson,
        actionItemsJson: tdcMeetingRecaps.actionItemsJson,
        blockersRisksJson: tdcMeetingRecaps.blockersRisksJson,
        decisionsCalloutsJson: tdcMeetingRecaps.decisionsCalloutsJson,
        notes: tdcMeetingRecaps.notes,
        emailStatus: tdcMeetingRecaps.emailStatus,
      }).from(tdcMeetingRecaps).orderBy(desc(tdcMeetingRecaps.meetingDate), desc(tdcMeetingRecaps.createdAt));
      return records.map((record) => ({
        ...record,
        id: Number(record.id),
        attendees: JSON.parse(record.attendeesJson) as string[],
        keyFocus: JSON.parse(record.keyFocusJson) as string[],
        developerUpdates: JSON.parse(record.developerUpdatesJson),
        actionItems: JSON.parse(record.actionItemsJson),
        blockersRisks: JSON.parse(record.blockersRisksJson) as string[],
        decisionsCallouts: JSON.parse(record.decisionsCalloutsJson) as string[],
      }));
    }),
    createFromTranscript: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(512),
        mimeType: z.string().min(1).max(128),
        fileBase64: z.string().min(1).max(16 * 1024 * 1024),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!/\.(docx|txt)$/i.test(input.fileName)) {
          throw new Error("Upload a TDC Daily Standup transcript in DOCX or TXT format.");
        }
        const encoded = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(encoded, "base64");
        if (buffer.length > 10 * 1024 * 1024) throw new Error("Transcripts must be 10 MB or smaller.");

        let transcriptText = "";
        if (/\.docx$/i.test(input.fileName)) {
          const extracted = await mammoth.extractRawText({ buffer });
          transcriptText = extracted.value;
        } else {
          transcriptText = buffer.toString("utf8");
        }
        transcriptText = transcriptText.trim();
        if (transcriptText.length < 80) throw new Error("The uploaded transcript does not contain enough readable text to generate a recap.");

        const analysis = await analyzeTdcStandupTranscript(transcriptText);
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const stored = await storagePut(`tdc-meeting-recaps/${Date.now()}-${safeName}`, buffer, input.mimeType);
        const dateLabel = formatMeetingDate(analysis.meetingDate);
        const emailSubject = `TDC Daily Standup Recap — ${dateLabel}`;
        const emailBody = buildTdcStandupEmail(analysis);

        const db = await getDb();
        if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
        await db.insert(tdcMeetingRecaps).values({
          meetingDate: analysis.meetingDate,
          meetingTitle: analysis.meetingTitle,
          sprint: analysis.sprint,
          attendeesJson: JSON.stringify(analysis.attendees),
          keyFocusJson: JSON.stringify(analysis.keyFocus),
          transcriptFileName: input.fileName,
          transcriptStorageUrl: stored.url,
          transcriptText,
          emailSubject,
          emailBody,
          developerUpdatesJson: JSON.stringify(analysis.developerUpdates),
          actionItemsJson: JSON.stringify(analysis.actionItems),
          blockersRisksJson: JSON.stringify(analysis.blockersRisks),
          decisionsCalloutsJson: JSON.stringify(analysis.decisionsCallouts),
          notes: analysis.notes,
          emailStatus: "Draft",
          createdBy: ctx.user?.name ?? null,
        });
        const [record] = await db.select().from(tdcMeetingRecaps).orderBy(desc(tdcMeetingRecaps.id)).limit(1);
        if (!record) throw new Error("The generated recap could not be saved.");
        return {
          id: Number(record.id),
          meetingDate: record.meetingDate,
          meetingTitle: record.meetingTitle,
          sprint: record.sprint,
          transcriptFileName: record.transcriptFileName,
          transcriptStorageUrl: record.transcriptStorageUrl,
          emailSubject: record.emailSubject,
          emailBody: record.emailBody,
          notes: record.notes,
          emailStatus: record.emailStatus,
          attendees: analysis.attendees,
          keyFocus: analysis.keyFocus,
          developerUpdates: analysis.developerUpdates,
          actionItems: analysis.actionItems,
          blockersRisks: analysis.blockersRisks,
          decisionsCallouts: analysis.decisionsCallouts,
        };
      }),
    updateEmailStatus: publicProcedure
      .input(z.object({ id: z.number().int().positive(), emailStatus: z.enum(["Draft", "Reviewed", "Sent"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("The Meeting Recap Tracker is unavailable. Please try again.");
        await db.update(tdcMeetingRecaps).set({ emailStatus: input.emailStatus }).where(eq(tdcMeetingRecaps.id, input.id));
        return { success: true };
      }),
  }),

  qaDeploymentRegistry: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          type: z.enum(["All", "Batch", "Bug", "Technical Story", "Feature", "Hotfix"]).optional(),
          platform: z.enum(["All", "Roger", "PDC", "TDC", "Platform", "Both"]).optional(),
          sortBy: z.enum(["deploymentDate", "releaseName", "deploymentOwner"]).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(qaDeployments).orderBy(desc(qaDeployments.deploymentDate), desc(qaDeployments.createdAt));
        let result = rows;
        if (input?.search) { const q = input.search.toLowerCase(); result = result.filter((r) => r.releaseName.toLowerCase().includes(q) || r.deploymentOwner.toLowerCase().includes(q) || (r.relatedBatch ?? "").toLowerCase().includes(q) || (r.relatedFeature ?? "").toLowerCase().includes(q)); }
        if (input?.type && input.type !== "All") { result = result.filter((r) => r.type === input.type); }
        if (input?.platform && input.platform !== "All") { result = result.filter((r) => r.platform === input.platform); }
        if (input?.sortBy === "releaseName") { result = result.sort((a, b) => a.releaseName.localeCompare(b.releaseName)); }
        else if (input?.sortBy === "deploymentOwner") { result = result.sort((a, b) => a.deploymentOwner.localeCompare(b.deploymentOwner)); }
        // Coerce id to number — TiDB returns bigint as string which breaks client-side comparisons
        return result.map(r => ({ ...r, id: Number(r.id) }));
      }),
    getByBatch: publicProcedure.input(z.object({ batchId: z.string() })).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(qaDeployments).where(eq(qaDeployments.relatedBatch, input.batchId)).orderBy(desc(qaDeployments.deploymentDate)); }),
    summary: publicProcedure.query(async () => { const db = await getDb(); if (!db) return { total: 0, roger: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 }; const all = await db.select().from(qaDeployments); return { total: all.length, roger: all.filter((r) => r.platform === "Roger").length, pdc: all.filter((r) => r.platform === "PDC").length, tdc: all.filter((r) => r.platform === "TDC").length, rollbackCandidates: all.filter((r) => r.status === "Rolled Back" || r.status === "In Progress").length }; }),
    recent: publicProcedure.query(async () => { const db = await getDb(); if (!db) return []; return db.select().from(qaDeployments).orderBy(desc(qaDeployments.deploymentDate), desc(qaDeployments.createdAt)); }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const rows = await db.select().from(qaDeployments).where(eq(qaDeployments.id, input.id)); return rows[0] ?? null; }),
    create: publicProcedure
      .input(z.object({ releaseName: z.string().min(1), deploymentDate: z.string().min(1), deploymentOwner: z.string().min(1), productOwner: z.string().min(1), platform: z.enum(["Roger", "PDC", "TDC", "Platform", "Both"]), type: z.enum(["Batch", "Feature", "Bug", "Technical Story", "Hotfix"]), status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).optional(), summary: z.string().optional(), releaseNotesUrl: z.string().optional(), swaggerUrl: z.string().optional(), relatedBatch: z.string().optional(), relatedFeature: z.string().optional(), relatedStory: z.string().optional(), environment: z.string().optional(), adoWorkItemId: z.string().optional(), adoFeatureUrl: z.string().optional(), adoStoryUrl: z.string().optional(), adoLinks: z.string().optional(), releaseNotesBullets: z.string().optional(), githubReleaseTag: z.string().optional(), screenChanges: z.string().optional(), whatChanged: z.string().optional(), qaTestInstructions: z.string().optional(), expectedResults: z.string().optional(), knownIssues: z.string().optional(), backendChanges: z.string().optional(), validationStatus: z.string().optional(), validatedBy: z.string().optional(), validationDate: z.string().optional(), validationNotes: z.string().optional(), releaseNotesStatus: z.string().optional() }))
      .mutation(async ({ input }) => { const db = await getDb(); if (!db) return { success: false }; const dateStr = input.deploymentDate.replace(/-/g, "").slice(0, 8); const existing = await db.select().from(qaDeployments); const seq = String(existing.length + 1).padStart(3, "0"); const deploymentId = `QADEP-${dateStr.slice(0,4)}-${dateStr.slice(4,8)}-${seq}`; await db.insert(qaDeployments).values({ deploymentId, releaseName: input.releaseName, deploymentDate: input.deploymentDate, deploymentOwner: input.deploymentOwner, productOwner: input.productOwner, platform: input.platform, type: input.type, status: input.status ?? "Planned", summary: input.summary ?? null, releaseNotesUrl: input.releaseNotesUrl ?? null, swaggerUrl: input.swaggerUrl ?? null, relatedBatch: input.relatedBatch ?? null, relatedFeature: input.relatedFeature ?? null, relatedStory: input.relatedStory ?? null, environment: input.environment ?? "QA", adoWorkItemId: input.adoWorkItemId ?? null, adoFeatureUrl: input.adoFeatureUrl ?? null, adoStoryUrl: input.adoStoryUrl ?? null, adoLinks: input.adoLinks ?? null, releaseNotesBullets: input.releaseNotesBullets ?? null, githubReleaseTag: input.githubReleaseTag ?? null, screenChanges: (input as any).screenChanges ?? null, whatChanged: (input as any).whatChanged ?? null, qaTestInstructions: (input as any).qaTestInstructions ?? null, expectedResults: (input as any).expectedResults ?? null, knownIssues: (input as any).knownIssues ?? null, backendChanges: (input as any).backendChanges ?? null, validationStatus: (input as any).validationStatus ?? "Pending", validatedBy: (input as any).validatedBy ?? null, validationDate: (input as any).validationDate ?? null, validationNotes: (input as any).validationNotes ?? null, releaseNotesStatus: (input as any).releaseNotesStatus ?? "Draft" }); return { success: true, deploymentId }; }),
    updateStatus: publicProcedure.input(z.object({ id: z.number(), status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(qaDeployments).set({ status: input.status }).where(eq(qaDeployments.id, input.id)); return { success: true }; }),
    update: publicProcedure
      .input(z.object({ id: z.number(), releaseName: z.string().min(1), deploymentDate: z.string().min(1), deploymentOwner: z.string().min(1), productOwner: z.string().min(1), platform: z.enum(["Roger", "PDC", "TDC", "Platform", "Both"]), type: z.enum(["Batch", "Feature", "Bug", "Technical Story", "Hotfix"]), status: z.enum(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"]).optional(), summary: z.string().optional(), releaseNotesUrl: z.string().optional(), swaggerUrl: z.string().optional(), relatedBatch: z.string().optional(), relatedFeature: z.string().optional(), relatedStory: z.string().optional(), environment: z.string().optional(), adoWorkItemId: z.string().optional(), adoFeatureUrl: z.string().optional(), adoStoryUrl: z.string().optional(), adoLinks: z.string().optional(), releaseNotesBullets: z.string().optional(), githubReleaseTag: z.string().optional(), screenChanges: z.string().optional(), whatChanged: z.string().optional(), qaTestInstructions: z.string().optional(), expectedResults: z.string().optional(), knownIssues: z.string().optional(), backendChanges: z.string().optional(), validationStatus: z.string().optional(), validatedBy: z.string().optional(), validationDate: z.string().optional(), validationNotes: z.string().optional(), releaseNotesStatus: z.string().optional() }))
      .mutation(async ({ input }) => { const db = await getDb(); if (!db) return { success: false }; const { id, ...fields } = input; await db.update(qaDeployments).set({ releaseName: fields.releaseName, deploymentDate: fields.deploymentDate, deploymentOwner: fields.deploymentOwner, productOwner: fields.productOwner, platform: fields.platform, type: fields.type, status: fields.status ?? "Planned", summary: fields.summary ?? null, releaseNotesUrl: fields.releaseNotesUrl ?? null, swaggerUrl: fields.swaggerUrl ?? null, relatedBatch: fields.relatedBatch ?? null, relatedFeature: fields.relatedFeature ?? null, relatedStory: fields.relatedStory ?? null, environment: fields.environment ?? "QA", adoWorkItemId: fields.adoWorkItemId ?? null, adoFeatureUrl: fields.adoFeatureUrl ?? null, adoStoryUrl: fields.adoStoryUrl ?? null, adoLinks: fields.adoLinks ?? null, releaseNotesBullets: fields.releaseNotesBullets ?? null, githubReleaseTag: fields.githubReleaseTag ?? null, screenChanges: (fields as any).screenChanges ?? null, whatChanged: (fields as any).whatChanged ?? null, qaTestInstructions: (fields as any).qaTestInstructions ?? null, expectedResults: (fields as any).expectedResults ?? null, knownIssues: (fields as any).knownIssues ?? null, backendChanges: (fields as any).backendChanges ?? null, validationStatus: (fields as any).validationStatus ?? "Pending", validatedBy: (fields as any).validatedBy ?? null, validationDate: (fields as any).validationDate ?? null, validationNotes: (fields as any).validationNotes ?? null, releaseNotesStatus: (fields as any).releaseNotesStatus ?? "Draft" }).where(eq(qaDeployments.id, id)); return { success: true }; }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) return { success: false }; await db.delete(qaDeployments).where(eq(qaDeployments.id, input.id)); return { success: true }; }),
  }),

  integrationHub: router({
    // Get all questions for a given topic
    getQuestions: publicProcedure
      .input(z.object({ topic: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(integrationQuestions)
          .where(eq(integrationQuestions.topic, input.topic))
          .orderBy(integrationQuestions.createdAt);
      }),

    // Add a new question
    addQuestion: publicProcedure
      .input(
        z.object({
          topic: z.string(),
          question: z.string().min(1),
          owner: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(integrationQuestions).values({
          topic: input.topic,
          question: input.question,
          owner: input.owner ?? null,
          status: "open",
        });
        return { success: true };
      }),

    // Resolve a question
    resolveQuestion: publicProcedure
      .input(
        z.object({
          id: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db
          .update(integrationQuestions)
          .set({
            status: "resolved",
            notes: input.notes ?? null,
            resolvedAt: new Date(),
          })
          .where(eq(integrationQuestions.id, input.id));
        return { success: true };
      }),

    // Defer a question
    deferQuestion: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db
          .update(integrationQuestions)
          .set({ status: "deferred" })
          .where(eq(integrationQuestions.id, input.id));
        return { success: true };
      }),

    // Assign owner to a question
    assignQuestion: publicProcedure
      .input(z.object({ id: z.number(), owner: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db
          .update(integrationQuestions)
          .set({ owner: input.owner })
          .where(eq(integrationQuestions.id, input.id));
        return { success: true };
      }),

    // Delete a question
    deleteQuestion: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db
          .delete(integrationQuestions)
          .where(eq(integrationQuestions.id, input.id));
        return { success: true };
      }),
  }),

  uat: router({
    // ── Test Cases CRUD ────────────────────────────────────────────────────
    getTestCases: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(uatTestCases).orderBy(desc(uatTestCases.createdAt));
      }),
    addTestCase: publicProcedure
      .input(z.object({
        testId: z.string(),
        epic: z.string().optional(),
        feature: z.string().optional(),
        story: z.string().optional(),
        requirementId: z.string().optional(),
        configItem: z.string().optional(),
        workbookTab: z.string().optional(),
        rogerScreen: z.string().optional(),
        expectedResult: z.string().optional(),
        actualResult: z.string().optional(),
        tester: z.string().optional(),
        businessReviewer: z.string().optional(),
        priority: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
        status: z.enum(["Not Started", "In Progress", "Passed", "Failed", "Blocked", "Deferred", "Retest Required", "Production Ready"]).default("Not Started"),
        defectId: z.string().optional(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(uatTestCases).values({ ...input, retest: 0 });
        return { success: true };
      }),
    updateTestCase: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["Not Started", "In Progress", "Passed", "Failed", "Blocked", "Deferred", "Retest Required", "Production Ready"]).optional(),
        actualResult: z.string().optional(),
        tester: z.string().optional(),
        defectId: z.string().optional(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { id, ...rest } = input;
        await db.update(uatTestCases).set(rest).where(eq(uatTestCases.id, id));
        return { success: true };
      }),
    deleteTestCase: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(uatTestCases).where(eq(uatTestCases.id, input.id));
        return { success: true };
      }),
    importTestCases: publicProcedure
      .input(z.object({
        testCases: z.array(z.object({
          testId: z.string(),
          epic: z.string().optional(),
          feature: z.string().optional(),
          story: z.string().optional(),
          requirementId: z.string().optional(),
          configItem: z.string().optional(),
          workbookTab: z.string().optional(),
          rogerScreen: z.string().optional(),
          expectedResult: z.string().optional(),
          tester: z.string().optional(),
          businessReviewer: z.string().optional(),
          priority: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
          status: z.enum(["Not Started", "In Progress", "Passed", "Failed", "Blocked", "Deferred", "Retest Required", "Production Ready"]).default("Not Started"),
          comments: z.string().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false, count: 0 };
        if (input.testCases.length === 0) return { success: true, count: 0 };
        for (const tc of input.testCases) {
          await db.insert(uatTestCases).values({ ...tc, retest: 0 });
        }
        return { success: true, count: input.testCases.length };
      }),
    // ── Defects CRUD ───────────────────────────────────────────────────────────
    getDefects: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(uatDefects).orderBy(desc(uatDefects.createdAt));
      }),
    addDefect: publicProcedure
      .input(z.object({
        defectNumber: z.string(),
        description: z.string(),
        severity: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
        priority: z.enum(["P1", "P2", "P3", "P4"]).default("P2"),
        assignedDeveloper: z.string().optional(),
        status: z.enum(["Open", "In Progress", "Fixed", "Closed", "Deferred"]).default("Open"),
        targetFixDate: z.string().optional(),
        retestStatus: z.enum(["Pending", "Passed", "Failed", "N/A"]).default("Pending"),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(uatDefects).values({ ...input, daysOpen: 0 });
        return { success: true };
      }),
    deleteDefect: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(uatDefects).where(eq(uatDefects.id, input.id));
        return { success: true };
      }),
    // ── Risks CRUD ─────────────────────────────────────────────────────────────
    getRisks: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(uatRisks).orderBy(desc(uatRisks.createdAt));
      }),
    addRisk: publicProcedure
      .input(z.object({
        risk: z.string(),
        businessImpact: z.string().optional(),
        probability: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
        mitigation: z.string().optional(),
        owner: z.string().optional(),
        status: z.string().optional(),
        targetResolution: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(uatRisks).values(input);
        return { success: true };
      }),
    deleteRisk: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(uatRisks).where(eq(uatRisks.id, input.id));
        return { success: true };
      }),
    askBuddy: publicProcedure
      .input(z.object({ question: z.string() }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Ask Buddy, the AI Testing Assistant for the DCT Platform UAT. 
You have deep knowledge of the DCT Platform's architecture, test cases, defects, and release readiness.

Platform context:
- Owner: Jenniver Dawn Stafford
- MVP Release: September 21, 2026
- UAT Phase: Mid-August 2026
- Source of Truth: DCT Enterprise Master Data Workbook v1.0
- 20 UAT test cases across 5 epics: PDC Data Ingestion, TDC Tax Classification, Orchestrator, Roger Consumer, IMS Integration
- 3 active defects: DEF-001 (Orchestrator retry logic), DEF-002 (Roger auth not provisioned), DEF-003 (ETRCategory schema mismatch)
- Current Go/No Go status: NO GO — 2 critical defects open, Roger auth blocked

When asked to generate test cases, provide structured test case IDs, epics, features, stories, requirements, and expected results.
When asked about defects, summarize severity, owner, and resolution path.
When asked for Go/No Go recommendation, evaluate based on: all critical defects closed, all tests passed, all business areas signed off.
Be concise, professional, and enterprise-ready in your responses.`;

        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: systemPrompt as string },
            { role: "user", content: input.question },
          ],
        });
        const answer = response.choices?.[0]?.message?.content ?? "I was unable to generate a response. Please try again.";
        return { answer };
      }),

    generateReport: publicProcedure
      .input(z.object({ reportType: z.string() }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a UAT reporting assistant for the DCT Platform. Generate a professional, enterprise-grade ${input.reportType} based on the following UAT data:

Test Summary:
- Total: 20 test cases | Passed: 8 | Failed: 1 | Blocked: 1 | In Progress: 3 | Not Started: 6 | Retest Required: 1
- Pass Rate: 40% | Fail Rate: 5% | Blocked: 5%
- Defects: 3 total (1 Critical, 1 High, 1 Medium) | 2 open
- Go/No Go: NO GO — critical defects open

Epic Coverage:
- PDC Data Ingestion: 80% pass rate (4/5 passed)
- TDC Tax Classification: 50% pass rate (3/6 passed)
- Orchestrator: 0% pass rate (0/3 — 1 failed, 1 in progress, 1 retest)
- Roger Consumer: 0% pass rate (0/3 — all blocked or not started)
- IMS Integration: 0% pass rate (0/2 — not started)

Open Defects:
- DEF-001 (High): Orchestrator retry logic fails on large TB files — In Progress — Fix by Aug 12
- DEF-002 (Critical): Roger auth not provisioned in UAT — Open — Fix by Aug 10

Business Signoff: 1 of 5 areas approved (PDC only)
Release Readiness: 2 of 8 criteria met
MVP Target: September 21, 2026 | Decision Date: September 14, 2026

Generate a complete, professional ${input.reportType} formatted for executive consumption. Include key metrics, risks, recommendations, and next steps.`;

        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: systemPrompt as string },
            { role: "user", content: `Generate the ${input.reportType} now.` },
          ],
        });
        const report = response.choices?.[0]?.message?.content ?? "Unable to generate report at this time.";
        return { report };
      }),
  }),

  // ─── QA Screen Records ─────────────────────────────────────────────────────
  qaScreenRecords: router({
    listByDeployment: publicProcedure
      .input(z.object({ deploymentId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        return db.select().from(qaScreenRecords)
          .where(eq(qaScreenRecords.deploymentId, input.deploymentId))
          .orderBy(qaScreenRecords.sortOrder, qaScreenRecords.id);
      }),

    bulkCreate: publicProcedure
      .input(z.object({
        deploymentId: z.string(),
        screens: z.array(z.object({
          screenName: z.string(),
          platform: z.string().optional(),
          component: z.string().optional(),
          changeType: z.string().optional(),
          whatChanged: z.string().optional(),
          availableInQa: z.string().optional(),
          qaTestInstructions: z.string().optional(),
          expectedResult: z.string().optional(),
          knownIssues: z.string().optional(),
          adoItem: z.string().optional(),
          validationStatus: z.string().optional(),
          isBackendOnly: z.boolean().optional(),
          sortOrder: z.number().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        await db.delete(qaScreenRecords).where(eq(qaScreenRecords.deploymentId, input.deploymentId));
        if (input.screens.length === 0) return { created: 0 };
        const rows = input.screens.map((s, i) => ({
          deploymentId: input.deploymentId,
          screenName: s.screenName,
          platform: s.platform ?? "Roger",
          component: s.component ?? null,
          changeType: s.changeType ?? "Updated",
          whatChanged: s.whatChanged ?? null,
          availableInQa: s.availableInQa ?? "Pending Validation",
          qaTestInstructions: s.qaTestInstructions ?? null,
          expectedResult: s.expectedResult ?? null,
          knownIssues: s.knownIssues ?? null,
          adoItem: s.adoItem ?? null,
          validationStatus: s.validationStatus ?? "Not Started",
          isBackendOnly: s.isBackendOnly ?? false,
          screenshotStatus: (s.isBackendOnly ? "Not Required" : "Missing") as string,
          sortOrder: s.sortOrder ?? i,
          readiness: "Ready to Test",
          qaConfirmation: "Pending Confirmation",
          releaseNoteStatus: "Pending Confirmation",
        }));
        await db.insert(qaScreenRecords).values(rows as any);
        return { created: rows.length };
      }),

    upsertScreen: publicProcedure
      .input(z.object({
        deploymentId: z.string(),
        screenName: z.string(),
        readiness: z.string().optional(),
        qaConfirmation: z.string().optional(),
        knownIssueFlag: z.boolean().optional(),
        knownIssueDescription: z.string().optional(),
        knownIssueWorkaround: z.string().optional(),
        knownIssueInvestigationStatus: z.string().optional(),
        knownIssueAdoItem: z.string().optional(),
        releaseNoteStatus: z.string().optional(),
        whatsAvailable: z.string().optional(),
        whatsNotAvailable: z.string().optional(),
        qaValidationGuidance: z.string().optional(),
        baNotes: z.string().optional(),
        whatChanged: z.string().optional(),
        adoItem: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        const { deploymentId, screenName, ...fields } = input;
        const existing = await db.select({ id: qaScreenRecords.id })
          .from(qaScreenRecords)
          .where(eq(qaScreenRecords.deploymentId, deploymentId))
          .then(rows => rows.find(r => r));
        // Try to find by screenName
        const allRows = await db.select().from(qaScreenRecords)
          .where(eq(qaScreenRecords.deploymentId, deploymentId));
        const match = allRows.find(r => r.screenName === screenName);
        if (match) {
          await db.update(qaScreenRecords).set(fields as any).where(eq(qaScreenRecords.id, match.id));
          return { id: match.id, action: 'updated' };
        } else {
          await db.insert(qaScreenRecords).values({ deploymentId, screenName, ...fields, readiness: fields.readiness ?? 'Ready to Test', qaConfirmation: fields.qaConfirmation ?? 'Pending Confirmation', releaseNoteStatus: fields.releaseNoteStatus ?? 'Pending Confirmation' } as any);
          return { action: 'created' };
        }
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        screenName: z.string().optional(),
        platform: z.string().optional(),
        component: z.string().optional(),
        changeType: z.string().optional(),
        whatChanged: z.string().optional(),
        availableInQa: z.string().optional(),
        qaTestInstructions: z.string().optional(),
        expectedResult: z.string().optional(),
        knownIssues: z.string().optional(),
        adoItem: z.string().optional(),
        validationStatus: z.string().optional(),
        screenshotStatus: z.string().optional(),
        screenshots: z.string().optional(),
        readiness: z.string().optional(),
        qaConfirmation: z.string().optional(),
        knownIssueFlag: z.boolean().optional(),
        knownIssueDescription: z.string().optional(),
        knownIssueWorkaround: z.string().optional(),
        knownIssueInvestigationStatus: z.string().optional(),
        knownIssueAdoItem: z.string().optional(),
        releaseNoteStatus: z.string().optional(),
        whatsAvailable: z.string().optional(),
        whatsNotAvailable: z.string().optional(),
        qaValidationGuidance: z.string().optional(),
        baNotes: z.string().optional(),
        confirmationHistory: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        const { id, ...fields } = input;
        await db.update(qaScreenRecords).set(fields as any).where(eq(qaScreenRecords.id, id));
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        await db.delete(qaScreenRecords).where(eq(qaScreenRecords.id, input.id));
        return { success: true };
      }),

    uploadScreenshot: publicProcedure
      .input(z.object({
        screenRecordId: z.number(),
        deploymentId: z.string(),
        fileName: z.string(),
        fileDataBase64: z.string(),
        mimeType: z.string().default("image/png"),
        title: z.string().optional(),
        caption: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null as any;
        const buffer = Buffer.from(input.fileDataBase64, "base64");
        const key = `qa-screenshots/${input.deploymentId}/${input.screenRecordId}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        const [record] = await db.select({ screenshots: qaScreenRecords.screenshots })
          .from(qaScreenRecords).where(eq(qaScreenRecords.id, input.screenRecordId));
        const existing = record?.screenshots ? JSON.parse(record.screenshots) : [];
        const updated = [...existing, { url, title: input.title ?? "", caption: input.caption ?? "", notes: input.notes ?? "" }];
        await db.update(qaScreenRecords)
          .set({ screenshots: JSON.stringify(updated), screenshotStatus: "Uploaded" })
          .where(eq(qaScreenRecords.id, input.screenRecordId));
        return { url, screenshots: updated };
      }),

    analyzeNotes: publicProcedure
      .input(z.object({ notes: z.string() }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a QA Release Notes Analyst for the Roger/DCT platform. Analyze the supplied deployment notes and extract structured release information.

IMPORTANT: Your entire response must be ONLY a raw JSON object. No markdown, no code fences, no explanation text. Start your response with { and end with }.

Return JSON matching this EXACT structure:
{
  "releaseName": "infer from context, e.g. Roger QA - My Clients",
  "deploymentDate": "today date in YYYY-MM-DD format",
  "environment": "QA",
  "platform": "Roger",
  "type": "Feature | Bug | Technical Story | Hotfix | Batch",
  "deploymentOwner": "if mentioned, else Not Provided",
  "productOwner": "if mentioned, else Not Provided",
  "adoItems": "comma-separated list of ADO Feature/Story IDs if mentioned, else Not Provided",
  "summary": "1-2 sentence overall release summary",
  "knownLimitations": "overall known limitations explicitly stated, else Not Provided",
  "dependencies": "dependencies explicitly stated, else Not Provided",
  "screens": [
    {
      "screenName": "Roger screen name from: My Clients Page, Return Filing Page, Return Structure Summary, Line Mapping, Book/Reclass Adjustments, Book Return Review, Tax Adjustment, Book-to-Tax Report, Book-to-Tax Reconciliation, 1120 Form, Sign Off, or Other",
      "capabilities": [
        {
          "name": "short capability name, e.g. Entity Count",
          "whatChanged": "1-2 sentence description of what this capability does or what changed",
          "qaValidation": "specific testable step QA should perform to validate this capability",
          "adoItem": "specific ADO story/feature ID for this capability, or Not Provided"
        }
      ]
    }
  ]
}
CRITICAL RULES:
1. Extract EVERY individual capability or functionality item as a separate entry in capabilities[].
2. Include ALL capabilities mentioned - both available AND unavailable ones. Never omit any.
3. Use ONLY information explicitly stated in the notes. Never invent or assume.
4. For capabilities explicitly stated as NOT available or NOT confirmed, still include them in capabilities[] - the BA will mark their confirmation status.
5. qaValidation must be a specific testable step (e.g. "Verify Entity Count displays and accurately represents the entities associated with the client").
6. adoItems at the top level should list ALL ADO references. adoItem per capability should be the most specific reference for that item.
7. Return ONLY valid JSON. No markdown, no explanation, no code fences.
8. Platform must always be "Roger". Environment must always be "QA".`;
        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: systemPrompt as string },
            { role: "user" as const, content: String(input.notes) },
          ],
        });
        const rawContent = response.choices?.[0]?.message?.content;
        console.log("[analyzeNotes] content type:", typeof rawContent, "preview:", String(rawContent ?? "").slice(0, 300));
        let parsed: any = {};
        try {
          if (typeof rawContent === "string" && rawContent.trim()) {
            // Strip markdown code fences if present
            const stripped = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
            parsed = JSON.parse(stripped);
          } else if (rawContent && typeof rawContent === "object") {
            parsed = rawContent as any;
          } else {
            console.error("[analyzeNotes] Empty or null content from LLM");
            parsed = { error: "LLM returned empty response" };
          }
        } catch (e) {
          console.error("[analyzeNotes] Parse error:", e, "raw:", String(rawContent ?? "").slice(0, 500));
          parsed = { error: "Failed to parse LLM response", raw: String(rawContent ?? "").slice(0, 200) };
        }
        console.log("[analyzeNotes] result keys:", Object.keys(parsed));
        return parsed;
      }),
  }),
});
// ─── qaScreenRecords router is defined inside appRouter above ───────────────
export type AppRouter = typeof appRouter;

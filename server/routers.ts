import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { buildPlatformSystemPrompt } from "./platformContext";
import { buildDiscoveryContextBlock } from "./discoveryKnowledgeBase";
import { appendBuddyProvenance, buildBuddyGrounding, buildInsufficientEvidenceResponse } from "./askBuddyGrounding";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { askBuddyAudits, integrationQuestions, deployments, deploymentScreens, qaDeployments, qaScreenRecords, uatTestCases, uatDefects, uatRisks, mappingArtifacts, mappingResults, mappingSessions } from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { createMappingCandidates, isMappableArtifactField, mappingReadiness, parseArtifactBuffer, type ArtifactField } from "./dataMappingEngine";
import { buildMasterDataEvidence, isMasterDataQuestion, MASTER_DATA_ANSWER_FALLBACK, selectAuthoritativeMasterDataArtifact } from "./masterDataRegistry";

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
        const currentPagePath = input.currentPagePath ?? input.discoveryPagePath;
        const question = [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
        const db = await getDb();
        const masterArtifacts = db ? await db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt)) : [];
        const masterEvidence = buildMasterDataEvidence(question, selectAuthoritativeMasterDataArtifact(masterArtifacts));
        const grounding = buildBuddyGrounding(question, currentPagePath, input.liveSnapshot, masterEvidence.source);
        const entryContext = currentPagePath
          ? `\n\nEntry-page context: ${currentPagePath}. This is a navigation cue only. Do not use it as a factual source or allow it to alter the authoritative answer. You may add a brief optional page-relevance sentence only after answering from the central evidence layer.`
          : "";
        const systemPrompt = buildPlatformSystemPrompt(input.liveSnapshot) + grounding.evidenceBlock + masterEvidence.evidenceBlock + entryContext + `\n\nSelected analysis lens: ${input.capability ?? "General Discovery"}. The lens changes how you analyze evidence, not what platform evidence you may use.`;

        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        let responseText: string;
        if (!grounding.hasSufficientEvidence || (isMasterDataQuestion(question) && !masterEvidence.hasEvidence)) {
          responseText = isMasterDataQuestion(question) && !masterEvidence.hasEvidence
            ? `${MASTER_DATA_ANSWER_FALLBACK}\n\n### What is missing\nThe authoritative active-tab workbook artifact is not currently registered in the DCT Platform evidence layer.\n\n### Next Action\nRegister the current DCT_Master_Data_Intake.xlsx artifact with an AUTHORITATIVE source label, then retry the question.`
            : buildInsufficientEvidenceResponse(grounding);
        } else {
          const result = await invokeLLM({ messages: llmMessages });
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
        }

        const text = appendBuddyProvenance(responseText, grounding);
        if (db) {
          try {
            await db.insert(askBuddyAudits).values({
              question,
              currentPagePath: currentPagePath ?? null,
              capability: input.capability ?? null,
              answerStatus: grounding.status,
              sourcesJson: JSON.stringify(grounding.sources.map((source) => ({ id: source.id, label: source.label, path: source.path }))),
              sourceVersionsJson: JSON.stringify(grounding.sources.map((source) => ({ id: source.id, lastUpdated: source.lastUpdated, artifactStatus: source.artifactStatus }))),
              conflictsJson: grounding.conflicts.length > 0 ? JSON.stringify(grounding.conflicts) : null,
            });
          } catch (error) {
            console.warn("[askBuddy] audit metadata was not persisted", error);
          }
        }

        return {
          text,
          sources: grounding.sources,
          conflicts: grounding.conflicts,
          status: grounding.status,
          knowledgeCheckedAt: grounding.checkedAt,
          latestSource: grounding.latestSource,
        };
      }),
  }),

  dataMapping: router({
    listArtifacts: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(mappingArtifacts).orderBy(desc(mappingArtifacts.createdAt));
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

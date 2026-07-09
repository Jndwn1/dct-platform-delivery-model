import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { buildPlatformSystemPrompt } from "./platformContext";
import { buildDiscoveryContextBlock } from "./discoveryKnowledgeBase";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { integrationQuestions, deployments } from "../drizzle/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

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
        const discoveryBlock = input.discoveryPagePath
          ? buildDiscoveryContextBlock(input.discoveryPagePath)
          : "";
        const systemPrompt = buildPlatformSystemPrompt(input.liveSnapshot) + discoveryBlock;

        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const result = await invokeLLM({ messages: llmMessages });

        const choice = result.choices[0];
        const content = choice?.message?.content;

        let responseText: string;
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

        return { text: responseText };
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

    // Get recent deployments for the Executive Dashboard — limit matches all registry records
    recent: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(deployments)
        .orderBy(desc(deployments.deploymentDate), desc(deployments.createdAt))
        .limit(10);
      return rows;
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
          releaseNotesBullets: z.string().optional(),
          githubReleaseTag: z.string().optional(),
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
          releaseNotesBullets: input.releaseNotesBullets ?? null,
          githubReleaseTag: input.githubReleaseTag ?? null,
        });
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
          releaseNotesBullets: z.string().optional(),
          githubReleaseTag: z.string().optional(),
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
          releaseNotesBullets: fields.releaseNotesBullets ?? null,
          githubReleaseTag: fields.githubReleaseTag ?? null,
        }).where(eq(deployments.id, id));
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
            { role: "system", content: systemPrompt },
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
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate the ${input.reportType} now.` },
          ],
        });
        const report = response.choices?.[0]?.message?.content ?? "Unable to generate report at this time.";
        return { report };
      }),
  }),
});
export type AppRouter = typeof appRouter;



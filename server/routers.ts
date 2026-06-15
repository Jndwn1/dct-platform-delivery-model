import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { buildPlatformSystemPrompt } from "./platformContext";
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
        })
      )
      .mutation(async ({ input }) => {
        const systemPrompt = buildPlatformSystemPrompt();

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
});

export type AppRouter = typeof appRouter;



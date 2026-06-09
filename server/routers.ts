import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { buildPlatformSystemPrompt } from "./platformContext";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { integrationQuestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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


import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq, max } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sprintCloseoutSources } from "../drizzle/schema";
import { CLOSEOUT_FILE_MIME_TYPES, CLOSEOUT_MAX_FILE_BYTES, CLOSEOUT_SOURCE_CATEGORY_IDS, closeoutFileExtension, validateCloseoutFile, type CloseoutSourceCategory } from "../shared/sprintCloseoutSources";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { storagePut } from "./storage";

const reportingPeriod = z.string().trim().min(1, "Enter the closeout name / PI and sprint.").max(100).transform(s => s.replace(/\s+/g, " "));
const category = z.enum(CLOSEOUT_SOURCE_CATEGORY_IDS);
export const closeoutUploadInput = z.object({
  reportingPeriod, category, fileName: z.string().trim().min(1).max(512),
  fileBase64: z.string().min(1).max(Math.ceil(CLOSEOUT_MAX_FILE_BYTES / 3) * 4),
});
function badFile(message: string): never { throw new TRPCError({ code: "BAD_REQUEST", message }); }
/** Validate source bytes, not metrics or template approval. No arbitrary client MIME types. */
export function decodeCloseoutUpload(fileBase64: string, fileName: string, sourceCategory: CloseoutSourceCategory) {
  if (fileBase64.length % 4 || /[^A-Za-z0-9+/=]/.test(fileBase64)) badFile("The file encoding is invalid. Select the file again.");
  const bytes = Buffer.from(fileBase64, "base64");
  if (bytes.toString("base64") !== fileBase64) badFile("The file encoding is invalid. Select the file again.");
  const error = validateCloseoutFile(fileName, bytes.length, sourceCategory);
  if (error) badFile(error);
  const ext = closeoutFileExtension(fileName);
  const magic = (hex: string) => bytes.subarray(0, hex.length / 2).equals(Buffer.from(hex, "hex"));
  let valid = true;
  if (ext === "png") valid = magic("89504e470d0a1a0a");
  else if (ext === "jpg" || ext === "jpeg") valid = magic("ffd8ff");
  else if (ext === "webp") valid = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  else if (ext === "pdf") valid = bytes.subarray(0, 5).toString() === "%PDF-";
  else if (["docx", "xlsx", "pptx"].includes(ext)) valid = magic("504b0304");
  else if (ext === "xls") valid = magic("d0cf11e0a1b11ae1");
  if (!valid) badFile("The file content does not match its extension. Select the original source file.");
  return { bytes, mimeType: CLOSEOUT_FILE_MIME_TYPES[ext], sha256: createHash("sha256").update(bytes).digest("hex") };
}
function visibleRow(row: typeof sprintCloseoutSources.$inferSelect) {
  const { sha256: _hash, storageKey: _key, ...visible } = row;
  return visible;
}
async function sourceDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "The closeout source register is unavailable. Try again; no upload is confirmed." });
  return db;
}
export const sprintCloseoutSourcesRouter = router({
  // Match the existing non-production dashboard APIs. AuthGate uses local workspace
  // sign-in, not an OAuth server session. Never claim this verifies uploader identity.
  periods: publicProcedure.query(async () => {
    const db = await sourceDb();
    const rows = await db.select({ reportingPeriod: sprintCloseoutSources.reportingPeriod, latest: max(sprintCloseoutSources.createdAtMs) })
      .from(sprintCloseoutSources).groupBy(sprintCloseoutSources.reportingPeriod).orderBy(desc(max(sprintCloseoutSources.createdAtMs)));
    return rows.map(row => row.reportingPeriod);
  }),
  list: publicProcedure.input(z.object({ reportingPeriod })).query(async ({ input }) => {
    const db = await sourceDb();
    const rows = await db.select().from(sprintCloseoutSources).where(eq(sprintCloseoutSources.reportingPeriod, input.reportingPeriod))
      .orderBy(desc(sprintCloseoutSources.createdAtMs), desc(sprintCloseoutSources.id));
    return rows.map(visibleRow);
  }),
  upload: publicProcedure.input(closeoutUploadInput).mutation(async ({ input, ctx }) => {
    const file = decodeCloseoutUpload(input.fileBase64, input.fileName, input.category);
    const db = await sourceDb();
    const identity = and(eq(sprintCloseoutSources.reportingPeriod, input.reportingPeriod), eq(sprintCloseoutSources.category, input.category), eq(sprintCloseoutSources.sha256, file.sha256));
    const findExisting = async () => (await db.select().from(sprintCloseoutSources).where(identity).limit(1))[0];
    const existing = await findExisting();
    if (existing) return visibleRow(existing); // Safe repeated uploads, no duplicate source or record count.
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stored = await storagePut(`sprint-closeout/${randomUUID()}/${safeName}`, file.bytes, file.mimeType);
    let id: number;
    try {
      const [inserted] = await db.insert(sprintCloseoutSources).values({
        reportingPeriod: input.reportingPeriod, category: input.category, fileName: input.fileName,
        mimeType: file.mimeType, sizeBytes: file.bytes.length, sha256: file.sha256,
        storageKey: stored.key, storageUrl: stored.url, uploadedBy: (ctx.user?.name ?? ctx.user?.openId ?? "Not server-verified").slice(0, 256), createdAtMs: Date.now(),
      });
      id = Number(inserted.insertId);
    } catch (error) {
      const raced = await findExisting();
      if (raced) return visibleRow(raced);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The file could not be registered. Upload is not confirmed; select Upload Files to retry.", cause: error });
    }
    const [saved] = await db.select().from(sprintCloseoutSources).where(eq(sprintCloseoutSources.id, id)).limit(1);
    if (!saved) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The saved file could not be retrieved. Refresh the source register before retrying." });
    return visibleRow(saved);
  }),
});

export const CLOSEOUT_SOURCE_CATEGORIES = [
  { id: "metrics", label: "Current sprint metrics" },
  { id: "ado", label: "ADO work item details" },
  { id: "previous-closeout", label: "Previous sprint closeout" },
  { id: "burndown", label: "Executive burndown dashboards (current / previous)" },
  { id: "deployment-cutoff", label: "Deployment registry / reporting cutoff evidence" },
  { id: "template-1", label: "Template 1 — Sprint-over-Sprint Comparison" },
  { id: "template-2", label: "Template 2 — Sprint Closeout Summary" },
  { id: "template-3", label: "Template 3 — Sprint Work Item Detail" },
  { id: "template-4", label: "Template 4 — Executive Burndown Comparison" },
  { id: "template-5", label: "Template 5 — TDC Deployment Registry" },
  { id: "priorities", label: "Upcoming sprint priorities" },
  { id: "release-notes", label: "Supporting release notes" },
] as const;
export type CloseoutSourceCategory = typeof CLOSEOUT_SOURCE_CATEGORIES[number]["id"];
export const CLOSEOUT_SOURCE_CATEGORY_IDS = CLOSEOUT_SOURCE_CATEGORIES.map(c => c.id) as [CloseoutSourceCategory, ...CloseoutSourceCategory[]];
export const CLOSEOUT_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const CLOSEOUT_MAX_FILES_PER_SELECTION = 10;
export const CLOSEOUT_FILE_MIME_TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel", csv: "text/csv", txt: "text/plain", md: "text/plain",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
export const CLOSEOUT_FILE_ACCEPT = Object.keys(CLOSEOUT_FILE_MIME_TYPES).map(e => `.${e}`).join(",");
export function closeoutFileExtension(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}
export function validateCloseoutFile(name: string, size: number, category: CloseoutSourceCategory): string | null {
  if (!name.trim() || name.length > 512) return "Choose a file with a name of 512 characters or fewer.";
  if (!size) return "Empty files cannot be uploaded.";
  if (size > CLOSEOUT_MAX_FILE_BYTES) return "Each file must be 10 MB or smaller.";
  const ext = closeoutFileExtension(name);
  if (!CLOSEOUT_FILE_MIME_TYPES[ext]) return "Use PNG, JPG, WebP, PDF, Word (.docx), Excel, CSV, text, Markdown or PowerPoint (.pptx).";
  if (category.startsWith("template-") && ext !== "png") return "Approved visual template sources must be PNG files.";
  return null;
}
export const CLOSEOUT_SOURCE_STATUS = "Uploaded — Needs Review" as const;

export const BUDDY_SCREENSHOT_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const DEFAULT_BUDDY_SCREENSHOT_QUESTION = "Read this screenshot and explain the relevant requirements or dependencies. Distinguish visible facts from proposed analysis and identify any unreadable or missing details.";

export function isBuddyScreenshot(file: Pick<File, "type" | "name"> | null): boolean {
  return Boolean(file && (BUDDY_SCREENSHOT_MIME_TYPES.includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name)));
}

export function getPastedBuddyScreenshot(items: ArrayLike<DataTransferItem>): File | null {
  for (const item of Array.from(items)) {
    if (item.kind !== "file" || !BUDDY_SCREENSHOT_MIME_TYPES.includes(item.type)) continue;
    const file = item.getAsFile();
    if (!file) continue;
    const extension = item.type === "image/jpeg" ? "jpg" : item.type === "image/webp" ? "webp" : "png";
    return new File([file], `screenshot-${Date.now()}.${extension}`, { type: item.type });
  }
  return null;
}

// Used only by the existing tRPC httpLink; no separate API or retry loop.
export const BUDDY_CHAT_CONNECTION_TIMEOUT_MS = 40_000;
export const BUDDY_UPLOAD_CONNECTION_TIMEOUT_MS = 20_000;

export async function fetchBuddyRpc(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const operation = url.match(/\/askBuddy\.(chat|uploadAttachment)(?:[?,]|$)/)?.[1];
  if (!operation) return globalThis.fetch(input, init);

  const timeoutMs = operation === "chat" ? BUDDY_CHAT_CONNECTION_TIMEOUT_MS : BUDDY_UPLOAD_CONNECTION_TIMEOUT_MS;
  const controller = new AbortController();
  const parentSignal = init?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
  const forwardAbort = () => controller.abort(parentSignal?.reason);
  if (parentSignal?.aborted) forwardAbort();
  else parentSignal?.addEventListener("abort", forwardAbort, { once: true });

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await globalThis.fetch(input, { ...init, signal: controller.signal });
        // Keep the deadline active through the body, not just response headers.
        const body = await response.arrayBuffer();
        if (response.headers.get("content-type")?.includes("text/html")) {
          throw new Error("Buddy received a preview connection page instead of an AI response. Please retry after the preview reconnects.");
        }
        return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(operation === "chat"
            ? "Buddy's connection timed out. Your conversation is preserved; please retry the question."
            : "The attachment upload timed out. The selected file is still available; please retry."));
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    parentSignal?.removeEventListener("abort", forwardAbort);
  }
}

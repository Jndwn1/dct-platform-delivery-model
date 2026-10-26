export interface SharedBuddyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: unknown[];
  status?: "Confirmed" | "Open" | "Conflict" | "Missing";
  knowledgeCheckedAt?: string;
  documentAnalysis?: {
    depth: "concise" | "detailed";
    complete: boolean;
    mode?: "assessment" | "targeted" | "follow-up" | "initial";
    artifactId?: number;
    fileName?: string;
    initialQuestion?: string;
  };
}

const KEY = "dct_ask_buddy_shared_conversation_v1";
const EVENT = "dct_ask_buddy_conversation_changed";
const RETIRED_EXTRACTION_RESPONSE = /(?:###\s*Document Analysis\s*—\s*Evidence-Bound First Pass|Ask Buddy prepared this evidence-bound first pass directly from matching extracted statements|###\s*TDC Ownership Signals|###\s*Cross-Team Dependency Signals|The document does not select a State Apportionment operating model or establish final TDC interface requirements)/i;

/**
 * Removes the retired extraction-only document response and its directly paired
 * user prompt. This is intentionally narrow so valid prior conversations remain.
 */
export function removeRetiredExtractionConversationTurns(messages: SharedBuddyMessage[]) {
  const retiredIndexes = new Set<number>();
  messages.forEach((message, index) => {
    if (message.role !== "assistant" || !RETIRED_EXTRACTION_RESPONSE.test(message.content)) return;
    retiredIndexes.add(index);
    if (messages[index - 1]?.role === "user") retiredIndexes.add(index - 1);
  });
  return messages.filter((_, index) => !retiredIndexes.has(index));
}

export function readSharedBuddyConversation(): SharedBuddyMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    const migrated = removeRetiredExtractionConversationTurns(value as SharedBuddyMessage[]).slice(-30);
    if (migrated.length !== value.length) {
      window.localStorage.setItem(KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function writeSharedBuddyConversation(messages: SharedBuddyMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(messages.slice(-30)));
  window.dispatchEvent(new Event(EVENT));
}

export function appendSharedBuddyConversation(messages: SharedBuddyMessage[]) {
  const merged = [...readSharedBuddyConversation()];
  messages.forEach((message) => {
    const existingIndex = merged.findIndex(existing => existing.id === message.id);
    if (existingIndex >= 0) merged[existingIndex] = message;
    else merged.push(message);
  });
  writeSharedBuddyConversation(merged);
}

export function subscribeSharedBuddyConversation(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

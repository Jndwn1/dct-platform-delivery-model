export interface SharedBuddyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: unknown[];
  status?: "Confirmed" | "Open" | "Conflict" | "Missing";
  knowledgeCheckedAt?: string;
}

const KEY = "dct_ask_buddy_shared_conversation_v1";
const EVENT = "dct_ask_buddy_conversation_changed";

export function readSharedBuddyConversation(): SharedBuddyMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.slice(-30) : [];
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

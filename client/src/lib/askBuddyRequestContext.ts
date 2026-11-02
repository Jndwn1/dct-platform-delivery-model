export type BuddyRequestMessage = { role: "user" | "assistant"; content: string };

/** Keep three exchanges, with a hard character budget; preserve both the question and appended references. */
export function selectBuddyRequestMessages(messages: BuddyRequestMessage[]): BuddyRequestMessage[] {
  let remaining = 16_000;
  const selected: BuddyRequestMessage[] = [];
  for (const message of messages.slice(-6).reverse()) {
    const limit = Math.min(4_000, remaining);
    if (limit < 64) break;
    const content = message.content.length <= limit
      ? message.content
      : `${message.content.slice(0, Math.floor((limit - 32) / 2))}\n[Earlier content shortened]\n${message.content.slice(-Math.floor((limit - 32) / 2))}`;
    selected.unshift({ role: message.role, content });
    remaining -= content.length;
  }
  return selected;
}

/** Earlier user turns help retrieval for follow-ups, never as new confirmed platform facts. */
export function resolveBuddyRetrievalQuestion(messages: BuddyRequestMessage[]): string {
  const users = messages.filter((message) => message.role === "user");
  const question = users.at(-1)?.content ?? "";
  const contextualFollowUp = /\b(those|these|them|that|the three|prior|previous|above|same|refer to|use (?:the|that|this)|based on (?:the|that|this)|what about)\b/i.test(question);
  if (!contextualFollowUp || users.length < 2) return question;
  return `${question}\n\nEarlier user-supplied scope for this follow-up:\n${users.slice(-3, -1).map((message) => message.content.slice(0, 4_000)).join("\n")}`;
}

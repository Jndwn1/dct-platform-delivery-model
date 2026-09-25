import { useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { buildLiveSnapshot, useBatchStatus } from "@/contexts/BatchStatusContext";

const C = {
  navy: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  purple: "#7c3aed",
  purpleInk: "#6d28d9",
  purpleSurface: "#faf5ff",
  teal: "#0f766e",
  tealSurface: "#f0fdfa",
  amber: "#b45309",
  amberSurface: "#fffbeb",
};

type BuddySource = {
  id: string;
  label: string;
  path: string;
  authority: string;
  lastUpdated: string;
  artifactStatus: "Current" | "Reference" | "Open" | "Unavailable";
};

type BuddyMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: BuddySource[];
  status?: "Confirmed" | "Open" | "Conflict" | "Missing";
  knowledgeCheckedAt?: string;
};

const SUGGESTED_QUESTIONS = [
  "What are the key gaps that Gary should review for Story 1494344?",
  "Compare the first-pass status across the five current-year State stories.",
  "What evidence is missing before Gateway and TDC implementation can be assessed?",
  "What belongs to State / Provision versus Gateway and TDC in this review process?",
];

function statusStyle(status?: BuddyMessage["status"]) {
  if (status === "Confirmed") return { background: "#f0fdf4", border: "#86efac", color: "#15803d" };
  if (status === "Conflict" || status === "Missing") return { background: C.amberSurface, border: "#fde68a", color: C.amber };
  return { background: "#f8fafc", border: "#cbd5e1", color: C.slate };
}

/** Inline Ask Buddy experience for the State & Provision Story Review workspace. */
export default function StoryReviewAskBuddy() {
  const { statuses, gates, piCompletion, lastUpdated } = useBatchStatus();
  const liveSnapshot = useMemo(
    () => buildLiveSnapshot(statuses, gates, piCompletion, lastUpdated),
    [statuses, gates, piCompletion, lastUpdated],
  );
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatMutation = trpc.askBuddy.chat.useMutation();

  const sendMessage = async (message: string) => {
    const content = message.trim();
    if (!content || isSending) return;

    const userMessage: BuddyMessage = { id: `story-review-user-${Date.now()}`, role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        currentPagePath: "/post-pilot",
        capability: "story-review",
        liveSnapshot,
      });
      setMessages(current => [
        ...current,
        {
          id: `story-review-assistant-${Date.now()}`,
          role: "assistant",
          content: result.text,
          sources: result.sources,
          status: result.status,
          knowledgeCheckedAt: result.knowledgeCheckedAt,
        },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        {
          id: `story-review-assistant-${Date.now()}`,
          role: "assistant",
          content: "I could not complete that first-pass review question. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-labelledby="story-review-ask-buddy-title" style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", marginTop: "20px", overflow: "hidden" }}>
      <div style={{ alignItems: "flex-start", background: C.purpleSurface, borderBottom: "1px solid #e9d5ff", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "14px" }}>
        <div>
          <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Evidence-grounded first pass</div>
          <h3 id="story-review-ask-buddy-title" style={{ color: C.navy, fontSize: "15px", fontWeight: 900, margin: "4px 0 0" }}>Ask Buddy — Story Review Agent</h3>
          <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "800px" }}>Ask about the review package, evidence gaps, ownership boundaries, and questions to carry into Gary’s technical review. Buddy marks unsupported details as open rather than inventing requirements.</p>
        </div>
        {messages.length > 0 && <button onClick={() => setMessages([])} style={{ background: "#ffffff", border: `1px solid ${C.purple}`, borderRadius: "6px", color: C.purpleInk, cursor: "pointer", fontSize: "10px", fontWeight: 900, padding: "8px 10px" }} type="button">Clear chat</button>}
      </div>

      <div style={{ background: C.amberSurface, borderBottom: "1px solid #fde68a", color: "#713f12", fontSize: "10px", lineHeight: 1.5, padding: "9px 14px" }}>
        <strong>Technical control:</strong> This agent supports the first pass only. Gary remains the final technical reviewer for implementation, API, persistence, architecture, repository, and technical story-split decisions.
      </div>

      <div aria-live="polite" style={{ background: "#f8fafc", minHeight: "230px", padding: "14px" }}>
        {messages.length === 0 ? (
          <div>
            <p style={{ color: C.muted, fontSize: "11px", lineHeight: 1.5, margin: "0 0 10px" }}>Start with an evidence-bound review question:</p>
            <div style={{ display: "grid", gap: "7px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {SUGGESTED_QUESTIONS.map(question => (
                <button key={question} disabled={isSending} onClick={() => sendMessage(question)} style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "7px", color: C.slate, cursor: isSending ? "not-allowed" : "pointer", fontSize: "10px", lineHeight: 1.45, opacity: isSending ? 0.55 : 1, padding: "9px 10px", textAlign: "left" }} type="button">{question}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "11px" }}>
            {messages.map(message => {
              const status = statusStyle(message.status);
              return (
                <div key={message.id} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ background: message.role === "user" ? C.purple : "#ffffff", border: message.role === "user" ? "none" : `1px solid ${C.border}`, borderRadius: message.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", color: message.role === "user" ? "#ffffff" : C.slate, fontSize: "11px", lineHeight: 1.55, maxWidth: "92%", padding: "10px 11px" }}>
                    {message.role === "assistant" ? <Streamdown>{message.content}</Streamdown> : message.content}
                    {message.role === "assistant" && (message.sources?.length || message.status || message.knowledgeCheckedAt) ? (
                      <div style={{ borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "9px", paddingTop: "8px" }}>
                        {message.sources?.map(source => <a href={source.path} key={source.id} style={{ background: source.artifactStatus === "Open" ? C.amberSurface : C.tealSurface, border: `1px solid ${source.artifactStatus === "Open" ? "#fde68a" : "#99f6e4"}`, borderRadius: "4px", color: source.artifactStatus === "Open" ? C.amber : C.teal, fontSize: "9px", fontWeight: 800, padding: "3px 5px", textDecoration: "none" }} title={`${source.authority} · ${source.lastUpdated}`}>Source: {source.label}</a>)}
                        {message.status && <span style={{ background: status.background, border: `1px solid ${status.border}`, borderRadius: "4px", color: status.color, fontSize: "9px", fontWeight: 900, padding: "3px 5px" }}>Status: {message.status}</span>}
                        {message.knowledgeCheckedAt && <span style={{ color: C.muted, fontSize: "9px", padding: "3px 0" }}>Checked {new Date(message.knowledgeCheckedAt).toLocaleString()}</span>}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {isSending && <div style={{ alignItems: "center", color: C.muted, display: "flex", fontSize: "10px", fontStyle: "italic", gap: "7px" }}><span style={{ background: C.purple, borderRadius: "999px", height: "7px", width: "7px" }} />Ask Buddy is checking the governed evidence layer…</div>}
          </div>
        )}
      </div>

      <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} style={{ alignItems: "flex-end", borderTop: `1px solid ${C.border}`, display: "flex", gap: "8px", padding: "12px 14px" }}>
        <textarea aria-label="Ask Buddy a story review question" disabled={isSending} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(input); } }} placeholder="Ask an evidence-bound story-review question…" rows={2} style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "7px", color: C.navy, flex: 1, fontFamily: "inherit", fontSize: "11px", lineHeight: 1.45, minHeight: "42px", outline: "none", padding: "8px 9px", resize: "vertical" }} value={input} />
        <button disabled={!input.trim() || isSending} style={{ background: C.purple, border: "none", borderRadius: "6px", color: "#ffffff", cursor: input.trim() && !isSending ? "pointer" : "not-allowed", fontSize: "10px", fontWeight: 900, opacity: input.trim() && !isSending ? 1 : 0.45, padding: "10px 12px", whiteSpace: "nowrap" }} type="submit">{isSending ? "Reviewing…" : "Ask Buddy"}</button>
      </form>
    </section>
  );
}

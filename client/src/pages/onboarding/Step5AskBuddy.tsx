// Step5AskBuddy.tsx
// Discovery Hub Step 5 — Research Existing Capabilities
// Guided Ask Buddy session — research existing functionality before documenting new requirements

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { markStepComplete } from "./OnboardingHub";

const SUGGESTED_QUESTIONS = [
  { category: "IMS", q: "What data does IMS receive from TDC, and what does IMS do with it?" },
  { category: "IMS", q: "What fields are in the TDC outbound contract to IMS?" },
  { category: "IMS", q: "What is the difference between filingId and deliveryId in the IMS payload?" },
  { category: "Roger", q: "How does Roger display provision data?" },
  { category: "Roger", q: "What APIs does Roger call to get provision information?" },
  { category: "TDC", q: "What business objects exist in TDC for Provision?" },
  { category: "TDC", q: "How does TDC compute the provision schedule?" },
  { category: "Provision", q: "What batches affect the Provision workstream?" },
  { category: "Provision", q: "What validations exist for provision data?" },
  { category: "State", q: "What state apportionment data is available from TDC?" },
  { category: "State", q: "What batches support State filing?" },
  { category: "Gateway", q: "How does the Gateway scope data for Provision vs State consumers?" },
];

const CATEGORY_COLORS: Record<string, string> = {
  IMS: "#7c3aed",
  Roger: "#0369a1",
  TDC: "#065f46",
  Provision: "#7c3aed",
  State: "#b45309",
  Gateway: "#1e3a5f",
};

type Message = { role: "user" | "assistant"; content: string };

export default function Step5AskBuddy() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 I'm Ask Buddy, your DCT capabilities research guide.\n\nBefore documenting any new requirements, use me to research what DCT already supports. I will first check whether an existing capability satisfies your business need, then identify the relevant Feature, Batch, APIs, and business objects.\n\nAsk me about a business need — or click a suggested question below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.askBuddy.chat.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (questionsAsked >= 3) setCanProceed(true);
  }, [questionsAsked]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setQuestionsAsked(prev => prev + 1);

    try {
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const result = await chatMutation.mutateAsync({
        messages: allMessages,
              discoveryPagePath: "/discovery/ims",
      });
      setMessages(prev => [...prev, { role: "assistant", content: result.text }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    markStepComplete("step5-ask-buddy");
    navigate("/onboarding/step6");
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Provision &amp; State Discovery Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 5 — Research Existing Capabilities</span>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 8px" }}>
        🤖 Research Existing Capabilities
      </h1>
      <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px", lineHeight: "1.6" }}>
        Use Ask Buddy to research existing DCT functionality <strong>before documenting new requirements</strong>.
        Ask at least <strong>3 questions</strong> about your business needs to unlock Step 6.
        Buddy will first check whether DCT already supports the need, then identify the relevant Feature, Batch, APIs, and business objects.
        {questionsAsked > 0 && (
          <span style={{ marginLeft: "8px", color: "#059669", fontWeight: 600 }}>
            {questionsAsked} / 3 questions asked{canProceed ? " ✓" : ""}
          </span>
        )}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

        {/* Chat panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Messages */}
          <div style={{
            height: "420px", overflowY: "auto", backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: "10px 10px 0 0",
            padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: "10px",
                  backgroundColor: msg.role === "user" ? "#1e3a5f" : "white",
                  color: msg.role === "user" ? "white" : "#1e293b",
                  border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                  fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "10px",
                  backgroundColor: "white", border: "1px solid #e2e8f0",
                  fontSize: "13px", color: "#64748b",
                }}>
                  Ask Buddy is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            display: "flex", gap: "8px",
            backgroundColor: "white", border: "1px solid #e2e8f0",
            borderTop: "none", borderRadius: "0 0 10px 10px",
            padding: "10px 12px",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about IMS, Roger, TDC, Provision, State..."
              style={{
                flex: 1, padding: "8px 12px", fontSize: "13px",
                border: "1px solid #e2e8f0", borderRadius: "6px",
                outline: "none", color: "#0f1623",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                padding: "8px 16px", fontSize: "13px", fontWeight: 700,
                backgroundColor: input.trim() && !isLoading ? "#1e3a5f" : "#94a3b8",
                color: "white", border: "none", borderRadius: "6px",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Suggested questions */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
            Suggested Questions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SUGGESTED_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sq.q)}
                disabled={isLoading}
                style={{
                  textAlign: "left", padding: "8px 10px", borderRadius: "7px",
                  border: "1px solid #e2e8f0", backgroundColor: "white",
                  cursor: isLoading ? "not-allowed" : "pointer", fontSize: "12px",
                  color: "#1e293b", lineHeight: "1.4",
                }}
              >
                <span style={{
                  fontSize: "10px", fontWeight: 700, color: CATEGORY_COLORS[sq.category] ?? "#64748b",
                  display: "block", marginBottom: "2px",
                }}>
                  {sq.category}
                </span>
                {sq.q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue */}
      <div style={{
        marginTop: "20px", padding: "14px 18px",
        backgroundColor: canProceed ? "#f0fdf4" : "#f8fafc",
        border: `1px solid ${canProceed ? "#86efac" : "#e2e8f0"}`,
        borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: "13px", color: canProceed ? "#065f46" : "#64748b" }}>
          {canProceed
            ? "✓ You've asked 3+ questions — you're ready to capture your Discovery Questions in Step 6."
            : `Ask ${Math.max(0, 3 - questionsAsked)} more question${3 - questionsAsked === 1 ? "" : "s"} to unlock Step 6.`}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/onboarding/step4")}
            style={{
              fontSize: "13px", fontWeight: 600, color: "#64748b",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canProceed}
            style={{
              fontSize: "13px", fontWeight: 700, color: "white",
              backgroundColor: canProceed ? "#059669" : "#94a3b8",
              border: "none", borderRadius: "7px", padding: "9px 20px",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            ✓ Continue to Step 6 — Discovery Questions →
          </button>
        </div>
      </div>
    </div>
  );
}

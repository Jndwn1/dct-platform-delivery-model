// DiscoveryAskBuddy.tsx
// Floating Ask Buddy button + inline chat panel for Discovery Center pages.
// Automatically injects the current page context into every Ask Buddy request.
// Usage: <DiscoveryAskBuddy pagePath="/discovery/roger-overview" pageTitle="Roger Overview" suggestedQuestions={[...]} />

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DiscoveryAskBuddyProps {
  pagePath: string;
  pageTitle: string;
  suggestedQuestions?: string[];
}

// Default suggested questions per page path
const DEFAULT_QUESTIONS: Record<string, string[]> = {
  "/discovery/ecosystem": [
    "What are the five platform components?",
    "What does PDC own vs TDC?",
    "How does data flow from ingestion to Roger?",
    "Which system owns tax decisions?",
  ],
  "/discovery/platform-responsibilities": [
    "What does TDC own that PDC does not?",
    "Can Roger write data to TDC?",
    "Who owns tax decisions?",
    "What are the cross-system boundary rules?",
  ],
  "/discovery/data-flow": [
    "What happens after a file is ingested?",
    "How does data move from PDC to TDC?",
    "What triggers the AI mapping step?",
    "When does data reach Roger?",
  ],
  "/discovery/simulation": [
    "What are all 32 steps in the simulation?",
    "Which steps involve TDC?",
    "Where does the AI mapping happen?",
    "What is the final simulation step?",
  ],
  "/discovery/integration-architecture": [
    "What are the six architecture layers?",
    "What sits in the AI layer?",
    "How does the Service Bus fit in?",
    "What protocols are used between layers?",
  ],
  "/discovery/ba-requirements": [
    "What are the 13 BA discovery questions?",
    "What governance questions are required?",
    "What API questions should a BA ask?",
    "What validation questions are needed?",
  ],
  "/discovery/checklist": [
    "What are the 13 checklist items?",
    "What must be true before a story is ADO-ready?",
    "What governance items are on the checklist?",
    "What does Definition of Done require?",
  ],
  "/discovery/dct-overview": [
    "What is DCT?",
    "What are the four governance gates?",
    "What is the batch delivery model?",
    "What is Schema Lock?",
  ],
  "/discovery/roger-overview": [
    "How does Roger save data?",
    "What APIs does Roger call?",
    "What TDC objects support Roger screens?",
    "What batches affect Roger?",
    "What validations exist in Roger?",
  ],
  "/discovery/gosystem": [
    "What does IMS do?",
    "How does data get to GoSystem?",
    "Does DCT connect directly to GoSystem?",
    "What return engines does IMS support?",
  ],
  "/discovery/glossary": [
    "What does PDC stand for?",
    "What is a ConfidenceBand?",
    "What is Schema Lock?",
    "What is Lineage Closure?",
  ],
  "/discovery/ba-story-builder": [
    "What makes a good DCT user story?",
    "What acceptance criteria are always required?",
    "When should I check Immutable?",
    "What is the Definition of Done for a DCT story?",
  ],
  "/discovery": [
    "Where do I start as a new BA?",
    "What pages are in the Discovery Center?",
    "How do I write my first story?",
    "What is the recommended BA workflow?",
  ],
};

export default function DiscoveryAskBuddy({ pagePath, pageTitle, suggestedQuestions }: DiscoveryAskBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { statuses, gates, piCompletion, lastUpdated } = useBatchStatus();

  const chatMutation = trpc.askBuddy.chat.useMutation();

  const questions = suggestedQuestions || DEFAULT_QUESTIONS[pagePath] || DEFAULT_QUESTIONS["/discovery"];

  // Build live snapshot for context injection
  const buildSnapshot = () => {
    const allKeys = Object.keys(statuses);
    const completedBatches = allKeys.filter(k => statuses[k as keyof typeof statuses] === "Complete");
    const activeBatches = allKeys.filter(k => ["In Progress", "In Dev", "MVP", "Stretch"].includes(statuses[k as keyof typeof statuses] ?? ""));
    const blockedBatches = allKeys.filter(k => statuses[k as keyof typeof statuses] === "Blocked");
    const plannedBatches = allKeys.filter(k => statuses[k as keyof typeof statuses] === "Not Started");
    return {
      asOf: lastUpdated ? new Date(lastUpdated).toISOString() : new Date().toISOString(),
      statuses: Object.fromEntries(allKeys.map(k => [k, statuses[k as keyof typeof statuses] ?? "Not Started"])),
      gates: { g1: gates.g1, g2: gates.g2, g3: gates.g3, g4: gates.g4 },
      piCompletion,
      completedBatches,
      activeBatches,
      blockedBatches,
      plannedBatches,
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: newMessages,
        discoveryPagePath: pagePath,
        liveSnapshot: buildSnapshot(),
      });
      setMessages(prev => [...prev, { role: "assistant", content: result.text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset conversation when page changes
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [pagePath]);

  return (
    <>
      {/* Floating Ask Buddy Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title={`Ask Buddy about ${pageTitle}`}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 1000,
            background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(13, 148, 136, 0.4)",
          }}
        >
          <span style={{ fontSize: "18px" }}>🤖</span>
          Ask Buddy
          <span style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: "10px",
            padding: "1px 7px",
            fontSize: "10px",
            fontWeight: 600,
          }}>
            {pageTitle}
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          width: "420px",
          maxHeight: "600px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1 }}>Ask Buddy</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", marginTop: "2px" }}>
                  Context: <strong style={{ color: "#fff" }}>{pageTitle}</strong>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Clear conversation"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "16px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Context badge */}
          <div style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #d1fae5",
            padding: "8px 14px",
            fontSize: "11px",
            color: "#065f46",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span>🧭</span>
            <span>
              Ask Buddy automatically knows you are viewing <strong>{pageTitle}</strong>. Ask anything about this page.
            </span>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            minHeight: "180px",
            maxHeight: "320px",
          }}>
            {messages.length === 0 ? (
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px", textAlign: "center" }}>
                  Try one of these questions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: 500,
                        lineHeight: "1.4",
                      }}
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <span style={{ fontSize: "16px", marginRight: "6px", flexShrink: 0, marginTop: "2px" }}>🤖</span>
                    )}
                    <div style={{
                      maxWidth: "85%",
                      background: msg.role === "user" ? "#0d9488" : "#f8fafc",
                      color: msg.role === "user" ? "#fff" : "#1e293b",
                      borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                    }}>
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🤖</span>
                    <div style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px 12px 12px 4px",
                      padding: "8px 14px",
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#0d9488",
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div style={{
            borderTop: "1px solid #e2e8f0",
            padding: "10px 12px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            background: "#fafafa",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${pageTitle}...`}
              style={{
                flex: 1,
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                outline: "none",
                color: "#1e293b",
                background: "#fff",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() && !isTyping ? "#0d9488" : "#e2e8f0",
                color: input.trim() && !isTyping ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              Send →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

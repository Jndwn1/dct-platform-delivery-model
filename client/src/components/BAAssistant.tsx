// BAAssistant — AI-powered BA Assistant for the Roger UI Data Availability panel.
//
// The assistant accepts:
//   • An optional ADO story link (parsed for story ID + title context)
//   • A free-text question from the BA
//
// It is grounded on the live ROGER_DATA_POINTS and SWAGGER_ENTRIES arrays passed
// as props, so every answer references real platform data — no hallucination.
//
// Suggested questions are surfaced as one-click chips to guide new users.

import { useState, useRef, useEffect } from "react";
import { useLLM, type LLMMessage } from "@/hooks/useLLM";
import { Bot, Send, Loader2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Link2, RotateCcw, Copy, Check } from "lucide-react";

// ── Types (mirror what BatchControlPanel exports) ─────────────────────────────

export interface RogerDataPointCtx {
  dataPoint: string;
  source: string;
  batch: string;
  availability: string;
  apiEndpoint: string;
  notes: string;
  owner: string;
  adoStories: { title: string; id: string }[];
}

export interface SwaggerEntryCtx {
  batch: string;
  endpoint: string;
  path: string;
  status: string;
  consumerGuide: string;
  notes: string;
}

interface BAAssistantProps {
  rogerDataPoints: RogerDataPointCtx[];
  swaggerEntries: SwaggerEntryCtx[];
}

// ── Suggested questions ───────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What API endpoints does DCT need to provide for 'Fetch client list for current user', and from which batch?",
  "Which data points are currently blocking Roger from going live?",
  "What is the availability status of the TDC Records API and which ADO stories cover it?",
  "Which batch delivers the ExceptionRecord API and what is its current status?",
  "What endpoints are In Progress for Batch 8 and what consumer guide gaps exist?",
  "Which data points require both PDC and TDC to deliver, and what is the dependency order?",
  "What is the difference between a Read Contract and a Write Contract in this platform?",
  "Which batches have additive-only contracts and what does that mean for Roger consumers?",
];

// ── System prompt builder ─────────────────────────────────────────────────────

function buildSystemPrompt(
  rogerDataPoints: RogerDataPointCtx[],
  swaggerEntries: SwaggerEntryCtx[]
): string {
  const dpSummary = rogerDataPoints
    .map(
      (d, i) =>
        `[DP${i + 1}] "${d.dataPoint}" | Source: ${d.source} | Batch: ${d.batch} | Availability: ${d.availability} | API: ${d.apiEndpoint} | Owner: ${d.owner} | Notes: ${d.notes} | ADO: ${d.adoStories.map((s) => (s.id ? `#${s.id} "${s.title}"` : s.title)).join("; ")}`
    )
    .join("\n");

  const swaggerSummary = swaggerEntries
    .map(
      (s) =>
        `[API] ${s.batch} | ${s.endpoint} | ${s.path} | Status: ${s.status} | ConsumerGuide: ${s.consumerGuide} | Notes: ${s.notes}`
    )
    .join("\n");

  return `You are a DCT Platform BA Assistant embedded in the DCT Gate Verification Dashboard.
Your role is to help Business Analysts (BAs) understand:
- Which DCT API endpoints are needed for a given Roger UI user story
- Which batch delivers those endpoints and their current status
- What governance constraints apply (additive-only, immutable, lineage, read vs write contract)
- What ADO stories are linked to each data point
- What gaps or blockers exist for Roger consumption

PLATFORM CONTEXT:
- PDC = Phoenix Data Consolidation (financial data, ingestion, entity registry)
- TDC = Tax Data Consolidation (tax decisions, mapping, eligibility, sign-off)
- Roger = the practitioner-facing UI that READS from TDC and PDC via published Read Contracts
- Roger is READ-ONLY. It never writes to PDC or TDC directly.
- Batches are delivered sequentially within a PI (Program Increment). Each batch has a gate.
- A Read Contract is only considered Published when all four gate conditions are met (Schema Lock, Invariant Lock, Contract Publication, Lineage Closure).
- Additive-Only contracts may never remove or rename fields once published.

ROGER DATA POINTS (live platform data):
${dpSummary}

SWAGGER / API ENTRIES (live platform data):
${swaggerSummary}

RESPONSE RULES:
1. Always ground your answer in the data above. If a data point or endpoint is not in the data, say so clearly.
2. When answering about a specific user story or feature, identify the matching data point(s) from the list above.
3. Always state: the batch, the API endpoint path, the current availability/status, and any known gaps.
4. If an ADO story ID is available, mention it as "#ID".
5. Format your response with clear sections using markdown-style bold headers (e.g. **API Endpoints**, **Batch**, **Status**, **Gaps**).
6. Keep answers concise but complete. Target 200–400 words.
7. If the user provides an ADO story link, extract the story ID and use it to find matching entries in the data above.
8. Never fabricate endpoint paths, batch numbers, or ADO IDs. If uncertain, say "not found in current platform data."`;
}

// ── ADO link parser ───────────────────────────────────────────────────────────

function parseAdoLink(link: string): { id: string; url: string } | null {
  if (!link.trim()) return null;
  // Matches: https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/1234567
  const m = link.match(/workitems\/edit\/(\d+)/i);
  if (m) return { id: m[1], url: link.trim() };
  // Plain numeric ID
  if (/^\d{5,8}$/.test(link.trim())) return { id: link.trim(), url: `https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${link.trim()}` };
  return null;
}

// ── Chat message type ─────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BAAssistant({ rogerDataPoints, swaggerEntries }: BAAssistantProps) {
  const { ask, loading, error } = useLLM();
  const [expanded, setExpanded] = useState(true);
  const [adoLink, setAdoLink] = useState("");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const systemPrompt = buildSystemPrompt(rogerDataPoints, swaggerEntries);

  const buildMessages = (q: string): LLMMessage[] => {
    const parsed = parseAdoLink(adoLink);
    const adoContext = parsed
      ? `\n\nThe BA has provided ADO Story #${parsed.id} (${parsed.url}). Please reference this story ID when searching the platform data above.`
      : "";

    const msgs: LLMMessage[] = [
      { role: "system", content: systemPrompt + adoContext },
    ];

    // Include prior conversation for context (last 6 turns)
    const recent = history.slice(-6);
    for (const h of recent) {
      msgs.push({ role: h.role, content: h.content });
    }

    msgs.push({ role: "user", content: q });
    return msgs;
  };

  const submit = async (q: string) => {
    if (!q.trim() || loading) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((h) => [...h, userMsg]);
    setQuestion("");

    try {
      const msgs = buildMessages(q.trim());
      const answer = await ask(msgs);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((h) => [...h, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        role: "assistant",
        content: "⚠️ The assistant encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((h) => [...h, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(question);
    }
  };

  const copyMessage = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const parsedAdo = parseAdoLink(adoLink);

  // ── Render markdown-ish bold in assistant messages ────────────────────────
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold headers: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j} className="font-semibold text-slate-900">
                {p.slice(2, -2)}
              </strong>
            ) : (
              <span key={j}>{p}</span>
            )
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#003865] to-[#1a5a8a] text-white hover:from-[#004a80] hover:to-[#1e6fa3] transition-all"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-200" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold flex items-center gap-2">
              BA Assistant
              <span className="text-xs font-normal bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI-Powered
              </span>
            </div>
            <div className="text-xs text-blue-300 font-normal">
              Drop an ADO story link · Ask about API endpoints, batches, and governance
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <span className="text-xs text-blue-300 bg-blue-800/40 px-2 py-0.5 rounded-full">
              {Math.ceil(history.length / 2)} exchange{Math.ceil(history.length / 2) !== 1 ? "s" : ""}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-blue-300" /> : <ChevronDown className="w-4 h-4 text-blue-300" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">

          {/* ── ADO Link Input ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              ADO Story Link (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={adoLink}
                onChange={(e) => setAdoLink(e.target.value)}
                placeholder="https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/1234567  or just the story ID"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 pr-24 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-mono bg-slate-50"
              />
              {parsedAdo && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <a
                    href={parsedAdo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{parsedAdo.id} ↗
                  </a>
                </div>
              )}
            </div>
            {parsedAdo && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Story #{parsedAdo.id} linked — the assistant will reference this ID when searching platform data.
              </div>
            )}
          </div>

          {/* ── Suggested Questions ── */}
          {history.length === 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested Questions</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => submit(q)}
                    disabled={loading}
                    className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-400 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Chat History ── */}
          {history.length > 0 && (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[#003865] text-white"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}>
                    {msg.role === "user" ? "BA" : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#003865] text-white rounded-tr-sm"
                        : "bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm"
                    }`}>
                      {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                    </div>
                    <div className={`flex items-center gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-xs text-slate-400">{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyMessage(idx, msg.content)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copy response"
                        >
                          {copied === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-500">Searching platform data…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Input ── */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Ask about API endpoints, batches, governance, ADO stories… (Enter to send, Shift+Enter for new line)"
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none bg-slate-50 leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => submit(question)}
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 w-7 h-7 rounded-lg bg-[#003865] text-white flex items-center justify-center hover:bg-[#004a80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send (Enter)"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Grounded on {rogerDataPoints.length} data points · {swaggerEntries.length} API endpoints
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear chat
                </button>
              )}
            </div>
          </div>

          {/* ── Suggested questions (after first exchange) ── */}
          {history.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up questions</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => submit(q)}
                    disabled={loading}
                    className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-50"
                  >
                    {q.length > 60 ? q.slice(0, 57) + "…" : q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

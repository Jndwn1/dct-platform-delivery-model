// BAAssistant — AI-powered BA Assistant for the Roger UI Data Availability panel.
//
// Features:
//   • ADO story link input — parsed for story ID, linked to platform data
//   • Free-text question input with multi-turn conversation history
//   • Suggested question chips for common BA queries
//   • Save to ADO — formats each assistant response as a clean ADO comment block
//   • Gap Report mode — one-click summary of all non-Available data points
//     with blocking ADO stories, formatted as a copy-ready PO update
//
// Grounded on live ROGER_DATA_POINTS and SWAGGER_ENTRIES — no hallucination.

import { useState, useRef, useEffect, useCallback } from "react";
import { useLLM, type LLMMessage } from "@/hooks/useLLM";
import {
  Bot, Send, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, Link2, RotateCcw, Copy, Check, ClipboardList,
  FileWarning, ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Gap Report prompt builder ─────────────────────────────────────────────────

function buildGapReportPrompt(rogerDataPoints: RogerDataPointCtx[]): string {
  const gaps = rogerDataPoints.filter((d) => d.availability !== "Available");
  const gapLines = gaps
    .map(
      (d) =>
        `- "${d.dataPoint}" | Batch: ${d.batch} | Status: ${d.availability} | Owner: ${d.owner} | ADO: ${d.adoStories.map((s) => (s.id ? `#${s.id}` : "—")).join(", ")} | Notes: ${d.notes}`
    )
    .join("\n");

  return `Generate a copy-ready Gap Report for the PO (Stephane) summarizing all Roger UI data points that are NOT yet Available.

NON-AVAILABLE DATA POINTS (${gaps.length} total):
${gapLines}

FORMAT REQUIREMENTS:
- Start with a one-paragraph executive summary (2–3 sentences) stating how many gaps exist and the overall risk to Roger going live.
- Then produce a table with columns: Data Point | Batch | Status | Owner | Blocking ADO Stories | Action Required
- After the table, add a "Priority Actions" section listing the top 3 items that must be resolved first, with the ADO story IDs and recommended owner.
- End with a "Next Steps" line suitable for a Teams or email update to Stephane.
- Use plain text formatting (no markdown code blocks). Use | for table columns. Keep it professional and concise.
- Do NOT fabricate any data. Use only the data provided above.`;
}

// ── ADO comment formatter ─────────────────────────────────────────────────────

function formatAsAdoComment(
  answer: string,
  question: string,
  adoId: string | null,
  timestamp: string
): string {
  const storyRef = adoId ? `Story #${adoId}` : "DCT Platform";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return `=== DCT Platform BA Assistant — ${date} ===

Reference: ${storyRef}
Question: ${question}

--- Platform Analysis ---
${answer}

--- Source ---
Generated by DCT Gate Verification Dashboard · BA Assistant
Grounded on live ROGER_DATA_POINTS and SWAGGER_ENTRIES
Timestamp: ${timestamp}
`;
}

// ── ADO link parser ───────────────────────────────────────────────────────────

function parseAdoLink(link: string): { id: string; url: string } | null {
  if (!link.trim()) return null;
  const m = link.match(/workitems\/edit\/(\d+)/i);
  if (m) return { id: m[1], url: link.trim() };
  if (/^\d{5,8}$/.test(link.trim()))
    return { id: link.trim(), url: `https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${link.trim()}` };
  return null;
}

// ── Chat message type ─────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  /** The user question that prompted this assistant message (for ADO formatting) */
  question?: string;
  /** Whether this message is a Gap Report */
  isGapReport?: boolean;
}

// ── Copy state tracker ────────────────────────────────────────────────────────

type CopyAction = "copy" | "ado" | "gap";

// ── Component ─────────────────────────────────────────────────────────────────

export function BAAssistant({ rogerDataPoints, swaggerEntries }: BAAssistantProps) {
  const { ask, loading, error } = useLLM();
  const [expanded, setExpanded] = useState(true);
  const [adoLink, setAdoLink] = useState("");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [copiedState, setCopiedState] = useState<{ idx: number; action: CopyAction } | null>(null);
  const [gapReportLoading, setGapReportLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const systemPrompt = buildSystemPrompt(rogerDataPoints, swaggerEntries);
  const parsedAdo = parseAdoLink(adoLink);

  const buildMessages = useCallback(
    (q: string): LLMMessage[] => {
      const adoContext = parsedAdo
        ? `\n\nThe BA has provided ADO Story #${parsedAdo.id} (${parsedAdo.url}). Please reference this story ID when searching the platform data above.`
        : "";
      const msgs: LLMMessage[] = [
        { role: "system", content: systemPrompt + adoContext },
      ];
      const recent = history.slice(-6);
      for (const h of recent) {
        msgs.push({ role: h.role, content: h.content });
      }
      msgs.push({ role: "user", content: q });
      return msgs;
    },
    [systemPrompt, parsedAdo, history]
  );

  const addAssistantMessage = (content: string, question?: string, isGapReport?: boolean) => {
    const msg: ChatMessage = {
      role: "assistant",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      question,
      isGapReport,
    };
    setHistory((h) => [...h, msg]);
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
      addAssistantMessage(answer, q.trim());
    } catch {
      addAssistantMessage("⚠️ The assistant encountered an error. Please try again.");
    }
  };

  // ── Gap Report ──────────────────────────────────────────────────────────────
  const runGapReport = async () => {
    if (gapReportLoading || loading) return;
    setGapReportLoading(true);
    const userMsg: ChatMessage = {
      role: "user",
      content: "📊 Generate Gap Report — all non-Available data points with blocking ADO stories",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((h) => [...h, userMsg]);
    try {
      const gapPrompt = buildGapReportPrompt(rogerDataPoints);
      const msgs: LLMMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: gapPrompt },
      ];
      const answer = await ask(msgs);
      addAssistantMessage(answer, "Gap Report", true);
    } catch {
      addAssistantMessage("⚠️ Gap Report generation failed. Please try again.");
    } finally {
      setGapReportLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(question);
    }
  };

  // ── Copy helpers ────────────────────────────────────────────────────────────
  const triggerCopy = (idx: number, action: CopyAction, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState({ idx, action });
      setTimeout(() => setCopiedState(null), 2500);
    });
  };

  const isCopied = (idx: number, action: CopyAction) =>
    copiedState?.idx === idx && copiedState?.action === action;

  // ── Render markdown bold ────────────────────────────────────────────────────
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
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

  // ── Gap count badge ─────────────────────────────────────────────────────────
  const gapCount = rogerDataPoints.filter((d) => d.availability !== "Available").length;

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
              Drop an ADO story link · Ask about API endpoints, batches, and governance · Gap Report
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
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <a
                    href={parsedAdo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{parsedAdo.id} <ExternalLink className="w-2.5 h-2.5" />
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

          {/* ── Gap Report Banner ── */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 gap-4">
            <div className="flex items-start gap-2.5">
              <FileWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-800">Gap Report Mode</div>
                <div className="text-xs text-amber-700 mt-0.5">
                  {gapCount} data point{gapCount !== 1 ? "s" : ""} not yet Available for Roger.
                  Generate a copy-ready PO summary with blocking ADO stories and priority actions.
                </div>
              </div>
            </div>
            <button
              onClick={runGapReport}
              disabled={gapReportLoading || loading}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-amber-600 text-white px-3.5 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {gapReportLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
              ) : (
                <><ClipboardList className="w-3.5 h-3.5" /> Generate Gap Report</>
              )}
            </button>
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
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[#003865] text-white"
                      : msg.isGapReport
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  }`}>
                    {msg.role === "user" ? "BA" : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 max-w-[87%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {/* Gap Report label */}
                    {msg.isGapReport && msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 self-start">
                        <FileWarning className="w-3 h-3" /> Gap Report
                      </div>
                    )}

                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#003865] text-white rounded-tr-sm"
                        : msg.isGapReport
                          ? "bg-amber-50 border border-amber-200 text-slate-700 rounded-tl-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm"
                    }`}>
                      {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                    </div>

                    {/* Action row for assistant messages */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400">{msg.timestamp}</span>

                        {/* Copy raw text */}
                        <button
                          onClick={() => triggerCopy(idx, "copy", msg.content)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copy response text"
                        >
                          {isCopied(idx, "copy")
                            ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></>
                            : <><Copy className="w-3 h-3" /><span>Copy</span></>
                          }
                        </button>

                        {/* Save to ADO */}
                        <button
                          onClick={() => {
                            const adoText = formatAsAdoComment(
                              msg.content,
                              msg.question ?? (msg.isGapReport ? "Gap Report" : "BA Assistant Query"),
                              parsedAdo?.id ?? null,
                              msg.timestamp
                            );
                            triggerCopy(idx, "ado", adoText);
                          }}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                            isCopied(idx, "ado")
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                          }`}
                          title="Format as ADO comment and copy to clipboard"
                        >
                          {isCopied(idx, "ado") ? (
                            <><Check className="w-3 h-3" /> Saved to ADO</>
                          ) : (
                            <><ClipboardList className="w-3 h-3" /> Save to ADO</>
                          )}
                        </button>

                        {/* Gap Report: also offer a plain copy for email */}
                        {msg.isGapReport && (
                          <button
                            onClick={() => triggerCopy(idx, "gap", msg.content)}
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                              isCopied(idx, "gap")
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400"
                            }`}
                            title="Copy Gap Report for email or Teams"
                          >
                            {isCopied(idx, "gap") ? (
                              <><Check className="w-3 h-3" /> Copied for email</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy for email / Teams</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {(loading || gapReportLoading) && (
                <div className="flex gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    gapReportLoading
                      ? "bg-gradient-to-br from-amber-500 to-orange-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-500">
                      {gapReportLoading ? "Building gap report from platform data…" : "Searching platform data…"}
                    </span>
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
                disabled={loading || gapReportLoading}
              />
              <button
                onClick={() => submit(question)}
                disabled={loading || gapReportLoading || !question.trim()}
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
                Grounded on {rogerDataPoints.length} data points · {swaggerEntries.length} API endpoints · {gapCount} gaps
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

          {/* ── Follow-up chips (after first exchange) ── */}
          {history.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up questions</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => submit(q)}
                    disabled={loading || gapReportLoading}
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

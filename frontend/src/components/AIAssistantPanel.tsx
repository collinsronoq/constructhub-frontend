import { useEffect, useRef, useState, type ReactNode } from "react";
import { chat, chatStream, createThread, getPrompts, getThreadMessages } from "../services/api/ai";
import type { ChatContext, ChatResponse, PromptTemplate } from "../services/api/ai";
import { useAuth } from "../hooks/auth/useAuth";

interface Message {
  sender: "user" | "ai";
  text: string;
  cards?: any[];
  citations?: any[];
  nextActions?: any[];
  streaming?: boolean;
  loading?: boolean;
  status?: string;
}

interface AIAssistantPanelProps {
  onClose: () => void;
  persistedThreadId?: string | null;
  onThreadIdChange?: (threadId: string | null) => void;
  pendingAction?: PendingAiAction | null;
  onActionConsumed?: (requestKey: string) => void;
}

interface PendingAiAction {
  requestKey: string;
  message: string;
  promptId?: string;
  context?: ChatContext;
  statusText?: string;
  threadProjectId?: string | null;
  threadTitle?: string | null;
}

interface SendMessageOptions {
  context?: ChatContext;
  statusText?: string;
  threadProjectId?: string | null;
  threadTitle?: string | null;
}

const GREETING: Message = {
  sender: "ai",
  text: "Hi there, I'm your ConstructHub Assistant! How can I help you today?",
};

const normalizeAssistantMessage = (assistant?: ChatResponse["assistant"]): Message => ({
  sender: "ai",
  text: assistant?.text || "I couldn't generate a response.",
  cards: assistant?.cards || [],
  citations: assistant?.citations || [],
  nextActions: assistant?.next_actions || [],
});

const UUID_REGEX_GLOBAL = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const UUID_REGEX_SINGLE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

const sanitizeAssistantText = (text: string): string => {
  const safeText = String(text || "");
  const filtered = safeText
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => !/^[-*]?\s*Estimate ID\s*:/i.test(line.trim()))
    .join("\n");
  return filtered.replace(UUID_REGEX_GLOBAL, "[hidden-id]");
};

const formatCitationLabel = (citation: any): string => {
  const rawId = String(citation?.id || "").trim();
  const citationType = String(citation?.type || "source").trim().toLowerCase();
  if (!rawId) return citationType === "estimate" ? "Current estimate data" : "source";
  if (UUID_REGEX_SINGLE.test(rawId)) {
    return citationType === "estimate" ? "Current estimate data" : `${citationType} reference`;
  }
  return rawId;
};

const renderInlineBold = (value: string): ReactNode[] => {
  const parts = value.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map((part, idx) => {
    const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;
    if (isBold) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
};

const renderStructuredText = (text: string): ReactNode[] => {
  const lines = text.replace(/\r/g, "").split("\n");
  const nodes: ReactNode[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const raw = lines[idx] || "";
    const trimmed = raw.trim();

    if (!trimmed) {
      idx += 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      const heading = trimmed.replace(/^#{1,3}\s+/, "");
      nodes.push(
        <h4 key={`h-${idx}`} className="font-semibold text-sm">
          {renderInlineBold(heading)}
        </h4>
      );
      idx += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (idx < lines.length && /^[-*]\s+/.test((lines[idx] || "").trim())) {
        items.push((lines[idx] || "").trim().replace(/^[-*]\s+/, ""));
        idx += 1;
      }
      nodes.push(
        <ul key={`ul-${idx}`} className="list-disc pl-5 space-y-1">
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{renderInlineBold(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (idx < lines.length && /^\d+\.\s+/.test((lines[idx] || "").trim())) {
        items.push((lines[idx] || "").trim().replace(/^\d+\.\s+/, ""));
        idx += 1;
      }
      nodes.push(
        <ol key={`ol-${idx}`} className="list-decimal pl-5 space-y-1">
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{renderInlineBold(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    nodes.push(
      <p key={`p-${idx}`} className="leading-relaxed whitespace-pre-wrap">
        {renderInlineBold(trimmed)}
      </p>
    );
    idx += 1;
  }

  if (nodes.length === 0) {
    nodes.push(
      <p key="p-fallback" className="leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return nodes;
};

const TypingIndicator: React.FC<{ status?: string }> = ({ status }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
    <span>{status || "Thinking..."}</span>
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
    </span>
  </div>
);

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  persistedThreadId = null,
  onThreadIdChange,
  pendingAction = null,
  onActionConsumed,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [threadId, setThreadId] = useState<string | null>(persistedThreadId);
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const suppressNextHistoryHydrationRef = useRef(false);
  const consumedActionKeyRef = useRef<string | null>(null);
  const historyHydrationVersionRef = useRef(0);

  useEffect(() => {
    setThreadId(persistedThreadId || null);
  }, [persistedThreadId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const res = await getPrompts(user?.role);
        setPrompts(res);
      } catch {
        setPrompts([]);
      }
    };
    loadPrompts();
  }, [user?.role]);

  useEffect(() => {
    if (!threadId) return;

    // When a thread is created inside sendMessage(), avoid immediately
    // replacing optimistic first-turn local state with a fresh history fetch.
    if (suppressNextHistoryHydrationRef.current) {
      suppressNextHistoryHydrationRef.current = false;
      return;
    }

    let cancelled = false;
    const hydrationVersion = historyHydrationVersionRef.current;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await getThreadMessages(threadId, 50);
        if (cancelled || hydrationVersion !== historyHydrationVersionRef.current) return;
        const restoredRaw = [...(res.messages || [])].filter((m) => m.role === "user" || m.role === "assistant");
        const first = restoredRaw[0];
        const last = restoredRaw[restoredRaw.length - 1];
        const firstTs = Date.parse(first?.created_at || "");
        const lastTs = Date.parse(last?.created_at || "");
        const sameTimestamp = !!first && !!last && (first.created_at || "") === (last.created_at || "");
        const clearlyNewestFirst =
          (!Number.isNaN(firstTs) && !Number.isNaN(lastTs) && firstTs > lastTs) ||
          (sameTimestamp && first?.role === "assistant" && last?.role === "user");
        const ordered = clearlyNewestFirst ? [...restoredRaw].reverse() : restoredRaw;

        const restored = ordered.map((m) => ({
            sender: m.role === "user" ? "user" : "ai",
            text: m.text || "",
            cards: m.cards || [],
          })) as Message[];
        if (hydrationVersion !== historyHydrationVersionRef.current) return;
        setMessages(restored.length > 0 ? restored : [GREETING]);
      } catch {
        if (!cancelled && hydrationVersion === historyHydrationVersionRef.current) {
          setMessages((prev) => (prev.length > 0 ? prev : [GREETING]));
        }
      } finally {
        if (!cancelled && hydrationVersion === historyHydrationVersionRef.current) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const appendMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const ensureLoadingMessage = (statusText: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && (last.loading || last.streaming)) {
        next[next.length - 1] = { ...last, loading: true, streaming: false, status: statusText };
        return next;
      }
      next.push({ sender: "ai", text: "", loading: true, status: statusText });
      return next;
    });
  };

  const setLoadingStatus = (statusText: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && (last.loading || last.streaming)) {
        next[next.length - 1] = { ...last, status: statusText };
        return next;
      }
      next.push({ sender: "ai", text: "", loading: true, status: statusText });
      return next;
    });
  };

  const pushStreamDelta = (delta: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && last.loading) {
        next[next.length - 1] = { sender: "ai", text: delta, streaming: true, loading: false };
        return next;
      }
      if (last && last.sender === "ai" && last.streaming) {
        next[next.length - 1] = { ...last, text: `${last.text}${delta}` };
        return next;
      }
      next.push({ sender: "ai", text: delta, streaming: true });
      return next;
    });
  };

  const finalizeAssistantMessage = (finalMessage: Message) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && (last.streaming || last.loading || !last.text.trim())) {
        next[next.length - 1] = { ...finalMessage, streaming: false, loading: false, status: undefined };
        return next;
      }
      next.push({ ...finalMessage, streaming: false, loading: false, status: undefined });
      return next;
    });
  };

  const sendMessage = async (text: string, promptId?: string, options?: SendMessageOptions) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Invalidate any in-flight history hydration so it cannot overwrite
    // the active turn with older persisted messages.
    historyHydrationVersionRef.current += 1;
    setHistoryLoading(false);
    setSending(true);
    setError(null);

    appendMessage({ sender: "user", text: trimmed });
    ensureLoadingMessage(options?.statusText || "Thinking...");
    let activeThreadId = threadId;

    try {
      if (!activeThreadId) {
        const thread = await createThread({
          project_id: options?.threadProjectId ?? options?.context?.project_id ?? null,
          title: options?.threadTitle || "AI Chat",
        });
        activeThreadId = thread.thread_id;
        suppressNextHistoryHydrationRef.current = true;
        setThreadId(activeThreadId);
        onThreadIdChange?.(activeThreadId);
      }

      const streamPayload = {
        thread_id: activeThreadId,
        message: trimmed,
        context: options?.context,
        response_mode: "structured" as const,
        prompt_id: promptId,
      };

      let gotDone = false;
      await chatStream(streamPayload, {
        onStatus: (message, mode) => {
          if (mode === "non_stream_tool") {
            setLoadingStatus(message || "Checking project data...");
            return;
          }
          setLoadingStatus(message || "Thinking...");
        },
        onFallback: (mode) => {
          if (mode === "non_stream_tool") {
            setLoadingStatus("Checking project data...");
            return;
          }
          setLoadingStatus("Analyzing your request...");
        },
        onChunk: (delta) => {
          pushStreamDelta(delta);
        },
        onDone: (streamResp) => {
          gotDone = true;
          const normalized = normalizeAssistantMessage(streamResp?.assistant);
          finalizeAssistantMessage(normalized);
        },
        onError: (detail) => {
          throw new Error(detail || "AI chat stream failed");
        },
      });

      if (!gotDone) {
        throw new Error("AI chat stream ended before a final response.");
      }
    } catch (_streamErr: any) {
      setLoadingStatus("Retrying without live stream...");
      if (!activeThreadId) {
        const msg = "AI chat failed";
        setError(msg);
        finalizeAssistantMessage({ sender: "ai", text: msg });
        setSending(false);
        setInput("");
        return;
      }
      try {
        const resp = await chat({
          thread_id: activeThreadId || "",
          message: trimmed,
          context: options?.context,
          response_mode: "structured",
          prompt_id: promptId,
        });
        finalizeAssistantMessage(normalizeAssistantMessage(resp.assistant));
      } catch (err: any) {
        const msg = err?.detail?.detail || err?.message || "AI chat failed";
        setError(msg);
        finalizeAssistantMessage({ sender: "ai", text: msg });
      }
    } finally {
      setSending(false);
      setInput("");
    }
  };

  const handleSend = () => sendMessage(input);

  useEffect(() => {
    if (!pendingAction) return;
    if (sending) return;
    if (consumedActionKeyRef.current === pendingAction.requestKey) return;

    consumedActionKeyRef.current = pendingAction.requestKey;
    onActionConsumed?.(pendingAction.requestKey);

    void sendMessage(pendingAction.message, pendingAction.promptId, {
      context: pendingAction.context,
      statusText: pendingAction.statusText || "Summarizing estimate...",
      threadProjectId: pendingAction.threadProjectId,
      threadTitle: pendingAction.threadTitle,
    });
  }, [pendingAction, sending, onActionConsumed, sendMessage]);

  return (
    <div className="fixed right-0 top-16 bottom-0 w-full md:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">ConstructHub AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x-icon lucide-x w-4 h-4 md:w-5 md:h-5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {prompts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => sendMessage(p.template, p.id)}
                disabled={sending}
                className="px-3 py-2 bg-emerald-50 dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        {historyLoading && <div className="text-xs text-gray-500">Loading conversation...</div>}

        {messages.map((msg, index) => {
          const displayText = msg.sender === "ai" ? sanitizeAssistantText(msg.text) : msg.text;
          const citationLabels = Array.from(
            new Set((msg.citations || []).slice(0, 3).map((c: any) => formatCitationLabel(c)))
          );
          return (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600"
                }`}
              >
                {msg.loading ? (
                  <TypingIndicator status={msg.status} />
                ) : (
                  <div className="space-y-2">{renderStructuredText(displayText)}</div>
                )}

                {msg.sender === "ai" && (msg.cards?.length || msg.citations?.length || msg.nextActions?.length) ? (
                  <div className="mt-2 space-y-2 text-xs">
                    {msg.cards?.length ? (
                      <div className="space-y-2">
                        {(msg.cards || []).slice(0, 2).map((card: any, idx: number) => (
                          <div key={idx} className="rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/60 p-2">
                            <div className="font-semibold text-gray-800 dark:text-gray-100">{card?.title || "Card"}</div>
                            {card?.subtitle ? <div className="opacity-80 mt-0.5">{card.subtitle}</div> : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {citationLabels.length ? (
                      <div className="opacity-80 border-t border-gray-300/70 dark:border-gray-600 pt-2">
                        Sources: {citationLabels.join(", ")}
                      </div>
                    ) : null}
                    {msg.nextActions?.length ? (
                      <div className="opacity-90 border-t border-gray-300/70 dark:border-gray-600 pt-2">
                        Next: {(msg.nextActions || []).slice(0, 2).map((a: any) => a?.label || "Action").join(" | ")}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6-6m6 6l-6 6" />
          </svg>
        </button>
      </div>
      {error && <div className="px-4 pb-3 text-xs text-red-600">{error}</div>}
    </div>
  );
};

export default AIAssistantPanel;

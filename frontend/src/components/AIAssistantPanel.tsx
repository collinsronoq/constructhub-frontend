import { useEffect, useRef, useState } from "react";
import { chat, chatStream, createThread, getPrompts, getThreadMessages } from "../services/api/ai";
import type { ChatResponse, PromptTemplate } from "../services/api/ai";
import { useAuth } from "../hooks/auth/useAuth";

interface Message {
  sender: "user" | "ai";
  text: string;
  cards?: any[];
  citations?: any[];
  nextActions?: any[];
  streaming?: boolean;
}

interface AIAssistantPanelProps {
  onClose: () => void;
  persistedThreadId?: string | null;
  onThreadIdChange?: (threadId: string | null) => void;
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

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  persistedThreadId = null,
  onThreadIdChange,
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

    let cancelled = false;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await getThreadMessages(threadId, 50);
        if (cancelled) return;
        const restored = (res.messages || [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            sender: m.role === "user" ? "user" : "ai",
            text: m.text || "",
            cards: m.cards || [],
          })) as Message[];
        setMessages(restored.length > 0 ? restored : [GREETING]);
      } catch {
        if (!cancelled) {
          setMessages((prev) => (prev.length > 0 ? prev : [GREETING]));
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
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

  const pushStreamDelta = (delta: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && last.streaming) {
        next[next.length - 1] = { ...last, text: `${last.text}${delta}` };
        return next;
      }
      next.push({ sender: "ai", text: delta, streaming: true });
      return next;
    });
  };

  const finalizeStreamMessage = (finalMessage: Message) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.sender === "ai" && last.streaming) {
        next[next.length - 1] = { ...finalMessage, streaming: false };
        return next;
      }
      next.push({ ...finalMessage, streaming: false });
      return next;
    });
  };

  const clearStreamingFlags = () => {
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  };

  const sendMessage = async (text: string, promptId?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);

    appendMessage({ sender: "user", text: trimmed });
    let activeThreadId = threadId;

    try {
      if (!activeThreadId) {
        const thread = await createThread({ project_id: null, title: "AI Chat" });
        activeThreadId = thread.thread_id;
        setThreadId(activeThreadId);
        onThreadIdChange?.(activeThreadId);
      }

      const streamPayload = {
        thread_id: activeThreadId,
        message: trimmed,
        response_mode: "structured" as const,
        prompt_id: promptId,
      };

      let gotDone = false;
      let gotChunk = false;
      await chatStream(streamPayload, {
        onChunk: (delta) => {
          gotChunk = true;
          pushStreamDelta(delta);
        },
        onDone: (streamResp) => {
          gotDone = true;
          const normalized = normalizeAssistantMessage(streamResp?.assistant);
          if (gotChunk) {
            finalizeStreamMessage(normalized);
          } else {
            appendMessage(normalized);
          }
        },
        onError: (detail) => {
          throw new Error(detail || "AI chat stream failed");
        },
      });

      if (!gotDone) {
        throw new Error("AI chat stream ended before a final response.");
      }
    } catch (_streamErr: any) {
      clearStreamingFlags();
      if (!activeThreadId) {
        const msg = "AI chat failed";
        setError(msg);
        appendMessage({ sender: "ai", text: msg });
        setSending(false);
        setInput("");
        return;
      }
      try {
        const resp = await chat({
          thread_id: activeThreadId || "",
          message: trimmed,
          response_mode: "structured",
          prompt_id: promptId,
        });
        appendMessage(normalizeAssistantMessage(resp.assistant));
      } catch (err: any) {
        const msg = err?.detail?.detail || err?.message || "AI chat failed";
        setError(msg);
        appendMessage({ sender: "ai", text: msg });
      }
    } finally {
      setSending(false);
      setInput("");
    }
  };

  const handleSend = () => sendMessage(input);

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
                className="px-3 py-2 bg-emerald-50 dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-700 transition"
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        {historyLoading && <div className="text-xs text-gray-500">Loading conversation...</div>}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              <div>{msg.text}</div>

              {msg.sender === "ai" && (msg.cards?.length || msg.citations?.length || msg.nextActions?.length) ? (
                <div className="mt-2 space-y-2 text-xs">
                  {msg.cards?.length ? (
                    <div>
                      {(msg.cards || []).slice(0, 2).map((card: any, idx: number) => (
                        <div key={idx} className="rounded border border-gray-300 dark:border-gray-600 p-2">
                          <div className="font-semibold">{card?.title || "Card"}</div>
                          {card?.subtitle ? <div className="opacity-80">{card.subtitle}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {msg.citations?.length ? (
                    <div className="opacity-80">
                      Sources: {(msg.citations || []).slice(0, 3).map((c: any) => c?.id || "source").join(", ")}
                    </div>
                  ) : null}
                  {msg.nextActions?.length ? (
                    <div className="opacity-90">
                      Next: {(msg.nextActions || []).slice(0, 2).map((a: any) => a?.label || "Action").join(" • ")}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}
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

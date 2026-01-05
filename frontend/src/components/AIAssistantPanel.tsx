import { useState, useRef, useEffect } from "react";
import { chat, createThread, getPrompts } from "../services/api/ai";
import type { PromptTemplate } from "../services/api/ai";
import { useAuth } from "../hooks/auth/useAuth";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface AIAssistantPanelProps {
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi there, I'm your ConstructHub Assistant! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

  const appendMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const sendMessage = async (text: string, promptId?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);

    appendMessage({ sender: "user", text: trimmed });

    try {
      let tid = threadId;
      if (!tid) {
        const thread = await createThread({ project_id: null, title: "AI Chat" });
        tid = thread.thread_id;
        setThreadId(tid);
      }

      const resp = await chat({
        thread_id: tid,
        message: trimmed,
        response_mode: "structured",
        prompt_id: promptId,
      });

      appendMessage({ sender: "ai", text: resp.assistant?.text || "I couldn't generate a response." });
    } catch (err: any) {
      const msg = err?.detail?.detail || err?.message || "AI chat failed";
      setError(msg);
      appendMessage({ sender: "ai", text: msg });
    } finally {
      setSending(false);
      setInput("");
    }
  };

  const handleSend = () => sendMessage(input);

  return (
    <div className="fixed right-0 top-16 bottom-0 w-full md:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          ConstructHub AI Assistant
        </h2>
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

      {/* Chat Body */}
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
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[75%] text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Section */}
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

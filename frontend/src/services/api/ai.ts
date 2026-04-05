import { API_BASE_URL, apiFetch, getAccessToken } from "./client";

export interface CreateThreadRequest {
  project_id?: string | null;
  title?: string | null;
}

export interface ThreadResponse {
  thread_id: string;
  title: string;
  project_id?: string | null;
  created_at: string;
}

export interface ChatContext {
  project_id?: string | null;
  location?: string | null;
  role?: string | null;
  budget_kes?: number | null;
}

export interface ChatRequest {
  thread_id: string;
  message: string;
  context?: ChatContext;
  response_mode?: "structured" | "text";
  client_trace_id?: string | null;
  prompt_id?: string;
}

export interface ChatResponse {
  thread_id: string;
  message_id: string;
  assistant: {
    text: string;
    confidence?: number;
    citations?: any[];
    cards?: any[];
    next_actions?: any[];
  };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface ThreadMessage {
  id: string;
  role: "user" | "assistant" | string;
  text: string | null;
  created_at: string;
  cards?: any[];
}

export interface ThreadMessagesResponse {
  thread_id: string;
  messages: ThreadMessage[];
}

export interface ChatStreamHandlers {
  onChunk?: (delta: string) => void;
  onDone?: (response: ChatResponse & { mode?: string }) => void;
  onFallback?: (mode: string) => void;
  onError?: (detail: string) => void;
}

export async function createThread(payload: CreateThreadRequest): Promise<ThreadResponse> {
  return apiFetch<ThreadResponse>("/ai/threads", { method: "POST", body: payload });
}

export async function chat(payload: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/ai/chat", { method: "POST", body: payload });
}

export async function getThreadMessages(threadId: string, limit = 50): Promise<ThreadMessagesResponse> {
  return apiFetch<ThreadMessagesResponse>(`/ai/threads/${encodeURIComponent(threadId)}/messages?limit=${limit}`, {
    method: "GET",
  });
}

export async function chatStream(payload: ChatRequest, handlers: ChatStreamHandlers = {}): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    let detail = "AI chat stream failed";
    try {
      const err = await res.json();
      detail = err?.detail || detail;
    } catch {
      // no-op
    }
    throw new Error(detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let currentEvent = "message";
  let currentData = "";

  const flushEvent = () => {
    if (!currentData) return;
    let parsed: any = {};
    try {
      parsed = JSON.parse(currentData);
    } catch {
      parsed = {};
    }

    if (currentEvent === "chunk") {
      handlers.onChunk?.(parsed?.delta || "");
    } else if (currentEvent === "fallback") {
      handlers.onFallback?.(parsed?.mode || "non_stream_tool");
    } else if (currentEvent === "done") {
      handlers.onDone?.(parsed as ChatResponse & { mode?: string });
    } else if (currentEvent === "error") {
      handlers.onError?.(parsed?.detail || "AI chat stream failed");
    }

    currentEvent = "message";
    currentData = "";
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        currentData += line.slice(5).trim();
      } else if (line === "") {
        flushEvent();
      }
    }
  }

  flushEvent();
}

export interface PromptTemplate {
  id: string;
  role: string;
  title: string;
  description?: string;
  template: string;
}

export async function getPrompts(role?: string): Promise<PromptTemplate[]> {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  return apiFetch<PromptTemplate[]>(`/ai/prompts${query}`, { method: "GET" });
}

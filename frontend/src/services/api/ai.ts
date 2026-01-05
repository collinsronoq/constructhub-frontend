import { apiFetch } from "./client";

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

export async function createThread(payload: CreateThreadRequest): Promise<ThreadResponse> {
  return apiFetch<ThreadResponse>("/ai/threads", { method: "POST", body: payload });
}

export async function chat(payload: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/ai/chat", { method: "POST", body: payload });
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

import { api } from "./api";

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  token_usage?: number | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  summary?: string | null;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface ConversationInsights {
  most_discussed_topics: string[];
  top_weaknesses: string[];
  top_strengths: string[];
  career_trends: string[];
  improvement_actions: string[];
}

export interface MentorDashboardData {
  recent_sessions: ChatSession[];
  insights: ConversationInsights;
  recommended_actions: string[];
  latest_advice: string;
}

export interface ChatExport {
  id: string;
  session_id: string;
  export_type: string;
  export_url: string;
  content?: string;
  created_at: string;
}

export const mentorService = {
  chat: (content: string, sessionId?: string): Promise<{ session_id: string; message: ChatMessage }> => {
    return api.post("/mentor/chat", { content, session_id: sessionId });
  },

  getDashboard: (): Promise<MentorDashboardData> => {
    return api.get("/mentor/dashboard");
  },

  getSessions: (): Promise<ChatSession[]> => {
    return api.get("/mentor/sessions");
  },

  getSessionDetails: (id: string): Promise<ChatSessionDetail> => {
    return api.get(`/mentor/sessions/${id}`);
  },

  updateSession: (id: string, payload: Partial<Omit<ChatSession, "id" | "user_id" | "created_at" | "updated_at">>): Promise<ChatSession> => {
    return api.put(`/mentor/sessions/${id}`, payload);
  },

  deleteSession: (id: string): Promise<ChatSession> => {
    return api.delete(`/mentor/sessions/${id}`);
  },

  exportSession: (id: string, exportType: "pdf" | "markdown" | "text"): Promise<ChatExport> => {
    return api.post(`/mentor/sessions/${id}/export`, { export_type: exportType });
  },
};

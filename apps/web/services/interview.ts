import { api } from "./api";

export interface InterviewStartPayload {
  target_career: string;
  interview_type: string;
  difficulty: string;
  question_count: number;
}

export interface InterviewAnswerSubmitPayload {
  question_id: string;
  answer: string;
}

export interface InterviewAnswer {
  id: string;
  question_id: string;
  answer: string;
  score: number;
  feedback: {
    criteria_scores: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
      clarity: number;
      structure: number;
      completeness: number;
      relevance: number;
    };
    strengths: string[];
    weaknesses: string[];
    missing_points: string[];
    improvement_suggestions: string[];
    sample_better_answer: string;
    learning_resources: string[];
    explanation: string;
  };
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  question: string;
  category: string;
  difficulty: string;
  answer?: InterviewAnswer | null;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  interview_type: string;
  target_career: string;
  difficulty: string;
  status: "in_progress" | "completed";
  score?: number | null;
  readiness_score?: number | null;
  started_at: string;
  completed_at?: string | null;
  report?: {
    overall_score: number;
    readiness_score: number;
    category_performance: Record<string, number>;
    question_breakdown: Array<{
      question_id: string;
      question: string;
      category: string;
      difficulty: string;
      answer: string;
      score: number;
      strengths: string[];
      weaknesses: string[];
    }>;
    strengths: string[];
    weaknesses: string[];
    improvement_areas: string[];
    recommended_next_steps: string[];
  } | null;
  questions?: InterviewQuestion[];
}

export interface InterviewAnalytics {
  average_score: number;
  recent_scores: Array<{
    session_id: string;
    date: string;
    score: number;
    readiness_score: number;
    interview_type: string;
  }>;
  progress_over_time: Array<{
    index: number;
    date: string;
    score: number;
    readiness_score: number;
  }>;
  category_trends: Array<{
    category: string;
    average_score: number;
    question_count: number;
  }>;
  improvement_trends: Array<{
    milestone: string;
    score?: number;
    difference?: number;
  }>;
  best_score: number;
  readiness_score: number;
  recommended_practice_area: string;
  history: InterviewSession[];
}

export const interviewService = {
  startSession: (payload: InterviewStartPayload): Promise<InterviewSession> => {
    return api.post("/interviews/start", payload);
  },

  submitAnswer: (sessionId: string, payload: InterviewAnswerSubmitPayload): Promise<InterviewAnswer> => {
    return api.post(`/interviews/${sessionId}/answer`, payload);
  },

  finishSession: (sessionId: string): Promise<InterviewSession> => {
    return api.post(`/interviews/${sessionId}/finish`);
  },

  getSessionDetails: (sessionId: string): Promise<InterviewSession> => {
    return api.get(`/interviews/${sessionId}`);
  },

  getHistory: (): Promise<InterviewSession[]> => {
    return api.get("/interviews");
  },

  getAnalytics: (): Promise<InterviewAnalytics> => {
    return api.get("/interviews/analytics");
  },

  deleteSession: (sessionId: string): Promise<InterviewSession> => {
    return api.delete(`/interviews/${sessionId}`);
  },
};

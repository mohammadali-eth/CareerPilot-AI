// User Interface Definitions
export interface User {
  id: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  role: "user" | "premium_user" | "admin";
  createdAt: string;
  updatedAt: string;
}

// Profile Interface Definitions
export interface Profile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  targetRole?: string;
  currentExperienceLevel?: "entry" | "mid" | "senior" | "lead";
  updatedAt: string;
}

// Resume Interface Definitions
export interface Resume {
  id: string;
  profileId: string;
  fileUrl: string;
  parsedJson?: {
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate?: string;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      graduationYear: number;
    }>;
  };
  isActive: boolean;
  createdAt: string;
}

// Career Recommendation Definitions
export interface CareerRecommendation {
  id: string;
  profileId: string;
  roleTitle: string;
  matchScore: number; // 0.00 to 1.00
  reasoning: string;
  marketDemandTrend: string;
  createdAt: string;
}

// Roadmap Definitions
export interface RoadmapStep {
  id: string;
  roadmapId: string;
  parentStepId?: string | null;
  title: string;
  description: string;
  targetSkillId?: string;
  orderIndex: number;
  isCompleted: boolean;
}

export interface Roadmap {
  id: string;
  profileId: string;
  targetRole: string;
  status: "active" | "completed" | "archived";
  steps?: RoadmapStep[];
  createdAt: string;
}

// Interview Simulator Definitions
export interface InterviewMessage {
  id: string;
  sessionId: string;
  role: "system" | "user" | "assistant";
  content: string;
  evaluationMetrics?: {
    score?: number;
    grammarFeedback?: string;
    accuracyFeedback?: string;
  };
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  profileId: string;
  roleTarget: string;
  difficulty: "easy" | "medium" | "hard";
  overallFeedback?: string;
  overallScore?: number;
  messages?: InterviewMessage[];
  createdAt: string;
}

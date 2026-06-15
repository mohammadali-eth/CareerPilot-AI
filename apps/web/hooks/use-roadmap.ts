import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface ProjectRecommendation {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Capstone";
  estimated_duration: string;
  skills_covered: string[];
  portfolio_value: string;
  why_recommended: string;
}

export interface CertificationRecommendation {
  title: string;
  priority_level: "High" | "Medium" | "Low";
  career_impact: string;
  estimated_completion_time: string;
  reason_for_recommendation: string;
}

export interface WeeklyTask {
  week_number: number;
  theme: string;
  tasks: string[];
}

export interface MonthlyGoal {
  month_number: number;
  goal: string;
  focus_areas: string[];
}

export interface LearningPhase {
  phase_number: number;
  title: string;
  description: string;
  duration: string;
  skills_covered: string[];
}

export interface RoadmapData {
  career_goal: string;
  success_probability: number;
  learning_phases: LearningPhase[];
  weekly_tasks: WeeklyTask[];
  monthly_goals: MonthlyGoal[];
  projects: ProjectRecommendation[];
  certifications: CertificationRecommendation[];
  interview_preparation: string[];
  portfolio_improvements: string[];
  why_milestones_exist_explanation: string;
  why_skills_ordered_explanation: string;
  employability_impact_explanation: string;
}

export interface RoadmapMilestone {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  target_date: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  target_career: string;
  timeline: string;
  estimated_completion: string;
  status: "active" | "completed" | "archived";
  roadmap_data: RoadmapData;
  created_at: string;
  updated_at: string;
  milestones: RoadmapMilestone[];
}

export interface GenerateRoadmapPayload {
  target_career: string;
  timeline: string;
  weekly_hours: number;
  experience_level: string;
  learning_style: string;
}

export interface UpdateProgressPayload {
  milestone_id: string;
  progress: number;
  completed: boolean;
}

export function useRoadmaps() {
  return useQuery<Roadmap[], Error>({
    queryKey: ["roadmaps"],
    queryFn: () => api.get("/roadmaps"),
  });
}

export function useRoadmap(id: string | null) {
  return useQuery<Roadmap, Error>({
    queryKey: ["roadmap", id],
    queryFn: () => api.get(`/roadmaps/${id}`),
    enabled: !!id,
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();

  return useMutation<Roadmap, Error, GenerateRoadmapPayload>({
    mutationFn: (payload: GenerateRoadmapPayload) =>
      api.post("/roadmaps/generate", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateRoadmapProgress(roadmapId: string) {
  const queryClient = useQueryClient();

  return useMutation<Roadmap, Error, UpdateProgressPayload>({
    mutationFn: (payload: UpdateProgressPayload) =>
      api.put(`/roadmaps/${roadmapId}/progress`, payload),
    onSuccess: (updatedRoadmap) => {
      queryClient.setQueryData(["roadmap", roadmapId], updatedRoadmap);
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.delete(`/roadmaps/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

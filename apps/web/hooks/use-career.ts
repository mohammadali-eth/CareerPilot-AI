import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface SalaryInsights {
  entry_level: string;
  mid_level: string;
  senior_level: string;
}

export interface MarketDemand {
  demand_score: number;
  growth_trend: string;
  industry_adoption: string;
  future_outlook: string;
}

export interface CareerMatchDetails {
  career_name: string;
  match_score: number;
  confidence_score: number;
  why_it_matches: string;
  required_skills: string[];
  missing_skills: string[];
  recommended_next_steps: string[];
  estimated_learning_time: string;
  growth_potential: string;
  salary_insights: SalaryInsights;
  market_demand: MarketDemand;
}

export interface CareerMatch {
  id: string;
  recommendation_id: string;
  career_name: string;
  match_score: number;
  confidence_score: number;
  explanation: string;
  details: CareerMatchDetails;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  recommendation_version: string;
  recommendation_result: {
    user_data_snapshot: {
      skills_count: number;
      experience_length: number;
      has_resume: boolean;
    };
    top_match_summary: string;
  };
  generated_at: string;
  matches: CareerMatch[];
}

export function useCareerHistory() {
  return useQuery<CareerRecommendation[], Error>({
    queryKey: ["career-recommendations"],
    queryFn: () => api.get("/career-recommendations/history"),
  });
}

export function useCareerRecommendation(id: string | null) {
  return useQuery<CareerRecommendation, Error>({
    queryKey: ["career-recommendation", id],
    queryFn: () => api.get(`/career-recommendations/${id}`),
    enabled: !!id,
  });
}

export function useGenerateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation<CareerRecommendation, Error, void>({
    mutationFn: () => api.post("/career-recommendations/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.delete(`/career-recommendations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

import { api } from "./api";

export interface UserMetric {
  id: string;
  user_id: string;
  resume_score: number;
  ats_score: number;
  career_match_score: number;
  skill_gap_score: number;
  roadmap_completion: number;
  interview_readiness: number;
  learning_streak: number;
  career_readiness_score: number;
  overall_growth_score: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  resume_score: number;
  ats_score: number;
  career_match_score: number;
  skill_gap_score: number;
  roadmap_completion: number;
  interview_readiness: number;
  learning_streak: number;
  career_readiness_score: number;
  overall_growth_score: number;
  created_at: string;
}

export interface MetricDetail {
  score: number;
  weight: number;
  status: string;
  description: string;
}

export interface CareerReadinessBreakdown {
  career_readiness_score: number;
  resume_quality: MetricDetail;
  skill_coverage: MetricDetail;
  career_alignment: MetricDetail;
  roadmap_progress: MetricDetail;
  interview_performance: MetricDetail;
  learning_consistency: MetricDetail;
  overall_growth_score: number;
}

export interface GrowthInsights {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  career_suggestions: string;
  roadmap_suggestions: string;
  interview_suggestions: string;
  next_steps: string[];
}

export interface AnalyticsReport {
  id: string;
  user_id: string;
  report_type: string;
  title: string;
  summary: string | null;
  data: {
    breakdown: CareerReadinessBreakdown;
    insights: GrowthInsights;
    generated_date: string;
  };
  created_at: string;
}

export interface ReportExport {
  id: string;
  user_id: string;
  report_id: string | null;
  export_type: string;
  export_url: string;
  created_at: string;
}

export interface AnalyticsDashboardData {
  latest_metrics: UserMetric | null;
  snapshots: AnalyticsSnapshot[];
  recent_reports: AnalyticsReport[];
  readiness_breakdown: CareerReadinessBreakdown | null;
  growth_insights: GrowthInsights;
}

class AnalyticsService {
  async getDashboardData(): Promise<AnalyticsDashboardData> {
    return api.get("/analytics/dashboard");
  }

  async generateReport(reportType: string, title?: string): Promise<AnalyticsReport> {
    return api.post("/analytics/reports", { report_type: reportType, title });
  }

  async listReports(): Promise<AnalyticsReport[]> {
    return api.get("/analytics/reports");
  }

  async getReportDetails(id: string): Promise<AnalyticsReport> {
    return api.get(`/analytics/reports/${id}`);
  }

  async exportReport(id: string, exportType: string): Promise<ReportExport> {
    return api.post(`/analytics/reports/${id}/export?export_type=${exportType}`);
  }
}

export const analyticsService = new AnalyticsService();

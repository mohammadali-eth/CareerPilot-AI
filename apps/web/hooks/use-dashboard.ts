import { useQuery } from "@tanstack/react-query";

export interface ActivityItem {
  id: string;
  type: "upload" | "match" | "interview" | "skill";
  title: string;
  timestamp: string;
  description: string;
}

export interface DashboardMetrics {
  careerMatchScore: number | null;
  resumeScore: number | null;
  atsScore: number | null;
  interviewReadiness: number | null;
  skillGapScore: number | null;
  careerReadinessScore?: number | null;
  overallGrowthScore?: number | null;
  recentActivity: ActivityItem[];
}

// Simulated data sets
const successData: DashboardMetrics = {
  careerMatchScore: 84,
  resumeScore: 78,
  atsScore: 81,
  interviewReadiness: 72,
  skillGapScore: 65,
  careerReadinessScore: 76,
  overallGrowthScore: 56,
  recentActivity: [
    {
      id: "act-1",
      type: "upload",
      title: "Resume Analyzed",
      description:
        "Extracted work history and skills from Senior_Developer_CV.pdf",
      timestamp: "2 hours ago",
    },
    {
      id: "act-2",
      type: "match",
      title: "Career Match Calculation",
      description: "Match rate: 89% for Senior Full Stack Engineer at Vercel",
      timestamp: "1 day ago",
    },
    {
      id: "act-3",
      type: "skill",
      title: "Skill Gap Identified",
      description: "Identified Kubernetes and GraphQL as target roadmap gaps",
      timestamp: "2 days ago",
    },
  ],
};

const emptyData: DashboardMetrics = {
  careerMatchScore: null,
  resumeScore: null,
  atsScore: null,
  interviewReadiness: null,
  skillGapScore: null,
  careerReadinessScore: null,
  overallGrowthScore: null,
  recentActivity: [],
};

export function useDashboardData(
  simulatedState: "success" | "empty" | "error" = "success",
) {
  return useQuery<DashboardMetrics, Error>({
    queryKey: ["dashboard-stats", simulatedState],
    queryFn: async () => {
      // Simulate network latency of 1.2s to verify skeleton states
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (simulatedState === "error") {
        throw new Error(
          "Failed to load dashboard metrics. Database server is temporarily unresponsive.",
        );
      }

      if (simulatedState === "empty") {
        return emptyData;
      }

      // If simulatedState is success, attempt to load real live backend stats
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        if (token) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
          const res = await fetch(`${apiBaseUrl}/analytics/dashboard`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.latest_metrics) {
              const m = data.latest_metrics;
              // Map recent reports to activities
              const mappedActivity = data.recent_reports?.map((r: any) => ({
                id: r.id,
                type: "skill" as const,
                title: r.title,
                description: r.summary || "Capability report generated.",
                timestamp: new Date(r.created_at).toLocaleDateString()
              })) || [];

              return {
                careerMatchScore: m.career_match_score,
                resumeScore: m.resume_score,
                atsScore: m.ats_score,
                interviewReadiness: m.interview_readiness,
                skillGapScore: m.skill_gap_score,
                careerReadinessScore: m.career_readiness_score,
                overallGrowthScore: m.overall_growth_score,
                recentActivity: mappedActivity.length > 0 ? mappedActivity : successData.recentActivity
              };
            }
          }
        }
      } catch (err) {
        console.warn("Could not load real analytics dashboard data, using mock data:", err);
      }

      return successData;
    },
    retry: false,
    staleTime: 0,
  });
}

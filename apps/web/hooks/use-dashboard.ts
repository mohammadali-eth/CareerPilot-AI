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
  recentActivity: ActivityItem[];
}

// Simulated data sets
const successData: DashboardMetrics = {
  careerMatchScore: 84,
  resumeScore: 78,
  atsScore: 81,
  interviewReadiness: 72,
  skillGapScore: 65,
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
  recentActivity: [],
};

export function useDashboardData(
  simulatedState: "success" | "empty" | "error" = "success",
) {
  return useQuery<DashboardMetrics, Error>({
    queryKey: ["dashboard-stats", simulatedState],
    queryFn: async () => {
      // Simulate network latency of 1.2s to verify skeleton states
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (simulatedState === "error") {
        throw new Error(
          "Failed to load dashboard metrics. Database server is temporarily unresponsive.",
        );
      }

      if (simulatedState === "empty") {
        return emptyData;
      }

      return successData;
    },
    retry: false,
    staleTime: 0,
  });
}

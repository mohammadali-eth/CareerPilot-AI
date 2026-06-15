import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface ResumeScore {
  id: string;
  overall_score: number;
  structure_score: number;
  content_score: number;
  suggestions: {
    structure: string[];
    content: string[];
  };
  created_at: string;
}

export interface ATSReport {
  id: string;
  ats_score: number;
  missing_keywords: string[];
  formatting_issues: string[];
  relevance_score: number;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  extracted_data: {
    skills: string[];
    education: string[];
    experience: string[];
    certifications: string[];
    projects: string[];
  };
  created_at: string;
  scores: ResumeScore[];
  ats_reports: ATSReport[];
}

export interface UploadResponse {
  resume: Resume;
  latest_score: ResumeScore;
  latest_ats_report: ATSReport;
}

export function useResumes() {
  return useQuery<Resume[], Error>({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resumes"),
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      return api.post("/resumes/upload", formData);
    },
    onSuccess: () => {
      // Refresh list of resumes and dashboard metrics
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (resumeId: string) => api.delete(`/resumes/${resumeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

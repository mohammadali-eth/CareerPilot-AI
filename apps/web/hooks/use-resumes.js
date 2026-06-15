import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
export function useResumes() {
    return useQuery({
        queryKey: ["resumes"],
        queryFn: () => api.get("/resumes"),
    });
}
export function useUploadResume() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
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
    return useMutation({
        mutationFn: (resumeId) => api.delete(`/resumes/${resumeId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}

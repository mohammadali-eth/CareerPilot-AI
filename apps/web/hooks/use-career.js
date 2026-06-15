import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
export function useCareerHistory() {
    return useQuery({
        queryKey: ["career-recommendations"],
        queryFn: () => api.get("/career-recommendations/history"),
    });
}
export function useCareerRecommendation(id) {
    return useQuery({
        queryKey: ["career-recommendation", id],
        queryFn: () => api.get(`/career-recommendations/${id}`),
        enabled: !!id,
    });
}
export function useGenerateRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.post("/career-recommendations/generate"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}
export function useDeleteRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/career-recommendations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}

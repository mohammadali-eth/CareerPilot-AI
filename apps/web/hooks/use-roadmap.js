import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
export function useRoadmaps() {
    return useQuery({
        queryKey: ["roadmaps"],
        queryFn: () => api.get("/roadmaps"),
    });
}
export function useRoadmap(id) {
    return useQuery({
        queryKey: ["roadmap", id],
        queryFn: () => api.get(`/roadmaps/${id}`),
        enabled: !!id,
    });
}
export function useGenerateRoadmap() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => api.post("/roadmaps/generate", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}
export function useUpdateRoadmapProgress(roadmapId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => api.put(`/roadmaps/${roadmapId}/progress`, payload),
        onSuccess: (updatedRoadmap) => {
            queryClient.setQueryData(["roadmap", roadmapId], updatedRoadmap);
            queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}
export function useDeleteRoadmap() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/roadmaps/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
    });
}

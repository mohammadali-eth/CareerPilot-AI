import { api } from "./api";
export const mentorService = {
    chat: (content, sessionId) => {
        return api.post("/mentor/chat", { content, session_id: sessionId });
    },
    getDashboard: () => {
        return api.get("/mentor/dashboard");
    },
    getSessions: () => {
        return api.get("/mentor/sessions");
    },
    getSessionDetails: (id) => {
        return api.get(`/mentor/sessions/${id}`);
    },
    updateSession: (id, payload) => {
        return api.put(`/mentor/sessions/${id}`, payload);
    },
    deleteSession: (id) => {
        return api.delete(`/mentor/sessions/${id}`);
    },
    exportSession: (id, exportType) => {
        return api.post(`/mentor/sessions/${id}/export`, { export_type: exportType });
    },
};

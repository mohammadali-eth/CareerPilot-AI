import { api } from "./api";
export const interviewService = {
    startSession: (payload) => {
        return api.post("/interviews/start", payload);
    },
    submitAnswer: (sessionId, payload) => {
        return api.post(`/interviews/${sessionId}/answer`, payload);
    },
    finishSession: (sessionId) => {
        return api.post(`/interviews/${sessionId}/finish`);
    },
    getSessionDetails: (sessionId) => {
        return api.get(`/interviews/${sessionId}`);
    },
    getHistory: () => {
        return api.get("/interviews");
    },
    getAnalytics: () => {
        return api.get("/interviews/analytics");
    },
    deleteSession: (sessionId) => {
        return api.delete(`/interviews/${sessionId}`);
    },
};

import { api } from "./api";
class AnalyticsService {
    async getDashboardData() {
        return api.get("/analytics/dashboard");
    }
    async generateReport(reportType, title) {
        return api.post("/analytics/reports", { report_type: reportType, title });
    }
    async listReports() {
        return api.get("/analytics/reports");
    }
    async getReportDetails(id) {
        return api.get(`/analytics/reports/${id}`);
    }
    async exportReport(id, exportType) {
        return api.post(`/analytics/reports/${id}/export?export_type=${exportType}`);
    }
}
export const analyticsService = new AnalyticsService();

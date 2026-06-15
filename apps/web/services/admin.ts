import { api } from "./api";

export interface UserSummary {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface ListUsersResponse {
  total: number;
  users: UserSummary[];
}

export interface UserDetails {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  profile: {
    first_name: string | null;
    last_name: string | null;
    target_role: string | null;
    current_experience_level: string | null;
  } | null;
  usage_summary: {
    resumes_uploaded: number;
    interviews_simulated: number;
    roadmaps_created: number;
    reports_generated: number;
  };
  recent_activity: {
    id: string;
    action_type: string;
    description: string;
    created_at: string;
  }[];
}

export interface SystemHealthData {
  timestamp: string;
  cpu_usage_pct: number;
  ram_usage_pct: number;
  disk_usage_pct: number;
  api_status: string;
  db_status: string;
  queue_status: string;
  worker_status: string;
  storage: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  new_users_30d: number;
  ai_requests: number;
  reports_generated: number;
  interviews_conducted: number;
  roadmaps_created: number;
  career_recommendations_generated: number;
  system_health: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  total: number;
  logs: AuditLog[];
}

export interface AIUsageStats {
  aggregate: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost: number;
    avg_latency: number;
    total_requests: number;
    failed_requests: number;
    failure_rate: number;
  };
  providers: {
    openai: {
      total_requests: number;
      avg_latency_ms: number;
    };
    gemini: {
      total_requests: number;
      avg_latency_ms: number;
    };
  };
}

export const adminService = {
  async getDashboardAnalytics(): Promise<DashboardStats> {
    return api.get("/admin/analytics");
  },

  async getSystemHealth(): Promise<SystemHealthData> {
    return api.get("/admin/system-health");
  },

  async listUsers(
    params: {
      skip?: number;
      limit?: number;
      search?: string;
      role?: string;
      isActive?: boolean;
    } = {}
  ): Promise<ListUsersResponse> {
    const queryParts = [];
    if (params.skip !== undefined) queryParts.push(`skip=${params.skip}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.role) queryParts.push(`role=${params.role}`);
    if (params.isActive !== undefined) queryParts.push(`is_active=${params.isActive}`);
    
    const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
    return api.get(`/admin/users${queryString}`);
  },

  async getUserDetails(userId: string): Promise<UserDetails> {
    return api.get(`/admin/users/${userId}`);
  },

  async suspendUser(userId: string, reason: string): Promise<{ message: string }> {
    return api.put(`/admin/users/${userId}/suspend`, { reason });
  },

  async activateUser(userId: string, reason: string): Promise<{ message: string }> {
    return api.put(`/admin/users/${userId}/activate`, { reason });
  },

  async deleteUser(userId: string, reason: string): Promise<{ message: string }> {
    return api.delete(`/admin/users/${userId}?reason=${encodeURIComponent(reason)}`);
  },

  async resetUserPassword(userId: string, data: { new_password: string; reason: string }): Promise<{ message: string }> {
    return api.put(`/admin/users/${userId}/password-reset`, data);
  },

  async assignUserRole(userId: string, data: { role: string; reason: string }): Promise<{ message: string }> {
    return api.put(`/admin/users/${userId}/role`, data);
  },

  async getAIUsageStats(): Promise<AIUsageStats> {
    return api.get("/admin/ai-usage");
  },

  async getAuditLogs(
    params: {
      skip?: number;
      limit?: number;
      actionType?: string;
      userId?: string;
    } = {}
  ): Promise<AuditLogResponse> {
    const queryParts = [];
    if (params.skip !== undefined) queryParts.push(`skip=${params.skip}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params.actionType) queryParts.push(`action_type=${params.actionType}`);
    if (params.userId) queryParts.push(`user_id=${params.userId}`);

    const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
    return api.get(`/admin/audit-logs${queryString}`);
  },

  async createCareerDefinition(data: any): Promise<{ message: string }> {
    return api.post("/admin/careers", data);
  },

  async createSkillDefinition(data: any): Promise<{ message: string }> {
    return api.post("/admin/skills", data);
  },

  async listReportsOverview(): Promise<{ total_reports: number; total_exports: number }> {
    return api.get("/admin/reports");
  }
};

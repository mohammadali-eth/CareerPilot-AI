"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BrainCircuit,
  FileText,
  Briefcase,
  Activity,
  Server,
  RefreshCw,
} from "lucide-react";
import { adminService, DashboardStats, SystemHealthData } from "../../services/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const [statsData, healthData] = await Promise.all([
        adminService.getDashboardAnalytics(),
        adminService.getSystemHealth(),
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (err: any) {
      console.error(err);
      setError("Failed to retrieve administrative diagnostics statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll system health every 30 seconds
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading SaaS administrative logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Activity className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg">System Audit Failed</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors"
        >
          Retry Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administrative Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time operations, SaaS user registration telemetry, and systems health metrics.
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card/60 hover:bg-card border border-border text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Grid: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Registered Users",
            value: stats?.total_users ?? 0,
            description: `${stats?.new_users_30d ?? 0} new registrations (30d)`,
            icon: Users,
            color: "from-indigo-500/10 to-blue-500/10 text-indigo-400",
          },
          {
            title: "AI API Requests",
            value: stats?.ai_requests ?? 0,
            description: "Token cost calculation active",
            icon: BrainCircuit,
            color: "from-purple-500/10 to-pink-500/10 text-purple-400",
          },
          {
            title: "Executive Reports",
            value: stats?.reports_generated ?? 0,
            description: "McKinsey/Deloitte style generated",
            icon: FileText,
            color: "from-emerald-500/10 to-teal-500/10 text-emerald-400",
          },
          {
            title: "Interviews Conducted",
            value: stats?.interviews_conducted ?? 0,
            description: `${stats?.career_recommendations_generated ?? 0} matches mapped`,
            icon: Briefcase,
            color: "from-amber-500/10 to-orange-500/10 text-amber-400",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-card/40 backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight">{card.value}</span>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Health Monitoring Status & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Hardware Metrics */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Node Hardware Utilization</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                name: "CPU Usage percentage",
                value: health?.cpu_usage_pct ?? 0,
                color: "bg-indigo-500",
              },
              {
                name: "RAM Usage percentage",
                value: health?.ram_usage_pct ?? 0,
                color: "bg-purple-500",
              },
              {
                name: "Disk Storage Capacity",
                value: health?.disk_usage_pct ?? 0,
                color: "bg-emerald-500",
              },
            ].map((metric, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">{metric.name}</span>
                  <span className="font-bold">{metric.value}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color} transition-all duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database & API Services status check */}
        <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Service Heartbeats</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "FastAPI Application Server", status: health?.api_status ?? "healthy" },
              { name: "PostgreSQL Database Engine", status: health?.db_status ?? "healthy" },
              { name: "Redis Cache Queue Broker", status: health?.queue_status ?? "healthy" },
              { name: "Celery Workers Pool", status: health?.worker_status ?? "healthy" },
            ].map((service, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
              >
                <span className="text-xs font-medium">{service.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    service.status === "healthy"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse"
                  }`}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

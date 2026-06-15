"use client";

import React, { useState, useEffect } from "react";
import { FileText, ArrowDownToLine, RefreshCw } from "lucide-react";
import { adminService } from "../../../services/admin";

export default function ReportManager() {
  const [data, setData] = useState<{ total_reports: number; total_exports: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReportStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const stats = await adminService.listReportsOverview();
      setData(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing McKinsey reports database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Vault Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System generated resume analyses, ATS ratings, McKinsey-style career roadmaps, and client download logs.
          </p>
        </div>
        <button
          onClick={() => loadReportStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card/60 hover:bg-card border border-border text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center justify-between hover:shadow-lg transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Generated McKinsey Reports</span>
            <p className="text-3xl font-extrabold">{data?.total_reports ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Comprehensive evaluation packages compiled</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md flex items-center justify-between hover:shadow-lg transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Export Downloads</span>
            <p className="text-3xl font-extrabold">{data?.total_exports ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">PDF document versions downloaded by users</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <ArrowDownToLine className="h-5 w-5 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}

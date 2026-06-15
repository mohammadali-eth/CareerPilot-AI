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
        <RefreshCw className="animate-spin h-6 w-6 text-foreground" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground animate-pulse">Syncing McKinsey reports database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Report Vault Insights</h1>
          <p className="text-xs text-muted-foreground mt-1">
            System generated resume analyses, ATS ratings, McKinsey-style career roadmaps, and client download logs.
          </p>
        </div>
        <button
          onClick={() => loadReportStats(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900 text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded border border-border bg-card flex items-center justify-between hover:border-foreground/35 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Generated McKinsey Reports</span>
            <p className="text-3xl font-extrabold text-foreground">{data?.total_reports ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Comprehensive evaluation packages compiled</p>
          </div>
          <div className="h-10 w-10 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 rounded border border-border bg-card flex items-center justify-between hover:border-foreground/35 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Export Downloads</span>
            <p className="text-3xl font-extrabold text-foreground">{data?.total_exports ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">PDF document versions downloaded by users</p>
          </div>
          <div className="h-10 w-10 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground flex items-center justify-center">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

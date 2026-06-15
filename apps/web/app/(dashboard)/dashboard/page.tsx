"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  FileText,
  Briefcase,
  MessageSquare,
  Activity,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Play,
  ArrowRight,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/use-dashboard";
import { useAuthStore } from "../../../store/auth";

type StateType = "success" | "empty" | "error";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [simulatedState, setSimulatedState] = useState<StateType>("success");
  const { data: stats, isLoading, isError, error, refetch } = useDashboardData(simulatedState);

  const userName =
    user?.profile?.first_name && user?.profile?.last_name
      ? `${user.profile.first_name}`
      : user?.email?.split("@")[0] || "User";

  // Score renderer helper
  const renderScore = (score: number | null | undefined, title: string) => {
    if (score === null || score === undefined) {
      return (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <span className="text-xs text-muted-foreground">No data available</span>
          <Link href={getLinkForMetric(title)} className="text-xs font-semibold text-primary hover:underline mt-1 flex items-center gap-0.5">
            Set up <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      );
    }

    // Determine colors based on thresholds
    let colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score < 60) {
      colorClass = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    } else if (score < 80) {
      colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }

    return (
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight">{score}%</span>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border capitalize ${colorClass}`}>
          {score < 60 ? "needs work" : score < 80 ? "good" : "excellent"}
        </span>
      </div>
    );
  };

  const getLinkForMetric = (title: string): string => {
    switch (title) {
      case "Resume Score":
      case "ATS Score":
        return "/dashboard/resume";
      case "Career Match Score":
        return "/dashboard/career-match";
      case "Interview Readiness":
        return "/dashboard/interview";
      case "Skill Gap Score":
        return "/dashboard/skill-gap";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="space-y-8">
      {/* Upper Section: Welcome Header & State Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hello, {userName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is your career trajectory overview and system intelligence analysis.
          </p>
        </div>

        {/* Sandbox State Switcher Control (Stripe style) */}
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border self-start">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
            Sandbox View:
          </span>
          <button
            onClick={() => setSimulatedState("success")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              simulatedState === "success"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setSimulatedState("empty")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              simulatedState === "empty"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Empty States
          </button>
          <button
            onClick={() => setSimulatedState("error")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              simulatedState === "error"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Error State
          </button>
        </div>
      </div>

      {/* 1. ERROR STATE VIEW */}
      {isError && (
        <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Failed to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error?.message || "An unexpected error occurred while fetching database metrics."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 text-sm font-semibold transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. LOADING STATE / SKELETON GRID */}
      {isLoading && !isError && (
        <div className="space-y-8 animate-pulse">
          {/* Stats Cards Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-panel p-6 rounded-xl border border-border h-36 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded mt-2" />
                </div>
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Activity Section Skeleton */}
          <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="space-y-1">
                    <div className="h-4 w-48 bg-muted rounded" />
                    <div className="h-3 w-64 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS / EMPTY STATES GRID */}
      {!isLoading && !isError && stats && (
        <div className="space-y-8">
          {/* Metrics Dashboard Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Widget 1: Career Match Score */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold tracking-wide uppercase">Career Match</span>
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.careerMatchScore, "Career Match Score")}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">Matches target role alignment</p>
            </div>

            {/* Widget 2: Resume Score */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold tracking-wide uppercase">Resume Score</span>
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.resumeScore, "Resume Score")}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">Based on profile completeness</p>
            </div>

            {/* Widget 3: ATS Score */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold tracking-wide uppercase">ATS Score</span>
                  <Activity className="h-4 w-4 text-pink-500" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.atsScore, "ATS Score")}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">Resume keywords parse index</p>
            </div>

            {/* Widget 4: Interview Readiness */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold tracking-wide uppercase">Interview Ready</span>
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.interviewReadiness, "Interview Readiness")}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">Score from simulated chats</p>
            </div>

            {/* Widget 5: Skill Gap Score */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold tracking-wide uppercase">Skill Gap Index</span>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.skillGapScore, "Skill Gap Score")}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">Completed roadmap progress</p>
            </div>

          </div>

          {/* Widget 6: Recent Activity & Workspace Setup Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Activity List Panel */}
            <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-border space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Recent Activities
              </h3>

              {stats.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold">
                    ∅
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">No recent activity found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Actions like analyzing resumes or completing simulations will appear here.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Upload CV
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm font-semibold leading-none">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Next Career Steps</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your CareerPilot onboarding to receive custom skill roadmaps and targeted interview simulators.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/dashboard/resume"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-muted/50 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                    Upload New Resume
                  </span>
                  <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/dashboard/interview"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-muted/50 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    Simulate Interview
                  </span>
                  <Play className="h-3 w-3 text-muted-foreground fill-muted-foreground" />
                </Link>

                <Link
                  href="/profile"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-muted/50 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                    Configure Preferences
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

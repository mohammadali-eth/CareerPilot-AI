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
  Map,
  Flame,
  PlayCircle,
} from "lucide-react";
import { useDashboardData } from "../../../hooks/use-dashboard";
import { useAuthStore } from "../../../store/auth";
import { useRoadmaps } from "../../../hooks/use-roadmap";

type StateType = "success" | "empty" | "error";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [simulatedState, setSimulatedState] = useState<StateType>("success");
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardData(simulatedState);
  const { data: roadmaps } = useRoadmaps();

  const userName =
    user?.profile?.first_name && user?.profile?.last_name
      ? `${user.profile.first_name}`
      : user?.email?.split("@")[0] || "User";

  // Active roadmap processing
  const activeRoadmap =
    roadmaps?.find((r) => r.status === "active") || roadmaps?.[0];
  const milestones = activeRoadmap?.milestones || [];
  const totalMilestones = milestones.length;
  const avgProgress = totalMilestones
    ? Math.floor(
        milestones.reduce((acc, m) => acc + m.completion_percentage, 0) /
          totalMilestones,
      )
    : 0;

  const currentMilestone =
    milestones.find((m) => m.completion_percentage < 100) ||
    milestones[totalMilestones - 1];

  const weeklyTasks = activeRoadmap?.roadmap_data?.weekly_tasks || [];
  const currentWeekNum = Math.min(
    weeklyTasks.length,
    Math.floor((weeklyTasks.length * avgProgress) / 100) + 1,
  );
  const currentWeek = weeklyTasks.find((w) => w.week_number === currentWeekNum);
  const nextTask =
    currentWeek?.tasks?.[0] || "Complete milestone requirements.";

  // Score renderer helper
  const renderScore = (score: number | null | undefined, title: string) => {
    if (score === null || score === undefined) {
      return (
        <div className="flex flex-col items-center justify-center h-20 text-center">
          <span className="text-[11px] text-muted-foreground font-medium">
            No data available
          </span>
          <Link
            href={getLinkForMetric(title)}
            className="text-[11px] font-bold text-foreground hover:underline mt-1.5 flex items-center gap-0.5"
          >
            Set up <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      );
    }

    // Determine colors based on thresholds (pure grayscale)
    let colorClass = "text-neutral-800 bg-neutral-100 border-neutral-300 dark:text-neutral-200 dark:bg-neutral-900 dark:border-neutral-800";
    if (score < 60) {
      colorClass = "text-neutral-400 bg-neutral-50 border-neutral-200 dark:text-neutral-500 dark:bg-neutral-950 dark:border-neutral-900";
    } else if (score >= 80) {
      colorClass = "text-white bg-black border-black dark:text-black dark:bg-white dark:border-white";
    }

    return (
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tighter">{score}%</span>
        <span
          className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${colorClass}`}
        >
          {score < 60 ? "work needed" : score < 80 ? "good" : "excellent"}
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
        return "/dashboard/career-recommendations";
      case "Interview Readiness":
        return "/dashboard/interview";
      case "Skill Gap Score":
        return "/dashboard/skill-gap";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Section: Welcome Header & State Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello, {userName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Here is your career trajectory overview and system intelligence
            analysis.
          </p>
        </div>

        {/* Sandbox State Switcher Control (Stripe style) */}
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900/50 rounded border border-border self-start">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2">
            Sandbox View:
          </span>
          <button
            onClick={() => setSimulatedState("success")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
              simulatedState === "success"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setSimulatedState("empty")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
              simulatedState === "empty"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Empty States
          </button>
          <button
            onClick={() => setSimulatedState("error")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
              simulatedState === "error"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Error State
          </button>
        </div>
      </div>

      {/* 1. ERROR STATE VIEW */}
      {isError && (
        <div className="p-12 border border-border bg-neutral-50 dark:bg-neutral-950 rounded flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="h-10 w-10 rounded-full border border-border text-foreground flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Failed to Load Dashboard
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              {error?.message ||
                "An unexpected error occurred while fetching database metrics."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
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
              <div
                key={i}
                className="glass-panel p-6 rounded border border-border h-36 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded mt-2" />
                </div>
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Activity Section Skeleton */}
          <div className="glass-panel p-6 rounded border border-border space-y-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
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
          {/* Executive Telemetry Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Career Readiness Score Card */}
            <div className="md:col-span-2 glass-panel p-6 rounded border border-border flex flex-col md:flex-row items-center justify-between gap-6 hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Executive Telemetry Overview</span>
                <h3 className="font-extrabold text-base text-foreground">Unified Career Readiness Index</h3>
                <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                  A comprehensive, weighted scorecard evaluating your resume fit, skill gaps, roadmaps completion rates, mock interview performance, and active study streak consistency.
                </p>
                <div className="pt-2">
                  <Link 
                    href="/dashboard/analytics" 
                    className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
                  >
                    Open Telemetry Analytics <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <div className="relative h-20 w-20 shrink-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 rounded border border-border p-2">
                <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-200 dark:text-neutral-900"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-foreground transition-all duration-1000 ease-out"
                    strokeWidth="3.5"
                    strokeDasharray={`${stats.careerReadinessScore || 0}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-foreground leading-none">{stats.careerReadinessScore || 0}%</span>
                  <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ready</span>
                </div>
              </div>
            </div>

            {/* Growth Score Card */}
            <div className="glass-panel p-6 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Overall Growth Score</span>
                  <Activity className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      +{stats.overallGrowthScore || 0}%
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 font-bold rounded bg-foreground text-background border border-foreground uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    Growth points accumulated relative to initial baseline career state.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Positive trajectory
                </span>
                <Link href="/dashboard/reports" className="hover:underline font-bold text-foreground">
                  View Audits
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Widget 1: Career Match Score */}
            <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Career Match
                  </span>
                  <Briefcase className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.careerMatchScore, "Career Match Score")}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Matches target role alignment
              </p>
            </div>

            {/* Widget 2: Resume Score */}
            <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Resume Score
                  </span>
                  <FileText className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.resumeScore, "Resume Score")}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Based on profile completeness
              </p>
            </div>

            {/* Widget 3: ATS Score */}
            <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    ATS Score
                  </span>
                  <Activity className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.atsScore, "ATS Score")}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Keywords parsing index
              </p>
            </div>

            {/* Widget 4: Interview Readiness */}
            <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Interview Ready
                  </span>
                  <MessageSquare className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.interviewReadiness, "Interview Readiness")}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Simulated response score
              </p>
            </div>

            {/* Widget 5: Skill Gap Score */}
            <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-all duration-150">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Skill Gap Index
                  </span>
                  <TrendingUp className="h-4 w-4 text-foreground" />
                </div>
                <div className="pt-2">
                  {renderScore(stats.skillGapScore, "Skill Gap Score")}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Completed roadmap progress
              </p>
            </div>
          </div>

          {/* New Section: Roadmap Tracking Integration Card */}
          {activeRoadmap ? (
            <div className="glass-panel p-6 rounded border border-border space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center text-foreground">
                    <Map className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      Roadmap Progress: {activeRoadmap.target_career}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Target Completion:{" "}
                      {new Date(
                        activeRoadmap.estimated_completion,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Flame className="h-3 w-3 shrink-0" />
                    <span>5 Day Streak</span>
                  </div>
                  <Link
                    href="/dashboard/roadmap"
                    className="text-xs font-bold text-foreground hover:underline flex items-center gap-1"
                  >
                    Open Workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Total Completion
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">
                      {avgProgress}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Syllabus
                    </span>
                  </div>
                  <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-950 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Current Milestone
                  </span>
                  {currentMilestone ? (
                    <div>
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {currentMilestone.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {currentMilestone.description}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No active milestone.
                    </span>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">
                    Next Recommended Action
                  </span>
                  <div className="flex items-start gap-2 bg-neutral-50 dark:bg-neutral-950 border border-border p-2.5 rounded">
                    <PlayCircle className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground block">
                        Study Task
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {nextTask}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded border border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  No Active Study Roadmap
                </h3>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Unlock custom step-by-step weekly study plans and project
                  goals by scanning your profile gaps.
                </p>
              </div>
              <Link
                href="/dashboard/roadmap"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0"
              >
                Assemble Study Path
              </Link>
            </div>
          )}

          {/* Widget 6: Recent Activity & Workspace Setup Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Activity List Panel */}
            <div className="md:col-span-2 glass-panel p-6 rounded border border-border space-y-4">
              <h3 className="font-bold text-sm">
                Recent Activities
              </h3>

              {stats.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground text-xs font-semibold">
                    ∅
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold">
                      No recent activity found
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm">
                      Actions like analyzing resumes or completing simulations
                      will appear here.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Upload CV
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1 pr-4">
                        <p className="text-xs font-bold leading-none">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {activity.description}
                        </p>
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
            <div className="glass-panel p-6 rounded border border-border flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Next Career Steps</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your CareerPilot onboarding to receive custom skill
                  roadmaps and targeted interview simulator sessions.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/dashboard/resume"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-foreground" />
                    Upload New Resume
                  </span>
                  <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/dashboard/interview"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-foreground" />
                    Simulate Interview
                  </span>
                  <Play className="h-3 w-3 text-muted-foreground fill-muted-foreground" />
                </Link>

                <Link
                  href="/profile"
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-foreground" />
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

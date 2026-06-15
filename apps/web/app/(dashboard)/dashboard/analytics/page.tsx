"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Minus, 
  FileText, 
  Activity, 
  MessageSquare, 
  Award, 
  AlertTriangle, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles
} from "lucide-react";
import { analyticsService, AnalyticsDashboardData, AnalyticsSnapshot } from "../../../../services/analytics";

type DateRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [focusedMetric, setFocusedMetric] = useState<string>("readiness");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboardData();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to retrieve your career performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setSuccessMessage(null);
    try {
      await analyticsService.generateReport("comprehensive", "Premium Executive Career Report");
      setSuccessMessage("Premium career report generated successfully! View it under Available Reports.");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error generating report: " + (err?.message || err));
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  if (!data || !data.latest_metrics) {
    return <EmptyState onGenerate={handleGenerateReport} loading={generatingReport} />;
  }

  const { latest_metrics, snapshots, recent_reports, readiness_breakdown, growth_insights } = data;

  // Filter snapshots by date range
  const filteredSnapshots = () => {
    if (!snapshots || snapshots.length === 0) return [];
    
    // Sort snapshots chronologically
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );

    const now = new Date();
    let cutoff = new Date();
    if (dateRange === "7d") cutoff.setDate(now.getDate() - 7);
    else if (dateRange === "30d") cutoff.setDate(now.getDate() - 30);
    else if (dateRange === "90d") cutoff.setDate(now.getDate() - 90);
    else return sorted;

    return sorted.filter(s => new Date(s.snapshot_date) >= cutoff);
  };

  const activeSnapshots = filteredSnapshots();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Telemetry & Analytics Platform
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise-grade career readiness indexes and AI-driven growth telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selectors */}
          <div className="inline-flex bg-neutral-50 dark:bg-neutral-900 p-1 rounded border border-border">
            {(["7d", "30d", "90d", "all"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  dateRange === range
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {generatingReport ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Run Audit Report
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground rounded text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TOP GLOWING SCORE MATRIX CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Core Readiness Gauge */}
        <div 
          onClick={() => setFocusedMetric("readiness")}
          className={`glass-panel p-6 rounded border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            focusedMetric === "readiness" 
              ? "border-foreground ring-1 ring-foreground/20 bg-neutral-50 dark:bg-neutral-900" 
              : "border-border hover:border-foreground/35"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Readiness Score</span>
            <Award className="h-4.5 w-4.5 text-foreground" />
          </div>

          <div className="flex items-center gap-4 py-3">
            <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-100 dark:text-neutral-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-foreground transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={`${latest_metrics.career_readiness_score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-sm font-extrabold text-foreground">{Math.round(latest_metrics.career_readiness_score)}</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                {latest_metrics.career_readiness_score >= 80 ? "Premium Elite" : latest_metrics.career_readiness_score >= 60 ? "Growth Steady" : "Needs Review"}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Weighted capability index</p>
            </div>
          </div>

          <div className="text-[9px] text-muted-foreground font-semibold mt-2 border-t border-border pt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Targeting 85+ baseline</span>
          </div>
        </div>

        {/* Growth Index Score */}
        <div 
          onClick={() => setFocusedMetric("growth")}
          className={`glass-panel p-6 rounded border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            focusedMetric === "growth" 
              ? "border-foreground ring-1 ring-foreground/20 bg-neutral-50 dark:bg-neutral-900" 
              : "border-border hover:border-foreground/35"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overall Growth</span>
            <Activity className="h-4.5 w-4.5 text-foreground" />
          </div>

          <div className="py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                +{latest_metrics.overall_growth_score}%
              </span>
              <span className="text-[9px] px-2 py-0.5 font-bold rounded border border-border bg-neutral-100 dark:bg-neutral-900 text-foreground capitalize">
                Positive Trend
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Relative growth vs initial career baseline</p>
          </div>

          <div className="text-[9px] text-muted-foreground font-semibold mt-2 border-t border-border pt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Improved by 12 points this week</span>
          </div>
        </div>

        {/* Resume & ATS Score */}
        <div 
          onClick={() => setFocusedMetric("resume")}
          className={`glass-panel p-6 rounded border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            focusedMetric === "resume" 
              ? "border-foreground ring-1 ring-foreground/20 bg-neutral-50 dark:bg-neutral-900" 
              : "border-border hover:border-foreground/35"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resume / ATS Index</span>
            <FileText className="h-4.5 w-4.5 text-foreground" />
          </div>

          <div className="py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {Math.round((latest_metrics.resume_score + latest_metrics.ats_score) / 2)}%
              </span>
              <span className="text-[9px] px-2 py-0.5 font-bold rounded border border-border bg-neutral-100 dark:bg-neutral-900 text-foreground capitalize">
                {latest_metrics.ats_score >= 80 ? "Optimal" : "Needs Keywords"}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Formatting & keyword matching coverage</p>
          </div>

          <div className="text-[9px] text-muted-foreground font-semibold mt-2 border-t border-border pt-2 flex items-center gap-1">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <span>Latest parse scan completed today</span>
          </div>
        </div>

        {/* Simulation & Roadmap Score */}
        <div 
          onClick={() => setFocusedMetric("readiness_actions")}
          className={`glass-panel p-6 rounded border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            focusedMetric === "readiness_actions" 
              ? "border-foreground ring-1 ring-foreground/20 bg-neutral-50 dark:bg-neutral-900" 
              : "border-border hover:border-foreground/35"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Practice Readiness</span>
            <MessageSquare className="h-4.5 w-4.5 text-foreground" />
          </div>

          <div className="py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {Math.round((latest_metrics.interview_readiness + latest_metrics.roadmap_completion) / 2)}%
              </span>
              <span className="text-[9px] px-2 py-0.5 font-bold rounded border border-border bg-neutral-100 dark:bg-neutral-900 text-foreground capitalize">
                Steady
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Roadmap completions & mock interview scores</p>
          </div>

          <div className="text-[9px] text-muted-foreground font-semibold mt-2 border-t border-border pt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Interview rating up 5% recently</span>
          </div>
        </div>
      </div>

      {/* CORE TELEMETRY TREND GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TrendChart (Area chart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Historical Readiness Telemetry</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dynamic path check of metrics logged across study milestones.</p>
            </div>
            <span className="text-[10px] font-mono bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border border-border font-bold">
              FOCUS: {focusedMetric.toUpperCase()}
            </span>
          </div>

          <div className="h-64 relative w-full pt-4">
            {activeSnapshots.length < 2 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs text-muted-foreground">Insufficient snapshot historical logs to render area curve.</span>
                <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">Take mock interviews or mark roadmap tasks done to populate telemetry.</p>
              </div>
            ) : (
              <TrendChartSVG snapshots={activeSnapshots} focusedMetric={focusedMetric} />
            )}
          </div>
        </div>

        {/* Metric Weights Breakdown */}
        <div className="glass-panel p-6 rounded border border-border space-y-5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
            Readiness Scoring Algorithm
          </h3>
          
          <div className="space-y-4">
            {readiness_breakdown && Object.entries(readiness_breakdown).map(([key, val]: [string, any]) => {
              if (key === "career_readiness_score" || key === "overall_growth_score") return null;
              
              const labelMap: Record<string, string> = {
                resume_quality: "Resume Quality",
                skill_coverage: "Skill Coverage",
                career_alignment: "Career Alignment",
                roadmap_progress: "Roadmap Progress",
                interview_performance: "Interview Readiness",
                learning_consistency: "Consistency Metrics",
              };

              const label = labelMap[key] || key;

              return (
                <div key={key} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{label}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <span>wt: {intPct(val.weight)}</span>
                      <span className="font-bold text-foreground">{Math.round(val.score)}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-900 border border-border rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-foreground" 
                      style={{ width: `${val.score}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SWOT INSIGHTS & ACTIONS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SWOT quadrant display */}
        <div className="lg:col-span-2 glass-panel p-6 rounded border border-border space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-3 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-foreground" />
            AI SWOT Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Strengths */}
            <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground">Strengths</span>
              <ul className="space-y-1.5">
                {growth_insights.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <CheckCircle2 className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground">Weaknesses</span>
              <ul className="space-y-1.5">
                {growth_insights.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <XCircle className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground">Opportunities</span>
              <ul className="space-y-1.5">
                {growth_insights.opportunities.map((opp, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <TrendingUp className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground">Risks</span>
              <ul className="space-y-1.5">
                {growth_insights.risks.map((risk, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Immediate actionable steps */}
        <div className="glass-panel p-6 rounded border border-border space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-3 flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-foreground" />
            Priority Next Steps
          </h3>

          <div className="space-y-3 pt-2">
            {growth_insights.next_steps.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-neutral-50 dark:bg-neutral-950 border border-border p-3 rounded hover:border-foreground/35 transition-colors">
                <span className="h-5 w-5 rounded border border-border bg-card text-foreground flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER ROW: RECENT REPORTS TABLE */}
      <div className="glass-panel p-6 rounded border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Available Performance Audits</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Historical records of generated McKinsey-style intelligence PDF/Excel exports.</p>
          </div>
          <Link 
            href="/dashboard/reports" 
            className="text-xs font-bold text-foreground hover:underline flex items-center gap-0.5 uppercase tracking-wider text-[11px]"
          >
            Manage Reports <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recent_reports.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-muted-foreground">No reports generated yet. Click "Run Audit Report" above to compile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-foreground border-collapse">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Report Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Score Index</th>
                  <th className="px-6 py-3">Date Compiled</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {recent_reports.map((report) => (
                  <tr key={report.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/40">
                    <td className="px-6 py-3.5 font-bold text-foreground">{report.title}</td>
                    <td className="px-6 py-3.5 capitalize text-muted-foreground">{report.report_type}</td>
                    <td className="px-6 py-3.5 font-bold">{report.data.breakdown?.career_readiness_score || 0}/100</td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold">
                      <Link
                        href="/dashboard/reports"
                        className="text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 uppercase tracking-wider text-[10px]"
                      >
                        Open Vault <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// CUSTOM SVG TREND CHART COMPONENT
// ==========================================
function TrendChartSVG({ 
  snapshots, 
  focusedMetric 
}: { 
  snapshots: AnalyticsSnapshot[]; 
  focusedMetric: string 
}) {
  const width = 800;
  const height = 250;
  const paddingX = 50;
  const paddingY = 40;

  // Metric mappings
  const getMetricVal = (s: AnalyticsSnapshot) => {
    switch (focusedMetric) {
      case "resume":
        return (s.resume_score + s.ats_score) / 2;
      case "readiness_actions":
        return (s.interview_readiness + s.roadmap_completion) / 2;
      case "growth":
        return s.overall_growth_score;
      case "readiness":
      default:
        return s.career_readiness_score;
    }
  };
  const maxScore = 100;

  const pointsCount = snapshots.length;
  
  // Calculate SVG Coordinates
  const points = snapshots.map((s, idx) => {
    const divisor = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (idx / divisor) * (width - 2 * paddingX);
    const score = getMetricVal(s);
    const y = height - paddingY - (score / maxScore) * (height - 2 * paddingY);
    return { x, y, score, date: s.snapshot_date };
  });

  // Polyline coordinates string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) {
    return null;
  }

  // Closed area polygon coordinates string
  const areaPoints = [
    `${firstPoint.x},${height - paddingY}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${lastPoint.x},${height - paddingY}`
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="g-monochrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#737373" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#737373" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = height - paddingY - (tick / 100) * (height - 2 * paddingY);
        return (
          <g key={tick} className="opacity-40">
            <line
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#e5e5e5"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={paddingX - 10}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] font-mono fill-muted-foreground"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* X-Axis Ticks & Dates */}
      {points.map((p, idx) => {
        // Render 5 dates maximum to prevent overcrowding
        if (pointsCount > 5 && idx % Math.ceil(pointsCount / 5) !== 0 && idx !== pointsCount - 1) return null;
        
        const formattedDate = new Date(p.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

        return (
          <g key={idx}>
            <line
              x1={p.x}
              y1={height - paddingY}
              x2={p.x}
              y2={height - paddingY + 5}
              stroke="#d4d4d4"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={height - paddingY + 18}
              textAnchor="middle"
              className="text-[9px] font-bold fill-muted-foreground"
            >
              {formattedDate}
            </text>
          </g>
        );
      })}

      {/* Filled Area */}
      <polygon
        points={areaPoints}
        fill="url(#g-monochrome)"
      />

      {/* Connection Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#404040"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Node Dots */}
      {points.map((p, idx) => (
        <g key={idx} className="group">
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#ffffff"
            stroke="#404040"
            strokeWidth="2"
            className="cursor-pointer transition-all hover:scale-150"
          />
          <title>{`${new Date(p.date).toLocaleDateString()}: ${Math.round(p.score)}%`}</title>
        </g>
      ))}
    </svg>
  );
}

// Helpers
const intPct = (val: number) => `${Math.round(val * 100)}%`;

// FALLBACK STATE COMPONENT LAYOUTS
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <RefreshCw className="h-6 w-6 text-foreground animate-spin" />
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground animate-pulse">Running telemetry calculation...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto p-6 border border-border bg-neutral-50 dark:bg-neutral-950 rounded flex flex-col items-center justify-center text-center space-y-4 mt-12 shadow-sm">
      <div className="h-10 w-10 rounded border border-border flex items-center justify-center">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Telemetry Connection Error</h3>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry Calculation
      </button>
    </div>
  );
}

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className="max-w-2xl mx-auto p-12 border border-border bg-card rounded flex flex-col items-center justify-center text-center space-y-6 mt-12">
      <div className="h-12 w-12 rounded border border-border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-foreground font-bold">
        <Activity className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">No Analytics Telemetry Profile</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          CareerPilot AI has not gathered telemetry updates from your profile. Generate your initial McKinsey-style audit report to trigger backend capability scans.
        </p>
      </div>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-foreground text-background rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        {loading ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Run Onboarding Audit Report
      </button>
    </div>
  );
}

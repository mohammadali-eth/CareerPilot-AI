"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Sparkles, 
  Calendar, 
  ArrowLeft,
  RefreshCw,
  Plus,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Layers,
  MessageSquare,
  X,
  AlertTriangle
} from "lucide-react";
import { analyticsService, AnalyticsReport, ReportExport } from "../../../../services/analytics";

type ReportType = "comprehensive" | "skills" | "interview";

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create report inputs
  const [createType, setCreateType] = useState<ReportType>("comprehensive");
  const [createTitle, setCreateTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Selected report details drawer
  const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null);

  // Export modal state
  const [exportModalReport, setExportModalReport] = useState<AnalyticsReport | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ReportExport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.listReports();
      setReports(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load reports from your vault.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const title = createTitle.trim() || undefined;
      const newReport = await analyticsService.generateReport(createType, title);
      setReports([newReport, ...reports]);
      setCreateTitle("");
      setSelectedReport(newReport); // Auto-open the newly generated report
    } catch (err: any) {
      alert("Error generating report: " + (err?.message || err));
    } finally {
      setCreating(false);
    }
  };

  const handleTriggerExport = async () => {
    if (!exportModalReport) return;
    setExporting(true);
    setExportResult(null);
    try {
      const res = await analyticsService.exportReport(exportModalReport.id, exportFormat);
      setExportResult(res);
      
      // Auto-trigger browser download
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const downloadUrl = apiBaseUrl.replace("/api/v1", "") + res.export_url;
      
      // Delay slightly for visual feedback
      setTimeout(() => {
        window.open(downloadUrl, "_blank");
      }, 800);
    } catch (err: any) {
      alert("Export failed: " + (err?.message || err));
    } finally {
      setCreating(false); // Wait, make sure we set exporting to false
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-6 w-6 text-foreground animate-spin" />
        <span className="text-xs text-muted-foreground">Opening your report vault...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 border border-border bg-neutral-50 dark:bg-neutral-950 rounded flex flex-col items-center justify-center text-center space-y-4 mt-12 shadow-sm">
        <AlertTriangle className="h-8 w-8 text-foreground" />
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Vault Loading Error</h3>
          <p className="text-[11px] text-muted-foreground mt-1">{error}</p>
        </div>
        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Performance Reports Vault
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access, view, and export your premium Deloitte/McKinsey-style telemetry audits.
          </p>
        </div>
        <Link 
          href="/dashboard/analytics" 
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Analytics Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO-THIRDS: MAIN REPORTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded border border-border space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
              Generated Reports ({reports.length})
            </h3>

            {reports.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-12 w-12 rounded border border-border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mx-auto text-muted-foreground">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Your vault is empty</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                    Compile your first comprehensive, skills, or interview readiness audit using the generator on the right.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div 
                    key={report.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 px-2 rounded transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded border border-border flex items-center justify-center shrink-0 bg-neutral-50 dark:bg-neutral-900 text-foreground">
                        {report.report_type === "comprehensive" ? (
                          <FileCheck className="h-5 w-5" />
                        ) : report.report_type === "skills" ? (
                          <Layers className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground hover:underline cursor-pointer" onClick={() => setSelectedReport(report)}>
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="capitalize px-1.5 py-0.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 font-bold text-[9px] uppercase tracking-wider">
                            {report.report_type}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground uppercase tracking-wider">
                        Score: {report.data?.breakdown?.career_readiness_score || 0}/100
                      </span>
                      
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1.5 text-[11px] font-bold border border-border bg-card hover:bg-neutral-100 text-foreground rounded uppercase tracking-wider transition-all"
                      >
                        Read
                      </button>
                      
                      <button 
                        onClick={() => setExportModalReport(report)}
                        className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:bg-neutral-100 rounded transition-all"
                        title="Download/Export"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ONE-THIRD: NEW REPORT GENERATOR */}
        <div className="glass-panel p-6 rounded border border-border space-y-6">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Generate Audit Report</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Compile live telemetry from resume, skills, target, and simulations.
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Report Focus</label>
              <div className="grid grid-cols-3 gap-2">
                {(["comprehensive", "skills", "interview"] as ReportType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCreateType(type)}
                    className={`py-2 text-[10px] font-bold rounded border capitalize transition-all ${
                      createType === type
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-950"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Custom Title (Optional)</label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="e.g. Q2 Performance Audit"
                className="w-full text-xs px-3 py-2 border border-border rounded focus:ring-1 focus:ring-foreground bg-background outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Compiling Telemetry...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate Live Audit</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded border border-border space-y-2">
            <span className="text-[9px] uppercase font-bold text-foreground tracking-widest block">Premium Standard</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Every audit report utilizes advanced NLP metrics to parse keyword gaps and compiles a running SWOT matrix in McKinsey/Deloitte style.
            </p>
          </div>
        </div>
      </div>

      {/* 1. DETAILED REPORT VIEWER OVERLAY */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-3xl bg-card border-l border-border h-full shadow-2xl flex flex-col animate-slideLeft overflow-y-auto">
            
            {/* Viewer Header */}
            <div className="h-16 border-b border-border px-6 flex items-center justify-between shrink-0 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-900 rounded border border-border text-foreground"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
                <div>
                  <h3 className="text-xs font-bold text-foreground truncate max-w-md">{selectedReport.title}</h3>
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">
                    ID: {selectedReport.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportModalReport(selectedReport)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background rounded text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export File
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-1 hover:bg-neutral-250 dark:hover:bg-neutral-900 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Viewer Body (Scrollable) */}
            <div className="flex-1 p-8 space-y-6">
              
              {/* Cover info */}
              <div className="border-b border-border pb-6 space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Executive Report Portfolio</span>
                <h2 className="text-2xl font-black text-foreground leading-tight">{selectedReport.title}</h2>
                <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground pt-1">
                  <span><b>Format:</b> McKinsey Corporate Profile</span>
                  <span>•</span>
                  <span><b>Date:</b> {new Date(selectedReport.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span><b>Readiness Index:</b> {selectedReport.data.breakdown?.career_readiness_score || 0}/100</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Executive Summary</h4>
                <p className="text-xs text-muted-foreground leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded border border-border">
                  {selectedReport.summary || `This comprehensive performance portfolio evaluates the candidate's core readiness rating at ${selectedReport.data.breakdown?.career_readiness_score || 0}/100. Telemetry data pulls from structural resume formatting audits, ATS keyword parsing, milestone tracking inside the roadmap syllabus, and mock simulation results.`}
                </p>
              </div>

              {/* Core Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Readiness Matrix Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.data.breakdown && Object.entries(selectedReport.data.breakdown).map(([key, val]: [string, any]) => {
                    if (key === "career_readiness_score" || key === "overall_growth_score") return null;
                    const labels: Record<string, string> = {
                      resume_quality: "Resume Quality",
                      skill_coverage: "Skill Coverage",
                      career_alignment: "Goal Alignment",
                      roadmap_progress: "Roadmap Milestones",
                      interview_performance: "Interview Readiness",
                      learning_consistency: "Consistency telemetries"
                    };
                    return (
                      <div key={key} className="p-3 border border-border rounded bg-card space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{labels[key]}</span>
                          <span className="text-xs font-bold font-mono text-foreground">{Math.round(val.score)}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{val.description}</p>
                        <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-muted-foreground border-t border-border mt-1">
                          <span>weight: {Math.round(val.weight * 100)}%</span>
                          <span className="text-foreground uppercase tracking-wider">{val.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SWOT quadrants */}
              {selectedReport.data.insights && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AI SWOT Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-foreground tracking-wider block">Strengths</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.strengths.map((str, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-foreground tracking-wider block">Weaknesses</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.weaknesses.map((weak, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {weak}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-foreground tracking-wider block">Opportunities</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.opportunities.map((opp, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {opp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-foreground tracking-wider block">Risks</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.risks.map((risk, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action recommendations */}
              {selectedReport.data.insights && (
                <div className="space-y-4 border-t border-border pt-6">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Strategic Recommendations</h4>
                  
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold text-foreground uppercase tracking-wider text-[9px] block">Career Goal Suggestion</span>
                      <p className="text-muted-foreground mt-0.5">{selectedReport.data.insights.career_suggestions}</p>
                    </div>
                    <div>
                      <span className="font-bold text-foreground uppercase tracking-wider text-[9px] block">Roadmap Target Suggestions</span>
                      <p className="text-muted-foreground mt-0.5">{selectedReport.data.insights.roadmap_suggestions}</p>
                    </div>
                    <div>
                      <span className="font-bold text-foreground uppercase tracking-wider text-[9px] block">Simulation Prep Advice</span>
                      <p className="text-muted-foreground mt-0.5">{selectedReport.data.insights.interview_suggestions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist Next Steps */}
              {selectedReport.data.insights && (
                <div className="space-y-3 border-t border-border pt-6">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Immediate Next Action Steps</h4>
                  <div className="space-y-2">
                    {selectedReport.data.insights.next_steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-neutral-50 dark:bg-neutral-900 p-2.5 border border-border rounded text-xs">
                        <span className="font-bold text-foreground shrink-0">{idx + 1}.</span>
                        <span className="text-muted-foreground leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 2. EXPORT MODAL DIALOGUE */}
      {exportModalReport && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-card rounded border border-border p-6 shadow-2xl space-y-6 animate-scaleIn">
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Export Performance Audit</h3>
              <button 
                onClick={() => {
                  setExportModalReport(null);
                  setExportResult(null);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Export Format Selection</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "pdf", name: "PDF Corporate", desc: "Corporate McKinsey standard", icon: FileText },
                  { id: "excel", name: "Excel Sheet", desc: "Interactive scores & data", icon: FileSpreadsheet },
                  { id: "csv", name: "CSV Raw", desc: "Simple comma values list", icon: BarChart3 },
                  { id: "markdown", name: "Markdown File", desc: "Raw text readme summary", icon: Sparkles }
                ].map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`p-3 rounded border text-left flex flex-col justify-between h-20 transition-all ${
                        exportFormat === format.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground/50 bg-neutral-50 dark:bg-neutral-950 text-foreground"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block leading-tight">{format.name}</span>
                        <span className="text-[8px] text-muted-foreground block truncate max-w-[150px] leading-tight mt-0.5">{format.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {exportResult ? (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-border rounded flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-foreground shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-foreground block">File compiled successfully!</span>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                    Browser download triggered. If it did not open, click the url below.
                  </p>
                  <a 
                    href={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "") + exportResult.export_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-bold text-foreground hover:underline mt-1 block"
                  >
                    Direct Download URL
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded border border-border">
                Compiling files triggers real-time telemetry parses. PDF files generate dynamic running canvas page numbers.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => {
                  setExportModalReport(null);
                  setExportResult(null);
                }}
                className="px-4 py-2 border border-border hover:bg-neutral-100 text-xs font-bold rounded text-foreground uppercase tracking-wider transition-all"
              >
                Close
              </button>
              
              <button
                onClick={handleTriggerExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold rounded uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Compiling File...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

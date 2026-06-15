"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Download, FileSpreadsheet, FileText, Sparkles, Calendar, ArrowLeft, Loader2, AlertTriangle, RefreshCw, Plus, CheckCircle, FileCheck, TrendingUp, Layers, MessageSquare, X } from "lucide-react";
import { analyticsService } from "../../../../services/analytics";
export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Create report inputs
    const [createType, setCreateType] = useState("comprehensive");
    const [createTitle, setCreateTitle] = useState("");
    const [creating, setCreating] = useState(false);
    // Selected report details drawer
    const [selectedReport, setSelectedReport] = useState(null);
    // Export modal state
    const [exportModalReport, setExportModalReport] = useState(null);
    const [exportFormat, setExportFormat] = useState("pdf");
    const [exporting, setExporting] = useState(false);
    const [exportResult, setExportResult] = useState(null);
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.listReports();
            setReports(data);
        }
        catch (err) {
            console.error(err);
            setError(err?.message || "Failed to load reports from your vault.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchReports();
    }, []);
    const handleCreateReport = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const title = createTitle.trim() || undefined;
            const newReport = await analyticsService.generateReport(createType, title);
            setReports([newReport, ...reports]);
            setCreateTitle("");
            setSelectedReport(newReport); // Auto-open the newly generated report
        }
        catch (err) {
            alert("Error generating report: " + (err?.message || err));
        }
        finally {
            setCreating(false);
        }
    };
    const handleTriggerExport = async () => {
        if (!exportModalReport)
            return;
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
        }
        catch (err) {
            alert("Export failed: " + (err?.message || err));
        }
        finally {
            setExporting(false);
        }
    };
    if (loading) {
        return (<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin"/>
        <span className="text-xs text-muted-foreground">Opening your report vault...</span>
      </div>);
    }
    if (error) {
        return (<div className="max-w-md mx-auto p-6 border border-destructive/20 bg-destructive/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 mt-12 shadow-sm">
        <AlertTriangle className="h-8 w-8 text-destructive"/>
        <div>
          <h3 className="text-sm font-bold text-foreground">Vault Loading Error</h3>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        <button onClick={fetchReports} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 text-xs font-semibold transition-all">
          <RefreshCw className="h-4 w-4"/>
          Retry Connection
        </button>
      </div>);
    }
    return (<div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">
            Performance Reports Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access, view, and export your premium Deloitte/McKinsey-style telemetry audits.
          </p>
        </div>
        <Link href="/dashboard/analytics" className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-card hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm">
          <TrendingUp className="h-3.5 w-3.5"/>
          Open Analytics Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO-THIRDS: MAIN REPORTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-border/60 pb-3">
              Generated Reports ({reports.length})
            </h3>

            {reports.length === 0 ? (<div className="text-center py-12 space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                  <BarChart3 className="h-6 w-6"/>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Your vault is empty</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-sm mx-auto">
                    Compile your first comprehensive, skills, or interview readiness audit using the generator on the right.
                  </p>
                </div>
              </div>) : (<div className="divide-y divide-border">
                {reports.map((report) => (<div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 hover:bg-slate-50/40 px-2 rounded-xl transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${report.report_type === "comprehensive"
                    ? "bg-indigo-50 text-indigo-600"
                    : report.report_type === "skills"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"}`}>
                        {report.report_type === "comprehensive" ? (<FileCheck className="h-5 w-5"/>) : report.report_type === "skills" ? (<Layers className="h-5 w-5"/>) : (<MessageSquare className="h-5 w-5"/>)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 hover:text-indigo-600 cursor-pointer" onClick={() => setSelectedReport(report)}>
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-muted font-semibold">
                            {report.report_type}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3"/>
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        Score: {report.data?.breakdown?.career_readiness_score || 0}/100
                      </span>
                      
                      <button onClick={() => setSelectedReport(report)} className="px-3 py-1.5 text-[11px] font-bold border border-border hover:bg-muted text-slate-700 rounded-lg transition-all">
                        Read
                      </button>
                      
                      <button onClick={() => setExportModalReport(report)} className="p-1.5 border border-border text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Download/Export">
                        <Download className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                  </div>))}
              </div>)}
          </div>
        </div>

        {/* RIGHT ONE-THIRD: NEW REPORT GENERATOR */}
        <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Generate Audit Report</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Compile live telemetry from resume, skills, target, and simulations.
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Report Focus</label>
              <div className="grid grid-cols-3 gap-2">
                {["comprehensive", "skills", "interview"].map((type) => (<button key={type} type="button" onClick={() => setCreateType(type)} className={`py-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${createType === type
                ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30"
                : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                    {type}
                  </button>))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Custom Title (Optional)</label>
              <input type="text" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="e.g. Q2 Performance Audit" className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-background outline-none transition-all"/>
            </div>

            <button type="submit" disabled={creating} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2">
              {creating ? (<>
                  <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                  <span>Compiling Telemetry...</span>
                </>) : (<>
                  <Plus className="h-3.5 w-3.5"/>
                  <span>Generate Live Audit</span>
                </>)}
            </button>
          </form>

          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-2">
            <span className="text-[9px] uppercase font-bold text-indigo-700 tracking-wider">Premium Standard</span>
            <p className="text-[10px] text-indigo-900/80 leading-relaxed">
              Every audit report utilizes advanced NLP metrics to parse keyword gaps and compiles a running SWOT matrix in McKinsey/Deloitte style.
            </p>
          </div>
        </div>
      </div>

      {/* 1. DETAILED REPORT VIEWER OVERLAY */}
      {selectedReport && (<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-3xl bg-background h-full shadow-2xl flex flex-col animate-slideLeft">
            
            {/* Viewer Header */}
            <div className="h-16 border-b border-border px-6 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500">
                  <ArrowLeft className="h-4.5 w-4.5"/>
                </button>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 truncate max-w-md">{selectedReport.title}</h3>
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">
                    ID: {selectedReport.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setExportModalReport(selectedReport)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all">
                  <Download className="h-3.5 w-3.5"/>
                  Export File
                </button>
                <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400">
                  <X className="h-4.5 w-4.5"/>
                </button>
              </div>
            </div>

            {/* Viewer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Cover info */}
              <div className="border-b border-border/80 pb-6 space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-600">Executive Report Portfolio</span>
                <h2 className="text-2xl font-black text-slate-850 leading-tight">{selectedReport.title}</h2>
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
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Executive Summary</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-border/40">
                  {selectedReport.summary || `This comprehensive performance portfolio evaluates the candidate's core readiness rating at ${selectedReport.data.breakdown?.career_readiness_score || 0}/100. Telemetry data pulls from structural resume formatting audits, ATS keyword parsing, milestone tracking inside the roadmap syllabus, and mock simulation results.`}
                </p>
              </div>

              {/* Core Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Readiness Matrix Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.data.breakdown && Object.entries(selectedReport.data.breakdown).map(([key, val]) => {
                if (key === "career_readiness_score" || key === "overall_growth_score")
                    return null;
                const labels = {
                    resume_quality: "Resume Quality",
                    skill_coverage: "Skill Coverage",
                    career_alignment: "Goal Alignment",
                    roadmap_progress: "Roadmap Milestones",
                    interview_performance: "Interview Readiness",
                    learning_consistency: "Consistency telemetries"
                };
                return (<div key={key} className="p-3 border border-border/60 rounded-xl space-y-1 bg-card">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{labels[key]}</span>
                          <span className="text-xs font-bold font-mono text-indigo-600">{Math.round(val.score)}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{val.description}</p>
                        <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                          <span>weight: {Math.round(val.weight * 100)}%</span>
                          <span className="text-indigo-600 capitalize">{val.status}</span>
                        </div>
                      </div>);
            })}
                </div>
              </div>

              {/* SWOT quadrants */}
              {selectedReport.data.insights && (<div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI SWOT Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.01] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Strengths</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.strengths.map((str, idx) => (<li key={idx} className="text-xs text-slate-700">• {str}</li>))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.01] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Weaknesses</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.weaknesses.map((weak, idx) => (<li key={idx} className="text-xs text-slate-700">• {weak}</li>))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/[0.01] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Opportunities</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.opportunities.map((opp, idx) => (<li key={idx} className="text-xs text-slate-700">• {opp}</li>))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/[0.01] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Risks</span>
                      <ul className="space-y-1">
                        {selectedReport.data.insights.risks.map((risk, idx) => (<li key={idx} className="text-xs text-slate-700">• {risk}</li>))}
                      </ul>
                    </div>
                  </div>
                </div>)}

              {/* Action recommendations */}
              {selectedReport.data.insights && (<div className="space-y-4 border-t border-border pt-6">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Strategic Recommendations</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">Career Goal Suggestion</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{selectedReport.data.insights.career_suggestions}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Roadmap Target Suggestions</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{selectedReport.data.insights.roadmap_suggestions}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Simulation Prep Advice</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{selectedReport.data.insights.interview_suggestions}</p>
                    </div>
                  </div>
                </div>)}

              {/* Checklist Next Steps */}
              {selectedReport.data.insights && (<div className="space-y-3 border-t border-border pt-6">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Immediate Next Action Steps</h4>
                  <div className="space-y-2">
                    {selectedReport.data.insights.next_steps.map((step, idx) => (<div key={idx} className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg border border-border/40 text-xs">
                        <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                        <span className="text-slate-700 leading-relaxed">{step}</span>
                      </div>))}
                  </div>
                </div>)}

            </div>
          </div>
        </div>)}

      {/* 2. EXPORT MODAL DIALOGUE */}
      {exportModalReport && (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-background rounded-3xl border border-border p-6 shadow-2xl space-y-6 animate-scaleIn">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Export Performance Audit</h3>
              <button onClick={() => {
                setExportModalReport(null);
                setExportResult(null);
            }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="h-4 w-4"/>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Export Format Selection</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                { id: "pdf", name: "PDF Corporate", desc: "Corporate McKinsey standard", icon: FileText, color: "text-indigo-500" },
                { id: "excel", name: "Excel Sheet", desc: "Interactive scores & data", icon: FileSpreadsheet, color: "text-emerald-500" },
                { id: "csv", name: "CSV Raw", desc: "Simple comma values list", icon: BarChart3, color: "text-blue-500" },
                { id: "markdown", name: "Markdown File", desc: "Raw text readme summary", icon: Sparkles, color: "text-purple-500" }
            ].map((format) => {
                const Icon = format.icon;
                return (<button key={format.id} onClick={() => setExportFormat(format.id)} className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${exportFormat === format.id
                        ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/10"
                        : "border-border hover:border-indigo-400/40"}`}>
                      <Icon className={`h-4.5 w-4.5 ${format.color}`}/>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-800 block leading-tight">{format.name}</span>
                        <span className="text-[8px] text-muted-foreground block truncate max-w-[150px] leading-tight mt-0.5">{format.desc}</span>
                      </div>
                    </button>);
            })}
              </div>
            </div>

            {exportResult ? (<div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0"/>
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 block">File compile successfully!</span>
                  <p className="text-[9px] text-emerald-700 mt-0.5 leading-tight">
                    Browser download triggered. If it did not open, click the url below.
                  </p>
                  <a href={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "") + exportResult.export_url} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-indigo-600 hover:underline mt-1 block">
                    Direct Download URL
                  </a>
                </div>
              </div>) : (<p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border/50">
                Compiling files triggers real-time telemetry parses. PDF files generate dynamic running canvas page numbers.
              </p>)}

            <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
              <button onClick={() => {
                setExportModalReport(null);
                setExportResult(null);
            }} className="px-4 py-2 border border-border hover:bg-muted text-xs font-bold rounded-xl text-slate-700 transition-all">
                Close
              </button>
              
              <button onClick={handleTriggerExport} disabled={exporting} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50">
                {exporting ? (<>
                    <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                    <span>Compiling File...</span>
                  </>) : (<>
                    <Download className="h-3.5 w-3.5"/>
                    <span>Download File</span>
                  </>)}
              </button>
            </div>

          </div>
        </div>)}

    </div>);
}

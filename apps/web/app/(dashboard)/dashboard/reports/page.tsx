"use client";

import React from "react";
import { BarChart3, Download, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, export, or download complete summaries of your parsed profiles and roadmaps.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-border space-y-6">
        <h3 className="font-bold text-lg">Available Reports</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold">Resume Fit Analysis Report</h4>
                <p className="text-[10px] text-muted-foreground">PDF Summary of skills & ATS checks</p>
              </div>
            </div>
            <button className="p-2 border border-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FileSpreadsheet className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold">Skill Gap Roadmap CSV</h4>
                <p className="text-[10px] text-muted-foreground">List of milestones and resource URLs</p>
              </div>
            </div>
            <button className="p-2 border border-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

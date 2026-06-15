"use client";

import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function SkillGapPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare your current technical skillset against standard targets for your desired role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Gaps */}
        <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
          <h3 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Focus Areas (Gaps)
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <h4 className="text-xs font-semibold">Kubernetes / Docker</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Required in 80% of targeted staff roles. Recommended courses: Docker Mastery.
              </p>
            </div>
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <h4 className="text-xs font-semibold">GraphQL APIs</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Target positions require schema setups and query optimization capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Validated Skills */}
        <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Matched Skills
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <h4 className="text-xs font-semibold">TypeScript & React</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Strong proficiency matched from 4 previous work experience descriptions.
              </p>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <h4 className="text-xs font-semibold">SQL & PostgreSQL</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Database schema migrations and queries verified from resume parsing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

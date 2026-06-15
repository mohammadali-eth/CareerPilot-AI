"use client";

import React from "react";
import { Briefcase, ArrowUpRight, Search } from "lucide-react";

export default function CareerMatchPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Career Match</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Evaluate how your profile aligns with target roles across leading tech
          companies.
        </p>
      </div>

      <div className="glass-panel p-8 rounded border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Target Role Alignments</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              className="pl-8 pr-4 py-1.5 w-full bg-background border border-border rounded text-xs focus:outline-none focus:border-foreground transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded border border-border flex items-center justify-center text-foreground bg-neutral-50 dark:bg-neutral-900">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  Senior Full Stack Engineer
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Vercel — Remote</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-white bg-black border border-black dark:text-black dark:bg-white dark:border-white px-2 py-0.5 rounded uppercase tracking-wider">
                89% Match
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded border border-border flex items-center justify-center text-foreground bg-neutral-50 dark:bg-neutral-900">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  Staff Frontend Engineer
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Stripe — San Francisco, CA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-foreground bg-neutral-100 border border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 px-2 py-0.5 rounded uppercase tracking-wider">
                74% Match
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

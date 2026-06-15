"use client";
import React from "react";
import { Briefcase, ArrowUpRight, Search } from "lucide-react";
export default function CareerMatchPage() {
    return (<div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career Match</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Evaluate how your profile aligns with target roles across leading tech
          companies.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Target Role Alignments</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <input type="text" placeholder="Search companies or roles..." className="pl-8 pr-4 py-1.5 w-full bg-background border border-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"/>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Briefcase className="h-5 w-5"/>
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  Senior Full Stack Engineer
                </h4>
                <p className="text-xs text-muted-foreground">Vercel — Remote</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">
                89% Match
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"/>
            </div>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Briefcase className="h-5 w-5"/>
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  Staff Frontend Engineer
                </h4>
                <p className="text-xs text-muted-foreground">
                  Stripe — San Francisco, CA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs">
                74% Match
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}

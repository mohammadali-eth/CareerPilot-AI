"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Career Roadmap</h1>
        <p className="text-xs text-muted-foreground mt-1">
          A step-by-step personalized learning and skills roadmap to transition
          into your target role.
        </p>
      </div>

      <div className="glass-panel p-8 rounded border border-border space-y-6">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Next Milestones</h3>

        <div className="relative border-l border-border pl-6 space-y-8 ml-3">
          {/* Milestone 1 */}
          <div className="relative">
            <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-foreground border border-background dark:border-card" />
            <h4 className="text-sm font-bold text-foreground">
              Milestone 1: Container Orchestration
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-lg leading-relaxed">
              Learn Kubernetes architecture, pod scheduling, and deployments.
              Build a sample multi-container service.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Estimated: 2 weeks
              </span>
              <span className="text-[10px] bg-neutral-50 dark:bg-neutral-950 border border-border text-muted-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> 4 resources
              </span>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative">
            <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800 border border-background dark:border-card" />
            <h4 className="text-sm font-bold text-foreground/80">
              Milestone 2: GraphQL & Client Schemas
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-lg leading-relaxed">
              Migrate REST queries to GraphQL resolvers, build custom fragments,
              and configure client Apollo caches.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] bg-neutral-50 dark:bg-neutral-950 border border-border text-muted-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Estimated: 1 week
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

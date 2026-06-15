"use client";

import React from "react";
import { Map, ArrowRight, BookOpen } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A step-by-step personalized learning and skills roadmap to transition into your target role.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-border space-y-6">
        <h3 className="font-bold text-lg">Next Milestones</h3>
        
        <div className="relative border-l-2 border-border pl-6 space-y-8 ml-3">
          {/* Milestone 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-primary border-4 border-background" />
            <h4 className="text-sm font-semibold text-foreground">Milestone 1: Container Orchestration</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Learn Kubernetes architecture, pod scheduling, and deployments. Build a sample multi-container service.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                Estimated: 2 weeks
              </span>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> 4 resources
              </span>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-border border-4 border-background" />
            <h4 className="text-sm font-semibold text-foreground/80">Milestone 2: GraphQL & Client Schemas</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
              Migrate REST queries to GraphQL resolvers, build custom fragments, and configure client Apollo caches.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold">
                Estimated: 1 week
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

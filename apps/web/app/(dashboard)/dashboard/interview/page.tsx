"use client";

import React from "react";
import { MessageSquare, Play } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Interview Simulator
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Simulate behavioral and technical interviews with CareerPilot's
          customized AI mentor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-8 rounded border border-border flex flex-col items-center justify-center text-center min-h-[300px] bg-card">
          <div className="h-10 w-10 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground flex items-center justify-center mb-4">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Start AI Practice Session</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            The AI simulator dynamically evaluates resume details and target
            company preferences to generate questions.
          </p>
          <button className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider transition-colors">
            <Play className="h-3.5 w-3.5 fill-current" /> Begin Simulation
          </button>
        </div>

        <div className="glass-panel p-6 rounded border border-border space-y-4 bg-card">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Suggested Topics</h3>
          <div className="space-y-2">
            <div className="p-3 border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-xs font-semibold cursor-pointer transition-colors text-foreground">
              System Design: Scalability
            </div>
            <div className="p-3 border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-xs font-semibold cursor-pointer transition-colors text-foreground">
              Behavioral: Handling Conflict
            </div>
            <div className="p-3 border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-xs font-semibold cursor-pointer transition-colors text-foreground">
              Coding: Data Structures
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MessageSquare, Play, HelpCircle } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Simulate behavioral and technical interviews with CareerPilot's customized AI mentor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-8 rounded-xl border border-border flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-md font-semibold">Start AI Practice Session</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
            The AI simulator dynamically evaluates resume details and target company preferences to generate questions.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-xs font-semibold transition-colors">
            <Play className="h-3.5 w-3.5 fill-current" /> Begin Simulation
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
          <h3 className="font-bold text-sm">Suggested Topics</h3>
          <div className="space-y-2">
            <div className="p-3 border border-border hover:bg-muted/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              System Design: Scalability
            </div>
            <div className="p-3 border border-border hover:bg-muted/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              Behavioral: Handling Conflict
            </div>
            <div className="p-3 border border-border hover:bg-muted/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              Coding: Data Structures
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

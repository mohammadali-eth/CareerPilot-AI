import React from "react";
import { Sparkles, Terminal, Cpu, Database } from "lucide-react";

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      {/* Brand Header */}
      <div className="space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Enterprise Platform Foundation
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-300% animate-gradient-shift">
          CareerPilot AI
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl font-light">
          An enterprise-grade, clean-architecture framework for AI resume
          parsing, dynamic roadmapping, and career recommendations.
        </p>
      </div>

      {/* Tech Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up [animation-delay:200ms]">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left space-y-4 shadow-glass transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">FastAPI + Asyncpg</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            High-performance asynchronous Python API layer separating concerns
            via routers, business services, and repositories.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left space-y-4 shadow-glass transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">PostgreSQL + pgvector</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Multi-relational database design integrating vector search indexing
            to power fast similarity matches and intelligence RAG.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left space-y-4 shadow-glass transition-all duration-300 hover:border-pink-500/40 hover:-translate-y-1">
          <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Next.js 15 App Router</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            React 19 Server Components utilizing custom theme configurations,
            Zod validation, and Zustand state slices.
          </p>
        </div>
      </div>

      {/* Verification Terminal Panel */}
      <div className="w-full max-w-3xl glass-panel rounded-xl overflow-hidden border border-border shadow-premium animate-fade-in-up [animation-delay:400ms]">
        <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/70 inline-block" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            architecture-verify.log
          </span>
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 text-left font-mono text-xs md:text-sm space-y-2 text-indigo-400 bg-black/40">
          <p className="text-emerald-400">$ pnpm run architecture-verify</p>
          <p className="text-muted-foreground">
            Running checks for Clean Architecture principles...
          </p>
          <p>
            ✓ Monorepo Workspaces identified: apps/web, apps/api, packages/*
          </p>
          <p>
            ✓ Dependency Inversion setup: FastAPI Depends container validated
          </p>
          <p>
            ✓ Schema Validation: Pydantic v2 and Client-side Zod models aligned
          </p>
          <p>✓ Similarity Search: pgvector HNSW database indices configured</p>
          <p className="text-emerald-400">
            ✓ CareerPilot AI foundation successfully loaded [Ready for Feature
            Phase]
          </p>
        </div>
      </div>
    </div>
  );
}

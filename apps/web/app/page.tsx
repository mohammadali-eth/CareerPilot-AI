import React from "react";
import { Terminal, Cpu, Database, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-16 py-12">
      {/* Brand Header */}
      <div className="space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-foreground text-xs font-bold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          Enterprise Platform Foundation
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground">
          CareerPilot AI
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed font-normal">
          An enterprise-grade, clean-architecture framework for AI resume
          parsing, dynamic roadmapping, and career recommendations.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-foreground text-background font-bold text-sm rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Enter Dashboard
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 border border-border hover:bg-muted text-foreground font-semibold text-sm rounded transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Tech Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up [animation-delay:150ms]">
        <div className="glass-panel p-8 rounded border border-border flex flex-col items-start text-left space-y-4 hover:border-foreground/40 transition-colors duration-150">
          <div className="h-9 w-9 rounded bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center text-foreground shrink-0">
            <Cpu className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-bold">FastAPI + Asyncpg</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            High-performance asynchronous Python API layer separating concerns
            via routers, business services, and repositories.
          </p>
        </div>

        <div className="glass-panel p-8 rounded border border-border flex flex-col items-start text-left space-y-4 hover:border-foreground/40 transition-colors duration-150">
          <div className="h-9 w-9 rounded bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center text-foreground shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-bold">PostgreSQL + pgvector</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Multi-relational database design integrating vector search indexing
            to power fast similarity matches and intelligence RAG.
          </p>
        </div>

        <div className="glass-panel p-8 rounded border border-border flex flex-col items-start text-left space-y-4 hover:border-foreground/40 transition-colors duration-150">
          <div className="h-9 w-9 rounded bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center text-foreground shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-bold">Next.js 15 App Router</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            React 19 Server Components utilizing custom theme configurations,
            Zod validation, and Zustand state slices.
          </p>
        </div>
      </div>

      {/* Verification Terminal Panel */}
      <div className="w-full max-w-3xl glass-panel rounded overflow-hidden border border-border animate-fade-in-up [animation-delay:300ms]">
        <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
            architecture-verify.log
          </span>
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="p-6 text-left font-mono text-xs space-y-2 bg-neutral-950 text-neutral-300">
          <p className="text-neutral-100 font-bold">$ pnpm run architecture-verify</p>
          <p className="text-neutral-500">
            Running checks for Clean Architecture principles...
          </p>
          <p>
            [OK] Monorepo Workspaces identified: apps/web, apps/api, packages/*
          </p>
          <p>
            [OK] Dependency Inversion setup: FastAPI Depends container validated
          </p>
          <p>
            [OK] Schema Validation: Pydantic v2 and Client-side Zod models aligned
          </p>
          <p>[OK] Similarity Search: pgvector HNSW database indices configured</p>
          <p className="text-neutral-100 font-bold">
            [SUCCESS] CareerPilot AI foundation successfully loaded [Ready for Feature Phase]
          </p>
        </div>
      </div>
    </div>
  );
}

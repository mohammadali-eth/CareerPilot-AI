"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Coins,
  Cpu,
  Clock,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { adminService, AIUsageStats } from "../../../services/admin";

export default function AIUsageDashboard() {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await adminService.getAIUsageStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve AI cost calculation logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="animate-spin h-6 w-6 text-foreground" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground animate-pulse">Retrieving token consumption registries...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <AlertOctagon className="h-10 w-10 text-foreground" />
        <p className="text-xs text-muted-foreground">{error}</p>
        <button onClick={() => fetchStats()} className="px-3.5 py-1.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded border border-foreground hover:bg-neutral-800">
          Retry Request
        </button>
      </div>
    );
  }

  const { aggregate, providers } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI API Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze LLM token usages, input/output balances, total cost estimation, and average provider latency metrics.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900 text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Registry
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Total AI Cost",
            value: `$${aggregate.total_cost.toFixed(4)}`,
            description: "Accumulated OpenAI + Gemini spend",
            icon: Coins,
          },
          {
            title: "Token Balance",
            value: `${(aggregate.total_input_tokens + aggregate.total_output_tokens).toLocaleString()}`,
            description: `In: ${aggregate.total_input_tokens.toLocaleString()} | Out: ${aggregate.total_output_tokens.toLocaleString()}`,
            icon: Cpu,
          },
          {
            title: "API Performance",
            value: `${aggregate.avg_latency.toFixed(0)}ms`,
            description: `Failure Rate: ${aggregate.failure_rate.toFixed(1)}% (${aggregate.failed_requests} failed)`,
            icon: Clock,
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded border border-border bg-card flex flex-col justify-between hover:border-foreground/35 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="h-8 w-8 rounded border border-border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-foreground">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">{card.value}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Providers Latency / Requests breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OpenAI Metrics */}
        <div className="p-6 rounded border border-border bg-card space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <BrainCircuit className="h-5 w-5 text-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">OpenAI Integration Summary</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-3 text-xs">
              <span className="text-muted-foreground font-semibold">Total Prompts Submitted</span>
              <span className="font-bold text-foreground">{providers.openai?.total_requests ?? 0}</span>
            </div>
            <div className="flex justify-between pb-1 text-xs">
              <span className="text-muted-foreground font-semibold">Average Response Latency</span>
              <span className="font-bold text-foreground">{(providers.openai?.avg_latency_ms ?? 0).toFixed(0)}ms</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-900 border border-border rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${Math.min(((providers.openai?.avg_latency_ms || 1) / 3000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gemini Metrics */}
        <div className="p-6 rounded border border-border bg-card space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <BrainCircuit className="h-5 w-5 text-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Google Gemini Integration Summary</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-3 text-xs">
              <span className="text-muted-foreground font-semibold">Total Prompts Submitted</span>
              <span className="font-bold text-foreground">{providers.gemini?.total_requests ?? 0}</span>
            </div>
            <div className="flex justify-between pb-1 text-xs">
              <span className="text-muted-foreground font-semibold">Average Response Latency</span>
              <span className="font-bold text-foreground">{(providers.gemini?.avg_latency_ms ?? 0).toFixed(0)}ms</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-900 border border-border rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${Math.min(((providers.gemini?.avg_latency_ms || 1) / 3000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

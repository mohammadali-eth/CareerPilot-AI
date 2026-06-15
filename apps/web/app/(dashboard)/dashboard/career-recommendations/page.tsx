"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  X,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  useCareerHistory,
  useGenerateRecommendation,
  useDeleteRecommendation,
  CareerRecommendation,
  CareerMatch,
} from "../../../../hooks/use-career";

export default function CareerRecommendationsPage() {
  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
  } = useCareerHistory();
  const generateMutation = useGenerateRecommendation();
  const deleteMutation = useDeleteRecommendation();

  const [activeRec, setActiveRec] = useState<CareerRecommendation | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerMatch | null>(
    null,
  );
  const [comparedCareers, setComparedCareers] = useState<CareerMatch[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Auto-select the latest recommendation batch on load
  useEffect(() => {
    if (history && history.length > 0) {
      const current = activeRec
        ? history.find((h) => h.id === activeRec.id) || history[0]
        : history[0];
      setActiveRec(current || null);
    } else {
      setActiveRec(null);
    }
  }, [history]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync();
      setActiveRec(result);
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (activeRec?.id === id) {
        setActiveRec(null);
      }
    } catch (err) {
      console.error("Failed to delete recommendation:", err);
    }
  };

  const toggleCompare = (career: CareerMatch) => {
    setComparedCareers((prev) => {
      const exists = prev.find((c) => c.career_name === career.career_name);
      if (exists) {
        return prev.filter((c) => c.career_name !== career.career_name);
      }
      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 careers at once.");
        return prev;
      }
      return [...prev, career];
    });
  };

  const openDetails = (career: CareerMatch) => {
    setSelectedCareer(career);
    setIsDrawerOpen(true);
  };

  // --- SUB-COMPONENTS DECLARATIONS ---

  // 1. LoadingState Component
  const LoadingState = () => (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="h-10 w-44 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="glass-panel p-6 rounded border border-border h-48 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-6 w-48 bg-muted rounded mt-2" />
            </div>
            <div className="h-3 w-40 bg-muted rounded" />
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded border border-border space-y-4">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  // 2. ErrorState Component
  const ErrorState = () => (
    <div className="p-12 border border-border bg-neutral-50 dark:bg-neutral-950 rounded flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-sm my-12">
      <div className="h-10 w-10 rounded border border-border text-foreground flex items-center justify-center">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">
          Failed to Load Career Recommendation Engine
        </h3>
        <p className="text-xs text-muted-foreground max-w-md">
          {error?.message ||
            "An error occurred while communicating with the matching service."}
        </p>
      </div>
      <button
        onClick={() => refetch()}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry Service Connection
      </button>
    </div>
  );

  // 3. EmptyState Component
  const EmptyState = () => (
    <div className="p-16 border border-border bg-card rounded flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto my-8">
      <div className="h-12 w-12 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground flex items-center justify-center">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-2 max-w-lg">
        <h3 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-wider">
          Run Career Matching Engine
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unlock tailor-made career path recommendations by comparing your
          current skills, experience parameters, and certifications against
          thousands of positions in our career knowledge base.
        </p>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        className="inline-flex items-center gap-1.5 px-6 py-3 bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
      >
        {generateMutation.isPending ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Analyzing Credentials...
          </>
        ) : (
          <>
            <PlusCircle className="h-3.5 w-3.5" />
            Generate Career Match Analysis
          </>
        )}
      </button>
    </div>
  );

  // 4. SalaryInsightsCard Component
  const SalaryInsightsCard = ({ insights }: { insights: any }) => (
    <div className="glass-panel p-4 rounded border border-border bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3">
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <DollarSign className="h-3.5 w-3.5 text-foreground" />
        Salary Ranges
      </h5>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 border border-border bg-card rounded text-center">
          <span className="text-[9px] text-muted-foreground block font-semibold uppercase tracking-wider">
            Entry
          </span>
          <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
            {insights.entry_level}
          </span>
        </div>
        <div className="p-2 border border-border bg-card rounded text-center">
          <span className="text-[9px] text-muted-foreground block font-semibold uppercase tracking-wider">
            Mid-Level
          </span>
          <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
            {insights.mid_level}
          </span>
        </div>
        <div className="p-2 border border-border bg-card rounded text-center">
          <span className="text-[9px] text-muted-foreground block font-semibold uppercase tracking-wider">
            Senior
          </span>
          <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
            {insights.senior_level}
          </span>
        </div>
      </div>
    </div>
  );

  // 5. MarketDemandCard Component
  const MarketDemandCard = ({ demand }: { demand: any }) => {
    let scoreColor = "text-foreground bg-neutral-100 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800";
    if (demand.demand_score < 60) scoreColor = "text-neutral-400 bg-neutral-50 border-neutral-200 dark:bg-neutral-950 dark:border-neutral-900";
    else if (demand.demand_score >= 80) scoreColor = "text-white bg-black border-black dark:text-black dark:bg-white dark:border-white";

    return (
      <div className="glass-panel p-4 rounded border border-border bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-foreground" />
          Market Demand
        </h5>
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs text-muted-foreground">
            Demand Index Score:
          </span>
          <span className={`text-sm font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${scoreColor}`}>
            {demand.demand_score}%
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Trend:</span>
            <span className="font-semibold text-foreground">
              {demand.growth_trend}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
            <span className="font-bold text-foreground block mb-0.5 uppercase tracking-wider text-[9px]">
              Adoption Scope:
            </span>
            {demand.industry_adoption}
          </p>
        </div>
      </div>
    );
  };

  // 6. RecommendedPathCard Component
  const RecommendedPathCard = ({
    steps,
    time,
  }: {
    steps: string[];
    time: string;
  }) => (
    <div className="glass-panel p-4 rounded border border-border bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-foreground" />
          Recommended Milestones
        </h5>
        <span className="text-[9px] bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground px-2 py-0.5 rounded font-bold flex items-center gap-1 uppercase tracking-wider">
          <Calendar className="h-3 w-3" />
          {time}
        </span>
      </div>
      <div className="space-y-2 mt-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-2.5 items-start text-xs">
            <div className="h-4.5 w-4.5 rounded border border-border bg-card text-[9px] font-bold text-foreground flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <p className="text-muted-foreground leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // 7. CareerMatchCard Component
  const CareerMatchCard = ({ match }: { match: CareerMatch }) => {
    const details = match.details || {};
    const missingCount = details.missing_skills?.length || 0;
    
    let scoreColor = "text-neutral-850 bg-neutral-100 border-neutral-300 dark:text-neutral-200 dark:bg-neutral-900 dark:border-neutral-800";
    if (match.match_score < 60) {
      scoreColor = "text-neutral-400 bg-neutral-50 border-neutral-200 dark:text-neutral-500 dark:bg-neutral-950 dark:border-neutral-900";
    } else if (match.match_score >= 80) {
      scoreColor = "text-white bg-black border-black dark:text-black dark:bg-white dark:border-white";
    }

    return (
      <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between hover:border-foreground/30 transition-colors duration-150 group relative">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-sm text-foreground truncate max-w-[70%]">
              {match.career_name}
            </h4>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider shrink-0 ${scoreColor}`}
            >
              {match.match_score}% Match
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {details.why_it_matches ||
              "Semantically aligned with your professional credentials."}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
          <span className="text-[10px] font-semibold">
            {missingCount > 0 ? (
              <span className="text-foreground">
                {missingCount} SKILL GAPS
              </span>
            ) : (
              <span className="text-foreground font-bold">
                100% FIT
              </span>
            )}
          </span>
          <button
            onClick={() => openDetails(match)}
            className="text-foreground font-bold text-[11px] uppercase tracking-wider flex items-center gap-0.5 hover:underline"
          >
            Insights{" "}
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        </div>
      </div>
    );
  };

  // 8. CareerRankingTable Component
  const CareerRankingTable = ({ matches }: { matches: CareerMatch[] }) => (
    <div className="glass-panel rounded border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
        <h4 className="font-bold text-xs uppercase tracking-wider">Full Career Ranking Matrix</h4>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Sorted by Match Score
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-neutral-100/30 dark:bg-neutral-900/10 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4">Career Name</th>
              <th className="p-4 text-center">Match Score</th>
              <th className="p-4 text-center">Confidence</th>
              <th className="p-4">Median Salary</th>
              <th className="p-4">Demand Outlook</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-medium">
            {matches.map((match) => {
              const details = match.details || {};
              const isCompared = comparedCareers.some(
                (c) => c.career_name === match.career_name,
              );

              let scoreColor = "text-neutral-800 dark:text-neutral-200";
              if (match.match_score < 60) scoreColor = "text-neutral-450 dark:text-neutral-500";
              else if (match.match_score >= 80) scoreColor = "text-foreground font-extrabold";

              return (
                <tr
                  key={match.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
                >
                  <td className="p-4 font-bold text-foreground">
                     {match.career_name}
                  </td>
                  <td className="p-4 text-center font-bold">
                    <span className={scoreColor}>{match.match_score}%</span>
                  </td>
                  <td className="p-4 text-center font-mono text-muted-foreground">
                    {(match.confidence_score * 100).toFixed(0)}%
                  </td>
                  <td className="p-4 font-mono text-muted-foreground">
                    {details.salary_insights?.mid_level || "N/A"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {details.market_demand?.growth_trend || "N/A"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => toggleCompare(match)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        isCompared
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:bg-neutral-100 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isCompared ? "Selected" : "+ Compare"}
                    </button>
                    <button
                      onClick={() => openDetails(match)}
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 9. CareerDetailsDrawer Component
  const CareerDetailsDrawer = () => {
    if (!selectedCareer) return null;
    const details = selectedCareer.details || {};

    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-fade-in">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0"
          onClick={() => setIsDrawerOpen(false)}
        />

        <div className="relative w-full max-w-xl h-full border-l border-border bg-card shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Path Intelligence Analysis
                </span>
                <h3 className="text-lg font-bold mt-1 text-foreground">
                  {selectedCareer.career_name}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Explanation Layer */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  AI Fit Rationale
                </h4>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {details.why_it_matches}
                </p>
              </div>

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border border-border bg-neutral-50 dark:bg-neutral-950 rounded space-y-2">
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-wider block">
                    Required Core Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {details.required_skills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-border rounded text-[10px] text-foreground font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 border border-border bg-neutral-50 dark:bg-neutral-950 rounded space-y-2">
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-wider block">
                    Your Skill Gaps
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {details.missing_skills &&
                    details.missing_skills.length > 0 ? (
                      details.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-border rounded text-[10px] text-foreground font-semibold"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Fully matched!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Insights Panel */}
              <div className="space-y-4 pt-4 border-t border-border">
                <SalaryInsightsCard insights={details.salary_insights || {}} />
                <MarketDemandCard demand={details.market_demand || {}} />
                <RecommendedPathCard
                  steps={details.recommended_next_steps || []}
                  time={details.estimated_learning_time || "N/A"}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-4 flex gap-3">
            <button
              onClick={() => {
                toggleCompare(selectedCareer);
                setIsDrawerOpen(false);
              }}
              className="flex-1 py-2 px-4 border border-border hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider rounded text-foreground transition-colors"
            >
              Toggle Comparison
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 py-2 px-4 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 10. CareerComparisonModal Component
  const CareerComparisonModal = () => {
    if (comparedCareers.length === 0) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-4xl border border-border bg-card rounded shadow-premium p-6 overflow-hidden flex flex-col justify-between max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                Career Path Comparison Matrix
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Analyze matched parameters side-by-side to determine your
                optimal learning trajectory.
              </p>
            </div>
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="p-1.5 rounded border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto flex-1 my-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900/50">
                  <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground w-1/4">
                    Comparison Metric
                  </th>
                  {comparedCareers.map((c) => (
                    <th
                      key={c.id}
                      className="p-4 font-bold uppercase tracking-wider text-foreground w-1/4"
                    >
                      {c.career_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Match Score
                  </td>
                  {comparedCareers.map((c) => (
                    <td
                      key={c.id}
                      className="p-4 font-extrabold text-foreground"
                    >
                      {c.match_score}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Median Salary Range
                  </td>
                  {comparedCareers.map((c) => (
                    <td key={c.id} className="p-4 font-mono text-foreground font-semibold">
                      {c.details?.salary_insights?.mid_level || "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Market Demand Index
                  </td>
                  {comparedCareers.map((c) => (
                    <td key={c.id} className="p-4 font-bold text-foreground">
                      {c.details?.market_demand?.demand_score || 0}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Growth Outlook
                  </td>
                  {comparedCareers.map((c) => (
                    <td key={c.id} className="p-4 text-foreground">
                      {c.details?.market_demand?.growth_trend || "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Est. Learning Time
                  </td>
                  {comparedCareers.map((c) => (
                    <td key={c.id} className="p-4 text-foreground">
                      {c.details?.estimated_learning_time || "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="p-4 text-muted-foreground">
                    Skill Gaps Remaining
                  </td>
                  {comparedCareers.map((c) => (
                    <td key={c.id} className="p-4">
                      {c.details?.missing_skills &&
                      c.details.missing_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.details.missing_skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-border text-[9px] rounded text-foreground font-semibold"
                            >
                              {s}
                            </span>
                          ))}
                          {c.details.missing_skills.length > 3 && (
                            <span className="text-[9px] text-muted-foreground self-center">
                              +{c.details.missing_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> fully fits
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-border pt-4 flex justify-between items-center">
            <button
              onClick={() => setComparedCareers([])}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
            >
              Clear Selections
            </button>
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="py-2 px-6 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              Close Board
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERING WORKSPACE FLOWS ---

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  if (!history || history.length === 0) return <EmptyState />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Page Header & Generation Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Career Match Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Semantic match reports matching your resume and profiles against the
            career knowledge base.
          </p>
        </div>

        <div className="flex gap-2.5 self-start">
          {history.length > 1 && (
            <select
              value={activeRec?.id || ""}
              onChange={(e) => {
                const found = history.find((h) => h.id === e.target.value);
                if (found) setActiveRec(found);
              }}
              className="px-3 py-2 text-xs border border-border bg-card rounded focus:outline-none focus:ring-1 focus:ring-foreground font-semibold"
            >
              {history.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  Report of {new Date(rec.generated_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Re-Generate Matches
              </>
            )}
          </button>

          {activeRec && (
            <button
              onClick={() => handleDelete(activeRec.id)}
              disabled={deleteMutation.isPending}
              title="Delete this analysis report"
              className="p-2 border border-border hover:bg-neutral-100 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {activeRec && (
        <div className="space-y-8">
          {/* Comparison floating button panel */}
          {comparedCareers.length > 0 && (
            <div className="fixed bottom-6 right-6 z-40 bg-card border border-border rounded shadow-premium px-4 py-3 flex items-center gap-4 animate-fade-in-up">
              <div className="text-xs font-semibold">
                <span className="font-bold text-foreground">
                  {comparedCareers.length}
                </span>{" "}
                CAREERS SELECTED
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsComparisonOpen(true)}
                  className="px-3 py-1.5 bg-foreground text-background font-bold rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors uppercase tracking-wider"
                >
                  Compare Now
                </button>
                <button
                  onClick={() => setComparedCareers([])}
                  className="p-1 rounded hover:bg-neutral-100 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Top Career Recommendations cards grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Primary Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeRec.matches.slice(0, 3).map((match) => (
                <CareerMatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* 3. Full ranking list with actions */}
          <div className="space-y-3 pt-4">
            <CareerRankingTable matches={activeRec.matches} />
          </div>

          {/* 4. Compare modal & details drawers */}
          {isDrawerOpen && <CareerDetailsDrawer />}
          {isComparisonOpen && <CareerComparisonModal />}
        </div>
      )}
    </div>
  );
}

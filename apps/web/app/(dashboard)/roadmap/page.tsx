"use client";

import React, { useState, useEffect } from "react";
import {
  Map,
  PlusCircle,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Trash2,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  X,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useRoadmaps,
  useRoadmap,
  useGenerateRoadmap,
  useUpdateRoadmapProgress,
  useDeleteRoadmap,
  Roadmap,
  RoadmapMilestone,
  WeeklyTask,
  LearningPhase,
  ProjectRecommendation,
  CertificationRecommendation,
} from "../../../hooks/use-roadmap";

export default function RoadmapPage() {
  const { data: roadmaps, isLoading, isError, error } = useRoadmaps();
  const generateMutation = useGenerateRoadmap();
  const deleteMutation = useDeleteRoadmap();

  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] =
    useState<RoadmapMilestone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "syllabus" | "phases" | "projects" | "calendar" | "explanations"
  >("syllabus");

  // Fetch the detailed active roadmap
  const { data: activeRoadmap, isLoading: isActiveLoading } =
    useRoadmap(activeRoadmapId);
  const updateProgressMutation = useUpdateRoadmapProgress(
    activeRoadmapId || "",
  );

  // Auto-select latest roadmap
  useEffect(() => {
    if (roadmaps && roadmaps.length > 0 && !activeRoadmapId) {
      setActiveRoadmapId(roadmaps[0]?.id || null);
    }
  }, [roadmaps, activeRoadmapId]);

  const handleGenerate = async (formData: {
    target_career: string;
    timeline: string;
    weekly_hours: number;
    experience_level: string;
    learning_style: string;
  }) => {
    try {
      const result = await generateMutation.mutateAsync(formData);
      setActiveRoadmapId(result.id);
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this roadmap?")) {
      try {
        await deleteMutation.mutateAsync(id);
        if (activeRoadmapId === id) {
          setActiveRoadmapId(null);
        }
      } catch (err) {
        console.error("Failed to delete roadmap:", err);
      }
    }
  };

  const handleOpenMilestone = (milestone: RoadmapMilestone) => {
    setSelectedMilestone(milestone);
    setIsDrawerOpen(true);
  };

  const handleUpdateMilestone = async (
    progress: number,
    completed: boolean,
  ) => {
    if (!activeRoadmapId || !selectedMilestone) return;
    try {
      await updateProgressMutation.mutateAsync({
        milestone_id: selectedMilestone.id,
        progress,
        completed,
      });
      // Update local drawer state
      setSelectedMilestone((prev) =>
        prev ? { ...prev, completion_percentage: progress } : null,
      );
    } catch (err) {
      console.error("Failed to update milestone progress:", err);
    }
  };

  // --- SUBCOMPONENTS ---

  // 1. LoadingState Component
  const LoadingState = () => (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
      <div className="h-96 bg-muted rounded" />
    </div>
  );

  // 2. ErrorState Component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-bold text-foreground mb-1">
        Failed to load roadmaps
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        Retry Connection
      </button>
    </div>
  );

  // 3. EmptyState Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-border rounded-xl">
      <Map className="h-14 w-14 text-muted-foreground mb-6" />
      <h2 className="text-xl font-bold mb-2">No roadmaps generated yet</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Unlock your custom learning path by entering your target career and
        timeline details. We will scan your skills gaps to assemble a roadmap.
      </p>
      <button
        onClick={() => setIsFormOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/95 transition-all"
      >
        <PlusCircle className="h-5 w-5" />
        Create First Roadmap
      </button>
    </div>
  );

  // 4. RoadmapGeneratorForm Component
  const RoadmapGeneratorForm = ({
    onSubmit,
    onCancel,
    isSubmitting,
  }: {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
  }) => {
    const [targetCareer, setTargetCareer] = useState("Software Engineer");
    const [timeline, setTimeline] = useState("6 Months");
    const [weeklyHours, setWeeklyHours] = useState(15);
    const [experienceLevel, setExperienceLevel] = useState("Beginner");
    const [learningStyle, setLearningStyle] = useState("Mixed");

    const careers = [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile Developer",
      "DevOps Engineer",
      "Cloud Engineer",
      "Data Analyst",
      "Data Scientist",
      "ML Engineer",
      "AI Engineer",
      "Cybersecurity Analyst",
      "Product Manager",
      "UI/UX Designer",
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        target_career: targetCareer,
        timeline,
        weekly_hours: Number(weeklyHours),
        experience_level: experienceLevel,
        learning_style: learningStyle,
      });
    };

    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Generate Personalized Roadmap</h3>
            <p className="text-sm text-muted-foreground">
              Custom syllabus built against your specific skill gap
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Target Career</label>
            <select
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {careers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Target Timeline</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="3 Months">3 Months (Intense)</option>
                <option value="6 Months">6 Months (Recommended)</option>
                <option value="12 Months">12 Months (Steady)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Weekly Study Hours
              </label>
              <select
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value={5}>5 Hours/Week</option>
                <option value={10}>10 Hours/Week</option>
                <option value={15}>15 Hours/Week</option>
                <option value={20}>20+ Hours/Week</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Current Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="Beginner">Beginner (No prior work)</option>
                <option value="Intermediate">
                  Intermediate (Basic project knowledge)
                </option>
                <option value="Advanced">Advanced (Proficient engineer)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Learning Style Preference
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="Video">Video Resources</option>
                <option value="Reading">Documentation & Books</option>
                <option value="Practice">Coding Exercises & Projects</option>
                <option value="Mixed">Mixed Media</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-b-transparent rounded-full" />
              )}
              {isSubmitting ? "Assembling Path..." : "Build Roadmap"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // 5. RoadmapHistory Component
  const RoadmapHistory = ({
    list,
    activeId,
    onSelect,
    onDelete,
  }: {
    list: Roadmap[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: any) => void;
  }) => (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <h4 className="text-sm font-bold tracking-wide text-muted-foreground uppercase px-2">
        Roadmap Logs
      </h4>
      <div className="space-y-1.5">
        {list.map((r) => {
          const isActive = r.id === activeId;
          return (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                isActive
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-background/40 hover:bg-muted/50 border-transparent"
              }`}
            >
              <div className="truncate pr-4">
                <p className="text-sm font-semibold truncate">
                  {r.target_career}
                </p>
                <span className="text-[11px] opacity-75">
                  {r.timeline} • {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => onDelete(r.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 6. RoadmapOverviewCard Component
  const RoadmapOverviewCard = ({ roadmap }: { roadmap: Roadmap }) => {
    const successColor =
      roadmap.roadmap_data.success_probability >= 80
        ? "text-emerald-500 bg-emerald-500/10"
        : "text-amber-500 bg-amber-500/10";

    return (
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{roadmap.target_career}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-primary/10 text-primary">
              {roadmap.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            {roadmap.roadmap_data.career_goal}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-muted-foreground">
              Timeline target
            </span>
            <p className="font-semibold text-sm">{roadmap.timeline}</p>
          </div>
          <div
            className={`p-4 rounded-xl flex items-center gap-2 ${successColor}`}
          >
            <Target className="h-5 w-5" />
            <div>
              <span className="block text-[10px] uppercase font-bold leading-none">
                Success Chance
              </span>
              <span className="text-lg font-bold">
                {roadmap.roadmap_data.success_probability}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 7. RoadmapAnalytics Component
  const RoadmapAnalytics = ({ roadmap }: { roadmap: Roadmap }) => {
    // Calculate milestone counts and complete percentage
    const milestones = roadmap.milestones || [];
    const total = milestones.length;
    const completed = milestones.filter(
      (m) => m.completion_percentage >= 100,
    ).length;
    const avgProgress = total
      ? Math.min(
          100,
          Math.max(
            0,
            Math.floor(
              milestones.reduce((acc, m) => acc + m.completion_percentage, 0) /
                total,
            ),
          ),
        )
      : 0;

    // Streak and Skills count
    const skillsCount = roadmap.roadmap_data.learning_phases.reduce(
      (acc, p) => acc + p.skills_covered.length,
      0,
    );

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Syllabus Completion
          </span>
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-bold">{avgProgress}%</span>
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Milestones Achieved
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{completed}</span>
            <span className="text-sm text-muted-foreground">/ {total}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Skills covered
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{skillsCount}</span>
            <span className="text-sm text-muted-foreground">Skills</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Target Completion
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {new Date(roadmap.estimated_completion).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 8. ProgressTracker & MilestoneTimeline Component
  const MilestoneTimeline = ({
    milestones,
    onOpenMilestone,
  }: {
    milestones: RoadmapMilestone[];
    onOpenMilestone: (milestone: RoadmapMilestone) => void;
  }) => (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-md font-bold mb-6 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        Milestone Milestones
      </h3>
      <div className="relative border-l border-border ml-3.5 space-y-6">
        {milestones.map((m) => {
          const isDone = m.completion_percentage >= 100;
          return (
            <div key={m.id} className="relative pl-6 group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 ring-4 ring-emerald-500/15"
                    : m.completion_percentage > 0
                      ? "bg-primary border-primary ring-4 ring-primary/15"
                      : "bg-background border-border"
                }`}
              />
              <div
                onClick={() => onOpenMilestone(m)}
                className="p-4 bg-background/50 hover:bg-muted/30 border border-border rounded-lg cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold group-hover:text-primary transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">
                      Target date
                    </span>
                    <span className="text-xs font-semibold">
                      {new Date(m.target_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-muted text-xs font-bold min-w-[50px] text-center">
                    {m.completion_percentage}%
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 9. WeeklyPlanCard Component
  const WeeklyPlanCard = ({ tasks }: { tasks: WeeklyTask[] }) => {
    const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>(
      { 1: true },
    );

    const toggleWeek = (num: number) => {
      setExpandedWeeks((prev) => ({ ...prev, [num]: !prev[num] }));
    };

    return (
      <div className="space-y-4">
        {tasks.map((wt) => {
          const isOpen = expandedWeeks[wt.week_number];
          return (
            <div
              key={wt.week_number}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleWeek(wt.week_number)}
                className="w-full flex items-center justify-between p-4 bg-muted/20 font-semibold text-sm border-b border-border/50 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
                    Week {wt.week_number}
                  </span>
                  <span className="truncate max-w-[200px] md:max-w-md">
                    {wt.theme}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 space-y-2.5 bg-card">
                  {wt.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-muted-foreground"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-0.5 shrink-0"
                      />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 10. MonthlyGoalCard Component
  const MonthlyGoalCard = ({ goals }: { goals: any[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((g, idx) => (
        <div
          key={idx}
          className="bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center justify-center">
              M{g.month_number}
            </span>
            <h4 className="text-sm font-bold">Month {g.month_number} Goal</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {g.goal}
          </p>
          <div className="pt-2.5 border-t border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase mb-1.5">
              Focus Areas
            </span>
            <ul className="space-y-1">
              {g.focus_areas.map((fa: string, i: number) => (
                <li
                  key={i}
                  className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                >
                  <span className="h-1 w-1 bg-indigo-500 rounded-full shrink-0" />
                  {fa}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  // 11. LearningPathCard Component
  const LearningPathCard = ({ phases }: { phases: LearningPhase[] }) => (
    <div className="space-y-4">
      {phases.map((lp) => (
        <div
          key={lp.phase_number}
          className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6"
        >
          <div className="md:w-1/4 space-y-1">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
              Phase {lp.phase_number}
            </span>
            <h4 className="font-bold text-sm">{lp.title}</h4>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lp.duration}
            </span>
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lp.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lp.skills_covered.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded bg-muted text-[11px] font-semibold text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 12. ProjectRecommendationCard Component
  const ProjectRecommendationCard = ({
    projects,
  }: {
    projects: ProjectRecommendation[];
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((proj, idx) => {
        const diffColors = {
          Beginner: "text-emerald-500 bg-emerald-500/10",
          Intermediate: "text-blue-500 bg-blue-500/10",
          Advanced: "text-amber-500 bg-amber-500/10",
          Capstone: "text-purple-500 bg-purple-500/10",
        };

        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold">{proj.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${diffColors[proj.difficulty]}`}
                >
                  {proj.difficulty}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {proj.why_recommended}
              </p>
              <div className="pt-2 text-xs text-muted-foreground">
                <span className="font-bold block mb-1">Portfolio Value:</span>
                <span className="italic">"{proj.portfolio_value}"</span>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Duration: {proj.estimated_duration}</span>
              <div className="flex gap-1.5">
                {proj.skills_covered.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 13. CertificationCard Component
  const CertificationCard = ({
    certs,
  }: {
    certs: CertificationRecommendation[];
  }) => (
    <div className="space-y-4">
      {certs.map((c, idx) => {
        const priorityColors = {
          High: "text-rose-500 bg-rose-500/10",
          Medium: "text-amber-500 bg-amber-500/10",
          Low: "text-slate-500 bg-slate-500/10",
        };

        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold">{c.title}</h4>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityColors[c.priority_level]}`}
                >
                  {c.priority_level} Priority
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {c.reason_for_recommendation}
              </p>
              <div className="text-[11px] text-muted-foreground">
                <span className="font-bold">Estimated effort:</span>{" "}
                {c.estimated_completion_time}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                Career Impact
              </span>
              <span className="text-xs font-semibold">{c.career_impact}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 14. RoadmapCalendar Component
  const RoadmapCalendar = ({ roadmap }: { roadmap: Roadmap }) => {
    // Generate dates corresponding to weeks
    const tasks = roadmap.roadmap_data.weekly_tasks || [];

    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-md font-bold">
            Timeline Calendar (Monthly Targets)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmap.roadmap_data.monthly_goals.map((goal, idx) => {
            // Find milestones or week items belonging to this month (4 weeks per month)
            const monthWeeks = tasks.filter(
              (w) => w.week_number > idx * 4 && w.week_number <= (idx + 1) * 4,
            );

            return (
              <div
                key={idx}
                className="border border-border bg-background rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-primary">
                    Month {goal.month_number}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {monthWeeks.length} Weeks
                  </span>
                </div>
                <p className="text-xs font-semibold truncate">{goal.goal}</p>
                <div className="space-y-2">
                  {monthWeeks.map((week) => (
                    <div
                      key={week.week_number}
                      className="p-2 rounded bg-muted/30 text-[11px] flex justify-between items-center"
                    >
                      <span className="truncate pr-2">
                        W{week.week_number}: {week.theme}
                      </span>
                      <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
                        Task list
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 15. RoadmapDetailsDrawer Component
  const RoadmapDetailsDrawer = () => {
    if (!selectedMilestone) return null;
    const [progressVal, setProgressVal] = useState(
      selectedMilestone.completion_percentage,
    );

    useEffect(() => {
      setProgressVal(selectedMilestone.completion_percentage);
    }, [selectedMilestone]);

    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-md">Milestone Progress</h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {selectedMilestone.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMilestone.description}
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                Due Target
              </span>
              <span className="text-xs font-semibold text-foreground">
                {new Date(selectedMilestone.target_date).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground">
                  Adjust Completion Percentage
                </span>
                <span className="font-bold text-primary">{progressVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-border text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              const completed = progressVal >= 100;
              await handleUpdateMilestone(progressVal, completed);
              setIsDrawerOpen(false);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all"
          >
            Save Progress
          </button>
        </div>
      </div>
    );
  };

  // --- CORE RENDER METHOD ---

  if (isLoading) return <LoadingState />;
  if (isError)
    return <ErrorState message={error?.message || "Unknown error"} />;

  return (
    <div className="space-y-8 relative">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Map className="h-6 w-6 text-primary" />
            Personalized Roadmaps
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured learning plans and project targets generated by scanning
            your ATS gaps.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:bg-primary/95 transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            Generate Roadmap
          </button>
        )}
      </div>

      {/* 2. Form view */}
      {isFormOpen && (
        <RoadmapGeneratorForm
          onSubmit={handleGenerate}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={generateMutation.isPending}
        />
      )}

      {/* 3. Main Dashboard Workspace */}
      {!isFormOpen && (
        <>
          {roadmaps && roadmaps.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left sidebar: log list */}
              <div className="lg:col-span-1 space-y-6">
                <RoadmapHistory
                  list={roadmaps || []}
                  activeId={activeRoadmapId}
                  onSelect={(id) => setActiveRoadmapId(id)}
                  onDelete={handleDelete}
                />
              </div>

              {/* Right content board */}
              <div className="lg:col-span-3 space-y-6">
                {isActiveLoading ? (
                  <div className="h-64 bg-card border border-border rounded-xl animate-pulse flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Loading details...
                    </span>
                  </div>
                ) : activeRoadmap ? (
                  <>
                    <RoadmapOverviewCard roadmap={activeRoadmap} />
                    <RoadmapAnalytics roadmap={activeRoadmap} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Milestones */}
                      <div className="md:col-span-1">
                        <MilestoneTimeline
                          milestones={activeRoadmap.milestones || []}
                          onOpenMilestone={handleOpenMilestone}
                        />
                      </div>

                      {/* Right: Study plans/resources */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Tab header */}
                        <div className="flex border-b border-border overflow-x-auto gap-2">
                          <button
                            onClick={() => setActiveTab("syllabus")}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                              activeTab === "syllabus"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Weekly Schedule
                          </button>
                          <button
                            onClick={() => setActiveTab("phases")}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                              activeTab === "phases"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Phases & Skills
                          </button>
                          <button
                            onClick={() => setActiveTab("projects")}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                              activeTab === "projects"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Projects & Certifications
                          </button>
                          <button
                            onClick={() => setActiveTab("calendar")}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                              activeTab === "calendar"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Calendar
                          </button>
                          <button
                            onClick={() => setActiveTab("explanations")}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                              activeTab === "explanations"
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            AI Explanations
                          </button>
                        </div>

                        {/* Tab content view */}
                        <div className="transition-all duration-150">
                          {activeTab === "syllabus" && (
                            <div className="space-y-6">
                              <MonthlyGoalCard
                                goals={
                                  activeRoadmap.roadmap_data.monthly_goals || []
                                }
                              />
                              <WeeklyPlanCard
                                tasks={
                                  activeRoadmap.roadmap_data.weekly_tasks || []
                                }
                              />
                            </div>
                          )}

                          {activeTab === "phases" && (
                            <LearningPathCard
                              phases={
                                activeRoadmap.roadmap_data.learning_phases || []
                              }
                            />
                          )}

                          {activeTab === "projects" && (
                            <div className="space-y-6">
                              <h3 className="text-sm font-bold flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                Recommended Projects & Certifications
                              </h3>
                              <ProjectRecommendationCard
                                projects={
                                  activeRoadmap.roadmap_data.projects || []
                                }
                              />
                              <CertificationCard
                                certs={
                                  activeRoadmap.roadmap_data.certifications ||
                                  []
                                }
                              />
                            </div>
                          )}

                          {activeTab === "calendar" && (
                            <RoadmapCalendar roadmap={activeRoadmap} />
                          )}

                          {activeTab === "explanations" && (
                            <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-xs leading-relaxed text-muted-foreground">
                              <div className="space-y-1">
                                <span className="font-bold text-foreground block text-sm">
                                  Why Milestones Exist
                                </span>
                                <p>
                                  {
                                    activeRoadmap.roadmap_data
                                      .why_milestones_exist_explanation
                                  }
                                </p>
                              </div>
                              <div className="space-y-1 pt-3 border-t border-border">
                                <span className="font-bold text-foreground block text-sm">
                                  Technology Order Logic
                                </span>
                                <p>
                                  {
                                    activeRoadmap.roadmap_data
                                      .why_skills_ordered_explanation
                                  }
                                </p>
                              </div>
                              <div className="space-y-1 pt-3 border-t border-border">
                                <span className="font-bold text-foreground block text-sm">
                                  Employability Impact
                                </span>
                                <p>
                                  {
                                    activeRoadmap.roadmap_data
                                      .employability_impact_explanation
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Select a roadmap log to load your customized details.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. Details Drawer overlay */}
      {isDrawerOpen && <RoadmapDetailsDrawer />}
    </div>
  );
}

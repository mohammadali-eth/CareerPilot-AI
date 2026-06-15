"use client";
import React, { useState, useEffect, useRef } from "react";
import { Brain, Timer, CheckCircle2, Award, AlertCircle, ArrowLeft, Play, Sparkles, Trash2, ChevronRight, TrendingUp, BarChart3, BookOpen, ThumbsUp, ThumbsDown, Lightbulb, X, Target, Clock, Briefcase, HelpCircle, Loader2 } from "lucide-react";
import { interviewService } from "../../../services/interview";
import { useAuthStore } from "../../../store/auth";
export default function InterviewPage() {
    const { user } = useAuthStore();
    const [view, setView] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    // Data states
    const [sessions, setSessions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedReport, setSelectedReport] = useState(null);
    // Setup form states
    const [targetCareer, setTargetCareer] = useState("");
    const [interviewType, setInterviewType] = useState("Mock Full Interview");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [questionCount, setQuestionCount] = useState(5);
    // Simulation play states
    const [answerText, setAnswerText] = useState("");
    const [latestAnswerFeedback, setLatestAnswerFeedback] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    // Load dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const historyData = await interviewService.getHistory();
            const analyticsData = await interviewService.getAnalytics();
            setSessions(historyData);
            setAnalytics(analyticsData);
            // Auto-fill target career from profile if available
            if (user?.profile?.target_role) {
                setTargetCareer(user.profile.target_role);
            }
        }
        catch (err) {
            setError(err.message || "Failed to load dashboard data. Please make sure the backend server and postgres DB are running.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadDashboardData();
    }, [user]);
    // Handle simulation timer
    useEffect(() => {
        if (view === "session" && activeSession && !latestAnswerFeedback) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [view, activeSession, latestAnswerFeedback]);
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    // Actions
    const handleStartSetup = () => {
        setView("setup");
    };
    const handleStartSimulation = async (e) => {
        e.preventDefault();
        if (!targetCareer.trim()) {
            setError("Please specify a target career role.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const session = await interviewService.startSession({
                target_career: targetCareer,
                interview_type: interviewType,
                difficulty,
                question_count: questionCount
            });
            setActiveSession(session);
            setCurrentQuestionIndex(0);
            setLatestAnswerFeedback(null);
            setAnswerText("");
            setElapsedTime(0);
            setView("session");
        }
        catch (err) {
            setError(err.message || "Failed to initialize interview session.");
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleSubmitAnswer = async () => {
        if (!activeSession || !activeSession.questions)
            return;
        if (!answerText.trim() || answerText.trim().split(/\s+/).length < 5) {
            setError("Please provide a more detailed answer (at least 5 words).");
            return;
        }
        setSubmitting(true);
        setError(null);
        const currentQuestion = activeSession.questions[currentQuestionIndex];
        if (!currentQuestion)
            return;
        try {
            const feedback = await interviewService.submitAnswer(activeSession.id, {
                question_id: currentQuestion.id,
                answer: answerText
            });
            setLatestAnswerFeedback(feedback);
            // Update session question list locally with the new answer
            const updatedQuestions = activeSession.questions.map((q, idx) => {
                if (idx === currentQuestionIndex) {
                    return { ...q, answer: feedback };
                }
                return q;
            });
            setActiveSession({ ...activeSession, questions: updatedQuestions });
        }
        catch (err) {
            setError(err.message || "Failed to grade answer.");
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleNextQuestion = () => {
        if (!activeSession || !activeSession.questions)
            return;
        setAnswerText("");
        setLatestAnswerFeedback(null);
        setError(null);
        if (currentQuestionIndex < activeSession.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
        else {
            // Completed all questions
            handleFinishSimulation();
        }
    };
    const handleFinishSimulation = async () => {
        if (!activeSession)
            return;
        setSubmitting(true);
        setError(null);
        try {
            const completedSession = await interviewService.finishSession(activeSession.id);
            setSelectedReport(completedSession);
            setView("report");
            loadDashboardData(); // Reload background data
        }
        catch (err) {
            setError(err.message || "Failed to compile report card.");
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleViewReport = async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            const session = await interviewService.getSessionDetails(sessionId);
            setSelectedReport(session);
            setView("report");
        }
        catch (err) {
            setError(err.message || "Failed to retrieve report data.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this interview record?"))
            return;
        try {
            await interviewService.deleteSession(sessionId);
            loadDashboardData();
        }
        catch (err) {
            alert(err.message || "Failed to delete session.");
        }
    };
    const handleBackToDashboard = () => {
        setView("dashboard");
        setSelectedReport(null);
        setActiveSession(null);
        setError(null);
    };
    // Render components
    if (loading && view === "dashboard") {
        return (<div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4"/>
        <p className="text-muted-foreground animate-pulse">Analyzing simulated matrices & results...</p>
      </div>);
    }
    return (<div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Notifications/Error Banner */}
      {error && (<div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-in fade-in-50 duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <h5 className="font-semibold text-sm">System Update Alert</h5>
            <p className="text-xs text-red-400/90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
            <X className="h-4 w-4"/>
          </button>
        </div>)}

      {/* --- DASHBOARD VIEW --- */}
      {view === "dashboard" && (<>
          {/* Header Card */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-indigo-950/20 via-card/50 to-purple-950/10 p-6 md:p-8 backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Brain className="h-40 w-40 text-indigo-500"/>
            </div>
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="h-3 w-3"/> Phase 7 AI Simulator
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Elevate Your Career Readiness
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Experience dynamic, real-time mock interviews tailored precisely to your resume data, roadmap goals, and targeted roles. Receive analytical grade feedback maps immediately.
              </p>
              <div className="pt-2">
                <button onClick={handleStartSetup} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5">
                  <Play className="h-4 w-4 fill-white"/> Start New Simulation
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Readiness Card */}
            <div className="bg-card/50 border border-border p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-200">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Readiness Level</span>
                <h3 className="text-2xl font-bold text-foreground">
                  {analytics ? `${analytics.readiness_score}%` : "0%"}
                </h3>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <Target className="h-3 w-3"/> Target Position Fit
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="h-6 w-6"/>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-card/50 border border-border p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-200">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Average Score</span>
                <h3 className="text-2xl font-bold text-foreground">
                  {analytics ? `${analytics.average_score}%` : "0%"}
                </h3>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  Overall simulation stats
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="h-6 w-6"/>
              </div>
            </div>

            {/* Best Score */}
            <div className="bg-card/50 border border-border p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-200">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Best Performance</span>
                <h3 className="text-2xl font-bold text-foreground">
                  {analytics ? `${analytics.best_score}%` : "0%"}
                </h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  Highest simulation score
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-6 w-6"/>
              </div>
            </div>

            {/* Recommended Practice Area */}
            <div className="bg-card/50 border border-border p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-200">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Key Practice Focus</span>
                <h3 className="text-lg font-bold text-foreground truncate max-w-[170px]" title={analytics?.recommended_practice_area}>
                  {analytics?.recommended_practice_area || "General Tech Concepts"}
                </h3>
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                  <BookOpen className="h-3 w-3"/> Recommended Area
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lightbulb className="h-6 w-6"/>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Performance Trends */}
            <div className="lg:col-span-2 bg-card/40 border border-border p-6 rounded-2xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold">Category Score Matrices</h3>
                  <p className="text-xs text-muted-foreground">Detailed average score breakdown across domain topics</p>
                </div>
                <BarChart3 className="h-5 w-5 text-indigo-400"/>
              </div>

              <div className="space-y-4">
                {analytics?.category_trends && analytics.category_trends.length > 0 ? (analytics.category_trends.map((cat, idx) => (<div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-muted-foreground">{cat.category}</span>
                        <span className="font-bold text-indigo-400">{Math.round(cat.average_score)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${cat.average_score}%` }}/>
                      </div>
                    </div>))) : (<div className="text-center py-8 text-sm text-muted-foreground">
                    Complete your first simulated interview session to render topic score matrices.
                  </div>)}
              </div>
            </div>

            {/* Improvement / Roadmap Advice Panel */}
            <div className="bg-gradient-to-b from-indigo-950/20 to-purple-950/20 border border-border p-6 rounded-2xl space-y-6 backdrop-blur-sm">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold">Roadmap Optimization</h3>
                <p className="text-xs text-muted-foreground">AI recommendations aligned with roadmap</p>
              </div>

              {analytics && analytics.history.length > 0 ? (<div className="space-y-5">
                  <div className="p-4 rounded-xl bg-card/60 border border-border flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                      <Target className="h-4 w-4"/>
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Practice Recommendation</h5>
                      <p className="text-xs leading-relaxed text-foreground">
                        Your latest scores indicate an opportunity to focus practice on <span className="font-semibold text-indigo-400">{analytics.recommended_practice_area}</span> concepts.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card/60 border border-border flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">
                      <BookOpen className="h-4 w-4"/>
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roadmap Integration</h5>
                      <p className="text-xs leading-relaxed text-foreground">
                        Sync active milestones on your Roadmap to dedicate study modules resolving missing keyword skills detected during simulation.
                      </p>
                    </div>
                  </div>
                </div>) : (<div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <Brain className="h-10 w-10 text-muted-foreground/60"/>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                    No mock sessions analyzed yet. Start a simulation to load personalized optimization tips.
                  </p>
                </div>)}
            </div>
          </div>

          {/* History / Sessions Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Simulation Logs</h3>
              <span className="text-xs text-muted-foreground font-semibold">{sessions.length} sessions logged</span>
            </div>

            {sessions.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (<div key={session.id} onClick={() => handleViewReport(session.id)} className="group bg-card/40 hover:bg-card/70 border border-border hover:border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-200">
                    <div className="space-y-2.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${session.status === "completed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}/>
                        <h4 className="font-bold text-sm text-foreground truncate max-w-[200px] md:max-w-[240px]">
                          {session.target_career}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5"/> {session.interview_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5"/> {new Date(session.started_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="inline-flex gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                          {session.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${session.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {session.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {session.status === "completed" && session.score !== null ? (<div className="text-right">
                          <p className="text-2xl font-black text-indigo-400">{session.score}%</p>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Grade Score</span>
                        </div>) : (<div className="text-right text-amber-400">
                          <Play className="h-5 w-5 animate-pulse ml-auto"/>
                          <span className="text-[9px] uppercase tracking-wide">Resume Session</span>
                        </div>)}
                      
                      <div className="flex flex-col gap-1.5">
                        <button onClick={(e) => handleDeleteSession(session.id, e)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Delete Session">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"/>
                      </div>
                    </div>
                  </div>))}
              </div>) : (<div className="bg-card/20 border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <Brain className="h-12 w-12 text-muted-foreground/40"/>
                <div className="space-y-1">
                  <h4 className="font-bold">No simulations recorded</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Initiate your first tailored interview simulator session to test technical and behavioral capability models.
                  </p>
                </div>
                <button onClick={handleStartSetup} className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                  Configure Simulation
                </button>
              </div>)}
          </div>
        </>)}

      {/* --- SETUP VIEW --- */}
      {view === "setup" && (<div className="max-w-2xl mx-auto bg-card border border-border p-6 md:p-8 rounded-2xl space-y-8 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={handleBackToDashboard} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5"/>
            </button>
            <div>
              <h2 className="text-xl font-bold">Configure Simulation</h2>
              <p className="text-xs text-muted-foreground">Customize question criteria and difficulty models</p>
            </div>
          </div>

          <form onSubmit={handleStartSimulation} className="space-y-6">
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5"/> Target Position / Role
              </label>
              <input type="text" value={targetCareer} onChange={(e) => setTargetCareer(e.target.value)} placeholder="e.g. Senior Full-Stack Software Engineer" className="w-full bg-muted/40 border border-border focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors" required/>
              <p className="text-[10px] text-muted-foreground">
                We pull resume analysis and target roles from your profile, but you can override them here.
              </p>
            </div>

            {/* Type & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Type</label>
                <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="w-full bg-muted/40 border border-border focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                  <option value="HR Interview">HR & Fit Interview</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="Behavioral Interview">Behavioral (STAR Method)</option>
                  <option value="Project Discussion Interview">Project Deep-Dive</option>
                  <option value="Career-Based Interview">Career & Roadmap Focus</option>
                  <option value="Mock Full Interview">Mock Full Interview Mix</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-muted/40 border border-border focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Question Count Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Number of Questions</span>
                <span className="text-indigo-400 font-extrabold">{questionCount} Questions</span>
              </div>
              <input type="range" min="3" max="10" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"/>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>3 questions (Quick check)</span>
                <span>10 questions (Comprehensive loop)</span>
              </div>
            </div>

            {/* Integration info box */}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
              <Brain className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5"/>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-indigo-400">Context Integration Enabled</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The simulator automatically loads your skills list, Capstone projects, and skill gaps from your resume, matching them against active roadmap milestones.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={handleBackToDashboard} className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                {submitting ? (<>
                    <Loader2 className="h-4 w-4 animate-spin"/> Customizing questions...
                  </>) : (<>
                    <Play className="h-4 w-4 fill-white"/> Generate Mock Loop
                  </>)}
              </button>
            </div>
          </form>
        </div>)}

      {/* --- SESSION VIEW (SIMULATION RUN) --- */}
      {view === "session" && activeSession && activeSession.questions && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main workspace */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header / progress */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase">
                    {activeSession.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeSession.interview_type}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-bold text-foreground">
                  <Timer className="h-4 w-4 text-indigo-400 shrink-0"/>
                  <span>{formatTime(elapsedTime)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Simulation Progress</span>
                  <span className="text-foreground">
                    Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{
                width: `${((currentQuestionIndex + (latestAnswerFeedback ? 1 : 0)) / activeSession.questions.length) * 100}%`
            }}/>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-card border border-border p-6 md:p-8 rounded-2xl space-y-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <HelpCircle className="h-24 w-24 text-indigo-400"/>
              </div>
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5"/> Question {currentQuestionIndex + 1}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                  {activeSession.questions[currentQuestionIndex]?.question || ""}
                </h3>
              </div>
            </div>

            {/* Answer Input / Panel */}
            {!latestAnswerFeedback ? (<div className="bg-card border border-border p-6 rounded-2xl space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Response</label>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {answerText.trim() === "" ? 0 : answerText.trim().split(/\s+/).length} words
                  </span>
                </div>
                <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Provide your professional response. Structure your technical concepts, design decisions, and architectural trade-offs..." className="w-full bg-muted/30 border border-border focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-44 resize-none transition-colors"/>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-muted-foreground">
                    Recommended length: 50-200 words. Describe constraints and details.
                  </span>
                  <button onClick={handleSubmitAnswer} disabled={submitting || !answerText.trim()} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                    {submitting ? (<>
                        <Loader2 className="h-4 w-4 animate-spin"/> Evaluating response...
                      </>) : (<>
                        Submit Answer <ChevronRight className="h-4 w-4"/>
                      </>)}
                  </button>
                </div>
              </div>) : (
            /* Immediate Evaluation Card */
            <div className="bg-card border border-border p-6 rounded-2xl space-y-6 backdrop-blur-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400"/>
                    <h4 className="font-bold">Immediate AI Assessment</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-400">{latestAnswerFeedback.score}%</span>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Question Grade</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths & Weaknesses */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <ThumbsUp className="h-4 w-4"/> Strengths
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                        {latestAnswerFeedback.feedback.strengths.map((str, idx) => (<li key={idx}>{str}</li>))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <ThumbsDown className="h-4 w-4"/> Weak Gaps
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                        {latestAnswerFeedback.feedback.weaknesses.map((weak, idx) => (<li key={idx}>{weak}</li>))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions & Missing concepts */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4"/> Missing Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {latestAnswerFeedback.feedback.missing_points.map((miss, idx) => (<span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {miss}
                          </span>))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4"/> Better Sample Answer
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-lg border border-border/50 max-h-32 overflow-y-auto">
                        "{latestAnswerFeedback.feedback.sample_better_answer}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-border pt-4">
                  <button onClick={handleNextQuestion} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                    {currentQuestionIndex < activeSession.questions.length - 1 ? (<>
                        Next Question <ChevronRight className="h-4 w-4"/>
                      </>) : (<>
                        Compile Final Report Card <CheckCircle2 className="h-4 w-4"/>
                      </>)}
                  </button>
                </div>
              </div>)}
          </div>

          {/* Sidebar Metrics (The 8 Criteria Map) */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-5 rounded-2xl space-y-6 backdrop-blur-sm">
              <div className="space-y-0.5">
                <h4 className="font-bold">Evaluation Framework</h4>
                <p className="text-xs text-muted-foreground">Real-time metrics scored against core capabilities</p>
              </div>

              <div className="space-y-4">
                {/* 8 Criteria bars */}
                {[
                { name: "Technical Accuracy", key: "technical_accuracy", color: "from-indigo-500 to-indigo-600" },
                { name: "Communication Flow", key: "communication", color: "from-purple-500 to-purple-600" },
                { name: "Problem Solving", key: "problem_solving", color: "from-emerald-500 to-emerald-600" },
                { name: "Confidence Wording", key: "confidence", color: "from-sky-500 to-sky-600" },
                { name: "Conciseness & Clarity", key: "clarity", color: "from-blue-500 to-blue-600" },
                { name: "Narrative Structure", key: "structure", color: "from-amber-500 to-amber-600" },
                { name: "Completeness", key: "completeness", color: "from-rose-500 to-rose-600" },
                { name: "Question Relevance", key: "relevance", color: "from-pink-500 to-pink-600" },
            ].map((crit, idx) => {
                const val = latestAnswerFeedback?.feedback.criteria_scores?.[crit.key] || 0;
                return (<div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-muted-foreground">{crit.name}</span>
                        <span className="font-bold text-foreground">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${crit.color} transition-all duration-500`} style={{ width: `${val}%` }}/>
                      </div>
                    </div>);
            })}
              </div>
            </div>
            
            {/* Abandon prompt */}
            <button onClick={() => {
                if (confirm("Abandon mock interview session? Progress will be lost.")) {
                    handleBackToDashboard();
                }
            }} className="w-full text-center text-xs text-red-400 hover:text-red-300 font-semibold transition-colors py-2 border border-dashed border-red-500/20 rounded-xl">
              Terminate Simulation Loop
            </button>
          </div>
        </div>)}

      {/* --- REPORT / SCORECARD VIEW --- */}
      {view === "report" && selectedReport && selectedReport.report && (<div className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={handleBackToDashboard} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5"/>
            </button>
            <div>
              <h2 className="text-xl font-bold">Simulation Performance Assessment</h2>
              <p className="text-xs text-muted-foreground">Generated report card for mock interview session</p>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Overall Score */}
            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Performance Grade</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="currentColor" className="text-muted/20" strokeWidth="10" fill="transparent"/>
                  <circle cx="64" cy="64" r="54" stroke="currentColor" className="text-indigo-400" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * (1 - selectedReport.report.overall_score / 100)}/>
                </svg>
                <div className="absolute text-3xl font-black text-foreground">
                  {selectedReport.report.overall_score}%
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Average question grading accuracy</span>
            </div>

            {/* Readiness Index */}
            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Readiness Index</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="currentColor" className="text-muted/20" strokeWidth="10" fill="transparent"/>
                  <circle cx="64" cy="64" r="54" stroke="currentColor" className="text-purple-400" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * (1 - selectedReport.report.readiness_score / 100)}/>
                </svg>
                <div className="absolute text-3xl font-black text-foreground">
                  {selectedReport.report.readiness_score}%
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                {selectedReport.difficulty} Difficulty Level
              </span>
            </div>

            {/* Summary details */}
            <div className="bg-gradient-to-br from-indigo-950/20 via-card/50 to-purple-950/10 border border-border p-6 rounded-2xl space-y-4 backdrop-blur-sm flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider text-muted-foreground">Session Configuration</h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Target Position</span>
                    <span className="font-bold text-foreground truncate max-w-[140px] block" title={selectedReport.target_career}>
                      {selectedReport.target_career}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Simulation Type</span>
                    <span className="font-bold text-foreground">{selectedReport.interview_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Difficulty</span>
                    <span className="font-bold text-foreground">{selectedReport.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Questions</span>
                    <span className="font-bold text-foreground">{selectedReport.report.question_breakdown.length} questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5"/> Start: {new Date(selectedReport.started_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths & Weaknesses Aggregate */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold">Core Capability Performance</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ThumbsUp className="h-4 w-4"/> Strategic Strengths
                  </span>
                  <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                    {selectedReport.report.strengths.map((str, idx) => (<li key={idx}>{str}</li>))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <ThumbsDown className="h-4 w-4"/> Detected Skill Gaps
                  </span>
                  <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                    {selectedReport.report.weaknesses.map((weak, idx) => (<li key={idx}>{weak}</li>))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Next steps aligned with Roadmap */}
            <div className="bg-gradient-to-b from-indigo-950/20 to-purple-950/20 border border-border p-6 rounded-2xl space-y-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold">Actionable Next Steps</h3>
              <p className="text-xs text-muted-foreground">AI roadmap configurations compiled from weaknesses</p>
              
              <div className="space-y-3.5">
                {selectedReport.report.recommended_next_steps.map((step, idx) => (<div key={idx} className="p-3.5 rounded-xl bg-card/60 border border-border/80 flex gap-3">
                    <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5"/>
                    <p className="text-xs leading-relaxed text-foreground">{step}</p>
                  </div>))}
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">Question Breakdown</h3>
            <div className="space-y-4">
              {selectedReport.report.question_breakdown.map((item, idx) => (<div key={idx} className="bg-card/40 border border-border p-6 rounded-2xl space-y-4 backdrop-blur-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Question {idx + 1}</span>
                      <h4 className="font-bold text-sm text-foreground leading-snug">
                        {item.question}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-indigo-400">{item.score}%</span>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Grade</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Your Submitted Answer</span>
                      <p className="text-muted-foreground leading-relaxed max-h-32 overflow-y-auto italic">
                        "{item.answer}"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-emerald-400 block text-[10px] uppercase font-bold">Strengths</span>
                        <ul className="list-disc pl-4 text-muted-foreground text-xs leading-relaxed space-y-0.5">
                          {item.strengths.slice(0, 2).map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <span className="text-red-400 block text-[10px] uppercase font-bold">Weak Gaps</span>
                        <ul className="list-disc pl-4 text-muted-foreground text-xs leading-relaxed space-y-0.5">
                          {item.weaknesses.slice(0, 2).map((w, wIdx) => <li key={wIdx}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end pt-4">
            <button onClick={handleBackToDashboard} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>)}
    </div>);
}

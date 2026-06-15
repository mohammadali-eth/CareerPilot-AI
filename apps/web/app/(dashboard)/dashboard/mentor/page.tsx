"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Edit2,
  Download,
  Pin,
  Archive,
  ArrowLeft,
  BookOpen,
  ShieldAlert,
  Search,
  User,
  Bot,
  TrendingUp,
  Award,
  Compass,
  MessageSquare,
  CheckCircle,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../../../store/auth";
import {
  mentorService,
  ChatSession,
  ChatMessage,
  MentorDashboardData,
} from "../../../../services/mentor";

// Preset suggested coach prompts
const SUGGESTED_PROMPTS = [
  "How can I close the skill gaps identified in my resume?",
  "What system design topics should I study for a Senior Engineer role?",
  "Review my mock interview performance and tell me what to fix first.",
  "Which roadmap milestones should I focus on this week?",
];

export default function MentorPage() {
  const { user } = useAuthStore();
  
  // Navigation views: "dashboard" | "chat"
  const [view, setView] = useState<"dashboard" | "chat">("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<MentorDashboardData | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Input states
  const [inputText, setInputText] = useState<string>("");

  // Modal states
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  
  const [modalSessionId, setModalSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [exportType, setExportType] = useState<"pdf" | "markdown" | "text">("markdown");
  const [exportSuccessText, setExportSuccessText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load dashboard on startup
  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbInfo = await mentorService.getDashboard();
      const chatSessions = await mentorService.getSessions();
      setDashboardData(dbInfo);
      setSessions(chatSessions);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load Career Mentor dashboard. Please verify that your API backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async (initialQuery?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const query = initialQuery || "Hello Mentor, I'd like to get started on improving my profile!";
      const response = await mentorService.chat(query);
      
      // Update session lists
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
      
      // Navigate to chat
      setActiveSessionId(response.session_id);
      await loadSessionDetails(response.session_id);
      setView("chat");
    } catch (err: any) {
      setError("Failed to initialize a new session. Please verify your AI API Keys.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    setError(null);
    try {
      const details = await mentorService.getSessionDetails(sessionId);
      setMessages(details.messages || []);
    } catch (err: any) {
      setError("Failed to load session details.");
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    await loadSessionDetails(sessionId);
    setView("chat");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || submitting) return;

    const userMsg = inputText.trim();
    setInputText("");
    setSubmitting(true);
    
    // Optimistic local add
    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(),
      session_id: activeSessionId || "",
      role: "user",
      content: userMsg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await mentorService.chat(userMsg, activeSessionId || undefined);
      
      // Save active session if we just generated a new one
      if (!activeSessionId) {
        setActiveSessionId(response.session_id);
      }
      
      // Refresh messages and session lists
      await loadSessionDetails(response.session_id);
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
    } catch (err: any) {
      setError("Error sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Session management controls
  const handleTogglePin = async (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    try {
      await mentorService.updateSession(session.id, { pinned: !session.pinned });
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    try {
      await mentorService.updateSession(session.id, { archived: !session.archived });
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
    } catch (err) {
      console.error(err);
    }
  };

  const openRenameModal = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setModalSessionId(session.id);
    setRenameValue(session.title);
    setShowRenameModal(true);
  };

  const submitRename = async () => {
    if (!modalSessionId || !renameValue.trim()) return;
    try {
      await mentorService.updateSession(modalSessionId, { title: renameValue.trim() });
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
      setShowRenameModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setModalSessionId(session.id);
    setShowDeleteModal(true);
  };

  const submitDelete = async () => {
    if (!modalSessionId) return;
    try {
      await mentorService.deleteSession(modalSessionId);
      const chatSessions = await mentorService.getSessions();
      setSessions(chatSessions);
      if (activeSessionId === modalSessionId) {
        setView("dashboard");
        setActiveSessionId(null);
      }
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openExportModal = (sessionId: string) => {
    setModalSessionId(sessionId);
    setShowExportModal(true);
    setExportSuccessText(null);
  };

  const submitExport = async () => {
    if (!modalSessionId) return;
    try {
      const res = await mentorService.exportSession(modalSessionId, exportType);
      
      // Simulate file download trigger
      const element = document.createElement("a");
      const file = new Blob([res.content || ""], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `careerpilot_transcript_${modalSessionId}.${exportType === "markdown" ? "md" : exportType}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setExportSuccessText(`Successfully exported transcript to ${exportType.toUpperCase()}!`);
      setTimeout(() => setShowExportModal(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered session list
  const filteredSessions = sessions.filter(s => {
    return s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="flex flex-col gap-6 min-h-screen max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded border border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded border border-border flex items-center justify-center text-foreground bg-neutral-50 dark:bg-neutral-900">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-foreground">
              AI Career Mentor
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your NLP-powered professional advisor and roadmap strategist.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          {view === "chat" && (
            <button
              onClick={() => { setView("dashboard"); loadDashboard(); }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border hover:bg-neutral-50 dark:hover:bg-neutral-950 text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </button>
          )}
          <button
            onClick={() => handleStartNewChat()}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New Session
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 text-foreground text-xs flex items-center gap-3">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-6 w-6 text-foreground animate-spin" />
          <p className="text-xs text-muted-foreground animate-pulse">Consulting knowledge graph and profile database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Sessions list */}
          <div className="lg:col-span-1 flex flex-col gap-4 p-4 rounded border border-border bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Advisory History</h2>
              <span className="text-[10px] px-2 py-0.5 rounded border border-border text-foreground font-mono bg-neutral-50 dark:bg-neutral-900">{filteredSessions.length}</span>
            </div>
            
            {/* Search sessions */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            {/* Session list items */}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No sessions found.</div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`group relative p-3 rounded border text-left cursor-pointer transition-colors ${
                        isActive
                          ? "bg-neutral-100 dark:bg-neutral-900 border-foreground/40 text-foreground"
                          : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-950 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs truncate pr-4 text-foreground">{session.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(e, session)}
                            title={session.pinned ? "Unpin chat" : "Pin chat"}
                            className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${session.pinned ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleToggleArchive(e, session)}
                            title={session.archived ? "Unarchive chat" : "Archive chat"}
                            className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${session.archived ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            <Archive className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => openRenameModal(e, session)}
                            title="Rename"
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(e, session)}
                            title="Delete"
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {session.summary && (
                        <p className="text-[10px] text-muted-foreground truncate mt-1">{session.summary}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                        {session.pinned && <span className="px-1.5 py-0.2 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground font-bold">PINNED</span>}
                        {session.archived && <span className="px-1.5 py-0.2 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground font-bold">ARCHIVED</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA OR DASHBOARD VIEWER */}
          <div className="lg:col-span-3">
            
            {/* VIEW A: DASHBOARD MODE */}
            {view === "dashboard" && (
              <div className="flex flex-col gap-6">
                
                {/* 1. LATEST ADVICE HERO CARD */}
                <div className="p-6 rounded border border-border bg-card relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-4.5 w-4.5 text-foreground" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Latest Advisory Summary</span>
                  </div>
                  <blockquote className="text-sm md:text-base text-foreground font-semibold italic mb-4 leading-relaxed">
                    "{dashboardData?.latest_advice || 'Start a conversation to receive personalized career coaching tailored to your background.'}"
                  </blockquote>
                  
                  {dashboardData?.recent_sessions && dashboardData.recent_sessions.length > 0 && (
                    <button
                      onClick={() => handleSelectSession(dashboardData?.recent_sessions?.[0]?.id || "")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-foreground hover:underline"
                    >
                      Continue Advisory Chat
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* 2. RAG CONTEXT ANALYTICS / COGNITIVE INSIGHTS */}
                {dashboardData?.insights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Discussed topics & strengths */}
                    <div className="p-5 rounded border border-border bg-card flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-border pb-3">
                        <Award className="h-4.5 w-4.5 text-foreground" />
                        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Strengths & Topics</h3>
                      </div>
                      
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-2 font-bold uppercase tracking-wider">Most Discussed Topics</span>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.insights.most_discussed_topics.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs rounded bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-2 font-bold uppercase tracking-wider">Identified Strengths</span>
                        <ul className="space-y-2">
                          {dashboardData.insights.top_strengths.map((s, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-foreground shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Weaknesses & Career Trends */}
                    <div className="p-5 rounded border border-border bg-card flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-border pb-3">
                        <TrendingUp className="h-4.5 w-4.5 text-foreground" />
                        <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Skill Gaps & Trends</h3>
                      </div>
                      
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-2 font-bold uppercase tracking-wider">Focus Gaps to Target</span>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.insights.top_weaknesses.map((w, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs rounded bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground font-semibold">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-2 font-bold uppercase tracking-wider">Emerging Industry Trends</span>
                        <ul className="space-y-2">
                          {dashboardData.insights.career_trends.map((t, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Compass className="h-4 w-4 text-foreground shrink-0" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. RECOMMENDED NEXT ACTIONS */}
                <div className="p-6 rounded border border-border bg-card">
                  <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                    <BookOpen className="h-4.5 w-4.5 text-foreground" />
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Recommended Advisory Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData?.recommended_actions && dashboardData.recommended_actions.length > 0 ? (
                      dashboardData.recommended_actions.map((act, idx) => (
                        <div key={idx} className="p-4 rounded bg-neutral-50 dark:bg-neutral-950 border border-border flex flex-col justify-between gap-3">
                          <p className="text-xs text-foreground leading-relaxed font-semibold">{act}</p>
                          <button
                            onClick={() => handleStartNewChat(`Tell me more about how to: ${act}`)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-foreground hover:underline uppercase mt-2 self-start"
                          >
                            Explore Action
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-6 text-muted-foreground text-xs">No recommended actions generated.</div>
                    )}
                  </div>
                </div>

                {/* 4. PRESET PROMPTS / START NEW ADVISORY PANEL */}
                <div className="p-6 rounded border border-border bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-foreground" />
                    Consult on a Specific Career Topic
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SUGGESTED_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStartNewChat(promptText)}
                        className="p-4 rounded border border-border bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left text-xs text-foreground font-semibold transition-all duration-150 flex items-center justify-between group"
                      >
                        <span className="pr-4">{promptText}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* VIEW B: ACTIVE CHAT MODE */}
            {view === "chat" && (
              <div className="flex flex-col h-[650px] rounded border border-border bg-card overflow-hidden">
                
                {/* Chat header panel */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider truncate max-w-[200px]">
                      {sessions.find(s => s.id === activeSessionId)?.title || "Advisory Chat"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => activeSessionId && openExportModal(activeSessionId)}
                      title="Export Transcript"
                      className="p-2 rounded border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
                      <Bot className="h-8 w-8 text-neutral-450 mb-2" />
                      <p>Start chatting with your mentor by entering a question below.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isBot = msg.role === "assistant";
                      
                      // Highlight AI Context Explanation section if present
                      const explanationIndex = msg.content.indexOf("### 🤖 AI Context");
                      let mainContent = msg.content;
                      let explanationContent = "";
                      
                      if (explanationIndex !== -1) {
                        mainContent = msg.content.substring(0, explanationIndex).trim();
                        explanationContent = msg.content.substring(explanationIndex).trim();
                      }

                      return (
                        <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                          <div className={`h-8 w-8 rounded border shrink-0 flex items-center justify-center ${
                            isBot 
                              ? "bg-neutral-50 dark:bg-neutral-900 border-border text-foreground" 
                              : "bg-neutral-150 border-border text-foreground"
                          }`}>
                            {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className={`p-4 rounded text-xs leading-relaxed whitespace-pre-line border ${
                              isBot
                                ? "bg-neutral-50 dark:bg-neutral-950 text-foreground border-border"
                                : "bg-foreground text-background border-foreground"
                            }`}>
                              {mainContent}

                              {/* AI Explanation Layer Panel */}
                              {isBot && explanationContent && (
                                <div className="mt-4 pt-4 border-t border-border bg-neutral-100 dark:bg-neutral-900 -mx-4 -mb-4 p-4 rounded-b">
                                  <div className="text-[10px] text-foreground font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3" />
                                    AI Decision Mapping Context
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-normal whitespace-pre-line">
                                    {explanationContent.replace("### 🤖 AI Context Alignment Explanation", "").trim()}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <span className="text-[9px] text-muted-foreground text-right px-1">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {submitting && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="h-8 w-8 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-4 rounded bg-neutral-50 dark:bg-neutral-950 text-muted-foreground text-xs border border-border flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="p-3 bg-neutral-50 dark:bg-neutral-950 border-t border-border flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask your Career Mentor anything..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={submitting}
                    className="flex-1 bg-background border border-border rounded px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || submitting}
                    className="px-4 py-2.5 rounded bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>
            )}

          </div>

        </div>
      )}

      {/* RENAME MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded bg-card border border-border flex flex-col gap-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Rename Chat Session</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:border-foreground"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border text-muted-foreground hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={submitRename}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded bg-card border border-border flex flex-col gap-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Delete Advisory Chat</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this chat advisory session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border text-muted-foreground hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={submitDelete}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded bg-card border border-border flex flex-col gap-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Conversation
            </h3>
            
            {exportSuccessText ? (
              <div className="py-4 text-center text-xs text-foreground font-bold">
                {exportSuccessText}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select a document format to save your coaching session, including AI context explanations and weakness recommendations.
                </p>
                <div className="grid grid-cols-3 gap-2 py-2">
                  {(["markdown", "pdf", "text"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setExportType(type)}
                      className={`p-3 rounded border text-xs font-bold uppercase ${
                        exportType === type
                          ? "bg-foreground text-background border-foreground"
                          : "bg-neutral-50 dark:bg-neutral-900 border-border text-muted-foreground hover:border-foreground/45 hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border text-muted-foreground hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitExport}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  >
                    Generate Export
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

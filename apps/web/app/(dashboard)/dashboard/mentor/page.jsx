"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Plus, Trash2, Edit2, Download, Pin, Archive, ArrowLeft, BookOpen, ShieldAlert, Search, User, Bot, TrendingUp, Award, Compass, MessageSquare, CheckCircle, Clock, ChevronRight, } from "lucide-react";
import { useAuthStore } from "../../../../store/auth";
import { mentorService, } from "../../../../services/mentor";
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
    const [view, setView] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    // Data states
    const [dashboardData, setDashboardData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    // Input states
    const [inputText, setInputText] = useState("");
    // Modal states
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [modalSessionId, setModalSessionId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [exportType, setExportType] = useState("markdown");
    const [exportSuccessText, setExportSuccessText] = useState(null);
    const messagesEndRef = useRef(null);
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
        }
        catch (err) {
            console.error(err);
            setError("Failed to load Career Mentor dashboard. Please verify that your API backend is running.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleStartNewChat = async (initialQuery) => {
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
        }
        catch (err) {
            setError("Failed to initialize a new session. Please verify your AI API Keys.");
        }
        finally {
            setSubmitting(false);
        }
    };
    const loadSessionDetails = async (sessionId) => {
        setError(null);
        try {
            const details = await mentorService.getSessionDetails(sessionId);
            setMessages(details.messages || []);
        }
        catch (err) {
            setError("Failed to load session details.");
        }
    };
    const handleSelectSession = async (sessionId) => {
        setActiveSessionId(sessionId);
        await loadSessionDetails(sessionId);
        setView("chat");
    };
    const handleSendMessage = async (e) => {
        if (e)
            e.preventDefault();
        if (!inputText.trim() || submitting)
            return;
        const userMsg = inputText.trim();
        setInputText("");
        setSubmitting(true);
        // Optimistic local add
        const tempUserMsg = {
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
        }
        catch (err) {
            setError("Error sending message. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
    // Session management controls
    const handleTogglePin = async (e, session) => {
        e.stopPropagation();
        try {
            await mentorService.updateSession(session.id, { pinned: !session.pinned });
            const chatSessions = await mentorService.getSessions();
            setSessions(chatSessions);
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleToggleArchive = async (e, session) => {
        e.stopPropagation();
        try {
            await mentorService.updateSession(session.id, { archived: !session.archived });
            const chatSessions = await mentorService.getSessions();
            setSessions(chatSessions);
        }
        catch (err) {
            console.error(err);
        }
    };
    const openRenameModal = (e, session) => {
        e.stopPropagation();
        setModalSessionId(session.id);
        setRenameValue(session.title);
        setShowRenameModal(true);
    };
    const submitRename = async () => {
        if (!modalSessionId || !renameValue.trim())
            return;
        try {
            await mentorService.updateSession(modalSessionId, { title: renameValue.trim() });
            const chatSessions = await mentorService.getSessions();
            setSessions(chatSessions);
            setShowRenameModal(false);
        }
        catch (err) {
            console.error(err);
        }
    };
    const openDeleteModal = (e, session) => {
        e.stopPropagation();
        setModalSessionId(session.id);
        setShowDeleteModal(true);
    };
    const submitDelete = async () => {
        if (!modalSessionId)
            return;
        try {
            await mentorService.deleteSession(modalSessionId);
            const chatSessions = await mentorService.getSessions();
            setSessions(chatSessions);
            if (activeSessionId === modalSessionId) {
                setView("dashboard");
                setActiveSessionId(null);
            }
            setShowDeleteModal(false);
        }
        catch (err) {
            console.error(err);
        }
    };
    const openExportModal = (sessionId) => {
        setModalSessionId(sessionId);
        setShowExportModal(true);
        setExportSuccessText(null);
    };
    const submitExport = async () => {
        if (!modalSessionId)
            return;
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
        }
        catch (err) {
            console.error(err);
        }
    };
    // Filtered session list
    const filteredSessions = sessions.filter(s => {
        const matchesQuery = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesQuery;
    });
    return (<div className="flex flex-col gap-6 min-h-screen text-slate-100 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/50 border border-indigo-500/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="h-6 w-6 animate-pulse"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              AI Career Mentor
            </h1>
            <p className="text-sm text-slate-400">
              Your NLP-powered professional advisor and roadmap strategist.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {view === "chat" && (<button onClick={() => { setView("dashboard"); loadDashboard(); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4"/>
              Back to Dashboard
            </button>)}
          <button onClick={() => handleStartNewChat()} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
            <Plus className="h-4 w-4"/>
            New Session
          </button>
        </div>
      </div>

      {error && (<div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0"/>
          <span>{error}</span>
        </div>)}

      {loading ? (<div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"/>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-l-transparent animate-spin"/>
          </div>
          <p className="text-sm text-slate-400 animate-pulse">Consulting knowledge graph and profile database...</p>
        </div>) : (<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Sessions list */}
          <div className="lg:col-span-1 flex flex-col gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Advisory History</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{filteredSessions.length}</span>
            </div>
            
            {/* Search sessions */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500"/>
              <input type="text" placeholder="Search history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"/>
            </div>

            {/* Session list items */}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (<div className="text-center py-8 text-xs text-slate-500">No sessions found.</div>) : (filteredSessions.map((session) => {
                const isActive = activeSessionId === session.id;
                return (<div key={session.id} onClick={() => handleSelectSession(session.id)} className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${isActive
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-200"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm truncate pr-4">{session.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => handleTogglePin(e, session)} title={session.pinned ? "Unpin chat" : "Pin chat"} className={`p-1 rounded hover:bg-slate-800 ${session.pinned ? "text-indigo-400" : "text-slate-500"}`}>
                            <Pin className="h-3 w-3"/>
                          </button>
                          <button onClick={(e) => handleToggleArchive(e, session)} title={session.archived ? "Unarchive chat" : "Archive chat"} className={`p-1 rounded hover:bg-slate-800 ${session.archived ? "text-indigo-400" : "text-slate-500"}`}>
                            <Archive className="h-3 w-3"/>
                          </button>
                          <button onClick={(e) => openRenameModal(e, session)} title="Rename" className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300">
                            <Edit2 className="h-3 w-3"/>
                          </button>
                          <button onClick={(e) => openDeleteModal(e, session)} title="Delete" className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400">
                            <Trash2 className="h-3 w-3"/>
                          </button>
                        </div>
                      </div>
                      
                      {session.summary && (<p className="text-xs text-slate-500 truncate mt-1">{session.summary}</p>)}
                      
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <Clock className="h-3 w-3"/>
                        <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                        {session.pinned && <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-medium">Pinned</span>}
                        {session.archived && <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Archived</span>}
                      </div>
                    </div>);
            }))}
            </div>
          </div>

          {/* MAIN CHAT AREA OR DASHBOARD VIEWER */}
          <div className="lg:col-span-3">
            
            {/* VIEW A: DASHBOARD MODE */}
            {view === "dashboard" && (<div className="flex flex-col gap-6">
                
                {/* 1. LATEST ADVICE HERO CARD */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"/>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-indigo-400"/>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Latest Advisory Summary</span>
                  </div>
                  <blockquote className="text-md md:text-lg text-slate-200 font-medium italic mb-4 leading-relaxed">
                    "{dashboardData?.latest_advice || 'Start a conversation to receive personalized career coaching tailored to your background.'}"
                  </blockquote>
                  
                  {dashboardData?.recent_sessions && dashboardData.recent_sessions.length > 0 && (<button onClick={() => handleSelectSession(dashboardData?.recent_sessions?.[0]?.id || "")} className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                      Continue Advisory Chat
                      <ChevronRight className="h-3 w-3"/>
                    </button>)}
                </div>

                {/* 2. RAG CONTEXT ANALYTICS / COGNITIVE INSIGHTS */}
                {dashboardData?.insights && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Discussed topics & strengths */}
                    <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Award className="h-5 w-5 text-emerald-400"/>
                        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Strengths & Topics</h3>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-400 block mb-2 font-medium">Most Discussed Topics</span>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.insights.most_discussed_topics.map((t, idx) => (<span key={idx} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                              {t}
                            </span>))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400 block mb-2 font-medium">Identified Strengths</span>
                        <ul className="space-y-2">
                          {dashboardData.insights.top_strengths.map((s, idx) => (<li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0"/>
                              <span>{s}</span>
                            </li>))}
                        </ul>
                      </div>
                    </div>

                    {/* Weaknesses & Career Trends */}
                    <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <TrendingUp className="h-5 w-5 text-amber-400"/>
                        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Skill Gaps & Trends</h3>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-400 block mb-2 font-medium">Focus Gaps to Target</span>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.insights.top_weaknesses.map((w, idx) => (<span key={idx} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                              {w}
                            </span>))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400 block mb-2 font-medium">Emerging Industry Trends</span>
                        <ul className="space-y-2">
                          {dashboardData.insights.career_trends.map((t, idx) => (<li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                              <Compass className="h-4 w-4 text-indigo-400 shrink-0"/>
                              <span>{t}</span>
                            </li>))}
                        </ul>
                      </div>
                    </div>

                  </div>)}

                {/* 3. RECOMMENDED NEXT ACTIONS */}
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <BookOpen className="h-5 w-5 text-indigo-400"/>
                    <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Recommended Advisory Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData?.recommended_actions && dashboardData.recommended_actions.length > 0 ? (dashboardData.recommended_actions.map((act, idx) => (<div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{act}</p>
                          <button onClick={() => handleStartNewChat(`Tell me more about how to: ${act}`)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase mt-2">
                            Explore Action
                            <ChevronRight className="h-3 w-3"/>
                          </button>
                        </div>))) : (<div className="col-span-3 text-center py-6 text-slate-500 text-xs">No recommended actions generated.</div>)}
                  </div>
                </div>

                {/* 4. PRESET PROMPTS / START NEW ADVISORY PANEL */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-400"/>
                    Consult on a Specific Career Topic
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SUGGESTED_PROMPTS.map((promptText, idx) => (<button key={idx} onClick={() => handleStartNewChat(promptText)} className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-left text-xs text-slate-300 hover:text-indigo-200 transition-all duration-150 flex items-center justify-between group">
                        <span className="pr-4">{promptText}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"/>
                      </button>))}
                  </div>
                </div>

              </div>)}

            {/* VIEW B: ACTIVE CHAT MODE */}
            {view === "chat" && (<div className="flex flex-col h-[650px] rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md overflow-hidden">
                
                {/* Chat header panel */}
                <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
                    <h3 className="font-semibold text-slate-200 text-sm truncate max-w-[200px]">
                      {sessions.find(s => s.id === activeSessionId)?.title || "Advisory Chat"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => activeSessionId && openExportModal(activeSessionId)} title="Export Transcript" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Download className="h-4 w-4"/>
                    </button>
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                      <Bot className="h-10 w-10 text-slate-700 mb-2"/>
                      <p>Start chatting with your mentor by entering a question below.</p>
                    </div>) : (messages.map((msg) => {
                    const isBot = msg.role === "assistant";
                    // Highlight AI Context Explanation section if present
                    const explanationIndex = msg.content.indexOf("### 🤖 AI Context");
                    let mainContent = msg.content;
                    let explanationContent = "";
                    if (explanationIndex !== -1) {
                        mainContent = msg.content.substring(0, explanationIndex).trim();
                        explanationContent = msg.content.substring(explanationIndex).trim();
                    }
                    return (<div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                          <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${isBot
                            ? "bg-indigo-950/50 border-indigo-500/20 text-indigo-400"
                            : "bg-slate-800 border-slate-700 text-slate-400"}`}>
                            {isBot ? <Bot className="h-4 w-4"/> : <User className="h-4 w-4"/>}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${isBot
                            ? "bg-slate-950/80 text-slate-200 border border-slate-850"
                            : "bg-indigo-600 text-white rounded-tr-none"}`}>
                              {mainContent}

                              {/* AI Explanation Layer Panel */}
                              {isBot && explanationContent && (<div className="mt-4 pt-4 border-t border-indigo-500/10 bg-indigo-500/5 -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-slate-800/80">
                                  <div className="text-xs text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3"/>
                                    AI Decision Mapping Context
                                  </div>
                                  <p className="text-xs text-slate-400 leading-normal whitespace-pre-line">
                                    {explanationContent.replace("### 🤖 AI Context Alignment Explanation", "").trim()}
                                  </p>
                                </div>)}
                            </div>
                            
                            <span className="text-[10px] text-slate-500 text-right px-1">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>);
                }))}
                  {submitting && (<div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="h-8 w-8 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Bot className="h-4 w-4"/>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/80 text-slate-400 text-sm border border-slate-850 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
                      </div>
                    </div>)}
                  <div ref={messagesEndRef}/>
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                  <input type="text" placeholder="Ask your Career Mentor anything..." value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={submitting} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"/>
                  <button type="submit" disabled={!inputText.trim() || submitting} className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    <Send className="h-4 w-4"/>
                  </button>
                </form>

              </div>)}

          </div>

        </div>)}

      {/* RENAME MODAL */}
      {showRenameModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-md font-bold text-slate-200">Rename Chat Session</h3>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500/50"/>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRenameModal(false)} className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 text-slate-400 hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={submitRename} className="px-4 py-2 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-500">
                Save
              </button>
            </div>
          </div>
        </div>)}

      {/* DELETE MODAL */}
      {showDeleteModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-md font-bold text-slate-200">Delete Advisory Chat</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this chat advisory session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 text-slate-400 hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={submitDelete} className="px-4 py-2 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-500">
                Delete
              </button>
            </div>
          </div>
        </div>)}

      {/* EXPORT MODAL */}
      {showExportModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-400"/>
              Export Conversation
            </h3>
            
            {exportSuccessText ? (<div className="py-4 text-center text-xs text-emerald-400 font-medium">
                {exportSuccessText}
              </div>) : (<>
                <p className="text-xs text-slate-400">
                  Select a document format to save your coaching session, including AI context explanations and weakness recommendations.
                </p>
                <div className="grid grid-cols-3 gap-2 py-2">
                  {["markdown", "pdf", "text"].map((type) => (<button key={type} onClick={() => setExportType(type)} className={`p-3 rounded-lg border text-xs font-semibold uppercase ${exportType === type
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"}`}>
                      {type}
                    </button>))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowExportModal(false)} className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 text-slate-400 hover:bg-slate-700">
                    Cancel
                  </button>
                  <button onClick={submitExport} className="px-4 py-2 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-500">
                    Generate Export
                  </button>
                </div>
              </>)}
          </div>
        </div>)}

    </div>);
}

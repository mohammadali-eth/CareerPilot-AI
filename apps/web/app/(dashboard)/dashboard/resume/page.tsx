"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Calendar,
  Sparkles,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  useResumes,
  useUploadResume,
  useDeleteResume,
} from "../../../../hooks/use-resumes";

export default function ResumePage() {
  const {
    data: resumes,
    isLoading: isListLoading,
    isError: isListError,
    refetch,
  } = useResumes();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();

  const [dragActive, setDragActive] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "skills" | "experience" | "education" | "projects" | "certifications"
  >("skills");

  // Automatically select the latest resume upon loading
  useEffect(() => {
    const firstResume = resumes?.[0];
    if (firstResume && !selectedResumeId) {
      setSelectedResumeId(firstResume.id);
    }
  }, [resumes, selectedResumeId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await handleFileUpload(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.endsWith(".pdf") &&
      !file.name.endsWith(".docx")
    ) {
      alert("Only PDF and DOCX files are supported.");
      return;
    }

    try {
      const res = await uploadMutation.mutateAsync(file);
      setSelectedResumeId(res.resume.id);
    } catch (err: any) {
      alert(err.message || "Failed to upload and parse resume.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        "Are you sure you want to delete this resume and all its analysis reports?",
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
        if (selectedResumeId === id) {
          setSelectedResumeId(null);
        }
      } catch (err: any) {
        alert(err.message || "Failed to delete resume.");
      }
    }
  };

  // Find the selected resume model
  const activeResume = resumes?.find((r) => r.id === selectedResumeId) || null;
  const latestScore = activeResume?.scores?.[0] || null;
  const latestATSReport = activeResume?.ats_reports?.[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Resume Intelligence
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Upload resumes to audit keywords, run semantic classifications, and
          score your ATS compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Hand: Upload Box & Historical Upload List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Card */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel p-6 rounded border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors min-h-[220px] ${
              dragActive
                ? "border-foreground bg-neutral-50 dark:bg-neutral-900"
                : "border-border hover:border-neutral-400 dark:hover:border-neutral-800"
            }`}
          >
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="h-6 w-6 text-foreground animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Analyzing CV...
                </p>
                <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
                  Parsing layout structures, applying semantic schemas, and grading ATS relevance vectors.
                </p>
              </div>
            ) : (
              <>
                <div className="h-9 w-9 rounded border border-border flex items-center justify-center text-foreground mb-3 bg-neutral-50 dark:bg-neutral-900">
                  <Upload className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Upload CV / Resume</h3>
                <p className="text-[10px] text-muted-foreground mt-1.5 max-w-[180px] leading-relaxed">
                  Drag and drop PDF or DOCX file. Max size 5MB.
                </p>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="resume-file"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Select File
                </label>
              </>
            )}
          </div>

          {/* History Lists */}
          <div className="glass-panel p-6 rounded border border-border space-y-4">
            <h3 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-4 w-4" /> Historical Uploads
            </h3>

            {isListLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : isListError ? (
              <div className="flex flex-col items-center justify-center text-center p-4 border border-border bg-neutral-50 dark:bg-neutral-950 rounded">
                <AlertTriangle className="h-4 w-4 text-foreground mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Failed to load history
                </span>
                <button
                  onClick={() => refetch()}
                  className="text-[10px] font-bold text-foreground hover:underline mt-1"
                >
                  Try Again
                </button>
              </div>
            ) : !resumes || resumes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No resumes uploaded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {resumes.map((resume) => {
                  const isActive = resume.id === selectedResumeId;
                  const score = resume.scores?.[0]?.overall_score || null;

                  return (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`flex items-center justify-between p-3 rounded border text-left cursor-pointer transition-colors ${
                        isActive
                          ? "bg-neutral-100 dark:bg-neutral-900 border-foreground/40"
                          : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        />
                        <div className="truncate min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">
                            {resume.filename}
                          </p>
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {score !== null && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                              score >= 80
                                ? "bg-black text-white dark:bg-white dark:text-black border-foreground"
                                : score >= 60
                                  ? "bg-neutral-100 border-neutral-300 text-neutral-800 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200"
                                  : "bg-neutral-50 border-neutral-200 text-neutral-400"
                            }`}
                          >
                            {score}%
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-muted-foreground hover:text-foreground"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Active Analysis Report & Score Cards */}
        <div className="lg:col-span-2 space-y-6">
          {activeResume ? (
            <div className="space-y-6">
              {/* Top Row: Score Grades */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* ATS Score Card */}
                <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[9px] font-bold tracking-wider uppercase">
                      ATS Score
                    </span>
                    <TrendingUp className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black">
                      {latestATSReport?.ats_score ?? "N/A"}%
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Keyword parsing alignment
                    </p>
                  </div>
                </div>

                {/* Resume Score Card */}
                <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[9px] font-bold tracking-wider uppercase">
                      Resume Score
                    </span>
                    <FileText className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black">
                      {latestScore?.overall_score ?? "N/A"}%
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Overall quality grading
                    </p>
                  </div>
                </div>

                {/* Submetrics Details Card */}
                <div className="glass-panel p-5 rounded border border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[9px] font-bold tracking-wider uppercase">
                      Breakdowns
                    </span>
                    <Layers className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Structure:</span>
                      <span className="font-bold">
                        {latestScore?.structure_score ?? "N/A"}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Content:</span>
                      <span className="font-bold">
                        {latestScore?.content_score ?? "N/A"}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Extracted Data with Tab Interfaces */}
              <div className="glass-panel p-6 rounded border border-border space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Extracted Resume Details
                </h3>

                {/* Tab select bar */}
                <div className="flex border-b border-border overflow-x-auto gap-2 scrollbar-none pb-0.5">
                  {(
                    [
                      "skills",
                      "experience",
                      "education",
                      "projects",
                      "certifications",
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold border-b-2 capitalize transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content areas */}
                <div className="pt-2 min-h-[160px]">
                  {activeTab === "skills" && (
                    <div className="flex flex-wrap gap-2 animate-fade-in">
                      {activeResume.extracted_data?.skills &&
                      activeResume.extracted_data.skills.length > 0 ? (
                        activeResume.extracted_data.skills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 text-foreground rounded text-[11px] font-semibold border border-border"
                            >
                              {skill}
                            </span>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No technical skills detected.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "experience" && (
                    <ul className="space-y-3 animate-fade-in">
                      {activeResume.extracted_data?.experience &&
                      activeResume.extracted_data.experience.length > 0 ? (
                        activeResume.extracted_data.experience.map(
                          (exp, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                              <span>{exp}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No employment history detected.
                        </p>
                      )}
                    </ul>
                  )}

                  {activeTab === "education" && (
                    <ul className="space-y-3 animate-fade-in">
                      {activeResume.extracted_data?.education &&
                      activeResume.extracted_data.education.length > 0 ? (
                        activeResume.extracted_data.education.map(
                          (edu, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                              <span>{edu}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No academic records detected.
                        </p>
                      )}
                    </ul>
                  )}

                  {activeTab === "projects" && (
                    <ul className="space-y-3 animate-fade-in">
                      {activeResume.extracted_data?.projects &&
                      activeResume.extracted_data.projects.length > 0 ? (
                        activeResume.extracted_data.projects.map(
                          (proj, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                              <span>{proj}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No personal portfolios detected.
                        </p>
                      )}
                    </ul>
                  )}

                  {activeTab === "certifications" && (
                    <ul className="space-y-3 animate-fade-in">
                      {activeResume.extracted_data?.certifications &&
                      activeResume.extracted_data.certifications.length > 0 ? (
                        activeResume.extracted_data.certifications.map(
                          (cert, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                              <span>{cert}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No certifications detected.
                        </p>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Lower Section: Missing Keywords & Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Keywords Column */}
                <div className="glass-panel p-6 rounded border border-border space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Missing Keywords
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Add these terms to align with automated resume parsers.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {latestATSReport?.missing_keywords &&
                    latestATSReport.missing_keywords.length > 0 ? (
                      latestATSReport.missing_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-border rounded text-[10px] font-bold capitalize text-foreground"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <CheckCircle className="h-4 w-4" /> No missing keywords detected!
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions / Advice Column */}
                <div className="glass-panel p-6 rounded border border-border space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> AI Recommendations
                  </h3>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {latestScore?.suggestions?.structure &&
                      latestScore.suggestions.structure.map((item, i) => (
                        <div
                          key={`s-${i}`}
                          className="p-2.5 border border-border rounded bg-neutral-50 dark:bg-neutral-950"
                        >
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block">
                            Layout Recommendation
                          </span>
                          <p className="text-[11px] text-foreground mt-1 leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}

                    {latestScore?.suggestions?.content &&
                      latestScore.suggestions.content.map((item, i) => (
                        <div
                          key={`c-${i}`}
                          className="p-2.5 border border-border rounded bg-neutral-50 dark:bg-neutral-950"
                        >
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block">
                            Content Optimization
                          </span>
                          <p className="text-[11px] text-foreground mt-1 leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}

                    {!latestScore?.suggestions?.structure?.length &&
                      !latestScore?.suggestions?.content?.length && (
                        <p className="text-xs text-muted-foreground">
                          Your layout and content details are in excellent shape!
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded border border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="h-10 w-10 rounded border border-border flex items-center justify-center text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider">No Resume Selected</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Upload a PDF/DOCX file on the left side or click an existing record to load the analytics metrics board.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

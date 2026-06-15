"use client";

import React, { useState } from "react";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function ResumePage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Only PDF resumes are supported.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your CV to extract skills, evaluate ATS metrics, and calculate industry alignments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload card */}
        <div className="md:col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors min-h-[300px] ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
              <Upload className="h-6 w-6" />
            </div>

            <h3 className="text-md font-semibold">Upload your CV / Resume</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Drag and drop your PDF resume here, or click to browse files. Max size 5MB.
            </p>

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="resume-upload"
              className="mt-6 inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 text-xs font-semibold cursor-pointer transition-colors"
            >
              Select PDF File
            </label>
          </div>
        </div>

        {/* Side Panel: Information */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-bold text-sm">Upload Status</h3>
            
            {file ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{file.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <CheckCircle className="h-4 w-4" /> Ready for AI Extraction
                </div>
                <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-xs font-semibold transition-colors mt-4">
                  Run Analyzer Engine
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" /> No file selected.
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border space-y-3">
            <h3 className="font-bold text-sm">ATS Best Practices</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our analyzer validates headers, structural schemas, keyword density indexes, and role target vectors. Avoid using graphics or text boxes in your PDF files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

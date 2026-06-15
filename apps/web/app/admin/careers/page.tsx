"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, AlertOctagon } from "lucide-react";
import { adminService } from "../../../services/admin";

export default function CareerDatabaseManager() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [salaryEntry, setSalaryEntry] = useState("75000");
  const [trends, setTrends] = useState("Growing");
  const [outlook, setOutlook] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const payload = {
        title,
        category,
        description,
        required_skills: skillsArray,
        salary_data: { median: parseInt(salaryEntry) || 0, currency: "USD" },
        market_trends: { outlook: trends },
        future_outlook: outlook,
      };

      await adminService.createCareerDefinition(payload);
      setSuccess("Career profile added to dynamic catalog successfully.");
      
      // Clear form inputs
      setTitle("");
      setCategory("");
      setDescription("");
      setSkills("");
      setSalaryEntry("75000");
      setOutlook("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to catalog career definition.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Career Catalog Manager</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Catalog and define career roles, market salary standards, and skill expectations dynamically.
        </p>
      </div>

      {/* Main Form container */}
      <div className="p-6 rounded border border-border bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                placeholder="E.g., Senior ML Platform Engineer"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <input
                type="text"
                placeholder="E.g., Engineering & DevOps"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Provide a detailed role description, target market needs, and general responsibilities..."
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Required Skills (Comma separated)</label>
            <input
              type="text"
              placeholder="E.g., PyTorch, Kubernetes, MLOps, Triton Inference Server"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Median Annual Salary (USD)</label>
              <input
                type="number"
                placeholder="75000"
                required
                value={salaryEntry}
                onChange={(e) => setSalaryEntry(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Market Demand & Trend</label>
              <select
                value={trends}
                onChange={(e) => setTrends(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="Growing">High Growth & Demand</option>
                <option value="Stable">Stable</option>
                <option value="Declining">Declining Demand</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Future Industry Outlook</label>
            <textarea
              placeholder="What are the next 5-year industry shifts expected for this career path?"
              required
              rows={3}
              value={outlook}
              onChange={(e) => setOutlook(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          {/* Feedback alerts */}
          {success && (
            <div className="p-3.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground text-xs font-bold flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold uppercase tracking-wider rounded border border-foreground transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? "Cataloging Role..." : "Catalog Career Definition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

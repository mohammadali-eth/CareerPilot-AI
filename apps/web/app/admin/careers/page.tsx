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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Catalog Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catalog and define career roles, market salary standards, and skill expectations dynamically.
        </p>
      </div>

      {/* Main Form container */}
      <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Job Title</label>
              <input
                type="text"
                placeholder="E.g., Senior ML Platform Engineer"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
              <input
                type="text"
                placeholder="E.g., Engineering & DevOps"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <textarea
              placeholder="Provide a detailed role description, target market needs, and general responsibilities..."
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Required Skills (Comma separated)</label>
            <input
              type="text"
              placeholder="E.g., PyTorch, Kubernetes, MLOps, Triton Inference Server"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Median Annual Salary (USD)</label>
              <input
                type="number"
                placeholder="75000"
                required
                value={salaryEntry}
                onChange={(e) => setSalaryEntry(e.target.value)}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Market Demand & Trend</label>
              <select
                value={trends}
                onChange={(e) => setTrends(e.target.value)}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
              >
                <option value="Growing">High Growth & Demand</option>
                <option value="Stable">Stable</option>
                <option value="Declining">Declining Demand</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Future Industry Outlook</label>
            <textarea
              placeholder="What are the next 5-year industry shifts expected for this career path?"
              required
              rows={3}
              value={outlook}
              onChange={(e) => setOutlook(e.target.value)}
              className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
            />
          </div>

          {/* Feedback alerts */}
          {success && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs flex items-center gap-2">
              <AlertOctagon className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all disabled:opacity-50"
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

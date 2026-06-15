"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, AlertOctagon } from "lucide-react";
import { adminService } from "../../../services/admin";

export default function SkillDatabaseManager() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [importance, setImportance] = useState("medium");
  const [relationships, setRelationships] = useState("");
  const [mappingField, setMappingField] = useState("Technology");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const relsArray = relationships.split(",").map((r) => r.trim()).filter(Boolean);

    try {
      const payload = {
        name,
        category,
        importance,
        relationships: relsArray,
        mapping: { domain: mappingField },
      };

      await adminService.createSkillDefinition(payload);
      setSuccess("Skill mapping configured in database index successfully.");
      
      // Clear form inputs
      setName("");
      setCategory("");
      setImportance("medium");
      setRelationships("");
      setMappingField("Technology");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to configure skill definition.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Skills Index Manager</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Add skill entries, categorize domains, tag market weight importances, and link correlated technologies dynamically.
        </p>
      </div>

      {/* Form Container */}
      <div className="p-6 rounded border border-border bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Skill Name</label>
              <input
                type="text"
                placeholder="E.g., PyTorch"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category Group</label>
              <input
                type="text"
                placeholder="E.g., Deep Learning Frameworks"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Market Importance</label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="high">High (Core Expectation)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="low">Low (Nice to Have)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Professional Domain</label>
              <input
                type="text"
                placeholder="E.g., Technology / Healthcare"
                value={mappingField}
                onChange={(e) => setMappingField(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Correlated Skills / Relationships (Comma separated)
            </label>
            <input
              type="text"
              placeholder="E.g., TensorFlow, NumPy, Deep Learning, Neural Networks"
              value={relationships}
              onChange={(e) => setRelationships(e.target.value)}
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

          {/* Action Button */}
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold uppercase tracking-wider rounded border border-foreground transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? "Configuring Mapping..." : "Configure Skill Definition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

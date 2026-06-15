"use client";

import React, { useState } from "react";
import { Save, Bell, Shield, Lock, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiLimitTokens, setAiLimitTokens] = useState("50000");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin System Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure security alert preferences, API token quotas, maintenance overrides, and default global limits.
        </p>
      </div>

      <div className="p-6 rounded border border-border bg-card">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Security alerts section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              Notifications & Security Triggers
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Real-time Security Logs</span>
                <p className="text-[10px] text-muted-foreground">Log login anomalies and failed attempts</p>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="h-4 w-4 accent-foreground rounded focus:ring-foreground bg-background border-border"
              />
            </div>
          </div>

          {/* SaaS Limits section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-foreground" />
              Platform Controls & AI Quotas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Daily AI Token Quota per User
                </label>
                <input
                  type="number"
                  value={aiLimitTokens}
                  onChange={(e) => setAiLimitTokens(e.target.value)}
                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Session Timeout Limit (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
          </div>

          {/* Maintenance mode section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 text-foreground">
              <Lock className="h-4 w-4" />
              Maintenance Overrides
            </h3>

            <div className="flex items-center justify-between p-3 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Activate Maintenance Mode</span>
                <p className="text-[10px] text-muted-foreground">Block all non-admin account portal access</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 accent-foreground rounded focus:ring-foreground bg-background border-border"
              />
            </div>
          </div>

          {/* Success Alerts */}
          {success && (
            <div className="p-3.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Configuration settings saved successfully.</span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 text-background text-xs font-bold uppercase tracking-wider rounded border border-foreground transition-all"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure security alert preferences, API token quotas, maintenance overrides, and default global limits.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card/40 backdrop-blur-md">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Security alerts section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-400" />
              Notifications & Security Triggers
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/15">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold">Real-time Security Logs</span>
                <p className="text-[10px] text-muted-foreground">Log login anomalies and failed attempts</p>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="h-4 w-4 accent-indigo-500 rounded focus:ring-indigo-500 bg-background"
              />
            </div>
          </div>

          {/* SaaS Limits section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              Platform Controls & AI Quotas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Daily AI Token Quota per User
                </label>
                <input
                  type="number"
                  value={aiLimitTokens}
                  onChange={(e) => setAiLimitTokens(e.target.value)}
                  className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Session Timeout Limit (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full p-2 text-sm border border-border rounded-lg bg-background focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Maintenance mode section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 text-destructive">
              <Lock className="h-4 w-4" />
              Maintenance Overrides
            </h3>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-destructive/5 border-destructive/10">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-destructive">Activate Maintenance Mode</span>
                <p className="text-[10px] text-muted-foreground">Block all non-admin account portal access</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 accent-destructive rounded focus:ring-destructive bg-background"
              />
            </div>
          </div>

          {/* Success Alerts */}
          {success && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Configuration settings saved successfully.
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all"
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

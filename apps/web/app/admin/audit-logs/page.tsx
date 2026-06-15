"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService, AuditLog } from "../../../services/admin";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionType, setActionType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const skip = (page - 1) * limit;
      const res = await adminService.getAuditLogs({
        skip,
        limit,
        actionType: actionType || undefined,
      });
      setLogs(res.logs);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionType]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse platform operations logging, admin deactivations, authorization privilege updates, and API security events.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card/60 hover:bg-card border border-border text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Trails
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={actionType}
          onChange={(e) => {
            setActionType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-card/40 focus:outline-none"
        >
          <option value="">All Event Types</option>
          <option value="USER_SUSPENDED">USER_SUSPENDED</option>
          <option value="USER_ACTIVATED">USER_ACTIVATED</option>
          <option value="USER_DELETED">USER_DELETED</option>
          <option value="ROLE_CHANGED">ROLE_CHANGED</option>
          <option value="PASSWORD_RESET_BY_ADMIN">PASSWORD_RESET_BY_ADMIN</option>
          <option value="CAREER_DEFINITION_CREATED">CAREER_DEFINITION_CREATED</option>
          <option value="SKILL_DEFINITION_CREATED">SKILL_DEFINITION_CREATED</option>
        </select>
      </div>

      {/* Logs List Container */}
      <div className="rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Querying security log databases...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No audited security actions matching current criteria found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Client IP</th>
                  <th className="p-4">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs leading-relaxed">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 whitespace-nowrap text-muted-foreground font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-indigo-400">
                      {log.action_type}
                    </td>
                    <td className="p-4 max-w-sm truncate text-foreground/80" title={log.description}>
                      {log.description}
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground font-mono">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                    <td className="p-4 max-w-[150px] truncate text-muted-foreground" title={log.user_agent || "N/A"}>
                      {log.user_agent || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10 text-xs">
                <span className="text-muted-foreground">
                  Showing Page {page} of {totalPages} ({total} logged entries)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

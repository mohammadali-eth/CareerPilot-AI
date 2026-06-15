"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Key,
  Trash2,
  Shield,
  Eye,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw
} from "lucide-react";
import { adminService, UserSummary, UserDetails } from "../../../services/admin";
import { useAuthStore } from "../../../store/auth";

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Query Filters state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals / Detail state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateReason, setActivateReason] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordReason, setPasswordReason] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState("SUPPORT_AGENT");
  const [roleReason, setRoleReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const res = await adminService.listUsers({
        skip,
        limit,
        search: search || undefined,
        role: role || undefined,
        isActive,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role, isActive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    try {
      const data = await adminService.getUserDetails(userId);
      setDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUserId || !suspendReason.trim()) return;
    setActionError(null);
    try {
      await adminService.suspendUser(selectedUserId, suspendReason);
      setShowSuspendModal(false);
      setSuspendReason("");
      fetchUsers();
      // Reload details if open
      handleViewDetails(selectedUserId);
    } catch (err: any) {
      setActionError(err.message || "Failed to suspend account.");
    }
  };

  const handleActivate = async () => {
    if (!selectedUserId || !activateReason.trim()) return;
    setActionError(null);
    try {
      await adminService.activateUser(selectedUserId, activateReason);
      setShowActivateModal(false);
      setActivateReason("");
      fetchUsers();
      handleViewDetails(selectedUserId);
    } catch (err: any) {
      setActionError(err.message || "Failed to activate account.");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword.trim() || !passwordReason.trim()) return;
    setActionError(null);
    try {
      await adminService.resetUserPassword(selectedUserId, {
        new_password: newPassword,
        reason: passwordReason,
      });
      setShowPasswordModal(false);
      setNewPassword("");
      setPasswordReason("");
    } catch (err: any) {
      setActionError(err.message || "Failed to reset password.");
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !targetRole || !roleReason.trim()) return;
    setActionError(null);
    try {
      await adminService.assignUserRole(selectedUserId, {
        role: targetRole,
        reason: roleReason,
      });
      setShowRoleModal(false);
      setRoleReason("");
      fetchUsers();
      handleViewDetails(selectedUserId);
    } catch (err: any) {
      setActionError(err.message || "Failed to update role permissions.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId || !deleteReason.trim()) return;
    setActionError(null);
    try {
      await adminService.deleteUser(selectedUserId, deleteReason);
      setShowDeleteModal(false);
      setDeleteReason("");
      setSelectedUserId(null);
      setDetails(null);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete user account.");
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">User Administration</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Perform administrative moderation, suspend accounts, force password changes, and assign access control tiers.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search email, name, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded border border-border bg-card focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        </form>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded border border-border bg-card text-foreground focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPPORT_AGENT">Support Agent</option>
            <option value="AUDITOR">Auditor</option>
            <option value="user">User</option>
          </select>

          <select
            value={isActive === undefined ? "" : String(isActive)}
            onChange={(e) => {
              const val = e.target.value;
              setIsActive(val === "" ? undefined : val === "true");
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded border border-border bg-card text-foreground focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Area: Grid of List & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Users Table */}
        <div className="lg:col-span-2 rounded border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground animate-pulse flex items-center justify-center gap-1.5">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Querying platform registry database...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching registered accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition-colors ${
                        selectedUserId === u.id ? "bg-neutral-50 dark:bg-neutral-950/60" : ""
                      }`}
                    >
                      <td className="p-4 font-bold max-w-[200px] truncate text-foreground">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-foreground uppercase tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${
                            u.is_active
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background text-foreground border-border"
                          }`}
                        >
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleViewDetails(u.id)}
                          className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border bg-neutral-50 dark:bg-neutral-950 text-xs">
                  <span className="text-muted-foreground">
                    Showing Page {page} of {totalPages} ({total} accounts)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded border border-border bg-card text-foreground hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded border border-border bg-card text-foreground hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Details Drawer Panel */}
        <div className="p-6 rounded border border-border bg-card space-y-6 min-h-[450px]">
          {!selectedUserId ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
              <Info className="h-10 w-10 text-muted-foreground/35 mb-3" />
              <p className="text-xs">Select a registered user to execute administrative moderation commands.</p>
            </div>
          ) : loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground animate-pulse">
              <RefreshCw className="animate-spin h-6 w-6 text-foreground" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Querying audit logs registry...</span>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Header Title Info */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[180px] text-foreground">{details.email}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">ID: {details.id.slice(0, 8)}...</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setDetails(null);
                  }}
                  className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-neutral-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Usage Stats Grid */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Usage Activity Overview</h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
                    <p className="font-extrabold text-sm text-foreground">{details.usage_summary.resumes_uploaded}</p>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 block">Resumes</span>
                  </div>
                  <div className="p-2.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
                    <p className="font-extrabold text-sm text-foreground">{details.usage_summary.interviews_simulated}</p>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 block">Interviews</span>
                  </div>
                  <div className="p-2.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
                    <p className="font-extrabold text-sm text-foreground">{details.usage_summary.roadmaps_created}</p>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 block">Roadmaps</span>
                  </div>
                  <div className="p-2.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900">
                    <p className="font-extrabold text-sm text-foreground">{details.usage_summary.reports_generated}</p>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 block">Reports</span>
                  </div>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Moderation Commands</h4>
                <div className="flex flex-col gap-2">
                  {details.is_active ? (
                    <button
                      onClick={() => setShowSuspendModal(true)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <UserX className="h-4 w-4" />
                      Suspend User Account
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowActivateModal(true)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors border border-foreground"
                    >
                      <UserCheck className="h-4 w-4" />
                      Re-activate Account
                    </button>
                  )}

                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border bg-card hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    Reset User Password
                  </button>

                  <button
                    onClick={() => setShowRoleModal(true)}
                    disabled={!isSuperAdmin}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border border-border bg-card hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground disabled:opacity-40 transition-colors"
                    title={!isSuperAdmin ? "Requires SUPER_ADMIN permissions" : "Upgrade account access"}
                  >
                    <Shield className="h-4 w-4" />
                    Modify System Role
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User Profile
                  </button>
                </div>
              </div>

              {/* Recent audit trails list */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Activity History Log</h4>
                {details.recent_activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No logins/audited actions recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {details.recent_activity.map((act) => (
                      <div key={act.id} className="p-2.5 rounded border border-border bg-neutral-50 dark:bg-neutral-900 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground uppercase tracking-wider text-[9px]">{act.action_type}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {new Date(act.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* SUSPEND MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <AlertTriangle className="h-5 w-5 text-foreground" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Suspend Account</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Provide justification for deactivating this user account.
            </p>
            <input
              type="text"
              placeholder="E.g., Terms of service violation - abuse"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            {actionError && <p className="text-[10px] font-bold text-foreground">{actionError}</p>}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-3.5 py-2 hover:bg-neutral-100 border border-border rounded text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={!suspendReason.trim()}
                className="px-3.5 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-250 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
              >
                Deactivate account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVATE MODAL */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded p-6 space-y-4 shadow-2xl animate-scaleIn">
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground border-b border-border pb-3">Re-activate User Account</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirm re-granting platform permissions to this account.
            </p>
            <input
              type="text"
              placeholder="E.g., Appeal approved by compliance team"
              value={activateReason}
              onChange={(e) => setActivateReason(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            {actionError && <p className="text-[10px] font-bold text-foreground">{actionError}</p>}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowActivateModal(false)}
                className="px-3.5 py-2 hover:bg-neutral-100 border border-border rounded text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={!activateReason.trim()}
                className="px-3.5 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-250 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider border border-foreground"
              >
                Restore user access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded p-6 space-y-4 shadow-2xl animate-scaleIn">
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground border-b border-border pb-3">Force Password Update</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Input a secure new password and justification.
            </p>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <input
                type="text"
                placeholder="E.g., Security escalation request"
                value={passwordReason}
                onChange={(e) => setPasswordReason(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            {actionError && <p className="text-[10px] font-bold text-foreground">{actionError}</p>}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-3.5 py-2 hover:bg-neutral-100 border border-border rounded text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword.trim() || !passwordReason.trim()}
                className="px-3.5 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-250 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider border border-foreground"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE CHANGE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Shield className="h-5 w-5 text-foreground" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Modify Authorization Level</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Super admin role assignment check. Assign system access tags.
            </p>
            <div className="space-y-3">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="user">User (Standard Access)</option>
                <option value="SUPPORT_AGENT">Support Agent</option>
                <option value="AUDITOR">Auditor</option>
                <option value="ADMIN">System Administrator</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
              <input
                type="text"
                placeholder="Provide role upgrade/downgrade reason"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            {actionError && <p className="text-[10px] font-bold text-foreground">{actionError}</p>}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-3.5 py-2 hover:bg-neutral-100 border border-border rounded text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!roleReason.trim()}
                className="px-3.5 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-250 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider border border-foreground"
              >
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-foreground">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Permanent Deletion</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirm complete profile deletion. This action is irreversible.
            </p>
            <input
              type="text"
              placeholder="Confirm delete reasons"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full p-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            {actionError && <p className="text-[10px] font-bold text-foreground">{actionError}</p>}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 hover:bg-neutral-100 border border-border rounded text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={!deleteReason.trim()}
                className="px-3.5 py-2 bg-foreground text-background rounded hover:bg-neutral-800 dark:hover:bg-neutral-250 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider border border-foreground"
              >
                Destroy Profile Permanent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  BrainCircuit,
  Database,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useLogout } from "../../hooks/use-auth";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "AI Usage Metrics", href: "/admin/ai-usage", icon: BrainCircuit },
  { name: "Career Database", href: "/admin/careers", icon: Database },
  { name: "Skill Database", href: "/admin/skills", icon: Database },
  { name: "Report Management", href: "/admin/reports", icon: BarChart3 },
  { name: "Audit Trail", href: "/admin/audit-logs", icon: History },
  { name: "Admin Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { user, accessToken, isInitialized } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Guard routing: block regular users and unauthenticated sessions
  useEffect(() => {
    if (isInitialized) {
      if (!accessToken) {
        router.push("/login");
      } else if (user && user.role === "user") {
        router.push("/dashboard");
      }
    }
  }, [accessToken, isInitialized, user, router]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  if (!isInitialized || !accessToken || !user || user.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  const initials =
    user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
      : user.email.slice(0, 2).toUpperCase();

  const fullName =
    user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* 1. Sidebar Panel */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        {/* Header Title */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-2">
          <Shield className="h-5 w-5 text-foreground" />
          <Link
            href="/admin"
            className="font-extrabold text-sm tracking-wider text-foreground uppercase"
          >
            Admin Portal
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-all ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-border bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded border border-border flex items-center justify-center text-xs font-bold text-foreground bg-card">
                {initials}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-bold truncate leading-tight">{fullName}</p>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-tight">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Topbar Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded border border-border hover:bg-neutral-50 text-muted-foreground"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-foreground" />
              <Link
                href="/dashboard"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                ← App Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 text-[9px] font-bold rounded border border-border bg-neutral-50 dark:bg-neutral-900 uppercase tracking-widest text-foreground">
              Secured Session
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Navigation */}
        {isMobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          >
            <aside
              className="fixed top-16 bottom-0 left-0 w-64 border-r border-border bg-card flex flex-col p-4 space-y-1.5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 border-transparent"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="pt-4 mt-auto border-t border-border flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-8.5 w-8.5 rounded border border-border flex items-center justify-center text-xs font-bold text-foreground">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]">
                      {fullName}
                    </p>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-neutral-50 rounded border border-border transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 relative bg-grid-pattern">
          {children}
        </main>
      </div>
    </div>
  );
}

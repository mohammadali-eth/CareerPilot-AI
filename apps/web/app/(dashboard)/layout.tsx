"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  TrendingUp,
  Map,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useLogout } from "../../hooks/use-auth";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Analyzer", href: "/dashboard/resume", icon: FileText },
  {
    name: "Career Match",
    href: "/dashboard/career-recommendations",
    icon: Briefcase,
  },
  { name: "Skill Gap", href: "/dashboard/skill-gap", icon: TrendingUp },
  { name: "Roadmap", href: "/dashboard/roadmap", icon: Map },
  {
    name: "Interview Simulator",
    href: "/dashboard/interview",
    icon: MessageSquare,
  },
  {
    name: "AI Career Mentor",
    href: "/dashboard/mentor",
    icon: Sparkles,
  },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/profile", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { user, accessToken, isInitialized } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Read sidebar collapsed preference on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
  }, []);

  // Protected route guard
  useEffect(() => {
    if (isInitialized && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, isInitialized, router]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(nextState));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!isInitialized || !accessToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const userInitials =
    user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
      : user.email.slice(0, 2).toUpperCase();

  const userName =
    user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.email.split("@")[0];

  const displayItems = [...navigationItems];
  if (user && user.role !== "user") {
    if (!displayItems.some(i => i.href === "/admin")) {
      displayItems.push({ name: "Admin Portal", href: "/admin", icon: Shield });
    }
  }

  return (
    <div className="min-h-screen bg-background flex bg-grid-pattern">
      {/* 1. Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-foreground"
            >
              <Sparkles className="h-4 w-4 text-foreground shrink-0" />
              CareerPilot
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto text-foreground">
              <Sparkles className="h-5 w-5" />
            </Link>
          )}

          <button
            onClick={toggleCollapse}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-2.5 py-6 space-y-1.5 overflow-y-auto">
          {displayItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all duration-150 ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="truncate min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">
                    {userName}
                  </p>
                  <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="mt-3 w-full p-1.5 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Nav Header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 z-30">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground"
          >
            <Sparkles className="h-4 w-4 text-foreground" />
            CareerPilot
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded hover:bg-muted text-muted-foreground focus:outline-none"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {isMobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          >
            <aside
              className="fixed top-16 bottom-0 left-0 w-64 border-r border-border bg-card flex flex-col p-4 space-y-1.5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {displayItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 mt-auto border-t border-border flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-foreground">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]">
                      {userName}
                    </p>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content viewport */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

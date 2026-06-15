"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, TrendingUp, Map, MessageSquare, BarChart3, Settings, LogOut, Menu, X, Sparkles, } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useLogout } from "../../hooks/use-auth";
const navigationItems = [
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
export default function DashboardLayout({ children, }) {
    const pathname = usePathname();
    const router = useRouter();
    const logoutMutation = useLogout();
    const { user, accessToken, isInitialized } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // Protected route guard
    useEffect(() => {
        if (isInitialized && !accessToken) {
            router.push("/login");
        }
    }, [accessToken, isInitialized, router]);
    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            router.push("/login");
        }
        catch (err) {
            console.error("Logout error:", err);
        }
    };
    if (!isInitialized || !accessToken || !user) {
        return (<div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
      </div>);
    }
    const userInitials = user.profile?.first_name && user.profile?.last_name
        ? `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
        : user.email.slice(0, 2).toUpperCase();
    const userName = user.profile?.first_name && user.profile?.last_name
        ? `${user.profile.first_name} ${user.profile.last_name}`
        : user.email.split("@")[0];
    return (<div className="min-h-screen bg-background flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-md">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            <Sparkles className="h-5 w-5 text-indigo-500"/>
            CareerPilot AI
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (<Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                    ? "bg-primary/10 text-primary border border-primary/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"}`}>
                <Icon className="h-4 w-4 shrink-0"/>
                {item.name}
              </Link>);
        })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                {userInitials}
              </div>
              <div className="truncate max-w-[120px]">
                <p className="text-sm font-semibold truncate leading-tight">
                  {userName}
                </p>
                <span className="text-xs text-muted-foreground capitalize leading-tight">
                  {user.role}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} title="Sign out" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4"/>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Nav Header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 z-30">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-md tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            <Sparkles className="h-4 w-4 text-indigo-500"/>
            CareerPilot AI
          </Link>
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground focus:outline-none">
            {isMobileOpen ? (<X className="h-5 w-5"/>) : (<Menu className="h-5 w-5"/>)}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {isMobileOpen && (<div className="md:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}>
            <aside className="fixed top-16 bottom-0 left-0 w-64 border-r border-border bg-card flex flex-col p-4 space-y-1 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (<Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? "bg-primary/10 text-primary border border-primary/10"
                        : "text-muted-foreground hover:bg-muted/50"}`}>
                    <Icon className="h-4 w-4 shrink-0"/>
                    {item.name}
                  </Link>);
            })}

              <div className="pt-4 mt-auto border-t border-border flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold truncate max-w-[120px]">
                      {userName}
                    </p>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4"/>
                  Sign out
                </button>
              </div>
            </aside>
          </div>)}

        {/* Main content viewport */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 relative">
          {children}
        </main>
      </div>
    </div>);
}

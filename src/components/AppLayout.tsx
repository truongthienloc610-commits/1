import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Bot,
  FileText,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookOpen,
  Flame,
  Clock,
  Calendar,
  Timer,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { to: "/lo-trinh", icon: Map, label: "Lộ trình" },
  { to: "/lich", icon: Calendar, label: "Lịch học" },
  { to: "/phong-tap-trung", icon: Timer, label: "Tập trung" },
  { to: "/hoi-ai", icon: Bot, label: "Hỏi AI" },
  { to: "/luyen-de", icon: FileText, label: "Luyện đề" },
  { to: "/dinh-huong", icon: Compass, label: "Định hướng" },
  { to: "/profile", icon: User, label: "Hồ sơ" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const { calculatedTotalMinutes, calculatedStreak } = useStudyLogs();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayStreak = Math.max(calculatedStreak, profile?.streak_days ?? 0);
  const displayMinutes = Math.max(calculatedTotalMinutes, profile?.total_study_minutes ?? 0);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()
    : "U";

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      {/* Logo Container with Theme Toggle */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">HọcAI</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3 space-y-1">
        {/* Quick stats */}
        {profile && (
          <div className="flex gap-3 px-3 py-2 text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {displayStreak} ngày
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              {Math.floor(displayMinutes / 60)}h{displayMinutes % 60}m
            </span>
          </div>
        )}

        {/* User card */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || "Học sinh"}
            </p>
            {profile?.grade && (
              <p className="text-xs text-muted-foreground">
                Lớp {profile.grade}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            <span className="font-bold">HọcAI</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

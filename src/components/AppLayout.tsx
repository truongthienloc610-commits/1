import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Bot,
  FileText,
  User,
  LogOut,
  Code2,
  Menu,
  X,
  Search,
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
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { to: "/lo-trinh", icon: Map, label: "Lộ trình học" },
  { to: "/phan-tich-code", icon: Search, label: "Chẩn đoán Code" },
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
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()
    : "U";

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Container */}
      <div className="flex h-20 items-center px-8 border-b border-slate-50">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-blue-600 p-1 rounded-lg text-white">
            <Code2 className="h-6 w-6" />
          </div>
          <span>Edu<span className="text-blue-600">AI</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-6">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all",
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-6 border-t border-slate-50 space-y-4">
        {/* Quick stats (Streak) */}
        {profile && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 fill-current" />
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Học tập</span>
            </div>
            <span className="text-sm font-black text-slate-900">{profile?.streak_count ?? 0} ngày</span>
          </div>
        )}

        {/* User card */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">
              {profile?.full_name || "Học sinh"}
            </p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              {profile?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-slate-400 font-bold hover:text-red-600 hover:bg-red-50 rounded-xl"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-50">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-50 bg-white px-6 lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="text-slate-600"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <Code2 className="h-5 w-5 text-blue-600" />
              <span>EduAI</span>
            </Link>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

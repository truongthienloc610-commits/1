import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRoadmaps } from "@/hooks/useRoadmap";
import { useAIConversations } from "@/hooks/useAIChat";
import { useExamSessions } from "@/hooks/useExams";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Flame, Clock, Target, FileText, Bot, Map, ArrowRight,
  TrendingUp, Star, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: conversations = [] } = useAIConversations();
  const { data: sessions = [] } = useExamSessions();
  const { dailyData, calculatedTotalMinutes, calculatedStreak } = useStudyLogs();

  const completedExams = sessions.filter((s) => s.status === "completed");
  const avgScore = completedExams.length
    ? Math.round(completedExams.reduce((s, e) => s + (e.score_pct ?? 0), 0) / completedExams.length)
    : 0;

  const displayStreak = Math.max(calculatedStreak, profile?.streak_days ?? 0);
  const displayMinutes = Math.max(calculatedTotalMinutes, profile?.total_study_minutes ?? 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const stats = [
    {
      label: "Chuỗi học",
      value: `${displayStreak} ngày`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Tổng giờ học",
      value: `${Math.floor(displayMinutes / 60)}h${displayMinutes % 60}m`,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Lộ trình",
      value: `${roadmaps.length} môn`,
      icon: Map,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Điểm TB",
      value: completedExams.length ? `${avgScore}%` : "–",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
  ];

  const maxMinutes = Math.max(...dailyData.map((d) => d.minutes), 1);

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {greeting()}, {profile?.full_name?.split(" ").at(-1) ?? "bạn"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 flex flex-col gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", s.bg)}>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Study chart */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Thời gian học 7 ngày qua</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              phút/ngày
            </span>
          </div>
          {dailyData.every((d) => d.minutes === 0) ? (
            <div className="h-36 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <BookOpen className="h-8 w-8 opacity-30" />
              <p className="text-sm">Chưa có dữ liệu học tập</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyData} barSize={24}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-popover border rounded-lg px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{label}</p>
                        <p className="text-primary">{payload[0].value} phút</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {dailyData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.minutes === maxMinutes ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Bắt đầu nhanh</h2>
          <div className="space-y-2">
            {[
              { to: "/lo-trinh", icon: Map, label: "Xem lộ trình học", color: "text-green-500" },
              { to: "/hoi-ai", icon: Bot, label: "Hỏi AI học bài", color: "text-blue-500" },
              { to: "/luyen-de", icon: FileText, label: "Làm đề thi", color: "text-purple-500" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors group"
              >
                <a.icon className={cn("h-4 w-4 shrink-0", a.color)} />
                <span className="text-sm font-medium flex-1">{a.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Roadmaps preview */}
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Lộ trình của bạn</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link to="/lo-trinh">Xem tất cả</Link>
            </Button>
          </div>
          {roadmaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2 text-muted-foreground">
              <Target className="h-8 w-8 opacity-30" />
              <p className="text-sm">Chưa có lộ trình nào</p>
              <Button size="sm" variant="outline" asChild>
                <Link to="/lo-trinh">Tạo lộ trình</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {roadmaps.slice(0, 3).map((r) => (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.subject}</span>
                    <span className="text-xs text-muted-foreground">{r.progress_pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${r.progress_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent AI conversations */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Hội thoại AI gần đây</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link to="/hoi-ai">Mở tất cả</Link>
            </Button>
          </div>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2 text-muted-foreground">
              <Bot className="h-8 w-8 opacity-30" />
              <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
              <Button size="sm" variant="outline" asChild>
                <Link to="/hoi-ai">Hỏi AI ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to="/hoi-ai"
                  className="flex items-center gap-3 py-2.5 hover:text-primary transition-colors group"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

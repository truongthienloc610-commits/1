import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useRoadmaps, type RoadmapTopic } from "@/hooks/useRoadmap";
import { useExams } from "@/hooks/useExams";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const SUBJECTS = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Tin học", "Khoa học"];

const subjectColors: Record<string, string> = {
  "Toán": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Ngữ văn": "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "Tiếng Anh": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Vật lý": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Hóa học": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Sinh học": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Lịch sử": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Địa lý": "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  "GDCD": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "Tin học": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "Khoa học": "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

function getSubjectColor(subject: string) {
  return subjectColors[subject] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function Roadmap() {
  const { profile } = useAuth();
  const { data: roadmaps = [], createRoadmap, toggleTopic, deleteRoadmap } = useRoadmaps();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [totalWeeks, setTotalWeeks] = useState("4");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!subject) {
      toast({ title: "Vui lòng chọn môn học", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await createRoadmap.mutateAsync({ subject, goal, total_weeks: parseInt(totalWeeks) });
      toast({ title: "Tạo lộ trình thành công! 🎯" });
      setOpen(false);
      setSubject(""); setGoal(""); setTotalWeeks("4");
    } catch {
      toast({ title: "Lỗi khi tạo lộ trình", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (topicId: string, current: boolean) => {
    await toggleTopic.mutateAsync({ topicId, is_completed: !current });
  };

  const handleDelete = async (id: string) => {
    await deleteRoadmap.mutateAsync(id);
    toast({ title: "Đã xoá lộ trình" });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Lộ trình học tập</h1>
            <p className="text-muted-foreground mt-1">Quản lý kế hoạch học tập theo từng môn</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo lộ trình
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo lộ trình mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mục tiêu</Label>
                  <Textarea
                    placeholder="Ví dụ: Nắm vững kiến thức đại số lớp 10, ôn thi THPT..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số tuần</Label>
                  <Select value={totalWeeks} onValueChange={setTotalWeeks}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 12].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} tuần</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Đang tạo..." : "Tạo lộ trình"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty state */}
        {roadmaps.length === 0 && (
          <div className="bg-card border rounded-xl p-16 text-center">
            <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Bạn chưa có lộ trình nào</p>
            <Button onClick={() => setOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Tạo lộ trình đầu tiên
            </Button>
          </div>
        )}

        {/* Roadmap cards */}
        <div className="space-y-4">
          {roadmaps.map((r) => {
            const topics = (r.topics ?? []).sort((a, b) => a.order_index - b.order_index);
            const completed = topics.filter((t) => t.is_completed).length;
            const pct = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
            const isExpanded = expandedId === r.id;

            return (
              <div key={r.id} className="bg-card border rounded-xl overflow-hidden">
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", getSubjectColor(r.subject))}>
                        {r.subject}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.total_weeks} tuần</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {r.goal && (
                    <p className="text-sm text-muted-foreground mt-2">{r.goal}</p>
                  )}

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{completed}/{topics.length} chủ đề hoàn thành</span>
                      <span className="font-medium text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Topics list */}
                {isExpanded && (
                  <div className="border-t px-5 pb-4 pt-3 space-y-2">
                    {Array.from({ length: r.total_weeks }, (_, i) => i + 1).map((week) => {
                      const weekTopics = topics.filter((t) => t.week === week);
                      return (
                        <div key={week}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Tuần {week}</p>
                          {weekTopics.map((topic) => (
                            <button
                              key={topic.id}
                              onClick={() => handleToggle(topic.id, topic.is_completed)}
                              className="w-full flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors text-left group"
                            >
                              {topic.is_completed ? (
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                              )}
                              <div>
                                <p className={cn("text-sm font-medium", topic.is_completed && "line-through text-muted-foreground")}>
                                  {topic.title}
                                </p>
                                {topic.description && (
                                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

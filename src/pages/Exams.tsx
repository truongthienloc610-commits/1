import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  useExamSessions,
  useExamQuestions,
  useExams,
} from "@/hooks/useExams";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Plus, CheckCircle2, XCircle, Clock, Trophy, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const SUBJECTS = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Tin học", "Khoa học"];

export default function Exams() {
  const { profile } = useAuth();
  const { data: sessions = [] } = useExamSessions();
  const { createSession, submitAnswer, finishSession } = useExams();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Toán");
  const [questionCount, setQuestionCount] = useState("5");
  const [duration, setDuration] = useState("15");
  const [creating, setCreating] = useState(false);

  // Active session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const { data: questions = [] } = useExamQuestions(activeSessionId);

  const currentQuestion = questions[currentQ] ?? null;
  const answeredCount = questions.filter((q) => q.user_answer !== null).length;
  const isLastQuestion = currentQ === questions.length - 1;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const session = await createSession.mutateAsync({
        subject,
        grade: profile?.grade ?? 10,
        total_questions: parseInt(questionCount),
        duration_minutes: parseInt(duration),
      });
      setActiveSessionId(session.id);
      setCurrentQ(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setOpen(false);
    } catch {
      toast({ title: "Lỗi khi tạo đề thi", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;
    await submitAnswer.mutateAsync({ questionId: currentQuestion.id, answer: selectedAnswer });
    setSubmitted(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setCurrentQ((p) => p + 1);
  };

  const handleFinish = async () => {
    if (!activeSessionId) return;
    setFinishing(true);
    try {
      const result = await finishSession.mutateAsync(activeSessionId);
      toast({ title: `Hoàn thành! Điểm của bạn: ${result.score_pct}% 🎉` });
      setActiveSessionId(null);
    } catch {
      toast({ title: "Lỗi khi nộp bài", variant: "destructive" });
    } finally {
      setFinishing(false);
    }
  };

  // ── Active exam view ──────────────────────────────────────────────────
  if (activeSessionId && questions.length > 0 && currentQuestion) {
    const isCorrect = submitted && selectedAnswer === currentQuestion.correct_option;

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-muted-foreground">
                Câu {currentQ + 1} / {questions.length}
              </span>
              <span className="text-xs text-muted-foreground">{answeredCount} đã trả lời</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all rounded-full"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-card border rounded-xl p-6 mb-5">
            <div className="text-base font-medium leading-relaxed mb-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {currentQuestion.question_text}
              </ReactMarkdown>
            </div>
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, index) => {
                const letters = ["A", "B", "C", "D"];
                const letter = letters[index];
                const isSelected = selectedAnswer === letter;
                const isCorrectOpt = submitted && letter === currentQuestion.correct_option;
                const isWrongOpt = submitted && isSelected && !isCorrectOpt;

                return (
                  <button
                    key={opt + index}
                    disabled={submitted}
                    onClick={() => setSelectedAnswer(letter)}
                    className={cn(
                      "w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all text-foreground",
                      !submitted && "hover:border-primary/50 hover:bg-primary/5",
                      isSelected && !submitted && "border-primary bg-primary/10",
                      isCorrectOpt && "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300",
                      isWrongOpt && "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300",
                      !isSelected && !isCorrectOpt && "border-border"
                    )}
                  >
                    <div className="font-semibold prose prose-sm dark:prose-invert max-w-none prose-p:m-0 inline-flex items-center gap-2">
                      <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] bg-muted/50">
                        {letter}
                      </span>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {opt}
                      </ReactMarkdown>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {submitted && currentQuestion.explanation && (
              <div className={cn(
                "mt-4 rounded-lg p-3 text-sm prose prose-sm dark:prose-invert max-w-none",
                selectedAnswer === currentQuestion.correct_option
                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 prose-p:text-green-800 dark:prose-p:text-green-200"
                  : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 prose-p:text-red-800 dark:prose-p:text-red-200"
              )}>
                <span className="font-semibold block mb-2">
                  {isCorrect ? "✅ Chính xác!" : `❌ Đáp án đúng: ${currentQuestion.correct_option}`}
                </span>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {currentQuestion.explanation}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!submitted ? (
              <Button
                onClick={handleAnswer}
                disabled={!selectedAnswer}
                className="flex-1"
              >
                Xác nhận đáp án
              </Button>
            ) : isLastQuestion ? (
              <Button onClick={handleFinish} disabled={finishing} className="flex-1 gap-2">
                <Trophy className="h-4 w-4" />
                {finishing ? "Đang nộp..." : "Nộp bài"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Câu tiếp theo →
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setActiveSessionId(null);
                setCurrentQ(0);
              }}
            >
              Thoát
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Main exam list view ───────────────────────────────────────────────
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((a, s) => a + (s.score_pct ?? 0), 0) / completedSessions.length)
    : null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Luyện đề</h1>
            <p className="text-muted-foreground mt-1">Làm đề trắc nghiệm và nhận phản hồi ngay lập tức</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo đề mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo đề thi mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số câu hỏi</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["5", "10", "15", "20", "30", "40"].map((n) => (
                        <SelectItem key={n} value={n}>{n} câu</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thời gian (phút)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["10", "15", "20", "30", "45", "60"].map((n) => (
                        <SelectItem key={n} value={n}>{n} phút</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Đang tạo đề..." : "Bắt đầu làm bài"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats row */}
        {completedSessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Đề đã làm", value: completedSessions.length, icon: FileText, color: "text-primary/80" },
              { label: "Điểm TB", value: `${avgScore}%`, icon: Trophy, color: "text-yellow-500" },
              {
                label: "Đúng TB",
                value: `${Math.round(completedSessions.reduce((a,s) => a + s.correct_count, 0) / completedSessions.length)}/${completedSessions[0]?.total_questions ?? 10}`,
                icon: CheckCircle2,
                color: "text-green-500",
              },
            ].map((s) => (
              <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
                <s.icon className={cn("h-5 w-5 mx-auto mb-1.5", s.color)} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="bg-card border rounded-xl p-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Chưa có đề thi nào</p>
            <Button onClick={() => setOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề đầu tiên
            </Button>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="divide-y">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    s.status === "completed" ? "bg-green-100 dark:bg-green-950/30" : "bg-orange-100 dark:bg-orange-950/30"
                  )}>
                    {s.status === "completed"
                      ? <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                      : <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.total_questions} câu · {s.duration_minutes} phút
                      {s.status === "completed" && ` · ${s.correct_count}/${s.total_questions} đúng`}
                      {" · "}{format(new Date(s.started_at), "dd/MM/yyyy", { locale: vi })}
                    </p>
                  </div>
                  {s.status === "completed" ? (
                    <div className={cn(
                      "text-lg font-bold",
                      (s.score_pct ?? 0) >= 80 ? "text-green-600" :
                      (s.score_pct ?? 0) >= 50 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {s.score_pct}%
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setCurrentQ(0);
                        setSelectedAnswer(null);
                        setSubmitted(false);
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Tiếp tục
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

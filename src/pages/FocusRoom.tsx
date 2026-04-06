import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import { useRoadmaps } from "@/hooks/useRoadmap";
import { Play, Square, AlertCircle, Maximize } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FocusRoom() {
  const { logStudy } = useStudyLogs();
  const { data: roadmaps = [] } = useRoadmaps();
  
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(25);
  const [isStudying, setIsStudying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const focusRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const subjects = roadmaps.length > 0 
    ? roadmaps.map((r: any) => r.subject)
    : ["Toán", "Văn", "Tiếng Anh", "Vật lý", "Hóa học"];

  // Handle Fullscreen Exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If we are studying but no longer in fullscreen -> pause/stop session early
      if (!document.fullscreenElement && isStudying) {
        handleStopSession();
        toast.error("Bạn đã thoát toàn màn hình! Thời gian học đã được lưu tạm.");
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // for Safari
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [isStudying, initialTime, timeLeft]);

  // Handle Countdown Timer
  useEffect(() => {
    if (isStudying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isStudying && timeLeft === 0) {
      // Completed full session
      handleCompleteSession();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isStudying, timeLeft]);

  const startSession = async () => {
    if (!subject) {
      toast.error("Vui lòng chọn hoặc nhập tên môn học!");
      return;
    }
    if (duration < 1) {
      toast.error("Thời gian phải lớn hơn 0!");
      return;
    }

    try {
      if (focusRef.current) {
        if (focusRef.current.requestFullscreen) {
          await focusRef.current.requestFullscreen();
        } else if ((focusRef.current as any).webkitRequestFullscreen) {
          await (focusRef.current as any).webkitRequestFullscreen();
        }
      }
      const totalSeconds = duration * 60;
      setInitialTime(totalSeconds);
      setTimeLeft(totalSeconds);
      setIsStudying(true);
      toast.success("Bắt đầu phiên học tập trung!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể mở toàn màn hình. Hãy đảm bảo trình duyệt cấp quyền.");
    }
  };

  const logElapsedTime = () => {
    // Wait, the state might be stale in event listeners if not careful, 
    // but React's state inside the component body is fresh in the re-render.
    // However, when called from the listener `handleStopSession` it might use the stale state.
    // We should use refs or setState callback, but since handleFullscreenChange uses the dependency array, it should have the latest closure.
    const elapsedSeconds = initialTime - timeLeft;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes > 0) {
      logStudy.mutate({ subject, duration_minutes: elapsedMinutes });
      toast.success(`Đã lưu ${elapsedMinutes} phút học môn ${subject}`);
    } else {
      toast.info("Thời gian học quá ngắn (dưới 1 phút) không được lưu.");
    }
  };

  const handleStopSession = () => {
    setIsStudying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    logElapsedTime();
  };

  const handleCompleteSession = () => {
    setIsStudying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    logElapsedTime();
    toast.success("Chúc mừng! Bạn đã hoàn thành mục tiêu.");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Maximize className="w-8 h-8 text-primary" />
            Phòng Tập Trung
          </h1>
          <p className="text-muted-foreground mt-2">
            Học tập không phân tâm. Khi bắt đầu, hệ thống sẽ mở **chế độ toàn màn hình**. Nếu bạn thoát (Esc), thời gian sẽ dừng và chỉ tính phần đã học.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Môn học / Nội dung</label>
            <div className="flex gap-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  {!subjects.includes(subject) && subject && (
                    <SelectItem value={subject}>{subject}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Input 
                placeholder="Hoặc nhập tùy ý..." 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Thời gian mục tiêu (phút)</label>
            <div className="grid grid-cols-3 sm:flex flex-wrap gap-3">
              {[15, 25, 45, 60, 90, 120].map(t => (
                <Button 
                  key={t}
                  variant={duration === t ? "default" : "outline"}
                  onClick={() => setDuration(t)}
                  className="flex-1 min-w-[70px]"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button size="lg" className="w-full md:w-auto px-12 text-lg h-14 rounded-xl gap-2" onClick={startSession}>
              <Play className="w-5 h-5 fill-current" />
              Bắt đầu ngay
            </Button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN OVERLAY */}
      <div 
        ref={focusRef} 
        className={cn(
          "fixed inset-0 z-[9999] bg-background text-foreground flex flex-col items-center justify-center transition-all duration-300",
          isStudying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {isStudying && (
          <>
            <div className="absolute top-10 flex items-center justify-center text-muted-foreground gap-2 bg-muted/50 px-4 py-2 rounded-full font-medium">
              <AlertCircle className="w-4 h-4" />
              Đang trong phòng tập trung. Thoát chế độ toàn màn hình sẽ tự động dừng.
            </div>
            
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-center">{subject}</h2>
            <div className="text-[6rem] sm:text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-primary font-mono drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
            
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground font-medium text-center px-4">
              Thời gian đã học sẽ được lưu khi kết thúc.
            </p>

            <Button 
              size="lg" 
              variant="destructive" 
              className="mt-12 scale-110 gap-2 h-14 px-8 rounded-full shadow-lg"
              onClick={handleStopSession}
            >
              <Square className="w-5 h-5 fill-current" />
              Kết thúc sớm (lưu kết quả)
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}

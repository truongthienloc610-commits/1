import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { generateAIContent } from "@/lib/gemini";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useState } from "react";

// --- KIỂU DỮ LIỆU ---

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: "event" | "todo" | "appointment";
  start_time: string;
  end_time: string;
  color: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export type EventFormData = Omit<CalendarEvent, "id" | "user_id" | "created_at">;

// --- HOOK CHÍNH ---

export function useCalendarEvents(currentDate: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 1. Lấy danh sách sự kiện theo tháng
  const monthStart = startOfMonth(currentDate).toISOString();
  const monthEnd = endOfMonth(currentDate).toISOString();

  const eventsQuery = useQuery({
    queryKey: ["calendar-events", user?.id, format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });

  // 2. Tạo sự kiện mới
  const createEvent = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({ ...eventData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  // 3. Cập nhật sự kiện
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  // 4. Xóa sự kiện
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  // 5. Toggle hoàn thành
  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from("calendar_events")
        .update({ is_completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  // 6. AI phân tích lịch trình
  const analyzeSchedule = async () => {
    if (!user) return;
    setAiLoading(true);
    setAiInsight(null);

    try {
      // Lấy events tháng hiện tại
      const events = eventsQuery.data || [];

      // Lấy study_logs 30 ngày gần nhất
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: studyLogs } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", since.toISOString())
        .order("logged_at", { ascending: true });

      const prompt = `Phân tích lịch trình học tập của học sinh dựa trên dữ liệu sau:

## Sự kiện trong lịch (Tháng ${format(currentDate, "MM/yyyy")}):
${events.length === 0 ? "Chưa có sự kiện nào." : events.map(e => 
  `- "${e.title}" (${e.event_type === 'event' ? 'Sự kiện' : e.event_type === 'todo' ? 'Việc cần làm' : 'Lịch hẹn'}) | ${format(new Date(e.start_time), "dd/MM HH:mm")} → ${format(new Date(e.end_time), "HH:mm")} | ${e.is_completed ? '✅ Hoàn thành' : '⏳ Chưa xong'}`
).join("\n")}

## Nhật ký học tập (30 ngày qua):
${!studyLogs || studyLogs.length === 0 ? "Chưa có dữ liệu học." : studyLogs.map((l: any) => 
  `- ${l.subject}: ${l.duration_minutes} phút (${format(new Date(l.logged_at), "dd/MM")})`
).join("\n")}

Hãy phân tích chi tiết:
1. 📊 Tổng quan: Tổng thời gian học, số môn, số sự kiện
2. 📈 Đánh giá mật độ lịch trình (quá tải / hợp lý / cần tăng thêm)
3. 💡 Gợi ý cải thiện cụ thể (3-5 ý)
4. 🎯 Lời khuyên để hoàn thành tốt lịch trình
5. ⚠️ Cảnh báo nếu có vấn đề (ví dụ: học lệch môn, thiếu nghỉ ngơi)`;

      const systemInstruction = "Bạn là 'AI No-code Mentor MVP' - chuyên gia tư vấn lịch trình và định hướng học tập cho người dùng. Nhiệm vụ: Phân tích lịch trình, đánh giá khối lượng công việc, đưa ra định hướng tối ưu hóa hiệu suất. Luôn trả lời bằng tiếng Việt, dùng Markdown.";
      const text = await generateAIContent(prompt, systemInstruction);
      setAiInsight(text);
    } catch (error: any) {
      console.error("AI Schedule Analysis Error:", error);
      setAiInsight("❌ Không thể phân tích lúc này. Vui lòng thử lại sau.");
    } finally {
      setAiLoading(false);
    }
  };

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    analyzeSchedule,
    aiInsight,
    aiLoading,
    setAiInsight,
  };
}

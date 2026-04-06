import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { generateAIContent } from "@/lib/gemini";
import { useStudyLogs } from "@/hooks/useStudyLogs";

export interface Roadmap {
  id: string;
  user_id: string;
  subject: string;
  goal: string;
  total_weeks: number;
  current_week: number;
  progress_pct: number;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  topics?: RoadmapTopic[];
}

export interface RoadmapTopic {
  id: string;
  roadmap_id: string;
  week: number;
  title: string;
  description: string;
  is_completed: boolean;
  order_index: number;
}

async function generateAITopics(subject: string, goal: string, total_weeks: number, grade: number): Promise<Omit<RoadmapTopic, "id" | "roadmap_id">[]> {
  const prompt = `Bạn là một trợ lý giáo dục chuyên nghiệp. Tạo một lộ trình học tập gồm chính xác ${total_weeks} chủ đề/tuần cho môn ${subject}, khối lớp ${grade}, với mục tiêu học tập là: "${goal || "Nắm vững kiến thức trọng tâm"}".
Yêu cầu:
- Lộ trình phải được phân chia logic, có độ khó tăng dần, bao quát được mục tiêu.
- Trả về DUY NHẤT một mảng JSON các đối tượng có cấu trúc sau:
{
  "week": số thứ tự tuần (1, 2, ...),
  "title": "Tên chủ đề trọng tâm của tuần",
  "description": "Mô tả chi tiết các nội dung và phương pháp cần học trong tuần đó"
}
Đảm bảo không viết thêm bất kỳ văn bản nào ngoài dữ liệu mảng JSON.`;

  try {
    const systemInstruction = "Bạn là một trợ lý giáo dục chuyên nghiệp. Nhiệm vụ của bạn là tạo ra các kế hoạch học tập chi tiết, bám sát chương trình giáo dục Việt Nam. Luôn luôn trả lời dưới dạng JSON như yêu cầu.";
    const text = await generateAIContent(prompt, systemInstruction);
    
    let jsonStr = text;
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = text.substring(startIndex, endIndex + 1);
    } else {
      jsonStr = text.replace(/```json|```/gi, "").trim();
    }
    
    const topics = JSON.parse(jsonStr.trim());
    return topics.map((t: any, i: number) => ({
      week: t.week || (i + 1),
      title: t.title,
      description: t.description,
      is_completed: false,
      order_index: i,
    }));
  } catch (error) {
    console.error("Gemini Roadmap Gen Error:", error);
    return Array.from({ length: total_weeks }).map((_, i) => ({
      week: i + 1,
      title: `Tuần ${i + 1}: Chủ đề ${subject}`,
      description: `Thực hiện ôm luyên kiến thức ${subject} tuần ${i + 1}.`,
      is_completed: false,
      order_index: i,
    }));
  }
}

export function useRoadmaps() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { logStudy } = useStudyLogs();

  const query = useQuery({
    queryKey: ["roadmaps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*, topics:roadmap_topics(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Roadmap[];
    },
    enabled: !!user,
  });

  const createRoadmap = useMutation({
    mutationFn: async (input: {
      subject: string;
      goal: string;
      total_weeks: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Generate roadmap via AI
      const topicsFromAI = await generateAITopics(input.subject, input.goal, input.total_weeks, profile?.grade ?? 10);

      // Create roadmap
      const { data: roadmap, error: rErr } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          subject: input.subject,
          goal: input.goal,
          total_weeks: input.total_weeks,
          ai_generated: true,
        })
        .select()
        .single();
      if (rErr) throw rErr;

      // Create topics
      if (topicsFromAI.length > 0) {
        const topicsToInsert = topicsFromAI.map((t) => ({
          ...t,
          roadmap_id: roadmap.id,
        }));
        const { error: tErr } = await supabase
          .from("roadmap_topics")
          .insert(topicsToInsert);
        if (tErr) throw tErr;
      }

      return roadmap as Roadmap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", user?.id] });
    },
  });

  const toggleTopic = useMutation({
    mutationFn: async ({ topicId, is_completed }: { topicId: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from("roadmap_topics")
        .update({ is_completed })
        .eq("id", topicId);
      if (error) throw error;
      return is_completed;
    },
    onSuccess: (is_completed) => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", user?.id] });
      // Log 15 minutes of completion time if they just marked it as done
      if (is_completed) {
        logStudy.mutate({ subject: "Chuyên đề tự học", duration_minutes: 15 });
      }
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (roadmapId: string) => {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmapId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", user?.id] });
    },
  });

  return { ...query, createRoadmap, toggleTopic, deleteRoadmap };
}

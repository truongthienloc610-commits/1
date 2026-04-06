import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { generateAIContent } from "@/lib/gemini";
import { useStudyLogs } from "@/hooks/useStudyLogs";

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

/**
 * ExamSession: Đại diện cho một phiên làm đề thi của người dùng.
 * Bao gồm thông tin môn học, lớp, số câu hỏi, điểm số và trạng thái.
 */
export interface ExamSession {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  total_questions: number;
  correct_count: number;
  duration_minutes: number;
  status: "in_progress" | "completed";
  score_pct: number | null;
  started_at: string;
  finished_at: string | null;
}

/**
 * ExamQuestion: Chi tiết từng câu hỏi trong một đề thi.
 * Bao gồm nội dung câu hỏi, 4 lựa chọn, đáp án đúng và lời giải thích.
 */
export interface ExamQuestion {
  id: string;
  session_id: string;
  question_text: string;
  options: string[];
  correct_option: string;
  user_answer: string | null;
  explanation: string | null;
  order_index: number;
}

// --- LOGIC XỬ LÝ AI ---

/**
 * Hàm gọi Gemini AI để tạo danh sách câu hỏi trắc nghiệm.
 * @param subject Môn học (Toán, Anh, Khoa học...).
 * @param grade Lớp (6-12).
 * @param count Số lượng câu hỏi muốn tạo.
 */
async function generateAIQuestions(subject: string, grade: number, count: number): Promise<Omit<ExamQuestion, "id" | "session_id">[]> {
  const prompt = `Hãy tạo một bộ đề thi trắc nghiệm gồm ${count} câu hỏi cho môn ${subject}, khối lớp ${grade}. 
  Yêu cầu trả về DUY NHẤT một mảng JSON các đối tượng có cấu trúc sau:
  {
    "question_text": "nội dung câu hỏi",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correct_option": "A" (hoặc B, C, D),
    "explanation": "giải thích chi tiết tại sao chọn đáp án đó"
  }
  Đảm bảo kiến thức chính xác, bám sát chương trình học tại Việt Nam. Không thêm bất kỳ văn bản nào khác ngoài JSON.`;

  try {
    // 1. Gửi prompt cho AI service (Gemini hoặc Ollama)
    const systemInstruction = "Bạn là chuyên gia soạn thảo đề cương học tập và đề thi trắc nghiệm. Nhiệm vụ của bạn là tạo ra các câu hỏi trắc nghiệm chất lượng cao, bám sát chương trình giáo dục phổ thông Việt Nam. Luôn luôn trả lời dưới dạng JSON như yêu cầu.";
    const text = await generateAIContent(prompt, systemInstruction);
    
    // 2. Trích xuất chính xác chuỗi JSON từ phản hồi của AI
    let jsonStr = text;
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = text.substring(startIndex, endIndex + 1);
    } else {
      jsonStr = text.replace(/```json|```/gi, "").trim();
    }
    
    const questions = JSON.parse(jsonStr.trim());
    
    // 3. Định dạng lại dữ liệu để phù hợp với bảng exam_questions trong Database
    return questions.map((q: any, i: number) => ({
      ...q,
      order_index: i,
      user_answer: null,
    }));
  } catch (error) {
    console.error("Gemini Question Gen Error:", error);
    // Nếu lỗi, trả về một câu hỏi thông báo lỗi để giao diện không bị treo
    return [{
      question_text: "Đã có lỗi khi tạo câu hỏi tự động. Bạn vui lòng thử lại sau nhé!",
      options: ["Đồng ý", "Thử lại", "Bỏ qua", "Kết thúc"],
      correct_option: "A",
      explanation: "Lỗi kết nối API Gemini.",
      order_index: 0,
      user_answer: null,
    }];
  }
}

// --- CÁC HOOKS ĐỂ SỬ DỤNG TRONG GIAO DIỆN ---

/**
 * Lấy lịch sử tất cả các phiên làm bài thi của người dùng.
 */
export function useExamSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exam-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("exam_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as ExamSession[];
    },
    enabled: !!user,
  });
}

/**
 * Lấy danh sách câu hỏi của một phiên làm bài thi cụ thể.
 */
export function useExamQuestions(sessionId: string | null) {
  return useQuery({
    queryKey: ["exam-questions", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("order_index");
      if (error) throw error;
      return data as ExamQuestion[];
    },
    enabled: !!sessionId,
  });
}

/**
 * Hook chính để điều khiển việc Tạo bài thi, Nộp đáp án và Hoàn thành bài thi.
 */
export function useExams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logStudy } = useStudyLogs();

  // 1. Tạo một bài thi mới (Gồm: Tạo Session -> Gọi AI tạo câu hỏi -> Lưu câu hỏi)
  const createSession = useMutation({
    mutationFn: async (params: {
      subject: string;
      grade: number;
      total_questions: number;
      duration_minutes: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // B1: Tạo bản ghi phiên làm bài mới
      const { data: session, error: sErr } = await supabase
        .from("exam_sessions")
        .insert({ ...params, user_id: user.id })
        .select()
        .single();
      if (sErr) throw sErr;

      // B2: Gọi AI tạo câu hỏi cho môn học và lớp tương ứng
      const questions = await generateAIQuestions(params.subject, params.grade, params.total_questions);

      // B3: Lưu các câu hỏi AI vừa tạo vào Database
      const { error: qErr } = await supabase
        .from("exam_questions")
        .insert(questions.map((q) => ({ ...q, session_id: session.id })));
      if (qErr) throw qErr;

      return session as ExamSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-sessions", user?.id] });
    },
  });

  // 2. Lưu câu trả lời của người dùng cho từng câu hỏi
  const submitAnswer = useMutation({
    mutationFn: async ({
      questionId,
      answer,
    }: {
      questionId: string;
      answer: string;
    }) => {
      const { error } = await supabase
        .from("exam_questions")
        .update({ user_answer: answer })
        .eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
    },
  });

  // 3. Hoàn thành bài thi và tính toán điểm số
  const finishSession = useMutation({
    mutationFn: async (sessionId: string) => {
      // B1: Lấy lại toàn bộ câu hỏi và đáp án người dùng đã chọn
      const { data: questions } = await supabase
        .from("exam_questions")
        .select("correct_option, user_answer")
        .eq("session_id", sessionId);

      // B2: So sánh đáp án để tính số câu đúng
      const correct = (questions ?? []).filter(
        (q) => q.user_answer === q.correct_option
      ).length;
      const total = (questions ?? []).length;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;

      // B3: Cập nhật kết quả vào phiên làm bài
      const { data, error } = await supabase
        .from("exam_sessions")
        .update({
          status: "completed",
          correct_count: correct,
          score_pct: score,
          finished_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();
      if (error) throw error;
      return data as ExamSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exam-sessions", user?.id] });
      // Log the actual time spent
      const started = new Date(data.started_at).getTime();
      const finished = new Date(data.finished_at!).getTime();
      const spentMinutes = Math.max(1, Math.round((finished - started) / 60000));
      logStudy.mutate({ subject: `Luyện đề ${data.subject}`, duration_minutes: spentMinutes });
    },
  });

  return { createSession, submitAnswer, finishSession };
}

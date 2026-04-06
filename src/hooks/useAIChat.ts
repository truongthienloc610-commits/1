import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { geminiModel } from "@/lib/gemini";
import { useStudyLogs } from "@/hooks/useStudyLogs";

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

/**
 * AIConversation: Đại diện cho một cuộc trò chuyện giữa người dùng và AI.
 * Mỗi cuộc trò chuyện sẽ có một tiêu đề (title) và ngày tạo.
 */
export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * AIMessage: Chi tiết từng tin nhắn trong một cuộc trò chuyện.
 * role: 'user' (người dùng) hoặc 'assistant' (AI trả lời).
 */
export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// --- LOGIC XỬ LÝ AI ---

function parseContentWithImage(rawContent: string) {
  const parts: any[] = [];
  const imageRegex = /\[IMAGE:(data:([^;]+);base64,([^\]]+))\]/g;
  
  let lastIndex = 0;
  let match;
  while ((match = imageRegex.exec(rawContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: rawContent.substring(lastIndex, match.index).trim() });
    }
    parts.push({
      inlineData: {
        mimeType: match[2],
        data: match[3],
      }
    });
    lastIndex = imageRegex.lastIndex;
  }
  
  if (lastIndex < rawContent.length) {
    const remainingText = rawContent.substring(lastIndex).trim();
    if (remainingText) parts.push({ text: remainingText });
  }

  // Fallback if no text but image exists
  if (parts.length > 0 && !parts.some(p => p.text)) {
    parts.push({ text: "Hãy phân tích hình ảnh này." });
  }

  return parts.length > 0 ? parts : [{ text: rawContent }];
}

import { generateChatResponse } from "@/lib/gemini";

async function generateAIResponse(userMessage: string, history: AIMessage[]): Promise<string> {
  try {
    const messages = [
      ...history.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage }
    ];

    const response = await generateChatResponse(messages);
    return response;
  } catch (error: any) {
    console.error("AI Service Error:", error);
    return `Lỗi kết nối AI: ${error?.message || "Không xác định"}. Hãy đảm bảo dịch vụ AI (Gemini hoặc Ollama) đang hoạt động.`;
  }
}

// --- CÁC HOOKS ĐỂ SỬ DỤNG TRONG GIAO DIỆN ---

/**
 * Láy danh sách tất cả các cuộc trò chuyện của người dùng hiện tại.
 */
export function useAIConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as AIConversation[];
    },
    enabled: !!user,
  });
}

/**
 * Lấy toàn bộ nội dung tin nhắn của một cuộc trò chuyện cụ thể.
 */
export function useAIMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as AIMessage[];
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook chính để điều khiển việc Tạo mới, Gửi tin nhắn và Xóa cuộc trò chuyện.
 */
export function useAIChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logStudy } = useStudyLogs();

  // 1. Tạo một cuộc hội thoại mới
  const createConversation = useMutation({
    mutationFn: async (params: { title?: string; subject?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: params.title ?? "Cuộc trò chuyện mới",
          subject: params.subject ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as AIConversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", user?.id] });
    },
  });

  // 2. Gửi tin nhắn (Gồm 3 bước: Lưu tin nhắn User -> Gọi AI -> Lưu tin nhắn AI)
  const sendMessage = useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      // B1: Lấy lịch sử tin nhắn hiện tại để AI có ngữ cảnh
      const { data: history } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      // B2: Lưu tin nhắn của người dùng vào Database
      const { error: uErr } = await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content,
      });
      if (uErr) throw uErr;

      // B3: Gọi Gemini AI (truyền content và lịch sử)
      const aiContent = await generateAIResponse(content, (history || []) as AIMessage[]);

      // B4: Lưu phản hồi của AI vào Database
      const { data: aiMsg, error: aErr } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: aiContent,
        })
        .select()
        .single();
      if (aErr) throw aErr;

      // Cập nhật lại thời gian tương tác của cuộc hội thoại
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return aiMsg as AIMessage;
    },
    onSuccess: (_data, variables) => {
      // Làm mới dữ liệu trên giao diện sau khi gửi thành công
      queryClient.invalidateQueries({ queryKey: ["ai-messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", user?.id] });
      // Log learning momentum: 2 minutes per message interaction
      logStudy.mutate({ subject: "Trợ lý AI", duration_minutes: 2 });
    },
  });

  // 3. Xóa cuộc hội thoại
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", user?.id] });
    },
  });

  return { createConversation, sendMessage, deleteConversation };
}


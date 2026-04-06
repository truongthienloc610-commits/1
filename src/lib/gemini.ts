import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Lấy cấu hình từ file môi trường (.env)
const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const aiProvider = import.meta.env.VITE_AI_PROVIDER || "gemini";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || "llama3";
const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";

if (!apiKey && aiProvider === "gemini") {
  console.error("Lỗi: Thiếu VITE_GOOGLE_AI_API_KEY trong file .env. Vui lòng kiểm tra lại!");
}

// 2. Khởi tạo đối tượng Google AI (nếu dùng)
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Cấu hình model chuyên dùng để trò chuyện (Chat)
 */
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Bạn là một trợ lý học tập thông minh cho học sinh Việt Nam (từ lớp 6 đến lớp 12). Tên hệ thống là 'HọcAI'. Nhiệm vụ của bạn là giải bài tập, giải thích kiến thức một cách dễ hiểu, socratic (gợi mở) và tạo động lực học tập. Luôn trả lời bằng tiếng Việt, sử dụng Markdown để định dạng rõ ràng, dùng các emoji phù hợp.",
});

/**
 * Cấu hình các model Gemini khác
 */
export const geminiExamModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Bạn là chuyên gia soạn thảo đề cương học tập và đề thi trắc nghiệm. Nhiệm vụ của bạn là tạo ra các câu hỏi trắc nghiệm chất lượng cao, bám sát chương trình giáo dục phổ thông Việt Nam. Luôn luôn trả lời dưới dạng JSON như yêu cầu.",
});

export const geminiScheduleModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Bạn là 'AI No-code Mentor MVP' - chuyên gia tư vấn lịch trình và định hướng học tập cho người dùng. Nhiệm vụ: Phân tích lịch trình, đánh giá khối lượng công việc, đưa ra định hướng tối ưu hóa hiệu suất. Luôn trả lời bằng tiếng Việt, dùng Markdown.",
});

export const geminiCareerModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "Bạn là 'Chuyên gia Tư vấn Tuyển sinh và Hướng nghiệp' thông minh. Dựa vào thế mạnh, sở thích để tư vấn lộ trình ngành nghề phù hợp. Luôn trả lời bằng tiếng Việt, trình bày Markdown gọn gàng.",
});

/**
 * Giao diện chung để gọi AI (Hỗ trợ cả Gemini và Ollama)
 */
export async function generateAIContent(prompt: string, systemInstruction?: string) {
  if (aiProvider === "ollama") {
    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ],
          stream: false,
        }),
      });

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Ollama Error:", error);
      throw new Error("Không thể kết nối đến Ollama. Hãy đảm bảo Ollama đang chạy trên máy bạn.");
    }
  } else {
    // Mặc định dùng Gemini
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  }
}

/**
 * Hàm gọi AI chuyên dụng cho Chat (Hỗ trợ lịch sử)
 */
export async function generateChatResponse(messages: { role: string, content: string }[], systemInstruction?: string) {
  if (aiProvider === "ollama") {
    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            ...messages
          ],
          stream: false,
        }),
      });
      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Ollama Chat Error:", error);
      throw error;
    }
  } else {
    // Gemini Chat logic (sẽ được tích hợp trong useAIChat hook hoặc tại đây)
    // Để giữ tính tương thích, ta có thể dùng geminiModel trực tiếp nếu cần structure phức tạp.
    // Nhưng để đơn giản nhất, ta sẽ chuyển logic gọi Gemini vào đây.
    const chat = geminiModel.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    return result.response.text();
  }
}

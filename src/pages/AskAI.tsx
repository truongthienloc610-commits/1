import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  useAIConversations,
  useAIMessages,
  useAIChat,
} from "@/hooks/useAIChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Bot, Plus, Send, Trash2, User, Sparkles, ImagePlus, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const MarkdownImage = ({ node, ...props }: any) => {
  const [error, setError] = useState(false);
  if (error || !props.src) {
    return (
      <span className="flex flex-col gap-1.5 p-3 my-3 border border-dashed rounded-lg bg-muted/30 text-muted-foreground text-xs italic">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3 w-3" /> AI đã thử tạo một hình ảnh:
        </span>
        <span className="opacity-80">[{props.alt || "Không có chú thích"}]</span>
      </span>
    );
  }
  return <img {...props} onError={() => setError(true)} className="rounded-lg max-w-full my-3 border shadow-sm" />;
};

export default function AskAI() {
  const { data: conversations = [] } = useAIConversations();
  const { createConversation, sendMessage, deleteConversation } = useAIChat();
  const { toast } = useToast();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [typingDots, setTypingDots] = useState(false);

  const { data: messages = [] } = useAIMessages(activeId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingDots]);

  const handleNewConversation = async () => {
    const conv = await createConversation.mutateAsync({});
    setActiveId(conv.id);
    setInput("");
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Ảnh quá lớn (tối đa 4MB)", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || sending) return;

    let convId = activeId;
    if (!convId) {
      let title = input.slice(0, 40) + (input.length > 40 ? "..." : "");
      if (!title) title = "Hình ảnh đính kèm";
      const conv = await createConversation.mutateAsync({ title });
      convId = conv.id;
      setActiveId(conv.id);
    }

    let text = input.trim();
    if (selectedImage) {
      text += `\n\n[IMAGE:${selectedImage}]`;
    }

    setInput("");
    setSelectedImage(null);
    setSending(true);
    setTypingDots(true);

    try {
      await sendMessage.mutateAsync({ conversationId: convId, content: text });
    } catch {
      toast({ title: "Lỗi khi gửi tin nhắn", variant: "destructive" });
    } finally {
      setSending(false);
      setTypingDots(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteConversation.mutateAsync(id);
    if (activeId === id) setActiveId(null);
    toast({ title: "Đã xoá cuộc trò chuyện" });
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] rounded-xl overflow-hidden border bg-card">
        {/* Conversations sidebar */}
        <div className="w-56 shrink-0 border-r flex flex-col hidden md:flex">
          <div className="p-3 border-b">
            <Button
              onClick={handleNewConversation}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Cuộc trò chuyện mới
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6 px-2">
                Chưa có cuộc trò chuyện nào
              </p>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
                  activeId === c.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveId(c.id)}
              >
                <Bot className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-14 border-b flex items-center px-5 gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Trợ lý AI HọcAI</p>
              <p className="text-xs text-muted-foreground">Luôn sẵn sàng giúp bạn học 24/7</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative">
            {!activeId && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Xin chào! Mình là AI HọcAI 👋</p>
                  <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                    Hỏi mình bất cứ điều gì hoặc gửi ảnh bài toán để mình giải đáp nhé!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Giải bài Toán", "Phân tích văn học", "Dịch Tiếng Anh", "Giải thích hình ảnh này"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-3 py-1.5 rounded-full border text-xs hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              // Phân tách ảnh base64 ra khỏi text để hiển thị
              const imgMatches = [...msg.content.matchAll(/\[IMAGE:(data:[^\]]+)\]/g)];
              const textContent = msg.content.replace(/\[IMAGE:data:[^]+\]/g, "").trim();

              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
                        : "bg-muted rounded-bl-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none"
                    )}
                  >
                    {/* Render extracted images */}
                    {imgMatches.map((match, i) => (
                      <img key={i} src={match[1]} alt="Đính kèm" className="max-w-xs rounded-lg mb-2 border mt-1" />
                    ))}
                    
                    {msg.role === "user" ? (
                      textContent
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{ img: MarkdownImage }}
                      >
                        {textContent}
                      </ReactMarkdown>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {typingDots && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t bg-card relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-11 w-11 rounded-full"
                title="Đính kèm hình ảnh"
              >
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi bất kỳ điều gì về bài học... (Enter để gửi)"
                rows={1}
                className="resize-none min-h-[44px] max-h-[120px]"
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || sending}
                size="icon"
                className="shrink-0 h-11 w-11 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

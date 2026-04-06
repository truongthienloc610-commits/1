import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Briefcase, GraduationCap, Loader2, Save, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateAIContent } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

export default function CareerOrientation() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  // States cho form
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [subjects, setSubjects] = useState("");
  const [mbti, setMbti] = useState("");
  
  // Trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Lịch sử kết quả
  const [history, setHistory] = useState<CareerResult[]>([]);

  interface CareerResult {
    id: string;
    interests: string;
    strengths: string;
    subjects: string;
    mbti?: string;
    ai_response: string;
    created_at: string;
  }

  // Lấy lịch sử tư vấn khi vào trang
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('career_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setHistory(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!interests || !strengths || !subjects) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập Sở thích, Điểm mạnh và Môn học yêu thích để AI tư vấn chính xác nhất.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Gọi AI service (Gemini hoặc Ollama)
      const systemInstruction = "Bạn là 'Chuyên gia Tư vấn Tuyển sinh và Hướng nghiệp' thông minh. Dựa vào thế mạnh, sở thích để tư vấn lộ trình ngành nghề phù hợp. Luôn trả lời bằng tiếng Việt, trình bày Markdown gọn gàng.";
      const prompt = `Tôi là một học sinh lớp ${profile?.grade || "THPT"}.
 Dưới đây là thông tin về tôi:
 - Sở thích: ${interests}
 - Điểm mạnh/Kỹ năng nổi trội: ${strengths}
 - Môn học yêu thích/Học tốt: ${subjects}
 ${mbti ? `- Tính cách (MBTI hoặc tự nhận xét): ${mbti}` : ''}
 
 Hãy tư vấn cho tôi:
 1. 3-5 Ngành học/Nghề nghiệp phù hợp nhất (Giải thích lý do).
 2. Tổ hợp môn xét tuyển (A00, D01,...) tương ứng.
 3. Các trường Đại học top đầu và tầm trung đào tạo tốt ngành này tại Việt Nam.
 4. Lời khuyên định hướng lộ trình học tập để đạt mục tiêu.`;

      const aiText = await generateAIContent(prompt, systemInstruction);
      setResult(aiText);

      // 2. Lưu vào Supabase
      if (user) {
        const { error } = await supabase
          .from('career_results')
          .insert({
            user_id: user.id,
            interests,
            strengths,
            subjects,
            mbti,
            ai_response: aiText
          });

        if (error) {
          console.error("Lỗi khi lưu kết quả:", error);
          toast({
            title: "Lưu ý",
            description: "Đã có kết quả AI nhưng không thể lưu vào lịch sử.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Thành công",
            description: "Đã phân tích xong và lưu kết quả định hướng!",
          });
          fetchHistory(); // Cập nhật lại danh sách lịch sử
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể nhận tư vấn từ AI lúc này. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="h-8 w-8 text-primary" />
            Định Hướng Nghề Nghiệp bằng AI
          </h1>
          <p className="text-muted-foreground">
            Cung cấp một vài thông tin về bản thân để AI Gợi ý cho bạn lộ trình nghề nghiệp và trường Đại học phù hợp nhất.
          </p>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Làm Bài Mới
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Lịch Sử ({history.length})
            </TabsTrigger>
          </TabsList>
          
          {/* TAB 1: PHÂN TÍCH MỚI */}
          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Box */}
              <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Thông Tin Của Bạn</CardTitle>
                  <CardDescription>Càng chi tiết, AI tư vấn càng chính xác</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Môn học yêu thích / Học tốt nhất <span className="text-destructive">*</span></Label>
                    <Input 
                      id="subjects" 
                      placeholder="VD: Toán, Ngữ Văn, Tiếng Anh..." 
                      value={subjects}
                      onChange={(e) => setSubjects(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="strengths">Điểm mạnh / Kỹ năng nổi trội <span className="text-destructive">*</span></Label>
                    <Textarea 
                      id="strengths" 
                      placeholder="VD: Giao tiếp tốt, thích tính toán, học nhanh..." 
                      rows={2}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Sở thích / Đam mê <span className="text-destructive">*</span></Label>
                    <Textarea 
                      id="interests" 
                      placeholder="VD: Thích đọc sách, vẽ tranh, khám phá công nghệ..." 
                      rows={2}
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mbti">Tính cách hoặc MBTI (Không bắt buộc)</Label>
                    <Input 
                      id="mbti" 
                      placeholder="VD: INTJ, Hướng nội, Thích tự do..." 
                      value={mbti}
                      onChange={(e) => setMbti(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={loading} 
                    className="w-full gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI Đang Phân Tích...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-5 w-5" />
                        Phân Tích Ngay
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Result Box */}
              <Card className="bg-card shadow-sm border-muted flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Kết Quả Tư Vấn
                  </CardTitle>
                  <CardDescription>Lộ trình gợi ý từ Chuyên gia AI</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto max-h-[500px]">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-muted-foreground min-h-[300px]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                        <Compass className="h-16 w-16 text-primary animate-spin-slow relative z-10" />
                      </div>
                      <p className="animate-pulse font-medium text-primary">Đang quét dải ngân hà dữ liệu tuyển sinh...</p>
                    </div>
                  ) : result ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary pb-4">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground min-h-[300px]">
                      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                        <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p>Chưa có kết quả.</p>
                        <p className="text-sm">Hãy điền thông tin và bấm Phân tích!</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: LỊCH SỬ */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lịch Sử Phân Tích</CardTitle>
                <CardDescription>Xem lại các định hướng bạn đã thực hiện trước đây.</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Bạn chưa thực hiện định hướng nào.</p>
                ) : (
                  <div className="space-y-6">
                    {history.map((item) => (
                      <div key={item.id} className="border rounded-lg p-6 space-y-4 bg-muted/20">
                        <div className="flex justify-between items-center border-b pb-3">
                          <div className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border shadow-sm">
                            Ngày tạo: {new Date(item.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit'})}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-background p-4 rounded-md border shadow-sm">
                          <div><span className="font-semibold text-primary">Sở thích:</span> {item.interests}</div>
                          <div><span className="font-semibold text-primary">Điểm mạnh:</span> {item.strengths}</div>
                          <div><span className="font-semibold text-primary">Môn học:</span> {item.subjects}</div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-5 rounded-md border pt-0">
                          <div className="border-b py-3 mb-3 sticky top-0 bg-background/95 backdrop-blur z-10">
                             <h4 className="m-0 font-bold flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-orange-500" /> Kết quả AI:</h4>
                          </div>
                          <ReactMarkdown>{item.ai_response}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Icon phụ
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

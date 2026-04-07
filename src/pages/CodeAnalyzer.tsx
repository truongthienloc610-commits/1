import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Code2, Bug, Lightbulb, CheckCircle, 
  Terminal, Play, RotateCcw, Copy, 
  Search, ShieldAlert
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface AnalysisResult {
  error: string;
  location: string;
  hint: string;
  solution_steps: string[];
}

export default function CodeAnalyzer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    if (!code.trim()) {
      toast.error("Vui lòng nhập code để phân tích");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code, language }
      });

      if (error) throw error;
      
      // The function returns JSON matching AnalysisResult
      setResult(data);
      toast.success("Phân tích hoàn tất!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi kết nối với AI. Vui lòng thử lại sau.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleReset() {
    setCode("");
    setResult(null);
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-white">
                <Search className="h-6 w-6" />
              </div>
              Chẩn đoán Code
            </h1>
            <p className="text-slate-500 font-medium">
              Dán đoạn code bạn đang gặp lỗi, EduAI sẽ giúp bạn tìm nguyên nhân.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/80"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
            <Button 
              variant="outline" 
              className="rounded-xl font-bold border-slate-200"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Editor Corner */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <div className="flex items-center justify-between px-6 py-3 bg-slate-800/50 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-widest">{language} editor</span>
                </div>
                <button 
                  className="text-slate-400 hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast.success("Đã copy code");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <textarea
                className="w-full h-[500px] bg-transparent text-slate-100 p-8 font-mono text-sm resize-none outline-none focus:ring-0 leading-relaxed custom-scrollbar"
                placeholder="// Dán code của bạn vào đây...
// Ví dụ: console.log('Hello'
"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
              <div className="absolute bottom-6 right-6">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold px-8 rounded-2xl h-14"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                      Đang chẩn đoán...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-3 fill-current" />
                      Phân tích ngay
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Corner */}
          <div className="space-y-6">
            {!result && !analyzing && (
              <div className="h-[550px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                  <Terminal className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400">Chưa có dữ liệu phân tích</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Hãy dán code và nhấn nút Phân tích để EduAI bắt đầu làm việc.
                  </p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="h-[550px] bg-white border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-8 animate-pulse">
                <div className="flex gap-2">
                  <div className="h-4 w-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-4 w-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="h-4 w-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800 font-black">EduAI đang đọc code của bạn...</h3>
                  <p className="text-slate-500 font-medium">Bình tĩnh nhé, quá trình này thường mất 3-5 giây.</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-8 border-b border-slate-50">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <ShieldAlert className="h-6 w-6" />
                    <span className="text-lg font-black uppercase tracking-tighter italic">Báo cáo chẩn đoán</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {result.error}
                  </h2>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold font-mono">
                    <Bug className="h-3 w-3" /> Vị trí: {result.location}
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Hint Section */}
                  <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 relative group">
                    <Lightbulb className="absolute -top-4 -right-4 h-16 w-16 text-primary/10 group-hover:scale-110 transition-transform" />
                    <h3 className="text-primary/90 font-black flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5" /> Gợi ý quan trọng
                    </h3>
                    <p className="text-blue-900 font-medium leading-relaxed">
                      {result.hint}
                    </p>
                  </div>

                  {/* Solution Steps */}
                  <div className="space-y-4">
                    <h3 className="text-slate-900 font-black flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500" /> Các bước khắc phục
                    </h3>
                    <div className="space-y-3">
                      {result.solution_steps.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                          <div className="h-6 w-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            0{i + 1}
                          </div>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-xs text-slate-400 italic text-center">
                      * EduAI khuyến khích bạn tự sửa lỗi để ghi nhớ kiến thức tốt hơn.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

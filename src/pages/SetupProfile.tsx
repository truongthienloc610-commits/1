import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, UserCircle, CheckCircle2, Code2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function SetupProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu profile đã có dữ liệu rồi mà lỡ vào đây, đẩy ra dashboard
    if (profile?.full_name) {
      navigate("/dashboard");
    }
    // Gợi ý tên từ Google nếu có
    if (user?.user_metadata?.full_name && !name) {
      setName(user.user_metadata.full_name);
    }
  }, [profile, user, navigate, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Vui lòng nhập tên của bạn", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("edu_profiles")
        .upsert({
          id: user?.id,
          full_name: name,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      await refreshProfile();
      toast({
        title: "Thiết lập thành công! 🎉",
        description: "Chào mừng bạn đến với EduAI.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Có lỗi xảy ra", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 font-black text-3xl tracking-tighter text-slate-900">
            <div className="bg-primary p-1.5 rounded-xl text-white">
              <Code2 className="h-8 w-8" />
            </div>
            <span>Edu<span className="text-primary">AI</span></span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bắt đầu hành trình! 👋</h1>
          <p className="text-slate-500 font-medium">
            Để EduAI đồng hành cùng bạn tốt nhất, chúng mình hãy làm quen một chút nhé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100">
          <div className="space-y-3">
            <Label htmlFor="name" className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              <UserCircle className="h-4 w-4" />
              Tên hiển thị của bạn
            </Label>
            <Input
              id="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-16 px-6 rounded-2xl bg-white border-slate-200 text-xl font-bold text-slate-900 focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="h-6 w-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-3">
                Vào Dashboard <CheckCircle2 className="h-6 w-6" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic">
          * Đừng lo, bạn có thể đổi tên bất cứ lúc nào trong cài đặt hồ sơ.
        </p>
      </div>
    </div>
  );
}

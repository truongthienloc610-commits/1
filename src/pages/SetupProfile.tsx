import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, UserCircle, GraduationCap, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AuthIllustration } from "@/components/AuthIllustration";
import "@/styles/auth.css";

export default function SetupProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu profile đã có dữ liệu rồi mà lỡ vào đây, đẩy ra dashboard
    if (profile?.full_name && profile?.grade) {
      navigate("/dashboard");
    }
    // Gợi ý tên từ Google nếu có
    if (user?.user_metadata?.full_name && !name) {
      setName(user.user_metadata.full_name);
    }
  }, [profile, user, navigate, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !grade) {
      toast({ title: "Vui lòng hoàn thành mọi thông tin", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        grade: parseInt(grade),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (error) {
      toast({ title: "Có lỗi xảy ra", description: error.message, variant: "destructive" });
      setLoading(false);
    } else {
      await refreshProfile();
      toast({
        title: "Thiết lập thành công! 🎉",
        description: "Chào mừng bạn đến với HọcAI.",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      {/* 1. Phần FORM bên trái */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper space-y-8 animate-fade-in-up">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-bold text-2xl text-primary mb-2">
              <Sparkles className="h-8 w-8" />
              HọcAI
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Chào mừng người bạn mới! 👋</h1>
            <p className="text-lg text-muted-foreground">
              Để trợ lý AI có thể hỗ trợ bạn tốt nhất, chúng mình cần thêm một chút thông tin nhé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <UserCircle className="h-4 w-4" />
                  BẠN TÊN LÀ GÌ?
                </Label>
                <Input
                  id="name"
                  placeholder="Họ và tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input h-14 text-xl font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  BẠN ĐANG HỌC LỚP MẤY?
                </Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="auth-input h-14 text-xl font-medium border-b-2">
                    <SelectValue placeholder="Chọn lớp của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)} className="text-lg py-3">
                        Lớp {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Lộ trình học tập sẽ được tinh chỉnh dựa trên khối lớp này.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 rounded-full text-xl font-bold shadow-xl shadow-primary/30 mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                "Đang hoàn tất..."
              ) : (
                <span className="flex items-center gap-2">
                  Sẵn sàng tham gia <CheckCircle2 className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Thông tin này có thể được thay đổi sau trong cài đặt Hồ sơ.
          </p>
        </div>
      </div>

      {/* 2. Phần MINH HỌA bên phải */}
      <div className="auth-illustration-side">
        <AuthIllustration />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Code2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { AuthIllustration } from "@/components/AuthIllustration";
import "@/styles/auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [grade, setGrade] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast({
        title: "Chưa cấu hình Supabase",
        description: "Vui lòng cập nhật VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim() || !email || !password || !grade) {
      toast({ title: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" });
      return;
    }
    if (password !== confirmPw) {
      toast({ title: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          grade: parseInt(grade),
        }
      }
    });

    setLoading(false);

    if (error) {
      toast({ title: "Đăng ký thất bại", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đăng ký thành công! 🎉", description: "Vui lòng kiểm tra email để xác nhận."});
      navigate("/dang-nhap");
    }
  };

  const handleGoogleSignup = async () => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Chưa cấu hình Supabase",
        description: "Không thể đăng ký Google khi .env còn placeholder.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast({ title: "Lỗi đăng ký Google", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-side">
        <div className="auth-form-wrapper space-y-6 px-4 py-8">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl tracking-tight text-slate-900 mb-2 transition-transform hover:scale-105">
              <div className="bg-primary h-9 w-9 rounded-xl text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <Code2 className="h-5 w-5" />
              </div>
              EduAI
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Tạo tài khoản</h1>
            <p className="text-muted-foreground">Bắt đầu hành trình học tập thông minh ngay hôm nay cùng EduAI.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Họ tên</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Lớp</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="auth-input h-10 border-b-2 border-muted">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password" title="Mật khẩu" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input h-10 pr-8"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-pw" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Xác nhận</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="auth-input h-10"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 rounded-full text-lg font-bold shadow-lg shadow-primary/20 mt-4" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground">hoặc đăng ký với</span>
            </div>
          </div>

          <Button variant="outline" size="lg" className="w-full h-12 rounded-full gap-3 font-semibold" onClick={handleGoogleSignup}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Account
          </Button>

          <p className="text-center text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/dang-nhap" className="text-primary font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-illustration-side animate-fade-in">
        <AuthIllustration />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { AuthIllustration } from "@/components/AuthIllustration";
import "@/styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Đăng nhập thất bại", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chào mừng trở lại! 🎉" });
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      toast({ title: "Lỗi đăng nhập Google", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-side">
        <div className="auth-form-wrapper space-y-8 px-4">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl tracking-tight text-slate-900 mb-4 transition-transform hover:scale-105">
              <div className="bg-blue-600 h-9 w-9 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="h-5 w-5" />
              </div>
              EduAI
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Chào mừng bạn!</h1>
            <p className="text-muted-foreground">Tiếp tục hành trình chinh phục tri thức cùng EduAI.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input h-12 text-lg"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" title="Mật khẩu" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input h-12 text-lg pr-10"
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 rounded-full text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="flex-1 h-12 rounded-full gap-3 font-semibold" onClick={handleGoogleLogin}>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-muted-foreground pt-4">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="text-primary font-bold hover:underline">
              Đăng ký ngay
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

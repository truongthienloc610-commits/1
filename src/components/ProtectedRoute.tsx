import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-500/20" />
          <div className="text-sm font-black text-slate-400 uppercase tracking-widest italic animate-pulse">
            EduAI is loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu người dùng đã đăng nhập nhưng chưa hoàn thiện profile (thiếu tên)
  // và họ KHÔNG đang ở trang thiết lập hồ sơ, thì bắt buộc phải chuyển hướng qua đó.
  const isProfileIncomplete = !profile?.full_name;
  const isAtSetupPage = location.pathname === "/thiet-lap-ho-so";

  if (isProfileIncomplete && !isAtSetupPage) {
    return <Navigate to="/thiet-lap-ho-so" replace />;
  }

  return <>{children}</>;
}

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu người dùng đã đăng nhập nhưng chưa hoàn thiện profile (thiếu tên hoặc lớp)
  // và họ KHÔNG đang ở trang thiết lập hồ sơ, thì bắt buộc phải chuyển hướng qua đó.
  const isProfileIncomplete = !profile?.full_name || !profile?.grade;
  const isAtSetupPage = location.pathname === "/thiet-lap-ho-so";

  if (isProfileIncomplete && !isAtSetupPage) {
    return <Navigate to="/thiet-lap-ho-so" replace />;
  }

  return <>{children}</>;
}

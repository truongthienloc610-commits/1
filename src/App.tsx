import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// --- CÁC TRANG CÔNG KHAI (AI CŨNG XEM ĐƯỢC) ---
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// --- CÁC TRANG NỘI BỘ (PHẢI ĐĂNG NHẬP MỚI XEM ĐƯỢC) ---
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import AskAI from "./pages/AskAI";
import Exams from "./pages/Exams";
import Profile from "./pages/Profile";
import CalendarPage from "./pages/Calendar";
import FocusRoom from "./pages/FocusRoom";
import SetupProfile from "./pages/SetupProfile";
import CareerOrientation from "@/pages/CareerOrientation";
import CodeAnalyzer from "./pages/CodeAnalyzer";
// Khởi tạo React Query để quản lý bộ nhớ đệm (Cache) dữ liệu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "mới" trong 5 phút
      retry: 1, // Nếu lỗi, thử lại 1 lần duy nhất
    },
  },
});

/**
 * PublicOnlyRoute: Bảo vệ các trang Đăng nhập/Đăng ký.
 * Nếu đã đăng nhập rồi, hệ thống sẽ tự chuyển hướng người dùng về Dashboard.
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang xác nhận danh tính...</p>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/**
 * AppRoutes: Nơi định nghĩa "bản đồ" các đường dẫn (URL) của ứng dụng.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* 1. Các trang dành cho khách */}
      <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
      
      {/* Trang đăng nhập & đăng ký */}
      <Route path="/dang-nhap" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/dang_nhap" element={<Navigate to="/dang-nhap" replace />} />
      <Route path="/dang-ky" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/dang_ky" element={<Navigate to="/dang-ky" replace />} />

      {/* 2. Các trang dành cho học sinh (Được bảo vệ bởi ProtectedRoute) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/lo-trinh" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
      <Route path="/hoi-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
      <Route path="/phan-tich-code" element={<ProtectedRoute><CodeAnalyzer /></ProtectedRoute>} />
      <Route path="/phan_tich_code" element={<Navigate to="/phan-tich-code" replace />} />
      <Route path="/luyen-de" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
      <Route path="/lich" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/phong-tap-trung" element={<ProtectedRoute><FocusRoom /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/thiet-lap-ho-so" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
      <Route path="/dinh-huong" element={<ProtectedRoute><CareerOrientation /></ProtectedRoute>} />
      <Route path="/dinh_huong" element={<Navigate to="/dinh-huong" replace />} />

      {/* 404 - Trang không tìm thấy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { ThemeProvider } from "@/contexts/ThemeContext";

/**
 * App Component: Điểm khởi đầu của toàn bộ ứng dụng.
 * Ở đây chúng ta bao bọc ứng dụng bằng các "Provider" để quản lý dữ liệu, auth, giao diện...
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="hocai-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster /> {/* Hiển thị thông báo góc dưới */}
          <Sonner />  {/* Hiển thị thông báo dạng pop-up */}
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

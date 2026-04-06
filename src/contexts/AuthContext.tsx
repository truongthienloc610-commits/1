import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// --- ĐỊNH NGHĨA NGƯỜI DÙNG (PROFILE) ---

/**
 * Profile: Chứa thông tin chi tiết của học sinh lưu trong Database.
 */
export interface Profile {
  id: string;
  full_name: string;
  grade: number | null; // Lớp học (6-12)
  avatar_url: string | null;
  plan: "free" | "pro" | "premium"; // Gói tài khoản
  role: "user" | "staff" | "admin"; // Quyền hạn: người dùng, nhân viên, quản trị viên
  streak_days: number; // Số ngày học liên tiếp
  total_study_minutes: number; // Tổng thời gian học
  created_at: string;
  updated_at: string;
}

/**
 * AuthContextValue: Các giá trị mà AuthContext sẽ cung cấp cho toàn bộ ứng dụng.
 */
interface AuthContextValue {
  user: User | null; // Thông tin tài khoản từ Supabase Auth
  session: Session | null; // Phiên đăng nhập hiện tại
  profile: Profile | null; // Thông tin chi tiết (tên, lớp, điểm...)
  loading: boolean; // Trạng thái đang tải dữ liệu
  signOut: () => Promise<void>; // Hàm đăng xuất
  refreshProfile: () => Promise<void>; // Hàm tải lại thông tin cá nhân
}

// Khởi tạo Context với giá trị mặc định
const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

// --- BỘ CUNG CẤP (PROVIDER) ---

/**
 * AuthProvider: Bao bọc toàn bộ ứng dụng để cung cấp thông tin đăng nhập.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thông tin chi tiết từ bảng 'profiles' dựa trên ID người dùng
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data as Profile);
  };

  // Hàm tiện ích để cập nhật lại thông tin cá nhân khi cần
  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Hàm đăng xuất: Xóa sạch dữ liệu trong state và Supabase
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    // 1. Kiểm tra phiên đăng nhập ngay khi ứng dụng vừa mở
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Cho phép người dùng vào App ngay khi có session
      
      if (session?.user) {
        fetchProfile(session.user.id); // Tải profile ngầm
      }
    });

    // 2. Lắng nghe sự kiện thay đổi trạng thái
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Cập nhật trạng thái loading ngay
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Hủy lắng nghe khi component bị gỡ bỏ
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- HOOK SỬ DỤNG ---

/**
 * useAuth: Hook tiện lợi để lấy thông tin người dùng ở bất kỳ đâu trong App.
 * Ví dụ: const { user, profile } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

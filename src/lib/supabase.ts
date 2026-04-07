import { createClient } from '@supabase/supabase-js';

// 1. Lấy thông tin cấu hình từ file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasValidSupabaseUrl =
  typeof supabaseUrl === "string" &&
  /^https?:\/\//.test(supabaseUrl) &&
  !supabaseUrl.includes("your_supabase_url_here");
const hasValidSupabaseKey =
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes("your_supabase_anon_key_here");
export const isSupabaseConfigured = Boolean(hasValidSupabaseUrl && hasValidSupabaseKey);

// 2. Kiểm tra xem đã cấu hình đầy đủ chưa
if (!isSupabaseConfigured) {
  console.warn("Lỗi: Thiếu biến môi trường Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env");
}

/**
 * Khởi tạo Supabase Client.
 * Đối tượng này được dùng để tương tác với Database, Auth, Storage...
 */
export const supabase = createClient(
  // Fallback values keep app bootable in local debug mode when .env is missing.
  hasValidSupabaseUrl ? supabaseUrl : "http://127.0.0.1",
  hasValidSupabaseKey ? supabaseAnonKey : "dev-anon-key-not-configured"
);

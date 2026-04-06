import { createClient } from '@supabase/supabase-js';

// 1. Lấy thông tin cấu hình từ file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Kiểm tra xem đã cấu hình đầy đủ chưa
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Lỗi: Thiếu biến môi trường Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env");
}

/**
 * Khởi tạo Supabase Client.
 * Đối tượng này được dùng để tương tác với Database, Auth, Storage...
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

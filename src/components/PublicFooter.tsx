import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer id="report" className="border-t bg-slate-50/50">
      <div className="container py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight text-slate-900">
              <div className="bg-blue-600 h-8 w-8 rounded-lg text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="h-4 w-4" />
              </div>
              <span>EduAI</span>
            </Link>
            <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
              Nền tảng học tập AI cá nhân hoá dành riêng cho học sinh lớp 6–12. Đưa tri thức tới mọi nẻo đường.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Sản phẩm</h4>
              <nav className="flex flex-col gap-3 text-slate-500 font-medium">
                <a href="#features" className="hover:text-blue-600 transition-colors">Tính năng</a>
                <a href="#about" className="hover:text-blue-600 transition-colors">Về chúng tôi</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Pháp lý</h4>
              <nav className="flex flex-col gap-3 text-slate-500 font-medium">
                <span className="cursor-default hover:text-blue-600 transition-colors">Điều khoản</span>
                <span className="cursor-default hover:text-blue-600 transition-colors">Chính sách</span>
                <span className="cursor-default hover:text-blue-600 transition-colors">Liên hệ</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 text-slate-400 text-center font-medium text-sm">
          © 2026 EduAI. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

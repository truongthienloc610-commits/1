import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>HọcAI</span>
            </Link>
            <p className="text-body-sm text-muted-foreground max-w-xs">
              Nền tảng học tập AI cá nhân hoá dành riêng cho học sinh lớp 6–12.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-body-sm">Sản phẩm</h4>
              <nav className="flex flex-col gap-2 text-body-sm text-muted-foreground">
                <Link to="/#features" className="hover:text-foreground transition-colors">Tính năng</Link>
                <Link to="/gia" className="hover:text-foreground transition-colors">Bảng giá</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-body-sm">Pháp lý</h4>
              <nav className="flex flex-col gap-2 text-body-sm text-muted-foreground">
                <span className="cursor-default">Điều khoản</span>
                <span className="cursor-default">Chính sách</span>
                <span className="cursor-default">Liên hệ</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-caption text-muted-foreground text-center">
          © 2026 HọcAI. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

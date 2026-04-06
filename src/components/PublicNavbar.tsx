import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Code2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Về chúng tôi", href: "/#about" },
  { label: "Sản phẩm", href: "/#products" },
  { label: "Báo cáo sự cố", href: "/#report" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900 shrink-0">
          <div className="bg-blue-600 h-9 w-9 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">EduAI</span>
        </Link>

        {/* Desktop nav - Centered */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm font-semibold transition-all hover:text-blue-600 ${
                location.pathname === item.href ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="text-slate-600 font-bold px-4" asChild>
            <Link to="/dang-nhap">Đăng nhập</Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 px-6 font-bold rounded-xl" asChild>
            <Link to="/dang-ky">Đăng ký</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button className="p-2 text-slate-600" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-lg font-bold text-slate-900 py-2 hover:text-blue-600"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            <Button variant="ghost" asChild className="justify-start text-lg font-bold text-slate-900 px-0">
              <Link to="/dang-nhap" onClick={() => setOpen(false)}>Đăng nhập</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20" asChild>
              <Link to="/dang-ky" onClick={() => setOpen(false)}>Đăng ký</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

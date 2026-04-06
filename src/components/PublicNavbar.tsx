import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Code2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Lộ trình", href: "/#features" },
  { label: "Về EduAI", href: "/" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-blue-600 p-1 rounded-lg text-white">
            <Code2 className="h-6 w-6" />
          </div>
          <span>Edu<span className="text-blue-600">AI</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
                location.pathname === item.href ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="text-slate-600 font-semibold" asChild>
            <Link to="/dang-nhap">Đăng nhập</Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-none px-5" asChild>
            <Link to="/dang-ky">Bắt đầu ngay</Link>
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button className="p-2 text-slate-600" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
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
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-12 text-lg" asChild>
              <Link to="/dang-ky" onClick={() => setOpen(false)}>Bắt đầu ngay</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

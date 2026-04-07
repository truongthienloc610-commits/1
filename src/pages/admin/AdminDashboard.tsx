import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  TrendingUp, 
  Search, 
  Palette, 
  Github, 
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("eduai-primary-color") || "#2563eb";
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Hàm chuyển đổi Hex sang HSL components (ví dụ: '221 83% 53%')
  const hexToHSLComponents = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Cập nhật Theme Color
  const handleThemeChange = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem("eduai-primary-color", color);
    
    // Chuyển sang HSL để khớp với config của Tailwind/Shadcn
    const hslValue = hexToHSLComponents(color);
    document.documentElement.style.setProperty('--primary', hslValue);
    
    toast({
      title: "Đã cập nhật Theme! ✨",
      description: `Màu chủ đạo đã được đổi sang mã HSL: ${hslValue}`,
    });
  };

  // Giả lập Đẩy code lên GitHub
  const handleGithubPush = async () => {
    setIsSyncing(true);
    toast({
      title: "Bắt đầu đẩy mã nguồn...",
      description: "Đang nén dữ liệu và chuẩn bị git push.",
    });

    // Giả lập tiến trình
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Đồng bộ GitHub thành công! 🚀",
        description: "Mã nguồn đã được cập nhật lên nhánh main.",
      });
    }, 3000);
  };

  // Xuất báo cáo CSV
  const handleExportCSV = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('ai_logs')
        .select('*');
      
      if (error) throw error;
      if (!logs || logs.length === 0) {
        toast({ title: "Không có dữ liệu", description: "Hiện chưa có log AI nào để xuất.", variant: "destructive" });
        return;
      }

      // Tạo nội dung CSV
      const headers = ["ID", "Prompt", "Response", "Rating", "Latency (ms)", "Status", "Time"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log => [
          log.id,
          `"${log.prompt?.replace(/"/g, '""')}"`,
          `"${log.response?.replace(/"/g, '""')}"`,
          log.rating || "N/A",
          log.latency_ms || 0,
          log.status,
          new Date(log.created_at).toLocaleString('vi-VN')
        ].join(","))
      ].join("\n");

      // Tải tệp xuống
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `EduAI_Stats_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Đã xuất báo cáo! 📄", description: "Tệp CSV đã được tải xuống máy tính của bạn." });
    } catch (error: any) {
      toast({ title: "Lỗi xuất báo cáo", description: error.message, variant: "destructive" });
    }
  };

  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", role: "user", status: "active", joinDate: "12/03/2024" },
    { id: 2, name: "Trần Thị B", email: "thib@gmail.com", role: "operator", status: "active", joinDate: "15/03/2024" },
    { id: 3, name: "Lê Văn C", email: "vanc@gmail.com", role: "admin", status: "active", joinDate: "01/01/2024" },
    { id: 4, name: "Phạm Minh D", email: "minhd@gmail.com", role: "user", status: "suspended", joinDate: "20/03/2024" },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">
              Bảng <span className="text-blue-600">Quản trị</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Chào mừng quay lại, Quản trị viên. Hệ thống đang hoạt động ổn định.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleExportCSV}
              className="h-14 px-6 rounded-2xl border-slate-200 font-black gap-3 hover:bg-slate-50 transition-all text-slate-600"
            >
              <BarChart3 className="h-5 w-5" />
              Xuất báo cáo (CSV)
            </Button>
            <Button 
              variant="outline"
              onClick={handleGithubPush}
              disabled={isSyncing}
              className="h-14 px-6 rounded-2xl border-slate-200 font-black gap-3 hover:bg-slate-50 transition-all"
            >
              <Github className={cn("h-5 w-5", isSyncing && "animate-spin")} />
              {isSyncing ? "Đang đồng bộ..." : "Đẩy lên GitHub"}
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/20 gap-3">
              <UserPlus className="h-5 w-5" /> Thêm thành viên
            </Button>
          </div>

        </div>

        {/* Quick Actions & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theme Customizer */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" /> Tùy chỉnh Giao diện
              </CardTitle>
              <CardDescription className="font-medium">Thay đổi tông màu chủ đạo cho toàn bộ EduAI.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-4">
                {["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0f172a"].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleThemeChange(color)}
                    className={cn(
                      "h-12 w-12 rounded-2xl border-4 transition-all hover:scale-110 active:scale-95",
                      primaryColor === color ? "border-slate-900" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="flex items-center gap-3 ml-2 border-l pl-6 border-slate-100">
                  <Input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="h-12 w-16 p-1 rounded-xl border-none cursor-pointer"
                  />
                  <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{primaryColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Sync */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-green-600" /> Đồng bộ Hệ thống
              </CardTitle>
              <CardDescription className="font-medium">Cập nhật mã nguồn và nội dung bài học lên kho lưu trữ.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-black text-slate-900">GitHub Repository</p>
                      <p className="text-xs font-bold text-slate-400 italic">Cập nhật lần cuối: 1 giờ trước</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none font-bold">Connected</Badge>
                </div>
                <Button 
                  onClick={handleGithubPush}
                  disabled={isSyncing}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2"
                >
                  {isSyncing ? "Đang xử lý..." : "Bắt đầu Đồng bộ ngay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight shrink-0">Danh sách thành viên</h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm tên, email hoặc vai trò..." 
                className="h-12 pl-12 pr-6 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{u.name}</span>
                        <span className="text-xs font-bold text-slate-400 tracking-tight">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 uppercase">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "font-black tracking-widest text-[9px] px-2",
                          u.role === 'admin' ? "bg-red-50 text-red-600" : 
                          u.role === 'operator' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 uppercase">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", u.status === 'active' ? 'bg-green-500' : 'bg-red-400')} />
                        <span className="text-[10px] font-black text-slate-500 tracking-widest">{u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{u.joinDate}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100"><Settings className="h-4 w-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600"><ShieldAlert className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


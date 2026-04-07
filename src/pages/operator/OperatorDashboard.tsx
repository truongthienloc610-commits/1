import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageSquare, Clock, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function OperatorDashboard() {
  // Mock data for AI Logs
  const aiLogs = [
    { id: 1, prompt: "Giải thích về Closure trong JS", response: "Closure là một hàm có quyền truy cập vào...", rating: 5, latency: "0.8s", status: "success", time: "2 phút trước" },
    { id: 2, prompt: "Lỗi React Hook useEffect", response: "Bạn cần cung cấp mảng phụ thuộc...", rating: 4, latency: "1.2s", status: "success", time: "5 phút trước" },
    { id: 3, prompt: "Viết API với Node.js", response: "Sử dụng Express framework...", rating: null, latency: "2.5s", status: "warning", time: "10 phút trước" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">
            Giám sát <span className="text-blue-600">Vận hành</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Theo dõi chất lượng phản hồi của AI Mentor và hiệu năng hệ thống theo thời gian thực.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-blue-500/5 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Tổng số yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">1,284</div>
              <p className="text-xs font-bold text-blue-600 mt-1">+12% so với hôm qua</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-green-500/5 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4" /> Độ trễ trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">0.95s</div>
              <p className="text-xs font-bold text-green-600 mt-1">Ổn định</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-orange-500/5 bg-orange-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4" /> Tỉ lệ lỗi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">0.2%</div>
              <p className="text-xs font-bold text-orange-600 mt-1">-5% so với tuần trước</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-purple-500/5 bg-purple-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Đánh giá tích cực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">98.5%</div>
              <p className="text-xs font-bold text-purple-600 mt-1">Dựa trên 450 lượt vote</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Nhật ký AI gần đây</h2>
            <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] px-3 py-1">Live Update</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Câu hỏi</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Độ trễ</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {aiLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                        <Clock className="h-3.5 w-3.5" /> {log.time}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-xs">{log.prompt}</p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{log.latency}</Badge>
                    </td>
                    <td className="px-8 py-6">
                      {log.status === "success" ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                          <CheckCircle2 className="h-4 w-4" /> Thành công
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                          <AlertCircle className="h-4 w-4" /> Cảnh báo
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Chi tiết</button>
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

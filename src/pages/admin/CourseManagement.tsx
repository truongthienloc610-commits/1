import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit2, 
  Trash2, 
  ArrowRight, 
  Layers,
  Video,
  FileText,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Roadmap {
  id: string;
  title: string;
  description: string;
  role_type: string;
  created_at: string;
}

interface Step {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  video_url: string;
  theory_markdown: string;
  order_index: number;
}

export default function CourseManagement() {
  const { toast } = useToast();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho việc tạo/sửa Roadmap
  const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [roadmapForm, setRoadmapForm] = useState({ title: "", description: "", role_type: "Frontend" });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("edu_roadmaps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" });
    } else {
      setRoadmaps(data || []);
    }
    setLoading(false);
  };

  const handleSaveRoadmap = async () => {
    if (!roadmapForm.title) return;

    if (editingRoadmap) {
      const { error } = await supabase
        .from("edu_roadmaps")
        .update(roadmapForm)
        .eq("id", editingRoadmap.id);
      
      if (error) toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Đã cập nhật", description: "Lộ trình đã được lưu thay đổi." });
        setIsRoadmapDialogOpen(false);
        fetchRoadmaps();
      }
    } else {
      const { error } = await supabase
        .from("edu_roadmaps")
        .insert([roadmapForm]);
      
      if (error) toast({ title: "Lỗi thêm mới", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Thành công", description: "Lộ trình mới đã được tạo." });
        setIsRoadmapDialogOpen(false);
        fetchRoadmaps();
      }
    }
  };

  const handleDeleteRoadmap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa lộ trình này? Tất cả các bước bên trong cũng sẽ bị xóa.")) return;

    const { error } = await supabase.from("edu_roadmaps").delete().eq("id", id);
    if (error) toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Đã xóa", description: "Lộ trình đã được gỡ bỏ khỏi hệ thống." });
      fetchRoadmaps();
    }
  };

  const filteredRoadmaps = roadmaps.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.role_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">
              Quản lý <span className="text-primary">Khóa học</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Xây dựng lộ trình học tập bài bản cho hàng ngàn học sinh.
            </p>
          </div>
          <Dialog open={isRoadmapDialogOpen} onOpenChange={setIsRoadmapDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingRoadmap(null);
                  setRoadmapForm({ title: "", description: "", role_type: "Frontend" });
                }}
                className="h-14 px-8 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-black shadow-xl shadow-primary/20 gap-3"
              >
                <Plus className="h-5 w-5" /> Tạo lộ trình mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editingRoadmap ? "Cập nhật lộ trình" : "Thêm lộ trình mới"}</DialogTitle>
                <DialogDescription className="font-medium text-slate-500">
                  Thông tin này sẽ hiển thị trực tiếp cho người dùng.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-xs uppercase tracking-widest text-slate-400">Tiêu đề</Label>
                  <Input 
                    id="title" 
                    value={roadmapForm.title} 
                    onChange={(e) => setRoadmapForm({...roadmapForm, title: e.target.value})}
                    placeholder="Ví dụ: Lộ trình Web Frontend từ số 0" 
                    className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-black text-xs uppercase tracking-widest text-slate-400">Lĩnh vực</Label>
                  <Input 
                    id="role" 
                    value={roadmapForm.role_type} 
                    onChange={(e) => setRoadmapForm({...roadmapForm, role_type: e.target.value})}
                    placeholder="Frontend, Backend, AI..." 
                    className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-black text-xs uppercase tracking-widest text-slate-400">Mô tả ngắn</Label>
                  <Textarea 
                    id="desc" 
                    value={roadmapForm.description} 
                    onChange={(e) => setRoadmapForm({...roadmapForm, description: e.target.value})}
                    placeholder="Giải thích mục tiêu của lộ trình này..." 
                    className="min-h-[100px] rounded-xl border-slate-100 bg-slate-50 font-bold"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRoadmapDialogOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                <Button onClick={handleSaveRoadmap} className="rounded-xl bg-slate-900 text-white font-bold px-8">Lưu lại</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc lĩnh vực..." 
            className="h-16 pl-14 pr-8 rounded-[1.25rem] border-none bg-white shadow-xl shadow-slate-200/50 font-bold text-lg placeholder:text-slate-400"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[280px] rounded-[2.5rem] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoadmaps.map((roadmap) => (
              <Card 
                key={roadmap.id} 
                className="group relative border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => {
                  setEditingRoadmap(roadmap);
                  setRoadmapForm({ title: roadmap.title, description: roadmap.description, role_type: roadmap.role_type });
                  setIsRoadmapDialogOpen(true);
                }}
              >
                <CardHeader className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-black tracking-widest text-[10px] uppercase px-3">
                      {roadmap.role_type}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                    {roadmap.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-slate-400 font-bold line-clamp-3 mb-8 min-h-[4.5rem]">
                    {roadmap.description || "Chưa có mô tả cho lộ trình này."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <Layers className="h-4 w-4 text-slate-300" />
                       <span className="text-sm font-black text-slate-400 italic">Đã đồng bộ</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoadmap(roadmap);
                          setRoadmapForm({ title: roadmap.title, description: roadmap.description, role_type: roadmap.role_type });
                          setIsRoadmapDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => handleDeleteRoadmap(roadmap.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <button 
              onClick={() => {
                setEditingRoadmap(null);
                setRoadmapForm({ title: "", description: "", role_type: "Frontend" });
                setIsRoadmapDialogOpen(true);
              }}
              className="h-full min-h-[300px] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
            >
              <Plus className="h-10 w-10 group-hover:scale-110 transition-transform" />
              <span className="font-black text-lg tracking-tight">Thêm lộ trình mới</span>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

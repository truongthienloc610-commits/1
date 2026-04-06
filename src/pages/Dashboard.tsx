import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { 
  Flame, CheckCircle2, Circle, ListTodo, Map, 
  ArrowRight, BookOpen, Clock, Zap, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Todo {
  id: string;
  task: string;
  is_completed: boolean;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch todos
  useEffect(() => {
    if (profile?.id) {
      fetchTodos();
    }
  }, [profile?.id]);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('edu_todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }

  async function addTodo() {
    if (!newTodo.trim()) return;
    const { data, error } = await supabase
      .from('edu_todos')
      .insert([{ user_id: profile?.id, task: newTodo }])
      .select()
      .single();

    if (error) {
        toast.error("Không thể thêm nhiệm vụ");
    } else {
      setTodos([data, ...todos]);
      setNewTodo("");
      toast.success("Đã thêm nhiệm vụ");
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('edu_todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Lỗi cập nhật");
    } else {
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  }

  const pendingTodos = todos.filter(t => !t.is_completed);
  const completedTodos = todos.filter(t => t.is_completed);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Chào {profile?.full_name?.split(" ").at(-1) ?? "bạn"}! 👋
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Bạn đang làm rất tốt. Hãy tiếp tục giữ vững phong độ nhé!
            </p>
          </div>
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-6 py-4 rounded-2xl shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Flame className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Chuỗi học tập</p>
              <p className="text-2xl font-black text-slate-900">{profile?.streak_count ?? 0} ngày</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Progress & Roadmap */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Progress Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-none hover:border-blue-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Zap className="h-5 w-5 fill-current" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900">Bắt đầu học ngay</h3>
                <p className="text-sm text-slate-500 mt-1">Tiếp tục lộ trình của bạn để không bỏ lỡ kiến thức.</p>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-none hover:border-green-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                    <Map className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-green-500 transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900">Xem lộ trình</h3>
                <p className="text-sm text-slate-500 mt-1">Khám phá các bước chân tiếp theo trong ngành lập trình.</p>
              </div>
            </div>

            {/* Current Roadmap Progress Placeholder */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Tiến độ lộ trình
                </h2>
                <Link to="/lo-trinh" className="text-sm font-bold text-blue-600 hover:underline">Xem tất cả</Link>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900">Lập trình cơ bản cho Newbie</span>
                    <span className="text-sm font-bold text-slate-500">65%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[65%]" />
                  </div>
                </div>
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-slate-400 italic">Mở rộng danh mục để xem các môn học khác</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Todo List */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-blue-600" />
                  Nhiệm vụ hôm nay
                </h2>
              </div>

              {/* Add Todo input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Thêm nhiệm vụ mới..."
                  className="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                />
                <button 
                  onClick={addTodo}
                  className="absolute right-2 top-1.5 h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Todo list items */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {pendingTodos.length === 0 && completedTodos.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400">Hôm nay bạn chưa có kế hoạch gì?</p>
                  </div>
                )}
                
                {pendingTodos.map(todo => (
                  <div key={todo.id} className="flex items-start gap-3 group animate-in fade-in slide-in-from-left-2 duration-200">
                    <button 
                      onClick={() => toggleTodo(todo.id, false)}
                      className="mt-0.5 text-slate-300 hover:text-blue-500 transition-colors"
                    >
                      <Circle className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-700 leading-tight">{todo.task}</span>
                  </div>
                ))}

                {completedTodos.length > 0 && (
                  <div className="pt-4 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đã hoàn thành</p>
                    {completedTodos.map(todo => (
                      <div key={todo.id} className="flex items-start gap-3 opacity-50 grayscale transition-all">
                        <button 
                          onClick={() => toggleTodo(todo.id, true)}
                          className="mt-0.5 text-blue-600"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 line-through leading-tight">{todo.task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Motivation Card */}
            <div className="bg-blue-600 rounded-3xl p-6 text-white overflow-hidden relative group">
              <Zap className="absolute -right-4 -bottom-4 h-32 w-32 text-blue-500/20 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
              <h3 className="text-lg font-bold mb-2 relative z-10">Mẹo nhỏ hôm nay</h3>
              <p className="text-blue-100 text-sm leading-relaxed relative z-10">
                Hãy dành ít nhất 15 phút mỗi ngày để luyện gõ code. Nó sẽ giúp ngón tay của bạn "nhớ" cú pháp nhanh hơn bất kỳ cuốn sách nào!
              </p>
              <Button size="sm" variant="secondary" className="mt-4 bg-white text-blue-600 border-none relative z-10 hover:bg-blue-50" asChild>
                <Link to="/luyen-tap">Luyện tập ngay</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

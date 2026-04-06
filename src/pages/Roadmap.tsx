import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Compass, Code, Database, Layout, ArrowRight, 
  PlayCircle, BookOpen, CheckCircle2, Circle, 
  ChevronRight, ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  theory_markdown: string;
  video_url: string;
  order_index: number;
  completed?: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  role_type: string;
}

export default function Roadmap() {
  const { profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep] = useState<RoadmapStep | null>(null);
  const [loading, setLoading] = useState(true);

  const roles = [
    { id: "basics", title: "Lập trình là gì?", desc: "Dành cho người mới bắt đầu từ con số 0.", icon: Compass, color: "bg-blue-50 text-blue-600" },
    { id: "frontend", title: "Frontend Developer", desc: "Xây dựng giao diện web đẹp mắt với HTML/CSS/JS.", icon: Layout, color: "bg-purple-50 text-purple-600" },
    { id: "backend", title: "Backend Developer", desc: "Xử lý logic, database và server-side.", icon: Code, color: "bg-green-50 text-green-600" },
    { id: "data", title: "Data Analyst", desc: "Phân tích dữ liệu và tìm kiếm thông tin hữu ích.", icon: Database, color: "bg-orange-50 text-orange-600" },
  ];

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  async function fetchRoadmaps() {
    const { data, error } = await supabase.from('edu_roadmaps').select('*');
    if (error) console.error(error);
    else setRoadmaps(data || []);
    setLoading(false);
  }

  async function handleRoleSelect(roleType: string) {
    setLoading(true);
    setSelectedRole(roleType);
    
    // Find roadmap for this role
    const roadmap = roadmaps.find(r => r.role_type === roleType);
    if (roadmap) {
      const { data, error } = await supabase
        .from('edu_roadmap_steps')
        .select('*')
        .eq('roadmap_id', roadmap.id)
        .order('order_index', { ascending: true });
      
      if (error) {
        toast.error("Không thể tải lộ trình");
      } else {
        // Fetch user progress
        const { data: progress } = await supabase
          .from('edu_user_progress')
          .select('step_id')
          .eq('user_id', profile?.id)
          .eq('completed', true);
        
        const completedStepIds = new Set(progress?.map(p => p.step_id) || []);
        const stepsWithProgress = data.map(s => ({
          ...s,
          completed: completedStepIds.has(s.id)
        }));
        
        setSteps(stepsWithProgress);
        if (stepsWithProgress.length > 0) setCurrentStep(stepsWithProgress[0]);
      }
    } else {
      toast.info("Lộ trình này đang được cập nhật!");
      setSelectedRole(null);
    }
    setLoading(false);
  }

  async function toggleComplete(stepId: string) {
    if (!profile?.id) return;

    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const isCompleted = !step.completed;

    const { error } = await supabase
      .from('edu_user_progress')
      .upsert({ 
        user_id: profile.id, 
        step_id: stepId, 
        completed: isCompleted,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,step_id' });

    if (error) {
      toast.error("Lỗi cập nhật tiến độ");
    } else {
      setSteps(steps.map(s => s.id === stepId ? { ...s, completed: isCompleted } : s));
      toast.success(isCompleted ? "Đã hoàn thành bước này! 🎉" : "Đã hủy hoàn thành");
    }
  }

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64">Đang tải...</div></AppLayout>;

  // --- View: Role Selection ---
  if (!selectedRole) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Chọn vai trò của bạn</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Hãy chọn điểm bắt đầu phù hợp với mục tiêu của bạn. Đừng lo lắng, bạn có thể thay đổi bất cứ lúc nào.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="relative z-10 space-y-6">
                  <div className={`h-14 w-14 rounded-2xl ${role.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <role.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">{role.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{role.desc}</p>
                  </div>
                  <div className="flex items-center text-blue-600 font-bold gap-2 group-hover:gap-4 transition-all">
                    Xem lộ trình <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <role.icon className="h-32 w-32 -mr-8 -mt-8 rotate-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }

  // --- View: Learning Steps ---
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Navigation List */}
        <div className="lg:w-80 space-y-6">
          <Button 
            variant="ghost" 
            className="text-slate-500 font-bold hover:bg-slate-50 -ml-2"
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
          </Button>

          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 px-4 py-2 border-b border-slate-50 mb-4">Danh sách bài học</h2>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                    currentStep?.id === step.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep?.id === step.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="flex-1 text-sm font-bold truncate">{step.title}</span>
                  {step.completed && (
                    <CheckCircle2 className={`h-4 w-4 ${currentStep?.id === step.id ? "text-white" : "text-green-500"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {currentStep ? (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-8 border-b border-slate-50">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    Bước {currentStep.order_index}
                  </div>
                  <Button 
                    variant={currentStep.completed ? "outline" : "default"}
                    className={currentStep.completed ? "border-green-100 text-green-600 hover:bg-green-50" : "bg-blue-600 hover:bg-blue-700"}
                    onClick={() => toggleComplete(currentStep.id)}
                  >
                    {currentStep.completed ? (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Đã hoàn thành</>
                    ) : (
                      "Đánh dấu hoàn thành"
                    )}
                  </Button>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">{currentStep.title}</h2>
                <p className="text-slate-500 mt-2 text-lg leading-relaxed">{currentStep.description}</p>
              </div>

              {/* Video Section (Placeholder if no URL) */}
              {currentStep.video_url && (
                <div className="aspect-video bg-slate-900 relative group">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(currentStep.video_url)}`}
                    title={currentStep.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Theory Content */}
              <div className="p-8 space-y-8">
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h3:text-blue-600">
                  <h3 className="flex items-center gap-2 mb-6">
                    <BookOpen className="h-5 w-5" /> Lý thuyết & Tip
                  </h3>
                  <div className="text-slate-600 leading-loose">
                    <ReactMarkdown>{currentStep.theory_markdown || "Nội dung đang được biên soạn..."}</ReactMarkdown>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    className="text-slate-500 font-bold"
                    onClick={() => {
                      const prev = steps[steps.indexOf(currentStep) - 1];
                      if (prev) setCurrentStep(prev);
                    }}
                    disabled={steps.indexOf(currentStep) === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Bài trước
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={() => {
                      const next = steps[steps.indexOf(currentStep) + 1];
                      if (next) setCurrentStep(next);
                      if (!currentStep.completed) toggleComplete(currentStep.id);
                    }}
                    disabled={steps.indexOf(currentStep) === steps.length - 1}
                  >
                    Bài tiếp theo <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-32 space-y-4">
              <BookOpen className="h-16 w-16 opacity-20" />
              <p className="font-medium">Vui lòng chọn một bài học từ danh sách bên trái.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

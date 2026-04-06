import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import {
  Compass, Code, BookOpen, Target, ArrowRight,
  Terminal, GitBranch, Github, Layers, Zap, Star
} from "lucide-react";

const features = [
  { 
    icon: Compass, 
    title: "Định hướng rõ ràng", 
    desc: "Không còn học lan man. Chúng mình giúp bạn tập trung vào những nền tảng cốt lõi nhất để bắt đầu sự nghiệp.",
    color: "bg-blue-50 text-blue-600"
  },
  { 
    icon: Code, 
    title: "Thực hành ngay lập tức", 
    desc: "Học đi đôi với hành. Các bài tập code được thiết kế để bạn làm quen với cú pháp và tư duy lập trình.",
    color: "bg-purple-50 text-purple-600"
  },
  { 
    icon: Github, 
    title: "Hướng tới thực tế", 
    desc: "Sau khi nắm vững cơ bản, chúng mình khuyến khích bạn bước ra thế giới thực: Git, GitHub và LeetCode.",
    color: "bg-orange-50 text-orange-600"
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-32 lg:pb-48 overflow-hidden bg-white">
        {/* Background blobs for elite feel */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-50/30 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/80 text-blue-600 rounded-full text-xs lg:text-sm font-extrabold uppercase tracking-[0.2em] transition-all backdrop-blur-sm border border-blue-100/50 shadow-sm animate-in fade-in slide-in-from-left-4 duration-700">
                <Star className="h-4 w-4 fill-blue-600" /> AI-powered Education Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-left-6 duration-1000">
                Nâng tầm tri thức <br />
                <span className="text-gradient-blue">Bằng sức mạnh AI</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                EduAI là nền tảng học tập thông minh giúp bạn tóm tắt tài liệu, tạo lộ trình học tập cá nhân hóa và quản lý thời gian hiệu quả nhất.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/30 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 group" asChild>
                  <Link to="/dang-ky">
                    Bắt đầu ngay
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-8 text-lg text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all" asChild>
                  <Link to="/#features">
                    Tìm hiểu thêm
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Mockup Visualization */}
            <div className="flex-1 relative w-full max-w-2xl lg:max-w-none animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative animate-float pointer-events-none select-none">
                <div className="relative perspective-1000">
                   <div className="relative z-10 transition-transform duration-700 transform-gpu">
                     <img 
                       src="/mockup.png" 
                       alt="EduAI Dashboard Mockup" 
                       className="rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(30,58,138,0.25)] border-[12px] border-slate-900 bg-slate-900 overflow-hidden transform rotate-2"
                     />
                   </div>
                   <div className="absolute -left-4 sm:-left-12 -bottom-16 sm:-bottom-24 w-32 sm:w-48 z-20 transition-transform duration-700 transform-gpu">
                     <img 
                       src="/mockup.png" 
                       alt="EduAI Mobile App Mockup" 
                       className="rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-slate-900 bg-slate-900 overflow-hidden transform -rotate-12"
                     />
                   </div>
                </div>
                <div className="absolute -top-12 -left-12 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-32 bg-slate-50/30 border-y border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Học thông minh, tiến xa hơn</h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">Bất kể bạn bắt đầu từ đâu, EduAI luôn có giải pháp tối ưu cho hành trình học tập của bạn.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {features.map((f, i) => (
              <div 
                key={f.title} 
                style={{ animationDelay: `${i * 100}ms` }}
                className="group p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-500/5 cursor-default animate-in fade-in slide-in-from-bottom-8 duration-700"
              >
                <div className={`h-16 w-16 rounded-3xl ${f.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-slate-500 leading-loose font-medium text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transition Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Target className="h-4 w-4" /> Cam kết chất lượng
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">Giải quyết nỗi đau mang tên "Không biết học gì"</h2>
              <p className="text-lg text-slate-500 leading-loose font-medium italic">
                "Thế giới công nghệ quá rộng lớn khiến newbie bị ngợp. EduAI sinh ra để làm 'bộ lưới lọc', chỉ giữ lại những gì thực sự cốt lõi nhất để bạn tự tin bước vào nghề."
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">99%</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Học viên hài lòng</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">10k+</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lộ trình được tạo</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="glass-card rounded-[3rem] p-12 border border-slate-200 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 group-hover:w-4 transition-all" />
                  <div className="space-y-8 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center">
                           <Github className="h-6 w-6 text-slate-700" />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Sẵn sàng cho thực tế</h4>
                           <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Bridge to Professional Career</p>
                        </div>
                     </div>
                     <p className="text-slate-600 text-lg leading-relaxed font-medium">
                        Sau EduAI, bạn không chỉ có kiến thức. Bạn sẽ làm chủ được <strong>Git Flow</strong>, tự tin đọc Documentation trên <strong>GitHub</strong> và sẵn sàng chinh phục các thử thách tại <strong>LeetCode</strong>.
                     </p>
                     <div className="flex items-center gap-4 pt-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                        <Terminal className="h-8 w-8" />
                        <GitBranch className="h-8 w-8" />
                        <Layers className="h-8 w-8" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.15),_transparent)] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10 space-y-10">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tighter">Bắt đầu hành trình của bạn ngày hôm nay</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-loose font-medium">
            Gia nhập cộng đồng lập trình viên tự học, có định hướng và làm chủ tương lai bằng niềm đam mê mãnh liệt.
          </p>
          <div className="pt-6">
            <Button size="lg" className="h-16 px-12 text-xl bg-blue-600 hover:bg-blue-700 shadow-[0_20px_50px_rgba(37,99,235,0.3)] border-none rounded-2xl transform transition-all hover:scale-110 active:scale-95 font-bold group" asChild>
              <Link to="/dang-ky">
                Tạo tài khoản miễn phí 
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

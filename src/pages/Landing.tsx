import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import {
  Compass, Code, BookOpen, Target, ArrowRight,
  Terminal, GitBranch, Github, Layers, Zap
} from "lucide-react";

const features = [
  { 
    icon: Compass, 
    title: "Định hướng rõ ràng", 
    desc: "Không còn học lan man. Chúng mình giúp bạn tập trung vào những nền tảng cốt lõi nhất để bắt đầu sự nghiệp." 
  },
  { 
    icon: Code, 
    title: "Thực hành ngay lập tức", 
    desc: "Học đi đôi với hành. Các bài tập code được thiết kế để bạn làm quen với cú pháp và tư duy lập trình." 
  },
  { 
    icon: Github, 
    title: "Hướng tới thực tế", 
    desc: "Sau khi nắm vững cơ bản, chúng mình khuyến khích bạn bước ra thế giới thực: Git, GitHub và LeetCode." 
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 border-b border-slate-100">
        <div className="container relative flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm font-medium text-slate-600">
            <Zap className="h-4 w-4 text-blue-500 fill-blue-500" />
            Học lập trình không còn khó khăn
          </div>

          <h1 className="max-w-4xl text-slate-900 text-4xl md:text-6xl font-extrabold tracking-tight">
            Chấm dứt việc học <span className="text-blue-600">lan man</span>. <br />
            Xây dựng nền tảng vững chắc.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
            EduAI không giúp bạn trở thành 'siêu nhân' ngay lập tức. Chúng mình giúp bạn hiểu bản chất, vững cơ bản và biết chính xác mình cần làm gì tiếp theo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-none border-none" asChild>
              <Link to="/dang-ky">
                Bắt đầu lộ trình của bạn
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-200 hover:bg-slate-50 shadow-none" asChild>
              <Link to="/#features">
                Tìm hiểu thêm
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vision & Pain Points */}
      <section id="features" className="py-20 bg-white">
        <div className="container space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                Giải quyết nỗi đau mang tên "không biết bắt đầu từ đâu"
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Thế giới lập trình quá rộng lớn. Newbie thường bị ngợp bởi hàng nghìn công nghệ. EduAI lọc bỏ những thứ rườm rà, chỉ giữ lại những gì thực sự quan trọng để bạn bớt "loạn".
              </p>
              <ul className="space-y-4">
                {[
                  "Lộ trình tinh gọn cho Frontend, Backend, Data",
                  "Lý thuyết cặn kẽ kèm video thực tế",
                  "Cộng cụ phân tích lỗi sai bằng AI"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 aspect-square flex items-center justify-center">
              <div className="w-full space-y-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm animate-pulse-slow">
                  <div className="h-3 w-32 bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm ml-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">AI</div>
                    <div className="h-3 w-40 bg-slate-100 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded mb-2" />
                  <div className="h-2 w-3/4 bg-slate-50 rounded" />
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm animate-pulse-slow delay-150">
                  <div className="h-3 w-28 bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-slate-100">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transition Focus */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="container relative z-10 flex flex-col items-center text-center gap-8">
          <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
            Chúng mình là bước đệm đầu tiên.
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
            Sau khi hoàn thành lộ trình tại EduAI, bạn sẽ sẵn sàng để chinh phục <strong>LeetCode</strong>, đọc source code trên <strong>GitHub</strong> và tự tin bắt đầu các dự án cá nhân.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-xl"><Github className="h-6 w-6" /> GitHub</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Terminal className="h-6 w-6" /> LeetCode</div>
            <div className="flex items-center gap-2 font-bold text-xl"><GitBranch className="h-6 w-6" /> Git Flow</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-bold text-slate-900">Bắt đầu hành trình của bạn ngay.</h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            Gia nhập cộng đồng lập trình viên tự học, có định hướng và không bao giờ bỏ cuộc.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 border-none transition-transform hover:scale-105 active:scale-95" asChild>
            <Link to="/dang-ky">
              Tạo tài khoản miễn phí
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

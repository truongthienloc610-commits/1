import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import {
  Target, FileText, Bot, BookOpen, Heart, Compass,
  CheckCircle2, Star, ArrowRight,
} from "lucide-react";

const features = [
  { icon: Target, title: "Lộ trình AI", desc: "AI tạo kế hoạch học tập riêng, phù hợp trình độ và mục tiêu của bạn." },
  { icon: FileText, title: "Luyện đề thông minh", desc: "Tạo đề tuỳ chỉnh, AI chấm bài và phân tích điểm yếu chi tiết." },
  { icon: Bot, title: "Trợ lý AI 24/7", desc: "Hỏi bài bất kỳ lúc nào, AI giải thích từng bước dễ hiểu." },
  { icon: BookOpen, title: "Tóm tắt tài liệu", desc: "Upload PDF, AI tóm tắt, tạo flashcard và câu hỏi tự động." },
  { icon: Heart, title: "Sức khoẻ tinh thần", desc: "Theo dõi thời gian học, nhắc nghỉ ngơi, giữ cân bằng." },
  { icon: Compass, title: "Hướng nghiệp", desc: "Trắc nghiệm MBTI, gợi ý nghề nghiệp và kỹ năng cần phát triển." },
];

const testimonials = [
  { name: "Minh Anh", grade: "Lớp 10", quote: "Mình học Toán tiến bộ rõ rệt nhờ AI phân tích lỗi sai!" },
  { name: "Đức Huy", grade: "Lớp 12", quote: "Luyện đề ôn thi THPT cực tiện, đỡ phải tìm đề khắp nơi." },
  { name: "Thu Hà", grade: "Lớp 8", quote: "Trợ lý AI giải thích dễ hiểu hơn sách giáo khoa nhiều!" },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container relative py-16 md:py-24 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-body-sm font-medium shadow-sm">
            <Star className="h-4 w-4 text-accent" />
            10,000+ học sinh đang dùng
          </div>

          <h1 className="max-w-2xl">
            Học thông minh hơn với{" "}
            <span className="text-gradient-primary">AI</span>
            {" "}– Dành riêng cho bạn
          </h1>

          <p className="text-body text-muted-foreground max-w-lg">
            Lộ trình cá nhân hoá, luyện đề thông minh, trợ lý AI 24/7. Tất cả trong một nền tảng dành cho học sinh lớp 6–12.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button variant="hero" size="xl" asChild>
              <Link to="/dang-ky">
                Bắt đầu miễn phí
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/gia">Xem bảng giá</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 bg-muted/30">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <h2>Tính năng nổi bật</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Mọi thứ bạn cần để học tập hiệu quả hơn mỗi ngày.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-body-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-20">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <h2>Học sinh nói gì?</h2>
            <p className="text-muted-foreground">Những chia sẻ từ bạn bè đang dùng HọcAI.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-body-sm mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-body-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold">{t.name}</p>
                    <p className="text-caption text-muted-foreground">{t.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container text-center space-y-5">
          <h2>Sẵn sàng học thông minh hơn?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Đăng ký miễn phí và bắt đầu lộ trình học tập cá nhân hoá ngay hôm nay.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/dang-ky">
              Đăng ký ngay
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <div className="flex items-center justify-center gap-4 text-body-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Miễn phí</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Không cần thẻ</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Huỷ bất kỳ lúc nào</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

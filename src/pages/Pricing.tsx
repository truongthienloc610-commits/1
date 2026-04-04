import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { CheckCircle2, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Miễn phí",
    price: { month: "0đ", year: "0đ" },
    desc: "Bắt đầu khám phá",
    cta: "Bắt đầu miễn phí",
    popular: false,
    features: [
      { text: "5 bài luyện tập / ngày", included: true },
      { text: "Lộ trình cơ bản", included: true },
      { text: "AI trợ lý (giới hạn)", included: true },
      { text: "Tóm tắt PDF AI", included: false },
      { text: "Hướng nghiệp MBTI", included: false },
      { text: "Ưu tiên hỗ trợ", included: false },
    ],
  },
  {
    name: "Pro",
    price: { month: "99.000đ", year: "79.000đ" },
    desc: "Dành cho bạn nghiêm túc",
    cta: "Nâng cấp Pro",
    popular: true,
    features: [
      { text: "Không giới hạn bài luyện", included: true },
      { text: "Lộ trình AI cá nhân hoá", included: true },
      { text: "AI trợ lý không giới hạn", included: true },
      { text: "Tóm tắt PDF AI", included: true },
      { text: "Hướng nghiệp MBTI", included: false },
      { text: "Ưu tiên hỗ trợ", included: false },
    ],
  },
  {
    name: "Premium",
    price: { month: "199.000đ", year: "159.000đ" },
    desc: "Trọn bộ tính năng",
    cta: "Nâng cấp Premium",
    popular: false,
    features: [
      { text: "Không giới hạn bài luyện", included: true },
      { text: "Lộ trình AI cá nhân hoá", included: true },
      { text: "AI trợ lý không giới hạn", included: true },
      { text: "Tóm tắt PDF AI", included: true },
      { text: "Hướng nghiệp MBTI", included: true },
      { text: "Ưu tiên hỗ trợ", included: true },
    ],
  },
];

const faqs = [
  { q: "Tôi có thể dùng thử miễn phí không?", a: "Có! Gói Miễn phí cho phép bạn trải nghiệm các tính năng cơ bản mà không cần nhập thẻ thanh toán." },
  { q: "Có thể huỷ gói bất kỳ lúc nào không?", a: "Hoàn toàn có thể. Bạn có thể huỷ gói trả phí bất kỳ lúc nào và tiếp tục dùng đến hết chu kỳ." },
  { q: "Thanh toán như thế nào?", a: "Chúng mình hỗ trợ thanh toán qua Momo, ZaloPay, chuyển khoản ngân hàng và thẻ quốc tế." },
  { q: "Gói Pro và Premium khác gì nhau?", a: "Premium bao gồm tất cả tính năng của Pro, cộng thêm Hướng nghiệp MBTI và ưu tiên hỗ trợ kỹ thuật." },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <section className="py-16 md:py-20">
        <div className="container space-y-10">
          <div className="text-center space-y-4">
            <h1>Chọn gói phù hợp với bạn</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bắt đầu miễn phí, nâng cấp khi bạn cần thêm tính năng.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
                  !yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
                  yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Năm <span className="text-secondary font-semibold">-20%</span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-lg p-6 border flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
                    : "border-border/50 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-caption font-semibold px-3 py-1 rounded-full">
                    Phổ biến nhất
                  </div>
                )}

                <div className="space-y-1 mb-5">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-caption text-muted-foreground">{plan.desc}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold">
                    {yearly ? plan.price.year : plan.price.month}
                  </span>
                  {plan.price.month !== "0đ" && (
                    <span className="text-body-sm text-muted-foreground"> / tháng</span>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-body-sm">
                      {f.included ? (
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/60"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to={`/dang-ky?plan=${plan.name.toLowerCase()}`}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-2xl space-y-8">
          <h2 className="text-center">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg border px-5">
                <AccordionTrigger className="text-body-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-body-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

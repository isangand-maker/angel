import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import { CheckCircle2, User, FileText, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_ADMISSION = {
  target: "6세 미만의 영유아를 양육하는 한부모 (모자가정)",
  period: "3년 이내 (입소기간 연장기준에 부합할 경우 6개월 단위로 연장하여 최대 4년 가능)",
  documents: ["입소 신청서 (기관방문 작성)", "주민등록등본", "가족관계증명서", "혼인관계증명서", "한부모가족증명서"],
};

export default function Admission() {
  const { data: settings } = useSiteSettings();
  const admissionInfo = { ...DEFAULT_ADMISSION, ...(settings?.admission_info ?? {}) };

  const steps = [
    { num: "01", title: "시설입소문의", desc: "전화(031-864-2004)로 입소 가능 여부와 절차를 문의합니다." },
    { num: "02", title: "내방상담", desc: "기관을 방문하여 담당 사회복지사와 상담을 진행합니다." },
    { num: "03", title: "서류작성 및 제출", desc: "입소에 필요한 서류를 작성하여 제출합니다." },
    { num: "04", title: "입소심사", desc: "제출된 서류와 상담 내용을 바탕으로 입소 심사를 진행합니다." },
    { num: "05", title: "입소", desc: "심사가 완료되면 입소하여 안정적인 생활을 시작합니다." }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="입소 안내"
        breadcrumb={[{ name: "입소안내", href: "/admission" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">

          {/* Eligibility Section */}
          <section className="mb-24">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border/50">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-6">
                  <User size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">입소 대상</h2>
                <p className="text-lg text-foreground/80 leading-relaxed">{admissionInfo.target}</p>
              </div>
              <div className="bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border/50">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">입소 기간</h2>
                <p className="text-lg text-foreground/80 leading-relaxed">{admissionInfo.period}</p>
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-12 text-center">입소 절차</h2>
            <div className="grid md:grid-cols-5 gap-4 relative">
              <div className="hidden md:block absolute top-10 left-0 right-0 h-px bg-border z-0"></div>
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative z-10 text-center bg-background"
                >
                  <div className="w-20 h-20 mx-auto bg-white border-4 border-secondary rounded-full flex items-center justify-center shadow-sm mb-6">
                    <span className="text-xl font-bold text-primary">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Documents Section */}
          <section className="mb-24 bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <FileText className="text-primary" size={32} />
              <h2 className="text-2xl font-bold">입소 서류</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {admissionInfo.documents.map((doc: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-lg text-foreground/80">
                  <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          {/* Provided Support Section */}
          <section className="mb-24 text-center">
            <h2 className="text-3xl font-bold mb-6">지원 서비스</h2>
            <p className="text-lg text-muted-foreground mb-8">
              생활지원, 상담지원, 양육지원, 교육 및 정서문화지원, 자립지원, 의료지원까지 단계별 맞춤형 지원을 제공합니다.
            </p>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-lg">
              <Link href="/programs">지원서비스 자세히 보기</Link>
            </Button>
          </section>

          <div className="mt-20 text-center">
            <p className="text-lg mb-6 text-muted-foreground">더 궁금한 점이 있으신가요? 언제든 연락주세요.</p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-lg">
                <Link href="/faq">자주 하는 질문 보기</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-8 text-lg bg-foreground text-background">
                <Link href="/counsel">상담 신청하기</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/counsel/lookup">
                  <Search size={18} className="mr-1.5" /> 상담 조회
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

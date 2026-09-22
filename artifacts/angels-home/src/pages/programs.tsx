import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import { Home, MessageCircle, Baby, GraduationCap, Briefcase, Stethoscope } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-data";

const ICONS = [Home, MessageCircle, Baby, GraduationCap, Briefcase, Stethoscope];

const DEFAULT_SERVICES = [
  {
    title: "생활지원",
    desc: "서로를 존중하고 배려하는 공동체 안에서 안정적인 생활을 이어갈 수 있도록 일상 전반을 지원합니다. 건강한 생활 습관을 형성하고, 행복한 공동체 문화를 만들어갈 수 있도록 함께합니다.",
    items: ["의·식·주 지원", "일상생활 교육", "생일 등 기념행사 지원"],
  },
  {
    title: "상담지원",
    desc: "개별상담과 집단상담, 심리치료 프로그램을 통해 심리적 안정과 정서적 회복을 지원합니다. 자신을 이해하고 긍정적인 관계를 형성하며 건강한 가족으로 성장할 수 있도록 함께합니다.",
    items: ["전문심리검사", "개별상담", "집단상담"],
  },
  {
    title: "양육지원",
    desc: "엄마와 아이가 건강하고 행복하게 성장할 수 있도록 출산부터 영유아 양육까지 단계별 맞춤형 지원을 제공합니다. 부모의 양육 역량을 강화하고 안정적인 양육환경을 조성하여 건강한 가족의 성장을 함께합니다.",
    items: ["출산 및 양육용품 지원", "신생아 돌봄 및 양육코칭", "단계별 개별 양육지도", "백일·돌 축하행사", "성장앨범(백일) 촬영 지원", "아이돌봄서비스 연계 및 지원"],
  },
  {
    title: "교육 및 정서문화지원",
    desc: "다양한 교육과 문화·체험활동을 통해 건강한 부모 역할과 사회적 역량을 키우고, 가족 간 유대감을 높이며 행복한 일상을 만들어갈 수 있도록 지원합니다.",
    items: ["인권·성·아동학대예방·부모·자립 및 경제·안전교육", "문화공연 관람", "가족 나들이", "계절 캠프"],
  },
  {
    title: "자립지원",
    desc: "안정적인 사회구성원으로 성장할 수 있도록 자립역량 강화와 취업 지원 프로그램을 운영합니다. 경제적 자립 기반을 마련하고 성공적인 사회정착을 위한 맞춤형 지원을 제공합니다.",
    items: ["자격증 취득 지원", "취업박람회 참여", "취업역량 강화 교육", "면접 준비 및 취업 컨설팅", "만기퇴소 자립계획 수립", "만기퇴소 자립축하금 지원"],
  },
  {
    title: "의료지원",
    desc: "안전한 임신과 출산, 그리고 산후 회복까지 체계적인 의료서비스를 받을 수 있도록 지원합니다. 산모와 영유아의 맞춤형 의료지원과 교육을 제공하고, 지속적인 건강관리를 통해 행복한 일상을 이어갈 수 있도록 지원합니다.",
    items: ["산전 정기검진 및 병원 진료 지원", "임신·출산 건강상담", "분만 준비교육", "산후 건강관리 및 병원 진료 지원", "산후조리 및 회복 지원", "영유아 건강관리 및 검진 연계", "응급상황 발생 시 의료기관 연계"],
  },
];

export default function Programs() {
  const { data: settings } = useSiteSettings();
  const services = settings?.support_services && settings.support_services.length > 0
    ? settings.support_services
    : DEFAULT_SERVICES;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="지원서비스"
        breadcrumb={[{ name: "지원서비스", href: "/programs" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">

          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold mb-6">맞춤형 통합 지원 서비스</h2>
            <p className="text-lg text-muted-foreground">
              경기도 천사의집은 생활, 상담, 양육, 교육, 자립, 의료까지 위기임산부와 한부모가족이
              <br />
              안정적으로 자립할 수 있도록 단계별 맞춤형 지원 서비스를 운영하고 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service: { title: string; desc: string; items: string[] }, idx: number) => {
              const Icon = ICONS[idx % ICONS.length]!;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 2) * 0.1 }}
                  className="bg-white rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.items.map((item, i) => (
                      <span key={i} className="text-sm font-medium bg-secondary/60 text-foreground/80 px-3 py-1.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

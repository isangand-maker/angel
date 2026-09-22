import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Users } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_VOLUNTEER_GROUPS = [
  {
    category: "생활지원",
    items: [
      { name: "아이돌봄 지원", desc: "입소 어머니들의 양육 부담을 경감하기 위한 영유아 돌봄 및 놀이 활동 지원", schedule: "수시" },
      { name: "생활환경지원", desc: "생활관 정리, 청소 및 쾌적한 생활환경 조성을 위한 지원", schedule: "월 1회 이상" },
      { name: "물품 및 후원 지원", desc: "입소가정 및 아동을 위한 생활용품, 육아용품 등 물품 정리 및 지원", schedule: "필요 시" },
      { name: "차량지원", desc: "병원 진료, 프로그램 이동 등 입소자 이동 지원", schedule: "필요 시" },
    ],
  },
  {
    category: "교육",
    items: [
      { name: "학습지원", desc: "학습지도, 독서지도 및 교육 활동 지원", schedule: "수시" },
      { name: "재능기부", desc: "미술, 음악, 공예, 요리 등 개인의 재능을 활용한 프로그램 운영 지원", schedule: "수시" },
    ],
  },
  {
    category: "프로그램",
    items: [
      { name: "정서지원 프로그램", desc: "입소자 및 아동 대상 상담, 문화활동, 정서지원 프로그램 보조 지원", schedule: "수시" },
      { name: "문화체험 활동", desc: "나들이, 체험활동, 행사 참여 지원", schedule: "행사 시" },
      { name: "가족지원 프로그램", desc: "가족관계 향상을 위한 체험활동 및 프로그램 운영 지원", schedule: "행사 시" },
    ],
  },
  {
    category: "시설지원",
    items: [
      { name: "시설 환경개선", desc: "시설 내·외부 정리, 환경미화 및 시설 관리 지원", schedule: "필요 시" },
    ],
  },
];

const DEFAULT_CONTACT = { phone: "031-864-2004" };

export default function SupportVolunteer() {
  const { data: settings } = useSiteSettings();
  const contact = { ...DEFAULT_CONTACT, ...(settings?.footer_contact ?? {}) };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="자원봉사안내"
        breadcrumb={[{ name: "후원 및 자원봉사", href: "/support/info" }, { name: "자원봉사안내", href: "/support/volunteer" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2"><Users className="text-primary" /> 자원봉사 안내</h3>
          <div className="space-y-10">
            {DEFAULT_VOLUNTEER_GROUPS.map((group, gIdx) => (
              <div key={gIdx}>
                <h4 className="text-lg font-bold mb-4 text-primary">{group.category}</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-border/50 hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="font-bold text-foreground">{item.name}</h5>
                        <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{item.schedule}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-secondary/30 rounded-3xl p-10 max-w-xl mx-auto">
            <p className="text-muted-foreground mb-2">자원봉사를 희망하시는 분은 아래 번호로 문의해 주세요.</p>
            <p className="text-2xl font-bold text-primary">{contact.phone}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

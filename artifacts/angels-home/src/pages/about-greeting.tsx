import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_GREETING = {
  quote: "섬김과 나눔으로 희망을 이어갑니다.",
  content:
    "경기도 천사의집 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.\n\n" +
    "경기도 천사의집은 2004년부터 한부모가족과 함께하며 새로운 시작을 응원해 왔습니다. 현재는 양육지원시설과 위기임산부 지역상담기관을 운영하며, 위기임산부와 자립을 준비하는 한부모가족의 곁을 지키고 있습니다.\n\n" +
    "편안한 마음으로 자신의 이야기를 나누고, 희망을 만들어 갈 수 있는 든든한 공간이 되고자 합니다.\n\n" +
    "변함없는 마음으로 도움이 필요한 분들의 곁을 지키며 신뢰받는 기관이 되겠습니다.\n\n" +
    "감사합니다.",
  signatureTitle: "직원 일동",
  signatureName: "",
};

export default function AboutGreeting() {
  const { data: settings } = useSiteSettings();
  const greeting = { ...DEFAULT_GREETING, ...(settings?.greeting_page ?? {}) };
  const paragraphs = greeting.content.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="인사말"
        breadcrumb={[{ name: "기관소개", href: "/about/intro" }, { name: "인사말", href: "/about/greeting" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none text-foreground/80 leading-loose space-y-8"
          >
            <div className="text-2xl font-semibold text-foreground mb-8">"{greeting.quote}"</div>
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}

            <div className="mt-16 pt-8 border-t border-border/50 text-right">
              <div className="text-xl font-bold text-foreground">
                경기도 천사의집 {greeting.signatureTitle}
                {greeting.signatureName && <span className="text-2xl ml-2">{greeting.signatureName}</span>}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

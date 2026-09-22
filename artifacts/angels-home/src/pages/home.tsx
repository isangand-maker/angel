import React from "react";
import { motion } from "framer-motion";
import { Phone, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PopupBanner } from "@/components/layout/PopupBanner";
import { InfoBoard } from "@/components/InfoBoard";
import { useSiteSettings, useFacilityPhotos } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center text-sm font-bold tracking-[0.2em] uppercase text-primary mb-4">
    {children}
  </div>
);

const DEFAULT_HERO = {
  badge: "한부모 가족복지시설",
  titleLine1: "혼자가 아닙니다.",
  titleHighlight: "당신과 아기의",
  titleLine3: "안전한 쉼터",
  description: "양육과 자립을 위한 든든한 울타리",
  heroImage: "/images/hero.png",
};

const Hero = () => {
  const { data: settings } = useSiteSettings();
  const hero = { ...DEFAULT_HERO, ...(settings?.home_hero ?? {}) };

  return (
    <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden bg-gradient-to-b from-secondary/60 via-secondary/20 to-white">
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[520px] h-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[560px] h-[560px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-14 lg:gap-24">
        <motion.div
          className="flex-1 text-center md:text-left z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-semibold mb-5">
            {hero.badge}
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight mb-6 text-foreground">
            {hero.titleLine1}<br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-primary">{hero.titleHighlight}</span>
            </span>
            {hero.titleLine3 && <><br />{hero.titleLine3}</>}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
            {hero.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-all w-full sm:w-auto shadow-lg shadow-primary/25">
              <Link href="/counsel">상담하기</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2 border-border hover:border-primary hover:text-primary w-full sm:w-auto transition-colors">
              <Link href="/admission">시설 입소 안내</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 relative w-full max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-primary/10">
            <img
              src={resolveImageUrl(hero.heroImage) || hero.heroImage}
              alt="따뜻한 손길"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface FacilityPhoto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const Services = () => {
  const { data: photos } = useFacilityPhotos();
  const list: FacilityPhoto[] = (photos ?? []).slice(0, 6);

  return (
    <section id="services" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16">
          <Eyebrow>Our Care</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            엄마와 아기를 위한<br />
            <span className="text-primary">시설 둘러보기</span>
          </h2>
        </div>

        {list.length === 0 ? (
          <p className="text-center text-muted-foreground">등록된 시설 사진이 없습니다.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((fac, idx) => (
              <motion.div
                key={fac.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.1, 0.6) }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50 group hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={resolveImageUrl(fac.imageUrl)}
                    alt={fac.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold">{fac.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-lg">
            <Link href="/about/facilities">시설 둘러보기 더 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Impact = () => {
  const stats = [
    { value: "26년", label: "운영 기간" },
    { value: "3,800+", label: "보호 임산부" },
    { value: "1,500+", label: "자립 성공 가구" },
    { value: "12,000+", label: "후원자 수" },
  ];

  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 md:mb-20 leading-tight">
          여러분의 사랑으로<br />만들어낸 기적
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center divide-primary-foreground/15">
          {stats.map((stat, i) => (
            <div key={i} className="md:border-l md:first:border-l-0 md:border-primary-foreground/15 md:px-4">
              <div className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">{stat.value}</div>
              <div className="text-base md:text-lg font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Support = () => {
  const supportImage = resolveImageUrl("/uploads/support-nurturing-illustration.png");
  const options = [
    { title: "정기 후원", desc: "매월 일정한 금액으로 지속적인 희망을 선물합니다." },
    { title: "일시 후원", desc: "원하시는 금액을 한 번에 후원하실 수 있습니다." },
    { title: "물품 후원 / 봉사활동", desc: "신생아 용품, 생필품 후원 및 재능 기부" },
  ];

  return (
    <section id="support" className="py-12 md:py-16 bg-secondary/30 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-xl shadow-primary/10">
              <img src={supportImage} alt="후원 안내" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:w-1/2">
            <Eyebrow>Support</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">작은 나눔이<br />큰 희망이 됩니다</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              여러분의 후원금은 한부모가족의 자립과 아기들의 건강한 성장을 위해
              투명하게 사용됩니다.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {options.map((opt, i) => (
                <Link
                  key={i}
                  href="/support"
                  className="block bg-white p-6 rounded-2xl border border-border flex items-center justify-between hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
                >
                  <div>
                    <h4 className="text-xl font-bold mb-1">{opt.title}</h4>
                    <p className="text-muted-foreground text-sm">{opt.desc}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 ml-4">
                    <ChevronRight />
                  </div>
                </Link>
              ))}
            </div>

            <Button asChild size="lg" className="rounded-full w-full py-8 text-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Link href="/support">지금 후원하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const DEFAULT_CONTACT = {
  phone: "031-864-2004",
  address: "(11343) 경기도 동두천시 생연로 39-74",
};

const Contact = () => {
  const { data: settings } = useSiteSettings();
  const contact = { ...DEFAULT_CONTACT, ...(settings?.footer_contact ?? {}) };

  return (
    <section id="contact" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-secondary/40 rounded-[3rem] p-8 md:p-16 ring-1 ring-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">도움이 필요하신가요?</h2>
            <p className="text-lg text-muted-foreground">
              비밀은 절대 보장됩니다.
              <br />
              언제든 연락주세요.
            </p>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-center">
            <Link href="/counsel" className="flex-1 bg-white p-8 rounded-3xl text-center flex flex-col items-center border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone size={28} className="text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-muted-foreground mb-2">입소/상담 문의</h3>
              <div className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">{contact.phone}</div>
            </Link>

            <Link href="/about/directions" className="flex-1 bg-white p-8 rounded-3xl text-center flex flex-col items-center border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={28} className="text-background" />
              </div>
              <h3 className="text-base font-semibold text-muted-foreground mb-2">오시는 길</h3>
              {(() => {
                const match = contact.address.match(/^(\(\d+\))\s*(.*)$/);
                const zip = match?.[1];
                const rest = match?.[2] ?? contact.address;
                return (
                  <>
                    {zip && <div className="text-sm text-muted-foreground mb-1">{zip}</div>}
                    <div className="text-lg md:text-xl font-bold text-foreground mb-2 whitespace-nowrap">{rest}</div>
                  </>
                );
              })()}
              <p className="text-sm text-muted-foreground">프라이버시 보호를 위해 방문 전 꼭 연락 바랍니다.</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <PopupBanner />
      <Navbar />
      <main>
        <Hero />
        <InfoBoard />
        <Services />
        {/* <Impact /> — 통계 수치가 실제 데이터가 아니라 임시로 주석처리 */}
        <Support />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { adminApi } from "@/lib/admin-api";
import { HeroSection } from "./sections/HeroSection";
import { MissionSection } from "./sections/MissionSection";
import { FoundingSection } from "./sections/FoundingSection";
import { GreetingSection } from "./sections/GreetingSection";
import { OrgChartSection } from "./sections/OrgChartSection";
import { AdmissionInfoSection } from "./sections/AdmissionInfoSection";
import { SupportServicesSection } from "./sections/SupportServicesSection";
import { ContactSection } from "./sections/ContactSection";
import { PopupSection } from "./sections/PopupSection";
import { FacilityPhotosSection } from "./sections/FacilityPhotosSection";
import { PartnersSection } from "./sections/PartnersSection";
import { NoticesSection } from "./sections/NoticesSection";
import { FaqSection } from "./sections/FaqSection";
import { GallerySection } from "./sections/GallerySection";
import { CalendarEventsSection } from "./sections/CalendarEventsSection";
import { DonationNewsSection } from "./sections/DonationNewsSection";
import { ChildcareSharesSection } from "./sections/ChildcareSharesSection";
import { DonationInfoSection } from "./sections/DonationInfoSection";
import { InquiriesSection } from "./sections/InquiriesSection";
import { AdminAccountsSection } from "./sections/AdminAccountsSection";
import { PushSection } from "./sections/PushSection";
import { Loader2, ExternalLink } from "lucide-react";

interface NavGroup {
  label: string;
  items: { key: string; label: string }[];
}

const NAV: NavGroup[] = [
  {
    label: "콘텐츠 관리",
    items: [
      { key: "hero", label: "홈 문구" },
      { key: "greeting", label: "인사말" },
      { key: "founding", label: "설립 이야기/핵심가치" },
      { key: "mission", label: "소개 (미션/비전)" },
      { key: "orgchart", label: "조직도" },
      { key: "admission-info", label: "입소 안내" },
      { key: "support-services", label: "지원서비스" },
      { key: "facilities", label: "시설 사진" },
      { key: "popup", label: "팝업 배너" },
      { key: "partners", label: "함께하는 기관" },
      { key: "donation-info", label: "후원 계좌 정보" },
      { key: "contact", label: "연락처/푸터" },
    ],
  },
  {
    label: "게시판 관리",
    items: [
      { key: "notices", label: "공지사항" },
      { key: "faq", label: "자주하는 질문" },
      { key: "gallery", label: "갤러리" },
      { key: "calendar", label: "일정표" },
      { key: "donation-news", label: "후원소식" },
      { key: "childcare", label: "육아나눔정보" },
    ],
  },
  {
    label: "신청 관리",
    items: [
      { key: "inquiry-counsel", label: "상담 신청" },
      { key: "inquiry-donation", label: "후원 신청" },
      { key: "inquiry-volunteer", label: "자원봉사 신청" },
    ],
  },
  {
    label: "시스템",
    items: [
      { key: "accounts", label: "관리자 계정" },
      { key: "push", label: "푸시 알림 발송" },
    ],
  },
];

export default function AdminDashboard() {
  const { username, loading, logout } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    if (!loading && !username) {
      setLocation("/admin/login");
    }
  }, [loading, username, setLocation]);

  useEffect(() => {
    if (username && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: "admin-login", username }));
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      adminApi.getSettings().then(setSettings);
    }
  }, [username]);

  if (loading || !username || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  const activeLabel = NAV.flatMap((g) => g.items).find((i) => i.key === active)?.label ?? "";

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      <aside className="w-64 shrink-0 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="font-bold leading-tight">경기도 천사의집</h1>
          <p className="text-xs text-muted-foreground">관리자</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-6 mb-2 text-xs font-semibold text-muted-foreground tracking-wide">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={cn(
                    "w-full text-left px-6 py-2.5 text-sm font-medium transition-colors",
                    active === item.key
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-foreground/70 hover:bg-secondary/60",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <p className="px-2 text-xs text-muted-foreground">{username}님으로 로그인됨</p>
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ExternalLink size={14} className="mr-1.5" /> 사이트 보기
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={async () => {
              await logout();
              setLocation("/admin/login");
            }}
          >
            로그아웃
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-border px-10 py-5">
          <h2 className="text-lg font-bold">{activeLabel}</h2>
        </header>
        <div className="p-10">
          <div className="bg-white rounded-3xl border border-border/60 p-8">
            {active === "hero" && <HeroSection initial={settings.home_hero ?? {}} />}
            {active === "greeting" && <GreetingSection initial={settings.greeting_page ?? {}} />}
            {active === "founding" && <FoundingSection initial={settings.org_founding ?? {}} />}
            {active === "mission" && <MissionSection initial={settings.about_mission ?? {}} />}
            {active === "orgchart" && <OrgChartSection initial={settings.org_chart ?? {}} />}
            {active === "admission-info" && <AdmissionInfoSection initial={settings.admission_info ?? {}} />}
            {active === "support-services" && <SupportServicesSection initial={settings.support_services ?? []} />}
            {active === "facilities" && <FacilityPhotosSection />}
            {active === "popup" && <PopupSection />}
            {active === "partners" && <PartnersSection />}
            {active === "donation-info" && <DonationInfoSection initial={settings.donation_info ?? {}} />}
            {active === "contact" && <ContactSection initial={settings.footer_contact ?? {}} />}
            {active === "notices" && <NoticesSection />}
            {active === "faq" && <FaqSection />}
            {active === "gallery" && <GallerySection />}
            {active === "calendar" && <CalendarEventsSection />}
            {active === "donation-news" && <DonationNewsSection />}
            {active === "childcare" && <ChildcareSharesSection />}
            {active === "inquiry-counsel" && <InquiriesSection type="counsel" />}
            {active === "inquiry-donation" && <InquiriesSection type="donation" />}
            {active === "inquiry-volunteer" && <InquiriesSection type="volunteer" />}
            {active === "accounts" && <AdminAccountsSection />}
            {active === "push" && <PushSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

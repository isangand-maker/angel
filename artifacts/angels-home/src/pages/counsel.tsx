import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import { Phone, MessageSquare, Shield, Search } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConsentDialog } from "@/components/ConsentDialog";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { useSiteSettings } from "@/lib/use-site-data";

const CONSENT_INTRO =
  "경기도 천사의집은 온라인 입소상담 신청 및 상담 서비스 제공을 위하여 「개인정보 보호법」 등 관련 법령에 따라 아래와 같이 개인정보를 수집·이용합니다. 내용을 충분히 확인하신 후 동의 여부를 선택하여 주시기 바랍니다.";

const CONSENT_STEPS = [
  {
    stepTitle: "1. 개인정보 수집·이용 동의",
    sections: [
      {
        heading: "수집·이용 목적",
        body: "온라인 입소상담 신청 접수 및 상담 진행\n입소 가능 여부 검토 및 상담 결과 안내\n상담 관련 연락 및 민원 처리\n상담 이력 관리 및 서비스 제공",
      },
      {
        heading: "수집하는 개인정보 항목",
        body: "필수항목: 성명, 휴대전화번호\n선택항목: 이메일 주소, 기타 신청자가 상담을 위해 직접 작성하거나 첨부한 내용",
      },
      {
        heading: "보유 및 이용기간",
        body: "수집된 개인정보는 상담 종료일로부터 5년간 보관한 후 지체 없이 파기합니다. 다만, 관계 법령에 따라 보존이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관합니다.",
      },
      {
        heading: "동의 거부 권리 및 불이익",
        body: "개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 개인정보 수집·이용에 동의하지 않을 경우 온라인 입소상담 신청 및 상담 서비스 이용이 제한될 수 있습니다.",
      },
    ],
    checkboxLabel: "개인정보 수집·이용에 동의합니다.",
  },
  {
    stepTitle: "2. 민감정보 처리 동의",
    intro: "온라인 입소상담 과정에서 상담 내용에 따라 임신·출산 관련 정보, 건강 상태, 가족관계, 경제적 상황 등 민감정보가 포함될 수 있습니다.",
    sections: [
      {
        heading: "처리 목적",
        body: "입소상담 및 사례관리\n맞춤형 상담 및 복지서비스 연계\n입소 가능 여부 검토",
      },
      {
        heading: "처리하는 민감정보",
        body: "임신 및 출산 관련 정보\n건강 상태\n가족관계 및 양육 상황\n경제적 어려움 및 상담 내용 등 신청자가 직접 제공한 정보",
      },
      {
        heading: "보유 및 이용기간",
        body: "민감정보는 상담 종료일로부터 5년간 보관한 후 지체 없이 파기합니다. 다만, 관계 법령에 따라 보존이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관합니다.",
      },
      {
        heading: "동의 거부 권리 및 불이익",
        body: "민감정보 처리에 동의하지 않을 권리가 있습니다. 다만, 민감정보 처리가 필요한 상담의 특성상 동의하지 않을 경우 온라인 입소상담 및 입소 심사가 제한될 수 있습니다.",
      },
    ],
    checkboxLabel: "민감정보 처리에 동의합니다.",
  },
  {
    stepTitle: "3. 개인정보 처리방침 확인",
    sections: [
      {
        body: "경기도 천사의집은 「개인정보 보호법」에 따라 이용자의 개인정보를 안전하게 관리하며, 개인정보 처리에 관한 자세한 사항은 개인정보 처리방침을 통해 확인하실 수 있습니다.",
      },
    ],
    checkboxLabel: "개인정보 처리방침을 확인하였습니다.",
  },
];

export default function Counsel() {
  const { data: settings } = useSiteSettings();
  const phone = settings?.footer_contact?.phone ?? "031-864-2004";
  const [form, setForm] = useState({ title: "", name: "", phone: "", email: "", content: "", password: "", passwordConfirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [consented, setConsented] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 4) {
      toast.error("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.submitInquiry({
        type: "counsel",
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.content,
        password: form.password,
        details: { 제목: form.title },
      });
      toast.success("상담 신청이 접수되었습니다.", {
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      setForm({ title: "", name: "", phone: "", email: "", content: "", password: "", passwordConfirm: "" });
    } catch (err) {
      toast.error("접수 중 문제가 발생했습니다.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="상담 안내"
        breadcrumb={[{ name: "상담안내", href: "/counsel" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">

          {/* Top Banners */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="bg-primary text-primary-foreground rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <Phone size={48} className="mb-6 text-white" />
              <h2 className="text-2xl font-bold mb-2">긴급 전화 상담</h2>
              <p className="text-white/80 mb-6">언제든 연락주시면 친절하게 상담해 드립니다.</p>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight whitespace-nowrap">{phone}</div>
            </div>

            <div className="bg-secondary rounded-[2rem] p-10 flex flex-col items-center justify-center text-center border border-border/50">
              <Shield size={48} className="mb-6 text-primary" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">철저한 비밀 보장</h2>
              <p className="text-muted-foreground text-lg max-w-sm">
                상담 내용은 어떠한 경우에도 외부로 유출되지 않으며, 
                본인의 동의 없이 가족이나 기관에 알려지지 않습니다. 안심하고 상담하세요.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Process */}
            <div className="lg:w-1/3">
              <h3 className="text-2xl font-bold mb-8">상담 절차</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent lg:before:ml-5 lg:before:translate-x-px">
                {[
                  { title: "상담 접수", desc: "전화 또는 온라인으로 상담을 신청합니다." },
                  { title: "전문가 배정", desc: "상황에 맞는 전문 상담사가 배정됩니다." },
                  { title: "심층 상담", desc: "전화/방문을 통해 자세한 상황을 논의합니다." },
                  { title: "지원 연계", desc: "입소 및 필요한 맞춤형 지원을 연계합니다." }
                ].map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active lg:justify-normal lg:odd:flex-row">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary text-primary font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 lg:order-none lg:group-odd:translate-x-0 lg:group-even:translate-x-0">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white border border-border/50 shadow-sm lg:w-[calc(100%-4rem)]">
                      <h4 className="font-bold text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-2/3">
              {!consented ? (
                <ConsentDialog
                  open={!consented}
                  onAgree={() => setConsented(true)}
                  title="온라인 입소상담을 위한 개인정보 수집·이용 동의"
                  intro={CONSENT_INTRO}
                  steps={CONSENT_STEPS}
                />
              ) : (
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-primary" size={28} />
                    <h3 className="text-2xl font-bold">온라인 상담 신청</h3>
                  </div>
                  <Link
                    href="/counsel/lookup"
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shrink-0 rounded-full px-4 py-2"
                  >
                    <Search size={14} /> 상담내역 조회
                  </Link>
                </div>
                <p className="text-muted-foreground mb-8">
                  아래 양식을 작성해 주시면, 확인 후 빠른 시일 내에 기재해주신 연락처로 상담사가 전화를 드립니다.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목 <span className="text-primary">*</span></Label>
                    <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="상담 제목을 입력해 주세요" required className="h-12" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 (또는 가명) <span className="text-primary">*</span></Label>
                      <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="홍길동" required className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처 <span className="text-primary">*</span></Label>
                      <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-1234-5678" required className="h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 (선택)</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="example@email.com" className="h-12" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호 <span className="text-primary">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="상담내역 조회 시 필요합니다"
                        required
                        minLength={4}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm">비밀번호 확인 <span className="text-primary">*</span></Label>
                      <Input
                        id="passwordConfirm"
                        type="password"
                        value={form.passwordConfirm}
                        onChange={(e) => set("passwordConfirm", e.target.value)}
                        required
                        minLength={4}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">상담 내용 <span className="text-primary">*</span></Label>
                    <Textarea
                      id="content"
                      value={form.content}
                      onChange={(e) => set("content", e.target.value)}
                      placeholder="현재의 상황이나 가장 도움이 필요한 부분을 자유롭게 적어주세요."
                      className="min-h-[150px] resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={submitting} className="w-full h-14 text-lg rounded-full">
                    {submitting ? "접수 중..." : "상담 신청 보내기"}
                  </Button>
                </form>
              </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

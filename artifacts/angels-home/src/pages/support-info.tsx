import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Heart, Gift, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_CONTACT = {
  phone: "031-864-2004",
  address: "(11343) 경기도 동두천시 생연로 39-74",
};

export default function SupportInfo() {
  const { data: settings } = useSiteSettings();
  const contact = { ...DEFAULT_CONTACT, ...(settings?.footer_contact ?? {}) };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="후원안내"
        breadcrumb={[{ name: "후원 및 자원봉사", href: "/support/info" }, { name: "후원안내", href: "/support/info" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">작은 나눔, 큰 희망</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              여러분의 후원금은 한부모가족의 자립과 아기들의 건강한 성장을 위해 투명하게 사용됩니다.
            </p>
          </div>

          {/* Donation Types */}
          <section className="mb-32">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2"><Heart className="text-primary" /> 후원 종류</h3>
            <div className="grid md:grid-cols-2 gap-8">

              <div className="bg-white border border-border/50 rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div>
                  <h4 className="text-2xl font-bold mb-4">정기 후원</h4>
                  <p className="text-muted-foreground mb-8 min-h-[60px]">
                    매월 약정하신 금액을 후원하여 경기도 천사의집의 한부모가족 지원사업에 지속적으로 함께하실 수 있습니다.
                  </p>
                </div>
                <Button asChild className="w-full rounded-full bg-primary text-primary-foreground text-lg py-6 group-hover:scale-[1.02] transition-transform">
                  <Link href="/support/apply">후원 신청하러 가기</Link>
                </Button>
              </div>

              <div className="bg-white border border-border/50 rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div>
                  <h4 className="text-2xl font-bold mb-4">일시 후원</h4>
                  <p className="text-muted-foreground mb-8 min-h-[60px]">
                    원하시는 금액을 일시적으로 후원하여 한부모가족 지원사업에 참여하실 수 있습니다.
                  </p>
                </div>
                <Button asChild className="w-full rounded-full bg-primary text-primary-foreground text-lg py-6 group-hover:scale-[1.02] transition-transform">
                  <Link href="/support/apply">후원 신청하러 가기</Link>
                </Button>
              </div>

            </div>
          </section>

          {/* Goods Donation */}
          <section className="mb-16">
            <div className="bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border/50 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary">
                <Gift size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">물품 후원</h3>
                <p className="text-muted-foreground mb-4">
                  임산부용품, 영유아용품(분유, 기저귀, 의류 등), 생필품, 식료품 등 필요한 물품을 후원하실 수 있습니다.
                </p>
                <p className="text-sm font-medium text-foreground/80 bg-white inline-block px-4 py-2 rounded-full shadow-sm">
                  물품 보내실 곳 : {contact.address} 경기도 천사의집
                </p>
              </div>
            </div>
          </section>

          {/* How to Participate */}
          <section className="mb-16">
            <div className="bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border/50 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-primary">
                <Landmark size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">후원 참여 방법</h3>

                <div className="space-y-1">
                  <p className="font-semibold text-foreground">① 무통장 입금(자동이체)</p>
                  <p className="text-muted-foreground">
                    농협 301-0083-5521-71
                    <br />
                    예금주: 경기도 천사의집
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ※ 무통장 입금 후에는 후원자 등록 및 기부금 영수증 발급을 위해 기관으로 연락해 주시기 바랍니다.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-foreground">② CMS 정기후원</p>
                  <p className="text-muted-foreground">
                    홈페이지에서 온라인 후원 신청 시 CMS 출금에 필요한 정보를 입력하시면 정기후원에 참여하실 수 있습니다.
                  </p>
                </div>

                <p className="text-sm font-medium text-foreground/80 bg-white inline-block px-4 py-2 rounded-full shadow-sm">
                  후원 문의 : {contact.phone}
                </p>
              </div>
            </div>
          </section>

          {/* Donation Benefits */}
          <section>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <p className="text-foreground/80">후원금(품)에 대한 기부금 영수증을 발급해 드리며, 관련 법령에 따라 세제 혜택을 받으실 수 있습니다.</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <p className="text-foreground/80">경기도 천사의집의 다양한 소식과 사업 이야기를 담은 반기별 소식지를 받아보실 수 있습니다.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

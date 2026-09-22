import React from "react";
import { Link } from "wouter";
import { Church } from "lucide-react";
import logoUrl from "@assets/logo_angelshome.png";
import { useSiteSettings, usePartners } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

const DEFAULT_CONTACT = {
  orgName: "경기도 천사의집",
  bizRegNo: "127-80-09161",
  address: "(11343) 경기도 동두천시 생연로 39-74",
  phone: "031-864-2004",
  fax: "031-867-2003",
  email: "angel8642004@hanmail.net",
};

export const Footer = () => {
  const { data: settings } = useSiteSettings();
  const { data: partners } = usePartners();
  const contact = { ...DEFAULT_CONTACT, ...(settings?.footer_contact ?? {}) };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div>
            <div className="inline-flex items-center mb-6">
              <img
                src={logoUrl}
                alt="경기도 천사의집 엔젤스홈"
                className="h-14 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-background/60 max-w-sm leading-relaxed">
              한부모가족과 아기들이 차별 없이 존중받고 건강하게
              자립할 수 있도록 함께하는 양육지원시설입니다.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="font-bold mb-6 text-background/90">기관소개</h4>
              <ul className="flex flex-col gap-4 text-background/60">
                <li><Link href="/about/intro" className="hover:text-primary transition-colors">시설 소개</Link></li>
                <li><Link href="/admission" className="hover:text-primary transition-colors">입소 안내</Link></li>
                <li><Link href="/programs" className="hover:text-primary transition-colors">지원서비스</Link></li>
                <li><Link href="/about/directions" className="hover:text-primary transition-colors">찾아오시는 길</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-background/90">참여 및 소통</h4>
              <ul className="flex flex-col gap-4 text-background/60">
                <li><Link href="/support" className="hover:text-primary transition-colors">후원 및 자원봉사</Link></li>
                <li><Link href="/counsel" className="hover:text-primary transition-colors">온라인 상담</Link></li>
                <li><Link href="/community" className="hover:text-primary transition-colors">커뮤니티</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-10 pb-10 mb-2">
          <h4 className="text-sm font-semibold text-background/50 tracking-wide mb-6">함께하는 기관</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {(partners ?? []).map((p: { id: number; name: string; imageUrl: string | null; url: string | null }) => {
              const content = p.imageUrl ? (
                <div className="h-16 w-full bg-white rounded-md px-3 py-2 flex items-center justify-center">
                  <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="h-16 w-full rounded-md border border-background/20 flex flex-col items-center justify-center gap-1 px-2">
                  <Church size={18} strokeWidth={1.5} />
                  <span className="text-xs font-semibold tracking-tight text-center leading-tight">{p.name}</span>
                </div>
              );
              const className = "block text-background/70 hover:text-background transition-colors";
              return p.url ? (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <div key={p.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/40">
          <div>
            {contact.orgName} | 사업자등록번호: {contact.bizRegNo}<br />
            주소: {contact.address} | 전화: {contact.phone} | 팩스: {contact.fax} | 이메일: {contact.email}
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <Link href="/privacy-policy" className="font-semibold text-background/70 hover:text-primary transition-colors">
              개인정보 처리방침
            </Link>
            <span>© {new Date().getFullYear()} {contact.orgName}. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

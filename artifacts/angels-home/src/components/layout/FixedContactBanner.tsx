import { Link } from "wouter";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_KAKAO_LINK = "https://pf.kakao.com/_xfZxoJX";

export function FixedContactBanner() {
  const { data: settings } = useSiteSettings();
  const kakaoLink = settings?.footer_contact?.kakaoLink || DEFAULT_KAKAO_LINK;

  const items = [
    { name: "오시는길", href: "/about/directions", icon: MapPin, external: false },
    { name: "입소상담", href: "/counsel", icon: MessageCircle, external: false },
    { name: "카톡상담", href: kakaoLink, icon: MessageCircle, external: true },
    { name: "1308상담", href: "https://gyeonggibukbu.1308.or.kr/", icon: Phone, external: true },
  ];

  return (
    <>
      {/* Desktop: vertical, right edge */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col shadow-lg rounded-l-2xl overflow-hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon size={20} />
              <span className="text-xs font-semibold mt-1 whitespace-nowrap">{item.name}</span>
            </>
          );
          const className =
            "flex flex-col items-center justify-center w-20 h-20 bg-white text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border-b border-border/40 last:border-b-0";
          return item.external ? (
            <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={item.name} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Mobile: horizontal, bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon size={18} />
              <span className="text-[11px] font-semibold mt-0.5">{item.name}</span>
            </>
          );
          const className =
            "flex-1 flex flex-col items-center justify-center py-2.5 bg-white text-foreground border-r border-border/40 last:border-r-0";
          return item.external ? (
            <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={item.name} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </>
  );
}

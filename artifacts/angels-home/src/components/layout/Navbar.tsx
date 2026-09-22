import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoUrl from "@assets/logo_angelshome.png";
import { useMemberAuth } from "@/lib/member-auth-context";

interface NavLink {
  name: string;
  href: string;
}

interface NavGroup {
  name: string;
  base: string;
  links: NavLink[];
}

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { member, logout } = useMemberAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navGroups: NavGroup[] = [
    {
      name: "기관소개",
      base: "/about",
      links: [
        { name: "인사말", href: "/about/greeting" },
        { name: "천사의집 소개", href: "/about/intro" },
        { name: "시설 둘러보기", href: "/about/facilities" },
        { name: "찾아오시는 길", href: "/about/directions" },
      ],
    },
    {
      name: "입소상담",
      base: "/admission",
      links: [
        { name: "입소안내", href: "/admission" },
        { name: "온라인상담", href: "/counsel" },
        { name: "자주하는 질문", href: "/faq" },
      ],
    },
    {
      name: "후원 및 자원봉사",
      base: "/support",
      links: [
        { name: "후원안내", href: "/support/info" },
        { name: "후원신청", href: "/support/apply" },
        { name: "후원소식", href: "/support/news" },
        { name: "자원봉사안내", href: "/support/volunteer" },
      ],
    },
    {
      name: "커뮤니티",
      base: "/community",
      links: [
        { name: "공지사항", href: "/community/notices" },
        { name: "갤러리", href: "/community/gallery" },
        { name: "육아나눔정보", href: "/community/childcare" },
      ],
    },
  ];

  const mainLinks = [
    { name: "지원서비스", href: "/programs" },
  ];

  const groupsBeforePrograms = navGroups.slice(0, 2);
  const groupsAfterPrograms = navGroups.slice(2);

  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);

  const isGroupActive = (group: NavGroup) =>
    location.startsWith(group.base) ||
    (group.base === "/admission" && (location.startsWith("/counsel") || location.startsWith("/faq")));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location !== "/" ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center z-50"
          onClick={() => {
            if (location === "/") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logoUrl} alt="경기도 천사의집 엔젤스홈" className="h-14 md:h-16 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          {groupsBeforePrograms.map((group) => (
            <DropdownMenu key={group.name}>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-lg font-semibold transition-colors ${isGroupActive(group) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  {group.name} <ChevronDown size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-white border-border/50">
                {group.links.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className={`w-full cursor-pointer text-base py-2 ${location === link.href ? 'text-primary font-bold' : ''}`}>
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-lg font-semibold transition-colors ${location === link.href ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
              {link.name}
            </Link>
          ))}

          {groupsAfterPrograms.map((group) => (
            <DropdownMenu key={group.name}>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-lg font-semibold transition-colors ${isGroupActive(group) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  {group.name} <ChevronDown size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-white border-border/50">
                {group.links.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className={`w-full cursor-pointer text-base py-2 ${location === link.href ? 'text-primary font-bold' : ''}`}>
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {member && (
            <div className="flex items-center gap-3 text-base font-semibold text-foreground/80">
              <span>{member.name}님</span>
              <button onClick={() => logout()} className="hover:text-primary transition-colors">로그아웃</button>
            </div>
          )}

          <Button asChild size="lg" className="rounded-full px-7 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all ml-2 cursor-pointer">
            <Link href="/support">후원하기</Link>
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden z-50 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 h-screen overflow-y-auto bg-white pt-24 pb-8 px-6 shadow-xl flex flex-col lg:hidden"
            >
              <div className="flex flex-col gap-2">
                {groupsBeforePrograms.map((group) => (
                  <div key={group.name} className="border-b border-border/50 pb-2">
                    <button
                      className="flex items-center justify-between w-full text-lg font-semibold text-foreground py-2"
                      onClick={() => setMobileOpenGroup(mobileOpenGroup === group.name ? null : group.name)}
                    >
                      {group.name} <ChevronDown size={20} className={`transition-transform ${mobileOpenGroup === group.name ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {mobileOpenGroup === group.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 py-3 pl-4">
                            {group.links.map((link) => (
                              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`text-base ${location === link.href ? 'text-primary font-bold' : 'text-foreground/70'}`}>
                                - {link.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-semibold border-b border-border/50 py-4 ${location === link.href ? 'text-primary' : 'text-foreground'}`}
                  >
                    {link.name}
                  </Link>
                ))}

                {groupsAfterPrograms.map((group) => (
                  <div key={group.name} className="border-b border-border/50 pb-2">
                    <button
                      className="flex items-center justify-between w-full text-lg font-semibold text-foreground py-2"
                      onClick={() => setMobileOpenGroup(mobileOpenGroup === group.name ? null : group.name)}
                    >
                      {group.name} <ChevronDown size={20} className={`transition-transform ${mobileOpenGroup === group.name ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {mobileOpenGroup === group.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 py-3 pl-4">
                            {group.links.map((link) => (
                              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`text-base ${location === link.href ? 'text-primary font-bold' : 'text-foreground/70'}`}>
                                - {link.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {member && (
                  <div className="flex items-center justify-between border-b border-border/50 py-4">
                    <span className="text-lg font-semibold">{member.name}님</span>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-base font-semibold text-muted-foreground"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
              <Button asChild className="w-full rounded-full py-6 text-lg bg-primary text-primary-foreground mt-8 cursor-pointer">
                <Link href="/support" onClick={() => setMobileMenuOpen(false)}>후원하기</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

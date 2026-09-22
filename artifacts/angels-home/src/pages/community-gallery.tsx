import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Images } from "lucide-react";
import { useGallerySearch, useGalleryInfinite } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
  images?: string[];
}

const PAGE_SIZE = 20;

function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link key={item.id} href={`/community/gallery/${item.id}`} className="group cursor-pointer block">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 mb-4 relative">
            <img
              src={resolveImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {(item.images?.length ?? 0) > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Images size={12} /> {item.images!.length}
              </div>
            )}
          </div>
          <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
        </Link>
      ))}
    </div>
  );
}

export default function CommunityGallery() {
  const [keyword, setKeyword] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const applySearch = () => {
    setPage(1);
    setAppliedQuery(keyword.trim() || undefined);
  };

  // Desktop: page-based
  const { data: pageData, isFetching: pageFetching } = useGallerySearch({
    page,
    limit: PAGE_SIZE,
    q: appliedQuery,
  });
  const totalPages = pageData ? Math.max(1, Math.ceil(pageData.total / PAGE_SIZE)) : 1;

  // Mobile: infinite scroll
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGalleryInfinite({ limit: PAGE_SIZE, q: appliedQuery });
  const infiniteItems = infiniteData?.pages.flatMap((p) => p.items) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pageWindow = (() => {
    const windowSize = 5;
    const start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const realStart = Math.max(1, end - windowSize + 1);
    const nums = [];
    for (let i = realStart; i <= end; i++) nums.push(i);
    return nums;
  })();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="갤러리"
        breadcrumb={[{ name: "커뮤니티", href: "/community/notices" }, { name: "갤러리", href: "/community/gallery" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
            className="flex gap-2 mb-6"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="사진 제목으로 검색하세요"
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" className="h-11 rounded-lg shrink-0">
              검색
            </Button>
          </form>

          {/* Desktop: paginated */}
          <div className="hidden md:block">
            {pageFetching && !pageData && (
              <div className="p-16 flex justify-center">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            )}
            {pageData && pageData.items.length === 0 && (
              <div className="bg-white rounded-3xl border border-border/50 p-12 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
            {pageData && pageData.items.length > 0 && <GalleryGrid items={pageData.items} />}

            {pageData && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-3 rounded-lg text-sm text-muted-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
                >
                  이전
                </button>
                {pageWindow.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      n === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 px-3 rounded-lg text-sm text-muted-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>

          {/* Mobile: infinite scroll */}
          <div className="md:hidden">
            {infiniteItems.length === 0 && !isFetchingNextPage && (
              <div className="bg-white rounded-3xl border border-border/50 p-12 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
            {infiniteItems.length > 0 && <GalleryGrid items={infiniteItems} />}
            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="p-6 flex justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

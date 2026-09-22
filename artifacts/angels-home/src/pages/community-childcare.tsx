import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Paperclip } from "lucide-react";
import { useChildcareSharesSearch, useChildcareSharesInfinite } from "@/lib/use-site-data";

interface Attachment {
  name: string;
  url: string;
}

interface ChildcareShare {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  attachments?: Attachment[];
  createdAt: string;
}

const PAGE_SIZE = 20;

function ShareRow({ item, index }: { item: ChildcareShare; index: number | string }) {
  return (
    <Link
      href={`/community/childcare/${item.id}`}
      className="grid md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-secondary/20 transition-colors cursor-pointer group"
    >
      <div className="hidden md:block col-span-1 text-center text-muted-foreground text-sm">{index}</div>
      <div className="col-span-12 md:col-span-8 pl-0 md:pl-4">
        <h4 className="flex items-center gap-1.5 text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
          <span className="truncate">{item.title}</span>
          {(item.attachments?.length ?? 0) > 0 && (
            <Paperclip size={14} className="text-muted-foreground shrink-0" />
          )}
        </h4>
        <div className="mt-2 md:hidden text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
        </div>
      </div>
      <div className="hidden md:block col-span-3 text-center text-muted-foreground text-sm">
        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
      </div>
    </Link>
  );
}

export default function CommunityChildcare() {
  const [scope, setScope] = useState<"title" | "all">("title");
  const [keyword, setKeyword] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<{ q?: string; scope: "title" | "all" }>({ scope: "title" });
  const [page, setPage] = useState(1);

  const applySearch = () => {
    setPage(1);
    setAppliedQuery({ q: keyword.trim() || undefined, scope });
  };

  const { data: pageData, isFetching: pageFetching } = useChildcareSharesSearch({
    page,
    limit: PAGE_SIZE,
    q: appliedQuery.q,
    scope: appliedQuery.scope,
  });
  const totalPages = pageData ? Math.max(1, Math.ceil(pageData.total / PAGE_SIZE)) : 1;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChildcareSharesInfinite({ limit: PAGE_SIZE, q: appliedQuery.q, scope: appliedQuery.scope });
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
        title="육아나눔정보"
        breadcrumb={[{ name: "커뮤니티", href: "/community/notices" }, { name: "육아나눔정보", href: "/community/childcare" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
            className="flex flex-col sm:flex-row gap-2 mb-6"
          >
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as "title" | "all")}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm shrink-0"
            >
              <option value="title">제목</option>
              <option value="all">제목+내용</option>
            </select>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" className="h-11 rounded-lg shrink-0">
              검색
            </Button>
          </form>

          <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-secondary/50 p-4 border-b border-border/50 text-muted-foreground font-semibold text-center">
              <div className="col-span-1">번호</div>
              <div className="col-span-8 text-left pl-4">제목</div>
              <div className="col-span-3">작성일</div>
            </div>

            {/* Desktop: paginated */}
            <div className="hidden md:block divide-y divide-border/30">
              {pageFetching && !pageData && (
                <div className="p-12 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              )}
              {pageData && pageData.items.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">검색 결과가 없습니다.</div>
              )}
              {(pageData?.items ?? []).map((item: ChildcareShare, idx: number) => (
                <ShareRow
                  key={item.id}
                  item={item}
                  index={pageData!.total - ((page - 1) * PAGE_SIZE + idx)}
                />
              ))}
            </div>

            {/* Mobile: infinite scroll */}
            <div className="md:hidden divide-y divide-border/30">
              {infiniteItems.length === 0 && !isFetchingNextPage && (
                <div className="p-8 text-center text-muted-foreground">검색 결과가 없습니다.</div>
              )}
              {infiniteItems.map((item: ChildcareShare, idx: number) => (
                <ShareRow
                  key={item.id}
                  item={item}
                  index={(infiniteData?.pages[0]?.total ?? 0) - idx}
                />
              ))}
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <div className="p-6 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" size={20} />
                </div>
              )}
            </div>
          </div>

          {pageData && totalPages > 1 && (
            <div className="hidden md:flex items-center justify-center gap-1.5 mt-8">
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
      </main>
      <Footer />
    </div>
  );
}

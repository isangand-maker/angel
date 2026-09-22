import React from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, ArrowLeft } from "lucide-react";
import { useNotice } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";
import { linkifyHtml } from "@/lib/linkify";

interface Attachment {
  name: string;
  url: string;
}

export default function CommunityNoticeDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: notice, isLoading } = useNotice(id);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="공지사항"
        breadcrumb={[{ name: "커뮤니티", href: "/community/notices" }, { name: "공지사항", href: "/community/notices" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : !notice ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">게시글을 찾을 수 없습니다.</p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/notices">목록으로</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden mb-8">
                <div className="p-8 md:p-10 border-b border-border/50">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    {notice.pinned && <span className="text-primary mr-2">[공지]</span>}
                    {notice.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{notice.author}</span>
                    <span className="w-px h-3 bg-border" />
                    <span>{new Date(notice.createdAt).toLocaleDateString("ko-KR")}</span>
                    <span className="w-px h-3 bg-border" />
                    <span>조회 {notice.viewCount ?? 0}</span>
                  </div>
                </div>
                <div
                  className="p-8 md:p-10 min-h-[280px] prose prose-sm md:prose-base max-w-none text-foreground/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: linkifyHtml(notice.content) }}
                />
                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="px-8 md:px-10 pb-8 md:pb-10 space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">첨부파일</p>
                    {notice.attachments.map((att: Attachment, i: number) => (
                      <a
                        key={i}
                        href={resolveImageUrl(att.url)}
                        download={att.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Paperclip size={14} />
                        {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/notices">
                  <ArrowLeft size={14} className="mr-1.5" /> 목록으로
                </Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

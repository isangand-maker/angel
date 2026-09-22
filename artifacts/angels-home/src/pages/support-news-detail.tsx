import React from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Paperclip } from "lucide-react";
import { useDonationNewsItem } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";
import { linkifyPlainText } from "@/lib/linkify";

interface Attachment {
  name: string;
  url: string;
}

export default function SupportNewsDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: item, isLoading } = useDonationNewsItem(id);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="후원소식"
        breadcrumb={[{ name: "후원 및 자원봉사", href: "/support/info" }, { name: "후원소식", href: "/support/news" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : !item ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">소식을 찾을 수 없습니다.</p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/support/news">목록으로</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden mb-8">
                <div className="p-8 md:p-10 border-b border-border/50">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{item.title}</h1>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <div
                  className={`p-8 md:p-10 min-h-[280px] space-y-4 flex flex-col ${
                    item.imageAlign === "right" ? "items-end" : item.imageAlign === "center" ? "items-center" : "items-start"
                  }`}
                >
                  {item.imageUrl && (
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-full max-w-md rounded-xl border border-border/50"
                    />
                  )}
                  <p
                    className={`text-foreground/90 leading-relaxed whitespace-pre-wrap w-full ${
                      item.imageAlign === "right" ? "text-right" : item.imageAlign === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {linkifyPlainText(item.content)}
                  </p>
                </div>
                {item.attachments && item.attachments.length > 0 && (
                  <div className="px-8 md:px-10 pb-8 md:pb-10 space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">첨부파일</p>
                    {item.attachments.map((att: Attachment, i: number) => (
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
                <Link href="/support/news">
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

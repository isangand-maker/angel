import React from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useGalleryItem } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";
import { linkifyPlainText } from "@/lib/linkify";

export default function CommunityGalleryDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: item, isLoading } = useGalleryItem(id);
  const images: string[] = item?.images?.length ? item.images : item?.imageUrl ? [item.imageUrl] : [];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="갤러리"
        breadcrumb={[{ name: "커뮤니티", href: "/community/notices" }, { name: "갤러리", href: "/community/gallery" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : !item ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">게시글을 찾을 수 없습니다.</p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/gallery">목록으로</Link>
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
                <div className="p-8 md:p-10 space-y-8">
                  {images.length > 0 && (
                    <div className={`grid gap-4 ${images.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                      {images.map((url, i) => (
                        <img
                          key={i}
                          src={resolveImageUrl(url)}
                          alt={`${item.title} ${i + 1}`}
                          className="w-full rounded-xl border border-border/50 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {item.content && (
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {linkifyPlainText(item.content)}
                    </p>
                  )}
                </div>
              </div>

              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/gallery">
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

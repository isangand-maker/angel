import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, MessageSquare } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { toast } from "sonner";

interface InquiryResult {
  id: number;
  name: string;
  phone: string;
  message: string;
  details: Record<string, unknown> | null;
  status: "new" | "read" | "done";
  adminReply: string | null;
  createdAt: string;
}

export default function CounselLookup() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InquiryResult[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const data = await adminApi.lookupInquiries({ type: "counsel", phone, password });
      setResults(data);
    } catch (err) {
      setResults(null);
      toast.error("조회에 실패했습니다.", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader title="상담내역 조회" breadcrumb={[{ name: "상담내역 조회", href: "/counsel/lookup" }]} />
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Search className="text-primary" size={28} />
              <h3 className="text-2xl font-bold">상담내역 조회</h3>
            </div>
            <p className="text-muted-foreground mb-8">
              상담 신청 시 입력하신 연락처와 비밀번호로 상담 진행 상황을 확인하실 수 있습니다.
            </p>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lookup-phone">연락처</Label>
                <Input
                  id="lookup-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookup-password">비밀번호</Label>
                <Input
                  id="lookup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="w-full h-14 text-lg rounded-full">
                {loading ? "조회 중..." : "조회하기"}
              </Button>
            </form>
          </div>

          {searched && results && results.length > 0 && (
            <div className="space-y-4">
              {results.map((r) => {
                const answered = !!r.adminReply;
                const title = typeof r.details?.["제목"] === "string" ? (r.details["제목"] as string) : null;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          answered ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {answered ? "답변완료" : "답변대기"}
                      </span>
                    </div>
                    {title && <h4 className="font-semibold mb-2">{title}</h4>}
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap mb-4">{r.message}</p>
                    {answered && (
                      <div className="bg-secondary/30 rounded-xl p-4 flex gap-2.5">
                        <MessageSquare size={16} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">상담사 답변</p>
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.adminReply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

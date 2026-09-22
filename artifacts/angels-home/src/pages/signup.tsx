import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemberAuth } from "@/lib/member-auth-context";

export default function Signup() {
  const { register } = useMemberAuth();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ email: form.email, password: form.password, name: form.name, phone: form.phone || undefined });
      setLocation("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-40 pb-24 md:pt-48">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-border/50 p-8"
        >
          <h1 className="text-2xl font-bold mb-1 text-center">회원가입</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">경기도 천사의집 회원이 되어주세요</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" minLength={8} required />
              <p className="text-xs text-muted-foreground">8자 이상 입력해주세요.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처 (선택)</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-1234-5678" autoComplete="tel" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full mt-6 rounded-full h-12">
            {submitting ? "가입 중..." : "회원가입"}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-6">
            이미 회원이신가요?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">로그인</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

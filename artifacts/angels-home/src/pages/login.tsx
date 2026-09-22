import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemberAuth } from "@/lib/member-auth-context";

export default function Login() {
  const { login } = useMemberAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      setLocation("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
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
          <h1 className="text-2xl font-bold mb-1 text-center">로그인</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">경기도 천사의집 회원 로그인</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full mt-6 rounded-full h-12">
            {submitting ? "로그인 중..." : "로그인"}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-6">
            아직 회원이 아니신가요?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">회원가입</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

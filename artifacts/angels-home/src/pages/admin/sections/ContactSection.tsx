import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function ContactSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ footer_contact: form });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label>기관명</Label>
        <Input value={form.orgName ?? ""} onChange={(e) => set("orgName", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>사업자등록번호</Label>
          <Input value={form.bizRegNo ?? ""} onChange={(e) => set("bizRegNo", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>이메일</Label>
          <Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>주소</Label>
        <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>전화번호</Label>
          <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>팩스번호</Label>
          <Input value={form.fax ?? ""} onChange={(e) => set("fax", e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>카톡상담 링크</Label>
        <Input
          value={form.kakaoLink ?? ""}
          onChange={(e) => set("kakaoLink", e.target.value)}
          placeholder="https://pf.kakao.com/_xxxxx"
        />
        <p className="text-xs text-muted-foreground">우측/하단 카톡상담 버튼이 이 링크로 연결됩니다.</p>
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

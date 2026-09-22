import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function HeroSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ home_hero: form });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-2">
        <Label>상단 뱃지 문구</Label>
        <Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>제목 1줄</Label>
          <Input value={form.titleLine1 ?? ""} onChange={(e) => set("titleLine1", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>제목 2줄 (강조색)</Label>
          <Input value={form.titleHighlight ?? ""} onChange={(e) => set("titleHighlight", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>제목 3줄</Label>
          <Input value={form.titleLine3 ?? ""} onChange={(e) => set("titleLine3", e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>설명 문구</Label>
        <Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </div>
      <ImageUploadField label="히어로 사진" value={form.heroImage} onChange={(url) => set("heroImage", url)} />
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function GreetingSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ greeting_page: form });
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
        <Label>인용문 (상단 강조 문구)</Label>
        <Input value={form.quote ?? ""} onChange={(e) => set("quote", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>본문 (문단 사이에 빈 줄을 넣으면 문단이 나뉩니다)</Label>
        <Textarea rows={14} value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>직함</Label>
          <Input value={form.signatureTitle ?? ""} onChange={(e) => set("signatureTitle", e.target.value)} placeholder="원장" />
        </div>
        <div className="space-y-2">
          <Label>성함 (비워두면 표시 안 됨)</Label>
          <Input value={form.signatureName ?? ""} onChange={(e) => set("signatureName", e.target.value)} />
        </div>
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

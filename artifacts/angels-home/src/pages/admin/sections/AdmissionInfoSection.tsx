import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function AdmissionInfoSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState({
    target: initial.target ?? "",
    period: initial.period ?? "",
    documentsText: (initial.documents ?? []).join("\n"),
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const documents = form.documentsText.split("\n").map((v: string) => v.trim()).filter(Boolean);
      await adminApi.updateSettings({ admission_info: { target: form.target, period: form.period, documents } });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>입소 대상</Label>
        <Input value={form.target} onChange={(e) => set("target", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>입소 기간</Label>
        <Input value={form.period} onChange={(e) => set("period", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>입소 서류 (한 줄에 하나씩)</Label>
        <Textarea rows={6} value={form.documentsText} onChange={(e) => set("documentsText", e.target.value)} />
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

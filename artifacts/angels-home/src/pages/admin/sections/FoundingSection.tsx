import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function FoundingSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState({
    operator: initial.operator ?? "",
    story: initial.story ?? "",
    valuesText: (initial.values ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const values = form.valuesText.split(",").map((v: string) => v.trim()).filter(Boolean);
      await adminApi.updateSettings({ org_founding: { operator: form.operator, story: form.story, values } });
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
        <Label>운영법인</Label>
        <Input value={form.operator} onChange={(e) => set("operator", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>설립 이야기 (문단은 빈 줄로 구분)</Label>
        <Textarea rows={10} value={form.story} onChange={(e) => set("story", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>핵심가치 (쉼표로 구분)</Label>
        <Input value={form.valuesText} onChange={(e) => set("valuesText", e.target.value)} placeholder="섬김, 나눔, 존중, 신뢰, 동행" />
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

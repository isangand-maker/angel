import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function MissionSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ about_mission: form });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>미션 제목</Label>
          <Input value={form.missionTitle ?? ""} onChange={(e) => set("missionTitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>미션 본문</Label>
          <Textarea rows={4} value={form.missionText ?? ""} onChange={(e) => set("missionText", e.target.value)} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>비전 제목</Label>
          <Input value={form.visionTitle ?? ""} onChange={(e) => set("visionTitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>비전 본문</Label>
          <Textarea rows={4} value={form.visionText ?? ""} onChange={(e) => set("visionText", e.target.value)} />
        </div>
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

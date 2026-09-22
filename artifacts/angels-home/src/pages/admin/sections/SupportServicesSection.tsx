import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

type Service = { title: string; desc: string; items: string[] };

export function SupportServicesSection({ initial }: { initial: Service[] }) {
  const [services, setServices] = useState<Service[]>(initial.length > 0 ? initial : [{ title: "", desc: "", items: [] }]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const update = (idx: number, key: "title" | "desc", value: string) => {
    setServices((list) => list.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };
  const updateItems = (idx: number, value: string) => {
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    setServices((list) => list.map((s, i) => (i === idx ? { ...s, items } : s)));
  };
  const addService = () => setServices((list) => [...list, { title: "", desc: "", items: [] }]);
  const removeService = (idx: number) => setServices((list) => list.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ support_services: services });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {services.map((service, idx) => (
        <div key={idx} className="space-y-3 p-4 rounded-xl border border-border/60">
          <div className="flex items-center justify-between">
            <Label>서비스 {idx + 1}</Label>
            <Button variant="ghost" size="sm" onClick={() => removeService(idx)} className="text-destructive h-7 px-2">삭제</Button>
          </div>
          <Input placeholder="제목 (예: 생활지원)" value={service.title} onChange={(e) => update(idx, "title", e.target.value)} />
          <Textarea rows={3} placeholder="설명" value={service.desc} onChange={(e) => update(idx, "desc", e.target.value)} />
          <Input
            placeholder="주요 지원 (쉼표로 구분)"
            value={service.items.join(", ")}
            onChange={(e) => updateItems(idx, e.target.value)}
          />
        </div>
      ))}
      <Button variant="outline" onClick={addService} className="rounded-full">+ 서비스 추가</Button>
      <div>
        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

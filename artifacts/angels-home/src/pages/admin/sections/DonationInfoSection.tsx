import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function DonationInfoSection({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ donation_info: form });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label>은행명</Label>
        <Input value={form.bankName ?? ""} onChange={(e) => set("bankName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>계좌번호</Label>
        <Input value={form.accountNumber ?? ""} onChange={(e) => set("accountNumber", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>예금주</Label>
        <Input value={form.accountHolder ?? ""} onChange={(e) => set("accountHolder", e.target.value)} />
      </div>
      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

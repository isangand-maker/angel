import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "../ImageUploadField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, ImageIcon } from "lucide-react";

interface Partner {
  id: number;
  name: string;
  imageUrl: string | null;
  url: string | null;
  sortOrder: number;
}

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getPartners().then(setPartners);

  useEffect(() => {
    load();
  }, []);

  if (!partners) {
    return <Loader2 className="animate-spin text-muted-foreground" />;
  }

  const updateLocal = (id: number, patch: Partial<Partner>) => {
    setPartners((prev) => prev!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const save = async (partner: Partner) => {
    try {
      await adminApi.updatePartner(partner.id, { name: partner.name, imageUrl: partner.imageUrl, url: partner.url });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 기관을 삭제하시겠습니까?")) return;
    await adminApi.deletePartner(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const addNew = async () => {
    const maxOrder = partners.reduce((m, p) => Math.max(m, p.sortOrder), -1);
    const partner = await adminApi.createPartner({ name: "새 기관", imageUrl: null, url: null, sortOrder: maxOrder + 1 });
    await load();
    setViewingId(partner.id);
  };

  const viewing = viewingId !== null ? partners.find((p) => p.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-3">
          <ImageUploadField value={viewing.imageUrl} onChange={(url) => updateLocal(viewing.id, { imageUrl: url })} />
          <Input
            value={viewing.name}
            onChange={(e) => updateLocal(viewing.id, { name: e.target.value })}
            placeholder="기관명"
            className="bg-white"
          />
          <Input
            value={viewing.url ?? ""}
            onChange={(e) => updateLocal(viewing.id, { url: e.target.value || null })}
            placeholder="연동 링크 (예: https://www.gg.go.kr) - 비워두면 클릭 안 됨"
            className="bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => save(viewing)}>
              저장
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove(viewing.id)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {partners.map((partner) => (
        <div
          key={partner.id}
          onClick={() => setViewingId(partner.id)}
          className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          {partner.imageUrl ? (
            <img src={resolveImageUrl(partner.imageUrl)} alt="" className="w-12 h-12 object-contain rounded-lg border border-border bg-white shrink-0 p-1" />
          ) : (
            <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon size={18} />
            </div>
          )}
          <span className="flex-1 font-medium truncate">{partner.name || "(기관명 없음)"}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              remove(partner.id);
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> 기관 추가
      </Button>
    </div>
  );
}

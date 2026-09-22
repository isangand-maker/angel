import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "../ImageUploadField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, ImageIcon } from "lucide-react";

interface PopupBanner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  published: boolean;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
}

export function PopupSection() {
  const [popups, setPopups] = useState<PopupBanner[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getAdminPopupBanners().then(setPopups);

  useEffect(() => {
    load();
  }, []);

  if (!popups) return <Loader2 className="animate-spin text-muted-foreground" />;

  const updateLocal = (id: number, patch: Partial<PopupBanner>) => {
    setPopups((prev) => prev!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const save = async (popup: PopupBanner) => {
    try {
      await adminApi.updatePopupBanner(popup.id, popup);
      toast({ title: "저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 팝업을 삭제하시겠습니까?")) return;
    await adminApi.deletePopupBanner(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const addNew = async () => {
    const maxOrder = popups.reduce((m, p) => Math.max(m, p.sortOrder), -1);
    const popup = await adminApi.createPopupBanner({
      imageUrl: "",
      linkUrl: null,
      published: true,
      startDate: null,
      endDate: null,
      sortOrder: maxOrder + 1,
    });
    await load();
    setViewingId(popup.id);
  };

  const viewing = viewingId !== null ? popups.find((p) => p.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Switch checked={viewing.published} onCheckedChange={(v) => updateLocal(viewing.id, { published: v })} />
            <Label>공개</Label>
          </div>
          <ImageUploadField label="팝업 이미지" value={viewing.imageUrl} onChange={(url) => updateLocal(viewing.id, { imageUrl: url })} />
          <div className="space-y-2">
            <Label>클릭 시 이동할 링크</Label>
            <Input
              value={viewing.linkUrl ?? ""}
              onChange={(e) => updateLocal(viewing.id, { linkUrl: e.target.value || null })}
              placeholder="https://"
              className="bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>시작일자 (선택)</Label>
              <Input
                type="date"
                value={viewing.startDate ?? ""}
                onChange={(e) => updateLocal(viewing.id, { startDate: e.target.value || null })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>종료일자 (선택)</Label>
              <Input
                type="date"
                value={viewing.endDate ?? ""}
                onChange={(e) => updateLocal(viewing.id, { endDate: e.target.value || null })}
                className="bg-white"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">시작/종료일자를 비워두면 기간 제한 없이 공개 여부에 따라 표시됩니다.</p>
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
      <p className="text-sm text-muted-foreground">여러 개의 팝업을 등록할 수 있습니다. 공개 상태이고 기간 내인 팝업만 홈페이지에 순서대로 표시됩니다.</p>
      {popups.map((popup) => (
        <div
          key={popup.id}
          onClick={() => setViewingId(popup.id)}
          className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          {popup.imageUrl ? (
            <img src={resolveImageUrl(popup.imageUrl)} alt="" className="w-14 h-14 object-cover rounded-xl border border-border shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon size={18} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${
                popup.published ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {popup.published ? "공개" : "비공개"}
            </span>
            <p className="text-xs text-muted-foreground truncate">
              {popup.startDate || popup.endDate ? `${popup.startDate ?? "제한없음"} ~ ${popup.endDate ?? "제한없음"}` : "기간 제한 없음"}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(popup.id); }}>
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> 팝업 추가
      </Button>
    </div>
  );
}

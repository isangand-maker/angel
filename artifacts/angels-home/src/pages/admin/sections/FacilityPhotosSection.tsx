import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, ArrowLeft, ChevronRight, ImageIcon } from "lucide-react";

interface Photo {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

export function FacilityPhotosSection() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getFacilityPhotos().then(setPhotos);

  useEffect(() => {
    load();
  }, []);

  if (!photos) {
    return <Loader2 className="animate-spin text-muted-foreground" />;
  }

  const updateLocal = (id: number, patch: Partial<Photo>) => {
    setPhotos((prev) => prev!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const save = async (photo: Photo) => {
    try {
      await adminApi.updateFacilityPhoto(photo.id, {
        title: photo.title,
        description: photo.description,
        imageUrl: photo.imageUrl,
        sortOrder: photo.sortOrder,
      });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    await adminApi.deleteFacilityPhoto(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = photos[idx + dir];
    if (!target) return;
    const a = photos[idx];
    await adminApi.updateFacilityPhoto(a.id, { sortOrder: target.sortOrder });
    await adminApi.updateFacilityPhoto(target.id, { sortOrder: a.sortOrder });
    load();
  };

  const addNew = async () => {
    const maxOrder = photos.reduce((m, p) => Math.max(m, p.sortOrder), -1);
    const photo = await adminApi.createFacilityPhoto({ title: "새 사진", description: "", imageUrl: "", sortOrder: maxOrder + 1 });
    await load();
    setViewingId(photo.id);
  };

  const viewing = viewingId !== null ? photos.find((p) => p.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-2xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-3">
          <ImageUploadField value={viewing.imageUrl} onChange={(url) => updateLocal(viewing.id, { imageUrl: url })} />
          <Input
            value={viewing.title}
            onChange={(e) => updateLocal(viewing.id, { title: e.target.value })}
            placeholder="제목"
            className="bg-white"
          />
          <Textarea
            rows={3}
            value={viewing.description}
            onChange={(e) => updateLocal(viewing.id, { description: e.target.value })}
            placeholder="설명"
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
    <div className="space-y-4 max-w-3xl">
      {photos.map((photo, idx) => (
        <div
          key={photo.id}
          onClick={() => setViewingId(photo.id)}
          className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="disabled:opacity-30">
              <ChevronUp size={16} />
            </button>
            <button onClick={() => move(idx, 1)} disabled={idx === photos.length - 1} className="disabled:opacity-30">
              <ChevronDown size={16} />
            </button>
          </div>
          {photo.imageUrl ? (
            <img src={resolveImageUrl(photo.imageUrl)} alt="" className="w-16 h-16 object-cover rounded-xl border border-border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{photo.title || "(제목 없음)"}</p>
            <p className="text-xs text-muted-foreground truncate">{photo.description}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              remove(photo.id);
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> 사진 추가
      </Button>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  ArrowLeft,
  ChevronRight,
  ImageIcon,
  Upload,
  Images,
} from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  images: string[];
  sortOrder: number;
}

function MultiImageField({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await adminApi.upload(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const moveAt = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">사진 (여러 장 등록 가능, 첫 번째 사진이 목록 대표사진)</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative group">
            <img src={resolveImageUrl(url)} alt="" className="w-full aspect-square object-cover rounded-xl border border-border" />
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                대표
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveAt(idx, -1)}
                  disabled={idx === 0}
                  className="bg-white rounded p-1 disabled:opacity-30"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => moveAt(idx, 1)}
                  disabled={idx === images.length - 1}
                  className="bg-white rounded p-1 disabled:opacity-30"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
              <button type="button" onClick={() => removeAt(idx)} className="bg-white rounded p-1">
                <Trash2 size={12} className="text-destructive" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="text-xs">추가</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getGallery({ limit: 1000 }).then((res) => setItems(res.items));

  useEffect(() => {
    load();
  }, []);

  if (!items) return <Loader2 className="animate-spin text-muted-foreground" />;

  const updateLocal = (id: number, patch: Partial<GalleryItem>) => {
    setItems((prev) => prev!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const save = async (item: GalleryItem) => {
    try {
      await adminApi.updateGalleryItem(item.id, {
        title: item.title,
        content: item.content,
        imageUrl: item.images[0] ?? item.imageUrl,
        images: item.images,
      });
      toast({ title: "저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    await adminApi.deleteGalleryItem(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = items[idx + dir];
    if (!target) return;
    const a = items[idx];
    await adminApi.updateGalleryItem(a.id, { sortOrder: target.sortOrder });
    await adminApi.updateGalleryItem(target.id, { sortOrder: a.sortOrder });
    load();
  };

  const addNew = async () => {
    const item = await adminApi.createGalleryItem({ title: "새 게시글", content: "", imageUrl: "", images: [] });
    await load();
    setViewingId(item.id);
  };

  const viewing = viewingId !== null ? items.find((i) => i.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-2xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
          <MultiImageField images={viewing.images ?? []} onChange={(images) => updateLocal(viewing.id, { images })} />
          <Input value={viewing.title} onChange={(e) => updateLocal(viewing.id, { title: e.target.value })} placeholder="제목" className="bg-white" />
          <Textarea
            rows={6}
            value={viewing.content ?? ""}
            onChange={(e) => updateLocal(viewing.id, { content: e.target.value })}
            placeholder="내용 (선택)"
            className="bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => save(viewing)}>저장</Button>
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
      <p className="text-sm text-muted-foreground">
        새로 등록한 게시글은 자동으로 맨 위(최신순)에 표시됩니다. 순서를 직접 바꾸고 싶으면 화살표로 조정하세요. 사진은 여러 장, 내용 글도 함께 등록할 수 있습니다.
      </p>
      {items.map((item, idx) => (
        <div
          key={item.id}
          onClick={() => setViewingId(item.id)}
          className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="disabled:opacity-30">
              <ChevronUp size={16} />
            </button>
            <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="disabled:opacity-30">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="relative shrink-0">
            {item.imageUrl ? (
              <img src={resolveImageUrl(item.imageUrl)} alt="" className="w-16 h-16 object-cover rounded-xl border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground">
                <ImageIcon size={20} />
              </div>
            )}
            {(item.images?.length ?? 0) > 1 && (
              <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Images size={10} /> {item.images.length}
              </span>
            )}
          </div>
          <span className="flex-1 font-medium truncate">{item.title || "(제목 없음)"}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              remove(item.id);
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> 게시글 추가
      </Button>
    </div>
  );
}

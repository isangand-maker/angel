import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { AttachmentField } from "../AttachmentField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/image-url";
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, ImageIcon } from "lucide-react";

interface Attachment {
  name: string;
  url: string;
}

interface ChildcareShare {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  attachments: Attachment[];
}

export function ChildcareSharesSection() {
  const [items, setItems] = useState<ChildcareShare[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getChildcareShares({ limit: 1000 }).then((res) => setItems(res.items));

  useEffect(() => {
    load();
  }, []);

  if (!items) return <Loader2 className="animate-spin text-muted-foreground" />;

  const updateLocal = (id: number, patch: Partial<ChildcareShare>) => {
    setItems((prev) => prev!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const save = async (item: ChildcareShare) => {
    try {
      await adminApi.updateChildcareShare(item.id, item);
      toast({ title: "저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    await adminApi.deleteChildcareShare(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const addNew = async () => {
    const item = await adminApi.createChildcareShare({ title: "새 게시글", content: "", imageUrl: null, attachments: [] });
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
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-3">
          <Input value={viewing.title} onChange={(e) => updateLocal(viewing.id, { title: e.target.value })} placeholder="제목" className="bg-white" />
          <Textarea rows={6} value={viewing.content} onChange={(e) => updateLocal(viewing.id, { content: e.target.value })} placeholder="내용" className="bg-white" />
          <ImageUploadField value={viewing.imageUrl} onChange={(url) => updateLocal(viewing.id, { imageUrl: url })} label="사진 (선택)" />
          <AttachmentField
            value={viewing.attachments ?? []}
            onChange={(attachments) => updateLocal(viewing.id, { attachments })}
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
      <p className="text-sm text-muted-foreground">육아용품 나눔, 육아 정보 공유 게시글을 등록할 수 있습니다.</p>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => setViewingId(item.id)}
          className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          {item.imageUrl ? (
            <img src={resolveImageUrl(item.imageUrl)} alt="" className="w-16 h-16 object-cover rounded-xl border border-border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon size={20} />
            </div>
          )}
          <span className="flex-1 font-medium truncate">{item.title || "(제목 없음)"}</span>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(item.id); }}>
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

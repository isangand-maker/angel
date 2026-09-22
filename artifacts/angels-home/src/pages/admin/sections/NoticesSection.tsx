import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "../RichTextEditor";
import { AttachmentField } from "../AttachmentField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Pin, EyeOff, ArrowLeft, ChevronRight } from "lucide-react";

interface Attachment {
  name: string;
  url: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  viewCount: number;
  pinned: boolean;
  hidden: boolean;
  attachments: Attachment[];
}

export function NoticesSection() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getNotices({ limit: 1000 }).then((res) => setNotices(res.items));

  useEffect(() => {
    load();
  }, []);

  if (!notices) return <Loader2 className="animate-spin text-muted-foreground" />;

  const updateLocal = (id: number, patch: Partial<Notice>) => {
    setNotices((prev) => prev!.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const save = async (notice: Notice) => {
    try {
      await adminApi.updateNotice(notice.id, notice);
      toast({ title: "저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 공지사항을 삭제하시겠습니까?")) return;
    await adminApi.deleteNotice(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const addNew = async () => {
    const notice = await adminApi.createNotice({ title: "새 공지사항", content: "", author: "관리자", pinned: false, hidden: false, attachments: [] });
    await load();
    setViewingId(notice.id);
  };

  const viewing = viewingId !== null ? notices.find((n) => n.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-3xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="bg-secondary/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              value={viewing.title}
              onChange={(e) => updateLocal(viewing.id, { title: e.target.value })}
              placeholder="제목"
              className="flex-1 bg-white"
            />
            <Input
              value={viewing.author}
              onChange={(e) => updateLocal(viewing.id, { author: e.target.value })}
              placeholder="작성자"
              className="w-32 bg-white shrink-0"
            />
            <div className="flex items-center gap-2 shrink-0">
              <Pin size={14} className="text-muted-foreground" />
              <Switch checked={viewing.pinned} onCheckedChange={(v) => updateLocal(viewing.id, { pinned: v })} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <EyeOff size={14} className="text-muted-foreground" />
              <Switch checked={viewing.hidden} onCheckedChange={(v) => updateLocal(viewing.id, { hidden: v })} />
            </div>
          </div>
          {viewing.hidden && (
            <p className="text-xs text-destructive">비공개 처리됨 — 사이트 방문자에게 노출되지 않습니다.</p>
          )}
          <RichTextEditor value={viewing.content} onChange={(html) => updateLocal(viewing.id, { content: html })} />
          <AttachmentField
            value={viewing.attachments ?? []}
            onChange={(attachments) => updateLocal(viewing.id, { attachments })}
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
    <div className="space-y-3 max-w-3xl">
      {notices.map((notice) => (
        <div
          key={notice.id}
          onClick={() => setViewingId(notice.id)}
          className="flex items-center gap-3 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <span className="flex-1 font-medium truncate">
            {notice.pinned && <Pin size={13} className="inline mr-1.5 text-primary" />}
            {notice.hidden && <EyeOff size={13} className="inline mr-1.5 text-destructive" />}
            {notice.title || "(제목 없음)"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">조회 {notice.viewCount ?? 0}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              remove(notice.id);
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> 공지사항 추가
      </Button>
    </div>
  );
}

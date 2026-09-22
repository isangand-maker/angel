import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: number;
  eventDate: string;
  title: string;
  detail: string | null;
  imageUrl: string | null;
}

const EMPTY_NEW = { eventDate: "", title: "", detail: "", imageUrl: "" };

export function CalendarEventsSection() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [newEvent, setNewEvent] = useState(EMPTY_NEW);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getCalendarEvents().then(setEvents);

  useEffect(() => {
    load();
  }, []);

  if (!events) return <Loader2 className="animate-spin text-muted-foreground" />;

  const setNew = (key: keyof typeof EMPTY_NEW, value: string) => setNewEvent((f) => ({ ...f, [key]: value }));

  const add = async () => {
    if (!newEvent.eventDate || !newEvent.title) return;
    try {
      await adminApi.createCalendarEvent({
        eventDate: newEvent.eventDate,
        title: newEvent.title,
        detail: newEvent.detail || null,
        imageUrl: newEvent.imageUrl || null,
      });
      setNewEvent(EMPTY_NEW);
      load();
    } catch (err) {
      toast({ title: "추가 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const updateLocal = (id: number, patch: Partial<CalendarEvent>) => {
    setEvents((prev) => prev!.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const save = async (event: CalendarEvent) => {
    try {
      await adminApi.updateCalendarEvent(event.id, {
        eventDate: event.eventDate,
        title: event.title,
        detail: event.detail,
        imageUrl: event.imageUrl,
      });
      toast({ title: "저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    await adminApi.deleteCalendarEvent(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const viewing = viewingId !== null ? events.find((e) => e.id === viewingId) : null;

  if (viewing) {
    return (
      <div className="max-w-2xl space-y-4">
        <button
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="rounded-2xl border border-border/60 p-4 space-y-3 bg-secondary/10">
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={viewing.eventDate} onChange={(e) => updateLocal(viewing.id, { eventDate: e.target.value })} />
            <Input value={viewing.title} onChange={(e) => updateLocal(viewing.id, { title: e.target.value })} />
          </div>
          <Textarea
            rows={4}
            placeholder="상세 내용 (선택, 클릭 시 팝업에 표시됩니다)"
            value={viewing.detail ?? ""}
            onChange={(e) => updateLocal(viewing.id, { detail: e.target.value })}
          />
          <ImageUploadField label="사진 (선택)" value={viewing.imageUrl ?? ""} onChange={(url) => updateLocal(viewing.id, { imageUrl: url })} />
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
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3 p-4 bg-secondary/30 rounded-2xl">
        <p className="text-sm font-semibold">새 일정 추가</p>
        <div className="flex gap-3 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">날짜</label>
            <Input type="date" value={newEvent.eventDate} onChange={(e) => setNew("eventDate", e.target.value)} className="w-44" />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">일정 제목</label>
            <Input value={newEvent.title} onChange={(e) => setNew("title", e.target.value)} placeholder="예: 양육교육_영유아전문교구" />
          </div>
        </div>
        <Textarea rows={3} placeholder="상세 내용 (선택, 클릭 시 팝업에 표시됩니다)" value={newEvent.detail} onChange={(e) => setNew("detail", e.target.value)} />
        <ImageUploadField label="사진 (선택)" value={newEvent.imageUrl} onChange={(url) => setNew("imageUrl", url)} />
        <Button onClick={add} className="rounded-full">
          <Plus size={14} className="mr-1.5" /> 추가
        </Button>
      </div>

      <div className="space-y-2">
        {events.length === 0 && <p className="text-sm text-muted-foreground">등록된 일정이 없습니다.</p>}
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => setViewingId(event.id)}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-primary w-24 shrink-0">{event.eventDate}</span>
              <span className="text-sm">{event.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); remove(event.id); }}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Bell, ChevronLeft, ChevronRight, ImageIcon, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotices, useGallery, useCalendarEvents } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

interface Notice {
  id: number;
  title: string;
  pinned: boolean;
}

interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
}

interface CalendarEvent {
  id: number;
  eventDate: string;
  title: string;
  detail: string | null;
  imageUrl: string | null;
}

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const NoticesCard = () => {
  const { data: notices } = useNotices();
  const list: Notice[] = (notices ?? []).slice(0, 6);

  return (
    <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bell size={18} />
          </div>
          <h3 className="text-lg font-bold">공지사항</h3>
        </div>
        <Link href="/community/notices" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          더보기 +
        </Link>
      </div>
      <div className="flex-1 space-y-3">
        {list.length === 0 && <p className="text-sm text-muted-foreground">등록된 공지사항이 없습니다.</p>}
        {list.map((n) => (
          <Link
            key={n.id}
            href={`/community/notices/${n.id}`}
            className="block text-sm text-foreground/80 hover:text-primary transition-colors truncate"
          >
            {n.pinned && <span className="text-primary font-bold mr-1.5">[고정]</span>}
            {n.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

const GalleryCard = () => {
  const { data: gallery } = useGallery();
  const items: GalleryItem[] = gallery ?? [];
  const [idx, setIdx] = useState(0);
  const current = items[idx];

  return (
    <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="h-64 md:h-72 bg-secondary/40 relative shrink-0">
        {current ? (
          <img src={resolveImageUrl(current.imageUrl)} alt={current.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon size={32} />
          </div>
        )}
        {items.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % items.length)}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <h4 className="font-bold text-foreground mb-1 truncate">{current?.title ?? "갤러리"}</h4>
        <Link href="/community/gallery" className="text-sm text-primary font-semibold hover:underline">
          갤러리 더보기
        </Link>
      </div>
    </div>
  );
};

const CalendarCard = () => {
  const { data: events } = useCalendarEvents();
  const eventList: CalendarEvent[] = events ?? [];
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(today);
  const [selected, setSelected] = useState(toDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const [openEvent, setOpenEvent] = useState<CalendarEvent | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of eventList) {
      const key = e.eventDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [eventList]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const changeMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

  const selectedEvents = eventsByDate[selected] ?? [];
  const weekLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          {year}년 {month + 1}월 일정표
        </h3>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {weekLabels.map((w) => (
          <div key={w} className="text-xs font-semibold text-muted-foreground pb-1">{w}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = toDateKey(year, month, day);
          const hasEvent = !!eventsByDate[key];
          const isSelected = key === selected;
          const isToday = key === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              key={i}
              onClick={() => setSelected(key)}
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground font-bold"
                  : hasEvent
                  ? "bg-primary/10 text-primary font-semibold"
                  : isToday
                  ? "border border-primary text-primary"
                  : "text-foreground/70 hover:bg-secondary"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 flex-1">
        <p className="text-xs text-muted-foreground mb-2">{selected} 일정</p>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">등록된 일정이 없습니다.</p>
        ) : (
          <ul className="space-y-1.5">
            {selectedEvents.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setOpenEvent(e)}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                >
                  {e.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!openEvent} onOpenChange={(v) => !v && setOpenEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{openEvent?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{openEvent?.eventDate}</p>
          {openEvent?.imageUrl && (
            <img src={resolveImageUrl(openEvent.imageUrl)} alt={openEvent.title} className="w-full rounded-xl border border-border/50" />
          )}
          {openEvent?.detail ? (
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{openEvent.detail}</p>
          ) : (
            <p className="text-sm text-muted-foreground">등록된 상세 내용이 없습니다.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const InfoBoard = () => {
  return (
    <section className="py-8 md:py-10 bg-secondary/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-3 gap-6">
          <NoticesCard />
          <GalleryCard />
          <CalendarCard />
        </div>
      </div>
    </section>
  );
};

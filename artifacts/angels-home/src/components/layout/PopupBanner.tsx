import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { usePopupBanners } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

const DISMISS_KEY_PREFIX = "angelshome-popup-dismissed-until-";

interface Popup {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
}

export function PopupBanner() {
  const { data: popups, isLoading } = usePopupBanners();
  const [openIds, setOpenIds] = useState<number[]>([]);

  useEffect(() => {
    if (isLoading || !popups) return;
    const now = Date.now();
    const visible = popups.filter((p: Popup) => {
      const dismissedUntil = localStorage.getItem(`${DISMISS_KEY_PREFIX}${p.id}`);
      return !dismissedUntil || now > Number(dismissedUntil);
    });
    setOpenIds(visible.map((p: Popup) => p.id));
  }, [isLoading, popups]);

  const close = (id: number) => setOpenIds((prev) => prev.filter((x) => x !== id));

  const hideForToday = (id: number) => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${id}`, String(midnight.getTime()));
    close(id);
  };

  if (!popups || openIds.length === 0) return null;

  const visiblePopups = popups.filter((p: Popup) => openIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="grid w-full max-w-sm max-h-[85vh]">
        {visiblePopups.map((popup: Popup, idx: number) => (
          <div
            key={popup.id}
            className="col-start-1 row-start-1 w-full max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            style={{
              transform: `translate(${idx * 28}px, ${idx * 28}px)`,
              zIndex: 100 + idx,
            }}
          >
            <button
              onClick={() => close(popup.id)}
              aria-label="닫기"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X size={18} />
            </button>
            <a href={popup.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block">
              <img src={resolveImageUrl(popup.imageUrl)} alt="공지 팝업" className="w-full h-auto" />
            </a>
            <div className="flex divide-x divide-border border-t border-border bg-white">
              <button
                onClick={() => hideForToday(popup.id)}
                className="flex-1 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                오늘 하루 보지 않기
              </button>
              <button
                onClick={() => close(popup.id)}
                className="flex-1 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

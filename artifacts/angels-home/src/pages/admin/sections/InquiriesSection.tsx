import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface Inquiry {
  id: number;
  type: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  details: Record<string, unknown> | null;
  status: "new" | "read" | "done";
  adminReply: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = { new: "신규", read: "확인함", done: "처리완료" };
const STATUS_COLOR: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  read: "bg-accent/20 text-accent-foreground",
  done: "bg-muted text-muted-foreground",
};

export function InquiriesSection({ type }: { type: "counsel" | "donation" | "volunteer" }) {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getInquiries(type).then(setInquiries);

  useEffect(() => {
    setInquiries(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (!inquiries) return <Loader2 className="animate-spin text-muted-foreground" />;

  if (inquiries.length === 0) {
    return <p className="text-muted-foreground">아직 접수된 신청이 없습니다.</p>;
  }

  const setStatus = async (id: number, status: "new" | "read" | "done") => {
    try {
      await adminApi.updateInquiryStatus(id, status);
      load();
    } catch (err) {
      toast({ title: "상태 변경 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 신청 내역을 삭제하시겠습니까?")) return;
    await adminApi.deleteInquiry(id);
    load();
  };

  const saveReply = async (id: number) => {
    const text = replyDrafts[id] ?? "";
    setSavingReplyId(id);
    try {
      await adminApi.updateInquiryReply(id, text);
      toast({ title: "답변이 저장되었습니다." });
      load();
    } catch (err) {
      toast({ title: "답변 저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSavingReplyId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {inquiries.map((inq) => {
        const title = typeof inq.details?.["제목"] === "string" ? (inq.details["제목"] as string) : null;
        const otherDetails = inq.details ? Object.entries(inq.details).filter(([k]) => k !== "제목") : [];
        return (
        <div key={inq.id} className="bg-secondary/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{inq.name}</span>
                <span className="text-sm text-muted-foreground">{inq.phone}</span>
                {inq.email && <span className="text-sm text-muted-foreground">{inq.email}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(inq.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[inq.status]}`}>
              {STATUS_LABEL[inq.status]}
            </span>
          </div>
          {title && <h4 className="font-semibold text-sm">{title}</h4>}
          <p className="text-sm whitespace-pre-wrap">{inq.message}</p>
          {otherDetails.length > 0 && (
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              {otherDetails.map(([k, v]) => (
                <span key={k}>
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            {(["new", "read", "done"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={inq.status === s ? "default" : "outline"}
                onClick={() => setStatus(inq.id, s)}
              >
                {STATUS_LABEL[s]}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => remove(inq.id)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-semibold text-muted-foreground">상담사 답변</label>
            <Textarea
              rows={2}
              placeholder="답변을 입력하세요 (내부 기록용)"
              value={replyDrafts[inq.id] ?? inq.adminReply ?? ""}
              onChange={(e) => setReplyDrafts((d) => ({ ...d, [inq.id]: e.target.value }))}
              className="bg-white"
            />
            <Button size="sm" onClick={() => saveReply(inq.id)} disabled={savingReplyId === inq.id}>
              {savingReplyId === inq.id ? "저장 중..." : "답변 저장"}
            </Button>
          </div>
        </div>
        );
      })}
    </div>
  );
}

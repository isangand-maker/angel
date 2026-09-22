import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown, ArrowLeft, ChevronRight } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = () => adminApi.getFaqs().then(setFaqs);

  useEffect(() => {
    load();
  }, []);

  if (!faqs) return <Loader2 className="animate-spin text-muted-foreground" />;

  const updateLocal = (id: number, patch: Partial<Faq>) => {
    setFaqs((prev) => prev!.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const save = async (faq: Faq) => {
    try {
      await adminApi.updateFaq(faq.id, faq);
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 FAQ를 삭제하시겠습니까?")) return;
    await adminApi.deleteFaq(id);
    if (viewingId === id) setViewingId(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = faqs[idx + dir];
    if (!target) return;
    const a = faqs[idx];
    await adminApi.updateFaq(a.id, { sortOrder: target.sortOrder });
    await adminApi.updateFaq(target.id, { sortOrder: a.sortOrder });
    load();
  };

  const addNew = async () => {
    const maxOrder = faqs.reduce((m, f) => Math.max(m, f.sortOrder), -1);
    const faq = await adminApi.createFaq({ question: "새 질문", answer: "", sortOrder: maxOrder + 1 });
    await load();
    setViewingId(faq.id);
  };

  const viewing = viewingId !== null ? faqs.find((f) => f.id === viewingId) : null;

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
          <Input
            value={viewing.question}
            onChange={(e) => updateLocal(viewing.id, { question: e.target.value })}
            placeholder="질문"
            className="bg-white"
          />
          <Textarea
            rows={5}
            value={viewing.answer}
            onChange={(e) => updateLocal(viewing.id, { answer: e.target.value })}
            placeholder="답변"
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
    <div className="space-y-3 max-w-3xl">
      {faqs.map((faq, idx) => (
        <div
          key={faq.id}
          onClick={() => setViewingId(faq.id)}
          className="flex items-center gap-3 bg-secondary/30 rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="disabled:opacity-30">
              <ChevronUp size={16} />
            </button>
            <button onClick={() => move(idx, 1)} disabled={idx === faqs.length - 1} className="disabled:opacity-30">
              <ChevronDown size={16} />
            </button>
          </div>
          <span className="flex-1 font-medium truncate">{faq.question || "(질문 없음)"}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              remove(faq.id);
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew}>
        <Plus size={14} className="mr-1.5" /> FAQ 추가
      </Button>
    </div>
  );
}

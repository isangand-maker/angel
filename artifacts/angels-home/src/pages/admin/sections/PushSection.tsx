import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

export function PushSection() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    adminApi.getPushAdmins().then(setAdmins).catch(() => setAdmins([]));
  }, []);

  const send = async () => {
    setSending(true);
    try {
      const result = await adminApi.sendPush({ title, body, target });
      toast({ title: `발송 완료 (${result.sent}/${result.targeted}건)` });
      setTitle("");
      setBody("");
    } catch (err) {
      toast({ title: "발송 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-sm text-muted-foreground">
        앱을 설치하고 알림을 허용한 기기로 푸시 알림을 보냅니다. 앱에서 관리자로 로그인한 적이 있는 기기는 특정 관리자를 지정해서 보낼 수 있습니다.
      </p>
      <div className="space-y-2">
        <Label>발송 대상</Label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">전체 (앱 설치 기기 전체)</option>
          {admins.map((a) => (
            <option key={a} value={a}>{a} (해당 관리자 기기)</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>제목</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 새로운 공지사항이 등록되었습니다" />
      </div>
      <div className="space-y-2">
        <Label>내용</Label>
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="알림에 표시할 내용을 입력하세요." />
      </div>
      <Button onClick={send} disabled={sending || !title || !body} className="rounded-full">
        {sending ? "발송 중..." : "푸시 알림 보내기"}
      </Button>
    </div>
  );
}

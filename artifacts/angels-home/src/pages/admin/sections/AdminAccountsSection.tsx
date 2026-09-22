import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Plus } from "lucide-react";

interface AdminAccount {
  id: number;
  username: string;
  createdAt: string;
}

export function AdminAccountsSection() {
  const [admins, setAdmins] = useState<AdminAccount[] | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { username: myUsername } = useAdminAuth();
  const { toast } = useToast();

  const load = () => adminApi.getAdmins().then(setAdmins);

  useEffect(() => {
    load();
  }, []);

  if (!admins) return <Loader2 className="animate-spin text-muted-foreground" />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await adminApi.createAdmin({ username, password });
      setUsername("");
      setPassword("");
      toast({ title: "관리자 계정이 추가되었습니다." });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "추가 실패");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 관리자 계정을 삭제하시겠습니까?")) return;
    try {
      await adminApi.deleteAdmin(id);
      load();
    } catch (err) {
      toast({ title: "삭제 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center justify-between bg-secondary/30 rounded-xl p-4">
            <div>
              <span className="font-semibold">{admin.username}</span>
              {admin.username === myUsername && (
                <span className="ml-2 text-xs text-muted-foreground">(나)</span>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(admin.createdAt).toLocaleDateString("ko-KR")} 생성
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={admin.username === myUsername}
              onClick={() => remove(admin.id)}
            >
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="bg-secondary/30 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold">관리자 계정 추가</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>아이디</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>비밀번호 (6자 이상)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="sm">
          <Plus size={14} className="mr-1.5" /> 추가
        </Button>
      </form>
    </div>
  );
}

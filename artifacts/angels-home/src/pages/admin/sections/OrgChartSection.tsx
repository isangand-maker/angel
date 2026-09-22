import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface OrgTier {
  id: string;
  label: string;
}
interface OrgBranch {
  id: string;
  afterId: string;
  label: string;
}
interface Department {
  name: string;
  roles: string[];
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizeInitial(initial: Record<string, any>): { mainChain: OrgTier[]; branches: OrgBranch[]; departments: Department[] } {
  if (Array.isArray(initial.mainChain)) {
    return {
      mainChain: initial.mainChain,
      branches: initial.branches ?? [],
      departments: initial.departments ?? [],
    };
  }
  return {
    mainChain: [
      { id: "director", label: initial.director ?? "원장" },
      { id: "officeChief", label: initial.officeChief ?? "사무국장" },
      { id: "teamLead", label: initial.teamLead ?? "팀장" },
    ],
    branches: [],
    departments: initial.departments ?? [],
  };
}

export function OrgChartSection({ initial }: { initial: Record<string, any> }) {
  const normalized = normalizeInitial(initial);
  const [mainChain, setMainChain] = useState<OrgTier[]>(normalized.mainChain);
  const [branches, setBranches] = useState<OrgBranch[]>(normalized.branches);
  const [departments, setDepartments] = useState<Department[]>(normalized.departments);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Main chain (직급 단계) ---------------------------------------------------
  const updateTier = (idx: number, label: string) => {
    setMainChain((prev) => prev.map((t, i) => (i === idx ? { ...t, label } : t)));
  };
  const addTier = () => setMainChain((prev) => [...prev, { id: genId(), label: "새 직급" }]);
  const removeTier = (idx: number) => {
    const removed = mainChain[idx];
    setMainChain((prev) => prev.filter((_, i) => i !== idx));
    setBranches((prev) => prev.filter((b) => b.afterId !== removed.id));
  };
  const moveTier = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= mainChain.length) return;
    setMainChain((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Branches (곁가지 조직, 예: 이사회) ----------------------------------------
  const branchesFor = (tierId: string) => branches.filter((b) => b.afterId === tierId);
  const addBranch = (tierId: string) => setBranches((prev) => [...prev, { id: genId(), afterId: tierId, label: "새 조직" }]);
  const updateBranch = (id: string, label: string) => setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, label } : b)));
  const removeBranch = (id: string) => setBranches((prev) => prev.filter((b) => b.id !== id));

  // Departments (하위 부서) ----------------------------------------------------
  const updateDept = (idx: number, patch: Partial<Department>) => {
    setDepartments((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };
  const addDept = () => setDepartments((prev) => [...prev, { name: "새 팀", roles: [] }]);
  const removeDept = (idx: number) => setDepartments((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ org_chart: { mainChain, branches, departments } });
      toast({ title: "저장되었습니다." });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-3">
        <Label>직급 단계 (위에서부터 순서대로, 조직이 바뀌면 자유롭게 추가·삭제·순서변경 하세요)</Label>
        {mainChain.map((tier, idx) => (
          <div key={tier.id} className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button type="button" onClick={() => moveTier(idx, -1)} disabled={idx === 0} className="disabled:opacity-30">
                  <ChevronUp size={14} />
                </button>
                <button type="button" onClick={() => moveTier(idx, 1)} disabled={idx === mainChain.length - 1} className="disabled:opacity-30">
                  <ChevronDown size={14} />
                </button>
              </div>
              <Input value={tier.label} onChange={(e) => updateTier(idx, e.target.value)} className="bg-white flex-1" placeholder="직급명" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(idx)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>

            {branchesFor(tier.id).length > 0 && (
              <div className="pl-8 space-y-2">
                {branchesFor(tier.id).map((b) => (
                  <div key={b.id} className="flex items-center gap-2">
                    <Input value={b.label} onChange={(e) => updateBranch(b.id, e.target.value)} className="bg-white flex-1 h-9" placeholder="예: 법인 이사회" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBranch(b.id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="pl-8">
              <Button type="button" variant="outline" size="sm" onClick={() => addBranch(tier.id)}>
                <Plus size={12} className="mr-1" /> 이 단계에 곁가지 조직 추가 (예: 이사회, 운영위원회)
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addTier}>
          <Plus size={14} className="mr-1.5" /> 직급 단계 추가
        </Button>
      </div>

      <div className="space-y-4">
        <Label>맨 아래 하위 부서 (실명은 넣지 않는 것을 권장합니다)</Label>
        {departments.map((dept, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-secondary/30 rounded-xl p-4">
            <div className="flex-1 space-y-2">
              <Input
                value={dept.name}
                onChange={(e) => updateDept(idx, { name: e.target.value })}
                placeholder="부서명"
                className="bg-white"
              />
              <Input
                value={dept.roles.join(", ")}
                onChange={(e) => updateDept(idx, { roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="직책 (쉼표로 구분, 예: 상담사, 상담사)"
                className="bg-white"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeDept(idx)}>
              <Trash2 size={16} className="text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addDept}>
          <Plus size={14} className="mr-1.5" /> 부서 추가
        </Button>
      </div>

      <Button onClick={save} disabled={saving} className="rounded-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

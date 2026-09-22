import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface ConsentStep {
  stepTitle: string;
  intro?: string;
  sections: { heading?: string; body: string }[];
  checkboxLabel: string;
}

interface ConsentDialogProps {
  open: boolean;
  onAgree: () => void;
  title: string;
  intro?: string;
  steps: ConsentStep[];
}

export function ConsentDialog({ open, onAgree, title, intro, steps }: ConsentDialogProps) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  if (!open) return null;

  const allChecked = steps.every((_, i) => checkedMap[i]);

  return (
    <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-8 md:p-10 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="text-primary shrink-0" size={26} />
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      {intro && <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{intro}</p>}

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="border-t border-border/50 pt-6 first:border-t-0 first:pt-0">
            <p className="font-semibold text-foreground mb-1">{step.stepTitle}</p>
            {step.intro && <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{step.intro}</p>}
            <div className="max-h-56 overflow-y-auto text-sm text-muted-foreground leading-relaxed space-y-3 border border-border/50 rounded-xl p-4 bg-secondary/20">
              {step.sections.map((s, j) => (
                <React.Fragment key={j}>
                  {s.heading && <p className="font-semibold text-foreground">{s.heading}</p>}
                  <p className="whitespace-pre-line">{s.body}</p>
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-start space-x-3 pt-3">
              <Checkbox
                id={`consent-check-${i}`}
                checked={!!checkedMap[i]}
                onCheckedChange={(v) => setCheckedMap((m) => ({ ...m, [i]: v === true }))}
                className="mt-1"
              />
              <Label htmlFor={`consent-check-${i}`} className="text-sm font-medium leading-snug">
                {step.checkboxLabel}
              </Label>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" disabled={!allChecked} onClick={onAgree} className="w-full rounded-full h-11 mt-8">
        동의하고 신청서 작성하기
      </Button>
    </div>
  );
}

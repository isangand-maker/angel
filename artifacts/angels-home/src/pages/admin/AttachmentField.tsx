import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/image-url";
import { Loader2, Paperclip, X, Upload } from "lucide-react";

interface Attachment {
  name: string;
  url: string;
}

interface AttachmentFieldProps {
  value: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export function AttachmentField({ value, onChange }: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url, name } = await adminApi.uploadAttachment(file);
      onChange([...value, { name, url }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">첨부파일</p>
      <div className="space-y-1.5">
        {value.map((att, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 text-sm">
            <Paperclip size={13} className="text-muted-foreground shrink-0" />
            <a href={resolveImageUrl(att.url)} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline">
              {att.name}
            </a>
            <button type="button" onClick={() => remove(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Upload size={14} className="mr-1.5" />}
        파일 첨부
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TOOLBAR_BUTTONS = [
  { command: "bold", icon: Bold, label: "굵게" },
  { command: "italic", icon: Italic, label: "기울임" },
  { command: "underline", icon: Underline, label: "밑줄" },
  { command: "insertUnorderedList", icon: List, label: "목록" },
  { command: "insertOrderedList", icon: ListOrdered, label: "번호 목록" },
];

const ALIGN_BUTTONS = [
  { command: "justifyLeft", icon: AlignLeft, label: "왼쪽 정렬" },
  { command: "justifyCenter", icon: AlignCenter, label: "가운데 정렬" },
  { command: "justifyRight", icon: AlignRight, label: "오른쪽 정렬" },
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (editorRef.current && isFirstRender.current) {
      editorRef.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  const exec = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const handleLink = () => {
    const url = window.prompt("링크 주소를 입력하세요.");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-1 p-2 border-b border-border/50 bg-secondary/20">
        {TOOLBAR_BUTTONS.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(command)}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Icon size={15} />
          </button>
        ))}
        <button
          type="button"
          title="링크"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <LinkIcon size={15} />
        </button>
        <span className="w-px h-5 bg-border mx-1" />
        {ALIGN_BUTTONS.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(command)}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="min-h-[160px] max-h-[400px] overflow-y-auto p-4 text-sm leading-relaxed focus:outline-none prose prose-sm max-w-none"
      />
    </div>
  );
}

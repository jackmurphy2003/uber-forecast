"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "uber-forecast-text-edits";

export function getSavedEdits(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function clearAllEdits() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

export function saveEdit(id: string, value: string) {
  const edits = getSavedEdits();
  edits[id] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  window.dispatchEvent(new Event("uber-edits-changed"));
}

export default function EditableText({
  id,
  children,
  className,
  style,
}: {
  id: string;
  children: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [text, setText] = useState(children);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const saved = getSavedEdits()[id];
    if (saved !== undefined) setText(saved);
  }, [id]);

  function commit() {
    const newText = ref.current?.innerText?.trim() ?? text;
    if (newText && newText !== text) {
      setText(newText);
      saveEdit(id, newText);
    } else if (ref.current) {
      ref.current.innerText = text;
    }
    setEditing(false);
  }

  function startEdit() {
    setEditing(true);
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{
        ...style,
        cursor: editing ? "text" : "default",
        borderRadius: 3,
        outline: editing
          ? "2px solid #06C167"
          : hovered
          ? "1px dashed rgba(6,193,103,0.45)"
          : "none",
        outlineOffset: 3,
        display: "inline",
      }}
      contentEditable={editing}
      suppressContentEditableWarning
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={startEdit}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ref.current?.blur(); }
        if (e.key === "Escape") {
          if (ref.current) ref.current.innerText = text;
          setEditing(false);
          ref.current?.blur();
        }
      }}
    >
      {text}
    </span>
  );
}

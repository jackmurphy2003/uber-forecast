"use client";

import { useEffect, useRef, useState } from "react";

// Temporary local-only text-edit tool. Click "Edit text" to make every piece of
// visible copy editable in place; "Save changes" writes a before/after diff to
// text-edits.json at the repo root for manual review, nothing auto-patches source.
// Delete this file + app/api/dev-edits + text-edits.json when the rewrite is done.

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "SVG", "PATH", "INPUT", "TEXTAREA"]);

function collectLeaves(root: Element, exclude: Element | null, out: HTMLElement[]) {
  for (const child of Array.from(root.children)) {
    if (child === exclude) continue;
    if (SKIP_TAGS.has(child.tagName)) continue;
    if (child.closest("svg")) continue;
    if (child.children.length === 0) {
      const text = child.textContent?.trim();
      if (text) out.push(child as HTMLElement);
      continue;
    }
    collectLeaves(child, exclude, out);
  }
}

export default function DevEditMode() {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    if (!editing) return;

    function makeEditable(el: HTMLElement) {
      if (leavesRef.current.has(el)) return;
      el.dataset.origText = el.textContent ?? "";
      el.contentEditable = "true";
      el.style.outline = "1px dashed rgba(6,193,103,0.6)";
      el.style.outlineOffset = "2px";
      el.style.cursor = "text";
      leavesRef.current.add(el);
    }

    function scan() {
      const fresh: HTMLElement[] = [];
      collectLeaves(document.body, widgetRef.current, fresh);
      fresh.forEach(makeEditable);
    }

    // Initial pass, then re-scan on every DOM change so tab switches
    // (which swap out entire subtrees client-side) stay editable too.
    scan();
    const observer = new MutationObserver(() => scan());
    observer.observe(document.body, { childList: true, subtree: true });

    const leaves = leavesRef.current;
    return () => {
      observer.disconnect();
      leaves.forEach((el) => {
        if (!el.isConnected) return;
        el.contentEditable = "false";
        el.style.outline = "";
        el.style.cursor = "";
      });
    };
  }, [editing]);

  async function handleSave() {
    const edits = Array.from(leavesRef.current)
      .map((el) => ({
        original: el.dataset.origText ?? "",
        edited: el.textContent ?? "",
        tag: el.tagName.toLowerCase(),
      }))
      .filter((e) => e.original.trim() !== e.edited.trim());

    leavesRef.current.clear();

    if (edits.length === 0) {
      setStatus("No changes made");
      setEditing(false);
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    await fetch("/api/dev-edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edits }),
    });
    setStatus(`Saved ${edits.length} change${edits.length === 1 ? "" : "s"} to text-edits.json`);
    setEditing(false);
    setTimeout(() => setStatus(""), 5000);
  }

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      ref={widgetRef}
      style={{
        position: "fixed",
        bottom: 76,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {status && (
        <div
          style={{
            background: "#0A0A0A",
            color: "#FFFFFF",
            fontSize: 12,
            padding: "8px 12px",
            borderRadius: 8,
            maxWidth: 240,
          }}
        >
          {status}
        </div>
      )}
      {editing ? (
        <button
          onClick={handleSave}
          style={{
            background: "#06C167",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          Save changes
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          style={{
            background: "#0A0A0A",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          Edit text
        </button>
      )}
    </div>
  );
}

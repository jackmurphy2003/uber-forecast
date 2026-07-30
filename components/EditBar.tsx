"use client";

import { useState, useEffect } from "react";
import { getSavedEdits, clearAllEdits } from "./EditableText";

export default function EditBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(Object.keys(getSavedEdits()).length);
    const handler = () => setCount(Object.keys(getSavedEdits()).length);
    window.addEventListener("uber-edits-changed", handler);
    return () => window.removeEventListener("uber-edits-changed", handler);
  }, []);

  return (
    <div
      className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11.5px] font-medium select-none"
      style={{
        background: "#0A0A0A",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        color: "#9B9B9B",
      }}
    >
      <span>Double-click any text to edit</span>
      {count > 0 && (
        <>
          <span
            className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
            style={{ background: "rgba(6,193,103,0.15)", color: "#06C167" }}
          >
            {count} saved
          </span>
          <button
            onClick={clearAllEdits}
            className="font-semibold transition-colors duration-100"
            style={{ color: "#FF5555", cursor: "pointer" }}
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

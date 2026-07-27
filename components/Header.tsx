"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

const NAV = [
  { href: "/", label: "Forecast" },
  { href: "/methodology", label: "Methodology" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="flex-none h-11 flex items-center justify-between px-5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: "#FAFAFA" }}>
            UBER Q2&apos;26F
          </span>
          <span className="hidden sm:block text-[11px]" style={{ color: "#3F3F46" }}>/</span>
          <span className="hidden sm:block text-[11px]" style={{ color: "#3F3F46" }}>
            forecast model
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors duration-100"
                style={{
                  color: active ? "#FAFAFA" : "#52525B",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="flex items-center gap-1.5 text-[11px] font-medium"
        style={{
          color: "#4ADE80",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: "6px",
          padding: "4px 10px",
          background: "rgba(74,222,128,0.06)",
        }}
      >
        <Lock size={10} strokeWidth={1.5} />
        Locked before Aug 5 earnings
      </div>
    </header>
  );
}

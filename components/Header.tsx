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
      className="flex-none h-16 flex items-center justify-between px-6 md:px-10"
      style={{ background: "#0A0A0A" }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] font-extrabold tracking-tight" style={{ color: "#FFFFFF" }}>
            UBER Q2&apos;26F
          </span>
          <span className="hidden sm:block text-[12px]" style={{ color: "#6B6B6B" }}>/</span>
          <span className="hidden sm:block text-[12px]" style={{ color: "#9B9B9B" }}>
            forecast model
          </span>
        </div>
        <nav className="flex items-center gap-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150"
                style={{
                  color: active ? "#0A0A0A" : "#C4C4C4",
                  background: active ? "#06C167" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="flex items-center gap-1.5 text-[11.5px] font-semibold"
        style={{
          color: "#3DDB94",
          border: "1px solid rgba(6,193,103,0.35)",
          borderRadius: "999px",
          padding: "5px 12px",
          background: "rgba(6,193,103,0.12)",
        }}
      >
        <Lock size={10} strokeWidth={2} />
        Locked before Aug 5 earnings
      </div>
    </header>
  );
}

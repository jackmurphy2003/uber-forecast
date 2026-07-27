"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Suspense } from "react";

const HOME_TABS = [
  { tab: "forecast", label: "Forecast" },
  { tab: "trends", label: "Historical Trends" },
  { tab: "sandbox", label: "Sandbox" },
];

function NavItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "forecast";

  return (
    <nav className="flex items-center gap-1">
      {HOME_TABS.map(({ tab, label }) => {
        const active = pathname === "/" && currentTab === tab;
        return (
          <Link
            key={tab}
            href={`/?tab=${tab}`}
            className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150 whitespace-nowrap"
            style={{
              color: active ? "#0A0A0A" : "#C4C4C4",
              background: active ? "#06C167" : "transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/methodology"
        className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150"
        style={{
          color: pathname === "/methodology" ? "#0A0A0A" : "#C4C4C4",
          background: pathname === "/methodology" ? "#06C167" : "transparent",
        }}
      >
        Methodology
      </Link>
    </nav>
  );
}

export default function Header() {
  return (
    <div
      className="fixed top-4 left-1/2 z-50 flex items-center gap-4 overflow-x-auto scrollbar-none"
      style={{
        transform: "translateX(-50%)",
        background: "rgba(10,10,10,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "999px",
        padding: "7px 10px 7px 18px",
        boxShadow: "0 4px 28px rgba(0,0,0,0.22)",
        maxWidth: "calc(100vw - 32px)",
        whiteSpace: "nowrap",
      }}
    >
      <span className="text-[13px] font-extrabold tracking-tight flex-shrink-0" style={{ color: "#FFFFFF" }}>
        UBER Q2&apos;26F
      </span>

      <Suspense fallback={<nav className="flex items-center gap-0.5" />}>
        <NavItems />
      </Suspense>

      <div
        className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold"
        style={{
          color: "#3DDB94",
          border: "1px solid rgba(6,193,103,0.35)",
          borderRadius: "999px",
          padding: "4px 11px",
          background: "rgba(6,193,103,0.1)",
        }}
      >
        <Lock size={10} strokeWidth={2} />
        <span className="hidden sm:block">Locked Aug 5</span>
      </div>
    </div>
  );
}

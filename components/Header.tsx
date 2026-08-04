"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

const NAV_ITEMS = [
  { tab: "forecast",   href: "/?tab=forecast",   label: "Forecast"    },
  { tab: "trends",     href: "/?tab=trends",     label: "Trends & Assumptions" },
  { tab: "sandbox",    href: "/?tab=sandbox",    label: "Sandbox"     },
  { tab: "notes",      href: "/methodology",      label: "Notes" },
  { tab: "scorecard",  href: "/?tab=scorecard",  label: "Scorecard"   },
];

function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "forecast";

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.href === "/methodology") return pathname === "/methodology";
    return pathname === "/" && currentTab === item.tab;
  }

  return (
    <nav className="hidden md:flex items-center h-full">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex items-center h-full px-4 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150"
            style={{ color: active ? "#FFFFFF" : "#666666" }}
          >
            {item.label}
            {active && (
              <span
                className="absolute bottom-0 left-4 right-4"
                style={{ height: "2px", background: "#06C167", borderRadius: "2px 2px 0 0" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex-none flex items-center justify-between px-5 md:px-10"
      style={{
        height: 48,
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-8 h-full">
        <span
          className="text-[12px] md:text-[13px] font-extrabold tracking-tight flex-shrink-0"
          style={{ color: "#FFFFFF", letterSpacing: "0.04em" }}
        >
          UBER Q2&apos;26F
        </span>
        <Suspense fallback={<nav className="hidden md:flex" />}>
          <DesktopNav />
        </Suspense>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <a
          href="https://docs.google.com/spreadsheets/d/1ance72j6Z2G-qvO7fV0fTTLRFyQJOeBf_qKsaCppsTU/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-bold transition-all duration-150"
          style={{
            fontSize: 11,
            color: "#06C167",
            border: "1px solid rgba(6,193,103,0.4)",
            borderRadius: "6px",
            padding: "4px 9px",
            background: "rgba(6,193,103,0.1)",
          }}
        >
          <span className="hidden sm:inline">Full Model</span>
          <span className="sm:hidden">Model</span>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1 8L8 1M8 1H3M8 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <div
          className="hidden sm:flex items-center gap-1.5 font-semibold"
          style={{
            fontSize: 11,
            color: "#3DDB94",
            border: "1px solid rgba(6,193,103,0.3)",
            borderRadius: "6px",
            padding: "4px 10px",
            background: "rgba(6,193,103,0.08)",
          }}
        >
          <Lock size={10} strokeWidth={2} />
          <span>Reports Aug 5</span>
        </div>
      </div>
    </header>
  );
}

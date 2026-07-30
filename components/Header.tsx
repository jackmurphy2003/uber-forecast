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

  const allItems = [
    ...HOME_TABS.map(({ tab, label }) => ({
      href: `/?tab=${tab}`,
      label,
      active: pathname === "/" && currentTab === tab,
    })),
    {
      href: "/methodology",
      label: "Methodology",
      active: pathname === "/methodology",
    },
  ];

  return (
    <nav className="flex items-center h-14">
      {allItems.map(({ href, label, active }) => (
        <Link
          key={href}
          href={href}
          className="relative flex items-center h-full px-4 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150"
          style={{ color: active ? "#FFFFFF" : "#666666" }}
        >
          {label}
          {active && (
            <span
              className="absolute bottom-0 left-4 right-4"
              style={{ height: "2px", background: "#06C167", borderRadius: "2px 2px 0 0" }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex-none h-14 flex items-center justify-between px-6 md:px-10"
      style={{
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-8">
        <span className="text-[13px] font-extrabold tracking-tight flex-shrink-0" style={{ color: "#FFFFFF", letterSpacing: "0.02em" }}>
          UBER Q2&apos;26F
        </span>
        <Suspense fallback={<nav className="flex items-center" />}>
          <NavItems />
        </Suspense>
      </div>

      <div
        className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold"
        style={{
          color: "#3DDB94",
          border: "1px solid rgba(6,193,103,0.3)",
          borderRadius: "6px",
          padding: "4px 10px",
          background: "rgba(6,193,103,0.08)",
        }}
      >
        <Lock size={10} strokeWidth={2} />
        <span>Locked Aug 5</span>
      </div>
    </header>
  );
}

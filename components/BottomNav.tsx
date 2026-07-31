"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart2, TrendingUp, Sliders, FileText } from "lucide-react";

const NAV_ITEMS = [
  { tab: "forecast", href: "/?tab=forecast", label: "Forecast", icon: BarChart2  },
  { tab: "trends",   href: "/?tab=trends",   label: "Trends",   icon: TrendingUp },
  { tab: "sandbox",  href: "/?tab=sandbox",  label: "Sandbox",  icon: Sliders    },
  { tab: "notes",    href: "/methodology",    label: "Notes",    icon: FileText   },
];

function BottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "forecast";

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.href === "/methodology") return pathname === "/methodology";
    return pathname === "/" && currentTab === item.tab;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-stretch"
      style={{
        background: "rgba(10,10,10,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-150"
            style={{ color: active ? "#06C167" : "#555555" }}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 1.75} />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: "0.04em", lineHeight: 1 }}>
              {item.label.toUpperCase()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}

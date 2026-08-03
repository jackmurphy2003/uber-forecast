"use client";

import { useEffect, useRef, useState } from "react";
import { runForecast } from "@/lib/forecast";
import { DRIVERS } from "@/lib/assumptions";
import { fmtB } from "@/lib/format";

const BASE_INPUTS = {
  mapcGrowth: DRIVERS.mapcGrowth.value,
  tripsPerMapcGrowth: DRIVERS.tripsPerMapcGrowth.value,
  gbPerTrip: DRIVERS.gbPerTrip.value,
  ebitdaMargin: DRIVERS.ebitdaMarginBase.value,
  mobilityMix: DRIVERS.mobilityMix.value,
  deliveryMix: DRIVERS.deliveryMix.value,
  mobilityTakeRate: DRIVERS.mobilityTakeRate.value,
  deliveryTakeRate: DRIVERS.deliveryTakeRate.value,
  freightTakeRate: DRIVERS.freightTakeRate.value,
  mobilityOpMargin: DRIVERS.mobilityOpMargin.value,
  deliveryOpMargin: DRIVERS.deliveryOpMargin.value,
  freightOpIncome: DRIVERS.freightOpIncome.value,
  corpGA: DRIVERS.corpGA.value,
};

const result = runForecast(BASE_INPUTS);
const MOB_GB = result.mobilityGB;   // ~27.84B
const DEL_GB = result.deliveryGB;   // ~27.90B
const MOB_OP = result.mobilityNGOP; // ~2.08B
const DEL_OP = result.deliveryNGOP; // ~1.00B
const MAX_GB = Math.max(MOB_GB, DEL_GB) * 1.06; // scale with breathing room
const GAP_M = Math.round(DEL_GB - MOB_GB); // already in $M

function fmtPctLabel(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export default function CrossoverHero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // small delay so the bar width transition is visible after paint
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delPct = mounted ? (DEL_GB / MAX_GB) * 100 : 0;
  const mobPct = mounted ? (MOB_GB / MAX_GB) * 100 : 0;

  const mobOpMargin = fmtPctLabel(DRIVERS.mobilityOpMargin.value);
  const delOpMargin = fmtPctLabel(DRIVERS.deliveryOpMargin.value);

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        padding: "18px 22px 16px",
      }}
    >
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="text-[10px] font-black tracking-[0.10em] uppercase"
            style={{ color: "#9B9B9B" }}
          >
            The Crossover
          </span>
          <span
            className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(6,193,103,0.1)", color: "#04964F" }}
          >
            Q2&apos;26F · Base Case
          </span>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "#9B9B9B" }}>
          Gross Bookings
        </span>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-2.5 relative">

        {/* Delivery row */}
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-semibold flex-shrink-0"
            style={{ width: 64, color: "#3A3A3A" }}
          >
            Delivery
          </span>
          <div className="flex-1 relative h-7 flex items-center">
            <div
              style={{
                width: `${delPct}%`,
                height: 26,
                background: "#06C167",
                borderRadius: 5,
                transition: "width 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                position: "relative",
              }}
            />
          </div>
          <span
            className="tnum text-[12px] font-bold flex-shrink-0"
            style={{ width: 60, textAlign: "right", color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}
          >
            {fmtB(DEL_GB)}
          </span>
          <span
            className="tnum text-[10.5px] font-semibold flex-shrink-0"
            style={{ width: 36, textAlign: "right", color: "#06C167", fontFamily: "var(--font-geist-mono)" }}
          >
            +23%
          </span>
        </div>

        {/* Gap callout — floats between the two rows */}
        <div className="flex items-center gap-3">
          <div style={{ width: 64 }} />
          <div className="flex-1 flex items-center" style={{ height: 18 }}>
            <div
              style={{
                width: mounted ? `${delPct}%` : 0,
                transition: "width 700ms cubic-bezier(0.25, 1, 0.5, 1)",
                position: "relative",
                height: "100%",
              }}
            >
              {/* gap label at the right edge */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center gap-1"
                style={{ pointerEvents: "none" }}
              >
                <span
                  className="tnum text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap"
                  style={{
                    background: "rgba(6,193,103,0.12)",
                    color: "#04964F",
                    fontFamily: "var(--font-geist-mono)",
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 400ms ease 500ms",
                  }}
                >
                  ▲ ${GAP_M}M ahead
                </span>
              </div>
            </div>
          </div>
          <div style={{ width: 60 }} />
          <div style={{ width: 36 }} />
        </div>

        {/* Mobility row */}
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-semibold flex-shrink-0"
            style={{ width: 64, color: "#3A3A3A" }}
          >
            Mobility
          </span>
          <div className="flex-1 relative h-7 flex items-center">
            <div
              style={{
                width: `${mobPct}%`,
                height: 26,
                background: "#D5D5D5",
                borderRadius: 5,
                transition: "width 700ms cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            />
          </div>
          <span
            className="tnum text-[12px] font-bold flex-shrink-0"
            style={{ width: 60, textAlign: "right", color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}
          >
            {fmtB(MOB_GB)}
          </span>
          <span
            className="tnum text-[10.5px] font-semibold flex-shrink-0"
            style={{ width: 36, textAlign: "right", color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}
          >
            +20%
          </span>
        </div>
      </div>

      {/* Interpretation line */}
      <div
        className="mt-4 pt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        <p className="text-[11px] leading-relaxed flex-1 min-w-[200px]" style={{ color: "#6B6B6B" }}>
          Volume parity ≠ profit parity. Mobility generates{" "}
          <span style={{ color: "#0A0A0A", fontWeight: 600 }}>2.1× higher op income</span>{" "}
          on equal bookings ({fmtB(MOB_OP)} vs {fmtB(DEL_OP)}).
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: "#D5D5D5" }}
            />
            <span className="text-[10.5px]" style={{ color: "#9B9B9B" }}>
              Mob op margin{" "}
              <span className="font-semibold" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>
                {mobOpMargin}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: "#06C167" }}
            />
            <span className="text-[10.5px]" style={{ color: "#9B9B9B" }}>
              Del op margin{" "}
              <span className="font-semibold" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>
                {delOpMargin}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

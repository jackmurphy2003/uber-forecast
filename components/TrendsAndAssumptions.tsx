"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  MAPC_SERIES,
  TRIPS_PER_MAPC_SERIES,
  GB_PER_TRIP_SERIES,
  TAKE_RATE_SERIES,
  EBITDA_MARGIN_SERIES,
  MIX_SERIES,
  SEGMENT_TAKE_RATE_SERIES,
  SEGMENT_OP_MARGIN_SERIES,
} from "@/lib/historical";

const GREEN = "#06C167";
const BLACK = "#0A0A0A";
const GRAY = "#B5B5B5";
const AXIS_STYLE = { fontSize: 9.5, fill: "#9B9B9B" };
const GRID_COLOR = "rgba(0,0,0,0.06)";
const TOOLTIP_STYLE = {
  background: "#FFFFFF",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 10,
  fontSize: 11,
  fontFamily: "var(--font-geist-mono)",
  padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function pctTick(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

function ChartCard({
  chartKey,
  title,
  badge,
  badgeTone = "flat",
  legend,
  annotation,
  children,
  activeKey,
  onHover,
  onClick,
}: {
  chartKey: string;
  title: string;
  badge: string;
  badgeTone?: "up" | "flat" | "mixed";
  legend?: { label: string; color: string }[];
  annotation?: string;
  children: React.ReactNode;
  activeKey: string | null;
  onHover: (key: string | null) => void;
  onClick: (key: string | null) => void;
}) {
  const highlighted = activeKey === chartKey;
  const dimmed = activeKey !== null && activeKey !== chartKey;

  const badgeColors = {
    up:    { bg: "rgba(6,193,103,0.1)",  text: "#04964F" },
    flat:  { bg: "rgba(0,0,0,0.05)",     text: "#6B6B6B" },
    mixed: { bg: "rgba(245,158,11,0.1)", text: "#B45309" },
  };
  const { bg, text } = badgeColors[badgeTone];

  return (
    <div
      data-chart-key={chartKey}
      onMouseEnter={() => onHover(chartKey)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(chartKey)}
      style={{ cursor: "pointer",
        background: "#FFFFFF",
        border: highlighted ? "1.5px solid rgba(6,193,103,0.4)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: 16,
        boxShadow: highlighted
          ? "0 12px 40px rgba(6,193,103,0.14), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        opacity: dimmed ? 0.35 : 1,
        transform: highlighted ? "translateY(-4px) scale(1.012)" : "none",
        transition: "all 0.2s ease",
        position: "relative",
        zIndex: highlighted ? 10 : 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h4 style={{ fontSize: 11.5, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>{title}</h4>
        <span style={{
          fontSize: 9, fontWeight: 700,
          padding: "2px 7px", borderRadius: 999,
          background: bg, color: text,
          whiteSpace: "nowrap",
        }}>{badge}</span>
      </div>

      {legend && (
        <div style={{ display: "flex", gap: 10 }}>
          {legend.map((l) => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#6B6B6B" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ width: "100%", height: 95 }}>{children}</div>

      {annotation && (
        <div style={{
          fontSize: 9.5, fontWeight: 600,
          fontFamily: "var(--font-geist-mono)",
          color: highlighted ? "#059669" : "#6B6B6B",
          background: highlighted ? "rgba(6,193,103,0.07)" : "rgba(0,0,0,0.04)",
          padding: "3px 8px", borderRadius: 6,
          transition: "all 0.2s ease",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {annotation}
        </div>
      )}
    </div>
  );
}

function AssumptionCard({
  label,
  value,
  delta,
  drivers,
  chartKey,
  activeKey,
  onHover,
  onClick,
}: {
  label: string;
  value: string;
  delta: string;
  drivers: string[];
  chartKey: string | null;
  activeKey: string | null;
  onHover: (key: string | null) => void;
  onClick: (key: string | null) => void;
}) {
  const isActive = chartKey !== null && activeKey === chartKey;
  const isDimmed = activeKey !== null && activeKey !== chartKey;

  return (
    <div
      onMouseEnter={() => { if (chartKey) onHover(chartKey); }}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(chartKey)}
      style={{
        background: isActive ? "rgba(6,193,103,0.04)" : "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.07)",
        borderLeft: isActive ? "3px solid #06C167" : "1px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "9px 13px",
        opacity: isDimmed ? 0.35 : 1,
        transition: "all 0.15s ease",
        cursor: chartKey ? "pointer" : "default",
      }}
    >
      {/* Line 1: label + value */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#059669" : "#3A3A3A", lineHeight: 1.3 }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: isActive ? "#064E3B" : "#0A0A0A", flexShrink: 0 }}>
          {value}
        </span>
      </div>
      {/* Line 2: trend delta */}
      <p style={{ fontSize: 10.5, color: "#6B6B6B", margin: "0 0 5px 0", lineHeight: 1.35 }}>
        {delta}
      </p>
      {/* Line 3: driver badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {drivers.map((d) => (
          <span key={d} style={{
            fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
            background: isActive ? "rgba(6,193,103,0.1)" : "rgba(0,0,0,0.05)",
            color: isActive ? "#059669" : "#6B6B6B",
          }}>{d}</span>
        ))}
        {!chartKey && (
          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,0.04)", color: "#C0C0C0" }}>
            no chart
          </span>
        )}
      </div>
    </div>
  );
}

const ASSUMPTIONS = [
  {
    key: "mapcGrowth",
    label: "MAPC Growth Rate",
    value: "17.5%",
    delta: "▲ Accelerating · Q1'26A: +17% vs ~14% prior year",
    drivers: ["Uber One 50M members", "7 new markets"],
    chartKey: "mapc",
  },
  {
    key: "tripsPerMapcGrowth",
    label: "Trips / MAPC Growth",
    value: "+3.0% YoY",
    delta: "→ Stable 7Q band · +2% to +4%",
    drivers: ["No deceleration signal", "Q1'26A: +3.0%"],
    chartKey: "trips",
  },
  {
    key: "gbPerTrip",
    label: "GB per Trip",
    value: "$14.43",
    delta: "→ 12Q mean · band $14.10–$14.75",
    drivers: ["Mix tailwind", "Affordability headwind"],
    chartKey: "gb-per-trip",
  },
  {
    key: "ebitdaMargin",
    label: "Adj EBITDA Margin",
    value: "4.85%",
    delta: "▲ +0.43pp avg YoY · base: Q2'25 at 4.53%",
    drivers: ["Insurance savings tailwind"],
    chartKey: "ebitda",
  },
  {
    key: "mobilityMix",
    label: "Mobility GB Mix",
    value: "48.8%",
    delta: "▼ Declining every quarter · Q1'26A: 49.1%",
    drivers: ["Del growing faster", "Mob GB +20% YoY"],
    chartKey: "segment-mix",
  },
  {
    key: "deliveryMix",
    label: "Delivery GB Mix",
    value: "48.9%",
    delta: "▲ Rising every quarter · Del +23% vs Mob +20%",
    drivers: ["Suburban expansion", "Modeled crossover"],
    chartKey: "segment-mix",
  },
  {
    key: "freightMix",
    label: "Freight GB Mix",
    value: "2.3%",
    delta: "→ Flat from Q2'25 baseline",
    drivers: ["Q1'26 growth ≠ trend yet"],
    chartKey: "segment-mix",
  },
  {
    key: "mobilityTakeRate",
    label: "Mobility Take Rate",
    value: "25.8%",
    delta: "▼ UK business model change · structural, holds in Q2",
    drivers: ["Q1'26A: 25.8%", "Contra-revenue, not a one-off"],
    chartKey: "segment-take-rates",
  },
  {
    key: "deliveryTakeRate",
    label: "Delivery Take Rate",
    value: "19.3%",
    delta: "▲ Trending up · 3Q clean avg (Q3'25–Q1'26)",
    drivers: ["19.2% → 19.2% → 19.5%", "No reclass impact"],
    chartKey: "segment-take-rates",
  },
  {
    key: "freightTakeRate",
    label: "Freight Take Rate",
    value: "100.2%",
    delta: "→ 12Q avg 100.15% · Rev ≈ GB",
    drivers: ["Freight rev historically ≥ GB"],
    chartKey: "take-rate",
  },
  {
    key: "mobilityOpMargin",
    label: "Mobility Op Margin",
    value: "7.5%",
    delta: "▲ Trending up · Q1'26A: 7.7%",
    drivers: ["7.1% → 7.5% → 7.4% → 7.7%"],
    chartKey: "segment-op-margins",
  },
  {
    key: "deliveryOpMargin",
    label: "Delivery Op Margin",
    value: "3.6%",
    delta: "▲ Trending up · Q1'26A: 3.7%",
    drivers: ["3.2% → 3.3% → 3.6% → 3.7%", "Conservative vs Q1'26"],
    chartKey: "segment-op-margins",
  },
  {
    key: "freightOpIncome",
    label: "Freight Op Income",
    value: "($28M)",
    delta: "→ 4Q avg −$28.5M · range −$18M to −$41M",
    drivers: ["Q4'24 –$41M", "Q4'25 –$18M", "Q1'26 –$30M"],
    chartKey: "segment-op-margins",
  },
  {
    key: "corpGA",
    label: "Corp G&A + Platform R&D",
    value: "($1,097M)",
    delta: "→ Avg Q4'25/Q1'26 + modest QoQ growth",
    drivers: ["–$996M Q4'25", "–$1,077M Q1'26"],
    chartKey: null,
  },
];

export default function TrendsAndAssumptions() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [lockedKey, setLockedKey] = useState<string | null>(null);

  const activeKey = lockedKey ?? hoveredKey;

  const col1 = ASSUMPTIONS.slice(0, 7);
  const col2 = ASSUMPTIONS.slice(7);

  function handleHover(key: string | null) {
    if (!lockedKey) setHoveredKey(key);
  }

  function handleClick(key: string | null) {
    setLockedKey((prev) => (prev === key ? null : key));
  }

  useEffect(() => {
    if (!activeKey) return;
    const el = document.querySelector(`[data-chart-key="${activeKey}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeKey]);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Trends &amp; Assumptions
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Q2&apos;23 – Q1&apos;26 actuals &middot; hover or click an assumption to highlight its chart
        </p>
      </div>

      {/* Desktop: side-by-side panels */}
      <div className="hidden lg:grid gap-5" style={{ gridTemplateColumns: "320px 1fr", height: "calc(100vh - 170px)" }}>

        {/* Left: assumptions */}
        <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="mb-3">
            <h3 className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>Model Assumptions</h3>
            <p className="text-[10.5px]" style={{ color: "#B5B5B5" }}>Hover to highlight chart, click to lock</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {ASSUMPTIONS.map(({ key, ...a }) => (
              <AssumptionCard key={key} {...a} activeKey={activeKey} onHover={handleHover} onClick={handleClick} />
            ))}
          </div>
        </div>

        {/* Right: charts */}
        <div className="overflow-y-auto pl-1" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-2 gap-3">
            <ChartCard chartKey="mapc" title="MAPCs" badge="↑ Accelerating" badgeTone="up" annotation="Q2'26F: +17.5% YoY growth" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
              <ResponsiveContainer>
                <LineChart data={MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(0)}M`, "MAPCs"]} />
                  <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="trips" title="Monthly Trips / MAPC" badge="→ Stable" annotation="Q2'26F: +3.0% YoY assumed" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
              <ResponsiveContainer>
                <LineChart data={TRIPS_PER_MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.2", "dataMax + 0.2"]} tickFormatter={(v: number) => v.toFixed(1)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(2)}x`, "Trips/MAPC"]} />
                  <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="gb-per-trip" title="Gross Bookings / Trip" badge="→ Range-bound" annotation="Assumed: $14.43 (12Q mean)" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
              <ResponsiveContainer>
                <LineChart data={GB_PER_TRIP_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.3", "dataMax + 0.3"]} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "GB/Trip"]} />
                  <Line type="monotone" dataKey="value" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="take-rate" title="Consolidated Take Rate" badge="⚠ See notes" badgeTone="mixed" annotation="Q1'26 step-down is structural (UK change) · Q2'26F: 24.3%" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
              <ResponsiveContainer>
                <LineChart data={TAKE_RATE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.01", "dataMax + 0.01"]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "Take Rate"]} />
                  <Line type="monotone" dataKey="value" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="ebitda" title="Adj EBITDA Margin" badge="↑ Expanding" badgeTone="up" annotation="Q2'26F: 4.85% (+0.43pp YoY expansion)" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
              <ResponsiveContainer>
                <LineChart data={EBITDA_MARGIN_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.005", "dataMax + 0.005"]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "EBITDA Margin"]} />
                  <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="segment-mix" title="Segment GB Mix" badge="↑ Delivery accelerating" badgeTone="up" annotation="Q2'26F: Mob 48.8% / Del 48.9% (crossover modeled)" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
              legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }, { label: "Freight", color: GRAY }]}
            >
              <ResponsiveContainer>
                <LineChart data={MIX_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
                  <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="freight" name="Freight" stroke={GRAY} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="segment-take-rates" title="Segment Take Rates" badge="↑ Delivery rising" badgeTone="up" annotation="Q2'26F: Mob 25.8% / Del 19.3%" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
              legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }]}
            >
              <ResponsiveContainer>
                <LineChart data={SEGMENT_TAKE_RATE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
                  <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard chartKey="segment-op-margins" title="Segment Op Margins" badge="↑ Both rising" badgeTone="up" annotation="Q2'26F: Mob 7.5% / Del 3.6%" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
              legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }]}
            >
              <ResponsiveContainer>
                <LineChart data={SEGMENT_OP_MARGIN_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
                  <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: stacked */}
      <div className="lg:hidden">
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <ChartCard chartKey="mapc" title="MAPCs" badge="↑ Accelerating" badgeTone="up" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
          <ResponsiveContainer>
            <LineChart data={MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(0)}M`, "MAPCs"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard chartKey="trips" title="Monthly Trips / MAPC" badge="→ Stable" badgeTone="flat" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
          <ResponsiveContainer>
            <LineChart data={TRIPS_PER_MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.2", "dataMax + 0.2"]} tickFormatter={(v: number) => v.toFixed(1)} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(2)}x`, "Trips/MAPC"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard chartKey="gb-per-trip" title="Gross Bookings / Trip" badge="→ Range-bound" badgeTone="flat" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
          <ResponsiveContainer>
            <LineChart data={GB_PER_TRIP_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.3", "dataMax + 0.3"]} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "GB/Trip"]} />
              <Line type="monotone" dataKey="value" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard chartKey="take-rate" title="Consolidated Take Rate" badge="⚠ See notes" badgeTone="mixed" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
          <ResponsiveContainer>
            <LineChart data={TAKE_RATE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.01", "dataMax + 0.01"]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "Take Rate"]} />
              <Line type="monotone" dataKey="value" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard chartKey="ebitda" title="Adj EBITDA Margin" badge="↑ Expanding" badgeTone="up" activeKey={activeKey} onHover={handleHover} onClick={handleClick}>
          <ResponsiveContainer>
            <LineChart data={EBITDA_MARGIN_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.005", "dataMax + 0.005"]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "EBITDA Margin"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          chartKey="segment-mix" title="Segment GB Mix" badge="↑ Delivery accelerating" badgeTone="up" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
          legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }, { label: "Freight", color: GRAY }]}
        >
          <ResponsiveContainer>
            <LineChart data={MIX_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="freight" name="Freight" stroke={GRAY} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          chartKey="segment-take-rates" title="Segment Take Rates" badge="↑ Delivery rising" badgeTone="up" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
          legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }]}
        >
          <ResponsiveContainer>
            <LineChart data={SEGMENT_TAKE_RATE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          chartKey="segment-op-margins" title="Segment Op Margins" badge="↑ Both rising" badgeTone="up" activeKey={activeKey} onHover={handleHover} onClick={handleClick}
          legend={[{ label: "Mobility", color: GREEN }, { label: "Delivery", color: BLACK }]}
        >
          <ResponsiveContainer>
            <LineChart data={SEGMENT_OP_MARGIN_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => pctTick(v)} />
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Mobile assumptions */}
      <div className="mb-3">
        <h3 className="text-[14px] font-extrabold tracking-tight mb-1" style={{ color: "#0A0A0A" }}>
          Model Assumptions
        </h3>
        <p className="text-[11px]" style={{ color: "#B5B5B5" }}>
          Hover any row to highlight the supporting chart above
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {col1.map(({ key, ...a }) => (
            <AssumptionCard key={key} {...a} activeKey={activeKey} onHover={handleHover} onClick={handleClick} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {col2.map(({ key, ...a }) => (
            <AssumptionCard key={key} {...a} activeKey={activeKey} onHover={handleHover} onClick={handleClick} />
          ))}
        </div>
      </div>
      </div>{/* end lg:hidden */}
    </section>
  );
}

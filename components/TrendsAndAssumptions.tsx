"use client";

import { useState } from "react";
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
  children,
  hoveredKey,
}: {
  chartKey: string;
  title: string;
  badge: string;
  badgeTone?: "up" | "flat" | "mixed";
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
  hoveredKey: string | null;
}) {
  const highlighted = hoveredKey === chartKey;
  const dimmed = hoveredKey !== null && hoveredKey !== chartKey;

  const badgeColors = {
    up:    { bg: "rgba(6,193,103,0.1)",  text: "#04964F" },
    flat:  { bg: "rgba(0,0,0,0.05)",     text: "#6B6B6B" },
    mixed: { bg: "rgba(245,158,11,0.1)", text: "#B45309" },
  };
  const { bg, text } = badgeColors[badgeTone];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: highlighted ? "1.5px solid rgba(6,193,103,0.4)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 24,
        padding: 20,
        boxShadow: highlighted
          ? "0 12px 40px rgba(6,193,103,0.14), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        opacity: dimmed ? 0.35 : 1,
        transform: highlighted ? "translateY(-5px) scale(1.015)" : "none",
        transition: "all 0.2s ease",
        position: "relative",
        zIndex: highlighted ? 10 : 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>{title}</h4>
        <span style={{
          fontSize: 9.5, fontWeight: 700,
          padding: "2px 8px", borderRadius: 999,
          background: bg, color: text,
          whiteSpace: "nowrap",
        }}>{badge}</span>
      </div>

      {legend && (
        <div style={{ display: "flex", gap: 12 }}>
          {legend.map((l) => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: "#6B6B6B" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ width: "100%", height: 130 }}>{children}</div>
    </div>
  );
}

function AssumptionCard({
  label,
  value,
  rationale,
  chartKey,
  hoveredKey,
  onHover,
}: {
  label: string;
  value: string;
  rationale: string;
  chartKey: string | null;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
}) {
  const isActive = chartKey !== null && hoveredKey === chartKey;
  const isDimmed = hoveredKey !== null && hoveredKey !== chartKey;

  return (
    <div
      onMouseEnter={() => { if (chartKey) onHover(chartKey); }}
      onMouseLeave={() => onHover(null)}
      style={{
        background: isActive ? "rgba(6,193,103,0.04)" : "#FFFFFF",
        border: isActive ? "1px solid rgba(6,193,103,0.28)" : "1px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "10px 14px",
        opacity: isDimmed ? 0.35 : 1,
        transition: "all 0.15s ease",
        cursor: chartKey ? "default" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#059669" : "#3A3A3A", lineHeight: 1.3 }}>
          {label}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          fontFamily: "var(--font-geist-mono)",
          color: isActive ? "#064E3B" : "#0A0A0A",
          flexShrink: 0,
        }}>
          {value}
        </span>
      </div>
      <p style={{ fontSize: 10, color: "#9B9B9B", lineHeight: 1.45, margin: 0 }}>
        {rationale}
      </p>
      {!chartKey && (
        <span style={{ fontSize: 9, color: "#C5C5C5", marginTop: 4, display: "block" }}>
          Cost line — no chart
        </span>
      )}
    </div>
  );
}

const ASSUMPTIONS = [
  {
    key: "mapcGrowth",
    label: "MAPC Growth Rate",
    value: "17.5%",
    rationale: "Q1'26 actual +17%, accelerating from ~14% YoY. Uber One +50M members, 7 new market launches.",
    chartKey: "mapc",
  },
  {
    key: "tripsPerMapcGrowth",
    label: "Trips / MAPC Growth",
    value: "+3.0% YoY",
    rationale: "Ranged +2% to +4% over 7 quarters with no deceleration. Hold Q1'26 rate flat.",
    chartKey: "trips",
  },
  {
    key: "gbPerTrip",
    label: "GB per Trip",
    value: "$14.43",
    rationale: "12Q mean. Range-bound $14.10–$14.75 — premium mix tailwind offset by affordability headwind.",
    chartKey: "gb-per-trip",
  },
  {
    key: "ebitdaMargin",
    label: "Adj EBITDA Margin",
    value: "4.85%",
    rationale: "+0.43pp avg annual expansion applied to Q2'25 base of 4.53%. Insurance savings tailwind.",
    chartKey: "ebitda",
  },
  {
    key: "mobilityMix",
    label: "Mobility GB Mix",
    value: "48.8%",
    rationale: "Mix declining each quarter. Q1'26 actual 49.1%; trend projects a modest further step down.",
    chartKey: "segment-mix",
  },
  {
    key: "deliveryMix",
    label: "Delivery GB Mix",
    value: "48.9%",
    rationale: "Mix rising. Delivery +23% vs Mobility +20% in Q1'26. Suburban expansion 'very early innings.'",
    chartKey: "segment-mix",
  },
  {
    key: "freightMix",
    label: "Freight GB Mix",
    value: "2.3%",
    rationale: "Straight-line from Q2'25. Growth returned in Q1'26 but one quarter is not yet a trend.",
    chartKey: "segment-mix",
  },
  {
    key: "mobilityTakeRate",
    label: "Mobility Take Rate",
    value: "30.7%",
    rationale: "Q2'25 comparable. Q1'26 (25.8%) excluded — distorted by contra-revenue reclassification.",
    chartKey: "segment-take-rates",
  },
  {
    key: "deliveryTakeRate",
    label: "Delivery Take Rate",
    value: "19.2%",
    rationale: "Avg of last 3 clean quarters (Q3'25–Q1'26: 19.2%–19.5%). Trending up, used conservative mid.",
    chartKey: "segment-take-rates",
  },
  {
    key: "freightTakeRate",
    label: "Freight Take Rate",
    value: "100.2%",
    rationale: "Revenue consistently 100.1–100.2% of GB over 12Q. 12Q average = 100.15%.",
    chartKey: "take-rate",
  },
  {
    key: "mobilityOpMargin",
    label: "Mobility Op Margin",
    value: "7.5%",
    rationale: "Recent: 7.1% → 7.5% → 7.4% → 7.7%. Conservative mid-range; trend is upward.",
    chartKey: "segment-op-margins",
  },
  {
    key: "deliveryOpMargin",
    label: "Delivery Op Margin",
    value: "3.6%",
    rationale: "Recent: 3.2% → 3.3% → 3.6% → 3.7%. Q4'25 level — one notch below Q1'26 actuals.",
    chartKey: "segment-op-margins",
  },
  {
    key: "freightOpIncome",
    label: "Freight Op Income",
    value: "($28M)",
    rationale: "Average of 4 disclosed quarters: Q4'24 −$41M, Q1'25 −$25M, Q4'25 −$18M, Q1'26 −$30M.",
    chartKey: "segment-op-margins",
  },
  {
    key: "corpGA",
    label: "Corp G&A + Platform R&D",
    value: "($1,097M)",
    rationale: "Avg of Q4'25 (−$996M) and Q1'26 (−$1,077M) = −$1,037M, plus modest QoQ growth.",
    chartKey: null,
  },
];

export default function TrendsAndAssumptions() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const col1 = ASSUMPTIONS.slice(0, 7);
  const col2 = ASSUMPTIONS.slice(7);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Trends &amp; Assumptions
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Q2&apos;23 – Q1&apos;26 actuals &middot; hover an assumption to highlight its chart
        </p>
      </div>

      {/* Desktop: side-by-side panels */}
      <div className="hidden lg:grid gap-5" style={{ gridTemplateColumns: "1fr 340px", height: "calc(100vh - 170px)" }}>
        {/* Left: charts */}
        <div className="overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-2 gap-3">
            <ChartCard chartKey="mapc" title="MAPCs" badge="↑ Accelerating" badgeTone="up" hoveredKey={hoveredKey}>
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
            <ChartCard chartKey="trips" title="Monthly Trips / MAPC" badge="→ Stable" badgeTone="flat" hoveredKey={hoveredKey}>
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
            <ChartCard chartKey="gb-per-trip" title="Gross Bookings / Trip" badge="→ Range-bound" badgeTone="flat" hoveredKey={hoveredKey}>
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
            <ChartCard chartKey="take-rate" title="Consolidated Take Rate" badge="⚠ See notes" badgeTone="mixed" hoveredKey={hoveredKey}>
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
            <ChartCard chartKey="ebitda" title="Adj EBITDA Margin" badge="↑ Expanding" badgeTone="up" hoveredKey={hoveredKey}>
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
            <ChartCard chartKey="segment-mix" title="Segment GB Mix" badge="↑ Delivery accelerating" badgeTone="up" hoveredKey={hoveredKey}
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
            <ChartCard chartKey="segment-take-rates" title="Segment Take Rates" badge="↑ Delivery rising" badgeTone="up" hoveredKey={hoveredKey}
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
            <ChartCard chartKey="segment-op-margins" title="Segment Op Margins" badge="↑ Both rising" badgeTone="up" hoveredKey={hoveredKey}
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

        {/* Right: assumptions */}
        <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="mb-3">
            <h3 className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>Model Assumptions</h3>
            <p className="text-[10.5px]" style={{ color: "#B5B5B5" }}>Hover to highlight chart</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {ASSUMPTIONS.map(({ key, ...a }) => (
              <AssumptionCard key={key} {...a} hoveredKey={hoveredKey} onHover={setHoveredKey} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / tablet: stacked */}
      <div className="lg:hidden">
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <ChartCard chartKey="mapc" title="MAPCs" badge="↑ Accelerating" badgeTone="up" hoveredKey={hoveredKey}>
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

        <ChartCard chartKey="trips" title="Monthly Trips / MAPC" badge="→ Stable" badgeTone="flat" hoveredKey={hoveredKey}>
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

        <ChartCard chartKey="gb-per-trip" title="Gross Bookings / Trip" badge="→ Range-bound" badgeTone="flat" hoveredKey={hoveredKey}>
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

        <ChartCard chartKey="take-rate" title="Consolidated Take Rate" badge="⚠ See notes" badgeTone="mixed" hoveredKey={hoveredKey}>
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

        <ChartCard chartKey="ebitda" title="Adj EBITDA Margin" badge="↑ Expanding" badgeTone="up" hoveredKey={hoveredKey}>
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
          chartKey="segment-mix" title="Segment GB Mix" badge="↑ Delivery accelerating" badgeTone="up" hoveredKey={hoveredKey}
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
          chartKey="segment-take-rates" title="Segment Take Rates" badge="↑ Delivery rising" badgeTone="up" hoveredKey={hoveredKey}
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
          chartKey="segment-op-margins" title="Segment Op Margins" badge="↑ Both rising" badgeTone="up" hoveredKey={hoveredKey}
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
            <AssumptionCard key={key} {...a} hoveredKey={hoveredKey} onHover={setHoveredKey} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {col2.map(({ key, ...a }) => (
            <AssumptionCard key={key} {...a} hoveredKey={hoveredKey} onHover={setHoveredKey} />
          ))}
        </div>
      </div>
      </div>{/* end lg:hidden */}
    </section>
  );
}

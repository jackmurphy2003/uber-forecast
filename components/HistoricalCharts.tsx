"use client";

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

const AXIS_STYLE = { fontSize: 9.5, fill: "#9B9B9B" };
const GRID_COLOR = "rgba(0,0,0,0.06)";
const GREEN = "#06C167";
const BLACK = "#0A0A0A";
const GRAY = "#B5B5B5";

const TOOLTIP_STYLE = {
  background: "#FFFFFF",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 10,
  fontSize: 11,
  fontFamily: "var(--font-geist-mono)",
  padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const INSIGHT_TILES = [
  {
    label: "MAPCs in Q1'26",
    stat: "199M",
    assumption: "17.5% growth assumed",
    color: { bg: "rgba(79,70,229,0.08)", text: "#4338CA" },
  },
  {
    label: "GB/Trip, 12-quarter band",
    stat: "$14.10 – $14.75",
    assumption: "$14.43 mean assumed",
    color: { bg: "rgba(100,116,139,0.1)", text: "#475569" },
  },
  {
    label: "EBITDA margin since Q2'23",
    stat: "2.7% → 4.6%",
    assumption: "4.85% assumed for Q2'26F",
    color: { bg: "rgba(139,92,246,0.08)", text: "#7C3AED" },
  },
  {
    label: "Delivery – Mobility GB gap",
    stat: "3.4pp → 0.7pp",
    assumption: "Projects to flip in Q2'26F",
    color: { bg: "rgba(20,184,166,0.08)", text: "#0D9488" },
  },
];

function InsightTile({ label, stat, assumption, color }: typeof INSIGHT_TILES[0]) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl px-5 py-4"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <span className="text-[10px] font-semibold uppercase" style={{ color: "#B5B5B5", letterSpacing: "0.07em" }}>
        {label}
      </span>
      <span className="text-[20px] font-black tracking-tight leading-none" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
        {stat}
      </span>
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold w-fit px-2 py-0.5 rounded-full"
        style={{ background: color.bg, color: color.text }}
      >
        → {assumption}
      </span>
    </div>
  );
}

type BadgeTone = "up" | "flat" | "mixed";

function ChartCard({
  title,
  assumptionNote,
  badge,
  badgeTone = "flat",
  legend,
  children,
}: {
  title: string;
  assumptionNote?: string;
  badge: string;
  badgeTone?: BadgeTone;
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
}) {
  const badgeColors: Record<BadgeTone, { bg: string; text: string }> = {
    up:    { bg: "rgba(6,193,103,0.1)",  text: "#04964F" },
    flat:  { bg: "rgba(0,0,0,0.05)",     text: "#6B6B6B" },
    mixed: { bg: "rgba(245,158,11,0.1)", text: "#B45309" },
  };
  const { bg, text } = badgeColors[badgeTone];

  return (
    <div
      className="flex flex-col gap-2 rounded-3xl p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[12px] font-bold" style={{ color: "#0A0A0A" }}>{title}</h4>
        <span
          className="flex-shrink-0 text-[9.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: bg, color: text }}
        >
          {badge}
        </span>
      </div>

      {legend && (
        <div className="flex items-center gap-3">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1 text-[9.5px] font-medium" style={{ color: "#6B6B6B" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ width: "100%", height: 140 }}>{children}</div>

      {assumptionNote && (
        <div className="pt-2" style={{ borderTop: "1px solid rgba(6,193,103,0.12)" }}>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(6,193,103,0.1)", color: "#04964F" }}
          >
            → {assumptionNote}
          </span>
        </div>
      )}
    </div>
  );
}

function pctTick(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function HistoricalCharts() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Historical Trends, 12 Quarters
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Notable trends from Q2&apos;23 – Q1&apos;26 actuals.
        </p>
      </div>

      {/* Insight tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {INSIGHT_TILES.map((t) => <InsightTile key={t.label} {...t} />)}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartCard
          title="MAPCs"
          badge="↑ Accelerating"
          badgeTone="up"
          assumptionNote="17.5% growth used in model"
        >
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

        <ChartCard
          title="Monthly Trips / MAPC"
          badge="→ Stable"
          badgeTone="flat"
          assumptionNote="+3% YoY used in model"
        >
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

        <ChartCard
          title="Gross Bookings / Trip"
          badge="→ Range-bound"
          badgeTone="flat"
          assumptionNote="$14.43 12Q mean used in model"
        >
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

        <ChartCard
          title="Consolidated Take Rate"
          badge="⚠ See notes"
          badgeTone="mixed"
        >
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

        <ChartCard
          title="Adj EBITDA Margin"
          badge="↑ Expanding"
          badgeTone="up"
          assumptionNote="4.85% used in model"
        >
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
          title="Segment GB Mix"
          badge="↑ Delivery accelerating"
          badgeTone="up"
          assumptionNote="48.8% / 48.9% used in model"
          legend={[
            { label: "Mobility", color: GREEN },
            { label: "Delivery", color: BLACK },
            { label: "Freight", color: GRAY },
          ]}
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
          title="Segment Take Rates"
          badge="↑ Delivery rising"
          badgeTone="up"
          assumptionNote="19.2% / 30.7% used in model"
          legend={[
            { label: "Mobility", color: GREEN },
            { label: "Delivery", color: BLACK },
          ]}
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
          title="Segment Op Margins"
          badge="↑ Both rising"
          badgeTone="up"
          assumptionNote="7.5% / 3.6% used in model"
          legend={[
            { label: "Mobility", color: GREEN },
            { label: "Delivery", color: BLACK },
          ]}
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
    </section>
  );
}

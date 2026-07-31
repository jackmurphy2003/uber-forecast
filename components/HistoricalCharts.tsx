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
import EditableText from "./EditableText";
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
    sub: "+17% YoY — fastest rate in 2+ years",
    assumption: "17.5% growth assumed",
  },
  {
    label: "GB/Trip, 12-quarter band",
    stat: "$14.10 – $14.75",
    sub: "No directional trend over 3 years",
    assumption: "$14.43 mean assumed",
  },
  {
    label: "EBITDA margin since Q2'23",
    stat: "2.7% → 4.6%",
    sub: "+0.43pp avg YoY expansion",
    assumption: "4.85% assumed for Q2'26F",
  },
  {
    label: "Delivery – Mobility GB gap",
    stat: "3.4pp → 0.7pp",
    sub: "Closed every quarter since Q2'23",
    assumption: "Projects to flip in Q2'26F",
  },
];

function InsightTile({ label, stat, sub, assumption }: typeof INSIGHT_TILES[0]) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-2xl px-5 py-4"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <span className="text-[10px] font-semibold uppercase" style={{ color: "#B5B5B5", letterSpacing: "0.07em" }}>
        {label}
      </span>
      <span className="text-[19px] font-black tracking-tight leading-none" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
        {stat}
      </span>
      <span className="text-[11px]" style={{ color: "#9B9B9B" }}>{sub}</span>
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 w-fit px-2 py-0.5 rounded-full"
        style={{ background: "rgba(6,193,103,0.1)", color: "#04964F" }}
      >
        → {assumption}
      </span>
    </div>
  );
}

type BadgeTone = "up" | "flat" | "mixed";

function ChartCard({
  title,
  callout,
  assumptionNote,
  badge,
  badgeTone = "flat",
  legend,
  children,
}: {
  title: string;
  callout: string;
  assumptionNote?: string;
  badge: string;
  badgeTone?: BadgeTone;
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
}) {
  const badgeColors: Record<BadgeTone, { bg: string; text: string }> = {
    up:   { bg: "rgba(6,193,103,0.1)",     text: "#04964F" },
    flat: { bg: "rgba(0,0,0,0.05)",         text: "#6B6B6B" },
    mixed:{ bg: "rgba(245,158,11,0.1)",     text: "#B45309" },
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
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-[12px] font-bold" style={{ color: "#0A0A0A" }}>
            {title}
          </h4>
          <p className="text-[11px] leading-snug" style={{ color: "#9B9B9B" }}>
            {callout}
          </p>
        </div>
        <span
          className="flex-shrink-0 text-[9.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5"
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

      <div style={{ width: "100%", height: 130 }}>{children}</div>

      {assumptionNote && (
        <div
          className="flex items-center gap-1.5 pt-2"
          style={{ borderTop: "1px solid rgba(6,193,103,0.12)" }}
        >
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
          <EditableText id="charts-title">Historical Trends, 12 Quarters</EditableText>
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          <EditableText id="charts-subtitle">Notable trends from Q2&apos;23 - Q1&apos;26 actuals.</EditableText>
        </p>
      </div>

      {/* Insight tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {INSIGHT_TILES.map((t) => <InsightTile key={t.label} {...t} />)}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartCard
          title="MAPCs"
          callout="17% YoY in Q1'26, up from 14% a year ago. Accelerating."
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
          callout="+2% to +4% YoY range for 7 straight quarters. No deceleration."
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
          callout="Flat $14.10–$14.75 band for 12 quarters. No trend = use the mean."
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
          callout="Stable 26–27% ex the 3 reclassification quarters (Q2'24, Q3'24, Q1'26)."
          badge="→ Stable (noisy)"
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
          callout="2.7% in Q2'23 → 4.6% in Q1'26. +0.43pp avg YoY expansion applied to Q2'25 base."
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
          callout="Delivery closed from 3.4pp behind in Q2'23 to 0.7pp in Q1'26. Projects to flip."
          badge="→ Converging"
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
          callout="Delivery trending up every clean quarter: 18.9% → 19.5%. Mobility stable at 30.7%."
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
          callout="4 NGOP quarters show Mobility at 7.1–7.7%, Delivery at 3.2–3.7%. Both trending up."
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

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

function ChartCard({
  title,
  subtitle,
  legend,
  children,
}: {
  title: string;
  subtitle: string;
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-3xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <h4 className="text-[12px] font-bold" style={{ color: "#0A0A0A" }}>
          {title}
        </h4>
        {legend ? (
          <div className="flex items-center gap-2.5">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1 text-[9.5px] font-medium" style={{ color: "#6B6B6B" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[9.5px] font-medium" style={{ color: "#B5B5B5" }}>
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ width: "100%", height: 130 }}>{children}</div>
    </div>
  );
}

function pctTick(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function HistoricalCharts() {
  return (
    <section className="fade-in-up">
      <div className="mb-8">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Historical Trends, 12 Quarters
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Q2&apos;23 through Q1&apos;26 actuals feeding each driver in the sandbox below.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartCard title="MAPCs" subtitle="M, quarterly">
          <ResponsiveContainer>
            <LineChart data={MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(0)}M`, "MAPCs"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trips / MAPC" subtitle="x, quarterly">
          <ResponsiveContainer>
            <LineChart data={TRIPS_PER_MAPC_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.2", "dataMax + 0.2"]} tickFormatter={(v: number) => v.toFixed(1)} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`${v.toFixed(2)}x`, "Trips/MAPC"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gross Bookings / Trip" subtitle="$, quarterly">
          <ResponsiveContainer>
            <LineChart data={GB_PER_TRIP_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} domain={["dataMin - 0.3", "dataMax + 0.3"]} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "GB/Trip"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Consolidated Take Rate" subtitle="Revenue / GB">
          <ResponsiveContainer>
            <LineChart data={TAKE_RATE_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.01", "dataMax + 0.01"]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "Take Rate"]} />
              <Line type="monotone" dataKey="value" stroke={BLACK} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Adj EBITDA Margin" subtitle="Adj EBITDA / GB">
          <ResponsiveContainer>
            <LineChart data={EBITDA_MARGIN_SERIES} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={pctTick} domain={["dataMin - 0.005", "dataMax + 0.005"]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => [pctTick(v), "EBITDA Margin"]} />
              <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Segment GB Mix"
          subtitle="% of total GB"
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
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="freight" name="Freight" stroke={GRAY} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Segment Take Rates"
          subtitle="Mobility vs. Delivery"
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
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Segment Op Margins"
          subtitle="Adj EBITDA basis, pre-Q1'26"
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
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={BLACK} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

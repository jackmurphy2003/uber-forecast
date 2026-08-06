"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

import { runForecast } from "@/lib/forecast";
import { fmtM, fmtPct } from "@/lib/format";
import { LOCKED_INPUTS } from "./LockedForecast";
import { MIX_SERIES } from "@/lib/historical";

const GREEN = "#06C167";
const BLACK = "#0A0A0A";
const GRAY = "#B5B5B5";

const out = runForecast(LOCKED_INPUTS);

const CHART_DATA = [
  ...MIX_SERIES,
  {
    quarter: "Q2'26F",
    mobility: LOCKED_INPUTS.mobilityMix,
    delivery: LOCKED_INPUTS.deliveryMix,
  },
];

const GAP_M = out.deliveryGB - out.mobilityGB;

function PulsingDot({ cx, cy, index, fill }: { cx?: number; cy?: number; index?: number; fill: string }) {
  if (index !== CHART_DATA.length - 1) return <g />;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={fill} opacity={0.15}>
        <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2.5} />
    </g>
  );
}

function StaticEndDot({ cx, cy, index, fill }: { cx?: number; cy?: number; index?: number; fill: string }) {
  if (index !== CHART_DATA.length - 1) return <g />;
  return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2.5} />;
}

interface TooltipPayloadEntry { dataKey: string; value: number; }
function CrossoverTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const isProjected = label === "Q2'26F";
  const delivery = payload.find((p) => p.dataKey === "delivery");
  const mobility = payload.find((p) => p.dataKey === "mobility");
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(0,0,0,0.09)",
      borderRadius: 10,
      fontSize: 11,
      padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div style={{ color: "#9B9B9B", marginBottom: 5, fontFamily: "var(--font-geist-mono)", fontSize: 10 }}>
        {label}{isProjected ? " · projected" : ""}
      </div>
      {delivery && (
        <div style={{ color: GREEN, fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>
          Delivery {(delivery.value * 100).toFixed(1)}%
          {isProjected && <span style={{ color: "#9B9B9B", fontWeight: 400 }}> · {fmtM(out.deliveryGB)}</span>}
        </div>
      )}
      {mobility && (
        <div style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>
          Mobility {(mobility.value * 100).toFixed(1)}%
          {isProjected && <span style={{ color: "#9B9B9B", fontWeight: 400 }}> · {fmtM(out.mobilityGB)}</span>}
        </div>
      )}
    </div>
  );
}

function SegmentMixDonut({
  mobilityGB, deliveryGB, freightGB, mobilityMix, deliveryMix, freightMix,
}: {
  mobilityGB: number; deliveryGB: number; freightGB: number;
  mobilityMix: number; deliveryMix: number; freightMix: number;
}) {
  const data = [
    { name: "Mobility", value: mobilityGB, pct: mobilityMix, color: GREEN },
    { name: "Delivery", value: deliveryGB, pct: deliveryMix, color: BLACK },
    { name: "Freight", value: freightGB, pct: freightMix, color: GRAY },
  ];

  return (
    <div className="grid sm:grid-cols-[140px_1fr] gap-6 items-center">
      <div style={{ width: 140, height: 140 }} className="flex-shrink-0 mx-auto sm:mx-0">
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={68}
            startAngle={90}
            endAngle={-270}
            stroke="#FFFFFF"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#3A3A3A" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="tnum font-semibold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
              {fmtM(d.value)} <span style={{ color: "#9B9B9B" }}>&middot; {fmtPct(d.pct)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Bridge() {
  const [hoveredTile, setHoveredTile] = useState<"delivery" | "mobility" | null>(null);
  const bridgeDesc = `Delivery gross bookings projected to surpass Mobility, the core offering, for the first time, ${fmtM(GAP_M)} ahead on a ${fmtM(out.grossBookings)} base.`;

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          The Crossover
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          {bridgeDesc}
        </p>
      </div>

      <div
        className="rounded-[28px] p-6 sm:p-8"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Crossing lines chart */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10.5px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.07em" }}>
              GB Mix, Q2&apos;23 – Q2&apos;26F
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#6B6B6B" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
                Delivery
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#6B6B6B" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#3A3A3A" }} />
                Mobility
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 9.5, fill: "#9B9B9B" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 9.5, fill: "#9B9B9B" }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                domain={[0.43, 0.54]}
              />
              <Tooltip content={<CrossoverTooltip />} />
              <ReferenceLine
                x="Q2'26F"
                stroke="rgba(0,0,0,0.08)"
                strokeDasharray="4 4"
                label={{ value: "projected", position: "insideTopRight", fontSize: 9, fill: "#C0C0C0", dy: -4 }}
              />
              <Line
                type="monotone"
                dataKey="mobility"
                stroke="#3A3A3A"
                strokeWidth={2}
                dot={(props) => <StaticEndDot {...(props as { cx: number; cy: number; index: number })} fill="#3A3A3A" />}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF", fill: "#3A3A3A" }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="delivery"
                stroke={GREEN}
                strokeWidth={2}
                dot={(props) => <PulsingDot {...(props as { cx: number; cy: number; index: number })} fill={GREEN} />}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF", fill: GREEN }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hero tiles */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            className="flex flex-col gap-2 px-5 py-4 rounded-2xl cursor-default"
            style={{
              background: hoveredTile === "delivery" ? "#D1FAE5" : "#ECFDF5",
              border: "1px solid rgba(6,193,103,0.18)",
              transform: hoveredTile === "delivery" ? "translateY(-2px)" : "none",
              boxShadow: hoveredTile === "delivery" ? "0 8px 28px rgba(6,193,103,0.12)" : "none",
              transition: "background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={() => setHoveredTile("delivery")}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <span className="text-[9.5px] font-bold uppercase" style={{ color: "#059669", letterSpacing: "0.08em" }}>
              Delivery · projected to lead
            </span>
            <span className="tnum text-[26px] sm:text-[30px] font-black leading-none tracking-tight" style={{ color: "#064E3B", fontFamily: "var(--font-geist-mono)" }}>
              {fmtM(out.deliveryGB)}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "#065F46" }}>
              {fmtPct(LOCKED_INPUTS.deliveryMix)} of total GB
            </span>
          </div>

          <div
            className="flex flex-col gap-2 px-5 py-4 rounded-2xl cursor-default"
            style={{
              background: hoveredTile === "mobility" ? "#EAEAEA" : "#F4F4F4",
              transform: hoveredTile === "mobility" ? "translateY(-2px)" : "none",
              boxShadow: hoveredTile === "mobility" ? "0 8px 28px rgba(0,0,0,0.09)" : "none",
              transition: "background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={() => setHoveredTile("mobility")}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <span className="text-[9.5px] font-bold uppercase" style={{ color: "#B5B5B5", letterSpacing: "0.08em" }}>
              Mobility · led since Q2&apos;23
            </span>
            <span className="tnum text-[26px] sm:text-[30px] font-black leading-none tracking-tight" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
              {fmtM(out.mobilityGB)}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "#9B9B9B" }}>
              {fmtPct(LOCKED_INPUTS.mobilityMix)} of total GB
            </span>
          </div>
        </div>

        {/* Gap callout */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl mb-7"
          style={{ background: "rgba(6,193,103,0.06)", border: "1px solid rgba(6,193,103,0.14)" }}
        >
          <span className="text-[11.5px] font-bold" style={{ color: GREEN }}>
            +{fmtM(GAP_M)} Delivery lead
          </span>
          <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 14 }}>·</span>
          <span className="text-[11.5px] font-medium" style={{ color: "#6B6B6B" }}>
            0.1% of {fmtM(out.grossBookings)} total
          </span>
        </div>

        {/* Segment mix donut */}
        <div className="pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="text-[12px] font-bold mb-4" style={{ color: "#0A0A0A" }}>
            Segment Gross Bookings Mix
          </h3>
          <SegmentMixDonut
            mobilityGB={out.mobilityGB}
            deliveryGB={out.deliveryGB}
            freightGB={out.freightGB}
            mobilityMix={LOCKED_INPUTS.mobilityMix}
            deliveryMix={LOCKED_INPUTS.deliveryMix}
            freightMix={out.freightMix}
          />
        </div>
      </div>
    </section>
  );
}

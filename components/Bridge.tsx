"use client";

import { ArrowDown } from "lucide-react";
import EditableText from "./EditableText";
import { PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { runForecast } from "@/lib/forecast";
import { fmtM, fmtPct } from "@/lib/format";
import { LOCKED_INPUTS } from "./LockedForecast";

const GREEN = "#06C167";
const BLACK = "#0A0A0A";
const GRAY = "#B5B5B5";

function OpChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10.5px] font-bold px-3 py-1.5 rounded-full text-center"
      style={{ background: "#F6F6F6", color: "#3A3A3A" }}
    >
      {children}
    </span>
  );
}

function ResultCard({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-2xl transition-colors duration-150"
      style={{ background: "#F6F6F6", cursor: "default" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#EBEBEB"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#F6F6F6"; }}
    >
      <span className="text-[10px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span
        className={`tnum font-black leading-none tracking-tight ${compact ? "text-[20px]" : "text-[26px]"}`}
        style={{ color: "#0A0A0A" }}
      >
        {value}
      </span>
    </div>
  );
}

function MiniWaterfallRow({
  label,
  value,
  pct,
  color,
  maxAbs,
}: {
  label: string;
  value: number;
  pct?: number;
  color: string;
  maxAbs: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const widthPct = maxAbs !== 0 ? (Math.abs(value) / maxAbs) * 100 : 0;
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-1 py-0.5 transition-colors duration-150"
      style={{ background: isHovered ? "rgba(0,0,0,0.03)" : "transparent", cursor: "default" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-[10.5px] font-medium w-[62px] flex-shrink-0" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${widthPct}%`,
            background: color,
            filter: isHovered ? "brightness(1.15)" : "none",
            transition: "filter 0.15s ease",
          }}
        />
      </div>
      <span className="tnum text-[10.5px] font-semibold flex-shrink-0 text-right" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>
        {fmtM(value)}
        {pct !== undefined && <span style={{ color: "#B5B5B5" }}> &middot; {fmtPct(pct)}</span>}
      </span>
    </div>
  );
}

// Simple 1-source, N-destination Sankey-style flow: no external layout
// library, just proportional cubic-bezier ribbons (standard sankey link shape).
interface FlowNode {
  label: string;
  value: number;
  color: string;
}

function RevenueFlow({ nodes, total }: { nodes: FlowNode[]; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const width = 300;
  const height = 132;
  const nodeW = 8;
  const gap = 10;
  const x1 = nodeW;
  const x2 = width - nodeW;
  const midX = (x1 + x2) / 2;

  const destTotalH = height - gap * (nodes.length - 1);
  let srcY = 0;
  let destY = 0;
  const ribbons = nodes.map((n) => {
    const share = total !== 0 ? n.value / total : 0;
    const srcH = share * height;
    const destH = share * destTotalH;
    const r = { ...n, share, srcY0: srcY, srcY1: srcY + srcH, destY0: destY, destY1: destY + destH };
    srcY += srcH;
    destY += destH + gap;
    return r;
  });

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ cursor: "default" }}>
        <rect x={0} y={0} width={nodeW} height={height} rx={2} fill="#3A3A3A" />
        {ribbons.map((r) => {
          const isHovered = hovered === r.label;
          const isDimmed = hovered !== null && !isHovered;
          return (
            <path
              key={r.label}
              d={`M${x1},${r.srcY0} C${midX},${r.srcY0} ${midX},${r.destY0} ${x2},${r.destY0} L${x2},${r.destY1} C${midX},${r.destY1} ${midX},${r.srcY1} ${x1},${r.srcY1} Z`}
              fill={r.color}
              fillOpacity={isDimmed ? 0.06 : isHovered ? 0.3 : 0.16}
              style={{ transition: "fill-opacity 0.15s ease" }}
              onMouseEnter={() => setHovered(r.label)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {ribbons.map((r) => (
          <rect
            key={r.label}
            x={x2}
            y={r.destY0}
            width={nodeW}
            height={Math.max(r.destY1 - r.destY0, 0)}
            rx={2}
            fill={r.color}
            fillOpacity={hovered !== null && hovered !== r.label ? 0.35 : 1}
            style={{ transition: "fill-opacity 0.15s ease" }}
            onMouseEnter={() => setHovered(r.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-1.5">
        {ribbons.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between text-[10.5px] rounded-lg px-1.5 py-0.5 transition-colors duration-150"
            style={{
              background: hovered === r.label ? "rgba(0,0,0,0.04)" : "transparent",
              cursor: "default",
            }}
            onMouseEnter={() => setHovered(r.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#3A3A3A" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="tnum font-semibold" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>
              {fmtM(r.value)} <span style={{ color: "#B5B5B5" }}>&middot; {fmtPct(r.share)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SegmentMixDonut({
  mobilityGB,
  deliveryGB,
  freightGB,
  mobilityMix,
  deliveryMix,
  freightMix,
}: {
  mobilityGB: number;
  deliveryGB: number;
  freightGB: number;
  mobilityMix: number;
  deliveryMix: number;
  freightMix: number;
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
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="px-4 py-3 rounded-2xl"
          style={{ background: "rgba(6,193,103,0.08)" }}
        >
          <p className="text-[12px] leading-relaxed font-medium" style={{ color: "#0A0A0A" }}>
            <EditableText id="bridge-crossover-pre">For the first time, Delivery GB</EditableText>
            {" "}({fmtM(deliveryGB)}){" "}
            <EditableText id="bridge-crossover-post">is projected to edge out Mobility</EditableText>
            {" "}({fmtM(mobilityGB)}).{" "}
            <EditableText id="bridge-crossover-trail">Mobility has led every quarter since Q2&apos;23.</EditableText>
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
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
    </div>
  );
}

export default function Bridge({ compact }: { compact?: boolean }) {
  const out = runForecast(LOCKED_INPUTS);

  const ngopSegments = [
    { label: "Mobility", value: out.mobilityNGOP, pct: LOCKED_INPUTS.mobilityOpMargin, color: GREEN },
    { label: "Delivery", value: out.deliveryNGOP, pct: LOCKED_INPUTS.deliveryOpMargin, color: BLACK },
    { label: "Freight", value: out.freightNGOP, pct: undefined, color: GRAY },
    { label: "Corp G&A", value: out.corpGA, pct: undefined, color: GRAY },
  ];
  const maxAbs = Math.max(...ngopSegments.map((s) => Math.abs(s.value)));

  const revenueFlowNodes: FlowNode[] = [
    { label: "Mobility", value: out.mobilityRevenue, color: GREEN },
    { label: "Delivery", value: out.deliveryRevenue, color: BLACK },
    { label: "Freight", value: out.freightRevenue, color: GRAY },
  ];

  return (
    <section>
      <div className={compact ? "mb-5" : "mb-8"}>
        <h2
          className={`font-extrabold tracking-tight ${compact ? "text-[15px]" : "text-[19px]"}`}
          style={{ color: "#0A0A0A" }}
        >
          <EditableText id="bridge-title">Gross Bookings to Bottom Line</EditableText>
        </h2>
        {!compact && (
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            <EditableText id="bridge-desc">Three independent calculations, all rooted in Gross Bookings. Revenue and Non-GAAP OI build from the segment mix; Adj EBITDA is a separate top-down calc.</EditableText>
          </p>
        )}
      </div>

      <div
        className={`rounded-[28px] ${compact ? "p-5 sm:p-6" : "p-6 sm:p-10"}`}
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Shared root */}
        <div className={`flex flex-col items-start gap-1 ${compact ? "mb-5" : "mb-8"}`}>
          <span className="text-[10.5px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
            Gross Bookings
          </span>
          <span
            className={`tnum font-black leading-none tracking-tight ${compact ? "text-[28px]" : "text-[38px]"}`}
            style={{ color: "#0A0A0A" }}
          >
            {fmtM(out.grossBookings)}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Branch 1: Revenue, then Sankey-style segment split */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <OpChip>&times; {fmtPct(out.consolidatedTakeRate)} take rate</OpChip>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <div className="w-full">
              <ResultCard label="Revenue" value={fmtM(out.totalRevenue)} compact={compact} />
            </div>
            <div className="w-full pt-1 px-1">
              <RevenueFlow nodes={revenueFlowNodes} total={out.totalRevenue} />
            </div>
          </div>

          {/* Branch 2: Non-GAAP OI (genuine segment bridge) */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <OpChip>Segment NGOP build</OpChip>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <div className="w-full flex flex-col gap-2 px-1">
              {ngopSegments.map((s) => (
                <MiniWaterfallRow key={s.label} label={s.label} value={s.value} pct={s.pct} color={s.color} maxAbs={maxAbs} />
              ))}
            </div>
            <div className="w-full">
              <ResultCard label="Non-GAAP Op Income" value={fmtM(out.totalNGOP)} compact={compact} />
            </div>
          </div>

          {/* Branch 3: Adj EBITDA, explicitly independent, unchanged panel treatment */}
          <div
            className="flex flex-col items-center gap-3 pt-4 pb-3 px-3 rounded-3xl"
            style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
          >
            <span className="text-[9.5px] font-bold uppercase text-center" style={{ color: "#9B9B9B", letterSpacing: "0.05em" }}>
              Independent top-down calc
            </span>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <OpChip>&times; {fmtPct(LOCKED_INPUTS.ebitdaMargin, 2)} EBITDA margin</OpChip>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <div className="w-full">
              <ResultCard label="Adj EBITDA" value={fmtM(out.adjEbitda)} compact={compact} />
            </div>
            <p className="text-[10px] leading-relaxed text-center" style={{ color: "#B5B5B5" }} title="Uber's own reporting treats Adj EBITDA and segment Non-GAAP OI as separate metrics, not additive. See the Methodology page.">
              Uber&apos;s own reporting treats Adj EBITDA and segment Non-GAAP OI as separate metrics, not
              additive. See the Methodology page.
            </p>
          </div>
        </div>

        {/* Segment GB mix, the driver behind both branches above */}
        <div className="mt-9 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 className="text-[13px] font-bold mb-4" style={{ color: "#0A0A0A" }}>
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

"use client";

import { Lock } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { runForecast } from "@/lib/forecast";
import { LOCKED_INPUTS } from "./LockedForecast";
import { GUIDANCE } from "@/lib/assumptions";
import { CONSENSUS } from "@/lib/consensus";
import { ACTUALS } from "@/lib/actuals";
import { SEGMENT_GB } from "@/lib/data";
import { SCORECARD_NOTES, DRIVER_ATTRIBUTION, TAKEAWAYS } from "@/lib/reconciliation";
import { fmtM, fmtSigned, fmtPct, fmtDollar } from "@/lib/format";

const GREEN = "#06C167";
const RED = "#E11D48";
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

const METRICS: { key: keyof typeof MODEL_MAP; label: string }[] = [
  { key: "grossBookings", label: "Gross Bookings" },
  { key: "totalRevenue", label: "Revenue" },
  { key: "adjEbitda", label: "Adj EBITDA" },
  { key: "totalNGOP", label: "Non-GAAP OI" },
  { key: "mapcs", label: "MAPCs" },
  { key: "trips", label: "Trips" },
];

const out = runForecast(LOCKED_INPUTS);
const MODEL_MAP = {
  grossBookings: out.grossBookings,
  totalRevenue: out.totalRevenue,
  adjEbitda: out.adjEbitda,
  totalNGOP: out.totalNGOP,
  mapcs: out.mapcs,
  trips: out.totalTrips,
};

const DOLLAR_KEYS = new Set(["grossBookings", "totalRevenue", "adjEbitda", "totalNGOP"]);

function fmtMetric(key: string, v: number) {
  return DOLLAR_KEYS.has(key) ? fmtM(v) : `${v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
}

// Guidance and consensus are sourced only where actually disclosed/estimated -- never backfilled.
const GUIDANCE_MAP: Record<string, string | null> = {
  grossBookings: `${fmtDollar(GUIDANCE.grossBookingsLow / 1000, 2)}B–${fmtDollar(GUIDANCE.grossBookingsHigh / 1000, 2)}B`,
  totalRevenue: null,
  adjEbitda: `${fmtDollar(GUIDANCE.adjEbitdaLow / 1000, 2)}B–${fmtDollar(GUIDANCE.adjEbitdaHigh / 1000, 2)}B`,
  totalNGOP: null,
  mapcs: null,
  trips: null,
};

const CONSENSUS_MAP: Record<string, number | null> = {
  grossBookings: CONSENSUS.grossBookings,
  totalRevenue: (CONSENSUS.revenueLow + CONSENSUS.revenueHigh) / 2,
  adjEbitda: null,
  totalNGOP: null,
  mapcs: CONSENSUS.mapcs,
  trips: CONSENSUS.trips,
};

const CONSENSUS_DISPLAY: Record<string, string | null> = {
  grossBookings: `${fmtDollar(CONSENSUS.grossBookings / 1000, 2)}B`,
  totalRevenue: `${fmtDollar(CONSENSUS.revenueLow / 1000, 2)}B–${fmtDollar(CONSENSUS.revenueHigh / 1000, 2)}B`,
  adjEbitda: null,
  totalNGOP: null,
  mapcs: `${CONSENSUS.mapcs}M`,
  trips: `${CONSENSUS.trips.toLocaleString()}M`,
};

function LockedRow({ label, model, metricKey }: { label: string; model: number; metricKey: string }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
    >
      <span className="text-[12px] font-semibold" style={{ color: "#3A3A3A" }}>
        {label}
      </span>
      <div className="flex items-center gap-4">
        <span className="tnum text-[12px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
          My Model {fmtMetric(metricKey, model)}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background: "#F6F6F6", color: "#B5B5B5" }}
        >
          Pending
        </span>
      </div>
    </div>
  );
}

function CombinedRow({
  label,
  guidance,
  consensus,
  model,
  actual,
  metricKey,
  note,
  isFirst,
}: {
  label: string;
  guidance: string | null;
  consensus: string | null;
  model: number;
  actual: number;
  metricKey: string;
  note?: string;
  isFirst: boolean;
}) {
  const variancePct = ((actual - model) / model) * 100;
  const up = variancePct >= 0;
  return (
    <div className="px-4 py-3" style={{ borderTop: isFirst ? undefined : "1px solid rgba(0,0,0,0.05)" }}>
      <div className="grid grid-cols-[1.1fr_1fr_1fr_0.9fr_0.9fr_0.7fr] gap-2 items-baseline">
        <span className="text-[11.5px] font-semibold" style={{ color: "#0A0A0A" }}>{label}</span>
        <span className="tnum text-[10px]" style={{ color: guidance ? "#9B9B9B" : "#D5D5D5", fontFamily: "var(--font-geist-mono)" }}>
          {guidance ?? "—"}
        </span>
        <span className="tnum text-[10px]" style={{ color: consensus ? "#9B9B9B" : "#D5D5D5", fontFamily: "var(--font-geist-mono)" }}>
          {consensus ?? "—"}
        </span>
        <span className="tnum text-[10.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
          {fmtMetric(metricKey, model)}
        </span>
        <span className="tnum text-[11px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
          {fmtMetric(metricKey, actual)}
        </span>
        <span
          className="tnum text-[10px] font-bold px-1.5 py-0.5 rounded justify-self-start"
          style={{
            background: up ? "rgba(6,193,103,0.1)" : "rgba(225,29,72,0.1)",
            color: up ? "#04964F" : "#E11D48",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          {fmtSigned(variancePct)}%
        </span>
      </div>
      {note && (
        <p className="text-[11px] italic mt-1.5" style={{ color: "#9B9B9B" }}>
          {note}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[14px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
        {title}
      </h3>
      {sub && (
        <p className="text-[11.5px] mt-0.5" style={{ color: "#9B9B9B" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function Scorecard() {
  const earningsDate = new Date(GUIDANCE.earningsDate + "T12:00:00");
  const hasReported = new Date() >= earningsDate;
  const actuals = ACTUALS;

  // MAPE: textbook definition divides by actual, not by the forecast.
  const absErrors = actuals
    ? METRICS.map(({ key }) => Math.abs((actuals[key] - MODEL_MAP[key]) / actuals[key]) * 100)
    : [];
  const mape = absErrors.length ? absErrors.reduce((a, b) => a + b, 0) / absErrors.length : 0;

  // Model vs. consensus: whoever's estimate was closer to actual, on the metrics where both exist.
  const headToHead = actuals
    ? METRICS.filter(({ key }) => CONSENSUS_MAP[key] !== null).map(({ key, label }) => {
        const modelErr = Math.abs((actuals[key] - MODEL_MAP[key]) / actuals[key]) * 100;
        const consensusErr = Math.abs((actuals[key] - (CONSENSUS_MAP[key] as number)) / actuals[key]) * 100;
        return { label, modelErr, consensusErr, modelCloser: modelErr < consensusErr };
      })
    : [];
  const modelWins = headToHead.filter((h) => h.modelCloser).length;

  const varianceData = actuals
    ? METRICS.map(({ key, label }) => {
        const model = MODEL_MAP[key];
        const actual = actuals[key];
        const variancePct = ((actual - model) / model) * 100;
        return { name: label, variance: variancePct };
      })
    : [];

  const dollarChartData = actuals
    ? METRICS.filter(({ key }) => DOLLAR_KEYS.has(key)).map(({ key, label }) => ({
        name: label,
        "My Model": MODEL_MAP[key],
        Actual: actuals[key],
      }))
    : [];

  const forecastTotalGB = out.mobilityGB + out.deliveryGB + out.freightGB;
  const actualTotalGB = actuals ? actuals.mobilityGB + actuals.deliveryGB + actuals.freightGB : 0;

  // Crossover, resolved: Q2'25-Q2'26 timeline like the Forecast tab's GB
  // Mix chart (Mobility dark, Delivery green), with actual Q2'26 extending the
  // solid line and a faint dashed "ghost" line showing where the model predicted
  // Q2'26 would land instead -- the gap between the two is the miss.
  const mobilityModelPct = (out.mobilityGB / forecastTotalGB) * 100;
  const deliveryModelPct = (out.deliveryGB / forecastTotalGB) * 100;
  const mobilityActualPct = actuals ? (actuals.mobilityGB / actualTotalGB) * 100 : 0;
  const deliveryActualPct = actuals ? (actuals.deliveryGB / actualTotalGB) * 100 : 0;

  const historicalMix = SEGMENT_GB.slice(
    SEGMENT_GB.findIndex((q) => q.quarter === "Q2'25")
  ).map((q) => ({
    quarter: q.quarter,
    mobility: (q.mobility / q.total) * 100,
    delivery: (q.delivery / q.total) * 100,
  }));
  const lastHistorical = historicalMix[historicalMix.length - 1];
  const crossoverSeries = actuals
    ? [...historicalMix, { quarter: "Q2'26", mobility: mobilityActualPct, delivery: deliveryActualPct }]
    : historicalMix;
  const crossoverWithGhost = crossoverSeries.map((d, i) => {
    if (i === historicalMix.length - 1) {
      return { ...d, mobilityGhost: lastHistorical.mobility, deliveryGhost: lastHistorical.delivery };
    }
    if (i === historicalMix.length) {
      return { ...d, mobilityGhost: mobilityModelPct, deliveryGhost: deliveryModelPct };
    }
    return d;
  });
  const allMixValues = [
    ...historicalMix.flatMap((d) => [d.mobility, d.delivery]),
    mobilityActualPct,
    deliveryActualPct,
    mobilityModelPct,
    deliveryModelPct,
  ];
  const crossoverDomain: [number, number] = [
    Math.floor(Math.min(...allMixValues) - 1),
    Math.ceil(Math.max(...allMixValues) + 1),
  ];
  const crossoverLastIdx = crossoverWithGhost.length - 1;

  // Solid filled dot at the actual Q2'26 endpoint only -- earlier points stay bare.
  function actualEndpointDot(color: string) {
    return function ActualEndpointDot(props: { cx?: number; cy?: number; index?: number }) {
      const { cx, cy, index } = props;
      if (index !== crossoverLastIdx || cx == null || cy == null) return <g key={`dot-${index}`} />;
      return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />;
    };
  }

  // Hollow outlined dot at the predicted Q2'26 endpoint only -- skips the Q1'26 anchor point.
  function ghostEndpointDot(color: string) {
    return function GhostEndpointDot(props: { cx?: number; cy?: number; index?: number }) {
      const { cx, cy, index } = props;
      if (index !== crossoverLastIdx || cx == null || cy == null) return <g key={`ghost-dot-${index}`} />;
      return <circle key={`ghost-dot-${index}`} cx={cx} cy={cy} r={4} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />;
    };
  }

  // Endpoint summary card, rendered above the chart instead of squeezed beside it --
  // keeps the actual/forecast/delta text out of the crowded Q2'26 corner, and reads
  // top-to-bottom before the reader even looks at the lines.
  function EndpointSummary({
    label,
    color,
    actual,
    forecast,
  }: {
    label: string;
    color: string;
    actual: number;
    forecast: number;
  }) {
    const delta = actual - forecast;
    const up = delta >= 0;
    return (
      <div className="rounded-xl px-3.5 py-3" style={{ background: "#F6F6F6" }}>
        <span className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.03em" }}>
          <span className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: color }} />
          {label} (Actual)
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="tnum text-[17px] font-black" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
            {actual.toFixed(1)}%
          </span>
          <span
            className="tnum text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: up ? "rgba(6,193,103,0.1)" : "rgba(225,29,72,0.1)", color: up ? "#04964F" : "#E11D48" }}
          >
            {up ? "Beat" : "Miss"} {fmtSigned(delta)}%
          </span>
        </div>
        <span className="tnum text-[9.5px]" style={{ color: "#B5B5B5", fontFamily: "var(--font-geist-mono)" }}>
          Modeled: {forecast.toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <section>
      <div>
        <div className="mb-6">
          <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
            Variance Analysis
          </h2>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            {actuals
              ? "Q2'26: My model vs the actual numbers"
              : "My model vs. actual results, populated once Uber reports."}
          </p>
        </div>

        {!actuals && (
          <div
            className="flex flex-col items-center text-center gap-3 rounded-2xl"
            style={{ background: "#F6F6F6", padding: "40px 24px" }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 40, height: 40, background: "rgba(0,0,0,0.06)" }}
            >
              <Lock size={16} strokeWidth={2} style={{ color: "#6B6B6B" }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "#0A0A0A" }}>
              {hasReported
                ? "Uber has reported. Actuals go in shortly."
                : "Locked until Uber reports Wednesday, August 5, 2026, before market open."}
            </p>
            <p className="text-[11.5px] max-w-[420px]" style={{ color: "#9B9B9B" }}>
              This forecast was locked August 4. Once Uber prints, actual results replace the
              &quot;Pending&quot; tags below, unedited, whichever way the numbers land.
            </p>
          </div>
        )}

        {!actuals && (
          <div className="rounded-2xl overflow-hidden mt-6" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            {METRICS.map(({ key, label }) => (
              <LockedRow key={key} label={label} model={MODEL_MAP[key]} metricKey={key} />
            ))}
          </div>
        )}
      </div>

      {actuals && (
        <div className="flex flex-col gap-10">
          {/* Accuracy headline -- the 5-second read */}
          <div>
            <div className="rounded-2xl p-5 mb-5" style={{ background: "#ECFDF5", border: "1px solid rgba(6,193,103,0.2)" }}>
              <span className="tnum text-[22px] font-black" style={{ color: "#064E3B", fontFamily: "var(--font-geist-mono)" }}>
                {mape.toFixed(1)}%
              </span>
              <span className="text-[12px] font-semibold ml-2" style={{ color: "#059669" }}>
                mean absolute error across six metrics
              </span>
              <p className="text-[11.5px] leading-relaxed mt-1.5 max-w-[760px]" style={{ color: "#065F46" }}>
                Street consensus was closer than my model on {headToHead.length - modelWins} of{" "}
                {headToHead.length} comparable metrics. Still, I feel good about a 3% MAPE - especially since a few metrics fell outside of Uber&apos;s own guidance from the Q1&apos;26 press release.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <span className="text-[11px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                  My Model vs. Actual
                </span>

                {/* Gross Bookings gets its own callout -- its scale (~$58B) would flatten
                    the other three metrics (~$2-14B) into slivers on a shared axis. */}
                <div className="flex items-center justify-between mt-3 pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#3A3A3A" }}>Gross Bookings</span>
                  <span className="tnum text-[11px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
                    {fmtM(MODEL_MAP.grossBookings)} <span style={{ color: "#D5D5D5" }}>→</span>{" "}
                    <span style={{ color: "#0A0A0A", fontWeight: 700 }}>{fmtM(actuals.grossBookings)}</span>
                  </span>
                </div>

                <div style={{ width: "100%", height: 180 }} className="mt-3">
                  <ResponsiveContainer>
                    <BarChart
                      data={dollarChartData.filter((d) => d.name !== "Gross Bookings")}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                      barGap={4}
                    >
                      <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 8.5 }} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => fmtM(v)} />
                      <Bar dataKey="My Model" fill="#D5D5D5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Actual" fill={GREEN} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <span className="text-[11px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                  % Miss by Metric
                </span>
                <div style={{ width: "100%", height: 220 }} className="mt-2">
                  <ResponsiveContainer>
                    <BarChart data={varianceData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
                      <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 9.5 }} axisLine={false} tickLine={false} width={72} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => `${fmtSigned(v)}%`} />
                      <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
                        {varianceData.map((d) => (
                          <Cell key={d.name} fill={d.variance >= 0 ? GREEN : RED} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Combined comparison + scorecard table -- the why */}
          <div>
            <SectionHeader
              title="Comparison Table"
              sub="Guidance vs Consensus vs My Model - all compared to the actuals"
            />
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div
                className="grid grid-cols-[1.1fr_1fr_1fr_0.9fr_0.9fr_0.7fr] gap-2 px-4 py-2.5"
                style={{ background: "#FAFAFA" }}
              >
                {["Metric", "Guidance", "Consensus", "My Model", "Actual", "Var"].map((h) => (
                  <span key={h} className="text-[9.5px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {METRICS.map(({ key, label }, i) => (
                <CombinedRow
                  key={key}
                  label={label}
                  guidance={GUIDANCE_MAP[key]}
                  consensus={CONSENSUS_DISPLAY[key]}
                  model={MODEL_MAP[key]}
                  actual={actuals[key]}
                  metricKey={key}
                  note={SCORECARD_NOTES.find((n) => n.key === key)?.note}
                  isFirst={i === 0}
                />
              ))}
            </div>
            <p className="text-[11px] mt-3" style={{ color: "#9B9B9B" }}>
              Source: {actuals.source}
            </p>
          </div>

          {/* Driver-by-Driver Attribution */}
          <div>
            <SectionHeader title="Driver Notes" sub="Was I right, and why or why not?" />
            <div className="flex flex-col gap-2.5">
              {DRIVER_ATTRIBUTION.map((d) => (
                <div key={d.driver} className="rounded-2xl px-5 py-4" style={{ background: "#F6F6F6" }}>
                  <span className="text-[12.5px] font-bold" style={{ color: "#0A0A0A" }}>
                    {d.driver}
                  </span>
                  <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: "#6B6B6B" }}>
                    {d.commentary}
                  </p>
                  {d.driver === "Segment Mix / The Crossover" && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                          GB Mix: Q2&apos;25–Q2&apos;26
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[9.5px]" style={{ color: "#9B9B9B" }}>
                            <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: "#3A3A3A" }} />
                            Mobility
                          </span>
                          <span className="flex items-center gap-1 text-[9.5px]" style={{ color: "#9B9B9B" }}>
                            <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: GREEN }} />
                            Delivery
                          </span>
                          <span style={{ width: 1, height: 10, background: "rgba(0,0,0,0.1)" }} />
                          <span className="flex items-center gap-1 text-[9.5px]" style={{ color: "#9B9B9B" }}>
                            <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "#9B9B9B" }} />
                            Actual
                          </span>
                          <span className="flex items-center gap-1 text-[9.5px]" style={{ color: "#9B9B9B" }}>
                            <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "#FFFFFF", border: "1.5px solid #9B9B9B" }} />
                            Predicted
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <EndpointSummary label="Mobility" color="#3A3A3A" actual={mobilityActualPct} forecast={mobilityModelPct} />
                        <EndpointSummary label="Delivery" color={GREEN} actual={deliveryActualPct} forecast={deliveryModelPct} />
                      </div>
                      <div style={{ maxWidth: 800, margin: "0 auto" }}>
                        <div style={{ width: "100%", height: 190 }}>
                          <ResponsiveContainer>
                            <LineChart data={crossoverWithGhost} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                              <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={0} />
                              <YAxis domain={crossoverDomain} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `${v}%`} />
                              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                              <ReferenceLine
                                segment={[
                                  { x: "Q2'26", y: mobilityActualPct },
                                  { x: "Q2'26", y: mobilityModelPct },
                                ]}
                                stroke="#B5B5B5"
                                strokeDasharray="2 2"
                                strokeWidth={1}
                                ifOverflow="visible"
                              />
                              <ReferenceLine
                                segment={[
                                  { x: "Q2'26", y: deliveryActualPct },
                                  { x: "Q2'26", y: deliveryModelPct },
                                ]}
                                stroke="#B5B5B5"
                                strokeDasharray="2 2"
                                strokeWidth={1}
                                ifOverflow="visible"
                              />
                              <Line type="monotone" dataKey="mobility" name="Mobility" stroke="#3A3A3A" strokeWidth={2.5} dot={actualEndpointDot("#3A3A3A")} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} connectNulls={false} />
                              <Line type="monotone" dataKey="delivery" name="Delivery" stroke={GREEN} strokeWidth={2.5} dot={actualEndpointDot(GREEN)} activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }} isAnimationActive={false} connectNulls={false} />
                              <Line type="monotone" dataKey="mobilityGhost" name="Mobility (my Q2'26 prediction)" stroke="#3A3A3A" strokeWidth={2} strokeDasharray="4 3" strokeOpacity={0.45} dot={ghostEndpointDot("#3A3A3A")} isAnimationActive={false} connectNulls={false} />
                              <Line type="monotone" dataKey="deliveryGhost" name="Delivery (my Q2'26 prediction)" stroke={GREEN} strokeWidth={2} strokeDasharray="4 3" strokeOpacity={0.45} dot={ghostEndpointDot(GREEN)} isAnimationActive={false} connectNulls={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <p className="text-[10.5px] mt-1.5" style={{ color: "#C5C5C5" }}>
                        Solid dot = actual results · hollow dot = my Q2&apos;26 prediction
                      </p>
                      <p className="text-[11px] leading-relaxed mt-2" style={{ color: "#9B9B9B" }}>
                        Mobility&apos;s share of GB widened to{" "}
                        <span style={{ color: "#3A3A3A", fontWeight: 600 }}>
                          {fmtPct(actuals.mobilityGB / actualTotalGB)}
                        </span>{" "}
                        (from 49.1% in Q1&apos;26) against a modeled {fmtPct(out.mobilityGB / forecastTotalGB)}.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What I'd Change */}
          <div>
            <SectionHeader title="What I'd Change for Q3'26" />
            <div className="flex flex-col">
              {TAKEAWAYS.map((t, i) => (
                <div
                  key={t.label}
                  className="flex gap-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] tnum font-bold mt-0.5"
                    style={{ background: "rgba(6,193,103,0.12)", color: "#04964F", fontFamily: "var(--font-geist-mono)" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-[12.5px] font-bold" style={{ color: "#0A0A0A" }}>{t.label}</span>
                    <p className="text-[11.5px] leading-relaxed mt-0.5" style={{ color: "#6B6B6B" }}>{t.commentary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

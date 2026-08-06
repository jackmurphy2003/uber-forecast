"use client";

import { Lock } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

const CONSENSUS_MAP: Record<string, string | null> = {
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
          Model {fmtMetric(metricKey, model)}
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

function ResultRow({
  label,
  model,
  actual,
  note,
  metricKey,
}: {
  label: string;
  model: number;
  actual: number;
  note?: string;
  metricKey: string;
}) {
  const variance = actual - model;
  const variancePct = (variance / model) * 100;
  const up = variance >= 0;
  return (
    <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold" style={{ color: "#0A0A0A" }}>
          {label}
        </span>
        <div className="flex items-center gap-4">
          <span className="tnum text-[11.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
            Model {fmtMetric(metricKey, model)}
          </span>
          <span className="tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
            Actual {fmtMetric(metricKey, actual)}
          </span>
          <span
            className="tnum text-[10.5px] font-bold px-2 py-0.5 rounded flex-shrink-0"
            style={{
              background: up ? "rgba(6,193,103,0.1)" : "rgba(225,29,72,0.1)",
              color: up ? "#04964F" : "#E11D48",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            {fmtSigned(variancePct)}%
          </span>
        </div>
      </div>
      {note && (
        <p className="text-[11px] italic mt-1" style={{ color: "#9B9B9B" }}>
          {note}
        </p>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  guidance,
  consensus,
  model,
  actual,
  metricKey,
  isFirst,
}: {
  label: string;
  guidance: string | null;
  consensus: string | null;
  model: number;
  actual: number;
  metricKey: string;
  isFirst: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center"
      style={{ borderTop: isFirst ? undefined : "1px solid rgba(0,0,0,0.05)" }}
    >
      <span className="text-[11.5px] font-semibold" style={{ color: "#0A0A0A" }}>{label}</span>
      <span className="tnum text-[10.5px]" style={{ color: guidance ? "#6B6B6B" : "#D5D5D5", fontFamily: "var(--font-geist-mono)" }}>
        {guidance ?? "—"}
      </span>
      <span className="tnum text-[10.5px]" style={{ color: consensus ? "#6B6B6B" : "#D5D5D5", fontFamily: "var(--font-geist-mono)" }}>
        {consensus ?? "—"}
      </span>
      <span className="tnum text-[10.5px]" style={{ color: "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}>
        {fmtMetric(metricKey, model)}
      </span>
      <span className="tnum text-[11px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
        {fmtMetric(metricKey, actual)}
      </span>
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

  const variances = actuals
    ? METRICS.map(({ key }) => Math.abs(((actuals[key] - MODEL_MAP[key]) / MODEL_MAP[key]) * 100))
    : [];
  const mape = variances.length ? variances.reduce((a, b) => a + b, 0) / variances.length : 0;
  const variancesExNGOP = actuals
    ? METRICS.filter(({ key }) => key !== "totalNGOP").map(
        ({ key }) => Math.abs(((actuals[key] - MODEL_MAP[key]) / MODEL_MAP[key]) * 100)
      )
    : [];
  const mapeExNGOP = variancesExNGOP.length ? variancesExNGOP.reduce((a, b) => a + b, 0) / variancesExNGOP.length : 0;

  const varianceData = actuals
    ? METRICS.map(({ key, label }) => {
        const model = MODEL_MAP[key];
        const actual = actuals[key];
        const variancePct = ((actual - model) / model) * 100;
        return { name: label, variance: variancePct };
      })
    : [];

  const forecastTotalGB = out.mobilityGB + out.deliveryGB + out.freightGB;
  const actualTotalGB = actuals ? actuals.mobilityGB + actuals.deliveryGB + actuals.freightGB : 0;
  const mixChartData = actuals
    ? [
        {
          name: "Mobility",
          Forecast: (out.mobilityGB / forecastTotalGB) * 100,
          Actual: (actuals.mobilityGB / actualTotalGB) * 100,
        },
        {
          name: "Delivery",
          Forecast: (out.deliveryGB / forecastTotalGB) * 100,
          Actual: (actuals.deliveryGB / actualTotalGB) * 100,
        },
        {
          name: "Freight",
          Forecast: (out.freightGB / forecastTotalGB) * 100,
          Actual: (actuals.freightGB / actualTotalGB) * 100,
        },
      ]
    : [];

  return (
    <section className="flex flex-col gap-10">
      <div>
        <div className="mb-6">
          <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
            Variance Analysis
          </h2>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            {actuals
              ? "Q2'26 model vs. guidance, Street consensus, and actual results, plus the diagnosis behind every number."
              : "Model vs. actual results, populated once Uber reports."}
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
        <>
          {/* Guidance vs. Consensus vs. Model vs. Actual */}
          <div>
            <SectionHeader
              title="Q2'26: Guidance vs. Consensus vs. Model"
              sub="Who called it best, and how close was the model overall."
            />
            <div className="rounded-2xl p-5 mb-3" style={{ background: "#ECFDF5", border: "1px solid rgba(6,193,103,0.2)" }}>
              <span className="tnum text-[22px] font-black" style={{ color: "#064E3B", fontFamily: "var(--font-geist-mono)" }}>
                {mape.toFixed(1)}%
              </span>
              <span className="text-[12px] font-semibold ml-2" style={{ color: "#059669" }}>
                average miss across six metrics
              </span>
              <p className="text-[11.5px] leading-relaxed mt-1.5" style={{ color: "#065F46" }}>
                {mapeExNGOP.toFixed(1)}% excluding Non-GAAP OI, the largest single variance and the
                one metric that had no guidance or consensus benchmark to anchor against.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div
                className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5"
                style={{ background: "#FAFAFA" }}
              >
                {["Metric", "Guidance", "Consensus", "Model", "Actual"].map((h) => (
                  <span key={h} className="text-[9.5px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {METRICS.map(({ key, label }, i) => (
                <ComparisonRow
                  key={key}
                  label={label}
                  guidance={GUIDANCE_MAP[key]}
                  consensus={CONSENSUS_MAP[key]}
                  model={MODEL_MAP[key]}
                  actual={actuals[key]}
                  metricKey={key}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </div>

          {/* Top-line Scorecard */}
          <div>
            <SectionHeader title="Scorecard" sub="Model vs. actual, with the why behind each line." />
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              {METRICS.map(({ key, label }) => (
                <ResultRow
                  key={key}
                  label={label}
                  model={MODEL_MAP[key]}
                  actual={actuals[key]}
                  metricKey={key}
                  note={SCORECARD_NOTES.find((n) => n.key === key)?.note}
                />
              ))}
            </div>
            <p className="text-[11px] mt-3 mb-4" style={{ color: "#9B9B9B" }}>
              Source: {actuals.source}
            </p>
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <span className="text-[11px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                % Miss by Metric
              </span>
              <div style={{ width: "100%", height: 200 }} className="mt-2">
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

          {/* Driver-by-Driver Attribution */}
          <div>
            <SectionHeader title="Driver-by-Driver Attribution" sub="Was I right, and why or why not?" />
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
                      <div style={{ width: "100%", height: 180 }}>
                        <ResponsiveContainer>
                          <BarChart data={mixChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
                            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                            <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                            <Bar dataKey="Forecast" fill="#D5D5D5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Actual" fill={GREEN} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
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
        </>
      )}
    </section>
  );
}

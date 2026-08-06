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
import { ACTUALS } from "@/lib/actuals";
import { SCORECARD_NOTES, DRIVER_ATTRIBUTION, TAKEAWAYS } from "@/lib/reconciliation";
import { fmtM, fmtSigned, fmtPct } from "@/lib/format";

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
        Forecast: MODEL_MAP[key],
        Actual: actuals[key],
      }))
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
            Scorecard
          </h2>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            {actuals
              ? "Model vs. actual results from Uber's Q2'26 press release, and the variance analysis behind them."
              : "Model vs. actual results, populated once Uber reports."}
          </p>
        </div>

        {!actuals && (
          <div
            className="flex flex-col items-center text-center gap-3 rounded-2xl mb-6"
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

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {METRICS.map(({ key, label }) =>
            actuals ? (
              <ResultRow
                key={key}
                label={label}
                model={MODEL_MAP[key]}
                actual={actuals[key]}
                metricKey={key}
                note={SCORECARD_NOTES.find((n) => n.key === key)?.note}
              />
            ) : (
              <LockedRow key={key} label={label} model={MODEL_MAP[key]} metricKey={key} />
            )
          )}
        </div>

        {actuals && (
          <p className="text-[11px] mt-3" style={{ color: "#9B9B9B" }}>
            Source: {actuals.source}
          </p>
        )}
      </div>

      {actuals && (
        <>
          {/* Segment GB Mix */}
          <div>
            <SectionHeader
              title="Segment GB Mix: The Crossover, Revisited"
              sub="The model predicted Delivery narrowly leading Mobility. It didn't happen, here's the actual mix."
            />
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ width: "100%", height: 200 }}>
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
              <p className="text-[11.5px] leading-relaxed mt-3" style={{ color: "#6B6B6B" }}>
                Mobility&apos;s share of total GB widened to{" "}
                <span style={{ color: "#0A0A0A", fontWeight: 600 }}>
                  {fmtPct(actuals.mobilityGB / actualTotalGB)}
                </span>{" "}
                (from 49.1% in Q1&apos;26), against a modeled{" "}
                {fmtPct(out.mobilityGB / forecastTotalGB)}. Delivery came in at{" "}
                <span style={{ color: "#0A0A0A", fontWeight: 600 }}>
                  {fmtPct(actuals.deliveryGB / actualTotalGB)}
                </span>{" "}
                of GB, below the modeled {fmtPct(out.deliveryGB / forecastTotalGB)}.
              </p>
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

          {/* Charts */}
          <div>
            <SectionHeader title="Charts" />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <span className="text-[11px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
                  Forecast vs. Actual
                </span>
                <div style={{ width: "100%", height: 220 }} className="mt-2">
                  <ResponsiveContainer>
                    <BarChart data={dollarChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
                      <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 8.5 }} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#6B6B6B" }} formatter={(v: number) => fmtM(v)} />
                      <Bar dataKey="Forecast" fill="#D5D5D5" radius={[4, 4, 0, 0]} />
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
        </>
      )}
    </section>
  );
}

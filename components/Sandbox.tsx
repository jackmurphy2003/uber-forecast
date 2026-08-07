"use client";

import { useMemo, useState } from "react";
import { Info, RotateCcw, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { DRIVERS, EBITDA_SCENARIOS, GUIDANCE, type ScenarioKey } from "@/lib/assumptions";
import { RANGES } from "@/lib/historical";
import { runForecast, type ForecastInputs } from "@/lib/forecast";
import { fmtM, fmtPct, fmtDollar, fmtNum } from "@/lib/format";
import { LOCKED_INPUTS } from "./LockedForecast";
import GuidanceBar from "./GuidanceBar";

const BASE_INPUTS: ForecastInputs = { ...LOCKED_INPUTS };
const BASE_OUTPUT = runForecast(BASE_INPUTS);

function matchScenario(margin: number): ScenarioKey | "custom" {
  const entry = (Object.entries(EBITDA_SCENARIOS) as [ScenarioKey, (typeof EBITDA_SCENARIOS)[ScenarioKey]][]).find(
    ([, s]) => Math.abs(s.margin - margin) < 1e-9
  );
  return entry ? entry[0] : "custom";
}

function SliderRow({
  label,
  value,
  baseValue,
  min,
  max,
  step,
  onChange,
  format,
  histMin,
  histMax,
  defense,
}: {
  label: string;
  value: number;
  baseValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  histMin?: number;
  histMax?: number;
  defense?: string;
}) {
  const basePct = ((baseValue - min) / (max - min)) * 100;
  const atBase = Math.abs(value - baseValue) < step / 2;
  const diff = value - baseValue;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#3A3A3A" }}>
          {label}
          {defense && (
            <span title={defense} className="cursor-help">
              <Info size={11} strokeWidth={2} style={{ color: "#B5B5B5" }} />
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {!atBase && (
            <span
              className="tnum text-[9.5px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: diff > 0 ? "rgba(6,193,103,0.1)" : "rgba(225,29,72,0.1)",
                color: diff > 0 ? "#04964F" : "#E11D48",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {diff > 0 ? "+" : ""}{format(Math.abs(diff))} vs base
            </span>
          )}
          <span
            className="tnum text-[13px] font-bold"
            style={{ color: atBase ? "#04964F" : "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}
          >
            {format(value)}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {/* Base position marker */}
      <div className="relative" style={{ height: 14 }}>
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${basePct}%`, transform: "translateX(-50%)" }}
        >
          <div style={{ width: 1.5, height: 5, background: "#06C167", borderRadius: 1 }} />
          <span style={{ fontSize: 8, color: "#06C167", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            base {format(baseValue)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[9.5px] font-medium" style={{ color: "#B5B5B5" }}>
        <span>{format(min)}</span>
        {histMin !== undefined && histMax !== undefined && (
          <span>12-qtr range: {format(histMin)} – {format(histMax)}</span>
        )}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function GroupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col rounded-[24px] overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <div className="px-5 sm:px-6 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#FAFAFA" }}>
        <span className="text-[10.5px] font-semibold" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-6 px-5 sm:px-6 py-5 sm:py-6">{children}</div>
    </div>
  );
}

function DeltaChip({ current, base }: { current: number; base: number }) {
  const diff = current - base;
  const pctDiff = base !== 0 ? diff / base : 0;
  if (Math.abs(pctDiff) < 0.0005) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold tnum" style={{ color: "#B5B5B5" }}>
        <Minus size={9} /> flat
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-semibold tnum"
      style={{ color: up ? "#04964F" : "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}
    >
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? "+" : ""}
      {(pctDiff * 100).toFixed(1)}% vs. locked
    </span>
  );
}

function KPI({ label, value, base }: { label: string; value: number; base: number }) {
  return (
    <div
      className="flex flex-col gap-1.5 px-4 py-3.5 rounded-2xl"
      style={{ background: "#F6F6F6" }}
    >
      <span className="text-[9.5px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span className="tnum text-[22px] font-black leading-none tracking-tight" style={{ color: "#0A0A0A" }}>
        {fmtM(value)}
      </span>
      <DeltaChip current={value} base={base} />
    </div>
  );
}

export default function Sandbox() {
  const [inputs, setInputs] = useState<ForecastInputs>(BASE_INPUTS);

  const set = <K extends keyof ForecastInputs>(key: K, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const setMobilityMix = (v: number) => {
    setInputs((prev) => ({ ...prev, mobilityMix: Math.min(v, 1 - prev.deliveryMix) }));
  };
  const setDeliveryMix = (v: number) => {
    setInputs((prev) => ({ ...prev, deliveryMix: Math.min(v, 1 - prev.mobilityMix) }));
  };

  const scenario = matchScenario(inputs.ebitdaMargin);
  const out = useMemo(() => runForecast(inputs), [inputs]);
  const isBase = JSON.stringify(inputs) === JSON.stringify(BASE_INPUTS);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
            Driver Sandbox
          </h2>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            Change any assumption using the sliders to see the impact on the Sandbox output
          </p>
        </div>
        <button
          onClick={() => setInputs(BASE_INPUTS)}
          disabled={isBase}
          className="flex items-center gap-1.5 text-[12px] font-bold px-5 py-2.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#FFFFFF", background: "#06C167" }}
        >
          <RotateCcw size={12} strokeWidth={2.25} />
          Reset to base case
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-5 items-start">
        {/* Left: driver controls */}
        <div className="flex flex-col gap-5 order-2 lg:order-1">
          <GroupCard title="Platform Drivers">
            <SliderRow
              label="MAPCs YoY Growth Rate"
              value={inputs.mapcGrowth}
              baseValue={BASE_INPUTS.mapcGrowth}
              min={0.05} max={0.30} step={0.001}
              onChange={(v) => set("mapcGrowth", v)}
              format={(v) => fmtPct(v)}
              defense={DRIVERS.mapcGrowth.defense}
            />
            <SliderRow
              label="Monthly Trips/MAPC YoY Growth"
              value={inputs.tripsPerMapcGrowth}
              baseValue={BASE_INPUTS.tripsPerMapcGrowth}
              min={-0.02} max={0.10} step={0.001}
              onChange={(v) => set("tripsPerMapcGrowth", v)}
              format={(v) => fmtPct(v)}
              defense={DRIVERS.tripsPerMapcGrowth.defense}
            />
            <SliderRow
              label="GB per Trip"
              value={inputs.gbPerTrip}
              baseValue={BASE_INPUTS.gbPerTrip}
              min={13.0} max={16.0} step={0.01}
              onChange={(v) => set("gbPerTrip", v)}
              format={(v) => fmtDollar(v)}
              histMin={RANGES.gbPerTrip.min} histMax={RANGES.gbPerTrip.max}
              defense={DRIVERS.gbPerTrip.defense}
            />
          </GroupCard>

          <GroupCard title="EBITDA Margin Scenario">
            <div className="flex gap-2">
              {(Object.keys(EBITDA_SCENARIOS) as ScenarioKey[]).map((key) => {
                const s = EBITDA_SCENARIOS[key];
                const active = scenario === key;
                return (
                  <button
                    key={key}
                    onClick={() => set("ebitdaMargin", s.margin)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-full"
                    style={{
                      background: active ? "#06C167" : "#F6F6F6",
                    }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: active ? "#FFFFFF" : "#6B6B6B" }}>
                      {s.label}
                    </span>
                    <span className="tnum text-[11px] font-semibold" style={{ color: active ? "#FFFFFF" : "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
                      {fmtPct(s.margin)}
                    </span>
                  </button>
                );
              })}
            </div>
            <SliderRow
              label="Active EBITDA Margin"
              value={inputs.ebitdaMargin}
              baseValue={BASE_INPUTS.ebitdaMargin}
              min={0.035} max={0.065} step={0.0005}
              onChange={(v) => set("ebitdaMargin", v)}
              format={(v) => fmtPct(v, 2)}
              histMin={RANGES.ebitdaMargin.min} histMax={RANGES.ebitdaMargin.max}
              defense={DRIVERS.ebitdaMarginBase.defense}
            />
            <p className="text-[10.5px] font-medium" style={{ color: "#B5B5B5" }}>
              Guidance: ${fmtNum(GUIDANCE.adjEbitdaLow)}M to ${fmtNum(GUIDANCE.adjEbitdaHigh)}M Adj EBITDA
            </p>
          </GroupCard>

          <GroupCard title="Segment Gross Bookings Mix">
            <SliderRow
              label="Mobility % of Total GB"
              value={inputs.mobilityMix}
              baseValue={BASE_INPUTS.mobilityMix}
              min={0.40} max={0.55} step={0.001}
              onChange={setMobilityMix}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityMix.min} histMax={RANGES.mobilityMix.max}
              defense={DRIVERS.mobilityMix.defense}
            />
            <SliderRow
              label="Delivery % of Total GB"
              value={inputs.deliveryMix}
              baseValue={BASE_INPUTS.deliveryMix}
              min={0.40} max={0.55} step={0.001}
              onChange={setDeliveryMix}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryMix.min} histMax={RANGES.deliveryMix.max}
              defense={DRIVERS.deliveryMix.defense}
            />
            <div className="flex items-center justify-between text-[12px] font-medium px-0.5" style={{ color: "#6B6B6B" }}>
              <span>Freight % of Total GB (derived)</span>
              <span className="tnum font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
                {fmtPct(out.freightMix)}
              </span>
            </div>
          </GroupCard>

          <GroupCard title="Segment Take Rates">
            <SliderRow
              label="Mobility Take Rate"
              value={inputs.mobilityTakeRate}
              baseValue={BASE_INPUTS.mobilityTakeRate}
              min={0.24} max={0.34} step={0.001}
              onChange={(v) => set("mobilityTakeRate", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityTakeRate.min} histMax={RANGES.mobilityTakeRate.max}
              defense={DRIVERS.mobilityTakeRate.defense}
            />
            <SliderRow
              label="Delivery Take Rate"
              value={inputs.deliveryTakeRate}
              baseValue={BASE_INPUTS.deliveryTakeRate}
              min={0.15} max={0.24} step={0.001}
              onChange={(v) => set("deliveryTakeRate", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryTakeRate.min} histMax={RANGES.deliveryTakeRate.max}
              defense={DRIVERS.deliveryTakeRate.defense}
            />
            <SliderRow
              label="Freight Take Rate"
              value={inputs.freightTakeRate}
              baseValue={BASE_INPUTS.freightTakeRate}
              min={0.97} max={1.03} step={0.0005}
              onChange={(v) => set("freightTakeRate", v)}
              format={(v) => fmtPct(v, 2)}
              histMin={RANGES.freightTakeRate.min} histMax={RANGES.freightTakeRate.max}
              defense={DRIVERS.freightTakeRate.defense}
            />
          </GroupCard>

          <GroupCard title="Segment Operating Income">
            <SliderRow
              label="Mobility Op Margin (% of Mobility GB)"
              value={inputs.mobilityOpMargin}
              baseValue={BASE_INPUTS.mobilityOpMargin}
              min={0.04} max={0.11} step={0.001}
              onChange={(v) => set("mobilityOpMargin", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityOpMargin.min} histMax={RANGES.mobilityOpMargin.max}
              defense={DRIVERS.mobilityOpMargin.defense}
            />
            <SliderRow
              label="Delivery Op Margin (% of Delivery GB)"
              value={inputs.deliveryOpMargin}
              baseValue={BASE_INPUTS.deliveryOpMargin}
              min={0.00} max={0.06} step={0.001}
              onChange={(v) => set("deliveryOpMargin", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryOpMargin.min} histMax={RANGES.deliveryOpMargin.max}
              defense={DRIVERS.deliveryOpMargin.defense}
            />
            <SliderRow
              label="Freight Op Income ($M)"
              value={inputs.freightOpIncome}
              baseValue={BASE_INPUTS.freightOpIncome}
              min={-80} max={20} step={1}
              onChange={(v) => set("freightOpIncome", v)}
              format={(v) => fmtM(v)}
              histMin={RANGES.freightOpIncome.min} histMax={RANGES.freightOpIncome.max}
              defense={DRIVERS.freightOpIncome.defense}
            />
            <SliderRow
              label="Corp G&A + Platform R&D ($M)"
              value={inputs.corpGA}
              baseValue={BASE_INPUTS.corpGA}
              min={-1400} max={-700} step={1}
              onChange={(v) => set("corpGA", v)}
              format={(v) => fmtM(v)}
              histMin={RANGES.corpGA.min} histMax={RANGES.corpGA.max}
              defense={DRIVERS.corpGA.defense}
            />
          </GroupCard>
        </div>

        {/* Right: live output panel — first on mobile so numbers are always visible */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-5 order-1 lg:order-2">
          <div
            className="rounded-[28px] p-6 sm:p-7 flex flex-col gap-6"
            style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.08em" }}>
                Sandbox Output
              </h3>
              <span
                className="text-[10px] font-bold px-3 py-1 rounded-full tnum"
                style={{
                  color: isBase ? "#04964F" : "#6B6B6B",
                  background: isBase ? "rgba(6,193,103,0.12)" : "#F0F0F0",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {isBase ? "base case" : "custom scenario"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <KPI label="Gross Bookings" value={out.grossBookings} base={BASE_OUTPUT.grossBookings} />
              <KPI label="Revenue" value={out.totalRevenue} base={BASE_OUTPUT.totalRevenue} />
              <KPI label="Adj EBITDA" value={out.adjEbitda} base={BASE_OUTPUT.adjEbitda} />
              <KPI label="Non-GAAP OI" value={out.totalNGOP} base={BASE_OUTPUT.totalNGOP} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px] font-medium">
                  <span style={{ color: "#6B6B6B" }}>GB vs. guidance</span>
                  <span className="tnum font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</span>
                </div>
                <GuidanceBar low={GUIDANCE.grossBookingsLow} high={GUIDANCE.grossBookingsHigh} value={out.grossBookings} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px] font-medium">
                  <span style={{ color: "#6B6B6B" }}>Adj EBITDA vs. guidance</span>
                  <span className="tnum font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.adjEbitda)}</span>
                </div>
                <GuidanceBar low={GUIDANCE.adjEbitdaLow} high={GUIDANCE.adjEbitdaHigh} value={out.adjEbitda} />
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin-dark rounded-2xl" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <table className="w-full border-collapse" style={{ minWidth: 320 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    {["Segment", "GB", "Rev", "NGOP"].map((h, i) => (
                      <th
                        key={h}
                        className="px-3 py-2 font-semibold"
                        style={{
                          textAlign: i === 0 ? "left" : "right",
                          color: "#9B9B9B",
                          fontSize: "9.5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          background: "#FAFAFA",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Mobility", gb: out.mobilityGB, rev: out.mobilityRevenue, ngop: out.mobilityNGOP },
                    { name: "Delivery", gb: out.deliveryGB, rev: out.deliveryRevenue, ngop: out.deliveryNGOP },
                    { name: "Freight", gb: out.freightGB, rev: out.freightRevenue, ngop: out.freightNGOP },
                  ].map((row) => (
                    <tr key={row.name} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <td className="px-3 py-2 text-[11px] font-medium" style={{ color: "#0A0A0A" }}>{row.name}</td>
                      <td className="px-3 py-2 text-right tnum text-[11px]" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.gb)}</td>
                      <td className="px-3 py-2 text-right tnum text-[11px]" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.rev)}</td>
                      <td className="px-3 py-2 text-right tnum text-[11px]" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.ngop)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-2 text-[11px] font-medium" style={{ color: "#0A0A0A" }}>Corp G&A</td>
                    <td colSpan={2} />
                    <td className="px-3 py-2 text-right tnum text-[11px]" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.corpGA)}</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                    <td className="px-3 py-2.5 text-[11px] font-bold" style={{ color: "#0A0A0A" }}>Total</td>
                    <td className="px-3 py-2.5 text-right tnum text-[11px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</td>
                    <td className="px-3 py-2.5 text-right tnum text-[11px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalRevenue)}</td>
                    <td className="px-3 py-2.5 text-right tnum text-[11px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalNGOP)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[10.5px] font-medium pt-1" style={{ color: "#B5B5B5", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              Implied consolidated take rate: <span className="tnum font-semibold" style={{ color: "#6B6B6B" }}>{fmtPct(out.consolidatedTakeRate)}</span>
              {" · "}Total trips: <span className="tnum font-semibold" style={{ color: "#6B6B6B" }}>{fmtNum(out.totalTrips)}M</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

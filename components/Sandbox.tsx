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
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  histMin?: number;
  histMax?: number;
  defense?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11.5px]" style={{ color: "#A1A1AA" }}>
          {label}
          {defense && (
            <span title={defense} className="cursor-help">
              <Info size={10.5} strokeWidth={1.75} style={{ color: "#3F3F46" }} />
            </span>
          )}
        </span>
        <span
          className="tnum text-[12.5px] font-medium"
          style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex items-center justify-between text-[9.5px]" style={{ color: "#3F3F46" }}>
        <span>{format(min)}</span>
        {histMin !== undefined && histMax !== undefined && (
          <span>
            12-qtr range: {format(histMin)}–{format(histMax)}
          </span>
        )}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function GroupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-4"
      style={{ background: "#0F0F11", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h3 className="text-[11px] font-semibold uppercase" style={{ color: "#71717A", letterSpacing: "0.07em" }}>
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function DeltaChip({ current, base }: { current: number; base: number }) {
  const diff = current - base;
  const pctDiff = base !== 0 ? diff / base : 0;
  if (Math.abs(pctDiff) < 0.0005) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] tnum" style={{ color: "#52525B" }}>
        <Minus size={9} /> flat
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] tnum"
      style={{ color: up ? "#4ADE80" : "#F87171", fontFamily: "var(--font-geist-mono)" }}
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
      className="flex flex-col gap-1 px-3.5 py-2.5 rounded-lg"
      style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span className="text-[9.5px] uppercase" style={{ color: "#52525B", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span className="tnum text-[17px] font-semibold leading-none" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>
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
    <section className="fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-semibold" style={{ color: "#FAFAFA" }}>
            Driver Sandbox
          </h2>
          <p className="text-[11px]" style={{ color: "#52525B" }}>
            Drag any assumption to see the segment P&amp;L update live. Doesn&apos;t affect the locked forecast above.
          </p>
        </div>
        <button
          onClick={() => setInputs(BASE_INPUTS)}
          disabled={isBase}
          className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <RotateCcw size={11} strokeWidth={1.75} />
          Reset to base case
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-4 items-start">
        {/* Left: driver controls */}
        <div className="flex flex-col gap-4">
          <GroupCard title="1. Platform Drivers">
            <SliderRow
              label="MAPCs YoY Growth Rate"
              value={inputs.mapcGrowth}
              min={0.05}
              max={0.30}
              step={0.001}
              onChange={(v) => set("mapcGrowth", v)}
              format={(v) => fmtPct(v)}
              defense={DRIVERS.mapcGrowth.defense}
            />
            <SliderRow
              label="Monthly Trips/MAPC YoY Growth"
              value={inputs.tripsPerMapcGrowth}
              min={-0.02}
              max={0.10}
              step={0.001}
              onChange={(v) => set("tripsPerMapcGrowth", v)}
              format={(v) => fmtPct(v)}
              defense={DRIVERS.tripsPerMapcGrowth.defense}
            />
            <SliderRow
              label="GB per Trip"
              value={inputs.gbPerTrip}
              min={13.0}
              max={16.0}
              step={0.01}
              onChange={(v) => set("gbPerTrip", v)}
              format={(v) => fmtDollar(v)}
              histMin={RANGES.gbPerTrip.min}
              histMax={RANGES.gbPerTrip.max}
              defense={DRIVERS.gbPerTrip.defense}
            />
          </GroupCard>

          <GroupCard title="2. EBITDA Margin Scenario">
            <div className="flex gap-1.5">
              {(Object.keys(EBITDA_SCENARIOS) as ScenarioKey[]).map((key) => {
                const s = EBITDA_SCENARIOS[key];
                const active = scenario === key;
                return (
                  <button
                    key={key}
                    onClick={() => set("ebitdaMargin", s.margin)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-md transition-colors duration-100"
                    style={{
                      background: active ? "rgba(99,102,241,0.12)" : "#131316",
                      border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-[10.5px] font-medium" style={{ color: active ? "#A5B4FC" : "#71717A" }}>
                      {s.label}
                    </span>
                    <span className="tnum text-[11px]" style={{ color: active ? "#A5B4FC" : "#3F3F46", fontFamily: "var(--font-geist-mono)" }}>
                      {fmtPct(s.margin)}
                    </span>
                  </button>
                );
              })}
            </div>
            <SliderRow
              label="Active EBITDA Margin (fine-tune)"
              value={inputs.ebitdaMargin}
              min={0.035}
              max={0.065}
              step={0.0005}
              onChange={(v) => set("ebitdaMargin", v)}
              format={(v) => fmtPct(v, 2)}
              histMin={RANGES.ebitdaMargin.min}
              histMax={RANGES.ebitdaMargin.max}
              defense={DRIVERS.ebitdaMarginBase.defense}
            />
            <p className="text-[10px]" style={{ color: "#3F3F46" }}>
              Guidance: ${fmtNum(GUIDANCE.adjEbitdaLow)}M–${fmtNum(GUIDANCE.adjEbitdaHigh)}M Adj EBITDA
            </p>
          </GroupCard>

          <GroupCard title="3. Segment Gross Bookings Mix">
            <SliderRow
              label="Mobility % of Total GB"
              value={inputs.mobilityMix}
              min={0.40}
              max={0.55}
              step={0.001}
              onChange={setMobilityMix}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityMix.min}
              histMax={RANGES.mobilityMix.max}
              defense={DRIVERS.mobilityMix.defense}
            />
            <SliderRow
              label="Delivery % of Total GB"
              value={inputs.deliveryMix}
              min={0.40}
              max={0.55}
              step={0.001}
              onChange={setDeliveryMix}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryMix.min}
              histMax={RANGES.deliveryMix.max}
              defense={DRIVERS.deliveryMix.defense}
            />
            <div className="flex items-center justify-between text-[11px] px-0.5" style={{ color: "#52525B" }}>
              <span>Freight % of Total GB (derived)</span>
              <span className="tnum" style={{ color: "#A1A1AA", fontFamily: "var(--font-geist-mono)" }}>
                {fmtPct(out.freightMix)}
              </span>
            </div>
          </GroupCard>

          <GroupCard title="4. Segment Revenue Take Rates">
            <SliderRow
              label="Mobility Take Rate"
              value={inputs.mobilityTakeRate}
              min={0.24}
              max={0.34}
              step={0.001}
              onChange={(v) => set("mobilityTakeRate", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityTakeRate.min}
              histMax={RANGES.mobilityTakeRate.max}
              defense={DRIVERS.mobilityTakeRate.defense}
            />
            <SliderRow
              label="Delivery Take Rate"
              value={inputs.deliveryTakeRate}
              min={0.15}
              max={0.24}
              step={0.001}
              onChange={(v) => set("deliveryTakeRate", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryTakeRate.min}
              histMax={RANGES.deliveryTakeRate.max}
              defense={DRIVERS.deliveryTakeRate.defense}
            />
            <SliderRow
              label="Freight Take Rate"
              value={inputs.freightTakeRate}
              min={0.97}
              max={1.03}
              step={0.0005}
              onChange={(v) => set("freightTakeRate", v)}
              format={(v) => fmtPct(v, 2)}
              histMin={RANGES.freightTakeRate.min}
              histMax={RANGES.freightTakeRate.max}
              defense={DRIVERS.freightTakeRate.defense}
            />
          </GroupCard>

          <GroupCard title="5. Segment Non-GAAP Operating Income">
            <SliderRow
              label="Mobility Op Margin (% of Mobility GB)"
              value={inputs.mobilityOpMargin}
              min={0.04}
              max={0.11}
              step={0.001}
              onChange={(v) => set("mobilityOpMargin", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.mobilityOpMargin.min}
              histMax={RANGES.mobilityOpMargin.max}
              defense={DRIVERS.mobilityOpMargin.defense}
            />
            <SliderRow
              label="Delivery Op Margin (% of Delivery GB)"
              value={inputs.deliveryOpMargin}
              min={0.00}
              max={0.06}
              step={0.001}
              onChange={(v) => set("deliveryOpMargin", v)}
              format={(v) => fmtPct(v)}
              histMin={RANGES.deliveryOpMargin.min}
              histMax={RANGES.deliveryOpMargin.max}
              defense={DRIVERS.deliveryOpMargin.defense}
            />
            <SliderRow
              label="Freight Op Income ($M)"
              value={inputs.freightOpIncome}
              min={-80}
              max={20}
              step={1}
              onChange={(v) => set("freightOpIncome", v)}
              format={(v) => fmtM(v)}
              histMin={RANGES.freightOpIncome.min}
              histMax={RANGES.freightOpIncome.max}
              defense={DRIVERS.freightOpIncome.defense}
            />
            <SliderRow
              label="Corp G&A + Platform R&D ($M)"
              value={inputs.corpGA}
              min={-1400}
              max={-700}
              step={1}
              onChange={(v) => set("corpGA", v)}
              format={(v) => fmtM(v)}
              histMin={RANGES.corpGA.min}
              histMax={RANGES.corpGA.max}
              defense={DRIVERS.corpGA.defense}
            />
          </GroupCard>
        </div>

        {/* Right: live output panel */}
        <div className="lg:sticky lg:top-4 flex flex-col gap-4">
          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{ background: "#0F0F11", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase" style={{ color: "#71717A", letterSpacing: "0.07em" }}>
                Sandbox Output
              </h3>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full tnum"
                style={{
                  color: isBase ? "#6366F1" : "#F97316",
                  background: isBase ? "rgba(99,102,241,0.1)" : "rgba(249,115,22,0.1)",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {isBase ? "base case" : "custom scenario"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <KPI label="Gross Bookings" value={out.grossBookings} base={BASE_OUTPUT.grossBookings} />
              <KPI label="Revenue" value={out.totalRevenue} base={BASE_OUTPUT.totalRevenue} />
              <KPI label="Adj EBITDA" value={out.adjEbitda} base={BASE_OUTPUT.adjEbitda} />
              <KPI label="Non-GAAP OI" value={out.totalNGOP} base={BASE_OUTPUT.totalNGOP} />
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span style={{ color: "#52525B" }}>GB vs. guidance</span>
                  <span className="tnum" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</span>
                </div>
                <GuidanceBar low={GUIDANCE.grossBookingsLow} high={GUIDANCE.grossBookingsHigh} value={out.grossBookings} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span style={{ color: "#52525B" }}>Adj EBITDA vs. guidance</span>
                  <span className="tnum" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.adjEbitda)}</span>
                </div>
                <GuidanceBar low={GUIDANCE.adjEbitdaLow} high={GUIDANCE.adjEbitdaHigh} value={out.adjEbitda} />
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin-dark">
              <table className="w-full border-collapse" style={{ minWidth: 320 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Segment", "GB", "Rev", "NGOP"].map((h, i) => (
                      <th
                        key={h}
                        className="px-2 py-1.5 font-medium"
                        style={{
                          textAlign: i === 0 ? "left" : "right",
                          color: "#3F3F46",
                          fontSize: "9.5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
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
                    <tr key={row.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="px-2 py-1.5 text-[11px]" style={{ color: "#D4D4D8" }}>{row.name}</td>
                      <td className="px-2 py-1.5 text-right tnum text-[11px]" style={{ color: "#A1A1AA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.gb)}</td>
                      <td className="px-2 py-1.5 text-right tnum text-[11px]" style={{ color: "#A1A1AA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.rev)}</td>
                      <td className="px-2 py-1.5 text-right tnum text-[11px]" style={{ color: "#A1A1AA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.ngop)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-2 py-1.5 text-[11px]" style={{ color: "#D4D4D8" }}>Corp G&A</td>
                    <td colSpan={2} />
                    <td className="px-2 py-1.5 text-right tnum text-[11px]" style={{ color: "#F87171", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.corpGA)}</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td className="px-2 py-2 text-[11px] font-semibold" style={{ color: "#FAFAFA" }}>Total</td>
                    <td className="px-2 py-2 text-right tnum text-[11px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</td>
                    <td className="px-2 py-2 text-right tnum text-[11px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalRevenue)}</td>
                    <td className="px-2 py-2 text-right tnum text-[11px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalNGOP)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[10px] pt-1" style={{ color: "#3F3F46", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              Implied consolidated take rate: <span className="tnum" style={{ color: "#71717A" }}>{fmtPct(out.consolidatedTakeRate)}</span>
              {" · "}Total trips: <span className="tnum" style={{ color: "#71717A" }}>{fmtNum(out.totalTrips)}M</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { DRIVERS, GUIDANCE, LOCKED_SNAPSHOT_DATE } from "@/lib/assumptions";
import { runForecast } from "@/lib/forecast";
import { fmtM, fmtPct, fmtNum, fmtDollar } from "@/lib/format";
import { Lock, Calendar } from "lucide-react";
import GuidanceBar from "./GuidanceBar";

export const LOCKED_INPUTS = {
  mapcGrowth: DRIVERS.mapcGrowth.value,
  tripsPerMapcGrowth: DRIVERS.tripsPerMapcGrowth.value,
  gbPerTrip: DRIVERS.gbPerTrip.value,
  ebitdaMargin: DRIVERS.ebitdaMarginBase.value,
  mobilityMix: DRIVERS.mobilityMix.value,
  deliveryMix: DRIVERS.deliveryMix.value,
  mobilityTakeRate: DRIVERS.mobilityTakeRate.value,
  deliveryTakeRate: DRIVERS.deliveryTakeRate.value,
  freightTakeRate: DRIVERS.freightTakeRate.value,
  mobilityOpMargin: DRIVERS.mobilityOpMargin.value,
  deliveryOpMargin: DRIVERS.deliveryOpMargin.value,
  freightOpIncome: DRIVERS.freightOpIncome.value,
  corpGA: DRIVERS.corpGA.value,
};

function KPI({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-lg"
      style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span
        className="text-[10px] uppercase"
        style={{ color: "#52525B", letterSpacing: "0.06em" }}
      >
        {label}
      </span>
      <span
        className="tnum text-[20px] font-semibold leading-none"
        style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10.5px]" style={{ color: "#3F3F46" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function LockedForecast() {
  const out = runForecast(LOCKED_INPUTS);

  const submittedDate = new Date(LOCKED_SNAPSHOT_DATE + "T12:00:00");
  const earningsDate = new Date(GUIDANCE.earningsDate + "T12:00:00");

  return (
    <section
      className="rounded-xl p-5 fade-in-up"
      style={{ background: "#0F0F11", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
            style={{ background: "rgba(74,222,128,0.1)" }}
          >
            <Lock size={13} strokeWidth={1.75} style={{ color: "#4ADE80" }} />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold" style={{ color: "#FAFAFA" }}>
              My Q2&apos;26F Forecast — Locked Submission
            </h2>
            <p className="text-[11px]" style={{ color: "#52525B" }}>
              Static snapshot. Sandbox sliders below do not affect these numbers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#71717A" }}>
          <Calendar size={11} strokeWidth={1.5} />
          Submitted{" "}
          {submittedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} —{" "}
          {Math.round((earningsDate.getTime() - submittedDate.getTime()) / 86400000)} days before
          Uber&apos;s {earningsDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} print
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <KPI label="Gross Bookings" value={fmtM(out.grossBookings)} sub={`${fmtNum(out.mapcs, 1)}M MAPCs`} />
        <KPI label="Revenue" value={fmtM(out.totalRevenue)} sub={`${fmtPct(out.consolidatedTakeRate)} take rate`} />
        <KPI label="Adj EBITDA" value={fmtM(out.adjEbitda)} sub={`${fmtPct(LOCKED_INPUTS.ebitdaMargin)} margin`} />
        <KPI label="Non-GAAP Op Income" value={fmtM(out.totalNGOP)} sub="segment sum" />
      </div>

      {/* Guidance check */}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-5 px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10.5px]">
            <span style={{ color: "#52525B" }}>Gross Bookings vs. guidance {fmtDollar(GUIDANCE.grossBookingsLow / 1000, 2)}B–{fmtDollar(GUIDANCE.grossBookingsHigh / 1000, 2)}B</span>
            <span className="tnum" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</span>
          </div>
          <GuidanceBar low={GUIDANCE.grossBookingsLow} high={GUIDANCE.grossBookingsHigh} value={out.grossBookings} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10.5px]">
            <span style={{ color: "#52525B" }}>Adj EBITDA vs. guidance ${fmtNum(GUIDANCE.adjEbitdaLow)}M–${fmtNum(GUIDANCE.adjEbitdaHigh)}M</span>
            <span className="tnum" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.adjEbitda)}</span>
          </div>
          <GuidanceBar low={GUIDANCE.adjEbitdaLow} high={GUIDANCE.adjEbitdaHigh} value={out.adjEbitda} />
        </div>
      </div>

      {/* Segment table */}
      <div className="overflow-x-auto scrollbar-thin-dark">
        <table className="w-full border-collapse" style={{ minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Segment", "Gross Bookings", "Mix", "Revenue", "Take Rate", "Non-GAAP OI", "Op Margin"].map((h, i) => (
                <th
                  key={h}
                  className="px-3 py-2 font-medium"
                  style={{
                    textAlign: i === 0 ? "left" : "right",
                    color: "#3F3F46",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Mobility", gb: out.mobilityGB, mix: LOCKED_INPUTS.mobilityMix, rev: out.mobilityRevenue, tr: LOCKED_INPUTS.mobilityTakeRate, ngop: out.mobilityNGOP, margin: LOCKED_INPUTS.mobilityOpMargin },
              { name: "Delivery", gb: out.deliveryGB, mix: LOCKED_INPUTS.deliveryMix, rev: out.deliveryRevenue, tr: LOCKED_INPUTS.deliveryTakeRate, ngop: out.deliveryNGOP, margin: LOCKED_INPUTS.deliveryOpMargin },
              { name: "Freight", gb: out.freightGB, mix: out.freightMix, rev: out.freightRevenue, tr: LOCKED_INPUTS.freightTakeRate, ngop: out.freightNGOP, margin: null },
            ].map((row) => (
              <tr key={row.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-3 py-2 text-[12.5px] font-medium" style={{ color: "#FAFAFA" }}>{row.name}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#D4D4D8", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.gb)}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#71717A", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(row.mix)}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#D4D4D8", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.rev)}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#71717A", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(row.tr)}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#D4D4D8", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.ngop)}</td>
                <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#71717A", fontFamily: "var(--font-geist-mono)" }}>{row.margin !== null ? fmtPct(row.margin) : "—"}</td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2 text-[12.5px] font-semibold" style={{ color: "#FAFAFA" }}>Corp G&A + Platform R&D</td>
              <td colSpan={4} />
              <td className="px-3 py-2 text-right tnum text-[12.5px]" style={{ color: "#F87171", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.corpGA)}</td>
              <td />
            </tr>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <td className="px-3 py-2.5 text-[12.5px] font-semibold" style={{ color: "#FAFAFA" }}>Total</td>
              <td className="px-3 py-2.5 text-right tnum text-[12.5px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</td>
              <td className="px-3 py-2.5 text-right tnum text-[12.5px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>100.0%</td>
              <td className="px-3 py-2.5 text-right tnum text-[12.5px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalRevenue)}</td>
              <td className="px-3 py-2.5 text-right tnum text-[12.5px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(out.consolidatedTakeRate)}</td>
              <td className="px-3 py-2.5 text-right tnum text-[12.5px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalNGOP)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

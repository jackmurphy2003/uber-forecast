import { DRIVERS, GUIDANCE, LOCKED_SNAPSHOT_DATE } from "@/lib/assumptions";
import { runForecast } from "@/lib/forecast";
import { fmtM, fmtPct, fmtNum, fmtDollar } from "@/lib/format";
import GuidanceBar from "./GuidanceBar";
import EditableText from "./EditableText";

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
      className="flex flex-col gap-2 px-6 py-5 rounded-3xl"
      style={{ background: "#F6F6F6" }}
    >
      <span
        className="text-[10.5px] font-semibold uppercase"
        style={{ color: "#6B6B6B", letterSpacing: "0.07em" }}
      >
        {label}
      </span>
      <span
        className="tnum text-[34px] sm:text-[38px] font-black leading-none tracking-tight"
        style={{ color: "#0A0A0A" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11.5px] font-medium" style={{ color: "#9B9B9B" }}>
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
      className="rounded-[28px] p-6 sm:p-10"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
            <EditableText id="locked-title">Uber 2026 Q2 Forecast</EditableText>
          </h2>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            <EditableText id="locked-subtitle">Directly from my spreadsheet - not affected by Sandbox tab sliders</EditableText>
          </p>
        </div>
        <div className="text-[11.5px] font-medium" style={{ color: "#6B6B6B" }}>
          Submitted{" "}
          {submittedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })},{" "}
          {Math.round((earningsDate.getTime() - submittedDate.getTime()) / 86400000)} days before
          Uber&apos;s {earningsDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} print
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <KPI label="Gross Bookings" value={fmtM(out.grossBookings)} sub={`${fmtNum(out.mapcs, 1)}M MAPCs`} />
        <KPI label="Revenue" value={fmtM(out.totalRevenue)} sub={`${fmtPct(out.consolidatedTakeRate)} take rate`} />
        <KPI label="Adj EBITDA" value={fmtM(out.adjEbitda)} sub={`${fmtPct(LOCKED_INPUTS.ebitdaMargin)} margin`} />
        <KPI label="Non-GAAP Op Income" value={fmtM(out.totalNGOP)} sub="segment sum" />
      </div>

      {/* Guidance check */}
      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 mb-8 px-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: "#6B6B6B" }}>Gross Bookings vs. guidance {fmtDollar(GUIDANCE.grossBookingsLow / 1000, 2)}B to {fmtDollar(GUIDANCE.grossBookingsHigh / 1000, 2)}B</span>
            <span className="tnum font-semibold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</span>
          </div>
          <GuidanceBar low={GUIDANCE.grossBookingsLow} high={GUIDANCE.grossBookingsHigh} value={out.grossBookings} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: "#6B6B6B" }}>Adj EBITDA vs. guidance ${fmtNum(GUIDANCE.adjEbitdaLow)}M to ${fmtNum(GUIDANCE.adjEbitdaHigh)}M</span>
            <span className="tnum font-semibold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.adjEbitda)}</span>
          </div>
          <GuidanceBar low={GUIDANCE.adjEbitdaLow} high={GUIDANCE.adjEbitdaHigh} value={out.adjEbitda} />
        </div>
      </div>

      {/* Segment table */}
      <div className="overflow-x-auto scrollbar-thin-dark rounded-2xl" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <table className="w-full border-collapse" style={{ minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              {["Segment", "Gross Bookings", "Mix", "Revenue", "Take Rate", "Non-GAAP OI", "Op Margin"].map((h, i) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold"
                  style={{
                    textAlign: i === 0 ? "left" : "right",
                    color: "#9B9B9B",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
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
              { name: "Mobility", gb: out.mobilityGB, mix: LOCKED_INPUTS.mobilityMix, rev: out.mobilityRevenue, tr: LOCKED_INPUTS.mobilityTakeRate, ngop: out.mobilityNGOP, margin: LOCKED_INPUTS.mobilityOpMargin },
              { name: "Delivery", gb: out.deliveryGB, mix: LOCKED_INPUTS.deliveryMix, rev: out.deliveryRevenue, tr: LOCKED_INPUTS.deliveryTakeRate, ngop: out.deliveryNGOP, margin: LOCKED_INPUTS.deliveryOpMargin },
              { name: "Freight", gb: out.freightGB, mix: out.freightMix, rev: out.freightRevenue, tr: LOCKED_INPUTS.freightTakeRate, ngop: out.freightNGOP, margin: null },
            ].map((row) => (
              <tr key={row.name} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <td className="px-4 py-3 text-[12.5px] font-semibold" style={{ color: "#0A0A0A" }}>{row.name}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#2A2A2A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.gb)}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(row.mix)}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#2A2A2A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.rev)}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(row.tr)}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#2A2A2A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(row.ngop)}</td>
                <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>{row.margin !== null ? fmtPct(row.margin) : "—"}</td>
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3 text-[12.5px] font-semibold" style={{ color: "#0A0A0A" }}>Corp G&A + Platform R&D</td>
              <td colSpan={4} />
              <td className="px-4 py-3 text-right tnum text-[12.5px]" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.corpGA)}</td>
              <td />
            </tr>
            <tr style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <td className="px-4 py-3.5 text-[12.5px] font-bold" style={{ color: "#0A0A0A" }}>Total</td>
              <td className="px-4 py-3.5 text-right tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.grossBookings)}</td>
              <td className="px-4 py-3.5 text-right tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>100.0%</td>
              <td className="px-4 py-3.5 text-right tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalRevenue)}</td>
              <td className="px-4 py-3.5 text-right tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtPct(out.consolidatedTakeRate)}</td>
              <td className="px-4 py-3.5 text-right tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>{fmtM(out.totalNGOP)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

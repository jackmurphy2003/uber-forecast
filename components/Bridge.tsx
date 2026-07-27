import { ArrowDown } from "lucide-react";
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

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl" style={{ background: "#F6F6F6" }}>
      <span className="text-[10px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span className="tnum text-[26px] font-black leading-none tracking-tight" style={{ color: "#0A0A0A" }}>
        {value}
      </span>
    </div>
  );
}

function MiniWaterfallRow({ label, value, color, maxAbs }: { label: string; value: number; color: string; maxAbs: number }) {
  const widthPct = maxAbs !== 0 ? (Math.abs(value) / maxAbs) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10.5px] font-medium w-[62px] flex-shrink-0" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)" }}>
        <div className="h-full rounded-full" style={{ width: `${widthPct}%`, background: color }} />
      </div>
      <span className="tnum text-[10.5px] font-semibold w-[64px] flex-shrink-0 text-right" style={{ color: "#3A3A3A", fontFamily: "var(--font-geist-mono)" }}>
        {fmtM(value)}
      </span>
    </div>
  );
}

export default function Bridge() {
  const out = runForecast(LOCKED_INPUTS);

  const segments = [
    { label: "Mobility", value: out.mobilityNGOP, color: GREEN },
    { label: "Delivery", value: out.deliveryNGOP, color: BLACK },
    { label: "Freight", value: out.freightNGOP, color: GRAY },
    { label: "Corp G&A", value: out.corpGA, color: GRAY },
  ];
  const maxAbs = Math.max(...segments.map((s) => Math.abs(s.value)));

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Gross Bookings to Bottom Line
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Three independent calculations, all rooted in Gross Bookings. Revenue and Non-GAAP OI build from
          the segment mix, Adj EBITDA is a separate top-down calc, see driver tree logic on the methodology page.
        </p>
      </div>

      <div
        className="rounded-[28px] p-6 sm:p-10"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Shared root */}
        <div className="flex flex-col items-start gap-1 mb-8">
          <span className="text-[10.5px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.06em" }}>
            Gross Bookings
          </span>
          <span className="tnum text-[38px] font-black leading-none tracking-tight" style={{ color: "#0A0A0A" }}>
            {fmtM(out.grossBookings)}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Branch 1: Revenue */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <OpChip>&times; {fmtPct(out.consolidatedTakeRate)} take rate</OpChip>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <div className="w-full">
              <ResultCard label="Revenue" value={fmtM(out.totalRevenue)} />
            </div>
          </div>

          {/* Branch 2: Non-GAAP OI (genuine segment bridge) */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <OpChip>Segment NGOP build</OpChip>
            <ArrowDown size={16} strokeWidth={2.5} style={{ color: "#C4C4C4" }} />
            <div className="w-full flex flex-col gap-2 px-1">
              {segments.map((s) => (
                <MiniWaterfallRow key={s.label} label={s.label} value={s.value} color={s.color} maxAbs={maxAbs} />
              ))}
            </div>
            <div className="w-full">
              <ResultCard label="Non-GAAP Op Income" value={fmtM(out.totalNGOP)} />
            </div>
          </div>

          {/* Branch 3: Adj EBITDA, explicitly independent */}
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
              <ResultCard label="Adj EBITDA" value={fmtM(out.adjEbitda)} />
            </div>
            <p className="text-[10px] leading-relaxed text-center" style={{ color: "#B5B5B5" }}>
              Applied directly to Gross Bookings. Not a component of the Revenue or Non-GAAP OI build shown here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

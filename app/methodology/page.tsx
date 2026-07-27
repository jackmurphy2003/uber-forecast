import Header from "@/components/Header";
import { DRIVERS, GUIDANCE, EBITDA_SCENARIOS } from "@/lib/assumptions";
import { CONSOLIDATED } from "@/lib/data";
import { fmtPct, fmtM } from "@/lib/format";

const SOURCES = [
  { label: "Q2'24 Earnings Press Release", note: "prior-year comp column supplies Q2'23 actuals" },
  { label: "Q3'24 Earnings Press Release", note: "prior-year comp column supplies Q3'23 actuals" },
  { label: "Q4'24 Earnings Press Release", note: "prior-year comp column supplies Q4'23 actuals; Non-GAAP OI history begins here" },
  { label: "Q1'25 Earnings Press Release", note: "prior-year comp column supplies Q1'24 actuals" },
  { label: "Q2'25 Earnings Press Release", note: "Q2'25 actuals — base quarter for the Q2'26F build-up" },
  { label: "Q3'25 Earnings Press Release", note: "Q3'25 actuals" },
  { label: "Q4'25 Earnings Press Release", note: "Q4'25 actuals" },
  { label: "Q1'26 Earnings Press Release", note: "Q1'26 actuals; retroactively disclosed Q4'24 / Q1'25 segment Non-GAAP OI" },
  { label: "Q1'26 Earnings Call Transcript", note: "MAPC growth, trips/MAPC, and insurance-tailwind commentary cited in driver defense notes" },
];

const DRIVER_TREE = [
  { step: "MAPCs YoY Growth", detail: "Applied to Q2'25 actual MAPCs (180M) to get Q2'26F MAPCs." },
  { step: "Trips/MAPC YoY Growth", detail: "Applied to Q2'25 actual monthly trips/MAPC (6.05x) to get Q2'26F trips/MAPC." },
  { step: "Total Trips", detail: "MAPCs × monthly trips/MAPC × 3 months." },
  { step: "GB per Trip", detail: "12-quarter historical mean, applied to total trips to get Gross Bookings." },
  { step: "Segment Mix", detail: "Mobility / Delivery / Freight % of total GB, applied to Gross Bookings to get segment GB." },
  { step: "Segment Take Rates", detail: "Applied to segment GB to get segment revenue. Total revenue = sum of segments (segment tab is primary; consolidated revenue references it)." },
  { step: "EBITDA Margin Scenario", detail: "Applied directly to total Gross Bookings (top-down) to get consolidated Adj EBITDA — independent of the segment build-up below." },
  { step: "Segment Op Margins", detail: "Applied to segment GB to get segment Non-GAAP Operating Income (the metric that replaced segment Adj EBITDA starting Q1'26)." },
  { step: "Corp G&A + Platform R&D", detail: "Flat dollar deduction, added to segment NGOP sum to get total Non-GAAP Operating Income." },
];

const CAVEATS = [
  {
    title: "Segment Adj EBITDA was discontinued starting Q1'26",
    body: "Uber stopped disclosing segment-level Adjusted EBITDA starting with the Q1'26 print. It was replaced by segment Non-GAAP Operating Income. Consolidated Adj EBITDA is still disclosed, but not at the segment level. This model keeps the two series separate rather than splicing them — the segment margin charts on the forecast page use the pre-Q1'26 Adj EBITDA basis, labeled accordingly.",
  },
  {
    title: "Take rate noise from contra-revenue reclassification",
    body: "Q2'24, Q3'24, and Q1'26 take rates are distorted by a disclosed reclassification of certain sales & marketing costs as contra-revenue. In Q1'26, Mobility revenue grew only 5% YoY versus Gross Bookings +25% YoY — an accounting effect, not a demand slowdown. Those quarters are treated as outliers rather than trend signal when setting take rate assumptions.",
  },
  {
    title: "Segment trips/MAPC isn't disclosed",
    body: "Uber only discloses trips/MAPC at the consolidated level. Segment Gross Bookings in this model are built from top-down mix assumptions, not from segment-level trip counts.",
  },
];

function DriverDefense({ label, value, defense, format }: { label: string; value: number; defense: string; format: (v: number) => string }) {
  return (
    <div className="flex flex-col gap-1 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium" style={{ color: "#FAFAFA" }}>{label}</span>
        <span className="tnum text-[12.5px] flex-shrink-0" style={{ color: "#A5B4FC", fontFamily: "var(--font-geist-mono)" }}>{format(value)}</span>
      </div>
      <p className="text-[11.5px] leading-relaxed" style={{ color: "#71717A" }}>{defense}</p>
    </div>
  );
}

export default function MethodologyPage() {
  const q125 = CONSOLIDATED.find((q) => q.quarter === "Q1'26")!;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-5 py-6 max-w-[900px] w-full mx-auto flex flex-col gap-10">
        <div>
          <h1 className="text-[18px] font-semibold mb-1.5" style={{ color: "#FAFAFA" }}>
            Methodology
          </h1>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#71717A" }}>
            This Q2&apos;26F forecast was built from Uber&apos;s publicly disclosed segment financials
            (Q2&apos;23–Q1&apos;26) and management commentary from the Q1&apos;26 earnings call, then submitted
            as a locked snapshot ahead of Uber&apos;s {new Date(GUIDANCE.earningsDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} print.
            Every base-case assumption below is defended against a specific historical trend or disclosed
            data point — no assumption is a bare guess.
          </p>
        </div>

        {/* Data sources */}
        <section>
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "#FAFAFA" }}>
            Data Sources
          </h2>
          <div className="flex flex-col rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {SOURCES.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 px-3.5 py-2.5"
                style={{
                  background: i % 2 === 0 ? "#0F0F11" : "#0C0C0E",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                }}
              >
                <span className="text-[12px] font-medium flex-shrink-0" style={{ color: "#D4D4D8", width: 240 }}>
                  {s.label}
                </span>
                <span className="text-[11.5px]" style={{ color: "#52525B" }}>{s.note}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: "#3F3F46" }}>
            Q1&apos;26 note: {q125.note}
          </p>
        </section>

        {/* Driver tree */}
        <section>
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "#FAFAFA" }}>
            Driver Tree Logic
          </h2>
          <div className="flex flex-col gap-0">
            {DRIVER_TREE.map((d, i) => (
              <div key={d.step} className="flex gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] tnum font-medium mt-0.5"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#A5B4FC", fontFamily: "var(--font-geist-mono)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <span className="text-[12px] font-medium" style={{ color: "#FAFAFA" }}>{d.step}</span>
                  <p className="text-[11.5px] leading-relaxed mt-0.5" style={{ color: "#71717A" }}>{d.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EBITDA scenarios */}
        <section>
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "#FAFAFA" }}>
            EBITDA Margin Scenarios
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {(Object.keys(EBITDA_SCENARIOS) as (keyof typeof EBITDA_SCENARIOS)[]).map((key) => {
              const s = EBITDA_SCENARIOS[key];
              const active = key === "base";
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 px-3.5 py-3 rounded-lg"
                  style={{
                    background: active ? "rgba(99,102,241,0.08)" : "#0F0F11",
                    border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-[11px] font-medium" style={{ color: active ? "#A5B4FC" : "#A1A1AA" }}>
                    {s.label}{active && " (submitted)"}
                  </span>
                  <span className="tnum text-[15px] font-semibold" style={{ color: "#FAFAFA", fontFamily: "var(--font-geist-mono)" }}>
                    {fmtPct(s.margin)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] mt-2.5" style={{ color: "#3F3F46" }}>
            Guidance range: {fmtM(GUIDANCE.adjEbitdaLow)}–{fmtM(GUIDANCE.adjEbitdaHigh)} Adj EBITDA, non-GAAP EPS ${GUIDANCE.epsLow.toFixed(2)}–${GUIDANCE.epsHigh.toFixed(2)}.
          </p>
        </section>

        {/* Base case defense */}
        <section>
          <h2 className="text-[13px] font-semibold mb-1" style={{ color: "#FAFAFA" }}>
            Base-Case Assumption Defense
          </h2>
          <p className="text-[11.5px] mb-2" style={{ color: "#52525B" }}>
            Pulled directly from the Defense / Source column of the model&apos;s Assumptions tab.
          </p>
          <div className="flex flex-col">
            <DriverDefense label={DRIVERS.mapcGrowth.label} value={DRIVERS.mapcGrowth.value} defense={DRIVERS.mapcGrowth.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.tripsPerMapcGrowth.label} value={DRIVERS.tripsPerMapcGrowth.value} defense={DRIVERS.tripsPerMapcGrowth.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.gbPerTrip.label} value={DRIVERS.gbPerTrip.value} defense={DRIVERS.gbPerTrip.defense} format={(v) => `$${v.toFixed(2)}`} />
            <DriverDefense label={DRIVERS.ebitdaMarginBase.label} value={DRIVERS.ebitdaMarginBase.value} defense={DRIVERS.ebitdaMarginBase.defense} format={(v) => fmtPct(v, 2)} />
            <DriverDefense label={DRIVERS.mobilityMix.label} value={DRIVERS.mobilityMix.value} defense={DRIVERS.mobilityMix.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.deliveryMix.label} value={DRIVERS.deliveryMix.value} defense={DRIVERS.deliveryMix.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.freightMix.label} value={DRIVERS.freightMix.value} defense={DRIVERS.freightMix.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.mobilityTakeRate.label} value={DRIVERS.mobilityTakeRate.value} defense={DRIVERS.mobilityTakeRate.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.deliveryTakeRate.label} value={DRIVERS.deliveryTakeRate.value} defense={DRIVERS.deliveryTakeRate.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.freightTakeRate.label} value={DRIVERS.freightTakeRate.value} defense={DRIVERS.freightTakeRate.defense} format={(v) => fmtPct(v, 2)} />
            <DriverDefense label={DRIVERS.mobilityOpMargin.label} value={DRIVERS.mobilityOpMargin.value} defense={DRIVERS.mobilityOpMargin.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.deliveryOpMargin.label} value={DRIVERS.deliveryOpMargin.value} defense={DRIVERS.deliveryOpMargin.defense} format={(v) => fmtPct(v)} />
            <DriverDefense label={DRIVERS.freightOpIncome.label} value={DRIVERS.freightOpIncome.value} defense={DRIVERS.freightOpIncome.defense} format={(v) => fmtM(v)} />
            <DriverDefense label={DRIVERS.corpGA.label} value={DRIVERS.corpGA.value} defense={DRIVERS.corpGA.defense} format={(v) => fmtM(v)} />
          </div>
        </section>

        {/* Caveats */}
        <section className="pb-8">
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "#FAFAFA" }}>
            Known Caveats
          </h2>
          <div className="flex flex-col gap-3">
            {CAVEATS.map((c) => (
              <div
                key={c.title}
                className="rounded-lg px-3.5 py-3"
                style={{ background: "#0F0F11", border: "1px solid rgba(249,115,22,0.15)" }}
              >
                <span className="text-[12px] font-medium" style={{ color: "#F97316" }}>{c.title}</span>
                <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: "#71717A" }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import Header from "@/components/Header";
import { DRIVERS, GUIDANCE, EBITDA_SCENARIOS } from "@/lib/assumptions";
import { CONSOLIDATED } from "@/lib/data";
import { fmtPct, fmtM } from "@/lib/format";
import { FileDown, Table2, ArrowUpRight } from "lucide-react";

const FULL_MODEL_URL =
  "https://docs.google.com/spreadsheets/d/1o0GK6qa9aUWg9QjHW8VPgbVq8NDGGElwQ2wTtIeZTcg/edit?usp=sharing";

const SOURCES = [
  { label: "Q2'24 Earnings Press Release", note: "prior-year comp column supplies Q2'23 actuals", file: "q2-24-press-release.pdf" },
  { label: "Q3'24 Earnings Press Release", note: "prior-year comp column supplies Q3'23 actuals", file: "q3-24-press-release.pdf" },
  { label: "Q4'24 Earnings Press Release", note: "prior-year comp column supplies Q4'23 actuals, Non-GAAP OI history begins here", file: "q4-24-press-release.pdf" },
  { label: "Q1'25 Earnings Press Release", note: "prior-year comp column supplies Q1'24 actuals", file: "q1-25-press-release.pdf" },
  { label: "Q2'25 Earnings Press Release", note: "Q2'25 actuals, base quarter for the Q2'26F build-up", file: "q2-25-press-release.pdf" },
  { label: "Q3'25 Earnings Press Release", note: "Q3'25 actuals", file: "q3-25-press-release.pdf" },
  { label: "Q4'25 Earnings Press Release", note: "Q4'25 actuals", file: "q4-25-press-release.pdf" },
  { label: "Q1'26 Earnings Press Release", note: "Q1'26 actuals, retroactively disclosed Q4'24 / Q1'25 segment Non-GAAP OI", file: "q1-26-press-release.pdf" },
  { label: "Q1'26 Earnings Call Transcript", note: "MAPC growth, trips/MAPC, and insurance-tailwind commentary cited in driver defense notes", file: "q1-26-call-transcript.pdf" },
];

const DRIVER_TREE = [
  { step: "MAPCs YoY Growth", detail: "Applied to Q2'25 actual MAPCs (180M) to get Q2'26F MAPCs." },
  { step: "Trips/MAPC YoY Growth", detail: "Applied to Q2'25 actual monthly trips/MAPC (6.05x) to get Q2'26F trips/MAPC." },
  { step: "Total Trips", detail: "MAPCs times monthly trips/MAPC times 3 months." },
  { step: "GB per Trip", detail: "12-quarter historical mean, applied to total trips to get Gross Bookings." },
  { step: "Segment Mix", detail: "Mobility / Delivery / Freight % of total GB, applied to Gross Bookings to get segment GB." },
  { step: "Segment Take Rates", detail: "Applied to segment GB to get segment revenue. Total revenue equals the sum of segments (segment tab is primary, consolidated revenue references it)." },
  { step: "EBITDA Margin Scenario", detail: "Applied directly to total Gross Bookings (top-down) to get consolidated Adj EBITDA, independent of the segment build-up below." },
  { step: "Segment Op Margins", detail: "Applied to segment GB to get segment Non-GAAP Operating Income (the metric that replaced segment Adj EBITDA starting Q1'26)." },
  { step: "Corp G&A + Platform R&D", detail: "Flat dollar deduction, added to segment NGOP sum to get total Non-GAAP Operating Income." },
];

const CAVEATS = [
  {
    title: "Segment Adj EBITDA was discontinued starting Q1'26",
    body: "Uber stopped disclosing segment-level Adjusted EBITDA starting with the Q1'26 print. It was replaced by segment Non-GAAP Operating Income. Consolidated Adj EBITDA is still disclosed, but not at the segment level. This model keeps the two series separate rather than splicing them. The segment margin charts on the forecast page use the pre-Q1'26 Adj EBITDA basis, labeled accordingly.",
  },
  {
    title: "Take rate noise from contra-revenue reclassification",
    body: "Q2'24, Q3'24, and Q1'26 take rates are distorted by a disclosed reclassification of certain sales and marketing costs as contra-revenue. In Q1'26, Mobility revenue grew only 5% YoY versus Gross Bookings +25% YoY, an accounting effect, not a demand slowdown. Those quarters are treated as outliers rather than trend signal when setting take rate assumptions.",
  },
  {
    title: "Segment trips/MAPC isn't disclosed",
    body: "Uber only discloses trips/MAPC at the consolidated level. Segment Gross Bookings in this model are built from top-down mix assumptions, not from segment-level trip counts.",
  },
];

function DriverDefense({ label, value, defense, format }: { label: string; value: number; defense: string; format: (v: number) => string }) {
  return (
    <div className="flex flex-col gap-1.5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-bold" style={{ color: "#0A0A0A" }}>{label}</span>
        <span className="tnum text-[13px] font-bold flex-shrink-0" style={{ color: "#04964F", fontFamily: "var(--font-geist-mono)" }}>{format(value)}</span>
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: "#6B6B6B" }}>{defense}</p>
    </div>
  );
}

export default function MethodologyPage() {
  const q125 = CONSOLIDATED.find((q) => q.quarter === "Q1'26")!;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 md:px-10 pt-24 pb-14 max-w-[900px] w-full mx-auto flex flex-col gap-14">
        <div>
          <h1 className="text-[30px] font-black tracking-tight mb-3" style={{ color: "#0A0A0A" }}>
            Methodology
          </h1>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "#6B6B6B" }}>
            This Q2&apos;26F forecast was built from Uber&apos;s publicly disclosed segment financials
            (Q2&apos;23 through Q1&apos;26) and management commentary from the Q1&apos;26 earnings call, then submitted
            as a locked snapshot ahead of Uber&apos;s {new Date(GUIDANCE.earningsDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} print.
            Every base-case assumption below is defended against a specific historical trend or disclosed
            data point. No assumption is a bare guess.
          </p>
        </div>

        {/* Data sources */}
        <section>
          <h2 className="text-[20px] font-extrabold tracking-tight mb-1.5" style={{ color: "#0A0A0A" }}>
            Data Sources
          </h2>
          <p className="text-[12.5px] mb-4" style={{ color: "#9B9B9B" }}>
            Click any title to download the original PDF.
          </p>
          <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            {SOURCES.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 px-4 py-3"
                style={{
                  background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                  borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                }}
              >
                <a
                  href={`/sources/${s.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold flex-shrink-0 group"
                  style={{ color: "#0A0A0A", width: 240 }}
                >
                  <FileDown size={12} strokeWidth={2} style={{ color: "#9B9B9B" }} />
                  <span className="group-hover:underline">{s.label}</span>
                </a>
                <span className="text-[12px]" style={{ color: "#9B9B9B" }}>{s.note}</span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] mt-3 mb-4" style={{ color: "#B5B5B5" }}>
            Q1&apos;26 note: {q125.note}
          </p>

          <a
            href={FULL_MODEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-3xl px-5 py-4"
            style={{ background: "#F6F6F6" }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
              style={{ background: "rgba(6,193,103,0.12)" }}
            >
              <Table2 size={16} strokeWidth={2} style={{ color: "#04964F" }} />
            </div>
            <span className="flex-1 text-[12.5px] font-semibold leading-snug" style={{ color: "#0A0A0A" }}>
              This forecast was built bottom-up in Excel before being turned into this interactive tool.
              <span className="block text-[11px] font-medium mt-0.5" style={{ color: "#6B6B6B" }}>
                View the full model
              </span>
            </span>
            <ArrowUpRight
              size={16}
              strokeWidth={2.25}
              className="flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: "#9B9B9B" }}
            />
          </a>
        </section>

        {/* Driver tree */}
        <section>
          <h2 className="text-[20px] font-extrabold tracking-tight mb-4" style={{ color: "#0A0A0A" }}>
            Driver Tree Logic
          </h2>
          <div className="flex flex-col gap-0">
            {DRIVER_TREE.map((d, i) => (
              <div key={d.step} className="flex gap-4 py-3.5" style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined }}>
                <span
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] tnum font-bold mt-0.5"
                  style={{ background: "rgba(6,193,103,0.12)", color: "#04964F", fontFamily: "var(--font-geist-mono)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <span className="text-[13px] font-bold" style={{ color: "#0A0A0A" }}>{d.step}</span>
                  <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: "#6B6B6B" }}>{d.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EBITDA scenarios */}
        <section>
          <h2 className="text-[20px] font-extrabold tracking-tight mb-4" style={{ color: "#0A0A0A" }}>
            EBITDA Margin Scenarios
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(EBITDA_SCENARIOS) as (keyof typeof EBITDA_SCENARIOS)[]).map((key) => {
              const s = EBITDA_SCENARIOS[key];
              const active = key === "base";
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1.5 px-5 py-4 rounded-3xl"
                  style={{
                    background: active ? "#06C167" : "#F6F6F6",
                  }}
                >
                  <span className="text-[11.5px] font-bold" style={{ color: active ? "#FFFFFF" : "#6B6B6B" }}>
                    {s.label}{active && " (submitted)"}
                  </span>
                  <span className="tnum text-[19px] font-black" style={{ color: active ? "#FFFFFF" : "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
                    {fmtPct(s.margin)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] mt-3" style={{ color: "#9B9B9B" }}>
            Guidance range: {fmtM(GUIDANCE.adjEbitdaLow)} to {fmtM(GUIDANCE.adjEbitdaHigh)} Adj EBITDA, non-GAAP EPS ${GUIDANCE.epsLow.toFixed(2)} to ${GUIDANCE.epsHigh.toFixed(2)}.
          </p>
        </section>

        {/* Base case defense */}
        <section>
          <h2 className="text-[20px] font-extrabold tracking-tight mb-1.5" style={{ color: "#0A0A0A" }}>
            Base-Case Assumption Defense
          </h2>
          <p className="text-[12.5px] mb-3" style={{ color: "#9B9B9B" }}>
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
        <section className="pb-12">
          <h2 className="text-[20px] font-extrabold tracking-tight mb-4" style={{ color: "#0A0A0A" }}>
            Known Caveats
          </h2>
          <div className="flex flex-col gap-3">
            {CAVEATS.map((c) => (
              <div
                key={c.title}
                className="rounded-3xl px-5 py-4"
                style={{ background: "#F6F6F6" }}
              >
                <span className="text-[13px] font-bold" style={{ color: "#0A0A0A" }}>{c.title}</span>
                <p className="text-[12px] leading-relaxed mt-1.5" style={{ color: "#6B6B6B" }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

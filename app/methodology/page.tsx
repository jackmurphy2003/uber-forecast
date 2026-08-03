import Header from "@/components/Header";
import { GUIDANCE, EBITDA_SCENARIOS } from "@/lib/assumptions";
import { CONSOLIDATED } from "@/lib/data";
import { fmtPct, fmtM } from "@/lib/format";
import { FileDown } from "lucide-react";

const GLOSSARY = [
  {
    term: "MAPC",
    def: "Monthly Active Platform Consumers — unique users who take at least one ride or place one order in a month. Uber's core user count.",
  },
  {
    term: "Gross Bookings (GB)",
    def: "Total dollar value of all rides, food orders, and freight billed on the platform — before Uber pays drivers and couriers.",
  },
  {
    term: "Take Rate",
    def: "Revenue as a percentage of Gross Bookings — the cut Uber keeps after paying out drivers and couriers.",
  },
  {
    term: "Adj EBITDA",
    def: "Uber's headline profit metric: earnings before interest, taxes, depreciation, and amortization, plus add-backs like stock-based compensation.",
  },
  {
    term: "Non-GAAP OI (NGOP)",
    def: "Segment-level operating income measure Uber began disclosing in Q1'26, replacing segment Adjusted EBITDA.",
  },
  {
    term: "Guidance",
    def: "The Gross Bookings and Adj EBITDA ranges management projected for the quarter on the prior earnings call. This model is scored against it.",
  },
  {
    term: "Q2'26F / Q1'26A",
    def: "F = forecast, A = actual. Q2'26F is the quarter this model predicts; anything marked A is a reported number from Uber's filings.",
  },
  {
    term: "Mobility / Delivery / Freight",
    def: "Uber's three reporting segments: rides, Uber Eats, and trucking logistics.",
  },
];

const SOURCES = [
  { label: "Q2'24 Earnings Press Release", note: "prior-year comp supplies Q2'23 actuals", file: "q2-24-press-release.pdf" },
  { label: "Q3'24 Earnings Press Release", note: "prior-year comp supplies Q3'23 actuals", file: "q3-24-press-release.pdf" },
  { label: "Q4'24 Earnings Press Release", note: "prior-year comp supplies Q4'23 actuals; Non-GAAP OI history begins here", file: "q4-24-press-release.pdf" },
  { label: "Q1'25 Earnings Press Release", note: "prior-year comp supplies Q1'24 actuals", file: "q1-25-press-release.pdf" },
  { label: "Q2'25 Earnings Press Release", note: "Q2'25 actuals — base quarter for the Q2'26F build-up", file: "q2-25-press-release.pdf" },
  { label: "Q3'25 Earnings Press Release", note: "Q3'25 actuals", file: "q3-25-press-release.pdf" },
  { label: "Q4'25 Earnings Press Release", note: "Q4'25 actuals", file: "q4-25-press-release.pdf" },
  { label: "Q1'26 Earnings Press Release", note: "Q1'26 actuals; retroactively disclosed Q4'24/Q1'25 segment Non-GAAP OI", file: "q1-26-press-release.pdf" },
  { label: "Q1'26 Earnings Call Transcript", note: "MAPC growth, trips/MAPC trends, and insurance tailwind commentary", file: "q1-26-call-transcript.pdf" },
];

const DRIVER_TREE = [
  { step: "MAPCs YoY Growth", detail: "Applied to Q2'25 actual MAPCs (180M) to get Q2'26F MAPCs." },
  { step: "Trips/MAPC YoY Growth", detail: "Applied to Q2'25 actual monthly trips/MAPC (6.05x) to get Q2'26F trips/MAPC." },
  { step: "Total Trips", detail: "MAPCs × monthly trips/MAPC × 3 months." },
  { step: "GB per Trip", detail: "12-quarter historical mean applied to total trips to get Gross Bookings." },
  { step: "Segment Mix", detail: "Mobility / Delivery / Freight % of total GB applied to get segment GB." },
  { step: "Segment Take Rates", detail: "Applied to segment GB to get segment revenue. Consolidated revenue is the sum of segments." },
  { step: "EBITDA Margin Scenario", detail: "Applied directly to total Gross Bookings (top-down) to get consolidated Adj EBITDA, independent of the segment build-up." },
  { step: "Segment Op Margins", detail: "Applied to segment GB to get segment Non-GAAP Operating Income (replaced segment Adj EBITDA starting Q1'26)." },
  { step: "Corp G&A + Platform R&D", detail: "Flat dollar deduction added to segment NGOP sum to get total Non-GAAP Operating Income." },
];

const CAVEATS = [
  {
    title: "Segment Adj EBITDA discontinued from Q1'26",
    body: "Uber stopped disclosing segment-level Adjusted EBITDA starting Q1'26. Replaced by segment Non-GAAP Operating Income.",
  },
  {
    title: "Take rate noise from contra-revenue reclassification",
    body: "Q2'24, Q3'24, and Q1'26 take rates are distorted by a disclosed reclassification of certain sales and marketing costs as contra-revenue.",
  },
  {
    title: "Segment trips/MAPC not disclosed",
    body: "Uber only discloses trips/MAPC at the consolidated level. Segment GB in this model is built from mix assumptions, not segment-level trip counts.",
  },
];

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className={sub ? "mb-4" : "mb-4"}>
      <h2 className="text-[15px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
        {title}
      </h2>
      {sub && (
        <p className="text-[12px] mt-0.5" style={{ color: "#9B9B9B" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function NotesPage() {
  const q126 = CONSOLIDATED.find((q) => q.quarter === "Q1'26")!;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 md:px-10 py-8 md:py-14 pb-24 md:pb-14 max-w-[1400px] w-full mx-auto flex flex-col gap-12">

        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
            Notes
          </h1>
          <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
            Glossary, sources, model logic, and known caveats for the Q2&apos;26F forecast &middot; submitted ahead of Uber&apos;s August 5, 2026 earnings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-14 gap-y-12">

          {/* Left column */}
          <div className="flex flex-col gap-12">

            {/* Glossary */}
            <section>
              <SectionHeader title="Glossary" sub="The jargon, in plain English." />
              <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                {GLOSSARY.map((g, i) => (
                  <div
                    key={g.term}
                    className="flex flex-col sm:flex-row gap-0.5 sm:gap-4 px-4 py-3"
                    style={{
                      background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined,
                    }}
                  >
                    <span
                      className="text-[11.5px] font-bold flex-shrink-0"
                      style={{ color: "#0A0A0A", width: 170, fontFamily: "var(--font-geist-mono)" }}
                    >
                      {g.term}
                    </span>
                    <span className="text-[11.5px] leading-relaxed" style={{ color: "#6B6B6B" }}>
                      {g.def}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* EBITDA scenarios */}
            <section>
              <SectionHeader title="EBITDA Margin Scenarios" />
              <div className="grid grid-cols-3 gap-3 mb-3">
                {(Object.keys(EBITDA_SCENARIOS) as (keyof typeof EBITDA_SCENARIOS)[]).map((key) => {
                  const s = EBITDA_SCENARIOS[key];
                  const active = key === "base";
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-1.5 px-5 py-4 rounded-2xl"
                      style={{
                        background: active ? "#ECFDF5" : "#F6F6F6",
                        border: active ? "1px solid rgba(6,193,103,0.2)" : "1px solid transparent",
                      }}
                    >
                      <span className="text-[11px] font-bold" style={{ color: active ? "#059669" : "#6B6B6B" }}>
                        {s.label}{active && " · submitted"}
                      </span>
                      <span className="tnum text-[18px] font-black" style={{ color: active ? "#064E3B" : "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
                        {fmtPct(s.margin)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11.5px]" style={{ color: "#9B9B9B" }}>
                Guidance: {fmtM(GUIDANCE.adjEbitdaLow)}–{fmtM(GUIDANCE.adjEbitdaHigh)} Adj EBITDA · EPS ${GUIDANCE.epsLow.toFixed(2)}–${GUIDANCE.epsHigh.toFixed(2)}
              </p>
            </section>

            {/* Caveats */}
            <section>
              <SectionHeader title="Known Caveats" />
              <div className="flex flex-col gap-2.5">
                {CAVEATS.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl px-5 py-4"
                    style={{ background: "#F6F6F6" }}
                  >
                    <span className="text-[12.5px] font-bold" style={{ color: "#0A0A0A" }}>{c.title}</span>
                    <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: "#6B6B6B" }}>{c.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-12">

            {/* Driver tree */}
            <section>
              <SectionHeader title="Model Logic" sub="Nine steps from user count to operating income." />
              <div className="flex flex-col">
                {DRIVER_TREE.map((d, i) => (
                  <div key={d.step} className="flex gap-4 py-3" style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined }}>
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] tnum font-bold mt-0.5"
                      style={{ background: "rgba(6,193,103,0.12)", color: "#04964F", fontFamily: "var(--font-geist-mono)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-[12.5px] font-bold" style={{ color: "#0A0A0A" }}>{d.step}</span>
                      <p className="text-[11.5px] leading-relaxed mt-0.5" style={{ color: "#6B6B6B" }}>{d.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data sources */}
            <section>
              <SectionHeader title="Data Sources" sub="All figures drawn from Uber's public filings. Click to download the PDF." />
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
                      className="flex items-center gap-1.5 text-[12px] font-semibold flex-shrink-0 group"
                      style={{ color: "#0A0A0A", width: 240 }}
                    >
                      <FileDown size={11} strokeWidth={2} style={{ color: "#9B9B9B" }} />
                      <span className="group-hover:underline">{s.label}</span>
                    </a>
                    <span className="text-[11.5px]" style={{ color: "#9B9B9B" }}>{s.note}</span>
                  </div>
                ))}
              </div>
              {q126.note && (
                <p className="text-[11px] mt-2.5" style={{ color: "#B5B5B5" }}>
                  Q1&apos;26 note: {q126.note}
                </p>
              )}
            </section>
          </div>
        </div>

      </main>

      <footer
        className="flex-none px-6 pb-24 md:pb-10 pt-8 text-center max-w-[1400px] w-full mx-auto"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        <p className="text-[11.5px] font-medium mb-2.5" style={{ color: "#9B9B9B" }}>
          Uber Q2&apos;26 Financial Model &middot; Built by Jack Murphy (MS in Finance @ USC)
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/sources/uber-q226f-model.xlsx"
            download
            className="text-[11px] font-medium transition-colors duration-150 hover:underline"
            style={{ color: "#B5B5B5" }}
          >
            Download Raw Model (.xlsx)
          </a>
          <span style={{ color: "#D5D5D5", fontSize: 12 }}>·</span>
          <a
            href="https://www.linkedin.com/in/jack-murphy-963375261/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium transition-colors duration-150 hover:underline"
            style={{ color: "#B5B5B5" }}
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

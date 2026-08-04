"use client";

import { Lock } from "lucide-react";
import { runForecast } from "@/lib/forecast";
import { LOCKED_INPUTS } from "./LockedForecast";
import { GUIDANCE } from "@/lib/assumptions";
import { ACTUALS } from "@/lib/actuals";
import { fmtM, fmtSigned } from "@/lib/format";

const METRICS: { key: keyof typeof MODEL_MAP; label: string }[] = [
  { key: "grossBookings", label: "Gross Bookings" },
  { key: "totalRevenue", label: "Revenue" },
  { key: "adjEbitda", label: "Adj EBITDA" },
  { key: "totalNGOP", label: "Non-GAAP OI" },
  { key: "mobilityGB", label: "Mobility GB" },
  { key: "deliveryGB", label: "Delivery GB" },
];

const out = runForecast(LOCKED_INPUTS);
const MODEL_MAP = {
  grossBookings: out.grossBookings,
  totalRevenue: out.totalRevenue,
  adjEbitda: out.adjEbitda,
  totalNGOP: out.totalNGOP,
  mobilityGB: out.mobilityGB,
  deliveryGB: out.deliveryGB,
};

function LockedRow({ label, model }: { label: string; model: number }) {
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
          Model {fmtM(model)}
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

function ResultRow({ label, model, actual }: { label: string; model: number; actual: number }) {
  const variance = actual - model;
  const variancePct = (variance / model) * 100;
  const up = variance >= 0;
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
    >
      <span className="text-[12px] font-semibold" style={{ color: "#0A0A0A" }}>
        {label}
      </span>
      <div className="flex items-center gap-4">
        <span className="tnum text-[11.5px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
          Model {fmtM(model)}
        </span>
        <span className="tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
          Actual {fmtM(actual)}
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
  );
}

export default function Scorecard() {
  const earningsDate = new Date(GUIDANCE.earningsDate + "T12:00:00");
  const hasReported = new Date() >= earningsDate;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Scorecard
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          {ACTUALS
            ? "Model vs. actual results from Uber's Q2'26 press release."
            : "Model vs. actual results, populated once Uber reports."}
        </p>
      </div>

      {!ACTUALS && (
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
          ACTUALS ? (
            <ResultRow key={key} label={label} model={MODEL_MAP[key]} actual={ACTUALS[key]} />
          ) : (
            <LockedRow key={key} label={label} model={MODEL_MAP[key]} />
          )
        )}
      </div>

      {ACTUALS && (
        <p className="text-[11px] mt-3" style={{ color: "#9B9B9B" }}>
          Source: {ACTUALS.source}
        </p>
      )}
    </section>
  );
}

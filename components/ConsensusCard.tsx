"use client";

import { FileDown } from "lucide-react";
import { runForecast } from "@/lib/forecast";
import { LOCKED_INPUTS } from "./LockedForecast";
import { CONSENSUS } from "@/lib/consensus";
import { fmtM, fmtSigned } from "@/lib/format";

function deltaPct(model: number, street: number) {
  return ((model - street) / street) * 100;
}

function MetricRow({
  label,
  model,
  street,
}: {
  label: string;
  model: number;
  street: number;
}) {
  const delta = deltaPct(model, street);
  const up = delta >= 0;
  return (
    <div className="flex flex-col gap-1 py-2.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <span className="text-[10px] font-semibold uppercase" style={{ color: "#9B9B9B", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="tnum text-[13px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
            {fmtM(model)}
          </span>
          <span className="text-[10.5px]" style={{ color: "#B5B5B5" }}>
            vs {fmtM(street)}
          </span>
        </div>
        <span
          className="tnum text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{
            background: up ? "rgba(6,193,103,0.1)" : "rgba(225,29,72,0.1)",
            color: up ? "#04964F" : "#E11D48",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          {fmtSigned(delta)}%
        </span>
      </div>
    </div>
  );
}

export default function ConsensusCard() {
  const out = runForecast(LOCKED_INPUTS);
  const revenueMid = (CONSENSUS.revenueLow + CONSENSUS.revenueHigh) / 2;
  const mobilityGapB = (CONSENSUS.mobilityGB - CONSENSUS.deliveryGB) / 1000;

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 flex flex-col h-full"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase" style={{ color: "#0A0A0A", letterSpacing: "0.08em" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#06C167" }} />
          Model vs. Street Consensus
        </span>
        <span
          className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: "#F6F6F6", color: "#6B6B6B" }}
        >
          Submitted Aug 4
        </span>
      </div>

      <MetricRow label="Gross Bookings" model={out.grossBookings} street={CONSENSUS.grossBookings} />
      <MetricRow label="Revenue" model={out.totalRevenue} street={revenueMid} />
      <MetricRow label="Mobility GB" model={out.mobilityGB} street={CONSENSUS.mobilityGB} />
      <MetricRow label="Delivery GB" model={out.deliveryGB} street={CONSENSUS.deliveryGB} />

      <p
        className="text-[10.5px] leading-relaxed mt-3 pt-3"
        style={{ color: "#6B6B6B", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        The Street still has Mobility ahead of Delivery by ${mobilityGapB.toFixed(2)}B. This model
        calls the crossover a quarter early.
      </p>

      <div className="flex items-center justify-between gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <a
          href="/sources/uber-q226f-model.xlsx"
          download
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg transition-colors duration-150"
          style={{ background: "#0A0A0A", color: "#FFFFFF" }}
        >
          <FileDown size={12} strokeWidth={2} />
          Download Model
        </a>
        <a
          href="https://www.linkedin.com/in/jack-murphy-963375261/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10.5px] font-medium hover:underline flex-shrink-0"
          style={{ color: "#9B9B9B" }}
        >
          Built by Jack Murphy
        </a>
      </div>
    </div>
  );
}

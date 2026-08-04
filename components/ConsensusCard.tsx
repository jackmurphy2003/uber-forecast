"use client";

import { FileDown } from "lucide-react";
import { runForecast } from "@/lib/forecast";
import { LOCKED_INPUTS } from "./LockedForecast";
import { CONSENSUS } from "@/lib/consensus";
import { fmtB, fmtSigned } from "@/lib/format";

function deltaPct(model: number, street: number) {
  return ((model - street) / street) * 100;
}

function MetricChip({
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
    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span
        className="text-[8.5px] font-bold uppercase"
        style={{ color: "#B5B5B5", letterSpacing: "0.05em", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="tnum text-[12.5px] font-bold" style={{ color: "#0A0A0A", fontFamily: "var(--font-geist-mono)" }}>
          {fmtB(model)}
        </span>
        <span className="text-[9.5px]" style={{ color: "#B5B5B5" }}>
          vs {fmtB(street)}
        </span>
        <span
          className="tnum text-[9px] font-bold px-1 rounded flex-shrink-0"
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

  return (
    <div
      className="rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2"
      style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1.5 text-[9.5px] font-black uppercase"
          style={{ color: "#6B6B6B", letterSpacing: "0.06em", fontFamily: "var(--font-geist-mono)" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#06C167" }} />
          vs Street Consensus
        </span>
        <span className="text-[9.5px] flex-shrink-0" style={{ color: "#B5B5B5" }}>
          Submitted Aug 4
        </span>
      </div>

      <div className="flex items-stretch gap-3">
        <MetricChip label="GB" model={out.grossBookings} street={CONSENSUS.grossBookings} />
        <div style={{ width: 1, background: "rgba(0,0,0,0.07)" }} />
        <MetricChip label="Revenue" model={out.totalRevenue} street={revenueMid} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <a
          href="/sources/uber-q226f-model.xlsx"
          download
          className="flex items-center gap-1 text-[10.5px] font-bold rounded-md transition-colors duration-150"
          style={{ background: "#0A0A0A", color: "#FFFFFF", padding: "5px 9px" }}
        >
          <FileDown size={10} strokeWidth={2} />
          Download Model
        </a>
        <a
          href="https://www.linkedin.com/in/jack-murphy-963375261/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9.5px] font-medium hover:underline flex-shrink-0"
          style={{ color: "#B5B5B5" }}
        >
          Built by Jack Murphy
        </a>
      </div>
    </div>
  );
}

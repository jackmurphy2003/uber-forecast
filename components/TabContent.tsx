"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LockedForecast from "./LockedForecast";
import Bridge from "./Bridge";
import ConsensusCard from "./ConsensusCard";

import TrendsAndAssumptions from "./TrendsAndAssumptions";
import Sandbox from "./Sandbox";

const EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTGEyFVJhjJ4OJ4uQ-F7Xbg123_crgznesGnO7t8kOBt-vSOoLNDt2q1_eVgZBEDB_tS7F2-DscVtRD/pubhtml?widget=true&headers=false";

function SheetsEmbed() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Full Model
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Click the sheet tabs at the bottom to navigate between Assumptions, Historicals, and the driver tree.
        </p>
      </div>
      <div
        className="rounded-[28px] overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.08)", height: 680 }}
      >
        <iframe
          src={EMBED_URL}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          title="Uber Q2&#39;26F Full Model"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </section>
  );
}

function AboutHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-center">
      <div className="lg:col-span-7 flex flex-col justify-center">
        <span
          className="text-[10px] font-black tracking-[0.10em] uppercase block mb-1.5"
          style={{ color: "#0A0A0A" }}
        >
          About this project
        </span>
        <p className="text-[13px] leading-relaxed" style={{ color: "#6B6B6B" }}>
          A bottom-up forecast of{" "}
          <span style={{ color: "#0A0A0A", fontWeight: 600 }}>Uber&apos;s Q2 2026 earnings</span>, built
          from public financials on Uber&apos;s investor site and locked on August 4, before Uber
          reports on August 5. Every number below is my own estimate, checked against
          management&apos;s guidance.{" "}
          <span style={{ color: "#0A0A0A", fontWeight: 600 }}>Trends &amp; Assumptions</span> shows the
          data behind each input, and the{" "}
          <span style={{ color: "#0A0A0A", fontWeight: 600 }}>Sandbox</span> lets you test and change
          assumptions and watch the P&amp;L update in real time.
        </p>
      </div>
      <div className="lg:col-span-5">
        <ConsensusCard />
      </div>
    </div>
  );
}

function TabContentInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "forecast";

  return (
    <div className="flex flex-col gap-16">
      {tab === "forecast" && (
        <>
          <div>
            <AboutHero />
            <LockedForecast />
          </div>
          <Bridge />
          <SheetsEmbed />
        </>
      )}
      {tab === "trends" && <TrendsAndAssumptions />}
      {tab === "sandbox" && <Sandbox />}
    </div>
  );
}

export default function TabContent() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <TabContentInner />
    </Suspense>
  );
}

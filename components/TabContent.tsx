"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LockedForecast from "./LockedForecast";
import Bridge from "./Bridge";
import HistoricalCharts from "./HistoricalCharts";
import Sandbox from "./Sandbox";

const EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQacJLAq6Dq4tRKtbwoCwtXDyJJkM18fZUcqJYvjOdTwufXjC0aB5VQ3ZAiNXFH-G0tw6BWEz8eXD1Q/pubhtml?widget=true&headers=false";

function SheetsEmbed() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-[19px] font-extrabold tracking-tight" style={{ color: "#0A0A0A" }}>
          Full Model
        </h2>
        <p className="text-[12px]" style={{ color: "#6B6B6B" }}>
          Click the sheet tabs at the bottom to navigate between Assumptions, Historicals, and the driver tree.
          Sheet must be published to the web in Google Sheets for the embed to load.
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

function TabContentInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "forecast";

  return (
    <div className="flex flex-col gap-16">
      {tab === "forecast" && (
        <>
          <LockedForecast />
          <Bridge compact />
          <SheetsEmbed />
        </>
      )}
      {tab === "bridge" && <Bridge />}
      {tab === "trends" && <HistoricalCharts />}
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

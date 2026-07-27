import Header from "@/components/Header";
import LockedForecast from "@/components/LockedForecast";
import Bridge from "@/components/Bridge";
import HistoricalCharts from "@/components/HistoricalCharts";
import Sandbox from "@/components/Sandbox";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 md:px-10 py-10 md:py-14 max-w-[1400px] w-full mx-auto flex flex-col gap-16">
        <LockedForecast />
        <Bridge />
        <HistoricalCharts />
        <Sandbox />
      </main>
      <footer
        className="flex-none px-6 py-8 text-center text-[11px] font-medium"
        style={{ color: "#B5B5B5", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        Built ahead of Uber&apos;s Q2&apos;26 earnings (Aug 5, 2026). All figures modeled from public earnings releases, see{" "}
        <a href="/methodology" className="underline font-semibold" style={{ color: "#6B6B6B" }}>
          methodology
        </a>{" "}
        for sources.
      </footer>
    </div>
  );
}

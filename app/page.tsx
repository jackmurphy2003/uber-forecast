import Header from "@/components/Header";
import LockedForecast from "@/components/LockedForecast";
import HistoricalCharts from "@/components/HistoricalCharts";
import Sandbox from "@/components/Sandbox";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-5 py-6 max-w-[1400px] w-full mx-auto flex flex-col gap-8">
        <LockedForecast />
        <HistoricalCharts />
        <Sandbox />
      </main>
      <footer
        className="flex-none px-5 py-4 text-center text-[10.5px]"
        style={{ color: "#3F3F46", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        Built ahead of Uber&apos;s Q2&apos;26 earnings (Aug 5, 2026). All figures modeled from public earnings releases — see{" "}
        <a href="/methodology" className="underline" style={{ color: "#52525B" }}>
          methodology
        </a>{" "}
        for sources.
      </footer>
    </div>
  );
}

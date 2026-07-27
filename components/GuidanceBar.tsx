export default function GuidanceBar({
  low,
  high,
  value,
}: {
  low: number;
  high: number;
  value: number;
}) {
  const span = high - low;
  const pad = span * 0.35;
  const min = low - pad;
  const max = high + pad;
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  const inRange = value >= low && value <= high;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.07)" }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
            background: "rgba(6,193,103,0.28)",
          }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full"
          style={{
            left: `${pct(value)}%`,
            transform: "translate(-50%, -50%)",
            background: inRange ? "#06C167" : "#C23934",
            boxShadow: "0 0 0 2px #FFFFFF",
          }}
        />
      </div>
      <span
        className="text-[10.5px] font-semibold tnum flex-shrink-0"
        style={{ color: inRange ? "#04964F" : "#C23934", fontFamily: "var(--font-geist-mono)" }}
      >
        {inRange ? "in range" : "outside"}
      </span>
    </div>
  );
}

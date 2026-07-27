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
      <div className="relative flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
            background: "rgba(99,102,241,0.25)",
          }}
        />
        <div
          className="absolute top-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            left: `${pct(value)}%`,
            transform: "translate(-50%, -50%)",
            background: inRange ? "#4ADE80" : "#F97316",
            boxShadow: "0 0 0 2px #09090B",
          }}
        />
      </div>
      <span
        className="text-[10.5px] tnum flex-shrink-0"
        style={{ color: inRange ? "#4ADE80" : "#F97316", fontFamily: "var(--font-geist-mono)" }}
      >
        {inRange ? "in range" : "outside"}
      </span>
    </div>
  );
}

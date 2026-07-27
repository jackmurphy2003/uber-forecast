export function fmtM(v: number | null | undefined, decimals = 0): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}M`;
}

export function fmtB(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `$${(v / 1000).toFixed(decimals)}B`;
}

export function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `${(v * 100).toFixed(decimals)}%`;
}

export function fmtNum(v: number | null | undefined, decimals = 0): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtX(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `${v.toFixed(decimals)}x`;
}

export function fmtDollar(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `$${v.toFixed(decimals)}`;
}

export function fmtSigned(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}`;
}

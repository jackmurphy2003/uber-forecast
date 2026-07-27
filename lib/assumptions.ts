// Base-case Q2'26F driver assumptions, defense notes, and guidance ranges —
// transcribed from the "Assumptions" tab of the source model. This is the
// single source of truth for both the locked snapshot and the sandbox's
// reset-to-base state.

export interface Driver {
  label: string;
  value: number;
  defense: string;
}

export const BASE_MAPCS_Q225 = 180.0; // Q2'25 actual, anchor for MAPC growth
export const BASE_TRIPS_PER_MAPC_Q225 = 6.05; // Q2'25 actual, monthly

export const DRIVERS = {
  mapcGrowth: {
    label: "MAPCs YoY Growth Rate",
    value: 0.175,
    defense:
      "Q1'26 actual +17.1%. Accelerating from ~14% a year ago. Uber One 50M members +50% YoY, 7 new international markets in Q1'26, insurance-driven US price reductions driving new users. Source: Q1'26 earnings call transcript.",
  },
  tripsPerMapcGrowth: {
    label: "Monthly Trips per MAPC YoY Growth",
    value: 0.03,
    defense:
      "Consistent +3% YoY for 4+ consecutive quarters. Balaji (CFO), Q1'26 call: “insurance price reductions translating to trip acceleration — expect it to continue through rest of year.”",
  },
  gbPerTrip: {
    label: "GB per Trip — 12-Quarter Historical Mean",
    value: 14.43,
    defense:
      "Range-bound $14.10–$14.75 over 12 quarters, no directional trend. Historical mean = $14.43. Produces GB = $57.2B, inside guidance range $56.25–$57.75B. Offsetting forces: premium mix tailwind vs. insurance affordability headwind.",
  },
  ebitdaMarginBase: {
    label: "EBITDA Margin — Base Case",
    value: 0.0485,
    defense:
      "Base case 4.85%. Avg YoY additive margin expansion = +0.43pp over the last 4 quarters, applied to the Q2'25 base of 4.53%. Insurance savings tailwind per Balaji's explicit Q1'26 commentary.",
  },
  mobilityMix: {
    label: "Mobility % of Total GB",
    value: 0.488,
    defense:
      "YoY trend: Mobility mix falling every quarter for the past year (from ~51.6% to 49.1%). Q1'26 actual 49.1%. Mobility GB +20% YoY in Q1'26 (transcript).",
  },
  deliveryMix: {
    label: "Delivery % of Total GB",
    value: 0.489,
    defense:
      "Mix rising every quarter for the past year. Q1'26 at 48.4%. Delivery +23% vs Mobility +20% in Q1'26. Suburban expansion “very early innings,” 30% of Mobility users never used Eats (Balaji, Q1'26 call).",
  },
  freightMix: {
    label: "Freight % of Total GB",
    value: 0.023,
    defense:
      "Straight-line from Q2'25. Freight returned to growth in Q1'26 but one quarter is insufficient to establish a new trend. Long-run structural decline as % of total.",
  },
  mobilityTakeRate: {
    label: "Mobility Take Rate",
    value: 0.307,
    defense:
      "Q2'25 comparable (30.7%). Q1'26 at 25.8% excluded — same contra-revenue reclassification as consolidated (Mobility revenue +5% vs GB +25%).",
  },
  deliveryTakeRate: {
    label: "Delivery Take Rate",
    value: 0.192,
    defense:
      "Trending up: Q2'25 18.9% → Q3'25 19.2% → Q4'25 19.2% → Q1'26 19.5%. No reclassification impact. 19.2% = average of the last 3 clean quarters.",
  },
  freightTakeRate: {
    label: "Freight Take Rate",
    value: 1.0015,
    defense:
      "Revenue consistently ~100.1–100.2% of GB. 12-quarter average = 100.15%.",
  },
  mobilityOpMargin: {
    label: "Mobility Op Income Margin (% of Mobility GB)",
    value: 0.075,
    defense:
      "Recent: Q4'24 7.1%, Q1'25 7.5%, Q4'25 7.4%, Q1'26 7.7%. Trending up. 7.5% = conservative mid-range.",
  },
  deliveryOpMargin: {
    label: "Delivery Op Income Margin (% of Delivery GB)",
    value: 0.036,
    defense:
      "Recent: Q4'24 3.2%, Q1'25 3.3%, Q4'25 3.6%, Q1'26 3.7%. 3.6% = Q4'25 level, conservative vs Q1'26.",
  },
  freightOpIncome: {
    label: "Freight Op Income ($M)",
    value: -28.0,
    defense:
      "Average of 4 disclosed quarters: Q4'24 -$41M, Q1'25 -$25M, Q4'25 -$18M, Q1'26 -$30M = -$28.5M avg.",
  },
  corpGA: {
    label: "Corp G&A + Platform R&D ($M)",
    value: -1097.0,
    defense:
      "Modeled input. Average of Q4'25 (-$996M) and Q1'25 (-$1,077M) = -$1,037M; -$1,097M implies slight additional growth.",
  },
} as const;

export const EBITDA_SCENARIOS = {
  bear: { label: "Bear", margin: 0.0475 },
  base: { label: "Base", margin: 0.0485 },
  bull: { label: "Bull", margin: 0.0496 },
} as const;

export type ScenarioKey = keyof typeof EBITDA_SCENARIOS;

export const GUIDANCE = {
  grossBookingsLow: 56250,
  grossBookingsHigh: 57750,
  adjEbitdaLow: 2700,
  adjEbitdaHigh: 2800,
  epsLow: 0.78,
  epsHigh: 0.82,
  earningsDate: "2026-08-05",
};

export const LOCKED_SNAPSHOT_DATE = "2026-08-03";

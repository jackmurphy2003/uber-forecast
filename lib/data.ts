// Historical actuals extracted from Uber Technologies earnings press releases,
// Q2'23 through Q1'26. Source cited per quarter. See /methodology for full citations.

export type Quarter =
  | "Q2'23" | "Q3'23" | "Q4'23" | "Q1'24"
  | "Q2'24" | "Q3'24" | "Q4'24" | "Q1'25"
  | "Q2'25" | "Q3'25" | "Q4'25" | "Q1'26";

export const QUARTERS: Quarter[] = [
  "Q2'23", "Q3'23", "Q4'23", "Q1'24",
  "Q2'24", "Q3'24", "Q4'24", "Q1'25",
  "Q2'25", "Q3'25", "Q4'25", "Q1'26",
];

export interface ConsolidatedQuarter {
  quarter: Quarter;
  mapcs: number; // M
  trips: number; // M
  tripsPerMapc: number; // monthly trips per MAPC
  gbPerTrip: number; // $
  grossBookings: number; // $M
  revenue: number; // $M
  takeRate: number; // revenue / GB
  ebitdaMargin: number; // adj EBITDA / GB
  adjEbitda: number; // $M
  nonGaapOI: number | null; // $M, disclosed only Q4'24, Q1'25, Q4'25, Q1'26
  netIncome: number; // $M GAAP
  source: string;
  note?: string;
}

export const CONSOLIDATED: ConsolidatedQuarter[] = [
  { quarter: "Q2'23", mapcs: 137.0, trips: 2282.0, tripsPerMapc: 5.55, gbPerTrip: 14.72, grossBookings: 33601.0, revenue: 9230.0, takeRate: 0.275, ebitdaMargin: 0.027, adjEbitda: 916.0, nonGaapOI: null, netIncome: 394.0, source: "Q2'24 PR (prior-year column), p.2" },
  { quarter: "Q3'23", mapcs: 142.0, trips: 2441.0, tripsPerMapc: 5.73, gbPerTrip: 14.45, grossBookings: 35281.0, revenue: 9292.0, takeRate: 0.263, ebitdaMargin: 0.031, adjEbitda: 1092.0, nonGaapOI: null, netIncome: 221.0, source: "Q3'24 PR (prior-year column), p.2-3" },
  { quarter: "Q4'23", mapcs: 150.0, trips: 2601.0, tripsPerMapc: 5.78, gbPerTrip: 14.45, grossBookings: 37575.0, revenue: 9936.0, takeRate: 0.264, ebitdaMargin: 0.034, adjEbitda: 1283.0, nonGaapOI: null, netIncome: 1429.0, source: "Q4'24 PR (prior-year column), p.2-3", note: "Non-GAAP OI not disclosed in Q4'24 PR." },
  { quarter: "Q1'24", mapcs: 149.0, trips: 2572.0, tripsPerMapc: 5.75, gbPerTrip: 14.64, grossBookings: 37651.0, revenue: 10131.0, takeRate: 0.269, ebitdaMargin: 0.037, adjEbitda: 1382.0, nonGaapOI: null, netIncome: -654.0, source: "Q1'25 PR (prior-year column), p.2-3" },
  { quarter: "Q2'24", mapcs: 156.0, trips: 2765.0, tripsPerMapc: 5.91, gbPerTrip: 14.45, grossBookings: 39952.0, revenue: 10700.0, takeRate: 0.268, ebitdaMargin: 0.039, adjEbitda: 1570.0, nonGaapOI: null, netIncome: 1015.0, source: "Q2'24 PR, p.2", note: "Take rate impacted by contra-revenue reclassification of S&M costs." },
  { quarter: "Q3'24", mapcs: 161.0, trips: 2868.0, tripsPerMapc: 5.94, gbPerTrip: 14.29, grossBookings: 40973.0, revenue: 11188.0, takeRate: 0.273, ebitdaMargin: 0.041, adjEbitda: 1690.0, nonGaapOI: null, netIncome: 2612.0, source: "Q3'24 PR, p.2-3", note: "Mobility take rate impacted -150bps by reclassification." },
  { quarter: "Q4'24", mapcs: 171.0, trips: 3068.0, tripsPerMapc: 5.98, gbPerTrip: 14.41, grossBookings: 44197.0, revenue: 11959.0, takeRate: 0.271, ebitdaMargin: 0.042, adjEbitda: 1842.0, nonGaapOI: 1318.0, netIncome: 6883.0, source: "Q4'24 PR, p.2-3", note: "Non-GAAP OI ($1,318M) from Q4'25 PR comparison. GAAP NI includes $6.4B tax valuation-allowance release." },
  { quarter: "Q1'25", mapcs: 170.0, trips: 3036.0, tripsPerMapc: 5.95, gbPerTrip: 14.10, grossBookings: 42818.0, revenue: 11533.0, takeRate: 0.269, ebitdaMargin: 0.044, adjEbitda: 1868.0, nonGaapOI: 1326.0, netIncome: 1776.0, source: "Q1'25 PR, p.2-3", note: "Non-GAAP OI retroactively disclosed in Q1'26 PR." },
  { quarter: "Q2'25", mapcs: 180.0, trips: 3268.0, tripsPerMapc: 6.05, gbPerTrip: 14.31, grossBookings: 46756.0, revenue: 12651.0, takeRate: 0.271, ebitdaMargin: 0.045, adjEbitda: 2119.0, nonGaapOI: null, netIncome: 1355.0, source: "Q2'25 PR, p.2-3" },
  { quarter: "Q3'25", mapcs: 189.0, trips: 3512.0, tripsPerMapc: 6.19, gbPerTrip: 14.16, grossBookings: 49740.0, revenue: 13467.0, takeRate: 0.271, ebitdaMargin: 0.045, adjEbitda: 2256.0, nonGaapOI: null, netIncome: 6626.0, source: "Q3'25 PR, p.2-3", note: "GAAP NI includes $4.9B one-time tax release, not operational." },
  { quarter: "Q4'25", mapcs: 202.0, trips: 3751.0, tripsPerMapc: 6.19, gbPerTrip: 14.43, grossBookings: 54140.0, revenue: 14366.0, takeRate: 0.265, ebitdaMargin: 0.046, adjEbitda: 2487.0, nonGaapOI: 1918.0, netIncome: 296.0, source: "Q4'25 PR, p.2-3", note: "GAAP NI suppressed by $1.6B equity revaluation headwind." },
  { quarter: "Q1'26", mapcs: 199.0, trips: 3643.0, tripsPerMapc: 6.10, gbPerTrip: 14.75, grossBookings: 53720.0, revenue: 13203.0, takeRate: 0.246, ebitdaMargin: 0.046, adjEbitda: 2481.0, nonGaapOI: 1883.0, netIncome: 263.0, source: "Q1'26 PR, p.2-3", note: "Mobility revenue +5% YoY vs GB +25% YoY: contra-revenue reclassification, not demand weakness." },
];

export interface SegmentGBQuarter {
  quarter: Quarter;
  mobility: number;
  delivery: number;
  freight: number;
  total: number;
}

export const SEGMENT_GB: SegmentGBQuarter[] = [
  { quarter: "Q2'23", mobility: 16728.0, delivery: 15595.0, freight: 1278.0, total: 33601.0 },
  { quarter: "Q3'23", mobility: 17903.0, delivery: 16094.0, freight: 1284.0, total: 35281.0 },
  { quarter: "Q4'23", mobility: 19285.0, delivery: 17011.0, freight: 1279.0, total: 37575.0 },
  { quarter: "Q1'24", mobility: 18670.0, delivery: 17699.0, freight: 1282.0, total: 37651.0 },
  { quarter: "Q2'24", mobility: 20554.0, delivery: 18126.0, freight: 1272.0, total: 39952.0 },
  { quarter: "Q3'24", mobility: 21002.0, delivery: 18663.0, freight: 1308.0, total: 40973.0 },
  { quarter: "Q4'24", mobility: 22798.0, delivery: 20126.0, freight: 1273.0, total: 44197.0 },
  { quarter: "Q1'25", mobility: 21182.0, delivery: 20377.0, freight: 1259.0, total: 42818.0 },
  { quarter: "Q2'25", mobility: 23762.0, delivery: 21734.0, freight: 1260.0, total: 46756.0 },
  { quarter: "Q3'25", mobility: 25111.0, delivery: 23322.0, freight: 1307.0, total: 49740.0 },
  { quarter: "Q4'25", mobility: 27442.0, delivery: 25431.0, freight: 1267.0, total: 54140.0 },
  { quarter: "Q1'26", mobility: 26394.0, delivery: 25992.0, freight: 1334.0, total: 53720.0 },
];

export interface SegmentRevenueQuarter {
  quarter: Quarter;
  mobility: number;
  delivery: number;
  freight: number;
  total: number;
  mobTakeRate: number;
  delTakeRate: number;
  frtTakeRate: number;
}

export const SEGMENT_REVENUE: SegmentRevenueQuarter[] = [
  { quarter: "Q2'23", mobility: 4894.0, delivery: 3057.0, freight: 1279.0, total: 9230.0, mobTakeRate: 0.293, delTakeRate: 0.196, frtTakeRate: 1.001 },
  { quarter: "Q3'23", mobility: 5071.0, delivery: 2935.0, freight: 1286.0, total: 9292.0, mobTakeRate: 0.283, delTakeRate: 0.182, frtTakeRate: 1.002 },
  { quarter: "Q4'23", mobility: 5537.0, delivery: 3119.0, freight: 1280.0, total: 9936.0, mobTakeRate: 0.287, delTakeRate: 0.183, frtTakeRate: 1.001 },
  { quarter: "Q1'24", mobility: 5633.0, delivery: 3214.0, freight: 1284.0, total: 10131.0, mobTakeRate: 0.302, delTakeRate: 0.182, frtTakeRate: 1.002 },
  { quarter: "Q2'24", mobility: 6134.0, delivery: 3293.0, freight: 1273.0, total: 10700.0, mobTakeRate: 0.298, delTakeRate: 0.182, frtTakeRate: 1.001 },
  { quarter: "Q3'24", mobility: 6409.0, delivery: 3470.0, freight: 1309.0, total: 11188.0, mobTakeRate: 0.305, delTakeRate: 0.186, frtTakeRate: 1.001 },
  { quarter: "Q4'24", mobility: 6911.0, delivery: 3773.0, freight: 1275.0, total: 11959.0, mobTakeRate: 0.303, delTakeRate: 0.187, frtTakeRate: 1.002 },
  { quarter: "Q1'25", mobility: 6496.0, delivery: 3777.0, freight: 1260.0, total: 11533.0, mobTakeRate: 0.307, delTakeRate: 0.185, frtTakeRate: 1.001 },
  { quarter: "Q2'25", mobility: 7288.0, delivery: 4102.0, freight: 1261.0, total: 12651.0, mobTakeRate: 0.307, delTakeRate: 0.189, frtTakeRate: 1.001 },
  { quarter: "Q3'25", mobility: 7682.0, delivery: 4477.0, freight: 1308.0, total: 13467.0, mobTakeRate: 0.306, delTakeRate: 0.192, frtTakeRate: 1.001 },
  { quarter: "Q4'25", mobility: 8204.0, delivery: 4892.0, freight: 1270.0, total: 14366.0, mobTakeRate: 0.299, delTakeRate: 0.192, frtTakeRate: 1.002 },
  { quarter: "Q1'26", mobility: 6798.0, delivery: 5068.0, freight: 1337.0, total: 13203.0, mobTakeRate: 0.258, delTakeRate: 0.195, frtTakeRate: 1.002 },
];

// Segment Adjusted EBITDA — discontinued as a disclosed metric starting Q1'26,
// replaced by Segment Non-GAAP Operating Income. Do not splice with SEGMENT_NGOP.
export interface SegmentAdjEbitdaQuarter {
  quarter: Quarter;
  mobility: number;
  delivery: number;
  freight: number;
  corpGA: number;
  total: number;
  mobMargin: number;
  delMargin: number;
}

export const SEGMENT_ADJ_EBITDA: SegmentAdjEbitdaQuarter[] = [
  { quarter: "Q2'23", mobility: 1170.0, delivery: 329.0, freight: -14.0, corpGA: -569.0, total: 916.0, mobMargin: 0.070, delMargin: 0.021 },
  { quarter: "Q3'23", mobility: 1287.0, delivery: 413.0, freight: -13.0, corpGA: -595.0, total: 1092.0, mobMargin: 0.072, delMargin: 0.026 },
  { quarter: "Q4'23", mobility: 1446.0, delivery: 476.0, freight: -14.0, corpGA: -625.0, total: 1283.0, mobMargin: 0.075, delMargin: 0.028 },
  { quarter: "Q1'24", mobility: 1479.0, delivery: 528.0, freight: -21.0, corpGA: -604.0, total: 1382.0, mobMargin: 0.079, delMargin: 0.030 },
  { quarter: "Q2'24", mobility: 1567.0, delivery: 588.0, freight: -12.0, corpGA: -573.0, total: 1570.0, mobMargin: 0.076, delMargin: 0.032 },
  { quarter: "Q3'24", mobility: 1682.0, delivery: 628.0, freight: -19.0, corpGA: -601.0, total: 1690.0, mobMargin: 0.080, delMargin: 0.034 },
  { quarter: "Q4'24", mobility: 1769.0, delivery: 727.0, freight: -22.0, corpGA: -632.0, total: 1842.0, mobMargin: 0.078, delMargin: 0.036 },
  { quarter: "Q1'25", mobility: 1753.0, delivery: 763.0, freight: -7.0, corpGA: -641.0, total: 1868.0, mobMargin: 0.083, delMargin: 0.037 },
  { quarter: "Q2'25", mobility: 1905.0, delivery: 873.0, freight: -6.0, corpGA: -653.0, total: 2119.0, mobMargin: 0.080, delMargin: 0.040 },
  { quarter: "Q3'25", mobility: 2038.0, delivery: 921.0, freight: -20.0, corpGA: -683.0, total: 2256.0, mobMargin: 0.081, delMargin: 0.039 },
  { quarter: "Q4'25", mobility: 2203.0, delivery: 1015.0, freight: 0.0, corpGA: -731.0, total: 2487.0, mobMargin: 0.080, delMargin: 0.040 },
  // Q1'26: not disclosed — see SEGMENT_NGOP
];

// Segment Non-GAAP Operating Income — new primary segment profitability metric
// from Q1'26 onward. Q4'24 and Q1'25 were retroactively disclosed in the Q1'26 PR.
// Prior quarters were not reported on this basis.
export interface SegmentNGOPQuarter {
  quarter: Quarter;
  mobility: number;
  delivery: number;
  freight: number;
  corpGA: number;
  total: number;
  mobMargin: number;
  delMargin: number;
}

export const SEGMENT_NGOP: SegmentNGOPQuarter[] = [
  { quarter: "Q4'24", mobility: 1608.0, delivery: 639.0, freight: -41.0, corpGA: -888.0, total: 1318.0, mobMargin: 0.071, delMargin: 0.032 },
  { quarter: "Q1'25", mobility: 1587.0, delivery: 671.0, freight: -25.0, corpGA: -907.0, total: 1326.0, mobMargin: 0.075, delMargin: 0.033 },
  { quarter: "Q4'25", mobility: 2027.0, delivery: 905.0, freight: -18.0, corpGA: -996.0, total: 1918.0, mobMargin: 0.074, delMargin: 0.036 },
  { quarter: "Q1'26", mobility: 2029.0, delivery: 961.0, freight: -30.0, corpGA: -1077.0, total: 1883.0, mobMargin: 0.077, delMargin: 0.037 },
];

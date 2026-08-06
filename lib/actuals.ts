// Q2'26 actual results, from Uber's Q2'26 Earnings Press Release (Aug 5, 2026).
// Stays null until reported -- the Scorecard tab shows a locked/pending state while it is.
export type Actuals = {
  grossBookings: number; // $M
  totalRevenue: number; // $M
  adjEbitda: number; // $M
  totalNGOP: number; // $M
  mapcs: number; // M
  trips: number; // M
  mobilityGB: number; // $M
  deliveryGB: number; // $M
  freightGB: number; // $M
  source: string;
};

export const ACTUALS: Actuals | null = {
  grossBookings: 58022,
  totalRevenue: 14191,
  adjEbitda: 2819,
  totalNGOP: 2143,
  mapcs: 208,
  trips: 3867,
  mobilityGB: 28988,
  deliveryGB: 27463,
  freightGB: 1571,
  source: "Q2'26 Earnings Press Release, Aug 5 2026, p.2",
};

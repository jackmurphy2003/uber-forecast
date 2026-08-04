// Q2'26 actual results, from Uber's press release (reports Aug 5, 2026 pre-market).
// Stays null until then -- the Scorecard tab shows a locked/pending state while it is.
export type Actuals = {
  grossBookings: number; // $M
  totalRevenue: number; // $M
  adjEbitda: number; // $M
  totalNGOP: number; // $M
  mobilityGB: number; // $M
  deliveryGB: number; // $M
  source: string;
};

export const ACTUALS: Actuals | null = null;

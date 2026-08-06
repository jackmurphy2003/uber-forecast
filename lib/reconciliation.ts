// Q2'26 variance analysis. Written by Jack after Uber's Aug 5, 2026 print,
// reconciling the Aug 4 locked forecast against actual reported results.

export type ScorecardNote = {
  key: "grossBookings" | "totalRevenue" | "adjEbitda" | "totalNGOP" | "mapcs" | "trips";
  note: string;
};

export const SCORECARD_NOTES: ScorecardNote[] = [
  { key: "grossBookings", note: "GB exceeded expectations due to GB/trip massively exceeding expectations." },
  { key: "totalRevenue", note: "Slight miss, likely due to contra-revenue reclassification in Q1'26 seeping into Q2'26 rather than stabilizing." },
  { key: "adjEbitda", note: "Close. EBITDA margin held for most part." },
  { key: "totalNGOP", note: "Fairly close." },
  { key: "mapcs", note: "Growth rate too aggressive, but close." },
  { key: "trips", note: "Growth rate too aggressive for Trips/MAPC, but close." },
];

export type DriverAttribution = {
  driver: string;
  commentary: string;
};

export const DRIVER_ATTRIBUTION: DriverAttribution[] = [
  {
    driver: "MAPCs",
    commentary:
      "Overestimated the impact of the insurance tailwind on MAPC acquisition. It drove frequency and spend for existing users more than it brought in new ones. Cutting to 15.5% YoY for Q3 and treating insurance as a frequency and GB/trip accelerator.",
  },
  {
    driver: "Trips / MAPC",
    commentary:
      "Held up pretty well, the +3% YoY frequency assumption was solid. The trips miss was entirely a MAPC headcount problem, not a frequency problem.",
  },
  {
    driver: "GB / Trip",
    commentary:
      "Was way off. Used a 12Q historical mean when in retrospect the product mix is completely different today than it was in 2023. Reserve is scaling, the hotel partnership was in its first full live quarter, and Uber One at 50M members is driving much higher average spend. The mean was anchoring to a business that doesn't really exist in the same form anymore. For Q3, anchoring to Q1'26 at $14.75, the most recent non-Q2 quarter, already reflects the new product mix without the extra noise that pushed Q2 to $15, which hasn't been seen before.",
  },
  {
    driver: "Take Rate",
    commentary:
      "Historical YoY comps are irrelevant after the business model reclassification. I discounted from Q2'25, which was the right instinct, but didn't go far enough. The broader lesson: if a structural accounting change happens and management never calls it one-time, just treat it as the new normal. Only looking at Q1'26 onward as relevant comps for take rate moving forward.",
  },
  {
    driver: "EBITDA Margin",
    commentary:
      "Basically spot on. The additive YoY trend held exactly and Balaji's insurance savings commentary played out as expected.",
  },
  {
    driver: "Segment Mix / The Crossover",
    commentary:
      "I overestimated Delivery's steam. Even though Delivery has been rising every quarter for the past year, I should've realized Mobility thrives in Q2 due to summer travel, and dialed back.",
  },
];

export type Takeaway = {
  label: string;
  commentary: string;
};

export const TAKEAWAYS: Takeaway[] = [
  {
    label: "Commentary",
    commentary:
      "Treat commentary on headwinds/tailwinds more as a directional signal rather than something that significantly moves the needle. I overestimated the impact of a few of my drivers due to this.",
  },
  {
    label: "Take Rate",
    commentary:
      "Our take rate historical YoY rates are irrelevant after the business model reclassification, moving forward I need to just look at the recent trends since Q1'26. More broadly, if a big structural change takes place, it's important to treat it like the new norm unless specifically addressed as a one-time variance.",
  },
  {
    label: "GB / Trip",
    commentary:
      "Was way off with this assumption, used a 12Q historical mean when in retrospect the product mix is much different today.",
  },
  {
    label: "Guidance",
    commentary: "Guidance isn't always correct. GB and Adj EBITDA both fell outside the expected range.",
  },
];

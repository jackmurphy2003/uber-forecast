// Derives slider ranges and chart-ready series from the raw historicals in
// lib/data.ts — keeps the sandbox and trend charts anchored to real data.

import { CONSOLIDATED, SEGMENT_GB, SEGMENT_REVENUE, SEGMENT_ADJ_EBITDA, SEGMENT_NGOP } from "./data";

export interface Range {
  min: number;
  max: number;
  latest: number;
}

function rangeOf(values: number[]): Range {
  return { min: Math.min(...values), max: Math.max(...values), latest: values[values.length - 1] };
}

export const RANGES = {
  gbPerTrip: rangeOf(CONSOLIDATED.map((q) => q.gbPerTrip)),
  consolidatedTakeRate: rangeOf(CONSOLIDATED.map((q) => q.takeRate)),
  ebitdaMargin: rangeOf(CONSOLIDATED.map((q) => q.ebitdaMargin)),
  mapcs: rangeOf(CONSOLIDATED.map((q) => q.mapcs)),
  tripsPerMapc: rangeOf(CONSOLIDATED.map((q) => q.tripsPerMapc)),
  mobilityMix: rangeOf(SEGMENT_GB.map((q) => q.mobility / q.total)),
  deliveryMix: rangeOf(SEGMENT_GB.map((q) => q.delivery / q.total)),
  freightMix: rangeOf(SEGMENT_GB.map((q) => q.freight / q.total)),
  mobilityTakeRate: rangeOf(SEGMENT_REVENUE.map((q) => q.mobTakeRate)),
  deliveryTakeRate: rangeOf(SEGMENT_REVENUE.map((q) => q.delTakeRate)),
  freightTakeRate: rangeOf(SEGMENT_REVENUE.map((q) => q.frtTakeRate)),
  mobilityOpMargin: rangeOf(SEGMENT_ADJ_EBITDA.map((q) => q.mobMargin)),
  deliveryOpMargin: rangeOf(SEGMENT_ADJ_EBITDA.map((q) => q.delMargin)),
  freightOpIncome: rangeOf(SEGMENT_NGOP.map((q) => q.freight)),
  corpGA: rangeOf(SEGMENT_NGOP.map((q) => q.corpGA)),
};

// Chart-ready series, one point per historical quarter.
export const MAPC_SERIES = CONSOLIDATED.map((q) => ({ quarter: q.quarter, value: q.mapcs }));
export const TRIPS_PER_MAPC_SERIES = CONSOLIDATED.map((q) => ({ quarter: q.quarter, value: q.tripsPerMapc }));
export const GB_PER_TRIP_SERIES = CONSOLIDATED.map((q) => ({ quarter: q.quarter, value: q.gbPerTrip }));
export const TAKE_RATE_SERIES = CONSOLIDATED.map((q) => ({ quarter: q.quarter, value: q.takeRate }));
export const EBITDA_MARGIN_SERIES = CONSOLIDATED.map((q) => ({ quarter: q.quarter, value: q.ebitdaMargin }));

export const MIX_SERIES = SEGMENT_GB.map((q) => ({
  quarter: q.quarter,
  mobility: q.mobility / q.total,
  delivery: q.delivery / q.total,
  freight: q.freight / q.total,
}));

export const SEGMENT_TAKE_RATE_SERIES = SEGMENT_REVENUE.map((q) => ({
  quarter: q.quarter,
  mobility: q.mobTakeRate,
  delivery: q.delTakeRate,
}));

export const SEGMENT_OP_MARGIN_SERIES = SEGMENT_ADJ_EBITDA.map((q) => ({
  quarter: q.quarter,
  mobility: q.mobMargin,
  delivery: q.delMargin,
}));

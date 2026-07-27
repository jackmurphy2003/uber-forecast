// Pure calculation engine implementing the driver tree from the source model's
// Assumptions tab. The same functions drive both the locked snapshot (fed
// base-case constants) and the interactive sandbox (fed slider state).
//
// Driver tree:
//   MAPC growth -> MAPCs -> trips/MAPC growth -> total trips -> GB/trip -> Gross Bookings
//   -> segment mix -> segment GB -> segment take rates -> segment revenue -> total revenue
//   -> consolidated take rate (derived = total revenue / total GB)
//   Gross Bookings -> EBITDA margin -> consolidated Adj EBITDA (top-down; separate metric)
//   segment GB -> segment op margins -> segment Non-GAAP Op Income -> + corp G&A -> total NGOP

import { BASE_MAPCS_Q225, BASE_TRIPS_PER_MAPC_Q225 } from "./assumptions";

export interface ForecastInputs {
  mapcGrowth: number;
  tripsPerMapcGrowth: number;
  gbPerTrip: number;
  ebitdaMargin: number;
  mobilityMix: number;
  deliveryMix: number;
  mobilityTakeRate: number;
  deliveryTakeRate: number;
  freightTakeRate: number;
  mobilityOpMargin: number;
  deliveryOpMargin: number;
  freightOpIncome: number; // $M, flat
  corpGA: number; // $M, flat
}

export interface ForecastOutput {
  mapcs: number;
  tripsPerMapc: number;
  totalTrips: number;
  grossBookings: number;

  freightMix: number;
  mobilityGB: number;
  deliveryGB: number;
  freightGB: number;

  mobilityRevenue: number;
  deliveryRevenue: number;
  freightRevenue: number;
  totalRevenue: number;
  consolidatedTakeRate: number;

  adjEbitda: number;

  mobilityNGOP: number;
  deliveryNGOP: number;
  freightNGOP: number;
  corpGA: number;
  totalNGOP: number;
}

export function runForecast(inputs: ForecastInputs): ForecastOutput {
  const mapcs = BASE_MAPCS_Q225 * (1 + inputs.mapcGrowth);
  const tripsPerMapc = BASE_TRIPS_PER_MAPC_Q225 * (1 + inputs.tripsPerMapcGrowth);
  const totalTrips = mapcs * tripsPerMapc * 3;
  const grossBookings = totalTrips * inputs.gbPerTrip;

  const freightMix = 1 - inputs.mobilityMix - inputs.deliveryMix;
  const mobilityGB = grossBookings * inputs.mobilityMix;
  const deliveryGB = grossBookings * inputs.deliveryMix;
  const freightGB = grossBookings * freightMix;

  const mobilityRevenue = mobilityGB * inputs.mobilityTakeRate;
  const deliveryRevenue = deliveryGB * inputs.deliveryTakeRate;
  const freightRevenue = freightGB * inputs.freightTakeRate;
  const totalRevenue = mobilityRevenue + deliveryRevenue + freightRevenue;
  const consolidatedTakeRate = grossBookings !== 0 ? totalRevenue / grossBookings : 0;

  const adjEbitda = grossBookings * inputs.ebitdaMargin;

  const mobilityNGOP = mobilityGB * inputs.mobilityOpMargin;
  const deliveryNGOP = deliveryGB * inputs.deliveryOpMargin;
  const freightNGOP = inputs.freightOpIncome;
  const corpGA = inputs.corpGA;
  const totalNGOP = mobilityNGOP + deliveryNGOP + freightNGOP + corpGA;

  return {
    mapcs,
    tripsPerMapc,
    totalTrips,
    grossBookings,
    freightMix,
    mobilityGB,
    deliveryGB,
    freightGB,
    mobilityRevenue,
    deliveryRevenue,
    freightRevenue,
    totalRevenue,
    consolidatedTakeRate,
    adjEbitda,
    mobilityNGOP,
    deliveryNGOP,
    freightNGOP,
    corpGA,
    totalNGOP,
  };
}

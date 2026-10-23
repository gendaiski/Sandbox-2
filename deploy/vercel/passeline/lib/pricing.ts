export type DeliveryMode = "direct" | "neighbor"

/** Passeline's published rates, also quoted in the FAQ and the Terms. */
export const pricing = {
  base: { direct: 5.9, neighbor: 4.25 } satisfies Record<DeliveryMode, number>,
  perMile: 1.6,
  returnFee: 8.5,
  maxMiles: 12,
  /** Days the relay neighbor's QR code stays valid. */
  pickupDays: 4,
  /** Payout to a relay neighbor, per parcel handed over. */
  neighborPayout: 1.5,
  /** Courier payout: flat fee per run, then per mile. */
  courier: { base: 3.5, perMile: 1 },
  /** Merchant subscription after the three free months. */
  shopMonthly: 19,
} as const

export function estimatePrice(mode: DeliveryMode, miles: number) {
  const base = pricing.base[mode]
  const distance = Math.round(miles * pricing.perMile * 100) / 100
  return { base, distance, total: Math.round((base + distance) * 100) / 100 }
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

export function formatUsd(value: number) {
  return usd.format(value)
}

/** Whole dollars without cents ($19), everything else with cents ($4.25). */
export function formatUsdShort(value: number) {
  return Number.isInteger(value) ? `$${value}` : usd.format(value)
}

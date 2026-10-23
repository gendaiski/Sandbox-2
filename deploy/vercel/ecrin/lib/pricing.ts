/**
 * The two ways to deliver an écrin: "handover" (in person) and "point"
 * (pickup at an Écrin Point).
 */
export type DeliveryMode = "handover" | "point"

export const modeNames: Record<DeliveryMode, string> = {
  handover: "Handover",
  point: "Écrin Point",
}

/** Écrin's rules and rates (fictional brand), reused by the FAQ and terms. */
export const pricing = {
  base: { handover: 5.75, point: 3.5 } satisfies Record<DeliveryMode, number>,
  perMile: 1.75,
  returnFee: 6,
  maxMiles: 10,
  /** How long the pickup code stays valid, in days. */
  pickupDays: 3,
  /** Free cancellation window after ordering, in minutes. */
  freeCancelMinutes: 15,
  /** Refund delay, in business days. */
  refundDays: 4,
  courier: { base: 2.75, perMile: 1.45 },
  /** What an Écrin Point earns for each parcel handed over. */
  pointReward: 1.75,
  /** Share taken on each sale by a partner shop. */
  shopCommission: 0.03,
  /** Founder's callback delay for merchants, in business hours. */
  founderReplyHours: 24,
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

/** Always two decimals: $5.75, $6.00. */
export function formatUsd(value: number) {
  return usd.format(value)
}

/** Whole dollars without decimals: $6, $5.75. */
export function formatUsdShort(value: number) {
  return Number.isInteger(value) ? `$${value}` : usd.format(value)
}

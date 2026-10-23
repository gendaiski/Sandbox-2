export type DeliveryMode = "inPerson" | "setAside"

/**
 * Barème fictif d'Aparté (États-Unis), repris dans la FAQ, les conditions
 * et les contrats. Montants en dollars, distances en miles.
 */
export const pricing = {
  base: { inPerson: 7.9, setAside: 5.5 } satisfies Record<DeliveryMode, number>,
  perMile: 1.25,
  returnFee: 9,
  maxMiles: 20,
  /** Validité du code de retrait chez le gardien, en jours. */
  pickupDays: 7,
  /** Délai de remboursement après annulation, en jours ouvrés. */
  refundDays: 7,
  courier: { base: 3.25, perMile: 1.2 },
  keeperReward: 1.6,
  merchantRate: 6,
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

/** Sans centimes quand le montant est rond : $9, $60. */
export function formatUsdShort(value: number) {
  return Number.isInteger(value) ? `$${value}` : usd.format(value)
}

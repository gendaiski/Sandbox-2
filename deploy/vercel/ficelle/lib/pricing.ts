export type DeliveryMode = "by-hand" | "drop-off"

/**
 * Grille indicative de Ficelle (marque fictive), en dollars et en miles.
 * Les mêmes chiffres sont repris dans la FAQ, les conditions et les contrats.
 */
export const pricing = {
  base: { "by-hand": 6.5, "drop-off": 4.5 } satisfies Record<DeliveryMode, number>,
  perMile: 1.4,
  returnFee: 7,
  /** Rayon desservi autour de Bellmere, en miles */
  maxMiles: 15,
  /** Jours pendant lesquels un colis en dépôt attend son destinataire */
  pickupDays: 5,
  courier: { base: 3, perMile: 1.1 },
  dropOffShopFee: 1.25,
  merchantRate: 0.04,
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

export function formatUsdShort(value: number) {
  return Number.isInteger(value) ? "$" + value : usd.format(value)
}

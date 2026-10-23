/** Couleurs de la marque Passeline. */
export const brand = {
  teal: "#1A7971",
  tealDeep: "#123F3B",
  gold: "#C59940",
  goldLight: "#E3BE6B",
  ink: "#0F2324",
  cream: "#F9F6ED",
} as const

/** Teintes de peau et de cheveux des personnages (sans traits du visage). */
export const skin = {
  light: "#F1CBA6",
  tan: "#D59E6E",
  brown: "#A66A44",
  deep: "#6B412A",
} as const

export const hair = {
  black: "#1E1712",
  brown: "#4E3220",
  auburn: "#9A5B2E",
  grey: "#DCD3C2",
  ink: "#0F2324",
} as const

/** Une palette par heure du jour : la même ville, éclairée autrement. */
export type CityPalette = {
  haze: string
  hazeFar: string
  wall: string
  wallShade: string
  wallLine: string
  window: string
  windowLit: string
  litRatio: number
  frame: string
  slate: string
  slateLight: string
  hallWall: string
  hallShade: string
  hallRoof: string
  tree: string
  treeLight: string
  treeDark: string
  trunk: string
  street: string
  quayWall: string
  quayLine: string
  water: string
  waterDeep: string
  ripple: string
  glint: string
  paving: string
  curb: string
  wheel: string
  wheelShade: string
  wheelLine: string
  tram: string
  tramBand: string
  tramWindow: string
  wire: string
}

export const dayCity: CityPalette = {
  haze: "#BBD8D0",
  hazeFar: "#CFE4DE",
  wall: "#EFE2C2",
  wallShade: "#DCCA9D",
  wallLine: "#CDB98B",
  window: "#35585A",
  windowLit: "#35585A",
  litRatio: 0,
  frame: "#F9F6ED",
  slate: "#4B6B6E",
  slateLight: "#5F8285",
  hallWall: "#E6D5A9",
  hallShade: "#CDB685",
  hallRoof: "#42636A",
  tree: "#2B8177",
  treeLight: "#46998D",
  treeDark: "#1E6560",
  trunk: "#5B4632",
  street: "#D9CDAE",
  quayWall: "#D6C394",
  quayLine: "#C1AC7C",
  water: "#86BEB4",
  waterDeep: "#6DAEA3",
  ripple: "#B8DDD5",
  glint: "#F6E3AE",
  paving: "#ECE4CC",
  curb: "#D5C399",
  wheel: "#E3BE6B",
  wheelShade: "#C59940",
  wheelLine: "#A88234",
  tram: "#F9F6ED",
  tramBand: "#123F3B",
  tramWindow: "#35585A",
  wire: "#35585A",
}

export const nightCity: CityPalette = {
  haze: "#174541",
  hazeFar: "#143D39",
  wall: "#2C5550",
  wallShade: "#234A45",
  wallLine: "#1D403C",
  window: "#163834",
  windowLit: "#E3BE6B",
  litRatio: 0.55,
  frame: "#3A6660",
  slate: "#112F2D",
  slateLight: "#1A3D3A",
  hallWall: "#2F5C56",
  hallShade: "#26504A",
  hallRoof: "#112F2D",
  tree: "#0F3532",
  treeLight: "#164340",
  treeDark: "#0B2B29",
  trunk: "#0B2626",
  street: "#1D4440",
  quayWall: "#1E4743",
  quayLine: "#183C38",
  water: "#0F3633",
  waterDeep: "#0C2E2B",
  ripple: "#1F4C47",
  glint: "#E3BE6B",
  paving: "#0F2324",
  curb: "#1C3B3A",
  wheel: "#B08B3B",
  wheelShade: "#8C6E2E",
  wheelLine: "#6E5624",
  tram: "#D8D2BE",
  tramBand: "#0F2324",
  tramWindow: "#E3BE6B",
  wire: "#2A5550",
}

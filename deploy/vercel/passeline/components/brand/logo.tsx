import { cn } from "@/lib/utils"

/*
 * Le symbole Passeline : le trajet d'un cadeau, en pointillés or, qui fait
 * une boucle et se termine en petit nœud. Repère commun : viewBox
 * « 12 27 102 72 ». Le nœud seul (BowShapes) sert aussi à nouer les boîtes
 * illustrées, et `scripts/make-og-image.py` relit ces tracés.
 */

const BOW_LIGHT =
  "M64 53C53.53 58.71 36.41 63.47 24.99 58.71C13.57 53.95 11.67 34.92 22.14 28.26C36.41 19.7 59.24 36.83 64 53ZM64 53C68.76 36.83 91.59 19.7 105.86 28.26C116.33 34.92 114.43 53.95 103.01 58.71C91.59 63.47 74.47 58.71 64 53ZM61.15 54.9L67.33 58.71L54.49 89.16L51.16 82.5L44.5 85.83L61.15 54.9ZM66.85 54.9L83.5 85.83L76.84 82.5L73.51 89.16L60.67 58.71L66.85 54.9Z"

const BOW_DARK =
  "M62.1 53C59.24 54.9 54.49 56.33 48.78 55.09C40.21 53 35.46 45.86 41.17 42.06C48.78 37.78 59.24 45.39 62.1 53ZM65.9 53C68.76 45.39 79.22 37.78 86.83 42.06C92.54 45.86 87.79 53 79.22 55.09C73.51 56.33 68.76 54.9 65.9 53ZM71.14 53.48C71.14 57.42 67.94 60.61 64 60.61C60.06 60.61 56.86 57.42 56.86 53.48C56.86 49.53 60.06 46.34 64 46.34C67.94 46.34 71.14 49.53 71.14 53.48Z"

/** Centre du nœud, dans le repère du symbole. */
export const BOW_CENTER = { x: 64, y: 53 } as const
/** Largeur du nœud, d'une boucle à l'autre, dans le même repère. */
export const BOW_WIDTH = 98

/** Les points du trajet, du départ jusqu'au nœud : x, y, rayon. */
const MARK_DOTS = [
  [15.67, 92.09, 3.82],
  [28.9, 91.53, 3.94],
  [41.56, 87.73, 4.07],
  [51.43, 79.09, 4.19],
  [56.01, 66.73, 4.32],
  [56.36, 53.53, 4.45],
  [51.44, 41.39, 4.57],
  [39.52, 37.2, 4.69],
  [30.42, 45.97, 4.82],
  [32.02, 58.72, 4.94],
  [42.85, 65.89, 5.06],
  [68.68, 63.02, 5.31],
] as const

/** Le petit nœud au bout du trajet : centre et échelle du nœud complet. */
const MARK_BOW = { x: 90, y: 46, scale: 0.4624 } as const

const GOLD_DOT = "#C59940"

/**
 * Le nœud de cadeau (boucles et pans, puis plis et nœud), à poser dans un
 * SVG existant.
 */
export function BowShapes({
  light = "#E3BE6B",
  dark = "#C8962A",
}: {
  light?: string
  dark?: string
}) {
  return (
    <g>
      <path fill={light} d={BOW_LIGHT} />
      <path fill={dark} d={BOW_DARK} />
    </g>
  )
}

/** Le symbole complet (pointillés et nœud), à poser dans un SVG existant. */
export function MarkShapes() {
  return (
    <g>
      {MARK_DOTS.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={GOLD_DOT} />
      ))}
      <g
        transform={`translate(${MARK_BOW.x} ${MARK_BOW.y}) scale(${MARK_BOW.scale}) translate(${-BOW_CENTER.x} ${-BOW_CENTER.y})`}
      >
        <BowShapes />
      </g>
    </g>
  )
}

/** Le symbole Passeline, d'après le fichier de marque passeline-logo.svg. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="12 27 102 72"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-8 shrink-0", className)}
    >
      <MarkShapes />
    </svg>
  )
}

/** Le nœud seul, pour nouer une étiquette ou une petite boîte. */
export function Bow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="12 24 102 70"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-8 shrink-0", className)}
    >
      <BowShapes />
    </svg>
  )
}

export function Logo({
  className,
  tone = "ink",
}: {
  className?: string
  tone?: "ink" | "cream"
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="w-10" />
      <span
        className={cn(
          "logo-word text-[1.7rem] leading-none",
          tone === "ink" ? "text-ink" : "text-cream"
        )}
      >
        Passe
        <span className={tone === "ink" ? "text-teal" : "text-gold-light"}>
          line
        </span>
      </span>
    </span>
  )
}

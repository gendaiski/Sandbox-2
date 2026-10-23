import { cn } from "@/lib/utils"

/*
 * Le symbole Aparté : un « a » en Bodoni logé dans une parenthèse ouvrante,
 * comme un mot glissé à l'oreille. Dessiné d'après les contours de Bodoni
 * Moda (graisse 700, taille optique 28), fichier de marque
 * public/brand/aparte-logo.svg.
 */
const PAREN =
  "M29.7 100Q23.41 97.27 18 92.37Q12.59 87.47 8.54 80.79Q4.49 74.12 2.25 66.05Q0 57.99 0 48.97Q0 36.96 3.92 27.22Q7.84 17.48 14.57 10.55Q21.3 3.61 29.7 0L30.05 0.57Q26.24 3.07 23.56 8.12Q20.87 13.18 19.19 19.86Q17.5 26.54 16.74 34.04Q15.98 41.55 15.98 48.97Q15.98 56.39 16.74 64.2Q17.5 72.01 19.19 79.1Q20.87 86.2 23.56 91.55Q26.24 96.9 30.05 99.42Z"
const LETTER =
  "M63.13 80.64Q59.81 80.64 57.16 79.76Q54.52 78.87 52.96 76.88Q51.41 74.88 51.41 71.58V48.22Q51.41 44.51 50.73 40.83Q50.05 37.16 47.98 34.74Q45.91 32.32 41.78 32.32Q39.37 32.32 36.61 32.9Q33.85 33.48 31.4 34.69Q28.94 35.91 27.39 37.81Q25.83 39.71 25.83 42.39H25Q25 39.17 27.44 37.17Q29.87 35.18 33.09 35.18Q36.47 35.18 39.01 36.98Q41.55 38.78 41.55 42.19Q41.55 45.85 38.96 47.73Q36.37 49.61 33.09 49.61Q29.56 49.61 27.23 47.68Q24.9 45.74 24.9 42.39Q24.9 39.51 26.58 37.42Q28.27 35.33 31.08 33.99Q33.9 32.65 37.36 32.01Q40.82 31.36 44.32 31.36Q52.21 31.36 56.92 33.56Q61.63 35.77 63.72 39.58Q65.8 43.4 65.8 48.22V74.29Q65.8 76 66.61 77.2Q67.43 78.39 69.42 78.39Q70.84 78.39 72.93 77.1Q75.02 75.81 76.34 73.06L76.84 73.51Q75.32 76.92 71.65 78.78Q67.98 80.64 63.13 80.64ZM35.98 80.64Q29.28 80.64 25.29 77.21Q21.29 73.78 21.29 67.91Q21.29 61 27.24 57.23Q33.19 53.47 44.17 53.47H56.21V54.16H47.62Q43.73 54.16 41.39 56.2Q39.04 58.24 37.99 61.1Q36.94 63.97 36.94 66.55Q36.94 69 37.5 71.2Q38.07 73.41 39.37 74.8Q40.67 76.19 42.79 76.19Q45.09 76.19 47.05 74.57Q49 72.94 50.21 69.57Q51.41 66.19 51.41 60.96H51.96Q51.96 67.06 50.14 71.48Q48.33 75.89 44.78 78.27Q41.24 80.64 35.98 80.64Z"

export function Mark({
  className,
  tone = "gold",
}: {
  className?: string
  tone?: "gold" | "cream"
}) {
  const letter = tone === "gold" ? "#C8962A" : "#F9F6ED"
  const paren = tone === "gold" ? "#E3BE6B" : "#F9F6ED"
  return (
    <svg
      viewBox="0 0 77 100"
      aria-hidden="true"
      focusable="false"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      <path fill={paren} opacity={tone === "cream" ? 0.72 : 1} d={PAREN} />
      <path fill={letter} d={LETTER} />
    </svg>
  )
}

/** Le mot-symbole, d'un seul tenant, précédé du symbole. */
export function Logo({
  className,
  tone = "ink",
}: {
  className?: string
  tone?: "ink" | "cream"
}) {
  return (
    <span className={cn("inline-flex items-center", "gap-2.5", className)}>
      <Mark />
      <span
        className={cn(
          "font-heading text-[1.6rem] leading-none",
          "font-semibold tracking-[-0.02em]",
          tone === "ink" ? "text-ink" : "text-cream"
        )}
      >
        Aparté
      </span>
    </span>
  )
}

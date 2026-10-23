import { cn } from "@/lib/utils"

/** Les ors de la marque : le corps, le dessus éclairé, la lumière. */
const gold = { body: "#C8962A", top: "#E3BE6B", light: "#F6E2AE" }

/** Un éclat à quatre branches, centré sur (cx, cy). */
function sparkle(cx: number, cy: number, ry: number, rx: number) {
  const a = ry * 0.12
  return [
    `M${cx} ${cy - ry}`,
    `Q${cx + a} ${cy - a} ${cx + rx} ${cy}`,
    `Q${cx + a} ${cy + a} ${cx} ${cy + ry}`,
    `Q${cx - a} ${cy + a} ${cx - rx} ${cy}`,
    `Q${cx - a} ${cy - a} ${cx} ${cy - ry}Z`,
  ].join("")
}

/**
 * Le symbole Écrin : un écrin vu en légère perspective, le couvercle
 * entrouvert, et l'éclat or qui s'en échappe. Fichier de marque :
 * public/brand/ecrin-logo.svg.
 */
export function Mark({
  className,
  tone = "gold",
  glintId,
}: {
  className?: string
  tone?: "gold" | "cream"
  /**
   * Adds the gold glint that sweeps across the mark (once after load, then
   * on hover of the parent link). Needs an id unique to the page.
   */
  glintId?: string
}) {
  const cream = tone === "cream"
  const body = cream ? "#F9F6ED" : gold.body
  const top = cream ? "#F9F6ED" : gold.top
  const light = cream ? "#F9F6ED" : gold.light
  const lid = "translate(0 -2.5) rotate(-10 7 27)"
  return (
    <svg
      viewBox="4.5 6.5 44.5 36"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-8 shrink-0", className)}
    >
      {/* L'intérieur éclairé, visible sous le couvercle */}
      <path fill={light} opacity={cream ? 0.45 : 1} d="M8 27H40L36.5 23H11.5Z" />
      {/* Le corps et son fermoir */}
      <path fill={body} d="M8 27H40V38.5Q40 42 36.5 42H11.5Q8 42 8 38.5Z" />
      {!cream && (
        <rect x="21.5" y="27" width="5" height="3.6" rx="1" fill={light} />
      )}
      {/* Le couvercle, soulevé et basculé */}
      <g transform={lid}>
        <path
          fill={top}
          stroke={top}
          strokeWidth="1"
          strokeLinejoin="round"
          opacity={cream ? 0.72 : 1}
          d="M7 20H41L37.5 16H10.5Z"
        />
        <path fill={body} d="M7 20H41V25.8Q41 27 39.8 27H8.2Q7 27 7 25.8Z" />
      </g>
      {/* L'éclat qui s'échappe */}
      <path fill={light} d={sparkle(41.5, 23, 10.5, 7)} />
      {glintId && (
        <>
          <defs>
            <clipPath id={glintId + "-clip"}>
              <path d="M8 27H40L36.5 23H11.5Z" />
              <path d="M8 27H40V38.5Q40 42 36.5 42H11.5Q8 42 8 38.5Z" />
              <path transform={lid} d="M6.5 25.8V20L10.3 15.5H37.7L41.5 20V25.8Q41.5 27.5 39.8 27.5H8.2Q6.5 27.5 6.5 25.8Z" />
              <path d={sparkle(41.5, 23, 10.5, 7)} />
            </clipPath>
            <linearGradient id={glintId + "-band"} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff8e4" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff8e4" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fff8e4" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Le reflet : une bande claire qui traverse le symbole en biais */}
          <g clipPath={"url(#" + glintId + "-clip)"}>
            <g transform="skewX(-22)">
              <rect
                className="mark-glint"
                x="-9"
                y="0"
                width="12"
                height="50"
                fill={"url(#" + glintId + "-band)"}
              />
            </g>
          </g>
        </>
      )}
    </svg>
  )
}

/**
 * L'éclat du symbole, seul et taillé en facettes : il se dresse en volume sur
 * le couvercle de la boîte 3D, à la place d'un nœud.
 */
export function MarkGlint({ className }: { className?: string }) {
  // Quatre facettes : la lumière vient d'en haut à droite, chaque branche a
  // une arête, et l'éclat garde du relief quand la boîte tourne.
  const c = 50
  const rx = 36
  const a = 6
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto w-8", className)}
    >
      <path fill={gold.light} d={`M${c} 0Q${c + a} ${c - a} ${c + rx} ${c}H${c}Z`} />
      <path fill={gold.top} d={`M${c} 0Q${c - a} ${c - a} ${c - rx} ${c}H${c}Z`} />
      <path fill={gold.body} d={`M${c} 100Q${c - a} ${c + a} ${c - rx} ${c}H${c}Z`} />
      <path fill={gold.top} d={`M${c} 100Q${c + a} ${c + a} ${c + rx} ${c}H${c}Z`} />
    </svg>
  )
}

/** Le symbole et le mot « Écrin », sur fond clair (encre) ou sombre (crème). */
export function Logo({
  className,
  tone = "ink",
}: {
  className?: string
  tone?: "ink" | "cream"
}) {
  return (
    <span className={cn("inline-flex items-center", "gap-2.5", className)}>
      <Mark className="w-9" />
      <span
        className={cn(
          "font-heading text-[1.6rem] leading-none",
          "font-semibold tracking-[-0.02em]",
          tone === "ink" ? "text-ink" : "text-cream"
        )}
      >
        Écrin
      </span>
    </span>
  )
}

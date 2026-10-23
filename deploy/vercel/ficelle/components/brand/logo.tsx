import { cn } from "@/lib/utils"

/**
 * Le symbole Ficelle : une étiquette d'expédition teal, son œillet cerclé
 * d'or et sa boucle de ficelle, avec un « f » évidé dans l'étiquette (le
 * fond apparaît à travers). Même dessin que public/brand/ficelle-logo.svg ;
 * les autres pistes sont dans design/logo-options/.
 */
export function Mark({
  className,
  tone = "teal",
}: {
  className?: string
  /** « cream » sur les fonds teal foncé ou encre */
  tone?: "teal" | "cream"
}) {
  const tag = tone === "teal" ? "#1A7971" : "#F9F6ED"
  const string = tone === "teal" ? "#0F2324" : "#F9F6ED"
  return (
    <svg
      viewBox="1.5 3.5 63 40"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-8 shrink-0", className)}
    >
      <g transform="rotate(-8 36 24)">
        <path fill={tag} fillRule="evenodd" d={tagPath} />
        <circle cx="18.5" cy="24" r="4.4" fill="none" stroke="#C59940" strokeWidth="1.8" />
        <path
          fill="none"
          stroke={string}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity={tone === "cream" ? 0.8 : 1}
          d="M18.5 24C14.8 20.2 7.2 17.6 5.2 12.4C3.8 8.6 6.6 5.2 10.2 5.6C14.4 6.1 15.8 10.8 14.6 14.6C13.8 17.4 15.6 21 18.5 24"
        />
      </g>
    </svg>
  )
}

const tagPath =
  "M21 7H58Q62 7 62 11V37Q62 41 58 41H21L11 31.5V16.5Z M18.5 20.6A3.4 3.4 0 1 1 18.5 27.4A3.4 3.4 0 1 1 18.5 20.6Z M35.92 37.6V21.32H33.35V15.75H35.92V14.19Q35.92 11.35 36.82 9.81Q37.72 8.27 39.29 7.68Q40.86 7.1 42.89 7.1Q43.45 7.1 44.23 7.2Q45.01 7.29 45.79 7.45Q46.58 7.61 47.05 7.83V12.65H45.33Q44.32 12.65 43.94 13.08Q43.57 13.51 43.57 14.36V15.75H47.05V21.32H43.57V37.6Z"

export function Logo({
  className,
  tone = "ink",
}: {
  className?: string
  tone?: "ink" | "cream"
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark className="w-10" tone={tone === "ink" ? "teal" : "cream"} />
      <span
        className={cn(
          "font-heading text-[1.75rem] leading-none font-black [font-stretch:72%] tracking-[-0.005em]",
          tone === "ink" ? "text-ink" : "text-cream"
        )}
      >
        Ficelle
      </span>
    </span>
  )
}

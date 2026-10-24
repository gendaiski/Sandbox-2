import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

type StampProps = {
  children: ReactNode
  className?: string
  /** Rotation en degrés */
  r?: number
  tone?: "teal" | "deep"
  style?: CSSProperties
  /**
   * Le tampon s'abat quand il entre à l'écran (voir RevealOnScroll) ; la
   * valeur est un délai en millisecondes.
   */
  reveal?: number
}

/** Tampon encreur rectangulaire, double filet, encre irrégulière. */
export function Stamp({ children, className, r = -6, tone = "teal", style, reveal }: StampProps) {
  return (
    <span
      aria-hidden="true"
      data-reveal={reveal === undefined ? undefined : "stamp"}
      className={cn(
        "stamp inline-block",
        tone === "deep" && "text-teal-deep",
        className
      )}
      style={
        {
          "--r": `${r}deg`,
          ...(reveal ? { "--reveal-delay": `${reveal}ms` } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <span className="relative block rounded-[5px] border-[3px] border-current px-[0.6em] pt-[0.42em] pb-[0.34em] before:absolute before:inset-[3px] before:rounded-[2px] before:border-[1.5px] before:border-current">
        <span className="type-display block text-center leading-[0.9] tracking-[0.03em] whitespace-nowrap uppercase">
          {children}
        </span>
      </span>
    </span>
  )
}

/** Cachet postal rond « BELLMERE OR », avec ses ondes d'oblitération. */
export function Postmark({
  className,
  r = -10,
  tone = "deep",
  top = "BELLMERE",
  bottom = "TANSY RIVER",
  center = "OR",
  waves = true,
  style,
}: {
  className?: string
  r?: number
  tone?: "teal" | "deep"
  top?: string
  bottom?: string
  center?: string
  waves?: boolean
  style?: CSSProperties
}) {
  const id = `pm-${top}-${bottom}`.replace(/[^a-zA-Z0-9-]/g, "")
  return (
    <span
      aria-hidden="true"
      className={cn("stamp inline-block", tone === "deep" ? "text-teal-deep" : "text-teal", className)}
      style={{ "--r": `${r}deg`, ...style } as CSSProperties}
    >
      <svg viewBox={waves ? "0 0 330 160" : "0 0 160 160"} className="block h-full w-full overflow-visible" fill="none">
        <defs>
          <path id={`${id}-t`} d="M 28 80 A 52 52 0 0 1 132 80" />
          <path id={`${id}-b`} d="M 22 80 A 58 58 0 0 0 138 80" />
        </defs>
        <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="4.5" />
        <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="2" />
        <text className="type-display" fill="currentColor" fontSize="21" letterSpacing="2.5">
          <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
            {top}
          </textPath>
        </text>
        <text className="type-display" fill="currentColor" fontSize="14.5" letterSpacing="1.6">
          <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
            {bottom}
          </textPath>
        </text>
        <text
          x="80"
          y="96"
          className="type-display"
          fill="currentColor"
          fontSize="46"
          textAnchor="middle"
        >
          {center}
        </text>
        {waves &&
          [0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M 168 ${44 + i * 18} q 20 -12 40 0 t 40 0 t 40 0 t 40 0`}
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
      </svg>
    </span>
  )
}

/** Morceau de ruban adhésif or clair. */
export function Tape({
  className,
  r = -4,
  delay,
  style,
}: {
  className?: string
  r?: number
  /** Délai d'apparition dans la séquence d'ouverture (ms) ; sans délai, pas d'animation */
  delay?: number
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("tape", delay !== undefined && "anim-tape", className)}
      style={{ rotate: `${r}deg`, ...(delay !== undefined ? { "--d": `${delay}ms` } : {}), ...style } as CSSProperties}
    />
  )
}

import type { ReactNode } from "react"

import { brand } from "./palette"

export type HairStyle =
  "short" | "bun" | "curly" | "afro" | "long" | "scarf" | "helmet" | "none"

export type Pose = "down" | "hold" | "give" | "wave" | "phone" | "hip" | "reach"

type Arm = { d: string; hand: [number, number] }

const arms: Record<Pose, [Arm, Arm]> = {
  down: [
    { d: "M-19 -117 Q-26 -96 -24 -77", hand: [-24, -75] },
    { d: "M19 -117 Q26 -96 24 -77", hand: [24, -75] },
  ],
  hold: [
    { d: "M-19 -117 Q-30 -94 -13 -88", hand: [-12, -88] },
    { d: "M19 -117 Q30 -94 13 -88", hand: [12, -88] },
  ],
  give: [
    { d: "M-19 -117 Q-8 -92 30 -94", hand: [32, -94] },
    { d: "M19 -117 Q32 -104 42 -100", hand: [43, -100] },
  ],
  wave: [
    { d: "M-19 -117 Q-26 -96 -24 -77", hand: [-24, -75] },
    { d: "M19 -117 Q38 -126 33 -150", hand: [33, -153] },
  ],
  phone: [
    { d: "M-19 -117 Q-26 -96 -24 -77", hand: [-24, -75] },
    { d: "M19 -117 Q30 -96 10 -102", hand: [9, -103] },
  ],
  hip: [
    { d: "M-19 -117 Q-34 -100 -17 -84", hand: [-16, -83] },
    { d: "M19 -117 Q34 -100 17 -84", hand: [16, -83] },
  ],
  reach: [
    { d: "M-19 -117 Q-26 -96 -24 -77", hand: [-24, -75] },
    { d: "M19 -117 Q34 -108 44 -112", hand: [46, -112] },
  ],
}

/**
 * Personnage simple, sans visage : pieds en (x, y), environ 168 unités de
 * haut à l'échelle 1. `holding` est dessiné dans le repère du personnage,
 * entre les bras et les mains.
 */
export function Person({
  x,
  y,
  s = 1,
  flip = false,
  skin,
  hair = "short",
  hairColor = brand.ink,
  top,
  bottom = brand.ink,
  shoes = brand.ink,
  dress = false,
  legs,
  apron,
  pose = "down",
  holding,
  part = "all",
}: {
  x: number
  y: number
  s?: number
  flip?: boolean
  skin: string
  hair?: HairStyle
  hairColor?: string
  top: string
  bottom?: string
  shoes?: string
  dress?: boolean
  legs?: string
  apron?: string
  pose?: Pose
  holding?: ReactNode
  /**
   * Pour animer le bras droit à part (le salut) : `body` dessine tout sauf
   * ce bras, `arm` ne dessine que lui.
   */
  part?: "all" | "body" | "arm"
}) {
  const [left, right] = arms[pose]
  const transform = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`
  if (part === "arm") {
    return (
      <g transform={transform}>
        <path
          d={right.d}
          stroke={top}
          strokeWidth={10.5}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={right.hand[0]} cy={right.hand[1]} r={5.6} fill={skin} />
      </g>
    )
  }
  const withArm = part === "all"
  return (
    <g transform={transform}>
      {/* Cheveux derrière la tête */}
      {hair === "afro" ? (
        <circle cx={0} cy={-152} r={21} fill={hairColor} />
      ) : null}
      {hair === "long" ? (
        <path
          d="M-17 -152 L-21 -106 Q0 -100 21 -106 L17 -152 Z"
          fill={hairColor}
        />
      ) : null}

      {/* Jambes */}
      {dress ? (
        <g>
          <rect
            x={-11}
            y={-36}
            width={8}
            height={32}
            rx={4}
            fill={legs ?? skin}
          />
          <rect
            x={3}
            y={-36}
            width={8}
            height={32}
            rx={4}
            fill={legs ?? skin}
          />
        </g>
      ) : (
        <g fill={bottom}>
          <rect x={-14} y={-72} width={12.5} height={68} rx={6} />
          <rect x={1.5} y={-72} width={12.5} height={68} rx={6} />
        </g>
      )}
      <ellipse cx={-7} cy={-3.5} rx={9.5} ry={4.5} fill={shoes} />
      <ellipse cx={9} cy={-3.5} rx={9.5} ry={4.5} fill={shoes} />

      {/* Cou, buste */}
      <rect x={-5} y={-136} width={10} height={14} rx={3} fill={skin} />
      <path
        d="M-22 -110 Q-22 -124 -8 -125 L8 -125 Q22 -124 22 -110 L19 -72 Q18.5 -66 13 -66 L-13 -66 Q-18.5 -66 -19 -72 Z"
        fill={top}
      />
      {dress ? (
        <path d="M-17 -80 L-25 -32 Q0 -27 25 -32 L17 -80 Z" fill={bottom} />
      ) : null}
      {apron ? (
        <g>
          <path d="M-13 -106 L13 -106 L16 -58 Q0 -54 -16 -58 Z" fill={apron} />
          <rect
            x={-7}
            y={-96}
            width={14}
            height={8}
            rx={2}
            fill={top}
            fillOpacity={0.35}
          />
        </g>
      ) : null}
      {hair === "scarf" ? (
        <path
          d="M-19 -152 Q-23 -120 -25 -110 Q0 -102 25 -110 Q23 -120 19 -152 Z"
          fill={hairColor}
        />
      ) : null}

      {/* Tête */}
      {hair === "scarf" ? (
        <g>
          <circle cx={0} cy={-149} r={18.5} fill={hairColor} />
          <ellipse cx={0} cy={-145} rx={11} ry={13} fill={skin} />
        </g>
      ) : (
        <circle cx={0} cy={-148} r={15} fill={skin} />
      )}

      {/* Cheveux devant */}
      {hair === "short" || hair === "bun" || hair === "long" ? (
        <path
          d="M-15.6 -146 Q-16.5 -165 0 -165 Q16.5 -165 15.6 -146 Q11 -157 -1 -156 Q-11 -155 -15.6 -146 Z"
          fill={hairColor}
        />
      ) : null}
      {hair === "bun" ? (
        <circle cx={1} cy={-167} r={7.5} fill={hairColor} />
      ) : null}
      {hair === "curly" ? (
        <g fill={hairColor}>
          <circle cx={-13} cy={-152} r={7} />
          <circle cx={-6.5} cy={-160} r={8} />
          <circle cx={3.5} cy={-162} r={8.5} />
          <circle cx={12} cy={-156} r={7.5} />
          <circle cx={15.5} cy={-147} r={5} />
          <circle cx={-15.5} cy={-144} r={4.5} />
        </g>
      ) : null}
      {hair === "afro" ? (
        <path
          d="M-15 -150 Q-10 -158 0 -157 Q10 -158 15 -150 Q14 -170 0 -171 Q-14 -170 -15 -150 Z"
          fill={hairColor}
        />
      ) : null}
      {hair === "helmet" ? (
        <g>
          <path
            d="M-17.5 -147 Q-17.5 -167 0 -168 Q17.5 -167 17.5 -147 L19.5 -145 Q0 -142 -18.5 -145 Z"
            fill={hairColor}
          />
          <path
            d="M-8 -165 Q-9 -156 -10 -148 M0 -168 L0 -147 M8 -165 Q9 -156 10 -148"
            stroke={brand.tealDeep}
            strokeOpacity={0.35}
            strokeWidth={2.2}
            fill="none"
          />
        </g>
      ) : null}

      {/* Bras, objet tenu, mains */}
      <g stroke={top} strokeWidth={10.5} strokeLinecap="round" fill="none">
        <path d={left.d} />
        {withArm ? <path d={right.d} /> : null}
      </g>
      {pose === "phone" ? (
        <g>
          <rect
            x={2}
            y={-121}
            width={13}
            height={21}
            rx={2.5}
            fill={brand.ink}
          />
          <rect
            x={4}
            y={-119}
            width={9}
            height={15}
            rx={1.2}
            fill={brand.goldLight}
          />
        </g>
      ) : null}
      {holding}
      <circle cx={left.hand[0]} cy={left.hand[1]} r={5.6} fill={skin} />
      {withArm ? (
        <circle cx={right.hand[0]} cy={right.hand[1]} r={5.6} fill={skin} />
      ) : null}
    </g>
  )
}

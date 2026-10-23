import { Gift } from "./gift"
import { brand } from "./palette"

/**
 * Vélo cargo vu de profil, roulant vers la droite, avec son coursier et un
 * cadeau dans la caisse. (x, y) : point au sol sous la roue arrière.
 */
export function CargoBike({
  x,
  y,
  s = 1,
  skin,
  top = brand.teal,
  bottom = brand.ink,
  helmet = brand.goldLight,
  frame = brand.tealDeep,
  box = brand.tealDeep,
  wheel = brand.ink,
  hairColor,
  withGift = true,
  wheels = true,
}: {
  x: number
  y: number
  s?: number
  skin: string
  top?: string
  bottom?: string
  helmet?: string
  frame?: string
  box?: string
  wheel?: string
  hairColor?: string
  withGift?: boolean
  /** Sans les roues, pour les faire tourner à part (dessinées sous le cadre). */
  wheels?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Roues */}
      {wheels ? (
        <g>
          <BikeWheel color={wheel} />
          <BikeWheel front color={wheel} />
        </g>
      ) : null}

      {/* Jambe arrière (dans l'ombre) */}
      <path
        d="M26 -72 L46 -54 L33 -24"
        stroke={bottom}
        strokeOpacity={0.75}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Cadre */}
      <g
        fill="none"
        stroke={frame}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M0 -23 L38 -20 L24 -62 Z" />
        <path d="M27 -58 L70 -52 L72 -14 L38 -20" />
        <path d="M72 -14 L132 -14 L136 -17" />
        <path d="M70 -52 L63 -84" />
        <path d="M130 -36 L136 -17" />
      </g>
      <path
        d="M55 -85 Q63 -88 70 -84"
        stroke={brand.ink}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
      <rect x={14} y={-70} width={20} height={6} rx={3} fill={brand.ink} />
      <circle cx={38} cy={-20} r={5.5} fill={brand.ink} />

      {/* Caisse et cadeau */}
      {withGift ? <Gift x={103} y={-42} w={34} /> : null}
      <path d="M76 -50 L132 -50 L128 -16 L80 -16 Z" fill={box} />
      <path
        d="M76 -50 L132 -50 L131.4 -44 L76.6 -44 Z"
        fill={brand.goldLight}
      />

      {/* Coursier */}
      <path
        d="M26 -74 L50 -58 L42 -22"
        stroke={bottom}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx={46} cy={-19} rx={9} ry={4.2} fill={brand.ink} />
      <path
        d="M26 -76 L42 -112"
        stroke={top}
        strokeWidth={27}
        strokeLinecap="round"
        fill="none"
      />
      <rect x={45} y={-125} width={8} height={10} rx={3} fill={skin} />
      <circle cx={52} cy={-133} r={13.5} fill={skin} />
      {hairColor ? (
        <path
          d="M38 -134 Q34 -122 40 -116 Q43 -126 45 -132 Z"
          fill={hairColor}
        />
      ) : null}
      <path
        d="M37.5 -133 Q38 -151 53 -151 Q67 -150 67.5 -134 L70 -132 Q53 -129 36 -131 Z"
        fill={helmet}
      />
      <path
        d="M44 -149 Q43 -141 43 -133 M53 -151 L53 -131 M61 -148 Q63 -141 63 -133"
        stroke={brand.tealDeep}
        strokeOpacity={0.3}
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M42 -108 Q54 -96 64 -85"
        stroke={top}
        strokeWidth={9.5}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={65} cy={-84} r={4.8} fill={skin} />
    </g>
  )
}

/** Une roue du vélo cargo, dans le repère du vélo (avant ou arrière). */
export function BikeWheel({
  front = false,
  color = brand.ink,
}: {
  front?: boolean
  color?: string
}) {
  const [cx, cy, r, hub] = front ? [136, -17, 15, 2.8] : [0, -23, 20.5, 3.2]
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
      />
      <path
        d={
          front
            ? "M125 -17 H147 M136 -28 V-6"
            : "M-14 -23 H14 M0 -37 V-9 M-10 -33 L10 -13 M10 -33 L-10 -13"
        }
        stroke={brand.cream}
        strokeOpacity={0.45}
        strokeWidth={1.4}
      />
      <circle cx={cx} cy={cy} r={hub} fill={color} />
    </g>
  )
}

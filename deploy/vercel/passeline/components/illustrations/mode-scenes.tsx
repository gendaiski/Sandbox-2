import type { ReactNode } from "react"

import { Tree, House } from "./city"
import { Gift, Sparkle } from "./gift"
import { Grain } from "./layers"
import { brand, dayCity, hair, skin } from "./palette"
import { Person } from "./person"

/** Médaillon : un disque de ciel doré, posé sur une dalle de quai. */
function Medallion({
  label,
  children,
  className,
  overlay,
}: {
  label: string
  children: ReactNode
  className?: string
  /** Calques animés posés sur le médaillon (même viewBox, 560 × 440). */
  overlay?: ReactNode
}) {
  const scene = (
    <svg
      viewBox="0 0 560 440"
      role="img"
      aria-label={label}
      className={overlay ? "block h-full w-full" : className}
    >
      <Grain box={[30, 26, 500, 400]}>
        <circle cx={280} cy={222} r={196} fill="url(#bb-medallion)" />
        <circle
          cx={280}
          cy={222}
          r={191}
          fill="none"
          stroke="#FDF8EA"
          strokeWidth={10}
          strokeOpacity={0.75}
        />
        <ellipse
          cx={280}
          cy={404}
          rx={250}
          ry={22}
          fill="#C9A86C"
          fillOpacity={0.5}
        />
        <path
          d="M40 380 Q40 366 60 364 L500 364 Q520 366 520 380 L520 392 Q520 404 500 404 L60 404 Q40 404 40 392 Z"
          fill="#E6D3A6"
        />
        <rect x={40} y={364} width={480} height={6} rx={3} fill="#F2E5C4" />
        {children}
      </Grain>
    </svg>
  )
  if (!overlay) return scene
  return (
    <div className={`relative ${className ?? ""}`} data-animate="">
      {scene}
      {overlay}
    </div>
  )
}

/**
 * La signature à l'écran, sur son propre calque : elle s'écrit d'un trait
 * quand le médaillon entre dans l'écran.
 */
function Signature() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 560 440"
      className="layer layer-fill sig-layer"
    >
      <Grain box={[96, 112, 130, 50]}>
        <path
          className="sig-draw"
          pathLength={1}
          d="M106 144 c5 -18 14 -24 16 -14 c2 10 -10 18 -6 6 c4 -12 14 -16 16 -6 c1 7 6 7 10 -1 c3 -7 8 -9 10 -3 c2 6 7 6 11 -1 c4 -7 10 -10 13 -4 c2 5 -3 9 -7 4 c5 2 14 1 26 -2 M110 150 h96"
          fill="none"
          stroke={brand.teal}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Grain>
    </svg>
  )
}

/** Direct : remise en main propre sur le pas de la porte, signature à l'écran. */
export function SceneModeDirect({ className }: { className?: string }) {
  return (
    <Medallion
      className={className}
      overlay={<Signature />}
      label="Direct: on her doorstep, a woman takes her gift from a courier; a speech bubble shows her signature on the courier’s screen."
    >
      <House
        x={268}
        y={368}
        w={200}
        h={210}
        floors={2}
        P={dayCity}
        seed={14}
        tint="#F0E3C3"
        balcony={false}
      />
      <path
        d="M368 368 V284 Q368 252 400 252 Q432 252 432 284 V368 Z"
        fill="url(#bb-window-light)"
      />
      <path d="M432 368 V280 L452 274 V372 Z" fill={brand.tealDeep} />
      <rect x={356} y={364} width={90} height={8} rx={2} fill="#D3BD8A" />
      <path d="M454 368 h24 l-4 -26 h-16 Z" fill="#C59940" />
      <g fill="#2B8177">
        <ellipse
          cx={460}
          cy={330}
          rx={8}
          ry={16}
          transform="rotate(-20 460 330)"
        />
        <ellipse
          cx={472}
          cy={326}
          rx={8}
          ry={18}
          transform="rotate(16 472 326)"
        />
      </g>
      <Tree x={104} y={368} r={40} P={dayCity} />

      <Person
        x={226}
        y={372}
        s={1.06}
        skin={skin.deep}
        hair="helmet"
        hairColor={brand.goldLight}
        top={brand.teal}
        bottom={brand.ink}
        pose="give"
      />
      <Person
        x={378}
        y={372}
        s={1.02}
        flip
        skin={skin.light}
        hair="long"
        hairColor={hair.brown}
        top={brand.goldLight}
        bottom="#35585A"
        dress
        legs="#35585A"
        pose="reach"
      />
      <Gift x={290} y={282} w={40} />

      {/* Bulle de la signature à l'écran */}
      <g>
        <rect
          x={86}
          y={86}
          width={150}
          height={74}
          rx={18}
          fill={brand.cream}
        />
        <path d="M200 158 l14 22 l2 -24 Z" fill={brand.cream} />
        <text
          x={106}
          y={114}
          fontSize={15}
          fontWeight={650}
          fill={brand.tealDeep}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Signed on screen
        </text>
      </g>
      <Sparkle cx={262} cy={232} r={9} fill={brand.cream} />
      <Sparkle cx={318} cy={216} r={6} fill={brand.gold} />
    </Medallion>
  )
}

/** Voisin relais : SMS, créneau de passage, puis QR code valable 4 jours. */
export function SceneModeNeighbor({ className }: { className?: string }) {
  const qr = ["11101", "10101", "11011", "00110", "11101"]
  return (
    <Medallion
      className={className}
      label="Neighbor drop: a neighbor holds the gift at his front door; the recipient arrives at the time she picked, with a QR code that’s good for 4 days."
    >
      <House
        x={80}
        y={368}
        w={210}
        h={204}
        floors={2}
        P={dayCity}
        seed={31}
        tint="#EADBB5"
        balcony={false}
      />
      <path
        d="M150 368 V286 Q150 256 180 256 Q210 256 210 286 V368 Z"
        fill="url(#bb-window-light)"
      />
      <path d="M150 368 V282 L130 276 V372 Z" fill="#2A6D66" />
      <rect x={136} y={364} width={90} height={8} rx={2} fill="#D3BD8A" />
      <Tree x={470} y={368} r={34} P={dayCity} kind="tall" />

      <Person
        x={186}
        y={372}
        s={1.02}
        skin={skin.light}
        hair="short"
        hairColor={hair.grey}
        top="#35585A"
        bottom={brand.tealDeep}
        pose="hold"
        holding={<Gift x={0} y={-80} w={34} />}
      />

      {/* Petite route entre le voisin relais et la destinataire */}
      <path
        d="M226 386 Q300 398 372 386"
        stroke={brand.gold}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="0 14"
        fill="none"
      />

      <Person
        x={390}
        y={372}
        s={1.04}
        flip
        skin={skin.brown}
        hair="scarf"
        hairColor={brand.teal}
        top={brand.tealDeep}
        bottom="#244A46"
        pose="phone"
      />

      {/* Carte QR et badge 4 jours */}
      <g>
        <rect
          x={392}
          y={70}
          width={104}
          height={118}
          rx={16}
          fill={brand.cream}
        />
        <path d="M410 186 l-8 22 l24 -22 Z" fill={brand.cream} />
        <g transform="translate(414 88)">
          {qr.map((row, r) =>
            row
              .split("")
              .map((c, k) =>
                c === "1" ? (
                  <rect
                    key={`${r}-${k}`}
                    x={k * 12}
                    y={r * 12}
                    width={12}
                    height={12}
                    fill={brand.ink}
                  />
                ) : null
              )
          )}
        </g>
        <text
          x={444}
          y={176}
          textAnchor="middle"
          fontSize={13}
          fontWeight={650}
          fill={brand.tealDeep}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          QR code
        </text>
        <circle cx={498} cy={74} r={30} fill={brand.goldLight} />
        <text
          x={498}
          y={79}
          textAnchor="middle"
          fontSize={15}
          fontWeight={800}
          fill={brand.ink}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          4 days
        </text>
      </g>

      {/* Créneau de passage */}
      <g>
        <rect
          x={250}
          y={150}
          width={46}
          height={42}
          rx={14}
          fill={brand.teal}
        />
        <path d="M262 190 l-6 16 l18 -14 Z" fill={brand.teal} />
        <circle
          cx={273}
          cy={171}
          r={11}
          fill="none"
          stroke={brand.cream}
          strokeWidth={3}
        />
        <path
          d="M273 164 V171 L278 175"
          fill="none"
          stroke={brand.cream}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </Medallion>
  )
}

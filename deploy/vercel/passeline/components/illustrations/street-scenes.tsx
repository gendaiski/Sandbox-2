import type { ReactNode } from "react"

import { MarkShapes } from "@/components/brand/logo"

import { CargoBike } from "./cargo-bike"
import { Lamp, WheelSilhouette } from "./city"
import { Gift } from "./gift"
import { Grain, Layer, LitWindows, type Box } from "./layers"
import { brand, hair, skin } from "./palette"
import { Person } from "./person"

const font = { fontFamily: "var(--font-bricolage)" }

/* ——— Le crépuscule : silhouettes de toits sur un ciel qui s'éteint ——— */

export function DuskRoofline({ className }: { className?: string }) {
  const lit: [number, number][] = [
    [72, 196],
    [118, 214],
    [262, 186],
    [300, 206],
    [420, 200],
    [560, 176],
    [604, 204],
    [742, 196],
    [930, 188],
    [972, 210],
    [1150, 182],
    [1192, 204],
    [1324, 196],
    [1460, 186],
    [1506, 210],
    [688, 222],
    [1060, 214],
  ]
  return (
    <div
      aria-hidden="true"
      className={`relative ${className ?? ""}`}
      data-animate=""
    >
      <svg
        viewBox="0 0 1600 260"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
        className="block h-full w-full"
      >
        <defs>
          <linearGradient id="bb-dusk-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EBC383" />
            <stop offset="0.7" stopColor="#E2AB6A" />
            <stop offset="1" stopColor="#C98F55" />
          </linearGradient>
        </defs>
        <rect width={1600} height={260} fill="url(#bb-dusk-band)" />
        <Grain box={[0, 54, 1600, 234]}>
          <circle cx={1104} cy={214} r={74} fill="#F3D08A" fillOpacity={0.6} />
          <circle cx={1104} cy={214} r={52} fill="#F6DB9C" />
          <path
            fill={brand.tealDeep}
            d="M0 260 V176 L24 150 H92 L112 176 V168 H150 L172 140 L194 168 V182 H240 L262 156 H330 L348 182 V174 H380 V120 H392 V174 H404 L428 152 H470 L492 176 V160 L530 120 L568 160 V140 L590 96 L612 140 V172 H660 L680 150 H730 L752 176 V186 H790 V150 L812 128 L834 150 V180 H880 L904 154 H982 L1004 180 V168 H1040 L1062 144 H1100 L1120 168 V176 H1150 L1170 150 H1238 L1258 176 H1300 L1322 152 H1380 L1400 176 V166 H1430 L1452 140 H1520 L1542 166 V176 H1600 V260 Z"
          />
          {/* La grande roue des quais, en ombre chinoise */}
          <WheelSilhouette
            cx={1262}
            cy={112}
            r={58}
            ground={176}
            color={brand.tealDeep}
          />
        </Grain>
      </svg>
      {/* Les fenêtres s'allument quand le crépuscule entre dans l'écran. */}
      <LitWindows
        viewBox={[0, 0, 1600, 260]}
        windows={lit}
        band={[172, 70]}
        width={12}
        height={16}
        fill={brand.goldLight}
      />
    </div>
  )
}

/* ——— Les trois devantures, éclairées le soir ——— */

export type Shop = {
  lit?: boolean
  x: number
  roofTop: number
  wall: string
  sign: string
  signText: string
  name: string
  nameSize: number
  /** Décalage de l'enseigne vers la droite (place du symbole, par exemple). */
  nameOffset?: number
  awning: [string, string]
  frame: string
  items: ReactNode
}

/**
 * Une devanture. `part` sert aux scènes en calques : `base` dessine la façade
 * sans la lumière de sa vitrine, `glow` ne dessine que cette lumière (vitrine,
 * objets exposés, porte), pour l'allumer sur son propre calque.
 */
export function Facade({
  shop,
  part = "all",
}: {
  shop: Shop
  part?: "all" | "base" | "glow"
}) {
  const {
    x,
    roofTop,
    wall,
    sign,
    signText,
    name,
    nameSize,
    awning,
    frame,
    items,
    nameOffset = 0,
    lit = true,
  } = shop
  const bands = Array.from({ length: 10 }, (_, i) => i)
  const glow = (
    <g>
      <rect
        x={32}
        y={324}
        width={156}
        height={98}
        rx={2}
        fill="url(#bb-window-light)"
      />
      <g>{items}</g>
      <rect
        x={213}
        y={326}
        width={54}
        height={56}
        rx={2}
        fill="url(#bb-window-light)"
        fillOpacity={0.9}
      />
    </g>
  )
  if (part === "glow") {
    return lit ? <g transform={`translate(${x} 0)`}>{glow}</g> : null
  }
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Toit et lucarnes */}
      <path d={`M2 84 L22 ${roofTop} H278 L298 84 Z`} fill="#1B3634" />
      <rect x={196} y={roofTop - 18} width={16} height={20} fill="#1B3634" />
      {[70, 196].map((dx) => (
        <g key={dx}>
          <path
            d={`M${dx} 80 V${roofTop + 26} L${dx + 17} ${roofTop + 12} L${dx + 34} ${roofTop + 26} V80 Z`}
            fill="#24443F"
          />
          <rect
            x={dx + 9}
            y={roofTop + 30}
            width={16}
            height={36}
            rx={2}
            fill="url(#bb-window-light)"
          />
        </g>
      ))}
      {/* Façade */}
      <rect x={10} y={84} width={280} height={356} fill={wall} />
      <rect
        x={250}
        y={84}
        width={40}
        height={356}
        fill="#000"
        fillOpacity={0.08}
      />
      <rect x={4} y={78} width={292} height={10} fill="#C9B386" />
      {[46, 184].map((dx, i) => (
        <g key={dx}>
          <rect
            x={dx - 10}
            y={108}
            width={10}
            height={86}
            fill={frame}
            fillOpacity={0.85}
          />
          <rect
            x={dx + 60}
            y={108}
            width={10}
            height={86}
            fill={frame}
            fillOpacity={0.85}
          />
          <rect
            x={dx}
            y={108}
            width={60}
            height={86}
            rx={3}
            fill={i === 0 && lit ? "url(#bb-window-light)" : "#2B4B48"}
          />
          <rect
            x={dx + 28}
            y={108}
            width={4}
            height={86}
            fill={wall}
            fillOpacity={0.7}
          />
          <rect
            x={dx - 6}
            y={184}
            width={72}
            height={3}
            fill={brand.ink}
            fillOpacity={0.75}
          />
          {Array.from({ length: 7 }, (_, k) => (
            <rect
              key={k}
              x={dx - 4 + k * 11}
              y={186}
              width={2}
              height={14}
              fill={brand.ink}
              fillOpacity={0.6}
            />
          ))}
          <rect
            x={dx - 6}
            y={198}
            width={72}
            height={3}
            fill={brand.ink}
            fillOpacity={0.75}
          />
        </g>
      ))}
      {/* Enseigne */}
      <rect x={24} y={222} width={252} height={42} rx={4} fill={sign} />
      <text
        x={150 + nameOffset}
        y={251}
        textAnchor="middle"
        fontSize={nameSize}
        fontWeight={800}
        fill={signText}
        letterSpacing={-0.5}
        style={font}
      >
        {name}
      </text>
      {/* Store à rayures */}
      <path d="M18 270 H282 L294 304 H6 Z" fill={awning[0]} />
      {bands.map((i) =>
        i % 2 === 1 ? (
          <path
            key={i}
            d={`M${18 + i * 26.4} 270 H${18 + (i + 1) * 26.4} L${6 + (i + 1) * 28.8} 304 H${6 + i * 28.8} Z`}
            fill={awning[1]}
          />
        ) : null
      )}
      <path
        d={`M6 304 ${Array.from({ length: 10 }, () => "a14.4 12 0 0 0 28.8 0").join(" ")} Z`}
        fill={awning[0]}
      />
      {/* Vitrine et porte */}
      <rect x={26} y={318} width={168} height={110} rx={4} fill={frame} />
      <rect x={32} y={324} width={156} height={98} rx={2} fill="#26453F" />
      <rect x={206} y={318} width={68} height={122} rx={4} fill={frame} />
      <rect x={213} y={326} width={54} height={56} rx={2} fill="#26453F" />
      {lit ? part === "all" ? glow : null : <g>{items}</g>}
      <rect
        x={213}
        y={388}
        width={54}
        height={46}
        rx={2}
        fill="#000"
        fillOpacity={0.18}
      />
      <circle cx={258} cy={392} r={3} fill={brand.goldLight} />
      <rect x={20} y={428} width={180} height={12} fill="#C9B386" />
    </g>
  )
}

const bottleColors = ["#1A7971", "#C59940", "#E7A9A0", "#123F3B", "#B85C6E"]

export const streetShops: Shop[] = [
  {
    x: 0,
    roofTop: 34,
    wall: "#E9D8AE",
    sign: brand.teal,
    signText: brand.cream,
    name: "Ciel de Lin",
    nameSize: 25,
    awning: [brand.teal, brand.cream],
    frame: brand.tealDeep,
    items: (
      <g>
        <rect
          x={40}
          y={378}
          width={140}
          height={4}
          fill={brand.tealDeep}
          fillOpacity={0.6}
        />
        {bottleColors.map((c, i) => (
          <g key={c}>
            <rect
              x={50 + i * 18}
              y={358}
              width={12}
              height={20}
              rx={3}
              fill={c}
            />
            <rect
              x={53 + i * 18}
              y={348}
              width={6}
              height={11}
              rx={1.5}
              fill={brand.ink}
            />
          </g>
        ))}
        <ellipse
          cx={160}
          cy={352}
          rx={16}
          ry={22}
          fill="#F9F1DC"
          stroke={brand.gold}
          strokeWidth={3}
        />
        <rect
          x={44}
          y={398}
          width={136}
          height={4}
          fill={brand.tealDeep}
          fillOpacity={0.6}
        />
        <rect x={56} y={386} width={40} height={12} rx={6} fill="#F9F6ED" />
        <rect x={104} y={384} width={30} height={14} rx={7} fill="#C9E0D8" />
      </g>
    ),
  },
  {
    x: 300,
    roofTop: 14,
    wall: "#F0E2BE",
    sign: brand.cream,
    signText: brand.tealDeep,
    name: "Institut Albâtre",
    nameSize: 22,
    awning: [brand.gold, brand.cream],
    frame: "#5A4A2A",
    items: (
      <g>
        <rect
          x={40}
          y={390}
          width={140}
          height={4}
          fill="#5A4A2A"
          fillOpacity={0.5}
        />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={46}
            y={372 - i * 12}
            width={52}
            height={12}
            rx={6}
            fill={i === 1 ? "#E9DFC8" : "#F9F6ED"}
          />
        ))}
        <rect x={112} y={362} width={22} height={28} rx={5} fill={brand.teal} />
        <rect x={115} y={354} width={16} height={9} rx={2} fill={brand.cream} />
        <rect x={140} y={370} width={26} height={20} rx={6} fill="#F9F6ED" />
        <rect x={144} y={364} width={18} height={7} rx={2} fill={brand.gold} />
        <path d="M166 390 h14 l-3 -14 h-8 Z" fill="#B48A38" />
        <g fill="#2B8177">
          <ellipse
            cx={171}
            cy={364}
            rx={5}
            ry={12}
            transform="rotate(-18 171 364)"
          />
          <ellipse
            cx={178}
            cy={362}
            rx={5}
            ry={13}
            transform="rotate(16 178 362)"
          />
        </g>
        <rect
          x={62}
          y={404}
          width={96}
          height={6}
          rx={3}
          fill="#F9F6ED"
          fillOpacity={0.8}
        />
      </g>
    ),
  },
  {
    x: 600,
    roofTop: 42,
    wall: "#E4D1A2",
    sign: brand.tealDeep,
    signText: brand.goldLight,
    name: "La Maison Passeline",
    nameSize: 19,
    nameOffset: 14,
    awning: [brand.tealDeep, brand.goldLight],
    frame: brand.tealDeep,
    items: (
      <g>
        <Gift x={70} y={418} w={58} />
        <Gift x={126} y={418} w={42} />
        <Gift
          x={98}
          y={374}
          w={36}
          body="#123F3B"
          bodyShade="#0D302D"
          lid="#1C524D"
          lidShade="#123F3B"
        />
        <path d="M156 418 h24 l-4 -30 h-16 Z" fill={brand.cream} />
        <g>
          <circle cx={160} cy={372} r={8} fill="#E7A9A0" />
          <circle cx={172} cy={368} r={8} fill={brand.goldLight} />
          <circle cx={166} cy={358} r={7} fill="#F9F6ED" />
          <path
            d="M163 380 L168 390 M172 376 L168 390"
            stroke="#2B8177"
            strokeWidth={3}
          />
        </g>
      </g>
    ),
  },
]

/**
 * La lumière d'une boutique, sur son propre calque : vitrine, porte et reflet
 * sur le trottoir. Elle s'allume, en vacillant, quand la rue entre dans
 * l'écran (le calque est placé dans le repère de la rue, 900 × 450).
 */
export function ShopLight({ shop, delay }: { shop: Shop; delay: number }) {
  const box: Box = [shop.x, 320, 300, 130]
  return (
    <Layer
      frame={[0, 0, 900, 450]}
      box={box}
      className="shop-light-on"
      style={{ animationDelay: `${delay}s` }}
    >
      <Facade shop={shop} part="glow" />
      <ellipse
        cx={shop.x + 110}
        cy={444}
        rx={110}
        ry={8}
        fill={brand.goldLight}
        fillOpacity={0.3}
      />
    </Layer>
  )
}

export function ShopStreet({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`} data-animate="">
      <svg
        viewBox="0 0 900 450"
        role="img"
        aria-label="Three storefronts lit up at night on a Wrenhaven street: Ciel de Lin, Institut Albâtre and La Maison Passeline, with striped awnings and glowing windows."
        className="block h-full w-full"
      >
        <Grain box={[0, -4, 900, 456]}>
          {streetShops.map((shop) => (
            <Facade key={shop.name} shop={shop} part="base" />
          ))}
          <g transform="translate(627 224) scale(0.3)">
            <MarkShapes />
          </g>
          <rect x={0} y={440} width={900} height={10} fill="#0D2B29" />
        </Grain>
      </svg>
      {streetShops.map((shop, i) => (
        <ShopLight key={shop.name} shop={shop} delay={0.2 + i * 0.55} />
      ))}
    </div>
  )
}

/* ——— Ceux qui font le trajet ——— */

function LampPool({
  children,
  label,
  className,
}: {
  children: ReactNode
  label: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label={label}
      className={className}
    >
      <g filter="url(#bb-grain)">
        <ellipse
          cx={160}
          cy={298}
          rx={150}
          ry={20}
          fill={brand.goldLight}
          fillOpacity={0.16}
        />
        <ellipse
          cx={160}
          cy={298}
          rx={96}
          ry={12}
          fill={brand.goldLight}
          fillOpacity={0.2}
        />
        {children}
      </g>
    </svg>
  )
}

export function CrewCourier({ className }: { className?: string }) {
  return (
    <LampPool
      className={className}
      label="A cargo-bike courier in a gold helmet, a gift in the cargo box."
    >
      <Lamp x={50} y={300} h={196} lit glow={46} color="#0B2626" />
      <CargoBike
        x={96}
        y={300}
        s={1.32}
        skin={skin.tan}
        top={brand.teal}
        bottom="#0B2626"
        frame="#0B2626"
        box="#0B2626"
        wheel="#0B2626"
        hairColor={hair.brown}
      />
    </LampPool>
  )
}

export function CrewNeighbour({ className }: { className?: string }) {
  return (
    <LampPool
      className={className}
      label="A relay neighbor on her lit doorstep, a package in her arms."
    >
      <rect x={110} y={58} width={170} height={242} fill="#2C5550" />
      <path
        d="M128 300 V150 Q128 112 166 112 Q204 112 204 150 V300 Z"
        fill="url(#bb-window-light)"
      />
      <path d="M204 300 V146 L230 138 V306 Z" fill="#0B2626" />
      <rect
        x={236}
        y={92}
        width={30}
        height={42}
        rx={3}
        fill="url(#bb-window-light)"
      />
      <rect x={120} y={296} width={124} height={8} rx={2} fill="#1C4A45" />
      <path d="M58 300 h34 l-5 -36 h-24 Z" fill={brand.gold} />
      <g fill="#2B8177">
        <ellipse
          cx={66}
          cy={250}
          rx={10}
          ry={22}
          transform="rotate(-22 66 250)"
        />
        <ellipse
          cx={84}
          cy={246}
          rx={10}
          ry={24}
          transform="rotate(18 84 246)"
        />
        <ellipse cx={75} cy={240} rx={9} ry={24} />
      </g>
      <Person
        x={166}
        y={302}
        s={1.1}
        skin={skin.deep}
        hair="curly"
        hairColor={hair.black}
        top={brand.goldLight}
        bottom={brand.tealDeep}
        pose="hold"
        holding={<Gift x={0} y={-80} w={36} />}
      />
    </LampPool>
  )
}

export function CrewMerchant({ className }: { className?: string }) {
  return (
    <LampPool
      className={className}
      label="A shop owner behind her counter, under a striped awning, gets a bouquet and a gift ready."
    >
      <rect x={30} y={70} width={260} height={230} fill="#E4D1A2" />
      <rect
        x={46}
        y={120}
        width={228}
        height={120}
        rx={4}
        fill="url(#bb-window-light)"
      />
      <path d="M22 70 H298 L310 104 H10 Z" fill={brand.teal} />
      {Array.from({ length: 10 }, (_, i) =>
        i % 2 === 1 ? (
          <path
            key={i}
            d={`M${22 + i * 27.6} 70 H${22 + (i + 1) * 27.6} L${10 + (i + 1) * 30} 104 H${10 + i * 30} Z`}
            fill={brand.cream}
          />
        ) : null
      )}
      <path
        d={`M10 104 ${Array.from({ length: 10 }, () => "a15 12 0 0 0 30 0").join(" ")} Z`}
        fill={brand.teal}
      />
      <rect x={60} y={150} width={60} height={4} fill="#B48A38" />
      <rect x={196} y={150} width={60} height={4} fill="#B48A38" />
      <Gift x={78} y={150} w={24} />
      <Gift x={104} y={150} w={18} />
      <rect x={206} y={130} width={12} height={20} rx={3} fill={brand.teal} />
      <rect x={222} y={136} width={12} height={14} rx={3} fill="#E7A9A0" />
      <rect
        x={238}
        y={126}
        width={12}
        height={24}
        rx={3}
        fill={brand.tealDeep}
      />
      <Person
        x={160}
        y={300}
        s={1.06}
        skin={skin.light}
        hair="scarf"
        hairColor={brand.gold}
        top={brand.tealDeep}
        apron={brand.cream}
        bottom={brand.tealDeep}
        pose="hold"
        holding={
          <g>
            <circle cx={-8} cy={-104} r={9} fill="#E7A9A0" />
            <circle cx={6} cy={-108} r={9} fill={brand.goldLight} />
            <circle cx={0} cy={-118} r={8} fill={brand.cream} />
            <path
              d="M-6 -96 L0 -84 M6 -98 L0 -84"
              stroke="#2B8177"
              strokeWidth={3}
            />
          </g>
        }
      />
      <rect x={30} y={236} width={260} height={64} fill="#5A4A2A" />
      <rect x={24} y={230} width={272} height={10} rx={2} fill="#7A6438" />
      <Gift x={242} y={232} w={40} />
    </LampPool>
  )
}

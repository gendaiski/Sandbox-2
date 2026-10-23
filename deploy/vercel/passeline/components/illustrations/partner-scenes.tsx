import type { ReactNode } from "react"

import { BowShapes, MarkShapes } from "@/components/brand/logo"

import { CargoBike } from "./cargo-bike"
import { Gift, Sparkle } from "./gift"
import { Grain, Layer, type Box } from "./layers"
import { brand, hair, skin } from "./palette"
import { Person } from "./person"
import { Facade, ShopLight, streetShops, type Shop } from "./street-scenes"

const font = { fontFamily: "var(--font-bricolage)" }

const yourShopItems = (
  <g>
    <Gift x={68} y={420} w={52} />
    <Gift x={118} y={420} w={38} />
    <Gift
      x={94}
      y={378}
      w={30}
      body="#123F3B"
      bodyShade="#0D302D"
      lid="#1C524D"
      lidShade="#123F3B"
    />
    <path d="M150 420 h26 l-4 -30 h-18 Z" fill={brand.cream} />
    <circle cx={156} cy={372} r={8} fill="#E7A9A0" />
    <circle cx={168} cy={368} r={8} fill={brand.goldLight} />
    <circle cx={162} cy={358} r={7} fill="#F9F6ED" />
    <path
      d="M159 380 L163 390 M168 376 L163 390"
      stroke="#2B8177"
      strokeWidth={3}
    />
    <rect
      x={40}
      y={340}
      width={60}
      height={4}
      fill={brand.tealDeep}
      fillOpacity={0.45}
    />
    <rect x={46} y={326} width={12} height={14} rx={3} fill={brand.teal} />
    <rect x={62} y={330} width={12} height={10} rx={3} fill={brand.cream} />
    <rect x={78} y={324} width={12} height={16} rx={3} fill={brand.tealDeep} />
  </g>
)

/**
 * La vitrine qui s'allume : une boutique de Wrenhaven rejoint Passeline, sa
 * vitrine s'éclaire et le symbole apparaît sur la porte. Un coursier attend
 * devant.
 */
const HERO_VIEW: Box = [0, 0, 600, 600]
/** Le symbole sur la porte : un disque de rayon 19, en (240, 354) dans la façade. */
const HERO_BADGE: Box = [176 + 240 * 1.27 - 26, 6 + 354 * 1.27 - 26, 52, 52]

export function PartnerShopHero({ className }: { className?: string }) {
  const shop: Shop = {
    x: 0,
    roofTop: 30,
    wall: "#EBDDB6",
    sign: brand.tealDeep,
    signText: brand.goldLight,
    name: "Your shop",
    nameSize: 24,
    awning: [brand.gold, brand.cream],
    frame: brand.tealDeep,
    items: yourShopItems,
    lit: true,
  }
  const onFacade = "translate(176 6) scale(1.27)"
  // En calques : la façade, puis la lumière (vitrine et trottoir), le
  // symbole sur la porte, et devant, le coursier et les plantes.
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg
        viewBox="0 0 600 600"
        role="img"
        aria-label="A Wrenhaven shop joins Passeline: its window lights up, the gold mark appears on the door, and a cargo-bike courier waits out front."
        className="block h-full w-full"
      >
        <Grain box={HERO_VIEW}>
          <g transform={onFacade}>
            <Facade shop={shop} part="base" />
          </g>
          <rect x={0} y={564} width={600} height={36} fill="#D9C79A" />
          <rect x={0} y={564} width={600} height={6} fill="#C9B386" />
        </Grain>
      </svg>
      <Layer
        frame={HERO_VIEW}
        box={HERO_VIEW}
        grainBox={[160, 412, 360, 176]}
        className="shop-glow"
      >
        <g transform={onFacade}>
          <Facade shop={shop} part="glow" />
        </g>
        <ellipse
          cx={316}
          cy={572}
          rx={150}
          ry={12}
          fill={brand.goldLight}
          fillOpacity={0.55}
        />
      </Layer>
      <Layer frame={HERO_VIEW} box={HERO_BADGE} className="shop-badge">
        <g transform={onFacade}>
          <circle cx={240} cy={354} r={19} fill={brand.cream} />
          <g transform="translate(219.2 333.2) scale(0.33)">
            <MarkShapes />
          </g>
        </g>
      </Layer>
      <Layer frame={HERO_VIEW} box={HERO_VIEW} grainBox={[0, 285, 600, 315]}>
        <path d="M542 564 h34 l-5 -40 h-24 Z" fill={brand.gold} />
        <g fill="#2B8177">
          <ellipse
            cx={552}
            cy={510}
            rx={10}
            ry={22}
            transform="rotate(-20 552 510)"
          />
          <ellipse
            cx={568}
            cy={506}
            rx={10}
            ry={24}
            transform="rotate(18 568 506)"
          />
          <ellipse cx={560} cy={500} rx={9} ry={24} />
        </g>
        <CargoBike
          x={26}
          y={590}
          s={1.16}
          skin={skin.brown}
          top={brand.teal}
          hairColor={hair.black}
        />
        <Sparkle cx={170} cy={300} r={10} fill={brand.gold} />
        <Sparkle cx={130} cy={360} r={6} fill={brand.goldLight} />
      </Layer>
    </div>
  )
}

/** La rue des partenaires : Ciel de Lin et Institut Albâtre allumées, une vitrine attend. */
export function PartnerStreet({ className }: { className?: string }) {
  const waiting: Shop = {
    x: 600,
    roofTop: 40,
    wall: "#DCCDA6",
    sign: brand.cream,
    signText: brand.tealDeep,
    name: "Your name here",
    nameSize: 21,
    awning: ["#46676A", "#DCD3C2"],
    frame: "#35585A",
    lit: false,
    items: (
      <g>
        <rect
          x={64}
          y={336}
          width={92}
          height={70}
          rx={4}
          fill="#F3E6C6"
          transform="rotate(-3 110 371)"
        />
        <g transform="translate(92 344) scale(0.36)">
          <MarkShapes />
        </g>
        <text
          x={110}
          y={392}
          textAnchor="middle"
          fontSize={13}
          fontWeight={800}
          fill={brand.tealDeep}
          style={font}
          transform="rotate(-3 110 371)"
        >
          Coming soon?
        </text>
      </g>
    ),
  }
  return (
    <div className={`relative ${className ?? ""}`} data-animate="">
      <svg
        viewBox="0 0 900 450"
        role="img"
        aria-label="A Wrenhaven street at night: the windows of Ciel de Lin and Institut Albâtre are lit; next door, a dark storefront waits for a new shop."
        className="block h-full w-full"
      >
        <Grain box={[0, -4, 900, 456]}>
          <Facade shop={streetShops[0]} part="base" />
          <Facade shop={{ ...streetShops[1], x: 300 }} part="base" />
          <rect x={0} y={440} width={900} height={10} fill="#0D2B29" />
        </Grain>
        {/* La vitrine qui attend a son propre grain : son carton penché ne
            doit pas couper le dessin de la rue en plusieurs calques. */}
        <Grain box={[600, -4, 300, 456]}>
          <Facade shop={waiting} />
        </Grain>
      </svg>
      <ShopLight shop={streetShops[0]} delay={0.2} />
      <ShopLight shop={{ ...streetShops[1], x: 300 }} delay={0.75} />
    </div>
  )
}

/* ——— Les huit outils, en petites vignettes ——— */

export type FeatureKind =
  | "catalog"
  | "appointments"
  | "delivery"
  | "payouts"
  | "loyalty"
  | "gift-cards"
  | "sms"
  | "pro"

const vignetteSky: Record<FeatureKind, string> = {
  catalog: "#D6EAE4",
  appointments: "#F4E4BD",
  delivery: "#CFE6E0",
  payouts: "#F1DDB0",
  loyalty: "#DCEDE6",
  "gift-cards": "#F3E1B6",
  sms: "#D3E8E2",
  pro: "#F2E2BC",
}

function Phone({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  children?: ReactNode
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={brand.ink} />
      <rect
        x={x + 4}
        y={y + 5}
        width={w - 8}
        height={h - 10}
        rx={6}
        fill={brand.cream}
      />
      {children}
    </g>
  )
}

function FeatureArt({ kind }: { kind: FeatureKind }) {
  switch (kind) {
    case "catalog":
      return (
        <Phone x={54} y={28} w={52} h={100}>
          <g transform="translate(66 36) scale(0.28)">
            <MarkShapes />
          </g>
          <rect x={62} y={62} width={17} height={20} rx={3} fill={brand.teal} />
          <rect
            x={81}
            y={62}
            width={17}
            height={20}
            rx={3}
            fill={brand.goldLight}
          />
          <rect x={62} y={86} width={17} height={20} rx={3} fill="#E7A9A0" />
          <rect x={81} y={86} width={17} height={20} rx={3} fill="#C9E0D8" />
          <rect
            x={62}
            y={110}
            width={36}
            height={8}
            rx={4}
            fill={brand.tealDeep}
          />
        </Phone>
      )
    case "appointments":
      return (
        <g>
          <rect
            x={36}
            y={42}
            width={88}
            height={82}
            rx={8}
            fill={brand.cream}
          />
          <rect
            x={36}
            y={42}
            width={88}
            height={22}
            rx={8}
            fill={brand.tealDeep}
          />
          <rect x={36} y={56} width={88} height={8} fill={brand.tealDeep} />
          <rect x={54} y={34} width={6} height={16} rx={3} fill={brand.ink} />
          <rect x={100} y={34} width={6} height={16} rx={3} fill={brand.ink} />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={50 + (i % 4) * 20}
              cy={78 + Math.floor(i / 4) * 15}
              r={3.4}
              fill={brand.ink}
              fillOpacity={0.3}
            />
          ))}
          <circle
            cx={90}
            cy={93}
            r={9}
            fill="none"
            stroke={brand.gold}
            strokeWidth={3.5}
          />
          <circle cx={90} cy={93} r={3.4} fill={brand.ink} />
        </g>
      )
    case "delivery":
      return (
        <CargoBike x={34} y={118} s={0.56} skin={skin.deep} top={brand.teal} />
      )
    case "payouts":
      return (
        <g>
          <g fill={brand.gold}>
            <ellipse cx={104} cy={114} rx={20} ry={7} />
            <rect x={84} y={98} width={40} height={16} />
            <ellipse cx={104} cy={98} rx={20} ry={7} fill={brand.goldLight} />
          </g>
          <g transform="rotate(-10 72 80)">
            <rect
              x={34}
              y={56}
              width={84}
              height={54}
              rx={8}
              fill={brand.teal}
            />
            <rect x={34} y={68} width={84} height={9} fill={brand.tealDeep} />
            <rect
              x={44}
              y={86}
              width={16}
              height={12}
              rx={2}
              fill={brand.goldLight}
            />
            <rect
              x={68}
              y={92}
              width={36}
              height={5}
              rx={2.5}
              fill={brand.cream}
              fillOpacity={0.7}
            />
          </g>
        </g>
      )
    case "loyalty":
      return (
        <g>
          <rect
            x={30}
            y={50}
            width={100}
            height={62}
            rx={8}
            fill={brand.cream}
          />
          <rect
            x={30}
            y={50}
            width={100}
            height={14}
            rx={7}
            fill={brand.gold}
          />
          <rect x={30} y={57} width={100} height={7} fill={brand.gold} />
          {Array.from({ length: 6 }, (_, i) => (
            <circle
              key={i}
              cx={48 + (i % 3) * 32}
              cy={78 + Math.floor(i / 3) * 20}
              r={7}
              fill={i < 4 ? brand.teal : "none"}
              stroke={brand.teal}
              strokeWidth={2.4}
            />
          ))}
        </g>
      )
    case "gift-cards":
      return (
        <g>
          <g transform="rotate(8 80 82)">
            <rect
              x={30}
              y={52}
              width={100}
              height={62}
              rx={8}
              fill={brand.tealDeep}
            />
            <rect x={30} y={76} width={100} height={9} fill={brand.gold} />
            <rect x={62} y={52} width={9} height={62} fill={brand.gold} />
            <g transform="translate(46 54) scale(0.42)">
              <BowShapes />
            </g>
          </g>
          <Sparkle cx={124} cy={44} r={7} fill={brand.cream} />
        </g>
      )
    case "sms":
      return (
        <g>
          <Phone x={30} y={40} w={44} h={84} />
          <rect
            x={64}
            y={44}
            width={66}
            height={30}
            rx={12}
            fill={brand.teal}
          />
          <path d="M72 72 l-8 10 l16 -8 Z" fill={brand.teal} />
          <rect x={72} y={53} width={44} height={4} rx={2} fill={brand.cream} />
          <rect
            x={72}
            y={62}
            width={30}
            height={4}
            rx={2}
            fill={brand.cream}
            fillOpacity={0.7}
          />
          <rect
            x={80}
            y={84}
            width={50}
            height={26}
            rx={11}
            fill={brand.goldLight}
          />
          <rect
            x={88}
            y={93}
            width={34}
            height={4}
            rx={2}
            fill={brand.ink}
            fillOpacity={0.6}
          />
        </g>
      )
    case "pro":
      return (
        <g>
          <rect x={30} y={46} width={100} height={64} rx={6} fill={brand.ink} />
          <rect
            x={35}
            y={51}
            width={90}
            height={54}
            rx={3}
            fill={brand.cream}
          />
          <path d="M22 110 h116 l-8 10 h-100 Z" fill="#35585A" />
          <rect x={46} y={84} width={10} height={14} rx={2} fill={brand.teal} />
          <rect x={62} y={74} width={10} height={24} rx={2} fill={brand.gold} />
          <rect x={78} y={66} width={10} height={32} rx={2} fill={brand.teal} />
          <rect
            x={94}
            y={58}
            width={10}
            height={40}
            rx={2}
            fill={brand.goldLight}
          />
        </g>
      )
  }
}

export function FeatureVignette({
  kind,
  className,
}: {
  kind: FeatureKind
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g filter="url(#bb-grain)">
        <circle cx={80} cy={78} r={74} fill={vignetteSky[kind]} />
        <ellipse
          cx={80}
          cy={128}
          rx={56}
          ry={7}
          fill={brand.ink}
          fillOpacity={0.08}
        />
        <FeatureArt kind={kind} />
      </g>
    </svg>
  )
}

/** Une commerçante devant sa vitrine allumée, un cadeau dans les mains. */
export function PartnerWelcome({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 260"
      role="img"
      aria-label="A shop owner stands in front of her lit window, holding a Passeline gift."
      className={className}
    >
      <g filter="url(#bb-grain)">
        <circle cx={160} cy={130} r={118} fill="url(#bb-medallion)" />
        <rect x={70} y={60} width={180} height={170} rx={6} fill="#EBDDB6" />
        <rect
          x={86}
          y={92}
          width={148}
          height={90}
          rx={4}
          fill="url(#bb-window-light)"
        />
        <path d="M62 60 H258 L268 86 H52 Z" fill={brand.teal} />
        {Array.from({ length: 7 }, (_, i) =>
          i % 2 === 1 ? (
            <path
              key={i}
              d={`M${62 + i * 28} 60 H${62 + (i + 1) * 28} L${52 + (i + 1) * 30.9} 86 H${52 + i * 30.9} Z`}
              fill={brand.cream}
            />
          ) : null
        )}
        <Person
          x={160}
          y={232}
          s={0.86}
          skin={skin.tan}
          hair="bun"
          hairColor={hair.brown}
          top={brand.tealDeep}
          apron={brand.cream}
          pose="hold"
          holding={<Gift x={0} y={-80} w={34} />}
        />
        <rect x={40} y={228} width={240} height={8} rx={4} fill="#C9B386" />
        <Sparkle cx={250} cy={70} r={9} fill={brand.gold} />
      </g>
    </svg>
  )
}

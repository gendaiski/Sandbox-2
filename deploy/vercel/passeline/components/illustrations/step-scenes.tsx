import type { ReactNode } from "react"

import { MarkShapes } from "@/components/brand/logo"

import { BikeWheel, CargoBike } from "./cargo-bike"
import { House, Lamp, Tree } from "./city"
import { Gift, Sparkle } from "./gift"
import { Grain, Layer, place, type Box } from "./layers"
import { brand, dayCity, hair, skin } from "./palette"
import { Person } from "./person"

const ARCH = "M20 410 V160 Q20 16 260 16 Q500 16 500 160 V410 Z"

/** Une fenêtre de tuffeau ouverte sur une scène : cadre cintré et appui. */
function ArchWindow({
  id,
  label,
  sky,
  children,
  className,
  overlay,
}: {
  id: string
  label: string
  sky: string
  children: ReactNode
  className?: string
  /** Calques animés posés sur la scène (dans le repère 0 0 520 440). */
  overlay?: ReactNode
}) {
  const scene = (
    <svg
      viewBox="0 0 520 440"
      role="img"
      aria-label={label}
      className={overlay ? "block h-full w-full" : className}
    >
      <defs>
        <clipPath id={`arch-${id}`}>
          <path d={ARCH} />
        </clipPath>
      </defs>
      <Grain box={[0, 0, 520, 440]}>
        <g clipPath={`url(#arch-${id})`}>
          <rect x={0} y={0} width={520} height={440} fill={sky} />
          {children}
        </g>
        <path d={ARCH} fill="none" stroke="#E6D6AC" strokeWidth={16} />
        <path
          d={ARCH}
          fill="none"
          stroke="#CDB98B"
          strokeWidth={2}
          transform="translate(0 0)"
          strokeOpacity={0.5}
        />
        <rect x={4} y={404} width={512} height={24} rx={5} fill="#E6D6AC" />
        <rect x={4} y={420} width={512} height={8} rx={3} fill="#CDB98B" />
      </Grain>
    </svg>
  )
  if (!overlay) return scene
  return (
    <div className={`arch-scene relative ${className ?? ""}`} data-animate="">
      {scene}
      {overlay}
    </div>
  )
}

/* 1. Vous préparez le départ (le matin, à la maison) */
export function SceneChoose({ className }: { className?: string }) {
  return (
    <ArchWindow
      id="choose"
      className={className}
      sky="#E6F0E9"
      label="In the morning, someone ties a gold bow on a gift sitting on the table; next to it, the app is open on a phone."
    >
      {/* Fenêtre du fond sur les toits */}
      <rect x={52} y={70} width={170} height={200} rx={10} fill="#F9F6ED" />
      <rect
        x={62}
        y={80}
        width={150}
        height={180}
        rx={6}
        fill="url(#bb-morning)"
      />
      <circle cx={170} cy={128} r={22} fill="#F7E3A8" />
      <path d="M62 214 L96 190 L130 214 Z" fill={dayCity.slate} />
      <rect x={70} y={214} width={56} height={46} fill={dayCity.wall} />
      <path d="M120 226 L166 200 L212 226 Z" fill={dayCity.slateLight} />
      <rect x={126} y={226} width={86} height={34} fill="#F3E9D2" />
      <rect x={80} y={224} width={8} height={12} fill={dayCity.window} />
      <rect x={104} y={224} width={8} height={12} fill={dayCity.window} />
      <rect x={140} y={234} width={8} height={12} fill={dayCity.window} />
      <rect x={164} y={234} width={8} height={12} fill={dayCity.window} />
      <rect x={134} y={80} width={6} height={180} fill="#F9F6ED" />
      <rect x={62} y={166} width={150} height={6} fill="#F9F6ED" />

      {/* Étagère */}
      <rect x={290} y={138} width={200} height={8} rx={2} fill={brand.gold} />
      <Gift x={326} y={138} w={36} />
      <rect
        x={364}
        y={104}
        width={14}
        height={34}
        rx={2}
        fill={brand.tealDeep}
      />
      <rect
        x={380}
        y={110}
        width={12}
        height={28}
        rx={2}
        fill={brand.goldLight}
      />
      <rect x={394} y={100} width={10} height={38} rx={2} fill="#3E8C82" />
      <path d="M432 138 h30 l-4 -26 h-22 Z" fill="#C9B07A" />
      <g fill="#2B8177">
        <ellipse
          cx={440}
          cy={100}
          rx={8}
          ry={16}
          transform="rotate(-24 440 100)"
        />
        <ellipse
          cx={456}
          cy={96}
          rx={8}
          ry={18}
          transform="rotate(18 456 96)"
        />
        <ellipse cx={448} cy={92} rx={7} ry={18} />
      </g>

      {/* La personne qui prépare le cadeau */}
      <Person
        x={196}
        y={452}
        s={1.3}
        skin={skin.light}
        hair="curly"
        hairColor={hair.auburn}
        top={brand.teal}
        bottom={brand.tealDeep}
        pose="reach"
      />

      {/* Table */}
      <rect x={0} y={348} width={520} height={18} fill="#D4A955" />
      <rect x={0} y={366} width={520} height={80} fill="#B88D3C" />
      <rect x={0} y={366} width={520} height={6} fill="#A47B30" />

      <Gift x={300} y={350} w={90} />

      {/* Téléphone sur son support, l'app ouverte */}
      <g transform="translate(0 26)">
        <path
          d="M404 324 l14 -18 h28 l14 18 Z"
          fill={brand.ink}
          fillOpacity={0.8}
        />
        <rect
          x={398}
          y={196}
          width={68}
          height={120}
          rx={10}
          fill={brand.ink}
        />
        <rect
          x={403}
          y={202}
          width={58}
          height={108}
          rx={7}
          fill={brand.cream}
        />
        <g transform="translate(414 206) scale(0.36)">
          <MarkShapes />
        </g>
        <rect x={409} y={238} width={22} height={28} rx={3} fill={brand.teal} />
        <rect
          x={433}
          y={238}
          width={22}
          height={28}
          rx={3}
          fill={brand.goldLight}
        />
        <rect x={409} y={270} width={22} height={28} rx={3} fill="#9DC6BE" />
        <rect x={433} y={270} width={22} height={28} rx={3} fill="#E9D9B2" />
      </g>
    </ArchWindow>
  )
}

/* Le vélo cargo de la scène 2, sur ses calques : il entre dans la fenêtre
 * (ses roues tournent) quand la scène arrive à l'écran. La fenêtre `ride`
 * s'arrête au bord intérieur du cadre et à l'appui. */
const ARCH_VIEW: Box = [0, 0, 520, 440]
const BIKE_WINDOW: Box = [28, 160, 464, 244]
const BIKE_RIDE: Box = [10, 188, 350, 236]
const BIKE = { x: 120, y: 420, s: 1.5 }
const REAR_WHEEL: Box = [85, 350.5, 70, 70]
const FRONT_WHEEL: Box = [297, 367.5, 54, 54]
const SPEED_LINES: Box = [10, 354, 64, 48]

function BikeArrives() {
  const onBike = `translate(${BIKE.x} ${BIKE.y}) scale(${BIKE.s})`
  return (
    <div className="layer bike-window" style={place(ARCH_VIEW, BIKE_WINDOW)}>
      <div className="layer bike-roll" style={place(BIKE_WINDOW, BIKE_RIDE)}>
        <Layer frame={BIKE_RIDE} box={REAR_WHEEL} className="bike-wheel">
          <g transform={onBike}>
            <BikeWheel />
          </g>
        </Layer>
        <Layer
          frame={BIKE_RIDE}
          box={FRONT_WHEEL}
          className="bike-wheel bike-wheel-front"
        >
          <g transform={onBike}>
            <BikeWheel front />
          </g>
        </Layer>
        <Layer frame={BIKE_RIDE} box={BIKE_RIDE}>
          <CargoBike
            {...BIKE}
            skin={skin.deep}
            top={brand.teal}
            bottom={brand.ink}
            hairColor={hair.black}
            wheels={false}
          />
        </Layer>
        <Layer frame={BIKE_RIDE} box={SPEED_LINES} className="bike-lines">
          <path
            d="M30 360 h40 M14 378 h56 M40 396 h28"
            stroke={brand.tealDeep}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Layer>
      </div>
    </div>
  )
}

/* 2. Un coursier ou un voisin relais (en pleine journée, dans la rue) */
export function SceneCarry({ className }: { className?: string }) {
  return (
    <ArchWindow
      id="carry"
      className={className}
      sky="url(#bb-noon)"
      overlay={<BikeArrives />}
      label="At midday, a cargo-bike courier rides down a street of limestone storefronts with a gift in the box; at her door, a relay neighbor holds a package."
    >
      <circle cx={392} cy={70} r={26} fill="#F7E3A8" />
      <House
        x={-20}
        y={330}
        w={140}
        h={196}
        floors={3}
        P={dayCity}
        seed={3}
        tint="#F2E7CE"
      />
      <House
        x={120}
        y={330}
        w={124}
        h={226}
        floors={4}
        P={dayCity}
        seed={5}
        tint="#E7D6AE"
      />
      <House x={244} y={330} w={136} h={188} floors={3} P={dayCity} seed={8} />
      <House
        x={380}
        y={330}
        w={150}
        h={214}
        floors={3}
        P={dayCity}
        seed={2}
        tint="#F4EAD3"
        balcony={false}
      />
      {/* Porte de l'hôte */}
      <path
        d="M398 330 V236 Q398 210 424 210 Q450 210 450 236 V330 Z"
        fill={brand.tealDeep}
      />
      <path
        d="M406 330 V238 Q406 220 424 220 Q442 220 442 238 V330 Z"
        fill="#1F5A54"
      />
      <circle cx={436} cy={282} r={3} fill={brand.goldLight} />
      <rect x={386} y={326} width={78} height={8} rx={2} fill="#D6C394" />
      <Tree x={46} y={346} r={34} P={dayCity} />

      {/* Trottoir et chaussée, avec la route en pointillés */}
      <rect x={0} y={334} width={520} height={20} fill="#DDD0AE" />
      <rect x={0} y={354} width={520} height={90} fill="#CFC4A6" />
      <path
        d="M0 400 H520"
        stroke={brand.gold}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="0 18"
      />

      <Person
        x={466}
        y={340}
        s={0.96}
        skin={skin.light}
        hair="bun"
        hairColor={hair.grey}
        top={brand.goldLight}
        bottom="#35585A"
        pose="hold"
        flip
        holding={<Gift x={0} y={-80} w={30} />}
      />
    </ArchWindow>
  )
}

/* 3. La signature ou le QR code (fin d'après-midi, lumière dorée) */
export function SceneCode({ className }: { className?: string }) {
  const qr = [
    "1110111",
    "1010101",
    "1110111",
    "0001000",
    "1101011",
    "0110110",
    "1011101",
  ]
  return (
    <ArchWindow
      id="code"
      className={className}
      sky="url(#bb-late)"
      label="Late in the afternoon, a hand holds a phone showing the chosen pickup time, the relay neighbor keeping the package and a QR code that’s good for 4 days."
    >
      {/* Rue dorée en arrière-plan */}
      <circle cx={92} cy={150} r={34} fill="#F8E2A4" />
      <rect x={0} y={250} width={140} height={190} fill="#EBD3A0" />
      <rect x={110} y={250} width={30} height={190} fill="#D9BB80" />
      <path d="M-6 250 L20 214 H120 L146 250 Z" fill="#3F6062" />
      <rect x={24} y={276} width={22} height={40} rx={2} fill="#3F6062" />
      <rect x={76} y={276} width={22} height={40} rx={2} fill="#F3D58E" />
      <rect x={24} y={340} width={22} height={40} rx={2} fill="#F3D58E" />
      <rect x={396} y={210} width={140} height={230} fill="#E6CC94" />
      <path d="M388 210 L414 170 H520 L540 210 Z" fill="#3F6062" />
      <path
        d="M430 440 V330 Q430 300 460 300 Q490 300 490 330 V440 Z"
        fill="#244A46"
      />
      <rect x={414} y={232} width={22} height={40} rx={2} fill="#F3D58E" />
      <rect x={462} y={232} width={22} height={40} rx={2} fill="#3F6062" />
      <Lamp x={372} y={440} h={200} color={brand.tealDeep} />

      <g transform="translate(30 4) scale(0.88)">
        {/* Main et téléphone */}
        <path d="M120 450 L170 372 L270 398 L250 450 Z" fill={brand.teal} />
        <path
          d="M150 400 Q160 360 210 352 L330 356 Q352 372 340 410 Q300 440 220 440 Q170 436 150 400 Z"
          fill={skin.tan}
        />
        <rect
          x={160}
          y={64}
          width={200}
          height={352}
          rx={30}
          fill={brand.ink}
        />
        <rect
          x={172}
          y={78}
          width={176}
          height={324}
          rx={20}
          fill={brand.cream}
        />
        <rect x={232} y={86} width={56} height={8} rx={4} fill={brand.ink} />

        <rect
          x={186}
          y={110}
          width={148}
          height={78}
          rx={16}
          fill={brand.teal}
        />
        <path d="M198 186 l-8 14 l20 -12 Z" fill={brand.teal} />
        <text
          x={202}
          y={136}
          fill={brand.cream}
          fontSize={13}
          fontWeight={600}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Your pickup time
        </text>
        <text
          x={202}
          y={171}
          fill={brand.goldLight}
          fontSize={28}
          fontWeight={800}
          letterSpacing={1}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          6:30 PM
        </text>

        <rect
          x={186}
          y={206}
          width={148}
          height={72}
          rx={16}
          fill={brand.goldLight}
        />
        <path d="M322 276 l8 14 l-20 -12 Z" fill={brand.goldLight} />
        <text
          x={200}
          y={230}
          fill={brand.ink}
          fontSize={13}
          fontWeight={700}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Relay neighbor
        </text>
        <text
          x={200}
          y={250}
          fill={brand.ink}
          fontSize={13}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Lea, at 12B Elm St
        </text>
        <text
          x={200}
          y={267}
          fill={brand.ink}
          fontSize={13}
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          QR good for 4 days
        </text>

        <g transform="translate(222 300)">
          <rect x={-8} y={-8} width={86} height={86} rx={8} fill="#FFFFFF" />
          {qr.map((row, r) =>
            row
              .split("")
              .map((c, k) =>
                c === "1" ? (
                  <rect
                    key={`${r}-${k}`}
                    x={k * 10}
                    y={r * 10}
                    width={10}
                    height={10}
                    fill={brand.ink}
                  />
                ) : null
              )
          )}
        </g>

        {/* Pouce et doigts */}
        <path
          d="M176 392 Q170 356 192 330"
          stroke={skin.tan}
          strokeWidth={28}
          strokeLinecap="round"
          fill="none"
        />
        <g fill={skin.tan}>
          <rect x={340} y={238} width={36} height={24} rx={12} />
          <rect x={342} y={266} width={38} height={24} rx={12} />
          <rect x={340} y={294} width={36} height={24} rx={12} />
          <rect x={334} y={322} width={32} height={22} rx={11} />
        </g>
      </g>
      <Sparkle cx={402} cy={104} r={12} fill={brand.cream} />
      <Sparkle cx={120} cy={176} r={9} fill={brand.cream} />
    </ArchWindow>
  )
}

/* 4. Le nœud se défait (à la tombée du jour, sur le pas de la porte) */
export function SceneUnwrap({ className }: { className?: string }) {
  return (
    <ArchWindow
      id="unwrap"
      className={className}
      sky="url(#bb-dusk)"
      label="At dusk, on a lit doorstep, someone undoes the bow on a gift while the courier waves goodbye."
    >
      {[
        [70, 60, 2],
        [150, 40, 1.6],
        [300, 50, 2.2],
        [420, 80, 1.6],
        [250, 96, 1.4],
        [460, 130, 1.4],
      ].map(([x, y, r]) => (
        <circle
          key={`${x}`}
          cx={x}
          cy={y}
          r={r}
          fill={brand.cream}
          fillOpacity={0.8}
        />
      ))}
      {/* Silhouettes des toits */}
      <path
        d="M0 300 V214 L30 190 H96 L120 214 V240 H150 V176 L176 150 L202 176 V250 H230 V300 Z"
        fill="#1D4E48"
      />
      {[
        [14, 222],
        [60, 222],
        [160, 190],
        [160, 216],
        [186, 216],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={12}
          height={16}
          rx={1.5}
          fill={brand.goldLight}
          fillOpacity={0.9}
        />
      ))}

      {/* Maison du destinataire, porte ouverte */}
      <rect x={236} y={120} width={300} height={300} fill="#D9BE86" />
      <rect x={236} y={120} width={300} height={10} fill="#C4A66C" />
      <path d="M226 120 L256 74 H520 L546 120 Z" fill="#244A46" />
      <rect
        x={270}
        y={156}
        width={30}
        height={46}
        rx={3}
        fill="url(#bb-window-light)"
      />
      <rect x={470} y={156} width={30} height={46} rx={3} fill="#3B5F5B" />
      <circle cx={386} cy={330} r={150} fill="url(#bb-glow-soft)" />
      <path
        d="M336 400 V250 Q336 214 372 214 Q408 214 408 250 V400 Z"
        fill="url(#bb-window-light)"
      />
      <path d="M408 400 V246 L440 236 V408 Z" fill={brand.tealDeep} />
      <rect x={316} y={398} width={136} height={12} rx={2} fill="#C4A66C" />

      <Lamp x={46} y={420} h={210} lit color={brand.tealDeep} />

      {/* Sol, flaque de lumière */}
      <rect x={0} y={400} width={520} height={40} fill="#C9A970" />
      <ellipse
        cx={372}
        cy={414}
        rx={120}
        ry={16}
        fill="#F2D394"
        fillOpacity={0.7}
      />

      <Person
        x={150}
        y={420}
        s={1.12}
        skin={skin.brown}
        hair="helmet"
        hairColor={brand.goldLight}
        top="#2A6D66"
        bottom={brand.ink}
        pose="wave"
        flip
      />
      <Person
        x={350}
        y={414}
        s={1.18}
        skin={skin.tan}
        hair="afro"
        hairColor={hair.black}
        top={brand.teal}
        bottom="#244A46"
        pose="hold"
        holding={<Gift x={0} y={-82} w={42} open sparkles />}
      />
    </ArchWindow>
  )
}

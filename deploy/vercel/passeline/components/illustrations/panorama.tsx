import { Fragment, type ReactElement } from "react"

import {
  Bench,
  Bollard,
  House,
  Lamp,
  TownHall,
  Tram,
  Tree,
  WheelBack,
  WheelBulbs,
  WheelCabin,
  WheelFront,
  WheelRotor,
  rand,
  wheelGeometry,
  type LightSink,
} from "./city"
import { Gift, Sparkle } from "./gift"
import { Layer, originIn, place, type Box } from "./layers"
import {
  brand,
  dayCity,
  hair,
  nightCity,
  skin,
  type CityPalette,
} from "./palette"
import { Person } from "./person"

const NORTH = 600 // niveau de la rue sur la rive nord
const NEAR = 796 // sol du quai au premier plan

const housesWest: [number, number, number, number][] = [
  // x, largeur, hauteur, étages
  [-12, 96, 118, 3],
  [84, 86, 138, 4],
  [170, 100, 112, 3],
  [270, 82, 130, 4],
  [352, 92, 104, 3],
]

const housesEast: [number, number, number, number][] = [
  [796, 78, 104, 3],
  [874, 92, 124, 4],
  [966, 100, 134, 4],
  [1066, 86, 112, 3],
  [1152, 104, 128, 4],
  [1256, 92, 106, 3],
  [1348, 112, 140, 4],
  [1460, 88, 116, 3],
  [1548, 100, 130, 4],
]

const stars: [number, number, number][] = [
  [60, 270, 1.6],
  [180, 330, 2.2],
  [260, 262, 1.4],
  [400, 300, 1.8],
  [520, 258, 1.5],
  [610, 330, 2.4],
  [700, 280, 1.4],
  [880, 262, 1.8],
  [940, 350, 1.3],
  [1130, 270, 2],
  [1210, 352, 1.4],
  [1380, 262, 1.6],
  [1460, 312, 2.2],
  [1540, 270, 1.5],
  [330, 380, 1.3],
  [1000, 300, 1.2],
  [140, 420, 1.2],
  [1560, 400, 1.4],
  [760, 250, 1.6],
  [470, 400, 1.2],
]

function FarSkyline({ P }: { P: CityPalette }) {
  return (
    <g>
      <path
        d="M0 600 V528 H40 V512 H96 V530 H150 V506 H214 V522 H300 V498 H352 V516 H420 V540 H520 V520 H600 V508 H690 V530 H780 V504 H880 V520 H960 V500 H1040 V524 H1120 V506 H1210 V520 H1300 V498 H1380 V516 H1470 V502 H1540 V522 H1600 V600 Z"
        fill={P.hazeFar}
      />
      {/* Un clocher d'église, dans la brume */}
      <g fill={P.haze}>
        <path d="M806 600 V522 L842 498 L878 522 V600 Z" />
        <rect x={858} y={440} width={34} height={160} />
        <rect x={854} y={434} width={42} height={8} />
        <path d="M856 434 L875 352 L894 434 Z" />
        <circle cx={875} cy={348} r={4} />
        <path d="M868 470 v-10 a7 7 0 0 1 14 0 v10 Z" fill={P.hazeFar} />
        <path
          d="M869 506 v-8 a6 6 0 0 1 12 0 v8 Z"
          fill={rand(300) < P.litRatio ? P.windowLit : P.hazeFar}
        />
      </g>
      {/* Château d'eau, sur la colline */}
      <g fill={P.haze}>
        <path d="M1398 600 V432 L1404 424 H1416 L1422 432 V600 Z" />
        <path d="M1368 432 L1374 394 Q1410 380 1446 394 L1452 432 Q1410 446 1368 432 Z" />
        <path d="M1380 392 Q1410 356 1440 392 Q1410 382 1380 392 Z" />
        <rect x={1408} y={350} width={4} height={14} />
        <path
          d="M1372 414 Q1410 426 1448 414"
          stroke={P.hazeFar}
          strokeWidth={4}
          fill="none"
        />
        {P.litRatio ? (
          <circle cx={1410} cy={348} r={3.5} fill={P.windowLit} />
        ) : null}
      </g>
    </g>
  )
}

function Water({ P, night }: { P: CityPalette; night: boolean }) {
  const ripples: [number, number, number][] = [
    [40, 650, 90],
    [210, 672, 60],
    [330, 648, 120],
    [520, 690, 80],
    [640, 660, 70],
    [900, 652, 110],
    [1010, 684, 60],
    [1120, 664, 90],
    [1250, 700, 70],
    [1420, 656, 120],
    [1520, 690, 60],
    [90, 708, 70],
    [760, 712, 90],
    [400, 714, 50],
  ]
  return (
    <g>
      <rect x={0} y={628} width={1600} height={100} fill={P.water} />
      <rect
        x={0}
        y={696}
        width={1600}
        height={32}
        fill={P.waterDeep}
        fillOpacity={0.6}
      />
      {/* Reflets de l'hôtel de ville, en traits brisés */}
      <g
        stroke={P.hallWall}
        strokeLinecap="round"
        strokeWidth={5}
        strokeOpacity={night ? 0.35 : 0.45}
      >
        <path d="M424 640 h48 M430 652 h34 M438 664 h20" />
        <path d="M728 640 h48 M734 652 h34 M742 664 h20" />
        <path d="M498 638 h120 M520 650 h70 M560 662 h40" />
      </g>
      <g stroke={P.ripple} strokeWidth={3} strokeLinecap="round">
        {ripples.map(([x, y, w]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y} H${x + w}`} />
        ))}
      </g>
      {night ? (
        <g stroke={P.glint} strokeLinecap="round">
          {[120, 300, 452, 610, 760, 940, 1100, 1200, 1300, 1408, 1500].map(
            (x, i) => {
              const glint = 0.55 + rand(x) * 0.4
              return (
                <g key={x} strokeOpacity={glint} strokeWidth={3}>
                  <path
                    d={`M${x} ${640 + (i % 3) * 4} h${10 + rand(x + 1) * 16}`}
                  />
                  <path
                    d={`M${x + 6} ${656 + (i % 2) * 6} h${8 + rand(x + 2) * 10}`}
                  />
                  <path
                    d={`M${x + 2} ${676} h${6 + rand(x + 3) * 8}`}
                    strokeOpacity={glint * 0.7}
                  />
                </g>
              )
            }
          )}
        </g>
      ) : (
        <g stroke={P.glint} strokeWidth={4} strokeLinecap="round">
          <path d="M1268 646 h44 M1276 664 h30 M1282 682 h20 M1286 700 h12" />
        </g>
      )}
    </g>
  )
}

/* ——— La scène en calques ———
 * Le décor (grain compris) est dessiné une fois ; ce qui bouge vit sur ses
 * propres petits calques, que le navigateur anime seuls (transform, opacity).
 * Toutes les boîtes sont en unités du viewBox. */

const VIEW: Box = [0, 240, 1600, 580]
const WHEEL = { x: 1046, y: 790, r: 196 }
const SUN: Box = [1210, 242, 160, 160]
const CLOUD_A: Box = [1414, 388, 115, 58]
const CLOUD_B: Box = [1078, 370, 115, 50]
const BIRDS: Box = [960, 386, 75, 40]
const TRAM: Box = [440, 524, 320, 78]
const GIFT: Box = [760, 727, 80, 70]
const SPARKLE_A: Box = [834, 716, 16, 16]
const SPARKLE_B: Box = [754, 700, 12, 12]
/** Les fenêtres allumées, la nuit, s'allument en trois vagues. */
const LIGHTS: Box = [0, 428, 1600, 184]
const LIGHT_WAVES = 3
/* Zones du grain, au plus près du dessin (le filtre coûte à sa surface) :
 * celle du décor de jour reprend la zone d'origine de la scène. */
const DAY_BACK: Box = [0, 344, 1600, 476]
const NORTH_BANK: Box = [0, 320, 1600, 290]
/** L'hôtel de ville, ses pavillons compris. */
const HALL: Box = [380, 340, 440, 262]
const QUAY: Box = [0, 320, 1600, 500]
const FRONT: Box = [0, 520, 1600, 300]

/** La personne qui salue, au premier plan du matin. */
const waver = {
  x: 734,
  y: NEAR + 2,
  s: 1.02,
  skin: skin.brown,
  hair: "bun",
  hairColor: hair.black,
  top: brand.teal,
  bottom: brand.tealDeep,
  pose: "wave",
} as const
const ARM: Box = [
  waver.x + 8 * waver.s,
  waver.y - 164 * waver.s,
  38 * waver.s,
  56 * waver.s,
]
const SHOULDER = [waver.x + 19 * waver.s, waver.y - 117 * waver.s] as const

function DaySky() {
  return (
    <>
      <Layer frame={VIEW} box={SUN} grain={false} className="pano-sun">
        <circle cx={1290} cy={322} r={74} fill="#F8EBC2" fillOpacity={0.45} />
        <circle cx={1290} cy={322} r={40} fill="#F7E3A8" />
      </Layer>
      <Layer frame={VIEW} box={CLOUD_A} grain={false} className="pano-cloud">
        <path
          d="M1440 420 a22 22 0 0 1 40 -10 a16 16 0 0 1 28 6 a14 14 0 0 1 4 26 h-80 a12 12 0 0 1 8 -22 Z"
          fill={brand.cream}
        />
      </Layer>
      <Layer
        frame={VIEW}
        box={CLOUD_B}
        grain={false}
        className="pano-cloud pano-cloud-slow"
      >
        <path
          d="M1110 398 a18 18 0 0 1 32 -8 a13 13 0 0 1 22 6 a11 11 0 0 1 2 20 h-64 a10 10 0 0 1 8 -18 Z"
          fill={brand.cream}
          fillOpacity={0.9}
        />
      </Layer>
      <Layer frame={VIEW} box={BIRDS} grain={false} className="pano-birds">
        <g
          stroke={brand.tealDeep}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeOpacity={0.55}
        >
          <path d="M968 420 q7 -7 14 0 q7 -7 14 0" />
          <path d="M1004 396 q5 -5 10 0 q5 -5 10 0" />
        </g>
      </Layer>
    </>
  )
}

function NightSky() {
  return (
    <g>
      <mask id="bb-moon">
        <circle cx={1290} cy={318} r={30} fill="#fff" />
        <circle cx={1304} cy={308} r={26} fill="#000" />
      </mask>
      <circle cx={1290} cy={318} r={70} fill="url(#bb-glow-soft)" />
      <circle cx={1290} cy={318} r={30} fill="#F3DEA6" mask="url(#bb-moon)" />
      {stars.map(([x, y, r]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill={brand.cream}
          fillOpacity={0.5 + rand(x) * 0.45}
        />
      ))}
    </g>
  )
}

/**
 * Wrenhaven vue du quai : maisons de tuffeau et toits d'ardoise, l'hôtel de
 * ville et son horloge, le tramway, l'Orrin, la grande roue des quais. Le
 * matin dans le hero, la nuit dans le pied de page.
 *
 * Le matin, le tram arrive, le cadeau se pose et la passante salue ; la nuit,
 * les fenêtres et les ampoules de la roue s'allument quand la scène entre
 * dans l'écran. La roue tourne lentement, de jour comme de nuit.
 */
export function CityPanorama({
  time = "day",
  className,
  label,
}: {
  time?: "day" | "night"
  className?: string
  label: string
}) {
  const night = time === "night"
  const P = night ? nightCity : dayCity
  const tints = night
    ? ["#2C5550", "#26504A", "#325C55"]
    : ["#EFE2C2", "#F5EBD5", "#E6D4AA"]

  // La nuit, la lumière des fenêtres est recueillie ici pour ses calques :
  // celle des maisons, en vagues, sous l'hôtel de ville (ses pavillons
  // cachent des fenêtres voisines), puis celle de l'hôtel de ville.
  // (Maisons et hôtel de ville sont appelés directement : la récolte est
  // faite avant de construire les calques de lumière.)
  const lights: ReactElement[] = []
  const waves: number[] = []
  const hallLights: ReactElement[] = []
  const sink: LightSink | undefined = night
    ? (seed, light) => {
        lights.push(light)
        waves.push(Math.floor(rand(seed + 0.5) * LIGHT_WAVES))
      }
    : undefined
  const hallSink: LightSink | undefined = night
    ? (_, light) => {
        hallLights.push(light)
      }
    : undefined

  const houses = (
    <g>
      <FarSkyline P={P} />
      {housesWest.map(([x, w, h, f], i) => (
        <Fragment key={x}>
          {House({
            x,
            y: NORTH,
            w,
            h,
            floors: f,
            P,
            seed: i + 1,
            tint: tints[i % 3],
            lights: sink,
          })}
        </Fragment>
      ))}
      {housesEast.map(([x, w, h, f], i) => (
        <Fragment key={x}>
          {House({
            x,
            y: NORTH,
            w,
            h,
            floors: f,
            P,
            seed: i + 20,
            tint: tints[(i + 1) % 3],
            lights: sink,
          })}
        </Fragment>
      ))}
    </g>
  )
  const hall = TownHall({ x: 600, y: NORTH, P, time, lights: hallSink })

  const quay = (
    <g>
      <Tree x={36} y={NORTH} r={24} P={P} />
      <Tree x={150} y={NORTH} r={28} P={P} />
      <Tree x={296} y={NORTH} r={22} P={P} kind="tall" />
      <Tree x={392} y={NORTH} r={24} P={P} />
      <Tree x={812} y={NORTH} r={22} P={P} kind="tall" />
      <Tree x={940} y={NORTH} r={26} P={P} />
      <Tree x={1206} y={NORTH} r={28} P={P} />
      <Tree x={1330} y={NORTH} r={22} P={P} kind="tall" />
      <Tree x={1508} y={NORTH} r={26} P={P} />

      <rect x={0} y={586} width={1600} height={16} fill={P.street} />
      <path
        d="M0 528 H1600"
        stroke={P.wire}
        strokeWidth={1.4}
        strokeOpacity={0.6}
      />
      {[200, 860, 1250].map((x) => (
        <rect
          key={x}
          x={x - 1.5}
          y={524}
          width={3}
          height={64}
          fill={P.wire}
          fillOpacity={0.75}
        />
      ))}
      {/* Le matin, le tram arrive sur son propre calque. */}
      {night ? <Tram x={444} y={NORTH} w={312} P={P} /> : null}

      {/* Mur du quai nord */}
      <rect x={0} y={600} width={1600} height={30} fill={P.quayWall} />
      <rect x={0} y={600} width={1600} height={4} fill={P.quayLine} />
      <g stroke={P.quayLine} strokeWidth={1.6}>
        {Array.from({ length: 40 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 40 + (i % 2) * 20} ${612 + (i % 2) * 8} h18`}
          />
        ))}
      </g>

      <Water P={P} night={night} />

      {/* Navette fluviale */}
      <g>
        <path
          d="M1150 676 H1270 L1256 696 H1162 Z"
          fill={night ? "#0B2626" : brand.tealDeep}
        />
        <rect
          x={1166}
          y={656}
          width={78}
          height={22}
          rx={6}
          fill={night ? "#D8D2BE" : brand.cream}
        />
        {[1174, 1194, 1214, 1232].map((x) => (
          <rect
            key={x}
            x={x}
            y={661}
            width={12}
            height={9}
            rx={2}
            fill={night ? brand.goldLight : "#35585A"}
          />
        ))}
        <rect x={1160} y={674} width={100} height={3} fill={brand.goldLight} />
        <path
          d="M1160 704 h96 M1172 712 h70"
          stroke={P.ripple}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>

      {/* Quai du premier plan */}
      <rect x={0} y={726} width={1600} height={14} fill={P.curb} />
      <rect x={0} y={740} width={1600} height={80} fill={P.paving} />
      <g stroke={P.curb} strokeWidth={1.5} strokeOpacity={0.6}>
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={`M${i * 84 + 20} ${760 + (i % 3) * 16} h34`} />
        ))}
      </g>

      <WheelBack {...WHEEL} P={P} time={time} />
    </g>
  )

  const front = (
    <g>
      <WheelFront {...WHEEL} P={P} time={time} />
      <Tree x={104} y={804} r={44} P={P} />
      <Lamp
        x={330}
        y={800}
        h={146}
        lit={night}
        color={night ? "#0B2626" : brand.tealDeep}
      />
      <Lamp
        x={1290}
        y={800}
        h={146}
        lit={night}
        color={night ? "#0B2626" : brand.tealDeep}
      />
      <Bench x={452} y={800} color={night ? "#0B2626" : brand.tealDeep} />
      {[250, 640, 1380, 1520].map((x) => (
        <Bollard key={x} x={x} y={744} color={night ? "#0B2626" : "#35585A"} />
      ))}

      {night ? (
        <g>
          {/* La route arrive au bout du quai : le cadeau est ouvert */}
          <path
            d="M0 806 H740"
            stroke={brand.goldLight}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="0 15"
            fill="none"
          />
          <circle cx={800} cy={700} r={120} fill="url(#bb-glow-soft)" />
          <Person
            x={800}
            y={NEAR + 4}
            s={1.02}
            skin={skin.tan}
            hair="long"
            hairColor={hair.black}
            top={brand.goldLight}
            bottom="#1F4C47"
            pose="hold"
            holding={<Gift x={0} y={-80} w={40} open sparkles />}
          />
          <Person
            x={890}
            y={NEAR + 4}
            s={0.98}
            skin={skin.deep}
            hair="short"
            hairColor={hair.black}
            top="#2A6D66"
            bottom={brand.ink}
            pose="hip"
          />
        </g>
      ) : (
        <g>
          <Person {...waver} part="body" />
          <path
            d="M800 800 V820"
            stroke={brand.gold}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="0 15"
          />
        </g>
      )}
    </g>
  )

  const { hubY, cabins } = wheelGeometry(WHEEL.x, WHEEL.y, WHEEL.r)
  const rotor: Box = [
    WHEEL.x - WHEEL.r - 6,
    hubY - WHEEL.r - 6,
    WHEEL.r * 2 + 12,
    WHEEL.r * 2 + 12,
  ]

  const wheelFrame = night ? VIEW : DAY_BACK
  const wheel = (
    <div className="layer wheel-rotor" style={place(wheelFrame, rotor)}>
      <Layer frame={rotor} box={rotor}>
        <WheelRotor {...WHEEL} P={P} time={time} />
      </Layer>
      {night
        ? [0, 1].map((k) => (
            <Layer
              key={k}
              frame={rotor}
              box={rotor}
              className="wheel-bulbs"
              grain={false}
              style={{ animationDelay: `${0.5 + k * 0.45}s` }}
            >
              <WheelBulbs {...WHEEL} part={k} of={2} />
            </Layer>
          ))
        : null}
      {cabins.map(({ i, px, py }) => {
        const box: Box = [px - 16, py - 1, 32, 36]
        return (
          <Layer
            key={i}
            frame={rotor}
            box={box}
            className="wheel-cabin"
            style={{ transformOrigin: originIn(box, px, py) }}
          >
            <WheelCabin px={px} py={py} i={i} P={P} time={time} />
          </Layer>
        )
      })}
    </div>
  )

  return (
    <div
      role="img"
      aria-label={label}
      className={`pano ${className ?? ""}`}
      data-scene={time}
      data-animate={night ? "" : undefined}
    >
      <div className="pano-stage">
        {night ? (
          <>
            <Layer
              frame={VIEW}
              box={VIEW}
              grainBox={NORTH_BANK}
              under={<NightSky />}
            >
              {houses}
            </Layer>
            {Array.from({ length: LIGHT_WAVES }, (_, k) => (
              <Layer
                key={k}
                frame={VIEW}
                box={LIGHTS}
                className="pano-lights"
                style={{ animationDelay: `${(0.15 + k * 0.5).toFixed(2)}s` }}
              >
                {lights.map((light, i) =>
                  waves[i] === k ? <Fragment key={i}>{light}</Fragment> : null
                )}
              </Layer>
            ))}
            <Layer frame={VIEW} box={HALL}>
              {hall}
            </Layer>
            <Layer
              frame={VIEW}
              box={HALL}
              className="pano-lights"
              style={{ animationDelay: "0.4s" }}
            >
              {hallLights.map((light, i) => (
                <Fragment key={i}>{light}</Fragment>
              ))}
            </Layer>
            <Layer frame={VIEW} box={QUAY}>
              {quay}
            </Layer>
          </>
        ) : (
          <>
            <DaySky />
            <Layer frame={VIEW} box={DAY_BACK}>
              {houses}
              {hall}
              {quay}
            </Layer>
            <Layer frame={VIEW} box={TRAM} className="pano-tram">
              <Tram x={444} y={NORTH} w={312} P={P} />
            </Layer>
          </>
        )}

        {/* La grande roue : la jante tourne, les nacelles restent d'aplomb.
            Le matin, rien ne dépasse au-dessus du décor (comme dans la scène
            d'origine, où le grain s'arrêtait là). */}
        {night ? (
          wheel
        ) : (
          <div className="layer wheel-clip" style={place(VIEW, DAY_BACK)}>
            {wheel}
          </div>
        )}

        <Layer frame={VIEW} box={FRONT}>
          {front}
        </Layer>

        {night ? null : (
          <>
            <Layer
              frame={VIEW}
              box={ARM}
              className="pano-arm"
              style={{ transformOrigin: originIn(ARM, ...SHOULDER) }}
            >
              <Person {...waver} part="arm" />
            </Layer>
            <Layer frame={VIEW} box={GIFT} className="pano-gift">
              <Gift x={800} y={NEAR} w={60} />
            </Layer>
            <Layer frame={VIEW} box={SPARKLE_A} className="pano-sparkle">
              <Sparkle cx={842} cy={724} r={7} fill={brand.gold} />
            </Layer>
            <Layer
              frame={VIEW}
              box={SPARKLE_B}
              className="pano-sparkle pano-sparkle-late"
            >
              <Sparkle cx={760} cy={706} r={5} fill={brand.gold} />
            </Layer>
          </>
        )}
      </div>
    </div>
  )
}

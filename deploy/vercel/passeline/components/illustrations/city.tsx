import { Fragment, type ReactElement } from "react"

import { brand, type CityPalette } from "./palette"

/** Petit hasard déterministe : mêmes fenêtres allumées au serveur et au client. */
export function rand(seed: number) {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

/**
 * Reçoit la lumière des fenêtres allumées, quand une scène les pose sur un
 * calque à part (pour les allumer à l'entrée dans l'écran).
 */
export type LightSink = (seed: number, light: ReactElement) => void

/**
 * Une vitre, allumée ou non. Avec `lights`, la vitre reste sombre ici et sa
 * lumière part dans `lights`, pour être posée par-dessus sur son calque.
 */
export function glass(
  P: CityPalette,
  lit: boolean,
  seed: number,
  shape: (fill: string) => ReactElement,
  lights?: LightSink
) {
  if (lit && lights) {
    lights(seed, shape(P.windowLit))
    return shape(P.window)
  }
  return shape(lit ? P.windowLit : P.window)
}

/* ——— Immeuble de quai : façade en tuffeau, toit d'ardoise à la Mansart ——— */

export function House({
  x,
  y,
  w,
  h,
  floors = 3,
  P,
  seed = 1,
  roof = "mansard",
  tint,
  balcony = true,
  lights,
}: {
  x: number
  y: number
  w: number
  h: number
  floors?: number
  P: CityPalette
  seed?: number
  roof?: "mansard" | "gable" | "flat"
  tint?: string
  balcony?: boolean
  lights?: LightSink
}) {
  const cols = Math.max(2, Math.floor((w - 10) / 24))
  const gap = (w - cols * 11) / (cols + 1)
  const floorH = h / (floors + 0.4)
  const top = y - h
  const roofH = Math.min(46, floorH * 1.2)
  const windows: React.ReactNode[] = []
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (11 + gap)
      const wy = top + floorH * 0.55 + f * floorH
      const key = seed * 31 + f * 7 + c
      const lit = rand(key) < P.litRatio
      windows.push(
        <g key={`${f}-${c}`}>
          {glass(
            P,
            lit,
            key,
            (fill) => (
              <rect
                x={wx}
                y={wy}
                width={11}
                height={floorH * 0.5}
                rx={1.5}
                fill={fill}
              />
            ),
            lights
          )}
          <rect
            x={wx - 1.5}
            y={wy + floorH * 0.5}
            width={14}
            height={2.2}
            fill={P.frame}
            fillOpacity={0.8}
          />
        </g>
      )
    }
  }
  const shopY = top + floorH * (floors + 0.05)
  return (
    <g>
      {roof === "mansard" ? (
        <g>
          <path
            d={`M${x - 3} ${top} L${x + 7} ${top - roofH} L${x + w - 7} ${top - roofH} L${x + w + 3} ${top} Z`}
            fill={P.slate}
          />
          <rect
            x={x + w * 0.62}
            y={top - roofH - 12}
            width={9}
            height={14}
            fill={P.slateLight}
          />
          {Array.from({ length: Math.max(1, cols - 2) }, (_, i) => {
            const dx =
              x + gap * 1.4 + i * ((w - gap * 2.8) / Math.max(1, cols - 2)) + 4
            const lit = rand(seed * 13 + i) < P.litRatio * 0.7
            return (
              <g key={i}>
                <path
                  d={`M${dx - 2} ${top - roofH * 0.25} V${top - roofH * 0.72} L${dx + 6} ${top - roofH * 0.92} L${dx + 14} ${top - roofH * 0.72} V${top - roofH * 0.25} Z`}
                  fill={P.slateLight}
                />
                {glass(
                  P,
                  lit,
                  seed * 13 + i,
                  (fill) => (
                    <rect
                      x={dx + 2}
                      y={top - roofH * 0.68}
                      width={8}
                      height={roofH * 0.4}
                      rx={1}
                      fill={fill}
                    />
                  ),
                  lights
                )}
              </g>
            )
          })}
        </g>
      ) : null}
      {roof === "gable" ? (
        <path
          d={`M${x - 4} ${top} L${x + w / 2} ${top - roofH * 1.3} L${x + w + 4} ${top} Z`}
          fill={P.slate}
        />
      ) : null}
      <rect x={x} y={top} width={w} height={h} fill={tint ?? P.wall} />
      <rect
        x={x + w - 6}
        y={top}
        width={6}
        height={h}
        fill={P.wallShade}
        fillOpacity={0.6}
      />
      <rect x={x - 3} y={top - 2} width={w + 6} height={6} fill={P.wallLine} />
      {windows}
      {balcony && floors > 1 ? (
        <g>
          <rect
            x={x + 4}
            y={top + floorH * 1.05 + floorH * 0.02}
            width={w - 8}
            height={2.4}
            fill={brand.ink}
            fillOpacity={0.55}
          />
          <rect
            x={x + 4}
            y={top + floorH * 1.05 - 6}
            width={w - 8}
            height={1.2}
            fill={brand.ink}
            fillOpacity={0.35}
          />
        </g>
      ) : null}
      <rect x={x} y={shopY} width={w} height={2.5} fill={P.wallLine} />
      {Array.from({ length: Math.max(1, Math.floor(cols / 2)) }, (_, i) => {
        const n = Math.max(1, Math.floor(cols / 2))
        const aw = Math.min(18, (w - 20) / n - 8)
        const ax = x + (w / n) * (i + 0.5) - aw / 2
        const lit = rand(seed * 5 + i * 3) < P.litRatio
        return (
          <Fragment key={i}>
            {glass(
              P,
              lit,
              seed * 5 + i * 3,
              (fill) => (
                <path
                  d={`M${ax} ${y} V${shopY + 10 + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw} ${shopY + 10 + aw / 2} V${y} Z`}
                  fill={fill}
                  fillOpacity={0.92}
                />
              ),
              lights
            )}
          </Fragment>
        )
      })}
    </g>
  )
}

/* ——— Arbres ——— */

export function Tree({
  x,
  y,
  r,
  P,
  kind = "round",
}: {
  x: number
  y: number
  r: number
  P: CityPalette
  kind?: "round" | "tall"
}) {
  if (kind === "tall") {
    return (
      <g>
        <rect
          x={x - 2.5}
          y={y - r * 0.9}
          width={5}
          height={r * 0.9}
          fill={P.trunk}
        />
        <ellipse
          cx={x + 2}
          cy={y - r * 1.9}
          rx={r * 0.62}
          ry={r * 1.25}
          fill={P.treeDark}
        />
        <ellipse
          cx={x}
          cy={y - r * 2}
          rx={r * 0.56}
          ry={r * 1.2}
          fill={P.tree}
        />
        <ellipse
          cx={x - r * 0.2}
          cy={y - r * 2.35}
          rx={r * 0.22}
          ry={r * 0.6}
          fill={P.treeLight}
        />
      </g>
    )
  }
  return (
    <g>
      <path
        d={`M${x - 3.5} ${y} L${x - 2} ${y - r * 1.25} L${x + 2} ${y - r * 1.25} L${x + 3.5} ${y} Z`}
        fill={P.trunk}
      />
      <circle cx={x + r * 0.15} cy={y - r * 1.48} r={r} fill={P.treeDark} />
      <circle cx={x - r * 0.55} cy={y - r * 1.32} r={r * 0.72} fill={P.tree} />
      <circle cx={x + r * 0.55} cy={y - r * 1.4} r={r * 0.7} fill={P.tree} />
      <circle cx={x} cy={y - r * 1.78} r={r * 0.82} fill={P.tree} />
      <circle
        cx={x - r * 0.28}
        cy={y - r * 2.02}
        r={r * 0.36}
        fill={P.treeLight}
      />
    </g>
  )
}

/* ——— L'hôtel de ville de Wrenhaven : pavillons, toit d'ardoise, horloge ——— */

export function TownHall({
  x,
  y,
  P,
  time = "day",
  lights,
}: {
  x: number
  y: number
  P: CityPalette
  time?: "day" | "night"
  lights?: LightSink
}) {
  const night = time === "night"
  const lit = (key: number, shape: (fill: string) => ReactElement) =>
    glass(P, rand(key) < P.litRatio, key, shape, lights)

  /* Pavillon d'angle : toit en pavillon, deux étages de hautes fenêtres. */
  const pavilion = (cx: number, seed: number) => (
    <g>
      <path
        d={`M${cx - 36} ${y - 150} L${cx - 22} ${y - 198} L${cx + 22} ${y - 198} L${cx + 36} ${y - 150} Z`}
        fill={P.hallRoof}
      />
      <path
        d={`M${cx + 4} ${y - 198} L${cx + 22} ${y - 198} L${cx + 36} ${y - 150} L${cx + 14} ${y - 150} Z`}
        fill={brand.ink}
        fillOpacity={0.16}
      />
      <rect
        x={cx - 3}
        y={y - 214}
        width={6}
        height={18}
        rx={1.5}
        fill={P.hallRoof}
      />
      <rect x={cx - 32} y={y - 152} width={64} height={152} fill={P.hallWall} />
      <rect
        x={cx + 14}
        y={y - 152}
        width={18}
        height={152}
        fill={P.hallShade}
        fillOpacity={0.75}
      />
      <rect
        x={cx - 36}
        y={y - 154}
        width={72}
        height={7}
        rx={1.5}
        fill={P.hallShade}
      />
      {[-12, 6].map((dx, i) => (
        <g key={dx}>
          {lit(seed + i, (fill) => (
            <rect
              x={cx + dx - 1}
              y={y - 134}
              width={13}
              height={30}
              rx={1.5}
              fill={fill}
            />
          ))}
          {lit(seed + i + 4, (fill) => (
            <rect
              x={cx + dx - 1}
              y={y - 88}
              width={13}
              height={30}
              rx={1.5}
              fill={fill}
            />
          ))}
        </g>
      ))}
      <rect x={cx - 32} y={y - 96} width={64} height={4} fill={P.hallShade} />
    </g>
  )

  /* L'horloge du fronton : neuf heures cinq le matin, dix heures dix le soir. */
  const clockY = y - 152
  const hour = night ? 10 + 10 / 60 : 9 + 5 / 60
  const minute = night ? 10 : 5
  const hand = (turns: number, len: number) => {
    const a = turns * Math.PI * 2 - Math.PI / 2
    return `M${x} ${clockY} L${x + Math.cos(a) * len} ${clockY + Math.sin(a) * len}`
  }

  return (
    <g>
      {/* Corps central : toit à la Mansart et lucarnes */}
      <path
        d={`M${x - 144} ${y - 128} L${x - 132} ${y - 166} L${x + 132} ${y - 166} L${x + 144} ${y - 128} Z`}
        fill={P.hallRoof}
      />
      {[-112, -76, 76, 112].map((dx, i) => (
        <g key={dx}>
          <path
            d={`M${x + dx - 10} ${y - 132} V${y - 154} L${x + dx} ${y - 164} L${x + dx + 10} ${y - 154} V${y - 132} Z`}
            fill={P.slateLight}
          />
          {lit(70 + i, (fill) => (
            <rect
              x={x + dx - 5}
              y={y - 154}
              width={10}
              height={16}
              rx={1.5}
              fill={fill}
            />
          ))}
        </g>
      ))}
      <rect
        x={x - 140}
        y={y - 130}
        width={280}
        height={130}
        fill={P.hallWall}
      />
      <rect
        x={x - 144}
        y={y - 132}
        width={288}
        height={7}
        rx={1.5}
        fill={P.hallShade}
      />
      {/* Fenêtres hautes de l'étage noble, petit balcon filant */}
      {[-118, -94, -70, 58, 82, 106].map((dx, i) => (
        <Fragment key={dx}>
          {lit(80 + i, (fill) => (
            <rect
              x={x + dx}
              y={y - 114}
              width={12}
              height={32}
              rx={1.5}
              fill={fill}
            />
          ))}
        </Fragment>
      ))}
      <rect
        x={x - 136}
        y={y - 80}
        width={272}
        height={2.4}
        fill={brand.ink}
        fillOpacity={0.5}
      />
      <rect x={x - 140} y={y - 64} width={280} height={4} fill={P.hallShade} />
      {/* Arcades du rez-de-chaussée */}
      {[-112, -78, -44, 44, 78, 112].map((dx, i) => (
        <Fragment key={dx}>
          {lit(90 + i, (fill) => (
            <path
              d={`M${x + dx - 9} ${y} V${y - 38} A9 9 0 0 1 ${x + dx + 9} ${y - 38} V${y} Z`}
              fill={fill}
              fillOpacity={0.92}
            />
          ))}
        </Fragment>
      ))}

      {pavilion(x - 168, 3)}
      {pavilion(x + 168, 9)}

      {/* Avant-corps : horloge, fronton et petit campanile */}
      <rect x={x - 7} y={y - 214} width={14} height={20} fill={P.hallWall} />
      <path
        d={`M${x - 4} ${y - 200} V${y - 207} A4 4 0 0 1 ${x + 4} ${y - 207} V${y - 200} Z`}
        fill={P.window}
      />
      <path
        d={`M${x - 11} ${y - 212} Q${x} ${y - 232} ${x + 11} ${y - 212} Z`}
        fill={P.hallRoof}
      />
      <rect
        x={x - 1.1}
        y={y - 238}
        width={2.2}
        height={12}
        fill={night ? P.hallWall : P.hallRoof}
      />
      <path
        d={`M${x + 1} ${y - 237} h10 l-3 3.5 l3 3.5 h-10 Z`}
        fill={brand.goldLight}
      />
      <path
        d={`M${x - 58} ${y - 176} L${x} ${y - 206} L${x + 58} ${y - 176} Z`}
        fill={P.hallShade}
      />
      <path
        d={`M${x - 46} ${y - 179} L${x} ${y - 200} L${x + 46} ${y - 179} Z`}
        fill={P.hallWall}
      />
      {lit(60, (fill) => (
        <circle cx={x} cy={y - 186} r={5} fill={fill} />
      ))}
      <rect x={x - 50} y={y - 178} width={100} height={178} fill={P.hallWall} />
      <rect
        x={x + 30}
        y={y - 178}
        width={20}
        height={178}
        fill={P.hallShade}
        fillOpacity={0.6}
      />
      <rect
        x={x - 56}
        y={y - 180}
        width={112}
        height={7}
        rx={1.5}
        fill={P.hallShade}
      />
      {night ? <circle cx={x} cy={clockY} r={34} fill="url(#bb-glow)" /> : null}
      <circle cx={x} cy={clockY} r={17} fill={P.hallShade} />
      <circle
        cx={x}
        cy={clockY}
        r={14}
        fill={night ? "#F7DE9C" : brand.cream}
      />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <circle
            key={i}
            cx={x + Math.cos(a) * 10.5}
            cy={clockY + Math.sin(a) * 10.5}
            r={i % 3 === 0 ? 1.4 : 0.8}
            fill={brand.ink}
            fillOpacity={0.7}
          />
        )
      })}
      <g stroke={brand.ink} strokeLinecap="round">
        <path d={hand(hour / 12, 6.5)} strokeWidth={2.4} />
        <path d={hand(minute / 60, 10)} strokeWidth={1.6} />
      </g>
      <circle cx={x} cy={clockY} r={1.8} fill={brand.gold} />
      {[-26, 14].map((dx, i) => (
        <Fragment key={dx}>
          {lit(50 + i, (fill) => (
            <rect
              x={x + dx}
              y={y - 120}
              width={12}
              height={36}
              rx={1.5}
              fill={fill}
            />
          ))}
        </Fragment>
      ))}
      <rect
        x={x - 34}
        y={y - 80}
        width={68}
        height={2.4}
        fill={brand.ink}
        fillOpacity={0.55}
      />
      <path
        d={`M${x - 20} ${y} V${y - 44} A20 20 0 0 1 ${x + 20} ${y - 44} V${y} Z`}
        fill={P.window}
      />
      <rect x={x - 50} y={y - 64} width={100} height={4} fill={P.hallShade} />
    </g>
  )
}

/* ——— La grande roue des quais ——— */

type WheelProps = {
  x: number
  y: number
  P: CityPalette
  time?: "day" | "night"
  r?: number
}

/** Géométrie de la grande roue posée au sol en (x, y) : moyeu et nacelles. */
export function wheelGeometry(x: number, y: number, r = 196) {
  const hubY = y - r - 54
  const cabins = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12
    return { i, px: x + Math.cos(a) * r, py: hubY + Math.sin(a) * r }
  })
  return { hubY, cabins }
}

/** Derrière la roue : le halo de nuit et les jambes arrière. */
export function WheelBack({ x, y, P, time = "day", r = 196 }: WheelProps) {
  const { hubY } = wheelGeometry(x, y, r)
  return (
    <g>
      {time === "night" ? (
        <circle
          cx={x}
          cy={hubY}
          r={r * 1.12}
          fill="url(#bb-glow-soft)"
          fillOpacity={0.8}
        />
      ) : null}
      {/* Jambes arrière, plus sombres */}
      <path
        d={`M${x - 6} ${hubY} L${x - 70} ${y - 8} H${x - 58} L${x + 2} ${hubY + 12} Z M${x + 6} ${hubY} L${x + 70} ${y - 8} H${x + 58} L${x - 2} ${hubY + 12} Z`}
        fill={P.wheelLine}
        fillOpacity={0.55}
      />
    </g>
  )
}

/** Ce qui tourne : rayons, jante double et croisillons. */
export function WheelRotor({ x, y, P, r = 196 }: WheelProps) {
  const { hubY } = wheelGeometry(x, y, r)
  const spokes = 16
  const lattice: string[] = []
  for (let i = 0; i < 48; i++) {
    const a0 = (i / 48) * Math.PI * 2
    const a1 = ((i + 1) / 48) * Math.PI * 2
    const outer = i % 2 === 0 ? r : r - 15
    const inner = i % 2 === 0 ? r - 15 : r
    lattice.push(
      `M${x + Math.cos(a0) * outer} ${hubY + Math.sin(a0) * outer} L${x + Math.cos(a1) * inner} ${hubY + Math.sin(a1) * inner}`
    )
  }
  return (
    <g>
      <g stroke={P.wheelLine} strokeWidth={2.4} strokeOpacity={0.85}>
        {Array.from({ length: spokes }, (_, i) => {
          const a = (i / spokes) * Math.PI * 2
          return (
            <path
              key={i}
              d={`M${x} ${hubY} L${x + Math.cos(a) * (r - 8)} ${hubY + Math.sin(a) * (r - 8)}`}
            />
          )
        })}
      </g>
      {/* Jante double, croisillons */}
      <circle
        cx={x}
        cy={hubY}
        r={r}
        fill="none"
        stroke={P.wheel}
        strokeWidth={8}
      />
      <circle
        cx={x}
        cy={hubY}
        r={r - 15}
        fill="none"
        stroke={P.wheel}
        strokeWidth={4}
      />
      <path
        d={lattice.join(" ")}
        stroke={P.wheelShade}
        strokeWidth={2}
        fill="none"
      />
    </g>
  )
}

/** Les ampoules de la jante (la nuit) ; `part` en garde une sur `of`. */
export function WheelBulbs({
  x,
  y,
  r = 196,
  part = 0,
  of = 1,
}: {
  x: number
  y: number
  r?: number
  part?: number
  of?: number
}) {
  const { hubY } = wheelGeometry(x, y, r)
  return (
    <g fill={brand.goldLight}>
      {Array.from({ length: 40 }, (_, i) => i)
        .filter((i) => i % of === part)
        .map((i) => {
          const a = (i / 40) * Math.PI * 2
          return (
            <circle
              key={i}
              cx={x + Math.cos(a) * r}
              cy={hubY + Math.sin(a) * r}
              r={2.6}
              fillOpacity={0.65 + rand(i + 400) * 0.35}
            />
          )
        })}
    </g>
  )
}

/** Une nacelle, suspendue en (px, py) ; elle reste toujours d'aplomb. */
export function WheelCabin({
  px,
  py,
  i,
  P,
  time = "day",
}: {
  px: number
  py: number
  i: number
  P: CityPalette
  time?: "day" | "night"
}) {
  const night = time === "night"
  const cabinColors = night
    ? ["#1F4C47", "#2C5550", "#D8D2BE"]
    : [brand.teal, brand.cream, brand.tealDeep]
  const body = cabinColors[i % cabinColors.length]
  return (
    <g>
      <rect x={px - 1.2} y={py} width={2.4} height={10} fill={P.wheelLine} />
      <path
        d={`M${px - 15} ${py + 14} Q${px} ${py + 2} ${px + 15} ${py + 14} Z`}
        fill={P.wheelShade}
      />
      <rect x={px - 13} y={py + 13} width={26} height={20} rx={4} fill={body} />
      <rect
        x={px - 9}
        y={py + 17}
        width={18}
        height={7}
        rx={2}
        fill={night ? brand.goldLight : P.window}
        fillOpacity={night ? 0.95 : 0.75}
      />
    </g>
  )
}

/** Devant la roue : jambes avant, moyeu, quai d'embarquement et guérite. */
export function WheelFront({ x, y, P, time = "day", r = 196 }: WheelProps) {
  const night = time === "night"
  const { hubY } = wheelGeometry(x, y, r)
  return (
    <g>
      {/* Jambes avant et moyeu */}
      <path
        d={`M${x - 8} ${hubY} L${x - 104} ${y} H${x - 88} L${x + 4} ${hubY + 14} Z M${x + 8} ${hubY} L${x + 104} ${y} H${x + 88} L${x - 4} ${hubY + 14} Z`}
        fill={P.wheelShade}
      />
      <rect
        x={x - 74}
        y={y - 92}
        width={148}
        height={7}
        rx={2}
        fill={P.wheelShade}
      />
      <circle cx={x} cy={hubY} r={17} fill={P.wheelShade} />
      <circle cx={x} cy={hubY} r={8} fill={P.wheel} />
      {/* Quai d'embarquement et guérite */}
      <rect
        x={x - 120}
        y={y - 12}
        width={240}
        height={12}
        rx={3}
        fill={P.wheelLine}
        fillOpacity={0.85}
      />
      <g>
        <rect
          x={x + 116}
          y={y - 58}
          width={44}
          height={52}
          rx={3}
          fill={night ? "#2C5550" : brand.cream}
        />
        <rect
          x={x + 124}
          y={y - 46}
          width={28}
          height={18}
          rx={2}
          fill={night ? brand.goldLight : P.window}
        />
        <path
          d={`M${x + 110} ${y - 56} L${x + 138} ${y - 76} L${x + 166} ${y - 56} Z`}
          fill={brand.gold}
        />
      </g>
    </g>
  )
}

/** La grande roue en ombre chinoise, pour les lignes de toits. */
export function WheelSilhouette({
  cx,
  cy,
  r,
  ground,
  color,
}: {
  cx: number
  cy: number
  r: number
  ground: number
  color: string
}) {
  return (
    <g>
      <g stroke={color} fill="none">
        <circle cx={cx} cy={cy} r={r} strokeWidth={r * 0.09} />
        <circle cx={cx} cy={cy} r={r * 0.84} strokeWidth={r * 0.04} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <path
              key={i}
              d={`M${cx} ${cy} L${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`}
              strokeWidth={r * 0.035}
            />
          )
        })}
      </g>
      <g fill={color}>
        <circle cx={cx} cy={cy} r={r * 0.14} />
        <path
          d={`M${cx - r * 0.06} ${cy} L${cx - r * 0.56} ${ground} H${cx - r * 0.4} L${cx + r * 0.04} ${cy + r * 0.08} Z M${cx + r * 0.06} ${cy} L${cx + r * 0.56} ${ground} H${cx + r * 0.4} L${cx - r * 0.04} ${cy + r * 0.08} Z`}
        />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + Math.PI / 10
          const px = cx + Math.cos(a) * r
          const py = cy + Math.sin(a) * r
          return (
            <rect
              key={i}
              x={px - r * 0.11}
              y={py + r * 0.04}
              width={r * 0.22}
              height={r * 0.18}
              rx={r * 0.04}
            />
          )
        })}
      </g>
    </g>
  )
}

/* ——— Le tramway ——— */

export function Tram({
  x,
  y,
  w = 300,
  P,
}: {
  x: number
  y: number
  w?: number
  P: CityPalette
}) {
  const mods = [0.36, 0.3, 0.34]
  let acc = x
  const joints: number[] = []
  mods.forEach((m, i) => {
    acc += m * w
    if (i < mods.length - 1) joints.push(acc)
  })
  return (
    <g>
      <path
        d={`M${x + w * 0.5} ${y - 46} l-10 -14 l18 -8`}
        stroke={P.wire}
        strokeWidth={2}
        fill="none"
      />
      <path
        d={`M${x} ${y - 6} V${y - 34} Q${x} ${y - 46} ${x + 14} ${y - 46} H${x + w - 26} Q${x + w - 4} ${y - 46} ${x + w} ${y - 22} V${y - 6} Q${x + w} ${y - 2} ${x + w - 4} ${y - 2} H${x + 4} Q${x} ${y - 2} ${x} ${y - 6} Z`}
        fill={P.tram}
      />
      <rect
        x={x + 6}
        y={y - 40}
        width={w - 20}
        height={16}
        rx={3}
        fill={P.tramWindow}
      />
      <path
        d={`M${x + w - 14} ${y - 40} Q${x + w - 4} ${y - 38} ${x + w - 3} ${y - 24} H${x + w - 14} Z`}
        fill={P.tramWindow}
      />
      {Array.from({ length: Math.floor((w - 20) / 22) }, (_, i) => (
        <rect
          key={i}
          x={x + 26 + i * 22}
          y={y - 40}
          width={2.4}
          height={16}
          fill={P.tram}
        />
      ))}
      <rect x={x + 3} y={y - 17} width={w - 6} height={7} fill={P.tramBand} />
      <rect
        x={x + 3}
        y={y - 21}
        width={w - 6}
        height={2.6}
        fill={brand.goldLight}
      />
      {joints.map((jx) => (
        <rect
          key={jx}
          x={jx - 2}
          y={y - 46}
          width={4}
          height={44}
          fill={P.tramBand}
          fillOpacity={0.5}
        />
      ))}
      {[0.18, 0.52, 0.84].map((d) => (
        <rect
          key={d}
          x={x + w * d - 7}
          y={y - 40}
          width={14}
          height={36}
          rx={2}
          fill={P.tramBand}
          fillOpacity={0.8}
        />
      ))}
    </g>
  )
}

/* ——— Mobilier du quai ——— */

export function Lamp({
  x,
  y,
  h = 150,
  lit = false,
  color = brand.tealDeep,
  glow,
}: {
  x: number
  y: number
  h?: number
  lit?: boolean
  color?: string
  glow?: number
}) {
  return (
    <g>
      {lit ? (
        <circle
          cx={x}
          cy={y - h - 8}
          r={glow ?? h * 0.55}
          fill="url(#bb-glow)"
        />
      ) : null}
      <rect x={x - 2.5} y={y - h} width={5} height={h} fill={color} />
      <rect x={x - 6} y={y - 10} width={12} height={10} rx={2} fill={color} />
      <path
        d={`M${x - 9} ${y - h} L${x - 11} ${y - h - 18} L${x + 11} ${y - h - 18} L${x + 9} ${y - h} Z`}
        fill={lit ? "#F7DE9C" : "#E9EFE8"}
      />
      <path
        d={`M${x - 13} ${y - h - 18} L${x} ${y - h - 27} L${x + 13} ${y - h - 18} Z`}
        fill={color}
      />
      <rect x={x - 10} y={y - h - 2} width={20} height={3} fill={color} />
    </g>
  )
}

export function Bollard({
  x,
  y,
  color,
}: {
  x: number
  y: number
  color: string
}) {
  return (
    <g fill={color}>
      <rect x={x - 6} y={y - 15} width={12} height={15} rx={2} />
      <ellipse cx={x} cy={y - 16} rx={10} ry={4.5} />
    </g>
  )
}

export function Bench({
  x,
  y,
  color,
}: {
  x: number
  y: number
  color: string
}) {
  return (
    <g fill={color}>
      <rect x={x} y={y - 22} width={70} height={5} rx={2} />
      <rect x={x} y={y - 36} width={70} height={4} rx={2} />
      <rect x={x + 6} y={y - 22} width={4} height={22} />
      <rect x={x + 60} y={y - 22} width={4} height={22} />
      <rect x={x + 6} y={y - 36} width={3} height={14} />
      <rect x={x + 61} y={y - 36} width={3} height={14} />
    </g>
  )
}

import type { CSSProperties, ReactNode } from "react"

/** Un rectangle du dessin : x, y, largeur, hauteur (unités du viewBox). */
export type Box = readonly [x: number, y: number, w: number, h: number]

const pct = (v: number) => `${Number((v * 100).toFixed(4))}%`

/** Place `box` dans le cadre `frame`, en pourcentages (left, top, width, height). */
export function place(frame: Box, box: Box): CSSProperties {
  const [fx, fy, fw, fh] = frame
  const [x, y, w, h] = box
  return {
    left: pct((x - fx) / fw),
    top: pct((y - fy) / fh),
    width: pct(w / fw),
    height: pct(h / fh),
  }
}

/** Un point du dessin, exprimé en pourcentages de `box` (pour transform-origin). */
export function originIn(box: Box, px: number, py: number) {
  const [x, y, w, h] = box
  return `${pct((px - x) / w)} ${pct((py - y) / h)}`
}

/**
 * Le grain des illustrations, posé sur `children`. Le rectangle invisible
 * fixe la zone du filtre sur `box` : rien n'est rogné au bord d'un calque, et
 * le dessin reste d'un seul tenant pour le navigateur, qui calcule alors le
 * grain une fois au lieu de le refaire à chaque image d'une animation voisine.
 * Pour la même raison, les formes sous le grain utilisent fill-opacity ou
 * stroke-opacity, jamais l'attribut opacity (il découpe le dessin).
 */
export function Grain({ box, children }: { box: Box; children: ReactNode }) {
  const [x, y, w, h] = box
  return (
    <g filter="url(#bb-grain)">
      <rect x={x} y={y} width={w} height={h} fill="none" />
      {children}
    </g>
  )
}

/**
 * Un calque d'illustration : un <svg> à part, posé en pourcentages dans le
 * cadre `frame` de sa scène. Le navigateur le dessine une fois, grain compris,
 * puis l'anime seul (transform, opacity) sans redessiner le reste de la scène.
 * `under` est dessiné sous le grain ; `grainBox` resserre la zone du grain
 * (le filtre se calcule sur toute cette zone).
 */
export function Layer({
  frame,
  box,
  className,
  style,
  grain = true,
  grainBox,
  under,
  children,
}: {
  frame: Box
  box: Box
  grainBox?: Box
  className?: string
  style?: CSSProperties
  grain?: boolean
  under?: ReactNode
  children?: ReactNode
}) {
  const [x, y, w, h] = box
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`${x} ${y} ${w} ${h}`}
      className={className ? `layer ${className}` : "layer"}
      style={{ ...place(frame, box), ...style }}
    >
      {under}
      {grain ? <Grain box={grainBox ?? box}>{children}</Grain> : children}
    </svg>
  )
}

/**
 * Les fenêtres allumées d'une ligne de toits, posées sur la scène en
 * `waves` calques (même viewBox, même cadrage `xMidYMax slice`) qui
 * s'allument l'un après l'autre quand la scène entre dans l'écran. Le grain
 * ne couvre que la bande `band` où sont les fenêtres.
 */
export function LitWindows({
  viewBox,
  windows,
  width,
  height,
  fill,
  band,
  waves = 3,
}: {
  viewBox: Box
  /** Bande verticale (y, hauteur) qui contient toutes les fenêtres. */
  band: readonly [y: number, h: number]
  windows: [number, number][]
  width: number
  height: number
  fill: string
  waves?: number
}) {
  const [x, , w] = viewBox
  const strip: Box = [x, band[0], w, band[1]]
  return Array.from({ length: waves }, (_, k) => (
    <svg
      key={k}
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox.join(" ")}
      preserveAspectRatio="xMidYMax slice"
      className="layer layer-fill lights-on"
      style={{ animationDelay: `${(0.15 + k * 0.45).toFixed(2)}s` }}
    >
      <Grain box={strip}>
        {windows.map(([wx, wy], i) =>
          i % waves === k ? (
            <rect
              key={`${wx}-${wy}`}
              x={wx}
              y={wy}
              width={width}
              height={height}
              rx={1.5}
              fill={fill}
            />
          ) : null
        )}
      </Grain>
    </svg>
  ))
}

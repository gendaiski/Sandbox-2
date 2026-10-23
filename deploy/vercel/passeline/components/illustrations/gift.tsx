import { BOW_CENTER, BOW_WIDTH, BowShapes } from "@/components/brand/logo"

import { brand } from "./palette"

/** Petite étoile à quatre branches (éclat, scintillement). */
export function Sparkle({
  cx,
  cy,
  r,
  fill = brand.goldLight,
  opacity = 1,
}: {
  cx: number
  cy: number
  r: number
  fill?: string
  opacity?: number
}) {
  const d = `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z`
  return <path d={d} fill={fill} fillOpacity={opacity} />
}

/**
 * Le cadeau Passeline : une boîte teal nouée du nœud or de la marque.
 * (x, y) est le milieu du bord inférieur ; w la largeur de la boîte.
 */
export function Gift({
  x,
  y,
  w,
  open = false,
  sparkles = false,
  body = brand.teal,
  bodyShade = "#13655E",
  lid = "#23897F",
  lidShade = "#1A7971",
}: {
  x: number
  y: number
  w: number
  open?: boolean
  sparkles?: boolean
  body?: string
  bodyShade?: string
  lid?: string
  lidShade?: string
}) {
  const bodyH = w * 0.62
  const lidH = w * 0.2
  const lidW = w * 1.1
  const band = w * 0.16
  const top = y - bodyH
  const lidTop = top - lidH + w * 0.02
  const s = (w * 0.9) / BOW_WIDTH
  const knotY = lidTop - w * 0.03

  const lidGroup = (
    <g>
      <rect
        x={x - lidW / 2}
        y={lidTop}
        width={lidW}
        height={lidH}
        rx={w * 0.05}
        fill={lid}
      />
      <rect
        x={x + lidW / 2 - lidW * 0.14}
        y={lidTop}
        width={lidW * 0.14}
        height={lidH}
        rx={w * 0.04}
        fill={lidShade}
      />
      <rect
        x={x - band / 2}
        y={lidTop}
        width={band}
        height={lidH}
        fill={brand.goldLight}
      />
      <g
        transform={`translate(${x - BOW_CENTER.x * s} ${knotY - BOW_CENTER.y * s}) scale(${s})`}
      >
        <BowShapes />
      </g>
    </g>
  )

  return (
    <g>
      {sparkles ? (
        <g>
          <Sparkle cx={x - w * 0.62} cy={top - w * 0.55} r={w * 0.12} />
          <Sparkle cx={x + w * 0.05} cy={top - w * 1.05} r={w * 0.09} />
          <Sparkle
            cx={x + w * 0.75}
            cy={top - w * 0.2}
            r={w * 0.07}
            fill={brand.cream}
          />
          <Sparkle
            cx={x - w * 0.35}
            cy={top - w * 0.95}
            r={w * 0.05}
            fill={brand.cream}
          />
        </g>
      ) : null}
      <rect
        x={x - w / 2}
        y={top}
        width={w}
        height={bodyH}
        rx={w * 0.04}
        fill={body}
      />
      <rect
        x={x + w / 2 - w * 0.15}
        y={top}
        width={w * 0.15}
        height={bodyH}
        rx={w * 0.03}
        fill={bodyShade}
      />
      {open ? (
        <rect
          x={x - w / 2}
          y={top}
          width={w}
          height={w * 0.1}
          fill={brand.tealDeep}
        />
      ) : null}
      <rect
        x={x - band / 2}
        y={top}
        width={band}
        height={bodyH}
        fill={brand.gold}
      />
      {open ? (
        <g
          transform={`translate(${w * 0.95} ${-w * 0.42}) rotate(22 ${x} ${lidTop})`}
        >
          {lidGroup}
        </g>
      ) : (
        lidGroup
      )}
    </g>
  )
}

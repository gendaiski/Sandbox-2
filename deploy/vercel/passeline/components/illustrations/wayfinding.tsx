import { MarkShapes } from "@/components/brand/logo"

import { House, Lamp, Tree } from "./city"
import { Gift, Sparkle } from "./gift"
import { brand, dayCity } from "./palette"

const font = { fontFamily: "var(--font-bricolage)" }

/**
 * Bande de toits de Wrenhaven, de jour, posée en bas d'un bandeau : façades de
 * tuffeau, ardoise, arbres, et la route en pointillés or qui mène au cadeau.
 */
export function RooftopsStrip({
  className,
  lost = false,
}: {
  className?: string
  lost?: boolean
}) {
  const houses: [number, number, number, number][] = [
    [-10, 96, 96, 3],
    [86, 84, 120, 4],
    [170, 100, 90, 3],
    [270, 80, 110, 4],
    [350, 96, 84, 3],
    [446, 90, 104, 3],
    [536, 100, 122, 4],
    [636, 84, 92, 3],
    [720, 104, 112, 4],
    [824, 88, 96, 3],
    [912, 100, 118, 4],
    [1012, 84, 90, 3],
    [1096, 104, 110, 4],
    [1200, 90, 96, 3],
    [1290, 100, 124, 4],
    [1390, 86, 100, 3],
    [1476, 96, 112, 4],
    [1572, 90, 96, 3],
  ]
  const tints = ["#EFE2C2", "#F5EBD5", "#E6D4AA"]
  return (
    <svg
      viewBox="0 0 1600 200"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g filter="url(#bb-grain)">
        {houses.map(([x, w, h, f], i) => (
          <House
            key={x}
            x={x}
            y={170}
            w={w}
            h={h}
            floors={f}
            P={dayCity}
            seed={i + 3}
            tint={tints[i % 3]}
          />
        ))}
        {[60, 300, 600, 980, 1250, 1520].map((x, i) => (
          <Tree
            key={x}
            x={x}
            y={172}
            r={i % 2 ? 20 : 24}
            P={dayCity}
            kind={i % 3 === 1 ? "tall" : "round"}
          />
        ))}
        <rect x={0} y={168} width={1600} height={32} fill="#EFE7D1" />
        <rect x={0} y={168} width={1600} height={4} fill="#D5C399" />
        <path
          d={lost ? "M0 186 H760 Q790 186 790 170" : "M0 186 H760"}
          stroke={brand.gold}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="0 15"
          fill="none"
        />
        <Gift x={800} y={192} w={38} />
        {lost ? (
          <g>
            <rect
              x={824}
              y={114}
              width={40}
              height={36}
              rx={12}
              fill={brand.teal}
            />
            <path d="M832 148 l-6 12 l16 -10 Z" fill={brand.teal} />
            <text
              x={844}
              y={142}
              textAnchor="middle"
              fontSize={24}
              fontWeight={800}
              fill={brand.cream}
              style={font}
            >
              ?
            </text>
          </g>
        ) : (
          <Sparkle cx={830} cy={150} r={7} fill={brand.gold} />
        )}
      </g>
    </svg>
  )
}

/** Panneau indicateur, au bord du quai. */
export function Signpost({
  labels,
  className,
  label,
}: {
  labels: string[]
  className?: string
  label: string
}) {
  const colors = [
    { bg: brand.teal, fg: brand.cream },
    { bg: brand.goldLight, fg: brand.ink },
    { bg: brand.cream, fg: brand.tealDeep },
    { bg: brand.tealDeep, fg: brand.goldLight },
  ]
  return (
    <svg
      viewBox="0 0 300 320"
      role="img"
      aria-label={label}
      className={className}
    >
      <g filter="url(#bb-grain)">
        <circle cx={150} cy={150} r={140} fill="url(#bb-medallion)" />
        <ellipse
          cx={150}
          cy={300}
          rx={120}
          ry={10}
          fill={brand.ink}
          fillOpacity={0.08}
        />
        <rect
          x={143}
          y={40}
          width={14}
          height={262}
          rx={4}
          fill={brand.tealDeep}
        />
        <circle cx={150} cy={38} r={10} fill={brand.gold} />
        {labels.slice(0, 4).map((text, i) => {
          const right = i % 2 === 0
          const y = 64 + i * 52
          const w = Math.max(96, text.length * 11 + 40)
          const x = right ? 150 : 150 - w
          const tip = right
            ? `M${x} ${y} H${x + w} L${x + w + 18} ${y + 19} L${x + w} ${y + 38} H${x} Z`
            : `M${x + w} ${y} H${x} L${x - 18} ${y + 19} L${x} ${y + 38} H${x + w} Z`
          const c = colors[i % colors.length]
          return (
            <g key={text} transform={`rotate(${right ? -3 : 3} 150 ${y + 19})`}>
              <path d={tip} fill={c.bg} />
              <text
                x={right ? x + w / 2 + 4 : x + w / 2 - 4}
                y={y + 25}
                textAnchor="middle"
                fontSize={17}
                fontWeight={750}
                fill={c.fg}
                style={font}
              >
                {text}
              </text>
            </g>
          )
        })}
        <Gift x={208} y={302} w={44} />
        <Lamp x={62} y={302} h={150} color={brand.tealDeep} />
      </g>
    </svg>
  )
}

/** Le document scellé du symbole : la touche illustrée des pages légales. */
export function SealedLetter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 170"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g filter="url(#bb-grain)">
        <circle cx={100} cy={86} r={78} fill="url(#bb-medallion)" />
        <g transform="rotate(-6 100 90)">
          <rect
            x={52}
            y={34}
            width={96}
            height={118}
            rx={6}
            fill={brand.cream}
          />
          <rect
            x={52}
            y={34}
            width={96}
            height={118}
            rx={6}
            fill="none"
            stroke="#D9C79A"
            strokeWidth={3}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={66}
              y={54 + i * 13}
              width={i % 3 === 2 ? 46 : 68}
              height={5}
              rx={2.5}
              fill={brand.ink}
              fillOpacity={0.22}
            />
          ))}
          <circle cx={122} cy={134} r={17} fill={brand.tealDeep} />
          <g transform="translate(103.1 115.1) scale(0.3)">
            <MarkShapes />
          </g>
        </g>
      </g>
    </svg>
  )
}

/** Un téléphone qui ouvre l'app Passeline, pour les pages de repli. */
export function PhoneHandoff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g filter="url(#bb-grain)">
        <circle cx={110} cy={100} r={92} fill="url(#bb-medallion)" />
        <rect x={74} y={22} width={72} height={150} rx={14} fill={brand.ink} />
        <rect
          x={80}
          y={30}
          width={60}
          height={134}
          rx={9}
          fill={brand.tealDeep}
        />
        <g transform="translate(81 59) scale(0.46)">
          <MarkShapes />
        </g>
        <rect
          x={92}
          y={118}
          width={36}
          height={6}
          rx={3}
          fill={brand.cream}
          fillOpacity={0.85}
        />
        <rect
          x={98}
          y={130}
          width={24}
          height={5}
          rx={2.5}
          fill={brand.cream}
          fillOpacity={0.5}
        />
        <Gift x={168} y={178} w={40} />
        <Sparkle cx={50} cy={60} r={9} fill={brand.gold} />
        <Sparkle cx={176} cy={46} r={6} fill={brand.cream} />
      </g>
    </svg>
  )
}

import type * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Code-barres décoratif, déterministe (même rendu serveur et client).
 * Les largeurs de barres sont tirées des caractères de `value`.
 */
export function Barcode({
  value,
  className,
  scan,
}: {
  value: string
  className?: string
  /**
   * Fait passer une fois la ligne du lecteur sur le code-barres. Changer la
   * clé rejoue le passage ; `delay` en millisecondes.
   */
  scan?: { key: React.Key; delay?: number }
}) {
  const widths: number[] = [2, 1, 1, 1] // garde de départ
  for (const char of value.replace(/\s/g, "")) {
    const c = char.charCodeAt(0) * 7 + 3
    widths.push((c % 3) + 1, ((c >> 2) % 2) + 1, ((c >> 3) % 4) + 1, ((c >> 1) % 2) + 1)
  }
  widths.push(1, 1, 2, 1) // garde de fin

  let x = 0
  const bars: { x: number; w: number }[] = []
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w })
    x += w
  })

  const svg = (
    <svg
      viewBox={`0 0 ${x} 40`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      className={cn("block w-full text-ink", scan ? "h-full" : cn("h-14", className))}
    >
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={0} width={bar.w} height={40} fill="currentColor" />
      ))}
    </svg>
  )
  if (!scan) return svg

  return (
    <span className={cn("@container relative block h-14 w-full overflow-hidden", className)}>
      {svg}
      <span
        key={scan.key}
        aria-hidden="true"
        className="scan-line"
        style={{ "--d": `${scan.delay ?? 0}ms` } as React.CSSProperties}
      />
    </span>
  )
}

/** Faux QR code d'illustration (le code de retrait du mode Dépôt). */
export function SampleQr({ className }: { className?: string }) {
  const size = 21
  const cells: { x: number; y: number }[] = []
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (finder(x, y)) continue
      const n = (x * 73 + y * 151 + x * y * 17) % 11
      if (n < 5) cells.push({ x, y })
    }
  }
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--paper)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  )
  return (
    <svg
      viewBox={`-1 -1 ${size + 2} ${size + 2}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      className={cn("block text-ink", className)}
    >
      <rect x={-1} y={-1} width={size + 2} height={size + 2} fill="var(--paper)" />
      {eye(0, 0)}
      {eye(size - 7, 0)}
      {eye(0, size - 7)}
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  )
}

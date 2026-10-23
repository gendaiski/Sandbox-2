"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { Gift } from "@/components/illustrations/gift"

type Point = { x: number; y: number }

/** Pas des pointillés or le long de la route. */
const DOT_STEP = 17
const SVG_NS = "http://www.w3.org/2000/svg"

/**
 * La route en pointillés or qui relie les étapes du voyage, et le cadeau qui
 * la suit au fil du défilement. La route se cale sur les bornes
 * ([data-waypoint]) ; sans JavaScript, un pointillé simple les relie.
 *
 * Les pointillés se posent derrière le cadeau à mesure qu'il avance (sauf si
 * l'on réduit les animations) : chacun est un petit disque qu'on montre ou
 * qu'on cache, pour ne jamais redessiner toute la route.
 */
export function JourneyTrack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const dots = useRef<SVGGElement>(null)
  const traveller = useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = useState<{
    d: string
    w: number
    h: number
  } | null>(null)

  // Tracé de la route d'après la position réelle des bornes.
  useEffect(() => {
    const el = root.current
    if (!el) return

    const measure = () => {
      const box = el.getBoundingClientRect()
      const center = (node: Element): Point => {
        const r = node.getBoundingClientRect()
        return {
          x: r.left + r.width / 2 - box.left,
          y: r.top + r.height / 2 - box.top,
        }
      }
      const visible = (selector: string) =>
        Array.from(el.querySelectorAll(selector)).find(
          (node) => node.getClientRects().length > 0
        )
      const start = visible("[data-route-start]")
      const end = visible("[data-route-end]")
      const marks = Array.from(
        el.querySelectorAll("[data-waypoint], [data-bend]")
      ).filter((node) => node.getClientRects().length > 0)
      if (!start || !end || marks.length === 0) return
      const points = [center(start), ...marks.map(center), center(end)]
      const wide = box.width >= 768
      const amp = wide ? 92 : 12

      let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]
        const b = points[i]
        const dy = b.y - a.y
        const side = i % 2 === 0 ? 1 : -1
        const bend =
          Math.min(amp, Math.abs(dy) * 0.3) *
          (i === points.length - 1 ? 0.4 : 1)
        d += ` C${(a.x + side * bend).toFixed(1)} ${(a.y + dy * 0.42).toFixed(1)} ${(
          b.x +
          side * bend
        ).toFixed(
          1
        )} ${(b.y - dy * 0.42).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
      }
      setGeometry({ d, w: box.width, h: box.height })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Le cadeau avance sur la route : elle suit la ligne de lecture de l'écran.
  useEffect(() => {
    const el = root.current
    const p = path.current
    const t = traveller.current
    const g = dots.current
    if (!el || !p || !t || !g || !geometry) return

    const total = p.getTotalLength()
    // Les pointillés : un disque tous les DOT_STEP pixels, comme le tiret
    // nul à bout rond de la route (« 0 17 »).
    const draws = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const discs: SVGCircleElement[] = []
    for (let at = 0; at <= total; at += DOT_STEP) {
      const pt = p.getPointAtLength(at)
      const c = document.createElementNS(SVG_NS, "circle")
      c.setAttribute("cx", pt.x.toFixed(2))
      c.setAttribute("cy", pt.y.toFixed(2))
      c.setAttribute("r", "3")
      if (draws) c.setAttribute("visibility", "hidden")
      discs.push(c)
    }
    g.replaceChildren(...discs)
    let shown = draws ? 0 : discs.length
    const marks = Array.from(
      el.querySelectorAll<HTMLElement>("[data-waypoint]")
    )
    const markY = marks.map((m) => {
      const r = m.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      return r.top + r.height / 2 - box.top
    })
    const startY = p.getPointAtLength(0).y
    const endY = p.getPointAtLength(total).y
    let frame = 0

    const update = () => {
      frame = 0
      const box = el.getBoundingClientRect()
      const target = Math.min(
        endY,
        Math.max(startY, window.innerHeight * 0.58 - box.top)
      )
      // Recherche de la longueur où la route atteint la hauteur visée.
      let lo = 0
      let hi = total
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2
        if (p.getPointAtLength(mid).y < target) lo = mid
        else hi = mid
      }
      const at = p.getPointAtLength(lo)
      const ahead = p.getPointAtLength(Math.min(total, lo + 2))
      const angle = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI
      const sway = Math.max(-16, Math.min(16, (angle - 90) * 0.3))
      t.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0) rotate(${sway.toFixed(1)}deg)`
      t.toggleAttribute("data-moving", target > startY + 40)
      if (draws) {
        const reach = Math.min(discs.length, Math.floor(lo / DOT_STEP) + 1)
        for (let i = shown; i < reach; i++)
          discs[i].removeAttribute("visibility")
        for (let i = reach; i < shown; i++)
          discs[i].setAttribute("visibility", "hidden")
        shown = reach
      }
      marks.forEach((m, i) => {
        m.toggleAttribute("data-reached", at.y >= markY[i] - 4)
      })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    el.setAttribute("data-ready", "")
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
      g.replaceChildren()
    }
  }, [geometry])

  return (
    <div ref={root} className={`journey relative ${className ?? ""}`}>
      <svg
        aria-hidden="true"
        focusable="false"
        className="journey-route pointer-events-none absolute top-0 left-0 overflow-visible"
        width={geometry?.w ?? 0}
        height={geometry?.h ?? 0}
      >
        {geometry ? (
          <g fill="none" strokeLinecap="round">
            <path
              d={geometry.d}
              stroke="#FFFFFF"
              strokeOpacity={0.45}
              strokeWidth={26}
            />
            <path ref={path} d={geometry.d} />
            <g ref={dots} fill="#C59940" />
          </g>
        ) : null}
      </svg>
      <div ref={traveller} className="traveller" aria-hidden="true">
        <svg viewBox="-40 -78 80 82" width="64" height="64">
          <Gift x={0} y={0} w={58} />
        </svg>
      </div>
      {children}
    </div>
  )
}

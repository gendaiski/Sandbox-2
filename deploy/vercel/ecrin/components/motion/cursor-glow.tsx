"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * A soft gold light that trails the cursor inside its parent, like a lamp
 * moved over a display case. Place it as the last child of a positioned
 * container: it covers it, never catches clicks, and only listens to a real
 * mouse. Moves with transform only; off with reduced motion.
 */
export function CursorGlow({
  size = 520,
  className,
}: {
  /** Diameter of the light, in pixels. */
  size?: number
  className?: string
}) {
  const glowRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    const host = glow?.parentElement
    if (!glow || !host) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")

    let raf = 0
    let x = 0
    let y = 0
    let vx = 0
    let vy = 0
    let tx = 0
    let ty = 0
    let last = 0
    let placed = false

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now
      // Ressort amorti : la lumière suit avec un léger retard, sans à-coup.
      const k = 90
      const c = 14
      vx += ((tx - x) * k - vx * c) * dt
      vy += ((ty - y) * k - vy * c) * dt
      x += vx * dt
      y += vy * dt
      glow.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.3) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
        last = 0
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduce.matches || !fine.matches) return
      const box = host.getBoundingClientRect()
      tx = event.clientX - box.left
      ty = event.clientY - box.top
      if (!placed) {
        x = tx
        y = ty
        placed = true
      }
      glow.dataset.on = ""
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      delete glow.dataset.on
      placed = false
    }

    host.addEventListener("pointermove", onMove)
    host.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
    }
  }, [size])

  return (
    <span
      ref={glowRef}
      aria-hidden="true"
      className={cn("cursor-glow", className)}
      style={{ width: size, height: size }}
    />
  )
}

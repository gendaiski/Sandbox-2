"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

/** Springy, a little loose: the button follows, then snaps back. */
const spring = { stiffness: 260, damping: 14, mass: 0.6 }

/**
 * Magnetic wrapper: the child drifts toward the pointer while it hovers
 * nearby, then springs back to its place. Only reacts to a real mouse;
 * with reduced motion the child stays put.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
  max = 10,
}: {
  children: React.ReactNode
  className?: string
  /** Share of the pointer offset the child follows. */
  strength?: number
  /** Maximum travel, in pixels. */
  max?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  const clamp = (v: number) => Math.max(-max, Math.min(max, v))

  return (
    <motion.span
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return
        const box = ref.current?.getBoundingClientRect()
        if (!box) return
        // Centre de repos : on retire le décalage déjà appliqué.
        const cx = box.left + box.width / 2 - x.get()
        const cy = box.top + box.height / 2 - y.get()
        x.set(clamp((event.clientX - cx) * strength))
        y.set(clamp((event.clientY - cy) * strength))
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

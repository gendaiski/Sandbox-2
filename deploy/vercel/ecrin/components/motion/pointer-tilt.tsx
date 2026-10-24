"use client"

import { useEffect, useRef } from "react"

/**
 * Tracks the pointer over its children and exposes it as two springy CSS
 * variables, --px and --py (from -1 to 1), on its own element. Styles decide
 * what leans: the vitrine cards tilt in 3D toward the cursor. Mouse only;
 * nothing moves with reduced motion.
 */
export function PointerTilt({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")

    let raf = 0
    let last = 0
    const pos = { x: 0, y: 0 }
    const vel = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now
      // Ressort un peu souple : la carte dépasse à peine, puis se pose.
      const k = 120
      const c = 11
      for (const axis of ["x", "y"] as const) {
        vel[axis] += ((target[axis] - pos[axis]) * k - vel[axis] * c) * dt
        pos[axis] += vel[axis] * dt
      }
      node.style.setProperty("--px", pos.x.toFixed(4))
      node.style.setProperty("--py", pos.y.toFixed(4))
      const moving =
        Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) +
          Math.abs(vel.x) + Math.abs(vel.y) > 0.002
      if (moving) raf = requestAnimationFrame(tick)
      else {
        raf = 0
        last = 0
      }
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduce.matches) return
      const box = node.getBoundingClientRect()
      target.x = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1))
      target.y = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1))
      kick()
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
      kick()
    }

    node.addEventListener("pointermove", onMove)
    node.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(raf)
      node.removeEventListener("pointermove", onMove)
      node.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}

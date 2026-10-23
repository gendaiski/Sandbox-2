"use client"

import { useEffect, useRef } from "react"
import { animate } from "motion/react"

// Deux décimales en permanence : la largeur du chiffre ne saute pas.
const formats = {
  usd: (v: number) => "$" + (Math.round(v * 100) / 100).toFixed(2),
  percent: (v: number) => Math.round(v) + "%",
}

/**
 * A figure that springs up from zero the first time it scrolls into view.
 * The server renders the final value; the count only replaces it when the
 * figure starts below the fold, so nothing flickers. Screen readers always
 * get the final value.
 */
export function CountUp({
  value,
  format,
}: {
  value: number
  format: keyof typeof formats
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // Déjà à l'écran au chargement : on laisse la valeur finale.
    if (node.getBoundingClientRect().top < window.innerHeight) return

    const show = formats[format]
    node.textContent = show(0)
    let stop: (() => void) | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const controls = animate(0, value, {
          type: "spring",
          stiffness: 70,
          damping: 13,
          mass: 0.9,
          onUpdate: (v) => {
            node.textContent = show(Math.max(0, v))
          },
          onComplete: () => {
            node.textContent = show(value)
          },
        })
        stop = () => controls.stop()
      },
      { threshold: 0.6 }
    )
    io.observe(node)
    return () => {
      io.disconnect()
      stop?.()
      node.textContent = formats[format](value)
    }
  }, [value, format])

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {formats[format](value)}
      </span>
      <span className="sr-only">{formats[format](value)}</span>
    </>
  )
}

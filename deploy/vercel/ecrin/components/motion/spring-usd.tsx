"use client"

import { useEffect } from "react"
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { formatUsd } from "@/lib/pricing"

/**
 * A dollar amount that springs to its new value instead of jumping: the
 * price demo's total rolls when the mode or the distance changes. The
 * moving digits are hidden from screen readers, which get the final amount.
 */
export function SpringUsd({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const spring = useSpring(value, { stiffness: 180, damping: 20, mass: 0.7 })
  const text = useTransform(spring, (v) => formatUsd(Math.round(v * 100) / 100))

  useEffect(() => {
    if (reduce) spring.jump(value)
    else spring.set(value)
  }, [value, reduce, spring])

  return (
    <>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{formatUsd(value)}</span>
    </>
  )
}
